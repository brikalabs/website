'use client';

import { useEffect, useState } from 'react';
import { PixelBlast, type PixelBlastProps } from './pixel-blast';

// THREE.Color only parses hex/rgb/named colors. Modern browsers return
// `lab(...)` from getComputedStyle when --primary is oklch, so we paint the
// resolved color onto a 1x1 canvas and read it back as guaranteed sRGB.
function readPrimaryColor(): string {
  const probe = document.createElement('span');
  probe.style.color = 'var(--primary)';
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const cssColor = globalThis.getComputedStyle(probe).color;
  probe.remove();
  if (!cssColor) {
    return '';
  }
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return cssColor;
  }
  ctx.fillStyle = cssColor;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}

export function PixelBlastBackground(props: Readonly<Omit<PixelBlastProps, 'color'>>) {
  // Server-safe fallback close to dark-mode --primary so the first paint isn't gray.
  const [color, setColor] = useState('rgb(155, 145, 230)');

  useEffect(() => {
    const sync = () => {
      const resolved = readPrimaryColor();
      if (resolved) {
        setColor(resolved);
      }
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style'],
    });
    return () => observer.disconnect();
  }, []);

  return <PixelBlast {...props} color={color} />;
}
