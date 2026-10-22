// boots · "Boots through time" in the anatomy Paper style (Oct 12 2026; replaces the back-pass rule exhibit). The user chose:
// "exploded boots from 1900s leather toe-caps → screw-in studs → blades → today's knit; kids build a boot layer by layer, then test
// studs on mud, grass and turf", then asked to see through the layers and what they are made of, to spin the boots all the way
// round, and for today's boot in detail plus famous boot lines of the last 30 years. Checks: verified, safely phrased facts and
// sources; the host contract; the Paper look on the shared anatomy kit with no figures and no logos; a play area that fills the
// screen at 1440 × 900, 1845 × 1110 and 390 × 844; heat (one loop that stops); the turning renderer (360° spin, sole view,
// exploded, see-through, inner parts, materials); build, grip, weigh, superpowers; reduced motion.
// usage: node tests/museum-exp-boots.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const compile=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.ts']=compile;require.extensions['.tsx']=compile;
// the boots are sampled from the Kit Shop's boot (lib/shop/bootGeometry.ts); its three.js ESM helper is never called here
{const Mod=require('node:module'),res=Mod._resolveFilename;Mod._resolveFilename=function(r,...x){return res.call(this,r.includes('three/examples/jsm/utils/BufferGeometryUtils')?'three':r,...x);};}
const root=path.join(__dirname,'..'),dir='components/museum/experiences/boots/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const F=require('../'+dir+'facts.ts'),M=require('../'+dir+'mesh.ts'),Bt=require('../'+dir+'boot.ts'),G=require('../'+dir+'game.ts'),S=require('../'+dir+'stage.ts');
const K=require('../components/museum/experiences/anatomy/iso-kit.ts');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const exp=read(dir+'Experience.tsx'),css=read(dir+'Experience.module.css'),loopSrc=read('components/museum/experiences/anatomy/paper-loop.ts');
const files=fs.readdirSync(path.join(root,dir)).sort(),srcs=Object.fromEntries(files.map(f=>[f,read(dir+f)]));
const code=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
const PARTS=['studs','sole','midsole','insole','counter','lining','upper','toecap','laces'];// + tongue, foam, grip, collar where the boot has them

// 1. Facts and sources: five eras, simple and true, each number hedged the way the sources allow; every iconic line sourced.
{assert.deepEqual(F.ERAS.map(e=>e.id),['early','fifties','seventies','nineties','today']);
 for(const e of F.ERAS){assert.ok(e.facts.length>=3,e.id+' has facts');assert.ok(e.weight.length>5);}
 const all=JSON.stringify([F.ERAS,F.ICONS,F.CHECK,F.MATS,F.PLATES,F.NOT_FOR]);
 assert.match(all,/about 500 grams each, and even more when they got wet/,'the old boot: about 500 g, even heavier wet (not "doubled")');
 assert.doesNotMatch(all,/doubled|double in weight/i,'"doubled when wet" is not claimed');
 assert.match(all,/sticking-out nails or iron plates/,'the 1863 FA rule');assert.match(all,/1954 World Cup final/);assert.match(all,/others had the idea too/,'screw-in studs: the adidas claim phrased safely');
 assert.match(all,/patent in 1949/);assert.match(all,/Puma says it sold screw-in studs in 1952/);
 assert.match(all,/Since about 2014, many top boots have knitted uppers/);assert.match(all,/about 150 to 200 grams/);
 assert.doesNotMatch(all,/million|best-selling boot of all time|\$|£|€|buy /i,'no sales figures, rankings, prices or adverts');
 const copa=F.ICONS.find(i=>i.id==='copa');assert.match(copa.special,/often called one of the best-selling/);assert.equal(copa.year,'1979');
 assert.deepEqual(F.ICONS.map(i=>[i.id,i.year]),[['copa','1979'],['predator','1994'],['mercurial','1998'],['tiempo','Early 1980s'],['king','Late 1960s'],['f50','2004'],['x','2015'],['phantom','2018']]);
 for(const u of ['https://en.wikipedia.org/wiki/Football_boot','https://en.wikisource.org/wiki/Laws_of_the_Game_(1863)_(as_submitted_for_adoption)','https://www.uefa.com/insideuefa/about-uefa/news/newsid=2641357.html',
  'https://dpma.de/english/our_office/publications/milestones/inventionsthatmadehistory/screstudshoe','https://en.wikipedia.org/wiki/Adidas_Predator','https://en.wikipedia.org/wiki/Adidas_Copa_Mundial',
  'https://www.nike.com/mercurial/vapor','https://www.theifab.com/laws/latest/the-players-equipment/','https://www.footballboots.co.uk/soleplate.html'])assert.ok(F.SOURCES.some(s=>s.url===u),'cites '+u);
 assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.SOURCES\]/);assert.match(exp,/<summary>Sources<\/summary>/);assert.match(exp,/exhibit\.facts\[0\]/);assert.match(exp,/take=\{exhibit\.forYourGame\}/);
 assert.match(F.GRIP_NOTE,/practice model/);assert.match(F.COMPARE_NOTE,/rough guide/);assert.match(F.ICON_NOTE,/no logos/);
 console.log('PASS facts: 5 eras, hedged weights, 1863 rule, screw-in studs phrased safely, knit ~2014, 8 iconic lines sourced, no sales claims');}

