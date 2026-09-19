export function initOriginalParallax({ reducedMotion = false } = {}) {
  const experience = document.querySelector("[data-original-experience]");

  if (!experience) return () => {};

  let frame = 0;
  let start = 0;
  let end = 0;

  const measure = () => {
    start = experience.offsetTop;
    end = start + experience.offsetHeight;
  };

  const render = () => {
    frame = 0;

    if (reducedMotion) {
      experience.style.setProperty("--original-scroll", "0px");
      return;
    }

    const localScroll = Math.min(Math.max(window.scrollY - start, 0), Math.max(end - start, 0));
    experience.style.setProperty("--original-scroll", `${localScroll}px`);
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
    experience.style.setProperty("--original-scroll", "0px");
  };
}
