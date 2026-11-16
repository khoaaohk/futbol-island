import ExternalLinkGate from '@/components/ExternalLinkGate';
import RotateLock from '@/components/RotateLock';
import VisitTracker from '@/components/VisitTracker';
import ErrorBeacon from '@/components/ErrorBeacon';
import NetSaveNotice from '@/components/NetSaveNotice';
import WelcomeTally from '@/components/WelcomeTally';
import {STORAGE_FALLBACK_BOOT} from '@/lib/storageFallback';
/**
 * The document shell (<html>/<body>) of every page (Nov 15 2026, Spanish round 1, docs/i18n/HANDOFF.md). It used to be the root
 * layout's; it moved here so the language can differ: app/layout.tsx is now a pass-through (metadata, viewport, global CSS) and
 * each top-level section's layout renders <HtmlShell lang="en"> (English) or app/es/layout.tsx renders <HtmlShell lang="es">.
 * Next's multiple-root-layouts pattern would have moved every route folder; this keeps every English path and file where it was.
 * The only way the language could be set statically: a root layout cannot see the URL without making every page dynamic.
 *
 * Vercel Web Analytics was removed on Oct 7 2026 (a paid duplicate, $3 per 100k events): the first-party counter below and
 * the /admin dashboard now cover visitors, sources, countries and time on site.
 * First-party visit counter for /admin (Oct 7 2026; lib/analytics/tracker.ts): no cookies, no stored IP/UA, a per-tab session id
 * only. Production deployments only: preview deployments, `next dev` and local builds skip it (FI_VISITS_LOCAL=1 opts a local
 * build in for testing). Spanish pages (/es/…) are counted the same way, by their path.
 * suppressHydrationWarning on <html> only: two pre-paint boot scripts set <html data-island-handoff> (the title
 * screen → game hand-off) and <html data-root-view> (`/`: title screen or game, lib/rootView.ts) before React hydrates, which is
 * intended and would otherwise log "Extra attributes from the server".
 */
// Spacing kept from the old root layout (tests/admin-analytics.cjs, qa-robust-nov14.cjs read these lines).
const VISITS = process.env.VERCEL_ENV === 'production' || process.env.FI_VISITS_LOCAL === '1';
export default function HtmlShell({ lang = 'en', children }: { lang?: 'en' | 'es'; children: React.ReactNode }) { return <html lang={lang} suppressHydrationWarning><head/><body><script dangerouslySetInnerHTML={{ __html: STORAGE_FALLBACK_BOOT }}/>{children}<NetSaveNotice/><WelcomeTally/><RotateLock/><ExternalLinkGate/>{VISITS && <VisitTracker allowLocalhost={process.env.FI_VISITS_LOCAL === '1'}/>}{VISITS && <ErrorBeacon/>}
  </body></html>; }
