from django.urls import path

from .views import ProjectDocumentListCreateView, ProjectDocumentDeleteView

urlpatterns = [
    path("project/<int:project_id>/", ProjectDocumentListCreateView.as_view()),
    path("<int:pk>/", ProjectDocumentDeleteView.as_view()),
]
