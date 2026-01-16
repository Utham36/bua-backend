from django.urls import path
from .views import (
    ProductListView, 
    ProductDetailView, 
    ProductCreateView, 
    ReviewCreateView, 
    CategoryListView,
    VendorProductListView  # 👈 Make sure this is imported!
)

urlpatterns = [
    # 1. Public Marketplace URLs
    path('', ProductListView.as_view(), name='product_list'),
    path('<int:pk>/', ProductDetailView.as_view(), name='product_detail'),
    path('categories/', CategoryListView.as_view(), name='category_list'),

    # 2. Buying & Selling URLs
    path('create/', ProductCreateView.as_view(), name='product_create'),
    path('reviews/create/', ReviewCreateView.as_view(), name='review_create'),

    # 👇 3. THIS IS THE MISSING LINK CAUSING THE 404 ERROR
    path('my-products/', VendorProductListView.as_view(), name='my_products'),
]