import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export function roundedBox(width, height, depth, radius = 1, segments = 4) {
  const geometry = new RoundedBoxGeometry(width, height, depth, segments, radius);
  geometry.computeVertexNormals();
  return geometry;
}

function roundedRectPath(path, width, height, radius, clockwise = false) {
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);

  if (!clockwise) {
    path.moveTo(x + r, y);
    path.lineTo(x + width - r, y);
    path.quadraticCurveTo(x + width, y, x + width, y + r);
    path.lineTo(x + width, y + height - r);
    path.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    path.lineTo(x + r, y + height);
    path.quadraticCurveTo(x, y + height, x, y + height - r);
    path.lineTo(x, y + r);
    path.quadraticCurveTo(x, y, x + r, y);
  } else {
    path.moveTo(x + r, y);
    path.quadraticCurveTo(x, y, x, y + r);
    path.lineTo(x, y + height - r);
    path.quadraticCurveTo(x, y + height, x + r, y + height);
    path.lineTo(x + width - r, y + height);
    path.quadraticCurveTo(x + width, y + height, x + width, y + height - r);
    path.lineTo(x + width, y + r);
    path.quadraticCurveTo(x + width, y, x + width - r, y);
    path.lineTo(x + r, y);
  }
}

export function roundedPlane(width, height, radius, curveSegments = 10) {
  const shape = new THREE.Shape();
  roundedRectPath(shape, width, height, radius);
  const geometry = new THREE.ShapeGeometry(shape, curveSegments);
  geometry.computeVertexNormals();
  return geometry;
}

export function roundedRing({
  width,
  height,
  radius,
  innerWidth,
  innerHeight,
  innerRadius,
  depth,
  bevel = 0.35,
  segments = 3,
}) {
  const shape = new THREE.Shape();
  roundedRectPath(shape, width, height, radius);
  const hole = new THREE.Path();
  roundedRectPath(hole, innerWidth, innerHeight, innerRadius, true);
  shape.holes.push(hole);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    curveSegments: 10,
    bevelEnabled: bevel > 0,
    bevelSegments: segments,
    bevelSize: bevel,
    bevelThickness: bevel,
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return geometry;
}

/** Curved tapered strap with a rounded rectangular cross section. */
export class BandGeometry extends THREE.BufferGeometry {
  constructor(sign = 1, options = {}) {
    super();
    const length = options.length ?? 38;
    const startY = options.startY ?? 25;
    const startWidth = options.startWidth ?? 19;
    const endWidth = options.endWidth ?? 14;
    const thickness = options.thickness ?? 2.8;
    const bend = options.bend ?? 18;
    const pathSegments = options.pathSegments ?? 30;
    const radialSegments = options.radialSegments ?? 12;
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i <= pathSegments; i++) {
      const t = i / pathSegments;
      const eased = t * t * (3 - 2 * t);
      const y = sign * (startY + length * t);
      const z = -1.2 - bend * eased;
      const width = THREE.MathUtils.lerp(startWidth, endWidth, t);
      const dy = sign * length;
      const dz = -bend * 6 * t * (1 - t);
      const tangentLength = Math.hypot(dy, dz) || 1;
      const normalY = -dz / tangentLength;
      const normalZ = dy / tangentLength;

      for (let j = 0; j < radialSegments; j++) {
        const angle = (j / radialSegments) * Math.PI * 2;
        const cosine = Math.cos(angle);
        const sine = Math.sin(angle);
        const x = Math.sign(cosine) * Math.pow(Math.abs(cosine), 0.5) * width * 0.5;
        const offset = Math.sign(sine) * Math.pow(Math.abs(sine), 0.5) * thickness * 0.5;
        positions.push(x, y + normalY * offset, z + normalZ * offset);
        uvs.push(j / radialSegments, t);
      }
    }

    for (let i = 0; i < pathSegments; i++) {
      const ring = i * radialSegments;
      const next = (i + 1) * radialSegments;
      for (let j = 0; j < radialSegments; j++) {
        const j2 = (j + 1) % radialSegments;
        indices.push(ring + j, next + j, next + j2, ring + j, next + j2, ring + j2);
      }
    }

    const startCenter = positions.length / 3;
    positions.push(0, sign * startY, -1.2);
    uvs.push(0.5, 0.5);
    const endCenter = positions.length / 3;
    positions.push(0, sign * (startY + length), -1.2 - bend);
    uvs.push(0.5, 0.5);
    const endRing = pathSegments * radialSegments;
    for (let j = 0; j < radialSegments; j++) {
      const next = (j + 1) % radialSegments;
      indices.push(startCenter, next, j);
      indices.push(endCenter, endRing + j, endRing + next);
    }

    this.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    this.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    this.setIndex(indices);
    this.computeVertexNormals();
    this.computeBoundingSphere();
  }
}

export function createCapsuleCurve(points, radius, material, tubularSegments = 24) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, tubularSegments, radius, 8, false);
  return new THREE.Mesh(geometry, material);
}
