import { bladePoints } from "./stream-math";
import { isLand } from "./land-mask";

/**
 * The CyBarq globe: the Flux Field wrapped onto a sphere.
 *
 * Every landmass is drawn with the blade of the symbol, one blade per point of
 * an even lattice, each lying along the local east so the whole field reads as
 * one turn. A share of them let go and travel outward, which is the Stream
 * leaving the globe. Nothing here is decoration borrowed from elsewhere: it is
 * the same blade, the same apex and the same tempo as the printed pattern.
 */

export type GlobeTone = "ink" | "blue" | "lime";

export type GlobeMark = {
  points: [number, number, number, number, number, number];
  alpha: number;
  tone: GlobeTone;
};

/** One arc of the graticule, as a flat run of screen coordinates. */
export type GlobeArc = { pts: number[]; alpha: number };

export type GlobeFrame = { marks: GlobeMark[]; arcs: GlobeArc[] };

export type GlobeParams = {
  /** Lattice points over the whole sphere (land keeps roughly 29% of them). */
  count?: number;
  /** Turns per second. The brand tempo is slow: one turn in about two minutes. */
  spin?: number;
  /** Axial tilt in radians: how far the north pole leans towards the viewer. */
  tilt?: number;
  /** Blade length as a fraction of the radius. */
  blade?: number;
  /** Maximum ink opacity. */
  alpha?: number;
  /** Share of land blades carrying CyBarq Blue, and the smaller lime share. */
  blueShare?: number;
  limeShare?: number;
  /** Share of land blades that let go and travel outward. */
  emitShare?: number;
  /** How far a released blade travels, as a fraction of the radius. */
  reach?: number;
  /** Flights per second for a released blade. */
  emitRate?: number;
  /** Opacity of the graticule (0 hides it). */
  graticule?: number;
  /**
   * How much ink the sea keeps. The sea is drawn in CyBarq Blue and the land
   * in Graphite, so the globe reads at a glance and carries the colour.
   */
  ocean?: number;
  seed?: number;
};

