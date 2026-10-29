import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { projects, experience } from './data/site.mjs';

const base = new URL(/* @vite-ignore */ '../', import.meta.url).pathname;
const asset = (path) => `${base}assets/${path}`;
const link = (path = '') => `${base}${path}`;
const currentPath = () => decodeURIComponent(location.pathname.slice(base.length)).replace(/\/$/, '');

function Arrow() {
  return <svg className="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg>;
}

function ProjectCard({ project, index = 0 }) {
  return <a className="project-card card enter" href={link(`projects/${project.slug}/`)} style={{ '--delay': `${index * 80}ms`, viewTransitionName: `project-${project.slug}` }}>
    <div className="card-heading"><span>Projects · {project.name}</span><Arrow /></div>
    <div className={`project-image ${project.slug}`}><img src={asset(`projects/${project.image}`)} alt={project.alt} loading={index < 2 ? 'eager' : 'lazy'} /></div>
  </a>;
}

function ExperienceCard({ item, detail = false, index = 0 }) {
  const content = <>
    {item.logo ? <img className="company-logo" src={asset(`logos/${item.logo}.jpg`)} alt={`${item.company} logo`} width="56" height="56" /> : <span className="company-initial" aria-hidden="true">{item.company[0]}</span>}
    <div className="experience-copy"><span className="card-label">{item.incoming ? 'Incoming W27' : 'Experience'} · {item.company}</span><h2>{item.title}</h2>{detail && item.description && <p>{item.description}</p>}</div>
    {!detail && <Arrow />}
  </>;
  return detail ? <article className="experience-card card enter detail-experience" style={{ '--delay': `${Math.min(index, 5) * 60}ms` }}>{content}</article> : <a className="experience-card card enter" href={link('experience/')} style={{ '--delay': `${index * 80 + 100}ms` }}>{content}</a>;
}

function Greeting({ reduced }) {
  const name = "hey, im kevin";
  const [text, setText] = useState(reduced ? name : '');
  useEffect(() => {
    if (reduced) { setText(name); return; }
    let position = 0;
    const timer = setInterval(() => {
      position += 1;
      setText(name.slice(0, position));
      if (position === name.length) clearInterval(timer);
    }, 85);
    return () => clearInterval(timer);
  }, [reduced]);
  return <h1 className="greeting" aria-label={name}><span aria-hidden="true">{text}<span className="caret" /></span></h1>;
}

function Home({ reduced, paused, setPaused }) {
  const [order, setOrder] = useState([5, 0, 1, 3]);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (reduced || paused || hovered || focused) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      const update = () => flushSync(() => setOrder(previous => [...previous.slice(1), previous[0]]));
      if (document.startViewTransition) document.startViewTransition(update);
      else update();
    }, 9000);
    return () => clearInterval(timer);
  }, [reduced, paused, hovered, focused]);
  return <>
    <div className="home-layout">
      <div className="home-column">
        <section className="intro enter"><Greeting reduced={reduced} /><p>i work with robots and stuff</p><p className="school-line">tron @uwaterloo <img className="waterloo-crest" src={asset('logos/uwaterloo.svg')} alt="University of Waterloo" width="28" height="32" /></p></section>
        {experience.slice(0, 3).map((item, index) => <ExperienceCard key={item.title} item={item} index={index} />)}
        <ProjectCard project={projects[2]} index={2} />
        <ProjectCard project={projects[4]} index={3} />
      </div>
      <div className="home-column featured-projects" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
        {order.map((projectIndex, index) => <ProjectCard key={projects[projectIndex].slug} project={projects[projectIndex]} index={index} />)}
      </div>
    </div>
    {!reduced && <button className="motion-toggle" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? 'resume motion' : 'pause motion'}</button>}
  </>;
}

function ProjectDetail({ project }) {
  return <section className="project-detail enter"><a className="back-link" href={link('projects/')}>← Projects</a><h1 className="page-title">{project.name}</h1><div className="detail-image card"><img src={asset(`projects/${project.image}`)} alt={project.alt} /></div><p className="project-description">{project.description}</p>{project.status && <p className="project-status">{project.status}</p>}</section>;
}

export default function App() {
  const path = currentPath();
  const active = path.startsWith('projects') ? 'projects' : path === 'experience' ? 'experience' : 'home';
  const project = projects.find(item => path === `projects/${item.slug}`);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  useEffect(() => { document.title = `${project?.name || (active === 'projects' ? 'Projects' : active === 'experience' ? 'Experience' : 'Kevin Shen')}${active === 'home' ? '' : ' · Kevin Shen'}`; }, [active, project]);
  return <div className="site-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><nav className="pill-nav" aria-label="Main navigation"><a href={link()} aria-current={active === 'home' ? 'page' : undefined}>kevin</a><a href={link('projects/')} aria-current={active === 'projects' ? 'page' : undefined}>projects</a><a href={link('experience/')} aria-current={active === 'experience' ? 'page' : undefined}>experience</a></nav><nav className="external-nav" aria-label="External links"><a href="https://github.com/k44shen" target="_blank" rel="noreferrer">github</a><a href="https://www.linkedin.com/in/kevin-shen-/" target="_blank" rel="noreferrer">linkedin</a></nav></header>
    <main id="main">{project ? <ProjectDetail project={project} /> : active === 'projects' ? <section><h1 className="page-title enter">Projects</h1><div className="projects-grid">{projects.map((item, index) => <ProjectCard key={item.slug} project={item} index={index} />)}</div></section> : active === 'experience' ? <section><h1 className="page-title enter">Experience</h1><div className="experience-list">{experience.map((item, index) => <ExperienceCard key={item.company + item.title} item={item} index={index} detail />)}</div></section> : <Home reduced={reduced} paused={paused} setPaused={setPaused} />}</main>
    <footer><a href="mailto:k44shen@uwaterloo.ca">k44shen@uwaterloo.ca</a><nav className="webring" aria-label="Tron webring"><a href="https://tronring.com/#k44shen.github.io/personalwebsite?nav=prev" aria-label="Previous site">←</a><a href="https://tronring.com/#k44shen.github.io/personalwebsite" target="_blank" rel="noreferrer"><img src={asset('logos/tron-ring.png')} alt="Tron Ring" width="32" height="32" /></a><a href="https://tronring.com/#k44shen.github.io/personalwebsite?nav=next" aria-label="Next site">→</a></nav></footer>
  </div>;
}
