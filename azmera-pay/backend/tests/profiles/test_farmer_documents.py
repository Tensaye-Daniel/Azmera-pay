# Farmer registration with encrypted supporting documents.
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings

from apps.profiles.documents import decrypt_document
from apps.profiles.models import FarmerDocument, FarmerProfile

pytestmark = pytest.mark.django_db

PAYLOAD = {
    "full_name": "Alemitu Bekele",
    "phone": "+251911200011",
    "fayda_fin": "123456789012345",
    "gender": "female",
    "region": "oromiya",
    "woreda": "Adama",
    "kebele": "Kebele 02",
    "farm_size_hectares": "3.50",
    "primary_crop": "Maize",
    "land_ownership": "owned",
}

ID_BYTES = b"\xff\xd8\xff\xe0 farmer identity photo"
PROOF_BYTES = b"%PDF-1.7 land ownership certificate"


def upload(name, content, content_type):
    return SimpleUploadedFile(name, content, content_type=content_type)


def register_with_documents(client, **overrides):
    data = {**PAYLOAD, **overrides}
    data.setdefault(
        "farmer_id",
        upload("id.jpg", ID_BYTES, "image/jpeg"),
    )
    data.setdefault(
        "farming_proof",
        upload("land.pdf", PROOF_BYTES, "application/pdf"),
    )
    return client.post(
        "/api/v1/dashboard/agent/farmers", data=data, format="multipart"
    )


def test_registration_stores_encrypted_documents(agent_client):
    resp = register_with_documents(agent_client)

    assert resp.status_code == 201
    farmer = FarmerProfile.objects.get(user__phone=PAYLOAD["phone"])
    documents = FarmerDocument.objects.filter(farmer=farmer)

    assert documents.count() == 2
    for document in documents:
        assert bytes(document.encrypted_data) not in (ID_BYTES, PROOF_BYTES)

    farmer_id = documents.get(document_type="farmer_id")
    assert farmer_id.original_filename == "id.jpg"
    assert farmer_id.content_type == "image/jpeg"
    assert farmer_id.size_bytes == len(ID_BYTES)
    assert farmer_id.uploaded_by == farmer.registered_by
    assert decrypt_document(farmer_id.encrypted_data) == ID_BYTES


def test_registration_response_includes_document_metadata(agent_client):
    resp = register_with_documents(agent_client)

    assert resp.status_code == 201
    assert len(resp.data["documents"]) == 2
    assert {
        item["document_type"] for item in resp.data["documents"]
    } == {"farmer_id", "farming_proof"}
    assert all("encrypted_data" not in item for item in resp.data["documents"])


def test_registration_rejects_unsupported_document_type(agent_client):
    resp = register_with_documents(
        agent_client,
        farmer_id=upload("payload.exe", b"MZ binary", "application/x-msdownload"),
    )

    assert resp.status_code == 400
    assert "farmer_id" in resp.data
    assert not FarmerProfile.objects.filter(user__phone=PAYLOAD["phone"]).exists()
    assert FarmerDocument.objects.count() == 0


@override_settings(FARMER_DOCUMENT_MAX_BYTES=8)
def test_registration_rejects_oversized_document(agent_client):
    resp = register_with_documents(
        agent_client,
        farmer_id=upload("big.jpg", b"x" * 64, "image/jpeg"),
    )

    assert resp.status_code == 400
    assert "farmer_id" in resp.data
    assert not FarmerProfile.objects.filter(user__phone=PAYLOAD["phone"]).exists()


def test_registration_without_documents_still_works(agent_client):
    resp = agent_client.post(
        "/api/v1/dashboard/agent/farmers", data=PAYLOAD, format="json"
    )

    assert resp.status_code == 201
    farmer = FarmerProfile.objects.get(user__phone=PAYLOAD["phone"])
    assert farmer.documents.count() == 0