export const GLOBE_DEFAULTS: Required<Omit<GlobeParams, "count">> = {
  spin: 0.0052,
  tilt: 0.34,
  blade: 0.055,
  alpha: 0.95,
  blueShare: 0.085,
  limeShare: 0.05,
  emitShare: 0.05,
  reach: 0.4,
  emitRate: 0.115,
  graticule: 0.8,
  ocean: 0.45,
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
  return Math.round(Math.min(7000, Math.max(1700, (r * r) / 21)));
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

  const spinDeg = t * p.spin * 360 + (lean ? lean.x * 26 : 0);
  const tilt = p.tilt + (lean ? lean.y * 0.22 : 0);
  const cosT = Math.cos(tilt);
  const sinT = Math.sin(tilt);
  const L = R * p.blade;

  /** Rotates a point given in the globe's own frame onto the screen. */
  const place = (lat: number, lon: number) => {
    const la = lat / DEG;
    const lo = (lon + spinDeg) / DEG;
    const cl = Math.cos(la);
    const x = cl * Math.sin(lo);
    const y0 = Math.sin(la);
    const z0 = cl * Math.cos(lo);
    const y = y0 * cosT - z0 * sinT;
    const z = y0 * sinT + z0 * cosT;
    /* The east tangent, already a unit vector before the tilt. */
    const ex = Math.cos(lo);
    const ey = Math.sin(lo) * sinT;
    return { x, y, z, ex, ey };
  };

  /* ---- the graticule: meridians and parallels, a hairline apart ---------- */
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

  /* ---- the land, blade by blade ----------------------------------------- */
  const count = p.count;
  for (let i = 0; i < count; i++) {
    const sinLat = 1 - (2 * i + 1) / count;
    const lat = Math.asin(sinLat) * DEG;
    let lon = ((GOLDEN * i) % (2 * Math.PI)) * DEG;
    if (lon > 180) lon -= 360;
    const land = isLand(lon, lat);
    if (!land && (p.ocean <= 0 || hash(i, p.seed + 41) > 0.55)) continue;

    const q = place(lat, lon);
    if (q.z <= 0.015) continue;

    const mag = Math.hypot(q.ex, q.ey);
    const angle = Math.atan2(-q.ey, q.ex);
    const edge = Math.min(1, q.z * 3.2);
    const current = 0.84 + 0.16 * Math.sin(lon / 26 + lat / 34 + t * 0.55);
    const len = L * (0.4 + 0.6 * mag) * (0.82 + 0.18 * current);
    const alpha = p.alpha * (0.22 + 0.78 * Math.pow(q.z, 0.55)) * edge * current * (land ? 1 : p.ocean);
    if (alpha <= 0.012) continue;

    const h = hash(i, p.seed);
    const facing = land && q.z > 0.34;
    const tone: GlobeTone = !land ? "blue" : !facing ? "ink" : h < p.limeShare ? "lime" : h < p.limeShare + p.blueShare ? "blue" : "ink";
    const lift = land && tone !== "ink" ? 0.3 : 0;
    marks.push({ points: bladePoints(cx + q.x * R, cy - q.y * R, angle, len), alpha: Math.min(1, alpha + lift), tone });

    /* ---- and the few that let go --------------------------------------- */
    if (!land || hash(i, p.seed + 7) >= p.emitShare) continue;
    const ph = (t * p.emitRate + hash(i, p.seed + 13)) % 1;
    const rr = 1 + ph * p.reach;
    const px = cx + q.x * R * rr;
    const py = cy - q.y * R * rr;
    const out = Math.atan2(-q.y, q.x) + ph * 0.42;
    const fade = Math.min(1, ph * 9) * Math.pow(1 - ph, 1.25);
    const fa = 0.8 * fade * Math.min(1, q.z * 2.2);
    if (fa <= 0.02) continue;
    const ft = hash(i, p.seed + 23);
    const ftone: GlobeTone = ft < 0.68 ? "blue" : ft < 0.86 ? "lime" : "ink";
    marks.push({ points: bladePoints(px, py, out, L * (0.9 + 1.5 * ph)), alpha: fa, tone: ftone });
  }

  return { marks, arcs };
}

const f = (v: number) => (Math.round(v * 10) / 10).toString();

/**
 * The still frame as SVG markup (inner content), for the server rendered first
 * paint. Marks are grouped by tone and opacity step so the output stays small.
 */
export function globeSvg(frame: GlobeFrame, ink: string, blue: string, lime: string, hair: string): string {
  let out = "";
  for (const arc of frame.arcs) {
    if (arc.alpha <= 0.02 || arc.pts.length < 4) continue;
    let d = `M${f(arc.pts[0] ?? 0)},${f(arc.pts[1] ?? 0)}`;
    for (let i = 2; i < arc.pts.length; i += 2) d += `L${f(arc.pts[i] ?? 0)},${f(arc.pts[i + 1] ?? 0)}`;
    out += `<path fill="none" stroke="${hair}" stroke-opacity="${f(arc.alpha)}" stroke-width="1" d="${d}"/>`;
  }
  const groups = new Map<string, string[]>();
  for (const m of frame.marks) {
    const key = `${m.tone}:${Math.round(m.alpha * 16)}`;
    const p = m.points;
    groups.set(key, [...(groups.get(key) ?? []), `M${f(p[0])},${f(p[1])}L${f(p[2])},${f(p[3])}L${f(p[4])},${f(p[5])}Z`]);
  }
  const fill = { ink, blue, lime } as const;
  for (const [key, ds] of groups) {
    const [tone, step] = key.split(":");
    out += `<path fill="${fill[tone as GlobeTone]}" fill-opacity="${f(Number(step) / 16)}" d="${ds.join("")}"/>`;
  }
  return out;
}
