from rest_framework import serializers
from .models import Project, ProjectMembership
from apps.users.serializers import UserSerializer

# Converts membership data into JSON, allowing assignment via user_id
class ProjectMembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = ProjectMembership
        fields = ['id', 'user', 'user_id', 'role', 'joined_at']
        read_only_fields = ['id', 'joined_at']

# Serializes core project data for list views and dashboards
class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members_count = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'owner', 'members_count', 'user_role', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def get_members_count(self, obj):
        # Checks if the count was pre-calculated by the view to prevent database lag
        if hasattr(obj, '_members_count'):
            return obj._members_count
        return obj.memberships.count()
        
    def get_user_role(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Uses owner_id directly to avoid fetching the full User object
            if obj.owner_id == request.user.id:
                return 'OWNER'
            
            # Scans pre-fetched data in Python memory instead of hitting the database again
            for membership in obj.memberships.all():
                if membership.user_id == request.user.id:
                    return membership.role
        return None

# Extends the base serializer to include the full list of members for the detailed workspace view
class ProjectDetailSerializer(ProjectSerializer):
    members = ProjectMembershipSerializer(source='memberships', many=True, read_only=True)
    
    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['members']