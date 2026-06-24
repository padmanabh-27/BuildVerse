from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from projects.models import Project, ProjectMember
from .models import Task, TaskComment
from .serializers import TaskSerializer, TaskCommentSerializer
from notifications.models import Notification
from activity.models import Activity
from django.contrib.auth.models import User


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
            Activity.objects.create(
                user=task.assigned_to,
                activity_type="task",
                message=f"You were assigned '{task.title}'",
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
        if task.status == "done":
            Activity.objects.create(
                user=task.created_by,
                activity_type="task",
                message=f"{task.assigned_to.username} completed '{task.title}'",
            )
            Activity.objects.create(
                user=task.assigned_to,
                activity_type="task",
                message=f"You completed '{task.title}'",
            )

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


class UserTaskStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        user = get_object_or_404(User, pk=pk)

        tasks_assigned = Task.objects.filter(assigned_to=user).count()

        tasks_completed = Task.objects.filter(
            assigned_to=user, status=Task.Status.COMPLETED
        ).count()

        if tasks_assigned > 0:
            completion_rate = (tasks_completed / tasks_assigned) * 100
        else:
            completion_rate = 0

        return Response(
            {
                "tasks_assigned": tasks_assigned,
                "tasks_completed": tasks_completed,
                "completion_rate": round(completion_rate, 2),
            }
        )
