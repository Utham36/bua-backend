from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import random

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # This is the Professional ID (e.g., "HF-839201")
    member_id = models.CharField(max_length=20, unique=True, blank=True)
    
    # We can also store extra info here later (Phone, Address, Avatar)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    def save(self, *args, **kwargs):
        # Only generate ID if it doesn't exist yet
        if not self.member_id:
            # Generate a random 6-digit number
            unique_code = random.randint(100000, 999999)
            self.member_id = f"HF-{unique_code}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} ({self.member_id})"

# 👇 SIGNALS: Automatically create a Profile when a User signs up
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
    # 👇 Paste this at the bottom of users/models.py

class VendorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='vendor_profile')
    store_name = models.CharField(max_length=100, default="My Store")
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    description = models.TextField(blank=True)
    logo = models.ImageField(upload_to='vendor_logos/', blank=True, null=True)

    def __str__(self):
        return self.store_name