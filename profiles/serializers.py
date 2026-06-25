from rest_framework import serializers

from .models import Profile

from skills.models import UserSkill
from reputation.models import (
    RoleReputation,
    SkillReputation,
)
from projects.models import ProjectMember
from tasks.models import Task


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    skills = serializers.SerializerMethodField()

    role_reputations = serializers.SerializerMethodField()

    skill_reputations = serializers.SerializerMethodField()

    projects_joined = serializers.SerializerMethodField()

    tasks_completed = serializers.SerializerMethodField()

    class Meta:
        model = Profile

        fields = [
            "user",
            "username",
            "bio",
            "country",
            "state",
            "city",
            "timezone",
            "github_url",
            "linkedin_url",
            "experience_years",
            "is_available",
            # Additional Profile Data
            "skills",
            "role_reputations",
            "skill_reputations",
            "projects_joined",
            "tasks_completed",
        ]

    def get_skills(self, obj):

        return list(
            UserSkill.objects.filter(user=obj.user).values_list(
                "skill__name", flat=True
            )
        )

    def get_role_reputations(self, obj):

        reputations = RoleReputation.objects.filter(user=obj.user).order_by(
            "-average_rating"
        )

        return [
            {
                "role_name": reputation.role_name,
                "average_rating": round(reputation.average_rating, 2),
                "reviews_count": reputation.reviews_count,
            }
            for reputation in reputations
        ]

    def get_skill_reputations(self, obj):

        reputations = SkillReputation.objects.filter(user=obj.user).order_by(
            "-average_rating"
        )

        return [
            {
                "skill_name": reputation.skill_name,
                "role_name": reputation.role_name,
                "average_rating": round(reputation.average_rating, 2),
                "reviews_count": reputation.reviews_count,
            }
            for reputation in reputations
        ]

    def get_projects_joined(self, obj):

        return ProjectMember.objects.filter(user=obj.user).count()

    def get_tasks_completed(self, obj):

        return Task.objects.filter(
            assigned_to=obj.user,
            status=Task.Status.COMPLETED,
        ).count()
