import { clamp, getLayerTravel } from "./motion-model.js";

export function initHeroParallax(profile) {
  const hero = document.querySelector('[data-scene="forest"]');
  const layers = Array.from(document.querySelectorAll("[data-parallax-layer]"));

  if (!hero || !layers.length || profile.mode === "reduced") {
    layers.forEach((layer) => layer.style.setProperty("--parallax-y", "0%"));
    return () => {};
  }

  let start = 0;
  let range = 1;
  let frame = 0;

  const measure = () => {
    start = hero.offsetTop;
    range = Math.max(hero.offsetHeight, 1);
  };

  const render = () => {
    frame = 0;
    const progress = clamp((window.scrollY - start) / range, 0, 1);

    layers.forEach((layer) => {
      const travel = getLayerTravel(layer.dataset.depth, profile.scrollIntensity);
      layer.style.setProperty("--parallax-y", `${travel * progress}%`);
    });
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
    layers.forEach((layer) => layer.style.setProperty("--parallax-y", "0%"));
  };
}
