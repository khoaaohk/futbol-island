import type { Metadata, Viewport } from 'next';
import './globals.css';
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };
const description = 'Every play takes you somewhere new. There are lots of Easter eggs.';
export const metadata: Metadata = { title: 'Futbol Island', description, openGraph: { title: 'Futbol Island', description }, twitter: { card: 'summary', title: 'Futbol Island', description } };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><head><link rel="preload" href="/stories/films/assets/Knewave-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous"/></head><body>{children}</body></html>; }
