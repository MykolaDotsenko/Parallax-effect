import test from "node:test";
import assert from "node:assert/strict";

import { clamp, getLayerTravel, getMotionProfile } from "../js/motion-model.js";

test("clamp bounds numeric values", () => {
  assert.equal(clamp(-2, 0, 1), 0);
  assert.equal(clamp(0.4, 0, 1), 0.4);
  assert.equal(clamp(5, 0, 1), 1);
});

test("reduced motion overrides pointer capability", () => {
  const profile = getMotionProfile({ reducedMotion: true, coarsePointer: false });
  assert.equal(profile.mode, "reduced");
  assert.equal(profile.scrollIntensity, 0);
  assert.equal(profile.pointerEnabled, false);
});

test("coarse pointer receives compact motion", () => {
  const profile = getMotionProfile({ coarsePointer: true });
  assert.equal(profile.mode, "compact");
  assert.equal(profile.scrollIntensity, 0.58);
  assert.equal(profile.pointerEnabled, false);
});

test("fine pointer receives full motion", () => {
  const profile = getMotionProfile();
  assert.equal(profile.mode, "full");
  assert.equal(profile.scrollIntensity, 1);
  assert.equal(profile.pointerEnabled, true);
});

test("layer travel clamps authored depth and intensity", () => {
  assert.equal(getLayerTravel(-1, 1), 0);
  assert.equal(getLayerTravel(0.5, 1), 11);
  assert.equal(getLayerTravel(4, 1), 22);
  assert.equal(getLayerTravel(1, 0.5), 11);
});
