// Bug squad net hold (bug-polish, Oct 20 2026; docs/island-jobs.md §15 "Bug polish"): the real town rig (bean, articulated hands,
// the worn backpack) carrying the net through the walk cycle, and riding with it on the backpack's side socket.
//  1. walk / sprint / idle / turn / Net down: both mittens on the pole every frame (< 0.1 m; the arms are solved onto it), no NaN,
//     the hoop clear of the face, the pole's tail outside the body and the pack, the pose sways with the steps;
//  2. eased blends: carry → sneak → wind-up / swing → catch → carry, no hand jumps (no snapping);
//  3. riding scooter / bike / moped: the pole rests on `backpack-side-right`, tilted back by BACKPACK_RIDE_OFFSETS, the hoop behind
//     and above the rider, nothing inside the rider, the pack or any ride part; the jetpack morph hides the net (source wiring).
// usage: node tests/bug-net-hold.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.resolve(__dirname,'..'),req=require('node:module').createRequire(base+'/package.json'),ts=req('typescript'),cache=new Map(),storage=new Map();
function load(file){if(cache.has(file))return cache.get(file);const mod={exports:{}};cache.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,console,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},window:{addEventListener(){},removeEventListener(){},dispatchEvent:()=>true},require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):req(id)});return mod.exports;}
const T=req('three'),G=p=>load(base+'/lib/graphics/'+p+'.ts');G('characterStyle').setCharacterStyle('bean');
const {createPlayer,NET_BLEND_S}=G('player'),{createVehicle}=G('vehicle'),{DEFAULT_BEAN_LOOK}=G('beanLook'),BP=G('backpack'),JP=G('jobPoses');
const NET=load(base+'/lib/town/jobs/bugNet.ts'),{DEFAULT_CUSTOMIZATION:D}=load(base+'/lib/town/customization.ts');
const read=f=>fs.readFileSync(path.join(base,f),'utf8');
const rig=createPlayer('you','home',true,true),vehicle=createVehicle(),pack=BP.createBackpack(),net=NET.createBugNet(x=>x,false);
rig.setBeanLook({...DEFAULT_BEAN_LOOK,build:'regular',headwear:'none'},{kind:'kit',shirt:'#edb957',shirt2:'#fff4cd',shorts:'#26453e',socks:'#edb957',boots:'#27342f',number:10});
rig.update(0,0,1/60,0,false,{});assert(pack.attach(rig.root));vehicle.setBackpackJet(true);
const L=new T.Vector3(),R=new T.Vector3(),ML=new T.Vector3(),MR=new T.Vector3(),o={x:0,y:0,z:0},dd={x:0,y:0,z:0},v=new T.Vector3(),hc={x:0,y:0,z:0};
const body=rig.root.getObjectByName('bean-body'),head=rig.root.getObjectByName('player-head'),arms=['left','right'].map(s=>rig.root.getObjectByName(s+'-elbow'));
body.geometry.computeBoundingBox();const bb=body.geometry.boundingBox,bc=bb.getCenter(new T.Vector3()),bs=bb.getSize(new T.Vector3()).multiplyScalar(.5*.95),inv=new T.Matrix4();
const lineDist=p=>{const vx=p.x-o.x,vy=p.y-o.y,vz=p.z-o.z,t=vx*dd.x+vy*dd.y+vz*dd.z;return Math.hypot(vx-t*dd.x,vy-t*dd.y,vz-t*dd.z);};
/** Inside the bean body (an ellipsoid inscribed in its bounding box, 5 % in), in the body's own frame. */
const inBody=(p,k=1)=>{inv.copy(body.matrixWorld).invert();v.copy(p).applyMatrix4(inv).sub(bc);return (v.x/bs.x)**2+(v.y/bs.y)**2+(v.z/bs.z)**2<k*k;};
const inPack=p=>{inv.copy(pack.mesh.matrixWorld).invert();v.copy(p).applyMatrix4(inv);const {w,h,d}=BP.PACK_SIZE;return Math.abs(v.x)<w/2&&Math.abs(v.y)<h/2&&Math.abs(v.z)<d/2;};
const finiteRig=()=>{let ok=true;rig.root.traverse(n=>{for(const q of [n.quaternion.x,n.quaternion.y,n.quaternion.z,n.quaternion.w,n.position.x,n.position.y,n.position.z])if(!Number.isFinite(q))ok=false;});return ok;};
const P=(x,y,z)=>new T.Vector3(x,y,z);
let t=0,x=0,z=0,yawWant=0;const report=[];
/** One frame: the rig moves (speed m/s along yawWant), the job pose is held, the net is laid out in the hands. */
function frame(job,mode,speed,dt=1/60,swingT=-1){
 x+=Math.sin(yawWant)*speed*dt;z+=Math.cos(yawWant)*speed*dt;t+=dt;
 rig.update(x,z,dt,t,false,{travelMode:'walk',job,...(speed>3?{runIntensity:1}:{})});rig.root.position.set(x,0,z);rig.root.scale.setScalar(1.12);rig.root.updateMatrixWorld(true);
 pack.update(dt,'walk',D.jetpack,true,1,speed,0,false);rig.root.updateMatrixWorld(true);
 rig.handPositions(L,R);arms[0].localToWorld(ML.set(0,-.285,0));arms[1].localToWorld(MR.set(0,-.285,0));
 net.layout(L,R,rig.root.rotation.y,swingT,mode,dt,false);net.poleLine(o,dd);net.hoopCentre(hc);}
