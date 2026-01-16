from rest_framework import serializers
from .models import Order, OrderItem

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    
    class Meta:
        model = OrderItem
        # 👇 'status' is here, so the frontend receives it!
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'status']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'user', 'total_price', 'is_paid', 'created_at', 'items', 'status', 'phone', 'address']

# 👇 VENDOR SERIALIZER (Updated for Item Status)
class VendorOrderSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    items = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField() 

    class Meta:
        model = Order
        fields = ['id', 'user', 'items', 'total_price', 'status', 'created_at']

    def get_items(self, obj):
        # Only show items belonging to the logged-in Vendor
        vendor = self.context['request'].user
        items = obj.items.filter(product__seller=vendor)
        return OrderItemSerializer(items, many=True).data

    def get_total_price(self, obj):
        # Calculate total only for this vendor's items
        vendor = self.context['request'].user
        items = obj.items.filter(product__seller=vendor)
        return sum(item.price * item.quantity for item in items)

    def get_status(self, obj):
        # Return the status of the vendor's item
        vendor = self.context['request'].user
        item = obj.items.filter(product__seller=vendor).first()
        return item.status if item else "PENDING"