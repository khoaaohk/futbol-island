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
 assert.match(town,/<WelcomeBack blocked=\{toastBlocked\|\|jobRunning\|\|jobCardShown\|\|actionFocus\} held=\{stackCovered\}\/>/,'the guide card waits while a job owns the stack, and its dwell pauses while the stack is covered');
 assert.match(town,/if\(jobActiveRef\.current!==!!a\)setJobRunning\(!!a\);jobActiveRef\.current=!!a;/,'Town re-renders only when a job starts or ends');assert.match(town,/jobCardOpen\.current=open;setJobCardShown\(open\);/);
 const land=css.slice(css.indexOf('@media (orientation:landscape) and (max-height:500px)'));
 assert(land.length>40,'landscape dock rule');assert.match(land,/\.card\[data-welcome-back\]\{position:absolute;top:0;left:calc\(50% - 50vw \+ 12px \+ env\(safe-area-inset-left,0px\)\)/,'docked at the left edge');
 assert.match(land,/max-height:calc\(100dvh[^;]*- 150px\);overflow:auto/,'stops above the stick');}
// Notes beside a docked job (Oct 15 2026, QA: the starter-coins note covered Stop job on a landscape phone). The landscape job
// panel docks top-left out of the column's flow, so while a job runs the toast slot docks top-right: the two docks never meet,
// and neither covers the screen centre (the player, ±40 px) at any landscape-phone width.
{const town=fs.readFileSync(path.resolve(__dirname,'../components/Town.tsx'),'utf8'),css=fs.readFileSync(path.resolve(__dirname,'../app/globals.css'),'utf8'),
  jobsCss=fs.readFileSync(path.resolve(__dirname,'../components/IslandJobs.module.css'),'utf8');
 assert.match(town,/<div className="hud-stack" data-hud-stack ref=\{setHudStackEl\} hidden=\{stackCovered\} data-job-running=\{jobRunning\|\|undefined\}>/,'Town marks the column while a job runs');
 const land=css.slice(css.indexOf('/* Notes beside a docked job'));
 const rule=land.match(/@media \(orientation:landscape\) and \(max-height:500px\)\{\s*\.town-app \.hud-stack\.hud-stack\.hud-stack\[data-job-running\]>\[data-hud-slot=toast\]\{([^}]*)\}/);
 assert(rule,'landscape: every toast-slot note docks while a job runs');
 assert.match(rule[1],/position:absolute;top:0;left:auto;right:calc\(50% - 50vw \+ 12px \+ env\(safe-area-inset-right,0px\)\)/,'docked at the right edge');
 assert.match(rule[1],/max-width:min\(270px,calc\(50vw - 120px\)\)/,'never reaches the centre');assert.match(rule[1],/- 150px\);overflow:auto/,'stops above the action buttons');
 assert.match(jobsCss,/>\.hud\[data-job-active\]\{position:absolute;top:0;left:calc\(50% - 50vw \+ 12px \+ env\(safe-area-inset-left,0px\)\);\s*width:min\(270px,calc\(50vw - 120px\)\)/,'the job panel docks left at the same width');
 // Selector specificity: the dock beats the column's generic (0,4,0) "position:relative;inset:auto" rule.
 assert.match(css,/\.town-app \.hud-stack\.hud-stack\.hud-stack>\*\{position:relative;inset:auto/);
 for(const vw of [568,667,736,844,852,932]){const w=Math.min(270,vw/2-120),job=[12,12+w],note=[vw-12-w,vw-12],centre=[vw/2-40,vw/2+40];
  assert(job[1]<=note[0],`${vw}px: the job dock and the note dock do not overlap`);assert(job[1]<=centre[0]&&note[0]>=centre[1],`${vw}px: both docks clear the centre`);}
 // Every note that can show while a job runs uses the toast slot (so the rule above covers it).
 for(const c of ['IslandJobs','CostumeMilestoneToast','RideUnlockToast','FuelToast','BeachcombHud'])assert.match(fs.readFileSync(path.resolve(__dirname,`../components/${c}.tsx`),'utf8'),/data-hud-slot="toast"/,`${c}'s note is in the toast slot`);}
// Welcome-back card is mounted once per showing (Oct 15 2026, QA: "element was detached from the DOM" on desktop-chromium): while
// blocked it is hidden, never unmounted and remounted as a new node, and nothing keys it.
{const card=fs.readFileSync(path.resolve(__dirname,'../components/WelcomeBack.tsx'),'utf8'),css=fs.readFileSync(path.resolve(__dirname,'../components/WelcomeBack.module.css'),'utf8');
 assert.match(card,/if\(!open\)return null;/,'only a finished showing unmounts it');assert.doesNotMatch(card,/if\(!open\|\|blocked\)return null/,'blocked no longer unmounts it');
 assert.match(card,/data-welcome-back hidden=\{blocked\}/,'blocked hides the same node');assert.doesNotMatch(card,/\bkey=/,'no key to re-mount it');
 assert.match(css,/\.card\[hidden\]\{display:none\}/,'hidden also outside the stack');
 assert.match(card,/navigator\.webdriver===true/,'e2e against a production build can hold the card; players cannot');}
// Top row on phones (Oct 23 2026, owner: "only show coins and energy"; docs/ui/HUD_STACK.md "Top row on phones"). Layout is
// measured headless by scripts/check-hud-row.cjs (5 phone sizes + desktop, flag on, gaps >= 8 px); these pin the CSS it relies on.
{const R=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
 const jobs=R('components/IslandJobs.tsx'),jcss=R('components/IslandJobs.module.css'),scss=R('components/IslandSettings.module.css'),g=R('app/globals.css'),fuel=R('components/FuelCount.module.css');
 assert.equal((jobs.match(/styles\.basketOnly\}`\} data-wallet-basket="(fish|fruit)"/g)||[]).length,2,'fish and fruit are the bar\'s phone-hidden counters');
 assert.match(jobs,/aria-label=\{`Your island pocket: \$\{wallet\.balance\} coins, \$\{fish\} fish, \$\{fruit\} fruit/,'the bar still names fish and fruit for screen readers');
 assert.match(jobs,/onClick=\{onOpenBalances\}/,'one tap opens the pocket, which lists fish and fruit');
 // Real iPhone (Oct 23 2026): the old 430 px breakpoint missed the 440 px iPhone 16/17 Pro Max; phones are now <= 480 (or a <= 480 device).
 assert.match(jcss,/@media\(max-width:480px\),\(max-height:480px\) and \(orientation:landscape\),\(max-device-width:480px\)\{\.wallet\[data-job-wallet\] \.basketOnly\{display:none\}/,'phones (portrait <= 480 wide, landscape <= 480 tall, or a <= 480 px device) show coins + energy only');
 assert.doesNotMatch(jcss,/max-width:430px\),\(max-height:430px\)/,'no leftover 430 px phone breakpoint');
 assert.doesNotMatch(jcss,/min-width:601px\) and \(pointer:fine\)\{[^\n]*basketOnly\{display:none/,'desktop keeps fish and fruit');
 assert.match(jcss,/data-coin-digits="4"\] b\{font-size:/,'a 4-digit balance steps down a size on narrow phones');
 assert.match(fuel,/@media\(max-width:400px\)\{:global\(\[data-job-wallet\]\) \.word\{display:none!important\}\}/,'the Low / Empty word gives way on narrow phones');
 // Owner (Oct 23 2026, final): desktop/tablet bar centred; on phones Paths + friends left, the bar right-aligned next to Settings,
 // bar <-> Settings gap = Paths <-> friends gap (one variable feeds both).
 assert.match(jcss,/\.wallet\[data-job-wallet\]\{left:50%;right:auto;[^}]*transform:translateX\(-50%\)/,'desktop / tablet: the island coins bar is centred on the screen');
 assert.match(jcss,/orientation:landscape\),\(max-device-width:480px\)\{[^\n]*\.wallet\[data-job-wallet\]\{[^}]*left:auto;right:calc\(18px \+ env\(safe-area-inset-right,0px\) \+ var\(--btn-icon,44px\) \+ var\(--island-hud-pair-gap,8px\)\);transform:none\}/,'phones: the bar sits one pair-gap left of Settings');
 assert.match(scss,/^\.triggers\{[^}]*gap:var\(--island-hud-pair-gap,8px\)\}/,'Paths <-> friends uses the same pair gap');
 assert.match(scss,/@media\(max-width:600px\),\(pointer:coarse\)\{\.triggers\{top:[^}]*right:calc\(18px \+ env\(safe-area-inset-right,0px\)\)\}\}/,'phone Settings sits 18 px from the right edge (the bar rule assumes it)');
 assert.match(g,/--island-hud-pair-gap:8px/,'the pair gap is one root variable');
 assert.match(scss,/@media\(max-width:340px\)\{\.triggers \[data-party-open\]\{position:absolute!important;left:0;top:calc\(var\(--island-hud-row-height,44px\) \+ 8px\)\}\}/,'<= 340 px: Play with friends drops under Paths');
 assert.match(g,/@media\(max-width:340px\)\{\.town-app:has\(nav\[data-hud-triggers\]>\[data-party-open\]\) \.hud-stack\{top:calc\(var\(--island-hud-row-top\) \+ 2 \* var\(--island-hud-row-height\) \+ 8px \+ var\(--island-hud-row-gap\)\)\}/,'<= 340 px with friends on: the stack starts under the friends button, still centred');}
// Pocket open (Oct 23 2026): the coins bar stays on screen above the drawer; the stack still hides.
{const R=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');const jobs=R('components/IslandJobs.tsx'),town=R('components/Town.tsx'),dcss=R('components/IslandBalanceDrawer.module.css');
 assert.match(town,/<IslandJobs onOpenBalances=\{\(\)=>setBalancesOpen\(true\)\} pocketOpen=\{balancesOpen\}/,'Town tells the jobs UI the pocket is open');
 assert.match(jobs,/if\(blocked\)return pocketOpen\?walletBtn:null;/,'blocked keeps only the coins bar while the pocket is open');
 assert.match(jobs,/aria-expanded=\{pocketOpen\} data-pocket-open/,'the bar shows as open');
 assert.match(dcss,/inset:var\(--pocket-top,0px\) 0 0 0/,'the drawer starts under the HUD row');
 assert.match(dcss,/--pocket-top:calc\(var\(--island-hud-row-top,16px\) \+ var\(--island-hud-row-height,44px\) \+ 8px\)/,'--pocket-top clears the row');
 assert.match(dcss,/\.dialog::backdrop\{background:transparent\}/,'the tint never covers the bar');
 assert.match(dcss,/dialog\[open\]\.dialog\[data-island-balances\]\{inset:var\(--pocket-top\) 0 0 0!important/,'the phone dialog rule (inset:0 !important) is overridden for the pocket');
 assert.match(town,/hud-stack" data-hud-stack ref=\{setHudStackEl\} hidden=\{stackCovered\}/,'the column itself still hides under the pocket');}
console.log('HUD_STACK_PASS');
