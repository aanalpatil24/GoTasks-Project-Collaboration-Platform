from django.contrib import admin
from django.db.models import Count
from .models import Project, ProjectMembership, ProjectMessage

# Allows adding members directly inside the Project admin page
class ProjectMembershipInline(admin.TabularInline):
    model = ProjectMembership
    extra = 1

# Main dashboard view for managing Projects
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'created_at', 'members_count']
    list_filter = ['created_at']
    search_fields = ['name', 'owner__email']
    inlines = [ProjectMembershipInline]

    # Overrides default query to prevent N+1 performance bottlenecks
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        qs = qs.annotate(_members_count=Count('memberships'))
        return qs

    # Displays the pre-calculated count in the admin list column
    def members_count(self, obj):
        return obj._members_count

    members_count.admin_order_field = '_members_count'

# View for managing user roles and access control
@admin.register(ProjectMembership)
class ProjectMembershipAdmin(admin.ModelAdmin):
    list_display = ['project', 'user', 'role', 'joined_at']
    list_filter = ['role', 'joined_at']
    search_fields = ['project__name', 'user__email']

# View for auditing real-time collaboration messages
@admin.register(ProjectMessage)
class ProjectMessageAdmin(admin.ModelAdmin):
    list_display = ['project', 'sender', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'sender__email', 'project__name']