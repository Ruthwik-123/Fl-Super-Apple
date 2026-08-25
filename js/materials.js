import * as THREE from "three";

export function makeBrushedMap(size = 512) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#888890";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1400; i++) {
    const y = Math.random() * size;
    const a = 0.04 + Math.random() * 0.08;
    ctx.strokeStyle = Math.random() > 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y + (Math.random() - 0.5) * 6);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  return tex;
}

export function makeKnurlMap() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext("2d");
  for (let x = 0; x < 256; x++) {
    const v = x % 8 < 4 ? 210 : 80;
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(x, 0, 1, 64);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

export function makeFabricMap(c1 = "#c45a20", c2 = "#8a3a12") {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d");
  ctx.fillStyle = c1;
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = c2;
  ctx.lineWidth = 2;
  for (let i = 0; i < 256; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(256, i);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 2);
  return tex;
}

export function titaniumMaterial(brushed, black = false) {
  return new THREE.MeshPhysicalMaterial({
    color: black ? 0x2a2c30 : 0xb7b3a8,
    metalness: 1,
    roughness: black ? 0.38 : 0.28,
    map: brushed,
    roughnessMap: brushed,
    clearcoat: 0.35,
    clearcoatRoughness: 0.35,
    envMapIntensity: 1.25,
  });
}

export function glassMaterial() {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.05,
    roughness: 0.04,
    transparent: true,
    opacity: 0.12,
    envMapIntensity: 1.6,
    depthWrite: false,
  });
}
