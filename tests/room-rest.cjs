// Room loops that sleep (heat QA, Oct 22 2026): the Arcade hub rests after 20 s without input once no visitor walks in view
// (lib/arcade/arcadeRest.ts); the Kit Shop rests (no new shopper walks) and reaches 0 rAF (lib/shop/shopScene.ts). Pure + source.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path'),T=require('three');
const ROOT=path.resolve(__dirname,'..'),loaded=new Map();
function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const m={exports:{}};loaded.set(file,m.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>{if(n==='three')return T;if(n.startsWith('.')||n.startsWith('@/')){const base=n.startsWith('@/')?path.join(ROOT,n.slice(2)):path.resolve(path.dirname(file),n);for(const ext of ['.ts','.tsx','/index.ts',''])if(fs.existsSync(base+ext)&&fs.statSync(base+ext).isFile())return load(base+ext);}return require(n);},console,Math,Date,performance,Float32Array,Uint16Array,Uint8Array,Int8Array,Map,Set,WeakMap,Array,Object,Number,String,JSON,Symbol,Error,setTimeout,clearTimeout});loaded.set(file,m.exports);return m.exports;}
const src=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
let n=0;const ok=(name,fn)=>{fn();n++;console.log('PASS',name);};

const R=load(path.join(ROOT,'lib/arcade/arcadeRest.ts'));
ok('1. hub rest gate: only after HUB_REST_S without input, no full-rate tail, no friend motion, nothing busy, no walker in view',()=>{
 assert.equal(R.HUB_REST_S,20);assert(R.HUB_ACTIVE_TAIL_S>0&&R.HUB_ACTIVE_TAIL_S<12,'the 12 s full-rate tail is shorter');assert(R.HUB_ENTRY_ACTIVE_S<=2);
 const base={idle:25,activity:0,remoteHold:0,busy:false,walkerInView:false};
 assert.equal(R.hubCanRest(base),true);
 assert.equal(R.hubCanRest({...base,idle:19.9}),false,'input within 20 s keeps the crowd alive');
 assert.equal(R.hubCanRest({...base,activity:.1}),false);assert.equal(R.hubCanRest({...base,remoteHold:.1}),false,'a moving friend keeps frames');
 assert.equal(R.hubCanRest({...base,busy:true}),false,'an emote / ball effect / knocked visitor finishes first');
 assert.equal(R.hubCanRest({...base,walkerInView:true}),false,'a visitor walking on screen finishes the walk first');
});

ok('2. crowd walkerIn: a walking visitor in the frustum blocks rest, one off screen does not; no allocation per call',()=>{
 const {createArcadeRoomCrowd}=load(path.join(ROOT,'lib/arcade/arcadeRoomCrowd.ts'));
 const scene=new T.Scene(),cabinets=[[-8,-7,0],[0,-10,0],[8,-7,0],[-9,4,.55],[9,4,-.55]].map(([x,z,yaw])=>({x,z,yaw}));
 const crowd=createArcadeRoomCrowd({scene,mobile:false,cabinets,bounds:{minX:-14,maxX:14,minZ:-11,maxZ:12}});
 const frustumOf=(cx,cz,half)=>{const c=new T.OrthographicCamera(-half,half,half,-half,.1,60);c.position.set(cx,30,cz);c.lookAt(cx,0,cz);c.updateMatrixWorld();c.updateProjectionMatrix();return new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(c.projectionMatrix,c.matrixWorldInverse));};
 const all=frustumOf(0,0,20),far=frustumOf(400,400,5);
 crowd.update(1/15,0,99,99);
 assert.equal(crowd.debugStates.at(-1).phase,'entry');assert.equal(crowd.walkerIn(all),true,'the entering visitor walks in view');
 assert.equal(crowd.walkerIn(far),false,'nobody walks in an empty view');
 // Over 100 s at 15 fps the hub has moments with nobody walking (rest can happen) and moments with a walk (rest waits).
 let quiet=0,busy=0;for(let f=0;f<1500;f++){crowd.update(1/15,f/15,99,99);if(crowd.walkerIn(all))busy++;else quiet++;}
 assert(quiet>0&&busy>0,`quiet ${quiet} / walking ${busy} frames`);
 const s=src('lib/arcade/arcadeRoomCrowd.ts'),fn=s.slice(s.indexOf('function walkerIn'),s.indexOf('function walkerIn')+400);
 assert(!/new |=>|\[\.\.\./.test(fn.slice(0,fn.indexOf('return false;}')+14)),'walkerIn allocates nothing');
 assert(!/`arcade-visitor-\$\{[ij]\}`/.test(s.slice(s.indexOf('function update('))),'no reaction key strings built per frame');
 crowd.dispose();
});

ok('3. hub scene: the tick stops (no rAF) on rest, input / friends / the tab wake it, the rest sound is one timer, cleared everywhere',()=>{
 const s=src('lib/arcade/arcadeRoomScene.ts');
 assert(!/activity=12/.test(s),'no 12 s full-rate window any more');
 assert(/if\(hubCanRest\(restIn\)\)\{rests\+\+;last=slot=0;restSoundLater\(\);return;\}\s*frame=requestAnimationFrame\(tick\);/.test(s),'rest returns before scheduling a frame');
 assert(/function wake\(\)\{activity=HUB_ACTIVE_TAIL_S;idle=0;/.test(s),'input restarts the idle clock');
 assert(/time\+=dt;idle\+=dt;/.test(s));
 for(const where of ['function wakeRemote','function wake()','function visibility','setCovered(','dispose(){'])assert(s.slice(s.indexOf(where),s.indexOf(where)+260).includes('clearTimeout(restSound)'),where+' clears the rest sound timer');
 assert(/restSound=setTimeout\(\(\)=>\{restSound=undefined;if\(frame\|\|disposed\|\|covered\|\|document\.hidden\)return;/.test(s),'the sound timer never runs with frames, covered or hidden');
 assert(/restIn\.walkerInView=!restIn\.busy&&idle>=HUB_REST_S&&crowd\.walkerIn\(frustum\)/.test(s),'the frustum test only runs once rest is possible');
});

ok('4. Kit Shop: idle rest stops new walks and the room reaches 0 rAF; the walk timer is not armed while resting',()=>{
 const s=src('lib/shop/shopScene.ts');
 const m=/const IDLE_REST=(\d+)/.exec(s);assert(m&&+m[1]<=30,'the shop rests within 30 s of no input');
 assert(/if\(resting\(\)\)\{/.test(s));
 assert(/next<lastInput\+IDLE_REST\)npcTimer=setTimeout/.test(s),'no walk timer past the rest time');
 assert(/if\(settle>0\|\|crowd\|\|leaving\|\|remoteKeep\)frame=requestAnimationFrame\(tick\);else\{/.test(s),'a still shop schedules no frame');
});
console.log(`ROOM_REST_PASS ${n} checks`);
