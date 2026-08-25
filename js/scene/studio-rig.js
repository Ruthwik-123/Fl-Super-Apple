import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createBackgroundTexture } from "../product/textures.js";

export class StudioRig {
  constructor(renderer, scene, shadows = true) {
    this.renderer = renderer;
    this.scene = scene;
    this.warm = new THREE.Color(0xffead2);
    this.cool = new THREE.Color(0xb9d9ff);

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const room = new RoomEnvironment();
    this.environmentTarget = pmrem.fromScene(room, 0.045);
    scene.environment = this.environmentTarget.texture;
    scene.environmentIntensity = 0.72;
    pmrem.dispose();
    room.traverse((object) => {
      object.geometry?.dispose();
      if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
      else object.material?.dispose();
    });

    this.ambient = new THREE.HemisphereLight(0xdbe7f2, 0x100d0a, 0.62);
    this.key = new THREE.DirectionalLight(0xffead2, 3.2);
    this.key.position.set(28, 38, 46);
    this.key.target.position.set(2, 0, 0);
    this.key.castShadow = shadows;
    this.key.shadow.mapSize.set(shadows ? 1536 : 512, shadows ? 1536 : 512);
    this.key.shadow.camera.left = -34;
    this.key.shadow.camera.right = 34;
    this.key.shadow.camera.top = 34;
    this.key.shadow.camera.bottom = -34;
    this.key.shadow.camera.near = 10;
    this.key.shadow.camera.far = 125;
    this.key.shadow.bias = -0.0003;
    this.key.shadow.normalBias = 0.035;

    this.fill = new THREE.RectAreaLight(0xc9dcff, 18, 24, 38);
    this.fill.position.set(-27, 5, 30);
    this.fill.lookAt(0, 0, 0);
    this.rim = new THREE.RectAreaLight(0xffffff, 24, 14, 42);
    this.rim.position.set(24, 14, -20);
    this.rim.lookAt(0, 0, 0);
    this.top = new THREE.RectAreaLight(0xfff1dc, 11, 30, 12);
    this.top.position.set(0, 35, 4);
    this.top.lookAt(0, 0, 0);

    scene.add(this.ambient, this.key, this.key.target, this.fill, this.rim, this.top);

    this.floorMaterial = new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.42 });
    this.floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 90), this.floorMaterial);
    this.floor.name = "Studio shadow floor";
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -24.1;
    this.floor.receiveShadow = shadows;
    scene.add(this.floor);

    this.backgroundMaterial = new THREE.MeshBasicMaterial({
      map: createBackgroundTexture(),
      color: 0x111315,
      depthWrite: false,
      fog: false,
    });
    this.background = new THREE.Mesh(new THREE.PlaneGeometry(150, 95), this.backgroundMaterial);
    this.background.name = "Studio cyclorama";
    this.background.position.set(0, 5, -44);
    this.background.renderOrder = -10;
    scene.add(this.background);
  }

  update(state) {
    this.key.intensity = state.key;
    this.fill.intensity = state.fill;
    this.rim.intensity = state.rim;
    this.key.color.lerpColors(this.warm, this.cool, state.cool);
    this.fill.color.lerpColors(this.cool, this.warm, Math.max(0, 0.28 - state.cool * 0.2));
    this.rim.color.lerpColors(this.warm, this.cool, Math.min(1, state.cool * 1.08));
    this.backgroundMaterial.color.copy(state.backdrop).multiplyScalar(1.15);
    this.floorMaterial.opacity = THREE.MathUtils.lerp(0.5, 0.32, state.cool);
  }

  dispose() {
    this.environmentTarget.dispose();
    this.floor.geometry.dispose();
    this.floorMaterial.dispose();
    this.background.geometry.dispose();
    this.backgroundMaterial.map.dispose();
    this.backgroundMaterial.dispose();
  }
}