const carry={kind:'netcarry',progress:0,upper:true},sneak={kind:'netsneak',progress:0,upper:true};

// ---- 1. Walk, sprint, idle, turns, Net down ----
for(const [label,job,mode,speed,turn] of [['idle',carry,'carry',0,0],['walk',carry,'carry',1.6,0],['sprint',carry,'carry',6,0],['turning walk',carry,'carry',1.6,1.6],['Net down',sneak,'low',.9,0]]){
 let worst=0,worstM=0,minFace=9,tail=0,tailPack=0,n=0;const ys=[];
 for(let i=0;i<150;i++){yawWant+=turn/60;frame(job,mode,speed);if(i<40)continue;n++;
  assert(finiteRig(),label+': no NaN in the rig');
  worst=Math.max(worst,lineDist(L),lineDist(R));worstM=Math.max(worstM,lineDist(ML),lineDist(MR));
  head.getWorldPosition(v);minFace=Math.min(minFace,Math.hypot(hc.x-v.x,hc.y-v.y,hc.z-v.z));ys.push(L.y);
  // The pole from its butt to the lower hand: never inside the body or the pack.
  for(let k=0;k<=8;k++){const s=k/8*.3,p=P(o.x+dd.x*s,o.y+dd.y*s,o.z+dd.z*s);if(inBody(p))tail++;if(inPack(p))tailPack++;}}
 assert(worst<.1,`${label}: hand joints on the pole (worst ${worst.toFixed(3)} m)`);assert(worstM<.1,`${label}: mittens on the pole (worst ${worstM.toFixed(3)} m)`);
 assert(minFace>.6,`${label}: hoop clear of the face (${minFace.toFixed(2)} m)`);
 assert.equal(tail,0,label+': pole tail outside the body');
 if(speed>1)assert(Math.max(...ys)-Math.min(...ys)>.01,label+': the hold sways with the steps');
 report.push(`${label}: hands ≤ ${(Math.max(worst,worstM)*100).toFixed(1)} cm from the pole, hoop ${minFace.toFixed(2)} m from the head`);}
// Carry: hoop up front and high; Net down: hoop forward and low over the grass.
{yawWant=0;for(let i=0;i<40;i++)frame(carry,'carry',1.6);const f=P(Math.sin(rig.root.rotation.y),0,Math.cos(rig.root.rotation.y));head.getWorldPosition(v);
 const fwd=(hc.x-x)*f.x+(hc.z-z)*f.z;const hy=hc.y;assert(fwd>.3&&hc.y>v.y,`carry: hoop up front (${fwd.toFixed(2)} m ahead) and above the head line (${hc.y.toFixed(2)} vs ${v.y.toFixed(2)})`);
 for(let i=0;i<40;i++)frame(sneak,'low',.6);const fwd2=(hc.x-x)*f.x+(hc.z-z)*f.z;assert(fwd2>1&&hc.y<1,`Net down: hoop ahead (${fwd2.toFixed(2)} m) and low (${hc.y.toFixed(2)} m)`);
 report.push(`carry hoop ${fwd.toFixed(2)} m ahead at ${hy.toFixed(2)} m; Net down hoop ${fwd2.toFixed(2)} m ahead at ${hc.y.toFixed(2)} m`);}
