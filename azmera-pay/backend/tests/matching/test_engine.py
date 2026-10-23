"""
Unit tests for the pure matching engine (core/matching/engine.py).

No database and no Django needed. The tests check the contract rules:
  - 6 hard filters
  - location labels: same_woreda / same_region / other_region
  - ranking: location tier, then lower price, then larger quantity
    (the numeric score never decides the order)
  - explainable reasons and score breakdown
  - Decimal-only prices and quantities
  - the engine imports no Django
"""
import subprocess
import sys
from decimal import Decimal
from itertools import permutations
from pathlib import Path
from uuid import UUID

import pytest

from core.matching.constants import canonical_region
from core.matching.engine import (
    ListingData,
    RequestData,
    build_match,
    eligibility_failures,
    rank_matches,
    score_breakdown,
)

# Helpers

def D(value):
    return Decimal(value)


def uid(n):
    """Predictable UUID for tests: uid(1), uid(2), ..."""
    return UUID(int=n)


PRODUCT_ID = UUID("11111111-1111-1111-1111-111111111111")
UNIT_ID = UUID("22222222-2222-2222-2222-222222222222")


def make_request(**changes):
    """Farmer wants 10 units, paying at most 100 each, in Oromia / Adama."""
    values = {
        "product_id": PRODUCT_ID,
        "unit_id": UNIT_ID,
        "quantity": D("10"),
        "max_unit_price": D("100"),
        "region": "Oromia",
        "woreda": "Adama",
        "product_is_active": True,
    }
    values.update(changes)
    return RequestData(**values)


def make_listing(listing_id=None, **changes):
    """A listing that is eligible for REQ by default. Each test changes only what it checks."""
    values = {
        "id": listing_id or uid(1),
        "product_id": PRODUCT_ID,
        "unit_id": UNIT_ID,
        "available_quantity": D("100"),
        "unit_price": D("50"),
        "region": "Oromia",
        "woreda": "Adama",
        "availability_status": "active",
        "product_is_active": True,
    }
    values.update(changes)
    return ListingData(**values)


REQ = make_request()


def ids(matches):
    return [m.listing_id for m in matches]

# A valid listing

def test_build_match_returns_match_for_valid_listing():
    match = build_match(REQ, make_listing())

    assert match is not None
    assert match.listing_id == uid(1)
    assert match.location_match == "same_woreda"
    assert match.score > D("0")


def test_valid_listing_has_no_failures():
    assert eligibility_failures(REQ, make_listing()) == []


def test_product_name_is_not_an_input_to_match_selection_or_score():
    # Product names are response metadata. The engine receives only the
    # established matching fields, so renaming a product cannot alter results.
    first_name = "NPSB 19-38-7 Fertilizer"
    second_name = "Urea Fertilizer"
    listing = make_listing()

    first_result = build_match(REQ, listing)
    second_result = build_match(REQ, listing)

    assert first_name != second_name
    assert first_result == second_result
    assert "name" not in ListingData.__dataclass_fields__


def test_result_exposes_only_service_fields():
    match = build_match(REQ, make_listing())

    assert set(vars(match)) == {"listing_id", "location_match", "score", "reasons"}

# Hard filters

@pytest.mark.parametrize(
    "changes, expected_failure",
    [
        ({"availability_status": "paused"}, "listing_not_active"),
        ({"availability_status": "inactive"}, "listing_not_active"),
        ({"availability_status": "expired"}, "listing_not_active"),
        ({"availability_status": ""}, "listing_not_active"),
        ({"product_is_active": False}, "product_not_active"),
        ({"product_id": uid(901)}, "product_mismatch"),
        ({"unit_id": uid(902)}, "unit_mismatch"),
        ({"available_quantity": D("9.99")}, "not_enough_quantity"),
        ({"unit_price": D("0")}, "invalid_listing_price"),
        ({"unit_price": D("-0.01")}, "invalid_listing_price"),
        ({"unit_price": D("100.01")}, "over_budget"),
        ({"region": "Invalid Region"}, "region_not_allowed"),
        ({"region": ""}, "region_not_allowed"),
    ],
)
def test_each_hard_filter_rejects_a_listing_on_its_own(changes, expected_failure):
    listing = make_listing(**changes)

    assert eligibility_failures(REQ, listing) == [expected_failure]
    assert build_match(REQ, listing) is None


