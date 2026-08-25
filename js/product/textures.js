import * as THREE from "three";

function seededNoise(index) {
  const x = Math.sin(index * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function createBrushedRoughness(size = 256) {
  const data = new Uint8Array(size * size);
  for (let y = 0; y < size; y++) {
    let grain = seededNoise(y) * 18;
    for (let x = 0; x < size; x++) {
      grain = grain * 0.86 + seededNoise(y * size + x) * 24;
      const hairline = x % 31 === 0 ? 12 : 0;
      data[y * size + x] = Math.min(255, 120 + grain + hairline);
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RedFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 5);
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

export function createWovenTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const context = canvas.getContext("2d", { alpha: false });
  context.fillStyle = "#747571";
  context.fillRect(0, 0, size, size);
  context.lineWidth = 2;

  for (let i = -size; i < size * 2; i += 8) {
    context.strokeStyle = i % 16 === 0 ? "#a3a49f" : "#4e504d";
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i - size, size);
    context.stroke();
  }
  for (let i = -size; i < size * 2; i += 8) {
    context.strokeStyle = "rgba(15,16,15,.38)";
    context.beginPath();
    context.moveTo(i, 0);
    context.lineTo(i + size, size);
    context.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 9);
  texture.anisotropy = 4;
  return texture;
}

export function createRubberRoughness(size = 128) {
  const data = new Uint8Array(size * size);
  for (let i = 0; i < data.length; i++) {
    data[i] = 175 + Math.floor(seededNoise(i) * 45);
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RedFormat);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 12);
  texture.needsUpdate = true;
  return texture;
}

export function createBackgroundTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const context = canvas.getContext("2d", { alpha: false });
  const gradient = context.createRadialGradient(540, 410, 30, 540, 450, 700);
  gradient.addColorStop(0, "#151719");
  gradient.addColorStop(0.38, "#08090a");
  gradient.addColorStop(1, "#000000");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1024, 1024);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}
