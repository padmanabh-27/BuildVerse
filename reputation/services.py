from projects.models import ProjectMember
from .models import RoleReputation
from skills.models import UserSkill
from .models import SkillReputation


def update_role_reputation(
    project,
    reviewed_user,
    overall_rating,
):

    # Find the role of the reviewed user in this project
    member = ProjectMember.objects.get(
        project=project,
        user=reviewed_user,
    )

    role_name = member.role.role_name

    reputation, created = RoleReputation.objects.get_or_create(
        user=reviewed_user,
        role_name=role_name,
    )

    total_rating = reputation.average_rating * reputation.reviews_count

    total_rating += overall_rating

    reputation.reviews_count += 1

    reputation.average_rating = total_rating / reputation.reviews_count

    reputation.save()


def update_skill_reputation(
    project,
    reviewed_user,
    overall_rating,
):

    # Find user's role in this project
    member = ProjectMember.objects.get(
        project=project,
        user=reviewed_user,
    )

    role_name = member.role.role_name

    # Get all skills of reviewed user
    user_skills = UserSkill.objects.filter(user=reviewed_user)

    # Update reputation for each skill
    for user_skill in user_skills:

        skill_name = user_skill.skill.name

        reputation, created = SkillReputation.objects.get_or_create(
            user=reviewed_user,
            role_name=role_name,
            skill_name=skill_name,
        )

        total_rating = reputation.average_rating * reputation.reviews_count

        total_rating += overall_rating

        reputation.reviews_count += 1

        reputation.average_rating = total_rating / reputation.reviews_count

        reputation.save()
