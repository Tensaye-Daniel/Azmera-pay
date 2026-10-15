from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Role, SupplierApprovalStatus, User


@admin.register(User)
class AzmeraUserAdmin(UserAdmin):
    list_display = [
        "phone",
        "full_name",
        "role",
        "supplier_approval_status",
        "is_active",
        "is_staff",
    ]
    ordering = ["-id"]
    search_fields = ["phone", "full_name"]
    list_filter = [
        "role",
        "supplier_approval_status",
        "is_active",
        "is_staff",
    ]

    fieldsets = (
        (None, {"fields": ("phone", "password")}),
        ("Personal info", {"fields": ("full_name", "email", "role")}),
        (
            "Supplier approval",
            {"fields": ("supplier_approval_status",)},
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "phone",
                    "full_name",
                    "role",
                    "password1",
                    "password2",
                ),
            },
        ),
    )