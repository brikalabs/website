'use client';

import { type CSSProperties, useEffect, useRef } from 'react';
import {
  applyCursorBrightness,
  breathe,
  drawConnections,
  drawNodes,
  type NetworkPalette,
  type Node,
  nearestNodeIndex,
  placeNodes,
  updateNodes,
} from './network';

interface NetworkBackgroundProps {
  /** Approximate node count per million pixels of canvas area. */
  density?: number;
  /** Max distance (px) at which two nodes still draw a connection. */
  connectionDistance?: number;
  /** Amplitude of each node's idle drift, in px. */
  driftAmplitude?: number;
  /** Average ms between ambient node "breathes" (soft glow-and-fade). */
  breatheInterval?: number;
  /** Cursor influence radius in px. */
  cursorRadius?: number;
  dark?: NetworkPalette;
  light?: NetworkPalette;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_DARK: NetworkPalette = {
  node: '150, 195, 220',
  line: '150, 195, 220',
};

const DEFAULT_LIGHT: NetworkPalette = {
  node: '75, 115, 150',
  line: '75, 115, 150',
};

const OFFSCREEN = -1e6;

/**
 * Soft constellation network background.
 *
 * Organic (jittered, not lattice) node placement, each node gently drifts on
 * a 2D Lissajous-like path. Every frame, all node pairs within
 * `connectionDistance` are connected by a thin line whose alpha falls off
 * quadratically with distance. Pulses periodically travel along random
 * connections. Cursor proximity smoothly brightens nearby nodes and draws
 * faint connections from cursor to the closest 3.
 *
 * Goal: ambient and refined — modern SaaS landing-page feel (Stripe, Linear,
 * Apple), not flashy. No reticles, no comets, no hard edges.
 *
 * Auto-adapts to `.dark` on <html>. Honors `prefers-reduced-motion`
 * (static layout, no drift, no pulses).
 */
export function DotGridBackground({
  density = 65,
  connectionDistance = 150,
  driftAmplitude = 4,
  breatheInterval = 2200,
  cursorRadius = 200,
  dark = DEFAULT_DARK,
  light = DEFAULT_LIGHT,
  className,
  style,
}: Readonly<NetworkBackgroundProps>) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!(wrap && canvas)) {
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let nodes: Node[] = [];
    let width = 0;
    let height = 0;
    let nextBreatheAt = 0;
    let mouseX = OFFSCREEN;
    let mouseY = OFFSCREEN;
    let raf = 0;

    let palette: NetworkPalette = document.documentElement.classList.contains('dark')
      ? dark
      : light;

    const themeObserver = new MutationObserver(() => {
      palette = document.documentElement.classList.contains('dark') ? dark : light;
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    function resizeAndPlace() {
      const b = wrap?.getBoundingClientRect();
      if (!b) {
        return;
      }
      width = b.width;
      height = b.height;
      if (!canvas) {
        return;
      }
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      nodes = placeNodes({ width, height, density, driftAmplitude });
    }

    resizeAndPlace();
    const ro = new ResizeObserver(() => resizeAndPlace());
    ro.observe(wrap);

    function draw(now: number) {
      ctx?.clearRect(0, 0, width, height);
      if (!ctx) {
        return;
      }

      if (!reduce) {
        updateNodes(nodes, now);
      }
      if (mouseX > -1e5) {
        applyCursorBrightness(nodes, mouseX, mouseY, cursorRadius);
      }
      drawConnections(ctx, nodes, palette, connectionDistance);
      if (!reduce && now > nextBreatheAt) {
        breathe(nodes);
        nextBreatheAt = now + breatheInterval * (0.6 + Math.random() * 0.8);
      }
      drawNodes(ctx, nodes, palette);

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    function onMove(e: PointerEvent) {
      const r = canvas?.getBoundingClientRect();
      if (!r) {
        return;
      }
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    }

    function onLeave() {
      mouseX = OFFSCREEN;
      mouseY = OFFSCREEN;
    }

    function onClick(e: MouseEvent) {
      if (reduce) {
        return;
      }
      const r = canvas?.getBoundingClientRect();
      if (!r) {
        return;
      }
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      // Click softly brightens the nearest node — no traveling sparks.
      const idx = nearestNodeIndex(nodes, x, y);
      if (nodes[idx]) {
        nodes[idx].brightness = 1;
      }
    }

    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', onLeave);
    wrap.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObserver.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
      wrap.removeEventListener('click', onClick);
    };
  }, [density, connectionDistance, driftAmplitude, breatheInterval, cursorRadius, dark, light]);

  return (
    <div ref={wrapperRef} className={className} style={style}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
