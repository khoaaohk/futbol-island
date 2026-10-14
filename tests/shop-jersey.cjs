// Futbol shop · Jersey studio (Oct 12 2026): design schema, validation, the name filter, price, storage, the procedural mesh,
// the heat rules (0 rAF at rest, capped pixel ratio and texture size, debounced re-upload, lazy three.js, dispose) and the
// "no real teams or brands" rule. Static + node checks only; the browser checks (rAF counts, GPU/CPU per frame) live in
// the studio's scratchpad probes and are summarised in components/shop/jerseyScene.ts.
const assert=require('node:assert/strict'),fs=require('fs'),path=require('path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const J=require('../lib/shop/jersey.ts');
const A=require('../lib/shop/paint/artOps.ts');
const {buildJersey}=require('../lib/shop/jerseyShape.ts');
const rev=s=>s.split('').reverse().join('');

// 1. Schema and validation
assert.equal(J.JERSEY_KEY,'fi2-shop-jersey-v1');
assert.equal(J.JERSEY_SLOTS,3);
assert.ok(J.validateJersey(J.DEFAULT_JERSEY).ok,'the default design is valid');
for(const p of J.PRESETS)assert.ok(J.validateJersey(p.design).ok,`preset ${p.id} is valid`);
assert.ok(J.PRESETS.length>=12&&J.PRESETS.length<=16,'12+ starter designs (v2: more presets)');
assert.equal(new Set(J.PRESETS.map(p=>p.id)).size,J.PRESETS.length,'preset ids are unique');
assert.ok(J.KIT_PALETTES.length>=10,'curated kit palettes');
for(const p of J.KIT_PALETTES){assert.ok(p.colors.every(J.isHex));assert.ok(J.contrast(p.colors[0],p.colors[1])>=1.5,`palette ${p.id}: main and second contrast`);}
assert.equal(J.PATTERNS.length,11,'11 patterns');
assert.deepEqual(J.PATTERNS.map(p=>p.id),['solid','stripes','hoops','pinstripes','sash','halves','quarters','chevron','checkers','fade','waves']);
assert.deepEqual(J.COLLARS.map(c=>c.id),['crew','vneck','polo','wrap']);
assert.deepEqual(J.SLEEVES.map(c=>c.id),['short','long']);
assert.ok(J.FONTS.length>=3&&J.FONTS.length<=4,'3–4 fonts');
assert.deepEqual(J.CREST_SHAPES.map(c=>c.id),['shield','roundel','diamond']);
for(const icon of['star','ball','wave','palm'])assert.ok(J.CREST_ICONS.some(i=>i.id===icon),`crest icon ${icon}`);
assert.ok(J.SPONSORS.some(s=>s.id==='none'),'"no sponsor" is an option');
{const bad=J.validateJersey({v:1,sleeves:'cape',collar:'crew',pattern:'tartan',primary:'red',number:150,name:'Leo<script>',crest:{shape:'star',initials:'TOOLONG'},sponsor:'megacorp'});
 assert.equal(bad.ok,false);
 for(const k of['sleeves','pattern','primary','number','name','crest.shape','crest.initials','sponsor'])assert.ok(bad.errors.includes(k),`flags ${k}`);
 assert.ok(J.validateJersey(bad.design).ok,'the repaired design is valid');
 assert.equal(bad.design.number,J.DEFAULT_JERSEY.number);assert.equal(bad.design.name,'');}
assert.equal(J.validateJersey(null).ok,false);assert.ok(J.validateJersey(null).design.v===1);
assert.ok(J.validateJersey({...J.DEFAULT_JERSEY,number:null}).ok,'no number is allowed');
assert.ok(J.validateJersey({...J.DEFAULT_JERSEY,primary:'#ABCDEF'}).design.primary==='#abcdef','custom colours are kept (lower-cased)');
{let seed=7;const rand=()=>((seed=(seed*16807)%2147483647)/2147483647);
 const pals=new Set(J.KIT_PALETTES.map(p=>[...p.colors].sort().join()));
 for(let i=0;i<300;i++){const d=J.randomJersey({name:'Mia',number:4},rand);assert.ok(J.validateJersey(d).ok,'random designs validate');assert.equal(d.name,'Mia');assert.ok(J.contrast(d.primary,d.secondary)>=1.5);
  assert.ok(pals.has([d.primary,d.secondary,d.accent].sort().join()),'Randomise only uses curated palettes');}
 const art={v:1,ops:[['p','t','#ffd23f',0,1000,1000,1]]};
 assert.deepEqual(J.randomJersey({name:'',number:9,art},rand).art,art,'Randomise keeps the drawing');}

// 1b. The drawing ("draw your own design", v2): compact vector ops, validation, caps (lib/shop/paint/artOps.ts)
{const pts=[{x:100,y:200,up:true},{x:110,y:205},{x:140,y:230},{x:900,y:900},{x:905,y:880},{x:2000,y:1500,up:true},{x:4095,y:0}];
 const enc=A.encodePoints(pts);assert.match(enc,/^[A-Za-z0-9_\-!*]+$/,'points pack into base64url + 2 markers');
 assert.deepEqual(A.decodePoints(enc).map(p=>[p.x,p.y,!!p.up]),pts.map(p=>[p.x,p.y,!!p.up]),'points round-trip');
 assert.equal(A.countPoints(enc),pts.length);
 // smooth strokes cost ~2 chars per point
 const smooth=Array.from({length:200},(_,i)=>({x:1000+i*8,y:1500+Math.round(Math.sin(i/9)*20),up:i===0}));
 assert.ok(A.encodePoints(smooth).length<=5+199*2,'small moves are 2-char deltas');
 for(const bad of['','abcd','!AAA','!AAAA%%','*AAAA','!AAAAZ'])assert.equal(A.decodePoints(bad),null,`rejects "${bad}"`);
 assert.equal(A.decodePoints('!AAAA'+'AA'),null,'deltas that leave the grid are rejected');}
{const D=J.DEFAULT_JERSEY,s=(n=3)=>['b',1,'#ffd23f',0,A.encodePoints(Array.from({length:n},(_,i)=>({x:500+i*10,y:600,up:i===0})))];
 const good={v:1,ops:[s(),['s',2,'#2ec4d6',1,A.encodePoints([{x:1200,y:900,up:true},{x:1220,y:910}])],['e',0,'#000000',0,A.encodePoints([{x:505,y:600,up:true}])],['p','t','#ff6b5b',1,800,700,2],['p','r','#f7f3ea',0,800,1500,0],['f','#7b4bb7',0,300,300]]};
 const v=J.validateJersey({...D,art:good});assert.ok(v.ok,'a design with a drawing validates');assert.deepEqual(v.design.art,good,'and keeps it');
 assert.ok(J.validateJersey(v.design).ok);
 // bad drawings are dropped whole and reported as 'art'; the rest of the design survives
 const bads=[{v:2,ops:[]},'png-data',[s()],{v:1,ops:'x'},{v:1,ops:[['b',3,'#ffd23f',0,'!AAAA']]},{v:1,ops:[['b',1,'red',0,'!AAAA']]},{v:1,ops:[['p','skull','#ffffff',0,1,1,1]]},
  {v:1,ops:[['f','#ffffff',0,5000,1]]},{v:1,ops:[['b',1,'#ffffff',0,'!AA%A']]},{v:1,ops:[['x']]},
  {v:1,ops:Array.from({length:A.ART_MAX_FILLS+1},(_,i)=>['f','#ffffff',0,i,i])},
  {v:1,ops:Array.from({length:A.ART_MAX_OPS+1},()=>['p','c','#ffffff',0,1,1,0])},
  {v:1,ops:[['b',1,'#ffffff',0,'!AAAA'+'gg'.repeat(A.ART_MAX_CHARS/2)]]}];
 for(const art of bads){const r=J.validateJersey({...D,number:7,art});assert.ok(r.errors.includes('art'),`flags bad art ${JSON.stringify(art).slice(0,40)}`);assert.equal(r.design.art,undefined);assert.equal(r.design.number,7);assert.ok(J.validateJersey(r.design).ok);}
 // size cap: ART_MAX_CHARS of JSON per drawing, so 4 drawings (current + 3 slots) stay far inside the sync caps
 assert.ok(A.ART_MAX_CHARS<=16000&&A.ART_MAX_POINTS<=5000&&A.ART_MAX_FILLS<=16,'small caps');
 const big={v:1,ops:[]};let n=0;while(true){const op=['b',1,'#ffd23f',0,A.encodePoints(Array.from({length:40},(_,i)=>({x:(n*37)%3000+i*9,y:(n*53)%3000+(i%5),up:i===0})))];const t={v:1,ops:[...big.ops,op]};if(!A.artFits(t))break;big.ops.push(op);n++;}
 assert.ok(big.ops.length>40,'a busy drawing fits (>1600 points)');
 const st=A.artStats(big);assert.ok(st.chars<=A.ART_MAX_CHARS&&st.points<=A.ART_MAX_POINTS);
 assert.ok(J.validateJersey({...D,art:big}).ok,'a drawing right at the cap is fine');
 assert.ok(A.artFullness(big)>.85&&A.artFullness(undefined)===0,'paint-left meter');
 const save={v:1,current:{...D,art:big},slots:[1,2,3].map(i=>({name:'Design '+i,design:{...D,art:big},savedAt:i})),updatedAt:1};
 const bytes=Buffer.byteLength(JSON.stringify(save));
 const SNAP=read('lib/saves/snapshot.ts'),keyCap=eval(SNAP.match(/MAX_KEY_BYTES=([0-9*]+)/)[1]);
 assert.ok(bytes<keyCap/4,`worst-case jersey save ${bytes} B is under a quarter of the ${keyCap} B per-key sync cap`);
 // price: a small extra for a drawing, from the table
 assert.ok(J.JERSEY_PRICES.drawing>0&&J.JERSEY_PRICES.drawing<J.JERSEY_PRICES.base/5);
 assert.equal(J.jerseyPrice({...D,name:'',number:null,art:good}),J.JERSEY_PRICES.base+J.JERSEY_PRICES.drawing);
 assert.ok(J.jerseyPriceParts({...D,art:good}).some(p=>p.label==='Your own drawing'));
 assert.equal(J.jerseyPrice({...D,name:'',number:null,art:{v:1,ops:[]}}),J.JERSEY_PRICES.base,'an empty drawing costs nothing');}

// 1c. Undo / redo per stroke (the studio's reducer)
{const D=J.DEFAULT_JERSEY;let h={design:D,past:[],future:[],key:'',at:0};
 const stroke=i=>['b',1,'#ffd23f',0,A.encodePoints([{x:100*i,y:100,up:true},{x:100*i+20,y:120}])];
 let t=1000;for(let i=1;i<=5;i++){const ops=[...(h.design.art?.ops??[]),stroke(i)];h=J.jerseyHistory(h,{type:'set',design:{...h.design,art:{v:1,ops}},now:t+=50});}
 assert.equal(h.design.art.ops.length,5);assert.equal(h.past.length,5,'each stroke is its own undo step (no merging)');
 h=J.jerseyHistory(h,{type:'undo'});h=J.jerseyHistory(h,{type:'undo'});assert.equal(h.design.art.ops.length,3,'undo removes the last stroke');
 h=J.jerseyHistory(h,{type:'redo'});assert.equal(h.design.art.ops.length,4,'redo puts it back');
 assert.deepEqual(h.design.art.ops[3],stroke(4),'the redone stroke is the 4th');
 const ops=h.design.art.ops;h=J.jerseyHistory(h,{type:'set',design:{...h.design,art:undefined},now:t+=50});assert.equal(h.design.art,undefined,'clear drawing');
 h=J.jerseyHistory(h,{type:'undo'});assert.equal(h.design.art.ops,ops,'clear is undoable');
 assert.equal(h.future.length,1);h=J.jerseyHistory(h,{type:'set',design:{...h.design,number:3}});assert.equal(h.future.length,0,'a new edit drops the redo stack');
 let m={design:D,past:[],future:[],key:'',at:0};for(let i=0;i<5;i++)m=J.jerseyHistory(m,{type:'set',design:{...m.design,name:'Leo'.slice(0,1+i%3)+'x'.repeat(i)},key:'name',now:2000+i*100});
 assert.equal(m.past.length,1,'typing merges into one step');
 for(let i=0;i<80;i++)m=J.jerseyHistory(m,{type:'set',design:{...m.design,number:i},now:5000+i*1000});assert.equal(m.past.length,J.JERSEY_UNDO_MAX,'bounded history');}

// 2. Text safety: letters, spaces and hyphens; 12 characters; a small blocklist (rude words, real clubs and kit makers)
assert.equal(J.cleanName('Zoë 7!!'),'Zoe ');assert.equal(J.cleanName('  Jo--Ann  '),'Jo-Ann ');
assert.equal(J.cleanName('ABCDEFGHIJKLMNOP').length,12);
for(const ok of['Leo','Mia Rose','Jo-Ann','Cassie','Hancock','Diego','Dickinson','Essex','Ignazio','Sam'])assert.equal(J.nameProblem(ok),null,`${ok} is fine`);
for(const bad of[rev('kcuf'),'Big '+rev('tihs'),rev('ssa'),rev('lanesra'),'FC '+rev('anolecrab'),rev('ekin'),rev('amup')])assert.ok(J.nameProblem(bad),`blocked: ${rev(bad)} (reversed)`);
assert.match(J.nameProblem(rev('lanesra')),/island name/,'real clubs get the "make up your own" message');
assert.equal(J.nameProblem('Leo7'),'Letters, spaces and hyphens only.');
assert.equal(J.nameProblem('ABCDEFGHIJKLM'),'Up to 12 letters.');
assert.ok(J.initialsOk('FI')&&J.initialsOk('ABC')&&!J.initialsOk('ABCD')&&!J.initialsOk(rev('ssa').toUpperCase())&&!J.initialsOk('fi'));
assert.equal(J.cleanNumber('7a'),7);assert.equal(J.cleanNumber(150),99);assert.equal(J.cleanNumber(-3),0);assert.equal(J.cleanNumber(''),null);

// 3. Price (coins): base + long sleeves + polo/wrap collar + name & number print, all from JERSEY_PRICES (the shop sets them)
const P=J.JERSEY_PRICES,plain={...J.DEFAULT_JERSEY,name:'',number:null};
assert.ok(P.base>0&&P.longSleeves>0&&P.collar>0&&P.print>0);
assert.equal(J.jerseyPrice(plain),P.base);
assert.equal(J.jerseyPrice(J.DEFAULT_JERSEY),P.base+P.print);
assert.equal(J.jerseyPrice({...J.DEFAULT_JERSEY,sleeves:'long',collar:'polo',name:'Leo'}),P.base+P.longSleeves+P.collar+P.print);
assert.equal(J.jerseyPriceParts({...J.DEFAULT_JERSEY,sleeves:'long'}).reduce((a,p)=>a+p.coins,0),J.jerseyPrice({...J.DEFAULT_JERSEY,sleeves:'long'}));
assert.equal(J.jerseyPrice({...plain,sleeves:'cape'}),P.base,'price validates its input');
{const studio=read('components/shop/JerseyStudio.tsx');assert.ok(!/\b(1[2-5][05]|[2-4]\d\d)\s*coins/.test(studio),'the studio never hard-codes a price');}

// 4. Storage: auto-save + 3 slots, robust to junk
{const mem={};const S={getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v;}};
 assert.deepEqual(J.loadJerseySave(S).slots,[null,null,null]);
 const save=J.loadJerseySave(S);save.slots[1]={name:'Home kit',design:J.PRESETS[1].design,savedAt:5};save.current={...J.DEFAULT_JERSEY,number:3};
 assert.ok(J.writeJerseySave(save,S));
 const back=J.loadJerseySave(S);assert.equal(back.current.number,3);assert.equal(back.slots[1].name,'Home kit');assert.equal(back.slots[0],null);
 mem[J.JERSEY_KEY]='{not json';assert.deepEqual(J.loadJerseySave(S).slots,[null,null,null],'corrupt JSON falls back to an empty save');
 mem[J.JERSEY_KEY]=JSON.stringify({current:{pattern:'tartan'},slots:[{name:'x1!',design:{collar:'nope'}},'junk']});
 const fixed=J.loadJerseySave(S);assert.ok(J.validateJersey(fixed.current).ok&&J.validateJersey(fixed.slots[0].design).ok&&fixed.slots[1]===null);
 // v2 migration: a v1 save (no drawings) loads unchanged, so a design bought before keeps the same JSON (same purchase id)
 const v1={v:1,current:J.PRESETS[2].design,slots:[{name:'Home',design:J.PRESETS[1].design,savedAt:7},null,{name:'Away',design:{...J.DEFAULT_JERSEY,number:null},savedAt:9}],updatedAt:3};
 mem[J.JERSEY_KEY]=JSON.stringify(v1);const m1=J.loadJerseySave(S);
 assert.equal(JSON.stringify(m1.current),JSON.stringify(v1.current),'old current design: byte-identical');
 assert.equal(JSON.stringify(m1.slots[0].design),JSON.stringify(v1.slots[0].design),'old slot: byte-identical');
 assert.ok(!('art' in m1.current),'no empty art key is added');
 // a bare design stored on its own, slots as an object, too many slots
 mem[J.JERSEY_KEY]=JSON.stringify({...J.PRESETS[3].design});assert.equal(J.loadJerseySave(S).current.pattern,J.PRESETS[3].design.pattern,'bare design → current');
 mem[J.JERSEY_KEY]=JSON.stringify({v:1,current:J.DEFAULT_JERSEY,slots:{a:{name:'One',design:J.PRESETS[4].design,savedAt:1}}});assert.equal(J.loadJerseySave(S).slots[0].name,'One','slot map → array');
 mem[J.JERSEY_KEY]=JSON.stringify({v:1,current:J.DEFAULT_JERSEY,slots:Array.from({length:6},(_,i)=>({name:'S'+'abcdef'[i],design:J.DEFAULT_JERSEY,savedAt:i}))});assert.equal(J.loadJerseySave(S).slots.length,3,'extra slots dropped');
 // drawings survive save → reload (and a corrupt drawing in one slot only drops that drawing)
 const art={v:1,ops:[['p','t','#ffd23f',1,900,800,2],['b',0,'#15171a',0,A.encodePoints([{x:700,y:700,up:true},{x:720,y:730},{x:760,y:760}])],['f','#2ec4d6',0,400,400]]};
 const sv=J.emptySave({...J.DEFAULT_JERSEY,art});sv.slots[1]={name:'Drawn',design:{...J.PRESETS[1].design,art},savedAt:1};sv.slots[2]={name:'Broken',design:{...J.PRESETS[1].design,art:{v:1,ops:[['b',1,'#ffffff',0,'%%']]}},savedAt:2};
 J.writeJerseySave(sv,S);const back2=J.loadJerseySave(S);
 assert.deepEqual(back2.current.art,art,'drawing survives reload');assert.deepEqual(back2.slots[1].design.art,art,'and in a slot');
 assert.equal(back2.slots[2].design.art,undefined,'a corrupt drawing is dropped');assert.equal(back2.slots[2].design.pattern,J.PRESETS[1].design.pattern,'the rest of that slot is kept');
 // buying: the till re-validates the design it is handed and keeps the drawing
 const bought=J.validateJersey(JSON.parse(JSON.stringify(back2.current)));assert.ok(bought.ok);assert.deepEqual(bought.design.art,art);}

