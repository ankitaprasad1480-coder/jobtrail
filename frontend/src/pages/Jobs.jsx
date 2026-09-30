import { useEffect, useState } from "react";
import { api } from "../api";
import Blobs from "../components/Blobs";
import { JobSkeleton } from "../components/Skeleton";
import { useToast } from "../components/Toast";

function EmptyState({ onClear }) {
  return (
    <div className="empty">
      <svg viewBox="0 0 150 110" aria-hidden="true">
        <circle cx="95" cy="55" r="50" fill="var(--blob)" />
        <circle cx="30" cy="85" r="22" fill="var(--blob2)" />
        <path d="M40 60l70-30-24 60-16-22z" fill="var(--surface)" />
      </svg>
      <h3>No jobs match that search</h3>
      <p>Try a broader title or clear your filters.</p>
      <button className="secondary" onClick={onClear}>Clear filters</button>
    </div>
  );
}

function JobCard({ job }) {
  const [saved, setSaved] = useState(false);
  const [applying, setApplying] = useState(false);
  const [saving, setSaving] = useState(false);
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
  async function save() {
    setSaving(true);
    try {
      await api(`/jobs/${job.id}/save`, { method: "POST" });
      setSaved(true);
      toast("Saved to your dashboard");
    } catch (err) {
      toast(err.message, "err");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="job">
      <div className="jlogo">{job.company?.[0]?.toUpperCase() || "?"}</div>
      <div className="jmain">
        <h3>{job.title}</h3>
        <div className="co">{job.company} · {job.location}</div>
        <div className="tags">
          <span>{job.remote ? "Remote OK" : "On-site"}</span>
          <span>{job.domain}</span>
        </div>
        <div className="desc">{(job.description || "").slice(0, 160)}...</div>
      </div>
      <div className="jright">
        <div className="job-actions">
          <button onClick={apply} disabled={applying}>
            {applying && <span className="spinner" />}
            {applying ? "Opening..." : "Apply"}
          </button>
          <button className="secondary" onClick={save} disabled={saved || saving}>
            {saving && <span className="spinner dark" />}
            {saved ? "Saved" : saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState(null); // null = loading
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("");
  const [remote, setRemote] = useState(false);

  useEffect(() => {
    setJobs(null);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (domain) params.set("domain", domain);
    if (remote) params.set("remote", "true");
    const t = setTimeout(() => {
      api(`/jobs?${params}`).then(setJobs).catch(() => setJobs([]));
    }, 300);
    return () => clearTimeout(t);
  }, [q, domain, remote]);

  return (
    <>
      <div className="hero blobwrap">
        <div>
          <h2>Browse all jobs</h2>
          <p>Aggregated from job boards worldwide, updated regularly.</p>
        </div>
        <Blobs />
      </div>
      <div className="filters">
        <input placeholder="Search job title..." value={q} onChange={(e) => setQ(e.target.value)} />
        <span className={`chip ${remote ? "on" : ""}`} onClick={() => setRemote(!remote)}>Remote only</span>
      </div>
      <div className="list">
        {jobs === null && <JobSkeleton count={4} />}
        {jobs?.length === 0 && <EmptyState onClear={() => { setQ(""); setRemote(false); }} />}
        {jobs?.map((j) => <JobCard key={j.id} job={j} />)}
      </div>
    </>
  );
}