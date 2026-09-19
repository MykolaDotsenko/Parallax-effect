import { getLayerTravel } from "./motion-model.js";

export function initScrollMotion(profile) {
  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger || profile.mode === "reduced") {
    return () => {};
  }

  gsap.registerPlugin(ScrollTrigger);
  const context = gsap.context(() => {
    const hero = document.querySelector('[data-scene="forest"]');

    document.querySelectorAll("[data-parallax-layer]").forEach((layer) => {
      const travel = getLayerTravel(layer.dataset.depth, profile.scrollIntensity);

      gsap.to(layer, {
        yPercent: travel,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    });

    const heroCopy = document.querySelector("[data-hero-copy]");
    if (heroCopy) {
      gsap.to(heroCopy, {
        yPercent: 14 * profile.scrollIntensity,
        autoAlpha: 0.2,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "80% top",
          scrub: true,
        },
      });
    }

    const nightImage = document.querySelector("[data-night-image]");
    if (nightImage) {
      gsap.fromTo(
        nightImage,
        { yPercent: -3, scale: 1.04 },
        {
          yPercent: 5 * profile.scrollIntensity,
          scale: 1.1,
          ease: "none",
          scrollTrigger: {
            trigger: nightImage.closest(".scene"),
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }

    document.querySelectorAll("[data-reveal]").forEach((element) => {
      gsap.from(element, {
        y: profile.revealDistance,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: element,
          start: "top 88%",
          once: true,
        },
      });
    });
  });

  return () => {
    context.revert();
  };
}
