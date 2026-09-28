// Heat pass 4 (docs/performance-guide.md): approved phone defaults, audit fixes and the iPhone-timeline fixes. The tier governor,
// hysteresis and Battery saver are in tests/heat-tiers.cjs.
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),ts=require('typescript'),path=require('path'),T=require('three');
const read=p=>fs.readFileSync(p,'utf8');
function load(file,globals={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,Math,Float32Array,...globals,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});return m.exports;}

// 1. Phone/tablet defaults (user decision Sep 26 2026): DPR 1.5 at all times, 1024² shadows; MSAA kept (visual check); desktop unchanged.
{const Q=load('lib/graphics/quality.ts',{process:{env:{NODE_ENV:'production'}}});
 assert.deepEqual({...Q.phoneGraphicsFor(3,true)},{phone:true,pixelRatio:1.75,shadowSize:1536,antialias:true});
 assert.deepEqual({...Q.phoneGraphicsFor(2,true)},{phone:true,pixelRatio:1.75,shadowSize:1536,antialias:true},'iPad');
 assert.deepEqual({...Q.phoneGraphicsFor(3,false)},{phone:true,pixelRatio:1.75,shadowSize:1536,antialias:true},'DPR 3 without coarse pointer is a phone');
 assert.deepEqual({...Q.phoneGraphicsFor(2,false)},{phone:false,pixelRatio:2,shadowSize:2048,antialias:true},'desktop retina unchanged');
 assert.deepEqual({...Q.phoneGraphicsFor(1,false)},{phone:false,pixelRatio:1,shadowSize:2048,antialias:true},'desktop unchanged');
 assert.equal(Q.PHONE_ANTIALIAS_OFF_AT_DPR2,false,'MSAA stays on: AA-off broke thin pitch lines into dashes at DPR 1.5 (see the guide)');
 const pr=Q.phoneGraphicsFor(3,true).pixelRatio,r=new Q.MotionResolution(pr,true,pr);// as Town builds it for phones (quality pass: 1.75 while cool)
 assert.equal(r.enabled,false,'the sharp-when-still switch is a no-op on phones');assert.equal(r.update(0,true),0);assert.equal(r.update(900,false),0);
 const town=read('components/Town.tsx');assert.match(town,/new MotionResolution\(quality\.pixelRatio,[^\n]*quality\.phone\?quality\.pixelRatio:undefined\)/,'phones never switch resolution by motion');
 assert.match(town,/renderer=new T\.WebGLRenderer\(\{antialias:graphicsQuality\(\)\.antialias,/,'MSAA decided at renderer creation');
 assert.match(town,/sun\.shadow\.mapSize\.set\(quality\.shadowSize,quality\.sha/,'sun shadow size from quality');
 assert.match(town,/sun\.shadow\.normalBias=\.12\*2048\/quality\.shadowSize;/,'normal bias scales with the texel (no acne on 1024² roofs)');
 assert.match(town,/governed:quality\.phone\}\)/,'the governor keys on phone detection, not MotionResolution.enabled (off on phones now)');}
// 2. The tier adapter never raises a phone's 1024² shadow map back to 2048² at tier 0.
{const H=load('lib/graphics/heatTier.ts',{localStorage:{getItem:()=>null,setItem(){},removeItem(){}}});
 const {createIslandHeat}=load('lib/graphics/islandHeat.ts');
 const sun={shadow:{mapSize:{x:1024,set(x){this.x=x;}},map:null}};const heat=createIslandHeat({renderer:{shadowMap:{autoUpdate:true,needsUpdate:false}},sun,resolution:{setLimit(){}},npcs:{setDrawDistance(){}},traffic:{cars:[],rider:{index:-1}},governed:true});
 assert.equal(sun.shadow.mapSize.x,1024);heat.dispose();void H;}
// 3. Audit F4: teaching buffers upload only their used prefix, and nothing when unchanged.
{const {uploadPrefix}=load('lib/town/teachingGround.ts');const attr=new T.Float32BufferAttribute(new Float32Array(49152),3),shadow={data:new Float32Array(0),count:-1};
 attr.array.set([1,2,3,4,5,6,7,8,9]);const v0=attr.version;
 assert.equal(uploadPrefix(attr,9,shadow),true);assert.deepEqual(attr.updateRanges.map(r=>({...r})),[{start:0,count:9}]);assert.equal(attr.version,v0+1);
 attr.clearUpdateRanges();assert.equal(uploadPrefix(attr,9,shadow),false,'identical rebuild: no upload');assert.equal(attr.version,v0+1);
 attr.array[4]=50;assert.equal(uploadPrefix(attr,9,shadow),true);assert.equal(attr.updateRanges[0].count,9,'only the used prefix, not 49,152 floats');
 assert.match(read('lib/town/lessonCues.ts'),/uploadPrefix\(positions,count,sentPositions\);uploadPrefix\(colors,count,sentColors\)/);}
// 4. Audit F8: batched rigs skip the matrices of the classic meshes the bean skin hid; everything else matches updateMatrixWorld(true).
{const {updateRigMatrices}=load('lib/graphics/playerBatch.ts');
 const root=new T.Group(),joint=new T.Group(),bean=new T.Mesh(),hidden=new T.Mesh(),hiddenParent=new T.Mesh(),child=new T.Group();
 root.add(joint);joint.add(bean,hidden,hiddenParent);hiddenParent.add(child);root.position.set(1,2,3);joint.rotation.set(.3,.2,.1);bean.position.set(0,1,0);hidden.position.set(0,2,0);child.position.set(0,0,1);
 hidden.visible=false;hidden.userData.beanHidden=true;hiddenParent.visible=false;// hidden but with a child: never flagged by the skin
 const stale=hidden.matrixWorld.clone();updateRigMatrices(root);
 const ref=root.clone(true);ref.updateMatrixWorld(true);const byName=(o,i)=>{let k=0,r=null;o.traverse(n=>{if(k++===i)r=n;});return r;};
 let i=0;root.traverse(n=>{const m=byName(ref,i++);if(n===hidden)assert(n.matrixWorld.equals(stale),'flagged hidden leaf skipped');else assert(n.matrixWorld.equals(m.matrixWorld),'other nodes identical to updateMatrixWorld(true)');});
 const skin=read('lib/graphics/beanSkin.ts');assert.match(skin,/if\(!costume\)\{m\.visible=false;if\(!m\.children\.length\)m\.userData\.beanHidden=true;\}/);assert.match(skin,/m\.visible=v;delete m\.userData\.beanHidden;/);
 assert.match(read('lib/graphics/playerBatch.ts'),/updateRigMatrices\(root\);\(root\.userData\.beanSync/);}
// 5. Audit F3/F11/F13/F9/F10: overlays on island frames, gated polls, coalesced thumbs, resting waves, paused onboarding.
{const radar=read('components/FieldRadar.tsx');assert.match(radar,/onIslandFrame\(update\)/);assert(!/requestAnimationFrame/.test(radar),'no own rAF chain');
 assert.match(read('components/Town.tsx'),/positionStore\.frame\(location\.x,location\.z\);emitIslandFrame\(now\);/);
 assert(!/backdrop-filter/.test(read('components/IslandMapFrame.module.css')),'no blur behind the radar over the live match');
 assert.match(read('components/FieldTranscript.tsx'),/useEffect\(\(\)=>\{if\(chosen\|\|!mounted\)return;/,'transcript polls only while shown');
 const strikers=read('components/LiveArcadeMatch.tsx');const move=strikers.slice(strikers.indexOf('const moveStick='),strikers.indexOf('const releaseStick='));assert(!/setProperty|getBoundingClientRect\(\),x/.test(move.replace('joyRect.current??(joyRect.current=joy.current.getBoundingClientRect())','')),'Strikers thumb paints on game frames, rect cached');
 assert.match(read('components/IslandBottle.tsx'),/<OceanWaves leaving=\{leaving\} still=\{opened\}/);
 const town=read('components/Town.tsx'),onb=read('components/IslandOnboarding.tsx');
 assert.match(town,/const paused=\(mapRef\.current\|\|settingsRef\.current\)&&!\(onboardingRef\.current&&onboardingNpcStep\.current\),/,'the island pauses behind the tour except the NPC step');
 assert.match(town,/onNpcStepChange=\{active=>\{onboardingNpcStep\.current=active;if\(active\)wakeLoopRef\.current\(\);\}\}/);
 assert(!/setInterval\(update,350\)/.test(onb),'no 350 ms layout poll');}
// 6. iPhone timeline: gameplay taps never restart the HUD loops (tests/heat-pass3.cjs covers the hook); the minimap re-renders only at the shoreline.
{assert.match(read('lib/sceneryRest.ts'),/const release=\(event:Event\)=>\{if\(holds\.delete\(holdId\(event\)\)&&!holds\.size\)holding=false;\};/);
 assert.match(read('components/IslandSettings.tsx'),/HUD_HOLD_SELECTOR='[^']*\.town-scene'/,'canvas drags count as gameplay (audit F7)');
 assert.match(read('components/MovingIslandMap.tsx'),/useSyncExternalStore\(props\.active===false\?unsubscribed:store\.subscribe,key,key\)/);}
// 7. Audio: the shared context suspends 2 s after nothing is audible, resumes on demand; music pauses after 30 s without input.
{const sound=read('lib/audio/islandSound.ts'),music=read('lib/audio/islandMusic.ts');
 assert.match(sound,/const audible=\(\)=>musicAudible\|\|sources\.size>0\|\|!!engine\|\|!!travelHum;/);
 assert.match(sound,/if\(context\.state!=='running'\)\{if\(!\(idleSuspended&&context\.state==='suspended'\)\)return false;wakeIdle\(\);\}/,'a game sound resumes an idle-suspended context');
 assert.match(music,/export const MUSIC_IDLE_MS=30000;/);assert.match(music,/const allowed=\(\)=>enabled&&!bottleOpen&&!mediaPaused&&!ducked&&!idle&&/);
 assert.match(read('components/Town.tsx'),/createIslandMusic\(savedMusic,initialMusicVolume,sound\.getContext,sound\.setMusicAudible[,)]/);}
console.log('PASS heat pass 4: phone DPR 1.5 / 1024² (MSAA kept), tier cap respects phone shadows, prefix-only teaching uploads, hidden classic meshes skipped with parity, radar/transcript/Strikers/bottle/onboarding fixes, HUD taps do not restart loops, audio idle suspend and music idle pause');
