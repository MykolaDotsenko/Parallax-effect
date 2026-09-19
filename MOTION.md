# Motion system

## Two motion contracts

Nordic Depths intentionally does not force the 2023 original and the modern extension through one abstraction.

## 1. Preserved original

The original forest uses the historical CSS ratios from the 2023 repository.

```text
far/base       scrollTop / 1.6
middle         scrollTop / 2.5
near/front     scrollTop / 5.7
hero copy      scrollTop / 2
dungeon copy   scrollTop / -7.5
```

These values are literal product requirements.

`original-parallax.js` only supplies the scoped `--original-scroll` value from native browser scroll. CSS performs the same transforms the original project used.

The old ScrollSmoother runtime is intentionally not restored. Native browser scroll provides the position directly, while the original 0.75s transform transition retains the characteristic eased response.

### Reduced motion

When `prefers-reduced-motion: reduce` matches:

- `--original-scroll` remains `0px`;
- original spatial transforms are neutralized by CSS;
- all original text remains available.

Motion Lab cannot override this historical subsystem.

## 2. Nordic Depths extension

### Full

Fine pointer + normal system motion:

- complete extension choreography;
- 38px maximum reveal distance;
- pointer glow enabled;
- full bounded intensity.

### Compact

Coarse pointer:

- intensity reduced to 58%;
- reveal distance reduced to 22px;
- pointer glow disabled.

### Reduced

Reduced-motion preference:

- extension spatial choreography disabled;
- pointer glow disabled;
- semantic reading order unchanged.

Motion Lab can explicitly inspect extension profiles, but those overrides never alter the preserved original.

## X-Ray

The X-Ray scene uses the same three forest assets and labels their historical divisors:

- Far — `÷1.6`
- Middle — `÷2.5`
- Near — `÷5.7`

The scene then separates and recomposes those layers using transform/opacity-only GSAP choreography.

## Night

Night uses transform/opacity-only drift and shutters. It remains secondary to scroll and never becomes a custom scroll source.

## System

The System scene visualizes the **extension** dependency chain:

```text
system + Motion Lab preferences
            ↓
      pure motion profile
            ↓
   GSAP / pointer adapters
            ↓
        semantic DOM
```

It does not describe or mutate the historical subsystem.

## Aurora

Aurora uses CSS drift plus ScrollTrigger-controlled opacity build. The two systems do not compete over the same transform property.

## Cleanup

Every modern adapter returns cleanup. The preserved original adapter also has explicit cleanup.

This prevents duplicate listeners when system preferences or Motion Lab state change.

## Constraint

Native browser scrolling is authoritative everywhere.

The project contains no runtime ScrollSmoother, no custom momentum layer, and no scroll hijacking.
