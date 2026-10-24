# Kevin Shen — Portfolio

React and Vite portfolio with Newsreader typography, transparent project cutouts, LinkedIn experience, and a Tron Ring widget.

## Development

```sh
npm ci
npm run dev
```

## Deployment

GitHub Actions builds and deploys main to GitHub Pages:
https://k44shen.github.io/personalwebsite/

Asset URLs use Vite's relative base so they work under the repository path. The build writes static HTML entrypoints for `/projects/`, `/experience/`, and each project detail page, so direct links and refreshes work on GitHub Pages.

The Newsreader font is self-hosted; its OFL license is included in `public/assets/fonts/OFL.txt`. Image-edit provenance is recorded in `docs/image-assets.md`.

The previous CNAME was kevinshen.com. It was removed from the deployment because DNS did not point to GitHub Pages when checked on October 23, 2026. To use a custom domain later, configure its DNS and Pages settings before restoring CNAME.

The Tron Ring entry is submitted separately to sym7534/tron-webring; membership requires maintainer approval.
