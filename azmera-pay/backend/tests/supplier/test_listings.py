import pytest
from rest_framework import status

from apps.accounts.models import Role, SupplierApprovalStatus, SupplierProfile
from apps.catalog.models import AvailabilityStatus, SupplierListing
from tests.factories.accounts import create_web_user
from tests.factories.catalog import ProductFactory, UnitFactory

pytestmark = pytest.mark.django_db

LIST_URL = "/api/v1/catalog/supplier/listings"
UNITS_URL = "/api/v1/catalog/units"


@pytest.fixture
def supplier():
    user = create_web_user(
        phone="+251911200001",
        role=Role.SUPPLIER,
        full_name="Supplier One",
    )
    user.supplier_approval_status = SupplierApprovalStatus.APPROVED
    user.save(update_fields=["supplier_approval_status"])
    SupplierProfile.objects.create(
        user=user,
        tin_number="1234567890",
        company_name="Supplier One Shop",
        region="Oromia",
        woreda="Adama",
        product_categories=["seed"],
    )
    return user



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
        AvailabilityStatus.INACTIVE,
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
    assert response.data["product_name"] == product.name


def test_unit_lookup_returns_a_plain_array(supplier_client, unit):
    response = supplier_client.get(UNITS_URL)

    assert response.status_code == status.HTTP_200_OK
    assert isinstance(response.data, list)
    assert str(unit.id) in {str(item["id"]) for item in response.data}


