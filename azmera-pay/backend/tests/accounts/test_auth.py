# Auth acceptance tests: agent login (JWT), /me, no anonymous access.
import pytest

from apps.accounts.models import Role

from tests.factories.accounts import create_web_user

pytestmark = pytest.mark.django_db


def test_agent_can_log_in_with_phone_and_password(api_client):
    create_web_user(phone="+251911100001", role=Role.AGENT, password="secret1234")

    resp = api_client.post(
        "/api/v1/auth/login",
        {"phone": "+251911100001", "password": "secret1234"},
        format="json",
    )

    assert resp.status_code == 200
    assert "access" in resp.data
    assert "refresh" in resp.data


def test_login_rejects_bad_credentials(api_client):
    create_web_user(phone="+251911100001", role=Role.AGENT, password="secret1234")

    resp = api_client.post(
        "/api/v1/auth/login",
        {"phone": "+251911100001", "password": "wrong-password"},
        format="json",
    )

    assert resp.status_code == 401


def test_me_returns_the_current_user(agent_client, agent):
    resp = agent_client.get("/api/v1/auth/me")

    assert resp.status_code == 200
    assert resp.data["phone"] == agent.phone
    assert resp.data["full_name"] == agent.full_name
    assert resp.data["role"] == Role.AGENT


def test_me_requires_authentication(api_client):
    assert api_client.get("/api/v1/auth/me").status_code == 401