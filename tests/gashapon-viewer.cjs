// Gashapon round 3A (Nov 8 2026, docs/gashapon-design.md "Round 3A"): the toy builder kit + registry (all 84 open, the 12 Island
// Square Konbini toys have their own models, the rest the generic figure), clean disposal, draw-call / triangle budgets, every
// reaction and voice reference resolving to the toy's own parts / presets, the viewer leaving no rAF, listener or audio node
// behind, the Toy Shelf counts, the 1.2× machine scale (footprint unchanged), the wiring (island, arcade, backpack, panel) and the
// gs:* analytics (allow-listed, shaped for the SQL regex, throttled, silent while the tracker is off).
// usage: node tests/gashapon-viewer.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
(async()=>{
const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
const cache=new Map(),storage=new Map();
const localStorage={getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,String(v)),removeItem:k=>storage.delete(k)};
// A small fake DOM: counted listeners and animation frames, so the viewer's cleanup can be checked.
const listeners=new Map(),frames=new Map();let frameId=0;
const on=(t,f)=>{listeners.set(t,(listeners.get(t)??0)+1);},off=(t,f)=>{listeners.set(t,(listeners.get(t)??0)-1);};
const document={hidden:false,addEventListener:on,removeEventListener:off,createElement:()=>({width:0,height:0,getContext:()=>null})};
const window={addEventListener:on,removeEventListener:off,dispatchEvent(){},matchMedia:()=>({matches:false}),devicePixelRatio:2,innerWidth:390,innerHeight:844};
let observers=0;class ResizeObserver{constructor(){observers++;}observe(){}disconnect(){observers--;}}
const context=vm.createContext({console,Math,Set,Map,WeakMap,Date,JSON,Promise,queueMicrotask,performance,structuredClone,Float32Array,Uint8Array,Uint16Array,Uint32Array,Int32Array,Array,Object,Number,String,Error,Symbol,Boolean,RegExp,
 window,document,ResizeObserver,localStorage,navigator:{},CustomEvent:class{constructor(t,o){this.type=t;this.detail=o&&o.detail;}},
 requestAnimationFrame:f=>{const id=++frameId;frames.set(id,f);return id;},cancelAnimationFrame:id=>{frames.delete(id);}});
function load(name){
 let file=path.isAbsolute(name)?name:path.resolve(base,name);if(!fs.existsSync(file)||fs.statSync(file).isDirectory())for(const ext of ['.ts','.tsx','.js','/index.ts'])if(fs.existsSync(file+ext)){file+=ext;break;}
 if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);
 const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,allowJs:true}}).outputText;
 const r=id=>id==='react'?{useSyncExternalStore:(_s,get)=>get(),useEffect(){},useState(){},useRef(){},createContext(){}}:id==='three'?T:id.includes('BufferGeometryUtils')?utils:id.startsWith('@/')?load(id.slice(2)):
  id.endsWith('.json')?JSON.parse(fs.readFileSync(path.resolve(path.dirname(file),id),'utf8')):id.startsWith('.')?load(path.resolve(path.dirname(file),id)):req(id);
 vm.runInContext('(function(exports,module,require){'+code+'\n})',context)(mod.exports,mod,r);cache.set(file,mod.exports);return mod.exports;}
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
let failed=0;const ok=async(name,fn)=>{try{await fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};

const TOYS=load('lib/gashapon/toys.ts'),REG=load('lib/gashapon/toyModels/index.ts'),RX=load('lib/gashapon/toyReactions.ts'),SND=load('lib/gashapon/toySound.ts');
// Machines whose toys have their own models (first12 keeps its old name; it now holds every own-model toy).
const OWN=new Set(['gs-square-snacks','gs-square-lucky']);
OWN.add('gs-cay-sweets');OWN.add('gs-cay-bento');OWN.add('gs-arcade-heroes');// Nov 8 2026: Coral Cay sweets + bento, Cabinet Heroes
OWN.add('gs-eleven');OWN.add('gs-oldtown');OWN.add('gs-jetty');// Nov 8 2026: Boots & Kits, Trophies & Legends, Rides & Rollers
OWN.add('gs-arcade-pixel');OWN.add('gs-westbeach');OWN.add('gs-northbeach');// Nov 8 2026: Pixel Pitch, Beach Day, Shell Seekers
OWN.add('gs-cayplaza');OWN.add('gs-sharks');OWN.add('gs-summit');// Nov 8 2026: Bug Squad, Reef Friends, Summit Orchard (all 84 now have their own model)
const all=TOYS.GASHAPON_TOYS,first12=all.filter(t=>OWN.has(t.machine));
const DRAW_MAX=40,TRI_MAX=9000;
// Round 3B (Nov 9 2026): HD toys (lib/gashapon/toyModels/index.ts HD_MACHINES) get the island's freed budget while the viewer is open.
const HD_DRAW_MAX=120,HD_TRI_MAX=60000,HD_MAT_MAX=10;
const rows=[];

await ok('registry: every one of the 84 toys builds (own model or the generic figure); the 12 Island Square Konbini toys have their own',()=>{
 assert.equal(all.length,84);assert.equal(first12.length,OWN.size*6);
 for(const t of all){const own=REG.toyBuilder(t);assert.equal(own.generic,!first12.includes(t),t.id+(own.generic?' is generic':' has its own builder'));
  const rig=REG.buildToy(t.id);assert(rig&&rig.meshes.length>0,t.id+' builds');assert(rig.height>.5&&rig.height<1.6,`${t.id}: about 1 tall (${rig.height.toFixed(2)})`);rig.dispose();}
 assert.deepEqual([...REG.builtToyIds()].sort(),first12.map(t=>t.id).sort(),'builders exist for exactly the 12');
 assert.equal(REG.buildToy('no-such-toy'),null);
});

await ok(`budgets: round 3A ≤ ${DRAW_MAX} draws / ${TRI_MAX} tris, ≤ 2 materials, no shadows; HD ≤ ${HD_DRAW_MAX} draws / ${HD_TRI_MAX} tris, ≤ ${HD_MAT_MAX} physical materials; no lights in a rig`,()=>{
 for(const t of all){const rig=REG.buildToy(t.id);const {draws,triangles}=rig.stats;const hd=REG.HD_MACHINES.has(t.machine);assert.equal(rig.hd,hd,t.id+' hd flag');
  assert(draws<=(hd?HD_DRAW_MAX:DRAW_MAX),`${t.id}: ${draws} draws`);assert(triangles<=(hd?HD_TRI_MAX:TRI_MAX),`${t.id}: ${triangles} triangles`);assert(rig.materials.length<=(hd?HD_MAT_MAX:2),t.id+' materials');
  if(hd)assert(rig.materials.every(m=>m.isMeshPhysicalMaterial),t.id+': physical materials');
  let lights=0,shadows=0;rig.root.traverse(o=>{if(o.isLight)lights++;if(o.castShadow||o.receiveShadow)shadows++;});assert.equal(lights,0,t.id+' no lights');if(!hd)assert.equal(shadows,0,t.id+' no shadows (round 3A)');
  if(first12.includes(t)||t.id==='taiyaki-tai')rows.push(`${t.id} ${draws}d/${Math.round(triangles)}t`);rig.dispose();}
 console.log('     '+rows.join(' · '));
});

await ok('dispose: every geometry, material and the toon ramp of every toy is freed; dispose twice is safe',()=>{
 for(const t of all){const rig=REG.buildToy(t.id),seen=new Set(),gone=new Set();
  const watch=x=>{seen.add(x);x.addEventListener('dispose',()=>gone.add(x));};
  for(const m of rig.meshes){watch(m.geometry);}for(const m of rig.materials){watch(m);if(m.gradientMap)watch(m.gradientMap);if(m.normalMap)watch(m.normalMap);}
  for(const m of rig.proxies){watch(m.geometry);watch(m.material);}
  if(!rig.hd)assert(rig.materials.some(m=>m.gradientMap),t.id+': a toon ramp');rig.dispose();rig.dispose();
  for(const x of seen)assert(gone.has(x),`${t.id}: ${x.type||x.name} disposed`);assert.equal(rig.root.parent,null);}
});

await ok('reactions + voices: every squeeze / poke / tap reference resolves to the toy’s own parts; the head exists; voices are presets',()=>{
 for(const t of all){const rig=REG.buildToy(t.id),names=new Set(rig.parts.keys()),b=rig.behaviour;
  const refs=[...RX.asList(b.squeeze),...RX.asList(b.tap)];const poke=b.poke;
  if(typeof poke==='object'&&!Array.isArray(poke)){for(const [k,v] of Object.entries(poke)){assert(k==='default'||names.has(k),`${t.id}: poke key ${k} is a part`);refs.push(...RX.asList(v));}}else refs.push(...RX.asList(poke));
  for(const r of refs)assert(RX.resolveReaction(r,names),`${t.id}: reaction "${r}" resolves (parts: ${[...names].join(',')})`);
  if(typeof b.head==='string')assert(names.has(b.head),t.id+': head part '+b.head);
  for(const k of ['squeeze','poke','tap']){assert(b.voice[k].length>0,t.id+' voice '+k);for(const v of b.voice[k])assert(SND.parseVoice(v),`${t.id}: voice "${v}"`);}
  rig.dispose();}
 assert.equal(RX.resolveReaction('nope',['body']),null);assert.equal(RX.resolveReaction('wiggle:tail',['body']),null);assert(RX.resolveReaction('hop',[]));
 // The generic figure reads the toy's own words.
 const G=load('lib/gashapon/toyModels/generic.ts');assert.deepEqual([...G.reactionsFromText('squishes flat, then puffs back round',['x'])],['squash','puff']);
 assert.deepEqual([...G.reactionsFromText('rings like a little bell',['hop'])],['hop']);
 const v=SND.voicesFromText('a tiny bell "ting" and a purr rumble');assert.equal(v.squeeze[1],'bell');assert.equal(v.poke[0],'purr');
});

await ok('animator: reactions end, parts return exactly to rest; the squeeze hold squashes about the feet',()=>{
 const rig=REG.buildToy('maneki-mika'),A=RX.createToyAnimator(rig.root,rig.parts,{reduced:false});
 const arm=rig.parts.get('armR'),rest=arm.rotation.z;assert.equal(A.play(['wave:armR','hop','sparkle','nope'],0),3);
 A.update(.5,0,0);assert.notEqual(arm.rotation.z,rest,'the arm waves');assert(rig.root.position.y>0,'the hop lifts');
 assert.equal(A.update(5,0,0),false,'all done');assert.equal(arm.rotation.z,rest);assert.equal(rig.root.position.y,0);
 A.update(6,1,0);assert(rig.root.scale.y<.8&&rig.root.scale.x>1.1,'squashed');A.update(7,0,0);assert.equal(rig.root.scale.y,1);
 const R=RX.createToyAnimator(rig.root,rig.parts,{reduced:true});R.play(['hop'],0);R.update(.4,0,0);assert(rig.root.position.y<.1,'reduced motion: a small hop');rig.dispose();
});

// A fake AudioContext that counts live nodes.
function fakeAudio(){let live=0,made=0;const node=()=>({connect(){},disconnect(){},gain:{value:1,setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},frequency:{value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}},Q:{value:1}});
 const src=()=>{made++;live++;const n={...node(),type:'',buffer:null,onended:null,started:false,start(){this.started=true;},stop(when){if(when===undefined&&!this.stopped){this.stopped=true;live--;}}};/* a scheduled stop(t) keeps it live until dispose stops it now */return n;};
 return {get live(){return live;},get made(){return made;},c:{state:'running',currentTime:0,sampleRate:8000,destination:node(),createGain:node,createBiquadFilter:node,createOscillator:src,createBufferSource:src,
  createBuffer:(_c,n)=>({getChannelData:()=>new Float32Array(n),sampleRate:8000})}};}

