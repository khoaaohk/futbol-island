import {notFound} from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import Breadcrumbs from '@/components/site/Breadcrumbs';
import RelatedLinks from '@/components/site/RelatedLinks';
import {fishArtPath,fishById,fishCredit,FISH_ART_SIZE,fishPath,fishPlaces,fishWhen,rarityWord,SITE_FISH} from '@/lib/site/fish';
import {fishCatchTips,fishNote,withRelatedFish} from '@/lib/site/fishNotes';
import {sourceLabel} from '@/lib/site/cardNotes';
import {fishRelated} from '@/lib/site/related';
import {abs,PUBLISHER,breadcrumbLd,creativeWorkLd,firstSentence,ogPath,pageMeta} from '@/lib/site/seo';
import {SITE_PUBLISHED,SITE_UPDATED} from '@/lib/site/updated';
import {checkedOn} from '@/lib/site/checked';
import {CheckedLine,KeyFacts,PlayEnd,type Fact} from '@/lib/site/GuideParts';
import {IconSteps} from '@/components/site/PageParts';
import type {FactIconKind} from '@/components/site/FactIcons';
import {FISH_SPOTS,SHADOW_LABEL,type FishSpecies} from '@/lib/town/fishing/fishCatalog';
import pp from '@/components/site/PageParts.module.css';
import {playFishHref,shoreSpot} from '@/lib/site/playLinks';
import styles from '../../site.module.css';

/** One Fishbook species. Art: the game's own drawing (components/FishArt.tsx), since Nov 10 2026 as a real picture built at build
 *  time (art.png/route.tsx: one indexable <img> with alt text and fixed width/height, no script), plus the page's share picture
 *  (og.png/route.tsx) and data-driven links (lib/site/related.ts).
 *  Nov 14 2026 (SEO, lib/site/fishNotes.ts): "In the wild" (where it lives + a checked fun fish fact, plain-text credit), "How to
 *  catch it in Futbol Island" (from the game data) and "Related fish"; the JSON-LD names the animal's Wikipedia page.
 *  Visual pass b5 (Nov 17 2026): a key-facts strip under the art (rarity, size, where, shadow, time, price: game data only), the
 *  text cards in two columns on a wide screen with their own tones, and "How to catch it" as numbered steps with icons. */
