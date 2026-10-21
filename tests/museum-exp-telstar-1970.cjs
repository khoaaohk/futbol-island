// telstar-1970 · "Mexico 70 on air" in the anatomy Paper style (Oct 12 2026 restyle; user: "these games should not be the pixel
// style. only the penalty kick should be pixel game", "larger and fill the entire screen", then every exhibit except the penalty
// kick in the anatomy isometric technical-illustration look). Checks: the case's facts and sources, the host contract
// (ExperienceBack, Escape, onComplete only at the real end), no pixel kit left, the Paper look on the shared anatomy kit, a play
// area that fills the screen (measured viewBox, landscape + portrait frames, the model filling the card at 1440 × 900 and
// 390 × 844), heat (one frame loop that stops, pauses off screen, is cancelled on unmount), the game rules (stitch 12 + 20, the
// turning ball, the seeded match, the viewfinder, the black-and-white lesson in real greys), reduced motion, and the machines
// rendered in Node.
// usage: node tests/museum-exp-telstar-1970.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
const compile=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX}}).outputText,f);
require.extensions['.ts']=compile;require.extensions['.tsx']=compile;
const root=path.join(__dirname,'..'),dir='components/museum/experiences/telstar-1970/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const X=require('../lib/endgame/museum.ts'),M=require('../'+dir+'model.ts'),C=require('../'+dir+'content.ts'),G=require('../'+dir+'geometry.ts');
const B=require('../components/museum/experiences/anatomy/bench.tsx'),S=require('../'+dir+'scene.tsx'),K=require('../components/museum/experiences/anatomy/iso-kit.ts');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
const exp=read(dir+'Experience.tsx'),model=read(dir+'model.ts'),scene=read(dir+'scene.tsx'),bench=read('components/museum/experiences/anatomy/bench.tsx'),loopSrc=read('components/museum/experiences/anatomy/paper-loop.ts'),css=read(dir+'Experience.module.css');
const e=X.EXHIBITS.find(x=>x.id==='telstar-1970');
const files=fs.readdirSync(path.join(root,dir)).sort();
const code=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');

// 1. Facts and sources: the case's three facts and its game line, word for word from the exhibit; the sourced extras kept.
{assert.equal(e.facts.length,3);for(const i of [0,1,2])assert.match(exp,new RegExp(`exhibit\\.facts\\[${i}\\]`),`fact ${i+1} is shown`);
 assert.match(exp,/take=\{exhibit\.forYourGame\}/);assert.match(e.facts[1],/32 panels were black and white/);
 assert.match(C.EXTRA.name,/named after Telstar, a ball-shaped satellite launched in 1962/);assert.match(C.EXTRA.made,/Only 20 Telstars were made/);assert.match(C.EXTRA.made,/Select, made one in 1962/);
 assert.match(C.EXTRA.panels,/12 black pentagons .*20 white hexagons/);assert.match(C.EXTRA.live,/live around the world by satellite/);
 for(const k of ['name','made','panels','live'])assert.ok(exp.includes(`EXTRA.${k}`),'extra shown: '+k);
 assert.match(C.MODEL_NOTE,/pretend/,'the pretend match is labelled');assert.match(exp,/\{MODEL_NOTE\}/);
 for(const url of ['https://en.wikipedia.org/wiki/Telstar_1','https://www.sciencemuseum.org.uk/objects-and-stories/telstar-intelsat-and-first-global-satellite-broadcast','https://americanhistory.si.edu/collections/object/nmah_682185','https://en.wikipedia.org/wiki/List_of_FIFA_World_Cup_official_match_balls','https://www.britannica.com/technology/Telstar-communications-satellite'])
  assert.ok(C.EXTRA_SOURCES.some(s=>s.url===url),'cites '+url);
 assert.match(exp,/\[\.\.\.exhibit\.sources,\.\.\.EXTRA_SOURCES\]/);assert.match(exp,/<summary>Sources<\/summary>/);
 console.log('PASS facts: 3 case facts + the game line + 4 sourced extras, pretend match labelled, every source listed');}

