# Dev helper: create a demo agent and admin so the web UI is usable quickly.
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.accounts.models import Role

User = get_user_model()


class Command(BaseCommand):
    help = "Create demo agent + admin users (development only)."

    def handle(self, *args, **options):
        created = []

        for phone, role, full_name, password in [
            ("+251911000001", Role.AGENT, "Agent Demeke", "demo-pass-123"),
            ("+251911000002", Role.ADMIN, "Admin Sara", "admin-pass-123"),
        ]:
            user, was_created = User.objects.get_or_create(
                phone=phone,
                defaults={"full_name": full_name, "role": role},
            )
            if was_created:
                user.role = role
                user.full_name = full_name
                user.set_password(password)
                user.save()
                created.append(f"{role}: {phone}")

        if created:
            self.stdout.write(self.style.SUCCESS("Created: " + ", ".join(created)))
        else:
            self.stdout.write(self.style.WARNING("Demo users already exist - nothing to do."))
