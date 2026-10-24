from django.urls import path

from .views import SupplierMatchListView

urlpatterns = [
    path("supplier/matches/", SupplierMatchListView.as_view(), name="supplier-matches"),
]
