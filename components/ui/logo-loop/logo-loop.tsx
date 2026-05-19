'use client';

import {
  type CSSProperties,
  type Key,
  memo,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './logo-loop.css';

/**
 * Time constant (seconds) for exponential easing toward the target velocity.
 * Smaller = snappier; larger = more glide. 0.25s feels alive without being
 * twitchy when hovering.
 */
const SMOOTH_TAU = 0.25;
const MIN_COPIES = 2;
/** Spare copies past the measured viewport, so the loop never reveals a gap
 *  while the track wraps. */
const COPY_HEADROOM = 2;

export interface LogoNodeItem {
  node: ReactNode;
  title?: string;
  href?: string;
  ariaLabel?: string;
}

export interface LogoImageItem {
  src: string;
  alt?: string;
  title?: string;
  href?: string;
  srcSet?: string;
  sizes?: string;
  width?: number;
  height?: number;
}

export type LogoItem = LogoNodeItem | LogoImageItem;

export interface LogoLoopProps {
  logos: LogoItem[];
  /** Pixels per second. Negative inverts direction. */
  speed?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  /** Velocity (px/s) while hovered. `0` pauses; small values feel like
   *  deceleration. `undefined` keeps full speed. */
  hoverSpeed?: number;
  fadeOut?: boolean;
  fadeOutColor?: string;
  scaleOnHover?: boolean;
  renderItem?: (item: LogoItem, key: Key) => ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

function toCssLength(value: number | string | undefined): string | undefined {
  if (typeof value === 'number') {
    return `${value}px`;
  }
  return value ?? undefined;
}

function useResizeObserver(
  callback: () => void,
  elements: RefObject<Element | null>[],
  dependencies: unknown[]
) {
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', callback);
      callback();
      return () => window.removeEventListener('resize', callback);
    }
    const observers = elements.map((ref) => {
      if (!ref.current) {
        return null;
      }
      const observer = new ResizeObserver(callback);
      observer.observe(ref.current);
      return observer;
    });
    callback();
    return () => {
      for (const observer of observers) {
        observer?.disconnect();
      }
    };
  }, [callback, ...dependencies]);
}

function useImageLoader(
  seqRef: RefObject<HTMLElement | null>,
  onLoad: () => void,
  dependencies: unknown[]
) {
  useEffect(() => {
    const images = seqRef.current?.querySelectorAll('img') ?? [];
    if (images.length === 0) {
      onLoad();
      return;
    }
    let remaining = images.length;
    const handle = () => {
      remaining -= 1;
      if (remaining === 0) {
        onLoad();
      }
    };
    for (const img of images) {
      if (img.complete) {
        handle();
      } else {
        img.addEventListener('load', handle, { once: true });
        img.addEventListener('error', handle, { once: true });
      }
    }
    return () => {
      for (const img of images) {
        img.removeEventListener('load', handle);
        img.removeEventListener('error', handle);
      }
    };
  }, [onLoad, seqRef, ...dependencies]);
}

