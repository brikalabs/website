/**
 * Scattered "galaxy" of component chips orbiting the Clay tile cluster.
 *
 * Positions, depths, dot colors, and animation phases are hand-tuned
 * (not random) so the constellation looks deliberate across reloads.
 *
 * - `pos`:   positioning string applied as classes
 * - `depth`: 0..1, controls scale + opacity (further chips read smaller)
 * - `dot`:   oklch tuple [L, C, H] for the indicator — distinct warm
 *            hues across the field, so the chips read as different
 *            stars rather than a uniform field of amber
 * - `phase`: animation-delay seconds for the float drift, staggered
 */
type ChipSpec = {
  key: string;
  pos: string;
  depth: number;
  dot: [number, number, number];
  phase: number;
};

/**
 * All positions stay OUTSIDE the logo's bounding box (x=24-76%, y=22-78%)
 * so the brand mark is never occluded. Chips orbit only the perimeter:
 *
 *   TOP   strip y ∈ [-4, 18]%      (above logo, any x)
 *   BOT   strip y ∈ [82, 104]%     (below logo, any x)
 *   LEFT  strip x ∈ [-8,  22]%, y ∈ [18, 82]%
 *   RIGHT strip x ∈ [78, 108]%, y ∈ [18, 82]%
 *
 * Negative offsets (e.g. `-left-[4%]`) push outer-halo chips off the
 * visual's edge for a "spilling out" feel without crossing the logo.
 */
export const CHIPS: ChipSpec[] = [
  // TOP — above the logo
  { key: 'button', pos: '-top-[2%] left-[4%]', depth: 1, dot: [0.82, 0.18, 65], phase: 0 },
  { key: 'card', pos: '-top-[4%] right-[6%]', depth: 1, dot: [0.7, 0.18, 25], phase: 0.6 },
  { key: 'checkbox', pos: 'top-[2%] left-[44%]', depth: 0.78, dot: [0.88, 0.13, 85], phase: 3.3 },
  { key: 'sheet', pos: 'top-[8%] left-[22%]', depth: 0.6, dot: [0.85, 0.1, 100], phase: 1.05 },
  { key: 'tooltip', pos: 'top-[10%] right-[26%]', depth: 0.72, dot: [0.76, 0.16, 50], phase: 0.9 },

  // RIGHT — to the right of the logo
  { key: 'slider', pos: 'top-[26%] -right-[6%]', depth: 0.74, dot: [0.72, 0.17, 35], phase: 2.1 },
  { key: 'input', pos: 'top-[44%] -right-[4%]', depth: 1, dot: [0.86, 0.16, 78], phase: 3 },
  { key: 'popover', pos: 'top-[60%] right-[2%]', depth: 0.76, dot: [0.74, 0.18, 20], phase: 0.45 },
  { key: 'badge', pos: 'top-[76%] right-[8%]', depth: 0.78, dot: [0.88, 0.16, 95], phase: 1.5 },

  // BOTTOM — below the logo
  { key: 'tabs', pos: 'bottom-[4%] left-[10%]', depth: 1, dot: [0.8, 0.17, 55], phase: 2.4 },
  {
    key: 'accordion',
    pos: 'bottom-[12%] left-[28%]',
    depth: 0.58,
    dot: [0.78, 0.12, 110],
    phase: 1.65,
  },
  {
    key: 'skeleton',
    pos: '-bottom-[2%] left-[44%]',
    depth: 0.58,
    dot: [0.82, 0.1, 70],
    phase: 0.15,
  },
  { key: 'dialog', pos: 'bottom-[2%] right-[18%]', depth: 1, dot: [0.78, 0.19, 40], phase: 1.8 },
  { key: 'toast', pos: '-bottom-[2%] right-[2%]', depth: 0.6, dot: [0.84, 0.13, 88], phase: 2.85 },

  // LEFT — to the left of the logo
  { key: 'avatar', pos: 'top-[68%] -left-[4%]', depth: 0.76, dot: [0.86, 0.14, 105], phase: 2.7 },
  { key: 'select', pos: 'top-[52%] -left-[8%]', depth: 0.78, dot: [0.83, 0.16, 60], phase: 0.3 },
  { key: 'switch', pos: 'top-[36%] -left-[4%]', depth: 1, dot: [0.76, 0.18, 30], phase: 1.2 },
  { key: 'drawer', pos: 'top-[20%] left-[2%]', depth: 0.55, dot: [0.8, 0.11, 45], phase: 1.35 },

  // Corner accents
  { key: 'alert', pos: 'bottom-[22%] -left-[6%]', depth: 0.55, dot: [0.74, 0.14, 28], phase: 2.25 },
  { key: 'progress', pos: 'top-[16%] right-[2%]', depth: 0.55, dot: [0.86, 0.1, 92], phase: 0.75 },
];
