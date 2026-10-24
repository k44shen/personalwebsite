import { flushSync } from "react-dom";
import React, { useState, useEffect } from "react";

const projects = [
  { id: "01", name: "electric go-kart", category: "mechanical design / fabrication", kind: "kart", note: "from CAD to welded steel.", size: "tall", images: [{src: "kart-cad", label: "CAD", alt: "SolidWorks go-kart chassis and component assembly"}, {src: "kart-photo", label: "built", alt: "Fabricated steel go-kart chassis with installed steering"}] },
  { id: "02", name: "projector-guided assembly", category: "hack the north / hardware", kind: "robot", note: "a little help putting things together.", size: "short", images: [{src: "assembly-photo", label: "prototype", alt: "Camera and projector mechanism beside the assembly workspace and laptop"}, {src: "assembly-cad", label: "CAD", alt: "CAD rendering of the pan-and-tilt camera and projector structure"}] },
  { id: "03", name: "ground support", category: "waterloo rocketry", kind: "part", note: "the stuff behind the launch.", size: "short", images: [{src: "tower-cad", label: "tower concept", alt: "CAD concept of an oxidizer tank support tower mounted on a trailer"}, {src: "adapter-photo", label: "machined adapter", alt: "Machined plumbing adapter held beside workshop equipment"}] },
  { id: "04", name: "iron man helmet", category: "watbotics / mechanical design", kind: "helmet", note: "built iron man helmet.", size: "short", images: [{src: "helmet-photo", label: "prototype", alt: "Assembled red and yellow 3D-printed Iron Man helmet"}, {src: "helmet-cad", label: "CAD", alt: "SolidWorks rendering of the Iron Man helmet assembly"}] },
  { id: "05", name: "heart LED PCB", category: "electronics / pcb design", kind: "pcb", note: "made something light up.", size: "short", images: [{src: "pcb-photo", label: "assembled", alt: "Heart-shaped circuit board with red LEDs illuminated"}, {src: "pcb-layout", label: "KiCad", alt: "KiCad layout of the heart-shaped LED circuit board"}] },
];

const companyLogos = {
  "Multimatic": "multimatic",
  "WATonomous": "watonomous",
  "Waterloo Engineering Society": "engsoc",
  "WATbotics": "watbotics",
  "Waterloo Rocketry": "rocketry",
  "Mathnasium of Aurora, ON": "mathnasium",
  "Shad Canada": "shad",
};

// Titles and descriptions transcribed from LinkedIn on 2026-10-23.
const experience = [
  { company: "Multimatic", title: "Advanced Manufacturing Engineering Intern", description: "incoming w27; robotics integration, deployment of humanoid robots, cobots, and autonomous mobile robots", mark: "m.", incoming: true },
  { company: "WATonomous", title: "Humanoid Firmware", description: "larping", mark: "w." },
  { company: "Multimatic", title: "E-Coat Electromechanical Engineering Intern", description: "E-coat electromechanical system", mark: "m." },
  { company: "WATbotics", title: "Mechatronics Design Member", description: "built iron man helmet", mark: "wb" },
  { company: "Waterloo Rocketry", title: "Propulsion and Ground Support Equipment Member", description: "made some stuff", mark: "↗" },
];
const moreExperience = [
  { company: "Waterloo Engineering Society", title: "Athletics Commissioner", description: "Athletics Commissioner for the Waterloo Engineering Society", mark: "e." },
  { company: "Waterloo Engineering Society", title: "Class Representative", description: "Class Representative for 117 Mechatronics Engineering students", mark: "e." },
  { company: "Waterloo Engineering Society", title: "Winter Director", description: "Director for Student Life Portfolio", mark: "e." },
  { company: "Kevvcleans", title: "Founder & Mobile Auto Detailer", description: "detailed cars", mark: "k." },
  { company: "Delph & Jenkins North Ltd.", title: "CAD Drafting Assistant", description: "Produced AutoCAD drawings", mark: "d." },
  { company: "Mathnasium of Aurora, ON", title: "Mathematics Instructor", description: "Teaching math to the next generation", mark: "+" },
  { company: "Shad Canada", title: "Shad Fellow", mark: "s." },
];
function ExperienceRow({ item }) {
  return <article className="experience-row">
    {companyLogos[item.company]
      ? <img className="company-logo" src={`${import.meta.env.BASE_URL}assets/logos/${companyLogos[item.company]}.jpg`} alt={`${item.company} logo`} width="43" height="43" loading="lazy" />
      : <span className="company-mark" aria-hidden="true">{item.mark}</span>}
    <div className="role"><span>{item.company}{item.incoming && <span className="incoming-badge">incoming · winter 2027</span>}</span>
      <h3>{item.title}</h3>
      {item.description && <p>{item.description}</p>}
    </div>
  </article>;
}

function ProjectCard({ project }) {
  const [imageIndex, setImageIndex] = useState(0);
  const selected = project.images[imageIndex];
  return <article className={`project-card ${project.kind} ${project.size}`} style={{ viewTransitionName: `project-${project.id}` }}>
    <div className="card-top"><span>{project.category}</span><span className="project-number">{project.id}</span></div>
    <div className="project-visual project-photo">
      <img key={selected.src} src={`${import.meta.env.BASE_URL}assets/projects/${selected.src}.webp`} alt={selected.alt} loading={project.id === "01" ? "eager" : "lazy"} />
    </div>
    <div className="image-options" aria-label={`${project.name} images`}>
      {project.images.map((item, index) => <button key={item.src} onClick={() => setImageIndex(index)} aria-pressed={imageIndex === index}>{item.label}</button>)}
    </div>
    <div className="card-bottom"><div><h2>{project.name}</h2><p>{project.note}</p></div><span className="card-star" aria-hidden="true">✳</span></div>
  </article>;
}

