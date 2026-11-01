// Fresh NPC chats (Nov 1 2026, lib/town/npcFreshPicker.ts): no repeats until a pool is used up, reset without back-to-back
// repeats, a per-NPC-per-day challenge reward, works with an empty FRESH, no network, storage failures tolerated.
const fs=require('fs'),path=require('path'),ts=require('typescript'),assert=require('node:assert/strict');const cache=new Map();
function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);new Function('exports','module','require',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,spec=>{if(spec.startsWith('.')){const base=path.resolve(path.dirname(file),spec);for(const f of [base+'.ts',base+'.tsx',base])if(fs.existsSync(f))return load(f);}return require(spec);});cache.set(file,m.exports);return m.exports;}
const P=load('lib/town/npcFreshPicker.ts');
const src=fs.readFileSync('lib/town/npcFreshPicker.ts','utf8');
let seed=7;const rand=()=>((seed=(seed*16807)%2147483647)/2147483647);
const mem=()=>{let v=null;return {get:()=>v,set:x=>{v=x;}};};
const T=(id)=>({id,question:`Q ${id}?`,answer:`A ${id}.`});
const npc={id:'kid',area:'square',greeting:'Hello!',lines:['Line one.','Line two.'],topics:[{...T('b1'),followUp:{question:'F?',answer:'F.'}}]};
const ch=id=>({id,prompt:`P ${id}`,options:['x','y','z'],correct:2,right:'Right.',wrong:'Wrong.'});
const book={byNpc:{kid:{topics:['f1','f2','f3','f4','f5','f6'].map(T),challenges:[ch('c1'),ch('c2'),ch('c3')],openers:['Fresh hi.','Fresh hey.'],returning:['You asked “{topic}” before!','Back again after “{topic}”?']}},byArea:{square:{topics:[T('a1')],challenges:[ch('ac')],openers:['Area hi.'],returning:[]}}};

// ---- No topic repeats until the whole pool (base + fresh = 7) was asked; then reset with no immediate repeats.
{P.resetFreshCache();const store=mem();const seen=[];let guard=0;
 while(seen.length<7&&guard++<20){const plan=P.planNpcVisit(npc,{book,store,rand});assert(plan.topics.length>=1&&plan.topics.length<=3);
  for(const t of plan.topics){assert(!seen.includes(t.id),`topic ${t.id} repeated before the pool was used up`);seen.push(t.id);P.markFreshSeen('kid','topic',t.id,store);}}
 assert.equal(new Set(seen).size,7,'every topic of the pool offered once');
 const last=seen.slice(-P.RECENT_N),after=P.planNpcVisit(npc,{book,store,rand});
 assert.equal(after.topics.length,3,'pool reset offers a full set again');
 const k=Math.min(P.RECENT_N,7-3);for(const t of after.topics)assert(!last.slice(-k).includes(t.id),`reset avoids the most recent topics (${t.id})`);
 assert(after.topics.some(t=>t.id==='b1')||seen.includes('b1'),'base topics are part of the pool');
 assert(seen.includes('f:f1'),'fresh topics are namespaced');}

// ---- Openers: first chat keeps the greeting, never the same opener twice in a row; returning line once several topics asked.
{P.resetFreshCache();const store=mem();const first=P.planNpcVisit(npc,{book,store,rand});assert.equal(first.opener,'Hello!','first chat uses the greeting');
 let prev=first.opener;const shown=new Set([prev]);
 for(let i=0;i<30;i++){const p=P.planNpcVisit(npc,{book,store,rand});assert.notEqual(p.opener,prev,`opener repeated back to back (${p.opener})`);if(i<4)assert(!shown.has(p.opener),'no opener repeat until all five were shown');shown.add(p.opener);prev=p.opener;}
 assert.equal(shown.size,5,'greeting + 2 lines + 2 fresh openers all used');
 P.markFreshSeen('kid','topic','b1',store);P.markFreshSeen('kid','topic','f:f2',store);
 const r1=P.planNpcVisit(npc,{book,store,rand});assert(r1.returning,'returning line once several topics asked');
 assert(/“Q (b1|f2)\?”/.test(r1.opener),`{topic} filled with an asked question: ${r1.opener}`);
 const r2=P.planNpcVisit(npc,{book,store,rand});assert(!r2.returning,'returning never twice in a row (at most once per visit)');}

// ---- Challenges: unseen first, every one before any repeat; answers teach and allow one retry.
{P.resetFreshCache();const store=mem();const got=[];
 for(let i=0;i<3;i++){const c=P.planNpcVisit(npc,{book,store,rand}).challenge;assert(c&&!got.includes(c.id),'unseen challenge offered');got.push(c.id);P.markFreshSeen('kid','challenge',c.id,store);}
 const again=P.planNpcVisit(npc,{book,store,rand}).challenge;assert(again&&again.id!==got[2],'challenge pool resets without an immediate repeat');
 const c=ch('q');assert.deepEqual(P.answerChallenge(c,2,0),{correct:true,text:'Right.',done:true});
 assert.deepEqual(P.answerChallenge(c,0,0),{correct:false,text:'Wrong.',done:false},'first wrong answer allows a retry');
 const second=P.answerChallenge(c,1,1);assert(second.done&&/The answer is “z”/.test(second.text),'second wrong answer reveals the answer');}

