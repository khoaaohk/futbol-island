// ball-curve "How a ball curves" (Oct 14 2026 REDO; user: "make it possible to turn knobs and things to make it do something …
// the stadiums did a great job of showing the breakdown of the layers"). Three instruments: the WIND TUNNEL (fan crank, spin knob,
// smoke lines, a sprung carriage and a push gauge), the CURL LAUNCHER (turntable, hammer, contact ball), the BALL TAKEN APART.
// Checks: facts and sources; the tunnel model (the push follows the spin, needs wind, grows with both; the smoke splits evenly
// with no spin and is thrown opposite the push with spin; the carriage and gauge read it); every control's effect (crank, spin
// knob round trip, turntable, hammer, contact dot); the flight physics (right of centre curves left …); the two challenges and
// their "Show me" kicks; the breakdown (32-panel ball geometry, five parts); the contract (one centred start, quick check →
// Ending → onComplete once, no emoji, 44 px, no own loop, reduced motion, lab + registry).
// usage: node tests/museum-exp-ball-curve.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
for(const ext of ['.ts','.tsx'])require.extensions[ext]=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
const Module=require('node:module'),orig=Module._resolveFilename;
Module._resolveFilename=function(req,...a){if(req.startsWith('@/'))req=path.join(__dirname,'..',req.slice(2));try{return orig.call(this,req,...a);}catch(e){for(const x of ['.ts','.tsx']){try{return orig.call(this,req+x,...a);}catch{}}throw e;}};
require.extensions['.css']=m=>{m.exports=new Proxy({},{get:(_,k)=>String(k)});};
const root=path.join(__dirname,'..'),dir='components/museum/experiences/ball-curve/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),P=require('../'+dir+'physics.ts'),C=require('../'+dir+'content.ts'),G=require('../'+dir+'ballgeom.ts');
const T=require('../'+dir+'Tunnel.tsx'),L=require('../'+dir+'Launcher.tsx'),E=require('../'+dir+'Exploded.tsx'),R=require('../components/museum/experiences/free-kick-wall/rig-parts.tsx'),K=require('../components/museum/experiences/anatomy/iso-kit.ts');
const files=fs.readdirSync(path.join(root,dir)).filter(f=>/\.(tsx?|css)$/.test(f)),exp=read(dir+'Experience.tsx'),css=read(dir+'bc.module.css');
const code=t=>t.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"`\\])\/\/.*$/gm,'$1');
const PJ={origin:[400,300],scale:3,azimuth:58,elevation:34};

