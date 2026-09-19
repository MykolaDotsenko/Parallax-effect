export const DEFAULT_MOTION_PREFERENCES = Object.freeze({
  profile: "system",
  depthScale: 1,
});

const ALLOWED_PROFILES = new Set(["system", "full", "compact", "reduced"]);

export function normalizeMotionPreferences(value = {}) {
  const candidate = value && typeof value === "object" ? value : {};
  const profile = ALLOWED_PROFILES.has(candidate.profile) ? candidate.profile : "system";
  const numericScale = Number(candidate.depthScale);
  const depthScale = Number.isFinite(numericScale)
    ? Math.min(1.25, Math.max(0.5, numericScale))
    : 1;

  return Object.freeze({ profile, depthScale });
}

export function loadMotionPreferences(storage) {
  try {
    const target = storage ?? window.localStorage;
    const raw = target.getItem("nordic-depths:motion");
    return raw
      ? normalizeMotionPreferences(JSON.parse(raw))
      : DEFAULT_MOTION_PREFERENCES;
  } catch {
    return DEFAULT_MOTION_PREFERENCES;
  }
}

export function saveMotionPreferences(preferences, storage) {
  const normalized = normalizeMotionPreferences(preferences);

  try {
    const target = storage ?? window.localStorage;
    target.setItem("nordic-depths:motion", JSON.stringify(normalized));
  } catch {
    // Storage is optional; the preference still applies for this page lifecycle.
  }

  return normalized;
}
