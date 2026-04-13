import uuid
from django.db import models
from django.conf import settings

# Core workspace for collaboration and project management
class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', 'created_at']),
            models.Index(fields=['name']),
        ]
    def __str__(self):
        return self.name

# # Manages user roles and access to projects
class ProjectMembership(models.Model):
    ROLE_CHOICES = [('ADMIN', 'Admin'), ('MEMBER', 'Member')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='project_memberships')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='memberships')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='MEMBER')
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'project_memberships'
        constraints = [models.UniqueConstraint(fields=['user', 'project'], name='unique_project_membership')]
        indexes = [
            # Role-filtering lookups during permission checks
            models.Index(fields=['project', 'role']),
            models.Index(fields=['user']),
        ]
    def __str__(self):
        # Triggers implicit database joins
        return f"{self.user.email} - {self.project.name} ({self.role})"

# # Stores real-time chat messages sent in the project console
class ProjectMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='chat_messages')
    
    # Allows the user to be deleted without destroying team chat history
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='sent_messages')
    
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'project_messages'
        ordering = ['created_at'] 
        indexes = [
            models.Index(fields=['project', 'created_at']),
            models.Index(fields=['sender']),
        ]
        
    def __str__(self):
        sender_email = self.sender.email if self.sender else "Deleted User"
        return f"Message from {sender_email} in {self.project.name} at {self.created_at}"