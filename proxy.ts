import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/** Cloudflare `request.cf` geo properties (subset used here). */
interface IncomingRequestCfProperties {
  latitude?: string;
  longitude?: string;
  city?: string;
}

/**
 * Chain next-intl's locale routing with Cloudflare geo-header forwarding.
 * Geo data isn't available as standard HTTP headers, so we copy it from
 * `request.cf` into `x-geo-*` headers for server components to read.
 */
export function proxy(request: NextRequest) {
  const response = intlMiddleware(request);

  const cf = (request as NextRequest & { cf?: IncomingRequestCfProperties }).cf;
  if (cf) {
    if (cf.latitude) {
      response.headers.set('x-geo-latitude', cf.latitude);
    }
    if (cf.longitude) {
      response.headers.set('x-geo-longitude', cf.longitude);
    }
    if (cf.city) {
      response.headers.set('x-geo-city', encodeURIComponent(cf.city));
    }
  }

  return response;
}

export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
