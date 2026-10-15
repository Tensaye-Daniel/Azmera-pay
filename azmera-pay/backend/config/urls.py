# Root URLconf - routes /admin/, the REST API under /api/v1/, and the USSD webhook.
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("apps.accounts.urls")),
    path("api/v1/dashboard/agent/", include("apps.dashboard.roles.agent.urls")),
    path("ussd/", include("apps.channels.urls")),
    path("api/v1/catalog/",include("apps.catalog.urls")),
]
