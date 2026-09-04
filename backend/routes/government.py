from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func

from database import db

from models import (
    User,
    Worker,
    Job,
    Review,
    Complaint
)


government_bp = Blueprint(
    "government",
    __name__
)


# =========================================================
# GET GOVERNMENT USER
# =========================================================

def get_government_user():

    try:

        user_id = int(
            get_jwt_identity()
        )

    except (TypeError, ValueError):

        return None

    user = User.query.get(
        user_id
    )

    if not user:
        return None

    if user.role != "government":
        return None

    return user


# =========================================================
# DASHBOARD
# =========================================================

@government_bp.route(
    "/dashboard",
    methods=["GET"]
)
@jwt_required()
def dashboard():

    if not get_government_user():

        return jsonify({
            "message":
                "Government access required"
        }), 403

    total_users = User.query.count()

    total_citizens = User.query.filter_by(
        role="citizen"
    ).count()

    total_workers = Worker.query.count()

    verified_workers = Worker.query.filter_by(
        verified=True
    ).count()

    pending_workers = Worker.query.filter_by(
        verified=False
    ).count()

    total_jobs = Job.query.count()

    active_jobs = Job.query.filter(
        Job.status.in_([
            "requested",
            "accepted",
            "in_progress"
        ])
    ).count()

    completed_jobs = Job.query.filter_by(
        status="completed"
    ).count()

    rejected_jobs = Job.query.filter_by(
        status="rejected"
    ).count()

    total_reviews = Review.query.count()

    average_rating = db.session.query(
        func.avg(
            Review.rating
        )
    ).scalar() or 0

    return jsonify({

        "total_users":
            total_users,

        "total_citizens":
            total_citizens,

        "total_workers":
            total_workers,

        "verified_workers":
            verified_workers,

        "pending_workers":
            pending_workers,

        "total_jobs":
            total_jobs,

        "active_jobs":
            active_jobs,

        "completed_jobs":
            completed_jobs,

        "rejected_jobs":
            rejected_jobs,

        "total_reviews":
            total_reviews,

        "average_rating":
            round(
                float(
                    average_rating
                ),
                2
            )

    })


# =========================================================
# WORKERS
# =========================================================

@government_bp.route(
    "/workers",
    methods=["GET"]
)
@jwt_required()
def workers():

    if not get_government_user():

        return jsonify({
            "message":
                "Government access required"
        }), 403

    search = request.args.get(
        "search",
        ""
    ).strip().lower()

    skill = request.args.get(
        "skill",
        ""
    ).strip().lower()

    location = request.args.get(
        "location",
        ""
    ).strip().lower()

    verification = request.args.get(
        "verification",
        ""
    ).strip().lower()

    workers = Worker.query.all()

    result = []

    for worker in workers:

        user = User.query.get(
            worker.user_id
        )

        name = (
            user.name
            if user
            else "Unknown"
        )

        email = (
            user.email
            if user
            else ""
        )

        reviews = Review.query.filter_by(
            worker_id=worker.id
        ).all()

        if reviews:

            rating = (
                sum(
                    r.rating
                    for r in reviews
                )
                / len(reviews)
            )

        else:

            rating = (
                worker.rating
                or 0
            )

        if search:

            searchable = (
                f"{name} "
                f"{email} "
                f"{worker.skill} "
                f"{worker.location}"
            ).lower()

            if search not in searchable:
                continue

        if skill and skill != "all":

            if skill not in worker.skill.lower():
                continue

        if location and location != "all":

            if location not in worker.location.lower():
                continue

        if (
            verification == "verified"
            and not worker.verified
        ):

            continue

        if (
            verification == "pending"
            and worker.verified
        ):

            continue

        result.append({

            "id":
                worker.id,

            "user_id":
                worker.user_id,

            "name":
                name,

            "email":
                email,

            "skill":
                worker.skill,

            "experience":
                worker.experience,

            "rating":
                round(
                    float(rating),
                    2
                ),

            "location":
                worker.location,

            "verified":
                worker.verified,

            "available":
                worker.available,

            "certifications":
                worker.certifications or "",

            "review_count":
                len(reviews)
        })

    result.sort(
        key=lambda x: x["rating"],
        reverse=True
    )

    return jsonify(
        result
    )


