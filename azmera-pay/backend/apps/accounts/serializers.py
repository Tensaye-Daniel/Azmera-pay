# Login / me / registration serializers. simplejwt's default obtain serializer
# already treats USERNAME_FIELD ('phone') as the login identifier, so no custom
# login serializer is needed.
from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError
from rest_framework import serializers

from apps.common.utils import normalize_phone

from .models import Role

User = get_user_model()


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "phone", "email", "full_name", "role"]


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