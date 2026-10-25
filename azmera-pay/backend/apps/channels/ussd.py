# USSD menu flow. Africa's Talking resends the whole cumulative ``text`` on every
# screen, so the flow is derived from that string instead of a server-side step
# machine -- deterministic, easy to test, and resilient to dropped requests.
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

from django.db import transaction

from apps.catalog.models import AvailabilityStatus, Product, ProductCategory, Unit
from apps.matching.services import run_request_matching
from apps.profiles.models import FarmerProfile
from apps.requests.models import (
    Request,
    RequestKind,
    RequestLine,
    RequestSource,
    RequestStatus,
)

from .menus import (
    DEFAULT_LANGUAGE,
    LANGUAGE_SWITCH_OPTION,
    MESSAGES,
    get_text,
    main_menu,
)

MAX_OPTIONS = 5
MIN_DECIMAL = Decimal("0.01")
MAX_DECIMAL = Decimal("9999999999.99")

INPUT_CATEGORIES = {
    "1": ProductCategory.SEED,
    "2": ProductCategory.FERTILIZER,
    "3": ProductCategory.PESTICIDE,
    "4": ProductCategory.OTHER,
}


@dataclass(frozen=True)
class UssdResponse:
    message: str
    end: bool = False


def find_farmer(phone):
    """Resolve the farmer profile behind a normalized phone number, if any."""
    return (
        FarmerProfile.objects.select_related("user")
        .filter(user__phone=phone, user__is_active=True)
        .first()
    )


def handle_ussd(*, farmer, text, language=None, session_id=None):
    """Render the right screen for an incoming cumulative ``text`` value."""
    language = language if language in MESSAGES else DEFAULT_LANGUAGE

    if farmer is None:
        return UssdResponse(get_text("not_registered", language=language), end=True)

    parts = [part for part in text.split("*") if part] if text else []

    language, parts = _apply_language_switches(parts, language)
    if not parts:
        return UssdResponse(main_menu(language=language), end=False)

    choice = parts[0]
    rest = parts[1:]

    if choice == "1":
        return _account_screen(farmer, rest, language)
    if choice == "2":
        return _request_flow(farmer, rest, language, session_id)
    if choice == "3":
        return _matches_screen(farmer, language)
    if choice == "4":
        return UssdResponse(get_text("help", language=language), end=True)
    if choice == "0":
        return UssdResponse(get_text("exit", language=language), end=True)

    return UssdResponse(
        f"{get_text('invalid', language=language)}\n\n{main_menu(language=language)}",
        end=False,
    )


def _apply_language_switches(parts, language):
    """Toggle language for each leading language choice in the cumulative text."""
    while parts and parts[0] == LANGUAGE_SWITCH_OPTION:
        language = "en" if language == "am" else "am"
        parts = parts[1:]
    return language, parts


def _account_screen(farmer, parts, language):
    # "1*0" is the back action; any other sub-input re-renders the account screen.
    if parts and parts[-1] == "0":
        return UssdResponse(main_menu(language=language), end=False)
    return UssdResponse(_account_summary(farmer, language), end=False)


def _account_summary(farmer, language):
    profile_lines = [
        get_text("title", language=language),
        farmer.user.full_name,
        f"AZM: {farmer.azmera_account_number}",
        f"{farmer.region}, {farmer.woreda}",
        f"Crop: {farmer.primary_crop}",
        farmer.get_status_display(),
        get_text("account_footer", language=language),
    ]
    return "\n".join(profile_lines)


def _request_flow(farmer, parts, language, session_id):
    if parts == ["0"]:
        return UssdResponse(main_menu(language=language), end=False)

    # A trailing 0 backs out one screen: drop the answer and the screen input.
    if parts and parts[-1] == "0":
        parts = parts[:-2]

    return _render_request_path(farmer, parts, language, session_id)


def _render_request_path(farmer, parts, language, session_id):
    if not parts:
        return UssdResponse(get_text("request_category", language=language), end=False)

    category = INPUT_CATEGORIES.get(parts[0])
    if category is None:
        return UssdResponse(
            f"{get_text('invalid', language=language)}\n"
            f"{get_text('request_category', language=language)}",
            end=False,
        )

    products = _products_for(category)
    if not products:
        return UssdResponse(
            get_text("request_no_products", language=language), end=True
        )

    if len(parts) == 1:
        return UssdResponse(_product_menu(products, language), end=False)

    product = _pick(products, parts[1])
    if product is None:
        return UssdResponse(
            f"{get_text('invalid', language=language)}\n"
            f"{_product_menu(products, language)}",
            end=False,
        )

    if len(parts) == 2:
        return _unit_screen(product, language)

    units = _units_for(product)
    if not units:
        return UssdResponse(get_text("request_no_units", language=language), end=True)

    unit = _pick(units, parts[2])
    if unit is None:
        return UssdResponse(
            f"{get_text('invalid', language=language)}\n{_unit_menu(units, language)}",
            end=False,
        )

    if len(parts) == 3:
        return UssdResponse(get_text("request_quantity", language=language), end=False)

    quantity = _positive_decimal(parts[3])
    if quantity is None:
        return UssdResponse(
            f"{get_text('request_invalid_number', language=language)}\n"
            f"{get_text('request_quantity', language=language)}",
            end=False,
        )

    if len(parts) == 4:
        return UssdResponse(
            get_text("request_price", language=language, unit=unit.code), end=False
        )

    price = _positive_decimal(parts[4])
    if price is None:
        return UssdResponse(
            f"{get_text('request_invalid_number', language=language)}\n"
            f"{get_text('request_price', language=language, unit=unit.code)}",
            end=False,
        )

    confirm = get_text(
        "request_confirm",
        language=language,
        product=_short(product.name, 24),
        quantity=quantity,
        unit=unit.code,
        price=price,
    )

    if len(parts) == 5:
        return UssdResponse(confirm, end=False)

    if parts[5] == "2":
        return UssdResponse(get_text("request_cancelled", language=language), end=True)
    if parts[5] != "1":
        return UssdResponse(
            f"{get_text('invalid', language=language)}\n{confirm}", end=False
        )

    return _create_request(
        farmer=farmer,
        product=product,
        unit=unit,
        quantity=quantity,
        price=price,
        language=language,
        session_id=session_id,
    )


