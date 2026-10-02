from dotenv import load_dotenv
load_dotenv()

import os


import httpx
from datetime import datetime
from typing import Iterable


class JobSource:
    name: str

    def fetch(self, **kwargs) -> Iterable[dict]:
        raise NotImplementedError


class ArbeitnowSource(JobSource):
    """No API key required."""
    name = "arbeitnow"
    URL = "https://www.arbeitnow.com/api/job-board-api"

    def fetch(self, **kwargs) -> Iterable[dict]:
        resp = httpx.get(self.URL, timeout=20, follow_redirects=True)
        resp.raise_for_status()
        for item in resp.json().get("data", []):
            tags = item.get("tags", [])
            yield {
                "external_id": item.get("slug"),
                "source": self.name,
                "title": item.get("title"),
                "company": item.get("company_name"),
                "location": item.get("location") or "Remote",
                "country": None,
                "remote": item.get("remote", False),
                "domain": tags[0] if tags else "General",
                "description": (item.get("description") or "")[:5000],
                "salary_min": None,
                "salary_max": None,
                "currency": None,
                "apply_url": item.get("url"),
                "posted_at": datetime.utcfromtimestamp(item.get("created_at", 0)),
            }


class AdzunaSource(JobSource):
    """Needs a free key from https://developer.adzuna.com/"""
    name = "adzuna"

    def __init__(self, app_id, app_key, country="us"):
        self.app_id = app_id
        self.app_key = app_key
        self.country = country

    def fetch(self, what="", where="", page=1, **kwargs) -> Iterable[dict]:
        url = f"https://api.adzuna.com/v1/api/jobs/{self.country}/search/{page}"
        params = {
            "app_id": self.app_id,
            "app_key": self.app_key,
            "what": what,
            "where": where,
            "results_per_page": 50,
            "content-type": "application/json",
        }
        resp = httpx.get(url, params=params, timeout=20)
        resp.raise_for_status()
        for item in resp.json().get("results", []):
            yield {
                "external_id": str(item.get("id")),
                "source": self.name,
                "title": item.get("title"),
                "company": (item.get("company") or {}).get("display_name", "Unknown"),
                "location": (item.get("location") or {}).get("display_name", ""),
                "country": self.country.upper(),
                "remote": "remote" in ((item.get("title") or "") + (item.get("description") or "")).lower(),
                "domain": (item.get("category") or {}).get("label", "General"),
                "description": (item.get("description") or "")[:5000],
                "salary_min": item.get("salary_min"),
                "salary_max": item.get("salary_max"),
                "currency": "USD" if self.country == "us" else None,
                "apply_url": item.get("redirect_url"),
                "posted_at": item.get("created"),
            }


class GreenhouseCompanySource(JobSource):
    """Public job board of one company: boards-api.greenhouse.io/v1/boards/<token>/jobs"""

    def __init__(self, company_token):
        self.company_token = company_token
        self.name = f"greenhouse:{company_token}"

    def fetch(self, **kwargs) -> Iterable[dict]:
        url = f"https://boards-api.greenhouse.io/v1/boards/{self.company_token}/jobs"
        resp = httpx.get(url, timeout=20, follow_redirects=True)
        if resp.status_code != 200:
            return
        for item in resp.json().get("jobs", []):
            loc = (item.get("location") or {}).get("name", "")
            yield {
                "external_id": str(item.get("id")),
                "source": self.name,
                "title": item.get("title"),
                "company": self.company_token,
                "location": loc,
                "country": None,
                "remote": "remote" in loc.lower(),
                "domain": "General",
                "description": (item.get("content") or "")[:5000],
                "salary_min": None,
                "salary_max": None,
                "currency": None,
                "apply_url": item.get("absolute_url"),
                "posted_at": item.get("updated_at"),
            }


ACTIVE_SOURCES = [ArbeitnowSource()]

_adzuna_id = os.getenv("ADZUNA_APP_ID")
_adzuna_key = os.getenv("ADZUNA_APP_KEY")
if _adzuna_id and _adzuna_key:
    ACTIVE_SOURCES += [
        AdzunaSource(app_id=_adzuna_id, app_key=_adzuna_key, country="us"),
        AdzunaSource(app_id=_adzuna_id, app_key=_adzuna_key, country="in"),
    ]