from rest_framework import serializers
from .models import Task, TaskComment
from apps.users.serializers import UserSerializer

# Serializes individual discussion points on a task
class TaskCommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = TaskComment
        fields = ['id', 'content', 'author', 'created_at']
        read_only_fields = ['id', 'created_at']

# Serializes core task data for Kanban board cards and list views
class TaskSerializer(serializers.ModelSerializer):
    assigned_to = UserSerializer(read_only=True)
    assigned_to_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    created_by = UserSerializer(read_only=True)
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'project', 'assigned_to', 'assigned_to_id', 'created_by',
            'due_date', 'comments_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
        
    def get_comments_count(self, obj):
        if hasattr(obj, '_comments_count'):
            return obj._comments_count
        return obj.comments.count()

# Extends the base serializer to include the full comment history when clicking into a specific task
class TaskDetailSerializer(TaskSerializer):
    comments = TaskCommentSerializer(many=True, read_only=True)
    
    class Meta(TaskSerializer.Meta):
        fields = TaskSerializer.Meta.fields + ['comments']

# Lightweight serializer specifically for handling rapid drag-and-drop or status updates
class TaskUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['title', 'description', 'status', 'priority', 'assigned_to', 'due_date']