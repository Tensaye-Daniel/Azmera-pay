# Agent dashboard serializers: farmer registration (input) and update.
import re

from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import serializers

from apps.common.utils import REGISTRATION_CONFLICT_MESSAGE, normalize_phone
from apps.profiles.models import (
    FAYDA_FIN_PATTERN,
    FarmerDocumentType,
    FarmerProfile,
    Gender,
    LandOwnership,
)
from apps.profiles.serializers import FarmerProfileSerializer
from apps.profiles.services import (
    DocumentValidationError,
    register_farmer,
    store_farmer_document,
)
from core.matching.constants import ETHIOPIAN_REGIONS, canonical_region

User = get_user_model()

DOCUMENT_FIELDS = (
    "farmer_id",
    "field_photo",
    "farming_proof",
)


class FarmerRegistrationSerializer(serializers.Serializer):
    """Validates the agent's farmer registration form and creates User+FarmerProfile.

    Rejects duplicate phone numbers and duplicate (or malformed) Fayda FINs.
    """

    full_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20)
    fayda_fin = serializers.CharField(max_length=15, required=False, allow_blank=True)
    gender = serializers.ChoiceField(
        choices=Gender.choices, required=False, allow_blank=True
    )
    region = serializers.CharField(max_length=64)
    woreda = serializers.CharField(max_length=128)
    kebele = serializers.CharField(max_length=128, required=False, allow_blank=True)
    farm_size_hectares = serializers.DecimalField(max_digits=9, decimal_places=2, min_value=0)
    primary_crop = serializers.CharField(max_length=128)
    land_ownership = serializers.ChoiceField(choices=LandOwnership.choices)
    land_ownership_notes = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    farmer_id = serializers.FileField(required=False, write_only=True)
    field_photo = serializers.FileField(required=False, write_only=True)
    farming_proof = serializers.FileField(required=False, write_only=True)

    def validate_phone(self, value):
        try:
            return normalize_phone(value)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc

    def validate_fayda_fin(self, value):
        value = (value or "").strip()
        if not value:
            return None
        if not re.fullmatch(FAYDA_FIN_PATTERN, value):
            raise serializers.ValidationError("Fayda FIN must be a 15-digit number.")
        return value

    def validate(self, attrs):
        phone_exists = User.objects.filter(phone=attrs["phone"]).exists()
        fayda_fin = attrs.get("fayda_fin")
        fayda_exists = bool(fayda_fin) and FarmerProfile.objects.filter(
            fayda_fin=fayda_fin
        ).exists()
        if phone_exists or fayda_exists:
            raise serializers.ValidationError(REGISTRATION_CONFLICT_MESSAGE)
        return attrs

    def validate_region(self, value):
        canonical = canonical_region(value)
        if canonical is None:
            raise serializers.ValidationError(
                f"Unknown region. Choose one of: {', '.join(ETHIOPIAN_REGIONS)}"
            )
        return canonical

    def create(self, validated_data):
        uploads = {
            field: validated_data.pop(field)
            for field in DOCUMENT_FIELDS
            if field in validated_data
        }
        agent = self.context["request"].user

        with transaction.atomic():
            farmer = register_farmer(agent=agent, **validated_data)
            for field, uploaded_file in uploads.items():
                try:
                    store_farmer_document(
                        farmer=farmer,
                        document_type=FarmerDocumentType(field),
                        uploaded_file=uploaded_file,
                        uploaded_by=agent,
                    )
                except DocumentValidationError as exc:
                    raise serializers.ValidationError({field: [str(exc)]}) from exc

        return farmer


class FarmerUpdateSerializer(FarmerProfileSerializer):
    """Partial updates on a farmer. Phone/fayda edits go through the same guards."""

    full_name = serializers.CharField(max_length=150, required=False)
    phone = serializers.CharField(required=False)
    fayda_fin = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_phone(self, value):
        try:
            return normalize_phone(value)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc

    def validate_fayda_fin(self, value):
        value = (value or "").strip()
        if not value:
            return None
        if not re.fullmatch(FAYDA_FIN_PATTERN, value):
            raise serializers.ValidationError("Fayda FIN must be a 15-digit number.")
        return value

    def validate(self, attrs):
        phone = attrs.get("phone")
        phone_exists = bool(phone) and User.objects.filter(
            phone=phone
        ).exclude(pk=self.instance.user_id).exists()
        fayda_fin = attrs.get("fayda_fin")
        fayda_exists = bool(fayda_fin) and FarmerProfile.objects.filter(
            fayda_fin=fayda_fin
        ).exclude(pk=self.instance.pk).exists()
        if phone_exists or fayda_exists:
            raise serializers.ValidationError(REGISTRATION_CONFLICT_MESSAGE)
        return attrs

    def validate_region(self, value):
        canonical = canonical_region(value)
        if canonical is None:
            raise serializers.ValidationError(f"Unknown region. Choose one of: {', '.join(ETHIOPIAN_REGIONS)}")
        return canonical

    def update(self, instance, validated_data):
        user_fields = {}
        for field in ("full_name", "phone"):
            if field in validated_data:
                user_fields[field] = validated_data.pop(field)
        if user_fields:
            user = instance.user
            for field, value in user_fields.items():
                setattr(user, field, value)
            user.save()
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance
