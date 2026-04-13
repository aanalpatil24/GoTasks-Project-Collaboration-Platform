from django.urls import path
from .views import (
    ProjectListCreateView, ProjectDetailView, ProjectMemberAddView, ProjectMemberDetailView
)

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project-list'),
    path('<uuid:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('<uuid:project_pk>/members/', ProjectMemberAddView.as_view(), name='member-add'),
    
    # Updates (PUT/PATCH) and removals (DELETE) into one clean endpoint
    path('<uuid:project_pk>/members/<uuid:user_id>/', ProjectMemberDetailView.as_view(), name='member-detail'),
]