// The pure grip: every hand target within reach of its shoulder (nothing stretches), at every gait / sneak mix.
for(const k of [0,1])for(const a of [0,.5,1])for(const sp of [0,1])for(let ph=0;ph<6.3;ph+=.7){const g=JP.netGrip(k,{phase:ph,amount:a,sprint:sp},false);
 for(const [h,sx] of [[g.h0,-.235],[g.h1,.235]]){const d=Math.hypot(h[0]-sx,h[1]-1.261,h[2]);assert(d<.59,`grip target within reach (≤ 2.5 cm past full reach: the solve stops at reach and the pole follows the hands) (${d.toFixed(3)} k${k} a${a} sp${sp} ph${ph.toFixed(1)} sx${sx})`);}
 assert(g.h0.concat(g.h1,g.dir).every(Number.isFinite),'grip finite');}

// ---- 2. Eased blends: no snapping between carry, sneak, wind-up, swing, catch and back ----
{assert(NET_BLEND_S>=.15&&NET_BLEND_S<=.25,'blend .15-.25 s');let prevL=null,prevR=null,jump=0,where='';
 const seq=[['carry',30,()=>[carry,'carry',-1]],['sneak',30,()=>[sneak,'low',-1]],['carry again',30,()=>[carry,'carry',-1]]];
 let sw=0;seq.push(['swing',37,()=>{sw+=1/60;return [{kind:'netswing',progress:Math.min(1,sw/.62)},'swing',sw];}]);
 let ct=0;seq.push(['catch',54,()=>{ct+=1/60;return [{kind:'netcatch',progress:Math.min(1,ct/.9)},'raise',-1];}]);seq.push(['back to carry',40,()=>[carry,'carry',-1]]);
 for(const [label,n,f] of seq)for(let i=0;i<n;i++){const [job,mode,st]=f();frame(job,mode,0,1/60,st);
  // At each switch (the first .1 s of a new pose) the hands must glide, not jump (the swing's own fast sweep comes later).
  if(prevL&&i<6){const j=Math.max(L.distanceTo(prevL),R.distanceTo(prevR));if(j>jump){jump=j;where=label+'@'+i;}}prevL=L.clone();prevR=R.clone();}
 assert(jump<.16,`no hand snaps between poses (a snap from the raised catch to the carry would be ~0.9 m in one frame) (largest per-frame move ${jump.toFixed(3)} m at ${where})`);
 report.push(`blends: largest per-frame hand move ${(jump*100).toFixed(1)} cm (${where})`);}

// ---- 3. Riding: on the backpack's side socket ----
const sock=rig.root.getObjectByName(BP.BACKPACK_SOCKETS.sideRight);assert(sock,'side socket on the rig');
function insideRide(pts){const hits=[],inv2=new T.Matrix4(),l=new T.Vector3();
 vehicle.root.traverseVisible(m=>{if(!m.isMesh)return;if(!m.geometry.boundingBox)m.geometry.computeBoundingBox();const b=m.geometry.boundingBox;inv2.copy(m.matrixWorld).invert();
  for(const p of pts){l.copy(p).applyMatrix4(inv2);if(b.containsPoint(l)){hits.push(m.name||m.parent.name||m.geometry.type);break;}}});return hits;}
