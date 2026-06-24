from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    bio = models.TextField(blank=True)

    country = models.CharField(max_length=100, blank=True)

    state = models.CharField(max_length=100, blank=True)

    city = models.CharField(max_length=100, blank=True)

    timezone = models.CharField(max_length=100, blank=True)

    github_url = models.URLField(blank=True)

    linkedin_url = models.URLField(blank=True)

    experience_years = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)

    is_available = models.BooleanField(default=True)

    def __str__(self):
        return self.user.username


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
    instance.profile.save()
