import type {Metadata} from 'next';
import Landing from '@/components/landing/Landing';
import IslandLoadingStatic from '@/components/IslandLoadingStatic';
import RootSwitch from '@/components/root/RootSwitch';
import {ROOT_VIEW_BOOT} from '@/lib/rootView';

/**
 * https://futbolisland.app/ (Oct 9 2026): the title screen (components/landing: what the game is, and a save code, required to
 * play), then the game in place at the same URL. A tab that has already entered the game this session, or a link the game made
 * (?panel=), goes straight to the game (lib/rootView.ts). /start was removed.
 * Static (prerendered, CDN-cached): it reads no request data. The pre-paint script picks the screen before first paint; the game's
 * code is its own chunk (components/root/gameLoader.ts). Returning from the Arcade, Konbini or Museum (/?from=arcade|konbini|museum)
 * is rewritten in next.config.mjs to app/island-return, which renders <Town returningFromArcade/>. ?store= is read by Town.
 */
export const dynamic='force-static';

const title='Futbol Island: explore an island, learn football';
const description='A free football game for kids. Explore the island, learn 7v7, 9v9, 11v11 and futsal through short lessons and quizzes, collect player cards, visit the World Cup ball museum and play arcade games. No sign-up, no ads.';
export const metadata:Metadata={
 title,description,
 alternates:{canonical:'/'},
 openGraph:{title,description,url:'/',siteName:'Futbol Island',type:'website',images:[{url:'/opengraph-image.png',width:1200,height:630,alt:'Futbol Island'}]},
 twitter:{card:'summary_large_image',title,description,images:['/opengraph-image.png']},
};

export default function Page(){
 return <>
  <script dangerouslySetInnerHTML={{__html:ROOT_VIEW_BOOT}}/>
  <RootSwitch landing={<Landing/>} loader={<IslandLoadingStatic/>}/>
 </>;
}