for(const ride of ['scooter','bike','moped']){
 for(let i=0;i<40;i++){rig.update(0,0,1/60,i/60,false,{travelMode:ride});rig.root.position.set(0,0,0);rig.root.scale.setScalar(1.12);
  vehicle.setCustomization(D);vehicle.update(ride,0,0,0,1/60,6);vehicle.root.scale.setScalar(1.12);vehicle.syncArmor(rig.root,true);pack.update(1/60,ride,D.jetpack,true,1,6,0,false);}
 rig.root.updateMatrixWorld(true);vehicle.root.updateMatrixWorld(true);
 const tilt=BP.BACKPACK_RIDE_OFFSETS[ride].poleTilt;net.pack(sock.matrixWorld,rig.root.rotation.y,tilt,1/60,false);net.group.updateMatrixWorld(true);net.poleLine(o,dd);net.hoopCentre(hc);
 const sp=sock.getWorldPosition(new T.Vector3()),strap=P(o.x+dd.x*NET.NET_PACK.strap,o.y+dd.y*NET.NET_PACK.strap,o.z+dd.z*NET.NET_PACK.strap);
 assert(strap.distanceTo(sp)<NET.NET_PACK.out+.01,ride+': the pole rests on backpack-side-right');
 const f=P(0,0,1).transformDirection(rig.root.matrixWorld);f.y=0;f.normalize();const top=body.localToWorld(bc.clone().setY(bc.y+bs.y/.95)),mid=body.localToWorld(bc.clone());
 const ang=Math.acos(Math.max(-1,Math.min(1,dd.y)));assert(Math.abs(ang-tilt)<.02,`${ride}: tilted back ${tilt} rad from vertical (${ang.toFixed(2)})`);
 assert((dd.x*f.x+dd.z*f.z)<0,ride+': pointing back');const back=-((hc.x-mid.x)*f.x+(hc.z-mid.z)*f.z);
 assert(back>.3&&hc.y>top.y,`${ride}: hoop behind (${back.toFixed(2)} m) and above the head (${(hc.y-top.y).toFixed(2)} m)`);
 // Pole and hoop ring points: not inside the rider, the pack or any ride part (handlebars, deck, seat, body).
 const pts=[];for(let k=0;k<=20;k++){const s=k/20*NET.NET_POLE;pts.push(P(o.x+dd.x*s,o.y+dd.y*s,o.z+dd.z*s));}
 const ring=net.group.matrixWorld;for(let k=0;k<24;k++){const a=k/24*Math.PI*2;pts.push(P(0,NET.NET_POLE+NET.NET_HOOP_RADIUS+Math.cos(a)*NET.NET_HOOP_RADIUS,Math.sin(a)*NET.NET_HOOP_RADIUS).applyMatrix4(ring));}
 assert.equal(pts.filter(p=>inBody(p)).length,0,ride+': nothing inside the rider');assert.equal(pts.filter(inPack).length,0,ride+': nothing inside the pack');
 const hits=insideRide(pts);assert.equal(hits.length,0,ride+': nothing inside the ride: '+hits.join(','));
 assert.equal(pts.filter(p=>inBody(p,1.12)).length,0,ride+': clear of the rider by a margin (body + 12 %)');
 report.push(`${ride}: on the side socket, tilt ${ang.toFixed(2)} rad, hoop ${back.toFixed(2)} m behind / ${(hc.y-top.y).toFixed(2)} m over the head`);}
