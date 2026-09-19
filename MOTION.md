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

The pure motion model clamps depth to `0..1` before calculating travel. Authored configuration therefore cannot accidentally create unbounded movement.

## Animation constraints

Scroll-linked animation is restricted to compositor-friendly properties:

- transform
- opacity

Pointer input updates CSS custom properties through one coalesced animation-frame callback.

## Why native scroll

The browser remains the only scroll authority. This preserves predictable anchor navigation, keyboard behavior, platform momentum, and browser accessibility semantics.

## Why GSAP

ScrollTrigger is used where scroll-linked sequencing provides real value:

- layered hero depth;
- hero copy fade/travel;
- night image drift;
- one-shot content reveals.

The rest of the visual system is CSS.

## Cleanup

Every adapter returns a cleanup function. The composition root runs cleanup before changing motion profiles and on `pagehide`, preventing duplicate listeners and timelines.
