# Business logic: Azmera account number generation and farmer registration.
from random import randint

from django.contrib.auth import get_user_model

from apps.accounts.models import Role
from apps.common.utils import normalize_phone

from .models import FarmerProfile, FarmerStatus

User = get_user_model()

AZMERA_NUMBER_PREFIX = "AZM"
AZMERA_NUMBER_DIGITS = 8


def generate_azmera_account_number():
    """Create a unique internal account number like 'AZM-51834207'.

    Random digits with a uniqueness retry loop - simple and testable.
    """
    while True:
        candidate = f"{AZMERA_NUMBER_PREFIX}-{randint(10**(AZMERA_NUMBER_DIGITS - 1), 10**AZMERA_NUMBER_DIGITS - 1)}"
        if not FarmerProfile.objects.filter(azmera_account_number=candidate).exists():
            return candidate


def register_farmer(
    *,
    agent,
    full_name,
    phone,
    fayda_fin=None,
    region,
    woreda,
    kebele="",
    farm_size_hectares,
    primary_crop,
    land_ownership,
    land_ownership_notes="",
    notes="",
):
    """Create a farmer's User row (unusable password - no web login) plus their
    FarmerProfile linked to the registering agent.

    Callers (serializers) validate phone/Fayda uniqueness and region before this runs.
    """
    user = User.objects.create_user(
        phone=normalize_phone(phone),
        full_name=full_name,
        role=Role.FARMER,
    )

    return FarmerProfile.objects.create(
        user=user,
        registered_by=agent,
        azmera_account_number=generate_azmera_account_number(),
        fayda_fin=fayda_fin,
        region=region,
        woreda=woreda,
        kebele=kebele,
        farm_size_hectares=farm_size_hectares,
        primary_crop=primary_crop,
        land_ownership=land_ownership,
        land_ownership_notes=land_ownership_notes,
        notes=notes,
        status=FarmerStatus.REGISTERED,
    )