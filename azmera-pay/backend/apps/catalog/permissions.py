from rest_framework.permissions import BasePermission
from django.core.exceptions import ObjectDoesNotExist

from apps.accounts.models import Role, SupplierApprovalStatus


class IsSupplier(BasePermission):
    """Allow approved suppliers with completed shop setup."""

    message = "Complete your shop setup before using supplier dashboard features."

    @staticmethod
    def setup_is_complete(user):
        try:
            profile = user.supplier_profile
        except ObjectDoesNotExist:
            return False

        return bool(
            profile.region.strip()
            and profile.woreda.strip()
            and isinstance(profile.product_categories, list)
            and profile.product_categories
        )

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.role == Role.SUPPLIER
            and user.supplier_approval_status == SupplierApprovalStatus.APPROVED
            and self.setup_is_complete(user)
        )
