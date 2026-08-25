# iSPY 2 Pro Max — 3D Product Story

A scroll-directed, physically based product film rendered in real time with Three.js. The watch is a modular procedural assembly: titanium chassis, sapphire/OLED stack, controls, ceramic sensor back, three bands, optics, battery, board, shielding, memory, haptics, contacts, and flex paths.

## Run

```bash
npm install
npm run dev
```

The development server binds to `0.0.0.0`. Create an optimized production bundle with `npm run build`.

## Validation

```bash
npm run check
```

This checks geometry integrity and triangle budgets, samples every story track for valid bounded transforms, and creates the production bundle.

## Architecture

- `js/product/` — reusable geometry, generated textures, PBR materials, OLED drawing, and the complete mechanical assembly
- `js/scene/` — HDR-derived studio reflections, lights, cyclorama, and shadow floor
- `js/story/` — declarative shots and allocation-free timeline sampling
- `js/core/` — adaptive render quality
- `js/experience.js` — renderer lifecycle, scroll smoothing, responsive composition, and render-on-demand scheduling

## Performance strategy

The page has no external model or texture downloads. Geometry and small deterministic texture maps are generated once, repeated parts use shared geometry or instancing, the render loop sleeps when the scene is still, dense displays are capped, and sustained slow frames reduce resolution without changing scene content. Desktop uses soft shadows and higher pixel density; coarse-pointer/mobile devices use a lower-cost profile.
