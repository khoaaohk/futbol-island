// Ball Hunt lessons (Sep 28 2026 curriculum, 100 since the Sep 29 2026 Coral Cay balls): 100 different key football ideas, each with its own three-step scene.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(file){const abs=path.resolve(root,file.endsWith('.ts')?file:file+'.ts');if(cache.has(abs))return cache.get(abs).exports;const mod={exports:{}};cache.set(abs,mod);
 const code=ts.transpileModule(fs.readFileSync(abs,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
 new Function('exports','module','require',code)(mod.exports,mod,id=>id.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(abs),id))):require(id));return mod.exports;}
const {COIN_QUEST}=load('lib/town/coinQuest.ts'),{BALL_HUNT_LESSONS,BALL_HUNT_PRACTICE,SCENES,LANDSCAPE,ballLessonFrame,ballLessonFrames,diagramLayout,motionPoint,pitchMap}=load('lib/town/ballHuntLessons.ts');
const words=s=>s.trim().split(/\s+/).length,title=s=>s.teaching.slice(0,s.teaching.indexOf('.'));

// 1. Coverage and distinct concepts: one lesson per ball, one concept (scene kind) per lesson, every scene used once.
assert.equal(Object.keys(BALL_HUNT_LESSONS).length,COIN_QUEST.length);assert.equal(COIN_QUEST.length,100);
const kinds=COIN_QUEST.map(s=>BALL_HUNT_LESSONS[s.id]?.kind);
assert(kinds.every(Boolean),'every ball has a lesson');
assert.equal(new Set(kinds).size,100,'no two balls teach the same concept');
assert.deepEqual([...kinds].sort(),Object.keys(SCENES).sort(),'every scene is used by exactly one ball');
assert.equal(new Set(COIN_QUEST.map(title)).size,100,'every card title is different');
const allSteps=Object.values(BALL_HUNT_LESSONS).flatMap(l=>l.steps);assert.equal(new Set(allSteps).size,300,'no step text is reused');
assert.equal(new Set(Object.values(BALL_HUNT_LESSONS).map(l=>l.kind+'|'+l.steps.join('|'))).size,100);
console.log('PASS 100 balls → 100 different concepts, 100 scenes, 100 titles, 300 different steps');

// 2. Levels follow how hard the ball is to find; words follow the age table (docs/quiz-design.md §5: 7v7 → 9v9 → 11v11).
const expectedLevel=s=>s.parachute||s.ramp||s.id.startsWith('high-')||s.id==='wall-community'?3:(s.y===0&&!s.wall?.high&&!s.manhole&&!s.grass&&s.truck===undefined?1:2);
const LIMIT={1:16,2:18,3:22},count={1:0,2:0,3:0};
for(const s of COIN_QUEST){const l=BALL_HUNT_LESSONS[s.id];count[l.level]++;
 assert.equal(l.level,expectedLevel(s),`${s.id} level matches how hard it is to find`);
 assert.equal(l.steps.length,3);assert.equal(new Set(l.steps).size,3);assert.equal(l.actions.length,2);
 for(const step of l.steps){assert(words(step)>=5&&words(step)<=LIMIT[l.level],`${s.id} step "${step}" is ${words(step)} words (limit ${LIMIT[l.level]})`);assert(step.length<=140,`${s.id} step length`);}
 for(const a of l.actions)assert(words(a)<=5&&a.length<=28,`${s.id} action "${a}" is short`);
 assert(s.teaching.length>=90&&title(s).length>=8&&title(s).length<=48,`${s.id} teaching title + explanation`);
 assert(typeof BALL_HUNT_PRACTICE[s.id]==='string'&&BALL_HUNT_PRACTICE[s.id].length>30,`${s.id} practice prompt`);
 if(l.level===1)assert(!/half-space|overload|goal-side|transition|compact/i.test(l.steps.join(' ')),`${s.id} level-1 words stay everyday`);}
assert.deepEqual(count,{1:32,2:49,3:19});
assert.equal(new Set(Object.values(BALL_HUNT_PRACTICE)).size,100,'100 different practice prompts');
console.log('PASS levels: 32 easy (7v7 words ≤16), 49 medium (≤18), 19 hardest (≤22); short actions; 100 practice prompts');

// 3. Space-and-time core: most balls are about creating space, timing or shape; other key families all present.
const fam={};for(const l of Object.values(BALL_HUNT_LESSONS))fam[l.family]=(fam[l.family]||0)+1;
assert((fam['Creating space']||0)+(fam['Timing']||0)+(fam['Team shape']||0)>=28,'space and time is the core');
for(const f of ['Creating space','Timing','Team shape','Breaking lines','Zones and thirds','Final third','Transitions','Defending space','On the ball','Set pieces','Goalkeeping','Rules of the game','Player health','Beach soccer'])assert(fam[f]>=2,`family ${f} is taught`);
console.log('PASS families',JSON.stringify(fam));

