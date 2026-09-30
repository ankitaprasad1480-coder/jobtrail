from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import Job, Profile, Application, SavedJob
from job_matcher import rank_jobs

jobs_bp = Blueprint("jobs", __name__, url_prefix="/jobs")


@jobs_bp.get("")
def list_jobs():
    q = request.args.get("q")
    location = request.args.get("location")
    domain = request.args.get("domain")
    remote = request.args.get("remote")
    limit = min(int(request.args.get("limit", 50)), 200)
    offset = int(request.args.get("offset", 0))

    query = Job.query
    if q:
        query = query.filter(Job.title.ilike(f"%{q}%"))
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if domain:
        query = query.filter(Job.domain.ilike(f"%{domain}%"))
    if remote is not None:
        query = query.filter(Job.remote == (remote.lower() == "true"))

    jobs = query.order_by(Job.posted_at.desc()).offset(offset).limit(limit).all()
    return jsonify([j.to_dict() for j in jobs])


@jobs_bp.get("/recommended")
@jwt_required()
def recommended_jobs():
    user_id = int(get_jwt_identity())
    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"error": "Complete your profile first"}), 400

    limit = min(int(request.args.get("limit", 20)), 100)

    candidates = Job.query.filter(Job.domain.ilike(f"%{profile.job_domain}%")).limit(500).all()
    if not candidates:
        candidates = Job.query.limit(500).all()

    ranked = rank_jobs(candidates, profile)[:limit]
    return jsonify([job.to_dict(match_score=score) for job, score in ranked])


@jobs_bp.post("/<int:job_id>/apply")
@jwt_required()
def track_application(job_id):
    user_id = int(get_jwt_identity())
    job = db.session.get(Job, job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404

    db.session.add(Application(user_id=user_id, job_id=job_id, status="clicked"))
    db.session.commit()
    return jsonify({"apply_url": job.apply_url})


@jobs_bp.post("/<int:job_id>/save")
@jwt_required()
def save_job(job_id):
    user_id = int(get_jwt_identity())
    existing = SavedJob.query.filter_by(user_id=user_id, job_id=job_id).first()
    if existing:
        return jsonify({"status": "already saved"})

    db.session.add(SavedJob(user_id=user_id, job_id=job_id))
    db.session.commit()
    return jsonify({"status": "saved"})