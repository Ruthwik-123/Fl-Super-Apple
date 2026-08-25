import * as THREE from "three";
import { AppleWatchUltra } from "./watch.js";
import { sampleTimeline } from "./timeline.js";

export class Experience {
  constructor(canvas) {
    this.canvas = canvas;
    this.progress = 0;
    this.raf = 0;
    this.lastEnv = "";
    this.lastChapter = -1;
    this.isMobile = false;
    this.camTarget = new THREE.Vector3();
    this.bar = document.getElementById("progress-bar");
    this.chapterBtns = [];

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      stencil: false,
      depth: true,
      powerPreference: "low-power",
      precision: "mediump",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.shadowMap.enabled = false;
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setPixelRatio(1);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    this.camera = new THREE.PerspectiveCamera(34, 1, 1, 400);
    this.camera.position.set(0, 4, 80);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x22222a, 1.05);
    this.key = new THREE.DirectionalLight(0xfff2e0, 1.35);
    this.key.position.set(30, 40, 40);
    this.scene.add(hemi, this.key);

    this.watch = new AppleWatchUltra();
    this.scene.add(this.watch.group);

    this.onScroll = this.onScroll.bind(this);
    this.onResize = this.onResize.bind(this);
    this.draw = this.draw.bind(this);

    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.onResize, { passive: true });

    this.chapterBtns = Array.from(document.querySelectorAll(".chapters button"));
    this.onResize();
    this.onScroll();
    this.draw();
  }

  onScroll() {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    this.progress = window.scrollY / max;
    if (!this.raf) this.raf = requestAnimationFrame(this.draw);
  }

  onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.isMobile = w < 860;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();

    const cap = this.isMobile ? 960 : 1280;
    const longEdge = Math.max(w, h);
    const res = longEdge > cap ? cap / longEdge : 1;
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(Math.round(w * res), Math.round(h * res), false);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    if (!this.raf) this.raf = requestAnimationFrame(this.draw);
  }

  applyEnv(name) {
    if (name === this.lastEnv) return;
    this.lastEnv = name;
    if (name === "underwater") {
      this.renderer.setClearColor(0x02141c, 1);
      this.scene.background.set(0x02141c);
      this.key.color.set(0x7fd0ff);
      this.key.intensity = 1.05;
    } else if (name === "night") {
      this.renderer.setClearColor(0x010208, 1);
      this.scene.background.set(0x010208);
      this.key.color.set(0xc9d7ff);
      this.key.intensity = 0.85;
    } else if (name === "bright") {
      this.renderer.setClearColor(0x050505, 1);
      this.scene.background.set(0x050505);
      this.key.color.set(0xfff6ea);
      this.key.intensity = 1.7;
    } else {
      this.renderer.setClearColor(0x000000, 1);
      this.scene.background.set(0x000000);
      this.key.color.set(0xfff2e0);
      this.key.intensity = 1.35;
    }
  }

  draw() {
    this.raf = 0;
    const state = sampleTimeline(this.progress);
    this.applyEnv(state.env);

    const xOff = this.isMobile ? 0 : state.pos.x;
    this.camera.position.set(state.cam.x - (this.isMobile ? state.cam.x * 0.35 : 0), state.cam.y, state.cam.z);
    this.camTarget.set(this.isMobile ? 0 : state.target.x, state.target.y, state.target.z);
    this.camera.lookAt(this.camTarget);

    this.watch.group.rotation.set(state.rot.x, state.rot.y, state.rot.z);
    this.watch.group.position.set(xOff, state.pos.y, state.pos.z);
    this.watch.setExplode(state.explode);
    this.watch.setFinish(state.finish);
    this.watch.setBand(state.band);
    this.watch.setFaceMode(state.face);

    if (this.bar) this.bar.style.width = `${this.progress * 100}%`;
    if (state.chapter !== this.lastChapter) {
      this.lastChapter = state.chapter;
      for (let i = 0; i < this.chapterBtns.length; i++) {
        this.chapterBtns[i].classList.toggle("is-active", i === state.chapter);
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
