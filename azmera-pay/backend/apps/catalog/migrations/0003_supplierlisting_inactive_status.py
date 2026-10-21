from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("catalog", "0002_supplierlisting")]

    operations = [
        migrations.AlterField(
            model_name="supplierlisting",
            name="availability_status",
            field=models.CharField(
                choices=[
                    ("active", "Active"),
                    ("paused", "Paused"),
                    ("inactive", "Inactive"),
                    ("expired", "Expired"),
                ],
                default="active",
                max_length=10,
            ),
        ),
    ]
