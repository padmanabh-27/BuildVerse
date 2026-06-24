from rest_framework import serializers
from .models import ProjectReview


class ProjectReviewSerializer(serializers.ModelSerializer):

    reviewer_username = serializers.CharField(
        source="reviewer.username", read_only=True
    )

    reviewed_username = serializers.CharField(
        source="reviewed_user.username", read_only=True
    )

    overall_rating = serializers.SerializerMethodField()

    class Meta:
        model = ProjectReview

        fields = [
            "id",
            "project",
            "reviewer",
            "reviewed_user",
            "reviewer_username",
            "reviewed_username",
            "technical_rating",
            "communication_rating",
            "teamwork_rating",
            "deadline_rating",
            "overall_rating",
            "feedback",
            "created_at",
        ]

        read_only_fields = [
            "reviewer",
            "created_at",
            "overall_rating",
        ]

    def get_overall_rating(self, obj):

        return round(
            (
                obj.technical_rating
                + obj.communication_rating
                + obj.teamwork_rating
                + obj.deadline_rating
            )
            / 4,
            2,
        )
