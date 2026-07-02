# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Big Cookies** — a static artisan bakery website for a fictional Portland cookie company. Single-person project, vanilla HTML/CSS/JS, no build system, no framework, no package.json.

## Commands

- **Preview locally:** `cd /Users/yyy/Documents/protein_design/big-cookies && python3 -m http.server 8000` (or any static server)
- **Deploy:** Push to `main` — GitHub Actions (`.github/workflows/static.yml`) auto-deploys to GitHub Pages
- **No tests, no linter, no build step**

## Architecture

### Multi-page static site with shared chrome

HTML pages are static content files. Shared UI (nav, footer, FAB) is injected at runtime by `ui.js`. All JS is **IIFE modules** attaching to `window.*` namespaces — no module system.

### JavaScript load order (every page loads these):

1. `url-helper.js` → `window.BigCookiesURL` (base path for subdirectory deploys)
2. `data-cache.js` → `window.BigCookiesData` (fetchJSON with in-memory cache + in-flight dedup)
3. `ui.js` → injects nav HTML, footer HTML, mobile FAB into `#site-nav` / `#site-footer` placeholders
4. `nav.js` → `window.BigCookiesNav` (mobile menu toggle, scroll shadow, batch banner countdown)
5. `theme.css` → dark mode overrides (loaded after components.css)
6. `data-loader.js` → renders JSON data into DOM containers
7. `app.js` → ALL interactive features (see sections below)
8. Page-specific: `builder.js`, `quiz.js`

### app.js sections (one IIFE per feature, ~2600 lines total)

| Section | What it does |
|---|---|
| Performance gate | `window.BigCookiesPerf` — motion, pointer, save-data, visibility |
| Animated favicon | Cycles product SVGs on homepage, deferred to idle |
| Seasonal accent | Adjusts CSS `--gold` / `--honey` by month |
| Flavor atlas | Force-directed particle cloud, detail overlays, viewport pausing |
| Cookie parallax | Scroll/mouse parallax on hero cookie |
| Cursor effects | Crumbs trail, sparkle trail |
| Live counters | Activity counter, batch countdown, cookies baked today |
| Scroll-reveal | IntersectionObserver-based reveal animations |
| FAQ accordion | Toggle open/close |
| Forms | Order form, Open Day form, newsletter form |
| Testimonial slider | Rotating quotes via IntersectionObserver |
| Product card flip | Mobile tap-to-flip |
| Theme toggle | Light/dark mode via `data-theme` attribute |
| Easter eggs | Cookie click, Konami code, type detector, cookie rain (R key) |

### Data-driven content

JSON files in `data/` load via `window.BigCookiesData.fetchJSON()`:
- `data/products.json` — products with quiz data, loaded by data-loader and quiz.js
- `data/cookies/*.json` — individual cookie specs
- `data/main_story/*.json` — homepage story content
- `data/kitchen_story/*.json` — kitchen page chapters

### CSS architecture

- **base.css** — CSS custom properties (color, font tokens), reset, nav, hero, buttons, cookie illustrations, layout primitives
- **components.css** (~1800 lines) — All component styles: atlas, cards, gifts, order form, gallery, FAQ, footer, kitchen, testimonials, newsletter
- **theme.css** — `[data-theme="dark"]` overrides for all components

### Key patterns to follow

- **IIFE + `window.*` namespace** — every new JS feature wraps in `(function() { ... })()` and attaches to `window.BigCookies*`
- **Performance checking** — gate effects with `window.BigCookiesPerf.reducedMotion`, `.mobile`, `.saveData`, `.isHidden`
- **Subdirectory-safe URLs** — always use `window.BigCookiesURL.home()` or `.page()` for links
- **Data fetching** — prefer `window.BigCookiesData.fetchJSON(url)` over raw `fetch()` (shared cache + dedup)
- **Dark mode** — add `[data-theme="dark"]` selectors in theme.css, never inline
- **No dependencies** — no npm, no CDN libs, no frameworks, no build tools
- **No tests** — manual preview only