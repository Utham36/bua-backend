from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth 
from .models import Order, OrderItem
from catalog.models import Product

# 👇 PDF IMPORTS
from django.http import HttpResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors # 👈 This is the key import
import io

# 👇 Import the Smart Serializers
from .serializers import OrderSerializer, VendorOrderSerializer

# 1. CREATE ORDER (Public)
class OrderCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def create(self, request, *args, **kwargs):
        user = request.user
        data = request.data
        cart_items = data.get('items', [])
        
        phone_number = data.get('phone', '') 
        delivery_address = data.get('address', '')

        total_price = 0
        for item in cart_items:
            try:
                product = Product.objects.get(id=item['product_id'])
                total_price += product.price * item['quantity']
            except Product.DoesNotExist:
                return Response({"error": f"Product {item['product_id']} not found"}, status=400)

        order = Order.objects.create(
            user=user, 
            total_price=total_price,
            phone=phone_number,
            address=delivery_address
        )

        for item in cart_items:
            product = Product.objects.get(id=item['product_id'])
            OrderItem.objects.create(
                order=order,
                product=product,
                price=product.price,
                quantity=item['quantity']
            )

        return Response({"message": "Order Placed Successfully", "order_id": order.id}, status=status.HTTP_201_CREATED)

# 2. LIST MY ORDERS
class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

# 3. MANAGER LIST
class ManagerOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(items__product__seller=user).distinct().order_by('-created_at')

# 4. VENDOR DASHBOARD
class VendorDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        user = request.user
        if user.is_superuser:
            items = OrderItem.objects.all()
        else:
            items = OrderItem.objects.filter(product__seller=user)

        total_sales = items.filter(status='DELIVERED').aggregate(Sum('price'))['price__sum'] or 0
        total_orders = items.values('order').distinct().count()
        pending_orders = items.filter(status='PENDING').count()

        monthly_sales = (
            items.filter(status='DELIVERED')
            .annotate(month=TruncMonth('order__created_at'))
            .values('month')
            .annotate(total=Sum('price'))
            .order_by('month')
        )

        chart_data = []
        for entry in monthly_sales:
            if entry['month']:
                chart_data.append({
                    "name": entry['month'].strftime('%b'),
                    "sales": entry['total']
                })

        recent_transactions = items.order_by('-id')[:10].values(
            'id', 'product__name', 'price', 'quantity', 'status', 'order__created_at'
        )

        return Response({
            "total_sales": total_sales,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "chart_data": chart_data,
            "recent_transactions": recent_transactions
        })

# 5. UPDATE STATUS (Order)
class OrderStatusUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)

# 6. VENDOR ORDER LIST
class VendorOrderListView(generics.ListAPIView):
    serializer_class = VendorOrderSerializer 
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Order.objects.filter(items__product__seller=user).distinct().order_by('-created_at')

# 7. UPDATE ITEM STATUS
class OrderItemStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        new_status = request.data.get('status')
        try:
            order = Order.objects.get(id=pk)
            my_items = order.items.filter(product__seller=user)
            my_items.update(status=new_status)
            return Response({"message": "Item Status Updated"}, status=200)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)

