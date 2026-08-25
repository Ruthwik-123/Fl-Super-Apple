export function createWatchFace() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1248;
  const ctx = canvas.getContext("2d");
  const texture = {
    canvas,
    ctx,
    image: canvas,
    needsUpdate: true,
    mode: "wayfinder",
  };

  const draw = (time = 0, mode = "wayfinder") => {
    texture.mode = mode;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    ctx.clearRect(0, 0, w, h);

    if (mode === "dive") drawDive(ctx, w, h, cx, cy, time);
    else if (mode === "run") drawRun(ctx, w, h, cx, cy, time);
    else if (mode === "satellite") drawSatellite(ctx, w, h, cx, cy, time);
    else if (mode === "sleep") drawSleep(ctx, w, h, cx, cy);
    else if (mode === "battery") drawBattery(ctx, w, h, cx, cy);
    else drawWayfinder(ctx, w, h, cx, cy, time);

    texture.needsUpdate = true;
  };

  draw(0, "wayfinder");
  return { texture, draw, canvas };
}

function roundedClip(ctx, w, h, r) {
  ctx.beginPath();
  const x = 18;
  const y = 18;
  const rw = w - 36;
  const rh = h - 36;
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + rw, y, x + rw, y + rh, r);
  ctx.arcTo(x + rw, y + rh, x, y + rh, r);
  ctx.arcTo(x, y + rh, x, y, r);
  ctx.arcTo(x, y, x + rw, y, r);
  ctx.closePath();
  ctx.clip();
}

function fillFace(ctx, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

function clockParts(time) {
  const d = new Date();
  const ms = d.getMilliseconds();
  const s = d.getSeconds() + ms / 1000;
  const m = d.getMinutes() + s / 60;
  const hr = (d.getHours() % 12) + m / 60;
  return { d, s, m, hr, t: time };
}

function drawWayfinder(ctx, w, h, cx, cy, time) {
  fillFace(ctx, w, h, "#0c120e");
  roundedClip(ctx, w, h, 180);

  const g = ctx.createRadialGradient(cx, cy, 40, cx, cy, 620);
  g.addColorStop(0, "#1a2a1c");
  g.addColorStop(1, "#070b08");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(198,255,74,0.18)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const inner = i % 5 === 0 ? 430 : 455;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * 478, cy + Math.sin(a) * 478);
    ctx.stroke();
  }

  ctx.fillStyle = "#c6ff4a";
  ctx.font = "700 42px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const dirs = [
    ["N", 0],
    ["E", 90],
    ["S", 180],
    ["W", 270],
  ];
  dirs.forEach(([label, deg]) => {
    const a = ((deg - 90) * Math.PI) / 180;
    ctx.fillText(label, cx + Math.cos(a) * 360, cy + Math.sin(a) * 360);
  });

  const { d, s, m, hr } = clockParts(time);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  ctx.fillStyle = "#f5f5f7";
  ctx.font = "600 92px Inter, sans-serif";
  ctx.fillText(`${hh}:${mm}`, cx, 210);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "500 28px Inter, sans-serif";
  ctx.fillText("WAYFINDER  ·  1842m", cx, 280);

  drawHand(ctx, cx, cy, (hr / 12) * Math.PI * 2, 210, 14, "#f5f5f7");
  drawHand(ctx, cx, cy, (m / 60) * Math.PI * 2, 300, 10, "#f5f5f7");
  drawHand(ctx, cx, cy, (s / 60) * Math.PI * 2, 340, 5, "#ff5a1f", true);

  ctx.beginPath();
  ctx.fillStyle = "#ff5a1f";
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 26px Inter, sans-serif";
  ctx.fillText("12°C", cx - 220, h - 220);
  ctx.fillText("42h", cx + 220, h - 220);
  ctx.fillStyle = "#c6ff4a";
  ctx.font = "600 22px Inter, sans-serif";
  ctx.fillText("ULTRA 3", cx, h - 150);
}

