# User model - phone is the login identifier. Farmers get a User row but no
# usable password (USSD login is the phone number; there is no farmer web login).
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models


class Role(models.TextChoices):
    AGENT = "agent", "Agent"
    FARMER = "farmer", "Farmer"
    SUPPLIER = "supplier", "Supplier"
    BUYER = "buyer", "Buyer"
    ADMIN = "admin", "Admin"


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError("phone is required")
        user = self.model(phone=phone, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_user(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(phone, password, **extra_fields)

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", Role.ADMIN)
        return self._create_user(phone, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Azmera user. `phone` is the unique identifier used for both web and USSD."""

    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(blank=True, null=True)
    full_name = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.FARMER)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["full_name", "role"]

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return f"{self.full_name} ({self.phone})"

    @property
    def is_agent(self):
        return self.role == Role.AGENT

    @property
    def is_admin(self):
        return self.role == Role.ADMIN

    @property
    def can_use_web(self):
        return self.role in (Role.AGENT, Role.ADMIN, Role.SUPPLIER, Role.BUYER)