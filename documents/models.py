from django.db import models
from django.contrib.auth.models import User

from projects.models import Project


class ProjectDocument(models.Model):

    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="documents"
    )

    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)

    title = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    file = models.FileField(upload_to="project_documents/")

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
