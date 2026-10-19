# Gateway adapters that parse inbound USSD callbacks into one common shape.
# Africa's Talking is the production provider; the mock adapter mimics the same
# payload so tests and manual curl calls exercise the real parsing path.
from dataclasses import dataclass

from django.conf import settings

from apps.common.utils import normalize_phone


@dataclass(frozen=True)
class UssdRequest:
    session_id: str
    phone: str
    text: str
    service_code: str = ""


class BaseUssdGateway:
    """Turn a decoded request body into a normalized :class:`UssdRequest`."""

    name = "base"

    def parse(self, data) -> UssdRequest:
        raise NotImplementedError


class AfricaTalkingGateway(BaseUssdGateway):
    """Africa's Talking posts form fields: sessionId, phoneNumber, text, serviceCode.

    ``text`` is cumulative for the session (e.g. ``"1"`` then ``"1*2"``) and is
    empty on the first request.
    """

    name = "africastalking"

    def parse(self, data) -> UssdRequest:
        session_id = (data.get("sessionId") or "").strip()
        raw_phone = (data.get("phoneNumber") or "").strip()
        if not session_id or not raw_phone:
            raise ValueError("Missing sessionId or phoneNumber.")

        return UssdRequest(
            session_id=session_id,
            phone=normalize_phone(raw_phone),
            text=(data.get("text") or "").strip(),
            service_code=(data.get("serviceCode") or "").strip(),
        )


class MockGateway(AfricaTalkingGateway):
    """Same payload shape as Africa's Talking, used when USSD_GATEWAY=mock."""

    name = "mock"


_GATEWAYS = {
    AfricaTalkingGateway.name: AfricaTalkingGateway,
    MockGateway.name: MockGateway,
}


def get_gateway() -> BaseUssdGateway:
    """Return the gateway configured by ``settings.USSD_GATEWAY`` (mock fallback)."""
    return _GATEWAYS.get(settings.USSD_GATEWAY, MockGateway)()
