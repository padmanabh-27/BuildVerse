from django.urls import path

from .views import (
    TaskListCreateView,
    TaskDetailView,
    TaskStatusUpdateView,
    TaskCommentListCreateView,
    UserTaskStatsView,
)

urlpatterns = [
    # Create task + Get project tasks
    path("project/<int:project_id>/", TaskListCreateView.as_view()),
    # Get task details + Delete task
    path("<int:pk>/", TaskDetailView.as_view()),
    # Update status
    path("<int:pk>/status/", TaskStatusUpdateView.as_view()),
    # Comments
    path("<int:pk>/comments/", TaskCommentListCreateView.as_view()),
    # User task statistics
    path("stats/<int:pk>/", UserTaskStatsView.as_view()),
]
