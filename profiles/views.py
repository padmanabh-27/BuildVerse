from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .serializers import ProfileSerializer
from .models import Profile


class ProfileDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)

        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)

        serializer = ProfileSerializer(profile, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)


class PublicProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        profile = get_object_or_404(Profile, user=user)
        serializer = ProfileSerializer(profile)

        from portfolio.models import Portfolio
        portfolio, _ = Portfolio.objects.get_or_create(user=user)

        serialized_data = serializer.data
        data = {
            "username": user.username,
        }

        # Apply privacy / visibility settings
        if portfolio.show_email:
            data["email"] = user.email
        else:
            data["email"] = ""

        if portfolio.show_bio:
            data["bio"] = serialized_data.get("bio", "")

        if portfolio.show_github:
            data["github_url"] = serialized_data.get("github_url", "")

        if portfolio.show_linkedin:
            data["linkedin_url"] = serialized_data.get("linkedin_url", "")

        if portfolio.show_location:
            data["country"] = serialized_data.get("country", "")
            data["state"] = serialized_data.get("state", "")
            data["city"] = serialized_data.get("city", "")
            data["timezone"] = serialized_data.get("timezone", "")

        if portfolio.show_experience:
            data["experience_years"] = serialized_data.get("experience_years", "0.0")

        if portfolio.show_availability:
            data["is_available"] = serialized_data.get("is_available", False)

        if portfolio.show_skills:
            data["skills"] = serialized_data.get("skills", [])

        if portfolio.show_reputation:
            data["role_reputations"] = serialized_data.get("role_reputations", [])
            data["skill_reputations"] = serialized_data.get("skill_reputations", [])

        if portfolio.show_stats:
            data["projects_joined"] = serialized_data.get("projects_joined", 0)
            data["tasks_completed"] = serialized_data.get("tasks_completed", 0)

        return Response(data)
