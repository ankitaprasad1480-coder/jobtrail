export function JobSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div className="skel-job" key={i}>
          <div className="skel skel-logo" />
          <div className="skel-lines">
            <div className="skel skel-line" style={{ width: "55%" }} />
            <div className="skel skel-line" style={{ width: "35%" }} />
            <div className="skel skel-line" style={{ width: "80%" }} />
          </div>
        </div>
      ))}
    </>
  );
}