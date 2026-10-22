// Figure kit v2 (Oct 21 2026; user: "Start with Telstar and VAR, build the shared kit first"): the pure maths of a Paper figure
// that turns all the way round, with a see-through, labels that light up and colour swatches (anatomy/figure-kit.ts), and the
// heat rules of its stage (anatomy/FigureStage.tsx: one sleeping loop, painted through a ref, no allocation in the tick).
// Ideas from Colorfigures / ISO-GLOW by April Zhu (MIT) and iso-figure by Tolga Cohce (MIT).
// usage: node tests/museum-figure-kit.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),A='components/museum/experiences/anatomy/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const F=require('../'+A+'figure-kit.ts'),K=require('../'+A+'iso-kit.ts');
const near=(a,b,e=1e-9)=>Math.abs(a-b)<e;

// 1. Projection: yaw / pitch match iso-kit's camera at every view; the camera basis is orthonormal; V is the depth direction.
{for(const yaw of [0,45,90,135,200,315])for(const pitch of [20,30,45,60]){const {R,U,V}=F.basis(yaw,pitch),P={origin:[0,0],scale:1,azimuth:yaw,elevation:pitch},k=K.cameraOf(P).k;
  for(const [a,b] of [[R,U],[R,V],[U,V]])assert.ok(near(F.dot(a,b),0),'orthogonal');for(const v of [R,U,V])assert.ok(near(Math.hypot(...v),1),'unit');
  for(const p of [[3,-2,5],[0,7,1],[-4,4,-2]]){const [sx,sy]=K.iso(p,P);assert.ok(near(sx,k*F.dot(p,R),1e-9)&&near(sy,-k*F.dot(p,U),1e-9),'iso = (R, -U) at '+yaw+'/'+pitch);
   assert.ok(near(K.depthOf(p,P),F.dot(p,V),1e-9),'depthOf = p·V');}}
 const pts=[[0,0,0],[40,0,0],[0,30,0],[40,30,0],[0,0,50],[40,30,50]],c=F.centreOf(pts),P0=F.fitTurn(pts,800,600,45,30,{pad:20});
 for(const yaw of [0,90,180,270]){const P=F.turnProjection(P0,c,yaw,30),[x,y]=K.iso(c,P);assert.ok(near(x,400,1e-6),'the centre stays put while turning');
  for(const p of pts){const [sx,sy]=K.iso(p,P);assert.ok(sx>=0&&sx<=800&&sy>=0&&sy<=600,'the figure stays in the card at yaw '+yaw);}}
 assert.equal(F.wrapYaw(-30),330);assert.equal(F.shortest(350,10),20);assert.equal(F.shortest(10,350),-20);
 const a=F.aimAt([0,1,0]);assert.ok(near(a.yaw,90)&&a.pitch===F.PITCH_MIN,'aim at +y: yaw 90, pitch clamped');assert.equal(F.aimAt([1,0,5]).pitch,F.PITCH_MAX);
 console.log('PASS projection: yaw/pitch = iso-kit camera, orthonormal basis, a fit that never moves while turning, aim at a part');}

