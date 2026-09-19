# Architecture

## Goal

Nordic Depths is a motion-focused document, not a single-page application. The architecture therefore keeps semantic content independent from animation and keeps browser/GSAP details outside the pure motion rules.

## Dependency rule

```text
HTML configuration
      ↓
pure motion model
      ↓
browser adapters
      ↓
GSAP / DOM
```

The dependency direction never reverses.

## Modules

### `js/motion-model.js`

Pure functions only:

- clamps untrusted numeric configuration;
- selects full / compact / reduced motion profiles;
- maps normalized depth values to bounded travel.

It imports nothing and can be tested by Node without a DOM.

### `js/motion.js`

GSAP adapter:

- registers ScrollTrigger;
- reads `data-depth` from authored layers;
- applies transform/opacity timelines;
- owns reveal and night-scene scroll orchestration;
- returns an explicit cleanup function.

If GSAP is unavailable, the page remains static and readable.

### `js/pointer-depth.js`

Small pointer adapter:

- only enabled for the full profile;
- coalesces updates through `requestAnimationFrame`;
- writes two CSS custom properties;
- never causes React-style render churn or layout reads on every pointer event.

### `js/app.js`

Composition root:

- reads media preferences;
- creates the motion profile;
- wires adapters together;
- reconfigures when motion/pointer media queries change;
- owns page lifecycle cleanup.

## State ownership

There is no durable application state.

The only runtime state is ephemeral presentation state:

- current media preference;
- current pointer-derived light offset;
- GSAP timeline progress;
- sticky-header threshold.

No state is persisted because the product has nothing meaningful to persist.

## Scroll model

The browser owns scrolling.

Nordic Depths intentionally does not use ScrollSmoother or another custom scroll engine. ScrollTrigger observes native scroll position and maps it to compositor-friendly transforms.

This avoids:

- duplicate scroll sources;
- focus/anchor surprises;
- custom momentum behavior;
- extra mobile complexity.

## Progressive enhancement

Baseline:

1. HTML contains the complete narrative.
2. CSS creates a static premium composition.
3. JavaScript adds motion if the browser/tooling is available.
4. Reduced-motion preference disables spatial animation.

A JavaScript failure therefore removes enhancement, not content.

## Rendering constraints

Scroll animation is limited to:

- `transform`
- `opacity`

The architecture does not animate layout properties such as `top`, `left`, `width`, or `height`.

## Image-quality policy

The original visual assets are retained at source quality. This is a deliberate product decision.

Performance controls instead focus on:

- critical-image preload discipline;
- lazy loading below the fold;
- no duplicated responsive derivatives unless they can be produced losslessly;
- repository-level payload budget;
- zero application-framework runtime;
- no second animation/scroll engine.

## Failure modes

| Failure | Result |
| --- | --- |
| GSAP unavailable | static readable experience |
| ScrollTrigger unavailable | static readable experience |
| reduced-motion enabled | static spatial layout + near-zero CSS transitions |
| pointer unavailable/coarse | pointer depth disabled |
| JavaScript disabled | semantic content and navigation remain available |
| decorative image unavailable | text content remains complete |

## Testing strategy

### Pure tests

Validate:

- profile selection;
- clamping;
- depth-to-travel mapping.

### Browser tests

Validate:

- critical narrative visibility;
- no horizontal overflow;
- no uncaught page errors;
- anchor navigation;
- reduced-motion mode;
- automated WCAG A/AA scan.

### Static checks

Validate:

- required metadata;
- canonical URL;
- semantic main/h1 structure;
- local files;
- reduced-motion and forced-color CSS;
- original image files remain present;
- total authored image payload stays within the explicit quality budget.


## v3 interaction architecture

The v3 interaction layer adds inspectability without adding an application framework.

```text
system media queries ─┐
persisted preference ─┼─> motion-model.js ─> motion.js / pointer-depth.js
Motion Lab controls ──┘          │
                                 └─> live profile readout

[data-scene] ─> scene-compass.js ─> native anchors + active-scene telemetry
```

### Motion Lab

`motion-lab.js` is a DOM adapter. It does not own the motion rules. It edits normalized preferences and reports live telemetry; `app.js` then recreates the same bounded production profile through `motion-model.js`.

Only two preferences are persisted:

- profile override: system / full / compact / reduced;
- depth scale: 0.5–1.25.

This persistence is meaningful user state, unlike the transient animation state described above.

### Scene Compass

`scene-compass.js` uses `IntersectionObserver` to expose the active semantic scene and a requestAnimationFrame-coalesced document progress indicator. Navigation remains ordinary hash links.

### Depth X-Ray

The X-Ray scene duplicates no source artwork. It references the same cached forest assets and uses transform/opacity-only ScrollTrigger choreography to separate and recompose the strata.
