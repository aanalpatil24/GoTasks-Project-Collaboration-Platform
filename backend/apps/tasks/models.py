import uuid
from django.db import models
from django.conf import settings

# Core entity representing an actionable item on the project Kanban board
class Task(models.Model):
    STATUS_CHOICES = [('TODO', 'To Do'), ('IN_PROGRESS', 'In Progress'), ('DONE', 'Done')]
    PRIORITY_CHOICES = [('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High')]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TODO', db_index=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')
    project = models.ForeignKey('projects.Project', on_delete=models.CASCADE, related_name='tasks', db_index=True)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    
    # Prevents board wiping; tasks stay intact if the creator's account is deleted
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_tasks')
    
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tasks'
        ordering = ['-created_at']
        indexes = [
            # Composite indexes strictly optimized for Kanban column filtering and deadline queries
            models.Index(fields=['project', 'status']),
            models.Index(fields=['assigned_to', 'status']),
            models.Index(fields=['due_date']),
            models.Index(fields=['created_at']),
        ]
        
    def __str__(self):
        return self.title

# Tracks granular discussion threads on specific tasks
class TaskComment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    
    # Preserves discussion context if a team member leaves the platform
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'task_comments'
        ordering = ['-created_at']
        
    def __str__(self):
        author_email = self.author.email if self.author else "Deleted User"
        return f"Comment by {author_email} on {self.task.title}"