# 8. GENERATE PDF (✅ FIXED COLOR ERROR)
class GenerateWaybillPDF(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            try:
                order = Order.objects.get(id=pk)
            except Order.DoesNotExist:
                return Response({"error": "Order not found"}, status=404)

            buffer = io.BytesIO()
            p = canvas.Canvas(buffer, pagesize=letter)
            width, height = letter

            # --- HEADER ---
            p.setFont("Helvetica-Bold", 24)
            # 👇 FIX: Use colors.HexColor instead of setFillColorHex
            p.setFillColor(colors.HexColor("#8B0000")) 
            p.drawString(50, height - 50, "BUA Group")
            
            p.setFont("Helvetica", 10)
            p.setFillColor(colors.black)
            p.drawString(50, height - 65, "Foods & Infrastructure Ltd.")
            p.drawString(50, height - 78, "Lagos HQ, Nigeria")

            p.setFont("Helvetica-Bold", 16)
            p.drawRightString(width - 50, height - 50, "OFFICIAL WAYBILL")
            
            wb_num = getattr(order, 'waybill_number', None) or f"WB-{order.id}"
            p.setFont("Helvetica", 12)
            p.drawRightString(width - 50, height - 70, f"NO: {wb_num}")
            
            if hasattr(order, 'created_at') and order.created_at:
                date_str = order.created_at.strftime('%Y-%m-%d')
            else:
                date_str = "N/A"
            p.drawRightString(width - 50, height - 85, f"DATE: {date_str}")

            p.setStrokeColor(colors.gray)
            p.line(50, height - 100, width - 50, height - 100)

            # --- CUSTOMER DETAILS ---
            y = height - 130
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, y, "CONSIGNEE (BUYER):")
            p.setFont("Helvetica", 12)
            
            buyer_obj = getattr(order, 'user', getattr(order, 'buyer', None))
            if buyer_obj:
                 buyer_name = getattr(buyer_obj, 'username', 'Valued Customer')
            else:
                 buyer_name = "Guest Customer"
            
            phone = getattr(order, 'phone', 'N/A') or 'N/A'
            address = getattr(order, 'address', 'Pickup at Depot') or 'Pickup at Depot'

            p.drawString(50, y - 15, f"Name: {buyer_name}") 
            p.drawString(50, y - 30, f"Phone: {str(phone)}")
            p.drawString(50, y - 45, f"Destination: {str(address)}")

            # --- ITEMS TABLE ---
            y = y - 80
            # 👇 FIX: Use colors.HexColor here too
            p.setFillColor(colors.HexColor("#eeeeee")) 
            p.rect(50, y, width - 100, 20, fill=1, stroke=0)
            p.setFillColor(colors.black)
            p.setFont("Helvetica-Bold", 10)
            p.drawString(60, y + 6, "ITEM DESCRIPTION")
            p.drawString(300, y + 6, "QTY")
            p.drawString(350, y + 6, "UNIT PRICE")
            p.drawString(450, y + 6, "STATUS")

            y = y - 20
            p.setFont("Helvetica", 10)
            
            items_manager = getattr(order, 'items', getattr(order, 'orderitem_set', None))
            
            if items_manager:
                items = items_manager.all()
                if not items:
                     p.drawString(60, y, "No Items in Order")
                for item in items:
                    product = getattr(item, 'product', None)
                    p_name = getattr(product, 'name', "Unknown Item") if product else "Unknown Item"
                    p_status = str(getattr(item, 'status', 'PENDING') or 'PENDING')
                    p_qty = str(getattr(item, 'quantity', 0))
                    p_price = getattr(item, 'price', 0)

                    p.drawString(60, y, str(p_name))
                    p.drawString(300, y, p_qty)
                    p.drawString(350, y, f"N{p_price:,.2f}")
                    p.drawString(450, y, p_status)
                    y -= 20
            else:
                p.drawString(60, y, "No Items Found (Database Error)")

            # --- FOOTER ---
            y -= 20
            p.line(50, y, width - 50, y)
            y -= 20
            p.setFont("Helvetica-Bold", 14)
            
            total_val = getattr(order, 'total_price', 0)
            p.drawRightString(width - 50, y, f"TOTAL VALUE: N{total_val:,.2f}")

            p.setFont("Helvetica-Oblique", 8)
            p.setFillColor(colors.gray)
            p.drawCentredString(width / 2, 50, "This is a computer-generated document. No signature required.")
            p.drawCentredString(width / 2, 40, "Powered by BUA Group Logistics System.")

            p.showPage()
            p.save()
            buffer.seek(0)
            return HttpResponse(buffer, content_type='application/pdf')

        except Exception as e:
            print(f"❌ PDF GENERATION ERROR: {e}")
            return Response({"error": f"Server Error: {str(e)}"}, status=500)