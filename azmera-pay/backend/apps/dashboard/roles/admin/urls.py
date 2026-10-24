# /api/v1/dashboard/admin/... route map
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import FarmerAdminViewSet, SupplierAdminViewSet, UserAdminViewSet

router = DefaultRouter(trailing_slash=False)
router.register(r"users", UserAdminViewSet, basename="admin-users")
router.register(r"suppliers", SupplierAdminViewSet, basename="admin-suppliers")
router.register(r"farmers", FarmerAdminViewSet, basename="admin-farmers")

farmer_document = FarmerAdminViewSet.as_view({"get": "document"})

urlpatterns = [
    *router.urls,
    path(
        "farmers/<uuid:pk>/documents/<uuid:document_id>",
        farmer_document,
        name="admin-farmer-document",
    ),
]
