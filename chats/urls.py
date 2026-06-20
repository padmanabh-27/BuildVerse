from django.urls import path
from .views import MessageListCreateView

urlpatterns = [
    path("<int:pk>/messages/", MessageListCreateView.as_view()),
]
