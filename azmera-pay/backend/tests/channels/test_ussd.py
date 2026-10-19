import pytest
from urllib.parse import urlencode

from apps.accounts.models import Role
from apps.channels.gateways import AfricaTalkingGateway, get_gateway
from apps.channels.models import USSDInteraction, USSDSession, USSDSessionStatus
from tests.factories.accounts import UserFactory
from tests.factories.profiles import FarmerProfileFactory

pytestmark = pytest.mark.django_db

USSD_URL = "/ussd/"
FARMER_PHONE = "+251911000010"
SHORTCODE = "*384*54009#"


def payload(*, session_id="session-1", phone=FARMER_PHONE, text=""):
    return {
        "sessionId": session_id,
        "serviceCode": SHORTCODE,
        "phoneNumber": phone,
        "text": text,
    }


def body_of(response):
    return response.content.decode()


@pytest.fixture
def farmer():
    user = UserFactory(phone=FARMER_PHONE, role=Role.FARMER, full_name="Abebe Kebede")
    return FarmerProfileFactory(
        user=user, region="Oromia", woreda="Adama", primary_crop="Tef"
    )


def test_get_health_check(api_client):
    response = api_client.get(USSD_URL)

    assert response.status_code == 200
    assert "USSD" in body_of(response)


def test_first_dial_renders_main_menu(api_client, farmer):
    response = api_client.post(USSD_URL, payload())
    body = body_of(response)

    assert response.status_code == 200
    assert body.startswith("CON ")
    assert "1. My account" in body
    assert "0. Exit" in body


def test_account_menu_shows_farmer_details(api_client, farmer):
    body = body_of(api_client.post(USSD_URL, payload(text="1")))

    assert body.startswith("CON ")
    assert farmer.azmera_account_number in body
    assert "Abebe Kebede" in body
    assert "Oromia" in body


def test_back_action_returns_to_main_menu(api_client, farmer):
    body = body_of(api_client.post(USSD_URL, payload(text="1*0")))

    assert body.startswith("CON ")
    assert "2. My matches" in body


def test_my_matches_ends_with_placeholder(api_client, farmer):
    body = body_of(api_client.post(USSD_URL, payload(text="2")))

    assert body.startswith("END ")
    assert "match" in body.lower()


def test_exit_option_ends_session(api_client, farmer):
    body = body_of(api_client.post(USSD_URL, payload(text="0")))

    assert body.startswith("END ")


def test_invalid_option_reprompts_main_menu(api_client, farmer):
    body = body_of(api_client.post(USSD_URL, payload(text="9")))

    assert body.startswith("CON ")
    assert "Invalid option." in body
    assert "1. My account" in body


def test_unregistered_phone_is_told_to_see_agent(api_client):
    body = body_of(api_client.post(USSD_URL, payload(phone="+251911999999")))

    assert body.startswith("END ")
    assert "agent" in body.lower()


def test_local_phone_format_resolves_same_farmer(api_client, farmer):
    body = body_of(api_client.post(USSD_URL, payload(phone="0911000010", text="1")))

    assert farmer.azmera_account_number in body


def test_invalid_phone_number_returns_end(api_client, farmer):
    body = body_of(api_client.post(USSD_URL, payload(phone="123")))

    assert body.startswith("END ")


def test_session_is_reused_and_interactions_logged(api_client, farmer):
    api_client.post(USSD_URL, payload(session_id="abc", text=""))
    api_client.post(USSD_URL, payload(session_id="abc", text="1"))

    assert USSDSession.objects.filter(session_id="abc").count() == 1
    session = USSDSession.objects.get(session_id="abc")
    assert session.last_text == "1"
    assert session.farmer_id == farmer.id
    assert session.interactions.count() == 2


def test_completed_session_is_marked_done(api_client, farmer):
    api_client.post(USSD_URL, payload(session_id="done-1", text="0"))

    session = USSDSession.objects.get(session_id="done-1")
    assert session.status == USSDSessionStatus.COMPLETED
    assert USSDInteraction.objects.filter(session=session).count() == 1


def test_urlencoded_form_payload_is_parsed(client, farmer):
    response = client.post(
        USSD_URL,
        data=urlencode(payload(text="1")),
        content_type="application/x-www-form-urlencoded",
    )

    assert response.status_code == 200
    assert farmer.azmera_account_number in body_of(response)


def test_json_payload_is_accepted(api_client, farmer):
    response = api_client.post(USSD_URL, payload(text="1"), format="json")

    assert response.status_code == 200
    assert body_of(response).startswith("CON ")


def test_callback_secret_blocks_missing_token(api_client, farmer, settings):
    settings.USSD_CALLBACK_SECRET = "s3cret"

    blocked = api_client.post(USSD_URL, payload())
    allowed = api_client.post(f"{USSD_URL}?token=s3cret", payload(phone=FARMER_PHONE))

    assert blocked.status_code == 403
    assert allowed.status_code == 200


def test_gateway_normalizes_phone_and_reads_fields():
    parsed = AfricaTalkingGateway().parse(payload(phone="0911000010", text="1*2"))

    assert parsed.phone == FARMER_PHONE
    assert parsed.text == "1*2"
    assert parsed.service_code == SHORTCODE


def test_gateway_rejects_missing_fields():
    with pytest.raises(ValueError, match="sessionId"):
        AfricaTalkingGateway().parse({"sessionId": "", "phoneNumber": ""})


def test_get_gateway_defaults_to_mock(settings):
    settings.USSD_GATEWAY = "mock"
    assert get_gateway().name == "mock"

    settings.USSD_GATEWAY = "africastalking"
    assert get_gateway().name == "africastalking"
