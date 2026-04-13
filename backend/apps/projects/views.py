from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from .models import Project, ProjectMembership
from .serializers import ProjectSerializer, ProjectDetailSerializer, ProjectMembershipSerializer
from .permissions import IsProjectAdminOrReadOnly, IsProjectAdmin

# Handles listing user projects and creating new workspaces
class ProjectListCreateView(generics.ListCreateAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']
    
    # Fetches only projects the user owns or belongs to, optimizing the DB with pre-calculated counts
    def get_queryset(self):
        user = self.request.user
        return Project.objects.filter(
            Q(owner=user) | Q(memberships__user=user)
        ).select_related('owner').prefetch_related('memberships').annotate(
            _members_count=Count('memberships', distinct=True)
        ).distinct()
    
    # Automatically assigns the creator as the project owner and admin
    def perform_create(self, serializer):
        project = serializer.save(owner=self.request.user)
        ProjectMembership.objects.create(project=project, user=self.request.user, role='ADMIN')

# Handles fetching, updating, or deleting a specific project
class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectAdminOrReadOnly]
    lookup_field = 'pk'
    
    # Pre-loads related data and member counts to prevent N+1 query lag on the detail dashboard
    def get_queryset(self):
        return Project.objects.select_related('owner').prefetch_related('memberships__user').annotate(
            _members_count=Count('memberships', distinct=True)
        )

# Adds a new user to a specific project workspace
class ProjectMemberAddView(generics.CreateAPIView):
    serializer_class = ProjectMembershipSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectAdmin]
    
    # Binds the new membership to the project ID from the URL
    def perform_create(self, serializer):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        serializer.save(project=project)

# Consolidates viewing, updating roles, and removing members into one clean RESTful endpoint
class ProjectMemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectMembershipSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectAdmin]
    
    # Safely locates the exact membership link using both IDs provided in the URL
    def get_object(self):
        project = get_object_or_404(Project, pk=self.kwargs['project_pk'])
        return get_object_or_404(ProjectMembership, project=project, user_id=self.kwargs['user_id'])