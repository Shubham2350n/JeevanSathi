from flask import Blueprint, jsonify, request

from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from database import db

from models import (
    User,
    Worker,
    Job,
    Review,
    Complaint
)

worker_bp = Blueprint(
    "worker",
    __name__
)


def get_current_worker():

    user_id = int(
        get_jwt_identity()
    )

    user = User.query.get(
        user_id
    )

    if not user:
        return None, None

    worker = Worker.query.filter_by(
        user_id=user.id
    ).first()

    return user, worker


# ==========================================
# WORKER PROFILE
# ==========================================

@worker_bp.route(
    "/profile",
    methods=["GET"]
)
@jwt_required()
def get_profile():

    user, worker = get_current_worker()

    if not user or not worker:

        return jsonify({
            "message": "Worker profile not found"
        }), 404

    return jsonify({

        "worker": {

            "id": worker.id,

            "name": user.name,

            "email": user.email,

            "skill": worker.skill,

            "experience": worker.experience,

            "rating": worker.rating,

            "location": worker.location,

            "verified": worker.verified,

            "available": worker.available,

            "certifications": worker.certifications

        }

    }), 200


# ==========================================
# WORKER RATINGS / REVIEWS
# ==========================================

@worker_bp.route(
    "/reviews",
    methods=["GET"]
)
@jwt_required()
def get_worker_reviews():

    user, worker = get_current_worker()

    if not user or not worker:

        return jsonify({
            "message": "Worker not found"
        }), 404

    reviews = Review.query.filter_by(
        worker_id=worker.id
    ).order_by(
        Review.created_at.desc()
    ).all()

    result = []

    for review in reviews:

        citizen = User.query.get(
            review.citizen_id
        )

        job = Job.query.get(
            review.job_id
        )

        result.append({

            "id": review.id,

            "job_id": review.job_id,

            "citizen_id": review.citizen_id,

            "citizen_name":
                citizen.name
                if citizen
                else "Citizen",

            "rating": review.rating,

            "feedback": review.feedback,

            "service":
                job.service
                if job
                else "Service",

            "created_at":
                review.created_at.isoformat()

        })

    if reviews:

        average_rating = round(
            sum(
                review.rating
                for review in reviews
            ) / len(reviews),
            1
        )

    else:

        average_rating = 0

    return jsonify({

        "reviews": result,

        "average_rating": average_rating,

        "total_reviews": len(reviews)

    }), 200


# ==========================================
# WORKER COMPLAINTS
# ==========================================

@worker_bp.route(
    "/complaints",
    methods=["GET"]
)
@jwt_required()
def get_worker_complaints():

    user, worker = get_current_worker()

    if not user or not worker:

        return jsonify({
            "message": "Worker not found"
        }), 404

    jobs = Job.query.filter_by(
        worker_id=worker.id
    ).all()

    job_ids = [
        job.id
        for job in jobs
    ]

    if not job_ids:

        return jsonify({
            "complaints": []
        }), 200

    complaints = Complaint.query.filter(
        Complaint.job_id.in_(job_ids)
    ).order_by(
        Complaint.created_at.desc()
    ).all()

    result = []

    for complaint in complaints:

        citizen = User.query.get(
            complaint.citizen_id
        )

        job = Job.query.get(
            complaint.job_id
        ) if complaint.job_id else None

        result.append({

            "id": complaint.id,

            "job_id": complaint.job_id,

            "citizen_id":
                complaint.citizen_id,

            "citizen_name":
                citizen.name
                if citizen
                else "Citizen",

            "subject":
                complaint.subject,

            "description":
                complaint.description,

            "priority":
                complaint.priority,

            "status":
                complaint.status,

            "resolution_note":
                complaint.resolution_note,

            "service":
                job.service
                if job
                else "Service",

            "created_at":
                complaint.created_at.isoformat(),

            "updated_at":
                complaint.updated_at.isoformat()
                if complaint.updated_at
                else None

        })

    return jsonify({

        "complaints": result

    }), 200


# ==========================================
# UPDATE AVAILABILITY
# ==========================================

@worker_bp.route(
    "/availability",
    methods=["PUT"]
)
@jwt_required()
def update_availability():

    user, worker = get_current_worker()

    if not user or not worker:

        return jsonify({
            "message": "Worker not found"
        }), 404

    data = request.get_json()

    if not data:

        return jsonify({
            "message": "Request body is required"
        }), 400

    available = data.get(
        "available"
    )

    if available is None:

        return jsonify({
            "message": "Availability is required"
        }), 400

    worker.available = bool(
        available
    )

    db.session.commit()

    return jsonify({

        "message": "Availability updated",

        "available": worker.available

    }), 200


# ==========================================
# NEW JOB REQUESTS
# ==========================================

@worker_bp.route(
    "/jobs/requests",
    methods=["GET"]
)
@jwt_required()
def get_job_requests():

    user, worker = get_current_worker()

    if not user or not worker:

        return jsonify({
            "message": "Worker not found"
        }), 404

    jobs = Job.query.filter_by(
        worker_id=worker.id,
        status="requested"
    ).order_by(
        Job.created_at.desc()
    ).all()

    result = []

    for job in jobs:

        citizen = User.query.get(
            job.citizen_id
        )

        result.append({

            "id": job.id,

            "service": job.service,

            "description": job.description,

            "location": job.location,

            "status": job.status,

            "citizen_name":
                citizen.name
                if citizen
                else "Citizen",

            "created_at":
                job.created_at.isoformat()

        })

    return jsonify({
        "jobs": result
    }), 200


