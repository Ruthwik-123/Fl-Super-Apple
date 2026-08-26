import * as THREE from "three";
import { BandGeometry, createCapsuleCurve, roundedBox, roundedPlane, roundedRing } from "./geometry.js";
import { ProductMaterials } from "./materials.js";
import { WatchDisplay } from "./watch-display.js";

const MODEL_SCALE = 0.36;
const Z_AXIS = new THREE.Vector3(0, 0, 1);

function mesh(geometry, material, name) {
  const result = new THREE.Mesh(geometry, material);
  result.name = name;
  return result;
}

function zCylinder(radius, depth, segments = 32) {
  const geometry = new THREE.CylinderGeometry(radius, radius, depth, segments, 1, false);
  geometry.rotateX(Math.PI / 2);
  return geometry;
}

function smoothStep(min, max, value) {
  const x = THREE.MathUtils.clamp((value - min) / (max - min), 0, 1);
  return x * x * (3 - 2 * x);
}

export class ProductWatch {
  constructor(renderer, lowPower = false) {
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    this.materials = new ProductMaterials(maxAnisotropy, lowPower);
    this.display = new WatchDisplay(maxAnisotropy);
    this.group = new THREE.Group();
    this.group.name = "iSPY 2 Pro Max";
    this.group.scale.setScalar(MODEL_SCALE);

    this.chassis = new THREE.Group();
    this.chassis.name = "Chassis";
    this.frontAssembly = new THREE.Group();
    this.frontAssembly.name = "Front assembly";
    this.rearAssembly = new THREE.Group();
    this.rearAssembly.name = "Rear assembly";
    this.internalAssembly = new THREE.Group();
    this.internalAssembly.name = "Internal assembly";
    this.bandAssembly = new THREE.Group();
    this.bandAssembly.name = "Bands";
    this.group.add(this.bandAssembly, this.internalAssembly, this.chassis, this.rearAssembly, this.frontAssembly);

    this.animatedParts = [];
    this.bandVariants = [];
    this.finish = -1;
    this.assembly = -1;
    this.optics = -1;
    this.band = -1;

    this.buildChassis();
    this.buildFront();
    this.buildControls();
    this.buildRear();
    this.buildInternals();
    this.buildBands();
    this.configureMeshes();

    this.setFinish(0);
    this.setBand(0);
    this.setOptics(0);
    this.setAssembly(0);
  }

  buildChassis() {
    const shell = mesh(
      roundedRing({
        width: 45,
        height: 50,
        radius: 7.2,
        innerWidth: 38.7,
        innerHeight: 43.5,
        innerRadius: 5.1,
        depth: 10,
        bevel: 0.62,
        segments: 4,
      }),
      this.materials.titanium,
      "Milled titanium enclosure"
    );
    this.chassis.add(shell);

    const innerRail = mesh(
      roundedRing({
        width: 40.2,
        height: 45,
        radius: 5.4,
        innerWidth: 37.7,
        innerHeight: 42.4,
        innerRadius: 4.4,
        depth: 8.8,
        bevel: 0.15,
        segments: 2,
      }),
      this.materials.titaniumDark,
      "Internal structural rail"
    );
    this.chassis.add(innerRail);

    const lugGeometry = roundedBox(23.5, 5.2, 5.4, 1.25, 3);
    [-1, 1].forEach((sign) => {
      const lug = mesh(lugGeometry, this.materials.titanium, sign > 0 ? "Upper band channel" : "Lower band channel");
      lug.position.set(0, sign * 26, -0.8);
      this.chassis.add(lug);
      const slot = mesh(roundedBox(18.8, 1.9, 2.4, 0.65, 2), this.materials.black, "Band release channel");
      slot.position.set(0, sign * 26.15, -2.2);
      this.chassis.add(slot);
    });

    const breakGeometry = roundedBox(0.65, 8.5, 6.6, 0.22, 2);
    [
      [-22.62, -10],
      [-22.62, 15],
      [22.62, -15],
      [22.62, 17],
    ].forEach(([x, y], index) => {
      const antennaBreak = mesh(breakGeometry, this.materials.black, `Antenna break ${index + 1}`);
      antennaBreak.position.set(x, y, -0.2);
      this.chassis.add(antennaBreak);
    });
  }

