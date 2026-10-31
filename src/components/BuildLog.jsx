import React from 'react';
import { buildUpdates } from '../data/buildUpdates.mjs';

export function BuildUpdate({ update, asset, link, embedded = false }) {
  const Heading = embedded ? 'h3' : 'h2';
  const date = new Date(`${update.date}T12:00:00`).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
  return <article className="build-update" id={update.slug}>
    <div className="update-meta"><time dateTime={update.date}>{date}</time><span aria-hidden="true">·</span><a href={link(`projects/${update.projectSlug}/`)}>{update.projectName} ↗</a></div>
    <Heading>{update.title}</Heading>
    <p className="update-summary">{update.summary}</p>
    <figure className="update-video">
      <video controls playsInline preload="metadata" poster={asset(`projects/${update.poster}`)} aria-label="Bench video of the turret changing orientation under laptop control">
        <source src={asset(`videos/${update.video}`)} type="video/mp4" />
        Your browser does not support video playback. <a href={asset(`videos/${update.video}`)}>Download the clip</a>.
      </video>
      <figcaption>{update.caption}</figcaption>
    </figure>
    {update.paragraphs.map(paragraph => <p className="update-copy" key={paragraph}>{paragraph}</p>)}
    <a className="update-download" href={asset(`videos/${update.video}`)} download>Download video ↗</a>
  </article>;
}

export default function BuildLog({ asset, link }) {
  return <section className="build-log enter"><h1 className="page-title">Build log</h1>
    {buildUpdates.map(update => <BuildUpdate key={update.slug} update={update} asset={asset} link={link} />)}
  </section>;
}
