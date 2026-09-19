import { clamp, getLayerTravel } from "./motion-model.js";

const LAYER_SCALE = 1.035;
const FOREGROUND_START = 28;
const FOREGROUND_TRAVEL = 26;

export function initHeroParallax(profile) {
  const hero = document.querySelector('[data-scene="forest"]');
  const viewport = hero?.querySelector("[data-hero-viewport]");
  const layers = Array.from(hero?.querySelectorAll("[data-parallax-layer]") ?? []);
  const foreground = hero?.querySelector("[data-parallax-foreground]");
  const copy = hero?.querySelector("[data-hero-copy]");
  const cue = hero?.querySelector("[data-parallax-cue]");

  const reset = () => {
    layers.forEach((layer) => layer.style.removeProperty("transform"));
    foreground?.style.removeProperty("transform");
    copy?.style.removeProperty("transform");
    copy?.style.removeProperty("opacity");
    cue?.style.removeProperty("opacity");
    cue?.style.removeProperty("pointer-events");
  };

  if (!hero || !viewport || !layers.length || profile.mode === "reduced") {
    reset();
    return () => {};
  }

  let start = 0;
  let range = 1;
  let frame = 0;

  const measure = () => {
    start = hero.offsetTop;
    range = Math.max(hero.offsetHeight - viewport.offsetHeight, 1);
  };

  const render = () => {
    frame = 0;
    const progress = clamp((window.scrollY - start) / range, 0, 1);

    layers.forEach((layer) => {
      const travel = getLayerTravel(layer.dataset.depth, profile.scrollIntensity);
      layer.style.transform =
        `translate3d(0, ${travel * progress}%, 0) scale(${LAYER_SCALE})`;
    });

    if (foreground) {
      const foregroundY =
        FOREGROUND_START - FOREGROUND_TRAVEL * profile.scrollIntensity * progress;
      foreground.style.transform =
        `translate3d(-4%, ${foregroundY}%, 0) scale(${1.02 + progress * 0.02})`;
    }

    if (copy) {
      copy.style.transform = `translate3d(0, ${progress * 18}px, 0)`;
      copy.style.opacity = String(1 - progress * 0.68);
    }

    if (cue) {
      const cueOpacity = clamp(1 - progress * 2.4, 0, 1);
      cue.style.opacity = String(cueOpacity);
      cue.style.pointerEvents = cueOpacity < 0.15 ? "none" : "";
    }
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
  document.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });

  return () => {
    window.removeEventListener("scroll", schedule);
    document.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", onResize);
    if (frame) window.cancelAnimationFrame(frame);
    reset();
  };
}
