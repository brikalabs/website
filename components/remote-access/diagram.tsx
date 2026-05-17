'use client';

import { useTranslations } from 'next-intl';
import {
  CYCLE,
  DATA_KT,
  DATA_OPACITY,
  SIG_KT,
  SIG_OPACITY,
  STEP1_KT,
  STEP1_OPACITY,
  STEP2_KT,
  STEP2_OPACITY,
} from './animation';
import { BROWSER_COLOR, COORD_COLOR, HUB_COLOR } from './colors';
import { DiagramNode } from './node';
import { Packet } from './packet';
import { StepBadge } from './step-badge';

export function RemoteAccessDiagram() {
  const t = useTranslations('RemoteAccess.diagram');

  const W = 420;
  const H = 360;

  const BX = 60;
  const BY = 200;
  const CX = 210;
  const CY = 115;
  const HX = 360;
  const HY = 200;

  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="corner-squircle relative overflow-hidden rounded-2xl border border-border bg-surface p-4">
        {/* Soft accent glow behind the diagram */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 60%, color-mix(in oklch, var(--primary), transparent 80%) 0%, transparent 70%)',
          }}
        />

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="relative z-10 h-auto w-full"
          role="img"
          aria-label={t('aria')}
        >
          <title>{t('aria')}</title>

          {/* Address pill — the URL you actually type. */}
          <g>
            <rect
              x={CX - 80}
              y={14}
              width="160"
              height="22"
              rx="11"
              fill="var(--surface)"
              stroke={COORD_COLOR}
              strokeOpacity="0.5"
              strokeWidth="1"
            />
            <text
              x={CX}
              y={29}
              textAnchor="middle"
              className="font-mono"
              fontSize="11"
              fontWeight="500"
            >
              <tspan className="fill-muted-foreground">hub.brika.dev/</tspan>
              <tspan className="fill-foreground" fontWeight="700">
                {t('exampleName')}
              </tspan>
            </text>
          </g>

          {/* Step badges — one fades in during phase 1, the other during
              phase 2, so the viewer reads "1. signaling" then "2. data". */}
          <StepBadge
            x={W / 2}
            y={54}
            color={COORD_COLOR}
            label={t('step1')}
            keyTimes={STEP1_KT}
            opacityValues={STEP1_OPACITY}
          />
          <StepBadge
            x={W / 2}
            y={54}
            color={HUB_COLOR}
            label={t('step2')}
            keyTimes={STEP2_KT}
            opacityValues={STEP2_OPACITY}
          />

          {/* Signaling paths: browser → coordinator → hub, two dashed
              segments. They live in an opacity-animated group so the
              entire signaling stage dims during phase 2. */}
          <g>
            <animate
              attributeName="opacity"
              values={SIG_OPACITY}
              keyTimes={SIG_KT}
              dur={CYCLE}
              repeatCount="indefinite"
            />
            <path
              id="ra-sig-1"
              d={`M ${BX} ${BY - 12} Q ${(BX + CX) / 2} ${CY - 5} ${CX - 28} ${CY}`}
              fill="none"
              stroke={COORD_COLOR}
              strokeOpacity="0.8"
              strokeWidth="1.6"
              strokeDasharray="4 4"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-16"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </path>
            <path
              id="ra-sig-2"
              d={`M ${CX + 28} ${CY} Q ${(CX + HX) / 2} ${CY - 5} ${HX} ${HY - 12}`}
              fill="none"
              stroke={COORD_COLOR}
              strokeOpacity="0.8"
              strokeWidth="1.6"
              strokeDasharray="4 4"
            >
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="-16"
                dur="1.4s"
                repeatCount="indefinite"
              />
            </path>
          </g>

          {/* Signaling packets — sequence: B→C (offer), C→H (forward),
              H→C (answer), C→B (forward), all within phase 1 window
              [0.044, 0.278]. */}
          <Packet pathId="ra-sig-1" color={BROWSER_COLOR} start={0.05} end={0.105} />
          <Packet pathId="ra-sig-2" color={BROWSER_COLOR} start={0.11} end={0.165} />
          <Packet pathId="ra-sig-2" color={HUB_COLOR} start={0.185} end={0.24} reverse />
          <Packet pathId="ra-sig-1" color={HUB_COLOR} start={0.245} end={0.3} reverse />

          {/* WebRTC data channel: solid arc from browser to hub, bypassing
              the coordinator. Group is opacity-animated so the channel
              "lights up" during phase 2. */}
          <defs>
            <linearGradient id="ra-channel" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={BROWSER_COLOR} />
              <stop offset="50%" stopColor={COORD_COLOR} />
              <stop offset="100%" stopColor={HUB_COLOR} />
            </linearGradient>
          </defs>

          <g>
            <animate
              attributeName="opacity"
              values={DATA_OPACITY}
              keyTimes={DATA_KT}
              dur={CYCLE}
              repeatCount="indefinite"
            />
            <path
              id="ra-data-channel"
              d={`M ${BX} ${BY + 12} Q ${W / 2} ${H - 40} ${HX} ${HY + 12}`}
              fill="none"
              stroke="url(#ra-channel)"
              strokeOpacity="0.95"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>

          {/* Data-channel packets — nine overlapping trips inside the
              phase-2 window [0.378, 0.889]. Hub-coloured packets flow
              forward (B→H), browser-coloured packets flow reverse (H→B),
              staggered to give a sense of continuous bidirectional
              traffic for the full ~5 second steady-state. */}
          <Packet pathId="ra-data-channel" color={HUB_COLOR} start={0.4} end={0.475} />
          <Packet pathId="ra-data-channel" color={BROWSER_COLOR} start={0.435} end={0.51} reverse />
          <Packet pathId="ra-data-channel" color={HUB_COLOR} start={0.5} end={0.575} />
          <Packet pathId="ra-data-channel" color={BROWSER_COLOR} start={0.535} end={0.61} reverse />
          <Packet pathId="ra-data-channel" color={HUB_COLOR} start={0.6} end={0.675} />
          <Packet pathId="ra-data-channel" color={BROWSER_COLOR} start={0.635} end={0.71} reverse />
          <Packet pathId="ra-data-channel" color={HUB_COLOR} start={0.7} end={0.775} />
          <Packet pathId="ra-data-channel" color={BROWSER_COLOR} start={0.735} end={0.81} reverse />
          <Packet pathId="ra-data-channel" color={HUB_COLOR} start={0.8} end={0.875} />

          {/* Data-channel label */}
          <text
            x={W / 2}
            y={H - 12}
            textAnchor="middle"
            className="fill-foreground font-mono"
            fontSize="10.5"
            fontWeight="600"
          >
            {t('dataChannelLabel')}
          </text>

          {/* Nodes — drawn last so they sit on top of the paths.
              The coordinator pulses during phase 1 to signal it is
              "active", then quiets during phase 2. */}
          <DiagramNode
            x={BX}
            y={BY}
            color={BROWSER_COLOR}
            icon="browser"
            label={t('browser')}
            sublabel={t('browserSub')}
          />
          <DiagramNode
            x={CX}
            y={CY}
            color={COORD_COLOR}
            icon="cloud"
            label={t('coordinator')}
            sublabel={t('coordinatorSub')}
            pulseKeyTimes={STEP1_KT}
            pulseOpacityValues={STEP1_OPACITY}
          />
          <DiagramNode
            x={HX}
            y={HY}
            color={HUB_COLOR}
            icon="hub"
            label={t('hub')}
            sublabel={t('hubSub')}
            pulseKeyTimes={STEP2_KT}
            pulseOpacityValues={STEP2_OPACITY}
          />
        </svg>
      </div>

      <p className="mt-3 text-center text-muted-foreground text-xs leading-relaxed">
        {t('caption')}
      </p>
    </div>
  );
}