def _create_request(*, farmer, product, unit, quantity, price, language, session_id):
    # Africa's Talking can retry a callback; reuse the request created for this
    # gateway session instead of creating a duplicate.
    if session_id:
        existing = Request.objects.filter(source_reference=session_id).first()
        if existing is not None:
            if not existing.candidates.exists():
                run_request_matching(existing)
            return _saved_response(existing, language)

    with transaction.atomic():
        request = Request.objects.create(
            owner=farmer.user,
            kind=RequestKind.INPUT,
            status=RequestStatus.OPEN,
            region=farmer.region,
            woreda=farmer.woreda,
            source=RequestSource.USSD,
            source_reference=session_id or None,
        )
        RequestLine.objects.create(
            request=request,
            product=product,
            unit=unit,
            quantity=quantity,
            max_unit_price=price,
        )
        run_request_matching(request)

    return _saved_response(request, language)


def _saved_response(request, language):
    candidates = request.candidates.select_related(
        "listing__supplier__supplier_profile", "listing"
    ).order_by("rank")
    count = candidates.count()
    if not count:
        return UssdResponse(
            get_text("request_saved_no_matches", language=language), end=True
        )

    top_match = candidates.first()
    return UssdResponse(
        get_text(
            "request_saved_match",
            language=language,
            rank=top_match.rank,
            count=count,
            supplier=_supplier_name(top_match.listing.supplier, language),
            location=_listing_location(top_match.listing, language),
        ),
        end=True,
    )


def _matches_screen(farmer, language):
    request = (
        Request.objects.filter(
            owner=farmer.user,
            kind=RequestKind.INPUT,
            status__in=[RequestStatus.OPEN, RequestStatus.MATCHED],
        )
        .order_by("-created_at")
        .first()
    )

    if request is None:
        return UssdResponse(get_text("matches_none", language=language), end=True)

    # Refresh the snapshot so suppliers added after the request are included.
    run_request_matching(request)
    if not request.candidates.exists():
        return UssdResponse(get_text("matches_empty", language=language), end=True)

    candidates = request.candidates.select_related(
        "listing__unit", "listing__supplier__supplier_profile"
    ).order_by("rank")[:3]

    lines = [get_text("matches_header", language=language)]
    for candidate in candidates:
        lines.append(
            get_text(
                "match_line",
                language=language,
                rank=candidate.rank,
                supplier=_supplier_name(candidate.listing.supplier, language),
                price=f"{candidate.listing.unit_price:.2f}",
                unit=candidate.listing.unit.code,
                location=_listing_location(candidate.listing, language),
            )
        )
    lines.append(get_text("matches_footer", language=language))

    return UssdResponse("\n".join(lines), end=True)


def _products_for(category):
    return list(
        Product.objects.filter(category=category, is_active=True).order_by("name")[
            :MAX_OPTIONS
        ]
    )


def _units_for(product):
    units = list(
        Unit.objects.filter(
            listings__product=product,
            listings__availability_status=AvailabilityStatus.ACTIVE,
        )
        .distinct()
        .order_by("name")[:MAX_OPTIONS]
    )
    if units:
        return units
    return list(Unit.objects.order_by("name")[:MAX_OPTIONS])


def _product_menu(products, language):
    lines = [get_text("request_product", language=language)]
    lines.extend(
        f"{index}. {_short(product.name, 20)}"
        for index, product in enumerate(products, 1)
    )
    lines.append(get_text("back", language=language))
    return "\n".join(lines)


def _unit_screen(product, language):
    units = _units_for(product)
    if not units:
        return UssdResponse(get_text("request_no_units", language=language), end=True)
    return UssdResponse(_unit_menu(units, language), end=False)


def _unit_menu(units, language):
    lines = [get_text("request_unit", language=language)]
    lines.extend(
        f"{index}. {_short(unit.code, 20)}" for index, unit in enumerate(units, 1)
    )
    lines.append(get_text("back", language=language))
    return "\n".join(lines)


def _pick(options, value):
    try:
        index = int(value)
    except ValueError:
        return None
    if 1 <= index <= len(options):
        return options[index - 1]
    return None


def _positive_decimal(value):
    try:
        number = Decimal(value)
    except InvalidOperation:
        return None
    if not number.is_finite() or number <= 0:
        return None
    number = number.quantize(Decimal("0.01"))
    if number < MIN_DECIMAL or number > MAX_DECIMAL:
        return None
    return number


def _supplier_name(supplier, language=DEFAULT_LANGUAGE):
    profile = getattr(supplier, "supplier_profile", None)
    name = profile.company_name.strip() if profile else ""
    return (
        _short(name, 18)
        if name
        else get_text("supplier_name_unavailable", language=language)
    )


def _listing_location(listing, language=DEFAULT_LANGUAGE):
    location = [
        _short(value.strip(), 18)
        for value in (listing.woreda, listing.region)
        if value and value.strip()
    ]
    return (
        ", ".join(location)
        if location
        else get_text("location_unavailable", language=language)
    )


def _short(value, limit):
    value = str(value)
    return value if len(value) <= limit else f"{value[: limit - 1]}~"