// 1. Facts and sources.
{const e=X.EXHIBITS.find(x=>x.id==='ball-curve');assert.ok(e);assert.equal(e.gallery,'skills');
 assert.match(e.facts[0],/spinning ball curves.*pushes the air to one side.*the air pushes the ball the other way.*Magnus effect/);
 assert.match(e.facts[1],/right of centre and it curves left.*left of centre and it curves right/);
 assert.match(e.facts[2],/almost no spin.*knuckleball.*wobble/);assert.match(e.facts[3],/1997.*Roberto Carlos.*France/);
 const urls=[...e.sources,...C.SOURCES].map(s=>s.url);for(const u of urls)assert.match(u,/^https:\/\//);
 for(const re of [/wiki\/Magnus_effect/,/wiki\/Knuckleball/,/grc\.nasa\.gov/,/theifab\.com\/laws\/latest\/the-ball/,/wiki\/Adidas_Jabulani/,/Ball_\(association_football\)/])assert.ok(urls.some(u=>re.test(u)),'cited: '+re);
 for(const k of ['68–70 cm','410–450 g','0.6–1.1 atmosphere','latex or butyl','32','8 panels'])assert.ok(Object.values(C.PART_TEXT).join(' ').includes(k),'ball fact: '+k);
 assert.match(exp,/exhibit\.facts\.map/);assert.match(exp,/exhibit\.forYourGame/);assert.match(exp,/MODEL_NOTE/);assert.match(C.MODEL_NOTE,/simple teaching model/);
 assert.equal(C.CHECKS.length,3);assert.equal(C.CHECKS[0].options[C.CHECKS[0].right],'Left');assert.equal(C.CHECKS[1].options[C.CHECKS[1].right],'The other way');
 console.log('PASS facts: Magnus effect, contact side, knuckleball, Roberto Carlos; the ball (IFAB Law 2, bladder, 32 panels, Jabulani) cited');}

// 2. The wind tunnel: the push follows the spin and needs the wind; the smoke shows it.
{assert.equal(P.magnus(0,8),0,'no wind, no push');assert.equal(P.magnus(20,0),0,'no spin, no push');
 assert.ok(P.magnus(20,5)>0&&P.magnus(20,-5)<0,'the push follows the spin');assert.ok(P.magnus(30,10)>P.magnus(15,10)&&P.magnus(30,10)>P.magnus(30,5),'more wind or more spin, more push');
 assert.ok(Math.abs(P.magnus(30,10)-4.7)<.2,'about 4.7 N at the top setting');assert.ok(P.magnus(30,10)>P.WEIGHT,'…more than the ball weighs');
 const a=12,ys=[-20,-6,6,20],sym=P.smokeLines({a,U:20,g:0,x0:-80,x1:80,ys}),bent=P.smokeLines({a,U:20,g:.5,x0:-80,x1:80,ys});
 for(let i=0;i<2;i++)assert.ok(Math.abs(sym[i].at(-1)[1]+sym[3-i].at(-1)[1])<.5,'no spin: the smoke splits evenly');
 const meanY=l=>l.reduce((s,x)=>s+x.at(-1)[1],0)/l.length;assert.ok(meanY(bent)<meanY(sym)-3,'spin: the air is thrown towards −y …');assert.ok(P.magnus(20,5)>0,'… and the ball is pushed towards +y');
 for(const l of bent)for(const [x,y] of l)assert.ok(Math.hypot(x,y)>=a*.99,'the smoke never cuts into the ball');
 const st0=T.tunnelState(1,0),st1=T.tunnelState(1,1),st2=T.tunnelState(1,-1),st3=T.tunnelState(0,1);
 assert.equal(st0.F,0);assert.ok(Math.abs(st1.shift-T.CARRIAGE_MAX)<1e-9,'full push slides the carriage all the way');assert.ok(st2.shift<0,'the other spin slides it the other way');assert.equal(st3.F,0);
 assert.ok(P.circulation(30,10)>0&&P.circulation(30,10)<1,'the drawn flow keeps its split points on the ball');
 // the tunnel's four jobs
 assert.deepEqual(C.TASKS.map(t=>t.id),['wind','spin','flip','still']);assert.match(exp,/U>=50&&Math\.abs\(spin\)<\.05\)add\('wind'\)/);assert.match(exp,/Math\.sign\(st\.n\)===-firstSign\.current\)add\('flip'\)/);assert.match(exp,/U<6&&Math\.abs\(st\.n\)>=3\)add\('still'\)/);
 console.log(`PASS tunnel: push ${P.magnus(30,10).toFixed(1)} N at the top (the ball weighs ${P.WEIGHT.toFixed(1)} N), follows the spin, needs the wind; smoke even with no spin, thrown opposite the push with spin; carriage slides; four jobs`);}

// 3. Every control does something.
{// FAN CRANK: the handle goes round with the setting; more crank, more wind
 const h0=T.crankHandle(0),h1=T.crankHandle(1);assert.ok(Math.hypot(h0[0]-h1[0],h0[1]-h1[1])>3,'the crank handle moves');assert.ok(P.windOf(1)>P.windOf(.5)&&P.windOf(0)===0);
 // SPIN KNOB: value ↔ pointer angle round trip, both directions
 for(const v of [0,.2,.5,.8,1]){const a=R.knobAngle(T.SPINK,PJ,v),k=T.SPINK,r=k.R*.8,[sx,sy]=K.iso([k.x+Math.sin(a)*r,k.y-Math.cos(a)*r,k.z+7.6],PJ);assert.ok(Math.abs(R.knobValue(k,PJ,sx,sy)-v)<1e-6,'spin knob reads back '+v);}
 assert.ok(P.spinRateOf(1)>0&&P.spinRateOf(-1)<0&&P.spinRateOf(0)===0);
 // TURNTABLE: the launcher turns; HAMMER: pulled back further for more power; CONTACT DOT: moves with the contact
 const f0=L.frame(0).f,f1=L.frame(12).f;assert.ok(Math.hypot(f0[0]-f1[0],f0[1]-f1[1])>.15,'the launcher turns');
 const hb=L.hammerAt('wall',0,L.cockOf(1)),hf=L.hammerAt('wall',0,L.cockOf(0));assert.ok(hb[0]>hf[0],'more power: the hammer is pulled further back');assert.ok(L.cockOf(1)>L.cockOf(0));
 const d0=L.dotAt('wall',PJ,0,0),dr=L.dotAt('wall',PJ,1,0),du=L.dotAt('wall',PJ,0,1);assert.ok(dr[0]>d0[0],'contact right: the dot moves right');assert.ok(du[1]<d0[1],'contact high: the dot moves up');
 for(const id of ['fan','spin'])assert.match(read(dir+'Tunnel.tsx'),new RegExp(`<Hit key="${id}" id="${id}"`));for(const id of ['aim','power','contact'])assert.match(read(dir+'Launcher.tsx'),new RegExp(`<Hit key="${id}" id="${id}"`));
 assert.match(exp,/k\.startsWith\('Arrow'\)/,'arrow keys turn the focused control');
 console.log('PASS controls: fan crank (wind), spin knob (angle round trip, both ways), turntable (aim), hammer (power), contact dot (spin); all focusable sliders with arrow keys');}

