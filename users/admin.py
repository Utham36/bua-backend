from django.contrib import admin
from .models import Profile

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'member_id', 'phone_number')
    readonly_fields = ('member_id',) # Prevent changing the ID manually

admin.site.register(Profile, ProfileAdmin)