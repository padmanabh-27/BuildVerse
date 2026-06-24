from django.urls import path

from .views import (
    ProjectListCreateView,
    ProjectDetailView,
    ProjectSkillListCreateView,
    ProjectSkillDeleteView,
    ProjectRoleListCreateView,
    ProjectRoleDeleteView,
    JoinRequestCreateView,
    JoinRequestListView,
    AcceptJoinRequestView,
    RejectJoinRequestView,
    ProjectMemberListView,
    ProjectStatsView,
    CompleteProjectView,
)

urlpatterns = [
    path("", ProjectListCreateView.as_view()),
    path("<int:pk>/", ProjectDetailView.as_view()),
    # Project Skill APIs
    path("<int:pk>/skills/", ProjectSkillListCreateView.as_view()),
    path("skills/<int:pk>/delete/", ProjectSkillDeleteView.as_view()),
    # Project Role APIs
    path("<int:pk>/roles/", ProjectRoleListCreateView.as_view()),
    path("roles/<int:pk>/delete/", ProjectRoleDeleteView.as_view()),
    path("<int:pk>/join/", JoinRequestCreateView.as_view()),
    path("<int:pk>/requests/", JoinRequestListView.as_view()),
    path("join-requests/<int:pk>/accept/", AcceptJoinRequestView.as_view()),
    path("join-requests/<int:pk>/reject/", RejectJoinRequestView.as_view()),
    path("<int:pk>/members/", ProjectMemberListView.as_view()),
    path("<int:pk>/stats/", ProjectStatsView.as_view()),
    path("<int:pk>/complete/", CompleteProjectView.as_view()),
]
