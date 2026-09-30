import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, uploadFile } from "../api";

const DOMAINS = ["Software Engineering", "Data & Analytics", "Design", "Marketing", "Customer Success", "Human Resources"];

export default function Profile() {
  const nav = useNavigate();
  const [f, setF] = useState({
    full_name: "", age: "", address: "", preferred_location: "", remote_ok: false,
    job_domain: DOMAINS[0], experience_years: "", skills: "", salary_min: "", salary_max: "", currency: "USD",
    resume_url: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeStatus, setResumeStatus] = useState("");

  useEffect(() => {
    api("/profile").then((p) => setF((prev) => ({ ...prev, ...p }))).catch(() => {});
  }, []);

  function set(k, v) { setF((prev) => ({ ...prev, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/profile", {
        method: "POST",
        body: { ...f, age: +f.age, experience_years: +f.experience_years, salary_min: +f.salary_min, salary_max: +f.salary_max },
      });
      nav("/recommended");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResumeUpload() {
    if (!resumeFile) return;
    setResumeStatus("Uploading...");
    try {
      const res = await uploadFile("/upload/resume", resumeFile);
      setF((prev) => ({ ...prev, resume_url: res.resume_url }));
      setResumeStatus("Resume uploaded ✓");
    } catch (err) {
      setResumeStatus(err.message);
    }
  }

  return (
    <div className="card">
      <h2>Your profile</h2>
      <p style={{ color: "var(--muted)", fontSize: 13 }}>Used to curate job suggestions.</p>
      <form onSubmit={submit}>
        <label>Full name</label>
        <input value={f.full_name} onChange={(e) => set("full_name", e.target.value)} required />

        <div className="row">
          <div>
            <label>Age</label>
            <input type="number" value={f.age} onChange={(e) => set("age", e.target.value)} required />
          </div>
          <div>
            <label>Experience (years)</label>
            <input type="number" value={f.experience_years} onChange={(e) => set("experience_years", e.target.value)} required />
          </div>
        </div>

        <label>Address</label>
        <input value={f.address} onChange={(e) => set("address", e.target.value)} required />

        <div className="row">
          <div>
            <label>Preferred location</label>
            <input value={f.preferred_location} onChange={(e) => set("preferred_location", e.target.value)} placeholder="e.g. Remote, Berlin" required />
          </div>
          <div>
            <label>Open to remote?</label>
            <select value={f.remote_ok ? "true" : "false"} onChange={(e) => set("remote_ok", e.target.value === "true")}>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <label>Job domain</label>
        <select value={f.job_domain} onChange={(e) => set("job_domain", e.target.value)}>
          {DOMAINS.map((d) => <option key={d}>{d}</option>)}
        </select>

        <label>Skills (comma-separated)</label>
        <textarea value={f.skills} onChange={(e) => set("skills", e.target.value)} placeholder="python, sql, react" required />

        <div className="row">
          <div>
            <label>Salary min</label>
            <input type="number" value={f.salary_min} onChange={(e) => set("salary_min", e.target.value)} required />
          </div>
          <div>
            <label>Salary max</label>
            <input type="number" value={f.salary_max} onChange={(e) => set("salary_max", e.target.value)} required />
          </div>
          <div>
            <label>Currency</label>
            <input value={f.currency} onChange={(e) => set("currency", e.target.value)} />
          </div>
        </div>

        <label>Resume (PDF, DOC, or DOCX)</label>
        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} />
        {f.resume_url && !resumeFile && (
          <p style={{ fontSize: 12.5, color: "var(--muted)" }}>Resume already on file.</p>
        )}
        {resumeFile && (
          <button type="button" className="secondary" onClick={handleResumeUpload} style={{ marginTop: 10 }}>
            Upload resume
          </button>
        )}
        {resumeStatus && <p style={{ fontSize: 12.5, color: "var(--muted)" }}>{resumeStatus}</p>}

        {error && <div className="error">{error}</div>}
        <button type="submit" disabled={loading}>{loading ? "Saving..." : "Save & see suggestions"}</button>
      </form>
    </div>
  );
}