def test_all_failures_are_reported_together():
    listing = make_listing(
        availability_status="paused",
        product_id=uid(901),
        unit_id=uid(902),
        available_quantity=D("1"),
        unit_price=D("999"),
        region="Narnia",
    )

    assert set(eligibility_failures(REQ, listing)) == {
        "listing_not_active",
        "product_mismatch",
        "unit_mismatch",
        "not_enough_quantity",
        "over_budget",
        "region_not_allowed",
    }


def test_inactive_request_product_is_not_matched():
    req = make_request(product_is_active=False)

    assert eligibility_failures(req, make_listing()) == ["product_not_active"]
    assert build_match(req, make_listing()) is None


def test_request_and_listing_product_references_must_match():
    listing = make_listing(product_id=uid(901))

    assert eligibility_failures(REQ, listing) == ["product_mismatch"]
    assert build_match(REQ, listing) is None


def test_price_equal_to_max_is_allowed():
    listing = make_listing(unit_price=D("100"))

    assert eligibility_failures(REQ, listing) == []
    assert build_match(REQ, listing) is not None


def test_quantity_exactly_enough_is_allowed():
    listing = make_listing(available_quantity=D("10"))

    assert eligibility_failures(REQ, listing) == []
    assert build_match(REQ, listing) is not None


@pytest.mark.parametrize(
    "changes",
    [
        {"quantity": D("0")},
        {"quantity": D("-5")},
        {"max_unit_price": D("0")},
        {"max_unit_price": D("-1")},
    ],
)
def test_invalid_request_matches_nothing(changes):
    assert build_match(make_request(**changes), make_listing()) is None


# Location labels

@pytest.mark.parametrize(
    "region, woreda, expected",
    [
        ("Oromia", "Adama", "same_woreda"),
        ("Oromia", "  aDAMA ", "same_woreda"),      # case and spaces are ignored
        ("Oromiya", "Adama", "same_woreda"),        # spelling variant of the region
        ("Oromia", "Bishoftu", "same_region"),
        ("Oromiya", "Bishoftu", "same_region"),
        ("Amhara", "Adama", "other_region"),        # same woreda NAME, different region
        ("Amhara", "Bahir Dar", "other_region"),
    ],
)
def test_listing_location_label(region, woreda, expected):
    match = build_match(REQ, make_listing(region=region, woreda=woreda))

    assert match.location_match == expected


def test_farmer_region_spelling_variant_still_matches():
    req = make_request(region="Oromiya")

    assert build_match(req, make_listing()).location_match == "same_woreda"


def test_empty_woreda_is_never_same_woreda():
    req = make_request(woreda="")

    assert build_match(req, make_listing(woreda="")).location_match == "same_region"


def test_unrecognised_farmer_region_is_other_region():
    req = make_request(region="Narnia")

    assert build_match(req, make_listing()).location_match == "other_region"


# Reasons

def test_reasons_explain_the_match():
    reasons = build_match(REQ, make_listing()).reasons

    assert set(reasons) == {
        "same_woreda",
        "product_matches",
        "enough_quantity",
        "within_budget",
        "active_listing",
    }


@pytest.mark.parametrize(
    "changes, label",
    [
        ({}, "same_woreda"),
        ({"woreda": "Bishoftu"}, "same_region"),
        ({"region": "Amhara", "woreda": "X"}, "other_region"),
    ],
)
def test_first_reason_is_the_location_label(changes, label):
    match = build_match(REQ, make_listing(**changes))

    assert match.reasons[0] == label
    assert match.location_match == label

# Ranking (location first, then price, then quantity)

def test_location_ranks_before_price():
    ranked = rank_matches(REQ, [
        make_listing(uid(1), region="Amhara", woreda="X", unit_price=D("10")),   # cheapest
        make_listing(uid(2), woreda="Bishoftu", unit_price=D("50")),
        make_listing(uid(3), unit_price=D("90")),                                # same woreda
    ])

    assert ids(ranked) == [uid(3), uid(2), uid(1)]


def test_lower_price_wins_inside_one_tier():
    ranked = rank_matches(REQ, [
        make_listing(uid(1), unit_price=D("90")),
        make_listing(uid(2), unit_price=D("70")),
    ])

    assert ids(ranked) == [uid(2), uid(1)]