# =========================================================
# SINGLE WORKER DETAILS
# =========================================================

@government_bp.route(
    "/workers/<int:worker_id>",
    methods=["GET"]
)
@jwt_required()
def worker_details(worker_id):

    if not get_government_user():

        return jsonify({
            "message":
                "Government access required"
        }), 403

    worker = Worker.query.get(
        worker_id
    )

    if not worker:

        return jsonify({
            "message":
                "Worker not found"
        }), 404

    user = User.query.get(
        worker.user_id
    )

    reviews = Review.query.filter_by(
        worker_id=worker.id
    ).order_by(
        Review.created_at.desc()
    ).all()

    if reviews:

        rating = (
            sum(
                r.rating
                for r in reviews
            )
            / len(reviews)
        )

    else:

        rating = (
            worker.rating
            or 0
        )

    completed_jobs = Job.query.filter_by(
        worker_id=worker.id,
        status="completed"
    ).count()

    active_jobs = Job.query.filter(
        Job.worker_id == worker.id,
        Job.status.in_([
            "accepted",
            "in_progress"
        ])
    ).count()

    review_list = []

    for review in reviews:

        citizen = User.query.get(
            review.citizen_id
        )

        review_list.append({

            "id":
                review.id,

            "citizen": (
                citizen.name
                if citizen
                else "Unknown"
            ),

            "rating":
                review.rating,

            "feedback":
                review.feedback or "",

            "created_at": (
                review.created_at.isoformat()
                if review.created_at
                else None
            )
        })

    return jsonify({

        "id":
            worker.id,

        "name": (
            user.name
            if user
            else "Unknown"
        ),

        "email": (
            user.email
            if user
            else ""
        ),

        "skill":
            worker.skill,

        "experience":
            worker.experience,

        "rating":
            round(
                float(rating),
                2
            ),

        "location":
            worker.location,

        "verified":
            worker.verified,

        "available":
            worker.available,

        "certifications":
            worker.certifications or "",

        "review_count":
            len(reviews),

        "completed_jobs":
            completed_jobs,

        "active_jobs":
            active_jobs,

        "reviews":
            review_list

    })


# =========================================================
# VERIFY WORKER
# =========================================================

@government_bp.route(
    "/workers/<int:worker_id>/verify",
    methods=["PUT"]
)
@jwt_required()
def verify_worker(worker_id):

    if not get_government_user():

        return jsonify({
            "message":
                "Government access required"
        }), 403

    worker = Worker.query.get(
        worker_id
    )

    if not worker:

        return jsonify({
            "message":
                "Worker not found"
        }), 404

    worker.verified = True

    db.session.commit()

    return jsonify({

        "message":
            "Worker verified successfully",

        "verified":
            True
    })


# =========================================================
# UNVERIFY WORKER
# =========================================================

@government_bp.route(
    "/workers/<int:worker_id>/unverify",
    methods=["PUT"]
)
@jwt_required()
def unverify_worker(worker_id):

    if not get_government_user():

        return jsonify({
            "message":
                "Government access required"
        }), 403

    worker = Worker.query.get(
        worker_id
    )

    if not worker:

        return jsonify({
            "message":
                "Worker not found"
        }), 404

    worker.verified = False

    db.session.commit()

    return jsonify({

        "message":
            "Worker verification removed",

        "verified":
            False
    })


# =========================================================
# JOBS
# =========================================================

