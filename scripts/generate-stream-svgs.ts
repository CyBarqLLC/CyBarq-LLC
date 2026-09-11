/**
 * Regenerates the static Stream SVG files under public/brand/pattern from the
 * pattern code, so the first paint matches the animated field.
 *
 *   node --experimental-strip-types scripts/generate-stream-svgs.ts
 */
import { writeFileSync } from "node:fs";
import { computeStream, streamStep, streamSvgPaths, STREAM_PRESETS, type StreamParams, type StreamPreset } from "../src/components/brand/stream-math.ts";

type Job = { file: string; note: string; preset: StreamPreset; width: number; height: number; density: "master" | "fine" | "macro" | "light"; params: StreamParams; ink: string; accent: string };

const jobs: Job[] = [
  {
    file: "public/brand/pattern/stream-opening-hero.svg",
    note: "Home hero first paint (the canvas takes over after hydration).",
    preset: "opening", width: 1200, height: 520, density: "master", params: { fadeIn: 1.4 }, ink: "#0D0E13", accent: "#74C3F2",
  },
  {
    file: "public/brand/pattern/stream-fine-footer.svg",
    note: "Fine form in CyBarq Blue for the footer on Ice.",
    preset: "fine", width: 900, height: 520, density: "fine", params: { fadeIn: 1.2 }, ink: "#74C3F2", accent: "#74C3F2",
  },
];

for (const job of jobs) {
  const merged: StreamParams = { ...STREAM_PRESETS[job.preset], ...job.params };
  const blades = computeStream(job.width, job.height, streamStep(job.width, job.height, job.density), merged, 0);
  const inner = streamSvgPaths(blades, job.ink, job.accent);
  const comment = `<!-- CyBarq Stream, ${job.note} Generated from src/components/brand/stream-math.ts: preset ${job.preset}, ${job.width}x${job.height}, ${job.density} grid, params ${JSON.stringify(job.params)}. Do not edit by hand. -->`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${job.width} ${job.height}" preserveAspectRatio="xMidYMid slice">${comment}${inner}</svg>\n`;
  writeFileSync(job.file, svg);
  console.log(`${job.file}: ${svg.length} bytes, ${blades.length} blades`);
}
