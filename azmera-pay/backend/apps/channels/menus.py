# USSD menu copy, keyed by language. English and Amharic ship today; the flow
# engine only ever looks strings up through get_text().
DEFAULT_LANGUAGE = "en"

MESSAGES = {
    "en": {
        "title": "Azmera",
        "menu_body": (
            "1. My account\n2. Request input\n3. My matches\n4. Help\n0. Exit"
        ),
        "account_footer": "0. Back",
        "help": "Call 8080 or ask your local Azmera agent for help.",
        "matches_empty": "No matches yet. Check My matches later.",
        "matches_none": "No request yet. Choose 2 to request input.",
        "matches_header": "Your matches:",
        "match_line": "{rank}. {supplier} ({location}) - {price} ETB/{unit}",
        "matches_footer": "Reply 0 to exit.",
        "exit": "Thank you for using Azmera.",
        "invalid": "Invalid option.",
        "not_registered": (
            "This number is not registered. Ask your local Azmera agent to register you."
        ),
        "error": "Service temporarily unavailable. Please try again.",
        "back": "0. Back",
        "request_category": (
            "Choose input type:\n"
            "1. Seed\n"
            "2. Fertilizer\n"
            "3. Pesticide\n"
            "4. Other\n"
            "0. Back"
        ),
        "request_product": "Choose product:",
        "request_unit": "Choose unit:",
        "request_quantity": "Enter quantity (e.g. 10):",
        "request_price": "Enter max price per {unit} in ETB:",
        "request_invalid_number": "Enter a valid positive number.",
        "request_no_products": (
            "No products available in this category. Ask your agent."
        ),
        "request_no_units": "No units configured. Ask your agent.",
        "request_confirm": (
            "{product}\n{quantity} {unit} at max {price} ETB\n1. Confirm\n2. Cancel"
        ),
        "request_cancelled": "Request cancelled.",
        "request_saved_match": (
            "Match found. Top {rank} of {count}: {supplier}. "
            "Location: {location}. Dial again and choose My matches."
        ),
        "supplier_name_unavailable": "Supplier name unavailable",
        "location_unavailable": "Location details unavailable",
        "request_saved_no_matches": (
            "Request saved. No matches yet. Check My matches later."
        ),
    },
    "am": {
        "title": "አዝመራ",
        "menu_body": ("1. መለያዬ\n2. ግብዓት ጠይቅ\n3. ግጥሚያዎቼ\n4. እርዳታ\n0. ውጣ"),
        "account_footer": "0. ተመለስ",
        "help": "ለእርዳታ 8080 ይደውሉ ወይም ወኪልዎን ይጠይቁ።",
        "matches_empty": "እስካሁን ግጥሚያ የለም።",
        "matches_none": "እስካሁን ጥያቄ የለም። ግብዓት ለመጠየቅ 2 ይምረጡ።",
        "matches_header": "የእርስዎ ግጥሚያዎች:",
        "match_line": "{rank}. {supplier} ({location}) - {price} ብር/{unit}",
        "matches_footer": "ለመውጣት 0 ይምረጡ።",
        "exit": "አዝመራን ስለተጠቀሙ እናመሰግናለን።",
        "invalid": "ልክ ያልሆነ ምርጫ።",
        "not_registered": "ይህ ቁጥር አልተመዘገበም። እባክዎ ወኪልዎን ያግኙ።",
        "error": "አገልግሎቱ ለጊዜው አይገኝም። እባክዎ እንደገና ይሞክሩ።",
        "back": "0. ተመለስ",
        "request_category": (
            "የግብዓት ዓይነት ይምረጡ:\n1. ዘር\n2. ማዳበሪያ\n3. ፀረ-ተባይ\n4. ሌላ\n0. ተመለስ"
        ),
        "request_product": "ምርት ይምረጡ:",
        "request_unit": "መለኪያ ይምረጡ:",
        "request_quantity": "ብዛት ያስገቡ (ለምሳሌ 10):",
        "request_price": "ከፍተኛ ዋጋ በ{unit} በብር ያስገቡ:",
        "request_invalid_number": "ትክክለኛ አዎንታዊ ቁጥር ያስገቡ።",
        "request_no_products": "በዚህ ዓይነት ምርቶች የሉም። ወኪልዎን ይጠይቁ።",
        "request_no_units": "መለኪያዎች አልተዘጋጁም። ወኪልዎን ይጠይቁ።",
        "request_confirm": (
            "{product}\n{quantity} {unit} በከፍተኛ {price} ብር\n1. አረጋግጥ\n2. ሰርዝ"
        ),
        "request_cancelled": "ጥያቄው ተሰርዟል።",
        "request_saved_match": (
            "ግጥሚያ ተገኘ። #{rank}/{count}: {supplier}. "
            "ቦታ: {location}. እንደገና ደውለው 3 ይምረጡ።"
        ),
        "supplier_name_unavailable": "የአቅራቢ ስም የለም",
        "location_unavailable": "የቦታ መረጃ የለም",
        "request_saved_no_matches": ("ጥያቄዎ ተቀምጧል። እስካሁን ግጥሚያ የለም።"),
    },
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