// Wiring: Town hands the jobs the side socket and the morph; holdProps hides the net while the pack opens into the jetpack.
{const town=read('components/Town.tsx'),js=read('lib/town/jobs/jobScene.ts');
 assert(/jobs\.setBackpack\(\{socket:backpack\.sockets\.sideRight,morph:\(\)=>backpack\.morph\}\)/.test(town),'Town passes backpack-side-right and the morph');
 assert(/packPort\.morph\(\)>NET_HIDE_MORPH/.test(js)&&/net\.pack\(s\.matrixWorld/.test(js),'holdProps: socket carry and jetpack hide');
 assert(!/NET_PACK\.(back|side|up|tilt)/.test(read('lib/town/jobs/bugNet.ts')),'the placeholder offsets are gone');}
// ---- 4. The firefly jar at Night (Oct 21 2026): both hands on the jar's sides through the walk, Jar low, the Cup, the hold-up and
// the stage's show; the jar between the mittens, clear of the face; every grip target within reach; riding on the side socket ----
{const JAR=load(base+'/lib/town/jobs/bugJar.ts'),jar=JAR.createBugJar(x=>x),jc={x:0,y:0,z:0},jd={x:0,y:0,z:0};
 const jframe=(job,mode,speed,swingT=-1)=>{x+=Math.sin(yawWant)*speed/60;z+=Math.cos(yawWant)*speed/60;t+=1/60;
  rig.update(x,z,1/60,t,false,{travelMode:'walk',job,...(speed>3?{runIntensity:1}:{})});rig.root.position.set(x,0,z);rig.root.scale.setScalar(1.12);rig.root.updateMatrixWorld(true);
  pack.update(1/60,'walk',D.jetpack,true,1,speed,0,false);rig.root.updateMatrixWorld(true);rig.handPositions(L,R);arms[0].localToWorld(ML.set(0,-.285,0));arms[1].localToWorld(MR.set(0,-.285,0));
  jar.layout(L,R,rig.root.rotation.y,swingT,mode,1/60,false);jar.poleLine(jc,jd);};
 let cup=0,ct=0,sh=0;
 for(const [label,n,f] of [['jar carry',120,()=>[{kind:'jarcarry',progress:0,upper:true},'carry',1.6,-1]],['jar idle',60,()=>[{kind:'jarcarry',progress:0,upper:true},'carry',0,-1]],
  ['jar sprint',60,()=>[{kind:'jarcarry',progress:0,upper:true},'carry',6,-1]],['Jar low',60,()=>[{kind:'jarsneak',progress:0,upper:true},'low',.9,-1]],
  ['Cup',38,()=>{cup+=1/60;return [{kind:'jarcup',progress:Math.min(1,cup/.62)},'swing',0,cup];}],['jar held up',54,()=>{ct+=1/60;return [{kind:'jarcatch',progress:Math.min(1,ct/.9)},'raise',0,-1];}],
  ['stage show',60,()=>{sh+=1/60;return [{kind:'jarshow',progress:Math.min(1,sh/.6),tug:0},'raise',0,-1];}]]){
  let worst=0,minFace=9,peak=-9;for(let i=0;i<n;i++){const [job,mode,speed,st]=f();jframe(job,mode,speed,st);if(i<14)continue;assert(finiteRig(),label+': no NaN');
   // Each mitten sits at the jar's side: about the jar's radius + a mitten from its axis, one either side.
   for(const M of [ML,MR]){const vx=M.x-jc.x,vy=M.y-jc.y,vz=M.z-jc.z,along=vx*jd.x+vy*jd.y+vz*jd.z,rad=Math.hypot(vx-along*jd.x,vy-along*jd.y,vz-along*jd.z);worst=Math.max(worst,Math.abs(rad-(JAR.JAR_RADIUS+.04)),Math.abs(along)-JAR.JAR_HEIGHT/2);}
   const sideL=(ML.x-jc.x)*Math.cos(rig.root.rotation.y)-(ML.z-jc.z)*Math.sin(rig.root.rotation.y),sideR=(MR.x-jc.x)*Math.cos(rig.root.rotation.y)-(MR.z-jc.z)*Math.sin(rig.root.rotation.y);
   assert(sideL*sideR<0,label+': one mitten either side of the jar');head.getWorldPosition(v);minFace=Math.min(minFace,Math.hypot(jc.x-v.x,jc.y-v.y,jc.z-v.z));peak=Math.max(peak,jc.y);}
  assert(worst<.09,`${label}: both mittens on the jar's sides (worst ${worst.toFixed(3)} m off)`);assert(minFace>.2,`${label}: jar clear of the face (${minFace.toFixed(2)} m)`);
  report.push(`${label}: mittens ≤ ${(worst*100).toFixed(1)} cm off the jar's sides, ${minFace.toFixed(2)} m from the head, jar up to ${peak.toFixed(2)} m`);}
 // The Cup sweeps the jar up over the firefly (head height) and tips its mouth forward / down; the lid snaps shut and reopens.
 {cup=0;let top=0,tip=0;for(let i=0;i<38;i++){cup+=1/60;jframe({kind:'jarcup',progress:Math.min(1,cup/.62)},'swing',0,cup);top=Math.max(top,jc.y);const f=Math.sin(rig.root.rotation.y)*jd.x+Math.cos(rig.root.rotation.y)*jd.z;tip=Math.max(tip,f);}
  assert(top>1.4,`Cup: the jar sweeps up to head height (${top.toFixed(2)} m)`);assert(tip>.7,`Cup: the mouth tips forward over the firefly (${tip.toFixed(2)})`);
  jar.close(true);for(let i=0;i<20;i++)jframe({kind:'jarcarry',progress:0,upper:true},'carry',0);assert(jar.flip>.97,'the lid snaps shut ('+jar.flip.toFixed(2)+')');
  jar.close(false);for(let i=0;i<30;i++)jframe({kind:'jarcarry',progress:0,upper:true},'carry',0);assert(jar.flip<.05,'and opens again');
  jar.setFill(1);jframe({kind:'jarcarry',progress:0,upper:true},'carry',0);assert(jar.group.getObjectByName('job-jar-glow').visible,'a full jar glows (sprite, no light)');jar.setFill(0);
  let lights=0;jar.group.traverse(o=>{if(o.isLight)lights++;});assert.equal(lights,0,'no lights in the jar');
  report.push(`Cup: jar up to ${top.toFixed(2)} m, mouth tipped ${tip.toFixed(2)} forward; lid snaps shut / reopens; glows when full`);}
 for(const k of [0,1])for(const a of [0,1])for(const sp of [0,1])for(const [cw,ck,kw,kk,hw,hk] of [[0,0,0,0,0,0],[1,.26,0,0,0,0],[1,.48,0,0,0,0],[1,.68,0,0,0,0],[0,0,1,.45,0,0],[0,0,0,0,1,0],[0,0,0,0,1,1]]){
  const g=JP.netGrip(k,{phase:1,amount:a,sprint:sp},false,hw,hk,{w:1,cupW:cw,cupK:ck,catchW:kw,catchK:kk});
  for(const [h,sx] of [[g.h0,-.235],[g.h1,.235]]){const d=Math.hypot(h[0]-sx,h[1]-1.261,h[2]);assert(d<.59,`jar grip target within reach (${d.toFixed(3)})`);}
  assert(Math.abs(g.h1[0]-g.h0[0]-JP.JAR_HAND_GAP)<1e-6,'hands the jar width apart');}
 // Riding: the jar hangs upright on backpack-side-right, lid shut, outside the rider and the pack.
 for(const ride of ['scooter','bike','moped']){for(let i=0;i<30;i++){rig.update(0,0,1/60,i/60,false,{travelMode:ride});rig.root.position.set(0,0,0);rig.root.scale.setScalar(1.12);
   vehicle.update(ride,0,0,0,1/60,6);vehicle.root.scale.setScalar(1.12);vehicle.syncArmor(rig.root,true);pack.update(1/60,ride,D.jetpack,true,1,6,0,false);}
  rig.root.updateMatrixWorld(true);jar.close(false);for(let i=0;i<20;i++)jar.pack(sock.matrixWorld,rig.root.rotation.y,0,1/60,false);jar.poleLine(jc,jd);const sp=sock.getWorldPosition(new T.Vector3());
  assert(Math.hypot(jc.x-sp.x,jc.y-sp.y,jc.z-sp.z)<.2,ride+': the jar hangs on the side socket');assert(jd.y>.99,ride+': upright');assert(jar.flip>.97,ride+': lid shut');
  const pts=[];for(let k=0;k<12;k++){const a=k/12*Math.PI*2;for(const yy of [-.1,0,.1])pts.push(P(jc.x+Math.cos(a)*JAR.JAR_RADIUS,jc.y+yy,jc.z+Math.sin(a)*JAR.JAR_RADIUS));}
  assert.equal(pts.filter(p=>inBody(p)).length,0,ride+': the jar is not inside the rider');assert.equal(pts.filter(inPack).length,0,ride+': nor inside the pack');}
 report.push('riding: the jar hangs upright on the side socket, lid shut, clear of the rider and the pack');}
console.log('bug net hold ok\n  '+report.join('\n  '));
