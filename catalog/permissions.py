from rest_framework import permissions

# 👇 The class name MUST be 'IsVendorOrAdmin' to match your views.py
class IsVendorOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow Vendors or Admins to create/edit products.
    """
    def has_permission(self, request, view):
        # 1. READ-ONLY: Allow anyone to view (GET)
        if request.method in permissions.SAFE_METHODS:
            return True

        # 2. LOGIN CHECK: Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # 3. ADMIN CHECK: Allow if Staff or Superuser
        if request.user.is_staff or request.user.is_superuser:
            return True

        # 4. VENDOR CHECK: Allow if user is in 'Vendors' group
        return request.user.groups.filter(name='Vendors').exists()

    def has_object_permission(self, request, view, obj):
        # Allow reading to anyone
        if request.method in permissions.SAFE_METHODS:
            return True
        # Allow admins to edit anything
        if request.user.is_staff:
            return True
        # Vendors can only edit their OWN products
        return getattr(obj, 'seller', None) == request.user