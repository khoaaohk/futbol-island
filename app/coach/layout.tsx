import type {Metadata,Viewport} from 'next';
import HtmlShell from '@/components/site/HtmlShell';
/**
 * The coach app shell (/coach, Nov 16 2026; docs/coach-app/HANDOFF.md): no site header or footer, its own manifest, noindex
 * (the SEO front doors are the /tools pages; the app is a tool, not a page to rank). The language is chosen in the app
 * (?lang=es, the saved choice, or the phone's language) and set on <html lang> by components/coach/CoachApp.tsx.
 */
export const metadata:Metadata={
 title:'Coach app · Futbol Island',description:'Lineups, fair playing time and a live substitution clock for youth soccer. Your team stays on your phone.',
 robots:{index:false,follow:true},manifest:'/coach/manifest.webmanifest',
 appleWebApp:{capable:true,title:'Coach',statusBarStyle:'default'},
 icons:{icon:'/coach/icon.svg',apple:'/coach/icon-180.png'},
};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#1d6b55'};
export default function CoachLayout({children}:{children:React.ReactNode}){
 return <HtmlShell lang="en"><style>{'html,body{background:#fbf7ee;color-scheme:light;margin:0}'}</style>{children}</HtmlShell>;
}
