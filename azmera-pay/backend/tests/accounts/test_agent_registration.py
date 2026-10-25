# Agent self-service registration (no demo users).
import pytest

from apps.accounts.models import Role
from apps.common.utils import REGISTRATION_CONFLICT_MESSAGE

pytestmark = pytest.mark.django_db

PAYLOAD = {
    "full_name": "Yonas Haile",
    "phone": "+251911399001",
    "password": "s3cure-pass-xyz",
}


def test_agent_can_create_their_own_account(api_client):
    resp = api_client.post("/api/v1/auth/register", data=PAYLOAD, format="json")

    assert resp.status_code == 201
    assert resp.data["full_name"] == "Yonas Haile"
    assert resp.data["phone"] == "+251911399001"
    assert "password" not in resp.data
    assert resp.data["id"]


def test_registered_user_has_agent_role_and_usable_password(api_client):
    from django.contrib.auth import get_user_model

    User = get_user_model()

    resp = api_client.post("/api/v1/auth/register", data=PAYLOAD, format="json")

    assert resp.status_code == 201
    user = User.objects.get(pk=resp.data["id"])
    assert user.role == Role.AGENT
    assert user.has_usable_password()
    assert user.check_password("s3cure-pass-xyz")


def test_registration_normalizes_phone(api_client, django_user_model):
    resp = api_client.post(
        "/api/v1/auth/register",
        data={**PAYLOAD, "phone": "0911399001"},
        format="json",
    )

    assert resp.status_code == 201
    assert django_user_model.objects.filter(phone="+251911399001").exists()


def test_duplicate_phone_is_rejected(api_client):
    api_client.post("/api/v1/auth/register", data=PAYLOAD, format="json")

    resp = api_client.post(
        "/api/v1/auth/register",
        data={**PAYLOAD, "full_name": "Someone Else"},
        format="json",
    )

    assert resp.status_code == 400
    assert "phone" not in resp.data
    assert resp.data["non_field_errors"] == [REGISTRATION_CONFLICT_MESSAGE]


def test_all_numeric_password_is_rejected(api_client):
    resp = api_client.post(
        "/api/v1/auth/register",
        data={**PAYLOAD, "password": "12345678"},
        format="json",
    )

    assert resp.status_code == 400
    assert "password" in resp.data


def test_short_password_is_rejected(api_client):
    resp = api_client.post(
        "/api/v1/auth/register",
        data={**PAYLOAD, "password": "tiny"},
        format="json",
    )

    assert resp.status_code == 400
    assert "password" in resp.data


def test_missing_fields_are_rejected(api_client):
    resp = api_client.post(
        "/api/v1/auth/register",
        data={"phone": "+251911399002"},
        format="json",
    )

    assert resp.status_code == 400
    assert "full_name" in resp.data
    assert "password" in resp.data


def test_registered_agent_can_then_log_in(api_client):
    api_client.post("/api/v1/auth/register", data=PAYLOAD, format="json")

    resp = api_client.post(
        "/api/v1/auth/login",
        data={"phone": PAYLOAD["phone"], "password": PAYLOAD["password"]},
        format="json",
    )

    assert resp.status_code == 200
    assert "access" in resp.data
    assert "refresh" in resp.data
