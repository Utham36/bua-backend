from django.contrib import admin
from .models import Category, Product

# We register the Product (which now holds the image inside it!)
admin.site.register(Category)
admin.site.register(Product)