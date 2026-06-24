from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from projects.models import Project, ProjectMember
from .models import Conversation, Message
from .serializers import MessageSerializer
from activity.models import Activity


class MessageListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        project = get_object_or_404(Project, pk=pk)

        is_member = (
            request.user == project.creator
            or ProjectMember.objects.filter(project=project, user=request.user).exists()
        )

        if not is_member:
            return Response({"error": "Permission denied"}, status=403)

        conversation, created = Conversation.objects.get_or_create(project=project)

        messages = Message.objects.filter(conversation=conversation)

        serializer = MessageSerializer(messages, many=True)

        return Response(serializer.data)

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk)
        is_member = (
            request.user == project.creator
            or ProjectMember.objects.filter(project=project, user=request.user).exists()
        )
        if not is_member:
            return Response({"error": "Permission denied"}, status=403)
        conversation, created = Conversation.objects.get_or_create(project=project)
        content = request.data.get("content")
        if not content:
            return Response({"error": "Message content is required"}, status=400)
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=request.data.get("content"),
        )
        recipients = set()

        members = ProjectMember.objects.filter(project=project)

        for member in members:
            if member.user != request.user:
                recipients.add(member.user)

        if project.creator != request.user:
            recipients.add(project.creator)

        for user in recipients:
            Activity.objects.create(
                user=user,
                activity_type="chat",
                message=f"{request.user.username} sent a message in {project.title}",
            )

        serializer = MessageSerializer(message)

        return Response(serializer.data)
