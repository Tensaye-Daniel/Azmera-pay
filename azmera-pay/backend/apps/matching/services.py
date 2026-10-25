# Persist ranked matching results for a saved request. The pure engine lives in
# core/matching; this module is the only place that touches request rows.
from django.db import transaction

from apps.requests.models import Request, RequestStatus
from core.matching.engine import RequestData
from core.matching.service import find_listing_matches

from .models import MatchCandidate


def _request_data(line, request):
    return RequestData(
        product_id=line.product_id,
        product_category=line.product.category,
        unit_id=line.unit_id,
        quantity=line.quantity,
        max_unit_price=line.max_unit_price,
        region=request.region,
        woreda=request.woreda,
        product_is_active=line.product.is_active,
    )


def run_request_matching(request: Request) -> list[MatchCandidate]:
    """Replace the request's candidate snapshot with a fresh ranked match run."""
    candidates = []

    with transaction.atomic():
        request.candidates.all().delete()

        rank = 0
        for line in request.lines.select_related("product", "unit"):
            for result in find_listing_matches(_request_data(line, request)):
                rank += 1
                candidates.append(
                    MatchCandidate.objects.create(
                        request=request,
                        line=line,
                        listing_id=result.listing_id,
                        rank=rank,
                        location_match=result.location_match,
                        score=result.score,
                        reasons=result.reasons,
                    )
                )

        status = RequestStatus.MATCHED if candidates else RequestStatus.OPEN
        if request.status != status:
            request.status = status
            request.save(update_fields=["status", "updated_at"])

    return candidates
