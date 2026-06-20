export default function HudNav({ onOpenArtifact, onOpenIndex }) {
  return (
    <header className="siteHeader">
      <button className="wordmark" type="button" onClick={() => onOpenArtifact("profile")}>
        <strong>KEVIN SHEN</strong><span>MECHATRONICS</span>
      </button>
      <nav aria-label="Portfolio controls">
        <button type="button" className="navControl" onClick={onOpenIndex}>INDEX</button>
        <a className="navControl" href="/resume.pdf" target="_blank" rel="noreferrer">RESUME</a>
      </nav>
    </header>
  );
}
