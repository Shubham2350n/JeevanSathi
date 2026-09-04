from models import Worker, User


def normalize_text(text):
    if not text:
        return ""

    return text.strip().lower()


def calculate_match_score(worker, required_skill, location):
    score = 0

    worker_skill = normalize_text(worker.skill)
    required_skill = normalize_text(required_skill)
    worker_location = normalize_text(worker.location)
    citizen_location = normalize_text(location)

    # =====================================================
    # SKILL MATCH
    # =====================================================

    if required_skill in worker_skill:
        score += 50

    elif worker_skill in required_skill:
        score += 40


    # =====================================================
    # LOCATION MATCH
    # =====================================================

    if citizen_location and worker_location:

        if citizen_location == worker_location:
            score += 25

        elif (
            citizen_location in worker_location
            or worker_location in citizen_location
        ):
            score += 15


    # =====================================================
    # RATING
    # =====================================================

    rating = worker.rating or 0

    score += min(rating * 5, 25)


    return score


def find_matching_workers(
    required_skill,
    location
):

    workers = Worker.query.filter_by(
        verified=True,
        available=True
    ).all()


    matched_workers = []


    for worker in workers:

        user = User.query.get(
            worker.user_id
        )

        if not user:
            continue


        score = calculate_match_score(
            worker,
            required_skill,
            location
        )


        matched_workers.append({

            "worker_id": worker.id,

            "name": user.name,

            "email": user.email,

            "skill": worker.skill,

            "experience": worker.experience,

            "rating": worker.rating,

            "location": worker.location,

            "verified": worker.verified,

            "available": worker.available,

            "certifications":
                worker.certifications,

            "match_score": round(
                score,
                2
            )

        })


    # =====================================================
    # SORT BY BEST MATCH
    # =====================================================

    matched_workers.sort(
        key=lambda worker:
            worker["match_score"],
        reverse=True
    )


    return matched_workers