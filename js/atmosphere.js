import { getVelocitySignal } from "./motion-model.js";

function createQuickSetter(gsap, target, property, vars = {}) {
  if (!target) return null;

  if (typeof gsap.quickTo === "function") {
    return gsap.quickTo(target, property, {
      duration: 0.38,
      ease: "power2.out",
      ...vars,
    });
  }

  return (value) => gsap.set(target, { [property]: value });
}

export function initScrollAtmosphere(profile) {
  const { gsap, ScrollTrigger } = window;

  if (!gsap || !ScrollTrigger || profile.mode === "reduced") {
    return () => {};
  }

  gsap.registerPlugin(ScrollTrigger);

  const mistOne = document.querySelector(".mist__band--one");
  const mistTwo = document.querySelector(".mist__band--two");
  const mistOrb = document.querySelector(".mist__orb");
  const aurora = document.querySelector(".aurora");

  const setMistOneX = createQuickSetter(gsap, mistOne, "xPercent");
  const setMistTwoX = createQuickSetter(gsap, mistTwo, "xPercent");
  const setMistOrbScale = createQuickSetter(gsap, mistOrb, "scale");
  const setAuroraScale = createQuickSetter(gsap, aurora, "scale");

  const applyVelocity = (velocity) => {
    const signal = getVelocitySignal(velocity, profile.scrollIntensity);
    const energy = Math.abs(signal);

    setMistOneX?.(signal * 3.2);
    setMistTwoX?.(signal * -2.6);
    setMistOrbScale?.(1 + energy * 0.055);
    setAuroraScale?.(1 + energy * 0.014);
  };

  const trigger = ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate(self) {
      applyVelocity(self.getVelocity());
    },
  });

  const settle = () => applyVelocity(0);
  ScrollTrigger.addEventListener("scrollEnd", settle);

  return () => {
    const targets = [mistOne, mistTwo, mistOrb, aurora].filter(Boolean);

    trigger.kill();
    ScrollTrigger.removeEventListener("scrollEnd", settle);
    gsap.killTweensOf(targets);
    gsap.set(targets, {
      clearProps: "transform",
    });
  };
}
