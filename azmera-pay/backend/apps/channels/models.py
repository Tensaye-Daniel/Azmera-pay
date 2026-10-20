# USSD session persistence. The gateway sends a fresh HTTP request per screen,
# so we key everything on the provider's sessionId and keep a per-session trace.
from django.db import models

from apps.common.models import TimeStampedModel, UUIDModel


class USSDSessionStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    COMPLETED = "completed", "Completed"
    EXPIRED = "expired", "Expired"


class USSDSession(UUIDModel, TimeStampedModel):
    """One row per dial-in, identified by the gateway's sessionId."""

    session_id = models.CharField(max_length=120, unique=True)
    phone = models.CharField(max_length=20, db_index=True)
    service_code = models.CharField(max_length=40, blank=True)
    farmer = models.ForeignKey(
        "profiles.FarmerProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ussd_sessions",
        help_text="Resolved from the dialling phone number on first request.",
    )
    status = models.CharField(
        max_length=16,
        choices=USSDSessionStatus.choices,
        default=USSDSessionStatus.ACTIVE,
    )
    # Menu state: current step id and answers collected so far.
    state = models.JSONField(default=dict, blank=True)
    last_text = models.CharField(max_length=600, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.session_id} ({self.phone})"


class USSDInteraction(TimeStampedModel):
    """Append-only log of one request/response pair inside a session."""

    session = models.ForeignKey(
        USSDSession,
        on_delete=models.CASCADE,
        related_name="interactions",
    )
    inbound_text = models.CharField(max_length=600)
    outbound_text = models.TextField()

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.session.phone}: {self.inbound_text!r}"
