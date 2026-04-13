from django.contrib import admin
from .models import Task, TaskComment

class TaskCommentInline(admin.TabularInline):
    model = TaskComment
    extra = 0

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'priority', 'assigned_to', 'created_at']
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['title', 'description']
    inlines = [TaskCommentInline]
    date_hierarchy = 'created_at'

@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content']
from django.contrib import admin
from .models import Task, TaskComment

# Shows task comments directly inside the main Task admin page
class TaskCommentInline(admin.TabularInline):
    model = TaskComment
    extra = 0

# Main dashboard view for managing individual project tasks
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'status', 'priority', 'assigned_to', 'created_at']
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['title', 'description']
    inlines = [TaskCommentInline]
    date_hierarchy = 'created_at'

    # Prevents N+1 database lag by fetching related fields in one query
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('project', 'assigned_to')

# View for auditing task discussions and updates
@admin.register(TaskComment)
class TaskCommentAdmin(admin.ModelAdmin):
    list_display = ['task', 'author', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content']

    # Optimizes loading speeds by joining the task and author tables
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('task', 'author')