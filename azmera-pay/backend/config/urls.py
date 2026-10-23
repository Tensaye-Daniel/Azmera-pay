# Root URLconf - routes /admin/, the REST API under /api/v1/, and the USSD webhook.
from django.contrib import admin
from django.urls import include, path

from apps.channels.views import UssdCallbackView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("apps.accounts.urls")),
    path("api/v1/dashboard/agent/", include("apps.dashboard.roles.agent.urls")),
    path("api/v1/dashboard/admin/", include("apps.dashboard.roles.admin.urls")),
    path("ussd/", include("apps.channels.urls")),
    path("api/v1/catalog/", include("apps.catalog.urls")),
    # Fallback: some Africa's Talking channels are configured with the root URL
    # as the callback instead of /ussd/. Serve the USSD handler at "/" too so
    # those callbacks still parse instead of returning 404.
    path("", UssdCallbackView.as_view(), name="ussd-root"),
]
