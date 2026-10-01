import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import ExternalLinkGate from '@/components/ExternalLinkGate';
/** Visit counting: Vercel Web Analytics (Sep 30 2026, replacing Google Analytics for this kids' game): no cookies and no
 *  personal identifiers; aggregate page views only. */
/** Production only (Sep 30 2026): in `next dev` the component loads a third-party debug script (va.vercel-scripts.com) that sends
 *  nothing, so dev and the device suite skip it. That script was the WebKit-only "Failed to load resource: … 403 ()" in the
 *  overnight e2e run (an HTTP/2 host: the empty reason phrase; the dev server's own 403s read "(Forbidden)"). */
const ANALYTICS = process.env.NODE_ENV === 'production';
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
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><head><link rel="preload" href="/stories/films/assets/IslandBrush-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous"/></head><body>{children}<ExternalLinkGate/>{ANALYTICS && <Analytics/>}
  </body></html>; }