// 4. Every scene renders three bounded, different steps: problem → movement → payoff, animated only on a step change.
// Every check from here on runs for the landscape pitch AND every upright-phone layout (taller view boxes through pitchMap).
const plain=/^M[-\d. MLQHAZ]+$/,dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
function segDist(a,b,p){const dx=b[0]-a[0],dy=b[1]-a[1],l2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/l2));return dist([a[0]+dx*t,a[1]+dy*t],p);}
const LAYOUTS=[LANDSCAPE];for(let r=.7;r<=1.8;r+=.01){const l=diagramLayout(1000,1000*r);if(!LAYOUTS.some(x=>x.w===l.w&&x.h===l.h))LAYOUTS.push(l);}
assert.deepEqual(diagramLayout(372,283),LANDSCAPE,'a 4:3 box keeps the landscape pitch');assert.deepEqual(diagramLayout(0,0),LANDSCAPE);
assert(diagramLayout(372,440).h>diagramLayout(372,440).w&&diagramLayout(412,563).h>diagramLayout(372,440).h,'taller boxes get taller pitches');
assert(LAYOUTS.length>=8&&LAYOUTS.length<=24,`a bounded set of layouts (${LAYOUTS.length})`);
for(const layout of LAYOUTS){const pm=pitchMap(layout),X=pm.X,Y=pm.Y,tag=layout===LANDSCAPE?'':` [${layout.w}x${layout.h}]`;
for(const [kind,scene] of Object.entries(SCENES)){
 const frames=ballLessonFrames(kind,layout);assert.equal(frames.length,3);assert.deepEqual(frames[0].layout,layout);
 frames.forEach((f,i)=>{
  assert.equal(new Set(f.nodes.map(n=>n.id)).size,f.nodes.length,`${kind} unique ids`);assert(f.nodes.length>=3&&f.nodes.length<=12,`${kind} bounded tokens`);
  assert(f.nodes.some(n=>n.role==='team')&&f.nodes.filter(n=>n.role==='ball').length===1,`${kind} has a team and one ball`);
  for(const n of f.nodes)assert(Number.isFinite(n.x+n.y)&&n.x>=X(16)&&n.x<=X(314)&&n.y>=Y(20)&&n.y<=Y(222),`${kind}${tag} step ${i} ${n.id} on screen (${n.x},${n.y})`);
  for(const d of [...f.arrows.map(a=>a.d),...f.ghosts.map(a=>a.d),...f.lanes.map(l=>l.d),...f.hints,...f.views])assert(plain.test(d),`${kind} plain SVG path ${d}`);
  for(const z of f.zones)assert(z.x>=pm.x0&&z.y>=Y(20)&&z.x+z.w<=pm.x1+.2&&z.y+z.h<=pm.y1+.2,`${kind}${tag} zone on the pitch`);
  assert(f.note&&f.note.length<=44,`${kind} note "${f.note}" fits above the pitch`);
  assert(f.settle<=1.4&&f.motions.every(m=>m.delay+m.dur<=2),`${kind} step ${i} animation is short`);
  if(i===0)assert.equal(f.motions.length,0,`${kind} opens static`);
  else if(!f.reset)assert(f.motions.length>0,`${kind} step ${i+1} animates the idea`);
  for(const m of f.motions){const end=motionPoint(m,1),node=f.nodes.find(n=>n.id===m.id);assert(dist(end,[node.x,node.y])<.5,`${kind} ${m.id} animation ends where the step draws it`);}
  // Football geometry: a blocked lane really passes a defender; an open lane is clear of opponents.
  for(const lane of f.lanes){const [a,b]=lane.d.replace(/^M/,'').split(/L/).map(p=>p.trim().split(/\s+/).map(Number));
   const others=f.nodes.filter(n=>n.role!=='ball'&&(lane.danger?n.role==='team':n.role==='opponent'));
   const nearest=Math.min(...others.map(n=>segDist(a,b,[n.x,n.y])));
   if(lane.open)assert(!others.length||nearest>=12,`${kind}${tag} step ${i+1}: open lane is clear (nearest ${nearest.toFixed(1)})`);
   else assert(nearest<=17,`${kind}${tag} step ${i+1}: blocked lane passes a player (nearest ${nearest.toFixed(1)})`);}
 });
 const sig=f=>JSON.stringify({n:f.nodes.map(n=>[n.id,n.x,n.y,n.label,n.angle,n.dim]),z:f.zones,l:f.lanes.map(l=>l.d+l.open),t:f.tags,p:f.pulse?.text,c:f.clock,v:f.views,li:f.lines,s:f.shadows,note:f.note});
 assert.notEqual(sig(frames[0]),sig(frames[1]),`${kind} step 2 changes the picture`);assert.notEqual(sig(frames[1]),sig(frames[2]),`${kind} step 3 changes the picture`);
 assert(frames[1].motions.length+frames[2].motions.length>0);
 // Each scene shows its idea with at least one teaching mark (space, lane, line, shadow, view, clock, pulse, tag, shape).
 assert(frames.some(f=>f.zones.length||f.lanes.length||f.lines.length||f.shadows.length||f.views.length||f.clock||f.pulse||f.tags.length||f.links.length||f.cone),`${kind} has teaching marks`);
}
}
console.log(`PASS ${Object.keys(SCENES).length} scenes × 3 steps × ${LAYOUTS.length} layouts: on screen, plain SVG, static start, animation on every step change, open/blocked lanes geometrically true`);

