from django.urls import path

from .views import (
    UserRoleReputationView,
    UserSkillReputationView,
)

urlpatterns = [
    path(
        "roles/<int:pk>/",
        UserRoleReputationView.as_view(),
    ),
    path(
        "skills/<int:pk>/",
        UserSkillReputationView.as_view(),
    ),
]
