import { computeStream, streamStep, streamSvgPaths, STREAM_PRESETS, type StreamPreset, type StreamParams } from "./stream-math";
import { cn } from "@/lib/utils/cn";

type StreamStaticProps = {
  preset?: StreamPreset;
  params?: StreamParams;
  /** Virtual surface size; the SVG scales to its container. */
  width?: number;
  height?: number;
  density?: "master" | "fine" | "macro" | "light";
  ink?: string;
  accent?: string;
  className?: string;
  preserveAspectRatio?: string;
};

/**
 * Server rendered Stream as inline SVG. Used as the first paint of the hero
 * (the canvas takes over after hydration), for section backdrops, and for
 * documents. No JavaScript required.
 */
export function StreamStatic({
  preset = "stream",
  params,
  width = 1200,
  height = 420,
  density = "master",
  ink = "#0D0E13",
  accent = "#74C3F2",
  className,
  preserveAspectRatio = "xMidYMid slice",
}: StreamStaticProps) {
  const merged: StreamParams = { ...STREAM_PRESETS[preset], ...params };
  const blades = computeStream(width, height, streamStep(width, height, density), merged, 0);
  const inner = streamSvgPaths(blades, ink, accent);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={preserveAspectRatio}
      className={cn("h-full w-full", className)}
      aria-hidden
      focusable="false"
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}
