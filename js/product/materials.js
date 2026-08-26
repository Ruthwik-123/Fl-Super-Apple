import * as THREE from "three";
import { createBrushedRoughness, createRubberRoughness, createWovenTexture } from "./textures.js";

export class ProductMaterials {
  constructor(maxAnisotropy = 4, lowPower = false) {
    this.textures = {
      brushed: createBrushedRoughness(),
      rubber: createRubberRoughness(),
      woven: createWovenTexture(),
    };
    this.textures.woven.anisotropy = Math.min(maxAnisotropy, 8);
    this.naturalTitanium = new THREE.Color(0xaaa69d);
    this.blackTitanium = new THREE.Color(0x24272b);

    this.titanium = new THREE.MeshPhysicalMaterial({
      name: "Brushed grade 5 titanium",
      color: this.naturalTitanium,
      metalness: 1,
      roughness: 0.28,
      roughnessMap: this.textures.brushed,
      anisotropy: 0.6,
      anisotropyRotation: Math.PI / 2,
      clearcoat: 0.12,
      clearcoatRoughness: 0.34,
      envMapIntensity: 1.55,
    });
    this.titaniumDark = this.titanium.clone();
    this.titaniumDark.name = "Dark titanium details";
    this.titaniumDark.color.set(0x35383b);
    this.titaniumDark.roughness = 0.36;

    this.glass = new THREE.MeshPhysicalMaterial({
      name: "Sapphire crystal",
      color: 0xddeeff,
      metalness: 0,
      roughness: 0.055,
      transmission: lowPower ? 0 : 0.72,
      thickness: 1.1,
      ior: 1.76,
      transparent: true,
      opacity: lowPower ? 0.22 : 1,
      clearcoat: 1,
      clearcoatRoughness: 0.035,
      envMapIntensity: 2.15,
      depthWrite: false,
    });

    this.ceramic = new THREE.MeshPhysicalMaterial({
      name: "Back ceramic",
      color: 0x101214,
      metalness: 0.05,
      roughness: 0.16,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.4,
    });
    this.sensorGlass = this.glass.clone();
    this.sensorGlass.color.set(0x18262a);
    this.sensorGlass.transmission = lowPower ? 0 : 0.25;
    this.sensorGlass.opacity = lowPower ? 0.72 : 1;
    this.sensorGlass.roughness = 0.09;

    this.accent = new THREE.MeshStandardMaterial({ name: "Signal accent", color: 0xff5a1f, roughness: 0.42, metalness: 0.15 });
    this.black = new THREE.MeshStandardMaterial({ color: 0x08090a, roughness: 0.52, metalness: 0.12 });
    this.rubberSlate = new THREE.MeshStandardMaterial({
      name: "Fluoroelastomer slate",
      color: 0x5f6b73,
      roughness: 0.62,
      roughnessMap: this.textures.rubber,
      metalness: 0,
    });
    this.rubberClay = new THREE.MeshStandardMaterial({
      name: "Fluoroelastomer clay",
      color: 0xb3573a,
      roughness: 0.56,
      roughnessMap: this.textures.rubber,
      metalness: 0,
    });
    this.woven = new THREE.MeshStandardMaterial({
      name: "Woven traverse textile",
      color: 0x3a3c3b,
      map: this.textures.woven,
      roughness: 0.87,
      metalness: 0,
    });

    this.pcb = new THREE.MeshStandardMaterial({ color: 0x123b2d, roughness: 0.48, metalness: 0.08 });
    this.chip = new THREE.MeshPhysicalMaterial({ color: 0x111316, roughness: 0.2, metalness: 0.48, clearcoat: 0.35 });
    this.copper = new THREE.MeshStandardMaterial({ color: 0xb86c32, roughness: 0.29, metalness: 0.92 });
    this.gold = new THREE.MeshStandardMaterial({ color: 0xd7a841, roughness: 0.23, metalness: 1 });
    this.shield = new THREE.MeshStandardMaterial({ color: 0x9da1a1, roughness: 0.34, metalness: 0.93 });
    this.battery = new THREE.MeshPhysicalMaterial({ color: 0x23262a, roughness: 0.38, metalness: 0.46, clearcoat: 0.2 });
    this.lens = new THREE.MeshPhysicalMaterial({
      color: 0x0b1821,
      roughness: 0.06,
      metalness: 0.18,
      transmission: lowPower ? 0 : 0.35,
      thickness: 0.7,
      ior: 1.62,
      clearcoat: 1,
      envMapIntensity: 1.7,
    });
  }

  setFinish(amount) {
    this.titanium.color.lerpColors(this.naturalTitanium, this.blackTitanium, amount);
    this.titanium.roughness = THREE.MathUtils.lerp(0.31, 0.37, amount);
  }

  dispose() {
    Object.values(this.textures).forEach((texture) => texture.dispose());
    const seen = new Set();
    for (const value of Object.values(this)) {
      if (value?.isMaterial && !seen.has(value)) {
        seen.add(value);
        value.dispose();
      }
    }
  }
}
