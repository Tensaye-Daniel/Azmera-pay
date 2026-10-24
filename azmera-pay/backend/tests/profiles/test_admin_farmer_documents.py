# Admin review of encrypted farmer documents.
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile

from apps.profiles.models import FarmerDocumentType
from apps.profiles.services import store_farmer_document
from tests.factories.profiles import FarmerProfileFactory

pytestmark = pytest.mark.django_db

PDF_BYTES = b"%PDF-1.7 land certificate for review"


@pytest.fixture
def farmer_with_document():
    farmer = FarmerProfileFactory()
    document = store_farmer_document(
        farmer=farmer,
        document_type=FarmerDocumentType.FARMING_PROOF,
        uploaded_file=SimpleUploadedFile(
            "certificate.pdf", PDF_BYTES, content_type="application/pdf"
        ),
        uploaded_by=farmer.registered_by,
    )
    return farmer, document


def test_admin_farmer_list_includes_document_metadata(admin_client, farmer_with_document):
    farmer, document = farmer_with_document

    resp = admin_client.get("/api/v1/dashboard/admin/farmers")

    assert resp.status_code == 200
    row = next(item for item in resp.data["results"] if item["id"] == str(farmer.pk))
    assert len(row["documents"]) == 1
    assert row["documents"][0]["id"] == str(document.pk)
    assert row["documents"][0]["document_type"] == "farming_proof"
    assert "encrypted_data" not in row["documents"][0]


def test_admin_farmer_detail_includes_document_metadata(admin_client, farmer_with_document):
    farmer, _ = farmer_with_document

    resp = admin_client.get(f"/api/v1/dashboard/admin/farmers/{farmer.pk}")

    assert resp.status_code == 200
    assert len(resp.data["documents"]) == 1


def test_admin_downloads_decrypted_document(admin_client, farmer_with_document):
    farmer, document = farmer_with_document

    resp = admin_client.get(
        f"/api/v1/dashboard/admin/farmers/{farmer.pk}/documents/{document.pk}"
    )

    assert resp.status_code == 200
    assert resp["Content-Type"] == "application/pdf"
    assert "certificate.pdf" in resp["Content-Disposition"]
    assert resp["X-Content-Type-Options"] == "nosniff"
    assert resp.content == PDF_BYTES


def test_admin_cannot_download_another_farmers_document(
    admin_client, farmer_with_document
):
    _, document = farmer_with_document
    other_farmer = FarmerProfileFactory()

    resp = admin_client.get(
        f"/api/v1/dashboard/admin/farmers/{other_farmer.pk}/documents/{document.pk}"
    )

    assert resp.status_code == 404


def test_unknown_document_returns_404(admin_client, farmer_with_document):
    farmer, _ = farmer_with_document

    resp = admin_client.get(
        f"/api/v1/dashboard/admin/farmers/{farmer.pk}/documents/"
        "00000000-0000-0000-0000-000000000000"
    )

    assert resp.status_code == 404


def test_agent_cannot_download_farmer_documents(agent_client, farmer_with_document):
    farmer, document = farmer_with_document

    resp = agent_client.get(
        f"/api/v1/dashboard/admin/farmers/{farmer.pk}/documents/{document.pk}"
    )

    assert resp.status_code == 403
