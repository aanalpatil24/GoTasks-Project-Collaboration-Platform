import os
from django.core.asgi import get_asgi_application

# Sets the environment variable to point to your main settings file
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator
from apps.tasks import routing as tasks_routing
from apps.users.middleware import JWTAuthMiddleware

application = ProtocolTypeRouter({
    # Routes standard REST API traffic to Django's synchronous/asynchronous views
    "http": django_asgi_app,
    
    # Routes real-time traffic through our security layers before hitting the consumers
    "websocket": AllowedHostsOriginValidator(
        JWTAuthMiddleware(
            URLRouter(
                tasks_routing.websocket_urlpatterns
            )
        )
    ),
})