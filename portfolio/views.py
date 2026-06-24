from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from profiles.models import Profile
from skills.models import UserSkill
from projects.models import Project, ProjectMember

from .models import Portfolio
from .serializers import PortfolioSerializer


class PortfolioUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        portfolio, created = Portfolio.objects.get_or_create(user=request.user)

        serializer = PortfolioSerializer(portfolio)

        return Response(serializer.data)

    def patch(self, request):

        portfolio, created = Portfolio.objects.get_or_create(user=request.user)

        serializer = PortfolioSerializer(portfolio, data=request.data, partial=True)

        if serializer.is_valid():

            serializer.save()

            return Response(serializer.data)

        return Response(serializer.errors)


class PublicPortfolioView(APIView):

    def get(self, request, username):

        user = get_object_or_404(User, username=username)

        profile, created = Profile.objects.get_or_create(user=user)

        portfolio, created = Portfolio.objects.get_or_create(user=user)

        data = {"username": user.username}

        if profile.bio and portfolio.show_bio:
            data["bio"] = profile.bio

        if portfolio.show_email:
            data["email"] = user.email

        if portfolio.show_github:
            data["github_url"] = portfolio.github_url

        if portfolio.show_linkedin:
            data["linkedin_url"] = portfolio.linkedin_url

        if portfolio.show_phone:
            data["phone_number"] = portfolio.phone_number

        if portfolio.show_resume:
            data["resume_url"] = portfolio.resume_url

        if portfolio.show_skills:

            data["skills"] = list(
                UserSkill.objects.filter(user=user).values_list(
                    "skill__name", flat=True
                )
            )

        if portfolio.show_projects:

            data["projects_created"] = Project.objects.filter(creator=user).count()

            data["projects_contributed"] = ProjectMember.objects.filter(
                user=user
            ).count()

        return Response(data)
