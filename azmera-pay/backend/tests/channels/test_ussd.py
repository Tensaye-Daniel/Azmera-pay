from decimal import Decimal
from urllib.parse import urlencode

import pytest

from apps.accounts.models import Role, SupplierApprovalStatus, SupplierProfile
from apps.catalog.models import ProductCategory
from apps.channels.gateways import AfricaTalkingGateway, get_gateway
from apps.channels.models import USSDInteraction, USSDSession, USSDSessionStatus
from apps.requests.models import Request, RequestKind, RequestLine, RequestStatus
from tests.factories.accounts import UserFactory
from tests.factories.catalog import (
    ProductFactory,
    SupplierListingFactory,
    UnitFactory,
)
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


def post_text(api_client, text, *, session_id="session-1"):
    return body_of(api_client.post(USSD_URL, payload(session_id=session_id, text=text)))


@pytest.fixture(autouse=True)
def english_ussd_default(settings):
    """Most flow assertions use English; Amharic tests override this setting."""
    settings.USSD_DEFAULT_LANGUAGE = "en"


@pytest.fixture
def farmer():
    user = UserFactory(phone=FARMER_PHONE, role=Role.FARMER, full_name="Abebe Kebede")
    return FarmerProfileFactory(
        user=user, region="Oromia", woreda="Adama", primary_crop="Tef"
    )


@pytest.fixture
def catalog_item():
    product = ProductFactory(name="Tef Seed", category=ProductCategory.SEED)
    unit = UnitFactory(name="Kilogram", code="kg")
    supplier = UserFactory(
        role=Role.SUPPLIER,
        supplier_approval_status=SupplierApprovalStatus.APPROVED,
        full_name="Adama Agri",
    )
    SupplierProfile.objects.create(
        user=supplier,
        tin_number=f"TIN-{supplier.pk}",
        company_name="Adama Agri Shop",
        region="Sidama",
        woreda="Hawassa",
        product_categories=["seed"],
    )
    listing = SupplierListingFactory(
        supplier=supplier,
        product=product,
        unit=unit,
        unit_price=Decimal("40.00"),
        available_quantity=Decimal("100.00"),
        region="Oromia",
        woreda="Adama",
    )
    return product, unit, listing


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
    assert "2. Request input" in body
    assert "0. Exit" in body


def test_account_menu_shows_farmer_details(api_client, farmer):
    body = post_text(api_client, "1")

    assert body.startswith("CON ")
    assert farmer.azmera_account_number in body
    assert "Abebe Kebede" in body
    assert "Oromia" in body


def test_back_action_returns_to_main_menu(api_client, farmer):
    body = post_text(api_client, "1*0")

    assert body.startswith("CON ")
    assert "2. Request input" in body


def test_my_matches_without_a_request(api_client, farmer):
    body = post_text(api_client, "3")

    assert body.startswith("END ")
    assert "No request yet" in body


def test_exit_option_ends_session(api_client, farmer):
    body = post_text(api_client, "0")

    assert body.startswith("END ")


def test_help_option_ends_session(api_client, farmer):
    body = post_text(api_client, "4")

    assert body.startswith("END ")
    assert "8080" in body


def test_invalid_option_reprompts_main_menu(api_client, farmer):
    body = post_text(api_client, "9")

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


def test_request_flow_prompts_before_saving(api_client, farmer, catalog_item):
    product, unit, _ = catalog_item

    body = post_text(api_client, "2")
    assert body.startswith("CON ")
    assert "Choose input type" in body

    body = post_text(api_client, "2*1")
    assert body.startswith("CON ")
    assert "Choose product" in body
    assert product.name in body

    body = post_text(api_client, "2*1*1")
    assert body.startswith("CON ")
    assert "Choose unit" in body
    assert unit.code in body

    body = post_text(api_client, "2*1*1*1")
    assert body.startswith("CON ")
    assert "Enter quantity" in body

    body = post_text(api_client, "2*1*1*1*10")
    assert body.startswith("CON ")
    assert "max price" in body

    body = post_text(api_client, "2*1*1*1*10*50")
    assert body.startswith("CON ")
    assert "1. Confirm" in body


def test_invalid_request_category_or_product_does_not_create_a_request(
    api_client, farmer, catalog_item
):
    invalid_category = post_text(api_client, "2*9", session_id="bad-category")
    invalid_product = post_text(api_client, "2*1*99", session_id="bad-product")

    assert invalid_category.startswith("CON ")
    assert "Choose input type" in invalid_category
    assert invalid_product.startswith("CON ")
    assert "Choose product" in invalid_product
    assert Request.objects.count() == 0


def test_confirm_creates_request_and_runs_matching(api_client, farmer, catalog_item):
    product, unit, listing = catalog_item

    body = post_text(api_client, "2*1*1*1*10*50*1", session_id="req-1")

    assert body.startswith("END ")
    assert "Match found. Top 1 of 1: Adama Agri Shop." in body
    assert "Location: Adama, Oromia." in body
    assert "Hawassa" not in body

    request = Request.objects.get(source_reference="req-1")
    assert request.owner_id == farmer.user_id
    assert request.kind == RequestKind.INPUT
    assert request.status == RequestStatus.MATCHED
    assert request.region == "Oromia"
    assert request.woreda == "Adama"

    line = request.lines.get()
    assert line.product_id == product.id
    assert line.unit_id == unit.id
    assert line.quantity == Decimal("10.00")
    assert line.max_unit_price == Decimal("50.00")

    candidate = request.candidates.get()
    assert candidate.listing_id == listing.id
    assert candidate.rank == 1
    assert candidate.score == Decimal("80.00")


def test_confirmation_reports_ranked_choice_when_multiple_suppliers_match(
    api_client, farmer, catalog_item
):
    product, unit, _ = catalog_item
    other_supplier = UserFactory(
        role=Role.SUPPLIER,
        supplier_approval_status=SupplierApprovalStatus.APPROVED,
        full_name="Other Supplier",
    )
    SupplierProfile.objects.create(
        user=other_supplier,
        tin_number=f"TIN-{other_supplier.pk}",
        company_name="Bahir Dar Shop",
        region="Amhara",
        woreda="Bahir Dar",
        product_categories=["seed"],
    )
    SupplierListingFactory(
        supplier=other_supplier,
        product=product,
        unit=unit,
        unit_price=Decimal("20.00"),
        region="Amhara",
        woreda="Bahir Dar",
    )

    body = post_text(api_client, "2*1*1*1*10*50*1", session_id="req-many")

    assert "Match found. Top 1 of 2: Adama Agri Shop." in body
    assert "Location: Adama, Oromia." in body
    assert "Bahir Dar Shop" not in body

    matches = post_text(api_client, "3", session_id="req-many-screen")
    assert matches.index("1. Adama Agri Shop") < matches.index("2. Bahir Dar Shop")
    assert "Adama, Oromia" in matches
    assert "Bahir Dar, Amhara" in matches


def test_missing_optional_location_values_are_omitted_from_match_response(
    api_client, farmer, catalog_item
):
    product, _, listing = catalog_item
    profile = listing.supplier.supplier_profile
    profile.region = ""
    profile.woreda = ""
    profile.save(update_fields=["region", "woreda"])
    listing.woreda = ""
    listing.save(update_fields=["woreda"])

    body = post_text(api_client, "2*1*1*1*10*50*1", session_id="req-no-woreda")

    assert "Match found." in body
    assert "Location: Oromia." in body
    assert "None" not in body
    assert ", Oromia" not in body


def test_pending_supplier_is_not_reported_as_a_match(api_client, farmer, catalog_item):
    _, _, listing = catalog_item
    listing.supplier.supplier_approval_status = SupplierApprovalStatus.PENDING
    listing.supplier.save(update_fields=["supplier_approval_status"])

    body = post_text(api_client, "2*1*1*1*10*50*1", session_id="req-pending-supplier")

    assert body == "END Request saved. No matches yet. Check My matches later."
    assert "Adama Agri Shop" not in body