def test_listing_create_requires_product_reference_or_name_and_category(
    supplier_client, unit
):
    response = supplier_client.post(
        LIST_URL,
        {
            "available_quantity": "20.00",
            "unit": str(unit.id),
            "unit_price": "75.50",
            "region": "Oromia",
            "woreda": "Adama",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "product" in response.data
    assert SupplierListing.objects.count() == 0


@pytest.mark.parametrize(
    "overrides, error_field",
    [
        ({"available_quantity": "0"}, "available_quantity"),
        ({"available_quantity": "-1"}, "available_quantity"),
        ({"unit_price": "0"}, "unit_price"),
        ({"unit_price": "-0.01"}, "unit_price"),
        ({"unit": "00000000-0000-0000-0000-000000000000"}, "unit"),
        ({"product": "00000000-0000-0000-0000-000000000000"}, "product"),
    ],
)
def test_listing_rejects_invalid_required_values(
    supplier_client, product, unit, overrides, error_field
):
    payload = listing_payload(product, unit)
    payload.update(overrides)
    response = supplier_client.post(
        LIST_URL,
        payload,
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert error_field in response.data
    assert SupplierListing.objects.count() == 0


@pytest.mark.parametrize(
    "field,value,expected_value",
    [
        ("unit_price", "0", "50.00"),
        ("available_quantity", "-1", "100.00"),
    ],
)
def test_listing_update_rejects_invalid_price_or_quantity_without_saving(
    supplier_client, product, unit, field, value, expected_value
):
    created = supplier_client.post(
        LIST_URL,
        listing_payload(product, unit),
        format="json",
    )
    assert created.status_code == status.HTTP_201_CREATED

    response = supplier_client.patch(
        f"{LIST_URL}/{created.data['id']}",
        {field: value},
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert field in response.data
    listing = SupplierListing.objects.get(pk=created.data["id"])
    assert str(getattr(listing, field)) == expected_value


def test_supplier_can_retrieve_update_and_delete_own_listing(
    supplier_client, supplier, product, unit
):
    created = supplier_client.post(
        LIST_URL,
        listing_payload(product, unit),
        format="json",
    )
    assert created.status_code == status.HTTP_201_CREATED
    listing_url = f"{LIST_URL}/{created.data['id']}"

    retrieved = supplier_client.get(listing_url)
    assert retrieved.status_code == status.HTTP_200_OK
    assert retrieved.data["id"] == created.data["id"]
    assert retrieved.data["product_name"] == product.name

    updated = supplier_client.patch(
        listing_url,
        {"unit_price": "60.25", "notes": "Updated stock"},
        format="json",
    )
    assert updated.status_code == status.HTTP_200_OK
    assert updated.data["unit_price"] == "60.25"
    assert updated.data["notes"] == "Updated stock"

    listing = SupplierListing.objects.get(pk=created.data["id"])
    assert listing.supplier == supplier
    assert str(listing.unit_price) == "60.25"

    deleted = supplier_client.delete(listing_url)
    assert deleted.status_code == status.HTTP_204_NO_CONTENT
    assert not SupplierListing.objects.filter(pk=created.data["id"]).exists()


def test_supplier_can_create_product_by_name_in_configured_category(
    supplier_client, unit
):
    response = supplier_client.post(
        LIST_URL,
        {
            "name": "NPSB 19-38-7 Fertilizer",
            "category": "seed",
            "available_quantity": "20.00",
            "unit": str(unit.id),
            "unit_price": "75.50",
            "region": "Oromia",
            "woreda": "Adama",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_201_CREATED
    assert response.data["product_name"] == "NPSB 19-38-7 Fertilizer"
    assert response.data["product_category"] == "seed"
    listing = SupplierListing.objects.get(id=response.data["id"])
    assert listing.product.name == "NPSB 19-38-7 Fertilizer"


def test_supplier_cannot_create_product_name_in_unconfigured_category(
    supplier_client, unit
):
    response = supplier_client.post(
        LIST_URL,
        {
            "name": "Unconfigured fertilizer",
            "category": "fertilizer",
            "available_quantity": "20.00",
            "unit": str(unit.id),
            "unit_price": "75.50",
            "region": "Oromia",
            "woreda": "Adama",
        },
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert not SupplierListing.objects.filter(product__name="Unconfigured fertilizer").exists()


def test_supplier_cannot_create_listing_for_category_not_in_shop_setup(
    supplier_client, unit
):
    fertilizer = ProductFactory(category="fertilizer")
    response = supplier_client.post(
        LIST_URL, listing_payload(fertilizer, unit), format="json"
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "product" in response.data


def test_supplier_category_input_must_be_a_canonical_category(supplier_client, unit):
    response = supplier_client.post(
        LIST_URL,
        {
            "name": "Unknown category product",
            "category": "farm-supplies",
            "available_quantity": "20.00",
            "unit": str(unit.id),
            "unit_price": "75.50",
            "region": "Oromia",
            "woreda": "Adama",
        },
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "category" in response.data


def test_unauthenticated_client_cannot_create_supplier_listing(api_client, unit):
    product = ProductFactory()
    response = api_client.post(LIST_URL, listing_payload(product, unit), format="json")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_supplier_cannot_change_listing_to_unconfigured_category(
    supplier_client, product, unit
):
    created = supplier_client.post(
        LIST_URL, listing_payload(product, unit), format="json"
    )
    fertilizer = ProductFactory(category="fertilizer")

    response = supplier_client.patch(
        f"{LIST_URL}/{created.data['id']}",
        {"product": str(fertilizer.id)},
        format="json",
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_supplier_can_keep_legacy_category_when_updating_other_fields(
    supplier_client, supplier, unit
):
    fertilizer = ProductFactory(category="fertilizer")
    listing = SupplierListing.objects.create(
        supplier=supplier,
        product=fertilizer,
        available_quantity="20.00",
        unit=unit,
        unit_price="40.00",
        region="Oromia",
        woreda="Adama",
    )

    response = supplier_client.patch(
        f"{LIST_URL}/{listing.id}", {"notes": "Existing stock"}, format="json"
    )

    assert response.status_code == status.HTTP_200_OK
    assert str(response.data["product"]) == str(fertilizer.id)
    assert response.data["product_name"] == fertilizer.name


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

    listing_id = create_response.data["id"]
    listing_url = f"{LIST_URL}/{listing_id}"
    for next_status in (
        AvailabilityStatus.PAUSED,
        AvailabilityStatus.INACTIVE,
        AvailabilityStatus.ACTIVE,
    ):
        response = supplier_client.patch(
            listing_url,
            {"availability_status": next_status},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["availability_status"] == next_status
        listing = SupplierListing.objects.get(pk=listing_id)
        assert listing.availability_status == next_status


def test_supplier_listing_api_paginates_all_listings_after_twenty_five(
    supplier_client, supplier, product, unit
):
    for _ in range(26):
        SupplierListing.objects.create(
            supplier=supplier,
            product=product,
            available_quantity="10",
            unit=unit,
            unit_price="5",
            region="Oromia",
            woreda="Adama",
        )

    first_page = supplier_client.get(LIST_URL)

    assert first_page.status_code == status.HTTP_200_OK
    assert first_page.data["count"] == 26
    assert len(first_page.data["results"]) == 25
    assert first_page.data["next"] is not None

    second_page = supplier_client.get(first_page.data["next"])

    assert second_page.status_code == status.HTTP_200_OK
    assert len(second_page.data["results"]) == 1
    all_results = first_page.data["results"] + second_page.data["results"]
    assert len({item["id"] for item in all_results}) == 26


def test_legacy_expired_listing_can_be_changed_to_inactive(
    supplier_client, supplier, product, unit
):
    listing = SupplierListing.objects.create(
        supplier=supplier,
        product=product,
        available_quantity="10",
        unit=unit,
        unit_price="5",
        region="Oromia",
        woreda="Adama",
        availability_status=AvailabilityStatus.EXPIRED,
    )

    response = supplier_client.patch(
        f"{LIST_URL}/{listing.id}",
        {"availability_status": AvailabilityStatus.INACTIVE},
        format="json",
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.data["availability_status"] == AvailabilityStatus.INACTIVE


def test_supplier_cannot_set_legacy_expired_status_on_new_listing(
    supplier_client, product, unit
):
    response = supplier_client.post(
        LIST_URL,
        listing_payload(product, unit, availability_status="expired"),
        format="json",
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "availability_status" in response.data


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
    create_response = agent_client.post(
        LIST_URL,
        listing_payload(product, unit),
        format="json",
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    assert create_response.status_code == status.HTTP_403_FORBIDDEN


def test_non_supplier_cannot_change_listing_status(agent_client, product, unit):
    supplier = create_web_user(
        phone="+251911200020",
        role=Role.SUPPLIER,
        full_name="Listing Owner",
    )
    listing = SupplierListing.objects.create(
        supplier=supplier,
        product=product,
        available_quantity="10",
        unit=unit,
        unit_price="5",
        region="Oromia",
        woreda="Adama",
    )

    response = agent_client.patch(
        f"{LIST_URL}/{listing.id}",
        {"availability_status": AvailabilityStatus.INACTIVE},
        format="json",
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
    listing.refresh_from_db()
    assert listing.availability_status == AvailabilityStatus.ACTIVE

@pytest.mark.parametrize(
    "approval_status",
    [
        SupplierApprovalStatus.PENDING,
        SupplierApprovalStatus.REJECTED,
    ],
)
def test_unapproved_supplier_cannot_manage_listings(
    api_client, product, unit, approval_status
):
    supplier = create_web_user(
        phone="+251911200010",
        role=Role.SUPPLIER,
        full_name="Unapproved Supplier",
    )
    supplier.supplier_approval_status = approval_status
    supplier.save(update_fields=["supplier_approval_status"])

    api_client.force_authenticate(user=supplier)

    get_response = api_client.get(LIST_URL)
    post_response = api_client.post(
        LIST_URL,
        listing_payload(product, unit),
        format="json",
    )

    assert get_response.status_code == status.HTTP_403_FORBIDDEN
    assert post_response.status_code == status.HTTP_403_FORBIDDEN


def test_approved_supplier_without_shop_setup_cannot_manage_listings(
    api_client, product, unit
):
    supplier = create_web_user(
        phone="+251911200011",
        role=Role.SUPPLIER,
        full_name="Setup Incomplete Supplier",
    )
    supplier.supplier_approval_status = SupplierApprovalStatus.APPROVED
    supplier.save(update_fields=["supplier_approval_status"])
    SupplierProfile.objects.create(
        user=supplier,
        tin_number="1234567891",
        company_name="Incomplete Shop",
    )
    api_client.force_authenticate(user=supplier)

    get_response = api_client.get(LIST_URL)
    post_response = api_client.post(
        LIST_URL,
        listing_payload(product, unit),
        format="json",
    )

    assert get_response.status_code == status.HTTP_403_FORBIDDEN
    assert "shop setup" in get_response.data["detail"].lower()
    assert post_response.status_code == status.HTTP_403_FORBIDDEN


def test_approved_supplier_with_complete_shop_setup_can_manage_listings(
    supplier_client, product
):
    response = supplier_client.get(LIST_URL)

    assert response.status_code == status.HTTP_200_OK


def test_unauthenticated_user_cannot_list_supplier_listings(api_client):
    response = api_client.get(LIST_URL)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.parametrize(
    "method",
    ["get", "patch", "delete"],
)
def test_unauthenticated_user_cannot_access_supplier_listing_detail(
    api_client, supplier, product, unit, method
):
    listing = SupplierListing.objects.create(
        supplier=supplier,
        product=product,
        available_quantity="10",
        unit=unit,
        unit_price="5",
        region="Oromia",
        woreda="Adama",
        availability_status=AvailabilityStatus.ACTIVE,
    )
    detail_url = f"{LIST_URL}/{listing.id}"

    if method == "patch":
        response = api_client.patch(
            detail_url,
            {"availability_status": AvailabilityStatus.PAUSED},
            format="json",
        )
    else:
        response = getattr(api_client, method)(detail_url)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    listing.refresh_from_db()
    assert listing.availability_status == AvailabilityStatus.ACTIVE
    assert SupplierListing.objects.filter(pk=listing.pk).exists()


def test_listing_create_and_update_ignore_client_owned_protected_fields(
    supplier_client, supplier, product, unit
):
    other_supplier = create_web_user(
        phone="+251911200040",
        role=Role.SUPPLIER,
        full_name="Spoofed Listing Owner",
    )
    spoofed_id = "00000000-0000-0000-0000-000000000123"
    spoofed_timestamp = "2000-01-01T00:00:00Z"
    create_payload = listing_payload(
        product,
        unit,
        supplier=str(other_supplier.id),
        id=spoofed_id,
        created_at=spoofed_timestamp,
        updated_at=spoofed_timestamp,
    )

    created = supplier_client.post(LIST_URL, create_payload, format="json")

    assert created.status_code == status.HTTP_201_CREATED
    listing = SupplierListing.objects.get(pk=created.data["id"])
    assert listing.supplier == supplier
    assert str(listing.id) != spoofed_id
    assert listing.created_at.year != 2000
    assert listing.updated_at.year != 2000

    original_id = listing.id
    original_created_at = listing.created_at
    update_payload = {
        "supplier": str(other_supplier.id),
        "id": spoofed_id,
        "created_at": spoofed_timestamp,
        "updated_at": spoofed_timestamp,
        "notes": "Updated through the listing API",
    }

    updated = supplier_client.patch(
        f"{LIST_URL}/{listing.id}", update_payload, format="json"
    )

    assert updated.status_code == status.HTTP_200_OK
    listing.refresh_from_db()
    assert listing.supplier == supplier
    assert listing.id == original_id
    assert listing.created_at == original_created_at
    assert listing.updated_at.year != 2000
    assert listing.notes == "Updated through the listing API"
