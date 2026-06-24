from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from projects.models import Project, ProjectMember
from tasks.models import Task
from notifications.models import Notification


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        data = {
            "projects_created": Project.objects.filter(creator=request.user).count(),
            "projects_joined": ProjectMember.objects.filter(user=request.user).count(),
            "tasks_assigned": Task.objects.filter(assigned_to=request.user).count(),
            "tasks_completed": Task.objects.filter(
                assigned_to=request.user, status="done"
            ).count(),
            "unread_notifications": Notification.objects.filter(
                recipient=request.user, is_read=False
            ).count(),
        }

        return Response(data)
