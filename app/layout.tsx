import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import ExternalLinkGate from '@/components/ExternalLinkGate';
/** Visit counting: Vercel Web Analytics (Sep 30 2026, replacing Google Analytics for this kids' game): no cookies and no
 *  personal identifiers; aggregate page views only. */
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
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><head><link rel="preload" href="/stories/films/assets/IslandBrush-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous"/></head><body>{children}<ExternalLinkGate/><Analytics/>
  </body></html>; }
