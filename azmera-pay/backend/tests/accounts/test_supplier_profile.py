
import pytest
from rest_framework import status

from apps.accounts.models import (
    Role,
    SupplierApprovalStatus,
    SupplierProfile,
)
from tests.factories.accounts import create_web_user

pytestmark = pytest.mark.django_db

PROFILE_URL = "/api/v1/supplier/profile"


@pytest.fixture
def approved_supplier(api_client):
    user = create_web_user(
        phone="+251911300001",
        role=Role.SUPPLIER,
        full_name="Supplier Profile Test",
    )
    user.supplier_approval_status = SupplierApprovalStatus.APPROVED
    user.save(update_fields=["supplier_approval_status"])

    SupplierProfile.objects.create(
        user=user,
        fayda_fin_number="012345678901",
        tin_number="0123456789",
        company_name="Green Valley Supplies",
    )

    api_client.force_authenticate(user=user)
    return user


def test_supplier_can_retrieve_shop_profile(
    api_client, approved_supplier
):
    response = api_client.get(PROFILE_URL)

    assert response.status_code == status.HTTP_200_OK
    assert response.data["company_name"] == "Green Valley Supplies"
    assert response.data["region"] == ""
    assert response.data["woreda"] == ""
    assert response.data["product_categories"] == []


def test_supplier_can_update_shop_profile(
    api_client, approved_supplier
):
    payload = {
        "region": "Oromia",
        "woreda": "Adama",
        "product_categories": ["seed", "fertilizer", "pesticide"],
    }

    response = api_client.patch(
        PROFILE_URL,
        payload,
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["region"] == "Oromia"
    assert response.data["woreda"] == "Adama"
    assert response.data["product_categories"] == [
        "seed",
        "fertilizer",
        "pesticide",
    ]

    approved_supplier.supplier_profile.refresh_from_db()
    profile = approved_supplier.supplier_profile

    assert profile.region == "Oromia"
    assert profile.woreda == "Adama"
    assert profile.product_categories == ["seed", "fertilizer", "pesticide"]


def test_supplier_profile_rejects_invalid_category(
    api_client, approved_supplier
):
    response = api_client.patch(
        PROFILE_URL,
        {"product_categories": ["seed", "invalid-category"]},
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "product_categories" in response.data


def test_supplier_cannot_change_registered_company_name(
    api_client, approved_supplier
):
    response = api_client.patch(
        PROFILE_URL,
        {"company_name": "Different Company"},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["company_name"] == "Green Valley Supplies"


def test_non_supplier_cannot_access_shop_profile(agent_client):
    response = agent_client.get(PROFILE_URL)

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_unapproved_supplier_cannot_access_shop_profile(api_client):
    user = create_web_user(
        phone="+251911300002",
        role=Role.SUPPLIER,
        full_name="Pending Supplier",
    )
    user.supplier_approval_status = SupplierApprovalStatus.PENDING
    user.save(update_fields=["supplier_approval_status"])

    SupplierProfile.objects.create(
        user=user,
        fayda_fin_number="112345678901",
        tin_number="1123456789",
        company_name="Pending Shop",
    )

    api_client.force_authenticate(user=user)

    response = api_client.get(PROFILE_URL)

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_unauthenticated_user_cannot_access_shop_profile(api_client):
    response = api_client.get(PROFILE_URL)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
