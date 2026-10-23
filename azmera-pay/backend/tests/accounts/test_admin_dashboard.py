# Admin dashboard API: user, supplier, and farmer moderation.
import pytest

from apps.accounts.models import Role, SupplierApprovalStatus, SupplierProfile, User
from apps.profiles.models import FarmerStatus
from tests.factories.profiles import FarmerProfileFactory

pytestmark = pytest.mark.django_db


def create_supplier(
    phone="+251911300001",
    company_name="Green Valley Supplies",
    tin_number="0123456789",
    approval=SupplierApprovalStatus.PENDING,
    is_active=True,
):
    user = User.objects.create_user(
        phone=phone,
        full_name="Supplier Applicant",
        role=Role.SUPPLIER,
        supplier_approval_status=approval,
        password="Supplier-pass-123",
        is_active=is_active,
    )
    profile = SupplierProfile.objects.create(
        user=user,
        company_name=company_name,
        tin_number=tin_number,
        region="Oromia",
        woreda="Adama",
        product_categories=["seeds"],
    )
    return user, profile


def test_admin_lists_and_filters_farmers(admin_client):
    verified = FarmerProfileFactory(status=FarmerStatus.REGISTERED, region="Oromia")
    pending = FarmerProfileFactory(status=FarmerStatus.PENDING, region="Amhara")

    resp = admin_client.get("/api/v1/dashboard/admin/farmers")
    assert resp.status_code == 200
    assert {item["id"] for item in resp.data["results"]} == {
        str(verified.pk),
        str(pending.pk),
    }

    resp = admin_client.get("/api/v1/dashboard/admin/farmers?status=pending")
    assert resp.status_code == 200
    assert [item["id"] for item in resp.data["results"]] == [str(pending.pk)]

    resp = admin_client.get(
        f"/api/v1/dashboard/admin/farmers?search={verified.azmera_account_number}"
    )
    assert resp.status_code == 200
    assert [item["id"] for item in resp.data["results"]] == [str(verified.pk)]

    resp = admin_client.get("/api/v1/dashboard/admin/farmers?region=Amhara")
    assert resp.status_code == 200
    assert [item["id"] for item in resp.data["results"]] == [str(pending.pk)]


def test_admin_verifies_and_manages_farmer_status(admin_client):
    farmer = FarmerProfileFactory(status=FarmerStatus.PENDING)
    farmer.user.is_active = False
    farmer.user.save(update_fields=["is_active"])

    resp = admin_client.patch(
        f"/api/v1/dashboard/admin/farmers/{farmer.pk}/verify"
    )
    assert resp.status_code == 200
    farmer.refresh_from_db()
    farmer.user.refresh_from_db()
    assert farmer.status == FarmerStatus.REGISTERED
    assert farmer.user.is_active is True

    resp = admin_client.patch(
        f"/api/v1/dashboard/admin/farmers/{farmer.pk}/unverify"
    )
    assert resp.status_code == 200
    farmer.refresh_from_db()
    assert farmer.status == FarmerStatus.UNVERIFIED

    resp = admin_client.patch(
        f"/api/v1/dashboard/admin/farmers/{farmer.pk}/pending"
    )
    assert resp.status_code == 200
    farmer.refresh_from_db()
    assert farmer.status == FarmerStatus.PENDING

    resp = admin_client.patch(
        f"/api/v1/dashboard/admin/farmers/{farmer.pk}/deactivate"
    )
    assert resp.status_code == 200
    farmer.user.refresh_from_db()
    assert farmer.user.is_active is False

    resp = admin_client.patch(
        f"/api/v1/dashboard/admin/farmers/{farmer.pk}/activate"
    )
    assert resp.status_code == 200
    farmer.user.refresh_from_db()
    assert farmer.user.is_active is True


