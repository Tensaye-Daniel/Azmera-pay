from django.contrib import admin

from .models import USSDInteraction, USSDSession


@admin.register(USSDSession)
class USSDSessionAdmin(admin.ModelAdmin):
    list_display = ("session_id", "phone", "farmer", "status", "created_at")
    list_filter = ("status", "created_at")
    search_fields = ("session_id", "phone")
    readonly_fields = (
        "session_id",
        "phone",
        "service_code",
        "farmer",
        "status",
        "state",
        "last_text",
        "created_at",
        "updated_at",
    )

    def has_add_permission(self, request):
        return False


@admin.register(USSDInteraction)
class USSDInteractionAdmin(admin.ModelAdmin):
    list_display = ("session", "inbound_text", "created_at")
    list_filter = ("created_at",)
    search_fields = ("session__phone",)
    readonly_fields = ("session", "inbound_text", "outbound_text", "created_at")

    def has_add_permission(self, request):
        return False
