# Farmer profile (OneToOne to User). Agents do not get extra profile rows yet -
# their identity lives on the User record.
from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel, UUIDModel

# Optional Fayda national ID. The Ethiopian Fayda ID is 15 digits.
FAYDA_FIN_PATTERN = r"^\d{15}$"


class FarmerStatus(models.TextChoices):
    REGISTERED = "registered", "Registered"
    PENDING = "pending", "Pending verification"
    UNVERIFIED = "unverified", "Unverified"


class Gender(models.TextChoices):
    MALE = "male", "Male"
    FEMALE = "female", "Female"


class LandOwnership(models.TextChoices):
    OWNED = "owned", "Owned"
    LEASED = "leased", "Leased"
    COMMUNAL = "communal", "Communal"


class FarmerDocumentType(models.TextChoices):
    FARMER_ID = "farmer_id", "Farmer ID"
    FIELD_PHOTO = "field_photo", "Farm field photo"
    FARMING_PROOF = "farming_proof", "Proof of farming"
    OTHER = "other", "Other"


class FarmerProfile(UUIDModel, TimeStampedModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="farmer_profile",
    )
    registered_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="registered_farmers",
        help_text="The agent who registered this farmer.",
    )
    azmera_account_number = models.CharField(
        max_length=32,
        unique=True,
        editable=False,
        help_text="Unique internal Azmera account number assigned at registration.",
    )
    fayda_fin = models.CharField(
        max_length=15,
        unique=True,
        null=True,
        blank=True,
        help_text="Optional Fayda national ID number (15 digits).",
    )
    gender = models.CharField(
        max_length=16,
        choices=Gender.choices,
        blank=True,
        help_text="Farmer gender, captured during agent registration.",
    )
    region = models.CharField(max_length=64)
    woreda = models.CharField(max_length=128)
    kebele = models.CharField(max_length=128, blank=True)
    farm_size_hectares = models.DecimalField(max_digits=9, decimal_places=2)
    primary_crop = models.CharField(max_length=128)
    land_ownership = models.CharField(max_length=16, choices=LandOwnership.choices)
    land_ownership_notes = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(
        max_length=16,
        choices=FarmerStatus.choices,
        default=FarmerStatus.REGISTERED,
        help_text="Farmers submitted by agents start as 'pending' verification.",
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.full_name} ({self.azmera_account_number})"


class FarmerDocument(UUIDModel, TimeStampedModel):
    """A supporting document attached to a farmer during registration.

    Only metadata is queryable: the file bytes live in ``encrypted_data`` as a
    Fernet token. Use ``apps.profiles.documents.decrypt_document`` to read it.
    """

    farmer = models.ForeignKey(
        FarmerProfile,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    document_type = models.CharField(
        max_length=32,
        choices=FarmerDocumentType.choices,
        default=FarmerDocumentType.OTHER,
    )
    original_filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=128, blank=True)
    size_bytes = models.PositiveIntegerField()
    checksum = models.CharField(
        max_length=64,
        editable=False,
        help_text="SHA-256 of the plaintext, for duplicate/integrity checks.",
    )
    encrypted_data = models.BinaryField(editable=False)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="uploaded_farmer_documents",
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.get_document_type_display()} - {self.original_filename}"
