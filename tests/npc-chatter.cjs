// Ambient NPC chatter engine (lib/town/npcChatter.ts, Nov 1 2026): triggers, cooldowns, caps, banter order, seeded determinism, heat tier, no network.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
const src=fs.readFileSync('lib/town/npcChatter.ts','utf8');
const load=file=>{const mod={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:mod,exports:mod.exports,require:()=>({}),Math,Map,WeakMap,Array});return mod.exports;};
const {createNpcChatter,createChatterOut,CHATTER,poolFor}=load('lib/town/npcChatter.ts');
// cost never grows with players: no network, relay, storage or LLM in the engine; its only import is the shared type file
const imports=[...src.matchAll(/^import[^;]*from\s*'([^']+)'/gm)].map(m=>m[1]);assert.deepEqual(imports,['./npcChatterTypes'],'engine imports only the shared types');
assert.ok(!/fetch\(|WebSocket|XMLHttpRequest|localStorage|sessionStorage|indexedDB|multiplayer|relay|partykit|anthropic|openai/i.test(src.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm,'')),'no network, storage or LLM calls in the engine');
assert.ok(!/Math\.random/.test(src),'the pick is seeded, never Math.random');
const book={byNpc:{rosa:{near:['r1','r2','r3'],idle:['ri1','ri2']},sam:{near:['s1','s2'],idle:['si1']},kai:{near:['k1'],idle:['ki1']},lee:{near:['l1'],idle:['li1']}},byArea:{beach:{near:['b1','b2'],idle:['bi1']}},banter:[{id:'rs',a:'rosa',b:'sam',lines:['A1','B1','A2','B2']}]};
const actor=(id,x,z=0,area)=>({id,position:{x,y:0,z},routine:{mode:'rest',partner:null},definition:{area}});
const P=(over={})=>({x:0,y:0,z:0,speed:.5,canTrigger:true,blocked:false,quiet:false,tier:0,saver:false,...over});
const run=(eng,actors,seconds,input,onScreen=()=>true,log=[],dt=1/30)=>{const out=createChatterOut();for(let t=0;t<seconds;t+=dt){eng.step(dt,typeof input==='function'?input(t):input,actors,onScreen,out);for(let i=0;i<out.n;i++){const c=out.cmds[i];log.push({op:c.op,slot:c.slot,who:c.speaker&&c.speaker.id,text:c.text});}const on=eng.slots.filter(s=>s.on).length;assert.ok(on<=CHATTER.MAX,'never more than 2 bubbles');}return log;};
const shows=log=>log.filter(c=>c.op==='show'),nearShows=log=>shows(log).filter(c=>/^[rsklb][0-9]$/.test(c.text));
// near: slow for 0.6 s within 5 m -> one thought from the NPC's own pool
{const e=createNpcChatter(book,7),r=actor('rosa',3);let log=run(e,[r],.5,P());assert.equal(shows(log).length,0,'not before 0.6 s of slow travel');log=run(e,[r],.5,P());assert.equal(shows(log).length,1,'slow near -> a thought');assert.ok(book.byNpc.rosa.near.includes(shows(log)[0].text),'from the near pool');
 // per-NPC cooldown ~20 s, then again
 log=run(e,[r],15,P());assert.equal(shows(log).length,0,'per-NPC cooldown holds');log=run(e,[r],6,P());assert.equal(shows(log).length,1,'after ~20 s the NPC can think again');}
// fast, swimming / flying (canTrigger false), too far, off screen: no near thought
{const r=actor('rosa',3);for(const [label,input,os] of [['fast',P({speed:3})],['swim',P({canTrigger:false})],['offscreen',P(),()=>false]])assert.equal(nearShows(run(createNpcChatter(book,1),[r],3,input,os)).length,0,label+' -> nothing');
 assert.equal(nearShows(run(createNpcChatter(book,1),[actor('rosa',6)],3,P())).length,0,'over 5 m -> no near thought');}
// global cooldown: two NPCs near, the second starts >= 4 s after the first
{const e=createNpcChatter(book,3),out=createChatterOut(),actors=[actor('rosa',2),actor('sam',-2)],at=[];for(let t=0;t<8;t+=1/30){e.step(1/30,P(),actors,()=>true,out);for(let i=0;i<out.n;i++)if(out.cmds[i].op==='show')at.push(t);}
 assert.equal(at.length,2,'both get a turn');assert.ok(at[1]-at[0]>=CHATTER.GLOBAL_COOLDOWN-.05,'global cooldown ~4 s');}
