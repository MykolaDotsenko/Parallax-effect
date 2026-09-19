export const DEFAULT_MOTION_PREFERENCES = Object.freeze({
  profile: "system",
  depthScale: 1,
});

const ALLOWED_PROFILES = new Set(["system", "full", "compact", "reduced"]);

export function normalizeMotionPreferences(value = {}) {
  const profile = ALLOWED_PROFILES.has(value.profile) ? value.profile : "system";
  const numericScale = Number(value.depthScale);
  const depthScale = Number.isFinite(numericScale)
    ? Math.min(1.25, Math.max(0.5, numericScale))
    : 1;

  return Object.freeze({ profile, depthScale });
}

export function loadMotionPreferences(storage = window.localStorage) {
  try {
    const raw = storage.getItem("nordic-depths:motion");
    return raw
      ? normalizeMotionPreferences(JSON.parse(raw))
      : DEFAULT_MOTION_PREFERENCES;
  } catch {
    return DEFAULT_MOTION_PREFERENCES;
  }
}

export function saveMotionPreferences(preferences, storage = window.localStorage) {
  const normalized = normalizeMotionPreferences(preferences);

  try {
    storage.setItem("nordic-depths:motion", JSON.stringify(normalized));
  } catch {
    // Storage is an optional enhancement; the live preference still applies.
  }

  return normalized;
}
