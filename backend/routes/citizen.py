from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from models import (
    Worker,
    User,
    Job,
    Review,
    Complaint
)

from database import db

import re


citizen_bp = Blueprint(
    "citizen",
    __name__
)


# =========================================================
# PHONE VALIDATION
# =========================================================

def validate_phone(phone):

    if phone is None:
        return True

    phone = str(phone).strip()

    if phone == "":
        return True

    return bool(
        re.fullmatch(
            r"\d{10}",
            phone
        )
    )


# =========================================================
# GET CURRENT CITIZEN
# =========================================================

def get_current_citizen():

    try:

        user_id = int(
            get_jwt_identity()
        )

    except (
        TypeError,
        ValueError
    ):

        return None

    user = User.query.get(
        user_id
    )

    if not user:
        return None

    if user.role != "citizen":
        return None

    return user


# =========================================================
# GET WORKERS
# =========================================================

@citizen_bp.route(
    "/workers",
    methods=["GET"]
)
@jwt_required()
def get_workers():

    workers = Worker.query.all()

    result = []

    for worker in workers:

        user = User.query.get(
            worker.user_id
        )

        if not user:
            continue

        result.append({

            "id":
                worker.id,

            "name":
                user.name,

            "email":
                user.email,

            "skill":
                worker.skill,

            "experience":
                worker.experience,

            "rating":
                worker.rating,

            "location":
                worker.location,

            "verified":
                worker.verified,

            "available":
                worker.available,

            "certifications":
                worker.certifications

        })

    return jsonify({

        "workers":
            result

    }), 200


# =========================================================
# CREATE SERVICE REQUEST
# =========================================================

@citizen_bp.route(
    "/jobs",
    methods=["POST"]
)
@jwt_required()
def create_job():

    citizen = get_current_citizen()

    if not citizen:

        return jsonify({

            "success": False,

            "message":
                "Citizen authentication required"

        }), 403

    data = request.get_json()

    if not data:

        return jsonify({

            "success": False,

            "message":
                "Request body is required"

        }), 400

    worker_id = data.get(
        "worker_id"
    )

    service = data.get(
        "service",
        ""
    ).strip()

    description = data.get(
        "description",
        ""
    ).strip()

    location = data.get(
        "location",
        ""
    ).strip()

    # -----------------------------------------------------
    # OPTIONAL GPS
    # -----------------------------------------------------

    latitude = data.get(
        "latitude"
    )

    longitude = data.get(
        "longitude"
    )

    location_accuracy = data.get(
        "location_accuracy"
    )

    if not worker_id:

        return jsonify({

            "success": False,

            "message":
                "Worker is required"

        }), 400

    if not service:

        return jsonify({

            "success": False,

            "message":
                "Service is required"

        }), 400

    if not description:

        return jsonify({

            "success": False,

            "message":
                "Problem description is required"

        }), 400

    if not location:

        return jsonify({

            "success": False,

            "message":
                "Location is required"

        }), 400

    worker = Worker.query.get(
        worker_id
    )

    if not worker:

        return jsonify({

            "success": False,

            "message":
                "Worker not found"

        }), 404

    if not worker.verified:

        return jsonify({

            "success": False,

            "message":
                "This worker is not verified"

        }), 400

    if not worker.available:

        return jsonify({

            "success": False,

            "message":
                "This worker is currently unavailable"

        }), 400

    job = Job(

        citizen_id=
            citizen.id,

        worker_id=
            worker.id,

        service=
            service,

        description=
            description,

        location=
            location,

        latitude=
            latitude,

        longitude=
            longitude,

        location_accuracy=
            location_accuracy,

        status=
            "requested"

    )

    db.session.add(
        job
    )

    db.session.commit()

    return jsonify({

        "success":
            True,

        "message":
            "Worker request sent successfully",

        "job": {

            "id":
                job.id,

            "service":
                job.service,

            "description":
                job.description,

            "location":
                job.location,

            "latitude":
                job.latitude,

            "longitude":
                job.longitude,

            "location_accuracy":
                job.location_accuracy,

            "status":
                job.status,

            "worker_id":
                job.worker_id

        }

    }), 201


