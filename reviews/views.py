from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Avg
from .models import ProjectReview
from .serializers import ProjectReviewSerializer
from projects.models import Project, ProjectMember
from reputation.services import (
    update_role_reputation,
    update_skill_reputation,
)


class ProjectReviewCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ProjectReviewSerializer(data=request.data)

        if serializer.is_valid():

            reviewed_user = serializer.validated_data["reviewed_user"]
            project = serializer.validated_data["project"]

            # Project must be completed
            if project.status != Project.Status.COMPLETED:
                return Response(
                    {"error": "Project must be completed before reviewing"},
                    status=400,
                )

            # Reviewed user must be creator or member
            is_reviewed_member = (
                reviewed_user == project.creator
                or ProjectMember.objects.filter(
                    project=project,
                    user=reviewed_user,
                ).exists()
            )

            if not is_reviewed_member:
                return Response(
                    {"error": "Reviewed user is not a member of this project"},
                    status=400,
                )

            # Reviewer must be creator or member
            is_reviewer_member = (
                request.user == project.creator
                or ProjectMember.objects.filter(
                    project=project,
                    user=request.user,
                ).exists()
            )

            if not is_reviewer_member:
                return Response(
                    {"error": "You are not a member of this project"},
                    status=403,
                )

            # Prevent self review
            if reviewed_user == request.user:
                return Response(
                    {"error": "You cannot review yourself"},
                    status=400,
                )

            # Prevent duplicate review
            if ProjectReview.objects.filter(
                project=project,
                reviewer=request.user,
                reviewed_user=reviewed_user,
            ).exists():

                return Response(
                    {"error": "You already reviewed this user for this project"},
                    status=400,
                )

            # Save review
            review = serializer.save(reviewer=request.user)

            # Calculate overall rating
            overall_rating = (
                review.technical_rating
                + review.communication_rating
                + review.teamwork_rating
                + review.deadline_rating
            ) / 4

            # Update role reputation
            update_role_reputation(
                project,
                reviewed_user,
                overall_rating,
            )
            update_skill_reputation(
                project,
                reviewed_user,
                overall_rating,
            )

            serializer = ProjectReviewSerializer(review)

            return Response(serializer.data)

        return Response(serializer.errors)


class UserReviewListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        user = get_object_or_404(User, pk=pk)

        reviews = ProjectReview.objects.filter(reviewed_user=user).order_by(
            "-created_at"
        )

        serializer = ProjectReviewSerializer(reviews, many=True)

        return Response(serializer.data)


class UserRatingStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        user = get_object_or_404(User, pk=pk)

        reviews = ProjectReview.objects.filter(reviewed_user=user)

        reviews_count = reviews.count()

        if reviews_count == 0:
            return Response(
                {
                    "average_rating": 0,
                    "reviews_count": 0,
                }
            )

        total = 0

        for review in reviews:
            total += (
                review.technical_rating
                + review.communication_rating
                + review.teamwork_rating
                + review.deadline_rating
            ) / 4

        average_rating = total / reviews_count

        return Response(
            {
                "average_rating": round(average_rating, 2),
                "reviews_count": reviews_count,
            }
        )
