# /products, /availability routes
from django.urls import path

from .views import (
    ProductListView,
    SupplierListingDetailView,
    SupplierListingListCreateView,
    UnitListView,
)

urlpatterns = [
    path("products", ProductListView.as_view(),name="product-list"),
    path("units", UnitListView.as_view(),name="unit-list"),
    path("supplier/listings",SupplierListingListCreateView.as_view(),name="supplier-listing-list-create",),
    path(
    "supplier/listings/<uuid:pk>",
    SupplierListingDetailView.as_view(),
    name="supplier-listing-detail",
),
]
