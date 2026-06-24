from django.db import models
from django.contrib.auth.models import User


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def save(self, *args, **kwargs):
        self.name = self.name.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class UserSkill(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="user_skills")

    skill = models.ForeignKey(
        Skill, on_delete=models.CASCADE, related_name="user_skills"
    )

    experience_years = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)

    class Meta:
        unique_together = ["user", "skill"]

    def __str__(self):
        return f"{self.user.username} - {self.skill.name}"
