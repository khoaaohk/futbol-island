import MiniCard from '@/components/MiniCard';
import {miniFoil} from '@/lib/town/cardFoil';
import {cardByNumber,cardPath,eraWord,type SiteCard} from '@/lib/site/cards';
import LazyCardList from './LazyCardList';
import s from './GameCard.module.css';
/**
 * The game's own card on the website (Nov 20 2026; owner: "the players card still doesn't have the actual card from the game").
 * A thin wrapper around components/MiniCard, the card the game draws in the binder (rarity badge, No., riso portrait over the
 * country backdrop, name plate, flag trim, and the binder's holo foil for Elite and Icon cards): the drawing code is not forked.
 * MiniCard is static by design (no parallax, no animation loop, phone heat); it is hook-free, so it server-renders and hydration
 * does no work. The only motion is a CSS tilt while a mouse hovers (pointer:fine), never at rest, never with reduced motion.
 * The card is one picture (role="img", a true aria-label); its facts stay on the page as text ("On the card").
 */
export const cardLabel=(c:SiteCard)=>`Futbol Island card No. ${String(c.number).padStart(3,'0')}: ${c.displayName}, ${c.era==='allTime'?'Legend':c.coach?'Coach':'Star'}, ${c.roleLabel}${c.country?`, ${c.country}`:''}`;

/** The big card in a card page's head (beside the H1 on wide screens, under the summary on phones). */
export function GameCard({c}:{c:SiteCard}){
 return <div className={s.hero} role="img" aria-label={cardLabel(c)} data-game-card={c.number}>
  <MiniCard name={c.name} number={c.number} era={c.era} got foil={miniFoil(c.name)} className={s.face}/>
 </div>;
}

export type CardLink={path:string;name:string;meta?:string};
/** Small real cards for lists (the cards hub, the group pages, "More cards like this"). Each card is a link; the name and line are
 *  text under it. The first `eager` cards load their portraits at once; the rest when their row scrolls near (LazyCardList). */
export function CardThumbGrid({links,eager=8}:{links:readonly CardLink[];eager?:number}){
 return <LazyCardList className={s.grid}>{links.map((l,i)=>{
  const c=cardByNumber(Number(l.path.split('/').pop()));
  return <li key={l.path} data-near={i<eager?'':undefined}><a href={l.path} className={s.thumb}>
   {c?<MiniCard name={c.name} number={c.number} era={c.era} got foil={miniFoil(c.name)} className={s.thumbCard}/>:null}
   <span className={s.thumbName}>{l.name}</span>{l.meta&&<span className={s.thumbMeta}>{l.meta}</span>}
  </a></li>;})}</LazyCardList>;
}
/** A hub row for a card: its link, name and the country · era line. */
export const cardLink=(c:SiteCard):CardLink=>({path:cardPath(c.number),name:c.displayName,meta:[c.country,eraWord(c)].filter(Boolean).join(' · ')});
