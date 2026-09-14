"use client";

import * as React from "react";
import { computeGlobe, globeCount, shadeIndex, SYMBOL_TRIANGLES, type GlobeLean, type GlobeParams } from "./globe-math";

export const BLUE_RAMP = ["#5FB4EC", "#2E86CF", "#1C6EB4", "#145187"] as const;

export type GlobePlacement = {
  /** Centre of the sphere as a fraction of the surface. */
  x?: number;
  y?: number;
  /** Radius as a fraction of the shorter side. */
  size?: number;
};

type GlobeCanvasProps = {
  params?: GlobeParams;
  placement?: GlobePlacement;
  /** The blue ramp, palest first. Depth is the only shading the globe uses. */
  ramp?: readonly string[];
  hair?: string;
  /** Mirror the placement (not the geography) for right to left pages. */
  mirror?: boolean;
  interactive?: boolean;
  className?: string;
  onReady?: () => void;
};

/**
 * The globe, drawn on a 2D canvas and always turning. It answers the pointer
 * with a small lean, adapts its lattice to the surface, pauses when it is off
 * screen or the tab is hidden, and settles into a single still frame for
 * anyone who has asked for less motion.
 */
export function GlobeCanvas({ params, placement, ramp = BLUE_RAMP, hair = "#A9DCF7", mirror = false, interactive = true, className, onReady }: GlobeCanvasProps) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const readyRef = React.useRef(false);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const place = { x: placement?.x ?? 0.5, y: placement?.y ?? 0.5, size: placement?.size ?? 0.46 };

    let w = 0, h = 0, dpr = 1, raf = 0, last = 0;
    let visible = true;
    const target = { x: 0, y: 0, active: false, since: 0 };
    const lean = { x: 0, y: 0 };

    const frameInterval = () => {
      const cores = navigator.hardwareConcurrency ?? 4;
      return w < 640 || cores <= 4 ? 1000 / 24 : 1000 / 30;
    };

    const geometry = () => {
      const fx = mirror ? 1 - place.x : place.x;
      const R = Math.min(w, h) * place.size;
      return { cx: w * fx, cy: h * place.y, R };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now() / 1000);
    };

    const currentLean = (): GlobeLean => {
      if (reduced.matches || !interactive) return null;
      const to = target.active ? target : { x: 0, y: 0 };
      lean.x += (to.x - lean.x) * 0.06;
      lean.y += (to.y - lean.y) * 0.06;
      if (Math.abs(lean.x) < 0.002 && Math.abs(lean.y) < 0.002) return null;
      return { x: lean.x, y: lean.y };
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const { cx, cy, R } = geometry();
      if (R < 8) return;
      const frame = computeGlobe(cx, cy, R, { count: globeCount(R), ...params }, reduced.matches ? 0 : t, currentLean());

      /* The graticule first: it sits under the field, never over it. */
      ctx.lineWidth = 1;
      ctx.strokeStyle = hair;
      for (const arc of frame.arcs) {
        if (arc.alpha <= 0.02 || arc.pts.length < 4) continue;
        ctx.globalAlpha = arc.alpha;
        ctx.beginPath();
        ctx.moveTo(arc.pts[0] ?? 0, arc.pts[1] ?? 0);
        for (let i = 2; i < arc.pts.length; i += 2) ctx.lineTo(arc.pts[i] ?? 0, arc.pts[i + 1] ?? 0);
        ctx.stroke();
      }

      /* Then the symbol, once per point, one step of the blue ramp at a time. */
      for (let tone = 0; tone < ramp.length; tone++) {
        ctx.fillStyle = ramp[tone] ?? "#74C3F2";
        for (const m of frame.marks) {
          if (shadeIndex(m.shade, ramp.length) !== tone) continue;
          ctx.globalAlpha = m.alpha;
          ctx.beginPath();
          for (const tri of SYMBOL_TRIANGLES) {
            ctx.moveTo(m.x + tri[0] * m.size, m.y + tri[1] * m.size);
            ctx.lineTo(m.x + tri[2] * m.size, m.y + tri[3] * m.size);
            ctx.lineTo(m.x + tri[4] * m.size, m.y + tri[5] * m.size);
            ctx.closePath();
          }
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (!readyRef.current) {
        readyRef.current = true;
        onReady?.();
      }
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible || reduced.matches) return;
      if (now - last >= frameInterval()) {
        last = now;
        draw(now / 1000);
      }
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (raf || reduced.matches || !visible) return;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = !!entry?.isIntersecting;
      if (visible) start();
      else stop();
    }, { threshold: 0.05 });
    io.observe(canvas);

    const setTarget = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const { cx, cy, R } = geometry();
      target.x = Math.max(-1, Math.min(1, (clientX - rect.left - cx) / (R * 1.8)));
      target.y = Math.max(-1, Math.min(1, (clientY - rect.top - cy) / (R * 1.8)));
      target.active = true;
      target.since = performance.now();
    };
    const onPointer = (e: PointerEvent) => setTarget(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t0 = e.touches[0];
      if (t0) setTarget(t0.clientX, t0.clientY);
    };
    const onLeave = () => {
      target.active = false;
    };
    const release = window.setInterval(() => {
      if (target.active && performance.now() - target.since > 2200) target.active = false;
    }, 700);

    const host = canvas.parentElement ?? canvas;
    if (interactive) {
      host.addEventListener("pointermove", onPointer, { passive: true });
      host.addEventListener("pointerdown", onPointer, { passive: true });
      host.addEventListener("pointerleave", onLeave, { passive: true });
      host.addEventListener("pointercancel", onLeave, { passive: true });
      host.addEventListener("touchmove", onTouch, { passive: true });
      host.addEventListener("touchend", onLeave, { passive: true });
    }
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    const onMotionChange = () => {
      stop();
      resize();
      start();
    };
    reduced.addEventListener("change", onMotionChange);

    resize();
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.clearInterval(release);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onMotionChange);
      if (interactive) {
        host.removeEventListener("pointermove", onPointer);
        host.removeEventListener("pointerdown", onPointer);
        host.removeEventListener("pointerleave", onLeave);
        host.removeEventListener("pointercancel", onLeave);
        host.removeEventListener("touchmove", onTouch);
        host.removeEventListener("touchend", onLeave);
      }
    };
  }, [params, placement, ramp, hair, mirror, interactive, onReady]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
