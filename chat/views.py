from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth.models import User
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

# 👇 1. GOOGLE AI SETUP
import google.generativeai as genai
# YOUR API KEY
genai.configure(api_key="AIzaSyDVJABJbkZwoZXP8oCkB7T7PQKGALWCZT0")

# 👇 2. DATABASE IMPORTS (Safe Mode)
# This prevents crashes if the tables are empty or missing
try:
    from catalog.models import Product
except ImportError:
    Product = None

try:
    from orders.models import Order
except ImportError:
    Order = None

# --- VIEWS ---

# 1. Start Chat (Human-to-Human)
class StartChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        recipient_id = request.data.get('recipient_id')
        recipient = get_object_or_404(User, id=recipient_id)
        conversation = Conversation.objects.filter(participants=request.user).filter(participants=recipient).first()

        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user, recipient)
            Message.objects.create(
                conversation=conversation,
                sender=request.user,
                recipient=recipient,
                body="👋 Started a new conversation."
            )

        return Response({'conversation_id': conversation.id})

# 2. Start AI Chat (BUA GROUP EDITION 🏗️)
class StartAIChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Identity: BUA_Assistant
        ai_user, created = User.objects.get_or_create(username="BUA_Assistant")
        if created:
            ai_user.set_unusable_password()
            ai_user.save()

        conversation = Conversation.objects.filter(participants=request.user).filter(participants=ai_user).first()
        
        if not conversation:
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user, ai_user)
            Message.objects.create(
                conversation=conversation,
                sender=ai_user,
                recipient=request.user,
                # Corporate Greeting
                body="🤖 Welcome to BUA Group (Foods & Infrastructure). I am your Corporate AI Assistant. I can help with Inventory, Supply Chain data, or General Knowledge. How may I assist you?"
            )
            
        return Response({'conversation_id': conversation.id})

# 3. List Conversations
class ConversationListView(generics.ListAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user).order_by('-updated_at')

# 4. Get Messages
class ConversationDetailView(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        return Message.objects.filter(conversation_id=conversation_id).order_by('timestamp')

# 5. Send Message (THE "BUA GENIUS" BRAIN 🧠)
class SendMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        conversation_id = self.request.data.get('conversation_id')
        conversation = get_object_or_404(Conversation, id=conversation_id)
        
        # Save User Message
        user_message = serializer.save(sender=self.request.user, conversation=conversation)
        conversation.save() 

        # Check if talking to Bot
        other_participant = conversation.participants.exclude(id=self.request.user.id).first()

        # Check for the new BUA Identity
        if other_participant and other_participant.username == "BUA_Assistant":
            
            # --- FETCH LIVE DATA (The "Eyes") 👀 ---
            
            # A. Get Products (Formatted for Business)
            stock_info = "📦 CURRENT BUA INVENTORY:\n"
            if Product:
                try:
                    products = Product.objects.all()
                    if products.exists():
                        for p in products:
                            stock_info += f"- ITEM: {p.name} | PRICE: ₦{p.price} | SPECS: {p.description}\n"
                    else:
                        stock_info += "(Inventory Database is currently empty)\n"
                except Exception:
                    stock_info += "(System Error: Cannot access Inventory Table)\n"
            
            # --- AI BRAIN ---
            try:
                model = genai.GenerativeModel('gemini-2.5-flash')
                
                # 👇 THE "GENIUS + CORPORATE" PROMPT
                prompt = f"""
                You are the Corporate AI Executive Assistant for **BUA Group (Foods & Infrastructure)**.
                
                YOUR KNOWLEDGE BASE:
                1. 🏢 LIVE INVENTORY DATA (Real-time):
                {stock_info}
                
                2. 🌍 GENERAL INTELLIGENCE:
                You are also a highly advanced AI. You are an expert in Coding, History, Science, Math, Sports, and Global Events.
                
                YOUR INSTRUCTIONS:
                - **Identity:** You are strictly BUA Group. Never mention 'Halaal'.
                - **Tone:** Professional, Intelligent, and Helpful.
                - **Business Queries:** If asked about BUA products (cement, sugar, foods, prices), refer strictly to the 'LIVE INVENTORY DATA' above.
                - **General Queries:** If the user asks about ANYTHING ELSE (e.g. "Write React code", "Who won the World Cup?", "Explain Physics"), ANSWER IT fully using your general knowledge. Do NOT restrict yourself to business topics only.
                
                **User Query:** {user_message.body}
                """
                
                response = model.generate_content(prompt)
                bot_text = response.text

            except Exception as e:
                bot_text = f"⚠️ System Connection Error: {str(e)}"
                print(f"❌ AI ERROR: {e}") 

            # Save Bot Reply
            Message.objects.create(
                conversation=conversation,
                sender=other_participant,
                recipient=self.request.user,
                body=bot_text
            )