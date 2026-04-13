from rest_framework import permissions
from .models import ProjectMembership

# Allows anyone to view, but only owners and admins can edit or delete
class IsProjectAdminOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if obj.owner == request.user:
            return True
        return ProjectMembership.objects.filter(project=obj, user=request.user, role='ADMIN').exists()

# Ensures only members or the project owner can access the workspace
class IsProjectMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if obj.owner == request.user:
            return True
        return obj.memberships.filter(user=request.user).exists()

# Blocks non-admins from performing sensitive actions before an object is loaded
class IsProjectAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        project_id = view.kwargs.get('project_pk') or view.kwargs.get('pk')
        if not project_id:
            return False
        from .models import Project
        return ProjectMembership.objects.filter(project_id=project_id, user=request.user, role='ADMIN').exists() or \
               Project.objects.filter(id=project_id, owner=request.user).exists()