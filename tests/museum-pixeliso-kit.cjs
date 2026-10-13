// pixeliso kit (Oct 10 2026): the shared pixel-art isometric kit every rebuilt museum exhibit uses (components/museum/experiences/
// pixeliso, docs/museum-pixel-iso.md, demo /museum-lab/pixeliso). Checks: the Mega Drive palette, the 2:1 projection and its
// inverse, the rasteriser (pixel-centre fill without gaps, Bresenham 2:1 steps, Bayer dither, glyph text, the pick buffer),
// painter's order (floor → shadows → solids far to near → light → markers; the goal split round a ball in the net), the
// player sprites (one grid, outlined, 18 px tall, team colours), the sleep-aware loop (0 rAF at rest, sleeps off-screen,
// disposed, reduced motion = no frames at all), the integer pixel grid, and source rules (fonts referenced not copied, no rAF
// outside loop.ts, reduced-motion CSS, 44 px targets, the dev-only lab route, the style guide).
// usage: node tests/museum-pixeliso-kit.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),dir='components/museum/experiences/pixeliso/',read=f=>fs.readFileSync(path.join(root,f),'utf8');
const K=require('../'+dir+'index.ts'),D=require('../'+dir+'demo/model.ts');

// 1. Palette: every colour is a Mega Drive colour (8 levels per channel), as in the penalty cabinet.
{const all=K.allColours();assert.ok(all.length>60,'a real palette');for(const c of all)assert.ok(K.isMegaDrive(c),'not a Mega Drive colour: '+c);
 for(const [n,r] of Object.entries(K.RAMPS))assert.equal(r.length,4,n+' ramp has 4 tones');
 for(const [n,k] of Object.entries(K.KITS)){assert.equal(k.shirt.length,3,n);assert.equal(k.shorts.length,2,n);}
 assert.equal(K.toMegaDrive('#2f7d3a'),'#246c48');assert.equal(K.toMegaDrive('#ffffff'),'#fcfcfc');
 const cab=read('components/museum/experiences/penalty-1891/Cabinet.module.css');
 for(const [k,v] of Object.entries({gold:'#fcd824',win:'#000090',reach:'#48d8fc',goal:'#6cfc48',miss:'#fc6c48'})){assert.ok(cab.includes(`--${k}:${v}`),'penalty uses '+k);assert.equal(K.UI[k],v,'same '+k);}
 console.log(`PASS palette: ${all.length} colours, all Mega Drive 9-bit, UI colours = the penalty cabinet's`);}

// 2. Projection: 1 m of floor = a 16 × 8 tile (2:1), 1 m up = 10 px; toWorld inverts it; centreOn centres.
{const cam={ox:100,oy:50};assert.deepEqual(K.toScreen(cam,1,0),[108,54]);assert.deepEqual(K.toScreen(cam,0,1),[92,54]);assert.deepEqual(K.toScreen(cam,0,0,1),[100,40]);
 assert.equal(K.TILE_W,16);assert.equal(K.TILE_H,8);assert.equal(K.Z_PX,10);
 for(const [x,y] of [[0,0],[3.5,-2],[7.32,2.44],[-1,9]]){const [sx,sy]=K.toScreenF(cam,x,y,0),w=K.toWorld(cam,sx,sy);assert.ok(Math.abs(w.x-x)<1e-9&&Math.abs(w.y-y)<1e-9);}
 {const [sx,sy]=K.toScreenF(cam,2,3,1.5),w=K.toWorld(cam,sx,sy,1.5);assert.ok(Math.abs(w.x-2)<1e-9&&Math.abs(w.y-3)<1e-9,'unproject on a raised plane');}
 const c=K.centreOn(160,160,3,7);assert.deepEqual(K.toScreen(c,3,7),[80,80]);
 assert.ok(K.depth(2,2)>K.depth(1,2)&&K.depth(1,1,1)>K.depth(1,1,0),'nearer and higher sort later');
 console.log('PASS projection: 2:1 floor (16 × 8 tile per metre), 10 px per metre up, exact inverse, centred camera');}

