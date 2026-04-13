import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

# Broadcasts real-time Kanban board updates (like drag-and-drop) to all active users
class TaskUpdateConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        self.room_group_name = f"project_{self.project_id}"
        self.user = self.scope['user']
        
        # Authorizes connection based on valid project membership
        if await self.is_project_member():
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        else:
            await self.close(code=4003)
            
    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            
    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return
            
        message_type = data.get('type')
        if message_type == 'ping':
            # Validates the JWT heartbeat to ensure the user's session hasn't expired
            try:
                AccessToken(data.get('token'))
                await self.send(text_data=json.dumps({'type': 'pong'}))
            except TokenError:
                await self.close(code=4001)
                
    # Pushes the live task mutation event down to the client UI
    async def task_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'task_update',
            'event': event['event'],
            'task': event.get('task'),
            'task_id': event.get('task_id'),
            'comment': event.get('comment')
        }))
        
    @database_sync_to_async
    def is_project_member(self):
        if isinstance(self.user, AnonymousUser): 
            return False
            
        from apps.projects.models import ProjectMembership
        return ProjectMembership.objects.filter(project_id=self.project_id, user=self.user).exists()