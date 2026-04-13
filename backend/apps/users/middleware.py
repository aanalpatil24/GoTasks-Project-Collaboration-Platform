from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from urllib.parse import parse_qs

User = get_user_model()

# Safely decodes the JWT and bridges the synchronous Django ORM into the async ASGI environment
@database_sync_to_async
def get_user_from_token(token_key):
    try:
        access_token = AccessToken(token_key)
        user_id = access_token['user_id']
        # Strictly block banned or deactivated users
        return User.objects.get(id=user_id, is_active=True)
    except (TokenError, InvalidToken, User.DoesNotExist):
        return AnonymousUser()

# Intercepts WebSocket handshakes to authenticate React SPA users via JWTs in the query string
class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        query_parameters = parse_qs(query_string)
        token = query_parameters.get("token", [None])[0]

        # Injects the authenticated user directly into the WebSocket connection scope
        if token:
            scope["user"] = await get_user_from_token(token)
        else:
            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)