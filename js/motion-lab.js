import {
  DEFAULT_MOTION_PREFERENCES,
  normalizeMotionPreferences,
} from "./motion-preferences.js";

export function initMotionLab({
  preferences = DEFAULT_MOTION_PREFERENCES,
  systemReduced = false,
  onPreferencesChange = () => {},
} = {}) {
  const toggle = document.querySelector("[data-motion-lab-toggle]");
  const dialog = document.querySelector("[data-motion-lab]");
  if (!toggle || !dialog || typeof dialog.showModal !== "function") {
    return {
      cleanup: () => {},
      setProfile: () => {},
      setScene: () => {},
      setSystemReduced: () => {},
    };
  }

  const close = dialog.querySelector("[data-motion-lab-close]");
  const reset = dialog.querySelector("[data-motion-lab-reset]");
  const radios = Array.from(dialog.querySelectorAll('input[name="motion-profile"]'));
  const depth = dialog.querySelector("[data-depth-control]");
  const depthOutput = dialog.querySelector("[data-depth-output]");
  const profileReadout = dialog.querySelector("[data-profile-readout]");
  const systemReadout = dialog.querySelector("[data-system-motion-readout]");
  const sceneReadout = dialog.querySelector("[data-scene-readout]");
  const velocityReadout = dialog.querySelector("[data-velocity-readout]");

  let current = normalizeMotionPreferences(preferences);
  let lastY = window.scrollY;
  let lastTime = performance.now();
  let smoothedVelocity = 0;
  let velocityFrame = 0;

  const syncControls = () => {
    radios.forEach((radio) => {
      radio.checked = radio.value === current.profile;
    });

    if (depth) depth.value = String(Math.round(current.depthScale * 100));
    if (depthOutput) depthOutput.value = `${Math.round(current.depthScale * 100)}%`;
  };

  const apply = (next) => {
    current = normalizeMotionPreferences({ ...current, ...next });
    syncControls();
    onPreferencesChange(current);
  };

  const openDialog = () => {
    dialog.hidden = false;
    dialog.showModal();
    toggle.setAttribute("aria-expanded", "true");
  };

  const closeDialog = () => {
    dialog.close();
    toggle.setAttribute("aria-expanded", "false");
  };

  const onRadioChange = (event) => {
    if (event.target instanceof HTMLInputElement && event.target.checked) {
      apply({ profile: event.target.value });
    }
  };

  const onDepthInput = () => {
    if (depthOutput && depth) depthOutput.value = `${depth.value}%`;
  };

  const onDepthChange = () => {
    if (depth) apply({ depthScale: Number(depth.value) / 100 });
  };

  const onReset = () => apply(DEFAULT_MOTION_PREFERENCES);

  const updateVelocity = () => {
    velocityFrame = 0;
    const now = performance.now();
    const elapsed = Math.max(16, now - lastTime);
    const raw = ((window.scrollY - lastY) / elapsed) * 1000;
    smoothedVelocity += (raw - smoothedVelocity) * 0.28;
    lastY = window.scrollY;
    lastTime = now;

    if (velocityReadout) {
      const rounded = Math.round(smoothedVelocity);
      velocityReadout.textContent = `${rounded > 0 ? "+" : ""}${rounded} px/s`;
    }
  };

  const onScroll = () => {
    if (!velocityFrame) velocityFrame = window.requestAnimationFrame(updateVelocity);
  };

  toggle.hidden = false;
  dialog.hidden = false;
  syncControls();

  toggle.addEventListener("click", openDialog);
  close?.addEventListener("click", closeDialog);
  reset?.addEventListener("click", onReset);
  radios.forEach((radio) => radio.addEventListener("change", onRadioChange));
  depth?.addEventListener("input", onDepthInput);
  depth?.addEventListener("change", onDepthChange);
  window.addEventListener("scroll", onScroll, { passive: true });

  return {
    cleanup() {
      toggle.removeEventListener("click", openDialog);
      close?.removeEventListener("click", closeDialog);
      reset?.removeEventListener("click", onReset);
      radios.forEach((radio) => radio.removeEventListener("change", onRadioChange));
      depth?.removeEventListener("input", onDepthInput);
      depth?.removeEventListener("change", onDepthChange);
      window.removeEventListener("scroll", onScroll);
      if (velocityFrame) window.cancelAnimationFrame(velocityFrame);
      if (dialog.open) dialog.close();
    },
    setProfile(profile) {
      if (profileReadout) {
        profileReadout.textContent =
          profile.mode.charAt(0).toUpperCase() + profile.mode.slice(1);
      }
    },
    setScene(scene) {
      if (sceneReadout) sceneReadout.textContent = scene;
    },
    setSystemReduced(reduced) {
      if (systemReadout) systemReadout.textContent = reduced ? "On" : "Off";
    },
  };
}
