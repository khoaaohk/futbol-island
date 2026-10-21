// Bug squad catch stage (Oct 21 2026; docs/island-jobs.md §15 "Catch stage"): the isolated catch cinematic and the one-UI-at-a-time HUD.
//  1. timeline: the phases play in order (push-in, settle, swing, 70 ms hit-stop, suck, flip, raise, hold, card, out), ~4-5 s;
//  2. bug size: every species (and the firefly) fits the net once caught (longest side ≤ 60 % of the hoop's diameter), never
//     bigger than it flew, and flies at a believable size on the stage;
//  3. the stage camera: every point of the character, the net's reach and the bug is inside the frame (phone portrait + desktop,
//     all round), the character no taller than half the screen, the face never behind the net; the push-in eye stays on the follow
//     camera's own line of sight and above the ground on Summit Isle;
//  4. the real rig in the show pose (net presented, then raised with a hop): both mittens on the pole, the hoop beside the head and
//     clear of the face, the caught bug inside the closed bag;
//  5. the stage scene: few draws, no textures, disposed clean;
//  6. the HUD: one message surface at a time (story card > payday > toast), the HUD-hiding rule, the new-species coin on the card.
// usage: node tests/bug-catch-stage.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),ts=req('typescript'),cache=new Map(),storage=new Map();
function load(file){if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,console,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},window:{addEventListener(){},removeEventListener(){},dispatchEvent:()=>true},require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id)});return mod.exports;}
const T=req('three'),G=p=>load(base+'/lib/graphics/'+p+'.ts'),J=p=>load(base+'/lib/town/jobs/'+p+'.ts');G('characterStyle').setCharacterStyle('bean');
const K=J('bugCatch'),NET=J('bugNet'),SP=J('bugSpecies'),UI=J('bugUi'),M=G('bugModels'),CS=G('catchStage'),W=G('wildBugsCore'),JP=G('jobPoses');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');const report=[];

// ---- 1. Timeline ----
{const A=K.CATCH_STAGE_AT,order=K.CATCH_STAGE_ORDER;let last=-1,seen=[];
 for(let t=0;t<=A.done+.05;t+=1/120){const p=K.catchStagePhase(t).phase;if(seen[seen.length-1]!==p)seen.push(p);}
 assert.deepEqual(seen,[...order],'every phase plays, in order: '+seen.join(' > '));
 for(const k of ['settle','swing','hit','suck','flip','raise','hold','card','out','done']){assert(A[k]>=last,'phase starts only ever increase at '+k);last=A[k];}
 assert(Math.abs(A.suck-A.hit-.07)<1e-9,'a 70 ms hit-stop');assert(Math.abs(A.hit-A.swing-K.SWING.hit)<1e-9,'the stage swing hits at the swing\'s own hit frame');
 assert.equal(K.stageSwingTime(A.hit+.03),K.SWING.hit,'the swing freezes during the hit-stop');assert(K.stageSwingTime(A.flip)<=K.SWING.sweepEnd,'and carries on to the sweep end');
 const total=K.CATCH_STAGE.pushIn+A.done;assert(total>=4&&total<=5.5,`the whole catch takes ~4-5 s (${total.toFixed(2)} s)`);
 for(const k of ['flip','raise'])assert(K.CATCH_STAGE[k]>=.15&&K.CATCH_STAGE[k]<=.5,k+': a readable blend');
 report.push(`timeline ${seen.join(' > ')}, ${total.toFixed(2)} s with the push-in`);}

