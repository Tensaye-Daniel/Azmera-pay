# pytest fixtures: API clients bound to specific roles (DRF force_authenticate).
import pytest
from rest_framework.test import APIClient

from apps.accounts.models import Role
from tests.factories.accounts import create_web_user


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def agent():
    return create_web_user(phone="+251911000001", role=Role.AGENT, full_name="Agent A")


@pytest.fixture
def admin_user():
    return create_web_user(phone="+251911000002", role=Role.ADMIN, full_name="System Admin")


@pytest.fixture
def agent_client(agent):
    client = APIClient()
    client.force_authenticate(user=agent)
    return client


@pytest.fixture
def admin_client(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client
