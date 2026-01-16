from django.contrib import admin
from .models import Conversation, Message

# 👇 This helps you see who is in the chat
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_participants', 'created_at')
    
    def get_participants(self, obj):
        return ", ".join([u.username for u in obj.participants.all()])
    get_participants.short_description = 'Participants'

# 👇 This helps you see the actual messages
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'recipient', 'body', 'timestamp')
    list_filter = ('sender', 'timestamp')

# Register them so they show up in the Admin Panel
admin.site.register(Conversation, ConversationAdmin)
admin.site.register(Message, MessageAdmin)