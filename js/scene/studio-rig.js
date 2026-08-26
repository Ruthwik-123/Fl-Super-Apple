import * as THREE from "three";
import { createBackgroundTexture } from "../product/textures.js";

export class StudioRig {
  constructor(renderer, scene, shadows = true) {
    this.renderer = renderer;
    this.scene = scene;
    this.warm = new THREE.Color(0xffead2);
    this.cool = new THREE.Color(0xb9d9ff);

    this.environmentTarget = this.buildEnvironment(renderer);
    scene.environment = this.environmentTarget.texture;
    scene.environmentIntensity = 0.95;

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

  /**
   * Builds a high-contrast studio environment (dark dome + HDR softboxes and
   * rim strips) for crisp, realistic reflections on the titanium and sapphire.
   */
  buildEnvironment(renderer) {
    const env = new THREE.Scene();
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(60, 32, 16),
      new THREE.MeshBasicMaterial({ color: 0x050607, side: THREE.BackSide })
    );
    env.add(dome);

    const panel = (width, height, r, g, b, position) => {
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setRGB(r, g, b, THREE.LinearSRGBColorSpace),
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
      mesh.position.set(...position);
      mesh.lookAt(0, 0, 0);
      env.add(mesh);
    };

    panel(12, 7, 9, 7.4, 5.8, [-9, 7, 9]); // warm key softbox
    panel(10, 10, 3.2, 4.6, 6.6, [9, 3, 5]); // cool fill
    panel(15, 2.2, 10, 9, 8, [0, 12, -12]); // bright rim strip
    panel(16, 9, 4.6, 4.8, 5.3, [0, 24, 0]); // top softbox
    panel(14, 3, 1.3, 1.1, 0.9, [0, -9, 0]); // floor bounce

    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const target = pmrem.fromScene(env, 0.045);
    pmrem.dispose();
    env.traverse((object) => {
      object.geometry?.dispose();
      object.material?.dispose();
    });
    return target;
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
