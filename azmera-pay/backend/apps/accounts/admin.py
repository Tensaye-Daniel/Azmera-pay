from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import SupplierProfile, User


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

    def get_fieldsets(self, request, obj=None):
        fieldsets = super().get_fieldsets(request, obj)
        if request.user.is_superuser:
            return fieldsets

        restricted_fields = {
            "role",
            "is_staff",
            "is_superuser",
            "groups",
            "user_permissions",
        }
        safe_fieldsets = []

        for title, options in fieldsets:
            fields = tuple(
                field
                for field in options["fields"]
                if field not in restricted_fields
            )
            if fields:
                safe_fieldsets.append((title, {**options, "fields": fields}))

        return safe_fieldsets

    def get_readonly_fields(self, request, obj=None):
        readonly_fields = list(super().get_readonly_fields(request, obj))
        if obj is not None and obj.pk == request.user.pk:
            readonly_fields.append("supplier_approval_status")
        return readonly_fields


@admin.register(SupplierProfile)
class SupplierProfileAdmin(admin.ModelAdmin):
    """Let reviewers inspect supplier applications without editing profile data."""

    list_display = (
        "company_name",
        "contact_person",
        "phone",
        "tin_number",
        "approval_status",
    )
    list_filter = ("user__supplier_approval_status",)
    search_fields = (
        "company_name",
        "user__full_name",
        "user__phone",
        "tin_number",
    )
    ordering = ("company_name",)
    fields = (
        "company_name",
        "contact_person",
        "phone",
        "tin_number",
        "approval_status",
        "region",
        "woreda",
        "product_categories",
    )
    readonly_fields = fields

    @admin.display(description="Contact person", ordering="user__full_name")
    def contact_person(self, obj):
        return obj.user.full_name

    @admin.display(description="Phone", ordering="user__phone")
    def phone(self, obj):
        return obj.user.phone

    @admin.display(
        description="Approval status",
        ordering="user__supplier_approval_status",
    )
    def approval_status(self, obj):
        return obj.user.get_supplier_approval_status_display()

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("user")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False