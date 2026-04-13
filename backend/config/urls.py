from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Master routing file that directs all incoming HTTP traffic to the correct application
urlpatterns = [
    path('admin/', admin.site.urls),
    
# REST API v1 Endpoints - Versioned to allow future updates without breaking existing frontend clients
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/projects/', include('apps.projects.urls')),
    path('api/v1/tasks/', include('apps.tasks.urls')),
]

# Automatically serves user-uploaded files (like avatars) and static assets during local development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)