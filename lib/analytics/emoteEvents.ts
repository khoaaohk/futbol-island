/**
 * Emote analytics (Oct 22 2026, Phase A of docs/analytics-multiplayer-plan.md §5). Called from Town.tsx's emoteBus handler once a
 * pick is accepted (countEmote) and from components/EmoteControl.tsx (countEmoteUi). Each call is a tracker count() (a map
 * increment that rides the next beat): no request, no timer, nothing per frame. Ids: lib/analytics/countIds.ts
 * EMOTE_COUNT_EVENTS + EMOTE_WIRE_IDS (the LOCAL emote number: 0–9 the wheel, 10–18 rides, 20–24 flying, 30–34 swimming,
 * 40–49 townsperson sets, 50–54 moving emotes while walking / running). Labels live on the admin side (app/admin/EmoteSection.tsx).
 *
 * Privacy: a preset emote number, where it was played (a fixed context) and what answered (a townsperson, the party, nobody).
 * Never who it was aimed at, never a position.
 */
import {count} from './tracker';
import {EMOTE_CONTEXTS,EMOTE_REACH,EMOTE_VARIANT_COUNTS,EMOTE_WIRE_IDS,type EmoteCtx,type EmoteVariantFamily} from './countIds';

const WIRES=new Set(EMOTE_WIRE_IDS);
const CTX=new Set<string>(EMOTE_CONTEXTS);
let picks=0,btnSent=false;
/** Streak (Phase B): the times of the two picks before this one (a two-slot ring, no timer) and when the last streak counted. */
const STREAK_MS=60_000;
let prev1=-Infinity,prev2=-Infinity,lastStreak=-Infinity;
const now=()=>typeof performance!=='undefined'?performance.now():Date.now();

/** Where the player was when they emoted: a ride name ('scooter' | 'bike' | 'moped'), flying, swimming, else the ground. */
export function emoteCtx(ride:string,flying:boolean,swimming:boolean):EmoteCtx{
 if(flying)return 'fly';if(swimming)return 'swim';
 return ride==='scooter'||ride==='bike'||ride==='moped'?ride:'ground';
}

/**
 * One accepted pick. `wire`: the local emote number picked; `ctx`: emoteCtx(); `npc`: a townsperson answered; `party`: it went
 * to a live party; `refused`: a field player showed the "not now" bubble instead.
 */
export function countEmote({wire,ctx,npc,party,refused}:{wire:number;ctx:EmoteCtx;npc:boolean;party:boolean;refused:boolean},t=now()){
 count('em:pick');
 if(WIRES.has(wire))count(`em:e${wire}`);
 if(CTX.has(ctx))count('em:ctx_'+ctx);
 if(refused)count('em:refused');else if(npc)count('em:to_npc');
 if(party)count('em:to_party');
 if(!npc&&!party&&!refused)count('em:solo');
 picks++;for(const n of EMOTE_REACH)if(picks===n)count('em:reach_'+n);
 // 3+ picks inside 60 s (this one and the two before), at most one streak per 60 s.
 if(t-prev2<=STREAK_MS&&t-lastStreak>=STREAK_MS){lastStreak=t;count('em:streak');}
 prev2=prev1;prev1=t;
}

/**
 * Which move of a multi-move emote played (Phase B): `family` and the move's index in its real table (countIds.ts
 * EMOTE_VARIANT_COUNTS). Town passes the local player's picks only (lib/town/emoteVariantHook.ts) and a townsperson's answer to
 * a show-off ('react'). An index outside the table is dropped.
 */
export function countEmoteVariant(family:EmoteVariantFamily,v:number){
 const n=(EMOTE_VARIANT_COUNTS as Record<string,number>)[family];
 if(n&&Number.isInteger(v)&&v>=0&&v<n)count(`em:${family}_${v}`);
}
/** The emote camera zoomed in for this emote (lib/town/emoteCamera.ts begin() returned true). */
export const countEmoteCam=()=>count('em:cam');
/** A friend's emote was shown on this screen (lib/multiplayer/townBridge.ts onEmoteSeen; never which friend). */
export const countEmoteSeen=()=>count('em:seen');

/** The Emote button became visible (once per tab session), the wheel opened, or it closed with no pick. */
export function countEmoteUi(kind:'btn'|'wheel'|'wheel_close'){
 if(kind==='btn'){if(btnSent)return;btnSent=true;}
 count('em:'+kind);
}

/** Tests: forget the session. */
export function resetEmoteEvents(){picks=0;btnSent=false;prev1=prev2=lastStreak=-Infinity;}