// 2. Turning: drag turns with the finger, coasts, sleeps; keys / ⟲ ⟳ / Front ease the shortest way; pitch stays in 20-60.
{const t=F.newTurn();F.dragBy(t,100,0,600,1/60);assert.ok(t.yaw<45,'drag right: the camera goes the other way, so the figure turns with the finger');
 F.dragBy(t,0,-1000,600,1/60);assert.equal(t.pitch,F.PITCH_MIN);F.dragBy(t,0,5000,600,1/60);assert.equal(t.pitch,F.PITCH_MAX);
 assert.equal(F.stepTurn(t,1/60),false,'no motion while held (the drag paints)');F.release(t);let n=0;while(F.stepTurn(t,1/60)&&n<2000)n++;
 assert.ok(n>3&&n<600,'inertia coasts then sleeps ('+n+' frames)');assert.equal(t.vy,0);assert.ok(t.yaw>=0&&t.yaw<360,'yaw wrapped');
 const v=F.newTurn();const start=v.yaw;for(let i=0;i<40;i++)F.dragBy(v,-30,0,600,1/60);assert.ok(Math.abs(v.yaw-start)>=360,'all the way round');
 const fx=F.newTurn({full:false});for(let i=0;i<40;i++)F.dragBy(fx,-30,0,600,1/60);assert.equal(fx.yaw,45+60,'fixed mode keeps ±60°');
 const k=F.newTurn({yaw:350});F.turnTo(k,10);assert.equal(k.goalYaw,370,'the short way round');let m=0;while(F.stepTurn(k,1/60)&&m<500)m++;assert.equal(k.yaw,10);assert.ok(m<120,'eased in under 2 s');
 const r=F.newTurn();assert.ok(F.keyTurn(r,'ArrowRight',{yaw:45,pitch:30}));assert.equal(r.goalYaw,60);F.keyTurn(r,'ArrowRight',{yaw:45,pitch:30});assert.equal(r.goalYaw,75,'presses add up');
 assert.equal(F.keyTurn(r,'x',{yaw:45,pitch:30}),false);F.keyTurn(r,'Home',{yaw:45,pitch:30});assert.equal(F.stepTurn(r,1/60,true),false,'reduced motion: jumps');assert.equal(r.yaw,45);
 const x={k:0};let q=0;while(F.fade(x,true,1/60)&&q<100)q++;assert.equal(x.k,1);assert.ok(q>=12&&q<=17,'see-through cross-fade ≈ 250 ms ('+q+' frames)');
 assert.ok(near(F.shellAlpha(1),F.GHOST)&&F.GHOST>=.12&&F.GHOST<=.25,'the case fades to a ghost');assert.equal(F.shellAlpha(0),1);assert.equal(F.innerAlpha(0),0);assert.equal(F.innerAlpha(1),1);
 console.log('PASS turning: with the finger, all the way round, inertia then sleep, pitch 20-60, short-way eases, keys, 250 ms fade, ghost .18');}

// 3. Depth order from several yaws: a pole beside a box, a lid above a body, a row of keys; facing tests.
{const box=(id,a,b)=>({id,box:[a,b]});
 const parts=[box('left',[0,0,0],[10,10,10]),box('right',[0,20,0],[10,30,10]),box('back',[-20,0,0],[-10,30,10]),box('lid',[0,0,10],[10,30,12])];
 for(const yaw of [0,45,90,135,180,225,270,315]){const V=F.viewVector(yaw,30),o=F.byDepth(parts,V).map(p=>p.id),before=(a,b)=>o.indexOf(a)<o.indexOf(b);
  if(V[1]>0)assert.ok(before('left','right'),yaw+': viewer on +y side: left first');if(V[1]<0)assert.ok(before('right','left'),yaw+': right first');
  if(V[0]>0)assert.ok(before('back','left')&&before('back','right'),yaw+': back block behind');if(V[0]<0)assert.ok(before('left','back'),yaw+': from behind it comes last');
  assert.ok(before('left','lid')&&before('right','lid'),yaw+': the lid on top always after (pitch > 0)');}
 const pole=box('pole',[0,-2,0],[2,0,60]),keys=Array.from({length:6},(_,i)=>box('k'+i,[0,i*5+1,0],[4,i*5+4,3]));
 for(const yaw of [10,100,190,280]){const V=F.viewVector(yaw,35),o=F.byDepth([...keys,pole],V).map(p=>p.id);
  if(V[1]<0)assert.equal(o[o.length-1],'pole',yaw+': a long pole on the viewer side is drawn after every key');else assert.equal(o[0],'pole',yaw+': and first when it is behind');}
 for(const yaw of [0,90,180,270]){const V=F.viewVector(yaw,30),fronts=[[1,0,0],[0,1,0],[-1,0,0],[0,-1,0]].filter(n=>F.isFacing(n,V));
  assert.equal(fronts.length,1,'at yaw '+yaw+' exactly one side faces you');assert.ok(F.isFacing([0,0,1],V),'the top always faces you');}
 console.log('PASS depth: side-of-box order at 8 yaws, a pole beside a row of keys, one face at a time, the top always');}

