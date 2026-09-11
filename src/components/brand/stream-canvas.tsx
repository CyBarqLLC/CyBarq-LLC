"use client";

import * as React from "react";
import { computeStream, streamStep, STREAM_PRESETS, type PointerInfluence, type StreamPreset, type StreamParams } from "./stream-math";

type StreamCanvasProps = {
  preset?: StreamPreset;
  params?: StreamParams;
  ink?: string;
  accent?: string;
  /** React to the pointer (mouse, pen and touch). */
  interactive?: boolean;
  className?: string;
  /** Called once the first animated frame is painted (to hide the static fallback). */
  onReady?: () => void;
};

/**
 * Animated Stream on a 2D canvas. Always alive: the field turns and a current
 * runs along the band on its own, a slow drifting turn wanders through the
 * field when nobody is touching it, and the pointer (mouse, pen or finger)
 * adds a local turn. Adapts grid density and frame rate to the device, pauses
 * when off screen or hidden, and renders a single static frame when the
 * person prefers reduced motion.
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
    const merged: StreamParams = { ...STREAM_PRESETS[preset], ...params };

    let w = 0, h = 0, dpr = 1, step = 20;
    let raf = 0;
    let visible = true;
    let last = 0;
    const target = { x: -9999, y: -9999, active: false, since: 0 };
    const smooth = { x: -9999, y: -9999, weight: 0 };

    const frameInterval = () => {
      const cores = navigator.hardwareConcurrency ?? 4;
      if (w < 640 || cores <= 4) return 1000 / 24;
      return 1000 / 30;
    };

    /** Grid step: the master h/14, but never sparser than a 24th of the width on narrow screens. */
    const gridStep = () => (w < 640 ? Math.max(12, Math.min(streamStep(w, h, "master"), w / 24)) : streamStep(w, h, "master"));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      step = gridStep();
      draw(performance.now() / 1000);
    };

    /** Where the turn sits: the pointer while it is active, otherwise a slow wander through the field. */
    const influence = (t: number): PointerInfluence => {
      if (reduced.matches) return null;
      const radius = Math.min(w, h) * 0.24;
      if (interactive && target.active) {
        smooth.x += (target.x - smooth.x) * 0.14;
        smooth.y += (target.y - smooth.y) * 0.14;
        smooth.weight = Math.min(1, smooth.weight + 0.08);
        return { x: smooth.x, y: smooth.y, radius, strength: 0.6 * smooth.weight };
      }
      const wx = w * (0.55 + 0.32 * Math.sin(t * 0.21) + 0.08 * Math.sin(t * 0.53));
      const wy = h * (0.5 + 0.28 * Math.sin(t * 0.17 + 1.3) + 0.08 * Math.cos(t * 0.41));
      if (smooth.weight > 0) {
        // Ease from the last pointer position back onto the wander path.
        smooth.weight = Math.max(0, smooth.weight - 0.03);
        smooth.x += (wx - smooth.x) * 0.06;
        smooth.y += (wy - smooth.y) * 0.06;
        return { x: smooth.x, y: smooth.y, radius, strength: 0.32 + 0.28 * smooth.weight };
      }
      smooth.x = wx;
      smooth.y = wy;
      return { x: wx, y: wy, radius, strength: 0.32 };
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const blades = computeStream(w, h, step, merged, reduced.matches ? 0 : t, influence(t));
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

    const setTarget = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      target.x = clientX - rect.left;
      target.y = clientY - rect.top;
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
    // A finger lifts without a "leave": let the turn rest a moment, then wander again.
    const releaseTimer = window.setInterval(() => {
      if (target.active && performance.now() - target.since > 1800) target.active = false;
    }, 600);

    const host = canvas.parentElement ?? canvas;
    if (interactive) {
      host.addEventListener("pointermove", onPointer, { passive: true });
      host.addEventListener("pointerdown", onPointer, { passive: true });
      host.addEventListener("pointerleave", onLeave, { passive: true });
      host.addEventListener("pointercancel", onLeave, { passive: true });
      host.addEventListener("touchmove", onTouch, { passive: true });
      host.addEventListener("touchend", onLeave, { passive: true });
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
      window.clearInterval(releaseTimer);
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
  }, [preset, params, ink, accent, interactive, onReady]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
