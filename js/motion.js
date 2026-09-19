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

    const xray = document.querySelector('[data-scene="xray"]');
    if (xray) {
      const far = xray.querySelector('[data-xray-layer="far"]');
      const mid = xray.querySelector('[data-xray-layer="mid"]');
      const near = xray.querySelector('[data-xray-layer="near"]');
      const specs = xray.querySelectorAll("[data-xray-spec]");
      const compact = profile.mode === "compact";

      const xrayTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: xray,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      });

      xrayTimeline
        .to(
          far,
          {
            xPercent: compact ? -10 : -48,
            yPercent: compact ? -16 : -4,
            scale: compact ? 0.78 : 0.68,
            rotation: compact ? -0.5 : -1.4,
            ease: "power2.inOut",
          },
          0,
        )
        .to(mid, { scale: compact ? 0.8 : 0.72, ease: "power2.inOut" }, 0)
        .to(
          near,
          {
            xPercent: compact ? 10 : 48,
            yPercent: compact ? 16 : 4,
            scale: compact ? 0.78 : 0.68,
            rotation: compact ? 0.5 : 1.4,
            ease: "power2.inOut",
          },
          0,
        )
        .fromTo(
          specs,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, stagger: 0.04, duration: 0.16, ease: "power2.out" },
          0.12,
        )
        .to(
          [far, mid, near],
          {
            xPercent: 0,
            yPercent: 0,
            scale: 1,
            rotation: 0,
            duration: 0.34,
            ease: "power2.inOut",
          },
          0.66,
        )
        .to(specs, { opacity: 0.72, duration: 0.2 }, 0.72);
    }

    const systemScene = document.querySelector('[data-scene="system"]');
    if (systemScene) {
      const systemNodes = systemScene.querySelectorAll("[data-system-node]");
      const systemConnectors = systemScene.querySelectorAll("[data-system-connector]");

      gsap.from(systemNodes, {
        y: Math.min(profile.revealDistance, 26),
        opacity: 0,
        duration: 0.72,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: {
          trigger: systemScene,
          start: "top 64%",
          once: true,
        },
      });

      gsap.from(systemConnectors, {
        scaleY: 0,
        opacity: 0,
        duration: 0.34,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: systemScene,
          start: "top 58%",
          once: true,
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
        opacity: 0,
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