  buildFront() {
    const bezel = mesh(
      roundedRing({
        width: 45.25,
        height: 50.25,
        radius: 7.3,
        innerWidth: 40.25,
        innerHeight: 44.75,
        innerRadius: 5.55,
        depth: 2.1,
        bevel: 0.48,
        segments: 4,
      }),
      this.materials.titanium,
      "Raised titanium bezel"
    );
    bezel.position.z = 5.15;
    this.frontAssembly.add(bezel);

    const gasket = mesh(
      roundedRing({
        width: 40.75,
        height: 45.25,
        radius: 5.75,
        innerWidth: 39.4,
        innerHeight: 43.85,
        innerRadius: 5.1,
        depth: 0.5,
        bevel: 0,
      }),
      this.materials.black,
      "Display gasket"
    );
    gasket.position.z = 6.05;
    this.frontAssembly.add(gasket);

    this.screenMaterial = new THREE.MeshStandardMaterial({
      name: "OLED display",
      map: this.display.texture,
      emissiveMap: this.display.texture,
      emissive: 0xffffff,
      emissiveIntensity: 0.72,
      roughness: 0.24,
      metalness: 0,
      toneMapped: false,
    });
    this.screen = mesh(roundedPlane(39.35, 43.85, 5.15, 14), this.screenMaterial, "OLED panel");
    this.screen.position.z = 6.16;
    this.screenBase = this.screen.position.clone();
    this.frontAssembly.add(this.screen);

    this.glass = mesh(roundedBox(40.15, 44.65, 1.05, 5.65, 6), this.materials.glass, "Sapphire crystal");
    this.glass.position.z = 6.63;
    this.glassBase = this.glass.position.clone();
    this.frontAssembly.add(this.glass);
  }

  buildControls() {
    const guardGeometry = roundedBox(4.4, 5.1, 7.2, 1.35, 4);
    [2.2, 13.1].forEach((y, index) => {
      const guard = mesh(guardGeometry, this.materials.titanium, `Crown guard ${index + 1}`);
      guard.position.set(22.65, y, 0.4);
      this.chassis.add(guard);
    });

    const crownBody = mesh(zCylinder(3.28, 3.25, 64), this.materials.titanium, "Crown");
    crownBody.geometry.rotateY(Math.PI / 2);
    crownBody.position.set(25.1, 7.65, 1.1);
    this.chassis.add(crownBody);

    const ridgeGeometry = new THREE.BoxGeometry(2.9, 0.19, 0.28);
    const ridges = new THREE.InstancedMesh(ridgeGeometry, this.materials.titaniumDark, 36);
    ridges.name = "Crown knurling";
    const transform = new THREE.Object3D();
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      transform.position.set(25.1, 7.65 + Math.cos(angle) * 3.22, 1.1 + Math.sin(angle) * 3.22);
      transform.rotation.set(angle, 0, 0);
      transform.updateMatrix();
      ridges.setMatrixAt(i, transform.matrix);
    }
    ridges.instanceMatrix.needsUpdate = true;
    this.chassis.add(ridges);

    const crownCap = mesh(zCylinder(2.62, 0.35, 64), this.materials.titaniumDark, "Crown cap");
    crownCap.rotation.y = Math.PI / 2;
    crownCap.position.set(26.82, 7.65, 1.1);
    this.chassis.add(crownCap);
    const crownAccent = mesh(new THREE.TorusGeometry(2.15, 0.13, 10, 64), this.materials.accent, "Crown accent ring");
    crownAccent.rotation.y = Math.PI / 2;
    crownAccent.position.set(27.02, 7.65, 1.1);
    this.chassis.add(crownAccent);

    const sideButton = mesh(roundedBox(1.55, 8.3, 3.25, 0.62, 3), this.materials.titanium, "Side button");
    sideButton.position.set(23.2, -5.2, 0.45);
    this.chassis.add(sideButton);

    const actionWell = mesh(roundedBox(1.25, 11.1, 5.45, 0.58, 3), this.materials.titaniumDark, "Action button surround");
    actionWell.position.set(-22.85, 4.3, 0.25);
    this.chassis.add(actionWell);
    const actionButton = mesh(roundedBox(1.55, 8.2, 3.65, 0.58, 3), this.materials.black, "Programmable action key");
    actionButton.position.set(-23.25, 4.3, 0.3);
    this.chassis.add(actionButton);
    const actionAccent = mesh(roundedBox(0.42, 6.4, 0.22, 0.2, 2), this.materials.accent, "Action key accent");
    actionAccent.position.set(-24.06, 4.3, 0.3);
    this.chassis.add(actionAccent);

