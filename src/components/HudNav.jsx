export default function HudNav({ controlMode, onControlModeChange, onOpenArtifact, onOpenIndex }) {
  return (
    <header className="siteHeader">
      <button className="wordmark" type="button" onClick={() => onOpenArtifact("profile")}>
        <strong>KEVIN SHEN</strong><span>MECHATRONICS</span>
      </button>
      <nav aria-label="Portfolio controls">
        <div className="modeToggle" aria-label="Robot control mode">
          {[
            ["auto", "AUTO"],
            ["manual", "MANUAL"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={controlMode === value ? "isActive" : ""}
              aria-pressed={controlMode === value}
              onClick={() => onControlModeChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="navControl" onClick={onOpenIndex}>INDEX</button>
        <a className="navControl" href="/resume.pdf" target="_blank" rel="noreferrer">RESUME</a>
      </nav>
    </header>
  );
}
