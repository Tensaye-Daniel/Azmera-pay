# Login / me serializers. simplejwt's default obtain serializer already treats
# USERNAME_FIELD ('phone') as the login identifier, so no custom login serializer
# is needed.
from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "phone", "email", "full_name", "role"]