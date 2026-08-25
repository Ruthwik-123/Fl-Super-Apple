import assert from "node:assert/strict";
import { StoryTimeline } from "../js/story/timeline.js";
import { STORY_SHOTS } from "../js/story/shots.js";

const timeline = new StoryTimeline();
const stops = STORY_SHOTS.map((_, index) => index / (STORY_SHOTS.length - 1));
for (let sample = 0; sample <= 500; sample++) {
  const state = timeline.sample(sample / 500, stops);
  for (const vector of [state.camera, state.target, state.product]) {
    assert.ok(vector.toArray().every(Number.isFinite), "timeline vectors must remain finite");
  }
  assert.ok(Math.abs(state.quaternion.length() - 1) < 1e-5, "rotation quaternion must stay normalized");
  assert.ok(state.assembly >= 0 && state.assembly <= 1, "assembly track must remain bounded");
  assert.ok(state.optics >= 0 && state.optics <= 1, "optics track must remain bounded");
  assert.ok(state.chapter >= 0 && state.chapter < STORY_SHOTS.length, "chapter must remain valid");
}

stops.forEach((stop, index) => {
  const state = timeline.sample(stop, stops);
  assert.equal(state.chapter, index, `stop ${index} must select its chapter`);
});
console.log(`timeline: 501 interpolation samples across ${STORY_SHOTS.length} shots`);
