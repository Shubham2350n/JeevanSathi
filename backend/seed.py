from app import app
from database import db
from models import User, Worker


workers = [
    {
        "name": "Rajesh Kumar",
        "email": "rajesh@jeevansetu.com",
        "skill": "AC Technician",
        "experience": 7,
        "rating": 4.8,
        "location": "Mohali",
        "certifications": "ITI Refrigeration & AC",
        "verified": True,
        "available": True
    },
    {
        "name": "Amit Sharma",
        "email": "amit@jeevansetu.com",
        "skill": "Electrician",
        "experience": 5,
        "rating": 4.6,
        "location": "Chandigarh",
        "certifications": "ITI Electrical",
        "verified": True,
        "available": True
    },
    {
        "name": "Suresh Kumar",
        "email": "suresh@jeevansetu.com",
        "skill": "Plumber",
        "experience": 8,
        "rating": 4.7,
        "location": "Mohali",
        "certifications": "Plumbing Certification",
        "verified": True,
        "available": True
    },
    {
        "name": "Vikram Singh",
        "email": "vikram@jeevansetu.com",
        "skill": "AC Technician",
        "experience": 3,
        "rating": 4.3,
        "location": "Chandigarh",
        "certifications": "AC Repair Certification",
        "verified": False,
        "available": True
    },
    {
        "name": "Rohit Verma",
        "email": "rohit@jeevansetu.com",
        "skill": "Carpenter",
        "experience": 6,
        "rating": 4.5,
        "location": "Mohali",
        "certifications": "Carpentry Certification",
        "verified": True,
        "available": False
    }
]


with app.app_context():

    for worker_data in workers:

        existing_user = User.query.filter_by(
            email=worker_data["email"]
        ).first()

        if existing_user:
            continue

        user = User(
            name=worker_data["name"],
            email=worker_data["email"],
            password="demo123",
            role="worker"
        )

        db.session.add(user)
        db.session.flush()

        worker = Worker(
            user_id=user.id,
            skill=worker_data["skill"],
            experience=worker_data["experience"],
            rating=worker_data["rating"],
            location=worker_data["location"],
            certifications=worker_data["certifications"],
            verified=worker_data["verified"],
            available=worker_data["available"]
        )

        db.session.add(worker)

    db.session.commit()

    print("Sample workers added successfully!")