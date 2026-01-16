from rest_framework import generics, permissions, parsers, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Product, Category, Review
from .serializers import ProductSerializer, ReviewSerializer

# 👇 IMPORT THE NEW PERMISSION
from .permissions import IsVendorOrAdmin

# 1. LIST PRODUCTS (Anyone can see this)
class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description', 'category__name'] 

# 2. PRODUCT DETAIL & EDIT (The Fix is Here!) 🛠️
class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    
    # 👇 FIX 1: Security - Only Vendors/Admins can edit/delete
    permission_classes = [IsVendorOrAdmin] 
    
    # 👇 FIX 2: Image Upload Support - This was missing!
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

# 3. CREATE PRODUCT (🔒 SECURED)
class ProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsVendorOrAdmin]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def perform_create(self, serializer):
        category_id = self.request.data.get('category')
        category = None
        if category_id:
            try:
                category = Category.objects.get(id=category_id)
            except Category.DoesNotExist:
                category = None
        serializer.save(seller=self.request.user, category=category)

# 4. CREATE REVIEW (Buyers need to be logged in)
class ReviewCreateView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        product_id = self.request.data.get('product_id')
        product = Product.objects.get(id=product_id)
        serializer.save(user=self.request.user, product=product)

# 5. CATEGORIES
class CategoryListView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        data = [{"id": c.id, "name": c.name} for c in categories]
        return Response(data)

# 6. VENDOR DASHBOARD LIST
class VendorProductListView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter products to return ONLY the ones created by the current user
        return Product.objects.filter(seller=self.request.user).order_by('-created_at')