function useAnimationLoop(
  trackRef: RefObject<HTMLDivElement | null>,
  targetVelocity: number,
  seqWidth: number,
  seqHeight: number,
  isHovered: boolean,
  hoverSpeed: number | undefined,
  isVertical: boolean
) {
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }
    const seqSize = isVertical ? seqHeight : seqWidth;

    if (seqSize > 0) {
      offsetRef.current = ((offsetRef.current % seqSize) + seqSize) % seqSize;
      track.style.transform = isVertical
        ? `translate3d(0, ${-offsetRef.current}px, 0)`
        : `translate3d(${-offsetRef.current}px, 0, 0)`;
    }

    const animate = (timestamp: number) => {
      lastTimestampRef.current ??= timestamp;
      const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000;
      lastTimestampRef.current = timestamp;

      const target = isHovered && hoverSpeed !== undefined ? hoverSpeed : targetVelocity;
      const easingFactor = 1 - Math.exp(-deltaTime / SMOOTH_TAU);
      velocityRef.current += (target - velocityRef.current) * easingFactor;

      if (seqSize > 0) {
        let next = offsetRef.current + velocityRef.current * deltaTime;
        next = ((next % seqSize) + seqSize) % seqSize;
        offsetRef.current = next;
        track.style.transform = isVertical
          ? `translate3d(0, ${-next}px, 0)`
          : `translate3d(${-next}px, 0, 0)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimestampRef.current = null;
    };
  }, [targetVelocity, seqWidth, seqHeight, isHovered, hoverSpeed, isVertical, trackRef]);
}

function isNodeItem(item: LogoItem): item is LogoNodeItem {
  return 'node' in item;
}

export const LogoLoop = memo(function LogoLoop({
  logos,
  speed = 120,
  direction = 'left',
  width = '100%',
  logoHeight = 28,
  gap = 32,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = 'Partner logos',
  className,
  style,
}: Readonly<LogoLoopProps>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const seqRef = useRef<HTMLUListElement>(null);

  const [seqWidth, setSeqWidth] = useState(0);
  const [seqHeight, setSeqHeight] = useState(0);
  const [copyCount, setCopyCount] = useState(MIN_COPIES);
  const [isHovered, setIsHovered] = useState(false);

  const isVertical = direction === 'up' || direction === 'down';

  const targetVelocity = useMemo(() => {
    const magnitude = Math.abs(speed);
    const forwardDirection = isVertical ? 'up' : 'left';
    const directionMultiplier = direction === forwardDirection ? 1 : -1;
    const speedMultiplier = speed < 0 ? -1 : 1;
    return magnitude * directionMultiplier * speedMultiplier;
  }, [speed, direction, isVertical]);

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const rect = seqRef.current?.getBoundingClientRect();
    const sequenceWidth = rect?.width ?? 0;
    const sequenceHeight = rect?.height ?? 0;
    if (isVertical) {
      const parentHeight = containerRef.current?.parentElement?.clientHeight ?? 0;
      if (containerRef.current && parentHeight > 0) {
        const target = Math.ceil(parentHeight);
        if (containerRef.current.style.height !== `${target}px`) {
          containerRef.current.style.height = `${target}px`;
        }
      }
      if (sequenceHeight > 0) {
        setSeqHeight(Math.ceil(sequenceHeight));
        const viewport = containerRef.current?.clientHeight ?? parentHeight ?? sequenceHeight;
        const copiesNeeded = Math.ceil(viewport / sequenceHeight) + COPY_HEADROOM;
        setCopyCount(Math.max(MIN_COPIES, copiesNeeded));
      }
    } else if (sequenceWidth > 0) {
      setSeqWidth(Math.ceil(sequenceWidth));
      const copiesNeeded = Math.ceil(containerWidth / sequenceWidth) + COPY_HEADROOM;
      setCopyCount(Math.max(MIN_COPIES, copiesNeeded));
    }
  }, [isVertical]);

  useResizeObserver(updateDimensions, [containerRef, seqRef], [logos, gap, logoHeight, isVertical]);
  useImageLoader(seqRef, updateDimensions, [logos, gap, logoHeight, isVertical]);
  useAnimationLoop(
    trackRef,
    targetVelocity,
    seqWidth,
    seqHeight,
    isHovered,
    hoverSpeed,
    isVertical
  );

  const cssVariables = useMemo(
    () =>
      ({
        '--logoloop-gap': `${gap}px`,
        '--logoloop-logoHeight': `${logoHeight}px`,
        ...(fadeOutColor && { '--logoloop-fadeColor': fadeOutColor }),
      }) as CSSProperties,
    [gap, logoHeight, fadeOutColor]
  );

  const rootClassName = useMemo(
    () =>
      [
        'logoloop',
        isVertical ? 'logoloop--vertical' : 'logoloop--horizontal',
        fadeOut && 'logoloop--fade',
        scaleOnHover && 'logoloop--scale-hover',
        className,
      ]
        .filter(Boolean)
        .join(' '),
    [isVertical, fadeOut, scaleOnHover, className]
  );

  /* Mouse enter/leave drive the hover-speed deceleration. Listeners are
     attached imperatively (mirrors `lib/use-tilt-3d.ts`) so the track div
     stays free of interactive JSX handlers and a11y rules don't flag it. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track || hoverSpeed === undefined) {
      return;
    }
    const onEnter = () => setIsHovered(true);
    const onLeave = () => setIsHovered(false);
    track.addEventListener('mouseenter', onEnter);
    track.addEventListener('mouseleave', onLeave);
    return () => {
      track.removeEventListener('mouseenter', onEnter);
      track.removeEventListener('mouseleave', onLeave);
    };
  }, [hoverSpeed]);

  const renderLogoItem = useCallback(
    (item: LogoItem, key: Key) => {
      if (renderItem) {
        return (
          <li className="logoloop__item" key={key}>
            {renderItem(item, key)}
          </li>
        );
      }
      const nodeItem = isNodeItem(item);
      const content = nodeItem ? (
        <span className="logoloop__node" aria-hidden={!!item.href && !item.ariaLabel}>
          {item.node}
        </span>
      ) : (
        <img
          src={item.src}
          srcSet={item.srcSet}
          sizes={item.sizes}
          width={item.width}
          height={item.height}
          alt={item.alt ?? ''}
          title={item.title}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      );
      const itemAriaLabel = nodeItem ? (item.ariaLabel ?? item.title) : (item.alt ?? item.title);
      const wrapped = item.href ? (
        <a
          className="logoloop__link"
          href={item.href}
          aria-label={itemAriaLabel || 'logo link'}
          target="_blank"
          rel="noreferrer noopener"
        >
          {content}
        </a>
      ) : (
        content
      );
      return (
        <li className="logoloop__item" key={key}>
          {wrapped}
        </li>
      );
    },
    [renderItem]
  );

  const logoLists = useMemo(
    () =>
      Array.from({ length: copyCount }, (_, copyIndex) => (
        <ul
          className="logoloop__list"
          key={`copy-${copyIndex}`}
          aria-hidden={copyIndex > 0}
          ref={copyIndex === 0 ? seqRef : undefined}
        >
          {logos.map((item, itemIndex) => renderLogoItem(item, `${copyIndex}-${itemIndex}`))}
        </ul>
      )),
    [copyCount, logos, renderLogoItem]
  );

  const containerStyle = useMemo<CSSProperties>(() => {
    const resolved = toCssLength(width);
    let resolvedWidth: string | undefined;
    if (isVertical) {
      resolvedWidth = resolved === '100%' ? undefined : resolved;
    } else {
      resolvedWidth = resolved ?? '100%';
    }
    return {
      width: resolvedWidth,
      ...cssVariables,
      ...style,
    };
  }, [width, cssVariables, style, isVertical]);

  return (
    <section
      ref={containerRef}
      className={rootClassName}
      style={containerStyle}
      aria-label={ariaLabel}
    >
      <div className="logoloop__track" ref={trackRef}>
        {logoLists}
      </div>
    </section>
  );
});

LogoLoop.displayName = 'LogoLoop';