def test_admin_lists_and_filters_suppliers(admin_client):
    _, pending = create_supplier()
    _, approved = create_supplier(
        phone="+251911300002",
        company_name="Highland Agro",
        tin_number="9876543210",
        approval=SupplierApprovalStatus.APPROVED,
    )

    resp = admin_client.get("/api/v1/dashboard/admin/suppliers")
    assert resp.status_code == 200
    assert {item["id"] for item in resp.data["results"]} == {
        pending.pk,
        approved.pk,
    }

    resp = admin_client.get("/api/v1/dashboard/admin/suppliers?approval=pending")
    assert resp.status_code == 200
    assert [item["id"] for item in resp.data["results"]] == [pending.pk]

    resp = admin_client.get("/api/v1/dashboard/admin/suppliers?search=Highland")
    assert resp.status_code == 200
    assert [item["id"] for item in resp.data["results"]] == [approved.pk]


def test_admin_approves_rejects_and_toggles_supplier(admin_client):
    user, supplier = create_supplier(is_active=False)

    resp = admin_client.patch(
        f"/api/v1/dashboard/admin/suppliers/{supplier.pk}/approve"
    )
    assert resp.status_code == 200
    user.refresh_from_db()
    assert user.supplier_approval_status == SupplierApprovalStatus.APPROVED
    assert user.is_active is True

    resp = admin_client.patch(
        f"/api/v1/dashboard/admin/suppliers/{supplier.pk}/reject"
    )
    assert resp.status_code == 200
    user.refresh_from_db()
    assert user.supplier_approval_status == SupplierApprovalStatus.REJECTED

    resp = admin_client.patch(
        f"/api/v1/dashboard/admin/suppliers/{supplier.pk}/deactivate"
    )
    assert resp.status_code == 200
    user.refresh_from_db()
    assert user.is_active is False

    resp = admin_client.patch(
        f"/api/v1/dashboard/admin/suppliers/{supplier.pk}/activate"
    )
    assert resp.status_code == 200
    user.refresh_from_db()
    assert user.is_active is True


def test_admin_lists_filters_and_updates_users(admin_client):
    farmer = FarmerProfileFactory().user
    agent_user = User.objects.create_user(
        phone="+251911300003",
        full_name="Field Agent",
        role=Role.AGENT,
        password="agent-pass-123",
    )

    resp = admin_client.get("/api/v1/dashboard/admin/users?role=agent")
    assert resp.status_code == 200
    results = resp.data["results"]
    assert agent_user.pk in [item["id"] for item in results]
    assert {item["role"] for item in results} == {Role.AGENT}

    resp = admin_client.get(
        "/api/v1/dashboard/admin/users", {"search": farmer.phone}
    )
    assert resp.status_code == 200
    assert [item["id"] for item in resp.data["results"]] == [farmer.pk]

    resp = admin_client.patch(
        f"/api/v1/dashboard/admin/users/{agent_user.pk}/status",
        {"is_active": False},
        format="json",
    )
    assert resp.status_code == 200
    assert resp.data["is_active"] is False
    agent_user.refresh_from_db()
    assert agent_user.is_active is False

    resp = admin_client.patch(
        f"/api/v1/dashboard/admin/users/{agent_user.pk}/status",
        {"supplier_approval_status": SupplierApprovalStatus.APPROVED},
        format="json",
    )
    assert resp.status_code == 200
    agent_user.refresh_from_db()
    assert (
        agent_user.supplier_approval_status == SupplierApprovalStatus.APPROVED
    )


def test_admin_status_update_requires_a_field(admin_client):
    agent_user = User.objects.create_user(
        phone="+251911300004",
        full_name="Field Agent",
        role=Role.AGENT,
        password="agent-pass-123",
    )

    resp = admin_client.patch(
        f"/api/v1/dashboard/admin/users/{agent_user.pk}/status",
        {},
        format="json",
    )
    assert resp.status_code == 400


def test_non_admin_cannot_access_admin_endpoints(agent_client):
    farmer = FarmerProfileFactory()
    _, supplier = create_supplier()

    assert agent_client.get("/api/v1/dashboard/admin/farmers").status_code == 403
    assert agent_client.get("/api/v1/dashboard/admin/suppliers").status_code == 403
    assert agent_client.get("/api/v1/dashboard/admin/users").status_code == 403
    assert (
        agent_client.patch(
            f"/api/v1/dashboard/admin/farmers/{farmer.pk}/verify"
        ).status_code
        == 403
    )
    assert (
        agent_client.patch(
            f"/api/v1/dashboard/admin/suppliers/{supplier.pk}/approve"
        ).status_code
        == 403
    )
