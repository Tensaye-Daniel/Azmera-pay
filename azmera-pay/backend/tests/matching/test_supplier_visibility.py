import pytest
from rest_framework import status

from apps.accounts.models import (
    Role,
    SupplierApprovalStatus,
    SupplierProfile,
)
from apps.matching.services import run_request_matching
from tests.factories.accounts import UserFactory
from tests.factories.catalog import ProductFactory, SupplierListingFactory, UnitFactory
from tests.factories.requests import RequestFactory, RequestLineFactory

pytestmark = pytest.mark.django_db

MATCHES_URL = "/api/v1/matching/supplier/matches/"


def make_supplier(phone, *, approved=True):
    supplier = UserFactory(
        phone=phone,
        role=Role.SUPPLIER,
        supplier_approval_status=(
            SupplierApprovalStatus.APPROVED
            if approved
            else SupplierApprovalStatus.PENDING
        ),
    )
    SupplierProfile.objects.create(
        user=supplier,
        tin_number=f"TIN-{phone}",
        company_name=f"{phone} Supply",
        region="Oromia",
        woreda="Adama",
        product_categories=["seed"],
    )
    return supplier


def test_supplier_sees_only_matches_for_their_own_listings(api_client):
    owner = make_supplier("+251911400001")
    other_supplier = make_supplier("+251911400002")
    product = ProductFactory(name="Tef Seed", category="seed")
    unit = UnitFactory(name="Kilogram", code="kg")
    request = RequestFactory(region="Oromia", woreda="Adama")
    line = RequestLineFactory(request=request, product=product, unit=unit)
    own_listing = SupplierListingFactory(
        supplier=owner, product=product, unit=unit
    )
    SupplierListingFactory(supplier=other_supplier, product=product, unit=unit)
    run_request_matching(request)

    api_client.force_authenticate(user=owner)
    response = api_client.get(MATCHES_URL)

    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    match = response.data[0]
    assert match["listing_id"] == str(own_listing.id)
    assert match["request_id"] == str(request.id)
    assert match["request_status"] == "matched"
    assert match["requested_product"] == product.name
    assert match["requested_category"] == product.category
    assert match["requested_quantity"] == str(line.quantity)
    assert match["requested_unit"] == unit.code
    assert match["request_region"] == "Oromia"
    assert match["request_woreda"] == "Adama"
    assert match["status"] == "pending"
    assert "phone" not in match
    assert "+251911400002" not in str(response.data)


@pytest.mark.parametrize("identity", ["anonymous", "farmer", "pending_supplier"])
def test_supplier_matches_require_authenticated_approved_supplier(
    api_client, identity
):
    if identity == "farmer":
        user = UserFactory(role=Role.FARMER)
    elif identity == "pending_supplier":
        user = make_supplier("+251911400003", approved=False)
    else:
        user = None

    api_client.force_authenticate(user=user)
    response = api_client.get(MATCHES_URL)

    assert response.status_code in {
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    }
