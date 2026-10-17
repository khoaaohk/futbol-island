import {CARD_ENTRIES,cardDisplayName,isCoachCard,type CardEntry} from '@/lib/town/cardCollection';
import profiles from '@/lib/town/playerProfiles.json';
import careers from '@/lib/town/playerCareers.json';
import appearance from '@/lib/town/playerAppearance.json';
/**
 * The player-card binder as plain reading pages (/cards, /cards/<number>): read-only views of the card roster
 * (lib/town/cardCollection.ts), playerProfiles.json (blurb, strengths), playerCareers.json (clubs, national team) and the
 * country in playerAppearance.json. No photos: the card art is a packed two-tone mask the game paints on the client
 * (components/PlayerArt.tsx), not a picture a page can show, and this page adds no new images.
 */
type Stint={club:string;from:number|null;to:number|null;loan?:boolean};
type Career={clubs?:Stint[];national?:{team:string;from:number|null;to:number|null};role?:string;checked?:string};
const PROFILES=profiles as unknown as Record<string,{blurb?:string;strengths?:string[]}>;
const CAREERS=careers as unknown as Record<string,Career>;
const LOOKS=appearance as unknown as Record<string,{country?:string}>;
export type SiteCard=CardEntry&{displayName:string;coach:boolean;country?:string;blurb:string;strengths:string[];career:string[];national?:string};
const years=(from:number|null,to:number|null)=>from==null?'':to==null?`${from}–present`:from===to?`${from}`:`${from}–${to}`;
export const SITE_CARDS:SiteCard[]=CARD_ENTRIES.map(e=>{
 const p=PROFILES[e.name]??{},c=CAREERS[e.name]??{};
 return {...e,displayName:cardDisplayName(e.name),coach:isCoachCard(e.name),country:typeof LOOKS[e.name]==='object'?LOOKS[e.name].country:undefined,
  blurb:p.blurb??'',strengths:p.strengths??[],
  career:(c.clubs??[]).map(s=>`${s.club}${s.loan?' (loan)':''}${years(s.from,s.to)?`, ${years(s.from,s.to)}`:''}`),
  national:c.national?`${c.national.team}${years(c.national.from,c.national.to)?`, ${years(c.national.from,c.national.to)}`:''}`:undefined};
});
export const cardByNumber=(n:number)=>SITE_CARDS.find(c=>c.number===n);
export const cardPath=(n:number)=>`/cards/${n}`;
export const eraWord=(c:SiteCard)=>c.era==='allTime'?'All-time great':'Current star';
