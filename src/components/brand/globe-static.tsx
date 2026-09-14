import { computeGlobe, globeCount, globeSvg, type GlobeParams } from "./globe-math";
import { cn } from "@/lib/utils/cn";

type GlobeStaticProps = {
  params?: GlobeParams;
  /** Virtual surface; the SVG scales to its container. */
  width?: number;
  height?: number;
  /** Centre and radius, as fractions of the surface. */
  x?: number;
  y?: number;
  size?: number;
  ink?: string;
  blue?: string;
  lime?: string;
  hair?: string;
  className?: string;
  preserveAspectRatio?: string;
};

/**
 * The still globe, rendered on the server as inline SVG. It is the first paint
 * of any surface the canvas will take over, and the whole picture where
 * scripts do not run.
 */
export function GlobeStatic({
  params,
  width = 1200,
  height = 900,
  x = 0.5,
  y = 0.5,
  size = 0.46,
  ink = "#0D0E13",
  blue = "#74C3F2",
  lime = "#C5E27A",
  hair = "#C6C8CB",
  className,
  preserveAspectRatio = "xMidYMid meet",
}: GlobeStaticProps) {
  const R = Math.min(width, height) * size;
  const frame = computeGlobe(width * x, height * y, R, { count: globeCount(R), ...params }, 0);
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={preserveAspectRatio}
      className={cn("h-full w-full", className)}
      aria-hidden
      focusable="false"
      dangerouslySetInnerHTML={{ __html: globeSvg(frame, ink, blue, lime, hair) }}
    />
  );
}
