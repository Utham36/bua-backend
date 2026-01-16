from rest_framework import serializers
from .models import Product, Category, Review, ProductImage

# 1. REVIEW SERIALIZER
class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = Review
        fields = ['id', 'user', 'username', 'product', 'rating', 'comment', 'created_at']
        read_only_fields = ['user', 'product', 'created_at']

# 2. IMAGE SERIALIZER
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image']

# 3. PRODUCT SERIALIZER
class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    reviews = ReviewSerializer(many=True, read_only=True)
    
    # Read-only fields for display
    seller_username = serializers.ReadOnlyField(source='seller.username')
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Product
        fields = [
            'id', 'seller', 'seller_username',
            'name', 'description', 'price', 
            'category', 'category_name', 
            'images', 'uploaded_images', 'reviews', 'created_at'
        ]
        read_only_fields = ['seller', 'created_at']

    # 👇 LOGIC FOR CREATING NEW PRODUCTS
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        product = Product.objects.create(**validated_data)
        for image in uploaded_images:
            ProductImage.objects.create(product=product, image=image)
        return product

    # 👇 LOGIC FOR UPDATING EXISTING PRODUCTS (THE FIX IS HERE) 🛠️
    def update(self, instance, validated_data):
        # 1. Extract the new images (if any)
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # 2. Update the standard fields (Name, Price, etc.)
        instance = super().update(instance, validated_data)
        
        # 3. IF new images were uploaded, REPLACE the old ones
        if uploaded_images:
            # Step A: Delete all old images for this product
            ProductImage.objects.filter(product=instance).delete()
            
            # Step B: Add the new images
            for image in uploaded_images:
                ProductImage.objects.create(product=instance, image=image)
            
        return instance