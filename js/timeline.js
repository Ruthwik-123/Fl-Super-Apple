export const keyframes = [
  {
    t: 0,
    chapter: 0,
    cam: { x: 6, y: 4, z: 78 },
    target: { x: 4, y: 0, z: 0 },
    rot: { x: 0.12, y: -0.35, z: 0.03 },
    pos: { x: 6, y: 0, z: 0 },
    explode: 0,
    finish: 0,
    band: 0,
    face: "wayfinder",
    env: "studio",
  },
  {
    t: 0.08,
    chapter: 0,
    cam: { x: 5, y: 3, z: 72 },
    target: { x: 4, y: 0, z: 0 },
    rot: { x: 0.08, y: 0.12, z: 0 },
    pos: { x: 6, y: 0, z: 0 },
    explode: 0,
    finish: 0,
    band: 0,
    face: "wayfinder",
    env: "studio",
  },
  {
    t: 0.18,
    chapter: 1,
    cam: { x: 2, y: 6, z: 80 },
    target: { x: 5, y: 0, z: 0 },
    rot: { x: 0.18, y: 2.4, z: 0.04 },
    pos: { x: 6, y: 0, z: 0 },
    explode: 0,
    finish: 0,
    band: 0,
    face: "wayfinder",
    env: "studio",
  },
  {
    t: 0.3,
    chapter: 2,
    cam: { x: 4, y: 1, z: 68 },
    target: { x: 5, y: 0.5, z: 2 },
    rot: { x: 0.02, y: 0.06, z: 0 },
    pos: { x: 6, y: 0, z: 0 },
    explode: 0,
    finish: 0,
    band: 0,
    face: "wayfinder",
    env: "bright",
  },
  {
    t: 0.4,
    chapter: 3,
    cam: { x: -28, y: 3, z: 70 },
    target: { x: 2, y: 1, z: 0 },
    rot: { x: 0.04, y: 1.2, z: 0 },
    pos: { x: 4, y: 0, z: 0 },
    explode: 0,
    finish: 0,
    band: 0,
    face: "wayfinder",
    env: "studio",
  },
  {
    t: 0.52,
    chapter: 4,
    cam: { x: 8, y: -2, z: 78 },
    target: { x: 4, y: -1, z: 0 },
    rot: { x: 0.4, y: -0.55, z: 0.12 },
    pos: { x: 5, y: -1, z: 0 },
    explode: 0,
    finish: 0,
    band: 0,
    face: "optics",
    env: "underwater",
  },
  {
    t: 0.63,
    chapter: 5,
    cam: { x: 10, y: 10, z: 88 },
    target: { x: 2, y: 1, z: 0 },
    rot: { x: 0.22, y: 2.2, z: 0.06 },
    pos: { x: 2, y: 1, z: 0 },
    explode: 0,
    finish: 1,
    band: 2,
    face: "armor",
    env: "night",
  },
  {
    t: 0.74,
    chapter: 6,
    cam: { x: 8, y: 3, z: 82 },
    target: { x: 3, y: 0, z: 0 },
    rot: { x: 0.1, y: 0.3, z: 0 },
    pos: { x: 5, y: 0, z: 0 },
    explode: 1,
    finish: 0,
    band: 0,
    face: "cell",
    env: "studio",
  },
  {
    t: 0.84,
    chapter: 7,
    cam: { x: 6, y: 2, z: 80 },
    target: { x: 4, y: -2, z: 2 },
    rot: { x: 0.16, y: -0.4, z: 0 },
    pos: { x: 6, y: -1, z: 0 },
    explode: 0,
    finish: 0,
    band: 1,
    face: "core",
    env: "studio",
  },
  {
    t: 0.92,
    chapter: 8,
    cam: { x: 8, y: 4, z: 76 },
    target: { x: 5, y: 0, z: 0 },
    rot: { x: 0.14, y: 0.5, z: 0.03 },
    pos: { x: 6, y: 0, z: 0 },
    explode: 0,
    finish: 1,
    band: 2,
    face: "sleep",
    env: "studio",
  },
  {
    t: 1,
    chapter: 9,
    cam: { x: 0, y: 3, z: 82 },
    target: { x: 0, y: 0, z: 0 },
    rot: { x: 0.1, y: -0.22, z: 0 },
    pos: { x: 0, y: 0, z: 0 },
    explode: 0,
    finish: 0.35,
    band: 0,
    face: "wayfinder",
    env: "studio",
  },
];

export function sampleTimeline(p) {
  const frames = keyframes;
  const t = p < 0 ? 0 : p > 1 ? 1 : p;
  let i = 0;
  while (i < frames.length - 1 && frames[i + 1].t < t) i++;
  const a = frames[i];
  const b = frames[i + 1] || a;
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
    face: k > 0.5 ? b.face : a.face,
    env: k > 0.45 ? b.env : a.env,
    chapter: k > 0.5 ? b.chapter : a.chapter,
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpVec(a, b, t) {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), z: lerp(a.z, b.z, t) };
}

function smooth(t) {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  return x * x * (3 - 2 * x);
}
