// Football shop · Ball studio (Oct 12 2026; v2 "draw your own design" the same day): the design schema and validation, the name
// filter, the curated quotes, the decal limit, the price, storage + migration + the drawing pool and its size caps, the paint
// engine (strokes, symmetry, stamps, undo/redo), the fill-a-panel id mirror vs the shader, and static heat/dispose/brand checks.
// usage: node tests/shop-ball.cjs
//        BALL_LAB_URL=http://localhost:8146/shop-lab/ball node tests/shop-ball.cjs   (+ the browser run: 0 rAF at rest and
//        after drawing, the GPU panel ids vs the JS mirror, dispose; needs a server with FI_SHOP_LAB=1)
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
const root=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const B=require('../lib/shop/ball.ts'),P=require('../lib/shop/ballPaint.ts'),PN=require('../lib/shop/ballPanels.ts');

// 1. Schema: the key, the default, and validation of anything stored or sent.
{assert.equal(B.BALL_KEY,'fi2-shop-ball-v1');
 const d=B.validateBall(B.DEFAULT_BALL);assert.deepEqual(d,B.DEFAULT_BALL,'the default is valid as-is');
 for(const bad of [null,undefined,42,'x',[],{}])assert.deepEqual(B.validateBall(bad),B.validateBall(B.DEFAULT_BALL),'junk becomes the default ball');
 const v=B.validateBall({layout:'nope',finish:'gold',colors:{a:'red',b:'#ABCDEF',c:'#12345'},pattern:{kind:'tartan',c1:'#000000',on:'z',seed:1e9},size:7,futsal:'yes',extra:1});
 assert.equal(v.layout,'classic32');assert.equal(v.finish,'gloss');assert.equal(v.colors.a,B.DEFAULT_BALL.colors.a);assert.equal(v.colors.b,'#abcdef');assert.equal(v.colors.c,B.DEFAULT_BALL.colors.c);
 assert.equal(v.pattern.kind,'none');assert.equal(v.pattern.on,'all');assert.equal(v.pattern.seed,9999);assert.equal(v.size,B.DEFAULT_BALL.size);assert.equal(v.futsal,false);assert.ok(!('extra' in v));
 assert.deepEqual(B.LAYOUTS.map(l=>[l.id,l.panels]),[['classic32',32],['panel26',26],['panel14',14],['propeller6',6],['panel8',8],['leather18',18]]);
 for(const l of B.LAYOUTS){assert.ok(l.groups.length>=2&&l.groups.length<=3);assert.ok(l.fact.length>20&&l.fact.length<160,'each layout teaches something short');}
 assert.deepEqual(B.FINISHES.map(f=>f.id),['gloss','matte','dimple','leather','holo','metal']);
 assert.deepEqual(B.PATTERNS.map(p=>p.id),['none','stripes','swoosh','stars','splatter','gradient','confetti','waves','flames']);
 assert.deepEqual(B.SIZES.map(s=>s.id),[3,4,5]);assert.ok(B.PRESETS.length>=12,'v2: at least 12 presets');
 assert.equal(new Set(B.PRESETS.map(p=>p.id)).size,B.PRESETS.length,'preset ids are unique');
 for(const p of B.PRESETS)assert.deepEqual(B.validateBall(p.design),p.design,p.id+' preset is valid');
 assert.ok(B.PRESETS.some(p=>p.label==='Classic black & white')&&B.PRESETS.some(p=>p.design.layout==='leather18'));
 // Decals: unit directions, clamped sizes, unknown refs dropped.
 const dec=B.validateBall({decals:[{kind:'sticker',ref:'star',dir:[0,0,5],size:9,rot:0},{kind:'sticker',ref:'skull',dir:[0,0,1]},{kind:'flag',ref:'br',dir:[1,0,0]},{kind:'flag',ref:'xx',dir:[1,0,0]},{kind:'sticker',ref:'star',dir:[0,0,0]}]}).decals;
 assert.equal(dec.length,2);assert.deepEqual(dec[0].dir,[0,0,1]);assert.equal(dec[0].size,B.DECAL_SIZE.max);
 console.log('PASS schema: key, default, validation, 6 layouts, 6 finishes, 9 patterns, sizes, presets, decal cleaning');}

