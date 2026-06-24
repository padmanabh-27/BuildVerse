from django.urls import path

from .views import (
    UserSearchView,
    ProjectSearchView,
    SkillSearchView,
    GlobalSearchView,
)

urlpatterns = [
    path("", GlobalSearchView.as_view()),
    path("users/", UserSearchView.as_view()),
    path("projects/", ProjectSearchView.as_view()),
    path("skills/", SkillSearchView.as_view()),
]
