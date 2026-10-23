# Request/RequestLine factories.
from decimal import Decimal

import factory

from apps.accounts.models import Role
from apps.requests.models import Request, RequestKind, RequestLine, RequestSource
from tests.factories.accounts import UserFactory
from tests.factories.catalog import ProductFactory, UnitFactory


class RequestFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Request

    owner = factory.SubFactory(UserFactory, role=Role.FARMER)
    kind = RequestKind.INPUT
    region = "Oromia"
    woreda = "Adama"
    source = RequestSource.WEB


class RequestLineFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = RequestLine

    request = factory.SubFactory(RequestFactory)
    product = factory.SubFactory(ProductFactory)
    unit = factory.SubFactory(UnitFactory)
    quantity = Decimal("10.00")
    max_unit_price = Decimal("100.00")
