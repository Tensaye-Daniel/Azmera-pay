# Auth endpoints - JWT via djangorestframework-simplejwt.
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import MeSerializer


class MeView(generics.RetrieveAPIView):
    serializer_class = MeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


__all__ = ["TokenObtainPairView", "TokenRefreshView", "MeView"]