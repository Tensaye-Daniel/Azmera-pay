# Role-profile serializers. Farmer read/detail output lives here; the
# registration input serializer lives in dashboard/roles/agent (where the
# endpoint lives).
from rest_framework import serializers

from .models import FarmerProfile


class FarmerProfileSerializer(serializers.ModelSerializer):
    """Read/write shape for a FarmerProfile (detail + list views)."""

    user_id = serializers.UUIDField(source="user.id", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    registered_by_id = serializers.UUIDField(source="registered_by.id", read_only=True)

    class Meta:
        model = FarmerProfile
        fields = [
            "id",
            "user_id",
            "full_name",
            "phone",
            "azmera_account_number",
            "fayda_fin",
            "gender",
            "region",
            "woreda",
            "kebele",
            "farm_size_hectares",
            "primary_crop",
            "land_ownership",
            "land_ownership_notes",
            "notes",
            "status",
            "registered_by_id",
            "created_at",
            "updated_at",
        ]