from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .serializers import TeamMatchingSerializer
from .groq_service import extract_requirements
from .services import match_users


class TeamMatchingView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = TeamMatchingSerializer(data=request.data)

        if serializer.is_valid():

            query = serializer.validated_data["query"]

            requirements = extract_requirements(query)

            results = match_users(
                current_user=request.user,
                role=requirements["role"],
                skills=requirements["skills"],
                min_experience=requirements["min_experience"],
                min_contributions=requirements["min_contributions"],
                region_filter=serializer.validated_data["region_filter"],
                country=serializer.validated_data.get("country"),
                state=serializer.validated_data.get("state"),
                city=serializer.validated_data.get("city"),
            )

            return Response(results)

        return Response(serializer.errors)
