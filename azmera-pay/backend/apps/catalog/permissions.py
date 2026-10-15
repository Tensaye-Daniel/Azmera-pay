from rest_framework.permissions import BasePermission

from apps.accounts.models import Role, SupplierApprovalStatus


class IsSupplier(BasePermission):
    """Allow access only to authenticated supplier accounts."""

    message = "Your supplier accounts can manage supplier listings."

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.role == Role.SUPPLIER
            and user.supplier_approval_status == SupplierApprovalStatus.APPROVED
        )