// 2. Text filter: letters, spaces and hyphens, ≤ 12, a blocklist; numbers 0–99.
{const f=B.filterNameInput;
 assert.equal(f('Maya 10!!'),'Maya ');assert.equal(f('Zoë-Anne'),'Zoë-Anne');assert.equal(f('ABCDEFGHIJKLMNOP'),'ABCDEFGHIJKL');assert.equal(f('a<script>'),'ascript');assert.equal(f('  Leo   Ray'),'Leo Ray');assert.equal(f('🙂Sam'),'Sam');
 assert.equal(f('Jo--Jo'),'Jo-Jo');
 for(const ok of ['Maya','Zoë-Anne','Cassie','Matt','Sussex','Hancock','Arsenal','Fukuda','Dickson','Titus'])assert.ok(B.isNameAllowed(ok),ok+' is allowed');
 for(const bad of ['','  ','poo','Big Butt','sh1t','F u c k','Idiot','stupid','Maya123','a'.repeat(13),'kill','B1tch'])assert.ok(!B.isNameAllowed(bad),JSON.stringify(bad)+' is blocked');
 assert.equal(B.cleanNumber('7'),7);assert.equal(B.cleanNumber('99'),99);assert.equal(B.cleanNumber(0),0);
 for(const bad of ['100','-1','7.5','abc','',' ',null])assert.equal(B.cleanNumber(bad),null);
 const v=B.validateBall({decals:[{kind:'name',ref:'poo',dir:[0,0,1]},{kind:'name',ref:'Maya!!',dir:[0,0,1]},{kind:'number',ref:'123',dir:[0,0,1]},{kind:'number',ref:'9',dir:[0,0,1]}]}).decals;
 assert.deepEqual(v.map(d=>[d.kind,d.ref]),[['name','Maya'],['number','9']],'blocked names and bad numbers never reach the ball');
 console.log('PASS text: letters/spaces/hyphens, 12 max, blocklist (whole-word for short words), numbers 0–99');}

// 3. Curated quotes: short and kind; kids pick, never type.
{assert.ok(B.QUOTES.length>=6);for(const q of B.QUOTES){assert.ok(q.text.length<=14,q.text);for(const w of q.text.replace('&','and').split(' '))assert.ok(B.isNameAllowed(w),q.text+' passes the word filter');}
 for(const t of ['Team first','Dream big','Play fair'])assert.ok(B.QUOTES.some(q=>q.text===t),t);
 assert.equal(B.validateBall({decals:[{kind:'quote',ref:'free text',dir:[0,0,1]}]}).decals.length,0,'only curated quote ids');
 console.log('PASS quotes: curated list incl. Team first / Dream big / Play fair; free text rejected');}

// 4. Decal limit: at most 8.
{assert.equal(B.MAX_DECALS,8);const many=Array.from({length:12},(_,i)=>({id:'s'+i,kind:'sticker',ref:'star',dir:[0,0,1]}));
 assert.equal(B.validateBall({decals:many}).decals.length,8);
 const dup=B.validateBall({decals:[{id:'a',kind:'sticker',ref:'star',dir:[0,0,1]},{id:'a',kind:'sticker',ref:'heart',dir:[0,1,0]}]}).decals;assert.notEqual(dup[0].id,dup[1].id,'decal ids are unique');
 const shader=read('lib/shop/ballShader.ts');assert.match(shader,/MAX_SHADER_DECALS=8/);
 console.log('PASS decals: ≤ 8 (schema and shader), unique ids');}

// 5. Price: whole coins, adds up, stable bounds.
{const P=B.ballPrice,base=B.PRICE.base;assert.equal(base,160,'a plain classic size-3 ball is 160 (150 until the 14 Oct 2026 rebalance; the user\'s floor is 150)');assert.equal(P(B.validateBall({size:3})),base);assert.equal(P(B.DEFAULT_BALL),base+10);
 const max=B.validateBall({layout:'leather18',finish:'holo',pattern:{kind:'stars'},size:5,futsal:true,decals:Array.from({length:8},(_,i)=>({id:'d'+i,kind:'sticker',ref:'star',dir:[0,0,1]}))});
 assert.equal(P(max),base+50+60+25+80+25+10);
 const drawn=B.validateBall({...max,art:{id:'abc123',fills:[]}});assert.equal(P(drawn),base+250+B.PRICE.drawing,'a drawing is a small extra');assert.equal(B.PRICE.drawing,20);
 const filled=B.validateBall({art:{id:'',fills:['#ff0000']}});assert.equal(P(filled),P(B.DEFAULT_BALL)+20,'a filled panel counts as a drawing');
 assert.ok(B.priceLines(drawn).some(l=>l.label==='Your drawing'&&l.coins===20));
 for(let i=0;i<50;i++){const r=B.randomBall(B.DEFAULT_BALL,(()=>{let s=i*97+1;return ()=>(s=(s*16807)%2147483647)/2147483647;})());const p=P(r);assert.ok(Number.isInteger(p)&&p>=base&&p<=base+250);
  assert.equal(B.priceLines(r).reduce((a,l)=>a+l.coins,0),p,'the bill adds up to the price');
  // Harmonious randomise: every colour comes from one curated palette.
  const pal=B.PALETTES.find(x=>[r.colors.a,r.colors.b,r.colors.c,r.pattern.c1,r.pattern.c2].every(c=>x.cols.includes(c)));assert.ok(pal,'randomise uses one curated palette');}
 assert.equal(B.priceLines(drawn).reduce((a,l)=>a+l.coins,0),P(drawn));
 const kept=B.randomBall(B.validateBall({art:{id:'keep1',fills:Array(32).fill('#ff0000')}}),()=>.99);assert.equal(kept.art.id,'keep1','randomise keeps the drawing');
 assert.ok(kept.layout==='classic32'||kept.art.fills.length===0,'fills are dropped when the layout changes (panel ids differ)');
 console.log('PASS price: '+base+'–'+(base+270)+' coins (+20 for a drawing), bill lines sum to the price, curated-palette randomise');}

