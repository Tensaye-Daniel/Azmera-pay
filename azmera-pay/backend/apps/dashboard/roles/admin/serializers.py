# Admin dashboard: user/farmer/supplier moderation.
from rest_framework import serializers

from apps.accounts.models import Role, SupplierApprovalStatus, SupplierProfile, User
from apps.profiles.models import FarmerProfile, FarmerStatus


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "phone",
            "email",
            "full_name",
            "role",
            "supplier_approval_status",
            "is_active",
            "is_staff",
        ]


class AdminSupplierSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(source="user.id", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    supplier_approval_status = serializers.CharField(
        source="user.supplier_approval_status", read_only=True
    )
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)

    class Meta:
        model = SupplierProfile
        fields = [
            "id",
            "user_id",
            "phone",
            "full_name",
            "email",
            "company_name",
            "tin_number",
            "region",
            "woreda",
            "product_categories",
            "supplier_approval_status",
            "is_active",
        ]


class AdminFarmerSerializer(serializers.ModelSerializer):
    user_id = serializers.UUIDField(source="user.id", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    is_active = serializers.BooleanField(source="user.is_active", read_only=True)
    registered_by_name = serializers.CharField(
        source="registered_by.full_name", read_only=True
    )
    registered_by_phone = serializers.CharField(
        source="registered_by.phone", read_only=True
    )

    class Meta:
        model = FarmerProfile
        fields = [
            "id",
            "user_id",
            "azmera_account_number",
            "full_name",
            "phone",
            "email",
            "gender",
            "region",
            "woreda",
            "kebele",
            "farm_size_hectares",
            "primary_crop",
            "land_ownership",
            "land_ownership_notes",
            "fayda_fin",
            "status",
            "notes",
            "registered_by_name",
            "registered_by_phone",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["azmera_account_number", "created_at", "updated_at"]


class UserStatusSerializer(serializers.Serializer):
    is_active = serializers.BooleanField(required=False)
    role = serializers.ChoiceField(choices=Role.choices, required=False)
    supplier_approval_status = serializers.ChoiceField(
        choices=SupplierApprovalStatus.choices, required=False
    )

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError("Provide at least one field to update.")
        return attrs


class FarmerStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=FarmerStatus.choices)
