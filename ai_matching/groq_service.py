from openai import OpenAI
from dotenv import load_dotenv
import os
import json

from .prompts import TEAM_MATCHING_PROMPT

load_dotenv(dotenv_path=".env")

client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1"
)


def test_groq():

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": "Say hello"}],
    )

    return response.choices[0].message.content


def extract_requirements(query):

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": TEAM_MATCHING_PROMPT},
            {"role": "user", "content": query},
        ],
    )

    text = response.choices[0].message.content

    return json.loads(text)
