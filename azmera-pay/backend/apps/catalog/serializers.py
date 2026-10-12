# Product / Availability serializers
from rest_framework import serializers

from core.matching.constants import canonical_region

from .models import Product, SupplierListing, Unit


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "category"]


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = ["id", "name", "code"]


class SupplierListingSerializer(serializers.ModelSerializer):
    # Read-only helpers so the frontend can show names without extra requests.
    product_name = serializers.CharField(source="product.name", read_only=True)
    unit_code = serializers.CharField(source="unit.code", read_only=True)

    class Meta:
        model = SupplierListing
        # "supplier" is deliberately NOT a field: a client can never choose the owner.
        # The view sets it from the logged-in user.
        fields = [
            "id", "product", "product_name", "available_quantity", "unit", "unit_code",
            "unit_price", "region", "woreda", "availability_status", "notes",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_region(self, value):
        """Store the official region name, so 'Oromiya' and 'Oromia' become one value."""
        region = canonical_region(value)
        if region is None:
            raise serializers.ValidationError(
                  "Region is not an allowed Ethiopian region."
              )
        return region

    def validate_product(self, product):
        if not product.is_active:
            raise serializers.ValidationError("This product is not active.")
        return product