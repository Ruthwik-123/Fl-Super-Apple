import * as THREE from "three";
import { STORY_SHOTS } from "./shots.js";

function cinematicEase(value) {
  const held = THREE.MathUtils.clamp((value - 0.16) / 0.68, 0, 1);
  return held * held * (3 - 2 * held);
}

export class StoryTimeline {
  constructor() {
    this.shots = STORY_SHOTS.map((shot) => ({
      ...shot,
      cameraVector: new THREE.Vector3(...shot.camera),
      targetVector: new THREE.Vector3(...shot.target),
      productVector: new THREE.Vector3(...shot.product),
      quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(...shot.rotation, "XYZ")),
      backdropColor: new THREE.Color(shot.light.backdrop),
    }));
    this.state = {
      camera: new THREE.Vector3(),
      target: new THREE.Vector3(),
      product: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      backdrop: new THREE.Color(),
      fov: 31,
      assembly: 0,
      optics: 0,
      finish: 0,
      band: 0,
      side: 0,
      face: "expedition",
      faceProgress: 0,
      key: 3,
      fill: 18,
      rim: 24,
      cool: 0,
      signal: 0,
      chapter: 0,
    };
    // Allocation-free temporaries for the curved camera path.
    this._a = new THREE.Vector3();
    this._b = new THREE.Vector3();
    this._mid = new THREE.Vector3();
    this._tgtMid = new THREE.Vector3();
    this._dir = new THREE.Vector3();
    this._cp = new THREE.Vector3();
  }

  sample(progress, stops) {
    const shotCount = this.shots.length;
    if (!stops?.length || progress <= stops[0]) return this.copyShot(0, 0);
    if (progress >= stops[shotCount - 1]) return this.copyShot(shotCount - 1, 1);

    let index = 0;
    while (index < shotCount - 2 && progress > stops[index + 1]) index++;
    const start = stops[index];
    const end = stops[index + 1];
    const raw = THREE.MathUtils.clamp((progress - start) / Math.max(0.0001, end - start), 0, 1);
    const amount = cinematicEase(raw);
    const a = this.shots[index];
    const b = this.shots[index + 1];
    const state = this.state;

    // Curved depth transition: the camera travels a quadratic arc that dives
    // toward the product mid-transition instead of a straight lerp, so every
    // move carries a soft push-in / pull-back through depth.
    this._a.copy(a.cameraVector);
    this._b.copy(b.cameraVector);
    this._mid.lerpVectors(this._a, this._b, 0.5);
    this._tgtMid.lerpVectors(a.targetVector, b.targetVector, 0.5);
    this._dir.subVectors(this._tgtMid, this._mid);
    const reach = this._dir.length();
    this._dir.normalize();
    const arcDepth = Math.min(12, reach * 0.45) + 2.5;
    this._cp.copy(this._mid).addScaledVector(this._dir, arcDepth);
    const inv = 1 - amount;
    state.camera
      .copy(this._a).multiplyScalar(inv * inv)
      .addScaledVector(this._cp, 2 * inv * amount)
      .addScaledVector(this._b, amount * amount);

    state.target.lerpVectors(a.targetVector, b.targetVector, amount);
    state.product.lerpVectors(a.productVector, b.productVector, amount);
    state.quaternion.slerpQuaternions(a.quaternion, b.quaternion, amount);
    state.backdrop.lerpColors(a.backdropColor, b.backdropColor, amount);
    state.fov = THREE.MathUtils.lerp(a.fov, b.fov, amount);
    state.assembly = THREE.MathUtils.lerp(a.assembly, b.assembly, amount);
    state.optics = THREE.MathUtils.lerp(a.optics, b.optics, amount);
    state.finish = THREE.MathUtils.lerp(a.finish, b.finish, amount);
    // The band is a categorical choice (0/1/2), so it must switch at the
    // transition midpoint rather than lerp — a continuous blend would sweep
    // through the intermediate variant and look like a colour glitch.
    state.band = raw < 0.5 ? a.band : b.band;
    state.side = THREE.MathUtils.lerp(a.side ?? 0, b.side ?? 0, amount);
    state.key = THREE.MathUtils.lerp(a.light.key, b.light.key, amount);
    state.fill = THREE.MathUtils.lerp(a.light.fill, b.light.fill, amount);
    state.rim = THREE.MathUtils.lerp(a.light.rim, b.light.rim, amount);
    state.cool = THREE.MathUtils.lerp(a.light.cool, b.light.cool, amount);
    state.signal = THREE.MathUtils.lerp(a.signal ?? 0, b.signal ?? 0, amount);
    state.chapter = raw < 0.5 ? index : index + 1;
    state.face = raw < 0.52 ? a.face : b.face;
    state.faceProgress = raw < 0.52 ? Math.min(1, raw / 0.52) : (raw - 0.52) / 0.48;
    return state;
  }

  copyShot(index, faceProgress) {
    const shot = this.shots[index];
    const state = this.state;
    state.camera.copy(shot.cameraVector);
    state.target.copy(shot.targetVector);
    state.product.copy(shot.productVector);
    state.quaternion.copy(shot.quaternion);
    state.backdrop.copy(shot.backdropColor);
    state.fov = shot.fov;
    state.assembly = shot.assembly;
    state.optics = shot.optics;
    state.finish = shot.finish;
    state.band = shot.band;
    state.side = shot.side ?? 0;
    state.key = shot.light.key;
    state.fill = shot.light.fill;
    state.rim = shot.light.rim;
    state.cool = shot.light.cool;
    state.signal = shot.signal ?? 0;
    state.chapter = index;
    state.face = shot.face;
    state.faceProgress = faceProgress;
    return state;
  }
}