function drawDive(ctx, w, h, cx, cy, time) {
  fillFace(ctx, w, h, "#02151f");
  roundedClip(ctx, w, h, 180);
  const g = ctx.createRadialGradient(cx, cy, 20, cx, cy, 640);
  g.addColorStop(0, "#0a4b63");
  g.addColorStop(1, "#021018");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#7fe9ff";
  ctx.font = "600 34px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("DIVE", cx, 200);

  ctx.fillStyle = "#fff";
  ctx.font = "700 160px Inter, sans-serif";
  ctx.fillText("18.4", cx, cy - 20);
  ctx.font = "500 36px Inter, sans-serif";
  ctx.fillStyle = "#7fe9ff";
  ctx.fillText("METERS", cx, cy + 90);

  const pulse = 0.5 + 0.5 * Math.sin(time * 2);
  ctx.strokeStyle = `rgba(127,233,255,${0.25 + pulse * 0.4})`;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy + 40, 340, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 28px Inter, sans-serif";
  ctx.fillText("NDL  42:00", cx - 220, h - 210);
  ctx.fillText("20.1°C", cx + 220, h - 210);
}

function drawRun(ctx, w, h, cx, cy, time) {
  fillFace(ctx, w, h, "#140b08");
  roundedClip(ctx, w, h, 180);
  ctx.fillStyle = "#1a0e0a";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#ff5a1f";
  ctx.font = "600 30px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("OUTDOOR RUN", cx, 200);

  const km = (3.2 + (time % 20) * 0.02).toFixed(2);
  ctx.fillStyle = "#fff";
  ctx.font = "700 140px Inter, sans-serif";
  ctx.fillText(km, cx, cy - 10);
  ctx.font = "500 32px Inter, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText("KILOMETERS", cx, cy + 90);

  ctx.fillStyle = "#c6ff4a";
  ctx.font = "600 36px Inter, sans-serif";
  ctx.fillText("5'18\"", cx - 230, h - 230);
  ctx.fillStyle = "#fff";
  ctx.fillText("148", cx + 230, h - 230);
  ctx.font = "500 20px Inter, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("PACE", cx - 230, h - 180);
  ctx.fillText("BPM", cx + 230, h - 180);
}

function drawSatellite(ctx, w, h, cx, cy, time) {
  fillFace(ctx, w, h, "#07070c");
  roundedClip(ctx, w, h, 180);

  ctx.fillStyle = "#9ad0ff";
  ctx.font = "600 30px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SATELLITE", cx, 210);

  for (let i = 0; i < 3; i++) {
    const p = (time * 0.4 + i * 0.33) % 1;
    ctx.strokeStyle = `rgba(154,208,255,${1 - p})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 80 + p * 280, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = "600 34px Inter, sans-serif";
  ctx.fillText("Connecting…", cx, h - 240);
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "500 24px Inter, sans-serif";
  ctx.fillText("Emergency SOS  ·  Messages", cx, h - 180);
}

function drawSleep(ctx, w, h, cx, cy) {
  fillFace(ctx, w, h, "#120818");
  roundedClip(ctx, w, h, 180);
  ctx.fillStyle = "#c9b6ff";
  ctx.font = "600 30px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SLEEP SCORE", cx, 220);
  ctx.fillStyle = "#fff";
  ctx.font = "700 180px Inter, sans-serif";
  ctx.fillText("86", cx, cy + 20);
  ctx.font = "500 32px Inter, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText("Great  ·  7h 42m", cx, cy + 160);
}

function drawBattery(ctx, w, h, cx, cy) {
  fillFace(ctx, w, h, "#0b0f0c");
  roundedClip(ctx, w, h, 180);
  ctx.fillStyle = "#c6ff4a";
  ctx.font = "600 30px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("BATTERY", cx, 220);
  ctx.fillStyle = "#fff";
  ctx.font = "700 150px Inter, sans-serif";
  ctx.fillText("42h", cx, cy + 10);
  ctx.font = "500 28px Inter, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.fillText("72h Low Power Mode", cx, cy + 150);

  ctx.strokeStyle = "#c6ff4a";
  ctx.lineWidth = 14;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, 340, Math.PI * 0.7, Math.PI * 0.7 + Math.PI * 1.7);
  ctx.stroke();
}

function drawHand(ctx, cx, cy, angle, length, width, color, extra = false) {
  const a = angle - Math.PI / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - Math.cos(a) * 40, cy - Math.sin(a) * 40);
  ctx.lineTo(cx + Math.cos(a) * length, cy + Math.sin(a) * length);
  ctx.stroke();
  if (extra) {
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * length, cy + Math.sin(a) * length);
    ctx.lineTo(cx + Math.cos(a) * (length + 24), cy + Math.sin(a) * (length + 24));
    ctx.stroke();
  }
}
