from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import Profile

profile_bp = Blueprint("profile", __name__, url_prefix="/profile")

REQUIRED_FIELDS = [
    "full_name", "age", "address", "preferred_location",
    "job_domain", "experience_years", "skills", "salary_min", "salary_max",
]


@profile_bp.route("", methods=["POST", "PUT"])
@jwt_required()
def upsert_profile():
    data = request.get_json(force=True)
    missing = [f for f in REQUIRED_FIELDS if f not in data]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    user_id = int(get_jwt_identity())
    profile = Profile.query.filter_by(user_id=user_id).first()

    fields = {
        "full_name": data.get("full_name"),
        "age": data.get("age"),
        "address": data.get("address"),
        "preferred_location": data.get("preferred_location"),
        "remote_ok": data.get("remote_ok", False),
        "job_domain": data.get("job_domain"),
        "experience_years": data.get("experience_years"),
        "skills": data.get("skills"),
        "salary_min": data.get("salary_min"),
        "salary_max": data.get("salary_max"),
        "currency": data.get("currency", "USD"),
        "phone": data.get("phone"),
        "resume_url": data.get("resume_url"),
    }

    if profile:
        for k, v in fields.items():
            setattr(profile, k, v)
    else:
        profile = Profile(user_id=user_id, **fields)
        db.session.add(profile)

    db.session.commit()
    return jsonify(profile.to_dict())


@profile_bp.get("")
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"error": "No profile yet"}), 404
    return jsonify(profile.to_dict())