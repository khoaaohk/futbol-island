import type { Metadata, Viewport } from 'next';
import './globals.css';
import '@/components/arcade/arcadeChrome.css';
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };
const description = 'Explore Futbol Island to learn futsal, 7v7, 9v9, and 11v11 through lessons, quizzes, and stories.';
export const metadata: Metadata = {
  metadataBase: new URL('https://futbolisland.app'),
  referrer: 'strict-origin', // a ?party= code never leaves in a Referer header to another site
  title: 'Futbol Island',
  description,
  applicationName: 'Futbol Island',
  // No root canonical / og:url (SEO audit, Nov 8 2026): a canonical "/" here was inherited by every page without its own
  // (/arcade, /shop, /museum …) and pointed them at the home page. Each indexable page sets its own (lib/site/seo.ts pageMeta).
  openGraph: { title: 'Futbol Island', description, siteName: 'Futbol Island', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Futbol Island', description },
};
// The IslandBrush font preload lives on the routes that use it at once (lib/islandBrushPreload.ts), not here: the museum warned.
// Nov 15 2026 (Spanish round 1): a pass-through. <html lang> and <body> live in components/site/HtmlShell.tsx, rendered by each
// top-level section's layout (lang "en") and app/es/layout.tsx (lang "es"), so Spanish pages get <html lang="es"> statically.
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }
