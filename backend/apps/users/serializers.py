from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# Injects standard user profile data directly into the login response payload
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data['user'] = {
            'id': str(user.id),
            'email': user.email,
            'username': user.username,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'avatar': user.avatar.url if user.avatar else None,
        }
        return data

# Formats public user profiles for dashboards and member lists
class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 
                  'full_name', 'avatar', 'bio', 'created_at']
        read_only_fields = ['id', 'created_at']
        
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or obj.username

# Handles new account registrations securely
class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm', 
                  'first_name', 'last_name']
                  
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
            
        # Passes Django's strict built-in complexity rules
        try:
            validate_password(attrs['password'])
        except DjangoValidationError as e:
            raise serializers.ValidationError({"password": list(e.messages)})
            
        return attrs
        
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Uses create_user to automatically hash the password string before saving to PostgreSQL
        user = User.objects.create_user(**validated_data)
        return user