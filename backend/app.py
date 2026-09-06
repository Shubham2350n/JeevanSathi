from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import inspect, text

from database import db

app = Flask(__name__)

CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "sqlite:///jeevansetu.db"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["JWT_SECRET_KEY"] = (
    "jeevansetu-super-secret-key"
)

db.init_app(app)

jwt = JWTManager(app)

from models import (
    User,
    Worker,
    Job,
    Review,
    Complaint,
    JobLocation
)

from routes.auth import auth_bp
from routes.citizen import citizen_bp
from routes.worker import worker_bp
from routes.government import government_bp
from routes.ai import ai_bp
from routes.location import location_bp

app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(citizen_bp, url_prefix="/api/citizen")
app.register_blueprint(worker_bp, url_prefix="/api/worker")
app.register_blueprint(government_bp, url_prefix="/api/government")
app.register_blueprint(ai_bp, url_prefix="/api/ai")
app.register_blueprint(location_bp, url_prefix="/api/location")


# ==========================================================
# SAFE DATABASE SCHEMA REPAIR
# ==========================================================

def add_column_if_missing(table_name, column_name, column_type):
    """
    Only adds a missing column.
    Existing tables and existing data are NOT deleted.
    """

    inspector = inspect(db.engine)

    tables = inspector.get_table_names()

    if table_name not in tables:
        return

    existing_columns = {
        column["name"]
        for column in inspector.get_columns(table_name)
    }

    if column_name not in existing_columns:

        print(
            f"[DATABASE] Adding missing column: "
            f"{table_name}.{column_name}"
        )

        db.session.execute(
            text(
                f"ALTER TABLE {table_name} "
                f"ADD COLUMN {column_name} {column_type}"
            )
        )

        db.session.commit()

        print(
            f"[DATABASE] Successfully added: "
            f"{table_name}.{column_name}"
        )


def repair_database_schema():
    """
    Repairs only missing columns.

    IMPORTANT:
    Nothing is deleted.
    """

    print("[DATABASE] Checking existing schema...")

    # Create only tables that do not exist.
    db.create_all()

    # ------------------------------------------------------
    # JOBS
    # ------------------------------------------------------

    add_column_if_missing(
        "jobs",
        "location",
        "VARCHAR(200)"
    )

    add_column_if_missing(
        "jobs",
        "latitude",
        "FLOAT"
    )

    add_column_if_missing(
        "jobs",
        "longitude",
        "FLOAT"
    )

    add_column_if_missing(
        "jobs",
        "location_accuracy",
        "FLOAT"
    )

    # ------------------------------------------------------
    # WORKERS
    # ------------------------------------------------------

    add_column_if_missing(
        "workers",
        "certifications",
        "VARCHAR(500)"
    )

    # ------------------------------------------------------
    # COMPLAINTS
    # ------------------------------------------------------

    add_column_if_missing(
        "complaints",
        "job_id",
        "INTEGER"
    )

    add_column_if_missing(
        "complaints",
        "priority",
        "VARCHAR(20)"
    )

    add_column_if_missing(
        "complaints",
        "resolution_note",
        "TEXT"
    )

    add_column_if_missing(
        "complaints",
        "updated_at",
        "DATETIME"
    )

    print("[DATABASE] Schema check completed.")


# ==========================================================
# RUN DATABASE REPAIR ON STARTUP
# ==========================================================

with app.app_context():

    try:
        repair_database_schema()

    except Exception as e:

        db.session.rollback()

        print(
            "[DATABASE] Schema repair failed:"
        )

        print(str(e))


# ==========================================================
# EXISTING ROUTES
# ==========================================================

@app.route("/")
def home():

    return jsonify({
        "message": "JeevanSetu Backend is Running!",
        "status": "success"
    })


@app.route("/api/health")
def health():

    return jsonify({
        "message": "JeevanSetu API is healthy",
        "status": "success"
    })


@app.route("/api/database")
def database_test():

    users = User.query.count()
    workers = Worker.query.count()
    jobs = Job.query.count()
    reviews = Review.query.count()
    complaints = Complaint.query.count()
    locations = JobLocation.query.count()

    return jsonify({

        "users": users,
        "workers": workers,
        "jobs": jobs,
        "reviews": reviews,
        "complaints": complaints,
        "locations": locations

    })


# ==========================================================
# LOCAL RUN
# ==========================================================

if __name__ == "__main__":

    app.run(
        debug=True,
        port=5000
    )