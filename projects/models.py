from django.db import models
from django.contrib.auth.models import User
from skills.models import Skill


class Project(models.Model):

    class Status(models.TextChoices):
        RECRUITING = "recruiting", "Recruiting"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"

    class Visibility(models.TextChoices):
        PUBLIC = "public", "Public"
        PORTFOLIO_ONLY = "portfolio_only", "Portfolio Only"
        PRIVATE = "private", "Private"

    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_projects"
    )

    title = models.CharField(
        max_length=200,
        unique=True
    )

    description = models.TextField()

    category = models.CharField(
        max_length=100
    )

    difficulty = models.CharField(
        max_length=50
    )

    max_members = models.PositiveIntegerField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.RECRUITING
    )

    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PORTFOLIO_ONLY
    )

    github_repo_url = models.URLField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):
        self.category = self.category.lower()
        self.difficulty = self.difficulty.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ProjectSkill(models.Model):

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="required_skills"
    )

    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE
    )

    minimum_experience_years = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=0.0
    )

    def __str__(self):
        return f"{self.project.title} - {self.skill.name}"


class ProjectRole(models.Model):

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="roles"
    )

    role_name = models.CharField(
        max_length=100
    )

    slots_required = models.PositiveIntegerField(
        default=1
    )

    def save(self, *args, **kwargs):
        self.role_name = self.role_name.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.role_name


class JoinRequest(models.Model):

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="join_requests"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    requested_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = ["project", "user"]

    def __str__(self):
        return f"{self.user.username} -> {self.project.title}"


class ProjectMember(models.Model):

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="members"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    role = models.ForeignKey(
        ProjectRole,
        on_delete=models.CASCADE
    )

    joined_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = ["project", "user"]

    def __str__(self):
        return f"{self.user.username} - {self.role.role_name}"