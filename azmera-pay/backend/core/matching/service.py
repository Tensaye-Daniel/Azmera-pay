"""Database-backed listing adapter for the pure matching engine.

The request module currently has no InputRequest model, and ``apps.matching`` is
not installed. This service therefore accepts the pure engine's explicit request
input and returns ranked results without inventing a request relation or
pretending that candidates have been persisted.
"""

from apps.catalog.models import AvailabilityStatus, SupplierListing

from .engine import ListingData, MatchResult, RequestData, rank_matches


def find_listing_matches(request_data: RequestData) -> list[MatchResult]:
    """Return ranked matches for a request-shaped input using catalog listings.

    The caller must build ``RequestData`` from the authoritative request and
    Farmer profile, including the Product's active flag. Once the request app
    exposes an InputRequest model, the matching service can load it here, reject
    non-open requests, and persist the returned results through MatchCandidate.
    """
    listings = (
        SupplierListing.objects.filter(
            availability_status=AvailabilityStatus.ACTIVE,
            product__is_active=True,
        )
        .select_related("product", "unit")
    )

    listing_inputs = [
        ListingData(
            id=listing.id,
            product_id=listing.product_id,
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
