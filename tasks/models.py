from django.db import models
from django.contrib.auth.models import User

from projects.models import Project


class Task(models.Model):

    class Status(models.TextChoices):
        TODO = "todo", "Todo"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")

    title = models.CharField(max_length=200)

    description = models.TextField()

    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="assigned_tasks"
    )

    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="created_tasks"
    )

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.TODO
    )

    priority = models.CharField(
        max_length=20, choices=Priority.choices, default=Priority.MEDIUM
    )

    due_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class TaskComment(models.Model):

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    comment = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}"
