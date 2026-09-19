# Nordic Depths

[![Quality](https://github.com/MykolaDotsenko/Parallax-effect/actions/workflows/quality.yml/badge.svg)](https://github.com/MykolaDotsenko/Parallax-effect/actions/workflows/quality.yml)

**The original 2023 parallax experience first. The modern engineering extension below it.**

[**Open the live experience →**](https://mykoladotsenko.github.io/Parallax-effect/) · [Architecture](./ARCHITECTURE.md) · [Motion system](./MOTION.md)

Nordic Depths no longer replaces the repository's origin. It preserves the original forest + dungeon experience at the top of the page, including the historical layer ratios that made the parallax visually obvious, then turns the same artwork into a modern interaction-engineering case study below.

## Experience map

```text
ORIGINAL 2023
Forest parallax
  ↓
Dungeon / Finnish introduction
  ↓
NORDIC DEPTHS — EXTENDED EDITION
Extension intro
  ↓
X-Ray / original layer anatomy
  ↓
Mist / perception
  ↓
Night / rhythm
  ↓
Engineering principles
  ↓
System / visible architecture
  ↓
Aurora / final statement
```

## The preserved original

The top two screens intentionally keep the original visual language and copy from the 2023 repository.

The historical motion contract is explicit:

| Plane | Original transform |
| --- | --- |
| Far / base | `scrollTop / 1.6` |
| Middle | `scrollTop / 2.5` |
| Near / front | `scrollTop / 5.7` |
| Hero copy | `scrollTop / 2` |
| Dungeon copy | `scrollTop / -7.5` |

Those ratios are now protected by static checks and cross-browser Playwright tests so the repository cannot silently lose its defining effect again.

The old ScrollSmoother dependency is not reintroduced. Native browser scroll remains authoritative; a tiny requestAnimationFrame-coalesced adapter updates the same scroll variable used by the original CSS transforms.

## The extension

Below the preserved original, Nordic Depths adds:

- **Depth X-Ray** — separates the same cached forest strata and exposes the historical divisors `÷1.6`, `÷2.5`, and `÷5.7`.
- **Scene Compass** — native-anchor navigation through the extended narrative.
- **Motion Lab** — controls only the modern extension; it intentionally does not mutate the preserved original.
- **Adaptive motion profiles** — full, compact, and reduced.
- **System scene** — makes the extension architecture visible in the product.
- **Night + Aurora choreography** — secondary GSAP/ScrollTrigger motion.
- **Accessibility** — reduced-motion, keyboard focus, forced-colors fallback, semantic reading order, and automated axe checks.
- **Cross-browser regression coverage** — Chromium, Firefox, WebKit, and mobile Chromium.

The modern navigation, Scene Compass, progress indicator, and Motion Lab remain hidden during the original 2023 sequence and appear only when the extension begins.

## Runtime stack

- semantic HTML5
- modern CSS
- Vanilla JavaScript / native ES modules
- GSAP + ScrollTrigger for the extension
- native browser scroll
- original high-resolution PNG/JPEG artwork

No React, Three.js, UI kit, application state framework, or custom scroll engine is used.

## Architecture

```text
PRESERVED ORIGINAL
index.html
   │
   └── original-parallax.js
           │
           └── --original-scroll
                  │
                  └── exact CSS ratios: /1.6 /2.5 /5.7 /2 /-7.5

EXTENSION
system media queries + Motion Lab preferences
                  │
                  ▼
          motion-model.js
                  │
          ┌───────┴────────┐
          ▼                ▼
      motion.js      pointer-depth.js
      GSAP scenes      extension glow
          │                │
          └───────┬────────┘
                  ▼
                 DOM
```

The preserved original and the extension intentionally have separate motion ownership.

See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Image-quality policy

The original image files remain at source quality:

- `layer-base.png`
- `layer-middle.png`
- `layer-front.png`
- `ground.png`
- `dungeon.jpg`

No lossy recompression is used. The authored artwork payload remains protected by a repository budget so future changes cannot silently add unlimited weight.

## Accessibility

- one semantic H1 in the preserved original
- skip link directly to the modern extension
- native anchor navigation
- visible keyboard focus
- `prefers-reduced-motion`: freezes the historical parallax and disables spatial extension motion
- forced-colors fallback removes decorative artwork
- no information encoded only in animation
- automated WCAG A/AA axe checks

## Verification

Install tooling:

```bash
npm install
npx playwright install
```

Run static, lint, and unit checks:

```bash
npm run check
```

Run cross-browser tests:

```bash
npm run test:e2e
```

The quality pipeline verifies:

- the exact historical parallax ratios remain in CSS;
- the original Finnish hero remains present;
- real far / middle / near viewport travel follows the original ordering;
- the preserved original freezes under reduced motion;
- the complete extended narrative renders without horizontal overflow or uncaught errors;
- Motion Lab persistence;
- extension navigation;
- serious/critical automated accessibility violations;
- deterministic visual previews.

## Project structure

```text
.
├── .github/workflows/
├── css/
│   └── main.css
├── fonts/
├── img/
├── js/
│   ├── app.js
│   ├── original-parallax.js
│   ├── motion-lab.js
│   ├── motion-model.js
│   ├── motion-preferences.js
│   ├── motion.js
│   ├── pointer-depth.js
│   └── scene-compass.js
├── libs/gsap/
├── scripts/
├── tests/
├── e2e/
├── ARCHITECTURE.md
├── MOTION.md
└── index.html
```

## Local run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:4173`.

## Origin

The repository began in September 2023 as a compact layered-forest parallax exercise with Finnish personal copy. The current version deliberately preserves that origin instead of hiding it, then demonstrates how the same idea can be expanded into a tested, accessible, inspectable motion system.
