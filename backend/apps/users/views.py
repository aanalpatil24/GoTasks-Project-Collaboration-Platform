from rest_framework import generics, permissions, filters
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserSerializer, UserCreateSerializer, CustomTokenObtainPairSerializer

User = get_user_model()

# Generates the JWT access and refresh tokens used by the React frontend to stay logged in
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Handles new account sign-ups securely
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [permissions.AllowAny]

# Allows an authenticated user to view or edit their own private profile settings
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
   
    def get_object(self):
        return self.request.user

# Powers the frontend team directory and "@" mention autocomplete features
class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Replaces manual Q queries with DRF's native
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name']
    
    def get_queryset(self):
        return User.objects.filter(is_active=True).order_by('username')[:10]