// ---- 2. Bug size: fits the net ----
{const R=NET.NET_HOOP_RADIUS;let worst=0;
 for(const sp of [...SP.BUG_SPECIES,null]){const g=M.createBugModel(sp);g.computeBoundingBox();const s=g.boundingBox.getSize(new T.Vector3()),longest=Math.max(s.x,s.y,s.z);
  const world=sp?W.bugStageSize(sp.look.size):W.FIREFLY_SIZE,fly=K.stageFlightScale(longest,world),inNet=K.catchScale(longest,fly,R);
  assert(longest*inNet<=K.CATCH_FIT*2*R+1e-6,`${sp?.id??'firefly'} fits the net (${(longest*inNet).toFixed(2)} m)`);assert(inNet<=fly+1e-9&&fly<=world+1e-9,'never grows');
  assert(longest*fly<=K.STAGE_BUG_MAX+1e-6,`${sp?.id??'firefly'}: a believable size on the stage`);worst=Math.max(worst,longest*inNet/(2*R));g.dispose();}
 assert(K.catchScale(0,2,R)===2&&K.catchScale(1,.1,R)===.1,'degenerate sizes are safe');
 report.push(`all ${SP.BUG_SPECIES.length} species + the firefly fit the net (≤ ${(worst*100).toFixed(0)} % of the hoop)`);}

// ---- 3. Cameras ----
{const cam=new T.PerspectiveCamera(40,1,.05,200),v=new T.Vector3();let worstShare=0,worstEdge=0,n=0;
 for(const aspect of [390/844,1440/900])for(let yaw=-Math.PI;yaw<Math.PI;yaw+=Math.PI/8){const p={x:10,y:4,z:-3},fx=Math.sin(yaw),fz=Math.cos(yaw),rx=-fz,rz=fx;
  const bug={x:p.x+fx*1.45+rx*.2,y:p.y+1.05,z:p.z+fz*1.45+rz*.2},fit=K.stageFit(p,yaw,bug),s=K.stageShot(p,yaw,aspect,fit);
  cam.fov=s.fov;cam.aspect=aspect;cam.position.set(s.eye.x,s.eye.y,s.eye.z);cam.lookAt(s.target.x,s.target.y,s.target.z);cam.updateMatrixWorld(true);cam.updateProjectionMatrix();
  for(const q of fit){v.set(q.x,q.y,q.z).project(cam);assert(Math.abs(v.x)<=.95&&Math.abs(v.y)<=.95&&v.z<1,`in frame (aspect ${aspect.toFixed(2)}, yaw ${yaw.toFixed(2)})`);worstEdge=Math.max(worstEdge,Math.abs(v.x),Math.abs(v.y));}
  const feet=v.set(p.x,p.y,p.z).project(cam).y,headY=v.set(p.x,p.y+1.5,p.z).project(cam).y,share=(headY-feet)/2;worstShare=Math.max(worstShare,share);
  assert(share<=.5,`the character fills at most half the screen height (${(share*100).toFixed(0)} %)`);
  assert(s.eye.y>p.y+.8,'from a little above');
  // The face is not behind the net: the line from the eye to the head passes clear of the raised hoop and of the presented hoop.
  const head=new T.Vector3(p.x,p.y+1.45,p.z),eye=new T.Vector3(s.eye.x,s.eye.y,s.eye.z),seg=new T.Line3(eye,head),c=new T.Vector3();
  for(const h of [{x:p.x+rx*.6+fx*.38,y:p.y+2.45,z:p.z+rz*.6+fz*.38},{x:p.x+rx*.37+fx*1.43,y:p.y+1.4,z:p.z+rz*.37+fz*1.43}]){seg.closestPointToPoint(new T.Vector3(h.x,h.y,h.z),true,c);
   assert(c.distanceTo(new T.Vector3(h.x,h.y,h.z))>NET.NET_HOOP_RADIUS,'the hoop never covers the face');}
  n++;}
 // The push-in: along the follow camera's own line of sight to the head (already clear), never under the ground.
 const floor=(x,z)=>Math.sin(x*.3)*2+Math.cos(z*.2)*1.5;let worstOff=0;
 for(let i=0;i<40;i++){const a=i*.7,head={x:i,y:floor(i,0)+1.35,z:0},from={x:i+Math.sin(a)*14,y:head.y+(i%5)*2-2,z:Math.cos(a)*14};const s=K.pushInShot(from,head,floor);
  assert(s.eye.y>=floor(s.eye.x,s.eye.z)+.9-1e-9,'the push-in eye is above the ground');
  const dx=from.x-head.x,dz=from.z-head.z,ex=s.eye.x-head.x,ez=s.eye.z-head.z;const off=Math.abs(dx*ez-dz*ex)/(Math.hypot(dx,dz)||1);
  assert(off<1e-6,'horizontally on the follow camera\'s line of sight (it can only rise over the ground)');worstOff=Math.max(worstOff,off);
  assert(Math.hypot(s.eye.x-head.x,s.eye.z-head.z)<=Math.hypot(from.x-head.x,from.z-head.z)+1e-9,'and closer than the follow camera');}
 report.push(`stage shot: ${n} angles, phone + desktop, all in frame (edge ${worstEdge.toFixed(2)}), character ≤ ${(worstShare*100).toFixed(0)} % tall; push-in on the line of sight`);}

