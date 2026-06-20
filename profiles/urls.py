from django.urls import path
from .views import ProfileDetailView

urlpatterns = [
    path('details/', ProfileDetailView.as_view()),
]