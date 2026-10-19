# /ussd/ webhook route (Africa's Talking USSD callback).
from django.urls import path

from .views import UssdCallbackView

urlpatterns = [
    path("", UssdCallbackView.as_view(), name="ussd-callback"),
]
