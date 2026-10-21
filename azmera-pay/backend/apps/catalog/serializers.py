# Product / Availability serializers
from rest_framework import serializers

from core.matching.constants import canonical_region

from .models import AvailabilityStatus, Product, ProductCategory, SupplierListing, Unit


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
    product_category = serializers.CharField(source="product.category", read_only=True)
    name = serializers.CharField(write_only=True, required=False, max_length=100)
    category = serializers.ChoiceField(
        choices=ProductCategory.choices, write_only=True, required=False
    )
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), required=False
    )
    unit_code = serializers.CharField(source="unit.code", read_only=True)

    def validate_availability_status(self, value):
        """Accept the three current states; preserve unchanged legacy values."""
        if value == AvailabilityStatus.EXPIRED:
            if not self.instance or self.instance.availability_status != value:
                raise serializers.ValidationError(
                    "Choose Active, Paused, or Inactive for a listing."
                )
        elif value not in {
            AvailabilityStatus.ACTIVE,
            AvailabilityStatus.PAUSED,
            AvailabilityStatus.INACTIVE,
        }:
            raise serializers.ValidationError("Choose a valid listing status.")
        return value

    class Meta:
        model = SupplierListing
        # "supplier" is deliberately NOT a field: a client can never choose the owner.
        # The view sets it from the logged-in user.
        fields = [
            "id", "product", "product_name", "product_category", "name", "category", "available_quantity", "unit", "unit_code",
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
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and user.is_authenticated:
            from apps.accounts.models import Role

            if user.role == Role.SUPPLIER:
                existing_listing = self.instance
                # Existing listings remain editable after a category is removed
                # from Shop Setup, but suppliers cannot create or switch to it.
                if (
                    existing_listing is None
                    or existing_listing.product_id != product.id
                ):
                    try:
                        allowed_categories = user.supplier_profile.product_categories
                    except AttributeError:
                        allowed_categories = []
                    if product.category not in allowed_categories:
                        raise serializers.ValidationError(
                            "This product category is not enabled in your Shop Setup."
                        )
        return product

    def validate(self, attrs):
        name = attrs.get("name")
        category = attrs.get("category")
        product = attrs.get("product")
        if name is not None:
            name = name.strip()
            if not name:
                raise serializers.ValidationError({"name": "Enter a product name."})
            attrs["name"] = name
            if category is None and product is None:
                raise serializers.ValidationError(
                    {"category": "Choose a category for this product."}
                )
        elif category is not None and product is None:
            raise serializers.ValidationError(
                {"name": "Enter a product name for the selected category."}
            )
        elif category is not None and product is not None and category != product.category:
            raise serializers.ValidationError(
                {"category": "The category must match the selected product."}
            )
        request = self.context.get("request")
        user = getattr(request, "user", None)
        if user and getattr(user, "role", None) == "supplier":
            target_category = category or (product.category if product else None)
            existing_category = (
                self.instance.product.category if self.instance else None
            )
            category_is_changing = (
                target_category is not None
                and (self.instance is None or target_category != existing_category)
            )
            if category_is_changing:
                try:
                    allowed_categories = user.supplier_profile.product_categories
                except AttributeError:
                    allowed_categories = []
                if target_category not in allowed_categories:
                    raise serializers.ValidationError(
                        {"category": "This category is not enabled in your Shop Setup."}
                    )
        return attrs

    def create(self, validated_data):
        name = validated_data.pop("name", None)
        category = validated_data.pop("category", None)
        if name is not None:
            product, _ = Product.objects.get_or_create(
                name=name,
                category=category or validated_data["product"].category,
                defaults={"is_active": True},
            )
            if not product.is_active:
                raise serializers.ValidationError({"name": "This product is not active."})
            validated_data["product"] = product
        return super().create(validated_data)

    def update(self, instance, validated_data):
        name = validated_data.pop("name", None)
        category = validated_data.pop("category", None)
        product = validated_data.get("product", instance.product)
        if name is not None:
            product, _ = Product.objects.get_or_create(
                name=name,
                category=category or product.category,
                defaults={"is_active": True},
            )
            if not product.is_active:
                raise serializers.ValidationError({"name": "This product is not active."})
            validated_data["product"] = product
        return super().update(instance, validated_data)
