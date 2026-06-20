# Project: 3D Portfolio

## Stack
- Vite + React + React Three Fiber (R3F) + Drei + Tailwind
- 3D scenes live in `src/components/canvas/`
- UI/DOM overlay lives in `src/components/ui/`
- One persistent `<Canvas>` mounted behind the DOM; sections scroll *over* it

## Performance
- Lazy-load all GLTF/heavy models; wrap in `<Suspense>` with themed fallbacks.
- Keep the bundle lean — code-split routes/sections.

## Component Conventions
- Shaders in their own files (`.glsl` or template strings in `src/shaders/`), commented.
- Tailwind for all DOM/overlay styling; CSS modules only if Tailwind can't express it.

## Definition of Done per step
- Compiles, runs on `npm run dev`, no console errors.
