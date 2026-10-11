# Shared helpers (phone normalization so web and USSD phone numbers always match).
import re


def normalize_phone(value):
    """Normalize an Ethiopian phone number to E.164 form, e.g. '+251912345678'.

    Accepts '0912345678', '251912345678', '+251912345678', '912345678' and
    returns '+251912345678'. Raises ValueError for anything else so callers can
    surface a clear validation error.
    """
    if value is None:
        return None

    digits = re.sub(r"\D", "", str(value))

    if digits.startswith("0"):
        digits = digits[1:]

    if not digits.startswith("251"):
        digits = "251" + digits

    if len(digits) != 12:
        raise ValueError("phone number must be a valid Ethiopian number (e.g. 0912345678)")

    return f"+{digits}"