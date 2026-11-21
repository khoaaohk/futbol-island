import type {Metadata} from 'next';
import Landing from '@/components/landing/Landing';
import IslandLoadingStatic from '@/components/IslandLoadingStatic';
import RootSwitch from '@/components/root/RootSwitch';
import {ROOT_VIEW_BOOT} from '@/lib/rootView';
import JsonLd from '@/components/seo/JsonLd';
import {PLAY_OG,playLd} from '@/lib/site/seo';
import {publicWorldEnabled} from '@/lib/multiplayer/publicFlag';

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
// Nov 8 2026 (SEO): "learning game" in the title; the formats, safe emotes and no ads in the description (<= 155).
// Nov 20 2026 (new layout SEO, owner: "Also play"): the words of people ready to play now ("free 3D soccer game", "in your browser", "no
// download") lead; "Free Football Learning Game" was also the /marketing title. docs/seo/NEW-LAYOUT-SEO-PLAN-2026-11-20.md
const title='Play Futbol Island: Free 3D Soccer Game in Your Browser';
const DESCRIPTION_TODAY='Play a free 3D soccer game for kids in your browser, no download. Start your island or use your save code, then learn 7v7, 9v9, 11v11 and futsal.';
// [PUBLIC-WORLD] Nov 11 2026: once other players can be seen (lib/multiplayer/publicFlag.ts; off = today's description, <= 155 characters).
const DESCRIPTION_PUBLIC='Play a free 3D soccer game for kids in your browser, no download. Start an island or use a save code, learn 7v7, 9v9 and 11v11, and meet other players.';
const description=publicWorldEnabled()?DESCRIPTION_PUBLIC:DESCRIPTION_TODAY;
export const metadata:Metadata={
 title,description,
 alternates:{canonical:'/play'},
 openGraph:{title,description,url:'/play',siteName:'Futbol Island',type:'website',images:[{url:PLAY_OG.url,width:1200,height:630,alt:PLAY_OG.alt}]},
 twitter:{card:'summary_large_image',title,description,images:[PLAY_OG.url]},
};

import {preloadIslandBrush} from '@/lib/islandBrushPreload';
export default function Page(){
 preloadIslandBrush();
 return <>
  <script dangerouslySetInnerHTML={{__html:ROOT_VIEW_BOOT}}/>
  <RootSwitch landing={<Landing/>} loader={<IslandLoadingStatic/>}/>
  <JsonLd data={playLd()}/>
 </>;
}
