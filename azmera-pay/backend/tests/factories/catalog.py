# Product, Unit, and Supplier Listing factories.
import factory
from decimal import Decimal

from apps.accounts.models import Role
from apps.catalog.models import (
    AvailabilityStatus,
    Product,
    ProductCategory,
    SupplierListing,
    Unit,
)
from tests.factories.accounts import UserFactory


class ProductFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Product

    name = factory.Sequence(lambda n: f"Test Product {n}")
    category = ProductCategory.SEED
    is_active = True


class UnitFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Unit

    name = factory.Sequence(lambda n: f"Test Unit {n}")
    code = factory.Sequence(lambda n: f"UNIT{n}")


class SupplierListingFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SupplierListing

    supplier = factory.SubFactory(UserFactory, role=Role.SUPPLIER)
    product = factory.SubFactory(ProductFactory)
    available_quantity = Decimal("100.00")
    unit = factory.SubFactory(UnitFactory)
    unit_price = Decimal("50.00")
    region = "Oromia"
    woreda = "Adama"
    availability_status = AvailabilityStatus.ACTIVE
    notes = ""