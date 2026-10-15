# Login / me / registration serializers. simplejwt's default obtain serializer
# already treats USERNAME_FIELD ('phone') as the login identifier, so no custom
# login serializer is needed.
from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
)

from apps.catalog.models import ProductCategory
from apps.common.utils import normalize_phone

from .models import Role, SupplierApprovalStatus, SupplierProfile

User = get_user_model()


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "phone", "email", "full_name", "role", "supplier_approval_status"]


class AgentRegisterSerializer(serializers.ModelSerializer):
    """Self-service agent signup.

    Anyone with a phone can create an agent account. The role is always AGENT
    regardless of what the client sends. Passwords use Django's validators.
    """

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
    )

    class Meta:
        model = User
        fields = ["id", "full_name", "phone", "email", "password"]
        read_only_fields = ["id"]

    def validate_phone(self, value):
        try:
            phone = normalize_phone(value)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc
        if User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError(
                "A user with this phone number already exists."
            )
        return phone

    def validate_email(self, value):
        return (value or "").strip() or None

    def validate_password(self, value):
        try:
            password_validation.validate_password(value)
        except ValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        return User.objects.create_user(
            role=Role.AGENT,
            password=password,
            **validated_data,
        )

class SupplierRegisterSerializer(serializers.ModelSerializer):
    """Register a supplier who must be approved by an admin."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        trim_whitespace=False,
    )
    tin_number = serializers.CharField(
        write_only=True,
        max_length=100,
    )
    company_name = serializers.CharField(
        max_length=200,
    )

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "phone",
            "email",
            "password",
            "tin_number",
            "company_name",
        ]
        read_only_fields = ["id"]

    def validate_phone(self, value):
        try:
            phone = normalize_phone(value)
        except ValueError as exc:
            raise serializers.ValidationError(str(exc)) from exc

        if User.objects.filter(phone=phone).exists():
            raise serializers.ValidationError(
                "A user with this phone number already exists."
            )

        return phone

    def validate_email(self, value):
        return (value or "").strip() or None

    def validate_password(self, value):
        try:
            password_validation.validate_password(value)
        except ValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc

        return value

    def validate_tin_number(self, value):
        value = value.strip()

        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError(
                "TIN must contain exactly 10 numeric digits."
            )

        if SupplierProfile.objects.filter(tin_number=value).exists():
            raise serializers.ValidationError(
                "This TIN number is already registered."
            )

        return value

    def validate_company_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "Shop/company name is required."
            )
        return value

    def create(self, validated_data):
        tin_number = validated_data.pop("tin_number")
        company_name = validated_data.pop("company_name")
        password = validated_data.pop("password")

        from django.db import transaction

        with transaction.atomic():
            user = User.objects.create_user(
                role=Role.SUPPLIER,
                supplier_approval_status=SupplierApprovalStatus.PENDING,
                password=password,
                **validated_data,
            )

            SupplierProfile.objects.create(
                user=user,
                tin_number=tin_number,
                company_name=company_name,
            )

        return user
    def to_representation(self, instance):
        return {
            "id": str(instance.id),
            "full_name": instance.full_name,
            "phone": instance.phone,
            "email": instance.email,
            "role": instance.role,
            "supplier_approval_status": instance.supplier_approval_status,
            "message": (
                "Your registration has been submitted successfully and is "
                "awaiting admin review. Please check your account for the "
                "decision. Once approved, you can log in to complete your "
                "shop setup."
            ),
        }


class SupplierApprovalTokenSerializer(TokenObtainPairSerializer):
    """Issue tokens only when a supplier has admin approval."""

    def validate(self, attrs):
        data = super().validate(attrs)

        if (
            self.user.role == Role.SUPPLIER
            and self.user.supplier_approval_status
            != SupplierApprovalStatus.APPROVED
        ):
            raise serializers.ValidationError(
                "Your supplier account is awaiting admin approval."
                if self.user.supplier_approval_status
                == SupplierApprovalStatus.PENDING
                else "Your supplier account has not been approved."
            )

        return data
class SupplierApprovalTokenRefreshSerializer(TokenRefreshSerializer):
    """Prevent unapproved suppliers from refreshing their tokens."""

    def validate(self, attrs):
        from apps.accounts.models import User

        try:
            refresh = self.token_class(attrs["refresh"])
            user_id = refresh.get("user_id")
            user = User.objects.get(id=user_id)
        except (TokenError, User.DoesNotExist, KeyError, TypeError, ValueError) as exc:
            raise InvalidToken("Invalid or expired refresh token.") from exc

        if (
            user.role == Role.SUPPLIER
            and user.supplier_approval_status
            != SupplierApprovalStatus.APPROVED
        ):
            raise InvalidToken(
                "Your supplier account is not approved to access the dashboard."
            )

        return super().validate(attrs)


class SupplierProfileSerializer(serializers.ModelSerializer):
    """Read and update the authenticated supplier's shop information."""

    product_categories = serializers.ListField(
        child=serializers.ChoiceField(choices=ProductCategory.choices),
        allow_empty=True,
    )

    class Meta:
        model = SupplierProfile
        fields = [
            "company_name",
            "region",
            "woreda",
            "product_categories",
        ]
        read_only_fields = ["company_name"]

    def validate_region(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Region is required.")
        return value

    def validate_woreda(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Woreda is required.")
        return value

    def validate_product_categories(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError(
                "Each product category can only be selected once."
            )
        return value

    def validate(self, attrs):
        setup_fields = {"region", "woreda", "product_categories"}
        if setup_fields.intersection(attrs):
            region = attrs.get("region", self.instance.region).strip()
            woreda = attrs.get("woreda", self.instance.woreda).strip()
            categories = attrs.get(
                "product_categories", self.instance.product_categories
            )
            errors = {}
            if not region:
                errors["region"] = "Region is required."
            if not woreda:
                errors["woreda"] = "Woreda is required."
            if not categories:
                errors["product_categories"] = (
                    "Select at least one product category."
                )
            if errors:
                raise serializers.ValidationError(errors)
        return attrs
