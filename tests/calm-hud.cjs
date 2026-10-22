// Calm HUD pass (Oct 21 2026, user: "only show one at a time", "it's looking way too complicated"; docs/ui/HUD_STACK.md "Calm HUD").
// One transient message at a time with a priority queue (lib/ui/toastLane.ts), the dive's notes and find card in that lane, at most one
// card under the coins bar, the Breath pill never covered, short copy, icon-only actions with names, tap targets >= 44 px.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const load=(f,req=()=>({}))=>{const m={exports:{}};new Function('exports','module','require',ts.transpileModule(read(f),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText)(m.exports,m,req);return m.exports;};

// ---- R1: one transient message at a time, by priority ----
{let t=0;const realNow=performance.now;performance.now=()=>t;
 const {toastLane:L,TOAST_PRIORITY:P,WAIT_MS}=load('lib/ui/toastLane.ts',n=>n==='react'?{useSyncExternalStore:()=>false}:{});
 assert(P.card>P.payday&&P.payday>P.story&&P.story>P.swim&&P.swim>P.jobs,'blocking card > payday > story > hint/lesson > note');
 assert.equal(P['dive-note'],P.jobs,'the dive note is a plain note');
 L.reset();assert.equal(L.request('jobs'),true,'a free lane is taken');
 assert.equal(L.request('swim'),false,'a second note waits: never two at once');assert.equal(L.owner,'jobs');
 L.want('dive-note');L.release('jobs');
 assert.equal(L.request('dive-note'),false,'when the lane frees, a lower note does not jump the waiting lesson');
 assert.equal(L.request('swim'),true,'the waiting lesson goes first');L.release('swim');
 assert.equal(L.request('dive-note'),true,'then the note');L.release('dive-note');
 L.hold('card',true);assert.equal(L.request('reef'),false,'a blocking card holds the lane');assert.equal(L.held,true);
 L.hold('card',false);L.cancel('reef');assert.equal(L.request('jobs'),true,'free again once the card closes');L.release('jobs');
 L.want('swim');t+=WAIT_MS+1;assert.equal(L.request('jobs'),true,'a waiter that stopped asking is forgotten (bounded wait)');L.release('jobs');
 L.reset();performance.now=realNow;}

