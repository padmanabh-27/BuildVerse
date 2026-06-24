from django.db import models
from django.contrib.auth.models import User


class RoleReputation(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    role_name = models.CharField(max_length=100)

    average_rating = models.FloatField(default=0)

    reviews_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("user", "role_name")

    def __str__(self):
        return f"{self.user.username} - {self.role_name}"


class SkillReputation(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    role_name = models.CharField(max_length=100)

    skill_name = models.CharField(max_length=100)

    average_rating = models.FloatField(default=0)

    reviews_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("user", "role_name", "skill_name")

    def __str__(self):
        return f"{self.user.username} - " f"{self.skill_name}"
