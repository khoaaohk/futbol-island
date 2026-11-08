// Quick phrases in live matches (Nov 7 2026): kid-safe, no free text. A fixed set of eight football calls ("Pass!", "Mine!",
// "Over here!"...), sent as a small integer id and shown as a speech bubble over the player's head for ~2 s.
// Teaching purpose: real players talk all match long. Calling for the ball ("Pass!", "Over here!"), claiming it ("Mine!"), owning a
// mistake ("Sorry!") and cheering a teammate ("Nice one!", "Good game!") are the habits of a good teammate.
// Pure: no DOM, no three.js, no protocol import. Used by lib/town/liveJoinRuntime.ts (the bubbles, the tray, the rate limit) and
// lib/multiplayer/matchLink.ts (the wire: NO relay or protocol change, see PHRASE_WIRE).
// Heat: nothing runs while no bubble is up; the bubbles are a fixed pool (BUBBLE.pool) and nothing allocates per frame.

/** The phrase set. The index is the wire id (0..7): append only, never reorder. */
export const PHRASES=['Pass!','Nice one!','Mine!','Over here!','Great goal!','Good game!','Sorry!','Let’s go!'] as const;
export type PhraseId=number;
/** What an AI teammate may answer (purely cosmetic, local only). */
export const AI_REPLIES={nice:'Nice!',mine:'Mine!'} as const;
/** Phrases a nearby AI teammate may answer with "Nice!" (Nice one!, Great goal!, Good game!, Let's go!). */
export const AI_NICE_TO:readonly number[]=[1,4,5,7];
export const AI_REPLY={chance:.45,delayS:.8,mineChance:.15,mineCoolS:10,mineRange:70} as const;
/** Rate limit (kid spam guard): one phrase per gapMs, at most `max` in any windowMs. */
export const PHRASE_RATE={gapMs:1500,windowMs:10000,max:6} as const;
/** Bubbles: shown showS seconds (the last outS fade out), a fixed pool, the head height above the pitch (m). */
export const BUBBLE={showS:2,outS:.25,pool:4,headM:2.15,topPx:96} as const;

// ---- the setting (Island settings → Live matches → Quick phrases, default on). Off: no phrase button and nobody's bubbles. ----
export const PHRASE_KEY='fi2-match-phrases-v1';
type PStore={on:boolean|null;subs:Set<()=>void>};
const pstore:PStore=((globalThis as {__fi2MatchPhrases?:PStore}).__fi2MatchPhrases??={on:null,subs:new Set()});
export function phrasesEnabled(){if(pstore.on===null){pstore.on=true;try{pstore.on=localStorage.getItem(PHRASE_KEY)!=='off';}catch{}}return pstore.on;}
export function setPhrasesEnabled(on:boolean){pstore.on=on;try{localStorage.setItem(PHRASE_KEY,on?'on':'off');}catch{}pstore.subs.forEach(f=>f());}
export function subscribePhrases(f:()=>void){pstore.subs.add(f);return ()=>{pstore.subs.delete(f);};}

export const isPhrase=(id:number)=>Number.isInteger(id)&&id>=0&&id<PHRASES.length;

/** The rate limit: a ring of the last `max` send times (no allocation). */
export function createPhraseLimiter(rate:{gapMs:number;windowMs:number;max:number}=PHRASE_RATE){
  const ring=new Float64Array(rate.max).fill(-1e12);let head=0,last=-1e12;
  const api={
    /** May a phrase go now (ms clock)? */
    can(t:number){return t-last>=rate.gapMs&&t-ring[head]>=rate.windowMs;},
    /** Spend one if allowed; true when it was. */
    take(t:number){if(!api.can(t))return false;ring[head]=t;head=(head+1)%rate.max;last=t;return true;},
    reset(){ring.fill(-1e12);head=0;last=-1e12;},
  };
  return api;
}

