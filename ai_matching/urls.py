from django.urls import path

from .views import TeamMatchingView

urlpatterns = [
    path("team-matching/", TeamMatchingView.as_view()),
]
