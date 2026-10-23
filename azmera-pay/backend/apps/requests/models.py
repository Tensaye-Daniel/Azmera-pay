# Farmer INPUT requests (seeds/fertilizer/pesticides) and buyer PRODUCE requests.
# Both share Request + RequestLine so one matching engine serves either kind.
from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models

from apps.catalog.models import Product, Unit
from apps.common.models import TimeStampedModel, UUIDModel


class RequestKind(models.TextChoices):
    INPUT = "input", "Input"
    PRODUCE = "produce", "Produce"


class RequestStatus(models.TextChoices):
    OPEN = "open", "Open"
    MATCHED = "matched", "Matched"
    CANCELLED = "cancelled", "Cancelled"
    CLOSED = "closed", "Closed"


class RequestSource(models.TextChoices):
    WEB = "web", "Web"
    USSD = "ussd", "USSD"


class Request(UUIDModel, TimeStampedModel):
    """A farmer's input request or a buyer's produce request."""

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="requests",
    )
    kind = models.CharField(max_length=16, choices=RequestKind.choices)
    status = models.CharField(
        max_length=16,
        choices=RequestStatus.choices,
        default=RequestStatus.OPEN,
    )
    region = models.CharField(max_length=64, blank=True)
    woreda = models.CharField(max_length=128, blank=True)
    amount = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Total amount offered for a produce request.",
    )
    source = models.CharField(
        max_length=16,
        choices=RequestSource.choices,
        default=RequestSource.WEB,
    )
    source_reference = models.CharField(
        max_length=120,
        unique=True,
        null=True,
        blank=True,
        help_text="Gateway session id, used to keep webhook retries idempotent.",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.kind} request by {self.owner} ({self.status})"


class RequestLine(UUIDModel, TimeStampedModel):
    """One product line inside a request."""

    request = models.ForeignKey(
        Request,
        on_delete=models.CASCADE,
        related_name="lines",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="request_lines",
    )
    unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        related_name="request_lines",
    )
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    max_unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    max_distance_km = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.quantity} {self.unit.code} of {self.product}"
