export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function getMotionProfile({ reducedMotion = false, coarsePointer = false } = {}) {
  if (reducedMotion) {
    return Object.freeze({
      mode: "reduced",
      scrollIntensity: 0,
      revealDistance: 0,
      pointerEnabled: false,
    });
  }

  if (coarsePointer) {
    return Object.freeze({
      mode: "compact",
      scrollIntensity: 0.58,
      revealDistance: 22,
      pointerEnabled: false,
    });
  }

  return Object.freeze({
    mode: "full",
    scrollIntensity: 1,
    revealDistance: 38,
    pointerEnabled: true,
  });
}

export function getLayerTravel(depth, intensity = 1) {
  const safeDepth = clamp(Number(depth) || 0, 0, 1);
  const safeIntensity = clamp(Number(intensity) || 0, 0, 1);
  return safeDepth * 22 * safeIntensity;
}