export const dynamic='force-static';
export const dynamicParams=false;
export const generateStaticParams=()=>SITE_FISH.map(f=>({id:f.id}));
export function generateMetadata({params}:{params:{id:string}}){
 const f=fishById(params.id);if(!f)return {};
 return pageMeta(`${f.name} (Fishbook)`,firstSentence(f.club.fact),fishPath(f.id),
  {image:{url:ogPath(fishPath(f.id)),alt:`Drawing of a ${f.name.toLowerCase()}, the Fishbook animal for ${f.club.name}`}});
}
/** The key facts, all from the game's own data (lib/town/fishing). */
function fishFacts(f:FishSpecies):Fact[]{
 const spots=FISH_SPOTS.filter(s=>f.spots.includes(s.id)),boats=spots.every(s=>s.deep);
 const where=spots.length===1?spots[0].name:boats?'Deep-sea boats':`${spots.length} fishing spots`;
 return [
  {icon:'star',label:'Rarity',value:rarityWord(f)},
  {icon:'ruler',label:'Size on the island',value:`${f.size[0]}–${f.size[1]} cm`},
  {icon:'pin',label:'Where to catch it',value:spots.length?where:'A rare visitor',href:'#catch'},
  {icon:'eye',label:'Watch the water for',value:SHADOW_LABEL[f.shadow]},
  ...(f.when?[{icon:'moon' as const,label:'When',value:f.when==='night'?'At night':'At sunset'}]:[]),
  {icon:'coin',label:'Market stand pays',value:`Up to ${f.price} coins`},
 ];
}
/** Each catch tip's icon, read from the tip itself (lib/site/fishNotes.ts fishCatchTips). */
const tipIcon=(t:string):FactIconKind=>/deep-sea/.test(t)?'boat':/watch the water/.test(t)?'eye':/\blure\b/.test(t)?'bobber':/at night|at sunset|after dark/i.test(t)?'moon':/market stand/.test(t)?'coin':'pin';
export default function FishPage({params}:{params:{id:string}}){
 const f=fishById(params.id);if(!f)notFound();
 const crumbs=[{name:'Home',path:'/'},{name:'Fish',path:'/fish'},{name:f.name,path:fishPath(f.id)}];
 const spot=shoreSpot(f.spots),places=fishPlaces(f),when=fishWhen(f),note=fishNote(f),tips=fishCatchTips(f);
 const wiki=note?.src.find(u=>/^https:\/\/en\.wikipedia\.org\/wiki\//.test(u));
 return <>
  <JsonLd data={{...creativeWorkLd({name:`${f.name} and ${f.club.name}`,path:fishPath(f.id),description:f.club.fact,image:ogPath(fishPath(f.id)),
   about:[{'@type':'Thing',name:f.name,...(wiki?{sameAs:wiki}:{})},{'@type':'SportsOrganization',name:f.club.name,sport:'Football',location:f.club.country}]}),
   ...(note?{'@type':'Article',headline:`${f.name}: where it lives, a fun fact and how to catch it`,author:PUBLISHER,
    datePublished:SITE_PUBLISHED,dateModified:SITE_UPDATED.fish,learningResourceType:'Fact sheet',mainEntityOfPage:abs(fishPath(f.id)),citation:[...note.src,f.club.source]}:{})}}/>
  <JsonLd data={breadcrumbLd(crumbs)}/>
  <header className={styles.intro}>
   <Breadcrumbs crumbs={crumbs}/>
   <h1 className={styles.title}>{f.name}</h1>
  </header>
  <div className={styles.art}><img src={fishArtPath(f.id)} width={FISH_ART_SIZE.width} height={FISH_ART_SIZE.height} decoding="async"
   alt={`Drawing of a ${f.name.toLowerCase()}, the Fishbook animal for ${f.club.name} (${f.club.country})`}/></div>
  <KeyFacts facts={fishFacts(f)}/>
  <div className={pp.fishGrid} data-fish-grid="">
  <section className={`${styles.card} ${pp.fishClub}`} aria-labelledby="fact">
   <span className={styles.label} id="fact">{f.club.link==='Fun fish fact'?'Fun fish fact + real football fact':`Real football fact · ${f.club.link}`}</span>
   <h2 className={styles.h2}>{f.club.name}{f.club.nickname?` · “${f.club.nickname}”`:''} <span className={styles.count}>({f.club.country})</span></h2>
   <p>{f.club.fact}</p>
   <p className={styles.caption}>Source: {fishCredit(f)}</p>
  </section>
  {f.story&&<section className={styles.card} aria-labelledby="tale" data-fish-story>
   <span className={styles.label} id="tale">Fish tale</span>
   <p>{f.story}</p>
  </section>}
  {note&&<section className={`${styles.card} ${pp.fishWild}`} aria-labelledby="wild" data-fish-notes>
   <span className={styles.label}>Fun fish fact</span>
   <h2 className={styles.h2} id="wild">The {f.name.toLowerCase()} in the wild</h2>
   <p><b>Where it lives:</b> {note.lives}</p>
   <p>{note.fact}</p>
   <p className={styles.caption}>Checked against: {[...new Set(note.src.map(sourceLabel))].join(', ')}.</p>
   <CheckedLine date={checkedOn('fish',note.checked)}/>
  </section>}
  <section className={`${styles.card} ${(f.story?1:0)+(note?1:0)===1?pp.fishWide:''}`} aria-labelledby="story">
   <span className={styles.label} id="story">Island story</span>
   {places.length>0?<><p>On Futbol Island the {f.name.toLowerCase()} can be caught at:</p><ul>{places.map(p=><li key={p.name}><b>{p.name}</b>: {p.story}</li>)}</ul></>:<p>A rare visitor to the island’s waters.</p>}
   {when&&<p>{when}.</p>}
   <p className={styles.caption}>Size on the island: {f.size[0]}–{f.size[1]} cm.</p>
  </section>
  </div>
  <section className={styles.section} aria-labelledby="catch">
   <h2 className={styles.h2} id="catch">How to catch it in Futbol Island</h2>
   <IconSteps items={tips.map(t=>({icon:tipIcon(t),text:t}))}/>
  </section>
  <RelatedLinks related={withRelatedFish(f,fishRelated(f))} heading="More from the Fishbook" readHeading="Keep reading"/>
  {spot?<PlayEnd href={playFishHref(spot.id)} label={`Catch it at ${spot.name}`} bar={`Catch the ${f.name.toLowerCase()} at ${spot.name}`}/>:<PlayEnd href={playFishHref()} label="Go fishing on the island" bar="Go fishing on the island"/>}
 </>;
}
