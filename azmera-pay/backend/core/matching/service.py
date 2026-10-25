"""Load eligible supplier listings for the pure matching engine."""

from apps.accounts.models import Role, SupplierApprovalStatus
from apps.catalog.models import AvailabilityStatus, SupplierListing

from .engine import ListingData, MatchResult, RequestData, rank_matches


def find_listing_matches(request_data: RequestData) -> list[MatchResult]:
    """Return ranked matches for a request-shaped input using catalog listings.

    The caller builds ``RequestData`` from a saved request line and its product
    category. A supplier must be approved; only active listings and products
    enter the engine. The engine applies category, unit, quantity, price, and
    location rules before ranking results.
    """
    listings = (
        SupplierListing.objects.filter(
            product__category=request_data.product_category,
            unit_id=request_data.unit_id,
            availability_status=AvailabilityStatus.ACTIVE,
            product__is_active=True,
            supplier__role=Role.SUPPLIER,
            supplier__supplier_approval_status=SupplierApprovalStatus.APPROVED,
        )
        .select_related("product", "unit")
    )

    listing_inputs = [
        ListingData(
            id=listing.id,
            product_id=listing.product_id,
            product_category=listing.product.category,
            unit_id=listing.unit_id,
            available_quantity=listing.available_quantity,
            unit_price=listing.unit_price,
            region=listing.region,
            woreda=listing.woreda,
            availability_status=listing.availability_status,
            product_is_active=listing.product.is_active,
        )
        for listing in listings
    ]
    return rank_matches(request_data, listing_inputs)
