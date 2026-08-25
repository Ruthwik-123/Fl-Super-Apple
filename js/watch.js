import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { createWatchFace } from "./watchface.js";
import {
  makeBrushedMap,
  makeKnurlMap,
  makeFabricMap,
  titaniumMaterial,
  glassMaterial,
} from "./materials.js";

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const hw = w / 2;
  const hh = h / 2;
  s.moveTo(-hw + r, -hh);
  s.lineTo(hw - r, -hh);
  s.absarc(hw - r, -hh + r, r, -Math.PI / 2, 0, false);
  s.lineTo(hw, hh - r);
  s.absarc(hw - r, hh - r, r, 0, Math.PI / 2, false);
  s.lineTo(-hw + r, hh);
  s.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-hw, -hh + r);
  s.absarc(-hw + r, -hh + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

export class AppleWatchUltra {
  constructor() {
    this.group = new THREE.Group();
    this.parts = {};
    this.face = createWatchFace();
    this.brushed = makeBrushedMap();
    this.naturalMat = titaniumMaterial(this.brushed, false);
    this.blackMat = titaniumMaterial(this.brushed, true);
    this.currentFinish = 0;

    this.front = new THREE.Group();
    this.core = new THREE.Group();
    this.back = new THREE.Group();
    this.internals = new THREE.Group();
    this.bands = new THREE.Group();
    this.labels = [];

    this.group.add(this.front, this.core, this.back, this.internals, this.bands);

    this.buildCase();
    this.buildScreen();
    this.buildControls();
    this.buildBack();
    this.buildInternals();
    this.buildBands();
    this.setFinish(0);
    this.setBand(0);
    this.setExplode(0);
  }

  metal() {
    return this.currentFinish > 0.5 ? this.blackMat : this.naturalMat;
  }

  buildCase() {
    const shape = roundedRectShape(42.6, 47.6, 9.4);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 11.2,
      bevelEnabled: true,
      bevelThickness: 0.85,
      bevelSize: 0.85,
      bevelSegments: 3,
      curveSegments: 18,
    });
    geo.center();
    const caseMesh = new THREE.Mesh(geo, this.naturalMat);
    caseMesh.castShadow = true;
    caseMesh.receiveShadow = true;
    this.core.add(caseMesh);
    this.parts.case = caseMesh;

    const bumper = new THREE.Mesh(
      new RoundedBoxGeometry(45.2, 50.2, 4.2, 6, 8.5),
      this.naturalMat
    );
    bumper.position.z = 3.1;
    bumper.castShadow = true;
    this.front.add(bumper);
    this.parts.bumper = bumper;

    const innerWell = new THREE.Mesh(
      new RoundedBoxGeometry(40.2, 45.4, 1.2, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.6, metalness: 0.2 })
    );
    innerWell.position.z = 5.15;
    this.front.add(innerWell);
  }

  buildScreen() {
    const faceTex = new THREE.CanvasTexture(this.face.canvas);
    faceTex.colorSpace = THREE.SRGBColorSpace;
    faceTex.anisotropy = 8;
    this.faceTexture = faceTex;

    const screenMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      emissiveMap: faceTex,
      emissive: 0xffffff,
      emissiveIntensity: 0.85,
      roughness: 0.28,
      metalness: 0,
    });
    const screen = new THREE.Mesh(new RoundedBoxGeometry(38.4, 43.6, 0.35, 4, 7.2), screenMat);
    screen.position.z = 5.55;
    this.front.add(screen);
    this.parts.screen = screen;
    this.parts.screenMat = screenMat;

    const glass = new THREE.Mesh(new RoundedBoxGeometry(39.6, 44.8, 0.45, 4, 7.6), glassMaterial());
    glass.position.z = 5.85;
    this.front.add(glass);
    this.parts.glass = glass;
  }

  buildControls() {
    const knurl = makeKnurlMap();
    const crownMat = this.naturalMat.clone();
    crownMat.bumpMap = knurl;
    crownMat.bumpScale = 1.4;
    this.parts.crownMat = crownMat;

    const crown = new THREE.Group();
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 3.6, 36), crownMat);
    cyl.rotation.z = Math.PI / 2;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.35, 36), crownMat);
    cap.rotation.z = Math.PI / 2;
    cap.position.x = 2.05;
    crown.add(cyl, cap);
    crown.position.set(23.4, 6.2, 0.2);
    crown.castShadow = true;
    this.core.add(crown);
    this.parts.crown = crown;

    const sideBtn = new THREE.Mesh(new RoundedBoxGeometry(1.3, 7.2, 3.4, 2, 0.6), this.naturalMat);
    sideBtn.position.set(22.6, -4.6, 0.15);
    this.core.add(sideBtn);
    this.parts.sideBtn = sideBtn;

    const actionMat = new THREE.MeshPhysicalMaterial({
      color: 0xff5a1f,
      metalness: 0.35,
      roughness: 0.35,
      clearcoat: 0.6,
      emissive: 0x3a1200,
      emissiveIntensity: 0.25,
    });
    const action = new THREE.Mesh(new RoundedBoxGeometry(1.5, 8.4, 4.2, 2, 0.7), actionMat);
    action.position.set(-22.7, 3.4, 0.1);
    action.castShadow = true;
    this.core.add(action);
    this.parts.action = action;
    this.parts.actionMat = actionMat;

    const holeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 });
    for (let i = 0; i < 6; i++) {
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.2, 10), holeMat);
      hole.rotation.z = Math.PI / 2;
      hole.position.set(-22.5, -6.2 + i * 0.85, 1.6);
      this.core.add(hole);
    }
    for (let i = 0; i < 4; i++) {
      const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.2, 10), holeMat);
      hole.rotation.z = Math.PI / 2;
      hole.position.set(-22.5, -6.2 + i * 0.85, -1.4);
      this.core.add(hole);
    }
  }

  buildBack() {
    const ceramic = new THREE.MeshStandardMaterial({
      color: 0x0d0d0f,
      roughness: 0.35,
      metalness: 0.15,
    });
    const plate = new THREE.Mesh(new RoundedBoxGeometry(40, 45, 1.6, 4, 8), ceramic);
    plate.position.z = -5.9;
    this.back.add(plate);

    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(14.5, 14.5, 0.5, 48),
      new THREE.MeshStandardMaterial({ color: 0x1a1a1c, metalness: 0.6, roughness: 0.3 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.z = -6.7;
    this.back.add(ring);

    const lens = new THREE.Mesh(
      new THREE.CircleGeometry(12.2, 48),
      new THREE.MeshPhysicalMaterial({
        color: 0x111114,
        roughness: 0.05,
        metalness: 0.2,
        clearcoat: 1,
      })
    );
    lens.position.z = -6.95;
    lens.rotation.y = Math.PI;
    this.back.add(lens);

    const sensorMat = new THREE.MeshStandardMaterial({
      color: 0x142214,
      emissive: 0x0a330a,
      emissiveIntensity: 0.6,
    });
    const positions = [
      [-4.2, 3.4],
      [4.2, 3.4],
      [-4.2, -3.4],
      [4.2, -3.4],
    ];
    positions.forEach(([x, y]) => {
      const s = new THREE.Mesh(new THREE.CircleGeometry(1.7, 20), sensorMat);
      s.position.set(x, y, -6.96);
      s.rotation.y = Math.PI;
      this.back.add(s);
    });

    const ir = new THREE.Mesh(
      new THREE.CircleGeometry(1.3, 16),
      new THREE.MeshStandardMaterial({ color: 0x3a0505, emissive: 0x220000, emissiveIntensity: 0.4 })
    );
    ir.position.set(0, 0, -6.96);
    ir.rotation.y = Math.PI;
    this.back.add(ir);
  }

  buildInternals() {
    const battery = new THREE.Mesh(
      new RoundedBoxGeometry(28, 34, 3.4, 2, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xd8dbe0, metalness: 0.7, roughness: 0.25 })
    );
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(28.2, 6, 3.5),
      new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    stripe.position.y = 10;
    const batt = new THREE.Group();
    batt.add(battery, stripe);
    batt.position.set(0, 0, -1.2);
    this.internals.add(batt);
    this.parts.battery = batt;
    this.addLabel(batt, "42-hour battery", 0, 20, 0);

    const chipTex = makeChipTexture();
    const sip = new THREE.Mesh(
      new RoundedBoxGeometry(16, 16, 1.6, 2, 0.4),
      new THREE.MeshStandardMaterial({
        map: chipTex,
        metalness: 0.4,
        roughness: 0.35,
        emissive: 0x0a1a12,
        emissiveIntensity: 0.3,
      })
    );
    sip.position.set(0, -2, 1.8);
    this.internals.add(sip);
    this.parts.sip = sip;
    this.addLabel(sip, "S10 SiP", 0, 12, 0);

    const taptic = new THREE.Mesh(
      new THREE.CylinderGeometry(4.2, 4.2, 3.2, 24),
      new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.85, roughness: 0.3 })
    );
    taptic.rotation.x = Math.PI / 2;
    taptic.position.set(12, 14, 0.4);
    this.internals.add(taptic);
    this.parts.taptic = taptic;
    this.addLabel(taptic, "Taptic engine", 8, 8, 0);

    this.internals.visible = false;
  }

  addLabel(parent, text, x, y, z) {
    const el = document.createElement("div");
    el.className = "label3d";
    el.textContent = text;
    const obj = new CSS2DObject(el);
    obj.position.set(x, y, z);
    parent.add(obj);
    this.labels.push(el);
  }

  buildBands() {
    this.ocean = this.makeOceanBand();
    this.alpine = this.makeAlpineBand();
    this.trail = this.makeTrailBand();
    this.bands.add(this.ocean, this.alpine, this.trail);
  }

  strapCurve(sign) {
    const y0 = 24.6 * sign;
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, y0, 2.2),
      new THREE.Vector3(0, y0 + 10 * sign, 4),
      new THREE.Vector3(0, y0 + 26 * sign, 10),
      new THREE.Vector3(0, y0 + 38 * sign, 22),
      new THREE.Vector3(0, y0 + 42 * sign, 38),
    ]);
  }

  makeOceanBand() {
    const g = new THREE.Group();
    const mat = new THREE.MeshPhysicalMaterial({
      color: 0xc6ff4a,
      roughness: 0.45,
      metalness: 0.05,
      clearcoat: 0.5,
      transparent: true,
      opacity: 1,
    });
    [1, -1].forEach((sign) => {
      const curve = this.strapCurve(sign);
      for (let i = -2; i <= 2; i++) {
        const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 1.15, 10, false), mat);
        tube.position.x = i * 2.35;
        tube.castShadow = true;
        g.add(tube);
      }
    });
    const buckle = new THREE.Mesh(
      new THREE.TorusGeometry(5.5, 0.7, 10, 24),
      this.naturalMat.clone()
    );
    buckle.position.set(0, -66, 38);
    buckle.rotation.x = Math.PI / 2;
    buckle.userData.keepMetal = true;
    g.add(buckle);
    return g;
  }

  makeAlpineBand() {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
      map: makeFabricMap("#d2652a", "#8d3912"),
      roughness: 0.85,
      metalness: 0,
      transparent: true,
      opacity: 1,
    });
    [1, -1].forEach((sign) => {
      const curve = this.strapCurve(sign);
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 4.4, 8, false), mat);
      mesh.scale.x = 2.4;
      mesh.castShadow = true;
      g.add(mesh);
    });
    const hook = new THREE.Mesh(
      new THREE.TorusGeometry(4.2, 0.55, 8, 16, Math.PI),
      this.naturalMat.clone()
    );
    hook.userData.keepMetal = true;
    hook.position.set(0, 66, 36);
    hook.rotation.z = Math.PI / 2;
    g.add(hook);
    return g;
  }

  makeTrailBand() {
    const g = new THREE.Group();
    const dark = new THREE.MeshStandardMaterial({
      color: 0x1c1c1f,
      roughness: 0.9,
      transparent: true,
      opacity: 1,
    });
    const light = new THREE.MeshStandardMaterial({
      color: 0x6b6e74,
      roughness: 0.9,
      transparent: true,
      opacity: 1,
    });
    [1, -1].forEach((sign, idx) => {
      const curve = this.strapCurve(sign);
      const mesh = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 40, 2.4, 8, false),
        idx ? light : dark
      );
      mesh.scale.x = 3.1;
      mesh.castShadow = true;
      g.add(mesh);
    });
    return g;
  }

  setFinish(t) {
    this.currentFinish = t;
    const mats = [this.parts.case, this.parts.bumper, this.parts.sideBtn];
    mats.forEach((m) => {
      if (!m) return;
      m.material = t > 0.5 ? this.blackMat : this.naturalMat;
    });
    this.naturalMat.color.lerpColors(
      new THREE.Color(0xb7b3a8),
      new THREE.Color(0x2a2c30),
      t
    );
    this.blackMat.color.copy(this.naturalMat.color);
    this.naturalMat.roughness = 0.28 + t * 0.1;
  }

  setBand(t) {
    const ocean = 1 - THREE.MathUtils.clamp(Math.abs(t - 0), 0, 1);
    const alpine = 1 - THREE.MathUtils.clamp(Math.abs(t - 1), 0, 1);
    const trail = 1 - THREE.MathUtils.clamp(Math.abs(t - 2), 0, 1);
    this.ocean.visible = ocean > 0.04;
    this.alpine.visible = alpine > 0.04;
    this.trail.visible = trail > 0.04;
    this.ocean.traverse((o) => {
      if (o.material) {
        o.material.transparent = true;
        o.material.opacity = ocean;
      }
    });
    this.alpine.traverse((o) => {
      if (o.material && o.material !== this.naturalMat) {
        o.material.transparent = true;
        o.material.opacity = alpine;
      }
    });
    this.trail.traverse((o) => {
      if (o.material) {
        o.material.transparent = true;
        o.material.opacity = trail;
      }
    });
  }

  setExplode(t) {
    this.front.position.z = t * 22;
    this.back.position.z = t * -18;
    this.internals.position.z = t * 2;
    this.parts.battery.position.set(-t * 16, 0, -1.2);
    this.parts.sip.position.set(t * 4, -2 + t * 8, 1.8);
    this.parts.taptic.position.set(12 + t * 10, 14, 0.4 + t * 6);
    this.bands.position.z = t * -8;
    this.bands.scale.setScalar(1 - t * 0.15);
    const show = t > 0.35;
    this.internals.visible = t > 0.12;
    this.labels.forEach((el) => el.classList.toggle("is-on", show));
  }

  setScreenBoost(t) {
    this.parts.screenMat.emissiveIntensity = 0.35 + t * 1.4;
  }

  setFaceMode(mode, time) {
    this.face.draw(time, mode);
    this.faceTexture.needsUpdate = true;
  }
}

function makeChipTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#0e2418";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "rgba(198,255,74,0.35)";
  ctx.lineWidth = 1;
  for (let i = 16; i < 256; i += 12) {
    ctx.beginPath();
    ctx.moveTo(i, 8);
    ctx.lineTo(i, 248);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, i);
    ctx.lineTo(248, i);
    ctx.stroke();
  }
  ctx.fillStyle = "#c6ff4a";
  ctx.font = "700 48px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("S10", 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
