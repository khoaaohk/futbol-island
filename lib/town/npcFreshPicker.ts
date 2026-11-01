import type {NpcDefinition} from './npcDialogues';
import type {FreshTopic,NpcChallenge,NpcFresh,NpcFreshBook} from './npcFreshTypes';
import {FRESH} from './npcFresh';
import {npcOpeners} from './npcOpeners';
/**
 * Fresh NPC chats (Nov 1 2026, owner: "more fun, never the same content twice"). ALL the logic for picking what an islander says
 * on this visit lives here; components/NpcConversation.tsx only renders the plan. Content comes from lib/town/npcFresh.ts (FRESH).
 *
 * Freshness memory: per NPC, the topic ids asked, challenge ids answered and opener / returning lines shown, saved on this device
 * (localStorage, versioned key, every access in try/catch; an in-memory copy keeps the session fresh when storage fails). A seen
 * item never comes back until that NPC's whole pool of that kind has been seen; then the pool resets, skipping the last few items
 * so nothing repeats back to back. No network, no server, nothing per frame: one small read when a chat opens, writes on taps.
 */
export const FRESH_STORAGE_KEY='fi2-npc-fresh-v1';
export const TOPICS_PER_VISIT=3;
/** After a pool resets, items among the last RECENT_N shown are skipped (while the pool is big enough to allow it). */
export const RECENT_N=4;
/** "Several topics already asked" before the NPC greets the player with a returning line. */
export const RETURNING_AFTER=2;
type Kind='t'|'c'|'o'|'r';
type NpcMemory={[K in Kind]?:{s:string[];r:string[]}}&{lr?:1};
type Memory={v:1;n:Record<string,NpcMemory>;rw?:{d:string;ids:string[]}};
export type FreshStore={get():string|null;set(value:string):void};
const localStore:FreshStore={get:()=>{try{return localStorage.getItem(FRESH_STORAGE_KEY);}catch{return null;}},set:value=>{try{localStorage.setItem(FRESH_STORAGE_KEY,value);}catch{/* full or blocked: the in-memory copy still works */}}};
let memo:{store:FreshStore;mem:Memory}|null=null;
const empty=():Memory=>({v:1,n:{}});
function load(store:FreshStore):Memory{
 if(memo&&memo.store===store)return memo.mem;
 let mem=empty();
 try{const raw=JSON.parse(store.get()??'null');if(raw&&raw.v===1&&raw.n&&typeof raw.n==='object')mem=raw;}catch{/* corrupt: start fresh */}
 memo={store,mem};return mem;
}
function save(store:FreshStore,mem:Memory){memo={store,mem};try{store.set(JSON.stringify(mem));}catch{/* tolerated */}}
/** Test hook: forget the cached copy (the next call re-reads its store). */
export function resetFreshCache(){memo=null;}
/** Short stable id for a line of text (openers have no ids). */
export const lineId=(text:string)=>{let h=5381;for(let i=0;i<text.length;i++)h=(h*33+text.charCodeAt(i))|0;return (h>>>0).toString(36);};
const EMPTY:NpcFresh={topics:[],challenges:[],openers:[],returning:[]};
/** This NPC's fresh pool: its own, else its area's, else nothing (base content only). */
export function freshPool(npc:Pick<NpcDefinition,'id'|'area'>,book:NpcFreshBook=FRESH):NpcFresh{
 return book?.byNpc?.[npc.id]??(npc.area?book?.byArea?.[npc.area]:undefined)??EMPTY;
}
function slot(mem:Memory,npcId:string,kind:Kind){const n=mem.n[npcId]??(mem.n[npcId]={});return n[kind]??(n[kind]={s:[],r:[]});}
const shuffle=<T,>(items:T[],rand:()=>number)=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
/**
 * Up to `count` ids from the pool that this player has not seen. When none is left the pool resets (the seen list is cleared),
 * skipping the most recent ones so the reset never hands back what was just seen. Pure apart from mutating `state`.
 */
