# Admin dashboard: verify farmers and suppliers.
from django.db.models import Count, Q
from django.http import HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.models import Role, SupplierApprovalStatus, SupplierProfile, User
from apps.common.permissions import IsAdmin
from apps.profiles.documents import decrypt_document
from apps.profiles.models import FarmerDocument, FarmerProfile, FarmerStatus

from .serializers import (
    AdminFarmerSerializer,
    AdminSupplierSerializer,
    AdminUserSerializer,
    UserStatusSerializer,
)


class UserAdminViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdmin]
    queryset = User.objects.all().order_by("-id")
    serializer_class = AdminUserSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get("role")
        status_filter = self.request.query_params.get("status")
        search = self.request.query_params.get("search")

        if role in Role.values:
            queryset = queryset.filter(role=role)
        if status_filter == "active":
            queryset = queryset.filter(is_active=True)
        elif status_filter == "inactive":
            queryset = queryset.filter(is_active=False)
        if search:
            queryset = queryset.filter(
                Q(phone__icontains=search)
                | Q(full_name__icontains=search)
                | Q(email__icontains=search)
            )
        return queryset

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Dashboard counters for review queues and account mix."""
        users_by_role = {
            row["role"]: row["count"]
            for row in User.objects.values("role").annotate(count=Count("id"))
        }
        farmers_by_status = {
            row["status"]: row["count"]
            for row in FarmerProfile.objects.values("status").annotate(
                count=Count("id")
            )
        }
        suppliers_by_approval = {
            row["supplier_approval_status"]: row["count"]
            for row in User.objects.filter(role=Role.SUPPLIER)
            .values("supplier_approval_status")
            .annotate(count=Count("id"))
        }

        return Response(
            {
                "users": {
                    "total": User.objects.count(),
                    "by_role": {
                        role: users_by_role.get(role, 0) for role in Role.values
                    },
                },
                "farmers": {
                    "total": FarmerProfile.objects.count(),
                    "by_status": {
                        status_value: farmers_by_status.get(status_value, 0)
                        for status_value in FarmerStatus.values
                    },
                },
                "suppliers": {
                    "total": User.objects.filter(role=Role.SUPPLIER).count(),
                    "by_approval": {
                        approval: suppliers_by_approval.get(approval, 0)
                        for approval in SupplierApprovalStatus.values
                    },
                },
            }
        )

    @action(detail=True, methods=["patch"])
    def status(self, request, pk=None):
        user = self.get_object()
        serializer = UserStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        update_fields = []

        for field in ("is_active", "role", "supplier_approval_status"):
            if field in serializer.validated_data:
                setattr(user, field, serializer.validated_data[field])
                update_fields.append(field)

        if update_fields:
            user.save(update_fields=update_fields)
        return Response(AdminUserSerializer(user).data)


class SupplierAdminViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdmin]
    queryset = (
        SupplierProfile.objects.select_related("user").all().order_by("-user__id")
    )
    serializer_class = AdminSupplierSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        approval = self.request.query_params.get("approval")
        status_filter = self.request.query_params.get("status")
        search = self.request.query_params.get("search")

        if approval in SupplierApprovalStatus.values:
            queryset = queryset.filter(user__supplier_approval_status=approval)
        if status_filter == "active":
            queryset = queryset.filter(user__is_active=True)
        elif status_filter == "inactive":
            queryset = queryset.filter(user__is_active=False)
        if search:
            queryset = queryset.filter(
                Q(company_name__icontains=search)
                | Q(tin_number__icontains=search)
                | Q(user__phone__icontains=search)
                | Q(user__full_name__icontains=search)
            )
        return queryset

    @action(detail=True, methods=["patch"])
    def approve(self, request, pk=None):
        profile = self.get_object()
        profile.user.supplier_approval_status = SupplierApprovalStatus.APPROVED
        profile.user.is_active = True
        profile.user.save(update_fields=["supplier_approval_status", "is_active"])
        return Response(AdminSupplierSerializer(profile).data)

    @action(detail=True, methods=["patch"])
    def reject(self, request, pk=None):
        profile = self.get_object()
        profile.user.supplier_approval_status = SupplierApprovalStatus.REJECTED
        profile.user.save(update_fields=["supplier_approval_status"])
        return Response(AdminSupplierSerializer(profile).data)

    @action(detail=True, methods=["patch"])
    def activate(self, request, pk=None):
        profile = self.get_object()
        profile.user.is_active = True
        profile.user.save(update_fields=["is_active"])
        return Response(AdminSupplierSerializer(profile).data)

    @action(detail=True, methods=["patch"])
    def deactivate(self, request, pk=None):
        profile = self.get_object()
        profile.user.is_active = False
        profile.user.save(update_fields=["is_active"])
        return Response(AdminSupplierSerializer(profile).data)


class FarmerAdminViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAdmin]
    queryset = (
        FarmerProfile.objects.select_related("user", "registered_by")
        .prefetch_related("documents")
        .all()
        .order_by("-created_at")
    )
    serializer_class = AdminFarmerSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        search = self.request.query_params.get("search")
        region = self.request.query_params.get("region")

        if status_filter in FarmerStatus.values:
            queryset = queryset.filter(status=status_filter)
        if region:
            queryset = queryset.filter(region__icontains=region)
        if search:
            queryset = queryset.filter(
                Q(user__full_name__icontains=search)
                | Q(user__phone__icontains=search)
                | Q(azmera_account_number__icontains=search)
                | Q(fayda_fin__icontains=search)
            )
        return queryset

    def document(self, request, pk=None, document_id=None):
        """Stream a decrypted document for admin review.

        Only admins can reach this view; the ciphertext never leaves the
        database unencrypted except through this audited endpoint.
        """
        profile = self.get_object()
        try:
            document = FarmerDocument.objects.get(pk=document_id, farmer=profile)
        except (FarmerDocument.DoesNotExist, ValueError):
            return Response({"detail": "Document not found."}, status=404)

        try:
            content = decrypt_document(document.encrypted_data)
        except ValueError:
            return Response(
                {"detail": "Document could not be decrypted."},
                status=500,
            )

        response = HttpResponse(
            content, content_type=document.content_type or "application/octet-stream"
        )
        filename = document.original_filename.replace('"', "")
        response["Content-Disposition"] = f'inline; filename="{filename}"'
        response["X-Content-Type-Options"] = "nosniff"
        return response

    @action(detail=True, methods=["patch"])
    def verify(self, request, pk=None):
        profile = self.get_object()
        profile.status = FarmerStatus.REGISTERED
        profile.user.is_active = True
        profile.save(update_fields=["status"])
        profile.user.save(update_fields=["is_active"])
        return Response(AdminFarmerSerializer(profile).data)

    @action(detail=True, methods=["patch"])
    def pending(self, request, pk=None):
        profile = self.get_object()
        profile.status = FarmerStatus.PENDING
        profile.save(update_fields=["status"])
        return Response(AdminFarmerSerializer(profile).data)

    @action(detail=True, methods=["patch"])
    def unverify(self, request, pk=None):
        profile = self.get_object()
        profile.status = FarmerStatus.UNVERIFIED
        profile.save(update_fields=["status"])
        return Response(AdminFarmerSerializer(profile).data)

    @action(detail=True, methods=["patch"])
    def activate(self, request, pk=None):
        profile = self.get_object()
        profile.user.is_active = True
        profile.user.save(update_fields=["is_active"])
        return Response(AdminFarmerSerializer(profile).data)

    @action(detail=True, methods=["patch"])
    def deactivate(self, request, pk=None):
        profile = self.get_object()
        profile.user.is_active = False
        profile.user.save(update_fields=["is_active"])
        return Response(AdminFarmerSerializer(profile).data)
