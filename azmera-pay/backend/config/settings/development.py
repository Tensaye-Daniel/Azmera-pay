# Dev settings (debug on, sqlite/postgres, CORS)
from .base import *

DEBUG = True

ALLOWED_HOSTS = [*ALLOWED_HOSTS, "localhost", "127.0.0.1"]

# ngrok forwards the public Host header, and Django also needs CSRF trust for
# any browser POSTs tunnelled from the same host.
CSRF_TRUSTED_ORIGINS = [
    *env.list("CSRF_TRUSTED_ORIGINS", default=[]),
    *(f"https://{host}" for host in ALLOWED_HOSTS if not host.startswith(("localhost", "127."))),
]
