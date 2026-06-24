from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from projects.models import Project, ProjectMember
from .models import ProjectDocument
from .serializers import ProjectDocumentSerializer
from notifications.models import Notification
from activity.models import Activity


class ProjectDocumentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):

        project = get_object_or_404(Project, pk=project_id)

        is_member = (
            request.user == project.creator
            or ProjectMember.objects.filter(project=project, user=request.user).exists()
        )

        if not is_member:
            return Response({"error": "Permission denied"}, status=403)

        documents = ProjectDocument.objects.filter(project=project)

        serializer = ProjectDocumentSerializer(documents, many=True)

        return Response(serializer.data)

    def post(self, request, project_id):

        project = get_object_or_404(Project, pk=project_id)

        if request.user != project.creator:
            return Response({"error": "Permission denied"}, status=403)

        serializer = ProjectDocumentSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save(project=project, uploaded_by=request.user)

            document = serializer.instance

            members = ProjectMember.objects.filter(project=project)

            for member in members:
                Notification.objects.create(
                    recipient=member.user,
                    message=f"{request.user.username} uploaded '{document.title}'",
                )
                Activity.objects.create(
                    user=member.user,
                    activity_type="document",
                    message=f"{request.user.username} uploaded '{document.title}'",
                )

            return Response(serializer.data)

        return Response(serializer.errors)


class ProjectDocumentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):

        document = get_object_or_404(ProjectDocument, pk=pk)

        if (
            request.user != document.uploaded_by
            and request.user != document.project.creator
        ):
            return Response({"error": "Permission denied"}, status=403)

        document.delete()

        return Response({"message": "Document deleted successfully"})
