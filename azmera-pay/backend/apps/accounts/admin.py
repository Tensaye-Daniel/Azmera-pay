from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Role, User


@admin.register(User)
class AzmeraUserAdmin(UserAdmin):
    list_display = ["phone", "full_name", "role", "is_active", "is_staff"]
    ordering = ["-id"]
    search_fields = ["phone", "full_name"]
    list_filter = ["role", "is_active", "is_staff"]

    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        ("Personal info", {"fields": ("full_name", "email", "role")}),
        (
            "Permissions",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
    )
    add_fieldsets = (
        (
            None,
            {"classes": ("wide",), "fields": ("phone", "full_name", "role", "password1", "password2")},
        ),
    )