# Parity Audit — fgarcia06.github.io vs richardmattka.com

**Method.** The reference is a live WebGL site whose art assets can't be extracted, so this is
*not* a pixel diff. I studied the reference's actual page source (`main.js`, `views.js`,
`webgl.js`, `data/site.js`, `css/style.css` are served unminified) and rebuilt the same
structure, timings, and CSS values in Vite + React + R3F + Tailwind, then compared headless
screenshots of both sites at 1440px and 390px. Screenshots live in `audit/`
(`mine-*` = this build at `localhost:4173`, `ref-*` = richardmattka.com captured the same day).
Long pages were captured with a 2400px-tall viewport on both sites, so `vh`-based spacing is
stretched identically in both columns.

Verdict in one line: **structure, motion, and choreography match closely; the open gaps are
content I don't have (art, press, reel, audio, project imagery), not behavior.**

---

## 1. Page/section set and order

| Reference | Mine | Status | Note |
|---|---|---|---|
| home | home | **PASS** | Same letterboxed landing: name title + pipe-separated subtitle centered over the orb, footer menu below. |
| work | work | **PASS** | Mapped to my 6 software/system projects. |
| prototypes | prototypes | **PASS** | Mapped to my 4 embedded/hardware builds. |
| art | art | **PARTIAL** | Page, menu entry, ghost title, and routing all exist; list is empty with a visible `TODO(content)` block — no artwork exists in my sources. |
| press | press | **PARTIAL** | Same as art; the reference's magazine-cover grid + interviews sub-list have no counterpart in my sources. |
| info | info | **PASS** | Reference blocks `[ bio ] [ awards ] [ clients ] [ social ]` mapped to `[ bio ] [ experience ] [ education ] [ skills ] [ contact \| social ]` — same bracket-title style, all content from resume.md. |
| reel (menu item → fullscreen video) | — | **FAIL** | No showreel video exists in my sources; menu item omitted rather than faked. |
| per-item detail view | per-item detail view | **PASS** | One detail page per section (work/prototypes), same DOM block order: title → subtitle → feature → next-button → client/role → `[ brief ]` → content → `[ share ]` → related → bottom nav. |

Menu order matches the reference verbatim minus `reel`: `home | work | prototypes | art | press | info`.

## 2. Animation types

| Animation | Status | Note |
|---|---|---|
| Full-viewport shader background (flowing blue nebula ring) | **PASS** | Original GLSL reimplementation of the same construction: 8-iteration domain-warped flow noise shaped by a log-spiral band, signed-division glow. Hash value-noise replaces the reference's noise texture. |
| Raymarched orb that tightens/fades per section | **PASS** | Same sine "egg-carton" raymarch; `orbOpacity` eases to the reference's exact per-section values (home 1.0, prototypes 0.5, info 0.4, others 0.3). |
| Additive particle star clouds, slow rotation | **PASS** | Two 350-point clouds, size .3, additive, opacity .35, counter-rotating — reference values. |
| Mouse reaction (shader offset + camera parallax) | **PASS** | Same eased `.05` lerp per frame on both the `iMouse` uniform and camera position; rAF-throttled mousemove; disabled on mobile like the reference. |
| Scroll choreography (fade-up/zoom-in/fade-in reveals, header shade) | **PASS** | AOS clone with the same animation names, 60px offset, ~1s ease; page titles re-trigger 500ms after every page show, exactly like the reference's views. |
| Page transition (slide-up + fade, .8s ease-in-out, z-swap) | **PASS** | Same CSS (`translate3d(0,20%,0)` → 0, opacity 0 → 1) and the same show/hide class timing (+100ms show, +1000ms display:none). |
| Prev/next eased item navigation with loader line | **PASS** | Identical timeline to `main.js`: loader 0 → .7 @500ms → 1 @1000ms, content swap @800ms, page slide-in @1000ms, 1s eased scroll-to-top. |
| Hover tilt on list items | **PARTIAL** | vanilla-tilt recreated (reverse, max 5°, scale 1.03, eased reset); the subtle glare layer is omitted. |
| Press-page 3D magazine hover | **FAIL (no content)** | CSS exists in the reference for its magazine covers; I have no press items to apply it to. |
| Landing press-and-hold (intensity ramp → showreel) | **FAIL (no content)** | The `intensity` uniform is wired, but there's no reel to open, so the easter egg is not bound. |
| Ambient audio + sound-bar viz | **FAIL (no content)** | No audio in my sources; the corner sound bars are omitted rather than rendered dead. |

