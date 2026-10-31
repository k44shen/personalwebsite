import React, { useEffect, useState } from 'react';
import { projectDetails } from '../data/projectDetails.mjs';
import { buildUpdates } from '../data/buildUpdates.mjs';
import { BuildUpdate } from './BuildLog.jsx';

export default function ProjectDetail({ project, asset, link }) {
  const details = projectDetails[project.slug];
  const updates = buildUpdates.filter(update => update.projectSlug === project.slug);
  const [active, setActive] = useState('project-visual');
  const sections = [{ id: 'overview', title: 'Overview', text: project.description }, ...details.sections];
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) setActive(visible[0].target.id);
    }, { rootMargin: '-10% 0px -55% 0px' });
    document.querySelectorAll('.case-anchor').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [project.slug]);
  return <article className="project-detail enter">
    <a className="back-link" href={link('projects/')}>← Projects</a>
    <h1 className="case-title">{details.title || project.name}<span> — {details.subtitle}</span></h1>
    <div className="case-layout">
      <div className="case-body">
        <section id="project-visual" className="case-anchor">
          <div className="detail-image card"><img src={asset(`projects/${project.image}`)} alt={project.alt} /></div>
          {details.imageCredit && <p className="case-image-credit">{details.imageCredit.text} <a href={details.imageCredit.url} target="_blank" rel="noreferrer">{details.imageCredit.label} ↗</a></p>}
          <dl className="case-meta">
            {details.timeline && <div><dt>timeline</dt><dd>{details.timeline}</dd></div>}
            {details.role && <div><dt>my role</dt><dd>{details.role}</dd></div>}
            <div><dt>tech stack</dt><dd>{details.stack.join(', ')}</dd></div>
            {project.status && <div><dt>status</dt><dd>{project.status}</dd></div>}
          </dl>
          <a className="case-docs-jump" href="#engineering-documents">Explore the engineering documents ↗</a>
        </section>
        {sections.map(section => <section className="case-section case-anchor" id={section.id} key={section.id}>
          <h2>{section.title}</h2><p>{section.text}</p>
          {section.paragraphs?.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          {section.bullets && <ul className="case-points">{section.bullets.map(point => <li key={point}>{point}</li>)}</ul>}
          {section.image && <figure className="case-figure"><div className="case-photo"><img src={asset(`projects/${section.image}`)} alt={section.caption} loading="lazy" /></div><figcaption>{section.caption}</figcaption></figure>}
        </section>)}
        {updates.length > 0 && <section className="case-section case-anchor" id="progress">
          <h2>Progress</h2>
          {updates.map(update => <BuildUpdate key={update.slug} update={update} asset={asset} link={link} embedded />)}
          <a className="case-return" href={link('build-log/')}>All build updates ↗</a>
        </section>}
        <section className="case-section case-anchor" id="engineering-documents">
          <h2>Engineering documents</h2>
          <div className="case-resources">{details.resources.map(resource => <a className="case-resource" key={resource.url} href={resource.url} target="_blank" rel="noreferrer">
            <span className="resource-kind">{resource.kind}</span>
            <span className="resource-title">{resource.title}<span aria-hidden="true">↗</span></span>
            <span className="resource-description">{resource.description}</span>
          </a>)}</div>
        </section>
        <a className="case-return" href={link('projects/')}>← All projects</a>
      </div>
      <nav className="case-contents" aria-label="Project contents"><p>Contents</p>
        {[{ id: 'project-visual', title: 'Project' }, ...sections, ...(updates.length ? [{ id: 'progress', title: 'Progress' }] : []), { id: 'engineering-documents', title: 'Documents' }].map(section => <a key={section.id} href={`#${section.id}`} aria-current={active === section.id ? 'location' : undefined} onClick={() => setActive(section.id)}>{section.title}</a>)}
      </nav>
    </div>
  </article>;
}
