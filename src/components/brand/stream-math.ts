/**
 * The CyBarq Stream: the Flux Field pattern in motion.
 * Mirrors CyBarq_Brand_Refresh_2026/08_Source_Masters/cybarq_pattern_generator.py
 * (`river`): every particle is one blade of the symbol at its exact proportion
 * and 20.2 degree apex, on a fixed grid, turning with one rotational field and
 * lengthening toward a single band. A few carry CyBarq Blue.
 */
export const BLADE_APEX = (20.2 * Math.PI) / 180;
export const BLADE_E1 = 0.83;

export type StreamParams = {
  /** Band half width (fraction of height). */
  spread?: number;
  /** Band wave amplitude and frequency along x. */
  amp?: number;
  freq?: number;
  /** Maximum ink opacity. */
  alpha?: number;
  /** Share of blades in the band that carry CyBarq Blue. */
  share?: number;
  /** Fade in from the left edge (higher = faster). */
  fadeIn?: number;
  fadeRight?: boolean;
  fadeOut?: number;
  /** Opening: band widens from `opening[0]` to `opening[1]` along x. */
  opening?: [number, number];
  /** Resting opacity of the grid outside the band (0 hides the grid). */
  floor?: number;
  /** Vertical centre of the band (fraction of height). */
  cy0?: number;
  seed?: number;
};

export const STREAM_PRESETS = {
  /** Master stream. */
  stream: { spread: 0.16, amp: 0.22, freq: 3.4, alpha: 0.92, share: 0.05, floor: 0.14 },
  /** Opening: from one line into the band; for openers and hero surfaces. */
  opening: { opening: [0.03, 0.2] as [number, number], amp: 0.18, freq: 2.6, alpha: 0.9, share: 0.05, floor: 0.1, fadeIn: 1.4 },
  /** Line: a thin stream for dividers and stationery. */
  line: { spread: 0.08, amp: 0.1, freq: 3.4, alpha: 0.85, share: 0.04, floor: 0 },
  /** Fine: dense texture in CyBarq Blue on Ice for footers and backs. */
  fine: { spread: 0.24, amp: 0.2, freq: 3.0, alpha: 0.55, share: 0, floor: 0.3 },
  /** Macro: enlarged for large surfaces. */
  macro: { spread: 0.22, amp: 0.2, freq: 2.2, alpha: 0.92, share: 0.06, floor: 0.12 },
} satisfies Record<string, StreamParams>;

export type StreamPreset = keyof typeof STREAM_PRESETS;

export type Blade = { points: [number, number, number, number, number, number]; alpha: number; accent: boolean };

function hash(i: number, j: number, s = 0): number {
  const x = Math.sin(i * 127.1 + j * 311.7 + s * 74.7) * 43758.5453;
  return x - Math.floor(x);
}

/** One blade polygon: tip at the leading end, body trailing at the apex angle. */
export function bladePoints(x: number, y: number, a: number, len: number): Blade["points"] {
  const tx = x + Math.cos(a) * len * 0.5;
  const ty = y + Math.sin(a) * len * 0.5;
  const b = a + Math.PI;
  return [tx, ty, tx + Math.cos(b) * len * BLADE_E1, ty + Math.sin(b) * len * BLADE_E1, tx + Math.cos(b + BLADE_APEX) * len, ty + Math.sin(b + BLADE_APEX) * len];
}

export type PointerInfluence = { x: number; y: number; radius: number; strength: number } | null;

/**
 * Computes every blade for a surface of `w` x `h` at grid `step`.
 * `t` is time in seconds (0 for the static pattern). `pointer` adds a subtle
 * local turn near the cursor; it never changes the band itself.
 */
export function computeStream(w: number, h: number, step: number, params: StreamParams = {}, t = 0, pointer: PointerInfluence = null): Blade[] {
  const {
    spread = 0.16, amp = 0.22, freq = 3.4, alpha = 0.92, share = 0.05, fadeIn = 1.8, fadeRight = false, fadeOut = 3, opening, floor = 0.14, cy0 = 0.5, seed = 0,
  } = params;
  const out: Blade[] = [];
  const s = step;
  let j = 0;
  for (let y = s / 2; y < h + s; y += s, j++) {
    let i = 0;
    for (let x = s / 2; x < w + s; x += s, i++) {
      const u = x / w;
      const v = y / h;
      let a = -0.36 + 0.28 * Math.sin(u * 5.2 + v * 2.4 + t * 0.35) + 0.16 * Math.sin(u * 11 - v * 4 + t * 0.12);
      const sp = opening ? opening[0] + (opening[1] - opening[0]) * Math.min(1, Math.max(0, u)) : spread;
      const centre = cy0 + amp * Math.sin(u * freq + 0.6 + t * 0.15);
      const band = Math.exp(-(((v - centre) / sp) ** 2));
      const fade = Math.min(1, u * fadeIn) * (fadeRight ? Math.min(1, (1 - u) * fadeOut) : 1);
      let k = Math.max(0.05, band * fade);
      if (pointer) {
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const g = Math.exp(-((dx * dx + dy * dy) / (pointer.radius * pointer.radius)));
        if (g > 0.01) {
          a += pointer.strength * g * Math.sin(Math.atan2(dy, dx) - a);
          k = Math.min(1, k + 0.35 * g);
        }
      }
      const len = s * (0.2 + 0.95 * k);
      const accent = band > 0.7 && hash(i, j, seed) < share && u > 0.3;
      const al = accent ? 1 : alpha * (floor + (1 - floor) * k);
      if (al > 0.02) out.push({ points: bladePoints(x, y, a, len), alpha: al, accent });
    }
  }
  return out;
}

/** Default grid step for a surface: the master uses h / 14, never below 10px. */
export function streamStep(w: number, h: number, density: "master" | "fine" | "macro" | "light" = "master"): number {
  switch (density) {
    case "fine":
      return Math.max(8, h / 26);
    case "macro":
      return Math.max(16, h / 9);
    case "light":
      return Math.max(14, h / 10);
    default:
      return Math.max(10, h / 14);
  }
}

const f = (v: number) => (Math.round(v * 100) / 100).toString();

/**
 * Static SVG markup (inner content) for server rendering and PDFs. Blades are
 * grouped by colour and opacity level so the output stays small.
 */
export function streamSvgPaths(blades: Blade[], ink: string, accent: string): string {
  const groups = new Map<string, string[]>();
  for (const b of blades) {
    const key = `${b.accent ? "a" : "i"}:${Math.round(b.alpha * 20)}`;
    const p = b.points;
    const d = `M${f(p[0])},${f(p[1])}L${f(p[2])},${f(p[3])}L${f(p[4])},${f(p[5])}Z`;
    groups.set(key, [...(groups.get(key) ?? []), d]);
  }
  let out = "";
  for (const [key, ds] of groups) {
    const [kind, level] = key.split(":");
    const opacity = Number(level) / 20;
    out += `<path fill="${kind === "a" ? accent : ink}" fill-opacity="${f(opacity)}" d="${ds.join("")}"/>`;
  }
  return out;
}