## 3. Layout regions

| Region | Status | Note |
|---|---|---|
| Home: centered title/subtitle over canvas, footer menu at 15vh (5vh mobile), 10vh letterbox bars | **PASS** | Same values; bars open from 50vh on load. |
| Section pages: 28vh ghost title @12vh, subtitle @29vh, 2-col 42.5vw list @45vh, hover title overlays | **PASS** | Ported verbatim; 1-col 85vw on mobile. |
| Detail: subtitle @25vh above 3.5vw title @30vh, feature @42vh, centered client/role lines, `[ brief ]` content at 10vw margins, share icons, 3-col related grid, bottom nav bar | **PASS** | Same block order and values; labels honestly renamed `Context:` / `Stack:` (course + tech stack) since my projects have no client. |
| Next-button: circle + arrow at right edge (80vh), hover slides arrow/circle apart 2vw | **PASS** | Recreated as inline SVG with the same hover transforms. |
| Header: inline `\|`-separated menu top-right @5vh, shade after 30px scroll; hamburger + fullscreen 9vw menu on mobile | **PASS** | Same breakpoint (801px) and behavior; active item stroked in the overlay menu. |
| Info: feature media → bracket-titled blocks | **PARTIAL** | Reference leads with a wide cinematic image; mine centers a 38vw portrait (`self_pic.png` is portrait-orientation — full-bleed would distort it). |

## 4. Navigation behavior

| Behavior | Status | Note |
|---|---|---|
| `⇠ prev` / `next ⇢` with wrap-around at list ends | **PASS** | Same wrap logic as `goNext`/`goBack`. |
| `back to work` / `back to prototypes` center bottom | **PASS** | Same labels, same position. |
| Corner next-button advances to next item | **PASS** | |
| Related items navigate within section (tag matching, max 6) | **PASS** | Same tag-intersection algorithm. |
| Real history entries + back/forward + deep links | **PASS** | `pushState`/`popstate` like the reference; `404.html` redirect makes deep links work on GitHub Pages. |
| Share icons open twitter/facebook popups | **PASS** | Same popup-window share, pointing at my URLs. |

## 5. Typography

| Aspect | Status | Note |
|---|---|---|
| Typeface | **PARTIAL** | Reference uses Adobe `futura-pt` (Typekit); I use **Jost**, the closest free geometric sans. Weights tuned (200 home title, 300–400 mobile titles) to match futura-pt's optical weight. |
| Hierarchy & rhythm | **PASS** | All sizes/spacings ported: 28vh ghost titles, 5vw/2.6vw-spaced home title, 1.2vw subtitles, 1vw `#3d5257` bracket section-titles, 12px base, uppercase tracking throughout. |

## 6. Performance / degradation (per CLAUDE.md)

- three.js + shader scene is a lazy chunk (826KB) behind `<Suspense>`; the DOM ships in ~52KB + React. The reference's static radial-gradient `.background` doubles as the loading fallback.
- Mobile: dpr capped at 1, raymarch 28 steps (60 on desktop), particles and parallax disabled — mirroring the reference's `isMobile` gates. `prefers-reduced-motion` freezes shader time and particle rotation.
- Mouse and scroll handlers are rAF-throttled.
- `npm run dev` and the production build both run with no console errors.

---

## 7. Side-by-side screenshots

All files in `audit/`. Left = my build, right = reference.

### Desktop 1440px

