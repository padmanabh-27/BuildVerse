from rest_framework import serializers

from .models import Task, TaskComment


class TaskSerializer(serializers.ModelSerializer):

    assigned_to_username = serializers.CharField(
        source="assigned_to.username", read_only=True
    )

    created_by_username = serializers.CharField(
        source="created_by.username", read_only=True
    )

    class Meta:
        model = Task
        fields = "__all__"
        read_only_fields = ["project", "created_by", "created_at"]


class TaskCommentSerializer(serializers.ModelSerializer):

    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = TaskComment
        fields = "__all__"
        read_only_fields = ["user", "created_at"]