// 2. Contract.
{assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);
 assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(exp,/data-museum-experience="boots"/);
 assert.equal((exp.match(/<ExperienceBack onClose=\{onClose\}\/>/g)||[]).length,1);assert.doesNotMatch(exp,/NavigationButton|immediate/);assert.match(exp,/e\.key==='Escape'/);
 assert.equal((code(exp).match(/onComplete/g)||[]).length,3,'onComplete only in the props and the Ending');assert.match(exp,/\{checked&&<Ending [^\n]*onComplete=\{onComplete\} reached=\{checked\}\/>\}/);
 assert.match(exp,/<StepCheck items=\{CHECK\.map/);assert.match(exp,/onDone=\{\(\)=>\{setChecked\(true\)/,'the ending is reached only after the quick check');
 assert.equal(F.BEST_KEY,'fi2-museum-boots-best');assert.match(exp,/localStorage\.setItem\(BEST_KEY/);assert.match(exp,/localStorage\.getItem\(BEST_KEY\)/);
 for(const h of ['data-phase','data-era','data-explode','data-xray','data-sel','data-station','data-explode-slider','data-see','data-sole','data-compare-btn','data-plate-btn','data-chip','data-stud','data-test','data-more','data-power-btn','data-start','data-shelf'])assert.ok(exp.includes(h),'hook '+h);
 console.log('PASS contract: dialog, shared Back, Escape, onComplete once via Ending after the quick check, best key fi2-museum-boots-best, hooks');}

// 3. Style: the anatomy kit in the Paper tint, no figures, no pixel kit, no brand marks; one blue accent.
{for(const [f,src] of Object.entries(srcs)){assert.doesNotMatch(src,/anatomy\/figure(\.ts)?['"]/,f+': no human figures (the figure kit is fine: it draws objects)');assert.doesNotMatch(src,/pixeliso|PK Press Start|crispEdges/,f+': no pixel kit');
  assert.doesNotMatch(code(src),/swoosh|three stripes|logo\(/i,f+': no brand marks drawn');}
 assert.deepEqual(files,['Experience.module.css','Experience.tsx','boot.ts','facts.ts','figure.ts','game.ts','mesh.ts','scene.tsx','stage.ts']);
 assert.match(srcs['mesh.ts'],/from '\.\.\/anatomy\/iso-kit'/,'the renderer uses the kit camera');assert.match(exp,/from '\.\.\/anatomy\/bench'/);assert.match(exp,/__html:ISO_CSS\+BOOT_CSS/);
 assert.match(exp,/className=\{`\$\{g\.room\} iso \$\{s\.root\}`\} data-theme="light"/);
 assert.match(css,/\.root\.root\[data-theme\]\{--anatomy-page:#e0e0db;--anatomy-card:#e0e0db;--anatomy-paper:#f7f7f3/,'Paper ground and solids');
 assert.equal(F.ACCENT,'#2a5bd7');assert.match(exp,/'--accent':ACCENT/);
 assert.equal(M.shade('paper',1),'#f9f9f5');assert.equal(M.shade('paper',-1),'#d3d3ce','paper parts use the Paper ramp');
 console.log('PASS style: anatomy kit + Paper tint, no figure / pixel kit / brand marks, one blue accent');}

// 4. Fill the screen, and stay inside the card at every turn.
{assert.match(css,/\.screen\{box-sizing:border-box;height:100vh;height:100dvh;display:grid;grid-template-rows:auto minmax\(0,1fr\) auto/);
 assert.match(css,/\.svg\{position:absolute;inset:0;width:100%;height:100%;touch-action:none/);assert.match(css,/\.root \.scroll\{padding:0;overflow-x:hidden\}/);
 assert.match(exp,/data-play-area data-fill-screen/);assert.match(exp,/viewBox=\{`0 0 \$\{W\} \$\{H\}`\}/);assert.match(exp,/const box=useBox\(card\)/);
 const boot=Bt.buildBoot(F.ERAS[0].spec),zero=()=>[0,0,0];
 for(const [W,H] of [[1400,709],[1805,930],[370,511]]){const wide=W>=700,P=S.fitBench(boot,zero,0,W,H,{top:wide?44:100,bottom:30,pad:wide?20:10});
  const pts=boot.parts.flatMap(p=>p.meshes.flatMap(m=>m.verts));let fill=0;
  for(let i=0;i<8;i++){const b=M.screenBounds(pts,P,{theta:G.HOME+i*G.STEP,phi:0,C:boot.C,lift:0});assert.ok(b.x0>=-1&&b.x1<=W+1&&b.y0>=-1&&b.y1<=H+1,`the boot stays in the ${W}×${H} card at ${i*45}°`);fill=Math.max(fill,(b.x1-b.x0)/W,(b.y1-b.y0)/H);}
  const sole=M.screenBounds(pts,P,{theta:G.HOME,phi:Math.PI,C:boot.C,lift:0});assert.ok(sole.y1<=H+1&&sole.y0>=-1,'the sole view stays in the card');
  assert.ok(fill>.5,`the boot fills the ${W}×${H} card (${Math.round(fill*100)}%)`);}
 console.log('PASS fill: 100dvh screen, card = 1fr, viewBox = measured card, the boot stays inside at all 8 angles and rolled, fills > 50%');}

// 5. Heat: one frame loop (paper-loop via bench useRaf) that runs only while something moves.
{for(const [f,src] of Object.entries(srcs))assert.doesNotMatch(code(src),/requestAnimationFrame|setInterval/,f+' keeps no frame loop of its own');
 assert.match(exp,/const wake=useRaf\(dt=>\{/);assert.match(exp,/return moving;\n \},live\);/,'the tick reports whether anything still moves');
 assert.match(loopSrc,/else\{wanted=false;last=0;\}/);assert.match(loopSrc,/cancelAnimationFrame\(id\)/);
 assert.match(exp,/useEffect\(\(\)=>\(\)=>timers\.current\.forEach\(clearTimeout\),\[\]\)/);
 assert.match(exp,/paint\(moving\);if\(!moving&&!spin\.current\.dragging\)paint\(false\)/,'a lighter mesh while moving, the full one at rest');
 // the spin comes to rest by itself
 const s=G.newSpin();s.dragging=false;s.omega=6;let n=0;while(G.stepSpin(s,1/60)&&n<2000)n++;assert.ok(n<600,'a flick glides and settles in under 10 s ('+n+' frames)');
 assert.ok(Math.abs(((s.theta-G.HOME)/G.STEP)-Math.round((s.theta-G.HOME)/G.STEP))<1e-6,'it rests on one of the 8 angles');assert.equal(G.stepSpin(s,1/60),false,'0 frames at rest');
 console.log('PASS heat: no own rAF / intervals, the loop stops when nothing moves, a flick settles on a fixed angle, low detail only in motion');}

// 6. Spin and roll: full 360° by drag, buttons and keys; sole view; reduced motion = 8 fixed angles, no glide.
{const s=G.newSpin();for(let i=0;i<8;i++)G.nudge(s,1,true);assert.ok(Math.abs(G.degOf(s.theta))<1e-9||G.degOf(s.theta)===0,'eight steps = a full turn');
 G.nudge(s,1,true);assert.equal(G.degOf(s.theta),45);G.nudge(s,-1,true);assert.equal(G.degOf(s.theta),0);
 G.flip(s,true);assert.equal(s.phi,Math.PI,'Sole rolls it over at once (reduced)');G.flip(s,true);assert.equal(s.phi,0);
 const d=G.newSpin();d.dragging=true;d.phi=2;G.release(d);assert.equal(d.phiTo,Math.PI,'let go past half way: it rolls to the sole');
 for(const k of ["e.key==='ArrowLeft'||e.key==='ArrowRight'","e.key==='ArrowUp'||e.key==='ArrowDown'"])assert.ok(exp.includes(k),'keys: '+k);
 assert.match(exp,/if\(reduced\)\{const dx=e\.clientX-d\.x,dy=e\.clientY-d\.y;if\(Math\.abs\(dy\)>Math\.abs\(dx\)&&Math\.abs\(dy\)>30\)roll\(dy<0\);else if\(Math\.abs\(dx\)>24\)turn\(dx>0\?1:-1\);return;\}/,'reduced motion: a drag steps one angle');
 console.log('PASS spin: 8 × 45° = 360°, sole roll, release rolls to the nearest side, arrow keys, reduced motion steps');}

// 7. The boots: every era and line is a dense model with its layers; renders in Node at any angle, apart, seen through, sole up.
{for(const e of [...F.ERAS,...F.ICONS]){const b=Bt.buildBoot(e.spec);const ids=b.parts.map(p=>p.id);
  for(const id of PARTS)assert.ok(ids.includes(id),`${e.id} has a ${id}`);assert.ok(b.faces>1500,`${e.id} is detailed (${b.faces} faces)`);}
 const today=F.ERAS.find(e=>e.id==='today'),tb=Bt.buildBoot(today.spec);for(const id of ['foam','grip','collar'])assert.ok(tb.parts.some(p=>p.id===id),'today also has '+id);
 assert.ok(tb.parts.length>=12,'today is the deepest dive ('+tb.parts.length+' layers)');
 const b=Bt.buildBoot(F.ERAS[1].spec),P=K.fitProjection([[-300,-300,-40],[300,300,300]],1200,800,{pad:20}),meshes=b.parts.flatMap(p=>p.meshes),marks=b.parts.flatMap(p=>p.marks),inner=new Set(b.parts.filter(p=>p.inner).map(p=>p.id));
 const pose=(theta,phi=0)=>({theta,phi,C:b.C,lift:0}),base={mats:F.MATS,skins:new Set(b.parts.filter(p=>p.skin).map(p=>p.id)),assembled:()=>true};
 const whole=M.draw(meshes,marks,P,pose(G.HOME),{...base,hidden:id=>inner.has(id)});
 assert.ok(whole.faces>700,'a dense solid boot ('+whole.faces+' faces drawn)');assert.match(whole.svg,/class="bt-edge"/);assert.match(whole.svg,/class="bt-crease"/);
 for(const id of ['upper','sole','toecap'])assert.match(whole.svg,new RegExp(`data-part="${id}"`),id+' tappable');assert.doesNotMatch(whole.svg,/data-part="counter"/,'inner layers hidden while the boot is whole');
 const back=M.draw(meshes,marks,P,pose(G.HOME+Math.PI),{...base,hidden:id=>inner.has(id)});assert.notEqual(back.svg,whole.svg,'turned 180°: a different view');
 const sole=M.draw(meshes,marks,P,pose(G.HOME,Math.PI),{...base,hidden:id=>inner.has(id)});const studFaces=s=>(s.match(/data-part="studs"/g)||[]).length;
 const mean=(svg,id)=>{const r=new RegExp(`data-part="${id}"`,'g');let n=0,t=0,m;while((m=r.exec(svg))){n++;t+=m.index;}return t/n;};assert.ok(studFaces(sole.svg)>0&&mean(sole.svg,'studs')>mean(sole.svg,'sole'),'sole up: the studs are drawn over the sole');assert.ok(mean(whole.svg,'sole')>mean(whole.svg,'studs'),'upright: the sole is drawn over the studs');
 // see-through: the skins go to glass, the inner parts and the screw inserts show
 const xr=M.draw(meshes,marks,P,pose(G.HOME),{...base,xray:1,hidden:()=>false});
 assert.match(xr.svg,/data-part="upper"[^>]*fill-opacity="0\.2/,'the upper turns see-through');assert.match(xr.svg,/data-part="counter"/,'the heel counter shows inside');
 assert.ok(meshes.some(m=>m.xray),'screw-in stud threads exist');assert.doesNotMatch(whole.svg,/#8f949b/,'the steel thread is hidden while solid');assert.ok(xr.svg.includes(M.shade('#8f949b',1).slice(0,4))||/fill="#[0-9a-f]{6}"/.test(xr.svg));
 // exploded: the layers move apart along their own directions
 const off=p=>p.out,ax=S.anchors(b,PARTS,off,P,pose(G.HOME),F.LAYERS),ay=S.anchors(b,PARTS,()=>[0,0,0],P,pose(G.HOME),F.LAYERS);
 assert.ok(ax.find(a=>a.id==='studs').y-ay.find(a=>a.id==='studs').y>40&&ay.find(a=>a.id==='laces').y-ax.find(a=>a.id==='laces').y>40,'apart: studs drop, laces lift');
 const lab=S.labelsSvg(ax,1200,800,'upper','side');assert.equal((lab.match(/class="bt-label"/g)||[]).length,PARTS.length,'a leader-line label per layer');assert.match(lab,/data-part="upper" class="bt-label" data-sel=""/);
 assert.equal((S.labelsSvg(ax,370,500,null,'dots').match(/class="bt-dot"/g)||[]).length,PARTS.length,'numbered dots on a phone');
 assert.ok(S.turntable(P,0).includes('iso-solid')&&S.turntable(P,0)!==S.turntable(P,1),'the turntable ticks turn with the boot');
 console.log('PASS boots: 5 eras + 8 lines with all layers, > 1500 faces each; whole, turned, sole up, see-through, apart with labels');}

// 7b. Shapes (Oct 13 2026, user: "these need to look better, more like the shapes in the boot store"): every boot is sampled from
// a Kit Shop silhouette (lib/shop/bootGeometry.ts + bootProfiles.ts), era by era; a light level of detail for the SVG renderer.
{const SG=require('../lib/shop/bootGeometry.ts'),BS=require('../lib/shop/boots.ts'),src=srcs['boot.ts'];
 assert.match(src,/from '\.\.\/\.\.\/\.\.\/\.\.\/lib\/shop\/bootGeometry'/,'the exhibit imports the shop geometry');
 assert.deepEqual(F.ERAS.map(e=>e.spec.model),['classic','retro','classic','fins','sock'],'eras: 1900s from the classic, 1950s retro, 70s–80s classic, 90s power fins, today the sock boot');
 for(const e of [...F.ERAS,...F.ICONS])assert.ok(BS.MODEL_IDS.includes(e.spec.model),e.id+' uses a shop silhouette');
 const by=id=>Bt.buildBoot(F.ERAS.find(e=>e.id===id).spec),early=by('early'),fifties=by('fifties'),seventies=by('seventies'),nineties=by('nineties'),today=by('today');
 const part=(b,id)=>b.parts.find(p=>p.id===id),zTop=(b,id)=>part(b,id).box.z1;
 // the length of a real boot (about 27 cm), the shop's toe spring: the toe tip lifts off the ground, the heel stands on its block
 for(const b of [early,seventies,today]){const xs=part(b,'upper').meshes[0].verts.map(v=>v[0]);assert.ok(Math.max(...xs)-Math.min(...xs)>250&&Math.max(...xs)-Math.min(...xs)<285,'about 27 cm long');}
 const toeZ=b=>{const v=part(b,'sole').meshes[0].verts;const xm=Math.max(...v.map(p=>p[0]));return Math.min(...v.filter(p=>p[0]>xm-6).map(p=>p[2]));};
 assert.ok(toeZ(seventies)>part(seventies,'sole').box.z0+4,'toe spring: the sole curves up at the toe');
 // collar heights follow the shop's traced profiles: early over the ankle, 1950s the lowest cut, today's sock collar up the leg
 assert.ok(zTop(early,'upper')>zTop(seventies,'upper')+40,'the early boot comes up over the ankle ('+Math.round(zTop(early,'upper'))+' mm)');
 assert.ok(zTop(fifties,'upper')<zTop(seventies,'upper'),'the 1950s boot is cut lower');
 assert.ok(zTop(today,'collar')>zTop(today,'upper')+25,'today: a sock collar up the leg');
 SG.useShape('classic');const g0=SG.base(0)+SG.rim(0);SG.useShape('speed');
 assert.ok(Math.abs(zTop(seventies,'upper')-zTop(seventies,'insole'))<g0*100,'the collar stands at the shop profile height');
 // real parts from the shop: a tongue (folded over the laces on the classic), fins on the 90s boot, eyelet rows, a toe-cap on the early boot
 for(const b of [early,fifties,seventies,nineties])assert.ok(part(b,'tongue'),'a laced boot has a tongue');assert.ok(!part(today,'tongue'),'the sock boot has no tongue');
 assert.ok(part(nineties,'upper').meshes.some(m=>m.mat==='rubber'),'rubber fins on the 1990s boot');
 SG.useShape('classic');const eyes=SG.eyeletRows().length;SG.useShape('speed');
 assert.ok(part(seventies,'laces').marks.filter(m=>m.dots).length>=eyes*2,'eyelets on the shop eyelet rows');
 assert.ok(!part(early,'toecap').inner&&part(today,'toecap').inner,'a hard toe-cap on the early boot, a toe box inside today');
 assert.equal(SG.shape().id,'speed','building a boot leaves the shop shape as it was');
 // heat: modest faces per boot, a lighter mesh in motion, cached
 for(const e of [...F.ERAS,...F.ICONS]){const b=Bt.buildBoot(e.spec),lo=Bt.buildBoot(e.spec,.6);assert.ok(b.faces<3200&&lo.faces<1800,`${e.id}: ${b.faces} faces, ${lo.faces} in motion`);assert.equal(Bt.buildBoot(e.spec),b,'cached per boot');}
 console.log('PASS shapes: sampled from the Kit Shop silhouettes (classic, retro, classic, fins, sock), over-the-ankle 1900s boot, toe spring, tongue, fins, eyelets; < 3200 faces, cached');}

// 7c. Solid (Oct 13 2026, user: "can see through the boots"; then: white specks and cracks along the seams, a stepped toe-cap edge,
// laces hidden under the tongue). The renderer's own SVG is rasterised here in painter order (faces only, pixel centres) and
// checked: looking into the opening from straight above, from ¾ above and rolled towards the viewer, every pixel inside the collar
// shows the footbed or the inside of the boot (never the studs, the plate or the turntable), and seen from ¾ above and from the
// side no background shows through inside the boot's outline.
{const RW=420,RH=320;
 const fillPoly=(pts,set)=>{let y0=Infinity,y1=-Infinity;for(const p of pts){y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1]);}
  for(let y=Math.max(0,Math.ceil(y0-.5));y<=Math.min(RH-1,Math.floor(y1-.5));y++){const cy=y+.5,xs=[];
   for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];if((a[1]<=cy)!==(b[1]<=cy))xs.push(a[0]+(cy-a[1])/(b[1]-a[1])*(b[0]-a[0]));}
   xs.sort((a,b)=>a-b);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.max(0,Math.ceil(xs[k]-.5));x<=Math.min(RW-1,Math.floor(xs[k+1]-.5));x++)set(y*RW+x);}};
 const render=(b,theta,phi,elev)=>{const pts=b.parts.flatMap(p=>p.meshes.flatMap(m=>m.verts)),pose={theta,phi,C:b.C,lift:0};
  let P={origin:[0,0],scale:1,azimuth:45,elevation:elev};const bb=M.screenBounds(pts,P,pose);P={...P,scale:Math.min((RW-30)/(bb.x1-bb.x0),(RH-30)/(bb.y1-bb.y0))};
  const b2=M.screenBounds(pts,P,pose);P.origin=[RW/2-(b2.x0+b2.x1)/2,RH/2-(b2.y0+b2.y1)/2];const inner=new Set(b.parts.filter(p=>p.inner).map(p=>p.id));
  const svg=M.draw(b.parts.flatMap(p=>p.meshes),b.parts.flatMap(p=>p.marks),P,pose,{mats:F.MATS,hidden:id=>inner.has(id),skins:new Set(b.parts.filter(p=>p.skin).map(p=>p.id)),assembled:()=>true}).svg;
  const ids=new Int16Array(RW*RH).fill(-1),names=[],re=/<path data-part="([^"]+)" d="(M[^"]*Z)"/g;let m;
  while((m=re.exec(svg))){let id=names.indexOf(m[1]);if(id<0){id=names.length;names.push(m[1]);}fillPoly(m[2].slice(1,-1).split('L').map(t=>t.split(' ').map(Number)),i=>{ids[i]=id;});}
  return {ids,names,P,pose};};
 const through=(b,theta,phi,elev)=>{const {ids,names,P,pose}=render(b,theta,phi,elev),c=M.cam(P),T=M.poseFn(pose);
  const op=b.opening.map(p=>M.toScreen(T.point(p),c)),cx=op.reduce((a,p)=>a+p[0],0)/op.length,cy=op.reduce((a,p)=>a+p[1],0)/op.length,hit={n:0};
  fillPoly(op.map(p=>[cx+(p[0]-cx)*.7,cy+(p[1]-cy)*.7]),i=>{hit.n++;const nm=ids[i]<0?'turntable':names[ids[i]];hit[nm]=(hit[nm]||0)+1;});return hit;};
 const holes=(b,theta,phi,elev)=>{const {ids}=render(b,theta,phi,elev),seen=new Uint8Array(RW*RH),st=[];let area=0;for(let i=0;i<RW*RH;i++)if(ids[i]>=0)area++;
  for(let x=0;x<RW;x++)st.push(x,(RH-1)*RW+x);for(let y=0;y<RH;y++)st.push(y*RW,y*RW+RW-1);
  while(st.length){const i=st.pop();if(seen[i]||ids[i]>=0)continue;seen[i]=1;const x=i%RW,y=(i-x)/RW;if(x>0)st.push(i-1);if(x<RW-1)st.push(i+1);if(y>0)st.push(i-RW);if(y<RH-1)st.push(i+RW);}
  // a hole: enclosed background with background on all four sides (one-pixel slivers on the outline close under the .6 px strokes)
  let n=0;for(let y=1;y<RH-1;y++)for(let x=1;x<RW-1;x++){const i=y*RW+x;if(ids[i]<0&&!seen[i]&&ids[i-1]<0&&ids[i+1]<0&&ids[i-RW]<0&&ids[i+RW]<0)n++;}return {n,area};};
 for(const e of [...F.ERAS,...F.ICONS]){const b=Bt.buildBoot(e.spec);assert.ok(b.opening.length>8,e.id+' has an opening rim');
  const top=through(b,G.HOME,0,88);assert.ok(top.n>800,e.id+': the opening is sampled from above ('+top.n+' px)');
  assert.ok(!top.studs&&!top.turntable&&!top.sole&&!top.midsole,`${e.id}, from straight above: every ray through the collar meets the footbed or the lining first ${JSON.stringify(top)}`);
  for(const [nm,t,p,el] of [['¾ above',0,0,60],['rolled towards you',150,75,30]]){const h=through(b,G.HOME+t*Math.PI/180,p*Math.PI/180,el);
   assert.ok(!h.studs&&(h.turntable||0)<=h.n*.005&&(h.sole||0)+(h.midsole||0)<=h.n*.01,`${e.id}, ${nm}: no studs, plate or turntable through the opening ${JSON.stringify(h)}`);}
  for(const [nm,t,el] of [['¾ above',0,30],['side',-24,5],['back',180,30]]){const h=holes(b,G.HOME+t*Math.PI/180,0,el);assert.ok(h.n<=h.area*.002,`${e.id}, ${nm}: no background inside the outline (${h.n} px of ${h.area})`);}}
 // the floor is drawn while whole; the inner walls are the upper's own back faces in a darker lining tone
 const b=Bt.buildBoot(F.ERAS[2].spec),ins=b.parts.find(p=>p.id==='insole');assert.ok(!ins.inner&&ins.meshes[0].floor,'the insole is the footbed, drawn while whole');
 assert.ok(b.parts.find(p=>p.id==='upper').meshes[0].shell&&b.parts.find(p=>p.id==='studs').meshes.every(m=>m.low===true),'walls and what lies under the foot are marked for the painter');
 // laces sit on top: every lace crossing faces out and sorts ahead of the tongue and the upper; seams take the material's tone
 const lc=b.parts.find(p=>p.id==='laces').marks.filter(k=>!k.dots&&k.w>2);assert.ok(lc.length>=8&&lc.every(k=>k.n&&(k.bias??0)>=4),'criss-cross laces over the eyelets, on top');
 const toe=b.parts.find(p=>p.id==='toecap').meshes[0];assert.ok(!toe.two&&toe.twoApart&&toe.bias>=9,'the outer toe-cap is one-sided and sorts ahead of the upper (no stepped edge)');
 assert.ok(b.parts.find(p=>p.id==='upper').marks.every(k=>k.color!==F.ERAS[2].spec.stitch||k.on),'stitching is toned into its material, not a white crack');
 console.log('PASS solid: from above, ¾ above and rolled, the collar shows the footbed and lining (never studs, plate or turntable); no holes inside the outline at ¾, side, back; laces on top; clean toe-cap');}

// 8. Cutaway / materials: every layer of every boot has a material with a name and a kid line; the compare strip.
{const {matOf,namesFor}=G;
 for(const e of [...F.ERAS,...F.ICONS]){const b=Bt.buildBoot(e.spec);for(const p of b.parts){const id=matOf(e.spec,p.id);assert.ok(F.MATS[id]&&F.MATS[id].name&&F.MATS[id].line,`${e.id} ${p.id} → ${id}`);}}
 const want={early:{upper:'cowhide',toecap:'hardcap',studs:'leatherstud',sole:'leathersole'},fifties:{upper:'calf',studs:'alu'},seventies:{upper:'kangaroo',studs:'studrubber'},nineties:{upper:'synthetic',studs:'bladetpu'},today:{upper:'knit',foam:'foam',sole:'tpu',collar:'sock',grip:'grip'}};
 for(const [era,m] of Object.entries(want))for(const [part,mat] of Object.entries(m))assert.equal(matOf(F.ERAS.find(e=>e.id===era).spec,part),mat,`${era} ${part} is ${mat}`);
 assert.match(F.MATS.hardcap.line,/Some old boots even used steel/);assert.match(F.MATS.carbon.line,/Some top boots/);assert.match(F.MATS.metal.line,/often with metal tips/);
 for(const [id,c] of Object.entries(F.COMPARE)){assert.deepEqual(c.rows.map(r=>r.era),['early','fifties','seventies','nineties','today'],id+' across all eras');for(const r of c.rows)for(const k of ['heavy','dry','bend'])assert.ok(r[k]>=1&&r[k]<=5);}
 assert.ok(F.COMPARE.upper.rows[0].heavy>F.COMPARE.upper.rows[4].heavy,'old leather heavier than knit');
 assert.equal(namesFor({...F.ERAS[4].spec}).laces.name,'Lace cover');assert.equal(namesFor(F.ERAS[4].spec).sole.name,'Soleplate');assert.equal(namesFor(F.ERAS[4].spec).toecap.name,'Toe box');
 assert.deepEqual(Object.keys(F.PLATES),['fg','sg','ag','tf','ic']);for(const p of Object.values(F.PLATES))assert.ok(p.line.length>20);
 assert.match(exp,/data-compare=\{compare\}/);assert.match(exp,/data-bar=\{key\}/);assert.match(exp,/<Swatch mat=\{r\.mat\}\/>/);
 const sw=renderToStaticMarkup(React.createElement(require('../'+dir+'scene.tsx').Swatch,{mat:'knit'}));assert.match(sw,/bt-swatch/);
 console.log('PASS materials: every layer of every boot has a sourced material + kid line, compare strip 4 layers × 5 eras, today’s 5 plates');}

// 9. Build, grip, weigh, superpowers.
{const b=Bt.buildBoot(F.ERAS[0].spec),o=G.buildOrder(b);assert.deepEqual(o.slice(0,4),['studs','sole','midsole','insole'],'from the ground up');assert.equal(o[o.length-1],'laces');
 assert.equal(G.nextPart(o,new Set()),'studs');assert.equal(G.tryPlace(o,new Set(),'studs',F.LAYERS).ok,true);assert.equal(G.tryPlace(o,new Set(),'upper',F.LAYERS).ok,false);
 assert.match(G.tryPlace(o,new Set(),'upper',F.LAYERS).say,/higher up/);assert.equal(G.buildScore(o.length,o.length),10);assert.equal(G.buildScore(0,o.length),0);
 const sh=G.shuffled(o,()=>.99);assert.notDeepEqual(sh,o,'the chips never start in order');assert.deepEqual([...sh].sort(),[...o].sort());
 const v=(s,f)=>F.verdictOf(s,f).v;
 assert.equal(v('sg','mud'),'grips');assert.equal(v('ic','indoor'),'grips');assert.equal(v('ag','ag'),'grips');assert.equal(v('fg','dry'),'grips');
 assert.equal(v('fg','indoor'),'not');assert.equal(v('sg','ag'),'not');assert.equal(v('blade','ag'),'not');assert.equal(v('tf','mud'),'slips');assert.equal(v('ic','mud'),'slips');
 assert.match(F.verdictOf('sg','ag').say,/Many artificial pitches/);assert.equal(F.GRIP_ROUNDS.length,5);assert.equal(Math.max(...F.GRIP_ROUNDS.map(s=>Math.max(...Object.keys(F.GRIP_STUDS).map(k=>F.verdictOf(k,s).pts))))*5,10);
 assert.equal(F.OLD_G,500);assert.equal(F.NEW_G,155);assert.ok(F.balanceOf(0)<-.9&&Math.abs(F.balanceOf(3))<.1&&F.balanceOf(4)>.2,'three modern boots about balance one old boot');
 const r=G.matchRound();assert.deepEqual(r.map(i=>i.power).sort(),['control','power','speed','touch']);
 assert.equal(G.MAX_SCORE,24);assert.equal(G.total(10,10,4),24);
 console.log('PASS play: build from the ground up (first-try score), grip verdicts for 5 pitches, 3 modern ≈ 1 old boot, superpower round');}

// 10. Reduced motion: still versions of everything.
{assert.match(exp,/if\(reduced\)\{a\.ex=v;paint\(\);say\(readout\(\)\);\}else wake\(\);/,'explode jumps');assert.match(exp,/if\(reduced\)\{a\.xr=a\.xrTo;paint\(\);say\(readout\(\)\);\}else wake\(\);/,'see-through jumps');
 assert.match(exp,/nudge\(spin\.current,d,reduced\)/);assert.match(exp,/if\(reduced\)\{A\.current\.place\[id\]=0;paint\(\);\}/,'a layer snaps in');
 assert.match(exp,/if\(reduced\)\{G\.force=/,'the grip test shows its result at once');assert.match(exp,/if\(reduced\)\{B\.tilt=B\.to;\}/,'the balance settles at once');
 assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
 console.log('PASS reduced motion: 8 fixed angles, instant explode / see-through / build / grip / balance');}

// Run, plant, kick (museum-figures-2, figure kit v2): one boot that turns all the way round; see-through shows the layers (insole,
// heel counter, toe box) over the soleplate and studs; moulded or screw-in studs; swatches = the Kit Shop's boot colours; three
// steps that bend the sole, sink the studs and swing the kick, each lighting its parts; ≤ 120 parts; the flow kept.
{const FK=require('../components/museum/experiences/anatomy/figure-kit.ts'),BF=require('../'+dir+'figure.ts'),SHOP=require('../lib/shop/boots.ts');
 const fig=BF.makeBootFigure(),spec=fig.spec,c=FK.centreOf(spec.points),P0=FK.fitTurn(spec.points,900,700,60,28,{pad:24,top:80});
 const view=(yaw,pitch,xray,swatch=null,active=[])=>{const P=FK.turnProjection(P0,c,yaw,pitch),{R,U,V}=FK.basis(yaw,pitch);
  return {yaw,pitch,P,V,R,U,L:FK.lightOf(yaw,pitch),xray,swatch,swatchHex:FK.swatchList(spec.swatches).find(s=>s.id===swatch)?.hex??null,active:new Set(active),w:900,h:700};};
 for(const screw of [false,true]){fig.setScrew(screw);
  for(let yaw=0;yaw<360;yaw+=45)for(const x of [0,1]){const d=spec.draw(view(yaw,30,x));const n=FK.countParts(d.svg)+d.labels.length*7;
   assert.ok(n<=FK.MAX_PARTS,yaw+'/'+x+': '+n+' parts');for(const l of d.labels)assert.ok(FK.anchorFor(l,FK.viewVector(yaw,30)),l.id+' reachable at yaw '+yaw);}}
 fig.setScrew(false);const closed=spec.draw(view(60,28,0)),open=spec.draw(view(60,28,1));
 assert.deepEqual(closed.labels.map(l=>l.text).sort(),['Laces','Moulded studs','Soleplate','Upper']);
 assert.deepEqual(open.labels.map(l=>l.text).sort(),['Heel counter','Insole','Laces','Moulded studs','Soleplate','Toe box','Upper'],'the layers inside are named only when drawn');
 for(const id of ['insole','heel','toebox'])assert.ok(open.svg.includes('data-part="'+id+'"')&&!closed.svg.includes('data-part="'+id+'"'),'see-through layer '+id);
 assert.equal((closed.svg.match(/data-stud="moulded"/g)||[]).length,BF.STUDS.length);fig.setScrew(true);const sc=spec.draw(view(60,28,1));
 assert.equal((sc.svg.match(/data-stud="screw"/g)||[]).length,BF.STUDS.length);assert.match(sc.svg,/data-screws/,'see-through shows the screws');assert.ok(sc.labels.some(l=>l.text==='Screw-in studs'));fig.setScrew(false);
 const names=FK.swatchList(spec.swatches).map(s=>s.name);assert.deepEqual(names,['White','Red','Royal','Volt','Gold']);
 for(const s of FK.swatchList(spec.swatches))assert.equal(s.hex,SHOP.PALETTE.find(p=>p.name===s.name).hex,'the Kit Shop colour '+s.name);
 assert.notEqual(spec.draw(view(60,28,0,'red')).svg,closed.svg,'swatches recolour the upper');
 const sole0=spec.draw(view(60,28,0)).svg;fig.pose('run',true);assert.ok(fig.state.flex>0,'run: the sole bends');assert.notEqual(spec.draw(view(60,28,0)).svg,sole0);
 fig.pose('plant',true);assert.ok(fig.state.sink>0&&fig.state.flex===0,'plant: the studs bite');fig.pose('kick',true);assert.ok(fig.state.swing>0,'kick: the boot swings');
 fig.pose(null,false);let n=0;while(spec.tick(1/60)&&n<400)n++;assert.ok(n>5&&n<200,'eases back then sleeps ('+n+')');assert.equal(spec.tick(1/60),false);
 assert.deepEqual(BF.STEPS.map(s=>s.id),['run','plant','kick']);for(const s of BF.STEPS){for(const id of s.lit)assert.ok(open.labels.some(l=>l.id===id),s.id+' lights a real label '+id);assert.ok(F.FIGURE_SAY[s.id]);}
 for(const k of ['upper','laces','soleplate','studs','screw','insole','heel','toebox'])assert.ok(F.FIGURE_SAY[k],'says '+k);
 assert.match(F.FIGURE_SAY.screw,/1954 World Cup/);assert.match(F.FIGURE_SAY.studs,/hammered/);assert.doesNotMatch(Object.values(F.FIGURE_SAY).join(' '),/adidas|puma|nike|million|\$/i,'no brands or sales');
 assert.match(exp,/<FigureStage spec=\{bootFig\.spec\}/);for(const h of ['data-boot-figure','data-run-plant-kick','data-fig-back','data-fig-screw','data-fig-note'])assert.ok(exp.includes(h),'hook '+h);
 assert.match(exp,/figTimers\.current\.forEach\(clearTimeout\)/,'the step timers are cleared');assert.doesNotMatch(read(dir+'figure.ts'),/requestAnimationFrame|setInterval/);
 console.log('PASS run, plant, kick: turns all the way round (8 yaws), see-through layers, moulded / screw-in studs, Kit Shop swatches, 3 lit steps, labels from every yaw, ≤ 120 parts');}