// 3. Rasteriser.
{const pm=new K.Pixmap(40,40);
 // Two triangles sharing an edge fill a square exactly: no gap, no double.
 pm.poly([[4,4],[24,4],[24,20]],'#fc0000');pm.poly([[4,4],[24,20],[4,20]],'#0000fc');let n=0;for(const v of pm.data)if(v)n++;assert.equal(n,20*16,'pixel-centre rule: shared edge exact');
 pm.clear();pm.line(0,0,16,8,'#fcfcfc');const rows=[];for(let y=0;y<=8;y++){let c=0;for(let x=0;x<40;x++)if(pm.get(x,y))c++;rows.push(c);}
 assert.ok(rows.slice(1,8).every(c=>c===2),'2:1 line steps two across, one down: '+rows);
 pm.clear();pm.rect(0,0,16,16,{a:null,b:'#000000',level:8});n=0;for(const v of pm.data)if(v)n++;assert.equal(n,128,'Bayer 8/16 = half the pixels');
 pm.clear();assert.equal(pm.text('GOAL 3',0,0,'#fcd824'),23);assert.equal(K.textWidth('GOAL 3'),23);
 pm.clear();pm.tag=7;pm.rect(10,10,3,3,'#fcfcfc');pm.tag=0;assert.equal(pm.pick(11,11),7);assert.equal(pm.pick(16,11),0);assert.equal(pm.pick(16,11,4),7,'finger slop finds the part');
 pm.clear();pm.rect(5,5,2,2,'#fcfcfc');pm.outline('#000000');n=0;for(const v of pm.data)if(v)n++;assert.equal(n,4+8,'1-px outline (4-neighbour)');
 const out=new Uint32Array(40*40);pm.toRGBA(out,0xff480000);assert.equal(out[0],0xff480000);
 console.log('PASS raster: exact polygon fill, 2:1 Bresenham, Bayer dither, 3×5 text, pick buffer with slop, outline, RGBA blit');}

// 4. Painter's order: floor, shadows, solids far → near, light, markers; the goal wraps a ball in the net.
{const s=new K.Scene();const marker=K.reticle(1,1),far=K.block(0,0,0,1,1,1,'stone'),near=K.block(3,3,0,1,1,1,'stone'),sh=K.shadow(2,2),fl=K.floor(0,0,5,5,'#246c24'),lp=K.lamp(0,0,2);
 s.add(marker,near,lp,far,sh,fl);const o=s.order();assert.deepEqual(o,[fl,sh,far,near,lp,marker]);
 const [net,bar,p0,p1]=K.goal(0,3.5),[inNet]=K.ball(-1,7.16,.5);assert.ok(net.key<inNet.key&&inNet.key<bar.key,'ball in the net: behind the bar, in front of the net');
 const [keeper]=K.figure(.6,7.16,0,{kit:'keeper'});assert.ok(keeper.key>net.key);
 const [byPost]=K.figure(.4,3.4,0);assert.ok(byPost.key>p0.key,'a player in front of the far post draws over it (posts sort on their own feet)');
 assert.ok(p1.key>p0.key);
 // The demo renders with only palette colours, and every tagged part can be picked.
 const pm=new K.Pixmap(200,176),cam=D.cameraFor(200,176),scene=D.buildScene({pull:{x:2,y:-.5},shot:null,t:0,flagFrame:0,goals:2});pm.clear('#000048');
 const t0=process.hrtime.bigint();scene.paint(pm,cam);const ms=Number(process.hrtime.bigint()-t0)/1e6;
 for(const c of pm.coloursUsed())assert.ok(K.isMegaDrive(c),'drawn colour '+c);
 const [bx,by]=K.toScreen(cam,D.BALL0.x,D.BALL0.y,.22);assert.equal(scene.pick(pm,bx,by,2),'ball');
 const [kx,ky]=K.toScreen(cam,D.KEEPER_X,D.MID,.9);assert.equal(scene.pick(pm,kx,ky,1),'keeper');
 assert.ok(ms<60,'a frame paints fast in Node: '+ms.toFixed(1)+' ms');
 console.log(`PASS painter: layers then depth, goal split round the ball, demo paints in ${ms.toFixed(1)} ms with palette colours only, parts pickable`);}

