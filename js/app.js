import { getMotionProfile } from "./motion-model.js";
import { initPointerDepth } from "./pointer-depth.js";
import { initScrollMotion } from "./motion.js";

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const coarsePointerQuery = window.matchMedia("(pointer: coarse)");

function createProfile() {
  return getMotionProfile({
    reducedMotion: reducedMotionQuery.matches,
    coarsePointer: coarsePointerQuery.matches,
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

let cleanupMotion = () => {};
let cleanupPointer = () => {};

function syncMotion() {
  cleanupMotion();
  cleanupPointer();

  const profile = createProfile();
  document.documentElement.dataset.motion = profile.mode;

  cleanupMotion = initScrollMotion(profile);
  cleanupPointer = initPointerDepth(profile);
}

function start() {
  const cleanupHeader = initHeader();
  syncMotion();

  reducedMotionQuery.addEventListener("change", syncMotion);
  coarsePointerQuery.addEventListener("change", syncMotion);

  window.addEventListener(
    "pagehide",
    () => {
      cleanupHeader();
      cleanupMotion();
      cleanupPointer();
      reducedMotionQuery.removeEventListener("change", syncMotion);
      coarsePointerQuery.removeEventListener("change", syncMotion);
    },
    { once: true },
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start, { once: true });
} else {
  start();
}
