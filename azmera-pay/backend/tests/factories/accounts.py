# User + role factories for tests.
import factory
from django.contrib.auth import get_user_model

from apps.accounts.models import Role

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    """Generic user factory (farmers have no usable password; that is fine)."""

    class Meta:
        model = User
        django_get_or_create = ("phone",)

    phone = factory.Sequence(lambda n: f"+2519{10000000 + n}")
    full_name = factory.Faker("name")
    role = Role.FARMER
    is_active = True


def create_web_user(phone, role, password="testpass123", full_name="Test User"):
    """Create a user that can actually authenticate (agents/admins)."""
    return User.objects.create_user(
        phone=phone,
        password=password,
        full_name=full_name,
        role=role,
    )
