import { clamp } from "./motion-model.js";

export function initPointerDepth(profile) {
  const hero = document.querySelector("[data-extension-start]");

  if (!hero || !profile.pointerEnabled) {
    return () => {};
  }

  let frame = 0;
  let latestX = 0;
  let latestY = 0;

  const render = () => {
    frame = 0;
    hero.style.setProperty("--pointer-x", `${latestX}px`);
    hero.style.setProperty("--pointer-y", `${latestY}px`);
  };

  const onPointerMove = (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;

    const scale = profile.depthScale ?? 1;
    latestX = clamp(x * 10 * scale, -6, 6);
    latestY = clamp(y * 8 * scale, -5, 5);

    if (!frame) {
      frame = window.requestAnimationFrame(render);
    }
  };

  window.addEventListener("pointermove", onPointerMove, { passive: true });

  return () => {
    window.removeEventListener("pointermove", onPointerMove);
    if (frame) window.cancelAnimationFrame(frame);
  };
}
