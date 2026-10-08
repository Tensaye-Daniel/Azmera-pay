# Scoring unit tests
import pytest
from decimal import Decimal
from uuid import UUID

from core.matching.engine import (
    ListingData,
    RequestData,
    build_match,
    eligibility_failures,
    rank_matches,
    score_breakdown,
)


def D(value):
    return Decimal(value)


PRODUCT_ID = UUID("11111111-1111-1111-1111-111111111111")
UNIT_ID = UUID("22222222-2222-2222-2222-222222222222")


def make_listing(
    listing_id="listing-1",
    product_id=PRODUCT_ID,
    unit_id=UNIT_ID,
    available_quantity=D("100"),
    unit_price=D("50"),
    region="Oromia",
    woreda="Adama",
    availability_status="active",
):
    return ListingData(
        id=listing_id,
        product_id=product_id,
        unit_id=unit_id,
        available_quantity=available_quantity,
        unit_price=unit_price,
        region=region,
        woreda=woreda,
        availability_status=availability_status,
    )


REQ = RequestData(
    product_id=PRODUCT_ID,
    unit_id=UNIT_ID,
    quantity=D("10"),
    max_unit_price=D("100"),
    region="Oromia",
    woreda="Adama",
)


def test_build_match_returns_match_for_valid_listing():
    match = build_match(REQ, make_listing())

    assert match is not None
    assert match.listing_id == "listing-1"
    assert match.location_match == "same_woreda"
    assert match.score > D("0")


def test_inactive_listing_is_rejected():
    listing = make_listing(availability_status="paused")

    assert build_match(REQ, listing) is None
    assert eligibility_failures(REQ, listing) == ["listing_not_active"]


def test_wrong_product_is_rejected():
    listing = make_listing(
        product_id=UUID("33333333-3333-3333-3333-333333333333")
    )

    assert build_match(REQ, listing) is None


def test_wrong_unit_is_rejected():
    listing = make_listing(
        unit_id=UUID("44444444-4444-4444-4444-444444444444")
    )

    assert build_match(REQ, listing) is None


def test_not_enough_quantity_is_rejected():
    listing = make_listing(available_quantity=D("5"))

    assert build_match(REQ, listing) is None


def test_over_budget_listing_is_rejected():
    listing = make_listing(unit_price=D("101"))

    assert build_match(REQ, listing) is None


def test_invalid_region_is_rejected():
    listing = make_listing(region="Invalid Region")

    assert build_match(REQ, listing) is None


def test_score_breakdown_adds_up_to_score():
    listing = make_listing()

    match = build_match(REQ, listing)
    parts = score_breakdown(REQ, listing, match.location_match)

    assert set(parts) == {"location", "price", "quantity"}
    assert sum(parts.values()) == match.score


def test_cheaper_listing_gets_more_price_points():
    cheap = make_listing("c", unit_price=D("40"))
    dear = make_listing("d", unit_price=D("90"))

    cheap_parts = score_breakdown(
        REQ,
        cheap,
        build_match(REQ, cheap).location_match,
    )

    dear_parts = score_breakdown(
        REQ,
        dear,
        build_match(REQ, dear).location_match,
    )

    assert cheap_parts["price"] > dear_parts["price"]


def test_location_tier_beats_a_higher_numeric_score():
    # Same-woreda listing gets location priority.
    woreda = make_listing(
        "woreda",
        unit_price=D("100"),
        available_quantity=D("10"),
    )

    # Same-region listing has a higher numeric score.
    region = make_listing(
        "region",
        woreda="Bishoftu",
        unit_price=D("0.01"),
        available_quantity=D("1000"),
    )

    matches = rank_matches(REQ, [woreda, region])
    by_id = {m.listing_id: m for m in matches}

    assert by_id["region"].score > by_id["woreda"].score

    assert [m.listing_id for m in matches] == [
        "woreda",
        "region",
    ]


def test_result_exposes_only_service_fields():
    match = build_match(REQ, make_listing())

    assert set(vars(match)) == {
        "listing_id",
        "location_match",
        "score",
        "reasons",
    }


def test_float_prices_are_rejected():
    with pytest.raises(TypeError):
        RequestData(
            PRODUCT_ID,
            UNIT_ID,
            D("10"),
            100.0,
            "Oromia",
            "Adama",
        )