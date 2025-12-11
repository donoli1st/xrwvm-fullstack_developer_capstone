from django.contrib import admin
from .models import CarMake, CarModel


# Inline class for CarModel
class CarModelInline(admin.TabularInline):
    model = CarModel
    extra = 1  # how many empty rows to show by default


# Admin for CarModel (optional but nice)
class CarModelAdmin(admin.ModelAdmin):
    list_display = ("name", "car_make", "type", "year", "dealer_id")
    list_filter = ("car_make", "type", "year")
    search_fields = ("name", "car_make__name")


# Admin for CarMake with CarModel inline
class CarMakeAdmin(admin.ModelAdmin):
    list_display = ("name", "country")
    search_fields = ("name", "country")
    inlines = [CarModelInline]


# Register models here
admin.site.register(CarMake, CarMakeAdmin)
admin.site.register(CarModel, CarModelAdmin)
