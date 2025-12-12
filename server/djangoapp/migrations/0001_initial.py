import django.core.validators
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='CarMake',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                ('name', models.CharField(max_length=100)),
                ('description', models.TextField(blank=True)),
                (
                    'country',
                    models.CharField(
                        max_length=100,
                        blank=True,
                        null=True,
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name='CarModel',
            fields=[
                (
                    'id',
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name='ID',
                    ),
                ),
                ('dealer_id', models.IntegerField()),
                ('name', models.CharField(max_length=100)),
                (
                    'type',
                    models.CharField(
                        choices=[
                            ('SEDAN', 'Sedan'),
                            ('SUV', 'SUV'),
                            ('WAGON', 'Wagon'),
                            ('COUPE', 'Coupe'),
                            ('TRUCK', 'Truck'),
                        ],
                        default='SUV',
                        max_length=10,
                    ),
                ),
                (
                    'year',
                    models.IntegerField(
                        validators=[
                            django.core.validators.MinValueValidator(2015),
                            django.core.validators.MaxValueValidator(2023),
                        ],
                    ),
                ),
                (
                    'color',
                    models.CharField(
                        max_length=50,
                        blank=True,
                        null=True,
                    ),
                ),
                (
                    'car_make',
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name='models',
                        to='djangoapp.carmake',
                    ),
                ),
            ],
        ),
    ]