// 5. The procedural mesh: every style builds, finite, UVs inside the atlas, indices in range, a collar and (optional) cuffs
for(const sleeves of['short','long'])for(const collar of['crew','vneck','polo','wrap'])for(const cuffs of[true,false]){
 const {body,trim}=buildJersey({sleeves,collar,cuffs}),n=body.position.length/3;
 assert.ok(n>4000&&n<20000,`body vertex budget (${n})`);
 for(const a of[body.position,body.normal,body.uv,body.seam,trim.position,trim.normal])assert.ok(a.every(Number.isFinite),'finite');
 assert.ok(body.uv.every(v=>v>=0&&v<=1),'UVs inside the atlas');
 assert.ok(body.index.every(i=>i<n)&&trim.index.every(i=>i<trim.position.length/3),'indices in range');
 assert.ok(trim.index.length>0,'trim mesh present');
 assert.equal(body.color.length,body.position.length,'baked AO vertex colours');
}

// 6. Heat rules (static): render on demand, 0 rAF at rest, capped resolution, debounced uploads, lazy three, dispose
const scene=read('components/shop/jerseyScene.ts'),studio=read('components/shop/JerseyStudio.tsx');
assert.ok(!/setAnimationLoop|setInterval/.test(scene),'no animation loop or polling');
assert.equal((scene.match(/requestAnimationFrame\(/g)||[]).length,1,'one rAF call site');
assert.match(scene,/const request=\(\)=>\{if\(!raf&&!disposed&&!document\.hidden\)\{raf=requestAnimationFrame\(frame\);\}\};/,'rAF only through request(), never while hidden');
assert.match(scene,/if\(moving\)request\(\);else last=0;/,'a frame only schedules the next while something moves');
assert.match(scene,/Math\.min\(window\.devicePixelRatio\|\|1,phone\?1\.5:2\)/,'pixel ratio ≤ 1.5 on phones');
assert.match(scene,/const texSize=phone\?1024:2048;/,'texture 1024² on phones, 2048² on desktop');
assert.match(scene,/paintTimer=setTimeout\(paint,110\)/,'texture repaint/upload debounced after edits');
assert.match(scene,/design\.needsUpdate=true/,'CanvasTexture re-uploaded only from paint()');
assert.equal((scene.match(/new THREE\.Mesh\(/g)||[]).length,2,'two draw calls: body + trims');
assert.ok(!/castShadow|shadowMap\.enabled\s*=\s*true|EffectComposer/.test(scene),'no shadows or post-processing');
assert.match(scene,/visibilitychange/,'pauses while the tab is hidden');
const disp=scene.slice(scene.indexOf('dispose(){'));
for(const s of['cancelAnimationFrame(raf)','ro.disconnect()',"removeEventListener('visibilitychange'",'geometry.dispose()','bodyMat.dispose()','trimMat.dispose()','design.dispose()','knit.dispose()','rib.dispose()','renderer.dispose()','forceContextLoss()','canvas.remove()',
 'clearTimeout(flushTimer)','pickRT?.dispose()','pickMat.dispose()','occMat.dispose()','flatC.remove()','ring.remove()','lineEl.remove()',"flatC.removeEventListener('pointerdown'"])assert.ok(disp.includes(s),`dispose: ${s}`);
assert.match(disp,/for\(const c of\[baseC,layerC,printsC,stageC,template,flatC\]\)if\(c\)\{c\.width=c\.height=1;\}/,'dispose frees the layer canvases');
// Heat rules for drawing (v2): paint on pointer events only, ≤ 30 uploads/s of the dirty rect, pick buffer (no per-move raycast),
// the flat view never renders WebGL, the turntable renders at ≤ 30 fps and stops by itself, and still 0 rAF at rest.
assert.ok(!/Raycaster/.test(scene),'no per-move raycasting: UVs come from the pick buffer');
assert.match(scene,/readRenderTargetPixels\(pickRT/,'pick buffer read back once per view');
assert.match(scene,/if\(s===pickSig&&pickBuf\)return true;/,'pick buffer reused while the view is still');
assert.match(scene,/const wait=\(flatOn\?16:33\)-\(performance\.now\(\)-lastFlush\);/,'GPU uploads at most every 33 ms while painting');
assert.match(scene,/gl\.texSubImage2D\(gl\.TEXTURE_2D,0,x,texSize-y-h,/,'only the dirty rect is uploaded');
assert.match(scene,/if\(flatOn\)\{last=0;return;\}/,'the flat view does not render WebGL');
assert.match(scene,/if\(showoff&&now-lastRender<30\)\{request\(\);return;\}/,'turntable ≤ 30 fps');
// touch devices: every frame ≤ 30 fps (fix pass Oct 13 2026, heat audit), skipped before dt is taken; desktop uncapped
assert.match(scene,/const capMs=studioFrameMs\(\);/,'the jersey scene reads the touch frame cap');
assert.match(scene,/if\(capMs\)\{const next=frameCapSlot\(now,slot,capMs\);if\(next<0\)\{request\(\);return;\}slot=next;\}\n  const dt=last\?/,'≤ 30 fps on touch while spinning or dragging, dt from the last rendered frame');
assert.match(scene,/until:performance\.now\(\)\+3\*TAU\/\.85\*1000/,'turntable stops after three turns');
for(const fn of['strokeStart','strokeSample','strokeMove','strokeEnd','flush','markDirty']){const body=scene.slice(scene.indexOf(`function ${fn}(`),scene.indexOf('\n }',scene.indexOf(`function ${fn}(`)));assert.ok(!/requestAnimationFrame/.test(body),`${fn} never starts a rAF loop`);}
assert.match(scene,/onlyArt/,'a committed stroke does not trigger a full repaint');
assert.match(scene,/getCoalescedEvents/,'coalesced pointer samples keep strokes smooth without extra frames');
assert.match(scene,/reducedMotion/,'reduced motion handled');assert.match(scene,/if\(reduced\)\{rawYaw\+=dYaw;/,'reduced motion: stepped rotation');
assert.match(scene,/if\(first&&!reduced\)\{auto=/,'auto-turn only once and never with reduced motion');
assert.match(studio,/import\('\.\/jerseyScene'\)/,'three.js scene imported lazily when the studio opens');
assert.ok(!/from 'three'/.test(studio),'the studio component does not import three statically');
assert.match(studio,/api\?\.dispose\(\)/,'scene disposed on close');
assert.match(studio,/export default function JerseyStudio\(\{onClose,onBuy\}:\{onClose\(\):void;onBuy\?\(design:JerseyDesign\):void\}\)/,'shared contract props');
assert.match(studio,/<BackButton onBack=\{onClose\} label="Back"\/>/,'the shared Back button, first in the header (top left)');
assert.ok(studio.indexOf('<BackButton')<studio.indexOf('id="jersey-studio-title"'),'Back comes before the title');
const css=read('components/shop/JerseyStudio.module.css');
assert.match(css,/grid-template-columns:minmax\(0,1fr\) 474px/,'shared 474px panel column');
assert.match(css,/\.header\{grid-column:1\/-1;min-height:76px;padding:18px 20px 14px\}/,'shared header padding (20px inset)');
assert.match(css,/\.stageWrap\{grid-column:1;grid-row:2;margin:20px 14px 20px 20px/,'stage card 20px outer margin, 28px gap');
assert.match(studio,/\{id:'draw',label:'Draw'\}/,'the Draw step');
for(const t of['brush','spray','line','stamp','fill','eraser','hand'])assert.ok(studio.includes(`{id:'${t}'`),`tool ${t}`);
for(const sh of["'t'","'h'","'c'","'r'"])assert.ok(studio.includes(`{id:${sh}`),`stamp ${sh}`);
// the On shirt/Flat toggle is the shared components/shop/StudioControls.tsx <StudioModeToggle>, which sets the group's
// aria-label from its `label` prop (Oct 13 2026: shared stage controls across the Boot/Jersey/Ball studios)
assert.match(studio,/StudioModeToggle label="Draw on the shirt or on a flat template"/,'On shirt / Flat toggle');
assert.match(studio,/data-mirror/,'mirror mode');for(const l of['all','front','back','sleeves'])assert.ok(studio.includes(`{id:'${l}'`),`paint-on lock ${l}`);

// 7. No real teams, crests, sponsors or kit makers anywhere in the studio's files
const files=['lib/shop/paint/artOps.ts','lib/shop/jersey.ts','lib/shop/jerseyPaint.ts','lib/shop/jerseyShape.ts','components/shop/JerseyStudio.tsx','components/shop/jerseyScene.ts','components/shop/JerseyStudio.module.css','app/shop-lab/jersey/page.tsx','app/shop-lab/jersey/JerseyLab.tsx'];
const REAL=['nike','adidas','puma','umbro','kappa','hummel','macron','errea','new balance','under armour','emirates','etihad','arsenal','chelsea','liverpool','barcelona','barca','real madrid','juventus','bayern','manchester','tottenham','psg','ajax','celtic','rangers','boca','river plate','galatasaray','benfica','porto','inter milan','ac milan','dortmund'];
for(const f of files){const t=read(f).toLowerCase();for(const w of REAL)assert.ok(!new RegExp(`\\b${w}\\b`).test(t),`${f} mentions "${w}"`);}
for(const s of J.SPONSORS)assert.ok(J.nameProblem(s.line.replace(/[^A-Za-z -]/g,''))==null,'sponsor wordmarks pass the filter');

console.log('PASS shop jersey: schema, drawing ops + caps + validation, undo/redo per stroke, migration, text filter, price, storage, mesh, heat rules, dispose, no real brands');