// 4. Labels: two columns, sorted (leaders never cross), no overlaps, inside the card, facing-away tags hidden, kid type ≥ 13 px.
{const P=F.fitTurn([[0,0,0],[20,20,20]],390,600,45,30,{pad:20}),V=F.viewVector(45,30);
 const anchors=[['a','Black pentagon',[10,20,18],[0,1,0]],['b','White hexagon',[20,10,15],[1,0,0]],['c','Stitched seam',[20,18,10],[1,0,0]],['d','Bladder',[10,10,10]],['e','Valve',[0,10,20],[-1,0,0]],['f','Back',[0,10,5],[-1,0,0]],['g','Base',[10,10,0]]]
  .map(([id,text,at,normal])=>({id,text,at,normal,on:id==='b'}));
 for(const [W,H] of [[390,600],[1200,700]]){const L=F.placeLabels(anchors,P,V,{w:W,h:H},{l:W*.3,r:W*.7,t:0,b:H},{font:13,compact:false});
  assert.ok(!L.some(l=>l.id==='e'||l.id==='f'),'tags on faces turned away are hidden');assert.equal(L.length,5);
  for(const s of [-1,1]){const col=L.filter(l=>l.side===s).sort((a,b)=>a.y-b.y);
   for(let i=1;i<col.length;i++){assert.ok(col[i].y-col[i].h/2>=col[i-1].y+col[i-1].h/2-1e-9,'no overlap');assert.ok(col[i].ay>=col[i-1].ay,'sorted by anchor height: leaders never cross');}}
  for(const l of L){assert.ok(l.x-l.w/2>=0&&l.x+l.w/2<=W&&l.y-l.h/2>=0&&l.y+l.h/2<=H,'inside the card');assert.ok(l.h>=26,'kid-size pills');}
  assert.ok(L.find(l=>l.id==='b').on);const svg=F.labelsSvg(L,13);assert.equal((svg.match(/data-fig-label=/g)||[]).length,5);assert.match(svg,/data-on=""/);assert.match(svg,/font-size="13"/);}
 const crowd=Array.from({length:8},(_,i)=>({id:'n'+i,text:'Part '+i,at:[i*2,0,i*2]})),L2=F.placeLabels(crowd,P,V,{w:390,h:600},{l:120,r:270,t:0,b:600},{compact:false});
 assert.ok(Math.abs(L2.filter(l=>l.side<0).length-L2.filter(l=>l.side>0).length)<=2,'crowded columns are balanced');
 console.log('PASS labels: two sorted columns, no overlaps, inside the card at 390 and 1200, facing-away hidden, lit tag, ≥ 13 px');}

