"""Database adapter tests that do not depend on Module 1 request models."""
from decimal import Decimal

import pytest

from core.matching.engine import RequestData
from core.matching.service import find_listing_matches
from tests.factories.catalog import (
    ProductFactory,
    SupplierListingFactory,
    UnitFactory,
)

pytestmark = pytest.mark.django_db


def request_for(product, unit, **changes):
    values = {
        "product_id": product.id,
        "unit_id": unit.id,
        "quantity": Decimal("10"),
        "max_unit_price": Decimal("100"),
        "region": "Oromia",
        "woreda": "Adama",
        "product_is_active": product.is_active,
    }
    values.update(changes)
    return RequestData(**values)


def test_service_loads_active_listings_and_returns_engine_ranking():
    product = ProductFactory()
    unit = UnitFactory()
    local_high_price = SupplierListingFactory(
        product=product,
        unit=unit,
        unit_price=Decimal("90"),
        available_quantity=Decimal("10"),
        region="Oromia",
        woreda="Adama",
    )
    local_low_price = SupplierListingFactory(
        product=product,
        unit=unit,
        unit_price=Decimal("50"),
        available_quantity=Decimal("20"),
        region="Oromia",
        woreda="Adama",
    )
    same_region = SupplierListingFactory(
        product=product,
        unit=unit,
        unit_price=Decimal("1"),
        region="Oromia",
        woreda="Bishoftu",
    )

    results = find_listing_matches(request_for(product, unit))

    assert [result.listing_id for result in results] == [
        local_low_price.id,
        local_high_price.id,
        same_region.id,
    ]
    assert results[0].location_match == "same_woreda"
    assert results[0].score == Decimal("82.50")
    assert results[0].reasons == [
        "same_woreda",
        "product_matches",
        "enough_quantity",
        "within_budget",
        "active_listing",
    ]


def test_service_excludes_inactive_product_and_non_active_listings():
    product = ProductFactory()
    unit = UnitFactory()
    eligible = SupplierListingFactory(product=product, unit=unit)
    SupplierListingFactory(product=ProductFactory(is_active=False), unit=unit)
    for status in ("paused", "inactive", "expired"):
        SupplierListingFactory(
            product=product,
            unit=unit,
            availability_status=status,
        )

    results = find_listing_matches(request_for(product, unit))

    assert [result.listing_id for result in results] == [eligible.id]


@pytest.mark.parametrize(
    "listing_changes",
    [
        {"product": "different"},
        {"unit": "different"},
        {"available_quantity": Decimal("9.99")},
        {"unit_price": Decimal("100.01")},
    ],
)
def test_service_excludes_product_unit_quantity_and_price_mismatches(
    listing_changes,
):
    product = ProductFactory()
    unit = UnitFactory()
    listing_changes = listing_changes.copy()
    if listing_changes.get("product") == "different":
        listing_changes["product"] = ProductFactory()
    if listing_changes.get("unit") == "different":
        listing_changes["unit"] = UnitFactory()
    listing_values = {"product": product, "unit": unit}
    listing_values.update(listing_changes)
    SupplierListingFactory(**listing_values)

    assert find_listing_matches(request_for(product, unit)) == []


def test_service_returns_no_results_for_inactive_request_product_or_no_listings():
    product = ProductFactory()
    unit = UnitFactory()

    assert find_listing_matches(request_for(product, unit)) == []

    SupplierListingFactory(product=product, unit=unit)
    assert find_listing_matches(
        request_for(product, unit, product_is_active=False)
    ) == []