    const portGeometry = zCylinder(0.63, 0.45, 18);
    portGeometry.rotateY(Math.PI / 2);
    const ports = new THREE.InstancedMesh(portGeometry, this.materials.black, 7);
    ports.name = "Speaker and microphone ports";
    for (let i = 0; i < 7; i++) {
      transform.position.set(-23.05, -5.5 - i * 2.05, 0.15);
      transform.rotation.set(0, Math.PI / 2, 0);
      transform.scale.setScalar(i === 0 ? 0.72 : 1);
      transform.updateMatrix();
      ports.setMatrixAt(i, transform.matrix);
    }
    ports.instanceMatrix.needsUpdate = true;
    this.chassis.add(ports);
  }

  buildRear() {
    const plate = mesh(roundedBox(41.5, 46.1, 1.35, 5.25, 5), this.materials.ceramic, "Ceramic rear plate");
    plate.position.z = -5.75;
    this.rearAssembly.add(plate);

    const sensorBody = mesh(zCylinder(13.8, 2.15, 64), this.materials.ceramic, "Rear sensor housing");
    sensorBody.position.z = -7.02;
    this.rearAssembly.add(sensorBody);

    const outerRing = mesh(new THREE.TorusGeometry(11.65, 1.15, 20, 80), this.materials.sensorGlass, "Rear sapphire sensor ring");
    outerRing.position.z = -8.18;
    this.rearAssembly.add(outerRing);
    const innerRing = mesh(new THREE.TorusGeometry(7.15, 0.46, 14, 80), this.materials.gold, "Sensor contact ring");
    innerRing.position.z = -8.3;
    this.rearAssembly.add(innerRing);

    const sensorGeometry = zCylinder(2.05, 0.46, 32);
    const sensors = new THREE.InstancedMesh(sensorGeometry, this.materials.sensorGlass, 5);
    sensors.name = "Optical sensor array";
    const transform = new THREE.Object3D();
    const locations = [
      [0, 0],
      [-5.1, 0],
      [5.1, 0],
      [0, -5.1],
      [0, 5.1],
    ];
    locations.forEach(([x, y], index) => {
      transform.position.set(x, y, -8.37);
      transform.rotation.set(0, 0, 0);
      transform.scale.setScalar(index === 0 ? 1.18 : 1);
      transform.updateMatrix();
      sensors.setMatrixAt(index, transform.matrix);
    });
    sensors.instanceMatrix.needsUpdate = true;
    this.rearAssembly.add(sensors);

    const fastenerGeometry = zCylinder(0.62, 0.34, 20);
    const fasteners = new THREE.InstancedMesh(fastenerGeometry, this.materials.titanium, 4);
    fasteners.name = "Rear fasteners";
    [[-17, -19], [17, -19], [-17, 19], [17, 19]].forEach(([x, y], index) => {
      transform.position.set(x, y, -6.52);
      transform.scale.setScalar(1);
      transform.updateMatrix();
      fasteners.setMatrixAt(index, transform.matrix);
    });
    fasteners.instanceMatrix.needsUpdate = true;
    this.rearAssembly.add(fasteners);
  }

  addAnimatedPart(object, explode, start = 0) {
    this.animatedParts.push({
      object,
      base: object.position.clone(),
      explode: new THREE.Vector3(...explode),
      start,
    });
    this.internalAssembly.add(object);
  }

  buildInternals() {
    const board = mesh(roundedBox(33.8, 40.2, 0.85, 4.1, 3), this.materials.pcb, "Main logic board");
    board.position.set(0, 0, 0.45);
    this.addAnimatedPart(board, [0, 0, 1.8], 0.18);

    const shield = mesh(
      roundedRing({
        width: 35,
        height: 41.5,
        radius: 4.8,
        innerWidth: 27.5,
        innerHeight: 33.6,
        innerRadius: 3.1,
        depth: 0.8,
        bevel: 0.16,
        segments: 2,
      }),
      this.materials.shield,
      "Structural EMI shield"
    );
    shield.position.set(0, 0, 1.75);
    this.addAnimatedPart(shield, [0, 0, 5.5], 0.08);

    const battery = mesh(roundedBox(25.4, 31.4, 3.15, 3.5, 4), this.materials.battery, "Sealed isotope cell");
    battery.position.set(-2.4, -1.8, -1.72);
    this.addAnimatedPart(battery, [-8.5, -1.5, -5.2], 0.22);

    const cellInset = mesh(roundedBox(18, 22.5, 0.35, 2.2, 3), this.materials.black, "Cell service plate");
    cellInset.position.set(-2.4, -1.8, -0.07);
    this.addAnimatedPart(cellInset, [-8.5, -1.5, -5.2], 0.22);

    const chip = mesh(roundedBox(12.5, 12.5, 1.45, 1.25, 3), this.materials.chip, "Picometer system package");
    chip.position.set(4.7, -4.2, 1.65);
    this.addAnimatedPart(chip, [7.5, -4, 4.2], 0.16);
    const chipCap = mesh(roundedBox(8.4, 8.4, 0.28, 0.8, 2), this.materials.copper, "Processor heat spreader");
    chipCap.position.set(4.7, -4.2, 2.52);
    this.addAnimatedPart(chipCap, [7.5, -4, 4.2], 0.16);

    const memoryGeometry = roundedBox(4.5, 6.1, 0.75, 0.52, 2);
    [[-8.4, 6.2], [-2.6, 6.2], [8.8, 5.8], [9, -12]].forEach(([x, y], index) => {
      const memory = mesh(memoryGeometry, this.materials.chip, `Memory package ${index + 1}`);
      memory.position.set(x, y, 1.48);
      this.addAnimatedPart(memory, [x * 0.28, y * 0.14, 3.2 + index * 0.32], 0.23 + index * 0.025);
    });

    const taptic = mesh(zCylinder(4.25, 3.2, 32), this.materials.copper, "Haptic motor");
    taptic.position.set(12.5, 14.3, -0.7);
    this.addAnimatedPart(taptic, [8.5, 6.5, -4.2], 0.3);
    const tapticCore = mesh(zCylinder(2.1, 3.5, 28), this.materials.black, "Haptic motor core");
    tapticCore.position.set(12.5, 14.3, -0.7);
    this.addAnimatedPart(tapticCore, [8.5, 6.5, -4.2], 0.3);

    this.cameraModule = new THREE.Group();
    this.cameraModule.name = "Concealed imaging module";
    this.cameraModule.position.set(0, 14.8, 2.5);
    const cameraBody = mesh(roundedBox(14.8, 8.6, 2.2, 1.3, 3), this.materials.chip, "Camera module body");
    this.cameraModule.add(cameraBody);
    [-4.6, 0, 4.6].forEach((x, index) => {
      const lensBarrel = mesh(zCylinder(index === 1 ? 2.1 : 1.65, 1.65, 36), this.materials.titaniumDark, `Optics barrel ${index + 1}`);
      lensBarrel.position.set(x, 0, 1.55);
      const lens = mesh(zCylinder(index === 1 ? 1.55 : 1.18, 0.38, 36), this.materials.lens, `Sapphire lens ${index + 1}`);
      lens.position.set(x, 0, 2.52);
      this.cameraModule.add(lensBarrel, lens);
    });
    this.cameraBase = this.cameraModule.position.clone();
    this.addAnimatedPart(this.cameraModule, [0, 5.5, 7], 0.08);

    const contactGeometry = roundedBox(1.25, 3.2, 0.32, 0.22, 2);
    const contacts = new THREE.InstancedMesh(contactGeometry, this.materials.gold, 14);
    contacts.name = "Board contacts";
    const transform = new THREE.Object3D();
    for (let i = 0; i < 14; i++) {
      transform.position.set(-14.4 + i * 2.2, -17.8, 1.32);
      transform.updateMatrix();
      contacts.setMatrixAt(i, transform.matrix);
    }
    contacts.instanceMatrix.needsUpdate = true;
    contacts.position.set(0, 0, 0);
    this.addAnimatedPart(contacts, [0, -3.5, 2.2], 0.28);

    const flexMaterial = new THREE.MeshStandardMaterial({ color: 0xd58b35, roughness: 0.52, metalness: 0.48 });
    this.flexMaterial = flexMaterial;
    const cameraFlex = createCapsuleCurve([
      new THREE.Vector3(-1, 11.5, 1.25),
      new THREE.Vector3(-5, 8.5, 1.4),
      new THREE.Vector3(-5.5, 3, 1.35),
    ], 0.42, flexMaterial, 18);
    cameraFlex.name = "Camera flex cable";
    this.internalAssembly.add(cameraFlex);
    const cellFlex = createCapsuleCurve([
      new THREE.Vector3(-11, -9, 0.2),
      new THREE.Vector3(-13, -13, 0.65),
      new THREE.Vector3(-8, -16, 1.15),
    ], 0.48, flexMaterial, 18);
    cellFlex.name = "Cell flex cable";
    this.internalAssembly.add(cellFlex);

    this.internalAssembly.visible = false;
  }

  buildBands() {
    const upperGeometry = new BandGeometry(1, { pathSegments: 28, radialSegments: 12 });
    const lowerGeometry = new BandGeometry(-1, { length: 42, pathSegments: 30, radialSegments: 12 });
    const definitions = [
      ["Apex band", this.materials.rubberSlate],
      ["Ridge band", this.materials.rubberClay],
      ["Traverse band", this.materials.woven],
    ];

    definitions.forEach(([name, material], variantIndex) => {
      const variant = new THREE.Group();
      variant.name = name;
      const upper = mesh(upperGeometry, material, `${name} upper strap`);
      const lower = mesh(lowerGeometry, material, `${name} lower strap`);
      variant.add(upper, lower);

      [-1, 1].forEach((sign) => {
        const connector = mesh(roundedBox(19.5, 4.4, 3.2, 1.05, 3), material, `${name} connector`);
        connector.position.set(0, sign * 25.3, -0.7);
        variant.add(connector);
      });

      if (variantIndex === 0) {
        const pin = mesh(zCylinder(2.1, 1.1, 28), this.materials.titanium, "Apex band pin");
        pin.position.set(0, -54, -13.5);
        variant.add(pin);
      } else if (variantIndex === 1) {
        const loop = mesh(new THREE.TorusGeometry(8.4, 0.85, 10, 40), this.materials.titanium, "Ridge band loop");
        loop.scale.y = 0.42;
        loop.rotation.x = 0.58;
        loop.position.set(0, 49, -10.4);
        variant.add(loop);
      } else {
        const clasp = mesh(roundedBox(11, 5.5, 1.4, 1.1, 3), this.materials.titaniumDark, "Traverse band clasp");
        clasp.position.set(0, 48, -10.2);
        clasp.rotation.x = 0.52;
        variant.add(clasp);
      }

      this.bandVariants.push(variant);
      this.bandAssembly.add(variant);
    });
  }

  configureMeshes() {
    this.group.traverse((object) => {
      if (!object.isMesh) return;
      const transparent = object.material?.transparent;
      object.castShadow = !transparent;
      object.receiveShadow = !transparent;
      if (object.geometry && !object.geometry.boundingSphere) object.geometry.computeBoundingSphere();
    });
  }

  setFinish(value) {
    const next = THREE.MathUtils.clamp(value, 0, 1);
    if (Math.abs(next - this.finish) < 0.003) return;
    this.finish = next;
    this.materials.setFinish(next);
  }

  setBand(value) {
    if (Math.abs(value - this.band) < 0.02) return;
    this.band = value;
    const selected = value < 0.55 ? 0 : value < 1.5 ? 1 : 2;
    this.bandVariants.forEach((variant, index) => {
      variant.visible = index === selected;
    });
  }

  setOptics(value) {
    const next = THREE.MathUtils.clamp(value, 0, 1);
    if (Math.abs(next - this.optics) < 0.003) return;
    this.optics = next;
    const eased = next * next * (3 - 2 * next);
    this.glass.position.copy(this.glassBase).addScaledVector(Z_AXIS, eased * 6.2);
    this.screen.position.copy(this.screenBase);
    this.screen.position.x -= eased * 11.5;
    this.screen.position.z += eased * 3.7;
    this.screen.rotation.y = eased * -0.13;
    this.internalAssembly.visible = this.assembly > 0.025 || next > 0.025;
  }

  setAssembly(value) {
    const next = THREE.MathUtils.clamp(value, 0, 1);
    if (Math.abs(next - this.assembly) < 0.003) return;
    this.assembly = next;
    const eased = next * next * (3 - 2 * next);
    this.frontAssembly.position.z = eased * 13.5;
    this.rearAssembly.position.z = -eased * 14;
    this.chassis.rotation.z = eased * 0.035;
    this.internalAssembly.visible = next > 0.025 || this.optics > 0.025;

    for (const part of this.animatedParts) {
      const amount = smoothStep(part.start, 1, next);
      part.object.position.copy(part.base).addScaledVector(part.explode, amount);
    }
  }

  setFace(mode, progress = 0) {
    this.display.draw(mode, progress);
  }

  dispose() {
    const geometries = new Set();
    this.group.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);
    });
    geometries.forEach((geometry) => geometry.dispose());
    this.screenMaterial.dispose();
    this.flexMaterial.dispose();
    this.display.dispose();
    this.materials.dispose();
  }
}