export default function App() {
  const [filter, setFilter] = useState("all");
  const [typedName, setTypedName] = useState("");
  const [motionPaused, setMotionPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [projectOrder, setProjectOrder] = useState([0, 1, 3]);
  const [interacting, setInteracting] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (reducedMotion) { setTypedName("hey, i'm kevin"); return; }
    let length = 0;
    const timer = setInterval(() => {
      length += 1;
      setTypedName("hey, i'm kevin".slice(0, length));
      if (length >= "hey, i'm kevin".length) clearInterval(timer);
    }, 85);
    return () => clearInterval(timer);
  }, [reducedMotion]);
  useEffect(() => {
    if (motionPaused || reducedMotion || interacting || filter !== "all") return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      const reorder = () => flushSync(() => setProjectOrder(order => [...order.slice(1), order[0]]));
      if (document.startViewTransition) document.startViewTransition(reorder);
      else reorder();
    }, 8000);
    return () => clearInterval(timer);
  }, [motionPaused, reducedMotion, interacting, filter]);
  return <>
    <a className="skip-link" href="#main">skip to content</a>
    <header className="site-header">
      <nav className="pill-nav" aria-label="Main navigation">
        <a className="wordmark" href="#home">kevin<span>✳</span></a>
        <a href="#projects">projects</a><a href="#experience">experience</a>
      </nav>
      <div className="external-nav"><a href="https://www.linkedin.com/in/kevin-shen-/" target="_blank" rel="noreferrer">linkedin ↗</a><a href="mailto:k44shen@uwaterloo.ca">email ↗</a></div>
    </header>
    <main id="main">
      <section className="portfolio-layout" id="home" aria-label="Kevin Shen's portfolio">
        <div className="left-column">
          <section className="intro">
            <div className="eyebrow"><span className="status-dot" /> usually building something</div>
            <h1 aria-label="hey, i'm kevin."><span className="typing-space" aria-hidden="true">hey, i'm kevin<span>.</span></span><span className="typed-name" aria-hidden="true">{typedName}<span className="period">{typedName === "hey, i'm kevin" ? "." : ""}</span><span className="typing-cursor" /></span></h1>
            <p className="intro-line">i work with robots<br />and stuff.</p>
            <p className="school">mechatronics @ <span>uwaterloo</span> <span className="school-mark" aria-hidden="true">↗</span></p>
            <div className="intro-footer"><span>hardware. software. occasionally both.</span><a href="#projects" aria-label="Explore projects">↓</a></div>
          </section>
          <section className="experience" id="experience">
            <div className="section-label"><h2>where i've been</h2><span>01 — experience</span></div>
            {experience.map(item => <ExperienceRow key={item.company + item.title} item={item} />)}
            <details className="more-experience"><summary>other things i've done <span aria-hidden="true">+</span></summary>
              {moreExperience.map(item => <ExperienceRow key={item.company + item.title} item={item} />)}
            </details>
          </section>
          <div className="section-label projects-label" id="projects"><h2>a few things i've worked on</h2><span>02 — projects</span></div>
          <div className="filters" aria-label="Filter projects">{["all", "hardware", "robotics"].map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div>
          {filter !== "robotics" && <div className="project-stack"><ProjectCard project={projects[2]} /><ProjectCard project={projects[4]} /></div>}
          <aside className="small-note"><span aria-hidden="true">↳</span><p>some finished things.<br />some works in progress.</p></aside>
        </div>
        <div className="right-column" onMouseEnter={() => setInteracting(true)} onMouseLeave={() => setInteracting(false)} onFocusCapture={() => setInteracting(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false); }}>
          {projectOrder.filter(index => filter === "all" || (filter === "robotics" ? index === 1 : index !== 1)).map(index => <ProjectCard key={projects[index].id} project={projects[index]} />)}
          <div className="contact-card"><span className="eyebrow">elsewhere on the internet</span><a href="mailto:k44shen@uwaterloo.ca">say hey <span>↗</span></a><p>k44shen@uwaterloo.ca</p></div>
        </div>
      </section>
      <footer><span>kevin shen</span><nav className="webring" aria-label="Tron webring">
        <a href="https://tronring.com/#k44shen.github.io/personalwebsite?nav=prev" aria-label="Previous site in the Tron Ring">←</a>
        <a href="https://tronring.com/#k44shen.github.io/personalwebsite" target="_blank" rel="noreferrer"><img src={`${import.meta.env.BASE_URL}assets/logos/tron-ring.png`} alt="Tron Ring" width="36" height="36" /></a>
        <a href="https://tronring.com/#k44shen.github.io/personalwebsite?nav=next" aria-label="Next site in the Tron Ring">→</a>
      </nav><span>always a work in progress.</span>{!reducedMotion && <button className="motion-toggle" onClick={() => setMotionPaused(value => !value)} aria-pressed={motionPaused}>{motionPaused ? "resume motion ▷" : "pause motion Ⅱ"}</button>}<a href="#home">back to top ↑</a></footer>
    </main>
  </>;
}