def test_larger_quantity_wins_when_price_is_equal():
    ranked = rank_matches(REQ, [
        make_listing(uid(1), available_quantity=D("20")),
        make_listing(uid(2), available_quantity=D("90")),
    ])

    assert ids(ranked) == [uid(2), uid(1)]


def test_price_beats_quantity_inside_one_tier():
    ranked = rank_matches(REQ, [
        make_listing(uid(1), unit_price=D("60"), available_quantity=D("1000")),
        make_listing(uid(2), unit_price=D("50"), available_quantity=D("20")),
    ])

    assert ids(ranked) == [uid(2), uid(1)]


def test_identical_listings_keep_a_stable_order():
    ranked = rank_matches(REQ, [make_listing(uid(2)), make_listing(uid(1))])

    assert ids(ranked) == [uid(1), uid(2)]


def test_ranking_does_not_depend_on_input_order():
    listings = [
        make_listing(uid(1), region="Amhara", woreda="X", unit_price=D("10")),
        make_listing(uid(2), woreda="Bishoftu", unit_price=D("50")),
        make_listing(uid(3), woreda="Bishoftu", unit_price=D("40")),
        make_listing(uid(4), unit_price=D("90")),
    ]
    expected = [uid(4), uid(3), uid(2), uid(1)]

    for order in permutations(listings):
        assert ids(rank_matches(REQ, list(order))) == expected


def test_ranking_does_not_modify_the_input_list():
    listings = [make_listing(uid(2)), make_listing(uid(1))]
    before = list(listings)

    rank_matches(REQ, listings)

    assert listings == before


def test_ineligible_listings_are_removed():
    ranked = rank_matches(REQ, [
        make_listing(uid(1)),
        make_listing(uid(2), availability_status="paused"),
        make_listing(uid(3), unit_price=D("999")),
        make_listing(uid(4), region="Narnia"),
    ])

    assert ids(ranked) == [uid(1)]


def test_no_listings_gives_empty_result():
    assert rank_matches(REQ, []) == []


def test_no_eligible_listings_gives_empty_result():
    assert rank_matches(REQ, [make_listing(availability_status="expired")]) == []
    assert rank_matches(REQ, [make_listing(availability_status="inactive")]) == []

# Score: explanation only, never decides ranking

def test_location_tier_beats_a_higher_numeric_score():
    # Same woreda, priciest allowed, minimum stock: 60 + 0 + 5 = 65
    woreda = make_listing(uid(1), unit_price=D("100"), available_quantity=D("10"))
    # Same region, nearly free, huge stock: 30 + 25 + 15 = 70
    region = make_listing(uid(2), woreda="Bishoftu", unit_price=D("0.01"),
                          available_quantity=D("1000"))

    matches = rank_matches(REQ, [region, woreda])
    by_id = {m.listing_id: m for m in matches}

    assert by_id[uid(2)].score > by_id[uid(1)].score      # the region listing scores higher...
    assert ids(matches) == [uid(1), uid(2)]               # ...but the woreda listing ranks first


def test_default_listing_has_an_exact_score():
    listing = make_listing()   # same woreda, price 50 of 100, stock 10x the request
    match = build_match(REQ, listing)

    assert score_breakdown(REQ, listing, match.location_match) == {
        "location": D("60"),
        "price": D("12.50"),
        "quantity": D("15.00"),
    }
    assert match.score == D("87.50")


def test_score_breakdown_adds_up_to_score():
    listing = make_listing()
    match = build_match(REQ, listing)
    parts = score_breakdown(REQ, listing, match.location_match)

    assert set(parts) == {"location", "price", "quantity"}
    assert sum(parts.values()) == match.score


@pytest.mark.parametrize(
    "changes, expected_location_points",
    [
        ({}, D("60")),
        ({"woreda": "Bishoftu"}, D("30")),
        ({"region": "Amhara", "woreda": "X"}, D("10")),
    ],
)
def test_location_points_are_60_30_10(changes, expected_location_points):
    listing = make_listing(**changes)
    parts = score_breakdown(REQ, listing, build_match(REQ, listing).location_match)

    assert parts["location"] == expected_location_points


