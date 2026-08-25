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

    if (next === "optics") {
      ctx.fillStyle = "#0a1210";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c6ff4a";
      ctx.font = "600 11px sans-serif";
      ctx.fillText("OPTICS", cx, 48);
      ctx.fillStyle = "#fff";
      ctx.font = "700 40px sans-serif";
      ctx.fillText("1.25", cx, cy - 6);
      ctx.fillStyle = "#c6ff4a";
      ctx.font = "500 12px sans-serif";
      ctx.fillText("GIGAPIXELS", cx, cy + 32);
    } else if (next === "cell") {
      ctx.fillStyle = "#0c120e";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c6ff4a";
      ctx.font = "600 11px sans-serif";
      ctx.fillText("CELL", cx, 48);
      ctx.fillStyle = "#fff";
      ctx.font = "700 48px sans-serif";
      ctx.fillText("90d", cx, cy);
      ctx.font = "500 11px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("PER CYCLE", cx, cy + 36);
    } else if (next === "link") {
      ctx.fillStyle = "#07070c";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#9ad0ff";
      ctx.font = "600 11px sans-serif";
      ctx.fillText("LINK", cx, 48);
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
      ctx.fillText("245 km", cx, h - 56);
    } else if (next === "core") {
      ctx.fillStyle = "#0b0f0c";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c6ff4a";
      ctx.font = "600 11px sans-serif";
      ctx.fillText("CORE", cx, 52);
      ctx.fillStyle = "#fff";
      ctx.font = "700 36px sans-serif";
      ctx.fillText("256TB", cx, cy);
      ctx.font = "500 11px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("HBM + DDR5", cx, cy + 32);
    } else if (next === "armor") {
      ctx.fillStyle = "#140b08";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ff5a1f";
      ctx.font = "600 11px sans-serif";
      ctx.fillText("STRUCTURE", cx, 48);
      ctx.fillStyle = "#fff";
      ctx.font = "700 44px sans-serif";
      ctx.fillText("3t", cx, cy);
      ctx.font = "500 11px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText("DIRECT FORCE", cx, cy + 32);
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
      ctx.fillText("iSPY", cx, h - 36);
    }
    return true;
  };

  draw(0, "wayfinder");
  return { draw, canvas };
}