await ok('voice: throttled, capped at 4, silent when muted, dispose stops every source',()=>{
 const A=fakeAudio();let t=0;const v=SND.createToyVoice({context:()=>A.c,now:()=>t});
 assert(v.say('poke',['bloop']));assert(!v.say('poke',['bloop']),'throttled');t+=100;assert(v.say('poke',['bell']));t+=100;assert(v.say('tap',['chime']));t+=100;assert(v.say('squeeze',['boing']));t+=100;
 assert(!v.say('hold',['squeak']),'polyphony cap');assert(A.live>0);v.dispose();assert.equal(A.live,0,'every source stopped');assert.equal(v.active(),0);assert(!v.say('tap',['bell']),'disposed');
 const muted=SND.createToyVoice({context:()=>null});assert(!muted.say('tap',['bell']),'muted: no sound');
});

await ok('viewer: show, happy, tap the toy, hold-squeeze, drag + zoom; dispose leaves no rAF, listeners, observers or audio nodes',()=>{
 const V=load('lib/gashapon/toyViewer.ts'),A=fakeAudio();let renders=0,disposedR=0,lost=0;
 const renderer={setPixelRatio(){},setSize(){},setClearColor(){},render(){renders++;},dispose(){disposedR++;},forceContextLoss(){lost++;}};
 const canvas={clientWidth:390,clientHeight:844,getBoundingClientRect:()=>({left:0,top:0,width:390,height:844})};
 const before=new Map(listeners);const v=V.createToyViewer(canvas,{renderer,voice:SND.createToyVoice({context:()=>A.c,now:()=>performance.now()})});
 assert(v.show('onigiri-ollie'));v.happy();
 const run=n=>{for(let i=0;i<n;i++){const [[id,f]=[]]=[...frames];if(!id)return i;frames.delete(id);f(performance.now()+i*16);}return n;};
 run(5);assert(renders>0,'renders on demand');
 // Find a screen point on the toy (the middle of the screen, a little above centre).
 let hit=null;for(let y=200;y<700&&!hit;y+=20)if(v.hit(195,y))hit=y;assert(hit,'the toy is under the middle of the screen');
 const t=v.tap(195,hit);assert(t&&t.refs.length>0,'tap plays a reaction');run(3);
 v.holdStart();run(10);assert(v.stats().deform>.1||v.rig().root.scale.y<1,'held: squashed');v.holdEnd();
 v.grab();v.drag(40,4);v.release(800,0);v.zoom(1.3);run(20);
 const s=v.stats();assert(s.draws<=DRAW_MAX&&s.triangles>0&&!s.generic);
 assert(!v.show('nope'),'an unknown toy does not show');{const gen=all.find(t=>!OWN.has(t.machine));if(gen){assert(v.show(gen.id),'a generic toy shows');assert(v.stats().generic);}}
 v.dispose();v.dispose();
 assert.equal(frames.size,0,'no animation frame pending');assert.equal(observers,0,'resize observer disconnected');
 for(const [k,n] of listeners)assert.equal(n,before.get(k)??0,'listener balance: '+k);
 assert.equal(A.live,0,'no audio node left sounding');assert(A.made>0,'it did make sounds');assert.equal(disposedR,1);assert.equal(lost,1,'the WebGL context is released');
});

await ok('the toy viewer sleeps: no frames after the idle life winds down; reduced motion has no idle loop',()=>{
 const V=load('lib/gashapon/toyViewer.ts');const renderer={setPixelRatio(){},setSize(){},setClearColor(){},render(){},dispose(){}};
 const canvas={clientWidth:800,clientHeight:600,getBoundingClientRect:()=>({left:0,top:0,width:800,height:600})};
 const v=V.createToyViewer(canvas,{renderer,reducedMotion:true,voice:{say:()=>false,unlock(){},active:()=>0,dispose(){}}});v.show('daruma-dash');
 let n=0;while(frames.size&&n<400){const [[id,f]]=[...frames];frames.delete(id);f(performance.now()+n*16);n++;}
 assert(n<400,'the loop stopped by itself ('+n+' frames)');assert.equal(v.stats().running,false);v.dispose();
});

await ok('QA Nov 8: centred on the turntable at any yaw, same reaction never stacks, context loss / restore, no voice when hidden or locked',()=>{
 const V=load('lib/gashapon/toyViewer.ts');const renderer={setPixelRatio(){},setSize(){},setClearColor(){},render(){},dispose(){}};
 const cl=new Map();const canvas={clientWidth:390,clientHeight:844,getBoundingClientRect:()=>({left:0,top:0,width:390,height:844}),
  addEventListener:(t,f)=>cl.set(t,f),removeEventListener:(t,f)=>{if(cl.get(t)===f)cl.delete(t);}};
 const v=V.createToyViewer(canvas,{renderer,voice:{say:()=>false,unlock(){},active:()=>0,dispose(){}}});
 const step=()=>{for(const [id,f] of [...frames]){frames.delete(id);f(performance.now());}};
 for(const id of ['whale-wendell','flip-flop-flo','scooter-skip','surfboard-sid']){v.grab();v.drag(97,0);v.release(0,0);step();const was=v.rig();if(was)was.root.parent.updateMatrixWorld(true);/* a real render updates the table's world matrix */assert(v.show(id));const root=v.rig().root,tt=root.parent,spun=tt.rotation.y;
  tt.rotation.y=0;tt.updateMatrixWorld(true);const c=new T.Box3().setFromObject(root).getCenter(new T.Vector3());tt.rotation.y=spun;
  assert(Math.abs(c.x)<1e-6&&Math.abs(c.z)<1e-6,`${id}: spins about its own centre at yaw ${spun.toFixed(2)} (off by ${c.x.toFixed(3)}, ${c.z.toFixed(3)})`);}
 // Context loss stops the loop; restore draws again; dispose removes both listeners.
 assert(cl.has('webglcontextlost')&&cl.has('webglcontextrestored'));v.tap(195,420);cl.get('webglcontextlost')();assert.equal(v.stats().running,false,'asleep while lost');
 v.grab();v.drag(10,0);v.release(0,0);assert.equal(v.stats().running,false,'no frames on a lost context');cl.get('webglcontextrestored')();assert(v.stats().running,'draws again on restore');
 v.dispose();assert.equal(cl.size,0,'context listeners removed');for(const [id,f] of [...frames])frames.delete(id);
 // Rapid taps: the same reaction (same parts) does not stack on itself; it can start again once done.
 const rig=REG.buildToy('daruma-dash'),A=RX.createToyAnimator(rig.root,rig.parts,{reduced:false});
 assert.equal(A.play(['hop'],0),1);assert.equal(A.play(['hop'],.1),0,'no second hop mid-hop');assert.equal(A.play(['hop','wobble'],.2),1,'a different reaction still layers');
 let top=0;for(let t=0;t<.62;t+=.01){A.update(t,0,0);top=Math.max(top,rig.root.position.y);}assert(top<.34,'one hop high, not stacked ('+top.toFixed(2)+')');
 assert.equal(A.play(['hop'],1),1,'hop again after it ended');A.update(9,0,0);assert.equal(rig.root.position.y,0);rig.dispose();
 // Voices: silent while the tab is hidden; the non-gesture "open" hello never queues on a locked (suspended) context.
 const F=fakeAudio();let t=0;const voice=SND.createToyVoice({context:()=>F.c,now:()=>t});document.hidden=true;assert(!voice.say('tap',['bell']),'hidden: silent');document.hidden=false;
 F.c.state='suspended';assert(!voice.say('open',['bell']),'locked: no queued hello');F.c.state='running';t+=200;assert(voice.say('open',['bell']));voice.dispose();
 {// Puck Pal: white eye backs (ink on navy vanished); Monarch Mara: orange wing undersides (a black butterfly from behind).
  const pp=REG.buildToy('puck-pal'),eye=pp.meshes.find(m=>m.userData.part==='eyeL'),col=eye.geometry.getAttribute('color');let white=0;for(let i=0;i<col.count;i++)if(col.getX(i)>.99&&col.getY(i)>.99&&col.getZ(i)>.99)white++;
  assert(white>col.count*.3,'puck-pal: white behind the eyes');pp.dispose();
  const mm=REG.buildToy('monarch-mara'),w=mm.meshes.find(m=>m.userData.part==='wingL');w.updateMatrixWorld(true);const pos=w.geometry.getAttribute('position'),wc=w.geometry.getAttribute('color'),v=new T.Vector3();let back=0;
  for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(w.matrixWorld);if(v.z<-.036&&wc.getX(i)>.8&&wc.getZ(i)<.4)back++;}assert(back>20,'monarch-mara: orange on the back of the wings (batch 4: the back layer sits at z −.04)');mm.dispose();}
 for(const t of all){const rig=REG.buildToy(t.id);const b=new T.Box3().setFromObject(rig.root);assert(b.min.y>(t.id==='manta-maya'?-.03:-.1),`${t.id}: nothing hangs through the floor (min y ${b.min.y.toFixed(3)}; bases may sink a little)`);rig.dispose();}
 assert(/addEventListener\('blur',blur\)/.test(read('components/GashaponToyViewer.tsx')),'a keyboard squeeze lets go when the window loses focus');
});

