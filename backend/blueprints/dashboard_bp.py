from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import Profile, Application, SavedJob

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")


@dashboard_bp.get("")
@jwt_required()
def get_dashboard():
    user_id = int(get_jwt_identity())

    profile = Profile.query.filter_by(user_id=user_id).first()
    applications = (
        Application.query.filter_by(user_id=user_id)
        .order_by(Application.applied_at.desc())
        .all()
    )
    saved = (
        SavedJob.query.filter_by(user_id=user_id)
        .order_by(SavedJob.saved_at.desc())
        .all()
    )

    status_counts = {}
    for app in applications:
        status_counts[app.status] = status_counts.get(app.status, 0) + 1

    return jsonify({
        "profile": profile.to_dict() if profile else None,
        "stats": {
            "total_applications": len(applications),
            "by_status": status_counts,
            "saved_jobs": len(saved),
        },
        "recent_applications": [a.to_dict() for a in applications[:10]],
        "saved_jobs": [s.job.to_dict() for s in saved[:10] if s.job],
    })


@dashboard_bp.patch("/applications/<int:application_id>/status")
@jwt_required()
def update_application_status(application_id):
    user_id = int(get_jwt_identity())
    data = request.get_json(force=True)
    new_status = data.get("status")

    app = Application.query.filter_by(id=application_id, user_id=user_id).first()
    if app and new_status:
        app.status = new_status
        db.session.commit()

    return jsonify({"status": "updated"})