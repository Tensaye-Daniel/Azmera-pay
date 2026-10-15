
import pytest

from apps.accounts.models import Role, SupplierApprovalStatus, SupplierProfile

pytestmark = pytest.mark.django_db

REGISTER_URL = "/api/v1/auth/register/supplier"

PAYLOAD = {
    "full_name": "Supplier Test",
    "phone": "+251911399101",
    "password": "Kite-River-Quartz-482!",
    "fayda_fin_number": "012345678901",
    "tin_number": "0123456789",
    "company_name": "Green Valley Supplies",
}


def test_supplier_registration_creates_pending_account_and_profile(api_client):
    response = api_client.post(
        REGISTER_URL,
        data=PAYLOAD,
        format="json",
    )

    assert response.status_code == 201

    user = SupplierProfile.objects.get(
        user__phone=PAYLOAD["phone"]
    ).user

    assert user.role == Role.SUPPLIER
    assert user.supplier_approval_status == SupplierApprovalStatus.PENDING
    assert user.check_password(PAYLOAD["password"])

    profile = user.supplier_profile
    assert profile.fayda_fin_number == PAYLOAD["fayda_fin_number"]
    assert profile.tin_number == PAYLOAD["tin_number"]
    assert profile.company_name == PAYLOAD["company_name"]

    assert "password" not in response.data
    assert "fayda_fin_number" not in response.data
    assert "tin_number" not in response.data


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("fayda_fin_number", "12345678901"),
        ("fayda_fin_number", "1234567890123"),
        ("fayda_fin_number", "12345678901A"),
        ("tin_number", "123456789"),
        ("tin_number", "12345678901"),
        ("tin_number", "123456789A"),
    ],
)
def test_supplier_registration_rejects_invalid_id_numbers(
    api_client,
    field,
    value,
):
    payload = {**PAYLOAD, field: value}

    response = api_client.post(
        REGISTER_URL,
        data=payload,
        format="json",
    )

    assert response.status_code == 400
    assert field in response.data


def test_supplier_registration_rejects_duplicate_phone(api_client):
    first_response = api_client.post(
        REGISTER_URL,
        data=PAYLOAD,
        format="json",
    )
    assert first_response.status_code == 201

    second_response = api_client.post(
        REGISTER_URL,
        data={
            **PAYLOAD,
            "company_name": "Another Shop",
            "fayda_fin_number": "987654321098",
            "tin_number": "9876543210",
        },
        format="json",
    )

    assert second_response.status_code == 400
    assert "phone" in second_response.data


def test_supplier_registration_rejects_duplicate_fayda_fin(api_client):
    first_response = api_client.post(
        REGISTER_URL,
        data=PAYLOAD,
        format="json",
    )
    assert first_response.status_code == 201

    second_response = api_client.post(
        REGISTER_URL,
        data={
            **PAYLOAD,
            "phone": "+251911399102",
            "tin_number": "9876543210",
            "company_name": "Another Shop",
        },
        format="json",
    )

    assert second_response.status_code == 400
    assert "fayda_fin_number" in second_response.data


def test_supplier_registration_rejects_duplicate_tin(api_client):
    first_response = api_client.post(
        REGISTER_URL,
        data=PAYLOAD,
        format="json",
    )
    assert first_response.status_code == 201

    second_response = api_client.post(
        REGISTER_URL,
        data={
            **PAYLOAD,
            "phone": "+251911399103",
            "fayda_fin_number": "987654321098",
            "company_name": "Another Shop",
        },
        format="json",
    )

    assert second_response.status_code == 400
    assert "tin_number" in second_response.data
