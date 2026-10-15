from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Product, SupplierListing, Unit
from .permissions import IsSupplier
from .serializers import (
    ProductSerializer,
    SupplierListingSerializer,
    UnitSerializer,
)


class ProductListView(generics.ListAPIView):
    """Active products, for the listing form dropdown."""

    permission_classes = [IsAuthenticated]
    serializer_class = ProductSerializer
    queryset = Product.objects.filter(is_active=True).order_by("name")
    pagination_class = None


class UnitListView(generics.ListAPIView):
    """All units, for the listing form dropdown."""

    permission_classes = [IsAuthenticated]
    serializer_class = UnitSerializer
    queryset = Unit.objects.order_by("name")
    pagination_class = None


class SupplierListingListCreateView(generics.ListCreateAPIView):
    """List a supplier's own listings or create a listing."""

    permission_classes = [IsSupplier]
    serializer_class = SupplierListingSerializer

    def get_queryset(self):
        return (
            SupplierListing.objects
            .filter(supplier=self.request.user)
            .select_related("product", "unit", "supplier")
        )

    def perform_create(self, serializer):
        serializer.save(supplier=self.request.user)


class SupplierListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a supplier's own listing."""

    permission_classes = [IsSupplier]
    serializer_class = SupplierListingSerializer

    def get_queryset(self):
        return (
            SupplierListing.objects
            .filter(supplier=self.request.user)
            .select_related("product", "unit", "supplier")
        )
