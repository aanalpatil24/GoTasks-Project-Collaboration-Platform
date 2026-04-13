import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

class ProjectChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        self.room_group_name = f"chat_{self.project_id}"
        self.user = self.scope['user']

        # Reject users who are not logged in
        if isinstance(self.user, AnonymousUser):
            await self.close()
            return

        # Check if the logged-in user is actually a member of this project
        is_member = await self.check_membership()
        if not is_member:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        # Protect the server from crashing if bad data is sent
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        if data.get('action') == 'ping':
            try:
                AccessToken(data.get('token'))
                await self.send(text_data="pong")
            except TokenError:
                await self.close(code=4001)
            return

        content = data.get('content')
        
        # Basic length limit to prevent users from sending 50MB messages
        if content and len(content) <= 5000:
            message = await self.save_message(content)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message', 
                    'message': {
                        'id': str(message.id),
                        'content': message.content,
                        'sender': self.user.first_name or self.user.username,
                        'created_at': message.created_at.isoformat()
                    }
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event['message']))

    @database_sync_to_async
    def save_message(self, content):
        from .models import ProjectMessage
        return ProjectMessage.objects.create(
            project_id=self.project_id,
            sender=self.user,
            content=content
        )

    # Helper function to verify project access in the database safely
    @database_sync_to_async
    def check_membership(self):
        from .models import ProjectMembership
        return ProjectMembership.objects.filter(project_id=self.project_id, user=self.user).exists()