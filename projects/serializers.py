from rest_framework import serializers
from .models import Project, ProjectSkill, ProjectRole, JoinRequest, ProjectMember


class ProjectSerializer(serializers.ModelSerializer):

    creator_username = serializers.CharField(source="creator.username", read_only=True)

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ["creator", "created_at"]


class ProjectSkillSerializer(serializers.ModelSerializer):

    skill_name = serializers.CharField(source="skill.name", read_only=True)

    class Meta:
        model = ProjectSkill
        fields = "__all__"


class ProjectRoleSerializer(serializers.ModelSerializer):

    class Meta:
        model = ProjectRole
        fields = "__all__"


class JoinRequestSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = JoinRequest
        fields = "__all__"


class ProjectMemberSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source="user.username", read_only=True)

    role_name = serializers.CharField(source="role.role_name", read_only=True)

    class Meta:
        model = ProjectMember
        fields = "__all__"
