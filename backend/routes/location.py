from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

from database import db
from models import User, Worker, Job, JobLocation

location_bp = Blueprint("location", __name__)

def current_user():
    try:
        user_id = int(get_jwt_identity())
    except (TypeError, ValueError):
        return None
    return User.query.get(user_id)

def user_can_access_job(user, job):
    if not user or not job:
        return False
    if user.role == "citizen":
        return job.citizen_id == user.id
    if user.role == "worker":
        worker = Worker.query.filter_by(user_id=user.id).first()
        return bool(worker and job.worker_id == worker.id)
    return False

def valid_gps(lat, lng):
    try:
        lat = float(lat); lng = float(lng)
    except (TypeError, ValueError):
        return False
    return -90 <= lat <= 90 and -180 <= lng <= 180

@location_bp.route("/update", methods=["POST"])
@jwt_required()
def update_location():
    user = current_user()
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 401
    data = request.get_json(silent=True) or {}
    job_id = data.get("job_id")
    latitude = data.get("latitude")
    longitude = data.get("longitude")
    accuracy = data.get("accuracy")
    if not job_id or not valid_gps(latitude, longitude):
        return jsonify({"success": False, "message": "Valid GPS coordinates are required"}), 400
    job = Job.query.get(job_id)
    if not job:
        return jsonify({"success": False, "message": "Job not found"}), 404
    if not user_can_access_job(user, job):
        return jsonify({"success": False, "message": "Not authorized for this job"}), 403
    if job.status not in ["accepted", "in_progress"]:
        return jsonify({"success": False, "message": "Live tracking is available only for active jobs"}), 400
    try:
        latitude = float(latitude); longitude = float(longitude)
        accuracy = float(accuracy) if accuracy is not None else None
    except (TypeError, ValueError):
        return jsonify({"success": False, "message": "Invalid location values"}), 400
    row = JobLocation.query.filter_by(job_id=job.id, user_id=user.id).first()
    if row:
        row.latitude = latitude; row.longitude = longitude; row.accuracy = accuracy; row.updated_at = datetime.utcnow()
    else:
        row = JobLocation(job_id=job.id, user_id=user.id, role=user.role, latitude=latitude, longitude=longitude, accuracy=accuracy)
        db.session.add(row)
    db.session.commit()
    return jsonify({"success": True, "location": {"user_id": user.id, "role": user.role, "latitude": latitude, "longitude": longitude, "accuracy": accuracy, "updated_at": row.updated_at.isoformat() if row.updated_at else None}}), 200

@location_bp.route("/job/<int:job_id>", methods=["GET"])
@jwt_required()
def get_job_locations(job_id):
    user = current_user(); job = Job.query.get(job_id)
    if not user: return jsonify({"success": False, "message": "User not found"}), 401
    if not job: return jsonify({"success": False, "message": "Job not found"}), 404
    if not user_can_access_job(user, job): return jsonify({"success": False, "message": "Not authorized for this job"}), 403
    rows = JobLocation.query.filter_by(job_id=job.id).all(); locations = []
    for row in rows:
        u = User.query.get(row.user_id)
        locations.append({"user_id": row.user_id, "name": u.name if u else "User", "role": row.role, "latitude": row.latitude, "longitude": row.longitude, "accuracy": row.accuracy, "updated_at": row.updated_at.isoformat() if row.updated_at else None})
    citizen_user = User.query.get(job.citizen_id)

    assigned_worker = (
        Worker.query.get(job.worker_id)
        if job.worker_id
        else None
    )

    worker_user = (
        User.query.get(assigned_worker.user_id)
        if assigned_worker
        else None
    )

    citizen_location = next(
        (x for x in locations if x["role"] == "citizen"),
        None
    )

    worker_location = next(
        (x for x in locations if x["role"] == "worker"),
        None
    )

    # Phone numbers are returned independently of GPS.
    # This lets both sides contact each other as soon as
    # the job is accepted, even before either side starts GPS.
    if citizen_location:
        citizen_location["phone"] = citizen_user.phone if citizen_user else None
    else:
        citizen_location = {
            "user_id": citizen_user.id if citizen_user else None,
            "name": citizen_user.name if citizen_user else "Citizen",
            "role": "citizen",
            "phone": citizen_user.phone if citizen_user else None,
            "latitude": None,
            "longitude": None,
            "accuracy": None,
            "updated_at": None
        }

    if worker_location:
        worker_location["phone"] = worker_user.phone if worker_user else None
    elif worker_user:
        worker_location = {
            "user_id": worker_user.id,
            "name": worker_user.name,
            "role": "worker",
            "phone": worker_user.phone,
            "latitude": None,
            "longitude": None,
            "accuracy": None,
            "updated_at": None
        }

    return jsonify({
        "success": True,
        "job_id": job.id,
        "status": job.status,
        "citizen": {
            "id": citizen_user.id if citizen_user else None,
            "name": citizen_user.name if citizen_user else "Citizen",
            "phone": citizen_user.phone if citizen_user else None
        },
        "worker": {
            "id": worker_user.id if worker_user else None,
            "name": worker_user.name if worker_user else "Worker",
            "phone": worker_user.phone if worker_user else None
        },
        "citizen_location": citizen_location,
        "worker_location": worker_location,
        "locations": locations
    }), 200