@government_bp.route(
    "/jobs",
    methods=["GET"]
)
@jwt_required()
def jobs():

    if not get_government_user():

        return jsonify({
            "message":
                "Government access required"
        }), 403

    status = request.args.get(
        "status",
        ""
    ).strip().lower()

    search = request.args.get(
        "search",
        ""
    ).strip().lower()

    jobs = Job.query.order_by(
        Job.created_at.desc()
    ).all()

    result = []

    for job in jobs:

        citizen = User.query.get(
            job.citizen_id
        )

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

        citizen_name = (
            citizen.name
            if citizen
            else "Unknown"
        )

        worker_name = (
            worker_user.name
            if worker_user
            else "Not Assigned"
        )

        if status and status != "all":

            if job.status.lower() != status:
                continue

        if search:

            searchable = (
                f"{job.service} "
                f"{job.description} "
                f"{job.location} "
                f"{citizen_name} "
                f"{worker_name}"
            ).lower()

            if search not in searchable:
                continue

        result.append({

            "id":
                job.id,

            "service":
                job.service,

            "description":
                job.description,

            "location":
                job.location,

            "status":
                job.status,

            "citizen":
                citizen_name,

            "worker":
                worker_name,

            "created_at": (
                job.created_at.isoformat()
                if job.created_at
                else None
            )
        })

    return jsonify(
        result
    )


# =========================================================
# SERVICE ANALYTICS
# =========================================================

@government_bp.route(
    "/analytics/skills",
    methods=["GET"]
)
@jwt_required()
def skill_analytics():

    if not get_government_user():

        return jsonify({
            "message":
                "Government access required"
        }), 403

    rows = db.session.query(
        Job.service,
        func.count(Job.id)
    ).group_by(
        Job.service
    ).order_by(
        func.count(Job.id).desc()
    ).all()

    return jsonify([

        {
            "service":
                service,

            "count":
                count
        }

        for service, count in rows

    ])


# =========================================================
# LOCATION ANALYTICS
# =========================================================

@government_bp.route(
    "/analytics/locations",
    methods=["GET"]
)
@jwt_required()
def location_analytics():

    if not get_government_user():

        return jsonify({
            "message":
                "Government access required"
        }), 403

    rows = db.session.query(
        Job.location,
        func.count(Job.id)
    ).group_by(
        Job.location
    ).order_by(
        func.count(Job.id).desc()
    ).all()

    return jsonify([

        {
            "location":
                location,

            "count":
                count
        }

        for location, count in rows

    ])


# =========================================================
# REVIEW ANALYTICS
# =========================================================

@government_bp.route(
    "/analytics/reviews",
    methods=["GET"]
)
@jwt_required()
def review_analytics():

    if not get_government_user():

        return jsonify({
            "message":
                "Government access required"
        }), 403

    rows = db.session.query(
        Review.rating,
        func.count(Review.id)
    ).group_by(
        Review.rating
    ).order_by(
        Review.rating
    ).all()

    rating_distribution = [

        {
            "rating":
                f"{rating} Star",

            "count":
                count
        }

        for rating, count in rows

    ]

    reviews = Review.query.order_by(
        Review.created_at.desc()
    ).all()

    recent_reviews = []

    for review in reviews:

        citizen = User.query.get(
            review.citizen_id
        )

        worker = Worker.query.get(
            review.worker_id
        )

        worker_user = None

        if worker:

            worker_user = User.query.get(
                worker.user_id
            )

        recent_reviews.append({

            "id":
                review.id,

            "rating":
                review.rating,

            "feedback":
                review.feedback or "",

            "citizen": (
                citizen.name
                if citizen
                else "Unknown"
            ),

            "worker": (
                worker_user.name
                if worker_user
                else "Unknown"
            ),

            "created_at": (
                review.created_at.isoformat()
                if review.created_at
                else None
            )
        })

    return jsonify({

        "rating_distribution":
            rating_distribution,

        "recent_reviews":
            recent_reviews

    })


# =========================================================
# TOP WORKERS
# =========================================================

@government_bp.route(
    "/analytics/top-workers",
    methods=["GET"]
)
@jwt_required()
def top_workers():

    if not get_government_user():

        return jsonify({
            "message":
                "Government access required"
        }), 403

    workers = Worker.query.all()

    result = []

    for worker in workers:

        user = User.query.get(
            worker.user_id
        )

        reviews = Review.query.filter_by(
            worker_id=worker.id
        ).all()

        completed_jobs = Job.query.filter_by(
            worker_id=worker.id,
            status="completed"
        ).count()

        if reviews:

            rating = (
                sum(
                    r.rating
                    for r in reviews
                )
                / len(reviews)
            )

        else:

            rating = (
                worker.rating
                or 0
            )

        result.append({

            "worker_id":
                worker.id,

            "name": (
                user.name
                if user
                else "Unknown"
            ),

            "skill":
                worker.skill,

            "location":
                worker.location,

            "rating":
                round(
                    float(rating),
                    2
                ),

            "completed_jobs":
                completed_jobs,

            "verified":
                worker.verified
        })

    result.sort(
        key=lambda x: (
            x["rating"],
            x["completed_jobs"]
        ),
        reverse=True
    )

    return jsonify(
        result[:10]
    )