/** A bubble pool: one entry per pooled DOM element. A speaker already talking reuses their bubble; else a free one; else the oldest. */
export type Bubble={key:string;text:string;age:number;live:boolean;fresh:boolean};
export function createBubblePool(n:number=BUBBLE.pool){
  const items:Bubble[]=Array.from({length:n},()=>({key:'',text:'',age:0,live:false,fresh:false}));
  return {
    items,
    /** Show `text` over `key` (a sim slot id). Returns the pool index used. */
    add(key:string,text:string){
      let i=items.findIndex(b=>b.live&&b.key===key);
      if(i<0)i=items.findIndex(b=>!b.live);
      if(i<0){let o=0;for(let j=1;j<n;j++)if(items[j].age>items[o].age)o=j;i=o;}
      const b=items[i];b.key=key;b.text=text;b.age=0;b.live=true;b.fresh=true;return i;
    },
    /** Age every live bubble; the ones past BUBBLE.showS die. */
    step(dt:number){for(const b of items)if(b.live){b.age+=dt;if(b.age>=BUBBLE.showS)b.live=false;}},
    get active(){let c=0;for(const b of items)if(b.live)c++;return c;},
    clear(){for(const b of items){b.live=false;b.fresh=false;}},
  };
}

// ---- the wire (no relay, no protocol, no limits.ts change; matchNet's 512 B snapshot cap kept) ----
// A friend's phrase rides their C.Match In frame [19, 2, seq, mx, my, btn, passPower, shootPower, long, aimX, aimH]: shootPower and
// long are 0..100 (x100), so bits 7-9 of each are free inside the relay's -1000..1023 check: shootPower carries the phrase id (0..7),
// long the serial (1..7; 0 = no phrase). The owner strips them before decodeIn, so its sim never sees them.
// The owner re-broadcasts each phrase (its own and its friends') as ONE optional value at the END of its C.Match Snap frame:
// snapTag - (slot | id << 5 | serial << 8), in -62047..-60000 (inside the relay's ±100 000 check; no snapshot value is ever that
// negative: positions are x10 metres, the packed blocks are positive). Older readers stop before it; it is added only when the frame
// still fits SNAP_MAX_LEN numbers and SNAP_MAX_BYTES bytes, so the snapshot is never refused.
export const PHRASE_WIRE={inSp:7,inLong:8,shift:7,low:127,snapTag:-60000,snapSpan:2048,holdMs:1200} as const;
/** Write phrase `id` (serial 1..7) into an encoded C.Match In frame (out[7] shootPower, out[8] long). */
export function packInPhrase(out:number[],id:number,serial:number){
  if(!isPhrase(id)||serial<1||serial>7)return out;
  out[PHRASE_WIRE.inSp]=(out[PHRASE_WIRE.inSp]&PHRASE_WIRE.low)|(id<<PHRASE_WIRE.shift);
  out[PHRASE_WIRE.inLong]=(out[PHRASE_WIRE.inLong]&PHRASE_WIRE.low)|(serial<<PHRASE_WIRE.shift);
  return out;
}
/** Read + strip a phrase from an In body whose seq is at `from` (S.Match In: from = 3). Returns id | serial << 3, or -1. */
export function readInPhrase(a:number[],from:number){
  const sp=from+5,lg=from+6,s=a[sp],l=a[lg];
  if(typeof s!=='number'||typeof l!=='number'||s<0||l<0)return -1;
  const id=s>>PHRASE_WIRE.shift,serial=l>>PHRASE_WIRE.shift;
  a[sp]=s&PHRASE_WIRE.low;a[lg]=l&PHRASE_WIRE.low;
  return serial>0&&isPhrase(id)?id|serial<<3:-1;
}
export function packSnapPhrase(slot:number,id:number,serial:number){return PHRASE_WIRE.snapTag-((slot&31)|((id&7)<<5)|((serial&7)<<8));}
/** The snapshot's trailing phrase value, or null. `out` is reused. */
export function readSnapPhrase(a:readonly number[],out:{slot:number;id:number;serial:number}){
  const v=a[a.length-1];
  if(typeof v!=='number'||v>PHRASE_WIRE.snapTag||v<=PHRASE_WIRE.snapTag-PHRASE_WIRE.snapSpan)return null;
  const p=PHRASE_WIRE.snapTag-v;out.slot=p&31;out.id=(p>>5)&7;out.serial=(p>>8)&7;return out;
}
/** JSON characters of an integer (no allocation). */
const digits=(v:number)=>{const a=v<0?-v:v;return (v<0?1:0)+(a<10?1:a<100?2:a<1000?3:a<10000?4:a<100000?5:String(a).length);};
/** The JSON size of a flat integer frame (brackets + commas + digits), as connection.encode would send it. */
export function frameBytes(a:readonly number[]){let n=2+Math.max(0,a.length-1);for(let i=0;i<a.length;i++)n+=digits(a[i]);return n;}
/** Append one phrase value to an encoded snapshot if it still fits; true when appended. */
export function appendSnapPhrase(out:number[],value:number,maxLen:number,maxBytes:number){
  if(out.length+1>maxLen||frameBytes(out)+1+digits(value)>maxBytes)return false;
  out.push(value);return true;
}

