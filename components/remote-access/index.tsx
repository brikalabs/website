'use client';

import { AtSign, Globe, Lock, Server, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AnimatedSection } from '../ui/animated-section';
import { RemoteAccessDiagram } from './diagram';

/*
 * How remote access works in Brika:
 *
 *   1. Your hub claims a short, globally-unique name on the coordinator
 *      (apps/signaling on Cloudflare Workers, D1-backed claims). The claim
 *      is bound to a bearer token the hub keeps locally.
 *   2. You open `hub.brika.dev/<name>` in any browser. A ~15 KB bootstrap
 *      SPA loads, mints a 60-second HMAC ticket, and opens a WebSocket to
 *      the coordinator (signaling channel).
 *   3. The coordinator brokers an SDP + ICE exchange between the browser
 *      and the home hub — both sides know the wire format from
 *      @brika/remote-access-protocol.
 *   4. A WebRTC peer connection is established. A data channel carries an
 *      RPC bridge — Request frames go in, Response chunks come out. The
 *      coordinator is now out of the loop.
 *   5. The bootstrap fetches the hub's `/index.html` + `/assets/*` over the
 *      data channel and hands the page over. A service worker proxies
 *      subsequent `/api/*` requests through the same channel.
 *
 * The diagram below animates this as a two-phase loop:
 *   - Phase 1 (signaling): signaling paths light up, a packet travels
 *     browser → coordinator → hub and back.
 *   - Phase 2 (data channel): signaling dims to a passive state, the data
 *     channel illuminates and packets stream both ways between peers.
 * A step badge at the top declares which phase the viewer is watching.
 */

interface Bullet {
  icon: typeof Lock;
  key: 'p2p' | 'encrypted' | 'nameBased' | 'noPortForward' | 'selfHosted';
  color: string;
}

const BULLETS: Bullet[] = [
  { icon: Zap, key: 'p2p', color: 'oklch(0.72 0.15 145)' },
  { icon: Lock, key: 'encrypted', color: 'oklch(0.7 0.16 265)' },
  { icon: AtSign, key: 'nameBased', color: 'oklch(0.74 0.14 215)' },
  { icon: Globe, key: 'noPortForward', color: 'oklch(0.72 0.18 45)' },
  { icon: Server, key: 'selfHosted', color: 'oklch(0.66 0.18 320)' },
];

export function RemoteAccess() {
  const t = useTranslations('RemoteAccess');

  return (
    <AnimatedSection id="remote-access" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Globe className="size-5 text-primary" />
              <span className="font-semibold text-primary text-sm">{t('eyebrow')}</span>
            </div>
            <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-4xl">{t('heading')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('subheading')}</p>

            <ul className="mt-6 space-y-3">
              {BULLETS.map((b) => (
                <li key={b.key} className="flex items-start gap-3">
                  <span
                    className="corner-squircle mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-md"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${b.color}, transparent 86%)`,
                    }}
                  >
                    <b.icon className="size-3.5" style={{ color: b.color }} />
                  </span>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{t(`bullets.${b.key}.title`)}</div>
                    <div className="text-muted-foreground text-sm leading-relaxed">
                      {t(`bullets.${b.key}.description`)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <RemoteAccessDiagram />
        </div>
      </div>
    </AnimatedSection>
  );
}
