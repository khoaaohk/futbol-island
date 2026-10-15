// floodlights-1878 · "Under the lights" (Oct 14 2026 redo: the night rig). Checks: the case and its sourced facts; every control's
// effect in the model (the crank's speed sets the volts, power grows with the square of the volts, the flywheel runs down to a
// stop, the motor holds full power, each lamp's swivel moves its light, the probe reads the light where it stands, taking a tower
// apart unplugs its lamp); the drawing (scene.ts renders in Node and every control changes it); the breakdown's six parts; the
// shared contract and museum rules (one centred start, onComplete once, no emoji, ≥ 44 px targets, keyboard, no rAF at rest,
// reduced motion).
// usage: node tests/museum-exp-floodlights-1878.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const compile=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.ts']=compile;require.extensions['.tsx']=compile;
const Mod=require('module'),orig=Mod._resolveFilename;Mod._resolveFilename=function(r,...a){if(r.startsWith('@/'))r=path.join(__dirname,'..',r.slice(2));return orig.call(this,r,...a);};
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const code=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
const EMOJI=/\p{Extended_Pictographic}|️/u,ARROW=/[▶▸◀◂►→←➡⬅✅❌✔✖⟲⟳‹›]/u;
const glyphFree=(s,what)=>{const e=s.match(EMOJI),a=code(s).match(ARROW);assert.ok(!e,`${what}: emoji ${e?.[0]}`);assert.ok(!a,`${what}: arrow glyph ${a?.[0]} (use StepIcon)`);};
const id='floodlights-1878',dir='components/museum/experiences/floodlights-1878/';
const X=require('../lib/endgame/museum.ts'),e=X.EXHIBITS.find(x=>x.id===id);
const files=fs.readdirSync(path.join(root,dir)).sort(),src=Object.fromEntries(files.map(f=>[f,read(dir+f)]));
const exp=src['Experience.tsx'],css=src['Experience.module.css'],scene=src['scene.ts'];
const C=require('../'+dir+'content.ts'),M=require('../'+dir+'model.ts'),S=require('../'+dir+'scene.ts');

// 1. The case, the facts and their sources.
{assert.ok(e,'case exists');assert.equal(e.gallery,'firsts');assert.equal(e.year,'1878');assert.equal(e.need,0);
 assert.ok(e.facts.length>=3&&e.facts.every(f=>f.length>20&&f.length<240));assert.ok(e.forYourGame.length>20);
 assert.match(e.facts[0],/14 October 1878/);assert.match(e.facts[0],/Bramall Lane in Sheffield/);assert.match(e.facts[0],/20,000/);
 assert.match(e.facts[1],/generators/);assert.match(e.facts[2],/Portsmouth against Newcastle United, on 22 February 1956/);
 const urls=[...e.sources,...C.SOURCES].map(s=>s.url).join(' ');for(const p of ['Bramall_Lane','Sheffield_United_F.C.','Floodlight','Floodlights_(sport)','Arc_lamp'])assert.ok(urls.includes(p),'cites '+p);
 assert.ok([...e.sources,...C.SOURCES].every(s=>/^https:\/\//.test(s.url)));
 assert.match(C.EXTRA.match,/2\u2060?–\u2060?0/);assert.match(C.EXTRA.league,/Fratton Park/);assert.match(C.EXTRA.arc,/carbon rods/);assert.match(C.EXTRA.others,/Gramme/);
 assert.match(C.MODEL_NOTE,/model/);assert.match(C.MODEL_NOTE,/not how many lamps stood where/,'the model says what the sources do not tell us');
 assert.equal(C.BEATS.length,3);for(const c of C.CHECKS){assert.ok(c.options.length>=2&&c.right>=0&&c.right<c.options.length&&c.why.length>10);assert.equal(new Set(c.options).size,c.options.length);}
 assert.equal(C.CHECKS[0].options[C.CHECKS[0].right],'Bramall Lane, Sheffield');
 assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.SOURCES\]/);assert.match(exp,/<summary>Sources<\/summary>/);
 console.log('PASS facts: 14 Oct 1878 at Bramall Lane, ~20,000, 2-0, generators / dynamos, arc lamps, first League match under lights; all sourced, the model labelled');}

