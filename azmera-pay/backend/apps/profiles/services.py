# Business logic: Azmera account number generation and farmer registration.
from random import randint

from django.contrib.auth import get_user_model

from apps.accounts.models import Role
from apps.common.utils import normalize_phone

from .documents import (
    allowed_document_types,
    checksum,
    encrypt_document,
    max_document_bytes,
)
from .models import FarmerDocument, FarmerProfile, FarmerStatus

User = get_user_model()


class DocumentValidationError(ValueError):
    """Raised when an uploaded farmer document fails local validation."""

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
    gender="",
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
        gender=gender,
        region=region,
        woreda=woreda,
        kebele=kebele,
        farm_size_hectares=farm_size_hectares,
        primary_crop=primary_crop,
        land_ownership=land_ownership,
        land_ownership_notes=land_ownership_notes,
        notes=notes,
        status=FarmerStatus.PENDING,
    )


def store_farmer_document(*, farmer, document_type, uploaded_file, uploaded_by=None):
    """Validate, encrypt, and persist a single farmer document.

    The plaintext is never written to storage. Only the Fernet token is saved,
    alongside metadata used for review and integrity checks.
    """
    data = uploaded_file.read()
    if not data:
        raise DocumentValidationError("The uploaded file is empty.")

    max_bytes = max_document_bytes()
    if len(data) > max_bytes:
        raise DocumentValidationError(
            f"File is too large. Maximum size is {max_bytes // (1024 * 1024)} MB."
        )

    content_type = (getattr(uploaded_file, "content_type", "") or "").lower()
    if content_type not in allowed_document_types():
        raise DocumentValidationError(
            "Unsupported file type. Upload a JPEG, PNG, WebP, or PDF file."
        )

    filename = (getattr(uploaded_file, "name", "") or "document").strip()
    return FarmerDocument.objects.create(
        farmer=farmer,
        document_type=document_type,
        original_filename=filename[:255],
        content_type=content_type,
        size_bytes=len(data),
        checksum=checksum(data),
        encrypted_data=encrypt_document(data),
        uploaded_by=uploaded_by,
    )
