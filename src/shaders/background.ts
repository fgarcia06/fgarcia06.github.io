/**
 * Full-viewport background shader. Keeps richardmattka.com's slowly-flowing
 * blue smoke/nebula ring (iterative "flow" domain warping over value noise),
 * with a **Tacet Mark** centrepiece — the audio-waveform sigil from Wuthering
 * Waves (see tacet-mark.jpg): a symmetric row of diamond spikes, tallest at
 * the centre.
 *
 * The mark is a 3D, *volumetrically* rendered crystal: the ray accumulates a
 * soft cosmic glow as it passes through a row of stretched-octahedron shards,
 * so it reads smooth and luminous like the original raymarched orb rather than
 * a hard-edged solid. Its palette is cosmic (deep blue → violet → magenta with
 * starlight sparkle) to sit inside the nebula background. Animation: a wave of
 * energy travels along the bars, nebula colour drifts through them, and on
 * every section change a `pulse` uniform warps + flares the whole sigil before
 * it settles into a new per-section viewing angle. Kept deliberately dim so
 * the centred hero title stays legible.
 */

export const backgroundVertex = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const makeBackgroundFragment = (marchSteps: number) => /* glsl */ `
varying vec2 vUv;
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float audio1;
uniform float adj;
uniform float orbOpacity;
uniform float intensity;
uniform float pulse;
uniform float shape;   // abstract shape index: 0 gyroid, 1 ring, 2 cluster, 3 diamond
uniform float warp;    // hyperspace-travel intensity (0..1) — radial frame stretch

#define T (iTime * 0.1)
#define TAU 6.2831853

mat2 rot(float a) { float c = cos(a); float s = sin(a); return mat2(c, -s, s, c); }
const mat2 m2 = mat2(0.80, 0.80, -0.80, 0.80);

/* hash-based value noise, standing in for the reference's noise texture */
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float hash11(float n) { return fract(sin(n * 127.1) * 43758.5453); }

float vnoise(vec2 x) {
  vec2 i = floor(x);
  vec2 f = fract(x);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1, 0)), u.x),
    mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), u.x),
    u.y
  );
}

float noise(vec2 x) { return vnoise(x * 3.0); }

float grid(vec2 p) { return sin(p.x) * cos(p.y); }

/* iterative domain-warped flow field — the drifting smoke */
float flow(vec2 p) {
  float z = 4.0;
  float rz = 0.0;
  vec2 bp = p;
  for (float i = 1.0; i < 8.0; i++) {
    bp += T * 1.5;
    vec2 gr = vec2(grid(p * 3.0 - T * 2.0), grid(p * 3.0 + 4.0 - T)) * 0.4;
    gr = normalize(gr) * 0.4;
    gr *= rot((p.x + p.y) * 0.3 + T * 10.0);
    p += gr * 0.2;

    rz += (sin(noise(p) * 2.0) * 0.5 + 0.5) / z;

    p = mix(bp, p, 0.5);
    z *= 1.5;
    p *= 2.5;
    p *= m2;
    bp *= 2.5;
    bp *= m2;
  }
  return rz;
}

/* log-spiral ring mask that shapes the smoke into an arc */
float spiral(vec2 p, float scl) {
  float r = log(length(p));
  float a = atan(p.y, p.y);
  return abs(mod(scl * (r - 2.0 / scl * a), TAU) - 1.0);
}

/* ------------------------------------------------------------------ */
/* Tacet Mark — cosmic volumetric crystal waveform                     */
/* ------------------------------------------------------------------ */

#define BAR_COUNT 10.0   // bars per side (~21 crystals total)
#define BAR_GAP   0.135  // x spacing between crystals

/* whole-sigil breathing — a slow heartbeat that swells the ridge and its
   glow together, so the rift reads as a living tear in space */
float breath() {
  return 0.5 + 0.5 * sin(iTime * 0.55);
}

/* per-bar half-height: a FIXED silhouette (envelope × per-bar hash) carrying
   one subtle travelling ripple. The wave sweeps outward across the bars at a
   constant speed and only modulates ±5.5%, so the mark's proportions never
   change — the outline just undulates, fluid and consistent. The heartbeat
   lives in the halo glow only (see hbGlow), not in the geometry. */
float barHeight(float id) {
  float adist = abs(id) / BAR_COUNT;
  float env = pow(max(0.0, 1.0 - adist), 1.2);
  env *= 0.55 + 0.45 * hash11(id + 3.0);
  if (abs(id) < 0.5) env = 1.18;                 // tall master spike
  float ripple = 1.0 + 0.055 * sin(iTime * 1.3 - id * 0.6);
  // floor the height: the outer bars have env→0, which would make s.y→0 and
  // divide-by-zero in sdOcta (NaN normals → white blowout)
  return max(env * 0.62 * ripple, 0.05);
}

/* smooth minimum — blends crystals so the outline reads as one soft ridge */
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

/* stretched octahedron — a vertical crystal shard, lightly rounded for a
   smoother silhouette. Distance to the bounding face plane in each octant. */
float sdOcta(vec3 p, vec3 s) {
  vec3 inv = 1.0 / max(s, vec3(0.02));  // guard against zero extents → Inf/NaN
  float m = dot(abs(p), inv) - 1.0;
  return m / length(inv) - 0.018;       // rounding smooths the edges
}

/* the tacet waveform: a smooth, smin-blended ridge of crystals */
float sdTacet(vec3 p) {
  // section-change warp keeps the morph lively
  p.x += sin(p.y * 7.0 + iTime * 3.0) * 0.04 * pulse;
  p.y += cos(p.x * 6.0 + iTime * 2.6) * 0.04 * pulse;

  float xi = clamp(floor(p.x / BAR_GAP + 0.5), -BAR_COUNT, BAR_COUNT);
  float d = 1e9;
  for (int k = -1; k <= 1; k++) {
    float id = xi + float(k);
    if (abs(id) > BAR_COUNT + 0.5) continue;
    float H = barHeight(id);
    vec3 q = p - vec3(id * BAR_GAP, 0.0, 0.0);
    d = smin(d, sdOcta(q, vec3(BAR_GAP * 0.5, H, 0.12)), 0.05);
  }
  return d;
}

/* the complex abstract shape the mark morphs into on section change:
   a slowly-tumbling gyroid carved inside a sphere — smooth and organic */
float sdAbstract(vec3 p) {
  p.xz *= rot(iTime * 0.25);
  p.xy *= rot(iTime * 0.17);
  float sph = length(p) - 0.82;
  float s = 5.0;
  float gyr = abs(dot(sin(p * s), cos((p * s).zxy))) / s - 0.04;
  return smin(max(sph, gyr), sph, 0.08);  // smooth skin over the gyroid
}

/* prototypes: a slowly-tumbling woven ring — a torus whose major + tube radii
   ripple, so it reads as a flowing loop, clearly distinct from the gyroid blob
   but equally contained */
float sdAbstract2(vec3 p) {
  p.yz *= rot(iTime * 0.22);
  p.xy *= rot(iTime * 0.18);
  float a = atan(p.z, p.x);                       // angle around the ring
  float major = 0.56 + 0.06 * sin(a * 5.0 + iTime * 1.4);
  float tube  = 0.19 + 0.05 * sin(a * 3.0 - iTime * 1.1);
  vec2 q = vec2(length(p.xz) - major, p.y);
  return length(q) - tube;
}

/* skills: a gooey metaball cluster — four spheres orbiting the centre, blended
   with smin into one lava-lamp blob that slowly churns */
float sdAbstract3(vec3 p) {
  p.xz *= rot(iTime * 0.20);
  p.xy *= rot(iTime * 0.13);
  float d = 1e9;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float a = iTime * 0.6 + fi * 1.5708;          // 90° apart, orbiting
    vec3 c = vec3(cos(a), sin(a * 1.3), sin(a)) * 0.42;
    d = smin(d, length(p - c) - 0.28, 0.22);      // gooey blend
  }
  return d;
}

/* about: a faceted diamond — an elongated octahedron, lightly rounded, turning
   on two axes; the only angular gem among the organic blobs */
float sdAbstract4(vec3 p) {
  p.xz *= rot(iTime * 0.20);
  p.xy *= rot(iTime * 0.14);
  vec3 inv = 1.0 / vec3(0.62, 0.84, 0.62);
  float m = dot(abs(p), inv) - 1.0;
  return m / length(inv) - 0.03;
}

/* pick one of the four abstract forms by index */
float sdAbstractShape(vec3 p, int id) {
  if (id <= 0) return sdAbstract(p);
  if (id == 1) return sdAbstract2(p);
  if (id == 2) return sdAbstract3(p);
  return sdAbstract4(p);
}

/* the abstract field for the current section group; 'shape' is eased in JS, so
   during a section change it lands between two indices — blend the bracketing
   forms so the swap cross-fades. The < 0.001 guard is uniform across fragments
   (shape is a uniform), so outside a transition we evaluate a single SDF. */
float sdAbstractField(vec3 p) {
  float f = floor(shape + 0.0001);
  float fr = shape - f;
  float a = sdAbstractShape(p, int(f));
  if (fr < 0.001) return a;
  return mix(a, sdAbstractShape(p, int(f) + 1), fr);
}

/* morph 0 (home → tacet mark) .. 1 (other sections → abstract shape) */
float morphAmount() {
  float view = clamp(1.0 - orbOpacity, 0.0, 0.7);
  return smoothstep(0.04, 0.40, view);
}

/* the rendered field: tacet mark smoothly morphing into the abstract shape */
float mapMark(vec3 p) {
  return mix(sdTacet(p), sdAbstractField(p), morphAmount());
}

/* surface colour — a flowing purple → red gradient (no rainbow) */
vec3 markColor(vec3 p) {
  vec3 purple = vec3(0.42, 0.07, 0.86);
  vec3 red    = vec3(0.96, 0.13, 0.22);
  float g = 0.5 + 0.5 * sin(p.x * 1.2 + p.y * 1.0 + p.z * 1.3 + iTime * 0.35);
  vec3 base = mix(purple, red, g);
  // faint sparkle drifting across the surface
  float spark = pow(noise(p.xy * 22.0 + floor(iTime * 2.0) * 1.7), 32.0);
  return base + spark * vec3(1.0, 0.6, 0.55) * 0.4;
}

void main() {
  // hyperspace warp: anisotropic distortion during a jump — radial outward burst
  // (star streaks rush past the edges) combined with a vertical pinch that
  // compresses the viewport into a horizontal letterbox tunnel, plus a corner
  // barrel flare. Together these read as passing through a wormhole.
  vec2 fc = gl_FragCoord.xy;
  if (warp > 0.0001) {
    vec2 wc = 0.5 * iResolution.xy;
    vec2 wd = fc - wc;
    vec2 ndx = wd / iResolution.xy;         // −0.5..0.5 per axis
    float wr = length(wd) / iResolution.y;
    // radial outward burst — existing hyperspace star-streak effect
    fc += normalize(wd + vec2(1e-5)) * warp * (wr * wr * 220.0 + 18.0);
    // vertical pinch: top/bottom compressed toward the horizon (wormhole lens)
    fc.y -= wd.y * warp * warp * 0.68;
    // horizontal barrel: outward flare strongest where Y deviation is greatest
    fc.x += wd.x * warp * 0.45 * ndx.y * ndx.y;
  }

  vec2 coord = fc;
  coord.x -= iMouse.x * 0.003;
  coord.y += iMouse.y * 0.003;

  /* smoke ring layer (unchanged background) */
  vec2 p = coord / iResolution.xy - 0.5;
  p.x *= iResolution.x / iResolution.y;
  p *= 2.0;
  p.y += 1.5;
  /* signed division is intentional: rz crosses zero along the spiral band,
     and pow(abs(col)) flips the negative side into the glowing arc */
  float rz = flow(p) * intensity;
  rz *= (3.2 - spiral(p, 0.5)) * 0.7 * audio1;
  vec3 col = vec3(0.02, 0.045, 0.09) / rz;
  col = pow(abs(col), vec3(1.01)) - abs(iMouse.x) * 0.00005;

  vec4 frag = vec4(col, 1.0);

  /* -------- Tacet Mark (cosmic 3D crystal — surface raymarch) -------- */
  vec2 uv = (fc - 0.5 * iResolution.xy) / iResolution.y;

  // section "view" 0 (home) .. ~0.7 (deep section); orbOpacity is eased in JS
  float view = clamp(1.0 - orbOpacity, 0.0, 0.7);
  // each section frames the crystal from a different angle; a slow idle turn
  // plus a kick from the navigation/hover pulse keep it alive. Deliberately
  // NO mouse term: the rift is fixed in space and only reacts to card hover
  // (pulse) and section changes (view/shape).
  float yaw   = view * 1.0 + sin(iTime * 0.08) * 0.05 + pulse * 0.4;
  float pitch = view * 0.38 + sin(iTime * 0.05) * 0.04;

  vec3 ro = vec3(0.0, 0.0, 4.5);   // pushed back so the sigil sits contained
  vec3 rd = normalize(vec3(uv, -1.7));
  float cy = cos(yaw), sy = sin(yaw);
  float cx = cos(pitch), sx = sin(pitch);
  mat3 rotY = mat3(cy, 0.0, sy, 0.0, 1.0, 0.0, -sy, 0.0, cy);
  mat3 rotX = mat3(1.0, 0.0, 0.0, 0.0, cx, -sx, 0.0, sx, cx);
  mat3 rm = rotX * rotY;
  ro = rm * ro;
  rd = rm * rd;

  // sphere-trace to the crystal surface (contained, defined shape)
  float t = 0.0;
  float dmin = 1e9;
  bool hit = false;
  vec3 hp = vec3(0.0);
  for (int i = 0; i < ${marchSteps}; i++) {
    vec3 pos = ro + rd * t;
    float d = mapMark(pos);
    dmin = min(dmin, d);
    if (d < 0.0015) { hit = true; hp = pos; break; }
    t += d * 0.65;   // under-relaxed: the morph mixes two SDFs (not exact)
    if (t > 7.0) break;
  }

  float vis = clamp(orbOpacity, 0.30, 1.0);

  if (hit) {
    vec2 e = vec2(0.0018, 0.0);
    vec3 g = vec3(
      mapMark(hp + e.xyy) - mapMark(hp - e.xyy),
      mapMark(hp + e.yxy) - mapMark(hp - e.yxy),
      mapMark(hp + e.yyx) - mapMark(hp - e.yyx)
    );
    // guard against normalize(0) at degenerate/grazing hits (→ NaN → white)
    vec3 n = length(g) > 1e-5 ? g / length(g) : -rd;
    vec3 L = normalize(vec3(0.15, 0.55, 0.82));          // mostly frontal light
    float diff = 0.45 + 0.55 * max(dot(n, L), 0.0);
    // chromatic-aberration rim: per-channel fresnel powers split the edge
    // light into a spectral fringe (red spreads widest, blue hugs the
    // silhouette) — a lens-CA look that melts the outline into the nebula
    float f1 = 1.0 - max(dot(n, -rd), 0.0);
    vec3 fres = vec3(pow(f1, 2.6), pow(f1, 4.0), pow(f1, 5.8));
    vec3 skin = markColor(hp);                           // purple→red gradient
    vec3 markCol = skin * diff + fres * vec3(0.72, 0.30, 0.80) * 0.55;
    markCol += pow(max(dot(reflect(-L, n), -rd), 0.0), 28.0) * vec3(1.0, 0.7, 0.7) * 0.3;
    // drink in the local nebula colour so the rift's interior reads as space
    // showing through the tear rather than a solid pasted on top of it
    markCol = mix(markCol, col * 1.6, 0.34);
    markCol = min(markCol, vec3(1.0));                   // never blow out to white
    markCol *= 0.78 * (1.0 + pulse * 1.4);               // dim, flares on hover/nav
    // the surface itself breathes faintly with the waveform
    markCol *= 0.9 + 0.2 * breath();
    frag.rgb = mix(frag.rgb, markCol, vis * 0.62);
  }

  // spectral halo hugging the shape: each channel decays at its own rate so
  // the glow fringes warm/magenta on the outside and cool cyan-blue close in —
  // screen-space chromatic aberration that feathers the rift's seam into the
  // nebula. It swells and dims with the heartbeat, like energy leaking out.
  vec3 rim = vec3(exp(-dmin * 7.5), exp(-dmin * 11.0), exp(-dmin * 15.5));
  float hbGlow = 0.7 + 0.6 * breath();
  frag.rgb += vec3(0.50, 0.12, 0.52) * rim * vis * 0.17 * hbGlow * (1.0 + pulse * 1.2);

  // sanitize: any NaN/Inf survivor falls back to the background (x != x is NaN)
  if (!(frag.r == frag.r) || !(frag.g == frag.g) || !(frag.b == frag.b)) {
    frag.rgb = col;
  }
  gl_FragColor = vec4(clamp(frag.rgb, 0.0, 1.4), 1.0);
}
`
