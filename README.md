# Big Cookies 🍪

A handcrafted, zero-dependency static website for an artisan cookie bakery. No frameworks, no build step — just vanilla HTML, CSS, and JavaScript.

## Quick Start

```bash
# Serve locally (pick one)
cd www
python3 -m http.server 8080
# or
npx serve .

# Open → http://localhost:8080
```

No `npm install`, no bundler, no transpilation. Just open and go.

## Project Structure

```
big-cookies/
├── CLAUDE.md                # Claude Code guidance
├── README.md                # This file
│
├── www/                     # Website root (deployed to Pages)
│   ├── index.html           # Homepage (hero, menu, flavor atlas, builder, quiz…)
│   ├── about.html           # About the bakery
│   ├── archive.html         # Retired & seasonal flavors
│   ├── awards.html          # Accolades & press
│   ├── factory.html         # Production tour
│   ├── faculty.html         # The team
│   ├── faq.html             # Frequently asked questions
│   ├── kitchen.html         # Kitchen photo stories
│   ├── news.html            # Latest updates
│   ├── 404.html             # Custom 404 page
│   │
│   ├── app.js               # Main application logic (~2500 lines)
│   ├── builder.js           # Shopping cart & box builder
│   ├── data-loader.js       # JSON → HTML template renderer
│   ├── nav.js               # Navigation & mobile menu
│   ├── quiz.js              # Cookie Personality Quiz
│   ├── ui.js                # UI utilities (footer, batch banner, etc.)
│   │
│   ├── base.css             # Reset, typography, layout, utilities
│   ├── components.css       # All component styles (~2600 lines)
│   ├── theme.css            # Dark mode & theme variables
│   │
│   ├── data/
│   │   ├── products.json    # Cookie catalog (the source of truth)
│   │   ├── archive.json     # Retired flavors
│   │   ├── awards.json      # Awards data
│   │   ├── easter-superhero.json
│   │   ├── faculty.json     # Team members
│   │   ├── faq.json         # FAQs
│   │   ├── kitchen-stories.json
│   │   ├── news.json        # News articles
│   │   └── testimonials.json
│   │
│   ├── svg/
│   │   ├── cookies/         # Cookie illustrations (20+)
│   │   ├── kitchen_story/   # Kitchen process illustrations
│   │   └── main_story/      # UI icons & graphics
│   │
│   ├── manifest.json        # PWA manifest
│   ├── robots.txt           # SEO
│   ├── sitemap.xml          # Sitemap
│   └── favicon.svg          # Site favicon
│
└── .github/workflows/static.yml  # GitHub Pages deploy
```

## Architecture

**Data-driven rendering.** Content lives in `data/*.json` files. The `data-loader.js` fetches JSON and renders HTML via template functions — no hardcoded content in markup or scripts.

**Vanilla JS, IIFE pattern.** Each JS file is a self-contained IIFE. No global namespace pollution. Event delegation for dynamic elements.

**Zero dependencies.** The entire site uses only browser-native APIs:
- `fetch()` for data loading
- `requestAnimationFrame` for animations & particle simulation
- Web Animations API + CSS transitions
- `localStorage` for cart persistence & theme preference
- `IntersectionObserver` for scroll-triggered animations
- Service Worker for offline support (PWA)

## Key Features

- **Flavor Atlas** — Force-directed particle cloud simulation with thermal noise, repulsion/attraction forces, and detail overlay
- **Cookie Personality Quiz** — 3 questions with weighted scoring, data-driven from products.json
- **Interactive Box Builder** — Drag-free cart with Staff Picks, Surprise Me, and 12-item firework burst
- **Today's Pick** — Deterministic daily pick with $0.50 discount (day-of-year modulo product count)
- **Animated Favicon** — Dynamic emoji favicon cycling
- **Keyboard Shortcuts** — `0–9` section nav, `?` panel, `R` cookie rain, `T` dark mode, Konami code
- **Easter Eggs** — Hero cookie click counter with toast messages (dynamic from JSON), secret phrases, Konami code unlocks Golden Crumb
- **Dark Mode** — Theme toggle with `prefers-color-scheme` detection, `localStorage` persistence
- **PWA** — Manifest + service worker for offline access
- **Dynamic Counts** — All quantity text auto-generated via `.dhc` spans with number-to-words conversion
- **Responsive** — Mobile-first, `prefers-reduced-motion` support, safe-area insets

## Adding a New Cookie

1. Add an entry to `data/products.json` under `"products"`:
```json
{
  "id": "your-flavor",
  "name": "Your Flavor Name",
  "desc": "A short description.",
  "price": "5.00",
  "ingredients": ["Ingredient 1", "Ingredient 2", "…"],
  "allergens": ["Dairy", "Gluten"],
  "tags": ["New"],
  "icon": "svg/cookies/your-flavor.svg",
  "mood": "Cozy",
  "intensity": "Medium",
  "finish": "Sweet",
  "origin": "The story behind this cookie.",
  "resultDesc": "Quiz personality description.",
  "quiz": {
    "q1": [score_per_option_0, 1, 2, 3],
    "q2": [score_per_option_0, 1, 2, 3],
    "q3": [score_per_option_0, 1, 2, 3]
  }
}
```
2. Add an SVG icon to `svg/cookies/`
3. That's it — the builder, menu, flavor atlas, and quiz pick it up automatically

## Deploy

Static files served from any web server. Production host: `oreot:/var/www/reality/`.

```bash
# Deploy all files
scp -r www/* oreot:/var/www/reality/
```

## Design Principles

- Content as data — JSON is the source of truth, never hardcode in markup
- Accessible — semantic HTML, ARIA labels, keyboard navigable
- Performant — no frameworks, no runtime overhead, lazy-loaded SVGs
- Playful — easter eggs, animations, and personality baked into every interaction

## License

Proprietary — all rights reserved.
