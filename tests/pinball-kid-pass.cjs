// Futbol Pinball kid pass (Oct 10 2026): the beginner goal-line saver, the ball-save ramp, a 90' that kids can reach,
// first-ball coaching lines, the merged static rails, and the touch/latency/HUD wiring in ArcadeGame3D.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),T=req('three');
const cache=new Map();
const globals={Math,Number,console,Map,WeakMap,Array,Object,String,JSON,Float32Array,Float64Array,
 localStorage:{getItem:()=>null,setItem(){}},document:{hidden:false},performance:{now:()=>0},navigator:{},matchMedia:()=>({matches:false})};
function load(file,extra={}){file=path.resolve(base,file);if(cache.has(file))return cache.get(file);const m={exports:{}};cache.set(file,m.exports);
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:1,target:7,esModuleInterop:true}}).outputText,{...globals,exports:m.exports,module:m,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):extra[id]??req(id)});
 return m.exports;}
(async()=>{
const P=load('lib/games/soccerPinball.ts'),F=load('lib/games/soccerPinballFeel.ts');
const idle={left:false,right:false};
const advance=(s,seconds,input=idle)=>{for(let i=0;i<Math.round(seconds*120);i++)P.stepPinball(s,input,1/120);};
const centreDrain=s=>Object.assign(s.ball,{x:180,y:540,vx:0,vy:420});

// 1. Build Up: every ball starts with the goal-line saver; it clears one centre drain, then it is gone for that ball.
{const s=P.createPinballState();assert.equal(s.table.saver,false,'nothing is armed on the plunger');
 P.launchPinball(s);assert.equal(s.table.saver,true,'division 1 launches with the saver up');
 s.openingRescue=false;s.launchGrace=0;centreDrain(s);advance(s,.1);
 assert.equal(s.phase,'playing','the saver clears the centre drain');assert.ok(s.ball.vy<0,'cleared back up the table');
 assert.equal(s.table.saver,false);assert.equal(s.table.saverUsed,true);assert.equal(s.cue,'clear');
 centreDrain(s);advance(s,.3);assert.equal(s.balls,2,'the second centre drain of the same ball is real');
 advance(s,1.2);assert.equal(s.phase,'ready');P.launchPinball(s);assert.equal(s.table.saver,true,'the next ball gets a fresh saver');}
// A ball-save relaunch is the same ball: it does not re-arm a used saver.
{const s=P.createPinballState();P.launchPinball(s);s.table.saver=false;s.table.saverUsed=true;s.openingRescue=true;s.launchGrace=3;
 Object.assign(s.ball,{x:180,y:630,vx:0,vy:400});advance(s,.05);assert.equal(s.cue,'rescue');advance(s,1.1);
 P.launchPinball(s);assert.equal(s.table.saver,false,'rescued relaunch keeps the saver spent');}
// From Find the Corner on, the saver has to be earned again (G-O-A-L).
{const s=P.createPinballState();s.level=2;P.launchPinball(s);assert.equal(s.table.saver,false,'division 2 earns it');}

// 2. Ball-save ramp and a 90' that ends after three minutes of live play.
assert.deepEqual([1,2,3,4].map(P.pinballBallSaveTime),[5,4,3,2.5]);
assert.equal(P.PINBALL_MATCH_TIME,180);
{const s=P.createPinballState();P.launchPinball(s);s.table.mode='final';s.table.modeTime=1e9;// protected, so the ball cannot drain
 Object.assign(s.ball,{x:60,y:300,vx:0,vy:0});s.clock=P.PINBALL_MATCH_TIME/2-.01;advance(s,.05);assert.equal(s.halfTime,true,"45' at 90 s");
 assert.equal(P.pinballMinute(s),"45'");s.clock=P.PINBALL_MATCH_TIME-.01;advance(s,.05);assert.ok(s.stoppage>=0,"stoppage time from 180 s");}

// 3. First-ball coaching: a kick-off instruction on the plunger, one plain line until the first real strike.
{const s=P.createPinballState(),feel=F.createPinballFeel();
 assert.equal(F.pinballFeelMessage(feel,s),'KICK-OFF! Hold LAUNCH, then let go.');
 s.plunger=.5;assert.match(F.pinballFeelMessage(feel,s),/^Power \d+%/,'the power read-out wins while pulling');s.plunger=0;
 P.launchPinball(s);assert.match(F.pinballFeelMessage(feel,s),/reaches your flipper/);
 Object.assign(s.ball,{x:145,y:540,vx:0,vy:100});advance(s,.075,{left:true,right:false});assert.equal(s.sfx.flipper,1,'a real strike');
 s.cueTime=0;s.cue='scan';s.timing.at=-10;assert.doesNotMatch(F.pinballFeelMessage(feel,s)??'',/reaches your flipper/,'line retires after the first strike');}
{const s=P.createPinballState(),feel=F.createPinballFeel();s.balls=2;P.launchPinball(s);assert.doesNotMatch(F.pinballFeelMessage(feel,s)??'',/reaches your flipper/,'only on the very first ball');}

// 3b. Running out of balls before 90' is not called "Full time" on the card.
{const s=P.createPinballState(),feel=F.createPinballFeel();P.launchPinball(s);s.balls=1;s.clock=40;s.openingRescue=false;s.launchGrace=0;s.table.saver=false;
 Object.assign(s.ball,{x:180,y:630,vx:0,vy:400});advance(s,1.3);assert.equal(s.phase,'over');
 assert.match(F.pinballFeelMessage(feel,s),/^Out of balls at 20' · Next time: /,'minute + one takeaway');}
// 4. Static rails bake into one mesh: same material only, sources removed, geometry in world space.
{const utils=await import(base+'/node_modules/three/examples/jsm/utils/BufferGeometryUtils.js');
 const M=load('lib/games/soccerPinballMerge.ts',{'three/examples/jsm/utils/BufferGeometryUtils.js':utils});
 const scene=new T.Scene(),geo=new T.CylinderGeometry(1,1,1,8),mat=new T.MeshStandardMaterial(),other=new T.MeshStandardMaterial();
 const rails=[0,1,2,3].map(i=>{const m=new T.Mesh(geo,mat);m.position.set(i*2,0,0);m.rotation.z=Math.PI/2;m.scale.set(.1,3,.1);scene.add(m);return m;});
 const odd=new T.Mesh(geo,other);scene.add(odd);
 const merged=M.mergePinballStatic([...rails,odd],'pinball-rails');
 assert.ok(merged,'merged');assert.equal(merged.name,'pinball-rails');assert.equal(merged.material,mat);
 assert.equal(scene.children.length,2,'four rails became one mesh; the odd material stays');assert.ok(scene.children.includes(odd));
 assert.equal(merged.geometry.attributes.position.count,4*geo.toNonIndexed().attributes.position.count);
 merged.geometry.computeBoundingBox();const box=merged.geometry.boundingBox;assert.ok(box.max.x>7&&box.min.x<-1,'baked world transforms');
 assert.equal(geo.attributes.position.count,new T.CylinderGeometry(1,1,1,8).attributes.position.count,'shared source geometry untouched');
 assert.equal(M.mergePinballStatic([odd],'x'),null,'nothing to merge');}

// 5. Wiring: half-screen touch flippers (multi-touch, mouse excluded), urgent input frame, HUD de-dupe, ball tracker.
{const src=fs.readFileSync(path.join(base,'components/games/ArcadeGame3D.tsx'),'utf8');
 assert.match(src,/const pinballZone=\(e:globalThis\.PointerEvent\)=>\{if\(kind!=='pinball'\|\|e\.pointerType==='mouse'/,'touch/pen only, pinball only');
 assert.match(src,/held\.current\.set\(e\.pointerId,e\.clientX-rect\.left<rect\.width\/2\?0:1\)/,'one held entry per finger and side');
 assert.match(src,/if\(canceled&&game\.current\)game\.current\.state\.pinball\.flipperPulse\[side\]=0/,'a cancelled touch never flicks');
 assert.match(src,/const nextSlot=urgentFrame\.current\?now:frameCapSlot\(now,slot,interval\);urgentFrame\.current=false;/,'a fresh press skips the 30 fps slot once');
 assert.match(src,/kind==='pinball'&&shownHud&&sameHud\(view,shownHud\)/,'unchanged pinball HUD does not re-render');
 const games=fs.readFileSync(path.join(base,'lib/arcade/arcadeGames.ts'),'utf8');
 assert.match(games,/mergePinballStatic\(pinballRails,'pinball-rails'\);mergePinballStatic\(pinballLampBases,'pinball-lamp-bases'\)/);
 const fx=fs.readFileSync(path.join(base,'lib/games/soccerPinballFx.ts'),'utf8');
 assert.match(fx,/halo\.name='pinball-ball-halo'/);assert.match(fx,/haloMaterial\.color\.copy\(danger\?coral:gold\)/,'coral when heading for the gap');}
console.log('PASS pinball kid pass: beginner goal-line saver, ball-save ramp, 3-minute 90\', first-ball coaching, merged rails, touch zones + urgent frame + HUD de-dupe + ball tracker');
})().catch(e=>{console.error(e);process.exit(1);});
