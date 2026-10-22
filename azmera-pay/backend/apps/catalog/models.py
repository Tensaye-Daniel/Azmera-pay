# Category, Products(inputs and crops) and measurement Unit

from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from apps.common.models import TimeStampedModel, UUIDModel


class ProductCategory(models.TextChoices):
    CROP = "crop", "Crop"
    SEED = "seed", "Seed"
    FERTILIZER = "fertilizer", "Fertilizer"
    PESTICIDE = "pesticide", "Pesticide"
    OTHER = "other", "Other"


class Product(UUIDModel, TimeStampedModel):
    name = models.CharField(max_length=100)
    category = models.CharField(
        max_length=20,
        choices=ProductCategory.choices,
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["name", "category"],
                name="unique_product_name_category",
            )
        ]

    def __str__(self):
        return self.name


class Unit(UUIDModel, TimeStampedModel):
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=20, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.code})"

class AvailabilityStatus(models.TextChoices):
    ACTIVE = "active","Active"
    PAUSED = "paused","Paused"
    INACTIVE = "inactive","Inactive"
    # Keep the stored value available for legacy listings and API clients.
    EXPIRED = "expired","Expired"

class SupplierListing(UUIDModel, TimeStampedModel):
    supplier = models.ForeignKey(
      settings.AUTH_USER_MODEL,
      on_delete = models.PROTECT,
      related_name="listings",
    )
    product = models.ForeignKey(Product, on_delete=models.PROTECT,related_name="listings")
    available_quantity = models.DecimalField(
      max_digits=12,
      decimal_places=2,
      validators=[MinValueValidator(Decimal("0.01"))],
    )
    unit=models.ForeignKey(Unit, on_delete=models.PROTECT, related_name="listings")
    unit_price=models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    region = models.CharField(max_length=100)
    woreda = models.CharField(max_length=100)
    availability_status = models.CharField(
        max_length=10,
        choices=AvailabilityStatus.choices,
        default=AvailabilityStatus.ACTIVE,
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering=["-created_at"]
        constraints = [
            models.CheckConstraint(
                condition = models.Q(available_quantity__gt=0),
                name="listing_available_quantity_gt_zero",
            )
        ]
    def __str__(self):
      return f"{self.product} ({self.availability_status})"
