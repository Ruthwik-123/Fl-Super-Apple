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
      face: "wayfinder",
      faceProgress: 0,
      key: 3,
      fill: 18,
      rim: 24,
      cool: 0,
      signal: 0,
      chapter: 0,
    };
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

    state.camera.lerpVectors(a.cameraVector, b.cameraVector, amount);
    state.target.lerpVectors(a.targetVector, b.targetVector, amount);
    state.product.lerpVectors(a.productVector, b.productVector, amount);
    state.quaternion.slerpQuaternions(a.quaternion, b.quaternion, amount);
    state.backdrop.lerpColors(a.backdropColor, b.backdropColor, amount);
    state.fov = THREE.MathUtils.lerp(a.fov, b.fov, amount);
    state.assembly = THREE.MathUtils.lerp(a.assembly, b.assembly, amount);
    state.optics = THREE.MathUtils.lerp(a.optics, b.optics, amount);
    state.finish = THREE.MathUtils.lerp(a.finish, b.finish, amount);
    state.band = THREE.MathUtils.lerp(a.band, b.band, amount);
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
