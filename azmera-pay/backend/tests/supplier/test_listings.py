import pytest
from rest_framework import status

from apps.accounts.models import Role
from apps.catalog.models import AvailabilityStatus, SupplierListing
from tests.factories.accounts import create_web_user
from tests.factories.catalog import ProductFactory, UnitFactory

pytestmark = pytest.mark.django_db

LIST_URL = "/api/v1/catalog/supplier/listings"


@pytest.fixture
def supplier():
    return create_web_user(
        phone="+251911200001",
        role=Role.SUPPLIER,
        full_name="Supplier One",
    )


@pytest.fixture
def supplier_client(supplier, api_client):
    api_client.force_authenticate(user=supplier)
    return api_client


@pytest.fixture
def product():
    return ProductFactory()


@pytest.fixture
def unit():
    return UnitFactory()


def listing_payload(product, unit, **overrides):
    payload = {
        "product": str(product.id),
        "available_quantity": "100.00",
        "unit": str(unit.id),
        "unit_price": "50.00",
        "region": "Oromia",
        "woreda": "Adama",
        "availability_status": AvailabilityStatus.ACTIVE,
        "notes": "",
    }
    payload.update(overrides)
    return payload


@pytest.mark.parametrize(
    "availability",
    [
        AvailabilityStatus.ACTIVE,
        AvailabilityStatus.PAUSED,
        AvailabilityStatus.EXPIRED,
    ],
)
def test_supplier_can_create_listing_with_each_valid_availability(
    supplier_client, product, unit, availability
):
    response = supplier_client.post(
        LIST_URL,
        listing_payload(product, unit, availability_status=availability),
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["availability_status"] == availability


def test_supplier_cannot_create_listing_with_invalid_availability(
    supplier_client, product, unit
):
    response = supplier_client.post(
        LIST_URL,
        listing_payload(product, unit, availability_status="unavailable"),
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_supplier_can_update_listing_availability(
    supplier_client, product, unit
):
    create_response = supplier_client.post(
        LIST_URL,
        listing_payload(product, unit),
        format="json",
    )
    assert create_response.status_code == status.HTTP_201_CREATED

    listing_url = f"{LIST_URL}/{create_response.data['id']}"
    response = supplier_client.patch(
        listing_url,
        {"availability_status": AvailabilityStatus.PAUSED},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["availability_status"] == AvailabilityStatus.PAUSED


def test_supplier_can_only_see_own_listings(
    supplier_client, product, unit
):
    own_response = supplier_client.post(
        LIST_URL,
        listing_payload(product, unit),
        format="json",
    )
    assert own_response.status_code == status.HTTP_201_CREATED

    other_supplier = create_web_user(
        phone="+251911200002",
        role=Role.SUPPLIER,
        full_name="Supplier Two",
    )

    from apps.catalog.models import SupplierListing

    other_listing = SupplierListing.objects.create(
        supplier=other_supplier,
        product=product,
        available_quantity="20.00",
        unit=unit,
        unit_price="40.00",
        region="Oromia",
        woreda="Adama",
        availability_status=AvailabilityStatus.ACTIVE,
    )

    response = supplier_client.get(LIST_URL)

    assert response.status_code == status.HTTP_200_OK
    listing_items = response.data
    if isinstance(response.data, dict):
        listing_items = response.data["results"]

    returned_ids = [item["id"] for item in listing_items]
    assert own_response.data["id"] in returned_ids
    assert str(other_listing.id) not in returned_ids


def test_supplier_cannot_access_another_suppliers_listing(
    supplier_client, supplier, product, unit
):
    from apps.catalog.models import SupplierListing

    other_supplier = create_web_user(
        phone="+251911200003",
        role=Role.SUPPLIER,
        full_name="Supplier Three",
    )
    other_listing = SupplierListing.objects.create(
        supplier=other_supplier,
        product=product,
        available_quantity="20.00",
        unit=unit,
        unit_price="40.00",
        region="Oromia",
        woreda="Adama",
        availability_status=AvailabilityStatus.ACTIVE,
    )

    detail_url = f"{LIST_URL}/{other_listing.id}"

    assert supplier_client.get(detail_url).status_code == status.HTTP_404_NOT_FOUND
    assert supplier_client.patch(
        detail_url,
        {"availability_status": AvailabilityStatus.PAUSED},
        format="json",
    ).status_code == status.HTTP_404_NOT_FOUND
    assert supplier_client.delete(detail_url).status_code == status.HTTP_404_NOT_FOUND


def test_non_supplier_cannot_manage_supplier_listings(
    agent_client, product, unit
):
    response = agent_client.get(LIST_URL)

    assert response.status_code == status.HTTP_403_FORBIDDEN