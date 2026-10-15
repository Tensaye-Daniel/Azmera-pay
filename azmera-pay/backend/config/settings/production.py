# Prod settings (debug off, tightened hosts; whitenoise/static later).
from .base import *  # noqa: F401, F403

DEBUG = False

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[])
