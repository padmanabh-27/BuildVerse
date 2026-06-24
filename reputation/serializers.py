from rest_framework import serializers

from .models import (
    RoleReputation,
    SkillReputation,
)


class RoleReputationSerializer(serializers.ModelSerializer):

    class Meta:
        model = RoleReputation
        fields = [
            "role_name",
            "average_rating",
            "reviews_count",
        ]


class SkillReputationSerializer(serializers.ModelSerializer):

    class Meta:
        model = SkillReputation
        fields = [
            "role_name",
            "skill_name",
            "average_rating",
            "reviews_count",
        ]
