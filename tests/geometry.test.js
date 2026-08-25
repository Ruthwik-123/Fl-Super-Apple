import assert from "node:assert/strict";
import { BandGeometry, roundedPlane, roundedRing } from "../js/product/geometry.js";

const geometries = [
  roundedRing({ width: 45, height: 50, radius: 7.2, innerWidth: 38.7, innerHeight: 43.5, innerRadius: 5.1, depth: 10, bevel: 0.62, segments: 4 }),
  roundedPlane(39.35, 43.85, 5.15, 14),
  new BandGeometry(1),
  new BandGeometry(-1, { length: 42 }),
];

let triangles = 0;
for (const geometry of geometries) {
  const positions = geometry.getAttribute("position");
  assert.ok(positions.count > 0, "geometry must contain vertices");
  for (const value of positions.array) assert.ok(Number.isFinite(value), "vertices must be finite");
  triangles += geometry.index ? geometry.index.count / 3 : positions.count / 3;
  geometry.dispose();
}

assert.ok(triangles < 5000, `core reusable geometry exceeded its triangle budget: ${triangles}`);
console.log(`geometry: ${Math.round(triangles)} reusable triangles, all finite`);
