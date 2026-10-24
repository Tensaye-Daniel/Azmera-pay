# Farmer document encryption and validation helpers.
#
# Documents are encrypted with Fernet (AES-128-CBC + HMAC) before they touch the
# database. The key comes from FARMER_DOCUMENT_ENCRYPTION_KEY; when it is not
# set (local development and tests) we derive a stable key from SECRET_KEY so
# uploads still work without leaking plaintext.
import base64
import hashlib
from functools import lru_cache

from cryptography.fernet import Fernet, InvalidToken
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

DEFAULT_MAX_DOCUMENT_BYTES = 5 * 1024 * 1024
DEFAULT_ALLOWED_DOCUMENT_TYPES = (
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
)


def _configured_key() -> str:
    return getattr(settings, "FARMER_DOCUMENT_ENCRYPTION_KEY", "") or ""


def derive_document_key(secret_key: str) -> bytes:
    """Build a valid Fernet key from a Django secret (development fallback)."""
    digest = hashlib.sha256(
        b"azmera-farmer-documents:" + secret_key.encode("utf-8")
    ).digest()
    return base64.urlsafe_b64encode(digest)


@lru_cache(maxsize=8)
def _fernet_for(key: str) -> Fernet:
    try:
        return Fernet(key.encode("utf-8"))
    except (TypeError, ValueError) as exc:
        raise ImproperlyConfigured(
            "FARMER_DOCUMENT_ENCRYPTION_KEY must be a URL-safe base64-encoded "
            "32-byte key. Generate one with: "
            "python -c \"from cryptography.fernet import Fernet; "
            'print(Fernet.generate_key().decode())"'
        ) from exc


def document_cipher() -> Fernet:
    configured = _configured_key()
    if configured:
        return _fernet_for(configured)
    return _fernet_for(derive_document_key(settings.SECRET_KEY).decode("ascii"))


def encrypt_document(data: bytes) -> bytes:
    return document_cipher().encrypt(data)


def decrypt_document(token: bytes) -> bytes:
    try:
        return document_cipher().decrypt(bytes(token))
    except InvalidToken as exc:
        raise ValueError(
            "Document could not be decrypted with the configured key."
        ) from exc


def max_document_bytes() -> int:
    return getattr(
        settings, "FARMER_DOCUMENT_MAX_BYTES", DEFAULT_MAX_DOCUMENT_BYTES
    )


def allowed_document_types() -> tuple[str, ...]:
    return tuple(
        getattr(
            settings,
            "FARMER_DOCUMENT_ALLOWED_TYPES",
            DEFAULT_ALLOWED_DOCUMENT_TYPES,
        )
    )


def checksum(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()
