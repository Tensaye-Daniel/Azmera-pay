import pytest
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from django.test import Client

from apps.accounts.models import Role, SupplierApprovalStatus, SupplierProfile

pytestmark = pytest.mark.django_db

User = get_user_model()


def make_staff_reviewer(phone, permissions):
    reviewer = User.objects.create_user(
        phone=phone,
        full_name="Supplier Reviewer",
        role=Role.ADMIN,
        password="reviewer-pass-123",
        is_staff=True,
    )
    for model, codename in permissions:
        content_type = ContentType.objects.get_for_model(model)
        permission = Permission.objects.get(
            content_type=content_type,
            codename=codename,
        )
        reviewer.user_permissions.add(permission)
    return reviewer


def create_pending_supplier():
    user = User.objects.create_user(
        phone="+251911399201",
        full_name="Supplier Applicant",
        role=Role.SUPPLIER,
        supplier_approval_status=SupplierApprovalStatus.PENDING,
        password="Supplier-pass-123",
    )
    profile = SupplierProfile.objects.create(
        user=user,
        company_name="Green Valley Supplies",
        tin_number="0123456789",
    )
    return user, profile


def test_admin_can_review_supplier_details_and_approve_or_reject():
    user, profile = create_pending_supplier()
    reviewer = make_staff_reviewer(
        "+251911399202",
        [
            (SupplierProfile, "view_supplierprofile"),
            (User, "view_user"),
            (User, "change_user"),
        ],
    )
    client = Client()
    client.force_login(reviewer)

    pending_list = client.get(
        "/admin/accounts/supplierprofile/?user__supplier_approval_status__exact=pending"
    )
    assert pending_list.status_code == 200
    assert "Green Valley Supplies" in pending_list.content.decode()
    assert "Supplier Applicant" in pending_list.content.decode()
    assert "+251911399201" in pending_list.content.decode()
    assert "0123456789" in pending_list.content.decode()

    profile_page = client.get(
        f"/admin/accounts/supplierprofile/{profile.pk}/change/"
    )
    assert profile_page.status_code == 200
    assert "Supplier Applicant" in profile_page.content.decode()
    assert "0123456789" in profile_page.content.decode()

    user_change_url = f"/admin/accounts/user/{user.pk}/change/"
    user_page = client.get(user_change_url)
    assert user_page.status_code == 200
    user_page_content = user_page.content.decode()
    assert "supplier_approval_status" in user_page_content
    assert 'name="role"' not in user_page_content
    assert 'name="is_superuser"' not in user_page_content
    assert 'name="user_permissions"' not in user_page_content

    for status in (
        SupplierApprovalStatus.APPROVED,
        SupplierApprovalStatus.REJECTED,
    ):
        response = client.post(
            user_change_url,
            {
                "phone": user.phone,
                "full_name": user.full_name,
                "email": "",
                "role": Role.ADMIN,
                "supplier_approval_status": status,
                "is_active": "on",
                "is_staff": "on",
                "is_superuser": "on",
                "groups": [],
                "user_permissions": [],
                "_save": "Save",
            },
        )
        assert response.status_code == 302
        user.refresh_from_db()
        assert user.supplier_approval_status == status
        assert user.role == Role.SUPPLIER
        assert user.is_staff is False
        assert user.is_superuser is False
        assert user.user_permissions.count() == 0


def test_view_only_reviewer_cannot_approve_supplier():
    user, profile = create_pending_supplier()
    reviewer = make_staff_reviewer(
        "+251911399203",
        [(SupplierProfile, "view_supplierprofile")],
    )
    client = Client()
    client.force_login(reviewer)

    assert client.get("/admin/accounts/supplierprofile/").status_code == 200
    response = client.post(
        f"/admin/accounts/user/{user.pk}/change/",
        {"supplier_approval_status": SupplierApprovalStatus.APPROVED},
    )
    assert response.status_code == 403

    user.refresh_from_db()
    assert user.supplier_approval_status == SupplierApprovalStatus.PENDING
    assert profile.user_id == user.id


def test_supplier_reviewer_cannot_approve_their_own_account():
    reviewer = make_staff_reviewer(
        "+251911399204",
        [(User, "view_user"), (User, "change_user")],
    )
    reviewer.role = Role.SUPPLIER
    reviewer.supplier_approval_status = SupplierApprovalStatus.PENDING
    reviewer.save(update_fields=["role", "supplier_approval_status"])
    client = Client()
    client.force_login(reviewer)
    change_url = f"/admin/accounts/user/{reviewer.pk}/change/"

    page = client.get(change_url)
    assert page.status_code == 200
    assert 'name="supplier_approval_status"' not in page.content.decode()

    response = client.post(
        change_url,
        {
            "phone": reviewer.phone,
            "full_name": reviewer.full_name,
            "email": "",
            "supplier_approval_status": SupplierApprovalStatus.APPROVED,
            "is_active": "on",
        },
    )

    assert response.status_code == 302
    reviewer.refresh_from_db()
    assert reviewer.supplier_approval_status == SupplierApprovalStatus.PENDING
