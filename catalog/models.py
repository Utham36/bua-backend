from django.db import models
from django.contrib.auth.models import User
from cloudinary.models import CloudinaryField  # 👈 Added this import

# 1. CATEGORY
class Category(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name

# 2. PRODUCT
class Product(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE, null=True, blank=True)
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # 👇 UPDATED: Uses Cloudinary now
    image = CloudinaryField('image', folder='products', blank=True, null=True)
    
    stock = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# 3. REVIEW (New Feature! ⭐)
class Review(models.Model):
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(default=5) # 1 to 5 stars
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rating} stars for {self.product.name}"

# 4. PRODUCT GALLERY IMAGES
class ProductImage(models.Model):
    # This links the photo to a specific Product
    product = models.ForeignKey(Product, related_name='images', on_delete=models.CASCADE)
    
    # 👇 UPDATED: Uses Cloudinary now
    image = CloudinaryField('image', folder='product_gallery')

    def __str__(self):
        return f"Image for {self.product.name}"