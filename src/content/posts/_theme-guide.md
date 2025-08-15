---
title: 'Theme Guide'
pubDate: '2025-07-10'
---

Chiri is a minimal blog theme built with [Astro](https://astro.build), offering customization options while preserving its clean aesthetic.

---

## Basic Commands

- `pnpm new <title>` - Create a new post (use `_title` for drafts)
- `pnpm update-theme` - Update the theme to the latest version

## Main Files & Directories

- `src/content/about/about.md` - Edit the about section of the index page. Leave it empty if you don't want any content.
- `src/content/posts/` - All blog posts are stored here
- `src/config.ts` - Configure main site info and settings

```ts
// Site Info
site: {
  website: 'https://astro-chiri.netlify.app/', // Site domain
  title: 'CHIRI', // Site title
  author: '3ASH', // Author name
  description: 'Minimal blog built by Astro', // Site description
  language: 'en-US' // Default language
},
```

```ts
// General Settings
general: {
  contentWidth: '35rem', // Content area width
  centeredLayout: true, // Use centered layout (false for left-aligned)
  themeToggle: false, // Show theme toggle button (uses system theme by default)
  postListDottedDivider: false, // Show dotted divider in post list
  footer: true, // Show footer
  fadeAnimation: true // Enable fade animations
},
```

```ts
// Date Settings
date: {
  dateFormat: 'YYYY-MM-DD', // Date format: YYYY-MM-DD, MM-DD-YYYY, DD-MM-YYYY, MONTH DAY YYYY, DAY MONTH YYYY
  dateSeparator: '.', // Date separator: . - / (except for MONTH DAY YYYY and DAY MONTH YYYY)
  dateOnRight: true // Date position in post list (true for right, false for left)
},
```

```ts
// Post Settings
post: {
  readingTime: false, // Show reading time in posts
  toc: true, // Show table of contents (when there is enough page width)
  imageViewer: true, // Enable image viewer
  copyCode: true, // Enable copy button in code blocks
  linkCard: true // Enable link card
}
```

## Post Frontmatter

Only `title` and `pubDate` are required fields

```ts
---
title: 'Post Title'
pubDate: '2025-07-10'
---
```

## Syntax Highlighting

You can configure the theme via `shikiConfig` in `astro.config.ts`.

More details: [Syntax Highlighting | Astro Docs](https://docs.astro.build/en/guides/syntax-highlighting/)

```ts
import { defineConfig } from 'astro/config'

export default defineConfig({
  markdown: {
    shikiConfig: {
      light: 'github-light',
      dark: 'github-dark',
      wrap: false
    }
  }
})
```

---

## Preview of Some Features

![Theme Toggle](./_assets/theme-toggle.png)

![Dotted Divider](./_assets/dotted-divider.png)

![Date on Left Side](./_assets/date-on-left.png)

![Table of Contents](./_assets/toc.png)

![Reading Time](./_assets/reading-time.png)

![Copy Code](./_assets/copy-code.png)
