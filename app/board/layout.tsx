import type {Metadata,Viewport} from 'next';
import HtmlShell from '@/components/site/HtmlShell';
/**
 * The tactics board on the web (/board, Nov 22 2026; owner: "the Coaches Board must be part of the coach tools"). The same board the
 * game opens in the Coaches Centre (components/coaches-board/TacticsBoard.tsx, unchanged), full screen with no site header or
 * footer. noindex: the SEO front door is /tools/soccer-tactics-board. Saved plays stay on the device (lib/coaches/board/storage.ts);
 * a share link opens here (#play=…, lib/coaches/board/share.ts).
 */
export const metadata:Metadata={
 title:'Tactics Board · Futbol Island',description:'A free soccer tactics board: drag players, draw passes and runs, play a move step by step and share it with a link.',
 robots:{index:false,follow:true},
 appleWebApp:{capable:true,title:'Board',statusBarStyle:'black-translucent'},
 icons:{icon:'/coach/icon.svg',apple:'/coach/icon-180.png'},
};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#2d6f39'};
export default function BoardLayout({children}:{children:React.ReactNode}){
 return <HtmlShell lang="en"><style>{'html,body{background:#2d6f39;color-scheme:light;margin:0;overflow:hidden}'}</style>{children}</HtmlShell>;
}
