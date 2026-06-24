from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from notifications.models import Notification
from skills.models import Skill
from activity.models import Activity
from tasks.models import Task
from documents.models import ProjectDocument

from .models import Project, ProjectSkill, ProjectRole, JoinRequest, ProjectMember

from .serializers import (
    ProjectSerializer,
    ProjectSkillSerializer,
    ProjectRoleSerializer,
    JoinRequestSerializer,
    ProjectMemberSerializer,
)


class ProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        member_project_ids = ProjectMember.objects.filter(
            user=request.user
        ).values_list("project_id", flat=True)

        projects = (
            Project.objects.filter(
                Q(visibility="public")
                | Q(visibility="portfolio_only")
                | Q(id__in=member_project_ids)
            )
            .distinct()
            .order_by("-created_at")
        )

        serializer = ProjectSerializer(projects, many=True)

        return Response(serializer.data)

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(creator=request.user)

            return Response(serializer.data)

        return Response(serializer.errors)


class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        return get_object_or_404(Project, pk=pk)

    def get(self, request, pk):
        project = self.get_object(pk)

        if project.visibility == "private":

            is_member = ProjectMember.objects.filter(
                project=project, user=request.user
            ).exists()

            if not is_member:
                return Response({"error": "Permission denied"}, status=403)

        serializer = ProjectSerializer(project)

        return Response(serializer.data)

    def put(self, request, pk):
        project = self.get_object(pk)

        if request.user != project.creator:
            return Response({"error": "Permission denied"}, status=403)

        serializer = ProjectSerializer(project, data=request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors)

    def delete(self, request, pk):
        project = self.get_object(pk)

        if request.user != project.creator:
            return Response({"error": "Permission denied"}, status=403)

        project.delete()

        return Response({"message": "Project deleted successfully"})


class ProjectSkillListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        skills = ProjectSkill.objects.filter(project=project)

        serializer = ProjectSkillSerializer(skills, many=True)

        return Response(serializer.data)

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        if request.user != project.creator:
            return Response({"error": "Permission denied"}, status=403)

        skill_name = request.data.get("skill_name").lower()

        skill, created = Skill.objects.get_or_create(name=skill_name)

        project_skill, created = ProjectSkill.objects.get_or_create(
            project=project,
            skill=skill,
            defaults={
                "minimum_experience_years": request.data.get(
                    "minimum_experience_years", 0
                )
            },
        )

        serializer = ProjectSkillSerializer(project_skill)

        return Response(serializer.data)


class ProjectSkillDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        project_skill = get_object_or_404(ProjectSkill, pk=pk)

        if request.user != project_skill.project.creator:
            return Response({"error": "Permission denied"}, status=403)

        project_skill.delete()

        return Response({"message": "Skill deleted successfully"})


class ProjectRoleListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        roles = ProjectRole.objects.filter(project=project)

        serializer = ProjectRoleSerializer(roles, many=True)

        return Response(serializer.data)

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        if request.user != project.creator:
            return Response({"error": "Permission denied"}, status=403)

        role, created = ProjectRole.objects.get_or_create(
            project=project,
            role_name=request.data.get("role_name").lower(),
            defaults={"slots_required": request.data.get("slots_required", 1)},
        )

        serializer = ProjectRoleSerializer(role)

        return Response(serializer.data)


class ProjectRoleDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        role = get_object_or_404(ProjectRole, pk=pk)

        if request.user != role.project.creator:
            return Response({"error": "Permission denied"}, status=403)

        role.delete()

        return Response({"message": "Role deleted successfully"})


class JoinRequestCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        if request.user == project.creator:
            return Response({"error": "Creator cannot join own project"}, status=400)

        join_request, created = JoinRequest.objects.get_or_create(
            project=project, user=request.user
        )
        if created:
            Notification.objects.create(
                recipient=project.creator,
                message=f"{request.user.username} requested to join {project.title}",
            )
            Activity.objects.create(
                user=project.creator,
                activity_type="join_request",
                message=f"{request.user.username} requested to join {project.title}",
            )

        serializer = JoinRequestSerializer(join_request)

        return Response(serializer.data)


class JoinRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        if request.user != project.creator:
            return Response({"error": "Permission denied"}, status=403)

        requests = JoinRequest.objects.filter(project=project)

        serializer = JoinRequestSerializer(requests, many=True)

        return Response(serializer.data)


class AcceptJoinRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        join_request = get_object_or_404(JoinRequest, pk=pk)

        project = join_request.project

        if request.user != project.creator:
            return Response({"error": "Permission denied"}, status=403)

        if join_request.status != "pending":
            return Response({"error": "Request already processed"}, status=400)

        role = get_object_or_404(
            ProjectRole, pk=request.data.get("role_id"), project=project
        )

        join_request.status = "accepted"
        join_request.save()

        member, created = ProjectMember.objects.get_or_create(
            project=project, user=join_request.user, defaults={"role": role}
        )
        Notification.objects.create(
            recipient=join_request.user,
            message=f"Your request to join {project.title} was accepted",
        )
        Activity.objects.create(
            user=join_request.user,
            activity_type="member",
            message=f"You joined {project.title}",
        )

        serializer = ProjectMemberSerializer(member)

        return Response(serializer.data)


class RejectJoinRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        join_request = get_object_or_404(JoinRequest, pk=pk)

        if request.user != join_request.project.creator:
            return Response({"error": "Permission denied"}, status=403)

        if join_request.status != "pending":
            return Response({"error": "Request already processed"}, status=400)

        join_request.status = "rejected"
        join_request.save()

        return Response({"message": "Request rejected"})


class ProjectMemberListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        project = get_object_or_404(Project, pk=pk)

        if project.visibility == "private" and request.user != project.creator:
            return Response({"error": "Permission denied"}, status=403)

        members = ProjectMember.objects.filter(project=project)

        serializer = ProjectMemberSerializer(members, many=True)

        return Response(serializer.data)


class ProjectStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        project = get_object_or_404(Project, pk=pk)

        is_member = (
            request.user == project.creator
            or ProjectMember.objects.filter(project=project, user=request.user).exists()
        )

        if not is_member:
            return Response({"error": "Permission denied"}, status=403)

        members_count = ProjectMember.objects.filter(project=project).count() + 1

        tasks_total = Task.objects.filter(project=project).count()

        tasks_completed = Task.objects.filter(project=project, status="done").count()

        tasks_pending = tasks_total - tasks_completed

        documents_count = ProjectDocument.objects.filter(project=project).count()

        completion_percentage = (
            (tasks_completed / tasks_total) * 100 if tasks_total > 0 else 0
        )

        data = {
            "members_count": members_count,
            "tasks_total": tasks_total,
            "tasks_completed": tasks_completed,
            "tasks_pending": tasks_pending,
            "completion_percentage": round(completion_percentage, 2),
            "documents_count": documents_count,
        }

        return Response(data)


class CompleteProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        project = get_object_or_404(Project, pk=pk)

        if request.user != project.creator:
            return Response({"error": "Permission denied"}, status=403)

        project.status = Project.Status.COMPLETED
        project.save()

        members = ProjectMember.objects.filter(project=project)

        for member in members:

            Notification.objects.create(
                recipient=member.user,
                message=f"{project.title} has been completed. Please rate your teammates.",
            )

            Activity.objects.create(
                user=member.user,
                activity_type="review",
                message=f"Rate your teammates in {project.title}",
            )

        return Response({"message": f"{project.title} marked as completed"})