// 5. Player sprites: one 14 × 20 grid, 18 px body in a 1-px outline, team colours in the keys.
{for(const pose of ['stand','run','kick','ready','cheer','point'])for(const f of ['front','back'])for(const fr of [0,1]){const s=K.figureSprite(pose,f,fr);
  assert.equal(s.grid.length,20,pose);assert.ok(s.grid.every(r=>r.length===14),pose);
  const edge=[s.grid[0],s.grid[19],...s.grid.map(r=>r[0]+r[13])].join('');assert.ok(/^[.k]*$/.test(edge),'outlined: '+pose);
  const rows=s.grid.map((r,i)=>/[^.k]/.test(r)?i:-1).filter(i=>i>=0);assert.ok(rows[rows.length-1]-rows[0]+1>=17,'about 18 px tall: '+pose);}
 const d=K.figureSprite('dive');assert.ok(d.grid[0].length>d.grid.length,'a dive lies on its side');
 const red=K.figureKeys('red'),blue=K.figureKeys('blue');assert.notEqual(red.j,blue.j);assert.equal(red.j,K.KITS.red.shirt[1]);
 for(const v of Object.values(K.figureKeys('keeper','dark','blond')))assert.ok(K.isMegaDrive(v),'sprite colour '+v);
 assert.equal(K.BALL_SPRITES[0].length,5);
 console.log('PASS sprites: 6 poses × 2 facings × 2 frames on one outlined grid, 18 px players, a lying dive, kits by team colour');}

// 6. The play loop: no frames until wake, stops by itself, sleeps off-screen, disposed for good, reduced = no frames at all.
{let queue=[],id=0;global.requestAnimationFrame=f=>{queue.push({id:++id,f});return id;};global.cancelAnimationFrame=i=>{queue=queue.filter(q=>q.id!==i);};
 const flush=(t)=>{const q=queue;queue=[];q.forEach(x=>x.f(t));};
 let left=3;const L=K.createPlayLoop(()=>--left>0);assert.equal(queue.length,0,'0 rAF before wake');
 L.wake();assert.equal(queue.length,1);L.wake();assert.equal(queue.length,1,'one chain only');
 flush(16);flush(33);flush(50);assert.equal(queue.length,0,'stops itself when tick says done');assert.equal(L.frames,3);assert.ok(L.asleep);
 left=100;L.wake();flush(66);L.setVisible(false);assert.equal(queue.length,0,'off-screen: no frames');L.setVisible(true);assert.equal(queue.length,1,'resumes on screen');
 L.dispose();assert.equal(queue.length,0);L.wake();assert.equal(queue.length,0,'disposed for good');
 let n=0;const R=K.createPlayLoop(()=>++n<40,{reduced:true});R.wake();assert.equal(queue.length,0,'reduced motion: no rAF');assert.equal(n,40,'…the simulation runs straight to its end');
 let m=0;const C=K.createPlayLoop(()=>{m++;return true;},{fps:30});C.wake();flush(1000);flush(1010);assert.equal(m,1,'30 fps cap skips early frames');C.dispose();
 const s=K.spring(0);s.target=1;let k=0;while(!K.stepSpring(s,1/60)&&k<600)k++;assert.equal(s.x,1);assert.ok(k<120,'springs settle exactly (so the loop can sleep)');
 delete global.requestAnimationFrame;delete global.cancelAnimationFrame;
 console.log('PASS loop: 0 rAF at rest, one chain, self-stopping, asleep off-screen, disposed, reduced = instant, 30 fps cap, exact springs');}

// 7. Integer pixel grid: P = 4, 3 or 2 CSS px per art pixel, the penalty cabinet's range.
{const g=(w,h)=>K.fitGrid(w,h,[160,160],[304,184]);
 assert.deepEqual(g(342,523),{w:171,h:184,px:2},'390-px phone');assert.equal(g(920,558).px,3,'1440 × 900 desktop');assert.equal(g(1200,900).px,4);assert.equal(g(300,500).px,1,'only when even 2 cannot fit');
 for(const [w,h] of [[342,523],[700,500],[920,558],[1400,1000]]){const s=g(w,h);assert.ok(s.w*s.px<=Math.max(w,160*s.px)&&Number.isInteger(s.px));}
 console.log('PASS grid: whole-number pixel size 2–4, min 160 × 160 art px fits a 390-px phone at 2');}

