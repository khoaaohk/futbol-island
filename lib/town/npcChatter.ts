/**
 * Ambient NPC chatter engine (owner, Nov 1 2026: "make NPCs feel alive"). Pure logic, no three.js, no DOM, no network:
 * - near: the player walks / rides a scooter, bike or moped SLOWLY (< 1.2 m/s for 0.6 s) within 5 m of a townsperson -> one thought bubble.
 * - banter: two townsfolk in 'social' mode (lib/town/npcBehavior.ts) trade 2-4 alternating lines (a, b, a, b); it holds ONE slot.
 * - idle: now and then (rare) a townsperson in range mumbles a line alone.
 * Lines come from authored data (lib/town/npcThoughts.ts, byNpc -> byArea -> nothing) through a seeded rng, so cost never grows with players:
 * no per-player storage, nothing sent over the relay, no server or LLM work. Every bubble is local to this screen.
 * Heat: the scan runs at 5 Hz (not per frame) over the cast with no allocation; only NPCs within 16 m AND on screen count; at most 2 slots
 * (1 at heat tier 2+ / Battery saver, near-only there); per-NPC 20 s and global 4 s cooldowns; bubbles last ~3.6 s.
 */
import type {NpcThoughtBook,NpcBanter} from './npcChatterTypes';

export const CHATTER={RANGE:16,NEAR:5,SLOW_SPEED:1.2,SLOW_HOLD:.6,NPC_COOLDOWN:20,GLOBAL_COOLDOWN:4,LIFE:3.6,BANTER_LINE:2.8,MAX:2,SCAN:.2,IDLE_CHANCE:.006} as const;
/** Structural: lib/graphics/islandNpcs entries satisfy this as they are (no copy). */
export type ChatterActor={id:string;position:{x:number;y:number;z:number};routine:{mode:string;partner:string|null};definition:{area?:string}};
/** The player's travel state. Only walk / scooter / bike / moped (on land, not flying, swimming or diving) can trigger a `near` thought. */
export type ChatterInput={x:number;y:number;z:number;speed:number;canTrigger:boolean;
 /** a lesson, quiz, menu, chat, match, arcade... : every bubble hides and nothing starts */
 blocked:boolean;
 /** e.g. an emote is playing: running bubbles finish, nothing new starts */
 quiet?:boolean;
 tier:number;saver:boolean};
export type ChatterKind='near'|'idle'|'banter';
export type ChatterSlot={on:boolean;kind:ChatterKind;speaker:ChatterActor|null;a:ChatterActor|null;b:ChatterActor|null;lines:readonly string[]|null;line:number;left:number;buf:string[]};
export type ChatterCmd={op:'show'|'hide';slot:number;speaker:ChatterActor|null;text:string;seconds:number};
export type ChatterOut={n:number;cmds:ChatterCmd[]};
export const createChatterOut=():ChatterOut=>({n:0,cmds:Array.from({length:CHATTER.MAX*2+2},()=>({op:'hide' as const,slot:0,speaker:null,text:'',seconds:0}))});

/** mulberry32: tiny, fast, deterministic. */
export function seededRng(seed:number){let s=seed>>>0;return ()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}

export function poolFor(book:NpcThoughtBook,actor:ChatterActor,kind:'near'|'idle'):readonly string[]|null{
 const own=book.byNpc[actor.id]?.[kind];if(own&&own.length)return own;
 const area=actor.definition.area,shared=area?book.byArea[area]?.[kind]:undefined;return shared&&shared.length?shared:null;
}

