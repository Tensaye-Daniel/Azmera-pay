# USSD menu copy, keyed by language so Amharic (FR-USSD-5) can be added later
# without touching the flow engine. Only English ships today.
DEFAULT_LANGUAGE = "en"

MESSAGES = {
    "en": {
        "title": "Azmera",
        "menu_body": "1. My account\n2. My matches\n3. Help\n0. Exit",
        "account_footer": "0. Back",
        "help": "Call 8080 or ask your local Azmera agent for help.",
        "matches_empty": "No matches yet. We will text you when a buyer is found.",
        "exit": "Thank you for using Azmera.",
        "invalid": "Invalid option.",
        "not_registered": (
            "This number is not registered. Ask your local Azmera agent to register you."
        ),
    },
    # "am": {...}  # Amharic translations land with FR-USSD-5.
}


def get_text(key, *, language=DEFAULT_LANGUAGE, **values):
    """Look up a menu string, falling back to English for unknown languages."""
    bundle = MESSAGES.get(language, MESSAGES[DEFAULT_LANGUAGE])
    template = bundle.get(key) or MESSAGES[DEFAULT_LANGUAGE].get(key, "")
    return template.format(**values) if values else template


def main_menu(*, language=DEFAULT_LANGUAGE):
    title = get_text("title", language=language)
    body = get_text("menu_body", language=language)
    return f"{title}\n{body}"
