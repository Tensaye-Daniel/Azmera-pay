# Category, Product, Unit, Availability

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
