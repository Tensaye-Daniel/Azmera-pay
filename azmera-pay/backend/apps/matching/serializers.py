from rest_framework import serializers

from .models import MatchCandidate


class SupplierMatchSerializer(serializers.ModelSerializer):
    """Expose request and listing details relevant to the listing owner."""

    request_id = serializers.UUIDField(source="request.id", read_only=True)
    listing_id = serializers.UUIDField(source="listing.id", read_only=True)
    request_status = serializers.CharField(source="request.status", read_only=True)
    requested_product = serializers.CharField(source="line.product.name", read_only=True)
    requested_category = serializers.CharField(source="line.product.category", read_only=True)
    requested_quantity = serializers.DecimalField(
        source="line.quantity", max_digits=12, decimal_places=2, read_only=True
    )
    requested_unit = serializers.CharField(source="line.unit.code", read_only=True)
    request_region = serializers.CharField(source="request.region", read_only=True)
    request_woreda = serializers.CharField(source="request.woreda", read_only=True)
    listing_product = serializers.CharField(source="listing.product.name", read_only=True)
    listing_region = serializers.CharField(source="listing.region", read_only=True)
    listing_woreda = serializers.CharField(source="listing.woreda", read_only=True)

    class Meta:
        model = MatchCandidate
        fields = [
            "id",
            "request_id",
            "request_status",
            "listing_id",
            "listing_product",
            "listing_region",
            "listing_woreda",
            "requested_product",
            "requested_category",
            "requested_quantity",
            "requested_unit",
            "request_region",
            "request_woreda",
            "rank",
            "status",
            "created_at",
        ]
        read_only_fields = fields
