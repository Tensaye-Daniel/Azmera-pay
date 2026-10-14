# /auth routes: register, login (JWT pair), token refresh, current user.
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import AgentRegisterView, MeView, SupplierApprovalTokenView, SupplierRegisterView,SupplierApprovalTokenRefreshView,SupplierProfileView

urlpatterns = [
    path("auth/register", AgentRegisterView.as_view(), name="register"),
    path("auth/register/supplier", SupplierRegisterView.as_view(), name="supplier-register"),
    path("auth/login", SupplierApprovalTokenView.as_view(), name="login"),
    path("auth/token/refresh", SupplierApprovalTokenRefreshView.as_view(), name="token-refresh"),
    path("auth/me", MeView.as_view(), name="me"),
    path(
    "supplier/profile",
    SupplierProfileView.as_view(),
    name="supplier-profile",
),
]