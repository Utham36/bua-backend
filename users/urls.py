from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenObtainPairView

urlpatterns = [
    # 1. Authentication (Use Class-based views)
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'), # Uses standard JWT Login

    # 2. User Profile (Use Class-based view)
    path('profile/', views.UserProfileView.as_view(), name='profile'),

    # 3. Vendor Profile (Use FUNCTION-based views - remove .as_view())
    path('vendor/profile/', views.vendor_profile_view, name='vendor-profile'),
    path('vendor/settings/', views.vendor_profile_view, name='vendor-settings'),

    # 4. Public Vendor Page (Use FUNCTION-based view)
    path('vendor/public/<int:user_id>/', views.public_vendor_profile, name='public-vendor-profile'),
]