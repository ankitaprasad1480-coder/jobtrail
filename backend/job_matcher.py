def score_job(job, profile) -> float:
    score = 0.0

    # Domain match (40 pts)
    if profile.job_domain and job.domain:
        a, b = profile.job_domain.lower(), job.domain.lower()
        if a in b or b in a:
            score += 40

    # Skills overlap (25 pts)
    if profile.skills and job.description:
        user_skills = {s.strip().lower() for s in profile.skills.split(",") if s.strip()}
        if user_skills:
            desc = job.description.lower()
            hits = sum(1 for s in user_skills if s in desc)
            score += 25 * min(hits / len(user_skills), 1.0)

    # Location match (20 pts)
    if job.remote and profile.remote_ok:
        score += 20
    elif profile.preferred_location and job.location:
        if profile.preferred_location.lower() in job.location.lower():
            score += 20

    # Salary overlap (15 pts)
    if job.salary_min and job.salary_max and profile.salary_min and profile.salary_max:
        overlap = min(job.salary_max, profile.salary_max) - max(job.salary_min, profile.salary_min)
        if overlap > 0:
            score += 15
        elif job.salary_max >= profile.salary_min:
            score += 7

    return round(min(score, 100.0), 1)


def rank_jobs(jobs, profile, min_score=0.0):
    scored = [(job, score_job(job, profile)) for job in jobs]
    scored = [pair for pair in scored if pair[1] >= min_score]
    scored.sort(key=lambda pair: pair[1], reverse=True)
    return scored