// banter: a social pair trades lines a,b,a,b in ONE slot, authored speaker first
{const e=createNpcChatter(book,5),r=actor('rosa',8),s=actor('sam',10);r.routine.mode=s.routine.mode='social';r.routine.partner='sam';s.routine.partner='rosa';
 const log=shows(run(e,[s,r],14,P({speed:4})));assert.deepEqual(log.map(c=>c.text),['A1','B1','A2','B2'],'banter lines in order');assert.deepEqual(log.map(c=>c.who),['rosa','sam','rosa','sam'],'banter alternates a / b');assert.ok(log.every(c=>c.slot===log[0].slot),'banter holds one slot');}
// banter without an authored pair: each says an idle line (2 lines); an unknown pair with no pools says nothing
{const e=createNpcChatter(book,5),k=actor('kai',8),l=actor('lee',9);k.routine.mode=l.routine.mode='social';k.routine.partner='lee';l.routine.partner='kai';assert.deepEqual(shows(run(e,[k,l],8,P({speed:4}))).map(c=>c.text),['ki1','li1'],'fallback banter alternates idle lines');
 const x=actor('x',8),y=actor('y',9);x.routine.mode=y.routine.mode='social';x.routine.partner='y';y.routine.partner='x';assert.equal(shows(run(createNpcChatter(book,5),[x,y],8,P({speed:4}))).length,0,'no pool -> nothing');}
// only NPCs within ~16 m are considered (idle and banter too)
{const e=createNpcChatter(book,9),far=[actor('rosa',20),actor('sam',30)];far[0].routine.mode=far[1].routine.mode='social';far[0].routine.partner='sam';far[1].routine.partner='rosa';assert.equal(shows(run(e,far,120,P({speed:4}))).length,0,'nothing beyond 16 m');}
// idle mumbles are rare but happen; fallback byNpc -> byArea -> nothing
{const log=shows(run(createNpcChatter(book,11),[actor('beachy',10,0,'beach')],600,P({speed:4})));assert.ok(log.length>=3&&log.length<=60,'idle is occasional, got '+log.length);assert.ok(log.every(c=>c.text==='bi1'),'area pool fallback');
 assert.equal(poolFor(book,actor('nobody',0),'near'),null,'no pool -> nothing');assert.equal(poolFor(book,actor('rosa',0,0,'beach'),'near'),book.byNpc.rosa.near,'own pool before area');}
// seeded determinism: same seed, same script -> same lines
{const script=seed=>{const a=[actor('rosa',2),actor('sam',-3),actor('beachy',9,0,'beach')];return JSON.stringify(run(createNpcChatter(book,seed),a,300,t=>P({speed:t%40<20?.4:4})));};assert.equal(script(42),script(42),'deterministic per seed');}
// heat tier 2+ / Battery saver: a single bubble, near only (no banter, no idle)
{for(const input of [P({tier:2,speed:4}),P({saver:true,speed:4})]){const r=actor('rosa',8),s=actor('sam',10);r.routine.mode=s.routine.mode='social';r.routine.partner='sam';s.routine.partner='rosa';assert.equal(shows(run(createNpcChatter(book,5),[r,s,actor('beachy',9,0,'beach')],200,input)).length,0,'no banter / idle at tier 2+');}
 const e=createNpcChatter(book,3),out=createChatterOut(),actors=[actor('rosa',2),actor('sam',-2)];let peak=0;for(let t=0;t<30;t+=1/30){e.step(1/30,P({tier:2}),actors,()=>true,out);peak=Math.max(peak,e.slots.filter(s=>s.on).length);}assert.equal(peak,1,'one bubble at tier 2');}
// blocked (lesson, quiz, menu, chat, match): everything hides, nothing starts
{const e=createNpcChatter(book,7),r=actor('rosa',3);run(e,[r],1.2,P());assert.ok(e.slots[0].on);const log=run(e,[r],10,P({blocked:true}));assert.ok(!e.slots.some(s=>s.on)&&log.some(c=>c.op==='hide')&&shows(log).length===0,'blocked hides and holds');}
// bubbles last ~3-4 s; the command buffer is reused (no per-frame allocation of commands)
{const e=createNpcChatter(book,7),out=createChatterOut(),cmds=out.cmds,first=cmds[0],r=actor('rosa',3);let on=0;for(let t=0;t<10;t+=1/30){e.step(1/30,P({speed:3}),[r],()=>true,out);if(t<1)e.step(0,P(),[r],()=>true,out);}
 const e2=createNpcChatter(book,7);for(let t=0;t<12;t+=1/30){e2.step(1/30,t<.9?P():P({speed:3}),[r],()=>true,out);if(e2.slots[0].on)on+=1/30;}assert.ok(on>=3&&on<=4.2,'bubble lasts ~3.6 s, got '+on.toFixed(2));assert.equal(out.cmds,cmds);assert.equal(out.cmds[0],first,'commands are pooled');}
console.log('NPC chatter: near trigger, slow hold, cooldowns (NPC 20 s, global 4 s), 16 m range, on-screen, banter a/b, fallbacks, idle rarity, seeded determinism, heat tier cap, blocked, no network passed.');