// 4b. museum-figures-2: a round part's tag slides to the silhouette when its face turns away (never hidden); a 'keep' tag stays
//     with a dashed leader; when the figure fills a phone card the tags collapse to numbered badges + a legend along the bottom
//     edge (no pill over the figure); every tag has a 44 px hit area.
{const c=[0,0,0],R0=50,P=F.fitTurn([[-R0,-R0,-R0],[R0,R0,R0]],390,600,45,30,{pad:20});
 for(let yaw=0;yaw<360;yaw+=15){const V=F.viewVector(yaw,30),n=[1,0,0],a=F.anchorFor({id:'v',text:'Valve',at:[R0,0,0],normal:n,centre:c},V);
  assert.ok(a,'never hidden at yaw '+yaw);const r=Math.hypot(...a.at);assert.ok(Math.abs(r-R0)<1e-6,'on the ball');assert.ok(F.dot(a.at,V)>=-1e-9,'on the visible side or rim at '+yaw);
  assert.equal(a.back,!F.isFacing(n,V,.05));const k=F.anchorFor({id:'k',text:'Heel',at:[1,2,3],normal:n,keep:true},V);assert.ok(k&&k.at[0]===1);}
 const V=F.viewVector(45,30),an=['Cameras','Video room','Radio','Monitor','Replays','VAR'].map((t,i)=>({id:'a'+i,text:t,at:[-40+i*16,-30+i*12,i*8]}));
 const obj={l:20,r:370,t:200,b:420},L=F.placeLabels(an,P,V,{w:390,h:600},obj,{font:13,bottom:30});
 assert.equal(L.length,6);assert.ok(L.every(l=>l.n>=1),'compact: numbered');assert.deepEqual(L.map(l=>l.n).sort(),[1,2,3,4,5,6]);
 for(const l of L){assert.ok(l.x-l.w/2>=0&&l.x+l.w/2<=390,'legend inside the card');assert.ok(l.y+l.h/2<=600-30+1e-9&&l.y-l.h/2>=obj.b-1,'legend below the figure');}
 for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];assert.ok(Math.abs(a.y-b.y)>=a.h||Math.abs(a.x-b.x)>=(a.w+b.w)/2-1e-9,'legend pills never overlap');}
 const svg=F.labelsSvg(L,13);assert.equal((svg.match(/data-fig-badge=/g)||[]).length,6,'a badge on each part');assert.match(svg,/>1 /);assert.match(svg,/height="44"/,'44 px hit areas');assert.match(svg,/r="22"/);
 const wide=F.placeLabels(an,P,V,{w:1200,h:700},{l:400,r:800,t:200,b:500},{font:14});assert.ok(wide.every(l=>!l.n),'desktop with room: two columns as before');
 console.log('PASS labels v2: round parts keep their tag on the rim at 24 yaws, keep-tags dashed, compact badges + legend on a phone, 44 px hits');}

// 5. Swatches and shading: only designated parts recolour; three tones; the light stays at the viewer's top left.
{assert.ok(F.SWATCHES.length>=5&&F.SWATCHES.length<=6);for(const id of ['tomato','mustard','mint','cobalt','blush'])assert.ok(F.swatchHex(id),id);
 assert.equal(F.recolor('#1d1d1b','cobalt',true),'#2f55c9');assert.equal(F.recolor('#1d1d1b','cobalt',false),'#1d1d1b','undesignated parts keep their colour');assert.equal(F.recolor('#1d1d1b',null,true),'#1d1d1b');assert.equal(F.recolor('#1d1d1b','nope',true),'#1d1d1b');
 const t=F.tones('#e5533d');assert.ok(t.l!==t.m&&t.m!==t.d);
 for(const yaw of [0,120,240]){const L=F.lightOf(yaw,30),{R,U,V}=F.basis(yaw,30);assert.ok(F.dot(L,R)<0&&F.dot(L,U)>0&&F.dot(L,V)>0,'top left, toward the viewer');assert.equal(F.shadeOf(V,L,t),t.l);}
 const p=K.cylinder(0,0,10,0,10,{origin:[100,100],scale:2,azimuth:200,elevation:40},16);const s=F.tintSvg(p,'#e5533d');assert.ok(F.countParts(s)<=8,'a tinted solid is a handful of paths');
 console.log('PASS swatches: 6 swatches, only designated parts, three tones, light from the top left at any yaw');}

