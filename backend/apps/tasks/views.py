from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from .models import Task, TaskComment
from .serializers import TaskSerializer, TaskDetailSerializer, TaskUpdateSerializer, TaskCommentSerializer

# Handles loading the Kanban board and creating new tasks
class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['project', 'assigned_to', 'status', 'priority']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'created_at', 'priority']
    
    def get_queryset(self):
        user = self.request.user
        return Task.objects.select_related(
            'assigned_to', 'created_by', 'project'
        ).filter(
            Q(project__owner=user) | Q(project__memberships__user=user)
        ).annotate(
            _comments_count=Count('comments', distinct=True)
        ).distinct()
            
    def perform_create(self, serializer):
        task = serializer.save(created_by=self.request.user)
        self._notify_task_change(task, 'task_created')
    
    # Broadcasts the creation event to the WebSocket layer
    def _notify_task_change(self, task, event_type):
        channel_layer = get_channel_layer()
        group_name = f"project_{task.project_id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {'type': 'task_update', 'event': event_type, 'task': TaskSerializer(task).data}
        )

# Handles viewing, editing, or deleting a specific task card
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'
    
    # Uses a lighter serializer for rapid drag-and-drop updates
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']: return TaskUpdateSerializer
        return TaskDetailSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Ensures users cannot view or edit tasks in projects they do not belong to
        return Task.objects.select_related('assigned_to', 'created_by', 'project').prefetch_related('comments__author').filter(
            Q(project__owner=user) | Q(project__memberships__user=user)
        ).annotate(
            _comments_count=Count('comments', distinct=True)
        ).distinct()
    
    def perform_update(self, serializer):
        task = serializer.save()
        self._notify_task_change(task, 'task_updated')
    
    def perform_destroy(self, instance):
        project_id = instance.project_id
        task_id = str(instance.id)
        instance.delete()
        self._notify_task_delete(project_id, task_id)
    
    def _notify_task_change(self, task, event_type):
        channel_layer = get_channel_layer()
        group_name = f"project_{task.project_id}"
        async_to_sync(channel_layer.group_send)(
            group_name, {'type': 'task_update', 'event': event_type, 'task': TaskSerializer(task).data}
        )
    
    def _notify_task_delete(self, project_id, task_id):
        channel_layer = get_channel_layer()
        group_name = f"project_{project_id}"
        async_to_sync(channel_layer.group_send)(
            group_name, {'type': 'task_update', 'event': 'task_deleted', 'task_id': task_id}
        )

# Manages the discussion thread attached to a specific task
class TaskCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        task_id = self.kwargs['task_pk']
        # Prevents unauthorized users from reading private task comments
        return TaskComment.objects.filter(
            task_id=task_id
        ).filter(
            Q(task__project__owner=user) | Q(task__project__memberships__user=user)
        ).select_related('author').order_by('created_at').distinct()
    
    def perform_create(self, serializer):
        user = self.request.user
        # Prevents unauthorized users from posting comments to other people's tasks
        task = get_object_or_404(Task.objects.filter(
            Q(project__owner=user) | Q(project__memberships__user=user)
        ), pk=self.kwargs['task_pk'])
        
        comment = serializer.save(task=task, author=self.request.user)
        
        channel_layer = get_channel_layer()
        group_name = f"project_{task.project_id}"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {
                'type': 'task_update',
                'event': 'comment_added',
                'task_id': str(task.id),
                'comment': TaskCommentSerializer(comment).data
            }
        )