// 5. No two scenes look alike: compare layouts and movements (labels ignored) for every pair.
for(const layout of LAYOUTS){
const shape=kind=>ballLessonFrames(kind,layout).map(f=>({pitch:f.pitch,pts:f.nodes.filter(n=>n.role!=='ball').map(n=>[n.x,n.y,n.role]),moves:f.motions.filter(m=>m.id!=='ball').map(m=>[m.pts[0],m.pts[m.pts.length-1]]),ball:f.nodes.find(n=>n.role==='ball')}));
function matchCost(a,b){if(a.length!==b.length)return Infinity;const used=new Set();let total=0;for(const p of a){let best=Infinity,bi=-1;b.forEach((q,j)=>{if(used.has(j)||q[2]!==p[2])return;const d=dist(p,q);if(d<best){best=d;bi=j;}});if(bi<0)return Infinity;used.add(bi);total+=best;}return total/Math.max(1,a.length);}
const keys=Object.keys(SCENES),shapes=new Map(keys.map(k=>[k,shape(k)]));
for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++){const A=shapes.get(keys[i]),B=shapes.get(keys[j]);
 const layout=[0,1,2].map(s=>A[s].pitch===B[s].pitch?matchCost(A[s].pts,B[s].pts):Infinity),moves=[1,2].map(s=>A[s].moves.length===B[s].moves.length);
 const same=layout.every(c=>c<24)&&moves.every(Boolean);
 assert(!same,`${keys[i]} and ${keys[j]} are near-identical scenes (layout ${layout.map(c=>c.toFixed(1))})`);}
{const A=shapes.get('go-wide'),B=A.map(s=>({...s,pts:s.pts.map(([x,y,r])=>[x+9,y-7,r])}));assert([0,1,2].every(s=>matchCost(A[s].pts,B[s].pts)<24),'the detector catches a shifted copy of a scene');}
}
console.log(`PASS ${100*99/2} scene pairs × ${LAYOUTS.length} layouts checked: no near-identical layout + movement`);

