from dotenv import load_dotenv
load_dotenv()

import re
import os
from flask import Flask

from extensions import db, jwt, cors
from blueprints.auth_bp import auth_bp
from blueprints.profile_bp import profile_bp
from blueprints.jobs_bp import jobs_bp
from blueprints.dashboard_bp import dashboard_bp
from blueprints.upload_bp import upload_bp


def get_db_url():
    db_url = os.getenv("DATABASE_URL", "sqlite:///jobapp.db")
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+pg8000://", 1)
    elif db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)

    if db_url.startswith("postgresql+pg8000://"):
        db_url = re.sub(r"\?.*$", "", db_url)  # strip any existing query string
        db_url += "?ssl_context=true"
    return db_url


def create_app():
    app = Flask(__name__)

    app.config["SQLALCHEMY_DATABASE_URI"] = get_db_url()
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"pool_pre_ping": True}
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET", "change-this-in-production")
    app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "uploads", "resumes")
    app.config["MAX_CONTENT_LENGTH"] = 5 * 1024 * 1024  # 5 MB limit

    db.init_app(app)
    jwt.init_app(app)

    origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",") if o.strip()]
    cors.init_app(app, resources={r"/*": {"origins": origins}})

    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(jobs_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(upload_bp)

    with app.app_context():
        db.create_all()

    @app.get("/")
    def root():
        return {"status": "ok"}

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=8000)