// 2. The crank, the flywheel, the motor and the voltmeter.
{assert.equal(M.volts(0),0);assert.equal(Math.round(M.volts(M.OMEGA_FULL)),100);assert.equal(Math.round(M.volts(M.OMEGA_FULL/2)),50,'volts follow the crank speed');
 assert.ok(Math.abs(M.power(50)-.25)<1e-9,'half the volts, a quarter of the power');
 // cranking: one turn a second for a second brings the speed toward 2π rad/s; faster cranking, more speed
 let w=0;for(let i=0;i<60;i++)w=M.crankSpeed(w,2*Math.PI/60,1/60);let w2=0;for(let i=0;i<60;i++)w2=M.crankSpeed(w2,3*Math.PI/60,1/60);
 assert.ok(w>4&&w<2*Math.PI+.01&&w2>w,`cranking sets the speed (${w.toFixed(2)} < ${w2.toFixed(2)})`);
 assert.equal(M.crankSpeed(1,-.2,.1),M.crankSpeed(1,.2,.1),'either way round counts');
 // let go: the flywheel runs down to exactly 0 (so the loop stops); the motor holds exactly full (so the loop stops)
 let o=M.OMEGA_FULL,n=0;while(o>0&&n<2000){o=M.coast(o,false,1/60);n++;}assert.equal(o,0);assert.ok(n<600,`runs down in ${(n/60).toFixed(1)} s`);
 let m=0;n=0;while(m!==M.OMEGA_FULL&&n<2000){m=M.coast(m,true,1/60);n++;}assert.equal(m,M.OMEGA_FULL);assert.ok(n<300,'the motor reaches full power and holds');
 assert.ok(Math.abs(M.angleStep(3.1,-3.1)-(2*Math.PI-6.2))<1e-9,'crossing 180° is a small step');
 console.log(`PASS dynamo: volts follow the crank, power grows with the square, the flywheel stops in ${(n/60).toFixed(1)} s or less, the motor holds full`);}

// 3. The lamps: light falls with distance, the beam points where the swivel points, aiming decides the dark spots.
{const P=M.power(100),T=M.TOWER_AT[0];
 assert.ok(M.lampAt(0,45,P,T[0]+30,T[1]+30)>M.lampAt(0,45,P,T[0]+120,T[1]+120),'light falls with distance');
 const aim=(i,y)=>{const a=y*Math.PI/180;return [M.TOWER_AT[i][0]+Math.cos(a)*M.REACH,M.TOWER_AT[i][1]+Math.sin(a)*M.REACH];};
 const [ax,ay]=aim(0,30);assert.ok(M.lampAt(0,30,P,ax,ay)>M.lampAt(0,120,P,ax,ay)*3,'the beam lights where the lamp points');
 assert.equal(M.lampAt(0,30,0,ax,ay),0,'no power, no light');
 const start=M.coverage(M.grid({yaw:M.START_YAW},P));assert.ok(start.dark>100,'the start: lamps along the touchlines leave the middle and the ends dark');
 const centre=[0,1,2,3].map(i=>M.snapYaw(M.yawToCentre(i)));assert.deepEqual(centre,[30,150,-150,-30]);
 const full=M.coverage(M.grid({yaw:centre},P));assert.equal(full.dark,0,'aimed inward at full power: every spot lit');assert.ok(M.isReady(full,100));
 const half=M.coverage(M.grid({yaw:centre},M.power(70)));assert.ok(half.dark>0&&!M.isReady(half,70),'at 70 volts the lamps are too dim');
 assert.ok(M.coverage(M.grid({yaw:[0,0,0,0]},P)).dark>500,'all four pointing the same way leaves most of the pitch dark');
 assert.equal(M.snapYaw(37),30);assert.equal(M.snapYaw(-172),-165);assert.equal(M.snapYaw(181),-180);assert.equal(M.DETENT,15);
 // the probe reads the model's light where it stands, and its dial puts "enough to play" a third of the way round
 assert.ok(Math.abs(M.probeDial(M.LIT)-1/3)<1e-9);assert.equal(M.probeDial(99),1);
 // a tower taken apart is unplugged: its lamp goes out and dark spots come back
 assert.deepEqual(M.onWhenApart(0),[1,1,1,1]);assert.equal(M.onWhenApart(1)[M.APART_TOWER],0);
 assert.ok(M.coverage(M.grid({yaw:centre,on:M.onWhenApart(1)},P)).dark>0,'unplugged tower: dark spots');
 console.log(`PASS lamps: falls with distance, beam follows the swivel, ${start.dark} dark spots at the start, none when aimed in at 100 V, dim at 70 V, 15° detents, unplugged when apart`);}

// 4. Shadows: one lamp's is black; with four lit lamps each is filled in by the others.
{const P=M.power(100),centre=[30,150,-150,-30];
 const one=M.shadowsAt({yaw:centre,on:[1,0,0,0]},P,-30,-10);assert.equal(one.length,1);assert.ok(one[0].dark>.95,'one lamp: black shadow');
 const four=M.shadowsAt({yaw:centre},P,0,0);assert.equal(four.length,4);for(const s of four)assert.ok(s.dark<.5,'four lamps: soft shadows');
 assert.ok(one[0].dx>0&&one[0].dy>0,'it points away from the lamp');
 console.log('PASS shadows: black from one lamp, soft from four, pointing away');}