def test_closer_location_scores_higher_when_all_else_is_equal():
    near = build_match(REQ, make_listing(uid(1))).score
    mid = build_match(REQ, make_listing(uid(2), woreda="Bishoftu")).score
    far = build_match(REQ, make_listing(uid(3), region="Amhara", woreda="X")).score

    assert near > mid > far


def test_cheaper_listing_gets_more_price_points():
    cheap = make_listing(uid(1), unit_price=D("40"))
    dear = make_listing(uid(2), unit_price=D("90"))

    cheap_parts = score_breakdown(REQ, cheap, build_match(REQ, cheap).location_match)
    dear_parts = score_breakdown(REQ, dear, build_match(REQ, dear).location_match)

    assert cheap_parts["price"] > dear_parts["price"]


def test_price_points_are_zero_when_price_equals_budget():
    listing = make_listing(unit_price=D("100"))
    parts = score_breakdown(REQ, listing, build_match(REQ, listing).location_match)

    assert parts["price"] == D("0")


@pytest.mark.parametrize(
    "available, expected_points",
    [
        (D("10"), D("5.00")),     # exactly enough: 1/3 of the maximum
        (D("15"), D("7.50")),
        (D("30"), D("15.00")),    # 3x the request: full points
        (D("300"), D("15.00")),   # more stock does not add more points
    ],
)
def test_quantity_points_grow_with_stock_and_stop_at_15(available, expected_points):
    listing = make_listing(available_quantity=available)
    parts = score_breakdown(REQ, listing, build_match(REQ, listing).location_match)

    assert parts["quantity"] == expected_points


def test_score_is_between_15_and_100():
    worst = build_match(REQ, make_listing(region="Amhara", woreda="X",
                                          unit_price=D("100"), available_quantity=D("10")))
    best = build_match(REQ, make_listing(unit_price=D("0.01"), available_quantity=D("9999")))

    assert worst.score == D("15.00")    # 10 + 0 + 5
    assert best.score == D("100.00")    # 60 + 25 + 15


# Decimal rules (contract: no floating-point prices or quantities)

@pytest.mark.parametrize("field", ["quantity", "max_unit_price"])
def test_request_rejects_float_values(field):
    with pytest.raises(TypeError):
        make_request(**{field: 10.5})


@pytest.mark.parametrize("field", ["available_quantity", "unit_price"])
def test_listing_rejects_float_values(field):
    with pytest.raises(TypeError):
        make_listing(**{field: 10.5})


@pytest.mark.parametrize("bad", [Decimal("NaN"), Decimal("Infinity")])
def test_non_finite_decimals_are_rejected(bad):
    with pytest.raises(TypeError):
        make_request(max_unit_price=bad)
    with pytest.raises(TypeError):
        make_listing(unit_price=bad)


def test_engine_inputs_reject_non_uuid_identifiers():
    with pytest.raises(TypeError, match="product_id must be a UUID"):
        make_request(product_id="not-a-uuid")

    with pytest.raises(TypeError, match="id must be a UUID"):
        make_listing(listing_id="not-a-uuid")


def test_required_request_fields_cannot_be_omitted():
    with pytest.raises(TypeError, match="max_unit_price"):
        RequestData(
            product_id=PRODUCT_ID,
            unit_id=UNIT_ID,
            quantity=D("1"),
            region="Oromia",
            woreda="Adama",
        )

# Region helper

@pytest.mark.parametrize(
    "value, expected",
    [
        ("Oromia", "Oromia"),
        ("oromiya", "Oromia"),
        ("  Tigray ", "Tigray"),
        ("addis   ababa", "Addis Ababa"),
        ("Atlantis", None),
        ("", None),
        (None, None),
    ],
)
def test_canonical_region(value, expected):
    assert canonical_region(value) == expected

# Architecture rule: the engine must not depend on Django

def test_engine_does_not_import_django():
    backend_dir = Path(__file__).resolve().parents[2]    # the backend folder
    code = (
        "import sys; import core.matching.engine; "
        "bad = [m for m in sys.modules if m == 'django' or m.startswith('django.')]; "
        "assert not bad, bad"
    )

    subprocess.run([sys.executable, "-c", code], cwd=backend_dir, check=True)