// 6. Semantics of key ideas.
for(const layout of LAYOUTS){const M=pitchMap(layout).map,GOAL=M([165,234]),s1=Math.min(1,pitchMap(layout).sx);
const F=(k,s)=>ballLessonFrame(k,s,layout),N=(k,s,id)=>F(k,s).nodes.find(n=>n.id===id);
{const a=N('recover-inside',2,'a'),x=N('recover-inside',2,'x');assert(segDist([x.x,x.y],GOAL,[a.x,a.y])<6,'recovering defender ends between attacker and goal');}
{const k=N('keeper-angle',2,'k'),b=N('keeper-angle',2,'ball');assert(segDist([b.x,b.y],GOAL,[k.x,k.y])<6,'keeper steps out on the ball-to-goal line');assert(N('keeper-angle',1,'k').y>k.y,'keeper comes further out in the payoff');}
{const a=N('block-lane',2,'a'),b=N('block-lane',2,'ball'),s=N('block-lane',2,'xs');assert(segDist([b.x,b.y],[s.x,s.y],[a.x,a.y])<5,'defender stands on the passing line');}
{const f1=F('third-man',1);assert(f1.motions.some(m=>m.id==='pc')&&f1.motions.some(m=>m.id==='ball'),'C runs while A passes to B');assert.equal(f1.motions.find(m=>m.id==='pc').delay,0,'C goes as the ball travels');}
{const r0=N('pass-ahead',0,'b'),b2=N('pass-ahead',2,'ball');assert(b2.y<r0.y-50,'the pass goes into the space ahead of the runner');}
{const slow=dist([N('change-pace',0,'a').x,N('change-pace',0,'a').y],[N('change-pace',1,'a').x,N('change-pace',1,'a').y]),burst=dist([N('change-pace',1,'a').x,N('change-pace',1,'a').y],[N('change-pace',2,'a').x,N('change-pace',2,'a').y]);assert(burst>slow*3,'the burst covers far more ground');}
{assert(N('check-away',1,'x').y<N('check-away',0,'x').y,'marker follows the run away');assert(N('check-away',2,'a').y>N('check-away',1,'a').y,'then the check back toward the ball');}
{assert(N('drag-away',1,'x').x>N('drag-away',0,'x').x+60*s1,'the marker is dragged wide');assert.equal(F('drag-away',2).motions.find(m=>m.id==='ball').delay>0,true,'the pass waits for the teammate to arrive');}
{const line=N('curved-run',1,'x1').y;assert(N('curved-run',1,'a').y>=line,'still onside before the pass');assert(N('curved-run',2,'a').y<line,'beyond the line only with the pass');assert.equal(F('curved-run',2).motions.find(m=>m.id==='ball').delay,0,'run and pass together');}
{assert(N('squeeze-up',2,'t2').y<N('squeeze-up',1,'t2').y,'line steps up after the back pass');assert(F('squeeze-up',1).motions.some(m=>m.id==='ball'),'back pass first');}
{assert.equal(F('use-keeper',1).nodes.find(n=>n.role==='ball').y>190,true,'ball goes back to the keeper');}
{assert(F('arrive-late',2).motions.find(m=>m.id==='ball').delay===0&&F('arrive-late',2).pulse,'arrive with the ball: run and pass together, "now" cue');}
{const c0=F('time-or-pressure',0).clock.t,c2=F('time-or-pressure',2).clock.t;assert(c0>c2,'time on the ball shrinks when a defender is close');assert(F('scan-shoulder',2).clock.t>F('scan-shoulder',0).clock.t,'scanning early buys time');}
{const w=F('go-wide',1);assert(w.zones.some(z=>z.label==='Gap'),'width opens a central gap');assert(w.lanes.some(l=>l.open));}
// Coral Cay ideas (Sep 29 2026).
{const f=F('keeper-throw',1);assert(f.lanes.some(l=>!l.open)&&f.lanes.some(l=>l.open),'near roll blocked, far throw open');const c=N('keeper-throw',2,'c'),b=N('keeper-throw',2,'ball');assert(dist([c.x,c.y],[b.x,b.y])<20,'the throw goes to the far teammate');}
{const a=N('no-offside',1,'a'),x1=N('no-offside',1,'x1');assert(a.y<x1.y&&dist([a.x,a.y],[N('no-offside',1,'ball').x,N('no-offside',1,'ball').y])<20,'an attacker beyond the last defender receives: no offside on sand');}
{const px=M([300,0])[0];assert(['a','b','c'].every(id=>N('drink-heat',1,id).x>px-30),'the drinks break happens at the touchline');}
{assert(N('keeper-joins',1,'k').y<N('keeper-joins',0,'k').y-30,'the beach keeper steps out to join the attack');}
{const b0=N('whole-ball-line',0,'ball'),line=M([316,0])[0];assert(b0.x<line&&b0.x>line-12*s1-2,'the ball sits on the line and is still in play');}
}
console.log('PASS semantics (every layout): recovery line, keeper angle, lane block, third-man timing, lead pass, burst, check away, decoy drag, onside curve, squeeze, keeper outlet, arrive-with-ball, time clocks, width gap; Coral Cay throw choice, no offside, drinks break, keeper joins, ball on the line');

// 7. Mobile heat: the renderer animates only on a step change and never loops.
const comp=fs.readFileSync(path.join(root,'components/BallLessonDiagram.tsx'),'utf8'),css=fs.readFileSync(path.join(root,'components/BallHuntLesson.module.css'),'utf8');
assert(!/setInterval|infinite/.test(comp+css),'no timers or infinite animations');
assert.match(comp,/step!==previous\+1/,'motion plays only when the child advances a step');
assert.match(comp,/document\.hidden/,'hidden page stops the motion');assert.match(comp,/prefers-reduced-motion/,'reduced motion jumps to the end');
assert.match(comp,/return finish;/,'cleanup cancels the frame loop');
assert.match(css,/animation:pulse [^;]* 2;/,'the "now" pulse plays twice, then stops');
console.log('PASS heat: step-triggered, bounded rAF burst; finite CSS animations; hidden/reduced-motion guards');
