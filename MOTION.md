# Motion system

## Principle

Motion exists to communicate depth and rhythm. It is not the product's source of truth.

## Motion profiles

### Full

Used when the user has not requested reduced motion and the primary pointer is fine.

- forest depth: full bounded amplitude
- content reveals: 38px maximum entry distance
- pointer light: enabled
- night image drift: enabled

### Compact

Used for coarse-pointer devices.

- scroll amplitude reduced to 58%
- reveal distance reduced to 22px
- pointer light disabled

This avoids treating a phone as a small desktop.

### Reduced

Used when `prefers-reduced-motion: reduce` matches.

- parallax disabled
- spatial reveals disabled
- pointer depth disabled
- aurora/cue animation collapsed by CSS
- content remains in the same reading order

## Depth configuration

Layers declare normalized depth values in HTML:

```html
<img data-parallax-layer data-depth="0.18" ... />
<img data-parallax-layer data-depth="0.42" ... />
<img data-parallax-layer data-depth="0.78" ... />
```

The authored value is normalized **proximity**: `0` is far and `1` is near. The pure motion model clamps it to `0..1`, then maps it around a neutral middle plane. Far layers receive positive vertical travel while near layers receive negative travel. During the short sticky hero runway this creates an intentionally obvious visual split without hijacking browser scroll. The existing `ground.png` is treated as a fourth, closer foreground plane and rises more aggressively than the three forest strata.

## Animation constraints

Scroll-linked animation is restricted to compositor-friendly properties:

- transform
- opacity

Pointer input updates CSS custom properties through one coalesced animation-frame callback.

## Why native scroll

The browser remains the only scroll authority. This preserves predictable anchor navigation, keyboard behavior, platform momentum, and browser accessibility semantics.

## Why GSAP

The core forest parallax intentionally does **not** use ScrollTrigger. It uses native scroll position, one requestAnimationFrame-coalesced adapter, a short CSS-sticky viewport, and the pure bounded depth model. Desktop uses a longer runway; compact/coarse-pointer layouts shorten it and already receive the lower profile intensity.

ScrollTrigger is reserved for secondary choreography where sequencing provides real value:

- X-Ray layer sequence;
- night image drift and shutters;
- System reveal;
- Aurora build;
- one-shot content reveals.

The rest of the visual system is CSS.

## Cleanup

Every adapter returns a cleanup function. The composition root runs cleanup before changing motion profiles and on `pagehide`, preventing duplicate listeners and timelines.


## Motion Lab overrides

The default is `system`, so OS/user media preferences continue to select the profile automatically.

Motion Lab can explicitly select full / compact / reduced for inspection. This is a deliberate user action and is persisted locally. The depth slider multiplies bounded scroll intensity from 0.5× to 1.25×; reduced mode always resolves spatial intensity to zero.

## X-Ray choreography

The X-Ray sequence has three phases:

1. composed forest strata;
2. exploded far / middle / near transforms with visible authored depth values;
3. recomposition before the next narrative scene.

On coarse pointers the separation is primarily vertical and lower amplitude. Reduced motion leaves the static composed view and depth legend intact.


## System scene

The System scene reveals architecture rather than adding a new motion subsystem. Its nodes and connectors use one-shot transform/opacity entrance motion. It does not introduce persistent animation, scroll hijacking, or a second timeline model. Reduced mode renders the full pipeline statically.


## Cinematic scene choreography

### Night reveal

Two decorative shutters sit above the night artwork and behind the semantic copy. Scroll moves them outward using transform/opacity only, creating an exposure-like reveal without changing the JPEG itself.

### Aurora build

Aurora ribbons keep their independent CSS drift frequencies. ScrollTrigger controls only their opacity entrance, so scroll choreography and ambient time-based drift do not compete over the same transform property.

