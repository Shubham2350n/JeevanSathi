from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity
)

from database import db
from models import User, Worker, Job


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

        result.append({

            "id": job.id,

            "service": job.service,

            "description": job.description,

            "location": job.location,

            "status": job.status

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