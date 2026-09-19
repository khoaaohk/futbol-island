import type { Metadata, Viewport } from 'next';
import './globals.css';
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };
export const metadata: Metadata = { title: 'Futbol Island', description: 'A coastal football island. Explore the promenade, find your court, and play until the lights go out.' };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en"><head><link rel="preload" href="/stories/films/assets/Knewave-Regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous"/></head><body>{children}</body></html>; }
