# Signals handled in views for better control over WebSocket notifications

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from .models import Task, TaskComment

# Automatically "bumps" the parent project's updated timestamp when any task is modified or deleted
@receiver([post_save, post_delete], sender=Task)
def update_project_last_modified(sender, instance, **kwargs):
    from apps.projects.models import Project
    Project.objects.filter(id=instance.project_id).update(updated_at=timezone.now())

# Bumps the parent task's updated timestamp whenever a team member leaves or deletes a comment
@receiver([post_save, post_delete], sender=TaskComment)
def update_task_last_modified(sender, instance, **kwargs):
    Task.objects.filter(id=instance.task_id).update(updated_at=timezone.now())