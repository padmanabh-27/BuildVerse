from rest_framework import serializers
from .models import Skill, UserSkill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']


class UserSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.SerializerMethodField()

    class Meta:
        model = UserSkill
        fields = [
            'id',
            'skill_name',
            'experience_years'
        ]

    def get_skill_name(self, obj):
        return obj.skill.name

    def create(self, validated_data):
        skill_name = self.initial_data.get('skill_name')

        skill, created = Skill.objects.get_or_create(
            name=skill_name
        )

        user = self.context['request'].user

        user_skill, created = UserSkill.objects.get_or_create(
            user=user,
            skill=skill,
            defaults={
                'experience_years': validated_data['experience_years']
            }
        )

        if not created:
            user_skill.experience_years = validated_data['experience_years']
            user_skill.save()

        return user_skill