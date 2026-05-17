/**
 * Network simulation primitives for the DotGridBackground canvas effect.
 *
 * The renderer in `index.tsx` wires browser DOM (canvas, mouse, resize) to
 * the pure functions in here, which deal only with arrays of `Node`s and
 * the drawing context.
 */

export interface NetworkPalette {
  /** Node fill color "r, g, b". */
  node: string;
  /** Connection line color "r, g, b". */
  line: string;
}

export interface Node {
  /** Anchor — center the node drifts around. */
  ax: number;
  ay: number;
  /** Current animated position. */
  x: number;
  y: number;
  driftR: number;
  driftSpeed: number;
  phaseX: number;
  phaseY: number;
  /** Cursor proximity highlight, 0–1. Smooth decay each frame. */
  brightness: number;
}

interface PlaceNodesOptions {
  width: number;
  height: number;
  density: number;
  driftAmplitude: number;
}

/**
 * Jittered grid: divide canvas into cells, place one node per cell at
 * a random offset within the cell. Produces an organic-looking
 * distribution without true Poisson-disc sampling overhead.
 */
export function placeNodes({ width, height, density, driftAmplitude }: PlaceNodesOptions): Node[] {
  const targetCount = Math.max(24, Math.round(((width * height) / 1_000_000) * density));
  const cellSize = Math.sqrt((width * height) / targetCount);
  const cols = Math.max(1, Math.ceil(width / cellSize));
  const rows = Math.max(1, Math.ceil(height / cellSize));

  const nodes: Node[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const x = (i + 0.2 + Math.random() * 0.6) * cellSize;
      const y = (j + 0.2 + Math.random() * 0.6) * cellSize;
      if (x > width + 10 || y > height + 10) {
        continue;
      }
      nodes.push({
        ax: x,
        ay: y,
        x,
        y,
        driftR: driftAmplitude * (0.6 + Math.random() * 0.8),
        // Slower than before — drift should be barely perceptible, like
        // the surface of still water moving in a breeze.
        driftSpeed: 0.00012 + Math.random() * 0.00022,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        brightness: 0,
      });
    }
  }
  return nodes;
}

/** Barely-perceptible drift on slightly different X/Y frequencies (soft
 *  Lissajous, not a circle). Decays prior cursor/breathe brightness. */
export function updateNodes(nodes: Node[], now: number) {
  for (const n of nodes) {
    n.x = n.ax + Math.cos(now * n.driftSpeed + n.phaseX) * n.driftR;
    n.y = n.ay + Math.sin(now * n.driftSpeed * 0.78 + n.phaseY) * n.driftR;
    // Slow decay so a breathe takes ~2-3 seconds to fade fully.
    n.brightness *= 0.97;
  }
}

/** Boost brightness on nodes within `radius` of (mouseX, mouseY). Uses
 *  max-of(current, target) so the highlight grows fast and decays smoothly
 *  via the per-frame multiplier in `updateNodes`. */
export function applyCursorBrightness(
  nodes: Node[],
  mouseX: number,
  mouseY: number,
  radius: number
) {
  for (const n of nodes) {
    const d = Math.hypot(n.x - mouseX, n.y - mouseY);
    if (d < radius) {
      const k = 1 - d / radius;
      const target = k * k * 0.95;
      if (target > n.brightness) {
        n.brightness = target;
      }
    }
  }
}

/** Pair connections — O(N²) is fine at N≈60. Quadratic alpha falloff so
 *  the network reads as a faint web only where nodes sit close to each
 *  other. Capped at 0.22 — anything more reads as "particles.js demo". */
export function drawConnections(
  ctx: CanvasRenderingContext2D,
  nodes: Node[],
  palette: NetworkPalette,
  maxDistance: number
) {
  ctx.lineCap = 'round';
  ctx.lineWidth = 0.7;
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dsq = dx * dx + dy * dy;
      if (dsq < maxDistance * maxDistance) {
        const d = Math.sqrt(dsq);
        const k = 1 - d / maxDistance;
        const boost = Math.max(a.brightness, b.brightness);
        const alpha = k * k * 0.22 + boost * k * 0.22;
        ctx.strokeStyle = `rgba(${palette.line}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
}

/** Small filled circles. Cursor proximity + breathes lift both brightness
 *  and radius slightly. */
export function drawNodes(ctx: CanvasRenderingContext2D, nodes: Node[], palette: NetworkPalette) {
  for (const n of nodes) {
    const r = 1.4 + n.brightness * 1.3;
    const alpha = 0.5 + n.brightness * 0.5;
    ctx.fillStyle = `rgba(${palette.node}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Pick a random node and softly raise its brightness. The per-frame
 *  decay in `updateNodes` fades it back to baseline naturally. */
export function breathe(nodes: Node[]) {
  if (!nodes.length) {
    return;
  }
  const idx = Math.floor(Math.random() * nodes.length);
  nodes[idx].brightness = Math.max(nodes[idx].brightness, 0.8);
}

/** Find the index of the node closest to (x, y). */
export function nearestNodeIndex(nodes: Node[], x: number, y: number): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const d = Math.hypot(n.x - x, n.y - y);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}
