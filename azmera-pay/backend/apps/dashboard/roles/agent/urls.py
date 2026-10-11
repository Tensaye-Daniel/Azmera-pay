# /api/v1/dashboard/agent/... route map (explicit paths, matching the spec).
from django.urls import path

from .views import FarmerViewSet

farmer_list = FarmerViewSet.as_view({"get": "list", "post": "create"})
farmer_summary = FarmerViewSet.as_view({"get": "summary"})
farmer_detail = FarmerViewSet.as_view({"get": "retrieve", "patch": "partial_update"})

urlpatterns = [
    path("farmers", farmer_list, name="farmer-list"),
    path("farmers/summary", farmer_summary, name="farmer-summary"),
    path("farmers/<uuid:pk>", farmer_detail, name="farmer-detail"),
]