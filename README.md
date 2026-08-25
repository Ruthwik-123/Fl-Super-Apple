# Apple Watch Ultra 3 — Scroll Presentation

An Apple-style product page: a pinned WebGL canvas, a procedural 3D Ultra 3, and copy that drives the model as you scroll.

## Plan

1. **Pinned 3D stage** — `three.js` canvas stays full-viewport while chapters scroll over it.
2. **Procedural Ultra 3** — Grade 5 titanium case, sapphire face, orange Action button, Digital Crown, Ocean / Alpine / Trail bands, back sensors, and an exploded S10 + battery interior. No external GLB required.
3. **Scroll timeline** — progress `0–1` interpolates camera, rotation, explode distance, finish (natural ↔ black), band type, lighting, and watch-face mode.
4. **Chapters** — Hero → titanium → display → Action button → durability / water → satellite → internals / battery → bands → finishes → close.
5. **Apple-like UI** — SF-adjacent typography, dark studio, progress bar, chapter rail, reduced-motion fallback.

## Run

Serve the folder (ES modules) and open the site:

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Then visit `http://localhost:8080`.