| Mine | Reference |
|---|---|
| <img src="audit/mine-home-1440.png" width="420"> | <img src="audit/ref-home-1440.png" width="420"> |
| <img src="audit/mine-work-1440.png" width="420"> | <img src="audit/ref-work-1440.png" width="420"> |
| <img src="audit/mine-work-detail-1440.png" width="420"> | <img src="audit/ref-work-detail-1440.png" width="420"> |
| <img src="audit/mine-prototypes-1440.png" width="420"> | <img src="audit/ref-prototypes-1440.png" width="420"> |
| <img src="audit/mine-art-1440.png" width="420"> | <img src="audit/ref-art-1440.png" width="420"> |
| <img src="audit/mine-press-1440.png" width="420"> | <img src="audit/ref-press-1440.png" width="420"> |
| <img src="audit/mine-info-1440.png" width="420"> | <img src="audit/ref-info-1440.png" width="420"> |

### Mobile 390px

| Mine | Reference |
|---|---|
| <img src="audit/mine-home-390.png" width="280"> | <img src="audit/ref-home-390.png" width="280"> |
| <img src="audit/mine-work-390.png" width="280"> | <img src="audit/ref-work-390.png" width="280"> |
| <img src="audit/mine-work-detail-390.png" width="280"> | <img src="audit/ref-work-detail-390.png" width="280"> |

Notes on the captures: the reference's detail-page Vimeo embed is blocked in headless Chromium
(black "couldn't verify" box), and both sites show the same bottom letterbox band on mobile
home. My mobile home title overflows the viewport edge — so does the reference's
("FRANCIS GAR…" vs "RICHARD MAT…"); that quirk is faithful.

---

## 8. Every PARTIAL / FAIL and what closes it

1. **art section empty (PARTIAL)** — supply artwork (images + per-piece title/description); the
   list page, detail page, routing, and prev/next already work the moment items are added to
   `src/data/site.ts`.
2. **press section empty (PARTIAL)** — supply press/publication items; the reference's
   magazine-cover CSS can be added when there's something to render.
3. **reel omitted (FAIL)** — record/supply a showreel video; then the `reel` menu item, the
   fullscreen `#reel` overlay, and the landing press-and-hold ramp can be wired (intensity
   uniform already exists).
4. **ambient audio + sound bars omitted (FAIL)** — supply an ambient loop + click sound to add
   the Howler-style sound system and animated corner bars.
5. **tilt glare omitted (PARTIAL)** — add a glare gradient layer to `src/lib/tilt.ts` if wanted.
6. **typeface substitution (PARTIAL)** — license Adobe `futura-pt` (Typekit kit id) for an
   exact match; Jost is the stand-in.
7. **info feature image (PARTIAL)** — a wide/landscape "hero" photo would match the
   reference's cinematic feature better than the portrait crop.

## 9. TODO(content) gaps (all of them)

- `TODO(content)`: **art pieces** — nothing in resume.md / projects-info (rendered as a marked
  block on the art page).
- `TODO(content)`: **press coverage / interviews** — nothing in sources (marked block on the
  press page).
- `TODO(content)`: **showreel video** — reference menu has `reel`; omitted.
- `TODO(content)`: **ambient audio + click sounds** — reference plays Howler loops; omitted.
- `TODO(content)`: **real project imagery** — sources contain no screenshots/photos, so list
  thumbnails and detail features are deterministic generated SVG visuals
  (`src/components/ui/Thumb.tsx`, marked in-file). Replace with real captures per project.
- `TODO(content)`: **per-project external links** (repo/demo URLs) — none in sources; the
  reference's `[ links ]` button block is hidden (the reference also hides empty blocks).
- `TODO(content)`: **per-project awards / press / media galleries** — no data; blocks hidden,
  same as the reference does for items without them.
- Detail labels: reference shows `Client:` / `Role:`; my projects have neither, so the same
  two lines render `Context:` (course/term) and `Stack:` (tech) — real data, relabeled.
