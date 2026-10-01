import type {ReactElement} from 'react';
import type {Good} from '@/lib/town/market/goods';
import {pocketCategory} from '@/lib/town/market/pocket';

/**
 * Flat island-style produce drawings, one per good (same hand as FishArt and PocketArt's FruitArt: flat fills, one soft
 * highlight, #244d40 ink stems; one inline SVG, nothing to load). Community Garden + Coral Cay Harvest day produce.
 * A good without its own drawing gets a generic fruit or veggie in its registry colour, so new goods always have an icon.
 */
const INK='#244d40',LEAF='#6f9c55',LEAF_HI='#a9cf86',HI='#fff4dc';
type Draw=(c:string)=>ReactElement;
const leaf=(d='M25 11c3-6 11-7 14-4-3 5-9 6-14 4z')=><path d={d} fill={LEAF}/>;
const ART:Record<string,Draw>={
 orange:c=><><circle cx="24" cy="27" r="16" fill={c}/><path d="M13 31c3 6 10 9 17 7" stroke="#c9661a" strokeWidth="4" fill="none" strokeLinecap="round" opacity=".55"/><path d="M15 21c2-4 6-6 10-6" stroke="#ffd29a" strokeWidth="3.2" fill="none" strokeLinecap="round"/><path d="M24 11c1-4 3-6 5-7" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round"/>{leaf()}</>,
 cherry:c=><><path d="M16 30C19 18 24 10 32 6M33 32c-2-10-1-19-1-26" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round"/><path d="M32 6c5-3 10-1 11 3-5 2-9 1-11-3z" fill={LEAF}/><circle cx="15" cy="34" r="9" fill={c}/><circle cx="33" cy="36" r="9" fill={c}/><path d="M10 31c1-2 3-3 5-3M28 33c1-2 3-3 5-3" stroke="#f08a8f" strokeWidth="2.4" fill="none" strokeLinecap="round"/></>,
 strawberry:c=><><path d="M9 17c6-4 24-4 30 0 1 12-7 24-15 27C16 41 8 29 9 17z" fill={c}/>{[[16,23],[24,21],[32,23],[20,30],[28,30],[24,37]].map(([x,y])=><path key={x*100+y} d={`M${x} ${y}l1 2`} stroke="#ffe0a6" strokeWidth="1.8" strokeLinecap="round"/>)}<path d="M11 16l6-6 3 5 4-7 4 7 3-5 6 6c-7 3-19 3-26 0z" fill={LEAF}/></>,
 tomato:c=><><ellipse cx="24" cy="29" rx="18" ry="15" fill={c}/><path d="M12 33c4 6 13 8 20 5" stroke="#a8321d" strokeWidth="3.4" fill="none" strokeLinecap="round" opacity=".45"/><path d="M13 24c2-4 6-6 10-6" stroke="#ffb49a" strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M24 15l-7-4 5 5-8 2 9 1-3 6 5-5 4 5-1-6 8 1-7-3 5-5z" fill={LEAF}/></>,
 carrot:c=><><path d="M31 15c5 4 5 9 1 13L10 44c-2 1-3 0-2-2l16-23c3-4 5-5 7-4z" fill={c}/><path d="M18 30l4 2M14 36l3 2M24 24l3 2" stroke="#c9661a" strokeWidth="1.8" strokeLinecap="round"/><path d="M31 16c1-6 4-10 8-12-1 4-2 7-4 10 4-2 8-2 10 0-4 3-8 4-12 4" fill={LEAF}/><path d="M33 15c3-3 6-5 9-6" stroke={LEAF_HI} strokeWidth="1.6" fill="none" strokeLinecap="round"/></>,
 banana:c=><><path d="M7 12c-2 18 12 32 32 30 5-1 5-6 0-6-15 0-24-10-25-24-1-4-7-4-7 0z" fill={c}/><path d="M11 18c1 10 8 18 20 20" stroke="#c9a22a" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity=".6"/><path d="M9 20c2 7 5 12 10 15" stroke={HI} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".8"/><path d="M10 13c-1-4 0-7 2-9" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round"/><circle cx="39" cy="39" r="1.8" fill={INK}/></>,
 mango:c=><><path d="M8 29c-1-11 8-19 18-19 11 0 16 9 15 18-1 11-11 16-20 15-7-1-12-6-13-14z" fill={c}/><path d="M12 22c3-6 9-9 15-9" stroke="#e0603a" strokeWidth="6" fill="none" strokeLinecap="round" opacity=".55"/><path d="M22 42c9 0 16-5 18-13" stroke="#6fae4f" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".6"/><path d="M13 27c1-3 3-5 5-6" stroke="#ffe3b0" strokeWidth="2.6" fill="none" strokeLinecap="round"/><path d="M27 11c0-3 1-5 3-6" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round"/><path d="M29 8c4-4 10-3 12 0-4 3-8 3-12 0z" fill={LEAF}/></>,
 pepper:c=><><path d="M12 19c4-4 20-4 24 0 4 5 2 20-5 24-3 2-5 0-7-1-2 1-4 3-7 1-7-4-9-19-5-24z" fill={c}/><path d="M24 20v20" stroke="#a8321d" strokeWidth="2.2" opacity=".4"/><path d="M15 24c0-2 1-4 3-4" stroke="#ffb49a" strokeWidth="2.6" fill="none" strokeLinecap="round"/><path d="M20 18c1-3 3-4 4-4s3 1 4 4" fill={LEAF}/><path d="M24 14c0-4 2-7 6-8" stroke={LEAF} strokeWidth="3.2" fill="none" strokeLinecap="round"/></>,
 greens:c=><><path d="M24 44C10 40 5 26 10 12c8 4 13 14 14 32z" fill={c}/><path d="M24 44c14-4 19-18 14-32-8 4-13 14-14 32z" fill={c}/><path d="M24 44c-6-10-6-24 0-36 6 12 6 26 0 36z" fill="#86c065"/><path d="M24 42V12M13 18c4 6 7 14 9 22M35 18c-4 6-7 14-9 22" stroke={LEAF_HI} strokeWidth="1.6" fill="none" strokeLinecap="round"/></>,
 'sweet-potato':c=><><path d="M6 28c4-10 18-15 30-12 7 2 9 7 5 12-6 7-20 12-29 9-5-2-7-5-6-9z" fill={c}/><path d="M12 33c9 3 20 0 27-6" stroke="#8a5434" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".5"/><path d="M14 22c5-3 11-4 16-3" stroke="#e0a67c" strokeWidth="2.6" fill="none" strokeLinecap="round"/><path d="M41 22l5-3M5 31l-2 2" stroke={INK} strokeWidth="1.8" strokeLinecap="round"/><path d="M20 27l2 1M28 25l2 1" stroke="#8a5434" strokeWidth="1.6" strokeLinecap="round"/></>,
 pineapple:c=><><ellipse cx="24" cy="31" rx="12" ry="14" fill={c}/><path d="M14 24l20 16M13 32l14 11M18 19l18 14M34 24L14 40M35 32L21 43M30 19L12 33" stroke="#b07a1e" strokeWidth="1.4" opacity=".55"/><path d="M24 18c-2-6-6-10-10-12 4 0 7 2 9 5 0-4 1-8 1-10 1 3 2 7 1 10 2-3 5-5 9-5-4 2-8 6-10 12z" fill={LEAF}/></>,
 coconut:c=><><circle cx="24" cy="27" r="16" fill={c}/><path d="M12 33c4 6 11 8 18 6" stroke="#4d2f1c" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".5"/><circle cx="19" cy="21" r="2" fill={INK}/><circle cx="27" cy="21" r="2" fill={INK}/><circle cx="23" cy="27" r="2" fill={INK}/><path d="M13 16l3 2M33 14l-2 3M36 26l-3 1" stroke="#c89e72" strokeWidth="1.6" strokeLinecap="round"/></>,
 watermelon:c=><><path d="M4 18h40c0 13-9 23-20 23S4 31 4 18z" fill="#4f9a55"/><path d="M8 18h32c0 10-7 18-16 18S8 28 8 18z" fill={c}/>{[[16,23],[24,26],[32,23],[20,30],[28,30]].map(([x,y])=><ellipse key={x*100+y} cx={x} cy={y} rx="1.1" ry="1.8" fill={INK}/>)}<path d="M4 18h40" stroke="#cfe8b2" strokeWidth="2"/></>,
};
ART.melon=ART.watermelon;
const genericFruit:Draw=c=><><circle cx="24" cy="27" r="16" fill={c}/><path d="M15 21c2-4 6-6 10-6" stroke={HI} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7"/><path d="M24 11c1-4 3-6 5-7" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round"/>{leaf()}</>;
const genericVeg:Draw=c=><><path d="M14 22c2-4 18-4 20 0 2 8-3 20-10 22-7-2-12-14-10-22z" fill={c}/><path d="M18 26c0-2 1-3 3-3" stroke={HI} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity=".7"/><path d="M24 20c-4-6-9-9-13-9 3 4 7 7 13 9zm0 0c4-6 9-9 13-9-3 4-7 7-13 9zm0 0c0-7 1-12 0-16-3 5-2 11 0 16z" fill={LEAF}/></>;

/** True when a good has its own drawing (tests/island-pocket.cjs warns about produce that only has the generic one). */
export const hasOwnProduceArt=(id:string)=>Object.prototype.hasOwnProperty.call(ART,id);

export default function ProduceArt({good,size=48}:{good:Good;size?:number}){
 const draw=ART[good.id]??(pocketCategory(good)==='fruit'?genericFruit:genericVeg);
 return <svg viewBox="0 0 48 48" width={size} height={size} role="img" aria-label={good.name}>{draw(good.color)}</svg>;
}
