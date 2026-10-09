// Holo foil (Oct 8 2026, docs/performance-guide.md "Holo foil card lab" and "Holo foil on the live cards"): the /card-lab route is dev-only, the PlayerCard /
// MiniCard flags default off and the live hosts opt in with cardFoil/miniFoil, the render loop stops at rest, WebGL falls back to the CSS foil, and
// every position maps to its teaching pattern. usage: node tests/holo-foil.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
/** Load a TS module in a sandbox: relative imports resolve to sibling .ts files; `stubs` stand in for packages. */
function load(file,{env={},stubs={},globals={}}={},cache=new Map()){
 const abs=path.join(ROOT,file);if(cache.has(abs))return cache.get(abs).exports;
 const out=ts.transpileModule(fs.readFileSync(abs,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 const mod={exports:{}};cache.set(abs,mod);
 const req=spec=>{if(spec in stubs)return stubs[spec];
  const target=spec.startsWith('@/')?path.join(ROOT,spec.slice(2)):spec.startsWith('.')?path.resolve(path.dirname(abs),spec):null;if(!target)throw new Error('unexpected import '+spec);
  if(target.endsWith('.json'))return JSON.parse(fs.readFileSync(target,'utf8'));
  return load(path.relative(ROOT,target)+'.ts',{env,stubs,globals},cache);};
 vm.runInNewContext(out,{exports:mod.exports,module:mod,require:req,process:{env},Math,Number,Object,Array,Error,URL,encodeURIComponent,performance:{now:()=>0},console,...globals});
 return mod.exports;
}

// 1. The lab route is dev-only: listed in LAB_ROUTES, guarded first thing, 404 in production.
{const notFound=()=>{const e=new Error('NEXT_NOT_FOUND');e.digest='NEXT_NOT_FOUND';throw e;};
 const prod=load('lib/dev/labRoutes.ts',{env:{NODE_ENV:'production'},stubs:{'next/navigation':{notFound}}});
 const dev=load('lib/dev/labRoutes.ts',{env:{NODE_ENV:'development'},stubs:{'next/navigation':{notFound}}});
 assert(prod.LAB_ROUTES.includes('/card-lab'),'/card-lab is a lab route');
 assert.throws(()=>prod.guardLabRoute(),/NEXT_NOT_FOUND/,'production builds answer 404');
 assert.doesNotThrow(()=>dev.guardLabRoute(),'next dev keeps the lab');
 const page=read('app/card-lab/page.tsx');
 assert.match(page,/export default function \w+\(\)\{guardLabRoute\(\);return <CardLab\/>;\}/,'the page calls guardLabRoute before rendering');
 assert.match(page,/robots:\{index:false,follow:false\}/,'not indexed');
 // Nothing in the game links to the lab.
 for(const dir of ['components','app','lib'])for(const f of fs.readdirSync(path.join(ROOT,dir),{recursive:true}).filter(f=>/\.(tsx?|css)$/.test(f))){
  const rel=path.join(dir,f);if(/card-lab|CardLab|labRoutes/.test(rel))continue;assert(!read(rel).includes("'/card-lab'")&&!read(rel).includes('"/card-lab"'),`${rel} does not link to the lab`);}}

// 2. The flags: the components still default OFF (a host opts in), and the live hosts opt in with the card's own foil
//    (Oct 8 2026: user approved). Uncollected cards stay plain.
{const card=read('components/PlayerCard.tsx'),mini=read('components/MiniCard.tsx');
 assert.match(card,/glint=0,holo=null,onHoloStats,tiltRef\}:PlayerCardProps/,'PlayerCard holo defaults to null');
 assert.match(card,/\{holo\?<HoloFoil [^\n]*fallback=\{<span className=\{styles\.foil\} aria-hidden="true"\/>\}\/>\n\s*:<span className=\{styles\.foil\} aria-hidden="true"\/>\}/,'without holo the CSS .foil renders as before');
 assert.match(card,/const HoloFoil=dynamic\(\(\)=>import\('\.\/HoloFoil'\),\{ssr:false\}\);/,'the WebGL code is code-split');
 assert(!/^import (?!type)[^\n]*'\.\/HoloFoil'/m.test(card),'no static import of HoloFoil');
 assert.match(card,/\{holo&&<p className=\{styles\.foilNote\}><b>\{foilNote\(holo\.pattern,coach\?'coach':undefined\)\.chip\}\.<\/b>/,'the back names the foil (coaches as coaches)');
 assert.match(mini,/className='',style,foil=null\}:MiniCardProps/,'MiniCard foil defaults to null');
 assert.match(mini,/\{foil&&<span className=\{holoStyles\.foil\}[^\n]*'--holo-k':foil\.intensity\?\?PATTERN_INTENSITY\[foil\.pattern\]/,'the mini foil carries the intensity');
 // Live hosts: the big card everywhere a collected card is shown, and the mini cards in the binder and the reveals.
 const live=[
  ['components/CardCollection.tsx',/compact holo=\{cardFoil\(lift\.name\)\}\n\s*blurb=\{PROFILES\[lift\.name\]/,'binder viewer'],
  ['components/CardCollection.tsx',/<PocketCard name=\{name\} number=\{entry\.number\} era=\{entry\.era\} got foil=\{miniFoil\(name\)\}\/>\n\s*<\/button>\n\s*:<button/,'collected binder pockets'],
  ['components/CardOffer.tsx',/onFlipChange=\{setFlipped\} holo=\{cardFoil\(chosen\)\}\/>/,'card offer reveal'],
  ['components/PositionGuide.tsx',/<PlayerCard compact onFlipChange=\{setFlipped\} holo=\{cardFoil\(detail\)\}/,'position guide'],
  ['components/VendingCardReveal.tsx',/className=\{styles\.card\} foil=\{miniFoil\(current\)\}\/>/,'vending card reveal'],
  ['components/MarketCardsSection.tsx',/className=\{styles\.big\} foil=\{miniFoil\(pending\.name\)\}\/>/,'market card'],
 ];
 for(const [f,re,what] of live)assert.match(read(f),re,`${what}: foil on`);
 const coll=read('components/CardCollection.tsx');
 assert.match(coll,/\$\{styles\.ghost\}`\} aria-label=\{`\$\{name\}, card \$\{entry\.number\}, \$\{entry\.roleLabel\}\. Not collected yet\. Show details`\} onClick=\{event=>liftCard\(name,event\.currentTarget\)\}>\n\s*<PocketCard name=\{name\} number=\{entry\.number\} era=\{entry\.era\} got\/>/,'uncollected pockets stay plain');
 assert.match(coll,/<div className=\{`\$\{styles\.cardHost\} \$\{styles\.ghostCard\}`\}>\n\s*\{PlayerCard&&<PlayerCard name=\{lift\.name\}[^\n]*compact\n/,'the uncollected (greyed) viewer card stays plain');
 // Tiny thumbnails (search results, backpack, onboarding, market list) stay plain.
 for(const f of ['components/Backpack.tsx','components/IslandOnboarding.tsx'])assert(!/foil=/.test(read(f)),`${f}: thumbnails plain`);
 assert.match(coll,/<MiniCard name=\{entry\.name\} number=\{entry\.number\} era=\{entry\.era\} got compact thumb\/>/,'search thumbnails plain');
 // The tilt handle and the stats hook stay lab-only.
 for(const f of fs.readdirSync(path.join(ROOT,'components'),{recursive:true}).filter(f=>/\.tsx$/.test(f))){
  if(f==='CardLab.tsx')continue;for(const m of read(path.join('components',f)).matchAll(/<(PlayerCard|MiniCard|PocketCard)\b[^>]*>/g))assert(!/\b(tiltRef|onHoloStats)=/.test(m[0]),`${f}: no lab hooks`);}}

// 2b. The user's settings: one intensity map (shield 0.70, the rest 1.00) used by both foils; a card's foil from its role and tier.
{const P=load('lib/graphics/holoFoil/patterns.ts');
 assert.equal(JSON.stringify(P.PATTERN_INTENSITY),'{"net":1,"shield":0.7,"lanes":1,"burst":1}');
 assert.match(read('components/HoloFoil.tsx'),/intensity=PATTERN_INTENSITY\[pattern\]/,'WebGL foil default');
 assert.match(read('components/HoloMiniFoil.module.css'),/opacity:calc\(\.85 \* var\(--holo-k,1\)\)/,'CSS foil scales by --holo-k');
 assert.match(read('components/CardLab.tsx'),/const intensity=intensityPick\?\?PATTERN_INTENSITY\[pattern\];/,'the lab slider starts at the game setting');
 const F=load('lib/town/cardFoil.ts',{stubs:{'../dev/devUnlockGate':{devUnlockHostAllowed:()=>false}},globals:{window:undefined,localStorage:undefined,Set,Map}});
 const cases={'Alisson':['net','elite'],'Virgil van Dijk':['shield','elite'],'Pedri':['lanes','elite'],'Lionel Messi':['burst','icon'],'William Saliba':['shield','regular'],'Kylian Mbappé':['burst','icon']};
 for(const [name,[pattern,tier]] of Object.entries(cases)){const f=F.cardFoil(name);assert.equal(f.pattern,pattern,name);assert.equal(f.tier,tier,name);assert.equal(f.intensity,P.PATTERN_INTENSITY[pattern]);}
 assert.equal(F.cardFoil('Pedri'),F.cardFoil('Pedri'),'one object per card (memoised pockets stay equal)');
 assert(Object.isFrozen(F.cardFoil('Pedri')));
 const coach=JSON.parse(read('lib/town/positionPlayers.json')).coach.current[0];assert.equal(F.cardFoil(coach).pattern,'lanes','coaches wear the passing lanes');
 // Every role has a short card-back line for 7v7 players, coaches included.
 for(const role of Object.keys(JSON.parse(read('lib/town/positionPlayers.json')))){const n=P.foilNote(P.patternForRole(role),role);
  assert(n.chip&&n.line.split(' ').length<=12&&/\.$/.test(n.line),`${role}: ${n.chip}. ${n.line}`);}
 assert.equal(P.foilNote('lanes','coach').chip,'Passing-lane foil: coach');}

// 2c. Readability: the foil never touches the text panel (name plate, role · nation, tag chip, bio).
{const sh=read('lib/graphics/holoFoil/shader.ts'),holo=read('components/HoloFoil.tsx');
 assert.match(sh,/delta\*=1\.-text;/,'shader: every foil term is zeroed over the text panel');
 assert.match(sh,/float keep=\(1\.-\.97\*fig\)\*\(1\.-text\);/);
 assert.match(holo,/text:\[textPanel\(offsetRect\(q\(`\.\$\{cardStyles\.plate\}`\),face\),offsetRect\(q\(`\.\$\{cardStyles\.bio\}`\),face\)\)\?\?none,none\]/,'one box from the plate through the bio');
 // Mini: one baked mask image per pattern and region, with the portrait hole and the plate cut inside it (one mask layer).
 const P=load('lib/graphics/holoFoil/patterns.ts');
 for(const p of P.HOLO_PATTERNS)for(const t of ['regular','elite']){const svg=decodeURIComponent(P.miniPatternUrl(p,t).replace('data:image/svg+xml,',''));
  assert.match(svg,/<linearGradient id='t'[^>]*><stop offset='\.735' stop-color='#fff'\/><stop offset='\.75' stop-color='#000'\/>/,`${p}/${t}: nothing below the picture window`);
  assert.match(svg,/<g mask='url\(#a\)'><g mask='url\(#b\)'>/,`${p}/${t}: hole and plate cut applied`);}
 assert.notEqual(P.miniPatternUrl('net','regular'),P.miniPatternUrl('net','icon'),'regular uses the edge band');
 assert.equal(P.miniPatternUrl('net','elite'),P.miniPatternUrl('net','icon'),'cached per region');
 assert.match(read('components/HoloMiniFoil.module.css'),/-webkit-mask:var\(--holo-mask\) 0 0\/100% 100% no-repeat;mask:var\(--holo-mask\) 0 0\/100% 100% no-repeat\}/,'a single mask layer');
 assert.match(read('components/MiniCard.tsx'),/miniPatternUrl\(foil\.pattern,foil\.tier\)/);}

// 2d. Binder heat (Oct 8 2026 A/B): small cards wear the foil only for Elite and Icon; the slide is scoped to the foiled card.
{const f=read('lib/town/cardFoil.ts');assert.match(f,/MINI_FOIL_TIERS:ReadonlySet<HoloTier>=new Set<HoloTier>\(\['elite','icon'\]\)/);
 const F=load('lib/town/cardFoil.ts',{stubs:{'../dev/devUnlockGate':{devUnlockHostAllowed:()=>false}},globals:{window:undefined,localStorage:undefined,Set,Map}});
 assert.equal(F.miniFoil('William Saliba'),null,'regular: plain mini card');assert.equal(F.miniFoil('Alisson'),F.cardFoil('Alisson'),'elite: foil');
 const css=read('components/HoloMiniFoil.module.css');assert.match(css,/:global\(\[data-holo\]\):hover>\.foil::before/,'hover scoped to foiled cards');
 assert(!/translate3d/.test(css),'no 3D transform at rest (no layer per foil)');}

// 3. The render loop: frames only while driven, one bounded glint, nothing at rest, nothing hidden.
{const L=load('lib/graphics/holoFoil/loop.ts');
 let now=0,next=1;const queue=new Map();const clock={raf:cb=>{const id=next++;queue.set(id,cb);return id;},caf:id=>queue.delete(id),now:()=>now};
 const step=(ms=16)=>{now+=ms;const due=[...queue];queue.clear();for(const [,cb] of due)cb(now);};
 const drawn=[],settled=[];const loop=L.createHoloLoop(clock,(pose,g)=>drawn.push(g),s=>settled.push(s));
 // Driven by the card's spring: draws in the caller's frame, schedules nothing of its own.
 for(let i=0;i<5;i++)loop.drive({rx:i,ry:i,px:0,py:0});
 assert.equal(drawn.length,5);assert.equal(queue.size,0,'driven frames schedule no rAF');
 loop.settle();assert.equal(settled.at(-1).lastInteractionFrames,5,'frames per interaction');
 for(let i=0;i<100;i++)step();assert.equal(drawn.length,5,'at rest nothing draws');
 // The arrival glint: bounded, then idle.
 loop.glint(1200);assert.equal(queue.size,1);let ticks=0;while(queue.size&&ticks<500){step();ticks++;}
 assert(ticks>=70&&ticks<=80,`glint ~1.2 s of frames (${ticks})`);assert.equal(queue.size,0,'no rAF after the glint');
 assert.equal(drawn.at(-1),-1,'the glint ends on a still frame');assert.equal(loop.stats().looping,false);
 assert(loop.stats().lastGlintFrames>=70);
 const before=drawn.length;for(let i=0;i<200;i++)step();assert.equal(drawn.length,before,'idle after the glint');
 // A drive cancels a running glint (one source of frames at a time).
 loop.glint(1200);step();loop.drive({rx:1,ry:1,px:0,py:0});assert.equal(queue.size,0,'driving cancels the glint loop');loop.settle();
 // Hidden: no frames; the pending glint waits for visibility, then plays once.
 loop.setVisible(false);const hid=drawn.length;loop.drive({rx:2,ry:2,px:0,py:0});loop.glint(1200);assert.equal(drawn.length,hid,'nothing drawn while hidden');assert.equal(queue.size,0);
 loop.setVisible(true);assert.equal(queue.size,1,'the arrival glint plays when the card comes into view');while(queue.size)step();
 loop.setVisible(false);loop.still();loop.setVisible(true);assert.equal(queue.size,0,'coming back into view draws one still frame, no loop');
 // Hiding mid-glint stops it.
 loop.glint(1200);step();loop.setVisible(false);assert.equal(queue.size,0,'hiding stops the glint');
 loop.dispose();loop.setVisible(true);loop.glint(1200);assert.equal(queue.size,0,'disposed loops never schedule');
 // PlayerCard drives the holo from its own spring frame and tells it when the spring sleeps or the card goes flat.
 const card=read('components/PlayerCard.tsx');
 assert.match(card,/if\(holoFoil\.current&&!flippedNow\.current\)holoFoil\.current\.draw\(\{rx:m\.rx,ry:local,px,py\}\);/,'drawn inside the spring frame');
 assert.match(card,/paint\(m\);holoFoil\.current\?\.settle\(\);return;\}\/\/ caught up: sleep/,'spring asleep: the holo settles');
 assert.match(card,/holoFoil\.current\?\.rest\(\);\},\[\]\);/,'halt puts the holo back to rest');
 const holo=read('components/HoloFoil.tsx');
 assert.match(holo,/new IntersectionObserver/,'pauses off-screen');assert.match(holo,/addEventListener\('visibilitychange',sync\)/,'pauses when hidden');
 assert(!/requestAnimationFrame\(/.test(holo.replace(/raf:cb=>requestAnimationFrame\(cb\)/,'')),'HoloFoil has no rAF of its own beyond the loop clock');}

// 4. WebGL fallback: no WebGL2, reduced motion, a lost or taken context, or a failed compile all show the CSS foil.
{const R=load('lib/graphics/holoFoil/renderer.ts',{globals:{performance:{now:()=>0}}});
 assert.equal(R.holoSupport(undefined),'no-webgl2');
 assert.equal(R.holoSupport({matchMedia:()=>({matches:false})}),'no-webgl2','no WebGL2RenderingContext');
 assert.equal(R.holoSupport({WebGL2RenderingContext:function(){},matchMedia:q=>({matches:/reduce/.test(q)})}),'reduced-motion');
 assert.equal(R.holoSupport({WebGL2RenderingContext:function(){},matchMedia:()=>({matches:false})}),null);
 const listeners={};const canvas={getContext:()=>null,addEventListener:(t,f)=>{listeners[t]=f;},removeEventListener:()=>{}};
 assert.equal(R.createHoloRenderer(canvas,()=>{}),null,'no context: no renderer (the component falls back)');
 const lostCanvas={getContext:()=>({isContextLost:()=>true}),addEventListener:()=>{},removeEventListener:()=>{}};
 assert.equal(R.createHoloRenderer(lostCanvas,()=>{}),null,'a lost context: no renderer');
 // One holo context on the page: a new claim releases the old holder.
 let releasedA=0;const a={release:()=>releasedA++},b={release:()=>{}};
 R.claimHoloContext(a);R.claimHoloContext(a);assert.equal(releasedA,0);R.claimHoloContext(b);assert.equal(releasedA,1,'the old card gives its context up');
 assert.equal(R.holoContextHolder(),b);R.releaseHoloContext(a);assert.equal(R.holoContextHolder(),b);R.releaseHoloContext(b);assert.equal(R.holoContextHolder(),null);
 // The light and view maths: the flat card sees the camera straight on.
 const cam=R.toCard(0,0,[0,0,3]);assert.equal(JSON.stringify(cam.map(v=>+v.toFixed(6))),'[0,0,3]');
 const tilted=R.toCard(0,18,[0,0,3]);assert(tilted[0]<0&&tilted[2]<3,'rotateY(+): the right edge turns away, so in card space the camera sits to the left (-x)');
 const holo=read('components/HoloFoil.tsx');
 assert.match(holo,/if\(reason\)return <>\{fallback\}<\/>;/,'any reason renders the CSS foil');
 assert.match(holo,/createHoloRenderer\(el,\(\)=>setReason\('context-lost'\)\)/,'context loss falls back');
 assert.match(holo,/if\(!renderer\)\{setReason\('no-webgl2'\);return;\}/);
 assert.match(holo,/release:\(\)=>\{taken=true;setReason\('taken'\);\}/,'a second holo card takes over; this one falls back');
 assert.match(holo,/'\(prefers-reduced-motion: reduce\)'\);const on=\(\)=>\{if\(mq\.matches\)setReason\('reduced-motion'\);\}/,'reduced motion turned on later falls back');
 const P=load('lib/graphics/holoFoil/patterns.ts');
 assert.equal(P.holoDpr(3,true),1.5,'phones cap at DPR 1.5');assert.equal(P.holoDpr(3,false),2,'desktop caps at 2');assert.equal(P.holoDpr(1,true),1);
 const r=read('lib/graphics/holoFoil/renderer.ts');
 assert.match(r,/setMask\(image\)\{/);assert.equal((r.match(/texImage2D\(g\.TEXTURE_2D,0,g\.RGBA,g\.RGBA/g)||[]).length,1,'the art mask is uploaded in one place (once per player)');}

// 5. Patterns teach positions: every card role maps to its pattern, and the meaning is written for a 7v7 player.
{const P=load('lib/graphics/holoFoil/patterns.ts');
 const roles=Object.keys(JSON.parse(read('lib/town/positionPlayers.json')));
 for(const role of roles)assert(P.HOLO_PATTERNS.includes(P.patternForRole(role)),`${role} has a pattern`);
 const expect={goalkeeper:'net',goleiro:'net',centerback:'shield',fullback:'shield',fixo:'shield',midfielder:'lanes',ala:'lanes',striker:'burst',winger:'burst',pivot:'burst'};
 for(const [role,pattern] of Object.entries(expect))assert.equal(P.patternForRole(role),pattern,`${role} → ${pattern}`);
 assert.equal(P.PATTERN_INFO.net.chip,'Goal-net foil: goalkeeper');assert.equal(P.PATTERN_INFO.shield.chip,'Shield foil: defender');
 assert.equal(P.PATTERN_INFO.lanes.chip,'Passing-lane foil: midfielder');assert.equal(P.PATTERN_INFO.burst.chip,'Starburst foil: forward');
 for(const p of P.HOLO_PATTERNS){const line=P.PATTERN_INFO[p].line;assert(line.split(' ').length<=12,`${p}: a short line (${line})`);
  assert.match(P.miniPatternUrl(p),/^data:image\/svg\+xml,/,`${p} has a static binder image`);}
 assert.equal(JSON.stringify(P.PATTERN_INDEX),'{"net":0,"shield":1,"lanes":2,"burst":3}','shader indices');
 const shader=read('lib/graphics/holoFoil/shader.ts');
 for(const fn of ['netPat','shieldPat','lanesPat','burstPat'])assert(shader.includes(`Pat ${fn}(vec2 u)`),`${fn} in the shader`);
 assert.match(shader,/if\(uPattern==0\)return netPat\(u\);if\(uPattern==1\)return shieldPat\(u\);if\(uPattern==2\)return lanesPat\(u\);return burstPat\(u\);/);
 // Tiers: regular subtle and edge-only, elite full, icon full + etching + glitter.
 assert.equal(P.TIER_LOOK.regular.edgeOnly,true);assert(P.TIER_LOOK.regular.strength<P.TIER_LOOK.elite.strength);
 assert.equal(P.TIER_LOOK.elite.edgeOnly,false);assert.equal(P.TIER_LOOK.icon.etching&&P.TIER_LOOK.icon.glitter,true);
 // The binder grid never uses WebGL.
 const lab=read('components/CardLab.tsx');assert.match(lab,/<MiniCard [^>]*foil=\{\{pattern:p,tier:t\}\}\/>/);
 assert(!/getContext|from '\.\/HoloFoil'|<canvas|lib\/graphics\/holoFoil\/renderer/.test(read('components/MiniCard.tsx')+read('components/HoloMiniFoil.module.css')),'mini foil is CSS only');}

console.log('PASS holo foil: /card-lab dev-only, live on collected cards (binder, viewer, offer, guide, vending, market), shield 0.70, text panel plain, loop idle at rest, CSS fallback, position patterns');