def test_request_without_listings_is_saved_open(api_client, farmer):
    product = ProductFactory(name="Fertilizer A", category=ProductCategory.FERTILIZER)
    UnitFactory(name="Kilogram", code="kg")

    body = post_text(api_client, "2*2*1*1*10*50*1", session_id="req-2")

    assert body.startswith("END ")
    assert body == "END Request saved. No matches yet. Check My matches later."

    request = Request.objects.get(source_reference="req-2")
    assert request.status == RequestStatus.OPEN
    assert request.candidates.count() == 0
    assert request.lines.get().product_id == product.id


def test_retried_confirmation_does_not_duplicate_request(
    api_client, farmer, catalog_item
):
    text = "2*1*1*1*10*50*1"

    post_text(api_client, text, session_id="req-retry")
    body = post_text(api_client, text, session_id="req-retry")

    assert body.startswith("END ")
    assert Request.objects.filter(source_reference="req-retry").count() == 1
    assert RequestLine.objects.count() == 1


def test_back_steps_navigate_request_flow(api_client, farmer, catalog_item):
    assert "1. My account" in post_text(api_client, "2*0")
    assert "Choose input type" in post_text(api_client, "2*1*0")
    assert "Choose product" in post_text(api_client, "2*1*1*0")
    assert "Choose unit" in post_text(api_client, "2*1*1*1*0")
    assert "Enter quantity" in post_text(api_client, "2*1*1*1*10*0")
    assert "max price" in post_text(api_client, "2*1*1*1*10*50*0")


def test_invalid_numbers_repeat_the_same_prompt(api_client, farmer, catalog_item):
    body = post_text(api_client, "2*1*1*1*abc")
    assert "Enter a valid positive number." in body
    assert "Enter quantity" in body

    body = post_text(api_client, "2*1*1*1*10*abc")
    assert "Enter a valid positive number." in body
    assert "max price" in body


@pytest.mark.parametrize(
    ("text", "prompt", "session_id"),
    [
        ("2*1*1*1*0.001", "Enter quantity", "req-subcent-quantity"),
        ("2*1*1*1*10*0.001", "max price", "req-subcent-price"),
    ],
)
def test_subcent_values_repeat_prompt_without_persisting_request(
    api_client, farmer, catalog_item, text, prompt, session_id
):
    body = post_text(api_client, text, session_id=session_id)

    assert body.startswith("CON ")
    assert "Enter a valid positive number." in body
    assert prompt in body
    assert Request.objects.count() == 0
    assert RequestLine.objects.count() == 0


@pytest.mark.parametrize(
    ("text", "expected_quantity", "expected_price"),
    [
        ("2*1*1*1*0.01*50*1", Decimal("0.01"), Decimal("50.00")),
        ("2*1*1*1*10*0.01*1", Decimal("10.00"), Decimal("0.01")),
    ],
    ids=["minimum-quantity", "minimum-price"],
)
def test_minimum_decimal_values_are_accepted_and_persisted(
    api_client,
    farmer,
    catalog_item,
    text,
    expected_quantity,
    expected_price,
):
    session_id = f"req-min-{expected_quantity}-{expected_price}"
    body = post_text(api_client, text, session_id=session_id)

    assert body.startswith("END ")
    request = Request.objects.get()
    line = request.lines.get()
    assert line.quantity == expected_quantity
    assert line.max_unit_price == expected_price


def test_cancel_option_discards_request(api_client, farmer, catalog_item):
    body = post_text(api_client, "2*1*1*1*10*50*2", session_id="req-cancel")

    assert body.startswith("END ")
    assert "cancelled" in body.lower()
    assert Request.objects.filter(source_reference="req-cancel").exists() is False


def test_matches_screen_lists_ranked_candidates(api_client, farmer, catalog_item):
    post_text(api_client, "2*1*1*1*10*50*1", session_id="req-match")

    body = post_text(api_client, "3")

    assert body.startswith("END ")
    assert "Your matches" in body
    assert "Adama Agri" in body
    assert "40.00 ETB/kg" in body


