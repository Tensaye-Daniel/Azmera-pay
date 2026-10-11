# Farmer registration acceptance tests (agent dashboard).
import pytest

from apps.accounts.models import Role
from apps.profiles.models import FarmerProfile

from tests.factories.accounts import create_web_user
from tests.factories.profiles import FarmerProfileFactory

pytestmark = pytest.mark.django_db

PAYLOAD = {
    "full_name": "Alemitu Bekele",
    "phone": "+251911200001",
    "fayda_fin": "123456789012345",
    "gender": "female",
    "region": "oromiya",
    "woreda": "Adama",
    "kebele": "Kebele 02",
    "farm_size_hectares": "3.50",
    "primary_crop": "Maize",
    "land_ownership": "owned",
    "notes": "Lives near the cooperative store",
}


def test_agent_registers_a_farmer(agent_client):
    resp = agent_client.post("/api/v1/dashboard/agent/farmers", data=PAYLOAD, format="json")

    assert resp.status_code == 201

    farmer = FarmerProfile.objects.get(user__phone="+251911200001")
    assert resp.data["azmera_account_number"] == farmer.azmera_account_number
    assert farmer.azmera_account_number.startswith("AZM-")
    assert farmer.region == "Oromia"  # spelling variant normalized to canonical
    assert farmer.gender == "female"
    assert farmer.status == "pending"  # submitted for verification

    # No farmer web login: the farmer's User row has no usable password.
    assert farmer.user.role == Role.FARMER
    assert not farmer.user.has_usable_password()


def test_duplicate_phone_number_is_rejected(agent_client):
    agent_client.post("/api/v1/dashboard/agent/farmers", data=PAYLOAD, format="json")

    resp = agent_client.post(
        "/api/v1/dashboard/agent/farmers",
        data={**PAYLOAD, "fayda_fin": ""},
        format="json",
    )

    assert resp.status_code == 400
    assert "phone" in resp.data


def test_duplicate_fayda_fin_is_rejected(agent_client):
    agent_client.post("/api/v1/dashboard/agent/farmers", data=PAYLOAD, format="json")

    resp = agent_client.post(
        "/api/v1/dashboard/agent/farmers",
        data={**PAYLOAD, "phone": "+251911200002"},
        format="json",
    )

    assert resp.status_code == 400
    assert "fayda_fin" in resp.data


def test_blank_fayda_fin_is_optional(agent_client):
    resp = agent_client.post(
        "/api/v1/dashboard/agent/farmers",
        data={**PAYLOAD, "fayda_fin": ""},
        format="json",
    )

    assert resp.status_code == 201
    assert FarmerProfile.objects.get(user__phone="+251911200001").fayda_fin is None


def test_malformed_fayda_fin_is_rejected(agent_client):
    resp = agent_client.post(
        "/api/v1/dashboard/agent/farmers",
        data={**PAYLOAD, "fayda_fin": "not-a-number"},
        format="json",
    )

    assert resp.status_code == 400
    assert "fayda_fin" in resp.data


def test_invalid_region_is_rejected(agent_client):
    resp = agent_client.post(
        "/api/v1/dashboard/agent/farmers",
        data={**PAYLOAD, "region": "Narnia"},
        format="json",
    )

    assert resp.status_code == 400
    assert "region" in resp.data


def test_agent_lists_only_their_own_farmers(api_client, agent):
    mine = FarmerProfileFactory(registered_by=agent)
    FarmerProfileFactory()  # another farmer, registered by another agent

    api_client.force_authenticate(user=agent)
    resp = api_client.get("/api/v1/dashboard/agent/farmers")

    assert resp.status_code == 200
    assert resp.data["count"] == 1
    assert resp.data["results"][0]["azmera_account_number"] == mine.azmera_account_number


def test_agent_cannot_view_another_agents_farmer(api_client, agent):
    other_agent = create_web_user(phone="+251911000007", role=Role.AGENT, full_name="Agent B")
    farmer = FarmerProfileFactory(registered_by=other_agent)

    api_client.force_authenticate(user=agent)
    resp = api_client.get(f"/api/v1/dashboard/agent/farmers/{farmer.pk}/")

    assert resp.status_code == 404


def test_admin_can_view_all_records(admin_client):
    FarmerProfileFactory()
    FarmerProfileFactory(region="Amhara", woreda="Bahir Dar")

    resp = admin_client.get("/api/v1/dashboard/agent/farmers")

    assert resp.status_code == 200
    assert resp.data["count"] == 2


def test_non_agent_cannot_access_agent_dashboard(api_client):
    farmer_user = create_web_user(phone="+251911100009", role=Role.FARMER, full_name="Farmer")

    api_client.force_authenticate(user=farmer_user)
    resp = api_client.get("/api/v1/dashboard/agent/farmers")

    assert resp.status_code == 403


def test_agent_can_update_a_farmer(agent_client, agent):
    farmer = FarmerProfileFactory(registered_by=agent)

    resp = agent_client.patch(
        f"/api/v1/dashboard/agent/farmers/{farmer.pk}",
        data={"woreda": "Bishoftu", "farm_size_hectares": "5.00"},
        format="json",
    )

    assert resp.status_code == 200
    farmer.refresh_from_db()
    assert farmer.woreda == "Bishoftu"
    assert farmer.farm_size_hectares == 5.00


def test_registration_requires_required_fields(agent_client):
    resp = agent_client.post(
        "/api/v1/dashboard/agent/farmers",
        data={"full_name": "Incomplete"},
        format="json",
    )

    assert resp.status_code == 400