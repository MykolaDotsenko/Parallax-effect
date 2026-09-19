# Nordic Depths

[![Quality](https://github.com/MykolaDotsenko/Parallax-effect/actions/workflows/quality.yml/badge.svg)](https://github.com/MykolaDotsenko/Parallax-effect/actions/workflows/quality.yml)

**An accessible cinematic scroll experience exploring depth, rhythm, and motion with semantic HTML, modern CSS, Vanilla JavaScript, and GSAP.**

[**Open the live experience →**](https://mykoladotsenko.github.io/Parallax-effect/) · [Architecture](./ARCHITECTURE.md) · [Motion system](./MOTION.md)

Nordic Depths rebuilds an early parallax exercise into a focused interaction-engineering case study. The goal is not to maximize the number of effects. It is to make a small motion system feel intentional, resilient, accessible, and easy to reason about.

## Why this project is interesting

- **Native scrolling stays authoritative.** There is no custom scroll engine.
- **Parallax is declarative, native, and deliberately legible.** A short sticky hero runway lets far / middle / near strata separate visibly while native scroll remains authoritative; the existing ground artwork becomes a fourth foreground plane.
- **Motion is progressive enhancement.** The complete narrative remains readable without GSAP or JavaScript.
- **Reduced motion is a first-class product path.** Spatial movement is removed instead of merely slowed down.
- **Mobile gets lower motion intensity.** Coarse-pointer devices use a shorter hero runway, lower depth amplitude, and no pointer parallax.
- **The visual source assets remain full quality.** Performance work targets loading behavior, compositing, code, and future payload growth rather than degrading the artwork.
- **Only transform and opacity are animated by the scroll system.**
- **No React, Three.js, UI kit, state library, or runtime application framework.**
- **Interactive documentation lives inside the product.** Motion Lab and X-Ray explain the same system the user is experiencing.

## Experience map

```text
Forest
  ↓
X-Ray / depth anatomy
  ↓
Mist / perception
  ↓
Rhythm / night
  ↓
Engineering principles
  ↓
System / live architecture
  ↓
Aurora / final statement
```

The seven scenes form one continuous narrative rather than a collection of disconnected animation demos.

### v3 interaction layer

- **Depth X-Ray** reuses the real forest assets and temporarily separates far / middle / near strata so the authored depth model becomes visible.
- **Scene Compass** turns the long-form page into a legible six-stage expedition while preserving native anchor navigation.
- **Motion Lab** exposes the actual production motion profile and depth scale, with live scene/velocity telemetry and local preference persistence.
- **System** turns the dependency graph into a semantic on-page architecture map instead of hiding the engineering story in documentation.
- The controls modify the real experience. There is no separate toy preview or duplicated motion implementation.

## Runtime stack

- semantic HTML5
- modern CSS
- Vanilla JavaScript / native ES modules
- GSAP
- ScrollTrigger
- original high-resolution PNG/JPEG artwork

The product has no application framework and no runtime package installation.

## Verification stack

- Node.js built-in test runner
- ESLint
- Playwright
- axe-core
- GitHub Actions
- deterministic static project checks

## Architecture

```text
index.html
   │
   ├── semantic content (works without JS)
   │
   └── data-depth configuration
               │
               ▼
        js/motion-model.js
         pure bounded rules
               │
        ┌──────┴────────┐
        ▼               ▼
 js/hero-parallax.js   js/motion.js   js/pointer-depth.js
 native scroll adapter   GSAP scenes      pointer adapter
        │               │
        └──────┬────────┘
               ▼
             DOM
```

The pure motion model has no browser or GSAP dependency. Browser-specific orchestration stays at the edges.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the detailed dependency rules and trade-offs.

## Adaptive motion

Nordic Depths has three motion profiles:

| Profile | Trigger | Scroll motion | Pointer depth |
| --- | --- | --- | --- |
| Full | fine pointer + normal motion preference | full bounded amplitude | yes |
| Compact | coarse pointer | reduced amplitude | no |
| Reduced | `prefers-reduced-motion: reduce` | none | no |

The same headings, paragraphs, links, and reading order remain available in every mode.

See [MOTION.md](./MOTION.md).

## Visual quality and performance

The original high-resolution image files are deliberately preserved. The project does **not** trade image fidelity for an artificial byte-size score.

Instead it protects performance by:

- preloading only the first critical forest layer;
- lazy-loading the below-fold night image;
- keeping motion to compositor-friendly transforms and opacity;
- avoiding a second scroll engine;
- avoiding framework/runtime bundles;
- limiting pointer work to one requestAnimationFrame-coalesced visual signal;
- keeping lower scenes CSS-driven where possible;
- using native CSS scroll progress when supported, with the existing JavaScript progress calculation as a fallback;
- enforcing a repository asset budget so future changes cannot silently add unlimited weight.

The current artwork is treated as an intentional visual-quality budget, not accidental bloat.

## Accessibility

- skip link
- semantic landmarks and heading order
- visible keyboard focus
- native anchor navigation
- `prefers-reduced-motion` behavior
- forced-colors fallback that removes decorative imagery
- no information encoded only in motion
- no scroll hijacking
- automated axe checks in browser tests

## Quality gates

Install development tooling:

```bash
npm install
npx playwright install
```

Run static, lint, and unit checks:

```bash
npm run check
```

Run browser verification:

```bash
npm run test:e2e
```

The browser suite verifies the experience in Chromium, Firefox, and WebKit, including a reduced-motion path and automated accessibility analysis.

## Project structure

```text
.
├── .github/workflows/
│   ├── pages.yml
│   └── quality.yml
├── css/
│   └── main.css
├── fonts/
├── img/
├── js/
│   ├── app.js
│   ├── hero-parallax.js
│   ├── motion-lab.js
│   ├── motion-model.js
│   ├── motion-preferences.js
│   ├── motion.js
│   ├── pointer-depth.js
│   └── scene-compass.js
├── libs/gsap/
├── scripts/
│   ├── check-project.mjs
│   └── serve.mjs
├── tests/
│   └── motion-model.test.js
├── e2e/
│   └── nordic-depths.spec.js
├── ARCHITECTURE.md
├── MOTION.md
├── eslint.config.js
├── package.json
├── playwright.config.js
└── index.html
```

## Local run

No application build is required.

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4173`.

## Design decision: why no React or Three.js?

The product is fundamentally a semantic document plus a bounded motion system.

React would add component/runtime surface without solving an application-state problem. Three.js would add a large rendering abstraction for an experience that can be expressed with layered raster art, CSS, and compositor-friendly transforms.

The smaller stack makes the important engineering decisions easier to inspect.

## Origin

The repository began as a compact GSAP parallax learning exercise. The rebuild intentionally preserves the original artwork and the central idea — depth through scrolling — while replacing tutorial-style orchestration with a maintainable, accessibility-aware implementation.
