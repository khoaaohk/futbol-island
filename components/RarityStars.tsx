/**
 * Rarity as an icon row (Oct 15 2026, docs/fishing-research.md A6): 1-4 stars beside the rarity word and colour, so the rarity
 * reads by shape and count, not only colour (colour-blind safe). Uses currentColor; the caller colours it. Shared by the
 * fishing catch card and HUD, and available to the Fishbook and Rosa's stand.
 */
import {RARITY_LABEL,type FishRarity} from '@/lib/town/fishing/fishCatalog';
import {RARITY_STARS} from '@/lib/town/fishing/fishingCard';

const STAR='M12 2.6l2.85 6 6.55.8-4.83 4.55 1.25 6.5L12 17.3l-5.82 3.15 1.25-6.5L2.6 9.4l6.55-.8z';
export function RarityStars({rarity,size=14,className}:{rarity:FishRarity;size?:number;className?:string}){
 const n=RARITY_STARS[rarity];
 return <span className={className} role="img" aria-label={`${RARITY_LABEL[rarity]}, ${n} of 4 stars`} data-rarity={rarity} data-rarity-stars={n} style={{display:'inline-flex',gap:1,verticalAlign:'-2px'}}>
  {[0,1,2,3].map(i=><svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={STAR} fill={i<n?'currentColor':'none'} stroke="currentColor" strokeWidth={2} strokeLinejoin="round" opacity={i<n?1:.45}/></svg>)}
 </span>;
}
