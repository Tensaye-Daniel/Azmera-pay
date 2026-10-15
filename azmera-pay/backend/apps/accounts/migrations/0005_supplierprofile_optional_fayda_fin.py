from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0004_supplierprofile_product_categories_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="supplierprofile",
            name="fayda_fin_number",
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
    ]