// 8. Demo model: a harder kick gives the keeper less reach, too hard clears the bar, wide is wide.
{assert.ok(D.reachOf(1)<D.reachOf(0));assert.equal(D.outcome(D.MID,.95).result,'over');assert.equal(D.outcome(1,.4).result,'wide');
 assert.equal(D.outcome(D.MID+.5,.3).result,'saved');assert.equal(D.outcome(D.POST_B-.4,.5).result,'goal');assert.equal(D.aimOf({x:-1,y:0}),null,'pulling toward goal shoots away: no kick');
 const a=D.aimOf({x:2,y:0});assert.ok(Math.abs(a.ty-D.BALL0.y)<1e-9&&a.power>0);assert.ok(Math.abs(D.POST_B-D.POST_A-7.32)<1e-9);
 const f=D.flightAt({ty:8,h:1,power:.5,result:'goal'},0);assert.deepEqual([f.x,f.y,f.z],[D.BALL0.x,D.BALL0.y,0]);
 console.log('PASS demo model: real goal size, power trades reach for height, wide/over/saved/goal');}

// 9. Source rules.
{const files=fs.readdirSync(path.join(root,dir)).concat(fs.readdirSync(path.join(root,dir,'demo')).map(f=>'demo/'+f));
 const src=f=>read(dir+f),code=files.filter(f=>/\.tsx?$/.test(f));
 for(const f of code){const t=src(f).replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g,'');if(f!=='loop.ts')assert.ok(!/requestAnimationFrame\(/.test(t),'rAF only in loop.ts: '+f);}
 const loop=src('loop.ts');assert.match(loop,/IntersectionObserver/);assert.match(loop,/dispose\(\)/);
 const stage=src('Stage.tsx');assert.match(stage,/queueMicrotask\(draw\)/,'draws on demand');assert.match(stage,/style\.width=`\$\{s\.w\*s\.px\}px`/,'integer CSS size');
 const css=src('pixeliso.module.css');assert.match(css,/image-rendering:pixelated/);assert.match(css,/@media \(prefers-reduced-motion:reduce\)/);assert.match(css,/-webkit-touch-callout:none/);
 assert.match(css,/url\('\/museum\/experiences\/penalty-1891\/fonts\/press-start-2p-latin\.woff2'\)/);assert.match(css,/url\('\/museum\/experiences\/penalty-1891\/fonts\/pixelify-sans-latin\.woff2'\)/);
 assert.ok(!files.some(f=>/\.(woff2?|ttf|otf)$/.test(f)),'fonts referenced, not copied');
 for(const m of css.matchAll(/min-height:(\d+)px/g))assert.ok(+m[1]>=28);
 for(const sel of ['.toggle button','.action','.primary,.ghost','.checkOpt']){const r=css.slice(css.indexOf(sel+'{'));const h=+(/min-height:(\d+)px/.exec(r)||[])[1];assert.ok(h>=44,sel+' ≥ 44 px');}
 const hooks=src('hooks.ts');for(const h of ['usePlayLoop','useDrag','useTap','useHold','useKeys','useReadout'])assert.match(hooks,new RegExp('export function '+h));
 const cab=src('Cabinet.tsx');for(const c of ['Cabinet','Stats','Pips','Toggle','ActionButton','Banner','StoryIntro','QuickCheck','ScoreScreen'])assert.match(cab,new RegExp('export (const|function) '+c+'\\b'));
 assert.match(cab,/data-pixel-cabinet/);assert.match(cab,/data-pixel-readout/);
 const page=read('app/museum-lab/pixeliso/page.tsx');assert.match(page,/guardLabRoute\(\)/);assert.match(page,/robots:\{index:false/);
 const doc=read('docs/museum-pixel-iso.md');for(const s of ['## Palette','## Pixel grid','## Isometric angle','## Players','## HUD','## Score screen','## Motion','## Do','## Don’t','#fcd824','16 × 8','prefers-reduced-motion'])assert.ok(doc.includes(s),'style guide: '+s);
 assert.ok(read('package.json').includes('node tests/museum-pixeliso-kit.cjs'),'in npm test');
 console.log('PASS source: rAF only in the loop, on-demand draws, pixelated + integer scale, penalty fonts referenced, reduced motion, 44 px targets, hooks + HUD exported, dev-only lab, style guide');}
console.log('museum-pixeliso-kit: all passed');
