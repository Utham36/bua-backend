from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes # 👈 Needed for the new view

# 👇 Update imports to include the new Vendor logic
from .serializers import UserSerializer, RegisterSerializer, VendorProfileSerializer
from .models import VendorProfile

# 1. Sign Up View (Kept unchanged)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

# 2. Basic User Profile (Kept unchanged)
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# 3. 👇 NEW: Vendor Store Settings (Logo, Description, etc.)
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def vendor_profile_view(request):
    # Find the profile for the logged-in user, or create one if it doesn't exist
    profile, created = VendorProfile.objects.get_or_create(user=request.user)

    if request.method == 'GET':
        serializer = VendorProfileSerializer(profile)
        return Response(serializer.data)

    elif request.method == 'PUT':
        # partial=True allows updating just one field (like just the phone number)
        serializer = VendorProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    from rest_framework.permissions import AllowAny # 👈 Make sure this is imported
from django.shortcuts import get_object_or_404
from .models import VendorProfile
from django.contrib.auth.models import User
from .serializers import VendorProfileSerializer

# 👇 NEW: Public Storefront View (For Buyers)
@api_view(['GET'])
@permission_classes([AllowAny]) # Anyone can see this
def public_vendor_profile(request, user_id):
    # 1. Get the User
    user = get_object_or_404(User, id=user_id)
    
    # 2. Get their profile (if it exists)
    try:
        profile = VendorProfile.objects.get(user=user)
        serializer = VendorProfileSerializer(profile)
        return Response(serializer.data)
    except VendorProfile.DoesNotExist:
        return Response({"error": "Vendor profile not found"}, status=404)