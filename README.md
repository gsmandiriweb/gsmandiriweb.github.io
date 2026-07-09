# CV Bangun Sarana Makmur — Site (Astro 7 + Svelte 5)

A 100% serverless, content-driven company profile + blog. Blog Markdown + images
live in a **GitHub repository**; the public site is **prerendered at build time**
via an Astro 7 Content Layer loader, and the private CMS is a **Svelte 5 island**
that writes back to GitHub through the REST API.

## Stack (current majors, verified 2026-07-09)
- `astro@7.0.7` — static output, Content Layer collections
- `@astrojs/svelte@9.0.1` — Svelte 5 island hydration
- `svelte@5.56.4` — runes (`$state`, `$derived`, `oninput`)
- `@astrojs/sitemap@3.7.3` — auto `sitemap.xml`
- `gray-matter` — frontmatter parsing in the loader

## Architecture
```
GitHub repo (Markdown + images)
      │  (build-time fetch, GITHUB_TOKEN optional)
      ▼
src/content.config.ts  ──  content_layer collection "blog"
      │  custom loader: github-blog-loader
      │  • pulls *.md from repo via Contents API
      │  • parses frontmatter, rewrites cover -> jsDelivr CDN url
      │  • skips trashed/draft
      ▼
Astro pages (prerendered HTML + JSON-LD + OG)
  /                     hero + latest 3 posts
  /blog                list (filters future-dated posts)
  /blog/[slug]         rendered Markdown + related + share
  /admin               Svelte 5 island (noindex)  ──► GitHub REST API (PAT)
```

## Run it
```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # -> dist/ (static, deploy anywhere)
npm run check      # astro check (types)
```
The loader falls back to `src/sample/*.md` when no GitHub repo is
configured, so the build works out of the box.

## Wire a real GitHub repo
1. Create a repo (e.g. `cvbsm-content`) with a `blog/` folder of
   `slug.md` files + `blog/images/`.
2. Create a **fine-grained PAT** scoped to that repo's `Contents: read+write`.
3. Copy `.env.example` -> `.env` and fill:
   ```
   GITHUB_OWNER / GITHUB_REPO / GITHUB_BRANCH / GITHUB_POSTS_DIR
   GITHUB_CDN_BASE         # jsDelivr base for public reads
   GITHUB_TOKEN            # build-time loader only (CI secret)
   ```
4. (Optional) add a GitHub Action to rebuild on a schedule / on push so
   future-dated posts auto-publish when their date passes.

## Admin portal (`/admin`)
A Svelte 5 island. The admin pastes a fine-grained PAT in the browser
(session only, never leaves the client except to `api.github.com`). It can:
- list / edit / create posts (Markdown + image upload)
- soft-delete-aware hard delete via the Contents API
- **batch scheduler**: set a start date + interval, push N posts with
  computed sequential `pubDate` frontmatter

## Rate limits (dev + CI)
The loader hits the GitHub **Contents API** at build/dev time:
- Unauthenticated: **60 requests/hour** per IP. Restarting `astro dev`
  many times an hour can exhaust this.
- Authenticated (any read-capable PAT in `GITHUB_TOKEN`): **5,000/hour**.
- **Cache defense:** every successful fetch is written to `.cache/blog/`.
  If a later fetch is rate-limited or the repo is unreachable, the loader
  reuses the last good cache so the build never fails. Set `GITHUB_CACHE=0`
  to force a fresh fetch (e.g. after bulk-editing many posts).
- `.cache/` is gitignored — never committed.

## Notes / caveats
- Images served from GitHub via jsDelivr are NOT auto-optimized by
  Astro's `<Image/>` (those run on build-time assets). Compress before
  upload, or route images through an image CDN.
- Scheduled publishing is build-time: a future-dated post appears after the
  next rebuild once its date has passed.
- `src/content.config.ts` uses the Astro 7 shape: collections are
  exported as an aggregated `collections` object, and the loader is a
  `{ name, load(ctx) }` object calling `ctx.store.set({ id, data, body })`.