// 6. Storage: current + 3 named slots under one key.
{const mem=new Map(),store={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,v)};
 assert.deepEqual(B.loadBallStore(store).slots,[null,null,null]);
 const d=B.validateBall({layout:'panel8'});assert.ok(B.saveBallCurrent(d,store));assert.equal(B.loadBallStore(store).current.layout,'panel8');
 assert.ok(B.saveBallSlot(1,'poo',d,123,store));const st=B.loadBallStore(store);assert.equal(st.slots[1].name,'My ball 2','blocked slot names fall back');assert.equal(st.slots[1].savedAt,123);
 assert.ok(!B.saveBallSlot(3,'x',d,1,store));mem.set(B.BALL_KEY,'{broken');assert.equal(B.loadBallStore(store).current.layout,'classic32','corrupt saves load the default');
 assert.deepEqual([...mem.keys()],[B.BALL_KEY],'one key only');
 console.log('PASS storage: auto-save + 3 named slots under fi2-shop-ball-v1');}

// 6b. Drawings: validation, the size caps, the pool, migration of v1 saves, bought balls.
{const mem=new Map(),store={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,v)};
 const b64=n=>'A'.repeat(n),webp=n=>'data:image/webp;base64,'+b64(n),png=n=>'data:image/png;base64,'+b64(n);
 assert.ok(B.isDrawUrl(webp(100))&&B.isDrawUrl(png(100)));
 for(const bad of [null,'',123,'https://x.example/a.webp','data:image/svg+xml;base64,AAAA','data:image/webp;base64,AA<script>','javascript:alert(1)','data:text/html;base64,AAAA',webp(B.DRAW_MAX_CHARS)])
  assert.ok(!B.isDrawUrl(bad),'rejected drawing: '+String(bad).slice(0,40));
 assert.equal(B.DRAW_MAX_CHARS,16000);assert.ok(B.ART_POOL_MAX<=64000&&B.THUMB_MAX<=6000);
 // art on designs: ids and fills are cleaned; fills follow the layout's panel count.
 const a=B.validateBall({layout:'panel8',art:{id:'BAD ID!',fills:['#FF0000','red',5,'#00ff00',null,'','#123456','#abcdef','#000000','#111111']}}).art;
 assert.equal(a.id,'');assert.equal(a.fills.length,8);assert.deepEqual(a.fills.slice(0,4),['#ff0000','','','#00ff00']);
 assert.deepEqual(B.validateBall({art:{fills:['','']}}).art,{id:'',fills:[]},'no fill → []');
 // Migration: a v1 save (no art, no thumbnails) loads unchanged, and the next write is v2.
 const v1={v:1,current:{v:1,layout:'panel14',colors:{a:'#111111',b:'#222222',c:'#333333'},pattern:{kind:'stars',c1:'#ff0000',c2:'#00ff00',on:'all',seed:3},finish:'matte',decals:[{id:'x1',kind:'sticker',ref:'star',dir:[0,0,1],rot:0,size:.2,color:'#ffffff'}],size:5,futsal:true},
  slots:[null,{name:'Best',design:{layout:'classic32'},savedAt:5},null]};
 mem.set(B.BALL_KEY,JSON.stringify(v1));const m1=B.loadBallStore(store);
 assert.equal(m1.v,2);assert.equal(m1.current.layout,'panel14');assert.equal(m1.current.decals.length,1);assert.equal(m1.current.futsal,true);assert.deepEqual(m1.current.art,{id:'',fills:[]});
 assert.equal(m1.slots[1].name,'Best');assert.deepEqual(m1.art,{});assert.deepEqual(m1.bought,[]);
 assert.equal(B.ballPrice(m1.current),B.ballPrice(B.validateBall(v1.current)),'old balls keep their price');
 // The pool: a drawing travels by id; only referenced, intact drawings are kept, within the caps.
 const u1=webp(3000),id1=B.artHash(u1),u2=png(5000),id2=B.artHash(u2);assert.match(id1,/^[a-z0-9]{1,13}$/);assert.notEqual(id1,id2);
 const d1=B.validateBall({...m1.current,art:{id:id1,fills:[]}});
 assert.ok(B.saveBallCurrent(d1,store,{[id1]:u1,[id2]:u2}));let st=JSON.parse(mem.get(B.BALL_KEY));
 assert.equal(st.v,2);assert.deepEqual(Object.keys(st.art),[id1],'unreferenced drawings are dropped');assert.equal(st.current.art.id,id1);
 assert.equal(B.artUrl(id1,B.loadBallStore(store)),u1,'survives reload');
 assert.ok(B.saveBallSlot(0,'Drawn',B.validateBall({art:{id:id2,fills:[]}}),9,store,{[id2]:u2},'data:image/webp;base64,'+b64(400)));st=B.loadBallStore(store);
 assert.deepEqual(Object.keys(st.art).sort(),[id1,id2].sort().filter(x=>x===id2||st.slots.some(s=>s&&s.design.art.id===x)||st.current.art.id===x));
 assert.equal(st.slots[0].design.art.id,id2,'slots keep their drawing');assert.ok(st.slots[0].thumb.startsWith('data:image/webp'),'slot thumbnail');
 assert.ok(!B.saveBallSlot(1,'x',d1,1,store,{},'https://evil.example/t.png')||!B.loadBallStore(store).slots[1].thumb,'bad thumbnails are dropped');
 // Tampered pool entry (hash mismatch) is dropped and the design forgets the id.
 const raw=JSON.parse(mem.get(B.BALL_KEY));raw.art[id2]=webp(10);mem.set(B.BALL_KEY,JSON.stringify(raw));const t=B.loadBallStore(store);
 assert.ok(!t.art[id2]);assert.equal(t.slots[0].design.art.id,'','a missing drawing is removed so price and picture agree');
 // Buying: the bought drawing stays in the pool (newest BOUGHT_KEEP), and the owned design itself only carries the id.
 const boughtIds=[];for(let i=0;i<6;i++){const u=webp(1000+i),id=B.artHash(u);boughtIds.push(id);assert.ok(B.markBallBought(B.validateBall({art:{id,fills:[]}}),store,{[id]:u}));}
 const bs=B.loadBallStore(store);assert.deepEqual(bs.bought,boughtIds.slice(-B.BOUGHT_KEEP),'newest bought drawings are kept');
 assert.ok(JSON.stringify(B.validateBall(bs.current)).length<2000,'a design with a drawing stays small (the pixels live in the pool)');
 // Worst case: every drawing at the cap. The key stays well under the 256 KB per-key sync cap.
 const big=i=>webp(B.DRAW_MAX_CHARS-40-i);const ids=[0,1,2,3,4].map(i=>B.artHash(big(i)));const memAll=Object.fromEntries(ids.map((id,i)=>[id,big(i)]));
 for(let i=0;i<3;i++)B.saveBallSlot(i,'S'+i,B.validateBall({art:{id:ids[i],fills:[]}}),i,store,memAll,'data:image/webp;base64,'+b64(B.THUMB_MAX-40));
 B.markBallBought(B.validateBall({art:{id:ids[4],fills:[]}}),store,memAll);B.saveBallCurrent(B.validateBall({art:{id:ids[3],fills:[]}}),store,memAll);
 const full=mem.get(B.BALL_KEY),pool=Object.values(JSON.parse(full).art).join('').length;
 const SN=require('../lib/saves/snapshot.ts');assert.ok(full.length<SN.MAX_KEY_BYTES/2,`worst-case BALL_KEY ${full.length} chars < half the per-key cap`);assert.ok(pool<=B.ART_POOL_MAX);
 assert.ok(SN.isSyncKey(B.BALL_KEY),'BALL_KEY syncs with the save code');
 console.log(`PASS drawings: data-URL validation, ≤ ${B.DRAW_MAX_CHARS} chars each, pool ≤ ${B.ART_POOL_MAX} (worst-case key ${full.length} chars), v1 → v2 migration, slots + thumbnails, tamper check, bought drawings kept`);}