// 2. Contract: dialog root, one shared Back, Escape, onComplete only through Ending once the game AND the quick check are done.
{assert.match(exp,/export default function Experience\(\{exhibit,onClose,onComplete\}:ExperienceProps\)/);
 assert.match(exp,/role="dialog" aria-modal="true"/);assert.match(exp,/data-museum-experience="telstar-1970"/);
 assert.equal((exp.match(/<ExperienceBack onClose=\{onClose\}\/>/g)||[]).length,1);assert.doesNotMatch(exp,/NavigationButton|immediate/);
 assert.match(exp,/e\.key==='Escape'/);assert.match(exp,/className=\{`\$\{g\.room\}/,'the gallery room (fixed, full screen)');
 assert.equal((code(exp).match(/onComplete/g)||[]).length,3,'onComplete: received, then handed to Ending only (onComplete={onComplete})');
 assert.match(exp,/\{checked&&<Ending [^\n]*onComplete=\{onComplete\} reached=\{checked\}\/>\}/,'the ending (and the gold stamp) only after the quick check');
 assert.match(exp,/const checked=picked!=null/);assert.match(exp,/phase==='score'&&<div className=\{s\.panel\} data-score-panel>/,'the quick check lives on the full-time panel, after both halves');
 assert.match(exp,/<StepCheck items=\{\[CHECK\]\}/,'the shared quick check');assert.match(exp,/import WallLabel from '\.\.\/modern\/WallLabel'/);
 for(const h of ['data-phase','data-gap','data-stitched','data-picture','data-ball','data-piece','data-kick-off','data-second-half','data-play-again','data-play-colour','data-stitch-rest','data-tray-hit','data-viewfinder'])assert.ok(exp.includes(h)||scene.includes(h),'test hook '+h);
 assert.match(read('app/museum-lab/telstar-1970/page.tsx'),/guardLabRoute\(\);return <Lab id="telstar-1970"/,'the dev lab route');
 assert.match(read('components/museum/experiences/index.tsx'),/'telstar-1970':load\(\(\)=>import\('\.\/telstar-1970\/Experience'\)\)/);
 assert.equal(C.BEST_KEY,'futbol.museum.telstar.onAirBest');assert.match(exp,/try\{localStorage\.setItem\(BEST_KEY/,'best scores (guarded storage)');
 console.log('PASS contract: dialog, shared Back, Escape, onComplete only via Ending after the game + quick check, hooks, lab route');}

// 3. Style: no pixel kit anywhere; the anatomy kit in the Paper tint; one red accent.
{for(const f of files){const src=read(dir+f);assert.doesNotMatch(src,/pixeliso/,f+' imports no pixeliso / pixeliso-laws');
  assert.doesNotMatch(src,/#000048|PK Press Start|PK Pixelify|Mega Drive colours only|image-rendering:pixelated/i,f+': no pixel palette, fonts or navy ground');}
 assert.deepEqual(files,['Experience.module.css','Experience.tsx','content.ts','figure.ts','geometry.ts','model.ts','scene.tsx']);
 assert.match(bench,/from '\.\/iso-kit'/);assert.match(exp,/from '\.\.\/anatomy\/bench'/);assert.match(bench,/from '\.\/draw'/);assert.match(exp,/dangerouslySetInnerHTML=\{\{__html:ISO_CSS\}\}/,'the kit CSS, injected once');
 assert.match(exp,/className=\{`\$\{g\.room\} iso \$\{s\.root\}`\} data-theme="light"/,'the kit light theme on the room');
 assert.match(css,/\.root\.root\[data-theme\]\{--anatomy-page:#e0e0db;--anatomy-card:#e0e0db;--anatomy-paper:#f7f7f3/,'Paper: warm grey ground, off-white solids');
 assert.match(css,/--anatomy-shade-2:#e3e3de;--anatomy-shade-3:#e9e9e4/,'side planes in the Paper greys');
 assert.match(exp,/'--accent':'#e4322b'/);assert.equal(S.RED,'#e4322b','one accent: the red gap rim and the ON AIR tally');
 console.log('PASS style: no pixeliso, no pixel palette / fonts / navy; anatomy kit, Paper tint, one red accent');}

// 4. Fill the screen: the card is the viewport minus the wall label and the dock; the SVG viewBox is the card's measured size;
//    the model is fitted (landscape or portrait) and fills most of the card on desktop and on a phone.
{assert.match(css,/\.screen\{box-sizing:border-box;height:100vh;height:100dvh;display:grid;grid-template-rows:auto minmax\(0,1fr\) auto/,'one viewport: label, card, dock');
 assert.match(css,/\.svg\{position:absolute;inset:0;width:100%;height:100%;touch-action:none/,'the drawing covers the card');
 assert.match(exp,/data-play-area data-fill-screen/);assert.match(exp,/viewBox=\{`0 0 \$\{W\} \$\{H\}`\}/,'viewBox = the measured card');
 assert.match(exp,/const box=useBox\(card\)/);assert.match(bench,/new ResizeObserver\(read\)/);
 assert.match(exp,/orient=W>=H\*1\.05\?'wide':'tall'/,'portrait screens get the tall frame');
 // Desktop 1440 × 900 and 1845 × 1110, phone 390 × 844: the card sizes the CSS gives (viewport minus label, dock and gutters).
 for(const [W,H] of [[1400,690],[1805,890],[370,560]]){const F=B.frameFor(W>=H*1.05?'wide':'tall');
  for(const [name,pts,el] of [['studio',S.studioPoints(F),F.o==='wide'?30:44],['pitch',S.pitchPoints(F),F.o==='wide'?34:52]]){
   const P=B.fit(F,pts,W,H-34,Math.round(Math.max(18,Math.min(W,H)*.06)),el),xy=pts.map(([a,b,z])=>K.iso([...B.at(F,a,b),z],P));
   const w=Math.max(...xy.map(p=>p[0]))-Math.min(...xy.map(p=>p[0])),h=Math.max(...xy.map(p=>p[1]))-Math.min(...xy.map(p=>p[1]));
   assert.ok(w/W>.78||h/(H-34)>.78,`${name} fills the ${W}×${H} card (${Math.round(w/W*100)}% × ${Math.round(h/(H-34)*100)}%)`);}}
 console.log('PASS fill: 100dvh screen, card = 1fr, viewBox = measured card, studio and pitch fill ≥ 78% at 1440, 1845 and 390');}

// 5. Heat: one frame loop (the shared anatomy/paper-loop.ts, via bench useRaf) that runs only while something moves, pauses off screen / hidden, is cancelled on unmount.
{for(const src of [exp,model,scene])assert.doesNotMatch(src,/requestAnimationFrame|setInterval/,'no loop of its own');
 assert.match(bench,/export \{useRaf\} from '\.\/paper-loop'/);assert.match(loopSrc,/else\{wanted=false;last=0;\}/,'the loop stops when nothing moves');assert.match(loopSrc,/useEffect\(\(\)=>\{cur\.current\?\.setVisible\(live\);\},\[live\]\)/,'parks off screen');
 assert.match(loopSrc,/l\.dispose\(\)/,'cancelled on unmount');
 assert.match(bench,/new IntersectionObserver/);assert.match(bench,/visibilitychange/);
 assert.match(exp,/if\(a\.t>=HALF_S\)\{endHalf\(pct\(a\.on,a\.total\)\);return false;\}/,'a half stops at the whistle');assert.match(exp,/return st\.u<1;\},live\)/,'the turn stops when the ball is still');
 assert.match(exp,/useEffect\(\(\)=>\(\)=>timers\.current\.forEach\(clearTimeout\),\[\]\)/,'timers cleared on unmount');
 assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);
 console.log('PASS heat: 0 frames at rest, the loop pauses off screen and is cancelled on unmount, timers cleared');}

// 6. Stitch: 12 + 20, the right shape goes in, the wrong one says why, the ball turns each gap to the front.
{assert.equal(M.PANELS.length,32);assert.equal(M.PANELS.filter(p=>p.kind==='pent').length,12);assert.equal(M.PANELS.filter(p=>p.kind==='hex').length,20);
 assert.deepEqual(M.stitch(0,'pent'),{ok:true,say:'5 sides'});
 const w=M.stitch(0,'hex');assert.equal(w.ok,false);assert.equal(w.say,'That gap has 5 sides. It needs a black pentagon.');
 const hexI=M.PANELS.findIndex(p=>p.kind==='hex');assert.equal(M.stitch(hexI,'pent').say,'That gap has 6 sides. It needs a white hexagon.');
 let q=M.START_Q,done=new Set(),turns=0;
 assert.ok(M.facing(q,0)[2]>.95,'pentagon 0 starts at the front');
 for(;;){const i=M.nextGap(q,done);if(i==null)break;q=M.bringToFront(q,i);const f=M.facing(q,i);
  assert.ok(f[0]*M.FRONT[0]+f[1]*M.FRONT[1]+f[2]*M.FRONT[2]>.9999,'the gap being stitched faces the camera');done.add(i);turns++;}
 assert.equal(turns,32);assert.deepEqual(M.counts(done),{pent:12,hex:20,total:32});
 const a=M.slerp(M.START_Q,M.bringToFront(M.START_Q,5),.5);assert.ok(Math.abs(Math.hypot(...a)-1)<1e-9,'the turn is a unit rotation all the way');
 const bp=M.ballPanels(M.START_Q,0,0,100);assert.ok(bp.length>=16&&bp.length<=26,'about half the ball faces you');assert.ok(bp.every((p,i)=>i===0||p.z>=bp[i-1].z),'painted back to front');
 assert.match(exp,/Math\.hypot\(x-c\[0\],y-c\[1\]\)<r\*1\.15\|\|moved<10\)place\(drag\.kind\)/,'drop on the ball (or tap the tray) to stitch');
 console.log('PASS stitch: 12 + 20 = 32, the wrong shape says why, every gap turned to the front once, drag-and-drop or tap');}

// 7. On air: one seeded match for both halves, a viewfinder, and a black-and-white picture made of real greys.
{const m1=M.match(1970),m2=M.match(1970);assert.deepEqual(m1,m2,'both halves replay the same match');assert.notDeepEqual(M.match(7),m1);
 assert.ok(m1.segs.length>=12,'plenty of passes in 20 s');assert.ok(m1.segs.every((s,i)=>s.from!==s.to&&s.t1>s.t0&&(i===0||s.t0>=m1.segs[i-1].t1)),'passes follow each other');
 for(let t=0;t<=M.HALF_S;t+=.25){const b=M.ballAt(m1,t);assert.ok(b.x>-.5&&b.x<12.5&&b.y>0&&b.y<8.5&&b.z>=0,'the ball stays on the pitch at '+t);}
 const st=M.stillTimes(m1);assert.equal(st.length,M.STEPS);assert.ok(st.every(t=>M.ballAt(m1,t).flying),'reduced motion: each still frame is mid-pass');
 const fb=M.frameBox(1400,690);assert.ok(fb.w>=120&&fb.h>=88,'a viewfinder a thumb can steer');
 assert.ok(M.inFrame([80,80],[80+fb.w/2-6,80],fb)&&!M.inFrame([80,80],[80+fb.w/2+2,80],fb),'the viewfinder edge');
 assert.equal(M.pct(3,4),75);assert.equal(M.pct(0,0),0);assert.equal(M.verdict(85),'Crystal clear');assert.equal(M.verdict(10),'Lost in the grey');
 // The lesson in numbers: on a black-and-white set the leather ball's grey IS the grass's grey; the Telstar's are the two ends.
 const L=B.luma(G.LEATHER),Gr=B.luma(G.GRASS),G2=B.luma(S.GRASS_B);
 assert.ok(Math.abs(L-Gr)<6&&Math.abs(L-G2)<6,'brown leather turns grass grey ('+Math.round(L)+' v '+Math.round(Gr)+')');
 assert.ok(B.luma(S.PENT_INK)<40&&B.luma(S.HEX_PAPER)>235,'the Telstar: near black and near white');
 assert.match(scene,/const paint=\(hex:string,pic:Picture\)=>pic==='bw'\?greyOf\(hex\):hex/,'the picture switch greys every colour');
 console.log('PASS on air: one seeded match, ball on the pitch, 8 mid-pass stills, viewfinder, leather = grass grey, Telstar = black + white');}

// 8. The machines rendered in Node (both frames): solid parts, real detail, the red gap, players and the ball on the pitch.
{for(const o of ['wide','tall']){const F=B.frameFor(o),P=B.fit(F,S.studioPoints(F),1200,700,30);
  const studio=renderToStaticMarkup(React.createElement('svg',null,React.createElement(S.StudioStatic,{F,P,tally:true}),React.createElement(S.Tray,{F,P,kind:'pent',left:12,hot:false}),React.createElement(S.StudioBall,{F,P,q:M.START_Q,done:new Set([1,2,3]),target:0,wrong:false})));
  assert.ok((studio.match(/<path/g)||[]).length>150,o+': a dense studio ('+(studio.match(/<path/g)||[]).length+' paths)');
  assert.match(studio,/data-gap-rim/);assert.match(studio,/class="iso-halo"/,'a soft halo under the base');assert.match(studio,/stroke="#e4322b"/,'the red gap');
  assert.doesNotMatch(studio,/stroke-dasharray|data-dashed/,'no dashed hidden lines');
  const Pp=B.fit(F,S.pitchPoints(F),1200,700,30),m=M.match();
  const pitch=renderToStaticMarkup(React.createElement('svg',null,React.createElement(S.PitchStatic,{F,P:Pp,picture:'bw'}),React.createElement(S.PitchLive,{F,P:Pp,m,t:3,ball:'leather',picture:'bw'})));
  assert.equal((pitch.match(/data-player=/g)||[]).length,M.PLAYERS);assert.match(pitch,/data-tv-ball="leather"/);
  assert.doesNotMatch(pitch,/#5a7d3c/i,'B&W: the grass colour is gone');
  const [bx,by]=S.ballScreen(F,Pp,m,3);assert.ok(bx>0&&bx<1200&&by>0&&by<700,'the ball is on screen');}
 console.log('PASS render: studio + pitch rendered in Node in both frames, > 150 paths, halo, red gap, players + ball, B&W greys');}

// 9. Reduced motion: a turn-based version (no frames): the stand turns at once, each half is eight still frames to tap.
{assert.match(exp,/if\(reduced\)\{st\.q=st\.to;st\.u=1;redraw\(\);\}else wake\(\)/,'the ball turns at once');
 assert.match(exp,/if\(reduced\)\{say\(`Frame 1 \/ \$\{STEPS\}`\);redraw\(\);return;\}/,'a half under reduced motion starts no loop');
 assert.match(exp,/const tapStill=/);assert.match(exp,/endHalf\(pct\(a\.hits,STEPS\)\)/,'the still-frame score');
 assert.match(exp,/\(e\.key==='Enter'\|\|e\.key===' '\)&&reduced/,'keyboard: Enter taps at the cursor');assert.match(exp,/e\.key==='5'\|\|e\.key==='6'/,'keyboard: 5 / 6 stitch');
 console.log('PASS reduced motion: instant turns, eight still frames, keyboard play');}

// 10. Turn the ball (Oct 21 2026, figure kit v2): the finished Telstar turns all the way round (every panel can be seen), the
//     see-through shows only verified insides (bladder, valve), labels name real parts and light while touched, swatches
//     recolour only the pentagons, and the figure stays under the 120-part cap at every view.
{const FK=require('../components/museum/experiences/anatomy/figure-kit.ts'),TF=require('../'+dir+'figure.ts');
 const fig=TF.makeTelstarFigure(),c=FK.centreOf(TF.POINTS),P0=FK.fitTurn(TF.POINTS,900,700,45,30,{pad:24,top:80});
 const view=(yaw,pitch,xray,swatch=null)=>{const P=FK.turnProjection(P0,c,yaw,pitch),{R,U,V}=FK.basis(yaw,pitch);return {yaw,pitch,P,V,R,U,L:FK.lightOf(yaw,pitch),xray,swatch,active:new Set(['seam']),w:900,h:700};};
 const seen=new Set();const count=svg=>(svg.match(/data-panel=/g)||[]).length;
 for(const roll of [0,1,2])for(const yaw of [0,45,90,135,180,225,270,315])for(const pitch of [20,60]){const v=view(yaw,pitch,0),d=fig.spec.draw(v);
  assert.ok(FK.countParts(d.svg)<=FK.MAX_PARTS,'≤ 120 parts at '+yaw+' ('+FK.countParts(d.svg)+')');assert.ok(count(d.svg)>=12&&count(d.svg)<=24,'about half the ball faces you');
  // which panels face the viewer from here (the ball's own maths)
  const M=require('../'+dir+'model.ts');M.PANELS.forEach((p,i)=>{const w=M.rotate(fig.q,p.c),ww=[w[2],w[0],w[1]];if(FK.dot(ww,v.V)>.3)seen.add(i);});
  if(yaw===315&&pitch===60)fig.roll(true);}
 assert.equal(seen.size,32,'turning and rolling shows all 32 panels');fig.reset();
 const closed=fig.spec.draw(view(45,30,0)),open=fig.spec.draw(view(45,30,1));
 assert.doesNotMatch(closed.svg,/data-bladder/,'closed: the real closed ball');assert.match(open.svg,/data-bladder/,'see-through: the bladder');assert.match(open.svg,/data-valve-stem/);
 assert.ok(FK.countParts(open.svg)<=FK.MAX_PARTS,'see-through under the cap ('+FK.countParts(open.svg)+')');
 const ids=d=>d.labels.map(l=>l.id).sort();assert.deepEqual(ids(closed),['hexagon','pentagon','seam','valve']);assert.deepEqual(ids(open),['bladder','hexagon','pentagon','seam','valve'],'the bladder is named only when drawn');
 for(const l of open.labels)assert.ok(['Black pentagon','White hexagon','Stitched seam','Bladder','Valve'].includes(l.text));
 const v=fig.spec.draw(view(45,30,0)).labels.find(l=>l.id==='valve');const back=FK.aimAt(v.normal.map(x=>-x));
 assert.doesNotMatch(fig.spec.draw(view(back.yaw,back.pitch,0)).svg,/data-valve /,'the valve hole is drawn only while its panel faces you');
 const tinted=fig.spec.draw(view(45,30,0,'cobalt')).svg;assert.ok(/#2f55c9|#[0-9a-f]{6}/.test(tinted));assert.notEqual(tinted,closed.svg,'swatch recolours the pentagons');
 assert.equal((tinted.match(/data-panel="hex"[^>]*fill="#(fbfbf8|ecece7|d3d3ce)"/g)||[]).length,(closed.svg.match(/data-panel="hex"[^>]*fill="#(fbfbf8|ecece7|d3d3ce)"/g)||[]).length,'hexagons stay white');
 assert.match(C.EXTRA.inside,/rubber bladder/);assert.match(C.EXTRA.inside,/valve/);assert.ok(exp.includes('EXTRA.inside'));
 assert.ok(C.EXTRA_SOURCES.some(s=>/dpma/.test(s.url))&&C.EXTRA_SOURCES.some(s=>/Ball_\(association_football\)/.test(s.url)),'inside facts cited');
 assert.match(exp,/<FigureStage spec=\{fig\.spec\}/);assert.match(exp,/data-look /);assert.match(exp,/data-roll/);assert.match(exp,/setPhase\(lookFrom\.current\)/,'Back returns to where you were');
 assert.doesNotMatch(read(dir+'figure.ts'),/requestAnimationFrame|setInterval/);
 console.log('PASS turn the ball: all 32 panels seen, see-through = bladder + valve only, 5 real labels, swatches on pentagons, ≤ 120 parts');}
