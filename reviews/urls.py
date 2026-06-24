from django.urls import path

from .views import ProjectReviewCreateView, UserReviewListView, UserRatingStatsView

urlpatterns = [
    path("", ProjectReviewCreateView.as_view()),
    path("user/<int:pk>/", UserReviewListView.as_view()),
    path("stats/<int:pk>/", UserRatingStatsView.as_view()),
]