// 6c. The paint engine: strokes on the sphere, symmetry, stamps, eraser, marker, undo/redo per stroke, clear, encoding size.
{const W=256,H=128,p=P.createPainter(W,H),up=[0,1,0],right=[1,0,0],front=[0,0,1];
 const at=(d)=>{const [u,t]=P.dirUV(d);const i=Math.min(W-1,Math.floor(u*W)),j=Math.min(H-1,Math.floor(t*H));return p.buf[(j*W+i)*4+3];};
 // The equirect chart is the shader's: texel centre → direction → (u,t) round-trips.
 for(const [i,j] of [[0,0],[17,40],[128,64],[255,127],[200,3]]){const d=P.texelDir(i,j,W,H),[u,t]=P.dirUV(d);assert.ok(Math.abs(u*W-(i+.5))<1e-6||Math.abs(u*W-(i+.5)-W)<1e-6);assert.ok(Math.abs(t*H-(j+.5))<1e-6);}
 assert.ok(p.empty);const opts=(o)=>({tool:'brush',rgb:[255,0,0],size:.08,sym:'off',right,up,...o});
 p.begin(opts(),front);p.to([.2,0,.98]);assert.ok(p.end());assert.equal(at(front),255,'brush paints under the finger');assert.ok(!p.empty);
 const rgb=(d)=>{const [u,t]=P.dirUV(d);const k=(Math.floor(t*H)*W+Math.floor(u*W))*4;return [p.buf[k],p.buf[k+1],p.buf[k+2]];};assert.deepEqual(rgb(front),[255,0,0]);
 assert.equal(at([0,0,-1]),0,'nothing on the back');assert.ok(p.takeDirty(),'a dirty rect for the upload');assert.equal(p.takeDirty(),null);
 assert.ok(p.undo());assert.equal(at(front),0,'undo removes the stroke');assert.ok(p.empty);assert.ok(p.redo());assert.equal(at(front),255,'redo puts it back');
 // Two strokes, undo one at a time.
 p.begin(opts({rgb:[0,0,255]}),[0,1,0]);p.end();assert.equal(at([0,.999,.04]),255,'paints at the pole too');assert.equal(p.steps,2);
 p.undo();assert.equal(at([0,.999,.04]),0);assert.equal(at(front),255);p.undo();assert.ok(p.empty);assert.ok(!p.canUndo&&p.canRedo);
 // A new stroke clears the redo stack.
 p.begin(opts(),front);p.end();assert.ok(!p.canRedo);
 // Symmetry ×5 round the screen's up axis: five blobs.
 p.load(null);const off=[Math.sin(.6),0,Math.cos(.6)];p.begin(opts({sym:'radial5'}),off);p.end();
 for(let k=0;k<5;k++)assert.equal(at(P.rotate(off,up,k*Math.PI*2/5)),255,'radial copy '+k);assert.equal(at(front),0);
 p.load(null);p.begin(opts({sym:'mirror'}),off);p.end();assert.equal(at(off),255);assert.equal(at(P.reflect(off,right)),255,'mirror copy');
 // Eraser and a marker that never darkens over itself within one stroke.
 p.begin(opts({tool:'eraser'}),off);p.end();assert.equal(at(off),0,'eraser');
 p.load(null);p.begin(opts({tool:'marker',size:.1}),front);p.to([.05,0,.999]);p.to([0,0,1]);p.to([.05,0,.999]);p.end();assert.ok(at(front)>100&&at(front)<140,'marker ≈ half ink, no build-up: '+at(front));
 // Stamps.
 for(const k of P.STAMPS){p.load(null);p.begin(opts({tool:'stamp',stamp:k,size:.2}),front);assert.ok(p.end(),k);assert.ok(at(front)>0,k+' stamp centre');assert.equal(at([0,0,-1]),0);}
 p.load(null);p.begin(opts({tool:'stamp',stamp:'bolt',size:.2,sym:'mirror'}),off);p.end();assert.ok(at(off)+at(P.reflect(off,right))>0,'mirrored stamp');
 // Line: preview follows the finger and only the final line stays.
 p.load(null);p.begin(opts({tool:'line',size:.03}),[-.3,0,.95]);p.to([.3,.3,.9]);p.to([.3,0,.95]);p.end();assert.ok(at([0,0,1])>200,'line through the middle');assert.equal(at([0,.15,.98]),0,'the old preview is gone');
 // Cancel (a second finger landed) leaves no trace and no undo step.
 const n0=p.steps;p.begin(opts(),[0,-.5,.86]);p.to([0,-.4,.9]);p.cancel();assert.equal(at([0,-.5,.86]),0);assert.equal(p.steps,n0);
 // Clear is one undo step.
 assert.ok(p.clear());assert.ok(p.empty);p.undo();assert.ok(!p.empty);
 // History is memory-capped (40 steps).
 for(let i=0;i<50;i++){p.begin(opts(),front);p.end();}assert.ok(p.steps<=P.HISTORY_STEPS);assert.ok(p.historyBytes<=P.HISTORY_BYTES);
 // half(): straight alpha at half size, what gets encoded.
 const half=p.half();assert.equal(half.length,W*H);
 console.log('PASS paint: equirect chart = shader, brush/marker/eraser/line/stamps, mirror + ×5 symmetry, undo/redo per stroke, cancel, clear, capped history');}

