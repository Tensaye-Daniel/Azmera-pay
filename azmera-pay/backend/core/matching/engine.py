# Pure scoring function (product/distance/price/capacity/rating) - no Django imports
from dataclasses import dataclass, field
from decimal import ROUND_HALF_UP, Decimal
from uuid import UUID

from .constants import (
    FAIL_INVALID_PRICE,
    FAIL_NOT_ACTIVE,
    FAIL_PRICE,
    FAIL_CATEGORY,
    FAIL_PRODUCT_INACTIVE,
    FAIL_QUANTITY,
    FAIL_REGION,
    FAIL_UNIT,
    LISTING_ACTIVE,
    LOCATION_POINTS,
    LOCATION_RANK,
    OTHER_REGION,
    PRICE_MAX_POINTS,
    QUANTITY_FULL_POINTS_RATIO,
    QUANTITY_MAX_POINTS,
    REASON_ACTIVE_LISTING,
    REASON_ENOUGH_QUANTITY,
    REASON_CATEGORY_MATCHES,
    REASON_WITHIN_BUDGET,
    SAME_REGION,
    SAME_WOREDA,
    canonical_region,
    normalize_text,
)

ZERO = Decimal("0")
ONE = Decimal("1")
CENT = Decimal("0.01")


def _require_decimal(name, value):
    """Ensure prices and quantities are valid Decimal values."""
    if not isinstance(value, Decimal) or not value.is_finite():
        raise TypeError(f"{name} must be a finite Decimal, got {value!r}")


def _require_uuid(name, value):
    """Ensure identifiers use the UUID contract instead of unchecked strings."""
    if not isinstance(value, UUID):
        raise TypeError(f"{name} must be a UUID, got {value!r}")


def _require_category(name, value):
    """Categories are stable catalog identifiers, not product display names."""
    if not isinstance(value, str) or not value.strip():
        raise TypeError(f"{name} must be a non-empty category identifier")


@dataclass(frozen=True)
class RequestData:
    """Data needed from a farmer's request."""
    product_id: UUID
    product_category: str
    unit_id: UUID
    quantity: Decimal
    max_unit_price: Decimal
    region: str
    woreda: str
    product_is_active: bool

    def __post_init__(self):
        _require_uuid("product_id", self.product_id)
        _require_category("product_category", self.product_category)
        _require_uuid("unit_id", self.unit_id)
        _require_decimal("quantity", self.quantity)
        _require_decimal("max_unit_price", self.max_unit_price)


@dataclass(frozen=True)
class ListingData:
    """Data needed from a supplier listing."""
    id: UUID
    product_id: UUID
    product_category: str
    unit_id: UUID
    available_quantity: Decimal
    unit_price: Decimal
    region: str
    woreda: str
    availability_status: str
    product_is_active: bool

    def __post_init__(self):
        _require_uuid("id", self.id)
        _require_uuid("product_id", self.product_id)
        _require_category("product_category", self.product_category)
        _require_uuid("unit_id", self.unit_id)
        _require_decimal("available_quantity", self.available_quantity)
        _require_decimal("unit_price", self.unit_price)


@dataclass(frozen=True)
class MatchResult:
    """Result saved by the matching service."""
    listing_id: UUID
    location_match: str
    score: Decimal
    reasons: list = field(default_factory=list)


def eligibility_failures(req, lst):
    """Return the rules that make a listing ineligible."""
    failures = []

    if lst.availability_status != LISTING_ACTIVE:
        failures.append(FAIL_NOT_ACTIVE)

    if not req.product_is_active or not lst.product_is_active:
        failures.append(FAIL_PRODUCT_INACTIVE)

    if lst.product_category != req.product_category:
        failures.append(FAIL_CATEGORY)

    if lst.unit_id != req.unit_id:
        failures.append(FAIL_UNIT)

    if lst.available_quantity < req.quantity:
        failures.append(FAIL_QUANTITY)

    if lst.unit_price <= ZERO:
        failures.append(FAIL_INVALID_PRICE)

    if lst.unit_price > req.max_unit_price:
        failures.append(FAIL_PRICE)

    if canonical_region(lst.region) is None:
        failures.append(FAIL_REGION)

    return failures


def location_match(req, lst):
    """Determine whether the listing is in the same woreda or region."""
    farmer_region = canonical_region(req.region)
    listing_region = canonical_region(lst.region)

    if (
        farmer_region is None
        or listing_region is None
        or farmer_region != listing_region
    ):
        return OTHER_REGION

    farmer_woreda = normalize_text(req.woreda)

    if farmer_woreda and farmer_woreda == normalize_text(lst.woreda):
        return SAME_WOREDA

    return SAME_REGION


def _round(value):
    return value.quantize(CENT, rounding=ROUND_HALF_UP)


def score_breakdown(req, lst, location):
    """Calculate the location, price, and quantity points."""
    if req.quantity <= ZERO or req.max_unit_price <= ZERO:
        raise ValueError("Request quantity and maximum unit price must be positive.")
    if lst.available_quantity <= ZERO or lst.unit_price <= ZERO:
        raise ValueError("Listing quantity and unit price must be positive.")
    if location not in LOCATION_POINTS:
        raise ValueError(f"Unknown location match: {location!r}")

    saving = (req.max_unit_price - lst.unit_price) / req.max_unit_price
    saving = min(max(saving, ZERO), ONE)

    stock_ratio = min(
        lst.available_quantity / req.quantity,
        QUANTITY_FULL_POINTS_RATIO,
    )
    stock_share = stock_ratio / QUANTITY_FULL_POINTS_RATIO

    return {
        "location": LOCATION_POINTS[location],
        "price": _round(saving * PRICE_MAX_POINTS),
        "quantity": _round(stock_share * QUANTITY_MAX_POINTS),
    }


def build_match(req, lst):
    """Create a match if the listing passes all requirements."""
    if req.quantity <= 0 or req.max_unit_price <= 0:
        return None

    if eligibility_failures(req, lst):
        return None

    location = location_match(req, lst)
    parts = score_breakdown(req, lst, location)

    return MatchResult(
        listing_id=lst.id,
        location_match=location,
        score=_round(sum(parts.values(), ZERO)),
        reasons=[
            location,
            REASON_CATEGORY_MATCHES,
            REASON_ENOUGH_QUANTITY,
            REASON_WITHIN_BUDGET,
            REASON_ACTIVE_LISTING,
        ],
    )


def _ranking_key(match, lst):
    """Rank by location, then price, quantity, and ID."""
    return (
        LOCATION_RANK[match.location_match],
        lst.unit_price,
        -lst.available_quantity,
        str(lst.id),
    )


def rank_matches(req, listings):
    """Return eligible listings in the required ranking order."""
    ranked = []

    for lst in listings:
        match = build_match(req, lst)

        if match is not None:
            ranked.append((_ranking_key(match, lst), match))

    ranked.sort(key=lambda pair: pair[0])

    return [match for _, match in ranked]
