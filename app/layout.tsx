import type { Metadata, Viewport } from 'next';
import './globals.css';
import ExternalLinkGate from '@/components/ExternalLinkGate';
import VisitTracker from '@/components/VisitTracker';
/** Vercel Web Analytics was removed on Oct 7 2026 (a paid duplicate, $3 per 100k events): the first-party counter below and
 *  the /admin dashboard now cover visitors, sources, countries and time on site. */
/** First-party visit counter for /admin (Oct 7 2026; lib/analytics/tracker.ts): no cookies, no stored IP/UA, a per-tab session id
 *  only. Production deployments only: preview deployments, `next dev` and local builds skip it (FI_VISITS_LOCAL=1 opts a local
 *  build in for testing). */
const VISITS = process.env.VERCEL_ENV === 'production' || process.env.FI_VISITS_LOCAL === '1';
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };
const description = 'Explore Futbol Island to learn futsal, 7v7, 9v9, and 11v11 through lessons, quizzes, and stories.';
export const metadata: Metadata = {
  metadataBase: new URL('https://futbolisland.app'),
  title: 'Futbol Island',
  description,
  applicationName: 'Futbol Island',
  alternates: { canonical: '/' },
  openGraph: { title: 'Futbol Island', description, url: '/', siteName: 'Futbol Island', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Futbol Island', description },
};
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><head><link rel="preload" href="/stories/films/assets/IslandBrush-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous"/></head><body>{children}<ExternalLinkGate/>{VISITS && <VisitTracker allowLocalhost={process.env.FI_VISITS_LOCAL === '1'}/>}
  </body></html>; }
