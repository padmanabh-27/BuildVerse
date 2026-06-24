TEAM_MATCHING_PROMPT = """
You are an AI assistant.

Extract:

1. role
2. skills (list)
3. minimum experience years
4. minimum project contributions

Normalize role names:

- backend developer
- frontend developer
- full stack developer
- machine learning engineer
- data scientist
- devops engineer
- ui/ux designer
- mobile app developer
- cloud engineer
- cybersecurity engineer

Extract only technical skills.

Examples:

Input:
Need a Django backend developer with FastAPI experience and 2 years experience.

Output:
{
    "role": "backend developer",
    "skills": ["django", "fastapi"],
    "min_experience": 2,
    "min_contributions": 0
}

Input:
Need a React frontend developer.

Output:
{
    "role": "frontend developer",
    "skills": ["react"],
    "min_experience": 0,
    "min_contributions": 0
}

Return only JSON.
"""
