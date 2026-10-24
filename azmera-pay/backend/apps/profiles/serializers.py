# Role-profile serializers. Farmer read/detail output lives here; the
# registration input serializer lives in dashboard/roles/agent (where the
# endpoint lives).
from rest_framework import serializers

from .models import FarmerDocument, FarmerProfile


class FarmerDocumentSerializer(serializers.ModelSerializer):
    """Metadata for an encrypted farmer document (never the ciphertext)."""

    document_type_display = serializers.CharField(
        source="get_document_type_display", read_only=True
    )

    class Meta:
        model = FarmerDocument
        fields = [
            "id",
            "document_type",
            "document_type_display",
            "original_filename",
            "content_type",
            "size_bytes",
            "checksum",
            "created_at",
        ]
        read_only_fields = fields


class FarmerProfileSerializer(serializers.ModelSerializer):
    """Read/write shape for a FarmerProfile (detail + list views)."""

    user_id = serializers.UUIDField(source="user.id", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    phone = serializers.CharField(source="user.phone", read_only=True)
    registered_by_id = serializers.UUIDField(source="registered_by.id", read_only=True)
    documents = FarmerDocumentSerializer(many=True, read_only=True)

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
            "documents",
            "created_at",
            "updated_at",
        ]
