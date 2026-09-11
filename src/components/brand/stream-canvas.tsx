"use client";

import * as React from "react";
import { computeStream, streamStep, STREAM_PRESETS, type PointerInfluence, type StreamPreset, type StreamParams } from "./stream-math";

type StreamCanvasProps = {
  preset?: StreamPreset;
  params?: StreamParams;
  ink?: string;
  accent?: string;
  /** Pointer reaction on fine pointers only. */
  interactive?: boolean;
  className?: string;
  /** Called once the first animated frame is painted (to hide the static fallback). */
  onReady?: () => void;
};

/**
 * Animated Stream on a 2D canvas. Calm and engineered: the field turns slowly,
 * the band breathes, a fine pointer adds a local turn. Adapts grid density and
 * frame rate to the device, pauses when off screen, and renders a single static
 * frame when the user prefers reduced motion.
 */
export function StreamCanvas({ preset = "opening", params, ink = "#0D0E13", accent = "#74C3F2", interactive = true, className, onReady }: StreamCanvasProps) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const readyRef = React.useRef(false);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const merged: StreamParams = { ...STREAM_PRESETS[preset], ...params };

    let w = 0, h = 0, dpr = 1, step = 20;
    let raf = 0;
    let visible = true;
    let last = 0;
    let pointer: PointerInfluence = null;
    const target = { x: -9999, y: -9999, active: false };
    const smooth = { x: -9999, y: -9999 };

    const density = (): "master" | "light" => (w < 640 ? "light" : "master");
    const frameInterval = () => {
      const cores = navigator.hardwareConcurrency ?? 4;
      if (w < 640 || cores <= 4) return 1000 / 24;
      return 1000 / 30;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      step = streamStep(w, h, density());
      draw(performance.now() / 1000);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      if (interactive && finePointer.matches && target.active) {
        smooth.x += (target.x - smooth.x) * 0.12;
        smooth.y += (target.y - smooth.y) * 0.12;
        pointer = { x: smooth.x, y: smooth.y, radius: Math.min(w, h) * 0.22, strength: 0.55 };
      } else {
        pointer = null;
      }
      const blades = computeStream(w, h, step, merged, reduced.matches ? 0 : t, pointer);
      // Batch by colour to keep state changes low.
      ctx.fillStyle = ink;
      for (const b of blades) {
        if (b.accent) continue;
        ctx.globalAlpha = b.alpha;
        const p = b.points;
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(p[2], p[3]);
        ctx.lineTo(p[4], p[5]);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = accent;
      ctx.globalAlpha = 1;
      for (const b of blades) {
        if (!b.accent) continue;
        const p = b.points;
        ctx.beginPath();
        ctx.moveTo(p[0], p[1]);
        ctx.lineTo(p[2], p[3]);
        ctx.lineTo(p[4], p[5]);
        ctx.closePath();
        ctx.fill();
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

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      target.active = true;
    };
    const onLeave = () => {
      target.active = false;
    };
    const host = canvas.parentElement ?? canvas;
    if (interactive) {
      host.addEventListener("pointermove", onMove, { passive: true });
      host.addEventListener("pointerleave", onLeave, { passive: true });
    }
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
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
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onMotionChange);
      if (interactive) {
        host.removeEventListener("pointermove", onMove);
        host.removeEventListener("pointerleave", onLeave);
      }
    };
  }, [preset, params, ink, accent, interactive, onReady]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
