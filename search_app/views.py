from django.contrib.auth.models import User

from rest_framework.views import APIView
from rest_framework.response import Response

from projects.models import Project
from skills.models import Skill

from .serializers import (
    UserSearchSerializer,
    ProjectSearchSerializer,
    SkillSearchSerializer,
)


class UserSearchView(APIView):

    def get(self, request):

        query = request.GET.get("q", "")

        users = User.objects.filter(username__icontains=query)

        serializer = UserSearchSerializer(users, many=True)

        return Response(serializer.data)


class ProjectSearchView(APIView):

    def get(self, request):

        query = request.GET.get("q", "")

        projects = Project.objects.filter(title__icontains=query)

        serializer = ProjectSearchSerializer(projects, many=True)

        return Response(serializer.data)


class SkillSearchView(APIView):

    def get(self, request):

        query = request.GET.get("q", "")

        skills = Skill.objects.filter(name__icontains=query)

        serializer = SkillSearchSerializer(skills, many=True)

        return Response(serializer.data)


class GlobalSearchView(APIView):

    def get(self, request):

        query = request.GET.get("q", "")

        users = User.objects.filter(username__icontains=query)

        projects = Project.objects.filter(title__icontains=query)

        skills = Skill.objects.filter(name__icontains=query)

        data = {
            "users": UserSearchSerializer(users, many=True).data,
            "projects": ProjectSearchSerializer(projects, many=True).data,
            "skills": SkillSearchSerializer(skills, many=True).data,
        }

        return Response(data)
