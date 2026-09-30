import { useEffect, useState } from "react";
import { api } from "../api";
import Blobs from "../components/Blobs";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { api("/dashboard").then(setData).catch(() => {}); }, []);

  if (!data) {
    return (
      <>
        <div className="hero blobwrap"><div className="skel" style={{ width: "60%", height: 20 }} /></div>
        <div className="card"><div className="skel" style={{ width: "100%", height: 60 }} /></div>
      </>
    );
  }

  const name = data.profile?.full_name || "there";

  return (
    <>
      <div className="hero blobwrap">
        <div>
          <h2>Good to see you, {name}</h2>
          <p>{data.profile?.job_domain || "Complete your profile to unlock matching."}</p>
          <div className="stats">
            <div className="stat"><b>{data.stats.total_applications}</b><span>Applications</span></div>
            <div className="stat"><b>{data.stats.saved_jobs}</b><span>Saved</span></div>
          </div>
        </div>
        <Blobs />
      </div>

      <div className="card">
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Recent applications</h2>
        {data.recent_applications.length === 0 ? (
          <div className="empty" style={{ padding: "20px 0" }}>
            <p>No applications yet — try applying to a job from the Jobs or Suggested tab.</p>
          </div>
        ) : (
          data.recent_applications.map((a) => (
            <div className="appitem" key={a.id}>
              <span>{a.job?.title} — {a.job?.company}</span>
              <span className="badge">{a.status}</span>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h2 style={{ fontSize: 16, marginBottom: 12 }}>Saved jobs</h2>
        {data.saved_jobs.length === 0 ? (
          <div className="empty" style={{ padding: "20px 0" }}>
            <p>Nothing saved yet.</p>
          </div>
        ) : (
          data.saved_jobs.map((j) => (
            <div className="appitem" key={j.id}>
              <span>{j.title} — {j.company}</span>
              <span className="badge">{j.location}</span>
            </div>
          ))
        )}
      </div>
    </>
  );
}