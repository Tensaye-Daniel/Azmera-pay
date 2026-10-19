# USSD menu flow. Africa's Talking resends the whole cumulative ``text`` on every
# screen, so the flow is derived from that string instead of a server-side step
# machine -- deterministic, easy to test, and resilient to dropped requests.
from dataclasses import dataclass

from apps.profiles.models import FarmerProfile

from .menus import get_text, main_menu


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


def handle_ussd(*, farmer, text):
    """Render the right screen for an incoming cumulative ``text`` value."""
    if farmer is None:
        return UssdResponse(get_text("not_registered"), end=True)

    parts = [part for part in text.split("*") if part] if text else []

    if not parts:
        return UssdResponse(main_menu(), end=False)

    choice = parts[0]

    if choice == "1":
        return _account_screen(farmer, parts)
    if choice == "2":
        return UssdResponse(get_text("matches_empty"), end=True)
    if choice == "3":
        return UssdResponse(get_text("help"), end=True)
    if choice == "0":
        return UssdResponse(get_text("exit"), end=True)

    return UssdResponse(f"{get_text('invalid')}\n\n{main_menu()}", end=False)


def _account_screen(farmer, parts):
    # "1*0" is the back action; any other sub-input re-renders the account screen.
    if len(parts) > 1 and parts[1] == "0":
        return UssdResponse(main_menu(), end=False)
    return UssdResponse(_account_summary(farmer), end=False)


def _account_summary(farmer):
    profile_lines = [
        get_text("title"),
        farmer.user.full_name,
        f"AZM: {farmer.azmera_account_number}",
        f"{farmer.region}, {farmer.woreda}",
        f"Crop: {farmer.primary_crop}",
        farmer.get_status_display(),
        get_text("account_footer"),
    ]
    return "\n".join(profile_lines)
