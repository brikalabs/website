import { House, type LucideIcon, PackageCheck, Puzzle, ShieldCheck, Workflow } from 'lucide-react';

export type FeatureKey =
  | 'localFirst'
  | 'alwaysOn'
  | 'visualBuilder'
  | 'extensible'
  | 'runsAnywhere';

export interface Feature {
  icon: LucideIcon;
  key: FeatureKey;
  color: string;
  /** RGB triplet for use in rgba() — particles + spotlight glow. */
  rgb: string;
  /** "H S L" triplet for the BorderGlow outer glow. */
  hsl: string;
  /** 3 hex stops used by BorderGlow's mesh-gradient border. */
  mesh: readonly [string, string, string];
  /** Hero card spans 2 columns and gets a larger header. */
  hero?: boolean;
  /** Optional anchor link the CTA at the bottom of the card points to. */
  href?: string;
}

export const FEATURES: Feature[] = [
  {
    icon: House,
    key: 'localFirst',
    color: 'oklch(0.72 0.15 145)',
    rgb: '108, 196, 116',
    hsl: '125 50 60',
    mesh: ['#6cc474', '#a3e7a8', '#38bdf8'],
    hero: true,
  },
  {
    icon: ShieldCheck,
    key: 'alwaysOn',
    color: 'oklch(0.74 0.14 215)',
    rgb: '82, 184, 220',
    hsl: '196 65 60',
    mesh: ['#52b8dc', '#38bdf8', '#c084fc'],
  },
  {
    icon: Workflow,
    key: 'visualBuilder',
    color: 'oklch(0.7 0.16 265)',
    rgb: '139, 117, 240',
    hsl: '248 80 70',
    mesh: ['#8b75f0', '#c084fc', '#f472b6'],
    href: '#bricks',
  },
  {
    icon: Puzzle,
    key: 'extensible',
    color: 'oklch(0.72 0.18 45)',
    rgb: '232, 138, 70',
    hsl: '26 80 60',
    mesh: ['#e88a46', '#fbbf77', '#f472b6'],
    href: '#plugins',
  },
  {
    icon: PackageCheck,
    key: 'runsAnywhere',
    color: 'oklch(0.66 0.18 320)',
    rgb: '220, 96, 188',
    hsl: '314 65 62',
    mesh: ['#dc60bc', '#f472b6', '#c084fc'],
    href: '#install',
  },
];
