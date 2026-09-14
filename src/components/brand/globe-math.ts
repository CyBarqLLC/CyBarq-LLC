import { isLand } from "./land-mask";

/**
 * The CyBarq globe.
 *
 * The world is drawn with the company's own symbol and nothing else: one mark
 * per point of an even lattice over the land, all in CyBarq Blue, sized and
 * lightened by how far each one has turned away from the viewer. A few of them
 * let go and drift outward. There is no second colour and no ornament: the
 * mark, repeated, is the picture.
 */

/**
 * The symbol as four triangles, taken from the master artwork and normalised
 * so the mark is one unit across with its centre at the origin.
 * Source: 01_Logo/LOGO2026, viewBox 117.840 136.605 31.301 32.176.
 */
export const SYMBOL_TRIANGLES: readonly (readonly [number, number, number, number, number, number])[] = [
  [0.0047, 0.503, 0.0388, 0.0825, 0.2178, 0.0425],
  [-0.0025, -0.5025, -0.0366, -0.0822, -0.2156, -0.0422],
  [0.4891, 0.0194, 0.0716, -0.0403, 0.0428, -0.2216],
  [-0.489, -0.0259, -0.0715, 0.0338, -0.0425, 0.215],
];

/**
 * One placed mark: centre, size in pixels, opacity, and how near the front of
 * the sphere it sits. `shade` runs 0 at the far limb to 1 at the centre and
 * picks a step on the blue ramp, which is how the globe gets its depth without
 * a second colour.
 */
export type GlobeMark = { x: number; y: number; size: number; alpha: number; shade: number };

/** One arc of the graticule, as a flat run of screen coordinates. */
export type GlobeArc = { pts: number[]; alpha: number };

export type GlobeFrame = { marks: GlobeMark[]; arcs: GlobeArc[] };

export type GlobeParams = {
  /** Lattice points over the whole sphere (land keeps roughly 29% of them). */
  count?: number;
  /** Turns per second. Slow enough that the movement is felt, not watched. */
  spin?: number;
  /** Axial tilt in radians: how far the north pole leans towards the viewer. */
  tilt?: number;
  /** Mark size as a fraction of the radius. */
  mark?: number;
  /** Maximum opacity. */
  alpha?: number;
  /** Share of marks that let go and drift outward. */
  driftShare?: number;
  /** How far a drifting mark travels, as a fraction of the radius. */
  reach?: number;
  /** Journeys per second for a drifting mark. */
  driftRate?: number;
  /** Opacity of the graticule (0 hides it). */
  graticule?: number;
  /** How much of the mark the sea keeps, so the sphere has a body. */
  sea?: number;
  seed?: number;
};

export const GLOBE_DEFAULTS: Required<Omit<GlobeParams, "count">> = {
  spin: 0.0055,
  tilt: 0.34,
  mark: 0.05,
  alpha: 0.92,
  driftShare: 0.045,
  reach: 0.34,
  driftRate: 0.08,
  graticule: 0.55,
  sea: 0.3,
  seed: 0,
};

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const DEG = 180 / Math.PI;

