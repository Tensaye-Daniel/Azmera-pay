# Auth endpoints - JWT via djangorestframework-simplejwt.
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import AgentRegisterSerializer, MeSerializer


class MeView(generics.RetrieveAPIView):
    serializer_class = MeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class AgentRegisterView(generics.CreateAPIView):
    serializer_class = AgentRegisterSerializer
    permission_classes = [permissions.AllowAny]


__all__ = [
    "TokenObtainPairView",
    "TokenRefreshView",
    "MeView",
    "AgentRegisterView",
]