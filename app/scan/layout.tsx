import type {Metadata,Viewport} from 'next';
import HtmlShell from '@/components/site/HtmlShell';
/**
 * Scan Trainer's app shell (/scan, Nov 16 2026; docs/scan-trainer/HANDOFF.md). Its own app, not a tab of /coach: it is used at
 * practice with the phone propped on a cone, full screen, so it gets its own home-screen icon and opens straight to Start.
 * No site header or footer, its own manifest, noindex (the SEO front door is /tools/soccer-scanning-trainer). The language is
 * chosen in the app (?lang=es, the saved choice, or the phone's language) and set on <html lang> by components/scan/ScanApp.tsx.
 */
export const metadata:Metadata={
 title:'Scan Trainer · Futbol Island',description:'A full-screen scanning trainer for soccer practice: colors, numbers, arrows and passes to call out. Works offline; nothing leaves your phone.',
 robots:{index:false,follow:true},manifest:'/scan/manifest.webmanifest',
 appleWebApp:{capable:true,title:'Scan',statusBarStyle:'black-translucent'},
 icons:{icon:'/scan/icon.svg',apple:'/scan/icon-180.png'},
};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#14221d'};
/** Next's file manifest (app/manifest.ts, the game) is linked on every page and wins over `metadata.manifest`; this points the
 *  link at Scan Trainer's own manifest before the page is parsed further (same method as app/coach/layout.tsx). */
const SWAP_MANIFEST="document.querySelectorAll('link[rel=manifest]').forEach(function(l){l.href='/scan/manifest.webmanifest'});";
export default function ScanLayout({children}:{children:React.ReactNode}){
 return <HtmlShell lang="en"><style>{'html,body{background:#fbf7ee;color-scheme:light;margin:0}'}</style><script dangerouslySetInnerHTML={{__html:SWAP_MANIFEST}}/>{children}</HtmlShell>;
}
