from django.db import models
from django.contrib.auth.models import User
from projects.models import Project


class ProjectReview(models.Model):

    project = models.ForeignKey(Project, on_delete=models.CASCADE)

    reviewer = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="reviews_given"
    )

    reviewed_user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="reviews_received"
    )

    technical_rating = models.PositiveSmallIntegerField()

    communication_rating = models.PositiveSmallIntegerField()

    teamwork_rating = models.PositiveSmallIntegerField()

    deadline_rating = models.PositiveSmallIntegerField()

    feedback = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("project", "reviewer", "reviewed_user")

    def __str__(self):
        return f"{self.reviewer.username} -> {self.reviewed_user.username}"

    @property
    def overall_rating(self):
        return round(
            (
                self.technical_rating
                + self.communication_rating
                + self.teamwork_rating
                + self.deadline_rating
            )
            / 4,
            2,
        )
