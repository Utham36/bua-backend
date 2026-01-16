from django.urls import path
from .views import (
    OrderCreateView, 
    OrderListView, 
    VendorDashboardView, 
    ManagerOrderListView, 
    VendorOrderListView,
    OrderItemStatusUpdateView,
    # 👇 Import the new PDF View
    GenerateWaybillPDF
)

urlpatterns = [
    # 1. Student places order
    path('create/', OrderCreateView.as_view(), name='order-create'),

    # 2. Student sees their history
    path('', OrderListView.as_view(), name='order-list'),

    # 3. Vendor sees Sales Stats
    path('vendor-stats/', VendorDashboardView.as_view(), name='vendor-stats'),

    # 4. Manager sees ALL orders
    path('all/', ManagerOrderListView.as_view(), name='manager-orders'),

    # 5. Updates ONLY your items (Chicken) instead of the whole Order
    path('update/<int:pk>/', OrderItemStatusUpdateView.as_view(), name='order-update'),

    # 6. Vendor sees their specific sales
    path('vendor-orders/', VendorOrderListView.as_view(), name='vendor-orders'),

    # 7. 🖨️ PRINT WAYBILL (The new PDF feature)
    path('print-waybill/<int:pk>/', GenerateWaybillPDF.as_view(), name='print-waybill'),
]