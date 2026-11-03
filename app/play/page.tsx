import type {Metadata} from 'next';
import Landing from '@/components/landing/Landing';
import IslandLoadingStatic from '@/components/IslandLoadingStatic';
import RootSwitch from '@/components/root/RootSwitch';
import {ROOT_VIEW_BOOT} from '@/lib/rootView';
import JsonLd from '@/components/seo/JsonLd';
import {siteLd} from '@/lib/site/seo';

/**
 * https://futbolisland.app/play (moved from `/` on Nov 3 2026, owner: the feature tour is the home page now, app/(site)/page.tsx):
 * the title screen (components/landing: what the game is, and a save code, required to play), then the game in place at the same
 * URL. A tab that has already entered the game this session, or a link the game made (?panel=), goes straight to the game
 * (lib/rootView.ts). /start was removed. Old game links to `/?from=…`, `/?panel=…`, `/?party=…` … redirect here (next.config.mjs).
 * Static (prerendered, CDN-cached): it reads no request data. The pre-paint script picks the screen before first paint; the game's
 * code is its own chunk (components/root/gameLoader.ts). Returning from the Arcade, Konbini, Museum or Shop (/play?from=…) is
 * rewritten in next.config.mjs to app/island-return, which renders <Town returningFromArcade/>. ?store= is read by Town.
 */
export const dynamic='force-static';

// Indexable (owner, Nov 3 2026) with its own title and description; the home page `/` is the main entry.
const title='Play Futbol Island: the free football game for kids';
const description='Start your island or continue with your save code. Explore, learn 7v7, 9v9, 11v11 and futsal in short lessons, and play with friends. Free, no ads.';
export const metadata:Metadata={
 title,description,
 alternates:{canonical:'/play'},
 openGraph:{title,description,url:'/play',siteName:'Futbol Island',type:'website',images:[{url:'/opengraph-image.png',width:1200,height:630,alt:'Futbol Island'}]},
 twitter:{card:'summary_large_image',title,description,images:['/opengraph-image.png']},
};

import {preloadIslandBrush} from '@/lib/islandBrushPreload';
export default function Page(){
 preloadIslandBrush();
 return <>
  <script dangerouslySetInnerHTML={{__html:ROOT_VIEW_BOOT}}/>
  <RootSwitch landing={<Landing/>} loader={<IslandLoadingStatic/>}/>
  <JsonLd data={siteLd()}/>
 </>;
}
