# Project: 3D Portfolio Rebuild

## Stack
- Vite + React + React Three Fiber (R3F) + Drei + Tailwind
- 3D scenes live in `src/components/canvas/`
- UI/DOM overlay lives in `src/components/ui/`
- One persistent `<Canvas>` mounted behind the DOM; sections scroll *over* it


## Visual Direction
- **Use from richardmattka.com**
  - Full-viewport shader background that reacts subtly to mouse/scroll.
  - prev / next project navigation with eased camera or content transitions.
  - Floating UI chrome (corner labels, index counters, social icons) layered over the canvas.


## Performance
- Lazy-load all GLTF/heavy models; wrap in `<Suspense>` with themed fallbacks.
- Detect mobile / low-power: serve a static or drastically simplified shader fallback (no heavy postprocessing).
- Throttle scroll/mouse handlers; cap pixel ratio (`dpr={[1, 2]}`).
- Keep the bundle lean — code-split routes/sections.

## Component Conventions
- R3F declarative components only (no imperative three.js soup in effects unless wrapped properly).
- Shaders in their own files (`.glsl` or template strings in `src/shaders/`), commented.
- Tailwind for all DOM/overlay styling; CSS modules only if Tailwind can't express it.

## Definition of Done per step
- Compiles, runs on `npm run dev`, no console errors.
- Uses only real inventoried content.
- Visually consistent with the Wuthering Waves + cyberpunk theme.
- Degrades gracefully on mobile.
