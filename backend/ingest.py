from datetime import datetime
from app import create_app
from extensions import db
from models import Job
from job_sources import ACTIVE_SOURCES
from urllib.parse import urlparse

import html
import re


def clean_text(value):
    text = html.unescape(value or "")
    text = re.sub(r"<[^>]+>", " ", text)   # remove tags
    text = html.unescape(text)             # handle double-escaped entities
    return re.sub(r"\s+", " ", text).strip()

def has_real_apply_link(url):
    if not url:
        return False
    path = urlparse(url).path.strip("/")
    return len(path) > 3  # a bare homepage has an empty or near-empty path

def parse_date(value):
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)
        except ValueError:
            pass
    return datetime.utcnow()


def run():
    app = create_app()
    with app.app_context():
        for source in ACTIVE_SOURCES:
            count = 0
            for item in source.fetch():
                if not has_real_apply_link(item.get("apply_url")):
                    continue
                item["posted_at"] = parse_date(item.get("posted_at"))
                item["description"] = clean_text(item.get("description"))
                existing = Job.query.filter_by(
                    source=item["source"], external_id=item["external_id"]
                ).first()
                if existing:
                    for k, v in item.items():
                        setattr(existing, k, v)
                    existing.fetched_at = datetime.utcnow()
                else:
                    db.session.add(Job(**item, fetched_at=datetime.utcnow()))
                count += 1
            db.session.commit()
            print(f"[{source.name}] upserted {count} jobs")


if __name__ == "__main__":
    run()