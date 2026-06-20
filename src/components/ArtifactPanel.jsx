const DIRECTORY_ITEMS = [
  { label: "Profile", detail: "Kevin Shen / Waterloo Mechatronics", id: "profile" },
  { label: "Experience", detail: "Waterloo Rocketry", id: "resume" },
  { label: "Projects", detail: "Embedded systems / machining", id: "projects" },
];

export default function ArtifactPanel({ artifact, isOpen, onClose, onOpenArtifact }) {
  return (
    <>
      <aside className={`directory ${isOpen ? "isOpen" : ""}`} aria-hidden={!isOpen} aria-live="polite">
        <div className="directoryHead">
          <span>{artifact ? "ARTIFACT SCAN COMPLETE" : "ENGINEERING INDEX"}</span>
          <button type="button" aria-label="Close panel" onClick={onClose}>CLOSE</button>
        </div>
        {artifact ? (
          <article className="artifactDetails">
            <span className="artifactType">{artifact.shortLabel}</span>
            <h2>{artifact.title}</h2>
            <p>{artifact.subtitle}</p>
            <ul>
              {artifact.evidenceLines.map((line) => <li key={line}>{line}</li>)}
            </ul>
            {artifact.actionEnabled && (
              <a
                className="artifactAction"
                href={artifact.actionHref}
                target={artifact.actionHref.startsWith("mailto:") ? undefined : "_blank"}
                rel={artifact.actionHref.startsWith("mailto:") ? undefined : "noreferrer"}
              >
                {artifact.actionLabel}
              </a>
            )}
          </article>
        ) : (
          <>
            <div className="directoryIntro">
              <p>KEVIN SHEN</p>
              <span>University of Waterloo<br />Mechatronics Engineering</span>
            </div>
            <ol>
              {DIRECTORY_ITEMS.map((item, index) => (
                <li key={item.label}>
                  <button type="button" onClick={() => onOpenArtifact(item.id)}>
                    <span className="itemNumber">0{index + 1}</span>
                    <span className="itemLabel">{item.label}</span>
                    <span className="itemDetail">{item.detail}</span>
                  </button>
                </li>
              ))}
              <li><a href="/resume.pdf" target="_blank" rel="noreferrer"><span className="itemNumber">04</span><span className="itemLabel">Resume</span><span className="itemDetail">PDF / Jan 2026</span></a></li>
              <li><a href="https://www.linkedin.com/in/kevin-shen-/" target="_blank" rel="noreferrer"><span className="itemNumber">05</span><span className="itemLabel">LinkedIn</span><span className="itemDetail">Professional profile</span></a></li>
              <li><a href="mailto:k44shen@uwaterloo.ca"><span className="itemNumber">06</span><span className="itemLabel">Email</span><span className="itemDetail">k44shen@uwaterloo.ca</span></a></li>
            </ol>
          </>
        )}
      </aside>
      <button className={`directoryScrim ${isOpen ? "isOpen" : ""}`} type="button" aria-label="Close panel" onClick={onClose} />
    </>
  );
}
