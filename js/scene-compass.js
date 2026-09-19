function getDocumentProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

export function initSceneCompass({ onSceneChange = () => {} } = {}) {
  const scenes = Array.from(document.querySelectorAll("[data-scene][id]"));
  const links = Array.from(document.querySelectorAll("[data-scene-link]"));
  const progressBar = document.querySelector("[data-document-progress]");

  if (!scenes.length) return () => {};

  let currentId = scenes[0].id;
  let frame = 0;

  const setActive = (scene) => {
    if (!scene || scene.id === currentId) return;
    currentId = scene.id;

    links.forEach((link) => {
      if (link.dataset.sceneLink === currentId) {
        link.setAttribute("aria-current", "step");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    onSceneChange(scene.dataset.sceneLabel || scene.id);
  };

  const updateProgress = () => {
    frame = 0;
    if (progressBar) {
      progressBar.style.transform = `scaleX(${getDocumentProgress()})`;
    }
  };

  const onScroll = () => {
    if (!frame) frame = window.requestAnimationFrame(updateProgress);
  };

  const observer =
    "IntersectionObserver" in window
      ? new IntersectionObserver(
          (entries) => {
            const visible = entries
              .filter((entry) => entry.isIntersecting)
              .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (visible) setActive(visible.target);
          },
          {
            rootMargin: "-32% 0px -48% 0px",
            threshold: [0, 0.15, 0.35, 0.6],
          },
        )
      : null;

  scenes.forEach((scene) => observer?.observe(scene));
  window.addEventListener("scroll", onScroll, { passive: true });
  updateProgress();
  onSceneChange(scenes[0].dataset.sceneLabel || scenes[0].id);

  return () => {
    observer?.disconnect();
    window.removeEventListener("scroll", onScroll);
    if (frame) window.cancelAnimationFrame(frame);
  };
}