/** The bridge between the live-join runtime (who talks, the bubbles) and matchLink (the wire). Plain data, reused. */
export type PhraseBus={
  /** My latest phrase: id, serial (1..7, cycling) and when (ms). serial 0 = none yet. */
  out:{id:number;serial:number;at:number};
  /** matchLink: a phrase from the player on slot index `slotIdx` of my shared match (already de-duplicated). */
  show(slotIdx:number,id:number):void;
};

// ---- HUD pieces for the sim's new features (feature-detected; absent fields = nothing shown) ----
/** The goal's assist, if the sim exposes it: `sim.lastGoal.assistSlot` (or `sim.goalEvent.assistSlot`), a slot id or an index into
 *  sim.ids. Returns the slot id or null. */
export function goalAssist(sim:{ids:readonly string[]}&Record<string,unknown>):string|null{
  for(const k of ['lastGoal','goalEvent','lastGoalEvent']){
    const g=sim[k] as {assistSlot?:unknown;assist?:unknown}|null|undefined;if(!g||typeof g!=='object')continue;
    const a=g.assistSlot??g.assist;
    if(typeof a==='string'&&a)return a;
    if(typeof a==='number'&&a>=0&&a<sim.ids.length)return sim.ids[a]??null;
  }
  return null;
}
/** A tackle wind-up aimed at me, if the sim exposes one: `sim.tackleWindup` ({on|target: slot id, t?: s left}) or a Map / record of
 *  them, or a per-player `tackleWindup` (> 0) on an opponent within `near` sim units while I have the ball. */
export function tackleTelegraph(sim:{players:Record<string,{x:number;y:number;team:string}&Record<string,unknown>>}&Record<string,unknown>,me:string,onBall:boolean,near=40):boolean{
  const w=sim.tackleWindup as unknown;
  const hits=(o:unknown)=>!!o&&typeof o==='object'&&((o as {on?:unknown}).on===me||(o as {target?:unknown}).target===me)&&((o as {t?:number}).t??1)>0;
  if(w){
    if(hits(w))return true;
    if(w instanceof Map){for(const v of w.values())if(hits(v))return true;}
    else if(typeof w==='object')for(const k in w as object)if(hits((w as Record<string,unknown>)[k]))return true;
  }
  if(!onBall)return false;
  const m=sim.players[me];if(!m||!('tackleWindup' in m))return false;// the sim has no per-player wind-up: no loop
  for(const id in sim.players){const p=sim.players[id];if(p.team===m.team)continue;const v=p.tackleWindup;if(typeof v==='number'&&v>0&&Math.hypot(p.x-m.x,p.y-m.y)<near)return true;}
  return false;
}
