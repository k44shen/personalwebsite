import { useEffect, useRef } from "react";

const DIRECTORY_ITEMS = [
  { label: "Profile", detail: "Kevin Shen / Waterloo Mechatronics", id: "profile" },
  { label: "Experience", detail: "Waterloo Rocketry", id: "resume" },
  { label: "Projects", detail: "Embedded systems / machining", id: "projects" },
];

export default function ArtifactPanel({ artifact, isOpen, onClose, onOpenArtifact }) {
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const activeElement = document.activeElement;
    previousFocusRef.current = activeElement !== document.body && !panelRef.current?.contains(activeElement)
      ? activeElement
      : document.querySelector(".siteHeader .navControl");
    const focusFrame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      const previousFocus = previousFocusRef.current;
      requestAnimationFrame(() => {
        const fallback = document.querySelector(".siteHeader .navControl");
        (previousFocus?.isConnected ? previousFocus : fallback)?.focus?.();
      });
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !artifact) return undefined;
    const focusFrame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => cancelAnimationFrame(focusFrame);
  }, [artifact, isOpen]);

  return (
    <>
      <aside
        ref={panelRef}
        className={`directory ${isOpen ? "isOpen" : ""}`}
        aria-hidden={!isOpen}
        aria-labelledby={artifact ? "artifact-panel-title" : "directory-panel-title"}
        aria-live="polite"
        aria-modal={isOpen ? "true" : undefined}
        role="dialog"
      >
        <div className="directoryHead">
          <span id={artifact ? undefined : "directory-panel-title"}>{artifact ? "SCAN COMPLETE / RECORD VERIFIED" : "ENGINEERING INDEX"}</span>
          <button ref={closeButtonRef} type="button" aria-label="Close panel" onClick={onClose}>CLOSE</button>
        </div>
        {artifact ? (
          <article className="artifactDetails">
            <span className="artifactType">{artifact.shortLabel} / {artifact.label}</span>
            <h2 id="artifact-panel-title">{artifact.title}</h2>
            <p className="artifactSubtitle">{artifact.subtitle}</p>
            <div className="artifactFacts">
              {artifact.evidenceLines.slice(0, 3).map((line) => <p key={line}>{line}</p>)}
            </div>
            <div className="artifactKeywords" aria-label="Tools and skills">
              {artifact.keywords.map((keyword) => <span key={keyword}>{keyword}</span>)}
            </div>
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