// ---- 4. The real rig in the show pose ----
{const rig=G('player').createPlayer('you','home',true,true),net=NET.createBugNet(x=>x,false),{DEFAULT_BEAN_LOOK}=G('beanLook');
 rig.setBeanLook({...DEFAULT_BEAN_LOOK,build:'regular',headwear:'none'},{kind:'kit',shirt:'#edb957',shirt2:'#fff4cd',shorts:'#26453e',socks:'#edb957',boots:'#27342f',number:10});
 const L=new T.Vector3(),Rr=new T.Vector3(),o={x:0,y:0,z:0},dd={x:0,y:0,z:0},hc={x:0,y:0,z:0},bag={x:0,y:0,z:0},head=rig.root.getObjectByName('player-head'),hv=new T.Vector3();
 const lineDist=p=>{const vx=p.x-o.x,vy=p.y-o.y,vz=p.z-o.z,t=vx*dd.x+vy*dd.y+vz*dd.z;return Math.hypot(vx-t*dd.x,vy-t*dd.y,vz-t*dd.z);};
 let t=0;const pose={kind:'netshow',progress:0,tug:0};
 const frame=(k,hop,dt=1/60)=>{pose.progress=k;pose.tug=hop;t+=dt;rig.update(0,0,dt,t,false,{job:pose,facing:0});rig.root.position.y=0;rig.root.updateMatrixWorld(true);rig.handPositions(L,Rr);net.layout(L,Rr,0,-1,'raise',dt,false);net.poleLine(o,dd);net.hoopCentre(hc);head.getWorldPosition(hv);};
 for(let i=0;i<40;i++)frame(0,0);
 let worst=Math.max(lineDist(L),lineDist(Rr));const present={...hc};assert(present.z>.8&&present.y>.9&&present.y<1.9,`presented: the hoop out in front at about shoulder height (${present.z.toFixed(2)} ahead, ${present.y.toFixed(2)} up)`);
 assert(Math.hypot(hc.x-hv.x,hc.y-hv.y,hc.z-hv.z)>.6,'presented: clear of the face');
 let maxY=0;for(let i=0;i<=30;i++){frame(i/30,Math.sin(i/30*Math.PI));worst=Math.max(worst,lineDist(L),lineDist(Rr));maxY=Math.max(maxY,rig.root.getObjectByName('player-head').getWorldPosition(new T.Vector3()).y);}
 net.close(true);for(let i=0;i<40;i++)frame(1,0);worst=Math.max(worst,lineDist(L),lineDist(Rr));
 assert(worst<.12,`both hands on the pole through the show (worst ${worst.toFixed(3)} m)`);
 assert(hc.y>hv.y+.2,`raised: the hoop above the head (${hc.y.toFixed(2)} vs ${hv.y.toFixed(2)})`);const side=Math.hypot(hc.x-hv.x,hc.z-hv.z);assert(side>.35,`and beside it, not on it (${side.toFixed(2)} m off)`);
 assert(Math.hypot(hc.x-hv.x,hc.y-hv.y,hc.z-hv.z)>NET.NET_HOOP_RADIUS+.15,'clear of the face');assert(maxY>hv.y+.03,'a little hop');
 // The caught bug sits inside the closed bag: the bag point follows the flip (within the bag's reach of the hoop).
 net.bagCentre(bag);const dBag=Math.hypot(bag.x-hc.x,bag.y-hc.y,bag.z-hc.z);assert(dBag>.1&&dBag<NET.NET_HOOP_RADIUS*1.6,`the bug's spot is inside the bag (${dBag.toFixed(2)} m from the hoop)`);
 net.close(false);for(let i=0;i<40;i++)frame(1,0);const open={...bag};net.bagCentre(open);assert(Math.hypot(open.x-bag.x,open.y-bag.y,open.z-bag.z)>.02,'the bag point follows the flip');
 for(const k of [0,.5,1]){const g=JP.netGrip(0,{phase:0,amount:0,sprint:0},false,1,k);for(const [h,sx] of [[g.h0,-.235],[g.h1,.235]])assert(Math.hypot(h[0]-sx,h[1]-1.261,h[2])<.59,'show grip within reach');}
 report.push(`show pose: hands ≤ ${(worst*100).toFixed(1)} cm from the pole, presented ${present.z.toFixed(2)} m ahead at ${present.y.toFixed(2)} m, raised ${hc.y.toFixed(2)} m (head ${hv.y.toFixed(2)}), ${side.toFixed(2)} m to the side`);}

