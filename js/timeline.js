export const keyframes = [
  {
    t: 0,
    chapter: 0,
    cam: { x: 8, y: 10, z: 118 },
    target: { x: 10, y: 0, z: 0 },
    rot: { x: 0.16, y: -0.42, z: 0.05 },
    pos: { x: 10, y: 0, z: 0 },
    explode: 0,
    finish: 0,
    band: 0,
    bright: 0.7,
    face: "wayfinder",
    env: "studio",
  },
  {
    t: 0.08,
    chapter: 0,
    cam: { x: 6, y: 8, z: 108 },
    target: { x: 8, y: 0, z: 0 },
    rot: { x: 0.1, y: 0.15, z: 0 },
    pos: { x: 10, y: 0, z: 0 },
    explode: 0,
    finish: 0,
    band: 0,
    bright: 0.85,
    face: "wayfinder",
    env: "studio",
  },
  {
    t: 0.18,
    chapter: 1,
    cam: { x: -10, y: 14, z: 90 },
    target: { x: 8, y: 0, z: 0 },
    rot: { x: 0.28, y: 2.55, z: 0.08 },
    pos: { x: 12, y: 0, z: 0 },
    explode: 0,
    finish: 0,
    band: 0,
    bright: 0.6,
    face: "wayfinder",
    env: "studio",
  },
  {
    t: 0.3,
    chapter: 2,
    cam: { x: 4, y: 2, z: 52 },
    target: { x: 6, y: 1, z: 5 },
    rot: { x: 0.02, y: 0.04, z: 0 },
    pos: { x: 10, y: 0, z: 0 },
    explode: 0,
    finish: 0,
    band: 0,
    bright: 1,
    face: "wayfinder",
    env: "bright",
  },
  {
    t: 0.4,
    chapter: 3,
    cam: { x: -70, y: 8, z: 36 },
    target: { x: 0, y: 2, z: 0 },
    rot: { x: 0.05, y: 1.25, z: 0 },
    pos: { x: 6, y: 0, z: 0 },
    explode: 0,
    finish: 0,
    band: 0,
    bright: 0.7,
    face: "run",
    env: "studio",
  },
  {
    t: 0.52,
    chapter: 4,
    cam: { x: 18, y: -6, z: 95 },
    target: { x: 4, y: -4, z: 0 },
    rot: { x: 0.55, y: -0.7, z: 0.2 },
    pos: { x: 8, y: -4, z: 0 },
    explode: 0,
    finish: 0,
    band: 0,
    bright: 0.9,
    face: "dive",
    env: "underwater",
  },
  {
    t: 0.63,
    chapter: 5,
    cam: { x: 30, y: 40, z: 130 },
    target: { x: 0, y: 4, z: 0 },
    rot: { x: 0.35, y: 2.4, z: 0.1 },
    pos: { x: 0, y: 2, z: 0 },
    explode: 0,
    finish: 1,
    band: 2,
    bright: 1,
    face: "satellite",
    env: "night",
  },
  {
    t: 0.74,
    chapter: 6,
    cam: { x: 20, y: 8, z: 100 },
    target: { x: 0, y: 0, z: 0 },
    rot: { x: 0.12, y: 0.35, z: 0 },
    pos: { x: 8, y: 0, z: 0 },
    explode: 1,
    finish: 0,
    band: 0,
    bright: 0.5,
    face: "battery",
    env: "studio",
  },
  {
    t: 0.84,
    chapter: 7,
    cam: { x: 8, y: 6, z: 120 },
    target: { x: 6, y: -8, z: 10 },
    rot: { x: 0.2, y: -0.5, z: 0 },
    pos: { x: 10, y: -2, z: 0 },
    explode: 0,
    finish: 0,
    band: 1,
    bright: 0.75,
    face: "run",
    env: "studio",
  },
  {
    t: 0.92,
    chapter: 8,
    cam: { x: 16, y: 10, z: 100 },
    target: { x: 8, y: 0, z: 0 },
    rot: { x: 0.18, y: 0.55, z: 0.04 },
    pos: { x: 10, y: 0, z: 0 },
    explode: 0,
    finish: 1,
    band: 2,
    bright: 0.8,
    face: "sleep",
    env: "studio",
  },
  {
    t: 1,
    chapter: 9,
    cam: { x: 0, y: 8, z: 125 },
    target: { x: 0, y: 0, z: 0 },
    rot: { x: 0.12, y: -0.28, z: 0 },
    pos: { x: 0, y: 0, z: 0 },
    explode: 0,
    finish: 0.35,
    band: 0,
    bright: 0.9,
    face: "wayfinder",
    env: "studio",
  },
];

export function sampleTimeline(p) {
  const frames = keyframes;
  const t = Math.min(1, Math.max(0, p));
  let i = 0;
  while (i < frames.length - 1 && frames[i + 1].t < t) i++;
  const a = frames[i];
  const b = frames[Math.min(i + 1, frames.length - 1)];
  const span = b.t - a.t || 1;
  const k = smooth((t - a.t) / span);
  return {
    cam: lerpVec(a.cam, b.cam, k),
    target: lerpVec(a.target, b.target, k),
    rot: lerpVec(a.rot, b.rot, k),
    pos: lerpVec(a.pos, b.pos, k),
    explode: lerp(a.explode, b.explode, k),
    finish: lerp(a.finish, b.finish, k),
    band: lerp(a.band, b.band, k),
    bright: lerp(a.bright, b.bright, k),
    face: k > 0.5 ? b.face : a.face,
    env: k > 0.45 ? b.env : a.env,
    chapter: k > 0.5 ? b.chapter : a.chapter,
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpVec(a, b, t) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  };
}

function smooth(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}
