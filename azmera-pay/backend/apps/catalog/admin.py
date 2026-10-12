from django.contrib import admin

from .models import Product, SupplierListing, Unit


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "is_active")
    list_filter = ("category", "is_active")
    search_fields = ("name",)


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ("name", "code")
    search_fields = ("name", "code")


@admin.register(SupplierListing)
class SupplierListingAdmin(admin.ModelAdmin):
    list_display = ("product", "supplier", "available_quantity", "unit", "unit_price",
                    "region", "woreda", "availability_status")
    list_filter = ("availability_status", "region")
    search_fields = ("woreda", "product__name")