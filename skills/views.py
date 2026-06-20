from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Skill, UserSkill
from .serializers import UserSkillSerializer


class UserSkillListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_skills = UserSkill.objects.filter(user=request.user)
        serializer = UserSkillSerializer(user_skills, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserSkillSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors)


class UserSkillDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        skill = UserSkill.objects.get(pk=pk, user=request.user)
        skill.delete()

        return Response({
            "message": "Skill deleted successfully"
        })