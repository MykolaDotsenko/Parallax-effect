import { initHeroParallax } from "./hero-parallax.js";
import { getMotionProfile } from "./motion-model.js";
import { loadMotionPreferences, saveMotionPreferences } from "./motion-preferences.js";
import { initMotionLab } from "./motion-lab.js";
import { initPointerDepth } from "./pointer-depth.js";
import { initSceneCompass } from "./scene-compass.js";
import { initScrollMotion } from "./motion.js";

document.documentElement.classList.add("js");

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const coarsePointerQuery = window.matchMedia("(pointer: coarse)");

let preferences = loadMotionPreferences();
let cleanupMotion = () => {};
let cleanupHeroParallax = () => {};
let cleanupPointer = () => {};
let motionLab = null;

function createProfile() {
  return getMotionProfile({
    reducedMotion: reducedMotionQuery.matches,
    coarsePointer: coarsePointerQuery.matches,
    override: preferences.profile,
    depthScale: preferences.depthScale,
  });
}

function initHeader() {
  const header = document.querySelector("[data-header]");
  if (!header) return () => {};

  const sync = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  sync();
  window.addEventListener("scroll", sync, { passive: true });

  return () => window.removeEventListener("scroll", sync);
}

function syncMotion() {
  cleanupMotion();
  cleanupHeroParallax();
  cleanupPointer();

  const profile = createProfile();
  document.documentElement.dataset.motion = profile.mode;
  document.documentElement.dataset.motionOverride = preferences.profile;

  cleanupMotion = initScrollMotion(profile);
  cleanupHeroParallax = initHeroParallax(profile);
  cleanupPointer = initPointerDepth(profile);
  motionLab?.setProfile(profile);
  motionLab?.setSystemReduced(reducedMotionQuery.matches);
}

function start() {
  const cleanupHeader = initHeader();

  motionLab = initMotionLab({
    preferences,
    systemReduced: reducedMotionQuery.matches,
    onPreferencesChange(next) {
      preferences = saveMotionPreferences(next);
      syncMotion();
    },
  });

  const cleanupCompass = initSceneCompass({
    onSceneChange(scene) {
      motionLab?.setScene(scene);
    },
  });

  syncMotion();

  const onMediaChange = () => syncMotion();
  reducedMotionQuery.addEventListener("change", onMediaChange);
  coarsePointerQuery.addEventListener("change", onMediaChange);

  window.addEventListener(
    "pagehide",
    () => {
      cleanupHeader();
      cleanupCompass();
      cleanupMotion();
      cleanupHeroParallax();
      cleanupPointer();
      motionLab?.cleanup();
      reducedMotionQuery.removeEventListener("change", onMediaChange);
      coarsePointerQuery.removeEventListener("change", onMediaChange);
    },
    { once: true },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
