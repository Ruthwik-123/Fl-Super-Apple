import * as THREE from "three";
import { AdaptiveQuality } from "./core/quality.js";
import { ProductWatch } from "./product/watch-model.js";
import { SignalField } from "./scene/signal-field.js";
import { StudioRig } from "./scene/studio-rig.js";
import { StoryTimeline } from "./story/timeline.js";

export class Experience {
  constructor(canvas) {
    this.canvas = canvas;
    this.quality = new AdaptiveQuality();
    this.timeline = new StoryTimeline();
    this.sections = Array.from(document.querySelectorAll(".chapter"));
    this.chapterButtons = Array.from(document.querySelectorAll(".chapters button"));
    this.progressBar = document.getElementById("progress-bar");
    this.stops = [];
    this.targetProgress = 0;
    this.visibleProgress = -1;
    this.lastChapter = -1;
    this.frame = 0;
    this.lastTime = performance.now();
    this.lastWidth = 0;
    this.lastHeight = 0;
    this.firstFrame = true;
    this.isDestroyed = false;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: this.quality.antialias,
      alpha: false,
      depth: true,
      stencil: false,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.shadowMap.enabled = this.quality.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x000000, 1);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.camera = new THREE.PerspectiveCamera(31, 1, 0.35, 220);
    this.camera.position.set(7, 3, 64);

    this.studio = new StudioRig(this.renderer, this.scene, this.quality.shadows);
    this.watch = new ProductWatch(this.renderer, this.quality.mobile);
    this.scene.add(this.watch.group);
    this.signalField = new SignalField(this.scene);

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.render = this.render.bind(this);
    this.onVisibility = this.onVisibility.bind(this);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
    this.faceTimer = window.setInterval(() => this.requestRender(), 1000);

    this.onResize();
    this.onScroll();
    this.requestRender();
  }

  onVisibility() {
    if (!document.hidden) {
      this.lastTime = performance.now();
      this.requestRender();
    }
  }

  onScroll() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    this.targetProgress = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
    this.requestRender();
  }

  onResize() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    this.lastWidth = width;
    this.lastHeight = height;
    this.quality.mobile = window.matchMedia("(max-width: 860px), (pointer: coarse)").matches;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(this.quality.pixelRatio(width, height));
    this.renderer.setSize(width, height, false);
    this.computeStops();
    this.onScroll();
  }

  computeStops() {
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    this.stops = this.sections.map((section) => {
      const center = section.offsetTop + section.offsetHeight * 0.5 - window.innerHeight * 0.5;
      return THREE.MathUtils.clamp(center / maxScroll, 0, 1);
    });
  }

  requestRender() {
    if (!this.frame && !this.isDestroyed && !document.hidden) {
      this.frame = requestAnimationFrame(this.render);
    }
  }

  applyState(state) {
    const mobile = this.quality.mobile;
    let nextFov = state.fov;
    if (mobile) {
      this.camera.position.set(state.camera.x * 0.18, state.camera.y + 4.8, state.camera.z + 7);
      nextFov = Math.max(36, state.fov + 6);
      this.watch.group.position.set(state.product.x * 0.12, state.product.y + 4.7, state.product.z);
      this.camera.lookAt(state.target.x * 0.1, state.target.y + 4.1, state.target.z);
    } else {
      this.camera.position.copy(state.camera);
      this.watch.group.position.copy(state.product);
      this.camera.lookAt(state.target);
    }
    if (Math.abs(this.camera.fov - nextFov) > 0.001) {
      this.camera.fov = nextFov;
      this.camera.updateProjectionMatrix();
    }
    this.watch.group.quaternion.copy(state.quaternion);
    this.watch.setFinish(state.finish);
    this.watch.setBand(state.band);
    this.watch.setOptics(state.optics);
    this.watch.setAssembly(state.assembly);
    this.watch.setFace(state.face, state.faceProgress);
    this.studio.update(state);
    this.signalField.update(state, this.watch.group.position);

    if (this.progressBar) this.progressBar.style.transform = `scaleX(${this.visibleProgress})`;
    if (state.chapter !== this.lastChapter) {
      this.lastChapter = state.chapter;
      this.chapterButtons.forEach((button, index) => {
        const active = index === state.chapter;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-current", active ? "step" : "false");
      });
    }
  }

  render(now) {
    this.frame = 0;
    if (this.isDestroyed || document.hidden) return;
    const delta = Math.min(50, Math.max(0.1, now - this.lastTime));
    this.lastTime = now;

    if (this.visibleProgress < 0 || this.quality.reducedMotion) {
      this.visibleProgress = this.targetProgress;
    } else {
      const smoothing = 1 - Math.exp(-delta * 0.0115);
      this.visibleProgress = THREE.MathUtils.lerp(this.visibleProgress, this.targetProgress, smoothing);
    }
    if (Math.abs(this.targetProgress - this.visibleProgress) < 0.00002) {
      this.visibleProgress = this.targetProgress;
    }

    const moving = this.visibleProgress !== this.targetProgress;
    const state = this.timeline.sample(this.visibleProgress, this.stops);
    this.applyState(state);
    this.renderer.render(this.scene, this.camera);

    if (!this.firstFrame && moving && this.quality.sample(delta)) {
      this.renderer.setPixelRatio(this.quality.pixelRatio(this.lastWidth, this.lastHeight));
      this.renderer.setSize(this.lastWidth, this.lastHeight, false);
    }
    this.firstFrame = false;

    if (moving) this.requestRender();
  }

  destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.frame);
    clearInterval(this.faceTimer);
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.watch.dispose();
    this.signalField.dispose();
    this.studio.dispose();
    this.renderer.dispose();
  }
}
