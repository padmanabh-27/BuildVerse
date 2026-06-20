from rest_framework import serializers
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'bio',
            'country',
            'timezone',
            'github_url',
            'linkedin_url',
            'experience_years'
        ]
        