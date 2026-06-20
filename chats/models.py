from django.db import models
from django.contrib.auth.models import User

from projects.models import Project


class Conversation(models.Model):
    project = models.OneToOneField(
        Project, on_delete=models.CASCADE, related_name="conversation"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.project.title


class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, on_delete=models.CASCADE, related_name="messages"
    )

    sender = models.ForeignKey(User, on_delete=models.CASCADE)

    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.sender.username}"
