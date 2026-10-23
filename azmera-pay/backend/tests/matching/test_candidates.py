from decimal import Decimal

import pytest

from apps.matching.services import run_request_matching
from apps.requests.models import RequestStatus
from tests.factories.catalog import SupplierListingFactory
from tests.factories.requests import RequestLineFactory

pytestmark = pytest.mark.django_db


def test_matching_persists_ranked_candidates_and_marks_request():
    line = RequestLineFactory(
        quantity=Decimal("10.00"), max_unit_price=Decimal("100.00")
    )
    cheap = SupplierListingFactory(
        product=line.product,
        unit=line.unit,
        unit_price=Decimal("40.00"),
        available_quantity=Decimal("100.00"),
    )
    pricey = SupplierListingFactory(
        product=line.product,
        unit=line.unit,
        unit_price=Decimal("80.00"),
        available_quantity=Decimal("100.00"),
    )

    candidates = run_request_matching(line.request)

    assert [candidate.listing_id for candidate in candidates] == [cheap.id, pricey.id]
    assert [candidate.rank for candidate in candidates] == [1, 2]
    assert line.request.status == RequestStatus.MATCHED


def test_rerunning_matching_replaces_the_snapshot():
    line = RequestLineFactory()
    listing = SupplierListingFactory(
        product=line.product,
        unit=line.unit,
        unit_price=Decimal("40.00"),
    )
    run_request_matching(line.request)

    listing.unit_price = Decimal("30.00")
    listing.save(update_fields=["unit_price"])
    candidates = run_request_matching(line.request)

    assert len(candidates) == 1
    assert line.request.candidates.count() == 1
    assert candidates[0].listing_id == listing.id


def test_matching_without_eligible_listings_keeps_request_open():
    line = RequestLineFactory()

    assert run_request_matching(line.request) == []
    assert line.request.status == RequestStatus.OPEN
