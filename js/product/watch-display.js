import * as THREE from "three";

const W = 768;
const H = 864;
const CX = W / 2;
const CY = H / 2;
const TAU = Math.PI * 2;

export class WatchDisplay {
  constructor(maxAnisotropy = 4) {
    this.canvas = document.createElement("canvas");
    this.canvas.width = W;
    this.canvas.height = H;
    this.context = this.canvas.getContext("2d", { alpha: false });
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;
    this.texture.anisotropy = Math.min(maxAnisotropy, 8);
    this.mode = "";
    this.lastSecond = -1;
    this.lastProgress = -1;
    this.draw("wayfinder", 0, true);
  }

  draw(mode, progress = 0, force = false) {
    const now = new Date();
    const second = now.getSeconds();
    const progressDriven = !["wayfinder", "sleep"].includes(mode);
    const changed = mode !== this.mode || (progressDriven && Math.abs(progress - this.lastProgress) > 0.025);
    if (!force && !changed && (mode !== "wayfinder" || second === this.lastSecond)) return false;

    this.mode = mode;
    this.lastSecond = second;
    this.lastProgress = progress;
    const ctx = this.context;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#030504";
    ctx.fillRect(0, 0, W, H);

    if (mode === "optics") this.drawOptics(progress);
    else if (mode === "armor") this.drawMetric("STRUCTURE", "3.0t", "DIRECT FORCE", "#ff5a1f", progress);
    else if (mode === "cell") this.drawCell(progress);
    else if (mode === "core") this.drawCore(progress);
    else if (mode === "link") this.drawLink(progress);
    else if (mode === "sleep") this.drawSleep();
    else this.drawWayfinder(now);

    this.texture.needsUpdate = true;
    return true;
  }

  header(label, color = "#c6ff4a") {
    const ctx = this.context;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = color;
    ctx.font = "600 25px Inter, sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText(label, CX, 82);
  }

  drawWayfinder(now) {
    const ctx = this.context;
    const glow = ctx.createRadialGradient(CX, CY, 20, CX, CY, 390);
    glow.addColorStop(0, "#10170e");
    glow.addColorStop(0.55, "#080c07");
    glow.addColorStop(1, "#010201");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(CX, CY + 15);
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * TAU - Math.PI / 2;
      const major = i % 5 === 0;
      const inner = major ? 300 : 322;
      const outer = 345;
      ctx.strokeStyle = major ? "#d8ff79" : "rgba(198,255,74,.28)";
      ctx.lineWidth = major ? 6 : 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.stroke();
    }
    ctx.restore();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#c6ff4a";
    ctx.font = "700 34px Inter, sans-serif";
    ctx.fillText("N", CX, 130);
    ctx.fillStyle = "rgba(255,255,255,.54)";
    ctx.font = "600 21px Inter, sans-serif";
    ctx.fillText("270°", 116, CY + 18);
    ctx.fillText("90°", W - 116, CY + 18);

    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    ctx.fillStyle = "#f7f7f2";
    ctx.font = "650 64px Inter, sans-serif";
    ctx.fillText(`${hh}:${mm}`, CX, 58);

    const hour = (now.getHours() % 12 + now.getMinutes() / 60) / 12 * TAU - Math.PI / 2;
    const minute = (now.getMinutes() + now.getSeconds() / 60) / 60 * TAU - Math.PI / 2;
    const second = now.getSeconds() / 60 * TAU - Math.PI / 2;
    this.hand(hour, 148, 15, "#f5f5f0");
    this.hand(minute, 230, 10, "#f5f5f0");
    this.hand(second, 266, 4, "#ff5a1f");

