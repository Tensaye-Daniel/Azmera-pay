# Auth endpoints - JWT via djangorestframework-simplejwt.
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.exceptions import PermissionDenied
from .serializers import AgentRegisterSerializer, MeSerializer, SupplierApprovalTokenSerializer,SupplierRegisterSerializer, SupplierApprovalTokenRefreshSerializer,SupplierProfileSerializer
from .models import Role, SupplierApprovalStatus, SupplierProfile

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


class SupplierProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = SupplierProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user

        if user.role != Role.SUPPLIER:
            raise PermissionDenied(
                "Only supplier accounts can access shop setup."
            )

        if user.supplier_approval_status != SupplierApprovalStatus.APPROVED:
            raise PermissionDenied(
                "Your supplier account must be approved first."
            )

        try:
            return user.supplier_profile
        except SupplierProfile.DoesNotExist as exc:
            from rest_framework.exceptions import NotFound
            raise NotFound("Supplier profile was not found.") from exc

__all__ = [
    "TokenObtainPairView",
    "TokenRefreshView",
    "MeView",
    "AgentRegisterView",
    "SupplierRegisterView",
    "SupplierApprovalTokenView",
    "SupplierApprovalTokenRefreshView",
]