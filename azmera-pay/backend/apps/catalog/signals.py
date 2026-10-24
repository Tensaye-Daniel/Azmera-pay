"""Keep persisted match candidates current when supplier listings change."""
import logging

from django.db import transaction
from django.db.models import Q
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from apps.catalog.models import AvailabilityStatus, Product, SupplierListing
from apps.requests.models import Request, RequestKind, RequestStatus

logger = logging.getLogger(__name__)

_MATCH_FIELDS = (
    "product_id",
    "unit_id",
    "available_quantity",
    "unit_price",
    "region",
    "woreda",
    "availability_status",
)


@receiver(pre_save, sender=SupplierListing)
def remember_listing_match_fields(sender, instance, **kwargs):
    if instance.pk:
        instance._previous_match_fields = (
            sender.objects.filter(pk=instance.pk)
            .values_list(*_MATCH_FIELDS)
            .first()
        )
    else:
        instance._previous_match_fields = None


@receiver(post_save, sender=SupplierListing)
def rematch_requests_for_listing(sender, instance, created, **kwargs):
    current_fields = tuple(getattr(instance, field) for field in _MATCH_FIELDS)
    previous_fields = getattr(instance, "_previous_match_fields", None)
    if not created and previous_fields == current_fields:
        return

    listing_id = instance.pk

    def refresh_candidates():
        try:
            listing = (
                SupplierListing.objects.select_related("product")
                .filter(pk=listing_id)
                .first()
            )
            if listing is None:
                return

            affected = Request.objects.filter(kind=RequestKind.INPUT).filter(
                Q(candidates__listing_id=listing_id)
                | Q(
                    status__in=[RequestStatus.OPEN, RequestStatus.MATCHED],
                    lines__product__category=listing.product.category,
                    lines__unit_id=listing.unit_id,
                    lines__quantity__lte=listing.available_quantity,
                    lines__max_unit_price__gte=listing.unit_price,
                )
            )
            if (
                listing.availability_status != AvailabilityStatus.ACTIVE
                or not listing.product.is_active
            ):
                affected = affected.filter(candidates__listing_id=listing_id)

            from apps.matching.services import run_request_matching

            for request in affected.distinct().iterator():
                try:
                    run_request_matching(request)
                except Exception:
                    logger.exception(
                        "Failed to refresh request %s after supplier listing %s changed",
                        request.pk,
                        listing_id,
                    )
        except Exception:
            logger.exception(
                "Failed to find requests affected by supplier listing %s",
                listing_id,
            )

    transaction.on_commit(refresh_candidates)


@receiver(pre_save, sender=Product)
def remember_product_match_fields(sender, instance, **kwargs):
    if instance.pk:
        instance._previous_match_fields = (
            sender.objects.filter(pk=instance.pk)
            .values_list("is_active", "category")
            .first()
        )
    else:
        instance._previous_match_fields = None


@receiver(post_save, sender=Product)
def rematch_requests_for_product(sender, instance, created, **kwargs):
    previous_match_fields = getattr(instance, "_previous_match_fields", None)
    current_match_fields = (instance.is_active, instance.category)
    if (
        created
        or previous_match_fields is None
        or previous_match_fields == current_match_fields
    ):
        return

    product_id = instance.pk
    affected_categories = {instance.category}
    affected_categories.add(previous_match_fields[1])

    def refresh_candidates():
        try:
            affected = Request.objects.filter(
                kind=RequestKind.INPUT,
                status__in=[RequestStatus.OPEN, RequestStatus.MATCHED],
            ).filter(
                Q(lines__product__category__in=affected_categories)
                | Q(candidates__listing__product_id=product_id)
            )
            from apps.matching.services import run_request_matching

            for request in affected.distinct().iterator():
                try:
                    run_request_matching(request)
                except Exception:
                    logger.exception(
                        "Failed to refresh request %s after product %s active state changed",
                        request.pk,
                        product_id,
                    )
        except Exception:
            logger.exception(
                "Failed to find requests affected by product %s active state change",
                product_id,
            )

    transaction.on_commit(refresh_candidates)