export function pickFresh(pool:string[],state:{s:string[];r:string[]},count:number,rand:()=>number=Math.random):string[]{
 const ids=[...new Set(pool)];if(!ids.length||count<1)return [];
 const seen=new Set(state.s);let open=ids.filter(id=>!seen.has(id));
 if(!open.length){state.s=[];const k=Math.max(0,Math.min(RECENT_N,ids.length-count)),recent=new Set(k?state.r.slice(-k):[]);open=ids.filter(id=>!recent.has(id));}
 return shuffle(open,rand).slice(0,count);
}
function markIn(state:{s:string[];r:string[]},id:string){if(!state.s.includes(id))state.s.push(id);state.r=[...state.r.filter(x=>x!==id),id].slice(-RECENT_N);}
export type VisitTopic={id:string;question:string;answer:string;followUp?:{question:string;answer:string}};
export type VisitPlan={opener:string;returning:boolean;topics:VisitTopic[];challenge:NpcChallenge|null};
type Opts={book?:NpcFreshBook;store?:FreshStore;rand?:()=>number;count?:number};
const topicPool=(npc:Pick<NpcDefinition,'topics'>,fresh:NpcFresh):VisitTopic[]=>[...(npc.topics??[]),...fresh.topics.map((t:FreshTopic)=>({...t,id:`f:${t.id}`}))];
/**
 * Plan one visit, called once when a chat opens. The opener (base greeting + persona lines + fresh openers, never the last one;
 * the very first chat keeps the plain greeting) or, once several topics were asked, a returning line naming one of them (at most
 * once per visit, alternating with openers); a rotating set of unseen topics; and an unseen challenge for the chip, if any.
 */
export function planNpcVisit(npc:Pick<NpcDefinition,'id'|'area'|'greeting'|'lines'|'topics'>,opts:Opts={}):VisitPlan{
 const store=opts.store??localStore,rand=opts.rand??Math.random,fresh=freshPool(npc,opts.book);
 const mem=load(store),n=mem.n[npc.id]??(mem.n[npc.id]={});
 const pool=topicPool(npc,fresh),byId=new Map(pool.map(t=>[t.id,t]));
 const topicIds=pickFresh(pool.map(t=>t.id),slot(mem,npc.id,'t'),opts.count??TOPICS_PER_VISIT,rand);
 const challenges=new Map(fresh.challenges.map(c=>[c.id,c]));
 const challengeId=pickFresh([...challenges.keys()],slot(mem,npc.id,'c'),1,rand)[0];
 const asked=(slot(mem,npc.id,'t').s).map(id=>byId.get(id)).filter((t):t is VisitTopic=>!!t);
 let opener:string,returning=false;
 if(asked.length>=RETURNING_AFTER&&fresh.returning.length&&!n.lr){
  const lines=new Map(fresh.returning.map(line=>[lineId(line),line])),pick=pickFresh([...lines.keys()],slot(mem,npc.id,'r'),1,rand)[0];
  markIn(slot(mem,npc.id,'r'),pick);
  opener=lines.get(pick)!.replace(/\{topic\}/g,asked[Math.floor(rand()*asked.length)].question);returning=true;n.lr=1;
 }else{
  const lines=new Map([...npcOpeners(npc),...fresh.openers].map(line=>[lineId(line),line])),o=slot(mem,npc.id,'o');
  const pick=o.r.length?pickFresh([...lines.keys()].filter(id=>id!==o.r.at(-1)||lines.size<2),o,1,rand)[0]:lineId(npc.greeting);
  markIn(o,pick);opener=lines.get(pick)??npc.greeting;delete n.lr;
 }
 save(store,mem);
 return {opener,returning,topics:topicIds.map(id=>byId.get(id)!),challenge:challengeId?challenges.get(challengeId)!:null};
}
/** A topic (or challenge) was asked / answered: never offer it again until the pool is used up. */
export function markFreshSeen(npcId:string,kind:'topic'|'challenge',id:string,store:FreshStore=localStore){
 const mem=load(store);markIn(slot(mem,npcId,kind==='topic'?'t':'c'),id);save(store,mem);
}
/** One challenge answer. First wrong answer may retry once; the second wrong answer reveals the right one. */
export function answerChallenge(c:NpcChallenge,choice:number,tries:number):{correct:boolean;text:string;done:boolean}{
 const correct=choice===c.correct;
 if(correct)return {correct,text:c.right,done:true};
 return tries>=1?{correct,text:`${c.wrong} The answer is “${c.options[c.correct]}”.`,done:true}:{correct,text:c.wrong,done:false};
}
export const dayKey=(now=new Date())=>`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
/**
 * A challenge was won: true at most once per NPC per day, so the chat may hand off to the existing reward path (earnForNpc, which
 * keeps its own per-NPC and daily card caps). Winning again the same day only teaches.
 */
export function claimChallengeReward(npcId:string,now=new Date(),store:FreshStore=localStore):boolean{
 const mem=load(store),d=dayKey(now);if(!mem.rw||mem.rw.d!==d)mem.rw={d,ids:[]};
 if(mem.rw.ids.includes(npcId))return false;mem.rw.ids.push(npcId);save(store,mem);return true;
}
