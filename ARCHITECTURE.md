# Architecture

## Product boundary

Nordic Depths has two deliberately separate motion surfaces.

```text
PRESERVED ORIGINAL (2023)
historical content + exact parallax ratios
              │
              ▼
     original-parallax.js
              │
              ▼
      --original-scroll
              │
              ▼
        scoped CSS transforms

MODERN EXTENSION
system signals + persisted preferences
              │
              ▼
       motion-model.js
              │
        ┌─────┴─────┐
        ▼           ▼
    motion.js   pointer-depth.js
        │           │
        └─────┬─────┘
              ▼
             DOM
```

The historical sequence is not driven by Motion Lab and does not depend on GSAP.

## Preserved original

### HTML ownership

The top of `index.html` contains the original two-part experience:

1. layered forest with the original 2023 composition and current Finnish portfolio copy;
2. dungeon scene with the original composition and an updated current introduction.

The artwork is the same source artwork committed in 2023.

### `js/original-parallax.js`

This adapter has one job: update `--original-scroll` from native browser scroll.

It:

- uses `window.scrollY` as the only scroll source;
- coalesces work through one `requestAnimationFrame`;
- scopes the variable to the preserved original;
- freezes at zero when the OS requests reduced motion;
- has explicit cleanup.

The historical ratios remain in CSS rather than being reinterpreted by the modern motion model:

- far: `/ 1.6`
- middle: `/ 2.5`
- near: `/ 5.7`
- hero copy: `/ 2`
- dungeon copy: `/ -7.5`

This preserves the original visual behavior while avoiding the old ScrollSmoother runtime dependency.

## Extension boundary

`#extension` is the handoff from the historical experience to Nordic Depths Extended.

The fixed brand/header, Scene Compass, progress indicator, and Motion Lab are hidden while the historical sequence is active. `app.js` activates that chrome only when the extension approaches the viewport.

With JavaScript disabled, the chrome remains available instead of becoming inaccessible.

## Modern modules

### `js/motion-model.js`

Pure functions only:

- clamps numeric configuration;
- selects full / compact / reduced extension profiles;
- has no DOM or GSAP dependency.

### `js/motion.js`

GSAP/ScrollTrigger adapter for the extension:

- X-Ray separation/recomposition;
- System reveal;
- Night drift/shutters;
- Aurora build;
- one-shot content reveals.

GSAP does not own the preserved original.

### `js/pointer-depth.js`

Fine-pointer enhancement for the extension intro only.

It:

- is disabled for compact/reduced profiles;
- coalesces pointer updates through one animation frame;
- writes bounded CSS custom properties.

### `js/motion-lab.js`

Motion Lab edits only the extension profile:

- system / full / compact / reduced override;
- bounded extension intensity;
- live profile, scene, and scroll-velocity telemetry.

The historical parallax is intentionally immutable from this tool.

### `js/scene-compass.js`

Uses semantic `[data-scene]` sections and native hash links. It also owns the document progress indicator, preferring a CSS scroll timeline where supported and retaining a requestAnimationFrame fallback.

## State ownership

Persisted state is limited to the modern extension:

- profile override;
- extension intensity.

The original sequence has no persisted state.

Transient state:

- active extension scene;
- header/chrome activation;
- GSAP progress;
- pointer-derived extension glow;
- Motion Lab telemetry.

## Scroll model

The browser is the only scroll authority.

There is:

- no ScrollSmoother runtime;
- no custom momentum;
- no scroll hijacking;
- no second authoritative scroll position.

The preserved original reads native scroll. ScrollTrigger observes the same native scroll for modern lower-page choreography.

## Progressive enhancement

Baseline:

1. semantic HTML exposes both the original and extension narrative;
2. CSS renders a complete static composition;
3. JavaScript restores the historical parallax and adds modern extension motion;
4. reduced motion freezes spatial animation while preserving content;
5. JavaScript failure removes enhancement, not information.

## Rendering constraints

Scroll-linked motion uses compositor-friendly properties:

- `transform`
- `opacity`

The original historical CSS ratios are the explicit exception to abstraction: they remain literal and protected because preserving them is a product requirement.

## Image-quality policy

The 2023 artwork is retained at source quality.

Performance controls focus on:

- preload discipline;
- lazy loading where possible;
- no duplicate framework runtime;
- no second scroll engine;
- repository-level image payload budget.

## Testing strategy

### Static

Protects:

- metadata and canonical URL;
- semantic main and exactly one H1;
- the current Finnish portfolio hero;
- exact `/1.6`, `/2.5`, `/5.7`, and `/-7.5` CSS contracts;
- reduced-motion and forced-colors CSS;
- original source artwork and payload budget.

### Unit

Validates extension profile selection and preference normalization.

### Browser

Chromium, Firefox, WebKit, and mobile Chromium validate:

- original layer travel ordering;
- meaningful real viewport separation;
- reduced-motion freeze for the historical section;
- extension activation/navigation;
- Motion Lab persistence;
- complete narrative and horizontal-overflow safety;
- serious/critical axe violations.

## System scene scope

The on-page System scene documents the **modern extension architecture**, not the preserved 2023 subsystem. This distinction keeps the historical artifact honest and the engineering layer inspectable.
