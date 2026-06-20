from django.urls import path
from .views import UserSkillListCreateView, UserSkillDeleteView
urlpatterns = [
    path('', UserSkillListCreateView.as_view()),
    path('<int:pk>/', UserSkillDeleteView.as_view()),
]