/**
 * Declarative story shots. `camera`, `target` and `product` are authored with a
 * centred composition (x = 0); the `side` field (1 = watch right, -1 = watch
 * left, 0 = centred) drives a responsive screen offset that is resolved in the
 * Experience so the instrument never collides with the HTML copy at any size.
 */
export const STORY_SHOTS = [
  {
    id: "hero",
    camera: [0, 3, 64], target: [0, 0.5, 0], product: [0, 0, 0], rotation: [0.06, -0.38, -0.02],
    fov: 31, assembly: 0, optics: 0, finish: 0, band: 0, face: "expedition", side: 0,
    light: { key: 3.2, fill: 18, rim: 22, cool: 0.08, backdrop: 0x111315 },
  },
  {
    id: "titanium",
    camera: [0, 4.5, 58], target: [0, 0.5, 0], product: [0, 0, 0], rotation: [0.12, 0.6, 0.02],
    fov: 29, assembly: 0, optics: 0, finish: 0, band: 0, face: "expedition", side: -1,
    light: { key: 3.8, fill: 22, rim: 28, cool: 0, backdrop: 0x0d0e0f },
  },
  {
    id: "display",
    camera: [0, 1, 52], target: [0, 1, 2], product: [0, 0, 0], rotation: [0.02, -0.55, 0.01],
    fov: 28, assembly: 0, optics: 0, finish: 0, band: 0, face: "expedition", side: 1,
    light: { key: 2.25, fill: 12, rim: 18, cool: 0.18, backdrop: 0x070a0b },
  },
  {
    id: "controls",
    camera: [0, 2.5, 56], target: [0, 1, 0], product: [0, 0, 0], rotation: [0.05, 0.62, 0.01],
    fov: 28, assembly: 0, optics: 0, finish: 0, band: 0, face: "expedition", side: -1,
    light: { key: 3.35, fill: 14, rim: 32, cool: 0.04, backdrop: 0x0d0c0b },
  },
  {
    id: "optics",
    camera: [0, -1, 59], target: [0, 2, 3], product: [0, -1, 0], rotation: [0.18, -0.5, 0.05],
    fov: 29, assembly: 0, optics: 1, finish: 0.1, band: 0, face: "optics", side: 1,
    light: { key: 2.6, fill: 20, rim: 26, cool: 0.78, backdrop: 0x071319 },
  },
  {
    id: "armor",
    camera: [0, 7, 68], target: [0, 1, 0], product: [0, 0.5, 0], rotation: [0.16, 0.58, 0.04],
    fov: 30, assembly: 0, optics: 0, finish: 1, band: 2, face: "armor", side: -1,
    light: { key: 4.15, fill: 10, rim: 36, cool: 0.02, backdrop: 0x140907 },
  },
  {
    id: "cell",
    camera: [0, 4, 72], target: [0, 0, 0], product: [0, 0, 0], rotation: [0.12, -0.52, 0.02],
    fov: 31, assembly: 1, optics: 0, finish: 0.25, band: 2, face: "cell", side: 1,
    light: { key: 3.1, fill: 19, rim: 27, cool: 0.34, backdrop: 0x09110c },
  },
  {
    id: "core",
    camera: [0, -2, 58], target: [0, -1, 2], product: [0, -1, 0], rotation: [0.08, 0.5, 0],
    fov: 27, assembly: 0.88, optics: 0, finish: 0.08, band: 2, face: "core", side: -1,
    light: { key: 2.75, fill: 24, rim: 31, cool: 0.52, backdrop: 0x07110e },
  },
  {
    id: "link",
    camera: [0, 3, 60], target: [0, 0, 0], product: [0, 0, 0], rotation: [0.1, -0.48, 0.02],
    fov: 30, assembly: 0, optics: 0, finish: 0.78, band: 2, face: "link", signal: 1, side: 1,
    light: { key: 2.7, fill: 23, rim: 35, cool: 0.9, backdrop: 0x050b14 },
  },
  {
    id: "close",
    camera: [0, 3, 64], target: [0, 0, 0], product: [0, 0, 0], rotation: [0.06, -0.3, 0],
    fov: 31, assembly: 0, optics: 0, finish: 0.25, band: 0, face: "expedition", side: 0,
    light: { key: 3.4, fill: 18, rim: 25, cool: 0.08, backdrop: 0x101214 },
  },
];