    ctx.fillStyle = "#ff5a1f";
    ctx.beginPath();
    ctx.arc(CX, CY + 15, 15, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(CX, CY + 15, 5, 0, TAU);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,.68)";
    ctx.font = "500 20px Inter, sans-serif";
    ctx.fillText("52 m", CX, H - 94);
    ctx.fillStyle = "#c6ff4a";
    ctx.font = "700 21px Inter, sans-serif";
    ctx.letterSpacing = "5px";
    ctx.fillText("ISPY", CX, H - 50);
  }

  hand(angle, length, width, color) {
    const ctx = this.context;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(CX - Math.cos(angle) * 30, CY + 15 - Math.sin(angle) * 30);
    ctx.lineTo(CX + Math.cos(angle) * length, CY + 15 + Math.sin(angle) * length);
    ctx.stroke();
  }

  drawOptics(progress) {
    const ctx = this.context;
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, "#071311");
    gradient.addColorStop(1, "#020605");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    this.header("OPTICS");

    ctx.strokeStyle = "rgba(198,255,74,.52)";
    ctx.lineWidth = 3;
    [102, 190, 282].forEach((radius) => {
      ctx.beginPath();
      ctx.arc(CX, CY + 18, radius, 0, TAU);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(70, CY + 18);
    ctx.lineTo(W - 70, CY + 18);
    ctx.moveTo(CX, 145);
    ctx.lineTo(CX, H - 120);
    ctx.stroke();

    const sweep = -Math.PI / 2 + progress * TAU;
    ctx.strokeStyle = "#c6ff4a";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(CX, CY + 18, 282, -Math.PI / 2, sweep);
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "700 104px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("1.25", CX, CY - 5);
    ctx.fillStyle = "#c6ff4a";
    ctx.font = "600 25px Inter, sans-serif";
    ctx.letterSpacing = "7px";
    ctx.fillText("GIGAPIXELS", CX, CY + 78);
    ctx.fillStyle = "rgba(255,255,255,.58)";
    ctx.font = "500 20px Inter, sans-serif";
    ctx.fillText("512 MP NATIVE  •  ARRAY LOCKED", CX, H - 64);
  }

  drawMetric(label, value, subline, color, progress) {
    const ctx = this.context;
    const gradient = ctx.createRadialGradient(CX, CY, 0, CX, CY, 430);
    gradient.addColorStop(0, "#17100d");
    gradient.addColorStop(1, "#040201");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    this.header(label, color);
    ctx.strokeStyle = "rgba(255,90,31,.28)";
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(CX, CY + 10, 254, -Math.PI * 0.82, Math.PI * 0.82);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(CX, CY + 10, 254, -Math.PI * 0.82, -Math.PI * 0.82 + Math.PI * 1.64 * progress);
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "700 150px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(value, CX, CY + 10);
    ctx.fillStyle = "rgba(255,255,255,.56)";
    ctx.font = "600 23px Inter, sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText(subline, CX, CY + 116);
  }

  drawCell(progress) {
    const ctx = this.context;
    this.header("ISOTOPE CELL");
    const x = 135;
    const y = 260;
    const width = 498;
    const height = 280;
    ctx.strokeStyle = "rgba(255,255,255,.25)";
    ctx.lineWidth = 5;
    ctx.strokeRect(x, y, width, height);
    const fill = ctx.createLinearGradient(x, 0, x + width, 0);
    fill.addColorStop(0, "#759f25");
    fill.addColorStop(1, "#c6ff4a");
    ctx.fillStyle = fill;
    ctx.fillRect(x + 15, y + 15, (width - 30) * Math.max(0.08, progress), height - 30);
    ctx.fillStyle = "#fff";
    ctx.font = "700 112px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("90d", CX, CY + 12);
    ctx.fillStyle = "rgba(255,255,255,.58)";
    ctx.font = "600 23px Inter, sans-serif";
    ctx.fillText("PER SEALED CYCLE", CX, CY + 92);
    ctx.fillText("40 CYCLES  •  10 YEARS", CX, H - 74);
  }

  drawCore(progress) {
    const ctx = this.context;
    this.header("CORE");
    ctx.strokeStyle = "rgba(198,255,74,.22)";
    ctx.lineWidth = 2;
    const spacing = 54;
    for (let x = 60; x < W; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 140);
      ctx.lineTo(x, H - 80);
      ctx.stroke();
    }
    for (let y = 160; y < H - 60; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(44, y);
      ctx.lineTo(W - 44, y);
      ctx.stroke();
    }
    const pulse = 0.8 + progress * 0.2;
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${Math.round(112 * pulse)}px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("256TB", CX, CY - 12);
    ctx.fillStyle = "#c6ff4a";
    ctx.font = "650 27px Inter, sans-serif";
    ctx.letterSpacing = "5px";
    ctx.fillText("1 TB HBM", CX, CY + 83);
    ctx.fillStyle = "rgba(255,255,255,.58)";
    ctx.font = "500 21px Inter, sans-serif";
    ctx.fillText("PICOMETER SILICON  •  CORE ONLINE", CX, H - 70);
  }

  drawLink(progress) {
    const ctx = this.context;
    this.header("LINK", "#8ecbff");
    ctx.save();
    ctx.translate(CX, CY + 10);
    for (let i = 1; i <= 4; i++) {
      ctx.strokeStyle = `rgba(142,203,255,${0.13 + i * 0.08})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 64 * i * (0.8 + progress * 0.2), 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#8ecbff";
    for (let i = 0; i < 7; i++) {
      const angle = i * 2.4;
      const radius = 90 + i * 28;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 9, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = "#fff";
    ctx.font = "700 74px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("245 km", CX, H - 130);
    ctx.fillStyle = "rgba(255,255,255,.56)";
    ctx.font = "500 21px Inter, sans-serif";
    ctx.fillText("MESH FIX  •  25 TB/s", CX, H - 76);
  }

  drawSleep() {
    const ctx = this.context;
    const gradient = ctx.createRadialGradient(CX, CY, 0, CX, CY, 390);
    gradient.addColorStop(0, "#0e1113");
    gradient.addColorStop(1, "#020303");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,.78)";
    ctx.font = "600 62px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("iSPY", CX, CY);
  }

  dispose() {
    this.texture.dispose();
  }
}