await ok('Toy Shelf: N / 84 and n / 6 per machine; only found toys open the viewer',()=>{
 const c0=TOYS.shelfCounts({});assert.equal(c0.found,0);assert.equal(c0.total,84);assert.equal(Object.keys(c0.per).length,14);
 const c=TOYS.shelfCounts({'onigiri-ollie':{n:2},'torii-tomo':{n:1},'mango-max':{n:1}});assert.equal(c.found,3);assert.equal(c.per['gs-square-snacks'],1);assert.equal(c.per['gs-summit'],1);
 const shelf=read('components/GashaponToyShelf.tsx');assert(/openToyViewer\(t\.id,'shelf'\)/.test(shelf)&&/data-shelf-missing/.test(shelf),'found → viewer, missing → silhouette');
 assert(!/<canvas|WebGL|from 'three'|toyViewer/.test(shelf.replace(/\/\*[\s\S]*?\*\//g,'')),'no WebGL per tile');
 const viewer=read('components/GashaponToyViewer.tsx');assert(/owned>0/.test(viewer)&&/if\(!viewable\)closeNow\.current\(\)/.test(viewer),'unfound toys are not viewable');
});

await ok('wiring: island + arcade mount the layer, the arcade covers its scene, the island sleeps, backpack + panel open the shelf',()=>{
 assert(/<GashaponToyLayer\/>/.test(read('components/GashaponHud.tsx'))&&/<GashaponToyLayer\/>/.test(read('components/ArcadeRoom.tsx')));
 assert(/setCovered\(list\|\|hall\|\|(?:today\|\|)?toyCovering\)/.test(read('components/ArcadeRoom.tsx')));
 const viewer=read('components/GashaponToyViewer.tsx');assert(/holdIslandCover\(\)/.test(viewer)&&/typeof navigator\.vibrate==='function'/.test(viewer)&&/prefers-reduced-motion/.test(viewer));
 const P=load('lib/videoPlayback.ts');const seen=[];const un=P.subscribeVideoPlayback(x=>seen.push(x));const r=P.holdIslandCover();assert(P.isVideoPlaying()&&!P.isFilmPlaying(),'a cover sleeps the island but is not a film');r();assert(!P.isVideoPlaying());un();assert.deepEqual(seen,[false,true,false]);
 assert(/setVideoPlaying\(playing&&isFilmPlaying\(\)\)/.test(read('components/Town.tsx')),"a cover is not counted as 'films' time");
 {// Nov 9 2026 (owner: "the gashapon toys should live in the backpack"): a Toys section shows the shelf's own grid inline.
  const bp=read('components/Backpack.tsx'),shelf=read('components/GashaponToyShelf.tsx');
  assert(/g\.kind==='toy'\?<div className=\{styles\.toys\} data-backpack-toys><ToyShelfGrid heading="h5"/.test(bp)&&/<ToyCount\/>/.test(bp)&&!/ToyShelfButton/.test(bp),'backpack: Toys section with the inline grid and N / 84');
  assert(/\{active&&<GashaponToyLayer nested\/>/.test(bp)&&/createPortal\(viewer,host\)/.test(read('components/GashaponToyLayer.tsx'))&&/\{!claimed&&viewer\}/.test(read('components/GashaponToyLayer.tsx')),'the viewer opens inside Make it yours (its modal dialog), one viewer at a time');
  assert(/export function ToyShelfGrid\(/.test(shelf)&&/<ToyShelfGrid\/>/.test(shelf),'one grid, shared by the shelf and the backpack');
  const BP=load('lib/town/backpack.ts'),g=BP.buildBackpack({owned:[],history:[],cards:[],packs:[],starter:null,toys:{'onigiri-ollie':{n:2,first:5},'nope':{n:1,first:1}}}),toys=g.find(x=>x.kind==='toy');
  assert(toys&&toys.label==='Toys'&&toys.items.length===1&&toys.items[0].id==='toy:onigiri-ollie'&&/×2/.test(toys.items[0].detail),'the model collects found toys (unknown ids dropped)');
  assert(/toys:readGashapon\(\)\.owned/.test(read('lib/town/backpackStore.ts'))&&/useGashapon\(\)\.owned/.test(read('lib/town/backpackStore.ts')),'live from the gashapon store');}
 const panel=read('components/useGashaponSpin.ts');assert(/if\(toyOverlay\.covering\(\)\)return;/.test(panel),'the panel leaves the keys to the viewer / shelf');
 const src=read('lib/gashapon/toyViewer.ts');assert(!/setInterval/.test(src),'no intervals');
 // Round 3B: the round 3A rig (2 lights) + the HD studio (4 lights), exactly ONE shadow-casting light with a small map, a frame cap.
 assert(((src.match(/new T\.(Hemisphere|Directional|Point|Spot|Ambient)Light/g))||[]).length<=6,'at most six lights (2 legacy + 4 studio)');
 assert.equal((src.match(/castShadow=true/g)||[]).length,1,'one shadow-casting light');assert(/mapSize\.set\(opts\.coarse\?512:1024/.test(src),'shadow map ≤ 1024² (512² on phones)');
 assert(/frameCapSlot\(now,slot,interval\)/.test(src)&&/cap30Everywhere/.test(src)&&/1000\/60/.test(src),'60 fps cap, 30 on slow tiers / reduced motion / low-end');
 for(const f of ['components/GashaponToyViewer.module.css','components/GashaponToyShelf.module.css','components/GashaponPanel.module.css'])assert(!/IslandBrush/.test(read(f).replace(/\/\*[\s\S]*?\*\//g,'')),f+': no IslandBrush');
 const B=load('lib/gashapon/gashaponBrowser.ts');B.openToyShelf();assert(B.toyOverlay.covering());B.openToyViewer('onigiri-ollie','shelf');assert.equal(B.toyOverlay.get().source,'shelf');B.toyOverlay.closeViewer();assert(B.toyOverlay.get().shelf);B.toyOverlay.closeShelf();assert(!B.toyOverlay.covering());
});

await ok('machines 1.2×: taller globe and cap, the cabinet within its unchanged collider, a pair never overlaps',()=>{
 const G=load('lib/graphics/gashaponMesh.ts'),M=load('lib/gashapon/machines.ts');
 assert(Math.abs(G.GASHA_MESH.capTop-1.42*1.2)<1e-9&&Math.abs(G.GASHA_MESH.globeR-.36)<1e-9);
 const m=M.GASHAPON_MACHINES[0],f=G.gashaponFootprint(m);assert.equal(f.w,.86);assert.equal(f.d,.66);
 const b=G.gashaponBases(),p=G.gashaponPieces(m,0,b);const body=p[0].geometry;body.computeBoundingBox();const bb=body.boundingBox;
 assert(bb.max.x-bb.min.x<=f.w+1e-6&&bb.max.z-bb.min.z<=f.d+1e-6,'cabinet inside the collider');
 assert(bb.max.x-bb.min.x<M.GASHA_SIZE.w+M.GASHA_GAP,'a gap stays between a pair');p.forEach(x=>x.geometry.dispose());G.disposeBases(b);
});

await ok('analytics: gs:* ids allow-listed and SQL-shaped; spins counted once; interactions capped at 3 per kind per open; silent while off',()=>{
 const CID=load('lib/analytics/countIds.ts');
 for(const id of CID.GASHAPON_COUNT_IDS){assert(CID.COUNT_KEY_RE.test(id),'shape '+id);assert(CID.isCountId(id),'allow-listed '+id);}
 assert.equal(CID.GASHAPON_COUNT_IDS.length,new Set(CID.GASHAPON_COUNT_IDS).size,'no duplicate ids');
 // With a stand-in tracker: exactly which ids each call sends.
 const trackerFile=path.resolve(base,'lib/analytics/tracker.ts'),eventsFile=path.resolve(base,'lib/analytics/gashaponEvents.ts'),real=cache.get(trackerFile);
 const sent=[];cache.set(trackerFile,{count:(id,n=1)=>{assert(CID.isCountId(id),'sent an unknown id '+id);sent.push(n===1?id:id+'+'+n);}});cache.delete(eventsFile);const E=load(eventsFile);
 E.countGashaponSpin({machine:'gs-square-snacks',toy:'golden-onigiri',rarity:'rare',isNew:true,refund:0,coins:20});
 assert.deepEqual(sent.splice(0),['gs:spin','gs:spin_gs_square_snacks','gs:t_golden_onigiri','gs:r_rare','gs:new','gs:coins+20']);
 E.countGashaponSpin({machine:'gs-summit',toy:'mango-max',rarity:'common',isNew:false,refund:5,coins:20});assert(sent.splice(0).includes('gs:refund+5'));
 E.countToyViewed('ema-emi','shelf');assert.deepEqual(sent.splice(0),['gs:view_shelf','gs:v_ema_emi']);
 const i=E.createInteractCounter('ema-emi');for(let k=0;k<10;k++){i('poke');i('squeeze');}i('tap');
 assert.deepEqual(sent.splice(0).sort(),['gs:i_ema_emi','gs:poke','gs:poke','gs:poke','gs:squeeze','gs:squeeze','gs:squeeze','gs:tap'].sort());
 E.countShelfOpen(0);E.countShelfOpen(84);E.countShelfOpen(12);assert.deepEqual(sent.splice(0),['gs:shelf','gs:found_0','gs:shelf','gs:found_all','gs:shelf','gs:found_6_20']);
 cache.delete(eventsFile);if(real)cache.set(trackerFile,real);else cache.delete(trackerFile);
 // The real tracker drops counts while it is not running (tests, dev, DNT/GPC, bots…).
 const TR=load('lib/analytics/tracker.ts');TR.count('gs:spin');assert.equal(TR.takeCounts(4000),null,'nothing queued while the tracker is off');
 assert(/count\(/.test(read('lib/analytics/gashaponEvents.ts'))&&!/fetch\(|sendBeacon|localStorage/.test(read('lib/analytics/gashaponEvents.ts')),'only tracker counts');
});

// ---- Round 3B (Nov 9 2026): the squeeze always lets go, toy kinds, the HD pilot, no leaks over 50 shows.
const GE=load('lib/gashapon/toyGestures.ts'),KD=load('lib/gashapon/toyKinds.ts'),VW=load('lib/gashapon/toyViewer.ts');
/** A viewer on a fake renderer with a fake clock: frames and gesture timers run on simulated time. */
function sim(o={}){const events=[];let clock=performance.now();const timers=[];
 const renderer={setPixelRatio(){},setSize(){},setClearColor(){},render(){},dispose(){}};
 const canvas={clientWidth:390,clientHeight:844,getBoundingClientRect:()=>({left:0,top:0,width:390,height:844})};
 const v=VW.createToyViewer(canvas,{renderer,voice:{say:()=>false,unlock(){},active:()=>0,dispose(){}},onEvent:(e,d)=>events.push(d?e+':'+d:e),...o});
 const g=GE.createToyGestures(()=>v,{now:()=>clock,setTimer:(f,ms)=>{const t={at:clock+ms,f};timers.push(t);return t;},clearTimer:t=>{const i=timers.indexOf(t);if(i>=0)timers.splice(i,1);}});
 const advance=ms=>{const end=clock+ms;while(clock<end){clock=Math.min(end,clock+16.7);for(const t of [...timers])if(t.at<=clock){timers.splice(timers.indexOf(t),1);t.f();}
  for(const [id,f] of [...frames]){frames.delete(id);f(clock);}}};
 return {v,g,advance,events,dispose(){v.dispose();for(const [id] of [...frames])frames.delete(id);}};}
/** A screen point on the toy that squeezes on a still hold: not a grab target (pieces / key / capsule drag instead), or, given the sim
 *  `S`, a working part whose still press-and-hold turns into a squeeze (Nov 9: Dorayaki Doug is nearly all lid). */
function squeezePoint(v,S){const c=v.screenOf('body')??{x:195,y:420},pts=[],mech=[];for(let y=240;y<720;y+=12)for(let x=120;x<=270;x+=15)pts.push([x,y]);pts.sort((a,b)=>Math.hypot(a[0]-c.x,a[1]-c.y)-Math.hypot(b[0]-c.x,b[1]-c.y));
 for(const [x,y] of pts){if(!v.hit(x,y))continue;const g=v.pointerDown(x,y);if(g){v.pointerCancel();if(g==='mech')mech.push([x,y]);continue;}return [x,y];}
 if(S)for(const [x,y] of mech){S.g.down(9,x,y);S.advance(350);const a=S.g.active(),ok=a.holding&&a.grab===null&&v.stats().pressure>.3;S.g.up(9,x,y);S.advance(700);if(ok)return [x,y];}
 return null;}

await ok('squeeze release (owner Nov 9 "letting go it still squeezes"): every toy springs back within 600 ms on up, up outside, cancel, a second finger, blur, hidden tab',()=>{
 const S=sim(),{v,g,advance}=S;let checked=0;const rows=[];
 for(const t of all){assert(v.show(t.id),t.id);advance(400);
  if(v.kind()?.kind==='capsule'){v.action('open');advance(1500);}
  for(const how of ['up','outside','cancel','second','blur','hidden']){
   const pt=squeezePoint(v,S);assert(pt,t.id+': a squeezable point on the toy');const [x,y]=pt;
   g.down(1,x,y);advance(420);const st=v.stats(),winds=v.kind()?.kind==='windup';
   if(!winds)assert(st.pressure>.5,`${t.id}/${how}: squeezing while held (pressure ${st.pressure.toFixed(2)})`);
   if(how==='up')g.up(1,x,y);else if(how==='outside')g.up(1,-60,-60);else if(how==='cancel')g.up(1,x,y,true);
   else if(how==='second'){g.down(2,x+60,y+20);advance(50);g.up(2,x+60,y+20);g.up(1,x,y);}else if(how==='blur')g.cancelAll();else{v.setPaused(true);g.cancelAll();v.setPaused(false);}// hidden tab: the viewer and the component both let go
   // Round 3C: slow-rising foam (soft {slow:true}, e.g. Mochi Momo) is MEANT to hold the dent and rise over ~2 s, without overshoot.
   const slow=!!v.rig().behaviour.soft?.slow;let prevD=1e9,rise=true;
   if(slow){for(let i=0;i<36;i++){advance(50);const d=v.stats().deform;if(d>prevD+1e-4)rise=false;prevD=d;}assert(rise,`${t.id}/${how}: slow foam rises steadily (no bounce)`);advance(800);}else advance(600);
   const a=v.stats();
   assert(!g.active().holding,`${t.id}/${how}: not holding`);assert(Math.abs(a.pressure)<.02,`${t.id}/${how}: pressure back to rest (${a.pressure.toFixed(3)})`);
   assert(a.deform<.03,`${t.id}/${how}: soft body back to rest (${a.deform.toFixed(3)}${slow?', slow foam by 2.6 s':''})`);
   if(!winds)assert(v.rig().root.scale.y>.97,`${t.id}/${how}: no squash left (${v.rig().root.scale.y.toFixed(3)}; a stretch reaction may still play)`);
   advance(winds?6000:200);checked++;}
  if(t.machine==='gs-square-snacks')rows.push(t.id);}
 assert.equal(checked,84*6);S.dispose();
 // The release never re-squashes: squash-type reactions are dropped from the let-go list.
 assert.deepEqual(VW.releaseRefs(['squash','jiggle']),['jiggle']);assert.deepEqual(VW.releaseRefs(['e_juicysquish']),['jiggle']);assert.deepEqual(VW.releaseRefs(['glow','squash']),['jiggle','glow']);
 const comp=read('components/GashaponToyViewer.tsx');assert(/window\.addEventListener\('pointerup',up,true\)/.test(comp)&&/'pointercancel',up,true/.test(comp)&&/onLostPointerCapture=\{lost\}/.test(comp)&&/setPointerCapture/.test(comp),'window-level up / cancel, pointer capture, lost capture');
 assert(/addEventListener\('blur',all\)/.test(comp)&&/visibilitychange',hidden/.test(comp)&&/touchend',touchEnd/.test(comp),'blur, hidden tab and the last touch ending let go');
});

await ok('working parts vs squeeze (Nov 9, Dorayaki Doug): on every mechanism toy a drag on the part works it, a still press-and-hold squeezes the toy (part untouched) and springs back ≤ 600 ms; a quick tap works it in one go',()=>{
 const S=sim(),{v,g,advance}=S;let n=0;const qs=()=>v.probe().mechs.map(m=>m.q);
 const grabPt=part=>{const c=v.screenOf(part);if(c&&v.pointerDown(c.x,c.y)==='mech'){v.pointerCancel();return [c.x,c.y];}
  for(let y=240;y<720;y+=12)for(let x=120;x<=270;x+=15){if(v.pointerDown(x,y)==='mech'){v.pointerCancel();return [x,y];}}return null;};
 for(const t of all){assert(v.show(t.id),t.id);advance(400);if(v.kind()?.kind!=='mechanism')continue;n++;
  const specs=v.rig().extras.mechs,pt=grabPt(specs[0].part);assert(pt,t.id+': a working part on screen');const [x,y]=pt,q0=qs();
  // (b) still press-and-hold: squeezes, the part stays put, and it all springs back.
  g.down(1,x,y);advance(200);assert.equal(g.active().grab,'mech',t.id+': a press grabs the part');advance(200);
  assert(g.active().holding&&g.active().grab===null,t.id+': a still hold turns into a squeeze');assert(v.stats().pressure>.5,`${t.id}: squeezing (${v.stats().pressure.toFixed(2)})`);
  assert(qs().every((q,i)=>Math.abs(q-q0[i])<.02),t.id+': the part did not move');g.up(1,x,y);advance(600);
  assert(!g.active().holding&&Math.abs(v.stats().pressure)<.02&&v.rig().root.scale.y>.97,`${t.id}: springs back (pressure ${v.stats().pressure.toFixed(3)})`);
  assert(qs().every((q,i)=>Math.abs(q-q0[i])<.02),t.id+': the part is where it was');advance(400);
  // (a) a drag works the part (some direction on screen moves it a fifth of its travel; a crank turns).
  let worked=false,far=0;for(const [dx,dy] of [[0,-1],[0,1],[1,0],[-1,0]]){const before=qs();g.down(1,x,y);for(let i=1;i<=12;i++){g.move(1,x+dx*i*16,y+dy*i*16);advance(16);}
   far=Math.max(far,...qs().map((q,i)=>Math.abs(q-before[i])));const moved=qs().some((q,i)=>Math.abs(q-before[i])>(specs[i].type==='crank'?.3:Math.min(.3,(specs[i].max-specs[i].min)*.2)));const act=g.active();g.up(1,x+dx*192,y+dy*192);advance(1500);
   assert(!act.holding,t.id+': a drag never squeezes');if(moved){worked=true;break;}}
  assert(worked,`${t.id}: a drag works the part (at most ${far.toFixed(3)})`);}
 assert(n>=8,'mechanism toys checked: '+n);S.dispose();
 // Dorayaki Doug: a quick tap on the lid opens it fully, a second shuts it (never half-moved).
 {const S2=sim(),{v,g,advance}=S2;v.show('dorayaki-doug');advance(400);const c=v.screenOf(v.rig().extras.mechs[0].part);
  g.down(1,c.x,c.y);advance(80);g.up(1,c.x,c.y);advance(1200);assert(v.kind().can.mechs[0].open,'a tap opens the top pancake');
  const c2=v.screenOf(v.rig().extras.mechs[0].part);g.down(1,c2.x,c2.y);advance(80);g.up(1,c2.x,c2.y);advance(1200);assert(Math.abs(v.probe().mechs[0].q)<.02,'a second tap shuts it');S2.dispose();}
});

await ok('toy kinds: 10 kinds, every one of the 84 has a kind + bonus; each machine mixes a puzzle, 1–2 squishy, a mechanical toy and a rare secret capsule',()=>{
 assert.equal(KD.TOY_KIND_NAMES.length,10);for(const k of KD.TOY_KIND_NAMES){const i=KD.TOY_KINDS[k];assert(i.hint&&i.label&&i.keys&&i.real,k);}
 for(const t of all){const p=KD.kindPlan(t.id);assert(p,t.id+' has a plan');assert(KD.TOY_KINDS[p.kind]&&KD.TOY_KINDS[p.bonus],t.id);assert.notEqual(p.kind,p.bonus,t.id+': the bonus is a second interaction');
  assert.equal(t.rarity==='rare',p.kind==='capsule',t.id+': the rare (only) is a secret capsule');if(t.rarity==='rare')assert(['gold','clear','glitter','pearl'].includes(p.rare),t.id+' rare finish');}
 assert.equal(Object.keys(KD.TOY_KIND_PLAN).length,84,'no stray ids');
 const M=load('lib/gashapon/machines.ts');for(const m of M.setGashaponMachines()/* the stadium four share these sets */){const ps=all.filter(t=>t.machine===m.id).map(t=>KD.kindPlan(t.id));
  assert(ps.some(p=>p.kind==='puzzle'),m.id+': a take-apart puzzle');const sq=ps.filter(p=>KD.SQUISHY.includes(p.kind)).length;assert(sq>=1&&sq<=2,m.id+': 1–2 squishy ('+sq+')');
  assert(ps.some(p=>KD.MECHANICAL.includes(p.kind)),m.id+': a mechanical toy');}
 for(const id of KD.KIND_LIVE)assert(REG.HD_MACHINES.has(id),id+': live kinds need the HD build');
});

await ok('HD pilot (gs-square-snacks): each toy plays its kind — pieces pull off and snap back (complete), the wind-up walks and stops, the capsule reveals, the soft body dents and settles',()=>{
 for(const t of all.filter(t=>t.machine==='gs-square-snacks')){const rig=REG.buildToy(t.id),b=rig.behaviour,p=KD.kindPlan(t.id);assert(rig.hd&&b.kind,t.id+': HD with a kind');
  assert.equal(b.kind.kind,p.kind,t.id+': the model plays the planned kind');
  const names=new Set(rig.parts.keys());if(b.kind.kind==='puzzle')for(const q of b.kind.pieces){assert(names.has(q.part),t.id+' piece '+q.part);assert(rig.parts.get(q.part).parent===rig.root,t.id+': pieces hang off the root');}
  if(b.kind.kind==='windup')assert(names.has(b.kind.key)&&b.kind.legs.every(l=>names.has(l)));if(b.kind.kind==='capsule')assert(['top','bottom','inner'].every(k=>names.has(b.kind[k])));
  for(const s of b.springs??[])assert(names.has(s.part),t.id+' spring '+s.part);
  console.log(`     ${t.id}: ${p.kind}+${p.bonus} ${rig.stats.draws}d/${Math.round(rig.stats.triangles)}t ${rig.materials.length}m`);rig.dispose();}
 // Onigiri Ollie by touch: drag the nori off (tug, pop free), the rice top can come off next, drag it back: it snaps in; all back: complete.
 {const S=sim(),{v,g,advance,events}=S;v.show('onigiri-ollie');advance(300);
  const nori=v.screenOf('nori');assert.equal(v.pointerDown(nori.x,nori.y),'piece','the nori is a grab target');v.pointerUp();advance(400);
  g.down(1,nori.x,nori.y);for(let i=1;i<=12;i++){g.move(1,nori.x+i*14,nori.y-i*10);advance(20);}g.up(1,nori.x+168,nori.y-120);advance(1500);
  assert(events.includes('pop:the nori wrap'),'pulled free: '+events.join(','));assert(v.kind().can.together,'the nori is on the tray');
  // A tap on a tray piece sends it home and it clicks in; complete fires.
  const home=v.screenOf('nori');g.down(3,home.x,home.y);g.up(3,home.x,home.y);advance(1200);
  assert(events.includes('snap:the nori wrap')&&events.includes('complete'),'snap + complete: '+events.join(','));
  // Keyboard / screen reader route: three pieces off in order, then back.
  assert(/off/.test(v.action('apart')));assert(/top of the rice/.test(v.action('apart')));assert(/plum/.test(v.action('apart')));assert.equal(v.action('apart'),'Nothing else comes off');advance(1500);
  assert.equal(v.kind().can.piecesIn,0);for(let i=0;i<3;i++){v.action('together');advance(900);}assert.equal(v.kind().can.piecesIn,3,'all three back');assert(events.filter(e=>e==='complete').length>=2);
  // Hit targets: the plum is small, but its grab sphere is never under 22 px.
  v.action('apart');v.action('apart');advance(1500);const plum=v.screenOf('plum');assert.equal(v.pointerDown(plum.x+18,plum.y),'piece','≥ 22 px around a small piece still grabs it');v.pointerUp();
  S.dispose();}
 // Karaage Kai: hold winds (ratchets), let go: he walks a figure-eight and stops home.
 {const S=sim(),{v,g,advance,events}=S;v.show('karaage-kai');advance(300);const home0=[v.rig().root.position.x,v.rig().root.position.z];const pt=squeezePoint(v);g.down(1,...pt);advance(1500);g.up(1,...pt);advance(200);
  assert(events.includes('ratchet')&&events.includes('run'),'wound and running: '+events.join(','));const r=v.rig().root,home=[r.position.x,r.position.z];void home;advance(400);assert(Math.hypot(r.position.x-home0[0],r.position.z-home0[1])>.01,'walked off');
  advance(9000);assert(events.includes('stop'),'stopped');assert(Math.hypot(r.position.x-home0[0],r.position.z-home0[1])<.05,'back home ('+r.position.x.toFixed(3)+', '+r.position.z.toFixed(3)+')');S.dispose();}
 // Golden Onigiri: closed, twist the capsule: it pops open and the toy springs out; the reveal is remembered by the component.
 {const S=sim(),{v,g,advance,events}=S;v.show('golden-onigiri');advance(300);assert.equal(v.kind().can.opened,false);assert.equal(v.rig().parts.get('inner').visible,false,'the secret is hidden');
  const c=v.screenOf('capTop');assert.equal(v.pointerDown(c.x,c.y),'capsule');for(let i=0;i<20;i++){v.pointerMove(c.x+i*12,c.y);advance(16);}v.pointerUp();advance(1500);
  assert(events.includes('reveal'),'revealed: '+events.join(','));assert(v.rig().parts.get('inner').visible&&v.kind().can.opened);
  assert(/Packed/.test(v.action('open')));advance(1500);assert(events.includes('close')&&!v.kind().can.opened,'packed back');S.dispose();
  const O=sim({opened:id=>id==='golden-onigiri'});O.v.show('golden-onigiri');O.advance(100);assert(O.v.kind().can.opened,'opened before: starts open');O.dispose();}
 // Soft body: a poke dents, the dent and the jelly sway settle; positions return exactly to rest.
 {const S=sim(),{v,advance}=S;v.show('nikuman-nico');advance(200);const m=v.rig().meshes[0],before=Float32Array.from(m.geometry.getAttribute('position').array);
  const pt=squeezePoint(v);v.tap(...pt);advance(60);assert(v.stats().deform>.001,'dented');advance(3000);assert.equal(v.stats().deform,0,'settled');
  const after=m.geometry.getAttribute('position').array;let diff=0;for(let i=0;i<after.length;i++)diff=Math.max(diff,Math.abs(after[i]-before[i]));assert(diff<1e-6,'rest positions restored exactly ('+diff+')');S.dispose();}
 // The other 78 keep their round 3A behaviour: toon, no kind runtime.
 {const S=sim();for(const t of all.filter(t=>!REG.HD_MACHINES.has(t.machine))){S.v.show(t.id);assert(!S.v.stats().hd&&S.v.kind()?.live===false,t.id+' unchanged');assert.equal(S.v.action('apart'),null);}S.dispose();}
});

// Round 3B rollout batch 1 (Nov 9 2026): Sweet Shop Treats, Bento Box Buddies and Summit Orchard rebuilt with the HD kit.
await ok('HD batch 1 (gs-cay-sweets, gs-cay-bento, gs-summit): each toy plays its planned kind and bonus; pieces hang off the root with an order; capsules, bobble heads, working parts; a face; nothing below the floor',()=>{
 const B1=['gs-cay-sweets','gs-cay-bento','gs-summit'];for(const m of B1)assert(REG.HD_MACHINES.has(m)&&KD.KIND_LIVE.has(m),m+': HD + live kinds');
 for(const t of all.filter(t=>B1.includes(t.machine))){const rig=REG.buildToy(t.id),b=rig.behaviour,p=KD.kindPlan(t.id),names=new Set(rig.parts.keys());
  assert(rig.hd&&b.kind,t.id+': HD with a kind');assert.equal(b.kind.kind,p.kind,t.id+': the model plays the planned kind');
  if(b.kind.kind==='puzzle'){assert(b.kind.pieces.length>=2,t.id+': two or more pieces');
   for(const q of b.kind.pieces){assert(names.has(q.part),t.id+' piece '+q.part);assert(rig.parts.get(q.part).parent===rig.root,t.id+': pieces hang off the root');for(const a of q.after??[])assert(b.kind.pieces.some(o=>o.part===a),t.id+' order '+a);}
   assert(b.kind.pieces.some(q=>q.after?.length),t.id+': a real reassembly order');}
  if(b.kind.kind==='capsule')assert(['top','bottom','inner'].every(x=>names.has(b.kind[x])),t.id+' capsule parts');
  if(b.kind.kind==='bobble')assert(names.has(b.kind.head),t.id+' bobble head');
  if(p.kind==='mechanism'||p.bonus==='mechanism')assert(rig.extras.mechs.length>=1&&rig.extras.mechs.every(m=>names.has(m.part)),t.id+': a working part');
  if(p.bonus==='bobble')assert((b.springs??[]).length>=1,t.id+': a bobbling part');if(p.bonus==='spintop')assert(b.flick,t.id+': flick to spin');
  if(['squish','jelly'].includes(p.kind)||['squish','jelly'].includes(p.bonus))assert(b.soft,t.id+': a soft body');
  for(const s of b.springs??[])assert(names.has(s.part),t.id+' spring '+s.part);
  assert([...names].some(n=>/eyes$/.test(n)),t.id+': a face');
  rig.root.updateMatrixWorld(true);const box=new T.Box3();for(const m of rig.meshes)box.expandByObject(m);assert(box.min.y>-.005,`${t.id}: nothing below the floor (${box.min.y.toFixed(3)})`);
  console.log(`     ${t.id}: ${p.kind}+${p.bonus} ${rig.stats.draws}d/${Math.round(rig.stats.triangles)}t ${rig.materials.length}m`);rig.dispose();}
 // By the keyboard / screen-reader routes: Taiyaki comes apart in order and goes back; Dorayaki's top opens; Gigi's capsule reveals.
 {const S=sim(),{v,advance,events}=S;v.show('taiyaki-tai');advance(300);assert(/front half/.test(v.action('apart')));assert(/chestnut/.test(v.action('apart')));assert(/filling/.test(v.action('apart')));
  assert.equal(v.action('apart'),'Nothing else comes off');advance(1500);for(let i=0;i<3;i++){v.action('together');advance(900);}assert.equal(v.kind().can.piecesIn,3,'all back');assert(events.includes('complete'));S.dispose();}
 {const S=sim(),{v,advance}=S;v.show('dorayaki-doug');advance(300);assert(/opens/.test(v.action('work0')));advance(900);assert(v.kind().can.mechs[0].open,'the top pancake is open');S.dispose();}
 {const S=sim(),{v,advance,events}=S;v.show('summit-goal-gigi');advance(300);assert.equal(v.kind().can.opened,false);v.action('open');advance(1500);assert(events.includes('reveal'),'revealed');S.dispose();}
});

await ok('no leaks: 50 shows in one viewer free every geometry, material and texture; the scene keeps the same objects; 60 / 30 fps caps',()=>{
 const S=sim(),{v,advance}=S;let made=0,freed=0;const seen=new Set();let base=-1;
 const ids=['onigiri-ollie','golden-onigiri','daruma-dash','oden-odie','karaage-kai','mochi-momo'];
 for(let i=0;i<50;i++){v.show(ids[i%ids.length]);advance(50);if(i%3===0)v.action('apart'),v.action('open');advance(50);const rig=v.rig();
  rig.root.traverse(o=>{for(const x of [o.geometry,...[].concat(o.material??[]),o.material?.normalMap].filter(Boolean))if(!seen.has(x)){seen.add(x);made++;x.addEventListener('dispose',()=>freed++);}});
  const scene=rig.root.parent.parent;let n=0;scene.traverse(()=>n++);const others=n-(()=>{let k=0;rig.root.traverse(()=>k++);return k;})();if(base<0)base=others;assert.equal(others,base,'scene objects outside the toy stay the same (cycle '+i+')');}
 S.dispose();assert.equal(freed,made,`every toy resource freed (${freed}/${made})`);
 assert(Math.abs(sim().v.stats().frameMs-1000/60)<.01,'60 fps by default');assert(Math.abs(sim({reducedMotion:true}).v.stats().frameMs-1000/30)<.01,'30 fps with reduced motion');
 for(const [id] of [...frames])frames.delete(id);
});

// ---- Round 3C (Nov 9 2026): working parts, ball-chain charms, poses, slow foam, capsule halves flat; dev-only lab samples.
const LAB=load('lib/gashapon/toyModels/_labSamples.ts');
await ok('round 3C lab samples: build HD within budgets, never registered for players, dispose frees beads too',()=>{
 assert.equal(LAB.LAB_SAMPLE_IDS.length,5);assert(!/_labSamples/.test(read('lib/gashapon/toyModels/index.ts')),'not in the player registry');
 for(const id of LAB.LAB_SAMPLE_IDS){assert.equal(REG.buildToy(id),null,id+': unknown to players');const rig=LAB.labSamples.build(id);assert(rig.hd);
  assert(rig.stats.draws<=HD_DRAW_MAX&&rig.stats.triangles<=HD_TRI_MAX&&rig.materials.length<=HD_MAT_MAX,`${id}: ${rig.stats.draws}d/${rig.stats.triangles}t`);
  console.log(`     ${id}: ${LAB.labSamples.plan(id).kind} ${rig.stats.draws}d/${Math.round(rig.stats.triangles)}t ${rig.materials.length}m mechs ${rig.extras.mechs.length} chains ${rig.extras.chains.length} poses ${rig.extras.poses.length}`);rig.dispose();}
});
const labSim=()=>sim({lab:LAB.labSamples});
const drag=(S,x,y,dx,dy,n=12)=>{S.g.down(1,x,y);for(let i=1;i<=n;i++){S.g.move(1,x+dx*i/n,y+dy*i/n);S.advance(16);}};
await ok('mechanism: hinge drags open on a spring (detent, end stop click), stays; let go near shut: snaps shut with a clack; lever pops the flag; plunger springs back ≤ 600 ms; ≥ 22 px targets',()=>{
 const S=labSim(),{v,g,advance,events}=S;assert(v.show('lab-boot-box'));advance(300);const k=v.kind();assert.equal(k.kind,'mechanism');assert.equal(k.hint,'Open me');assert.equal(k.can.mechs.length,3);
 const lid=v.screenOf('lid');assert.equal(v.pointerDown(lid.x,lid.y),'mech','the lid is a grab target');v.pointerUp();advance(900);assert(v.probe().mechs[0].q>1.5,'a tap opens it');
 v.pointerDown(v.screenOf('lid').x,v.screenOf('lid').y);v.pointerUp();advance(900);assert(Math.abs(v.probe().mechs[0].q)<.01,'a second tap shuts it');
 events.length=0;drag(S,lid.x,lid.y+10,0,-260,16);advance(300);const open=v.probe().mechs[0].q;assert(open>.9,'dragged open ('+open.toFixed(2)+')');
 // Keep dragging up: up always opens a lid (the rest-pose direction), so it reaches the end stop with a click.
 for(let i=1;i<=10;i++){g.move(1,lid.x,lid.y-260-i*20);advance(16);}g.up(1,lid.x,lid.y-460);advance(400);assert(events.includes('open:lid'),'end stop click: '+events.join(','));const held=v.probe().mechs[0].q;advance(1200);assert(Math.abs(v.probe().mechs[0].q-held)<.05&&held>1.5,`stays open (${held.toFixed(2)} → ${v.probe().mechs[0].q.toFixed(2)})`);
 assert(events.some(e=>e.startsWith('detent')),'passed the detent');
 // Close it most of the way by drag, let go near shut: it snaps shut with a clack.
 events.length=0;const lid2=v.screenOf('lid');// drag down: it closes; let go near shut
 drag(S,lid2.x,lid2.y,0,240,12);const nearShut=v.probe().mechs[0].q;g.up(1,lid2.x,lid2.y+240);
 assert(nearShut<.5&&nearShut>.01,'dragged nearly shut ('+nearShut.toFixed(2)+')');const t0=Date.now();advance(600);void t0;
 assert(Math.abs(v.probe().mechs[0].q)<.01,'snapped shut ('+v.probe().mechs[0].q.toFixed(3)+')');assert(events.includes('shut:lid'),'clack: '+events.join(','));
 // Buttons / M: work0 opens and closes the lid, work1 presses the plunger (back within 600 ms), work2 pulls the lever: the flag pops.
 assert(/opens/.test(v.action('work0')));advance(900);assert(v.kind().can.mechs[0].open);assert(/closes/.test(v.action('work0')));advance(900);assert(!v.kind().can.mechs[0].open);
 events.length=0;v.action('work1');advance(250);assert(events.includes('push:button'),'plunger bottoms out: '+events.join(','));advance(600);assert(Math.abs(v.probe().mechs[1].q)<.002,'the plunger is back');
 const flag=v.rig().parts.get('flag');assert.equal(flag.visible,false,'flag hidden');v.action('work2');advance(400);assert(events.some(e=>e.startsWith('fire')),'the lever fires');assert(flag.visible&&v.probe().mechs[2].fire>.5,'flag up');
 advance(600);assert(Math.abs(v.probe().mechs[2].q)<.01,'lever back within 600 ms of letting go');advance(2200);assert(!flag.visible,'the flag sinks back');
 // Up / Down move the last worked part.
 v.action('work0');advance(900);v.action('less');advance(600);assert(v.probe().mechs[0].q<1.6,'Down moves it back');v.action('work0');advance(900);
 // ≥ 22 px: a touch 18 px off the small button still grabs it.
 const b=v.screenOf('button');assert.equal(v.pointerDown(b.x+18,b.y),'mech','≥ 22 px around the small button');v.pointerUp();
 S.dispose();
});
await ok('mechanism: wheels roll along the turntable and home; a crank turns its gear by the ratio (ratchet ticks)',()=>{
 const S=labSim(),{v,g,advance,events}=S;v.show('lab-kit-cart');advance(300);assert.equal(v.kind().hint,'Push me');const r=v.rig().root,z0=r.position.z;
 const w=v.screenOf('wheelFR');drag(S,w.x,w.y,0,160,8);g.up(1,w.x,w.y+160);advance(120);const moved=Math.abs(r.position.z-z0);assert(moved>.05,'rolled ('+moved.toFixed(3)+')');
 assert(v.rig().parts.get('wheelFR').quaternion.angleTo(new T.Quaternion())>.2,'the wheels turn');advance(5000);assert(Math.abs(r.position.z-z0)<.003,'rolled home');
 events.length=0;const c=v.screenOf('crank'),cx=c.x,cy=c.y;assert.equal(v.pointerDown(cx,cy),'mech');v.pointerUp();advance(100);
 g.down(1,cx,cy);g.move(1,cx+40,cy);advance(16);for(let i=1;i<=24;i++){const a=i/24*Math.PI*2;g.move(1,cx+40*Math.cos(a),cy+40*Math.sin(a));advance(16);}g.up(1,cx+40,cy);advance(50);
 const q=v.probe().mechs[1].q;assert(Math.abs(q)>3,'cranked about a turn ('+q.toFixed(2)+')');assert(events.filter(e=>e==='ratchet').length>=4,'ratchet ticks');
 const gear=v.rig().parts.get('gear');assert(gear.quaternion.angleTo(new T.Quaternion())>.05,'the gear turns');assert(/turns/.test(v.action('work1')));
 S.dispose();
});
await ok('charm: the toy hangs on a verlet ball chain; grab the ring and swing: it tilts, settles and sleeps exactly at rest; the body still squeezes',()=>{
 const S=labSim(),{v,g,advance,events}=S;v.show('lab-ball-buddy');advance(300);const k=v.kind();assert.equal(k.kind,'charm');assert(k.can.chain);
 const r=v.rig().root,p0=r.position.clone();assert(v.probe().chain.sleep,'asleep at rest '+JSON.stringify(v.probe().chain));
 const ring=v.screenOf('ring');assert.equal(v.pointerDown(ring.x,ring.y),'chain','the ring is a grab target');v.pointerUp();advance(50);
 drag(S,ring.x,ring.y,140,0,10);advance(200);g.up(1,ring.x+140,ring.y);advance(120);const pr=v.probe().chain;assert(pr.tilt>.08,'swinging ('+pr.tilt.toFixed(3)+')');assert(events.includes('swing'));
 advance(600);assert(v.probe().chain.anchor<.01,'the ring springs home within 600 ms');
 let t=0;while(!v.probe().chain.sleep&&t<20000){advance(200);t+=200;}assert(v.probe().chain.sleep,'settles and sleeps ('+t+' ms)');assert(Math.hypot(r.position.x-p0.x,r.position.z-p0.z)<1e-6&&v.probe().chain.tilt<1e-6,'exactly at rest (the idle breath still bobs it)');
 assert(/swings/.test(v.action('swing')));advance(500);assert(v.probe().chain.tilt>.02,'C swings it');advance(15000);
 const pt=squeezePoint(v);assert(pt,'a squeezable point on the body');g.down(1,...pt);advance(420);assert(v.stats().pressure>.5,'the body squeezes');g.up(1,...pt);advance(600);assert(v.stats().deform<.03,'and springs back');
 // Turning the table swings it too.
 v.grab();for(let i=0;i<6;i++){v.drag(60,0);advance(16);}v.release(1800,0);advance(300);assert(!v.probe().chain.sleep,'a fast table spin swings the charm');
 S.dispose();
});
await ok('figure: tap or drag an arm to blend into a pose, Star pose, a one-time victory idle; each pose says ta-da',()=>{
 const S=labSim(),{v,g,advance,events}=S;v.show('lab-keeper-kit');advance(300);const k=v.kind();assert.equal(k.kind,'figure');assert.equal(k.hint,'Pose me');assert.deepEqual([...k.can.poses],['rest','save','cheer','star','victory']);
 const arm=v.screenOf('armR');g.down(1,arm.x,arm.y);g.up(1,arm.x,arm.y);advance(500);assert.equal(v.probe().pose.cur,'save','a tap on the arm: the next pose that moves it');assert(events.includes('pose:Diving save'));
 const a=v.rig().parts.get('armR');assert(a.rotation.z>1.2,'the arm is out');
 // A drag: half way is a blend, let go past 40 %: it carries on into the pose.
 const arm2=v.screenOf('armL');S.g.down(1,arm2.x,arm2.y);for(let i=1;i<=6;i++){S.g.move(1,arm2.x,arm2.y-i*12);advance(16);}assert(v.probe().pose.t>.3&&v.probe().pose.t<1,'blending under the finger');g.up(1,arm2.x,arm2.y-72);advance(500);assert.equal(v.probe().pose.cur,'cheer');
 assert(/Star/.test(v.action('star')));advance(500);assert.equal(v.probe().pose.cur,'star');assert(/rest/i.test(v.action('star')));advance(500);assert.equal(v.probe().pose.cur,'rest');
 events.length=0;advance(4200);assert(events.includes('pose:Victory'),'the victory idle plays once: '+events.join(','));advance(2000);assert.equal(v.probe().pose.cur,'rest','and comes back');
 events.length=0;advance(6000);assert(!events.includes('pose:Victory'),'only once per open');
 // The lanyard whistle (a dangle chain): hangs at its rest, swings when the table turns, then rests again.
 const wh=v.rig().parts.get('whistle'),wp=wh.position.clone();v.grab();for(let i=0;i<6;i++){v.drag(60,0);advance(16);}v.release(1800,0);advance(200);
 advance(9000);assert(wh.position.distanceTo(wp)<.01,'the whistle hangs back where it was ('+wh.position.distanceTo(wp).toFixed(4)+')');S.dispose();
});
await ok('slow foam rises slowly (no overshoot) and is at rest by 2.6 s; capsule halves land flat on the tray, the surprise floats up then settles',()=>{
 const S=labSim(),{v,g,advance}=S;v.show('lab-foam-mochi');advance(300);const pt=squeezePoint(v);g.down(1,...pt);advance(500);const held=v.stats().deform;g.up(1,...pt);advance(300);const d300=v.stats().deform;
 assert(d300>held*.6,'still holds the dent at 300 ms ('+d300.toFixed(3)+' of '+held.toFixed(3)+')');advance(2300);assert(v.stats().deform<.03,'risen by 2.6 s');S.dispose();
 const C=sim(),cv=C.v;cv.show('golden-onigiri');C.advance(200);cv.action('open');let peak=0;for(let i=0;i<30;i++){C.advance(50);peak=Math.max(peak,cv.rig().parts.get('inner').position.y);}C.advance(1500);
 assert(peak>.2,'the surprise floats up ('+peak.toFixed(2)+')');assert(Math.abs(cv.rig().parts.get('inner').position.y)<.01,'and settles');
 for(const n of ['capTop','capBot']){const o=cv.rig().parts.get(n);assert(Math.abs(o.rotation.x)<.01,n+' lies the right way up (rim / foot down)');const b=new T.Box3().setFromObject(o);assert(b.min.y>-.01&&b.min.y<.03,n+' sits on the tray (min y '+b.min.y.toFixed(3)+')');}
 C.dispose();
});
await ok('round 3C leaks: 50 shows over the samples free every geometry / material / bead; scene objects outside the toy stay the same',()=>{
 const S=labSim(),{v,advance}=S;let made=0,freed=0;const seen=new Set();let base=-1;
 for(let i=0;i<50;i++){const id=LAB.LAB_SAMPLE_IDS[i%5];v.show(id);advance(40);v.action('work');v.action('swing');v.action('pose');advance(40);const rig=v.rig();
  rig.root.traverse(o=>{for(const x of [o.geometry,...[].concat(o.material??[])].filter(Boolean))if(!seen.has(x)){seen.add(x);made++;x.addEventListener('dispose',()=>freed++);}});
  const scene=rig.root.parent.parent;let n=0;scene.traverse(()=>n++);const others=n-(()=>{let k=0;rig.root.traverse(()=>k++);return k;})();if(base<0)base=others;assert.equal(others,base,'scene objects outside the toy (cycle '+i+')');}
 S.dispose();assert.equal(freed,made,`every resource freed (${freed}/${made})`);
 const comp=read('components/GashaponToyViewer.tsx');assert(/KeyM:'work'/.test(comp)&&/KeyP:'pose'/.test(comp)&&/ArrowUp/.test(comp),'M / P / arrow keys');
 const CID=load('lib/analytics/countIds.ts');for(const k of ['puzzle','windup','spintop','bobble','capsule','mechanism','charm','figure'])assert(CID.isCountId('gs:act_'+k),'gs:act_'+k);
});

// Round 3B rollout batch 3 (Nov 9 2026): Boots & Kits, Trophies & Legends and Rides & Rollers rebuilt with the HD kit.
await ok('HD batch 3 (gs-eleven, gs-oldtown, gs-jetty): each toy plays its planned kind and bonus; pieces hang off the root with an order; capsules, bobble heads, working parts, chains; a face; nothing below the floor; budgets',()=>{
 const B3=['gs-eleven','gs-oldtown','gs-jetty'];for(const m of B3)assert(REG.HD_MACHINES.has(m)&&KD.KIND_LIVE.has(m),m+': HD + live kinds');
 for(const t of all.filter(t=>B3.includes(t.machine))){const rig=REG.buildToy(t.id),b=rig.behaviour,p=KD.kindPlan(t.id),names=new Set(rig.parts.keys());
  assert(rig.hd&&b.kind,t.id+': HD with a kind');assert.equal(b.kind.kind,p.kind,t.id+': the model plays the planned kind');
  assert(rig.stats.draws<=HD_DRAW_MAX&&rig.stats.triangles<=HD_TRI_MAX&&rig.materials.length<=HD_MAT_MAX,`${t.id}: budget ${rig.stats.draws}d/${rig.stats.triangles}t`);
  if(b.kind.kind==='puzzle'){assert(b.kind.pieces.length>=2,t.id+': two or more pieces');
   for(const q of b.kind.pieces){assert(names.has(q.part),t.id+' piece '+q.part);assert(rig.parts.get(q.part).parent===rig.root,t.id+': pieces hang off the root');for(const a of q.after??[])assert(b.kind.pieces.some(o=>o.part===a),t.id+' order '+a);}
   assert(b.kind.pieces.some(q=>q.after?.length),t.id+': a real reassembly order');}
  if(b.kind.kind==='capsule')assert(['top','bottom','inner'].every(x=>names.has(b.kind[x])),t.id+' capsule parts');
  if(b.kind.kind==='bobble')assert(names.has(b.kind.head),t.id+' bobble head');
  if(b.kind.kind==='windup')assert(names.has(b.kind.key),t.id+' wind-up key');
  if(b.kind.kind==='charm')assert(rig.extras.chains.some(c=>c.mode==='hang'),t.id+': hangs on a ball chain');
  if(p.kind==='mechanism'||p.bonus==='mechanism')assert(rig.extras.mechs.length>=1&&rig.extras.mechs.every(m=>names.has(m.part)),t.id+': a working part');
  if(p.bonus==='bobble')assert((b.springs??[]).length>=1,t.id+': a bobbling part');if(p.bonus==='spintop')assert(b.flick,t.id+': flick to spin');
  if(p.bonus==='charm')assert(rig.extras.chains.length>=1||(b.springs??[]).length>=1,t.id+': a dangling charm part');
  if(['squish','jelly'].includes(p.kind)||['squish','jelly'].includes(p.bonus))assert(b.soft,t.id+': a soft body');
  for(const s of b.springs??[])assert(names.has(s.part),t.id+' spring '+s.part);for(const c of rig.extras.chains)if(c.tag)assert(names.has(c.tag),t.id+' chain tag '+c.tag);
  assert([...names].some(n=>/eyes$/.test(n)),t.id+': a face');
  rig.root.updateMatrixWorld(true);const box=new T.Box3();for(const m of rig.meshes)box.expandByObject(m);assert(box.min.y>-.005,`${t.id}: nothing below the floor (${box.min.y.toFixed(3)})`);
  console.log(`     ${t.id}: ${p.kind}+${p.bonus} ${rig.stats.draws}d/${Math.round(rig.stats.triangles)}t ${rig.materials.length}m`);rig.dispose();}
 // By the keyboard / screen-reader routes: Kip's bib comes off first and everything goes back; Wyn's mouthpiece pops the pea; Stan opens; Gus winds; Bram's pedals turn.
 {const S=sim(),{v,advance,events}=S;v.show('kit-shirt-kip');advance(300);assert(/bib/.test(v.action('apart')));advance(900);v.action('apart');v.action('apart');advance(1500);
  for(let i=0;i<3;i++){v.action('together');advance(900);}assert.equal(v.kind().can.piecesIn,3,'all back');assert(events.includes('complete'));S.dispose();}
 {const S=sim(),{v,advance,events}=S;v.show('whistle-wyn');advance(300);v.action('work0');advance(300);assert(events.some(e=>e.startsWith('fire')),'the pea jumps: '+events.join(','));advance(900);assert(Math.abs(v.probe().mechs[0].q)<.002,'the mouthpiece is back');S.dispose();}
 {const S=sim(),{v,advance,events}=S;v.show('stadium-stan');advance(300);assert.equal(v.kind().can.opened,false);v.action('open');advance(1500);assert(events.includes('reveal'),'revealed');S.dispose();}
 {const S=sim(),{v,advance,events}=S;v.show('golden-boot-gus');advance(300);assert(/Wound/.test(v.action('wind')));advance(600);assert(events.includes('run'),'runs');advance(9000);assert(events.includes('stop'),'stops');S.dispose();}
 {const S=sim(),{v,advance}=S;v.show('bike-bram');advance(300);assert(/Pedals turn\./.test(v.action('work1')));advance(600);assert(v.rig().parts.get('wheelF').quaternion.angleTo(new T.Quaternion())>.05,'the pedals turn the wheels');S.dispose();}
 {const S=sim(),{v,advance}=S;v.show('medal-milo');advance(300);assert(/swings/.test(v.action('swing')));advance(500);assert(v.probe().chain.tilt>.02,'the medal swings');S.dispose();}
});

// Round 3B/3C rollout batch 2 (Nov 9 2026): Lucky Little Japan, Shell Seekers and Reef Friends rebuilt with the HD kit and the round 3C parts.
await ok('HD batch 2 (gs-square-lucky, gs-northbeach, gs-sharks): each toy plays its planned kind and bonus; pieces hang off the root with an order; capsules, bobble heads, working parts, chains, poses; a face; nothing below the floor; budgets',()=>{
 const B2=['gs-square-lucky','gs-northbeach','gs-sharks'];for(const m of B2)assert(REG.HD_MACHINES.has(m)&&KD.KIND_LIVE.has(m),m+': HD + live kinds');
 for(const t of all.filter(t=>B2.includes(t.machine))){const rig=REG.buildToy(t.id),b=rig.behaviour,p=KD.kindPlan(t.id),names=new Set(rig.parts.keys());
  assert(rig.hd&&b.kind,t.id+': HD with a kind');assert.equal(b.kind.kind,p.kind,t.id+': the model plays the planned kind');
  assert(rig.stats.draws<=HD_DRAW_MAX&&rig.stats.triangles<=HD_TRI_MAX&&rig.materials.length<=HD_MAT_MAX,`${t.id}: budget ${rig.stats.draws}d/${rig.stats.triangles}t`);
  if(b.kind.kind==='puzzle'){assert(b.kind.pieces.length>=2,t.id+': two or more pieces');
   for(const q of b.kind.pieces){assert(names.has(q.part),t.id+' piece '+q.part);assert(rig.parts.get(q.part).parent===rig.root,t.id+': pieces hang off the root');for(const a of q.after??[])assert(b.kind.pieces.some(o=>o.part===a),t.id+' order '+a);}
   assert(b.kind.pieces.some(q=>q.after?.length),t.id+': a real reassembly order');}
  if(b.kind.kind==='capsule')assert(['top','bottom','inner'].every(x=>names.has(b.kind[x])),t.id+' capsule parts');
  if(b.kind.kind==='bobble')assert(names.has(b.kind.head),t.id+' bobble head');
  if(b.kind.kind==='windup')assert(names.has(b.kind.key),t.id+' wind-up key');
  if(b.kind.kind==='charm')assert(rig.extras.chains.some(c=>c.mode==='hang'),t.id+': hangs on a ball chain');
  if(p.kind==='mechanism'||p.bonus==='mechanism')assert(rig.extras.mechs.length>=1&&rig.extras.mechs.every(m=>names.has(m.part)),t.id+': a working part');
  if(p.kind==='figure'||p.bonus==='figure')assert(rig.extras.poses.length>=3&&rig.extras.poses.every(q=>Object.keys(q.parts).every(n=>names.has(n))),t.id+': three or more poses on real parts');
  if(p.bonus==='bobble')assert((b.springs??[]).length>=1,t.id+': a bobbling part');if(p.bonus==='spintop')assert(b.flick,t.id+': flick to spin');
  if(p.bonus==='charm')assert(rig.extras.chains.length>=1||(b.springs??[]).length>=1,t.id+': a dangling charm part');
  if(['squish','jelly'].includes(p.kind)||['squish','jelly'].includes(p.bonus))assert(b.soft,t.id+': a soft body');
  for(const s of b.springs??[])assert(names.has(s.part),t.id+' spring '+s.part);for(const c of rig.extras.chains)if(c.tag)assert(names.has(c.tag),t.id+' chain tag '+c.tag);
  assert([...names].some(n=>/eyes$/.test(n)),t.id+': a face');
  rig.root.updateMatrixWorld(true);const box=new T.Box3();for(const m of rig.meshes)box.expandByObject(m);assert(box.min.y>-.005,`${t.id}: nothing below the floor (${box.min.y.toFixed(3)})`);
  console.log(`     ${t.id}: ${p.kind}+${p.bonus} ${rig.stats.draws}d/${Math.round(rig.stats.triangles)}t ${rig.materials.length}m`);rig.dispose();}
 // By the keyboard / screen-reader routes: Daruma's stack comes apart top-down and goes back; Orin's wing opens and stays; Mika's paw pops the coin and springs back;
 // Ema swings and her flap opens; Dee's middle pops the dove; Tomo opens and strikes the star pose; Remi winds; Maya swings.
 {const S=sim(),{v,advance,events}=S;v.show('daruma-dash');advance(300);assert(/daruma/.test(v.action('apart')));advance(900);v.action('apart');v.action('apart');v.action('apart');advance(1500);
  for(let i=0;i<4;i++){v.action('together');advance(900);}assert.equal(v.kind().can.piecesIn,4,'all back');assert(events.includes('complete'));S.dispose();}
 {const S=sim(),{v,advance}=S;v.show('origami-orin');advance(300);assert(/opens/.test(v.action('work0')));advance(900);assert(v.probe().mechs[0].q>.5,'the wing is up: '+v.probe().mechs[0].q);advance(1500);assert(v.probe().mechs[0].q>.5,'and stays');S.dispose();}
 {const S=sim(),{v,advance,events}=S;v.show('maneki-mika');advance(300);v.action('work0');advance(300);assert(events.some(e=>e.startsWith('fire')),'the coin pops: '+events.join(','));advance(900);assert(Math.abs(v.probe().mechs[0].q)<.002,'the paw is back');S.dispose();}
 {const S=sim(),{v,advance}=S;v.show('ema-emi');advance(300);assert(/swings/.test(v.action('swing')));advance(500);assert(v.probe().chain.tilt>.02,'Ema swings');advance(6000);assert(/opens/.test(v.action('work0')));advance(900);assert(v.probe().mechs[0].q>.5,'the wish flap is open');S.dispose();}
 {const S=sim(),{v,advance,events}=S;v.show('sand-dollar-dee');advance(300);v.action('work0');advance(300);assert(events.some(e=>e.startsWith('fire')),'the dove pops: '+events.join(','));advance(900);assert(Math.abs(v.probe().mechs[0].q)<.002,'the middle is back');S.dispose();}
 {const S=sim(),{v,advance,events}=S;v.show('torii-tomo');advance(300);v.action('open');advance(1600);assert(events.includes('reveal'),'revealed');assert(/Star/.test(v.action('star')));advance(600);assert.equal(v.probe().pose.cur,'star');S.dispose();}
 {const S=sim(),{v,advance,events}=S;v.show('reef-shark-remi');advance(300);assert(/Wound/.test(v.action('wind')));advance(600);assert(events.includes('run'),'runs');advance(9000);assert(events.includes('stop'),'stops');S.dispose();}
 {const S=sim(),{v,advance}=S;v.show('manta-maya');advance(300);assert(/swings/.test(v.action('swing')));advance(500);assert(v.probe().chain.tilt>.02,'Maya swings');S.dispose();}
});

// Round 3B rollout batch 4 (Nov 9 2026): Bug Squad, Cabinet Heroes, Pixel Pitch and Beach Day rebuilt with the HD kit.
await ok('HD batch 4 (gs-cayplaza, gs-arcade-heroes, gs-arcade-pixel, gs-westbeach): each toy plays its planned kind and bonus; pieces hang off the root with an order; capsules, bobble heads, working parts, chains; a face; nothing below the floor; budgets',()=>{
 const B4=['gs-cayplaza','gs-arcade-heroes','gs-arcade-pixel','gs-westbeach'];for(const m of B4)assert(REG.HD_MACHINES.has(m)&&KD.KIND_LIVE.has(m),m+': HD + live kinds');
 for(const t of all.filter(t=>B4.includes(t.machine))){const rig=REG.buildToy(t.id),b=rig.behaviour,p=KD.kindPlan(t.id),names=new Set(rig.parts.keys());
  assert(rig.hd&&b.kind,t.id+': HD with a kind');assert.equal(b.kind.kind,p.kind,t.id+': the model plays the planned kind');
  assert(rig.stats.draws<=HD_DRAW_MAX&&rig.stats.triangles<=HD_TRI_MAX&&rig.materials.length<=HD_MAT_MAX,`${t.id}: budget ${rig.stats.draws}d/${rig.stats.triangles}t`);
  if(b.kind.kind==='puzzle'){assert(b.kind.pieces.length>=2,t.id+': two or more pieces');
   for(const q of b.kind.pieces){assert(names.has(q.part),t.id+' piece '+q.part);assert(rig.parts.get(q.part).parent===rig.root,t.id+': pieces hang off the root');for(const a of q.after??[])assert(b.kind.pieces.some(o=>o.part===a),t.id+' order '+a);}
   assert(b.kind.pieces.some(q=>q.after?.length),t.id+': a real reassembly order');}
  if(b.kind.kind==='capsule')assert(['top','bottom','inner'].every(x=>names.has(b.kind[x])),t.id+' capsule parts');
  if(b.kind.kind==='bobble')assert(names.has(b.kind.head),t.id+' bobble head');
  if(b.kind.kind==='windup')assert(names.has(b.kind.key),t.id+' wind-up key');
  if(b.kind.kind==='charm')assert(rig.extras.chains.some(c=>c.mode==='hang'),t.id+': hangs on a ball chain');
  if(p.kind==='mechanism'||p.bonus==='mechanism')assert(rig.extras.mechs.length>=1&&rig.extras.mechs.every(m=>names.has(m.part)),t.id+': a working part');
  if(p.bonus==='bobble')assert((b.springs??[]).length>=1,t.id+': a bobbling part');if(p.bonus==='spintop')assert(b.flick,t.id+': flick to spin');
  if(p.bonus==='charm')assert(rig.extras.chains.length>=1||(b.springs??[]).length>=1,t.id+': a dangling charm part');
  if(['squish','jelly'].includes(p.kind)||['squish','jelly'].includes(p.bonus))assert(b.soft,t.id+': a soft body');
  for(const s of b.springs??[])assert(names.has(s.part),t.id+' spring '+s.part);for(const c of rig.extras.chains)if(c.tag)assert(names.has(c.tag),t.id+' chain tag '+c.tag);
  assert([...names].some(n=>/eyes$/.test(n)),t.id+': a face');
  rig.root.updateMatrixWorld(true);const box=new T.Box3();for(const m of rig.meshes)box.expandByObject(m);assert(box.min.y>-.005,`${t.id}: nothing below the floor (${box.min.y.toFixed(3)})`);
  console.log(`     ${t.id}: ${p.kind}+${p.bonus} ${rig.stats.draws}d/${Math.round(rig.stats.triangles)}t ${rig.materials.length}m`);rig.dispose();}
 // By the keyboard / screen-reader routes: Ace's bottles come off before her head and all goes back; Libby's wing case opens; Sparky winds;
 // Twirl's crank turns the roll; Flo slaps down with sand; Mara's chrysalis opens; Lou's rope lever runs the flag up.
 {const S=sim(),{v,advance,events}=S;v.show('ant-ace');advance(300);assert(/bottles/.test(v.action('apart')));advance(900);v.action('apart');v.action('apart');advance(1500);
  for(let i=0;i<3;i++){v.action('together');advance(900);}assert.equal(v.kind().can.piecesIn,3,'all back');assert(events.includes('complete'));S.dispose();}
 {const S=sim(),{v,advance}=S;v.show('ladybug-libby');advance(300);assert(/Wing cases open\./.test(v.action('work0')));advance(900);assert(v.kind().can.mechs[0].open,'the wing case is open');S.dispose();}
 {const S=sim(),{v,advance,events}=S;v.show('striker-sparky');advance(300);assert(/Wound/.test(v.action('wind')));advance(600);assert(events.includes('run'),'runs');advance(9000);assert(events.includes('stop'),'stops');S.dispose();}
 {const S=sim(),{v,advance}=S;v.show('ticket-twirl');advance(300);assert(/turns/.test(v.action('work0')));advance(600);assert(v.rig().parts.get('roll').quaternion.angleTo(new T.Quaternion())>.05,'the crank turns the roll');S.dispose();}
 {const S=sim(),{v,advance,events}=S;v.show('flip-flop-flo');advance(300);v.action('work0');advance(400);assert(events.some(e=>e.startsWith('fire')),'the sand bursts: '+events.join(','));advance(900);assert(Math.abs(v.probe().mechs[0].q)<.01,'she is back upright');S.dispose();}
 {const S=sim(),{v,advance,events}=S;v.show('monarch-mara');advance(300);assert.equal(v.kind().can.opened,false);v.action('open');advance(1500);assert(events.includes('reveal'),'revealed');S.dispose();}
 {const S=sim(),{v,advance,events}=S;v.show('lifeguard-lou');advance(300);v.action('open');advance(1500);v.action('work0');advance(400);assert(events.some(e=>e.startsWith('fire')),'the flag runs up: '+events.join(','));S.dispose();}
});

await ok('toys QA Nov 9: a hopper hops; a dangle tag rides the squashed body; a drag off a jelly mid-squeeze settles fast; a heel loop facing the camera still pulls; button labels are words',()=>{
 const yMax=(id,ms)=>{const S=sim(),{v,advance}=S;v.show(id);advance(300);v.action('wind');let m=0;for(let t=0;t<ms;t+=50){advance(50);m=Math.max(m,v.rig().root.position.y);}S.dispose();return m;};
 const hop=yMax('grasshopper-gil',2500),walk=yMax('striker-sparky',2500);assert(hop>.05&&walk<.03,`Gil hops (${hop.toFixed(3)}), Sparky walks (${walk.toFixed(3)})`);
 {const S=sim(),{v,advance}=S;v.show('firefly-fia');advance(1500);const tag=v.rig().parts.get('moon'),y=()=>{v.rig().root.updateMatrixWorld(true);return tag.getWorldPosition(new T.Vector3()).y;};const y0=y();
  v.holdStart();advance(500);const y1=y();v.holdEnd();advance(2500);const y2=y();S.dispose();assert(y0-y1>.02&&Math.abs(y2-y0)<.012,`Fia's moon tag follows the squash down and back (${y0.toFixed(3)} → ${y1.toFixed(3)} → ${y2.toFixed(3)})`);}
 for(const id of ['firefly-fia','octo-otto','ramune-rin']){const S=sim(),{v,g,advance}=S;v.show(id);advance(1500);const [x,y]=squeezePoint(v,S);g.down(1,x,y);advance(450);g.move(1,-20,-20);g.up(1,-20,-20);advance(600);
  const d=v.stats().deform;S.dispose();assert(d<.06,`${id}: dragged off mid-squeeze, the jelly settles (deform ${d.toFixed(3)} at 600 ms)`);}
 {const S=sim(),{v,advance}=S;v.show('golden-boot-gus');advance(1500);const p=v.screenOf('tab');assert.equal(v.pointerDown(p.x,p.y),'mech','grab the heel loop');for(let i=1;i<=10;i++){v.pointerMove(p.x,p.y-i*9);advance(16);}
  const q=v.probe().mechs[0].q;v.pointerUp();S.dispose();assert(q>.3,`a drag up pulls the heel loop (q ${q.toFixed(2)})`);}
 {const S=sim(),{v,advance,events}=S;v.show('torii-tomo');advance(7000);assert(!events.some(e=>e.startsWith('pose')),'no cheer inside the shut capsule: '+events.join(','));
  v.action('open');advance(7000);assert(events.some(e=>e.startsWith('pose')),'the cheer comes once it is open: '+events.join(','));S.dispose();}
 for(const id of ['taiyaki-tai','pixel-keeper']){const S=sim(),{v,g,advance}=S;S.events.length=0;v.show(id);advance(1500);let pt=null;for(let y=300;y<700&&!pt;y+=10)for(let x=100;x<300&&!pt;x+=10){if(v.pointerDown(x,y)==='piece')pt=[x,y];v.pointerCancel();}
  assert(pt,id+': a piece on screen');advance(1600);g.down(1,...pt);advance(400);const a=g.active(),p=v.stats().pressure;g.up(1,...pt);advance(900);
  assert(a.holding&&a.grab===null&&p>.3,`${id}: a still hold on a piece squeezes (holding ${a.holding}, p ${p.toFixed(2)})`);assert.equal(v.kind().can.piecesIn,v.kind().can.pieces,id+': every piece still in');
  g.down(2,...pt);for(let i=1;i<=12;i++){g.move(2,pt[0]+i*14,pt[1]-i*6);advance(16);}g.up(2,pt[0]+168,pt[1]-72);advance(900);assert(v.kind().can.together||S.events.some(e=>e.startsWith('blocked')),id+': a quick drag still pulls a piece off (or is blocked by the order): '+S.events.join(','));S.dispose();}
 for(const t of all){const rig=REG.buildToy(t.id);for(const m of rig.extras?.mechs??[])assert(/^[a-z][a-z' -]*$/.test(m.label),`${t.id}: the "${m.label}" button label is plain words`);rig.dispose();}
});

if(failed){console.log(failed+' FAILED');process.exit(1);}
console.log('PASS gashapon viewer: 84 toys build (all own models), budgets (3A + HD), dispose, reactions, viewer cleanup, squeeze release ×6 ways ×84, kinds plan + machine mix, HD pilot kinds, 50-show leak check, shelf, wiring, 1.2× machines, gs:* analytics');
})().catch(e=>{console.error(e);process.exit(1);});
