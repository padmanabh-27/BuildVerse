from rest_framework import serializers
from django.contrib.auth.models import User

from projects.models import Project
from skills.models import Skill


class UserSearchSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "username"]


class ProjectSearchSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = ["id", "title"]


class SkillSearchSerializer(serializers.ModelSerializer):

    class Meta:
        model = Skill
        fields = ["id", "name"]
