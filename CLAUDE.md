# Project: 3D Portfolio Rebuild
- Migrating from static HTML/CSS to Vite + React + R3F + Drei + Tailwind
- Preserve ALL real content from the original site (projects, bio, links) — no placeholder/fake text
- Use R3F declarative components, keep 3D scenes in src/components/canvas/
- Build incrementally; I will run `npm run dev` and check after each step
- Performance first: lazy-load models, <Suspense> fallbacks, static fallback on mobile
- Match the visual references I provide, not generic AI styling