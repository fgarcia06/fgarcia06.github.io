/**
 * Full-viewport background shader, written to reproduce the look and motion
 * of richardmattka.com's backdrop: a slowly-flowing blue smoke/nebula ring
 * (iterative "flow" domain warping over value noise) with a raymarched
 * sphere whose surface is carved by a sine "egg carton" field — the orb that
 * tightens/fades per section via the orbOpacity uniform. Mouse position
 * shifts the field and the raymarch origin; audio1 is fed a constant + small
 * random flicker each frame (as the reference does) so the ring shimmers.
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

#define R(p, a) p = p * cos(a) + vec2(-p.y, p.x) * sin(a)
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

float sin01(float t) { return 0.5 + 0.5 * sin(6.28319 * t); }

/* sine "egg carton" field carving the orb's surface */
float eggCarton(vec3 p) {
  return abs(sin(p.x) - cos(p.y) + sin(p.z)) * 1.2 * orbOpacity;
}

float map(vec3 p, float scale) {
  float dSphere = length(p) - 1.0;
  return max(dSphere, (0.9 - eggCarton(scale * p)) / scale);
}

vec3 orbColor(vec3 p) {
  float amount = clamp((1.5 - length(p)) / 2.0, 0.0, 1.0);
  vec3 col = 0.5 + 0.5 * cos(6.28319 * (vec3(0.2, 0.0, 0.0) + amount * (audio1 * 0.6) * vec3(0.9, 0.9, 0.8)));
  return col * amount * orbOpacity;
}

void main() {
  vec2 coord = gl_FragCoord.xy;
  coord.x -= iMouse.x * 0.003;
  coord.y += iMouse.y * 0.003;

  /* smoke ring layer */
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

  /* raymarched orb layer */
  vec3 rd = normalize(vec3(2.0 * coord - iResolution.xy, -iResolution.y));
  vec3 ro = vec3(
    -iMouse.x * 0.0003,
    iMouse.y * 0.0002,
    -1.4 * (1.0 - orbOpacity) - 0.5 + mix(2.5, 2.0, adj + sin01(0.05 * iTime))
  );
  R(rd.xz, 0.2 * iTime);
  R(ro.xz, 0.2 * iTime);
  R(rd.yz, 0.1 * iTime);
  R(ro.yz, 0.1 * iTime);

  float t = 0.0;
  float scale = mix(0.5, 20.0 * orbOpacity * orbOpacity, sin01(0.1 * iTime * 0.01));
  for (int i = 0; i < ${marchSteps}; i++) {
    vec3 q = ro + t * rd;
    float d = map(q, scale);
    if (t > 20.0 || d < 0.0001) { break; }
    t += 0.7 * d;
    frag.rgb += 0.05 * orbColor(q) * (audio1 * 0.6) * orbOpacity;
    frag.r -= abs(iMouse.x) * 0.00003;
  }

  gl_FragColor = frag;
}
`
