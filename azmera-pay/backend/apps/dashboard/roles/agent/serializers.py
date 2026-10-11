# Agent dashboard serializers: farmer registration (input) and update.
import re

from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.common.utils import normalize_phone
from apps.profiles.models import FAYDA_FIN_PATTERN, FarmerProfile, LandOwnership
from apps.profiles.serializers import FarmerProfileSerializer
from apps.profiles.services import register_farmer
from core.matching.constants import ETHIOPIAN_REGIONS, canonical_region

User = get_user_model()


class FarmerRegistrationSerializer(serializers.Serializer):
    """Validates the agent's farmer registration form and creates User+FarmerProfile.

    Rejects duplicate phone numbers and duplicate (or malformed) Fayda FINs.
    """

    full_name = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20)
    fayda_fin = serializers.CharField(max_length=15, required=False, allow_blank=True)
    region = serializers.CharField(max_length=64)
    woreda = serializers.CharField(max_length=128)
    kebele = serializers.CharField(max_length=128, required=False, allow_blank=True)
    farm_size_hectares = serializers.DecimalField(max_digits=9, decimal_places=2, min_value=0)
    primary_crop = serializers.CharField(max_length=128)
    land_ownership = serializers.ChoiceField(choices=LandOwnership.choices)
    land_ownership_notes = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate_phone(self, value):
        try:
            phone = normalize_phone(value)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc
        if User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return phone

    def validate_fayda_fin(self, value):
        value = (value or "").strip()
        if not value:
            return None
        if not re.fullmatch(FAYDA_FIN_PATTERN, value):
            raise serializers.ValidationError("Fayda FIN must be a 15-digit number.")
        if FarmerProfile.objects.filter(fayda_fin=value).exists():
            raise serializers.ValidationError("A farmer with this Fayda FIN already exists.")
        return value

    def validate_region(self, value):
        canonical = canonical_region(value)
        if canonical is None:
            raise serializers.ValidationError(
                f"Unknown region. Choose one of: {', '.join(ETHIOPIAN_REGIONS)}"
            )
        return canonical

    def create(self, validated_data):
        return register_farmer(agent=self.context["request"].user, **validated_data)


class FarmerUpdateSerializer(FarmerProfileSerializer):
    """Partial updates on a farmer. Phone/fayda edits go through the same guards."""

    full_name = serializers.CharField(max_length=150, required=False)
    phone = serializers.CharField(required=False)
    fayda_fin = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_phone(self, value):
        try:
            phone = normalize_phone(value)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc
        qs = User.objects.filter(phone=phone).exclude(pk=self.instance.user_id)
        if qs.exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return phone

    def validate_fayda_fin(self, value):
        value = (value or "").strip()
        if not value:
            return None
        if not re.fullmatch(FAYDA_FIN_PATTERN, value):
            raise serializers.ValidationError("Fayda FIN must be a 15-digit number.")
        qs = FarmerProfile.objects.filter(fayda_fin=value).exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A farmer with this Fayda FIN already exists.")
        return value

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