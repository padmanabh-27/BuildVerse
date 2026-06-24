from django.urls import path
from .views import (
    ProfileDetailView,
    PublicProfileView,
)

urlpatterns = [
    path("details/", ProfileDetailView.as_view()),
    path("user/<int:pk>/", PublicProfileView.as_view()),
]
