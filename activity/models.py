from django.db import models
from django.contrib.auth.models import User


class Activity(models.Model):

    ACTIVITY_TYPES = [
        ("project", "Project"),
        ("join_request", "Join Request"),
        ("member", "Member"),
        ("task", "Task"),
        ("document", "Document"),
        ("chat", "Chat"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="activities")

    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)

    message = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.message
