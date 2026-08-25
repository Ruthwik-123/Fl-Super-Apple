import * as THREE from "three";
import { createWatchFace } from "./watchface.js";
import { titaniumMaterial, plasticMaterial } from "./materials.js";

export class AppleWatchUltra {
  constructor() {
    this.group = new THREE.Group();
    this.parts = {};
    this.face = createWatchFace();
    this.metal = titaniumMaterial(false);
    this._finish = 0;
    this._band = 0;
    this._explode = 0;
    this._face = "wayfinder";
    this._nat = new THREE.Color(0xb7b3a8);
    this._blk = new THREE.Color(0x2a2c30);

    this.front = new THREE.Group();
    this.core = new THREE.Group();
    this.back = new THREE.Group();
    this.internals = new THREE.Group();
    this.bands = new THREE.Group();
    this.group.add(this.front, this.core, this.back, this.internals, this.bands);
    this.group.scale.setScalar(0.34);

    this.buildCase();
    this.buildScreen();
    this.buildControls();
    this.buildBack();
    this.buildInternals();
    this.buildBands();
    this.setBand(0);
    this.setExplode(0);
  }

  buildCase() {
    const caseMesh = new THREE.Mesh(new THREE.BoxGeometry(44, 49, 12), this.metal);
    this.core.add(caseMesh);
    this.parts.case = caseMesh;

    const bumper = new THREE.Mesh(new THREE.BoxGeometry(46, 51, 3.2), this.metal);
    bumper.position.z = 4.2;
    this.front.add(bumper);
    this.parts.bumper = bumper;

    const well = new THREE.Mesh(
      new THREE.BoxGeometry(40, 45, 0.8),
      plasticMaterial(0x0a0a0a)
    );
    well.position.z = 5.2;
    this.front.add(well);
  }

  buildScreen() {
    const faceTex = new THREE.CanvasTexture(this.face.canvas);
    faceTex.colorSpace = THREE.SRGBColorSpace;
    faceTex.minFilter = THREE.LinearFilter;
    faceTex.generateMipmaps = false;
    this.faceTexture = faceTex;

    const screenMat = new THREE.MeshBasicMaterial({
      map: faceTex,
    });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(38, 43), screenMat);
    screen.position.z = 5.7;
    this.front.add(screen);
    this.parts.screen = screen;
    this.parts.screenMat = screenMat;
  }

  buildControls() {
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 3.4, 10), this.metal);
    crown.rotation.z = Math.PI / 2;
    crown.position.set(23.4, 6.2, 0.2);
    this.core.add(crown);

    const sideBtn = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7, 3.2), this.metal);
    sideBtn.position.set(22.6, -4.6, 0.15);
    this.core.add(sideBtn);

    const action = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 8.2, 4),
      plasticMaterial(0xff5a1f)
    );
    action.position.set(-22.7, 3.4, 0.1);
    this.core.add(action);
  }

  buildBack() {
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(40, 45, 1.4),
      plasticMaterial(0x111114)
    );
    plate.position.z = -6.2;
    this.back.add(plate);

    const ring = new THREE.Mesh(
      new THREE.CircleGeometry(13, 16),
      plasticMaterial(0x1a1a1c)
    );
    ring.position.z = -6.95;
    ring.rotation.y = Math.PI;
    this.back.add(ring);
  }

  buildInternals() {
    const batt = new THREE.Mesh(
      new THREE.BoxGeometry(26, 32, 3),
      plasticMaterial(0xd8dbe0)
    );
    batt.position.set(0, 0, -1.2);
    this.internals.add(batt);
    this.parts.battery = batt;

    const sip = new THREE.Mesh(
      new THREE.BoxGeometry(14, 14, 1.4),
      plasticMaterial(0x0e2418)
    );
    sip.position.set(0, -2, 1.8);
    this.internals.add(sip);
    this.parts.sip = sip;

    const taptic = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 3.6, 3, 10),
      plasticMaterial(0xb87333)
    );
    taptic.rotation.x = Math.PI / 2;
    taptic.position.set(12, 14, 0.4);
    this.internals.add(taptic);
    this.parts.taptic = taptic;
    this.internals.visible = false;
  }

  strapCurve(sign) {
    const y0 = 24.5 * sign;
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, y0, 1.5),
      new THREE.Vector3(0, y0 + 7 * sign, 4),
      new THREE.Vector3(0, y0 + 14 * sign, 9),
      new THREE.Vector3(0, y0 + 18 * sign, 14),
    ]);
  }

  makeBand(color, radius, radial = 5) {
    const g = new THREE.Group();
    const mat = plasticMaterial(color);
    [1, -1].forEach((sign) => {
      const mesh = new THREE.Mesh(
        new THREE.TubeGeometry(this.strapCurve(sign), 8, radius, radial, false),
        mat
      );
      g.add(mesh);
    });
    return g;
  }

  buildBands() {
    this.ocean = this.makeBand(0xc6ff4a, 2.2, 5);
    this.alpine = this.makeBand(0xd2652a, 3.4, 5);
    this.trail = this.makeBand(0x2a2a2e, 1.6, 4);
    this.bands.add(this.ocean, this.alpine, this.trail);
  }

  setFinish(t) {
    if (Math.abs(t - this._finish) < 0.01) return;
    this._finish = t;
    this.metal.color.lerpColors(this._nat, this._blk, t);
  }

  setBand(t) {
    if (Math.abs(t - this._band) < 0.02) return;
    this._band = t;
    const which = t < 0.5 ? 0 : t < 1.5 ? 1 : 2;
    this.ocean.visible = which === 0;
    this.alpine.visible = which === 1;
    this.trail.visible = which === 2;
  }

  setExplode(t) {
    if (Math.abs(t - this._explode) < 0.005) return;
    this._explode = t;
    this.front.position.z = t * 16;
    this.back.position.z = t * -14;
    this.parts.battery.position.set(-t * 12, 0, -1.2);
    this.parts.sip.position.set(t * 3, -2 + t * 6, 1.8);
    this.parts.taptic.position.set(12 + t * 8, 14, 0.4 + t * 4);
    this.bands.visible = t < 0.55;
    this.internals.visible = t > 0.12;
  }

  setFaceMode(mode) {
    if (mode === this._face) return;
    this._face = mode;
    if (this.face.draw(0, mode)) this.faceTexture.needsUpdate = true;
  }
}
