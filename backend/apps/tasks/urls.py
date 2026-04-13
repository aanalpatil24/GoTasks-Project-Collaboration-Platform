from django.urls import path
from .views import TaskListCreateView, TaskDetailView, TaskCommentListCreateView

urlpatterns = [
    # Fetches the Kanban board task list or creates a new task
    path('', TaskListCreateView.as_view(), name='task-list'),
    
    # Handles viewing, updating, or deleting a specific task card
    path('<uuid:pk>/', TaskDetailView.as_view(), name='task-detail'),
    
    # Manages the discussion thread attached to a specific task
    path('<uuid:task_pk>/comments/', TaskCommentListCreateView.as_view(), name='task-comments'),
]