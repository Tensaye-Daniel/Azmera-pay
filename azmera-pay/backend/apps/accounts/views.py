# Auth endpoints - JWT via djangorestframework-simplejwt.
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import AgentRegisterSerializer, MeSerializer, SupplierApprovalTokenSerializer,SupplierRegisterSerializer, SupplierApprovalTokenRefreshSerializer


class MeView(generics.RetrieveAPIView):
    serializer_class = MeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class AgentRegisterView(generics.CreateAPIView):
    serializer_class = AgentRegisterSerializer
    permission_classes = [permissions.AllowAny]

class SupplierRegisterView(generics.CreateAPIView):
    serializer_class = SupplierRegisterSerializer
    permission_classes = [permissions.AllowAny]

class SupplierApprovalTokenView(TokenObtainPairView):
    serializer_class = SupplierApprovalTokenSerializer

class SupplierApprovalTokenRefreshView(TokenRefreshView):
    serializer_class = SupplierApprovalTokenRefreshSerializer

__all__ = [
    "TokenObtainPairView",
    "TokenRefreshView",
    "MeView",
    "AgentRegisterView",
    "SupplierRegisterView",
    "SupplierApprovalTokenView",
    "SupplierApprovalTokenRefreshView",
]