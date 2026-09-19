export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const PROFILE_MODES = new Set(["system", "full", "compact", "reduced"]);

function resolveMode({ reducedMotion, coarsePointer, override }) {
  if (override !== "system") return override;
  if (reducedMotion) return "reduced";
  if (coarsePointer) return "compact";
  return "full";
}

export function getMotionProfile({
  reducedMotion = false,
  coarsePointer = false,
  override = "system",
  depthScale = 1,
} = {}) {
  const safeOverride = PROFILE_MODES.has(override) ? override : "system";
  const safeDepthScale = clamp(Number(depthScale) || 1, 0.5, 1.25);
  const mode = resolveMode({ reducedMotion, coarsePointer, override: safeOverride });

  if (mode === "reduced") {
    return Object.freeze({
      mode,
      depthScale: safeDepthScale,
      scrollIntensity: 0,
      revealDistance: 0,
      pointerEnabled: false,
    });
  }

  if (mode === "compact") {
    return Object.freeze({
      mode,
      depthScale: safeDepthScale,
      scrollIntensity: 0.58 * safeDepthScale,
      revealDistance: 22,
      pointerEnabled: false,
    });
  }

  return Object.freeze({
    mode: "full",
    depthScale: safeDepthScale,
    scrollIntensity: safeDepthScale,
    revealDistance: 38,
    pointerEnabled: true,
  });
}

export function getLayerTravel(depth, intensity = 1) {
  const safeDepth = clamp(Number(depth) || 0, 0, 1);
  const safeIntensity = clamp(Number(intensity) || 0, 0, 1.25);

  // data-depth is proximity: 0 = far, 1 = near.
  // Far strata counter-scroll more, so they appear to move slower in the viewport.
  return (1 - safeDepth) * 60 * safeIntensity;
}

