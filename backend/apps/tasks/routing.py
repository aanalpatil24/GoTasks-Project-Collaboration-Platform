from django.urls import re_path
from . import consumers as task_consumers
from apps.projects import consumers as project_consumers

# Maps WebSocket connection URLs to their respective ASGI asynchronous consumers
websocket_urlpatterns = [
    re_path(r'ws/tasks/(?P<project_id>[0-9a-f-]+)/$', task_consumers.TaskUpdateConsumer.as_asgi()),
    re_path(r'ws/chat/(?P<project_id>[0-9a-f-]+)/$', project_consumers.ProjectChatConsumer.as_asgi()),
]