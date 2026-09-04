from flask import Blueprint, request, jsonify

from services.ai_service import analyze_problem

from services.matching import find_matching_workers


ai_bp = Blueprint(
    "ai",
    __name__
)


# =========================================================
# ANALYZE PROBLEM
# =========================================================

@ai_bp.route(
    "/analyze",
    methods=["POST"]
)
def analyze():

    data = request.get_json()


    if not data:

        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400


    problem = data.get(
        "problem",
        ""
    ).strip()


    if not problem:

        return jsonify({
            "success": False,
            "message":
                "Please describe your problem"
        }), 400


    result = analyze_problem(
        problem
    )


    return jsonify({

        "success": True,

        "problem": problem,

        "analysis": result

    })


# =========================================================
# FIND MATCHING WORKERS
# =========================================================

@ai_bp.route(
    "/match-workers",
    methods=["POST"]
)
def match_workers():

    data = request.get_json()


    if not data:

        return jsonify({
            "success": False,
            "message":
                "Request body is required"
        }), 400


    required_skill = data.get(
        "skill",
        ""
    ).strip()


    location = data.get(
        "location",
        ""
    ).strip()


    if not required_skill:

        return jsonify({
            "success": False,
            "message":
                "Required skill is missing"
        }), 400


    workers = find_matching_workers(

        required_skill,

        location

    )


    return jsonify({

        "success": True,

        "skill": required_skill,

        "location": location,

        "workers": workers

    })