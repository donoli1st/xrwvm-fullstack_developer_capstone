from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator


class CarMake(models.Model):
    """
    CarMake model:
    - Represents a car manufacturer (e.g., BMW, Tesla, Toyota)
    """
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    country = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return self.name


class CarModel(models.Model):
    """
    CarModel model:
    - Many-to-one relationship to CarMake (one make -> many models)
    - dealer_id refers to a dealer stored in the external (Cloudant) DB
    """
    car_make = models.ForeignKey(
        CarMake,
        on_delete=models.CASCADE,
        related_name="models"
    )
    dealer_id = models.IntegerField()

    name = models.CharField(max_length=100)

    CAR_TYPES = [
        ("SEDAN", "Sedan"),
        ("SUV", "SUV"),
        ("WAGON", "Wagon"),
        ("COUPE", "Coupe"),
        ("TRUCK", "Truck"),
    ]
    type = models.CharField(
        max_length=10,
        choices=CAR_TYPES,
        default="SUV",
    )

    year = models.IntegerField(
        validators=[
            MinValueValidator(2015),
            MaxValueValidator(2023),
        ]
    )

    color = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.car_make.name} {self.name} ({self.year})"