// ---- Daily reward cap: once per NPC per day, again the next day.
{P.resetFreshCache();const store=mem(),d1=new Date(2026,10,1,10),d2=new Date(2026,10,2,9);
 assert.equal(P.claimChallengeReward('kid',d1,store),true);assert.equal(P.claimChallengeReward('kid',d1,store),false,'cannot be farmed the same day');
 assert.equal(P.claimChallengeReward('other',d1,store),true,'per NPC');assert.equal(P.claimChallengeReward('kid',d2,store),true,'next day pays again');}

// ---- Fallbacks: area pool, then base content only (empty FRESH).
{P.resetFreshCache();const store=mem(),townie={...npc,id:'townie'};
 const a=P.planNpcVisit(townie,{book,store,rand});assert(a.topics.every(t=>['b1','f:a1'].includes(t.id))&&a.challenge?.id==='ac','area fallback pool');
 const none={byNpc:{},byArea:{}},b=P.planNpcVisit({...npc,id:'solo',area:undefined},{book:none,store,rand});
 assert.deepEqual(b.topics.map(t=>t.id),['b1']);assert.equal(b.challenge,null);assert.equal(b.opener,'Hello!');
 for(let i=0;i<5;i++)assert(P.planNpcVisit({...npc,id:'solo'},{book:none,store,rand}).opener,'base openers rotate with FRESH empty');
 assert(P.planNpcVisit({...npc,id:'nobook'},{book:{},store,rand}).opener,'malformed book tolerated');}

// ---- Storage failures: throwing get/set and corrupt JSON still work (in-memory copy keeps the session fresh).
{P.resetFreshCache();const bad={get(){throw new Error('blocked');},set(){throw new Error('full');}};
 const p1=P.planNpcVisit(npc,{book,store:bad,rand}),p2=P.planNpcVisit(npc,{book,store:bad,rand});assert.notEqual(p1.opener,p2.opener,'fresh in-session without storage');
 P.markFreshSeen('kid','topic','b1',bad);assert.equal(P.claimChallengeReward('kid',new Date(),bad),true);
 P.resetFreshCache();const corrupt={get:()=>'{oops',set(){}};assert.equal(P.planNpcVisit(npc,{book,store:corrupt,rand}).opener,'Hello!','corrupt save starts fresh');
 P.resetFreshCache();const old={get:()=>JSON.stringify({v:0,n:{kid:'x'}}),set(){}};assert.equal(P.planNpcVisit(npc,{book,store:old,rand}).opener,'Hello!','other versions ignored');}

// ---- Saved data stays small and versioned; no network or server imports; the shipped book works too.
{P.resetFreshCache();const store=mem();for(let i=0;i<40;i++){const p=P.planNpcVisit(npc,{book,store,rand});p.topics.forEach(t=>P.markFreshSeen('kid','topic',t.id,store));}
 const saved=JSON.parse(store.get());assert.equal(saved.v,1);assert(store.get().length<600,`small save (${store.get().length} bytes)`);
 assert.equal(P.FRESH_STORAGE_KEY,'fi2-npc-fresh-v1');}
for(const f of ['lib/town/npcFreshPicker.ts','lib/town/npcFresh.ts','lib/town/npcFreshTypes.ts'])assert(!/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|supabase|from '@\/lib\/(api|server)/.test(fs.readFileSync(f,'utf8')),`${f}: no network`);
assert(!/^import (?!type)[^;]*from '(?!\.\/(npcFresh|npcOpeners)')/m.test(src),'picker imports only the content and openers');
{const {NPC_DIALOGUES}=load('lib/town/npcDialogues.ts');P.resetFreshCache();const store=mem();
 for(const n of NPC_DIALOGUES){const p=P.planNpcVisit(n,{store});assert(typeof p.opener==='string'&&p.opener.length,`${n.id} opener`);for(const t of p.topics)assert(t.question&&t.answer,`${n.id} topic`);}}
const ui=fs.readFileSync('components/NpcConversation.tsx','utf8');
assert.match(ui,/planNpcVisit\(npc\)/);assert.match(ui,/claimChallengeReward\(npc\.id\)\)won\.current=npc\.id/,'challenge reward via earnForNpc only');
assert(!/earnCardOffer|creditOnce/.test(ui),'no new economy path in the chat');
console.log('PASS npc fresh picker: no repeats until exhausted, reset, openers, returning, challenges, daily cap, fallbacks, storage failures');
