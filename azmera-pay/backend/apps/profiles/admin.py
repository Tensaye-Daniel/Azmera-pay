from django.contrib import admin

from .models import FarmerDocument, FarmerProfile


class FarmerDocumentInline(admin.TabularInline):
    model = FarmerDocument
    extra = 0
    can_delete = False
    fields = (
        "document_type",
        "original_filename",
        "content_type",
        "size_bytes",
        "checksum",
        "created_at",
    )
    readonly_fields = fields

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(FarmerProfile)
class FarmerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "azmera_account_number",
        "full_name",
        "region",
        "woreda",
        "status",
        "created_at",
    )
    list_filter = ("status", "region", "land_ownership")
    search_fields = (
        "azmera_account_number",
        "user__full_name",
        "user__phone",
        "fayda_fin",
    )
    readonly_fields = ("azmera_account_number", "created_at", "updated_at")
    inlines = (FarmerDocumentInline,)

    @admin.display(description="Farmer")
    def full_name(self, obj):
        return obj.user.full_name
