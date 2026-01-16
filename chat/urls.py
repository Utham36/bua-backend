from django.urls import path
# 👇 IMPORT THE NEW VIEW
from .views import StartChatView, StartAIChatView, ConversationListView, ConversationDetailView, SendMessageView

urlpatterns = [
    path('start/', StartChatView.as_view(), name='start_chat'),
    
    # 👇 ADD THIS LINE (The Missing Address)
    path('start-ai-chat/', StartAIChatView.as_view(), name='start_ai_chat'),
    
    path('conversations/', ConversationListView.as_view(), name='conversations'),
    path('conversations/<int:conversation_id>/messages/', ConversationDetailView.as_view(), name='messages'),
    path('send/', SendMessageView.as_view(), name='send_message'),
]