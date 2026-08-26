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
    this.draw("expedition", 0, true);
  }

  draw(mode, progress = 0, force = false) {
    const now = new Date();
    const second = now.getSeconds();
    const progressDriven = !["expedition", "sleep"].includes(mode);
    const changed = mode !== this.mode || (progressDriven && Math.abs(progress - this.lastProgress) > 0.025);
    if (!force && !changed && (mode !== "expedition" || second === this.lastSecond)) return false;

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
    else this.drawExpedition(now);

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

  drawExpedition(now) {
    const ctx = this.context;
    const seconds = now.getSeconds();

    const glow = ctx.createRadialGradient(CX, CY, 24, CX, CY, 400);
    glow.addColorStop(0, "#0d130c");
    glow.addColorStop(0.55, "#070b07");
    glow.addColorStop(1, "#010201");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // Slim quarter ring with a sweeping seconds marker.
    ctx.save();
    ctx.translate(CX, CY + 10);
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * TAU - Math.PI / 2;
      const quarter = i % 15 === 0;
      const inner = quarter ? 304 : 322;
      const outer = 346;
      ctx.strokeStyle = quarter ? "rgba(198,255,74,.9)" : "rgba(255,255,255,.16)";
      ctx.lineWidth = quarter ? 7 : 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.stroke();
    }
    ctx.restore();

    const sAngle = (seconds / 60) * TAU - Math.PI / 2;
    ctx.fillStyle = "#ff5a1f";
    ctx.beginPath();
    ctx.arc(CX + Math.cos(sAngle) * 325, CY + 10 + Math.sin(sAngle) * 325, 7, 0, TAU);
    ctx.fill();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255,255,255,.5)";
    ctx.font = "600 24px Inter, sans-serif";
    ctx.letterSpacing = "3px";
    const day = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][now.getDay()];
    ctx.fillText(`${day} ${now.getDate()}`, CX, CY - 46);

    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    ctx.fillStyle = "#f7f7f2";
    ctx.font = "650 96px Inter, sans-serif";
    ctx.fillText(`${hh}:${mm}`, CX, CY + 16);

    ctx.fillStyle = "#c6ff4a";
    ctx.font = "700 22px Inter, sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("48MM · TITANIUM", CX, CY + 96);

    ctx.fillStyle = "rgba(255,255,255,.6)";
    ctx.font = "700 24px Inter, sans-serif";
    ctx.letterSpacing = "7px";
    ctx.fillText("ISPY", CX, H - 64);
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
