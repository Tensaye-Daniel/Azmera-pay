# Auth acceptance tests: agent login (JWT), /me, no anonymous access.
import pytest
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import Role, SupplierApprovalStatus
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


def test_login_accepts_phone_in_any_local_format(api_client):
    create_web_user(phone="+251911100001", role=Role.AGENT, password="secret1234")

    for phone in ("0911100001", "251911100001", "911100001"):
        resp = api_client.post(
            "/api/v1/auth/login",
            {"phone": phone, "password": "secret1234"},
            format="json",
        )
        assert resp.status_code == 200, phone
        assert "access" in resp.data


def test_me_returns_the_current_user(agent_client, agent):
    resp = agent_client.get("/api/v1/auth/me")

    assert resp.status_code == 200
    assert resp.data["phone"] == agent.phone
    assert resp.data["full_name"] == agent.full_name
    assert resp.data["role"] == Role.AGENT


def test_me_requires_authentication(api_client):
    assert api_client.get("/api/v1/auth/me").status_code == 401


def test_logout_blacklists_authenticated_users_refresh_token(api_client, agent):
    refresh = str(RefreshToken.for_user(agent))
    api_client.force_authenticate(user=agent)

    response = api_client.post(
        "/api/v1/auth/logout", {"refresh": refresh}, format="json"
    )

    assert response.status_code == 204
    refresh_response = api_client.post(
        "/api/v1/auth/token/refresh", {"refresh": refresh}, format="json"
    )
    assert refresh_response.status_code == 401


def test_logout_does_not_blacklist_another_users_token(api_client, agent):
    other = create_web_user(phone="+251911100009", role=Role.AGENT)
    api_client.force_authenticate(user=agent)

    response = api_client.post(
        "/api/v1/auth/logout",
        {"refresh": str(RefreshToken.for_user(other))},
        format="json",
    )

    assert response.status_code == 400

@pytest.mark.parametrize(
    "approval_status",
    [
        SupplierApprovalStatus.PENDING,
        SupplierApprovalStatus.REJECTED,
    ],
)
def test_unapproved_supplier_cannot_log_in(
    api_client,
    approval_status,
):
    supplier = create_web_user(
        phone="+251911100002",
        role=Role.SUPPLIER,
        password="secret1234",
    )
    supplier.supplier_approval_status = approval_status
    supplier.save(update_fields=["supplier_approval_status"])

    response = api_client.post(
        "/api/v1/auth/login",
        {"phone": supplier.phone, "password": "secret1234"},
        format="json",
    )

    assert response.status_code == 400
    assert "access" not in response.data
    assert "refresh" not in response.data


def test_approved_supplier_can_log_in(api_client):
    supplier = create_web_user(
        phone="+251911100003",
        role=Role.SUPPLIER,
        password="secret1234",
    )
    supplier.supplier_approval_status = SupplierApprovalStatus.APPROVED
    supplier.save(update_fields=["supplier_approval_status"])

    response = api_client.post(
        "/api/v1/auth/login",
        {"phone": supplier.phone, "password": "secret1234"},
        format="json",
    )

    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data
def test_rejected_supplier_cannot_refresh_token(api_client):
    supplier = create_web_user(
        phone="+251911100004",
        role=Role.SUPPLIER,
        password="secret1234",
    )
    supplier.supplier_approval_status = SupplierApprovalStatus.APPROVED
    supplier.save(update_fields=["supplier_approval_status"])

    refresh_token = str(RefreshToken.for_user(supplier))

    # Simulate an admin rejecting the supplier after token creation.
    supplier.supplier_approval_status = SupplierApprovalStatus.REJECTED
    supplier.save(update_fields=["supplier_approval_status"])

    response = api_client.post(
        "/api/v1/auth/token/refresh",
        {"refresh": refresh_token},
        format="json",
    )

    assert response.status_code == 401
    assert "access" not in response.data
