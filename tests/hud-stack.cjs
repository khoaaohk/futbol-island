// HUD stack arbiter (lib/ui/hudStack.ts, docs/ui/HUD_STACK.md): precedence, context rules, hysteresis, toast queue/merge.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const file=path.resolve(__dirname,'../lib/ui/hudStack.ts');
const mod={exports:{}};new Function('exports','module',ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(mod.exports,mod);
const {createFocusArbiter,eligible,pushToast,toastDuration,FOCUS_TIER,WORLD_ANCHORED}=mod.exports;
const walk={ridingTruck:false,flying:false,jobActive:false,inGarden:false};
const pick=(a,c,ctx=walk,now=0)=>a.choose(c,ctx,now)?.kind??null;

// ---- Precedence: ride > job sign > nearest proximity action > Spot it > hint > Learn Plays ----
{const a=createFocusArbiter();
 assert.equal(pick(a,[{kind:'learn',distance:Infinity},{kind:'hint',distance:0}]),'hint','a ball hint outranks the ambient Learn card');
 a.reset();assert.equal(pick(a,[{kind:'learn',distance:Infinity},{kind:'spot',distance:0},{kind:'hint',distance:0}]),'spot','Spot it outranks the hint');
 a.reset();assert.equal(pick(a,[{kind:'hint',distance:0},{kind:'talk',key:'hugo',distance:4}]),'talk','action beats information');
 a.reset();assert.equal(pick(a,[{kind:'talk',key:'maya',distance:3},{kind:'learn',distance:Infinity}]),'talk','a pitch with an NPC: talking is the nearer target');
 a.reset();assert.equal(pick(a,[{kind:'talk',key:'hugo',distance:2},{kind:'job-offer',key:'farm-harvest',distance:3}]),'job-offer','a job sign ranks with the job panel, above Talk');
 a.reset();assert.equal(pick(a,[{kind:'enter',key:'coaches',distance:5},{kind:'talk',key:'andre',distance:2.5}]),'talk','nearest proximity action wins');
 a.reset();assert.equal(pick(a,[{kind:'enter',key:'coaches',distance:-1},{kind:'talk',key:'andre',distance:1}]),'enter','desktop hover (explicit intent) wins its tier');
 a.reset();assert.equal(pick(a,[{kind:'enter',key:'konbini',distance:3},{kind:'hint',distance:0}]),'enter','near a door, Enter wins over the ball hint');
 a.reset();assert.equal(pick(a,[]),null);
 assert(FOCUS_TIER['hop-off']<FOCUS_TIER.talk&&FOCUS_TIER.talk<FOCUS_TIER.spot&&FOCUS_TIER.spot<FOCUS_TIER.hint&&FOCUS_TIER.hint<FOCUS_TIER.learn);
 assert(WORLD_ANCHORED.has('enter')&&WORLD_ANCHORED.has('fish')&&!WORLD_ANCHORED.has('talk'));}

// ---- Context rules ----
{const a=createFocusArbiter(),busy=[{kind:'talk',key:'x',distance:1},{kind:'hint',distance:0},{kind:'learn',distance:Infinity},{kind:'enter',key:'arcade',distance:2}];
 assert.equal(pick(a,[...busy,{kind:'hop-off',distance:0}],{...walk,ridingTruck:true}),'hop-off','in a truck: Hop off first');
 a.reset();assert.equal(pick(a,busy,{...walk,ridingTruck:true}),null,'in a truck nothing else competes');
 a.reset();assert.equal(pick(a,[...busy,{kind:'land-truck',distance:0}],{...walk,flying:true}),'land-truck','flying over a truck: Land on truck');
 a.reset();assert.equal(pick(a,[{kind:'talk',key:'x',distance:1},{kind:'fish',distance:1},{kind:'learn',distance:Infinity}],{...walk,flying:true}),'learn','flying: no ground prompts (Talk, Fish)');
 assert.equal(eligible('enter',{...walk,flying:true}),true,'doors are fly-in destinations');
 assert.equal(eligible('vending',{...walk,flying:true}),true,'vending machines are fly-in destinations');
 a.reset();assert.equal(pick(a,busy,{...walk,jobActive:true}),null,'in a job: the job panel owns the stack');
 a.reset();assert.equal(pick(a,[{kind:'learn',distance:Infinity},{kind:'talk',key:'hugo',distance:9}],{...walk,inGarden:true}),'talk');
 a.reset();assert.equal(pick(a,[{kind:'learn',distance:Infinity}],{...walk,inGarden:true}),null,'in the garden: no Learn Plays card');}

// ---- Hysteresis: no flicker between two near targets ----
{const a=createFocusArbiter({margin:1.5,holdMs:300});
 assert.equal(pick(a,[{kind:'talk',key:'a',distance:3},{kind:'talk',key:'b',distance:3.4}],walk,0),'talk');
 assert.equal(a.current.key,'a');
 // b creeps closer but not by the margin: a stays
 for(let t=150,d=2.9;t<=900;t+=150,d-=.1)a.choose([{kind:'talk',key:'a',distance:3},{kind:'talk',key:'b',distance:d}],walk,t);
 assert.equal(a.current.key,'a','a challenger less than 1.5 m closer does not steal the focus');
 a.choose([{kind:'talk',key:'a',distance:4},{kind:'talk',key:'b',distance:2.2}],walk,1050);
 assert.equal(a.current.key,'b','1.5 m closer switches');
 // alternating distances around the midpoint never flips it back and forth
 let flips=0,last=a.current.key;for(let i=0;i<20;i++){const t=1200+i*150,da=i%2?2.9:3.1,db=i%2?3.1:2.9;a.choose([{kind:'talk',key:'a',distance:da},{kind:'talk',key:'b',distance:db}],walk,t);if(a.current.key!==last){flips++;last=a.current.key;}}
 assert.equal(flips,0,'jitter at the midpoint does not flicker');
 // a one-tick dropout keeps the choice (a door projecting behind the camera for a frame)
 a.reset();pick(a,[{kind:'enter',key:'arcade',distance:3},{kind:'learn',distance:Infinity}],walk,0);
 assert.equal(pick(a,[{kind:'learn',distance:Infinity}],walk,150),'enter','held through a short dropout');
 assert.equal(pick(a,[{kind:'learn',distance:Infinity}],walk,500),'learn','released after the hold');
 // but a stronger arrival is never held back by the hold
 a.reset();pick(a,[{kind:'talk',key:'x',distance:2}],walk,0);
 assert.equal(pick(a,[{kind:'hop-off',distance:0}],{...walk,ridingTruck:true},150),'hop-off');
 // a lower tier replaces at once
 a.reset();pick(a,[{kind:'learn',distance:Infinity}],walk,0);assert.equal(pick(a,[{kind:'learn',distance:Infinity},{kind:'talk',key:'x',distance:5.9}],walk,150),'talk');}

// ---- Toasts: one at a time, short queue, merged picks ----
{const pickNote=(n=1)=>({title:`+${n} Strawberry`,detail:'Strawberries grow low …',merge:'pick:strawberry',retitle:k=>`+${k} Strawberry`});
 let q=[];q=pushToast(q,pickNote());q=pushToast(q,{...pickNote(),detail:'Sell produce to Rosa'});q=pushToast(q,pickNote());
 assert.equal(q.length,1,'rapid picks of one crop merge into the note on screen');
 assert.equal(q[0].title,'+3 Strawberry');assert.equal(q[0].detail,'Strawberries grow low …','the first pick keeps teaching its lesson');
 q=pushToast(q,{title:'+12 coins · You passed',detail:'Learning pays in full'});
 q=pushToast(q,{title:'+1 Tomato',detail:'',merge:'pick:tomato',retitle:k=>`+${k} Tomato`});
 q=pushToast(q,{title:'+1 Tomato',detail:'',merge:'pick:tomato',retitle:k=>`+${k} Tomato`});
 assert.deepEqual(q.map(t=>t.title),['+3 Strawberry','+12 coins · You passed','+2 Tomato'],'waiting notes of one kind merge too');
 q=pushToast(q,{title:'A'});q=pushToast(q,{title:'B'});
 assert.equal(q.length,3,'the queue is short');assert.equal(q[0].title,'+3 Strawberry','the note on screen is never dropped');
 assert.deepEqual(q.map(t=>t.title),['+3 Strawberry','A','B'],'oldest waiting notes are dropped first');
 assert.equal(toastDuration(0),5200);assert(toastDuration(2)<toastDuration(0),'a queue drains faster');}

// ---- The stack wiring is in place (and the old piecemeal rules are gone) ----
{const css=fs.readFileSync(path.resolve(__dirname,'../app/globals.css'),'utf8'),town=fs.readFileSync(path.resolve(__dirname,'../components/Town.tsx'),'utf8');
 assert.match(css,/\.hud-stack\{position:absolute;[^}]*top:calc\(var\(--island-hud-row-top\) \+ var\(--island-hud-row-height\) \+ var\(--island-hud-row-gap\)\)/,'the stack hangs one gap under the coins bar');
 for(const slot of ['task','focus','toast','guide'])assert.match(css,new RegExp(`\\[data-hud-slot=${slot}\\]\\{order:`));
 assert.doesNotMatch(css,/--island-toast-bottom|:has\(\.npc-talk-prompt\)|:has\(\.field-learn-card:not\(\[hidden\]\)\) \.npc-talk-prompt/,'the :has() offset chains are gone');
 assert.match(town,/focusArbiter\.choose\(/);assert.match(town,/if\(hudTick\)\{const cands/,'the arbiter runs on the existing HUD tick');
 assert.match(town,/if\(next!==hudFocusNow\)\{hudFocusNow=next;setHudFocus\(next\);\}/,'React state changes only when the focus does');
 for(const c of ['IslandJobs','CoinHuntHud','WelcomeBack','LearningHost','CostumeMilestoneToast','RideUnlockToast'])assert.match(fs.readFileSync(path.resolve(__dirname,`../components/${c}.tsx`),'utf8'),/<HudSlot>/,`${c} renders into the stack`);}
// Bug A5 (Deploy 11 audit): a coin note is on screen, then strawberry 1 (its lesson) and strawberry 2 arrive. The queued merge
// keeps the first pick's lesson; it used to fall back to the generic "Sell produce to Rosa" line and the lesson was lost.
{const berry=(detail)=>({title:'+1 Strawberry',detail,merge:'pick:strawberry',retitle:k=>`+${k} Strawberry`});
 let q=pushToast([],{title:'+12 coins',detail:'Learning pays in full'});q=pushToast(q,berry('Strawberries: vitamin C for recovery.'));q=pushToast(q,berry('Sell produce to Rosa at the farmers market stand.'));
 assert.equal(q.length,2);assert.equal(q[1].title,'+2 Strawberry');assert.equal(q[1].detail,'Strawberries: vitamin C for recovery.','the queued merge keeps the first pick\'s lesson');
 q=pushToast(q,berry('Sell produce to Rosa at the farmers market stand.'));assert.equal(q[1].title,'+3 Strawberry');assert.match(q[1].detail,/vitamin C/);}
// Guide tier on landscape phones (Sep 30 2026): a running job (or an open job card) owns the stack, so the welcome-back card waits;
// in landscape it docks compactly at the top-left edge (same query and anchor as the docked job panel), never over the centre.
{const town=fs.readFileSync(path.resolve(__dirname,'../components/Town.tsx'),'utf8'),css=fs.readFileSync(path.resolve(__dirname,'../components/WelcomeBack.module.css'),'utf8');
 assert.match(town,/<WelcomeBack blocked=\{toastBlocked\|\|jobRunning\|\|jobCardShown\} held=\{stackCovered\}\/>/,'the guide card waits while a job owns the stack, and its dwell pauses while the stack is covered');
 assert.match(town,/if\(jobActiveRef\.current!==!!a\)setJobRunning\(!!a\);jobActiveRef\.current=!!a;/,'Town re-renders only when a job starts or ends');assert.match(town,/jobCardOpen\.current=open;setJobCardShown\(open\);/);
 const land=css.slice(css.indexOf('@media (orientation:landscape) and (max-height:500px)'));
 assert(land.length>40,'landscape dock rule');assert.match(land,/\.card\[data-welcome-back\]\{position:absolute;top:0;left:calc\(50% - 50vw \+ 12px \+ env\(safe-area-inset-left,0px\)\)/,'docked at the left edge');
 assert.match(land,/max-height:calc\(100dvh[^;]*- 150px\);overflow:auto/,'stops above the stick');}
console.log('HUD_STACK_PASS');