// ---- R1 wiring: every transient note uses the lane; the dive note and find card join it ----
{for(const f of ['components/SwimLessonToast.tsx','components/RayLessonToast.tsx','components/ReefHintToast.tsx','components/DiveHud.tsx','components/IslandJobs.tsx','components/FuelToast.tsx','components/BeachcombHud.tsx'])
  assert(/toastLane\.request\(/.test(read(f)),`${f} takes the one toast lane`);
 const hud=read('components/DiveHud.tsx');
 assert(hud.includes("toastLane.request('dive-note')")&&hud.includes("useToastLaneBusy('dive-note')"),'the dive note waits for the lane');
 assert(hud.includes("toastLane.hold('card'"),'the find card holds the lane while it shows');
 for(const f of ['components/SwimLessonToast.tsx','components/RayLessonToast.tsx','components/ReefHintToast.tsx'])assert(/toastLane\.want\(/.test(read(f)),`${f} queues by priority`);}

// ---- R2/R3: the top stack holds at most one card; the Breath pill is never covered ----
{const css=read('app/globals.css'),town=read('components/Town.tsx');
 assert(/:has\(>:is\(\[data-hud-slot=toast\],\[data-welcome-back\]\):not\(\[hidden\]\):not\(\[data-hud-exit\]\)\)>:is\(\.field-learn-card,\[data-coin-hint\]\)\{display:none\}/.test(css),'ambient cards step aside while a note or the welcome card shows');
 assert(/const actionFocus=/.test(town)&&/<WelcomeBack blocked=\{[^}]*actionFocus/.test(town),'the welcome card waits while an action prompt shows');
 assert(/\.town-app:has\(\.dive-breath:not\(\[hidden\]\)\) \.hud-stack\{top:calc\(env\(safe-area-inset-top,0px\) \+ 150px\)\}/.test(css),'while the Breath pill shows, the stack starts below it');
 const breathTop=+/\.dive-breath\{[^}]*top:calc\(env\(safe-area-inset-top,0px\) \+ (\d+)px\)/.exec(css)[1];assert(breathTop+42+12<=150,'a fixed 12 px gap under Breath');
 assert(/\.dive-msgs\{[^}]*top:calc\(env\(safe-area-inset-top,0px\) \+ 150px\)/.test(css),'dive notes sit where the stack starts');
 const fish=read('components/FishingHost.module.css');assert(/\.hud:has\(\[data-fish-tutorial\]\) \.message\{visibility:hidden\}/.test(fish),'the fishing tutorial step replaces the duplicate message');}

// ---- R4: short copy, no "tap to close" footers (the card is still the tap target) ----
{for(const f of ['components/SwimLessonToast.tsx','components/RayLessonToast.tsx','components/ReefHintToast.tsx','components/DiveHud.tsx'])
  assert(!/tap to close/i.test(read(f)),`${f}: no "tap to close" line`);
 const words=s=>s.trim().split(/\s+/).length;
 for(const [f,re] of [['lib/town/water/waterHud.ts',/SWIM_LESSON=\{title:'[^']*',text:'([^']*)'/]]){
  const text=re.exec(read(f))[1];assert(words(text)<=20,`${f}: the lesson fits two short lines (${words(text)} words)`);}}

// ---- Icon-only actions keep a name; round controls are >= 44 px ----
{const btn=read('components/JobActionButton.tsx');assert(/'aria-label':b\.label/.test(btn)&&/title/.test(btn),'icon-only job / water actions keep their name');
 const hud=read('components/DiveHud.tsx');for(const m of hud.matchAll(/<button [^>]*className="dive-[a-z-]+"[^>]*>/g))
  if(!/dive-card/.test(m[0]))assert(/aria-label=/.test(m[0]),'every icon-only dive button has an aria-label: '+m[0].slice(0,60));
 const css=read('app/globals.css');for(const sel of ['dive-depth-btn','dive-emote-btn'])
  for(const m of css.matchAll(new RegExp(`\\.${sel}\\{[^}]*?width:(\\d+)px;height:(\\d+)px`,'g')))assert(+m[1]>=44&&+m[2]>=44,`${sel} tap target >= 44 px (${m[1]}x${m[2]})`);}
{const hud=read('components/DiveHud.tsx'),css=read('app/globals.css');
 assert(!/dive-dart-btn|data-dive-dart/.test(hud+css),'the Dart button is gone (user, Oct 21 2026)');
 // Explore room layout (Oct 22 2026, user: "a grid of 4 up and down on the left, jetpack on the top right and emote bottom right. remove
 // the pink go up btn"; "the same size as the other btns", "same style as well"): every viewport.
 assert(css.includes('.town-app:has(.dive-depth) .dive-depth{left:var(--room-l1);right:auto;bottom:var(--room-r2)'),'▲ ▼ in the left grid column c1 (r1 / r2)');
 assert(css.includes('.travel-actions.travel-actions .travel-mode{position:fixed;z-index:9;right:var(--room-rr);bottom:calc(var(--room-rb) + var(--room-cell) + var(--room-gap))'),'Fly top right');
 assert(css.includes('.town-app:has(.dive-depth) .dive-emote{right:var(--room-rr);bottom:var(--room-rb)'),'Say hi bottom right');
 assert(css.includes('.minimap-toggle{position:fixed;z-index:9;left:var(--room-l1);right:auto;bottom:var(--room-r0)'),'the minimap toggle above ▲, the map above it');
 assert(!/\[data-job-action=surface\]/.test(css),'no Surface cell (hold ▲ at the top)');
 assert(/--room-cell:72px;--room-gap:12px/.test(css)&&/--room-cell:58px/.test(css),'one cell size: the island action size (72 desktop / 58 phone), 12 px gaps');
 assert(/:is\(\.dive-depth-btn,\.dive-emote-btn\)\{width:var\(--room-cell\)[^}]*border:3px solid #fff2cd[^}]*var\(--btn-grain\)[^}]*box-shadow:0 5px 0 var\(--room-edge\)/.test(css),'▲ ▼ and Say hi wear the island action button style');
 assert(!/\.dive-depth-btn\{[^}]*#2a6f79/.test(css),'the dark teal ▲ ▼ look is gone');
 const H=load('lib/town/water/waterHud.ts',()=>({}));assert.equal(H.REEF_BUTTONS_FLY.find(b=>b.slot==='ride').icon,'jetpack','the room\'s Fly button shows the jetpack');}
console.log('calm-hud: ok');
