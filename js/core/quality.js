const MOBILE_QUERY = "(max-width: 860px), (pointer: coarse)";

/**
 * Keeps resolution predictable across dense displays and scales down only after
 * sustained slow frames. Geometry and textures remain identical, so quality
 * changes never pop during a shot.
 */
export class AdaptiveQuality {
  constructor() {
    this.mobile = window.matchMedia(MOBILE_QUERY).matches;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.scale = 1;
    this.samples = 0;
    this.totalFrameTime = 0;
    this.cooldown = 0;
  }

  get antialias() {
    return !this.mobile;
  }

  get shadows() {
    return !this.mobile;
  }

  pixelRatio(width, height) {
    const native = window.devicePixelRatio || 1;
    const maxDpr = this.mobile ? 1.25 : 1.65;
    const maxEdge = this.mobile ? 1500 : 2300;
    const edgeLimit = maxEdge / Math.max(width, height);
    return Math.max(0.75, Math.min(native, maxDpr, edgeLimit) * this.scale);
  }

  sample(deltaMs) {
    if (this.cooldown > 0) {
      this.cooldown--;
      return false;
    }
    if (deltaMs <= 0 || deltaMs > 120) return false;

    this.totalFrameTime += deltaMs;
    this.samples++;
    if (this.samples < 90) return false;

    const average = this.totalFrameTime / this.samples;
    this.samples = 0;
    this.totalFrameTime = 0;

    if (average > 23 && this.scale > 0.76) {
      this.scale = Math.max(0.75, this.scale - 0.12);
      this.cooldown = 180;
      return true;
    }
    if (average < 15 && this.scale < 1) {
      this.scale = Math.min(1, this.scale + 0.08);
      this.cooldown = 240;
      return true;
    }
    return false;
  }
}
