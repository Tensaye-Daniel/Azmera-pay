# Root URLconf - routes /api/ and /admin/
from django.contrib import admin
from django.urls import path


urlpatterns = [
    path("admin/", admin.site.urls),
]