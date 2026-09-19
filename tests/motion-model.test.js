import test from "node:test";
import assert from "node:assert/strict";

import { clamp, getLayerTravel, getMotionProfile } from "../js/motion-model.js";
import {
  DEFAULT_MOTION_PREFERENCES,
  normalizeMotionPreferences,
} from "../js/motion-preferences.js";

test("clamp bounds numeric values", () => {
  assert.equal(clamp(-2, 0, 1), 0);
  assert.equal(clamp(0.4, 0, 1), 0.4);
  assert.equal(clamp(5, 0, 1), 1);
});

test("reduced system motion overrides pointer capability", () => {
  const profile = getMotionProfile({ reducedMotion: true, coarsePointer: false });
  assert.equal(profile.mode, "reduced");
  assert.equal(profile.scrollIntensity, 0);
  assert.equal(profile.pointerEnabled, false);
});

test("explicit full profile can be inspected in Motion Lab", () => {
  const profile = getMotionProfile({
    reducedMotion: true,
    override: "full",
    depthScale: 1.2,
  });
  assert.equal(profile.mode, "full");
  assert.equal(profile.scrollIntensity, 1.2);
  assert.equal(profile.depthScale, 1.2);
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

test("depth intensity is bounded", () => {
  assert.equal(getMotionProfile({ depthScale: 0.1 }).depthScale, 0.5);
  assert.equal(getMotionProfile({ depthScale: 3 }).depthScale, 1.25);
});

test("far layers counter-scroll more than near layers", () => {
  assert.equal(getLayerTravel(0, 1), 12);
  assert.equal(getLayerTravel(0.5, 1), 6);
  assert.equal(getLayerTravel(1, 1), 0);
  assert.ok(getLayerTravel(0.18, 1) > getLayerTravel(0.42, 1));
  assert.ok(getLayerTravel(0.42, 1) > getLayerTravel(0.78, 1));
});

test("layer travel clamps authored proximity and intensity", () => {
  assert.equal(getLayerTravel(-1, 1), 12);
  assert.equal(getLayerTravel(4, 1), 0);
  assert.equal(getLayerTravel(0, 0.5), 6);
  assert.equal(getLayerTravel(0, 1.25), 15);
});

test("motion preferences normalize unknown persisted values", () => {
  assert.deepEqual(normalizeMotionPreferences({ profile: "wild", depthScale: 4 }), {
    profile: "system",
    depthScale: 1.25,
  });
  assert.deepEqual(normalizeMotionPreferences(), DEFAULT_MOTION_PREFERENCES);
  assert.deepEqual(normalizeMotionPreferences(null), DEFAULT_MOTION_PREFERENCES);
});

