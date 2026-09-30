import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Jobs from "./pages/Jobs";
import Recommended from "./pages/Recommended";
import Dashboard from "./pages/Dashboard";
import { ToastProvider } from "./components/Toast";

function Logo() {
  return (
    <i>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="3" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      </svg>
    </i>
  );
}

function Layout({ children }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  function logout() {
    localStorage.removeItem("token");
    nav("/login");
  }
  const link = ({ isActive }) => (isActive ? "active" : "");
  return (
    <>
      <div className={`nav ${open ? "open" : ""}`}>
        <span className="lg"><Logo />JobTrail</span>
        <div className="desktop-links" onClick={() => setOpen(false)}>
          <NavLink to="/profile" className={link}>Profile</NavLink>
          <NavLink to="/jobs" className={link}>Jobs</NavLink>
          <NavLink to="/recommended" className={link}>Suggested</NavLink>
          <NavLink to="/dashboard" className={link}>Dashboard</NavLink>
          <button className="link" onClick={logout}>Log out</button>
        </div>
        <span className="spacer" />
        <button className="burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      </div>
      <div className="container">{children}</div>
    </>
  );
}

const Protected = ({ children }) =>
  localStorage.getItem("token") ? <Layout>{children}</Layout> : <Navigate to="/login" />;

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/jobs" element={<Protected><Jobs /></Protected>} />
          <Route path="/recommended" element={<Protected><Recommended /></Protected>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="*" element={<Navigate to="/jobs" />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}