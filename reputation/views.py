from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from .models import (
    RoleReputation,
    SkillReputation,
)

from .serializers import (
    RoleReputationSerializer,
    SkillReputationSerializer,
)


class UserRoleReputationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        user = get_object_or_404(User, pk=pk)

        reputations = RoleReputation.objects.filter(user=user).order_by(
            "-average_rating"
        )

        serializer = RoleReputationSerializer(reputations, many=True)

        return Response(serializer.data)


class UserSkillReputationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        user = get_object_or_404(User, pk=pk)

        reputations = SkillReputation.objects.filter(user=user).order_by(
            "-average_rating"
        )

        serializer = SkillReputationSerializer(reputations, many=True)

        return Response(serializer.data)
