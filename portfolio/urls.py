from django.urls import path

from .views import PortfolioUpdateView, PublicPortfolioView

urlpatterns = [
    path("", PortfolioUpdateView.as_view()),
    path("<str:username>/", PublicPortfolioView.as_view()),
]
