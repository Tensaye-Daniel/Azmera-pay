# /auth routes: register, login (JWT pair), token refresh, current user.
from django.urls import path

from .views import AgentRegisterView, MeView, TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("auth/register", AgentRegisterView.as_view(), name="register"),
    path("auth/login", TokenObtainPairView.as_view(), name="login"),
    path("auth/token/refresh", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/me", MeView.as_view(), name="me"),
]