from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from projects.models import Project, ProjectMember
from .models import Task, TaskComment
from .serializers import TaskSerializer, TaskCommentSerializer
from notifications.models import Notification


class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):

        project = get_object_or_404(Project, pk=project_id)

        is_member = (
            request.user == project.creator
            or ProjectMember.objects.filter(project=project, user=request.user).exists()
        )

        if not is_member:
            return Response({"error": "Permission denied"}, status=403)

        tasks = Task.objects.filter(project=project)

        serializer = TaskSerializer(tasks, many=True)

        return Response(serializer.data)

    def post(self, request, project_id):

        project = get_object_or_404(Project, pk=project_id)

        if request.user != project.creator:
            return Response({"error": "Permission denied"}, status=403)

        serializer = TaskSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(project=project, created_by=request.user)
            task = serializer.instance

            Notification.objects.create(
                recipient=task.assigned_to,
                message=f"You have been assigned '{task.title}'",
            )

            return Response(serializer.data)


class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        task = get_object_or_404(Task, pk=pk)

        serializer = TaskSerializer(task)

        return Response(serializer.data)

    def delete(self, request, pk):

        task = get_object_or_404(Task, pk=pk)

        if request.user != task.project.creator:
            return Response({"error": "Permission denied"}, status=403)

        task.delete()

        return Response({"message": "Task deleted successfully"})


class TaskStatusUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        task = get_object_or_404(Task, pk=pk)

        if request.user != task.assigned_to and request.user != task.project.creator:
            return Response({"error": "Permission denied"}, status=403)

        task.status = request.data.get("status")

        task.save()

        serializer = TaskSerializer(task)

        return Response(serializer.data)


class TaskCommentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        task = get_object_or_404(Task, pk=pk)

        comments = TaskComment.objects.filter(task=task)

        serializer = TaskCommentSerializer(comments, many=True)

        return Response(serializer.data)

    def post(self, request, pk):

        task = get_object_or_404(Task, pk=pk)

        comment = TaskComment.objects.create(
            task=task, user=request.user, comment=request.data.get("comment")
        )

        serializer = TaskCommentSerializer(comment)

        return Response(serializer.data)
