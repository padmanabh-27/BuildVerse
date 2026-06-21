from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        notifications = Notification.objects.filter(recipient=request.user)

        serializer = NotificationSerializer(notifications, many=True)

        return Response(serializer.data)


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        notification = get_object_or_404(Notification, pk=pk, recipient=request.user)

        notification.is_read = True
        notification.save()

        return Response({"message": "Notification marked as read"})
