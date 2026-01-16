from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # 1. CATALOG (Products)
    path('api/products/', include('catalog.urls')),

    # 2. ORDERS
    path('api/orders/', include('orders.urls')),
    
    # 3. USERS (Auth)
    path('api/users/', include('users.urls')),
    
    # 4. CHAT (👇 THIS IS THE NEW PART YOU NEEDED)
    path('api/chat/', include('chat.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    