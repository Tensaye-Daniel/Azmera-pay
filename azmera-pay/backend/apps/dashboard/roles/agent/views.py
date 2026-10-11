# Agent dashboard viewsets: farmers (register, list mine, detail, update).
from rest_framework import status, viewsets
from rest_framework.response import Response

from apps.accounts.models import Role
from apps.common.permissions import IsAdminOrAgent
from apps.profiles.models import FarmerProfile
from apps.profiles.serializers import FarmerProfileSerializer

from .serializers import FarmerRegistrationSerializer, FarmerUpdateSerializer


class FarmerViewSet(viewsets.ModelViewSet):
    """Agent registers farmers and works with the farmers they registered.

    Agents only ever see `registered_by = self`. Admins may view every record.
    """

    permission_classes = [IsAdminOrAgent]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_serializer_class(self):
        if self.action == "create":
            return FarmerRegistrationSerializer
        if self.action == "partial_update":
            return FarmerUpdateSerializer
        return FarmerProfileSerializer

    def get_queryset(self):
        queryset = FarmerProfile.objects.select_related("user", "registered_by")
        if self.request.user.role == Role.ADMIN:
            return queryset
        return queryset.filter(registered_by=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        farmer = serializer.save()
        output = FarmerProfileSerializer(farmer, context=self.get_serializer_context()).data
        headers = self.get_success_headers(output)
        return Response(output, status=status.HTTP_201_CREATED, headers=headers)