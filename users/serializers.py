from rest_framework import serializers
from django.contrib.auth.models import User
from .models import VendorProfile  # 👈 Import the new model we created

# 1. Used for showing user info (Profile)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')

# 2. Used for registering new users (Sign Up)
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # This creates the user securely (hashing the password)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

# 3. 👇 NEW: Used for the Vendor Profile Page
class VendorProfileSerializer(serializers.ModelSerializer):
    # Read-only fields from the main User model (so we can see email/username but not edit them here)
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = VendorProfile
        fields = ['store_name', 'phone_number', 'address', 'description', 'logo', 'email', 'username']