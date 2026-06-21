from rest_framework import serializers

from .models import ProjectDocument


class ProjectDocumentSerializer(serializers.ModelSerializer):

    uploaded_by_username = serializers.CharField(
        source="uploaded_by.username", read_only=True
    )

    class Meta:
        model = ProjectDocument
        fields = "__all__"
        read_only_fields = ["project", "uploaded_by", "uploaded_at"]
