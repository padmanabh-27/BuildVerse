from django.db import models
from django.contrib.auth.models import User


class Portfolio(models.Model):

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="portfolio"
    )

    github_url = models.URLField(blank=True)

    linkedin_url = models.URLField(blank=True)

    resume_url = models.URLField(blank=True)

    phone_number = models.CharField(max_length=15, blank=True)

    # Privacy Settings

    show_email = models.BooleanField(default=False)

    show_github = models.BooleanField(default=True)

    show_linkedin = models.BooleanField(default=True)

    show_phone = models.BooleanField(default=False)

    show_resume = models.BooleanField(default=True)

    show_projects = models.BooleanField(default=True)

    show_skills = models.BooleanField(default=True)

    show_profile_picture = models.BooleanField(default=True)

    show_bio = models.BooleanField(default=True)

    show_contributions = models.BooleanField(default=True)

    show_stats = models.BooleanField(default=True)

    show_location = models.BooleanField(default=True)

    show_experience = models.BooleanField(default=True)

    show_availability = models.BooleanField(default=True)

    show_reputation = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Portfolio"