export function createNpcChatter(book:NpcThoughtBook,seed=1){
 const rng=seededRng(seed),slots:ChatterSlot[]=Array.from({length:CHATTER.MAX},()=>({on:false,kind:'near' as ChatterKind,speaker:null,a:null,b:null,lines:null,line:0,left:0,buf:['','']}));
 const cool=new Map<string,number>(),last=new WeakMap<readonly string[],number>();
 // banter index a -> b -> list (built once; lookups never allocate)
 const banterIx=new Map<string,Map<string,NpcBanter[]>>();for(const bt of book.banter){if(bt.lines.length<2)continue;let m=banterIx.get(bt.a);if(!m)banterIx.set(bt.a,m=new Map());let l=m.get(bt.b);if(!l)m.set(bt.b,l=[]);l.push(bt);}
 let clock=0,scanT=0,slowT=0,globalAt=-1e9,out:ChatterOut;
 const emit=(op:'show'|'hide',slot:number,speaker:ChatterActor|null,text:string,seconds:number)=>{if(out.n>=out.cmds.length)return;const c=out.cmds[out.n++];c.op=op;c.slot=slot;c.speaker=speaker;c.text=text;c.seconds=seconds;};
 const pick=(pool:readonly string[])=>{let i=Math.floor(rng()*pool.length);const prev=last.get(pool);if(pool.length>1&&i===prev)i=(i+1)%pool.length;last.set(pool,i);return pool[i];};
 const hide=(i:number)=>{const s=slots[i];if(!s.on)return;s.on=false;s.speaker=s.a=s.b=null;s.lines=null;emit('hide',i,null,'',0);};
 const speaking=(a:ChatterActor)=>{for(const s of slots)if(s.on&&(s.speaker===a||s.a===a||s.b===a))return true;return false;};
 const ready=(a:ChatterActor)=>(cool.get(a.id)??-1e9)<=clock&&!speaking(a);
 const dist2=(a:ChatterActor,p:ChatterInput)=>{const dx=a.position.x-p.x,dz=a.position.z-p.z;return Math.abs(a.position.y-p.y)>4?1e9:dx*dx+dz*dz;};
 const freeSlot=(cap:number)=>{for(let i=0;i<cap;i++)if(!slots[i].on)return i;return -1;};
 const start=(i:number,kind:ChatterKind,speaker:ChatterActor,text:string,seconds:number)=>{const s=slots[i];s.on=true;s.kind=kind;s.speaker=speaker;s.left=seconds;s.line=0;cool.set(speaker.id,clock+CHATTER.NPC_COOLDOWN);globalAt=clock;emit('show',i,speaker,text,seconds);};
 const findById=(actors:readonly ChatterActor[],id:string)=>{for(const a of actors)if(a.id===id)return a;return null;};
 function step(dt:number,p:ChatterInput,actors:readonly ChatterActor[],onScreen:(a:ChatterActor)=>boolean,o:ChatterOut){
  out=o;o.n=0;dt=Math.min(Math.max(dt,0),.25);clock+=dt;
  if(p.blocked){for(let i=0;i<slots.length;i++)hide(i);slowT=0;return o;}
  const lite=p.tier>=2||p.saver,cap=lite?1:CHATTER.MAX,R2=CHATTER.RANGE*CHATTER.RANGE;
  for(let i=cap;i<slots.length;i++)hide(i);
  slowT=p.canTrigger&&p.speed<CHATTER.SLOW_SPEED?slowT+dt:0;
  // running slots: age, advance banter lines, drop speakers that walked out of range
  for(let i=0;i<cap;i++){const s=slots[i];if(!s.on)continue;s.left-=dt;
   if(s.speaker&&dist2(s.speaker,p)>(CHATTER.RANGE+2)**2){hide(i);continue;}
   if(s.left>0)continue;
   if(s.kind==='banter'&&s.lines&&s.a&&s.b&&s.line+1<s.lines.length&&!lite){s.line++;s.speaker=s.line%2?s.b:s.a;s.left=CHATTER.BANTER_LINE;emit('show',i,s.speaker,s.lines[s.line],CHATTER.BANTER_LINE);continue;}
   hide(i);
  }
  scanT+=dt;if(scanT<CHATTER.SCAN)return o;scanT=0;
  if(p.quiet||clock-globalAt<CHATTER.GLOBAL_COOLDOWN)return o;
  const slot=freeSlot(cap);if(slot<0)return o;
  // 1) near: the nearest ready townsperson within 5 m while the player is slow
  if(slowT>=CHATTER.SLOW_HOLD){let best:ChatterActor|null=null,bd=CHATTER.NEAR*CHATTER.NEAR;
   for(const a of actors){const d=dist2(a,p);if(d<bd&&ready(a)&&poolFor(book,a,'near')&&onScreen(a)){best=a;bd=d;}}
   if(best){start(slot,'near',best,pick(poolFor(book,best,'near')!),CHATTER.LIFE);return o;}
  }
  if(lite)return o;
  // 2) banter: a social pair (both in range, on screen, ready)
  for(const a of actors){const r=a.routine;if(r.mode!=='social'||!r.partner||r.partner<a.id||dist2(a,p)>R2||!ready(a))continue;
   const b=findById(actors,r.partner);if(!b||b.routine.mode!=='social'||b.routine.partner!==a.id||dist2(b,p)>R2||!ready(b)||!onScreen(a)||!onScreen(b))continue;
   const ab=banterIx.get(a.id)?.get(b.id),ba=banterIx.get(b.id)?.get(a.id),n=(ab?.length??0)+(ba?.length??0);
   const s=slots[slot];let first:ChatterActor,second:ChatterActor,lines:readonly string[];
   if(n){const k=Math.floor(rng()*n),bt=ab&&k<ab.length?ab[k]:ba![k-(ab?.length??0)];const fwd=bt.a===a.id;first=fwd?a:b;second=fwd?b:a;lines=bt.lines;}
   else{const pa=poolFor(book,a,'idle'),pb=poolFor(book,b,'idle');if(!pa||!pb)continue;s.buf[0]=pick(pa);s.buf[1]=pick(pb);first=a;second=b;lines=s.buf;}/* no authored pair: each says an idle line (slot-owned buffer, never reallocated) */
   start(slot,'banter',first,lines[0],CHATTER.BANTER_LINE);s.a=first;s.b=second;s.lines=lines;cool.set(second.id,clock+CHATTER.NPC_COOLDOWN);return o;
  }
  // 3) idle: rare, one random ready townsperson in range
  if(rng()<CHATTER.IDLE_CHANCE){let count=0;for(const a of actors)if(dist2(a,p)<=R2&&ready(a)&&poolFor(book,a,'idle'))count++;
   if(count){let k=Math.floor(rng()*count);for(const a of actors){if(!(dist2(a,p)<=R2&&ready(a)&&poolFor(book,a,'idle')))continue;if(k--===0){if(onScreen(a))start(slot,'idle',a,pick(poolFor(book,a,'idle')!),CHATTER.LIFE);break;}}}
  }
  return o;
 }
 return {step,slots,reset(){for(let i=0;i<slots.length;i++){const s=slots[i];s.on=false;s.speaker=s.a=s.b=null;s.lines=null;}cool.clear();slowT=0;scanT=0;globalAt=-1e9;},get slow(){return slowT;}};
}
export type NpcChatter=ReturnType<typeof createNpcChatter>;
