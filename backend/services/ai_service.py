import os
import json

from openai import OpenAI


def rule_based_analysis(problem):

    text = problem.lower()

    if any(word in text for word in [
        "ac",
        "air conditioner",
        "cooling",
        "air conditioning"
    ]):
        return {
            "service": "AC Repair",
            "skill": "AC Technician",
            "category": "Home Appliance",
            "urgency": "Normal",
            "reason": "The problem appears to be related to an air conditioner."
        }

    if any(word in text for word in [
        "pipe",
        "tap",
        "water leakage",
        "leakage",
        "plumber"
    ]):
        return {
            "service": "Plumbing",
            "skill": "Plumber",
            "category": "Home Maintenance",
            "urgency": "Normal",
            "reason": "The problem appears to be related to plumbing."
        }

    if any(word in text for word in [
        "fan",
        "switch",
        "wiring",
        "electricity",
        "electrical",
        "light",
        "socket"
    ]):
        return {
            "service": "Electrical Repair",
            "skill": "Electrician",
            "category": "Electrical",
            "urgency": "Normal",
            "reason": "The problem appears to be electrical."
        }

    if any(word in text for word in [
        "fridge",
        "refrigerator",
        "freezer"
    ]):
        return {
            "service": "Refrigerator Repair",
            "skill": "Refrigerator Technician",
            "category": "Home Appliance",
            "urgency": "Normal",
            "reason": "The problem appears to be related to a refrigerator."
        }

    if any(word in text for word in [
        "washing machine",
        "washer"
    ]):
        return {
            "service": "Washing Machine Repair",
            "skill": "Washing Machine Technician",
            "category": "Home Appliance",
            "urgency": "Normal",
            "reason": "The problem appears to be related to a washing machine."
        }

    if any(word in text for word in [
        "car",
        "bike",
        "motorcycle",
        "vehicle",
        "engine"
    ]):
        return {
            "service": "Vehicle Repair",
            "skill": "Mechanic",
            "category": "Vehicle",
            "urgency": "Normal",
            "reason": "The problem appears to be related to a vehicle."
        }

    return {
        "service": "General Service",
        "skill": "General Technician",
        "category": "Other",
        "urgency": "Normal",
        "reason": "The problem could not be confidently classified."
    }


def analyze_problem(problem):

    api_key = os.getenv("OPENAI_API_KEY")

    # If API key is not available,
    # use local fallback classification.
    if not api_key:
        return rule_based_analysis(problem)

    try:

        client = OpenAI(api_key=api_key)

        prompt = f"""
You are Jeevan Sathi, an AI assistant for the JeevanSetu
citizen service platform.

Analyze the citizen's problem and identify the most suitable
service and worker skill.

Citizen problem:
{problem}

Return ONLY valid JSON in this format:

{{
    "service": "service name",
    "skill": "required worker skill",
    "category": "service category",
    "urgency": "Normal",
    "reason": "short explanation"
}}

Do not add markdown.
"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You classify citizen service problems."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2
        )

        content = response.choices[0].message.content.strip()

        result = json.loads(content)

        return result

    except Exception as error:

        print("AI Error:", error)

        return rule_based_analysis(problem)