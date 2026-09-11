import { describe, expect, it } from "vitest";
import { BLADE_APEX, BLADE_E1, bladePoints, computeStream, streamStep, streamSvgPaths, STREAM_PRESETS } from "@/components/brand/stream-math";

describe("blade geometry", () => {
  it("keeps the symbol's proportion and 20.2 degree apex", () => {
    expect(BLADE_APEX).toBeCloseTo((20.2 * Math.PI) / 180, 10);
    expect(BLADE_E1).toBe(0.83);
    const [tx, ty, bx, by, cx, cy] = bladePoints(0, 0, 0, 100);
    // tip half a length ahead of the grid point, body trailing behind it
    expect(tx).toBeCloseTo(50);
    expect(ty).toBeCloseTo(0);
    expect(bx).toBeCloseTo(50 - 100 * BLADE_E1);
    expect(by).toBeCloseTo(0);
    const raw = Math.atan2(cy - ty, cx - tx) - Math.atan2(by - ty, bx - tx);
    // Normalise to (-pi, pi]: the two edges straddle the +/-pi seam when the blade points along the x axis.
    const apex = Math.atan2(Math.sin(raw), Math.cos(raw));
    expect(Math.abs(apex)).toBeCloseTo(BLADE_APEX, 6);
  });
});

describe("stream field", () => {
  it("is deterministic for the same inputs", () => {
    const a = computeStream(600, 300, streamStep(600, 300), STREAM_PRESETS.stream, 0);
    const b = computeStream(600, 300, streamStep(600, 300), STREAM_PRESETS.stream, 0);
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(100);
  });
  it("uses the master grid of h / 14 with a 10px floor", () => {
    expect(streamStep(1200, 420)).toBeCloseTo(30);
    expect(streamStep(100, 50)).toBe(10);
  });
  it("keeps accent blades a small share inside the band", () => {
    const blades = computeStream(1200, 420, streamStep(1200, 420), STREAM_PRESETS.stream, 0);
    const accents = blades.filter((b) => b.accent);
    expect(accents.length).toBeGreaterThan(0);
    expect(accents.length / blades.length).toBeLessThan(0.08);
    for (const b of blades) {
      expect(b.alpha).toBeGreaterThan(0.02);
      expect(b.alpha).toBeLessThanOrEqual(1);
    }
  });
  it("changes with time and pointer without exploding", () => {
    const t0 = computeStream(600, 300, 20, STREAM_PRESETS.opening, 0);
    const t1 = computeStream(600, 300, 20, STREAM_PRESETS.opening, 5);
    expect(t0).not.toEqual(t1);
    const p = computeStream(600, 300, 20, STREAM_PRESETS.opening, 0, { x: 300, y: 150, radius: 80, strength: 0.5 });
    expect(p.length).toBe(t0.length);
    for (const b of p) for (const v of b.points) expect(Number.isFinite(v)).toBe(true);
  });
  it("emits compact grouped SVG paths", () => {
    const blades = computeStream(400, 200, 20, STREAM_PRESETS.line, 0);
    const svg = streamSvgPaths(blades, "#0D0E13", "#74C3F2");
    expect(svg).toMatch(/<path fill="#0D0E13" fill-opacity="[0-9.]+" d="M/);
    expect(svg).not.toContain("NaN");
  });
});
