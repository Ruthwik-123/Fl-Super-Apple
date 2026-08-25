export function createWatchFace() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 312;
  const ctx = canvas.getContext("2d", { alpha: false });
  let mode = "";

  const draw = (time = 0, next = "wayfinder") => {
    if (next === mode) return false;
    mode = next;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    ctx.fillStyle = "#0b0f0c";
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (next === "dive") {
      ctx.fillStyle = "#02151f";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#7fe9ff";
      ctx.font = "600 14px sans-serif";
      ctx.fillText("DIVE", cx, 48);
      ctx.fillStyle = "#fff";
      ctx.font = "700 52px sans-serif";
      ctx.fillText("18.4", cx, cy);
      ctx.fillStyle = "#7fe9ff";
      ctx.font = "500 12px sans-serif";
      ctx.fillText("METERS", cx, cy + 36);
    } else if (next === "run") {
      ctx.fillStyle = "#140b08";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ff5a1f";
      ctx.font = "600 12px sans-serif";
      ctx.fillText("OUTDOOR RUN", cx, 48);
      ctx.fillStyle = "#fff";
      ctx.font = "700 44px sans-serif";
      ctx.fillText("3.21", cx, cy);
      ctx.font = "500 11px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("KM", cx, cy + 32);
    } else if (next === "satellite") {
      ctx.fillStyle = "#07070c";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9ad0ff";
      ctx.font = "600 12px sans-serif";
      ctx.fillText("SATELLITE", cx, 48);
      ctx.strokeStyle = "#9ad0ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 46, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = "600 13px sans-serif";
      ctx.fillText("Connecting", cx, h - 56);
    } else if (next === "sleep") {
      ctx.fillStyle = "#120818";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c9b6ff";
      ctx.font = "600 12px sans-serif";
      ctx.fillText("SLEEP SCORE", cx, 52);
      ctx.fillStyle = "#fff";
      ctx.font = "700 64px sans-serif";
      ctx.fillText("86", cx, cy);
    } else if (next === "battery") {
      ctx.fillStyle = "#0b0f0c";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c6ff4a";
      ctx.font = "600 12px sans-serif";
      ctx.fillText("BATTERY", cx, 52);
      ctx.fillStyle = "#fff";
      ctx.font = "700 52px sans-serif";
      ctx.fillText("42h", cx, cy);
    } else {
      ctx.fillStyle = "#0c120e";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(198,255,74,0.35)";
      ctx.lineWidth = 1;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 92, cy + Math.sin(a) * 92);
        ctx.lineTo(cx + Math.cos(a) * 108, cy + Math.sin(a) * 108);
        ctx.stroke();
      }
      ctx.fillStyle = "#c6ff4a";
      ctx.font = "700 14px sans-serif";
      ctx.fillText("N", cx, 78);
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      ctx.fillStyle = "#f5f5f7";
      ctx.font = "600 28px sans-serif";
      ctx.fillText(`${hh}:${mm}`, cx, 52);
      ctx.strokeStyle = "#ff5a1f";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + 4, cy - 70);
      ctx.stroke();
      ctx.fillStyle = "#ff5a1f";
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#c6ff4a";
      ctx.font = "600 10px sans-serif";
      ctx.fillText("ULTRA 3", cx, h - 36);
    }
    return true;
  };

  draw(0, "wayfinder");
  return { draw, canvas };
}
