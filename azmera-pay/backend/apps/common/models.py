# Shared abstract base models: UUID pk + created/updated timestamps
import uuid

from django.db import models


class UUIDModel(models.Model):
    """Abstract base with a UUID primary key (collision-safe, hides row counts)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True


class TimeStampedModel(models.Model):
    """Abstract base with created_at / updated_at timestamps."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True