// ---- 4b. Night: the firefly jar on the stage (Oct 21 2026) ----
{const JAR=load('lib/town/jobs/bugJar.ts'),rig=G('player').createPlayer('you','home',true,true),jar=JAR.createBugJar(x=>x),{DEFAULT_BEAN_LOOK}=G('beanLook');
 rig.setBeanLook({...DEFAULT_BEAN_LOOK,build:'regular',headwear:'none'},{kind:'kit',shirt:'#edb957',shirt2:'#fff4cd',shorts:'#26453e',socks:'#edb957',boots:'#27342f',number:10});
 const L=new T.Vector3(),Rr=new T.Vector3(),c={x:0,y:0,z:0},d={x:0,y:0,z:0},mouth={x:0,y:0,z:0},hv=new T.Vector3();let t=0;
 const frame=(pose,mode,st=-1)=>{t+=1/60;rig.update(0,0,1/60,t,false,{job:pose,facing:0});rig.root.updateMatrixWorld(true);rig.handPositions(L,Rr);jar.layout(L,Rr,0,st,mode,1/60,false);jar.poleLine(c,d);jar.hoopCentre(mouth);rig.root.getObjectByName('player-head').getWorldPosition(hv);};
 for(let i=0;i<30;i++)frame({kind:'jarcarry',progress:0,upper:true},'carry');
 // The Cup at the stage's hit: the jar's mouth meets the firefly where jobScene puts it (.72 m ahead, 1.42 m up).
 let best=9;for(let i=0;i<38;i++){const sw=i/60;frame({kind:'jarcup',progress:Math.min(1,sw/.62)},'swing',sw);best=Math.min(best,Math.hypot(mouth.x,mouth.y-1.42,mouth.z-.72));}
 assert(best<.35,`Cup: the mouth sweeps over the firefly's spot (closest ${best.toFixed(2)} m)`);
 jar.close(true);for(let i=0;i<40;i++)frame({kind:'jarshow',progress:Math.min(1,i/30),tug:Math.sin(Math.min(1,i/30)*Math.PI)},'raise');
 assert(jar.flip>.97,'the lid is shut');assert(c.y>hv.y,`raised: the jar held up over the head line (${c.y.toFixed(2)} vs ${hv.y.toFixed(2)})`);
 const inside=jar.bagPoint(.5,{x:0,y:0,z:0});assert(Math.hypot(inside.x-c.x,inside.y-c.y,inside.z-c.z)<JAR.JAR_HEIGHT/2,'the firefly glows inside the jar');
 const sF=K.stageFlightScale(1,W.FIREFLY_SIZE),sC=K.catchScale(1,sF,JAR.JAR_RADIUS);assert(sC<=K.CATCH_FIT*2*JAR.JAR_RADIUS+1e-9,'the firefly fits the jar');
 const js=read('lib/town/jobs/jobScene.ts');assert(/jar\?'jarcup':'netswing'/.test(js)&&/jar\?'jarshow':'netshow'/.test(js)&&/jarTool\(\)\?JAR_RADIUS:NET_HOOP_RADIUS/.test(js),'the stage plays the jar at night');
 report.push(`night jar: the Cup's mouth passes ${best.toFixed(2)} m from the firefly, lid shut, jar raised to ${c.y.toFixed(2)} m (head ${hv.y.toFixed(2)})`);}