# ==========================================
# ACTIVE JOBS
# ==========================================

@worker_bp.route(
    "/jobs/active",
    methods=["GET"]
)
@jwt_required()
def get_active_jobs():

    user, worker = get_current_worker()

    if not user or not worker:

        return jsonify({
            "message": "Worker not found"
        }), 404

    jobs = Job.query.filter(
        Job.worker_id == worker.id,
        Job.status.in_([
            "accepted",
            "in_progress"
        ])
    ).order_by(
        Job.created_at.desc()
    ).all()

    result = []

    for job in jobs:

        citizen = User.query.get(
            job.citizen_id
        )

        result.append({

            "id": job.id,

            "service": job.service,

            "description": job.description,

            "location": job.location,

            "status": job.status,

            "citizen_name":
                citizen.name
                if citizen
                else "Citizen"

        })

    return jsonify({
        "jobs": result
    }), 200


# ==========================================
# COMPLETED JOBS
# ==========================================

# ==========================================
# COMPLETED JOBS
# ==========================================

@worker_bp.route(
    "/jobs/completed",
    methods=["GET"]
)
@jwt_required()
def get_completed_jobs():

    user, worker = get_current_worker()

    if not user or not worker:
        return jsonify({
            "message": "Worker not found"
        }), 404

    jobs = Job.query.filter_by(
        worker_id=worker.id,
        status="completed"
    ).order_by(
        Job.created_at.desc()
    ).all()

    result = []

    for job in jobs:

        # Find review given by citizen for this job
        review = Review.query.filter_by(
            job_id=job.id,
            worker_id=worker.id
        ).first()

        result.append({

            "id": job.id,

            "service": job.service,

            "description": job.description,

            "location": job.location,

            "status": job.status,

            # Citizen rating
            "rating": (
                review.rating
                if review
                else None
            ),

            # Citizen feedback
            "feedback": (
                review.feedback
                if review
                else None
            )

        })

    return jsonify({
        "jobs": result
    }), 200

# ==========================================
# ACCEPT JOB
# ==========================================

@worker_bp.route(
    "/jobs/<int:job_id>/accept",
    methods=["PUT"]
)
@jwt_required()
def accept_job(job_id):

    user, worker = get_current_worker()

    if not user or not worker:

        return jsonify({
            "message": "Worker not found"
        }), 404

    job = Job.query.get(
        job_id
    )

    if not job:

        return jsonify({
            "message": "Job not found"
        }), 404

    if job.worker_id != worker.id:

        return jsonify({
            "message":
                "This job is not assigned to you"
        }), 403

    if job.status != "requested":

        return jsonify({
            "message":
                "Job is no longer available"
        }), 400

    job.status = "accepted"

    worker.available = False

    db.session.commit()

    return jsonify({

        "message":
            "Job accepted successfully",

        "job": {

            "id": job.id,

            "status": job.status

        }

    }), 200


# ==========================================
# START JOB
# ==========================================

@worker_bp.route(
    "/jobs/<int:job_id>/start",
    methods=["PUT"]
)
@jwt_required()
def start_job(job_id):

    user, worker = get_current_worker()

    if not user or not worker:

        return jsonify({
            "message": "Worker not found"
        }), 404

    job = Job.query.get(
        job_id
    )

    if not job:

        return jsonify({
            "message": "Job not found"
        }), 404

    if job.worker_id != worker.id:

        return jsonify({
            "message":
                "This job is not assigned to you"
        }), 403

    if job.status != "accepted":

        return jsonify({
            "message":
                "Only accepted jobs can be started"
        }), 400

    job.status = "in_progress"

    db.session.commit()

    return jsonify({

        "message":
            "Job started successfully",

        "job": {

            "id": job.id,

            "status": job.status

        }

    }), 200


# ==========================================
# REJECT JOB
# ==========================================

@worker_bp.route(
    "/jobs/<int:job_id>/reject",
    methods=["PUT"]
)
@jwt_required()
def reject_job(job_id):

    user, worker = get_current_worker()

    if not user or not worker:

        return jsonify({
            "message": "Worker not found"
        }), 404

    job = Job.query.get(
        job_id
    )

    if not job:

        return jsonify({
            "message": "Job not found"
        }), 404

    if job.worker_id != worker.id:

        return jsonify({
            "message":
                "This job is not assigned to you"
        }), 403

    if job.status != "requested":

        return jsonify({
            "message":
                "Job is no longer available"
        }), 400

    job.status = "rejected"

    db.session.commit()

    return jsonify({

        "message":
            "Job rejected successfully"

    }), 200


# ==========================================
# COMPLETE JOB
# ==========================================

@worker_bp.route(
    "/jobs/<int:job_id>/complete",
    methods=["PUT"]
)
@jwt_required()
def complete_job(job_id):

    user, worker = get_current_worker()

    if not user or not worker:

        return jsonify({
            "message": "Worker not found"
        }), 404

    job = Job.query.get(
        job_id
    )

    if not job:

        return jsonify({
            "message": "Job not found"
        }), 404

    if job.worker_id != worker.id:

        return jsonify({
            "message":
                "This job is not assigned to you"
        }), 403

    if job.status != "in_progress":

        return jsonify({
            "message":
                "Start the job before completing it"
        }), 400

    job.status = "completed"

    worker.available = True

    db.session.commit()

    return jsonify({

        "message":
            "Job completed successfully",

        "job": {

            "id": job.id,

            "status": job.status

        }

    }), 200