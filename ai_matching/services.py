from django.contrib.auth.models import User

from profiles.models import Profile
from projects.models import ProjectMember
from activity.models import Activity
from tasks.models import Task
from reputation.models import (
    RoleReputation,
    SkillReputation,
)


def match_users(
    current_user,
    role,
    skills,
    min_experience,
    min_contributions,
    region_filter=False,
    country=None,
    state=None,
    city=None,
):

    users = User.objects.exclude(id=current_user.id)

    results = []

    for user in users:

        try:
            profile = user.profile
        except Profile.DoesNotExist:
            continue

        # Available for work?
        if not profile.is_available:
            continue

        # ---------------- Region Filter ----------------
        if region_filter:

            if country and profile.country.lower() != country.lower():
                continue

            if state and profile.state.lower() != state.lower():
                continue

            if city and profile.city.lower() != city.lower():
                continue

        score = 0

        # =================================================
        # Role Reputation Score (30)
        # =================================================
        reputation = RoleReputation.objects.filter(
            user=user, role_name__iexact=role.strip()
        ).first()

        if reputation:

            review_confidence = min(0.5 + reputation.reviews_count / 20, 1)

            role_score = (reputation.average_rating / 5) * 30 * review_confidence

        else:
            # Neutral score for new users
            role_score = (3 / 5) * 30 * 0.5

        score += role_score

        # ---------- Skill Reputation Score (25) ----------

        skill_score = 0

        if skills:
            total_skill_score = 0

            for skill in skills:
                skill_rep = SkillReputation.objects.filter(
                    user=user,
                    role_name__iexact=role.strip(),
                    skill_name__iexact=skill.strip(),
                ).first()

                if skill_rep:
                    confidence = min(0.5 + skill_rep.reviews_count / 20, 1)

                    total_skill_score += (skill_rep.average_rating / 5) * confidence
                else:
                    total_skill_score += (3 / 5) * 0.5

            skill_score = (total_skill_score / len(skills)) * 25

        score += skill_score

        # =================================================
        # Contribution Score (20)
        # =================================================
        contributions = ProjectMember.objects.filter(user=user).count()

        if min_contributions > 0:

            contribution_score = (min(contributions / min_contributions, 1)) * 20

        else:
            contribution_score = 20

        score += contribution_score

        # =================================================
        # Task Completion Score (15)
        # =================================================
        tasks_assigned = Task.objects.filter(assigned_to=user).count()

        tasks_completed = Task.objects.filter(
            assigned_to=user, status=Task.Status.COMPLETED
        ).count()

        if tasks_assigned > 0:

            completion_rate = tasks_completed / tasks_assigned

        else:
            completion_rate = 0

        task_score = completion_rate * 15

        score += task_score

        # =================================================
        # Experience Score (5)
        # =================================================
        if min_experience > 0:

            experience_score = (
                min(max(float(profile.experience_years), 0.5) / min_experience, 1)
            ) * 5

        else:
            experience_score = 5

        score += experience_score

        # =================================================
        # Activity Score (5)
        # =================================================
        activity_count = Activity.objects.filter(user=user).count()

        activity_score = (min(activity_count, 10) / 10) * 5

        score += activity_score

        # =================================================
        # Final Result
        # =================================================
        results.append(
            {
                "user_id": user.id,
                "username": user.username,
                "match_percentage": round(score),
                "details": {
                    "role_score": round(role_score, 2),
                    "skill_score": round(skill_score, 2),
                    "contribution_score": round(contribution_score, 2),
                    "task_score": round(task_score, 2),
                    "experience_score": round(experience_score, 2),
                    "activity_score": round(activity_score, 2),
                },
            }
        )

    results.sort(key=lambda x: x["match_percentage"], reverse=True)

    return results
