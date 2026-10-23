# Africa's Talking USSD webhook. The gateway POSTs form fields and expects a
# plain-text reply: "CON <prompt>" to keep the session open, "END <message>" to
# hang up. We keep an append-only log of every exchange for troubleshooting.
import logging

from django.conf import settings
from django.http import HttpResponse
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from .gateways import get_gateway
from .menus import DEFAULT_LANGUAGE, get_text
from .models import USSDInteraction, USSDSession, USSDSessionStatus
from .ussd import UssdResponse, find_farmer, handle_ussd

CONTENT_TYPE = "text/plain"
logger = logging.getLogger(__name__)


def format_ussd_response(message, *, end):
    """Prefix with CON/END and clamp to the gateway's per-screen length limit."""
    prefix = "END" if end else "CON"
    limit = getattr(settings, "USSD_MAX_MESSAGE_LENGTH", 182)
    return f"{prefix} {message.strip()[:limit]}"


def callback_is_authorized(request):
    """Enforce the optional shared secret; Africa's Talking does not sign callbacks."""
    secret = getattr(settings, "USSD_CALLBACK_SECRET", "")
    if not secret:
        return True
    provided = request.query_params.get("token") or request.headers.get(
        "X-USSD-Secret", ""
    )
    return provided == secret


def configured_language():
    language = getattr(settings, "USSD_DEFAULT_LANGUAGE", DEFAULT_LANGUAGE)
    return language if language else DEFAULT_LANGUAGE


class UssdCallbackView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    parser_classes = [FormParser, MultiPartParser, JSONParser]

    def get(self, request):
        return HttpResponse(
            "Azmera USSD endpoint. Point the Africa's Talking shortcode here.",
            content_type=CONTENT_TYPE,
        )

    def post(self, request):
        if not callback_is_authorized(request):
            return HttpResponse(
                "END Unauthorized", status=403, content_type=CONTENT_TYPE
            )

        try:
            inbound = get_gateway().parse(request.data)
        except ValueError as exc:
            return HttpResponse(
                format_ussd_response(str(exc), end=True), content_type=CONTENT_TYPE
            )

        language = configured_language()
        farmer = find_farmer(inbound.phone)

        try:
            result = handle_ussd(
                farmer=farmer,
                text=inbound.text,
                language=language,
                session_id=inbound.session_id,
            )
        except Exception:
            logger.exception("USSD callback failed for session %s", inbound.session_id)
            result = UssdResponse(get_text("error", language=language), end=True)

        body = format_ussd_response(result.message, end=result.end)

        session, _ = USSDSession.objects.update_or_create(
            session_id=inbound.session_id,
            defaults={
                "phone": inbound.phone,
                "service_code": inbound.service_code,
                "farmer": farmer,
                "last_text": inbound.text,
                "status": (
                    USSDSessionStatus.COMPLETED
                    if result.end
                    else USSDSessionStatus.ACTIVE
                ),
            },
        )
        USSDInteraction.objects.create(
            session=session,
            inbound_text=inbound.text,
            outbound_text=body,
        )

        return HttpResponse(body, content_type=CONTENT_TYPE)