// 5. The drawing: pure, renders in Node, and every control changes it.
{const k=require('../components/museum/experiences/anatomy/iso-kit.ts');
 const P=k.fitProjection(S.fitPoints(0,'wide'),1200,700,{pad:18,azimuth:S.AZ.wide,elevation:S.EL.wide});
 const base={yaw:[...M.START_YAW],omega:0,wheel:0,motor:false,gx:0,gy:0,apart:0};
 const r0=S.render(P,base,'wide'),needle=s=>s.match(/data-volt-needle[^>]*/)[0],probe=s=>s.match(/data-probe-needle d="[^"]*"/)[0];
 assert.ok(r0.svg.length>20000,'a dense drawing ('+r0.svg.length+' chars)');assert.ok((r0.svg.match(/iso-solid/g)||[]).length>=80,'80+ solids');
 assert.doesNotMatch(scene,/document\.|window\.|requestAnimationFrame/,'scene.ts is pure');
 const rV=S.render(P,{...base,omega:M.OMEGA_FULL},'wide');assert.notEqual(needle(rV.svg),needle(r0.svg),'the crank moves the voltmeter needle');
 assert.ok(rV.svg.includes('url(#fl-glow)')&&!r0.svg.includes('fill="url(#fl-glow)"'),'with power the lamps glow; without, they are dark');
 const rW=S.render(P,{...base,wheel:1.2},'wide');assert.notEqual(rW.anchors.handle.join(),r0.anchors.handle.join(),'the crank handle goes round');
 const rM=S.render(P,{...base,omega:M.OMEGA_FULL,motor:true},'wide');assert.notEqual(rM.svg,rV.svg,'the motor lever moves (and the belt goes on)');
 const rY=S.render(P,{...base,yaw:[90,180,180,0]},'wide');assert.notEqual(rY.svg,r0.svg,'a lamp swivel turns the housing and the dish');
 const rL=S.render(P,{...base,omega:M.OMEGA_FULL,lightHref:'data:image/png;base64,AAAA'},'wide');assert.match(rL.svg,/<image href="data:image\/png/,'the light map lies on the turf');
 const rP=S.render(P,{...base,omega:M.OMEGA_FULL,yaw:[30,150,-150,-30],gx:30,gy:10},'wide'),rP2=S.render(P,{...base,omega:M.OMEGA_FULL,yaw:[30,150,-150,-30],gx:-60,gy:-40},'wide');
 assert.notEqual(rP.anchors.probe.join(),rP2.anchors.probe.join(),'the gantry rides to the probe');assert.notEqual(probe(rP.svg),probe(rP2.svg),'the probe needle reads the light there');
 const rA=S.render(P,{...base,apart:1},'wide');assert.deepEqual(Object.keys(r0.anchors.parts),[],'no part labels when together');
 assert.deepEqual(Object.keys(rA.anchors.parts).sort(),['cable','footing','lamp','mast','platform','reflector'],'six labelled parts apart');
 const rT=S.render(P,base,'tall');assert.ok(rT.svg.length>20000,'the tall (phone) layout renders too');
 assert.equal(M.PARTS.length,6);for(const p of M.PARTS)assert.ok(p.line.length>20&&p.line.length<120,p.id+' has a kid-sized line');
 console.log(`PASS drawing: ${(r0.svg.match(/iso-solid/g)||[]).length} solids; crank, motor, swivels, probe and the take-apart slider each change it; six parts apart; phone layout`);}

// 6. Contract, the room, one start, onComplete once, no emoji.
{assert.match(exp,new RegExp(`<PaperRoom id="${id}"`));assert.match(read('components/museum/experiences/anatomy/PaperRoom.tsx'),/<ExperienceBack onClose=\{onClose\}\/>/);
 assert.doesNotMatch(exp,/NavigationButton|ExperienceBack|immediate/);
 assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);assert.match(exp,/e\.key==='Escape'/);
 assert.equal((code(exp).match(/onComplete/g)||[]).length,3,'onComplete only reaches the Ending');
 assert.match(exp,/<Ending reached=\{checked\} onComplete=\{onComplete\}/);assert.match(exp,/onDone=\{\(\)=>setChecked\(true\)\}/);
 assert.equal((exp.match(/<StartDock /g)||[]).length,1,'ONE start button (the shared centred StartDock)');assert.doesNotMatch(exp,/data-start\b/,'no second start button of its own');
 assert.match(read('components/museum/experiences/modern/startDock.module.css'),/\.dock\{display:flex;flex-direction:column;align-items:center/);
 assert.match(exp,/disabled=\{!canCheck\}/);assert.match(exp,/const canCheck=done\.power&&done\.aim&&done\.apart/,'the quick check opens once powered, lit and taken apart');
 for(const [f,s] of Object.entries(src))glyphFree(s,f);glyphFree([...e.facts,e.forYourGame,e.title].join(' '),'case text');
 assert.ok(!files.includes('Pitch.tsx'),'the old flat pitch is gone');
 console.log('PASS contract: Paper room + shared Back, Escape, one centred start, quick check then the ending, onComplete once, no emoji or arrow glyphs');}

// 7. Touch and keyboard: every control is a ≥ 48 px target with a keyboard way to use it.
{for(const m of css.matchAll(/min-height:(\d+)px/g))assert.ok(Number(m[1])>=44,`min-height ${m[1]}px`);
 assert.match(exp,/hitR=\(r:number\)=>Math\.max\(24,r\)/,'hit circles never under 24 px radius');
 for(const h of ['probe','crank','lever','lamp'])assert.match(exp,new RegExp(`data-hit="${h}"[^>]*tabIndex=\\{0\\}`),h+' is focusable');
 assert.match(exp,/onKeyDown=\{keyCrank\}/);assert.match(exp,/onKeyDown=\{keyLamp\(i\)\}/);assert.match(exp,/onKeyDown=\{keyProbe\}/);assert.match(exp,/onKeyDown=\{keyLever\}/);
 assert.match(exp,/ArrowRight'\|\|e\.key==='ArrowUp'\?15/,'arrow keys turn a lamp one detent');
 assert.match(exp,/r=\{22\} className=\{s\.badgeHit\}/,'part badges are 44 px');
 assert.match(exp,/<Slider name="apart"/,'the take-apart slider is a real range input');
 console.log('PASS targets: crank, lever, four lamps, probe and badges are ≥ 44 px, each with a keyboard way in');}

// 8. Heat and reduced motion: one shared loop that stops at rest; no timers; reduced motion lands at once.
{for(const [f,s] of Object.entries(src))assert.ok(!/requestAnimationFrame|setInterval|setTimeout|useRaf|<canvas|WebGL/.test(code(s)),f+': no loop of its own, no timers, no WebGL');
 assert.match(exp,/usePaperLoop\(\(dt\)=>/);assert.match(exp,/,cardRef,reduced\);/,'the shared loop, parked off screen, reduced-motion aware');
 assert.match(exp,/moving=!\(V\.motor&&o===OMEGA_FULL\)/,'with the motor holding full power the loop stops (the wheel is drawn as a blur)');
 assert.match(exp,/return moving;/);assert.match(exp,/if\(!ease\|\|reduced\)\{V\.apart=V\.apartT/,'reduced motion: the tower comes apart at once');
 assert.match(exp,/else if\(reduced\)\{const o=V\.motor\?OMEGA_FULL:0;/,'reduced motion: no run-down, the flywheel stops at once');
 assert.match(exp,/if\(d&&!reduced\)moving=true;/,'reduced motion: a drag never spins the loop to its end');
 assert.match(scene,/const fast=omega>Math\.PI\*1\.4;/,'a fast wheel is a still blur');
 assert.match(exp,/const reduced=useReduced\(\)/);assert.match(exp,/'data-reduced':reduced\|\|undefined/);assert.match(css,/@media \(prefers-reduced-motion:reduce\)\{/);
 for(const m of css.matchAll(/transition:([^;}]+)/g))assert.doesNotMatch(m[1],/\b(width|height|left|top|filter)\b/);
 assert.doesNotMatch(scene+css,/<filter|feGaussian|mix-blend|backdrop-filter/,'no SVG filters or blend modes');
 assert.match(read('components/museum/experiences/anatomy/paper-loop.ts'),/if\(\(more\|\|woke\)&&wanted&&!disposed&&raf\)id=raf\(frame\);else\{wanted=false;last=0;\}/,'the shared loop stops when a tick returns false');
 console.log('PASS heat: one shared loop, only while a control is used or settling; 0 frames at rest; no timers, filters or WebGL; reduced motion lands at once');}

// 9. Registry and lab route.
{assert.match(read('components/museum/experiences/index.tsx'),new RegExp(`'${id}':load\\(\\(\\)=>import\\('\\./${id}/Experience'\\)\\)`));
 assert.match(read(`app/museum-lab/${id}/page.tsx`),new RegExp(`guardLabRoute\\(\\);return <Lab id="${id}"`));
 console.log('PASS registry + lab route');}
console.log('museum-exp-floodlights-1878: all passed');