function hash(i: number, s = 0): number {
  const x = Math.sin(i * 127.1 + s * 311.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
}

/** Lattice point count for a sphere of radius `r`, kept sane on small screens. */
export function globeCount(r: number): number {
  return Math.round(Math.min(3600, Math.max(1100, (r * r) / 38)));
}

export type GlobeLean = { x: number; y: number } | null;

/**
 * Every mark of one frame. `t` is time in seconds (0 gives the still form used
 * for the first paint). `lean` is a normalised pointer offset (-1 to 1) that
 * turns the globe a little towards whoever is pointing at it.
 */
export function computeGlobe(cx: number, cy: number, R: number, params: GlobeParams = {}, t = 0, lean: GlobeLean = null): GlobeFrame {
  const p = { ...GLOBE_DEFAULTS, count: globeCount(R), ...params };
  const marks: GlobeMark[] = [];
  const arcs: GlobeArc[] = [];

  const spinDeg = t * p.spin * 360 + (lean ? lean.x * 22 : 0);
  const tilt = p.tilt + (lean ? lean.y * 0.18 : 0);
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  const S = R * p.mark;

  /** Rotates a point given in the globe's own frame onto the screen. */
  const place = (lat: number, lon: number) => {
    const la = lat / DEG;
    const lo = (lon + spinDeg) / DEG;
    const cl = Math.cos(la);
    const x = cl * Math.sin(lo);
    const y0 = Math.sin(la);
    const z0 = cl * Math.cos(lo);
    return { x, y: y0 * cosT - z0 * sinT, z: y0 * sinT + z0 * cosT };
  };

  /* ---- the graticule: the faintest hint that this is a sphere ----------- */
  if (p.graticule > 0) {
    const line = (pts: [number, number][]) => {
      let run: number[] = [];
      let sum = 0;
      let n = 0;
      const flush = () => {
        if (run.length >= 4 && n > 0) arcs.push({ pts: run, alpha: p.graticule * (sum / n) });
        run = [];
        sum = 0;
        n = 0;
      };
      for (const [lat, lon] of pts) {
        const q = place(lat, lon);
        if (q.z <= 0.02) {
          flush();
          continue;
        }
        run.push(cx + q.x * R, cy - q.y * R);
        sum += Math.min(1, q.z * 2.4);
        n++;
      }
      flush();
    };
    for (let lon = -180; lon < 180; lon += 30) {
      const pts: [number, number][] = [];
      for (let lat = -88; lat <= 88; lat += 4) pts.push([lat, lon]);
      line(pts);
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts: [number, number][] = [];
      for (let lon = -180; lon <= 180; lon += 4) pts.push([lat, lon]);
      line(pts);
    }
  }

  /* ---- the land, one symbol at a time ----------------------------------- */
  const count = p.count;
  for (let i = 0; i < count; i++) {
    const sinLat = 1 - (2 * i + 1) / count;
    const lat = Math.asin(sinLat) * DEG;
    let lon = ((GOLDEN * i) % (2 * Math.PI)) * DEG;
    if (lon > 180) lon -= 360;
    const land = isLand(lon, lat);
    if (!land && (p.sea <= 0 || hash(i, p.seed + 41) > 0.5)) continue;

    const q = place(lat, lon);
    if (q.z <= 0.02) continue;

    const depth = Math.pow(q.z, 0.6);
    const alpha = p.alpha * (0.2 + 0.8 * depth) * Math.min(1, q.z * 3.4) * (land ? 1 : p.sea);
    if (alpha <= 0.02) continue;
    marks.push({
      x: cx + q.x * R,
      y: cy - q.y * R,
      size: S * (0.55 + 0.45 * depth) * (land ? 1 : 0.62),
      alpha,
      shade: land ? depth : depth * 0.35,
    });

    /* ---- and the few that let go --------------------------------------- */
    if (!land || hash(i, p.seed + 7) >= p.driftShare) continue;
    const ph = (t * p.driftRate + hash(i, p.seed + 13)) % 1;
    const rr = 1 + ph * p.reach;
    const fade = Math.min(1, ph * 7) * Math.pow(1 - ph, 1.4);
    const fa = 0.55 * fade * Math.min(1, q.z * 2.2);
    if (fa <= 0.02) continue;
    marks.push({ x: cx + q.x * R * rr, y: cy - q.y * R * rr, size: S * (0.9 + 0.7 * ph), alpha: fa, shade: 0.75 });
  }

  return { marks, arcs };
}

const f = (v: number) => (Math.round(v * 10) / 10).toString();

/** One symbol as an SVG path, centred on (x, y) at `size` across. */
function symbolPath(x: number, y: number, size: number): string {
  let d = "";
  for (const tri of SYMBOL_TRIANGLES) {
    d += `M${f(x + tri[0] * size)},${f(y + tri[1] * size)}L${f(x + tri[2] * size)},${f(y + tri[3] * size)}L${f(x + tri[4] * size)},${f(y + tri[5] * size)}Z`;
  }
  return d;
}

/**
 * The still frame as SVG markup (inner content), for the server rendered first
 * paint. Marks are grouped by opacity step so the output stays small.
 */
export function globeSvg(frame: GlobeFrame, ramp: readonly string[], hair: string): string {
  let out = "";
  for (const arc of frame.arcs) {
    if (arc.alpha <= 0.02 || arc.pts.length < 4) continue;
    let d = `M${f(arc.pts[0] ?? 0)},${f(arc.pts[1] ?? 0)}`;
    for (let i = 2; i < arc.pts.length; i += 2) d += `L${f(arc.pts[i] ?? 0)},${f(arc.pts[i + 1] ?? 0)}`;
    out += `<path fill="none" stroke="${hair}" stroke-opacity="${f(arc.alpha)}" stroke-width="1" d="${d}"/>`;
  }
  const groups = new Map<string, string[]>();
  for (const m of frame.marks) {
    const key = `${shadeIndex(m.shade, ramp.length)}:${Math.round(m.alpha * 14)}`;
    groups.set(key, [...(groups.get(key) ?? []), symbolPath(m.x, m.y, m.size)]);
  }
  for (const [key, ds] of groups) {
    const [tone, step] = key.split(":");
    out += `<path fill="${ramp[Number(tone)] ?? ramp[0]}" fill-opacity="${f(Number(step) / 14)}" d="${ds.join("")}"/>`;
  }
  return out;
}

/** Which step of the blue ramp a mark sits on. */
export function shadeIndex(shade: number, steps: number): number {
  return Math.max(0, Math.min(steps - 1, Math.round(shade * (steps - 1))));
}
