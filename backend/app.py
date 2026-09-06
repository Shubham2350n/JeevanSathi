from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from database import db


# =========================================================
# FLASK APP
# =========================================================

app = Flask(__name__)


# =========================================================
# CORS
# =========================================================

CORS(app)


# =========================================================
# CONFIGURATION
# =========================================================

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "sqlite:///jeevansetu.db"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["JWT_SECRET_KEY"] = (
    "jeevansetu-super-secret-key"
)


# =========================================================
# DATABASE
# =========================================================

db.init_app(app)


# =========================================================
# JWT
# =========================================================

jwt = JWTManager(app)


# =========================================================
# MODELS
# =========================================================

from models import (
    User,
    Worker,
    Job,
    Review,
    Complaint,
    JobLocation
)


# =========================================================
# ROUTES
# =========================================================

from routes.auth import auth_bp
from routes.citizen import citizen_bp
from routes.worker import worker_bp
from routes.government import government_bp
from routes.ai import ai_bp
from routes.location import location_bp


# =========================================================
# BLUEPRINTS
# =========================================================

app.register_blueprint(
    auth_bp,
    url_prefix="/api/auth"
)

app.register_blueprint(
    citizen_bp,
    url_prefix="/api/citizen"
)

app.register_blueprint(
    worker_bp,
    url_prefix="/api/worker"
)

app.register_blueprint(
    government_bp,
    url_prefix="/api/government"
)

app.register_blueprint(
    ai_bp,
    url_prefix="/api/ai"
)

app.register_blueprint(
    location_bp,
    url_prefix="/api/location"
)


# =========================================================
# HOME
# =========================================================

@app.route("/")
def home():

    return jsonify({
        "message":
            "JeevanSetu Backend is Running!",
        "status":
            "success"
    })


# =========================================================
# HEALTH
# =========================================================

@app.route("/api/health")
def health():

    return jsonify({
        "message":
            "JeevanSetu API is healthy",
        "status":
            "success"
    })


# =========================================================
# DATABASE TEST
# =========================================================

@app.route("/api/database")
def database_test():

    users = User.query.count()
    workers = Worker.query.count()
    jobs = Job.query.count()
    reviews = Review.query.count()
    complaints = Complaint.query.count()
    locations = JobLocation.query.count()

    return jsonify({

        "users":
            users,

        "workers":
            workers,

        "jobs":
            jobs,

        "reviews":
            reviews,

        "complaints":
            complaints,

        "locations":
            locations

    })


# =========================================================
# CREATE TABLES
# =========================================================

with app.app_context():

    db.create_all()


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )