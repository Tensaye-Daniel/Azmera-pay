from rest_framework import generics
from django.db.models import F

from apps.accounts.models import SupplierApprovalStatus
from apps.catalog.models import AvailabilityStatus
from apps.catalog.permissions import IsSupplier
from apps.requests.models import RequestKind, RequestStatus

from .models import CandidateStatus, MatchCandidate
from .serializers import SupplierMatchSerializer


class SupplierMatchListView(generics.ListAPIView):
    """List current incoming candidates for the authenticated supplier."""

    permission_classes = [IsSupplier]
    serializer_class = SupplierMatchSerializer
    pagination_class = None

    def get_queryset(self):
        return (
            MatchCandidate.objects.filter(
                listing__supplier=self.request.user,
                listing__supplier__supplier_approval_status=SupplierApprovalStatus.APPROVED,
                listing__availability_status=AvailabilityStatus.ACTIVE,
                listing__product__is_active=True,
                request__kind=RequestKind.INPUT,
                request__status__in=[RequestStatus.OPEN, RequestStatus.MATCHED],
                status=CandidateStatus.PENDING,
                line__product__category=F("listing__product__category"),
                line__unit_id=F("listing__unit_id"),
                line__quantity__lte=F("listing__available_quantity"),
                line__max_unit_price__gte=F("listing__unit_price"),
            )
            .select_related(
                "request",
                "line__product",
                "line__unit",
                "listing__product",
            )
            .order_by("-created_at", "rank")
        )
