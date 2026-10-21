# Auth endpoints - JWT via djangorestframework-simplejwt.
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Role, SupplierApprovalStatus, SupplierProfile
from .serializers import (
    AgentRegisterSerializer,
    MeSerializer,
    SupplierApprovalTokenRefreshSerializer,
    SupplierApprovalTokenSerializer,
    SupplierProfileSerializer,
    SupplierRegisterSerializer,
)


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


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        raw_refresh = request.data.get("refresh")
        if not raw_refresh:
            raise ValidationError({"refresh": "A refresh token is required."})
        try:
            token = RefreshToken(raw_refresh)
            if str(token.get("user_id")) != str(request.user.pk):
                raise ValidationError({"refresh": "This token does not belong to you."})
            token.blacklist()
        except TokenError as exc:
            raise ValidationError({"refresh": "Invalid or expired refresh token."}) from exc
        return Response(status=status.HTTP_204_NO_CONTENT)


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
