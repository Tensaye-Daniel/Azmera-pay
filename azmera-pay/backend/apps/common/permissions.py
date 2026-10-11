# Permission guards: role checks + ownership scoping for the agent dashboard.
from rest_framework.permissions import BasePermission

from apps.accounts.models import Role


class IsAgent(BasePermission):
    """Authenticated agent only."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == Role.AGENT)


class IsAdminOrAgent(BasePermission):
    """Agents reach their own records; admins may view every record."""

    def has_permission(self, request, view):
        user = request.user
        if not (user and user.is_authenticated):
            return False
        return user.role in (Role.AGENT, Role.ADMIN)


class IsAdmin(BasePermission):
    """Authenticated admin only."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.role == Role.ADMIN)