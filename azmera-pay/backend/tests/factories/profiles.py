# FarmerProfile factory.
from decimal import Decimal

import factory

from apps.accounts.models import Role
from apps.profiles.models import FarmerProfile, Gender, LandOwnership

from .accounts import UserFactory


class FarmerProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = FarmerProfile

    user = factory.SubFactory(UserFactory, role=Role.FARMER)
    registered_by = factory.SubFactory(UserFactory, role=Role.AGENT)
    azmera_account_number = factory.Sequence(lambda n: f"AZM-{10000000 + n}")
    fayda_fin = None
    gender = Gender.MALE
    region = "Oromia"
    woreda = "Adama"
    kebele = "Kebele 01"
    farm_size_hectares = Decimal("2.50")
    primary_crop = "Tef"
    land_ownership = LandOwnership.OWNED
    land_ownership_notes = ""
    notes = ""