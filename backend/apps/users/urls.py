from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, RegisterView, UserProfileView, UserListView
)

urlpatterns = [
    # Core authentication endpoints for generating and renewing JWT access
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Manages the currently authenticated user's private profile data
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('', UserListView.as_view(), name='user-list'),
]