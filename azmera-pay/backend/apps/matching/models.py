# Immutable snapshot of a listing ranked against a request line. Re-running a
# match replaces the snapshot for that request so results stay reproducible.
from django.db import models

from apps.common.models import TimeStampedModel, UUIDModel


class CandidateStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    ACCEPTED = "accepted", "Accepted"
    REJECTED = "rejected", "Rejected"


class MatchCandidate(UUIDModel, TimeStampedModel):
    request = models.ForeignKey(
        "requests.Request",
        on_delete=models.CASCADE,
        related_name="candidates",
    )
    line = models.ForeignKey(
        "requests.RequestLine",
        on_delete=models.CASCADE,
        related_name="candidates",
    )
    listing = models.ForeignKey(
        "catalog.SupplierListing",
        on_delete=models.PROTECT,
        related_name="match_candidates",
    )
    rank = models.PositiveIntegerField(default=0)
    location_match = models.CharField(max_length=20)
    score = models.DecimalField(max_digits=8, decimal_places=2)
    reasons = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=16,
        choices=CandidateStatus.choices,
        default=CandidateStatus.PENDING,
    )

    class Meta:
        ordering = ["rank", "-score"]
        constraints = [
            models.UniqueConstraint(
                fields=["line", "listing"],
                name="unique_candidate_per_line_listing",
            )
        ]

    def __str__(self):
        return f"{self.request} -> {self.listing} (#{self.rank})"
