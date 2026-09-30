import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { JobSkeleton } from "../components/Skeleton";
import { useToast } from "../components/Toast";

function ScoreCard({ job }) {
  const [applying, setApplying] = useState(false);
  const toast = useToast();

  async function apply() {
    setApplying(true);
    try {
      const { apply_url } = await api(`/jobs/${job.id}/apply`, { method: "POST" });
      window.open(apply_url, "_blank", "noopener");
      toast("Application tracked");
    } catch (err) {
      toast(err.message, "err");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="job">
      <div className="jlogo">{job.company?.[0]?.toUpperCase() || "?"}</div>
      <div className="jmain">
        <h3>{job.title}</h3>
        <div className="co">{job.company} · {job.location}</div>
        <div className="tags"><span>{job.remote ? "Remote OK" : "On-site"}</span><span>{job.domain}</span></div>
        <div className="desc">{(job.description || "").slice(0, 160)}...</div>
      </div>
      <div className="jright">
        <span className="score">{job.match_score}% match</span>
        <div className="job-actions">
          <button onClick={apply} disabled={applying}>
            {applying && <span className="spinner" />}
            {applying ? "Opening..." : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Recommended() {
  const [jobs, setJobs] = useState(null);
  const [needsProfile, setNeedsProfile] = useState(false);

  useEffect(() => {
    api("/jobs/recommended").then(setJobs).catch(() => setNeedsProfile(true));
  }, []);

  if (needsProfile) {
    return (
      <div className="empty card">
        <svg viewBox="0 0 150 110" aria-hidden="true">
          <circle cx="95" cy="55" r="50" fill="var(--blob)" />
          <circle cx="30" cy="85" r="22" fill="var(--blob2)" />
          <rect x="45" y="35" width="60" height="42" rx="8" fill="var(--surface)" />
        </svg>
        <h3>No profile yet</h3>
        <p>Fill in your profile so we can match jobs to your skills.</p>
        <Link to="/profile"><button>Go to profile</button></Link>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <h2>Suggested for you</h2>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>Ranked by domain fit, skills overlap, location and salary range.</p>
      </div>
      <div className="list">
        {jobs === null && <JobSkeleton count={4} />}
        {jobs?.length === 0 && (
          <div className="empty">
            <svg viewBox="0 0 150 110" aria-hidden="true">
              <circle cx="95" cy="55" r="50" fill="var(--blob)" />
              <circle cx="30" cy="85" r="22" fill="var(--blob2)" />
            </svg>
            <h3>No strong matches yet</h3>
            <p>Try widening your skills or preferred location in your profile.</p>
            <Link to="/profile"><button className="secondary">Edit profile</button></Link>
          </div>
        )}
        {jobs?.map((j) => <ScoreCard key={j.id} job={j} />)}
      </div>
    </>
  );
}