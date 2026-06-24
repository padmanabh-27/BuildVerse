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

        return Response(
            {
                "username": user.username,
                "email": user.email,
                **serializer.data,
            }
        )
