import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { projects } from '../src/data/site.mjs';

const html = await readFile('dist/index.html', 'utf8');
const pages = [
  { path: 'projects', title: 'Projects' },
  { path: 'experience', title: 'Experience' },
  { path: 'build-log', title: 'Build log' },
  ...projects.map(project => ({ path: `projects/${project.slug}`, title: project.name })),
];
for (const page of pages) {
  const relative = '../'.repeat(page.path.split('/').length);
  const document = html.replaceAll('./assets/', `${relative}assets/`).replace(/<title>.*?<\/title>/, `<title>${page.title} · Kevin Shen</title>`);
  await mkdir(`dist/${page.path}`, { recursive: true });
  await writeFile(`dist/${page.path}/index.html`, document);
}