// 6d. Fill-a-panel: the JS panel ids mirror the shader's layoutAt() for every layout.
{const sh=read('lib/shop/ballShader.ts'),g=n=>String(n).replace(/^0\./,'.');
 assert.ok(sh.includes(`const float A=${g(PN.PROPELLER.A)},K=${g(PN.PROPELLER.K)};`),'propeller constants match');
 const W8=PN.WAVE8;assert.ok(sh.includes(`q=p+${g(W8.amp)}*vec3(sin(${W8.k1}*p.y+${W8.k2}*p.z+${g(W8.ph[0])}),sin(${W8.k1}*p.z+${W8.k2}*p.x+${W8.ph[1]}),sin(${W8.k1}*p.x+${W8.k2}*p.y+${W8.ph[2]}))`),'wave-8 warp matches');
 assert.match(sh,/Cell c=tIcoCell\(p\);return Pan\(c\.id<12\?0:1/);assert.match(sh,/Cell c=rhombiCell\(p\);return Pan\(c\.id<6\?0:\(c\.id<18\?1:2\)/);assert.match(sh,/Cell c=tOctCell\(p\);return Pan\(c\.id<6\?0:1/);
 assert.match(sh,/return Pan\(k==1\.\?1:0,float\(f\)\*3\.\+k/);assert.match(sh,/float\(w\*2\)\+\(sw>0\.\?0\.:1\.\)/);assert.match(sh,/sg\.x\+sg\.y\*2\.\+sg\.z\*4\./);
 assert.match(sh,/uFill\[int\(L\.id\+\.5\)\]/,'the shader fills by the same id');
 assert.match(sh,/texture2D\(uDraw,vec2\(dirUV\(p\)\.x,acos\(clamp\(p\.y,-1\.,1\.\)\)\/PI\)\)/,'the drawing is sampled with the painter chart');
 let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 for(const l of B.LAYOUTS){const n=PN.PANEL_COUNT[l.id];assert.equal(n,l.panels,l.id+' panel count');const seen=new Set(),grp=new Set();
  for(let i=0;i<40000;i++){const z=rnd()*2-1,a=rnd()*Math.PI*2,r=Math.sqrt(1-z*z);const h=PN.panelAt(l.id,[r*Math.cos(a),z,r*Math.sin(a)]);assert.ok(h.id>=0&&h.id<n);seen.add(h.id);grp.add(h.grp);}
  assert.equal(seen.size,n,l.id+': every panel id is reachable');assert.equal(grp.size,l.id==='leather18'?2:l.groups.length,l.id+': colour groups (the leather ball\'s third colour is its laces, not a panel)');}
 // Spot checks against hand-derived ids (the shader's own formulas).
 assert.equal(PN.panelAt('panel8',[.5,.5,.5]).id,7);assert.equal(PN.panelAt('panel8',[-.5,-.5,-.5]).id,0);
 assert.equal(PN.panelAt('leather18',[0,1,0]).id,2*3+1,'top face, middle strip (the laces)');assert.equal(PN.panelAt('panel14',[1,0,0]).id,0);assert.equal(PN.panelAt('panel26',[0,0,-1]).id,5);
 assert.equal(PN.panelAt('propeller6',[1,0,0]).id,0);assert.equal(PN.panelAt('propeller6',[0,-1,0]).id,3);
 console.log('PASS fill-a-panel: JS panelAt() mirrors the shader for all 6 layouts (constants, ids, groups); the GPU cross-check runs in the browser section');}

// 7. Heat & cleanup (static): render on demand, capped pixel ratio, small phone textures, sleeps hidden, disposes everything.
{const st=read('lib/shop/ballStage.ts'),ui=read('components/shop/BallStudio.tsx');
 assert.match(st,/if\(active\(\)\)raf=requestAnimationFrame\(tick\);else/,'the loop only continues while something moves');
 assert.match(st,/function invalidate\(\)\{if\(!raf&&/,'one frame on demand');
 assert.equal((st.match(/requestAnimationFrame\(/g)||[]).length,3,'rAF only in tick, its 30 fps skip and invalidate');
 // touch devices: ≤ 30 fps while spinning or dragging (fix pass Oct 13 2026, heat audit); the skip comes before dt, so inertia is frame-rate independent
 assert.match(st,/const capMs=studioFrameMs\(\);/,'the ball stage reads the touch frame cap');
 assert.match(st,/if\(capMs\)\{const next=frameCapSlot\(now,slot,capMs\);if\(next<0\)\{raf=requestAnimationFrame\(tick\);return;\}slot=next;\}\n  const dt=Math\.min\(\.05,last\?\(now-last\)\/1000:1\/60\);last=now;/,'≤ 30 fps on touch, dt from the last rendered frame');assert.doesNotMatch(st+ui,/setInterval\(/,'no polling');
 assert.match(st,/coarse\?1\.5:2/,'phones ≤ 1.5× pixel ratio');assert.match(st,/PW=coarse\?1024:2048/);assert.match(st,/AS=coarse\?1024:2048/,'phone textures ≤ 1024²');
 assert.match(st,/SphereGeometry\(1,64,48\)/,'phone sphere detail');assert.match(st,/visibilitychange/);assert.match(st,/setTimeout\(\(\)=>\{if\(disposed\)return;drawPatternMask/,'pattern upload debounced');
 assert.match(st,/atlasTimer=window\.setTimeout/,'atlas upload debounced');
 for(const x of ['programs.values())m.dispose()','geo.dispose()','patTex.dispose()','atlasTex.dispose()','shadowTex.dispose()','renderer.dispose()','forceContextLoss()','ro.disconnect()'])assert.ok(st.includes(x),'dispose: '+x);
 assert.match(ui,/import\('@\/lib\/shop\/ballStage'\)/,'three.js loads only when the studio opens');assert.match(ui,/stageRef\.current\?\.dispose\(\)/,'disposed on close');
 assert.match(st,/reducedMotion:reduced/);assert.match(st,/preview\(\)\{if\(reduced\)return;/,'reduced motion: no auto-spin');assert.match(st,/kick\(\)\{[^}]*if\(reduced\)\{opts\.onBounce\?\.\(1\);q\.premultiply/,'reduced motion: no bounce');
 assert.doesNotMatch(ui,/from 'three'/,'the UI never imports three statically');
 // Draw layer: dirty-rect uploads, ≤ ~30/s, no mipmaps, created only with a drawing, disposed; the engine loads lazily.
 assert.match(st,/copyTextureToTexture\(drawTex,drawTex,box,dst\)/,'dirty-rect texSubImage2D upload');assert.match(st,/if\(now-lastDrawUp<30\)\{scheduleDraw\(\);return;\}/,'≤ ~30 uploads a second');
 assert.match(st,/drawTex\.generateMipmaps=false/);assert.match(st,/drawTex\?\.dispose\(\)/,'dispose: draw texture');assert.match(st,/clearTimeout\(drawTimer\)/);
 assert.match(ui,/import\('@\/lib\/shop\/ballPaint'\)/,'paint engine loads lazily');
 assert.ok(!/^import \{[^}]*\} from '@\/lib\/shop\/ballPaint'/m.test(ui)&&!/^import \{[^}]*\} from '@\/lib\/shop\/ballPanels'/m.test(ui),'only type imports of the paint modules');
 const pt=read('lib/shop/ballPaint.ts');assert.doesNotMatch(pt,/requestAnimationFrame|setInterval|setTimeout/,'the painter never schedules work');
 assert.match(ui,/onPointerMove=\{onMove\}/);assert.doesNotMatch(ui,/requestAnimationFrame/,'the studio adds no loop of its own');
 console.log('PASS heat: 0 rAF at rest (on-demand loop), ≤ 1.5× on phones, ≤ 1024² phone textures, debounced uploads, dispose, reduced motion');}

// 8. No real brands or tournaments on shop balls.
{const files=['lib/shop/ball.ts','lib/shop/ballArt.ts','lib/shop/ballShader.ts','lib/shop/ballStage.ts','lib/shop/ballPaint.ts','lib/shop/ballPanels.ts','lib/shop/ballSound.ts','components/shop/BallStudio.tsx'].map(read).join('\n')
  .replace(/\/\*\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');// comments may explain what we avoid
 for(const w of ['adidas','nike','puma','umbro','mitre','select sport','molten','telstar','tango','fevernova','jabulani','brazuca','al rihla','trionda','teamgeist','world cup','worldcup','fifa','uefa','euro 20','olympic','premier league','champions league','copa'])
  assert.ok(!files.toLowerCase().includes(w),'no "'+w+'" in the shop ball');
 console.log('PASS originality: no maker or tournament names in the shop ball code');}

// 9. Wiring: contract props, default export, lab route.
{const ui=read('components/shop/BallStudio.tsx');assert.match(ui,/export default function BallStudio\(\{onClose,onBuy\}:Props\)/);assert.match(ui,/type Props=\{onClose\(\):void;onBuy\?\(design:BallDesign\):void\}/);
 assert.ok(fs.existsSync(path.join(root,'app/shop-lab/ball/page.tsx')));
 for(const id of B.STICKER_IDS)assert.ok(read('lib/shop/ballArt.ts').includes(`${id}(g)`),'sticker drawn: '+id);
 const art=read('lib/shop/ballArt.ts');for(const f of B.FLAGS)assert.ok(new RegExp(`(^|\\s|')${f.code.replace('-','\\-')}'?[:(]`,'m').test(art),'flag drawn: '+f.code);
 console.log('PASS wiring: BallStudio({onClose,onBuy}), /shop-lab/ball, every sticker and flag is drawn');}

// 10. Browser (optional, BALL_LAB_URL): 0 rAF at rest and after drawing, the GPU's panel ids = panelAt(), dispose on close.
if(process.env.BALL_LAB_URL){(async()=>{const {chromium}=require('playwright');const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{const pg=await b.newPage({viewport:{width:1440,height:900}});await pg.goto(process.env.BALL_LAB_URL);await pg.waitForFunction(()=>!!window.__fiBallStage,null,{timeout:60000});
  // Software GL is slow, so the opening spin can take longer in wall time: wait (≤ 20 s) for a quiet 1.5 s window; it must come.
  const rest=async()=>{let d=-1;for(let i=0;i<13&&d!==0;i++){const a=await pg.evaluate(()=>window.__fiBallStage.stats.rafs);await pg.waitForTimeout(1500);d=(await pg.evaluate(()=>window.__fiBallStage.stats.rafs))-a;}return d;};
  assert.equal(await rest(),0,'0 rAF at rest after opening');
  await pg.click('[data-step-id="draw"]');await pg.waitForTimeout(400);const box=await pg.locator('canvas').first().boundingBox();const cx=box.x+box.width/2,cy=box.y+box.height/2;
  await pg.mouse.move(cx-60,cy);await pg.mouse.down();for(let i=0;i<20;i++)await pg.mouse.move(cx-60+i*6,cy+Math.sin(i/3)*20);await pg.mouse.up();
  const st=await pg.evaluate(()=>window.__fiBallStage.stats);assert.ok(st.drawUploads>0,'the stroke uploaded');
  assert.equal(await rest(),0,'0 rAF at rest after drawing');
  for(const l of B.LAYOUTS){await pg.evaluate(id=>{const s=window.__fiBallStage;s.setDesign({...JSON.parse(JSON.stringify(s.__d??{})),layout:id,colors:{a:'#111111',b:'#eeeeee',c:'#888888'},pattern:{kind:'none',c1:'#000000',c2:'#000000',on:'all',seed:1},finish:'matte',decals:[],size:4,futsal:false,art:{id:'',fills:[]},v:1});},l.id);
   await pg.waitForTimeout(150);const pts=[];for(let i=-4;i<=4;i++)for(let j=-4;j<=4;j++)pts.push([cx+i*box.height*.06,cy+j*box.height*.06]);
   const res=await pg.evaluate(p=>{const s=window.__fiBallStage;return p.map(([x,y])=>({gpu:s.debugPanelIds([[x,y]])[0],dir:s.pick(x,y)}));},pts);
   let ok=0,n=0;for(const r of res){if(!r.gpu||!r.dir)continue;n++;if(PN.panelAt(l.id,r.dir).id===r.gpu.id)ok++;}
   assert.ok(n>40&&ok/n>=.95,`${l.id}: GPU panel ids match panelAt (${ok}/${n}; seam pixels may differ)`);}
  await pg.click('button[aria-label="Back"]');await pg.waitForTimeout(400);assert.equal(await pg.evaluate(()=>!!window.__fiBallStage),false,'disposed on close');
  console.log('PASS browser: 0 rAF at rest (open, after drawing), dirty-rect uploads, GPU panel ids = panelAt for every layout, dispose on close');}
 finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});}
