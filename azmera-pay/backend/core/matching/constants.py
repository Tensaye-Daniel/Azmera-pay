from decimal import Decimal


def normalize_text(value):
    """Lowercase, trim, and collapse repeated spaces."""
    return " ".join((value or "").strip().lower().split())

# Region names are validated here.
# Woreda values come from Farmer/Supplier data in the database.

ETHIOPIAN_REGIONS = [
    "Addis Ababa",
    "Afar",
    "Amhara",
    "Benishangul-Gumuz",
    "Central Ethiopia",
    "Dire Dawa",
    "Gambela",
    "Harari",
    "Oromia",
    "Sidama",
    "Somali",
    "South Ethiopia",
    "South West Ethiopia",
    "Tigray",
]

_ALIASES = {
    "oromiya": "Oromia",
    "snnpr": "South Ethiopia",
}

_REGION_LOOKUP = {normalize_text(name): name for name in ETHIOPIAN_REGIONS}
_REGION_LOOKUP.update(
    {normalize_text(alias): name for alias, name in _ALIASES.items()}
)


def canonical_region(value):
    """Return the official region name, or None if invalid."""
    return _REGION_LOOKUP.get(normalize_text(value))


SAME_WOREDA = "same_woreda"
SAME_REGION = "same_region"
OTHER_REGION = "other_region"

LISTING_ACTIVE = "active"

# Lower number means higher ranking priority.
LOCATION_RANK = {
    SAME_WOREDA: 0,
    SAME_REGION: 1,
    OTHER_REGION: 2,
}

# Score explains a match; it does not determine ranking.
LOCATION_POINTS = {
    SAME_WOREDA: Decimal("60"),
    SAME_REGION: Decimal("30"),
    OTHER_REGION: Decimal("10"),
}

PRICE_MAX_POINTS = Decimal("25")
QUANTITY_MAX_POINTS = Decimal("15")
QUANTITY_FULL_POINTS_RATIO = Decimal("3")

REASON_PRODUCT_MATCHES = "product_matches"
REASON_ENOUGH_QUANTITY = "enough_quantity"
REASON_WITHIN_BUDGET = "within_budget"
REASON_ACTIVE_LISTING = "active_listing"

FAIL_NOT_ACTIVE = "listing_not_active"
FAIL_PRODUCT = "product_mismatch"
FAIL_UNIT = "unit_mismatch"
FAIL_QUANTITY = "not_enough_quantity"
FAIL_PRICE = "over_budget"
FAIL_REGION = "region_not_allowed"