import os
import uuid
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import Profile

upload_bp = Blueprint("upload", __name__, url_prefix="/upload")

ALLOWED = {"pdf", "doc", "docx"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED


@upload_bp.post("/resume")
@jwt_required()
def upload_resume():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Only PDF, DOC, or DOCX files are allowed"}), 400

    user_id = int(get_jwt_identity())
    ext = file.filename.rsplit(".", 1)[1].lower()
    stored_name = f"{user_id}_{uuid.uuid4().hex}.{ext}"

    os.makedirs(current_app.config["UPLOAD_FOLDER"], exist_ok=True)
    file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], stored_name))

    profile = Profile.query.filter_by(user_id=user_id).first()
    if not profile:
        return jsonify({"error": "Complete your profile first"}), 400

    profile.resume_url = f"/upload/resume/{stored_name}"
    db.session.commit()

    return jsonify({"resume_url": profile.resume_url, "filename": file.filename})


@upload_bp.get("/resume/<path:filename>")
@jwt_required()
def get_resume(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)