// 4. The flight: the curve goes the way the contact side says; the two challenges.
{const base={cy:-.25,power:.6,aim:0},bend=cx=>P.bendAt(P.fly({...base,cx},{yEnd:20.5}),20,0);
 assert.ok(bend(1)<-1.5,'struck RIGHT of centre: it curves LEFT');assert.ok(bend(-1)>1.5,'struck LEFT of centre: it curves RIGHT');
 assert.ok(Math.abs(P.bendAt(P.fly({...base,cx:0},{yEnd:20.5,wobble:false}),20,0))<.05,'through the middle: no curve');
 assert.ok(P.spinOf({cx:1,cy:0,power:.6,aim:0}).side>0);assert.ok(P.apex(P.fly({cx:0,cy:-.6,power:.6,aim:0}))>P.apex(P.fly({cx:0,cy:.4,power:.6,aim:0}))+1,'under the ball it climbs');
 const k={cx:0,cy:-.2,power:.95,aim:0,seed:3},kf=P.fly(k,{yEnd:25.5});assert.equal(kf.knuckle,true);assert.ok(P.swayTurns(kf)>=2,'the knuckleball changes direction in the air');
 const ok=(c,s)=>P.judge(c,s,P.fly(s,{yEnd:P.yEndOf(c)}));
 for(let a=-10;a<=12;a++)assert.notEqual(ok('wall',{cx:0,cy:-.25,power:.6,aim:a}).code,'goal','no straight kick beats the wall (aim '+a+')');
 assert.equal(ok('wall',{...C.SHOW.wall,seed:1}).code,'goal','Show me: round the wall');assert.equal(ok('knuckle',{...C.SHOW.knuckle,seed:1}).code,'knuckle','Show me: the knuckleball');
 assert.equal(ok('knuckle',{cx:.6,cy:-.2,power:.95,aim:0}).code,'spin');assert.equal(ok('knuckle',{cx:0,cy:-.2,power:.4,aim:0}).code,'soft');
 assert.deepEqual(C.CHALLENGES.map(c=>c.id),['wall','knuckle']);for(const v of Object.values(C.VERDICT))assert.ok(v.big&&v.line);
 assert.match(exp,/const f=fly\(sk,\{yEnd:yEndOf\(c\)\}\)/,'the physics runs once per kick');
 console.log(`PASS flight: right of centre curves left (${bend(1).toFixed(1)} m), left curves right (${bend(-1).toFixed(1)} m); round the wall and the knuckleball each need the right contact`);}

