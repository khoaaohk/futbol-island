import players from './positionPlayers.json';
import roster from './cardRoster.json';
import {CARD_REWARDS_LAUNCH} from './cardRewards';

/** Player-card collection: every player that can appear on a card, the card number, and what this device has collected. */
export const CARD_STORAGE_KEY='fi2-player-cards-v1';
type Group={current:string[];allTime:string[]};
const GROUPS=players as Record<string,Group>;
/** Card numbers come from the fixed roster (lib/town/cardRoster.json): new players are appended, so no card is ever renumbered.
 * Any listed player missing from the roster is numbered after it, alphabetically, until the roster is updated. */
const ROSTER=(roster as {players:string[]}).players;
const LISTED=[...new Set(Object.values(GROUPS).flatMap(group=>[...group.current,...group.allTime]))];
export const ALL_PLAYERS=[...ROSTER.filter(name=>LISTED.includes(name)),...LISTED.filter(name=>!ROSTER.includes(name)).sort((a,b)=>a.localeCompare(b))];
export const cardNumber=(name:string)=>ALL_PLAYERS.indexOf(name)+1;

export const ROLE_LABELS:Record<string,string>={goalkeeper:'Goalkeeper',fullback:'Full-back',centerback:'Centre-back',midfielder:'Midfielder',winger:'Winger',striker:'Striker',goleiro:'Futsal goalkeeper',fixo:'Futsal fixo',ala:'Futsal ala',pivot:'Futsal pivô',coach:'Head coach'};
export const FUTSAL_ROLES=new Set(['goleiro','fixo','ala','pivot']);
/** Coach cards (user request, Sep 28 2026: "add top 25 current and all time coaches"): the `coach` role in positionPlayers.json,
 *  numbered after every player (cardRoster.json 401–450), with their own divider in the Futbol binder. A coach who also has a
 *  player card is keyed "<Name> (coach)"; cardDisplayName drops the suffix wherever the card itself already says Head coach. */
export const COACH_ROLE='coach';
const COACHES=new Set([...(GROUPS[COACH_ROLE]?.current??[]),...(GROUPS[COACH_ROLE]?.allTime??[])]);
export const isCoachCard=(name:string)=>COACHES.has(name);
export const cardDisplayName=(name:string)=>name.replace(/ \(coach\)$/,'');
export type CardEntry={name:string;number:number;role:string;roleLabel:string;era:'current'|'allTime';futsal:boolean};
/** One entry per player: their first listed role and era (a few players appear in two roles). */
export const CARD_ENTRIES:CardEntry[]=(()=>{
 const seen=new Map<string,CardEntry>();
 for(const [role,group] of Object.entries(GROUPS))for(const era of ['current','allTime'] as const)for(const name of group[era])
  if(!seen.has(name))seen.set(name,{name,number:cardNumber(name),role,roleLabel:ROLE_LABELS[role]??role,era,futsal:FUTSAL_ROLES.has(role)});
 return [...seen.values()].sort((a,b)=>a.number-b.number);
})();
/** Binder order, front to back (user request, Sep 24 2026): strikers first, then back through the team, goalkeepers last
 *  among the players, then the coaches' own section (Sep 28 2026).
 *  Only the binder order; each card's role still comes from positionPlayers.json order above. */
const BINDER_ORDER=['striker','winger','midfielder','fullback','centerback','goalkeeper','coach','pivot','ala','fixo','goleiro'];
export const ROLE_ORDER=[...BINDER_ORDER.filter(role=>role in GROUPS),...Object.keys(GROUPS).filter(role=>!BINDER_ORDER.includes(role))];

/** TESTING (user request, Sep 23 2026): every card counts as collected so the whole set can be reviewed. Follows the launch
 *  switch: on until CARD_REWARDS_LAUNCH (lib/town/cardRewards.ts) turns rewards on. */
export const UNLOCK_ALL_CARDS=!CARD_REWARDS_LAUNCH;
/** Dev-only switch for testing card rewards (docs/card-rewards.md): open the app with `?cards=earn` to turn unlock-all off and
 *  rewards on in this browser, `?cards=all` to go back. Remembered in localStorage; always off in production builds. */
export const CARD_DEV_KEY='fi2-cards-dev-v1';
let devEarn:boolean|null=null;
export function cardDevEarn():boolean{
 if(process.env.NODE_ENV==='production'||typeof window==='undefined')return false;
 if(devEarn!==null)return devEarn;
 try{const mode=new URLSearchParams(location.search).get('cards');if(mode==='earn')localStorage.setItem(CARD_DEV_KEY,'earn');else if(mode==='all'||mode==='off')localStorage.removeItem(CARD_DEV_KEY);devEarn=localStorage.getItem(CARD_DEV_KEY)==='earn';}catch{devEarn=false;}
 return devEarn;
}
/** Adds a card to this device's collection (merging what other tabs saved). Returns false when it was already there. */
export function addToCollection(name:string):boolean{
 if(!ALL_PLAYERS.includes(name))return false;
 let saved:string[]=[];try{const value=JSON.parse(localStorage.getItem(CARD_STORAGE_KEY)??'[]');if(Array.isArray(value))saved=value.filter((v:unknown):v is string=>typeof v==='string'&&ALL_PLAYERS.includes(v));}catch{}
 if(saved.includes(name))return false;
 try{localStorage.setItem(CARD_STORAGE_KEY,JSON.stringify([...saved,name]));}catch{}
 return true;
}
export function readCollection():string[]{
 if(UNLOCK_ALL_CARDS&&!cardDevEarn())return [...ALL_PLAYERS];
 try{const value=JSON.parse(localStorage.getItem(CARD_STORAGE_KEY)??'[]');return Array.isArray(value)?value.filter((v:unknown):v is string=>typeof v==='string'&&ALL_PLAYERS.includes(v)):[];}catch{return [];}
}
