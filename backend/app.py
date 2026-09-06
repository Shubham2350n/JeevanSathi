from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from sqlalchemy import inspect, text

from database import db


# ==========================================================
# FLASK APP
# ==========================================================

app = Flask(__name__)


# ==========================================================
# CORS
# ==========================================================

CORS(app)


# ==========================================================
# DATABASE CONFIG
# ==========================================================

app.config["SQLALCHEMY_DATABASE_URI"] = (
    "sqlite:///jeevansetu.db"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


# ==========================================================
# JWT CONFIG
# ==========================================================

app.config["JWT_SECRET_KEY"] = (
    "jeevansetu-super-secret-key"
)


# ==========================================================
# INITIALIZE DATABASE
# ==========================================================

db.init_app(app)


# ==========================================================
# INITIALIZE JWT
# ==========================================================

jwt = JWTManager(app)


# ==========================================================
# IMPORT MODELS
# ==========================================================

from models import (
    User,
    Worker,
    Job,
    Review,
    Complaint,
    JobLocation
)


# ==========================================================
# IMPORT BLUEPRINTS
# ==========================================================

from routes.auth import auth_bp
from routes.citizen import citizen_bp
from routes.worker import worker_bp
from routes.government import government_bp
from routes.ai import ai_bp
from routes.location import location_bp


# ==========================================================
# REGISTER BLUEPRINTS
# ==========================================================

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


# ==========================================================
# SAFE DATABASE SCHEMA REPAIR
# ==========================================================

def add_column_if_missing(
    table_name,
    column_name,
    column_type
):
    """
    Safely adds a missing SQLite column.

    IMPORTANT:
    - Existing data is NOT deleted.
    - Existing rows are NOT deleted.
    - Existing tables are NOT deleted.
    - Existing columns are NOT modified.
    """

    inspector = inspect(db.engine)

    tables = inspector.get_table_names()

    # ------------------------------------------------------
    # Table does not exist
    # ------------------------------------------------------

    if table_name not in tables:

        print(
            f"[DATABASE] Table '{table_name}' "
            f"does not exist. Skipping column check."
        )

        return False

    # ------------------------------------------------------
    # Get existing columns
    # ------------------------------------------------------

    existing_columns = {
        column["name"]
        for column in inspector.get_columns(
            table_name
        )
    }

    # ------------------------------------------------------
    # Column already exists
    # ------------------------------------------------------

    if column_name in existing_columns:

        print(
            f"[DATABASE] Already exists: "
            f"{table_name}.{column_name}"
        )

        return False

    # ------------------------------------------------------
    # Add missing column
    # ------------------------------------------------------

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

    print(
        f"[DATABASE] Added successfully: "
        f"{table_name}.{column_name}"
    )

    return True


# ==========================================================
# DATABASE SCHEMA REPAIR
# ==========================================================

def repair_database_schema():
    """
    Repairs missing database columns without deleting data.

    This function is specifically useful when the Render
    SQLite database was created using an older version of
    models.py.
    """

    print("")
    print("=" * 60)
    print("[DATABASE] STARTING SAFE SCHEMA CHECK")
    print("=" * 60)

    # ------------------------------------------------------
    # STEP 1
    # Create tables that do not exist.
    #
    # IMPORTANT:
    # db.create_all() does NOT delete existing data.
    # ------------------------------------------------------

    print(
        "[DATABASE] Checking/creating missing tables..."
    )

    db.create_all()

    print(
        "[DATABASE] Table check completed."
    )


    # ======================================================
    # STEP 2
    # USERS TABLE
    # ======================================================

    print("")
    print("[DATABASE] Checking users table...")

    add_column_if_missing(
        "users",
        "phone",
        "VARCHAR(10)"
    )


    # ======================================================
    # STEP 3
    # JOBS TABLE
    # ======================================================

    print("")
    print("[DATABASE] Checking jobs table...")

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


    # ======================================================
    # STEP 4
    # WORKERS TABLE
    # ======================================================

    print("")
    print("[DATABASE] Checking workers table...")

    add_column_if_missing(
        "workers",
        "certifications",
        "VARCHAR(500)"
    )


    # ======================================================
    # STEP 5
    # COMPLAINTS TABLE
    # ======================================================

    print("")
    print("[DATABASE] Checking complaints table...")

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


    # ======================================================
    # STEP 6
    # COMMIT ALL CHANGES
    # ======================================================

    db.session.commit()


    # ======================================================
    # STEP 7
    # FINAL DATABASE CHECK
    # ======================================================

    inspector = inspect(db.engine)

    print("")
    print("[DATABASE] Final schema verification...")

    tables = inspector.get_table_names()

    print(
        "[DATABASE] Available tables:"
    )

    for table in tables:

        print(
            f"  - {table}"
        )


    # ------------------------------------------------------
    # Check USERS table
    # ------------------------------------------------------

    if "users" in tables:

        users_columns = {
            column["name"]
            for column in inspector.get_columns(
                "users"
            )
        }

        if "phone" in users_columns:

            print(
                "[DATABASE] VERIFIED: users.phone"
            )

        else:

            print(
                "[DATABASE] WARNING: "
                "users.phone is still missing!"
            )


    # ------------------------------------------------------
    # Check JOBS table
    # ------------------------------------------------------

    if "jobs" in tables:

        jobs_columns = {
            column["name"]
            for column in inspector.get_columns(
                "jobs"
            )
        }

        required_job_columns = [
            "latitude",
            "longitude",
            "location_accuracy"
        ]

        for column in required_job_columns:

            if column in jobs_columns:

                print(
                    f"[DATABASE] VERIFIED: "
                    f"jobs.{column}"
                )

            else:

                print(
                    f"[DATABASE] WARNING: "
                    f"jobs.{column} is still missing!"
                )


    # ------------------------------------------------------
    # Completed
    # ------------------------------------------------------

    print("")
    print("=" * 60)
    print("[DATABASE] SAFE SCHEMA CHECK COMPLETED")
    print("=" * 60)
    print("")


# ==========================================================
# RUN DATABASE REPAIR ON APPLICATION STARTUP
# ==========================================================

with app.app_context():

    try:

        repair_database_schema()

    except Exception as e:

        db.session.rollback()

        print("")
        print("=" * 60)
        print("[DATABASE] SCHEMA REPAIR FAILED")
        print("=" * 60)

        print(
            f"Error: {str(e)}"
        )

        print("=" * 60)
        print("")


# ==========================================================
# HOME ROUTE
# ==========================================================

@app.route("/")
def home():

    return jsonify({
        "message": "JeevanSetu Backend is Running!",
        "status": "success"
    })


# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.route("/api/health")
def health():

    return jsonify({
        "message": "JeevanSetu API is healthy",
        "status": "success"
    })


# ==========================================================
# DATABASE TEST
# ==========================================================

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