# =========================================================
# GET CITIZEN JOBS
# =========================================================

@citizen_bp.route(
    "/jobs",
    methods=["GET"]
)
@jwt_required()
def get_citizen_jobs():

    citizen = get_current_citizen()

    if not citizen:

        return jsonify({

            "success": False,

            "message":
                "Citizen authentication required"

        }), 403

    jobs = Job.query.filter_by(

        citizen_id=
            citizen.id

    ).order_by(

        Job.created_at.desc()

    ).all()

    result = []

    for job in jobs:

        worker = None

        worker_user = None

        if job.worker_id:

            worker = Worker.query.get(
                job.worker_id
            )

            if worker:

                worker_user = User.query.get(
                    worker.user_id
                )

        review = Review.query.filter_by(

            job_id=
                job.id

        ).first()

        # -------------------------------------------------
        # PHONE ONLY AFTER ACCEPTED
        # -------------------------------------------------

        worker_phone = None

        if (
            worker_user
            and job.status in [
                "accepted",
                "in_progress",
                "completed"
            ]
        ):

            worker_phone = (
                worker_user.phone
            )

        result.append({

            "id":
                job.id,

            "service":
                job.service,

            "description":
                job.description,

            "location":
                job.location,

            "latitude":
                job.latitude,

            "longitude":
                job.longitude,

            "location_accuracy":
                job.location_accuracy,

            "status":
                job.status,

            "worker_id":
                job.worker_id,

            "worker_name": (

                worker_user.name

                if worker_user

                else "Not Assigned"

            ),

            "worker_skill": (

                worker.skill

                if worker

                else ""

            ),

            "worker_phone":
                worker_phone,

            "created_at": (

                job.created_at.strftime(
                    "%Y-%m-%d %H:%M"
                )

            ),

            "has_review": (

                True

                if review

                else False

            ),

            "review_rating": (

                review.rating

                if review

                else None

            )

        })

    return jsonify({

        "success":
            True,

        "jobs":
            result

    }), 200


# =========================================================
# CREATE REVIEW
# =========================================================

@citizen_bp.route(
    "/reviews",
    methods=["POST"]
)
@jwt_required()
def create_review():

    citizen = get_current_citizen()

    if not citizen:

        return jsonify({

            "success": False,

            "message":
                "Citizen authentication required"

        }), 403

    data = request.get_json()

    if not data:

        return jsonify({

            "success": False,

            "message":
                "Request body is required"

        }), 400

    job_id = data.get(
        "job_id"
    )

    rating = data.get(
        "rating"
    )

    feedback = data.get(
        "feedback",
        ""
    ).strip()

    if not job_id:

        return jsonify({

            "success": False,

            "message":
                "Job ID is required"

        }), 400

    if rating is None:

        return jsonify({

            "success": False,

            "message":
                "Rating is required"

        }), 400

    try:

        rating = int(
            rating
        )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({

            "success": False,

            "message":
                "Rating must be a number"

        }), 400

    if rating < 1 or rating > 5:

        return jsonify({

            "success": False,

            "message":
                "Rating must be between 1 and 5"

        }), 400

    job = Job.query.get(
        job_id
    )

    if not job:

        return jsonify({

            "success": False,

            "message":
                "Job not found"

        }), 404

    if job.citizen_id != citizen.id:

        return jsonify({

            "success": False,

            "message":
                "You cannot review this job"

        }), 403

    if job.status != "completed":

        return jsonify({

            "success": False,

            "message":
                "You can review only completed jobs"

        }), 400

    if not job.worker_id:

        return jsonify({

            "success": False,

            "message":
                "No worker is assigned to this job"

        }), 400

    existing_review = Review.query.filter_by(

        job_id=
            job.id

    ).first()

    if existing_review:

        return jsonify({

            "success": False,

            "message":
                "You have already reviewed this job"

        }), 400

    worker = Worker.query.get(
        job.worker_id
    )

    if not worker:

        return jsonify({

            "success": False,

            "message":
                "Worker not found"

        }), 404

    review = Review(

        job_id=
            job.id,

        citizen_id=
            citizen.id,

        worker_id=
            worker.id,

        rating=
            rating,

        feedback=
            feedback

    )

    db.session.add(
        review
    )

    db.session.flush()

    reviews = Review.query.filter_by(

        worker_id=
            worker.id

    ).all()

    total_rating = sum(

        review_item.rating

        for review_item in reviews

    )

    worker.rating = round(

        total_rating / len(reviews),

        2

    )

    db.session.commit()

    return jsonify({

        "success":
            True,

        "message":
            "Thank you for your feedback!",

        "review": {

            "id":
                review.id,

            "job_id":
                review.job_id,

            "rating":
                review.rating,

            "feedback":
                review.feedback

        },

        "worker_rating":
            worker.rating

    }), 201


# =========================================================
# CREATE COMPLAINT
# =========================================================

@citizen_bp.route(
    "/complaints",
    methods=["POST"]
)
@jwt_required()
def create_complaint():

    citizen = get_current_citizen()

    if not citizen:

        return jsonify({

            "success": False,

            "message":
                "Citizen authentication required"

        }), 403

    data = request.get_json() or {}

    subject = data.get(
        "subject",
        ""
    ).strip()

    description = data.get(
        "description",
        ""
    ).strip()

    priority = data.get(
        "priority",
        "medium"
    ).strip().lower()

    job_id = data.get(
        "job_id"
    )

    if not subject:

        return jsonify({

            "success": False,

            "message":
                "Complaint subject is required"

        }), 400

    if not description:

        return jsonify({

            "success": False,

            "message":
                "Complaint description is required"

        }), 400

    if priority not in [
        "low",
        "medium",
        "high"
    ]:

        priority = "medium"

    job = None

    if job_id:

        try:

            job_id = int(
                job_id
            )

        except (
            TypeError,
            ValueError
        ):

            return jsonify({

                "success": False,

                "message":
                    "Invalid job ID"

            }), 400

        job = Job.query.filter_by(

            id=
                job_id,

            citizen_id=
                citizen.id

        ).first()

        if not job:

            return jsonify({

                "success": False,

                "message":
                    "Job not found"

            }), 404

    complaint = Complaint(

        citizen_id=
            citizen.id,

        job_id=(
            job.id
            if job
            else None
        ),

        subject=
            subject,

        description=
            description,

        priority=
            priority,

        status=
            "pending"

    )

    db.session.add(
        complaint
    )

    db.session.commit()

    return jsonify({

        "success":
            True,

        "message":
            "Complaint submitted successfully",

        "complaint": {

            "id":
                complaint.id,

            "subject":
                complaint.subject,

            "description":
                complaint.description,

            "priority":
                complaint.priority,

            "status":
                complaint.status,

            "created_at":
                complaint.created_at.isoformat()

        }

    }), 201


# =========================================================
# GET CITIZEN COMPLAINTS
# =========================================================

@citizen_bp.route(
    "/complaints",
    methods=["GET"]
)
@jwt_required()
def get_citizen_complaints():

    citizen = get_current_citizen()

    if not citizen:

        return jsonify({

            "success": False,

            "message":
                "Citizen authentication required"

        }), 403

    complaints = Complaint.query.filter_by(

        citizen_id=
            citizen.id

    ).order_by(

        Complaint.created_at.desc()

    ).all()

    result = []

    for complaint in complaints:

        result.append({

            "id":
                complaint.id,

            "job_id":
                complaint.job_id,

            "subject":
                complaint.subject,

            "description":
                complaint.description,

            "priority":
                complaint.priority,

            "status":
                complaint.status,

            "resolution_note":
                complaint.resolution_note or "",

            "created_at": (

                complaint.created_at.isoformat()

                if complaint.created_at

                else None

            ),

            "updated_at": (

                complaint.updated_at.isoformat()

                if complaint.updated_at

                else None

            )

        })

    return jsonify({

        "success":
            True,

        "complaints":
            result

    }), 200