# =========================================================
# COMPLAINTS
# =========================================================

@government_bp.route(
    "/complaints",
    methods=["GET"]
)
@jwt_required()
def get_government_complaints():

    if not get_government_user():

        return jsonify({
            "message":
                "Government access required"
        }), 403

    status = request.args.get(
        "status",
        "all"
    ).strip().lower()

    priority = request.args.get(
        "priority",
        "all"
    ).strip().lower()

    search = request.args.get(
        "search",
        ""
    ).strip().lower()

    complaints = Complaint.query.order_by(
        Complaint.created_at.desc()
    ).all()

    result = []

    for complaint in complaints:

        citizen = User.query.get(
            complaint.citizen_id
        )

        citizen_name = (
            citizen.name
            if citizen
            else "Unknown"
        )

        if (
            status != "all"
            and complaint.status.lower() != status
        ):

            continue

        if (
            priority != "all"
            and complaint.priority.lower() != priority
        ):

            continue

        if search:

            searchable = (
                f"{complaint.id} "
                f"{complaint.subject} "
                f"{complaint.description} "
                f"{citizen_name}"
            ).lower()

            if search not in searchable:
                continue

        result.append({

            "id":
                complaint.id,

            "citizen_id":
                complaint.citizen_id,

            "citizen":
                citizen_name,

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

    return jsonify(
        result
    )


# =========================================================
# COMPLAINT ANALYTICS
# =========================================================

@government_bp.route(
    "/analytics/complaints",
    methods=["GET"]
)
@jwt_required()
def complaint_analytics():

    if not get_government_user():

        return jsonify({
            "message":
                "Government access required"
        }), 403

    total = Complaint.query.count()

    pending = Complaint.query.filter_by(
        status="pending"
    ).count()

    investigating = Complaint.query.filter_by(
        status="investigating"
    ).count()

    resolved = Complaint.query.filter_by(
        status="resolved"
    ).count()

    high_priority = Complaint.query.filter_by(
        priority="high"
    ).count()

    return jsonify({

        "total":
            total,

        "pending":
            pending,

        "investigating":
            investigating,

        "resolved":
            resolved,

        "high_priority":
            high_priority

    })


# =========================================================
# UPDATE COMPLAINT STATUS
# =========================================================

@government_bp.route(
    "/complaints/<int:complaint_id>/status",
    methods=["PUT"]
)
@jwt_required()
def update_complaint_status(
    complaint_id
):

    if not get_government_user():

        return jsonify({
            "message":
                "Government access required"
        }), 403

    complaint = Complaint.query.get(
        complaint_id
    )

    if not complaint:

        return jsonify({
            "message":
                "Complaint not found"
        }), 404

    data = request.get_json() or {}

    status = data.get(
        "status",
        ""
    ).strip().lower()

    resolution_note = data.get(
        "resolution_note",
        ""
    ).strip()

    allowed_statuses = [
        "pending",
        "investigating",
        "resolved"
    ]

    if status not in allowed_statuses:

        return jsonify({
            "message":
                "Invalid complaint status"
        }), 400

    if (
        status == "resolved"
        and not resolution_note
    ):

        return jsonify({
            "message":
                "Resolution note is required"
        }), 400

    complaint.status = status

    if resolution_note:

        complaint.resolution_note = (
            resolution_note
        )

    db.session.commit()

    return jsonify({

        "success":
            True,

        "message":
            "Complaint updated successfully",

        "complaint": {

            "id":
                complaint.id,

            "status":
                complaint.status,

            "resolution_note":
                complaint.resolution_note or ""
        }

    })