// 5b. museum-figures-2 free solids: a prism from any two rings draws only its facing faces in ≤ 6 elements and shades with the
//     light; tilting its vertices (a bent sole) still works; the hull is convex; sphere panels close on the rim; custom swatches.
{const sq=(z,dx=0)=>[[0+dx,0,z],[20+dx,0,z],[20+dx,10,z],[0+dx,10,z]];
 for(const yaw of [0,90,180,270]){const P={origin:[200,200],scale:2,azimuth:yaw,elevation:30},V=F.viewVector(yaw,30),L=F.lightOf(yaw,30);
  const s=F.prismSvg(sq(0),sq(8),'#e5533d',{P,V,L});assert.ok(F.countParts(s)<=6,'≤ 6 elements at '+yaw);assert.match(s,/stroke="#3a3a3c"/,'ink silhouette');
  const g=F.prismSvg(sq(0),sq(8),'#e5533d',{P,V,L},{ghost:.18});assert.equal(F.countParts(g),1,'the ghost is one path');
  const bent=F.prismSvg(sq(0),sq(8,4),'#e5533d',{P,V,L});assert.ok(F.countParts(bent)<=6,'a sheared prism too');}
 const h=F.hull([[0,0],[10,0],[10,10],[0,10],[5,5],[3,7]]);assert.equal(h.length,4,'inner points dropped');
 const b=F.boxOf(sq(0),sq(8));assert.deepEqual(b,[[0,0,0],[20,10,8]]);
 const d=F.spherePath([[1,0,0],[0,1,0],[0,0,1]],[100,100],50,{V:[1,0,0],R:[0,1,0],U:[0,0,1]});assert.match(d,/^M[\d.]+ [\d.]+L.*Z$/);
 const sw=F.swatchList(['mint',{id:'tan',name:'Tan',hex:'#b9834c'},'nope']);assert.deepEqual(sw.map(s=>s.id),['mint','tan'],'SWATCHES ids and an exhibit own colours');
 console.log('PASS free solids: facing faces only, ≤ 6 elements, ghost = 1 path, bent prisms, convex hull, sphere panels, custom swatches');}

// 6. Heat: the stage paints through a ref with ONE sleeping loop; the tick allocates nothing; no rAF of its own; caps documented.
{const src=read(A+'FigureStage.tsx'),kit=read(A+'figure-kit.ts');
 assert.doesNotMatch(src+kit,/requestAnimationFrame|setInterval/,'no loop of its own');assert.match(src,/usePaperLoop\(tick,box,reduced\)/,'the one Paper loop (parks off screen, disposed on unmount)');
 assert.match(src,/el\.innerHTML=out/,'painted through a ref: no React render per frame');
 const tick=src.match(/const tick=\(dt:number\)=>\{([\s\S]*?)return moving;\};/);assert.ok(tick,'the tick');
 assert.doesNotMatch(tick[1],/new |\[\s*[^\]\s]|\{\s*\w+:|=>|\.map\(|\.filter\(|\.slice\(/,'no allocation in the tick');
 assert.match(tick[1],/if\(moving\|\|s\.dirty\)paint\(\)/,'paints only when something changed');
 const step=kit.match(/export function stepTurn[\s\S]*?\n return true;\}/)[0];assert.doesNotMatch(step,/new |\[[^\]]*,[^\]]*\]|\{\s*\w+:/,'stepTurn writes numbers only');
 // the loop sleeps when the figure is still: simulate the tick's pieces
 const t=F.newTurn(),x={k:0},l={k:0};assert.equal(F.stepTurn(t,1/60)||F.fade(x,false,1/60)||F.fade(l,false,1/60),false,'at rest: the tick returns false, the loop sleeps');
 assert.equal(F.MAX_PARTS,120);assert.match(read('docs/museum-paper-style.md'),/## Figure kit v2/);assert.match(read('docs/museum-paper-style.md'),/April Zhu/);assert.match(read('docs/museum-paper-style.md'),/Tolga Cohce/);
 assert.match(src,/data-fig-hint/);assert.match(src,/if\(!used\)setUsed\(true\)/,'the hint goes after first use');assert.match(src,/Front view/);assert.match(src,/⟲/);assert.match(src,/⟳/);
 console.log('PASS heat: one sleeping Paper loop, painted through a ref, no allocation in the tick, ≤ 120 parts, documented');}
console.log('museum-figure-kit: all passed');
