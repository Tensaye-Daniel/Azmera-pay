# Farmer document encryption helpers.
import base64

import pytest
from django.core.exceptions import ImproperlyConfigured
from django.test import override_settings

from apps.profiles.documents import (
    checksum,
    decrypt_document,
    derive_document_key,
    encrypt_document,
)

pytestmark = pytest.mark.django_db

PLAINTEXT = b"%PDF-1.7 confidential farmer identity document"


def test_encrypt_decrypt_round_trip():
    token = encrypt_document(PLAINTEXT)

    assert token != PLAINTEXT
    assert decrypt_document(token) == PLAINTEXT


def test_ciphertext_does_not_contain_plaintext():
    token = encrypt_document(PLAINTEXT)

    assert b"confidential" not in token


def test_derived_key_is_a_valid_fernet_key():
    key = derive_document_key("test-secret-key")

    assert len(base64.urlsafe_b64decode(key)) == 32


@override_settings(FARMER_DOCUMENT_ENCRYPTION_KEY="not-a-fernet-key")
def test_malformed_configured_key_raises_clear_error():
    with pytest.raises(ImproperlyConfigured):
        encrypt_document(PLAINTEXT)


def test_checksum_matches_plaintext():
    assert checksum(PLAINTEXT) == checksum(PLAINTEXT)
    assert checksum(PLAINTEXT) != checksum(PLAINTEXT + b"other")