// 5. The breakdown: the ball taken apart.
{assert.equal(G.CORNERS.length,60);assert.equal(G.EDGES.length,90);assert.equal(G.PENTAGONS.length,12);assert.ok(G.PENTAGONS.every(p=>p.length===5),'12 pentagons (+ 20 hexagons = 32 panels)');
 const lines=G.ballLines([0,0,0],40,PJ,{yaw:.3});assert.ok(lines.seams.length>500&&lines.pentagons.length>50,'seams and pentagons are drawn');
 assert.deepEqual([...E.BALL_PARTS],['panels','seams','bladder','valve','size']);for(const p of E.BALL_PARTS)assert.ok(C.PART_NAME[p]&&C.PART_TEXT[p].length>40,p);
 assert.ok(E.LIFT.cap>E.LIFT.valve&&E.LIFT.valve>E.LIFT.bladder,'apart, the cap lifts highest, then the valve, then the bladder');
 const a0=E.partAnchors(PJ,0,0),a1=E.partAnchors(PJ,1,0);for(const p of E.BALL_PARTS)assert.ok(a1[p].every(Number.isFinite));assert.ok(a1.panels[1]<a0.panels[1]-20,'the panels rise as it comes apart');
 assert.match(exp,/data-apart-slider/);assert.match(exp,/data-part-label/);assert.match(exp,/data-part=\{id\}/);assert.match(css,/\.badgeHit\{[^}]*width:44px;height:44px/);
 console.log('PASS breakdown: a true 32-panel ball (60 corners, 90 seams, 12 pentagons), five parts (panels, seams, bladder, valve, size) lifting apart in order, labels / badges');}

// 6. Contract, no emoji, 44 px, heat, reduced motion.
{assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);assert.match(exp,/<PaperRoom id="ball-curve"/);assert.match(exp,/e\.key==='Escape'/);
 assert.equal((exp.match(/<StartDock /g)||[]).length,1,'ONE start button');assert.doesNotMatch(exp,/<Intro /);
 assert.equal((exp.match(/onComplete=\{onComplete\}/g)||[]).length,1);assert.doesNotMatch(exp,/onComplete(\?\.)?\(/);assert.match(exp,/<Ending reached=\{checked\} onComplete=\{onComplete\}/);assert.match(exp,/<StepCheck /);
 for(const h of ['data-phase','data-fan','data-spin','data-push','data-tasks','data-challenge','data-contact','data-aim','data-last','data-solved','data-bc-kick','data-bc-show','data-bc-next','data-bc-score','data-bc-to-launch'])assert.ok(exp.includes(h),'hook '+h);
 for(const h of ['data-prediction','data-actual','data-straight','data-contact-ball','data-hammer','data-turntable'])assert.ok(read(dir+'Launcher.tsx').includes(h),'hook '+h);
 for(const h of ['data-smoke','data-carriage','data-push','data-crank','data-gauge'])assert.ok(read(dir+'Tunnel.tsx').includes(h),'hook '+h);
 const emoji=/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{25A0}-\u{25FF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
 for(const f of files)assert.doesNotMatch(code(read(dir+f)),emoji,'no emoji or arrow glyphs in '+f);for(const t of [...X.EXHIBITS.find(x=>x.id==='ball-curve').facts,JSON.stringify(C)])assert.doesNotMatch(t,emoji);
 assert.match(read(dir+'Tunnel.tsx'),/Math\.max\(22,9\*k\)/,'tunnel controls at least 44 px across');assert.match(read(dir+'Launcher.tsx'),/r=\{Math\.max\(22,8\*k\)\}/);assert.match(css,/\.slider input\{[^}]*height:44px/);
 for(const f of files.filter(f=>/\.tsx?$/.test(f)))assert.doesNotMatch(read(dir+f),/requestAnimationFrame|setInterval/,'no own loop in '+f);
 assert.match(exp,/usePaperLoop\([\s\S]*?\},stageRef,reduced\)/,'the shared loop: sleeps off-screen, runs to the end at once under reduced motion');assert.match(exp,/bump\(\);return more;/,'it stops when nothing moves');
 assert.match(exp,/const SETTLE=1\.6/,'the tunnel only moves for a short settle after a control is used');assert.match(exp,/tv\.current\.left=reduced\?0:SETTLE/,'reduced motion: the smoke stands still');
 assert.match(exp,/if\(reduced\)\{ex\.current=\{e:1,eT:1\}/,'reduced motion: the ball comes apart at once');assert.match(css,/prefers-reduced-motion/);
 assert.ok(fs.existsSync(path.join(root,'app/museum-lab/ball-curve/page.tsx')));assert.match(read('components/museum/experiences/index.tsx'),/'ball-curve':load\(\(\)=>import\('\.\/ball-curve\/Experience'\)\)/);
 console.log('PASS contract: Paper room, Back + Escape, one centred start, hooks, quick check → Ending → onComplete once, no emoji, 44 px, physics once per kick, loop only while moving, reduced motion, lab + registry');}
