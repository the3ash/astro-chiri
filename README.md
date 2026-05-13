# Chiri 🌸

![screenshot-light](public/screenshots/screenshot-light.png)
![screenshot-dark](public/screenshots/screenshot-dark.png)

Chiri is a minimal blog theme built with [Astro](https://astro.build), offering customization options while preserving its clean aesthetic.

Check the [demo](https://chiri.the3ash.com/) for more details.

## Features

- [x] Build with Astro
- [x] Responsive
- [x] Light / Dark mode
- [x] MDX
- [x] KaTeX
- [x] Sitemap
- [x] OpenGraph
- [x] RSS

## Getting Started

1. [Fork](https://github.com/the3ash/astro-chiri/fork) this repository, or use this template to [create a new repository](https://github.com/new?template_name=astro-chiri&template_owner=the3ash).

2. Run the following commands:

   ```bash
   git clone <your-repo-url>

   cd <your-repo-name>

   pnpm install

   pnpm dev
   ```

3. Edit `src/config.ts` and `src/content/about/about.md` to your liking.

4. Use `pnpm new <title>` to create new posts, or add your posts to `src/content/posts`.

5. Build with `pnpm build` and deploy the generated `dist/` directory to any static hosting platform. Link Card metadata is fetched automatically during `pnpm dev` and `pnpm build` and stored in `src/data/link-card-metadata.json` so cards render as static HTML.

&emsp;[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start) [![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new)

## Commands

- `pnpm new <title>` - Create a new post (use `_title` for drafts)
- `pnpm update-link-metadata` - Refresh metadata for `::link` cards (use `--force` to re-fetch existing entries)
- `pnpm update-theme` - Update the theme to the latest version

## References

- https://paco.me/
- https://benji.org/
- https://shud.in/
- https://retypeset.radishzz.cc/

## License

MIT