// ---- 5. The stage scene ----
{for(const [look,sp] of [['day',SP.BUG_SPECIES[0]],['night',null]]){const st=CS.createCatchStage({at:{x:5,y:2,z:5},look,species:sp});let tex=0,draws=0;
  st.scene.traverse(o=>{const m=o.material;if(m)for(const k of ['map','alphaMap','emissiveMap','normalMap'])if(m[k])tex++;if((o.isMesh||o.isPoints)&&o.visible&&!(o.isInstancedMesh&&o.count===0))draws++;});
  assert.equal(tex,0,'no textures');assert(draws<=6,`${look}: ${draws} draws for the stage itself`);
  st.setBug(5,3,6,0,0,0,.4,{amp:.5,base:.2,open:1,legAmp:.02});st.burst(5,3,6);for(let i=0;i<70;i++)st.update(1/60,false);assert.equal(st.draws,look==='night'?5:4,'the burst ends and stops drawing');
  st.dispose();assert.equal(st.scene.children.length,0,'disposed clean');}
 const src=read('lib/graphics/catchStage.ts');const update=src.slice(src.indexOf('update(dt:number'),src.indexOf('/** The name label'));assert(!/new T\./.test(update),'no per-frame allocation in the stage update');
 const js=read('lib/town/jobs/jobScene.ts'),frameSrc=js.slice(js.indexOf('function stageFrame'),js.indexOf('function skipStage'));assert(!/new T\.|\{\.\.\.|\[\.\.\./.test(frameSrc),'no per-frame allocation in stageFrame');
 assert(/if\(jobs\.staging\)\{[^}]*jobs\.stageFrame/.test(read('components/Town.tsx')),'Town draws the stage instead of the island');
 assert(/reducedMotion\|\|cs\)return false/.test(js),'reduced motion: no stage');
 report.push('stage: ≤ 6 draws of its own, no textures, disposed clean, no per-frame allocation');}

// ---- 6. One UI thing at a time ----
{let combos=0;for(const card of [false,true])for(const payday of [false,true])for(const toast of [false,true]){const s=UI.pickSurface({card,payday,toast});combos++;
  const want={card,payday,toast},shown=['card','payday','toast'].filter(k=>k===s);assert(shown.length<=1,'at most one surface');
  if(card)assert.equal(s,'card','the story card first');else if(payday)assert.equal(s,'payday','then payday');else if(toast)assert.equal(s,'toast');else assert.equal(s,null);void want;}
 assert(UI.bugBookCoinNote('New in the Bug book: Captain Monarch')&&!UI.bugBookCoinNote('You passed a quiz'),'the new-species coin note is folded into the card');
 assert.equal(UI.initialPill(false),'tip');assert.equal(UI.initialPill(true),'chip','the pill is one line by default');
 const css=read('app/globals.css');assert(/html\[data-catch-stage\] \.town-app>\*:not\(\.town-scene\):not\(\[data-job-skip\]\):not\(\[data-bug-card\]\)\{visibility:hidden/.test(css),'the HUD hides during the catch (only the stage, the card and Tap to skip)');
 const ij=read('components/IslandJobs.tsx');assert(/bugCard&&surface==='card'/.test(ij)&&/payday&&surface==='payday'/.test(ij)&&/surface==='toast'/.test(ij),'IslandJobs renders the picked surface only');
 assert(/merge:'bug-note',ms:BUG_NOTE_MS/.test(ij),'notes are one short toast');
 report.push(`one surface at a time over ${combos} combinations; HUD hidden during the catch; notes as a ${UI.BUG_NOTE_MS/1000} s toast`);}

console.log('PASS bug catch stage:\n - '+report.join('\n - '));
