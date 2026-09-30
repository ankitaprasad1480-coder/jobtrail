from datetime import datetime
from extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, index=True, nullable=False)
    hashed_password = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    profile = db.relationship("Profile", backref="user", uselist=False)
    applications = db.relationship("Application", backref="user")
    saved_jobs = db.relationship("SavedJob", backref="user")

    def to_dict(self):
        return {"id": self.id, "email": self.email}


class Profile(db.Model):
    __tablename__ = "profiles"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True)

    full_name = db.Column(db.String)
    age = db.Column(db.Integer)
    address = db.Column(db.String)
    preferred_location = db.Column(db.String)
    remote_ok = db.Column(db.Boolean, default=False)
    job_domain = db.Column(db.String)
    experience_years = db.Column(db.Float)
    skills = db.Column(db.String)
    salary_min = db.Column(db.Integer)
    salary_max = db.Column(db.Integer)
    currency = db.Column(db.String, default="USD")
    phone = db.Column(db.String, nullable=True)
    resume_url = db.Column(db.String, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "age": self.age,
            "address": self.address,
            "preferred_location": self.preferred_location,
            "remote_ok": self.remote_ok,
            "job_domain": self.job_domain,
            "experience_years": self.experience_years,
            "skills": self.skills,
            "salary_min": self.salary_min,
            "salary_max": self.salary_max,
            "currency": self.currency,
            "phone": self.phone,
            "resume_url": self.resume_url,
        }


class Job(db.Model):
    __tablename__ = "jobs"

    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String, index=True)
    source = db.Column(db.String)
    title = db.Column(db.String, index=True)
    company = db.Column(db.String, index=True)
    location = db.Column(db.String)
    country = db.Column(db.String)
    remote = db.Column(db.Boolean, default=False)
    domain = db.Column(db.String, index=True)
    description = db.Column(db.Text)
    salary_min = db.Column(db.Integer, nullable=True)
    salary_max = db.Column(db.Integer, nullable=True)
    currency = db.Column(db.String, nullable=True)
    apply_url = db.Column(db.String, nullable=False)
    posted_at = db.Column(db.DateTime, default=datetime.utcnow)
    fetched_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, match_score=None):
        d = {
            "id": self.id,
            "title": self.title,
            "company": self.company,
            "location": self.location,
            "country": self.country,
            "remote": self.remote,
            "domain": self.domain,
            "description": self.description,
            "salary_min": self.salary_min,
            "salary_max": self.salary_max,
            "currency": self.currency,
            "apply_url": self.apply_url,
            "posted_at": self.posted_at.isoformat() if self.posted_at else None,
        }
        if match_score is not None:
            d["match_score"] = match_score
        return d


class Application(db.Model):
    __tablename__ = "applications"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"))
    status = db.Column(db.String, default="clicked")
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)
    notes = db.Column(db.Text, nullable=True)

    job = db.relationship("Job")

    def to_dict(self):
        return {
            "id": self.id,
            "job": self.job.to_dict() if self.job else None,
            "status": self.status,
            "applied_at": self.applied_at.isoformat() if self.applied_at else None,
            "notes": self.notes,
        }


class SavedJob(db.Model):
    __tablename__ = "saved_jobs"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"))
    saved_at = db.Column(db.DateTime, default=datetime.utcnow)

    job = db.relationship("Job")