def test_matches_screen_refreshes_after_a_supplier_lists(api_client, farmer):
    product = ProductFactory(name="Urea", category=ProductCategory.FERTILIZER)
    unit = UnitFactory(name="Kilogram", code="kg")
    post_text(api_client, "2*2*1*1*10*50*1", session_id="req-refresh")

    request = Request.objects.get(source_reference="req-refresh")
    assert request.status == RequestStatus.OPEN
    assert post_text(api_client, "3") == "END No matches yet. Check My matches later."

    SupplierListingFactory(
        product=product,
        unit=unit,
        unit_price=Decimal("40.00"),
        available_quantity=Decimal("100.00"),
        region="Oromia",
        woreda="Adama",
    )

    body = post_text(api_client, "3", session_id="req-refresh-2")

    assert "Your matches" in body
    request.refresh_from_db()
    assert request.status == RequestStatus.MATCHED
    assert request.candidates.count() == 1


def test_amharic_no_match_messages_do_not_promise_notification(
    api_client, farmer, settings
):
    settings.USSD_DEFAULT_LANGUAGE = "am"
    ProductFactory(category=ProductCategory.SEED)
    UnitFactory()
    body = post_text(api_client, "2*1*1*1*10*50*1", session_id="am-no-match")

    assert body == "END ጥያቄዎ ተቀምጧል። እስካሁን ግጥሚያ የለም።"
    assert "እናሳውቅ" not in body

    body = post_text(api_client, "3", session_id="am-matches-empty")
    assert body == "END እስካሁን ግጥሚያ የለም።"


def test_amharic_match_response_includes_supplier_and_listing_location(
    api_client, farmer, catalog_item, settings
):
    settings.USSD_DEFAULT_LANGUAGE = "am"

    body = post_text(api_client, "2*1*1*1*10*50*1", session_id="am-match")

    assert body.startswith("END ")
    assert "ግጥሚያ ተገኘ" in body
    assert "Adama Agri Shop" in body
    assert "Adama, Oromia" in body


def test_amharic_menu_is_served_when_configured(api_client, farmer, settings):
    settings.USSD_DEFAULT_LANGUAGE = "am"

    body = post_text(api_client, "")

    assert body.startswith("CON ")
    assert "አዝመራ" in body
    assert "ግብዓት ጠይቅ" in body
    assert "5. English" in body


def test_default_ussd_language_is_amharic():
    from apps.channels.menus import DEFAULT_LANGUAGE

    assert DEFAULT_LANGUAGE == "am"


def test_amharic_main_menu_switches_to_english(api_client, farmer, settings):
    settings.USSD_DEFAULT_LANGUAGE = "am"

    body = post_text(api_client, "5")

    assert body.startswith("CON ")
    assert "1. My account" in body
    assert "5. አማርኛ" in body


def test_language_switch_persists_across_screens(api_client, farmer, settings):
    settings.USSD_DEFAULT_LANGUAGE = "am"

    body = post_text(api_client, "5*1")

    assert body.startswith("CON ")
    assert "AZM:" in body
    assert "0. Back" in body


def test_language_can_switch_back_to_amharic(api_client, farmer, settings):
    settings.USSD_DEFAULT_LANGUAGE = "am"

    body = post_text(api_client, "5*5")

    assert body.startswith("CON ")
    assert "አዝመራ" in body
    assert "1. መለያዬ" in body


def test_english_menu_offers_amharic_switch(api_client, farmer):
    body = post_text(api_client, "")

    assert "5. አማርኛ" in body


def test_switched_language_applies_to_request_flow(api_client, farmer, settings):
    settings.USSD_DEFAULT_LANGUAGE = "am"

    body = post_text(api_client, "5*2")

    assert body.startswith("CON ")
    assert "Choose input type" in body
    assert "1. Seed" in body


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
