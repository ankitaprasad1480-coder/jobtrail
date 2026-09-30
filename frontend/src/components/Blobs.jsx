// Reusable pastel blob background, used behind the login panel and page heroes.
export default function Blobs({ variant = "hero" }) {
  if (variant === "login") {
    return (
      <svg className="deco" viewBox="0 0 400 580" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx="330" cy="90" r="110" fill="var(--blob)" />
        <circle cx="40" cy="330" r="90" fill="var(--blob2)" opacity=".75" />
        <rect x="70" y="120" width="230" height="74" rx="18" fill="var(--surface)" />
        <rect x="88" y="138" width="38" height="38" rx="11" fill="var(--acc)" />
        <rect x="140" y="141" width="110" height="9" rx="4.5" fill="var(--border)" />
        <rect x="140" y="160" width="70" height="8" rx="4" fill="var(--acc2)" />
        <rect x="110" y="212" width="230" height="74" rx="18" fill="var(--surface)" />
        <rect x="128" y="230" width="38" height="38" rx="11" fill="var(--blob2)" />
        <rect x="180" y="233" width="100" height="9" rx="4.5" fill="var(--border)" />
        <circle cx="90" cy="380" r="34" fill="none" stroke="var(--acc)" strokeWidth="10" />
        <line x1="114" y1="404" x2="140" y2="430" stroke="var(--acc)" strokeWidth="10" strokeLinecap="round" />
        <path d="M320 330l6 14 14 6-14 6-6 14-6-14-14-6 14-6z" fill="var(--surface)" />
      </svg>
    );
  }
  // small corner blob for hero banners on Jobs/Dashboard/etc.
  return (
    <svg className="art" viewBox="0 0 150 110" aria-hidden="true">
      <circle cx="95" cy="55" r="50" fill="var(--blob)" />
      <circle cx="30" cy="85" r="22" fill="var(--blob2)" />
      <path d="M40 60l70-30-24 60-16-22z" fill="var(--surface)" />
      <path d="M70 68l40-38-30 44z" fill="var(--acc)" opacity=".85" />
      <path d="M20 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="var(--acc)" opacity=".5" />
    </svg>
  );
}