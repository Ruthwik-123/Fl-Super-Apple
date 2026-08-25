import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import { AppleWatchUltra } from "./watch.js";
import { sampleTimeline } from "./timeline.js";

export class Experience {
  constructor(canvas) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    this.progress = 0;
    this.smooth = 0;
    this.pointer = new THREE.Vector2(0, 0);
    this.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 1);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(window.innerWidth, window.innerHeight);
    this.labelRenderer.domElement.style.position = "fixed";
    this.labelRenderer.domElement.style.inset = "0";
    this.labelRenderer.domElement.style.pointerEvents = "none";
    this.labelRenderer.domElement.style.zIndex = "12";
    document.body.appendChild(this.labelRenderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.studioEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = this.studioEnv;

    this.camera = new THREE.PerspectiveCamera(28, window.innerWidth / window.innerHeight, 0.1, 800);
    this.camera.position.set(0, 8, 120);
    this.camTarget = new THREE.Vector3();

    this.key = new THREE.DirectionalLight(0xfff4e5, 2.4);
    this.key.position.set(40, 60, 50);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(1024, 1024);
    this.fill = new THREE.DirectionalLight(0xa8c4ff, 0.55);
    this.fill.position.set(-50, 10, 20);
    this.rim = new THREE.DirectionalLight(0xffffff, 1.1);
    this.rim.position.set(0, 20, -60);
    this.ambient = new THREE.AmbientLight(0xffffff, 0.22);
    this.scene.add(this.key, this.fill, this.rim, this.ambient);

    this.watch = new AppleWatchUltra();
    this.scene.add(this.watch.group);

    this.floor = new THREE.Mesh(
      new THREE.CircleGeometry(90, 48),
      new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.9,
        metalness: 0,
        transparent: true,
        opacity: 0.45,
      })
    );
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.y = -48;
    this.floor.receiveShadow = true;
    this.scene.add(this.floor);

    this.bubbles = this.makeBubbles();
    this.stars = this.makeStars();
    this.scene.add(this.bubbles, this.stars);

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onPointer = this.onPointer.bind(this);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointermove", this.onPointer, { passive: true });
    this.onScroll();
    this.onResize();

    this.raf = this.raf.bind(this);
    this.renderer.setAnimationLoop(this.raf);
  }

  makeBubbles() {
    const count = 140;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 140;
      pos[i * 3 + 1] = Math.random() * 120 - 40;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x9adfff,
      size: 0.9,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    return pts;
  }

  makeStars() {
    const count = 500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 400;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 260;
      pos[i * 3 + 2] = -80 - Math.random() * 200;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    return new THREE.Points(geo, mat);
  }

  onPointer(e) {
    this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }

  onScroll() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    this.progress = window.scrollY / max;
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.labelRenderer.setSize(w, h);
    this.isMobile = w < 860;
  }

  applyEnv(name) {
    if (name === "underwater") {
      this.renderer.setClearColor(0x02141c, 1);
      this.scene.fog = new THREE.FogExp2(0x02141c, 0.012);
      this.key.color.set(0x7fd0ff);
      this.key.intensity = 1.6;
      this.fill.color.set(0x146a88);
      this.rim.intensity = 0.4;
      this.bubbles.material.opacity = 0.7;
      this.stars.material.opacity = 0;
      this.renderer.toneMappingExposure = 0.9;
    } else if (name === "night") {
      this.renderer.setClearColor(0x010208, 1);
      this.scene.fog = new THREE.FogExp2(0x010208, 0.006);
      this.key.color.set(0xc9d7ff);
      this.key.intensity = 1.2;
      this.fill.intensity = 0.25;
      this.rim.intensity = 1.6;
      this.bubbles.material.opacity = 0;
      this.stars.material.opacity = 0.9;
      this.renderer.toneMappingExposure = 0.85;
    } else if (name === "bright") {
      this.renderer.setClearColor(0x050505, 1);
      this.scene.fog = null;
      this.key.color.set(0xfff6ea);
      this.key.intensity = 3.1;
      this.fill.intensity = 0.7;
      this.rim.intensity = 1.3;
      this.bubbles.material.opacity = 0;
      this.stars.material.opacity = 0;
      this.renderer.toneMappingExposure = 1.2;
    } else {
      this.renderer.setClearColor(0x000000, 1);
      this.scene.fog = null;
      this.key.color.set(0xfff4e5);
      this.key.intensity = 2.4;
      this.fill.color.set(0xa8c4ff);
      this.fill.intensity = 0.55;
      this.rim.color.set(0xffffff);
      this.rim.intensity = 1.1;
      this.bubbles.material.opacity = 0;
      this.stars.material.opacity = 0;
      this.renderer.toneMappingExposure = 1.05;
    }
  }

  raf() {
    const dt = this.clock.getDelta();
    const elapsed = this.clock.elapsedTime;
    const mix = this.reduce ? 1 : 1 - Math.pow(0.001, dt);
    this.smooth += (this.progress - this.smooth) * (this.reduce ? 1 : 0.075 + mix * 0.02);

    const state = sampleTimeline(this.smooth);
    this.applyEnv(state.env);

    const mobileShift = this.isMobile ? -state.pos.x : 0;
    this.camera.position.lerp(
      new THREE.Vector3(state.cam.x + mobileShift * 0.4, state.cam.y, state.cam.z),
      this.reduce ? 1 : 0.08
    );
    this.camTarget.lerp(
      new THREE.Vector3(state.target.x + mobileShift * 0.4, state.target.y, state.target.z),
      this.reduce ? 1 : 0.08
    );
    this.camera.lookAt(this.camTarget);

    const parallax = this.reduce ? 0 : 0.12;
    this.watch.group.rotation.x = state.rot.x + this.pointer.y * parallax * 0.25;
    this.watch.group.rotation.y = state.rot.y + this.pointer.x * parallax;
    this.watch.group.rotation.z = state.rot.z;
    this.watch.group.position.set(
      this.isMobile ? 0 : state.pos.x,
      state.pos.y,
      state.pos.z
    );

    this.watch.setExplode(state.explode);
    this.watch.setFinish(state.finish);
    this.watch.setBand(state.band);
    this.watch.setScreenBoost(state.bright);
    this.watch.setFaceMode(state.face, elapsed);

    const pos = this.bubbles.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) + dt * (6 + (i % 5));
      if (y > 80) y = -40;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
    this.stars.rotation.y = elapsed * 0.01;

    const bar = document.getElementById("progress-bar");
    if (bar) bar.style.width = `${this.smooth * 100}%`;

    this._chapter = state.chapter;
    document.querySelectorAll(".chapters button").forEach((btn, i) => {
      btn.classList.toggle("is-active", i === state.chapter);
    });

    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }
}
