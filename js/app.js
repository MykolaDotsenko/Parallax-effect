import { initOriginalParallax } from "./original-parallax.js";
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
let cleanupOriginalParallax = () => {};
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

function initExtensionChrome() {
  const extension = document.querySelector("[data-extension-start]");
  if (!extension) return () => {};

  let frame = 0;
  let threshold = 0;

  const measure = () => {
    threshold = Math.max(0, extension.offsetTop - window.innerHeight * 0.32);
  };

  const render = () => {
    frame = 0;
    document.body.classList.toggle("extension-active", window.scrollY >= threshold);
  };

  const schedule = () => {
    if (!frame) frame = window.requestAnimationFrame(render);
  };

  const onResize = () => {
    measure();
    schedule();
  };

  measure();
  render();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });

  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", onResize);
    if (frame) window.cancelAnimationFrame(frame);
    document.body.classList.remove("extension-active");
  };
}

function syncOriginalParallax() {
  cleanupOriginalParallax();
  cleanupOriginalParallax = initOriginalParallax({
    reducedMotion: reducedMotionQuery.matches,
  });
}

function syncMotion() {
  cleanupMotion();
  cleanupPointer();

  const profile = createProfile();
  document.documentElement.dataset.motion = profile.mode;
  document.documentElement.dataset.motionOverride = preferences.profile;

  cleanupMotion = initScrollMotion(profile);
  cleanupPointer = initPointerDepth(profile);
  motionLab?.setProfile(profile);
  motionLab?.setSystemReduced(reducedMotionQuery.matches);
}

function start() {
  const cleanupHeader = initHeader();
  const cleanupExtensionChrome = initExtensionChrome();
  syncOriginalParallax();

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

  const onReducedMotionChange = () => {
    syncOriginalParallax();
    syncMotion();
  };
  const onPointerChange = () => syncMotion();

  reducedMotionQuery.addEventListener("change", onReducedMotionChange);
  coarsePointerQuery.addEventListener("change", onPointerChange);

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
