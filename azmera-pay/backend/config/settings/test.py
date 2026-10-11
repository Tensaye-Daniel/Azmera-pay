# Test settings: in-memory database so tests run fast without Postgres.
import os

os.environ.setdefault("DJANGO_SECRET_KEY", "test-secret-key-with-at-least-32-bytes")
os.environ.setdefault("DB_URL", "sqlite://:memory:")

from .base import *  # noqa: F401, E402, F403


DEBUG = False

ALLOWED_HOSTS = ["testserver"]

# No throttling/blacklist surprises under pytest.
SIMPLE_JWT.update(
    {
        "REFRESH_TOKEN_LIFETIME": timedelta(days=1),
    }
)