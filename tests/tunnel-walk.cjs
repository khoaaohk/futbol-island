// Walking and riding through the Summit tunnel (lib/town/tunnelWalk.ts). Run: node tests/tunnel-walk.cjs
// Rail fixes (Nov 26 2026) + Tunnel ride + track + train bump (Nov 27 2026):
//  1. a walker or a ground ride at track level in either mouth starts it (the jetpack never; nor from the hill above); anywhere across
//     the bore floor, feet / tyres at the floor's height (sleepers, a hump over each rail, ballast, gutter, walkway), inside the walls
//  2. end to end both ways, on the walkway and on the track: kept inside the bore until the far mouth
//  3. the chase camera: behind along the bore, inside the bore cylinder; turning 360 degrees in place at several spots keeps it inside
//  4. the train: warn() finds the coming train; hit() only on the track as the front passes (never on the walkway, never a train behind);
//     the bump ends with control back, the player on the walkway lane clear of a car; reduced motion: a slide, no squash
//  5. only walking and riding: the jetpack is refused inside (and allowed outside); flying into a mouth is blocked
//  6. Town wiring
//  7. tunnel controls (Nov 27 2026): input mapped to the chase camera (8-way), island speeds, the camera's end changes once per
//     reverse (a swing inside the bore, never a tap), zoomed-out chase, leaving hands back without a jump, flat ring
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadIslandWorld}=require('../scripts/island-world-load.cjs');
const ROOT=path.join(__dirname,'..');
(async()=>{
 const {L}=await loadIslandWorld(ROOT);const tt=L('lib/town/trainTrack.ts'),tw=L('lib/town/tunnelWalk.ts'),car=L('lib/town/trainCarModel.ts'),sch=L('lib/town/trainSchedule.ts');
 const W=tt.TUNNEL.west,E=tt.TUNNEL.east,HW=tt.TUNNEL_HALF_WIDTH,B=tt.TUNNEL_BED;
 assert(tw.LANE_MIN>=car.HALF_W+.32+.9,'the walkway lane keeps 0.9 m+ clear of a passing car');assert(tw.TRACK_HIT>=car.HALF_W+.3,'the bump zone covers the car');
 const at=(s,v)=>{const q=tt.trackAt(s),n=tt.leftNormal(q.tx,q.tz);return {x:q.x+n.x*v,z:q.z+n.z*v};};
 // floor heights (m over the bed): sleepers, a rail hump to its top, the walkway
 assert.equal(tw.floorAt(0),.22);assert(Math.abs(tw.floorAt(.68)-.36)<1e-9,'on a rail: its top');assert.equal(tw.floorAt(3),tw.WALKWAY_TOP);assert(tw.floorAt(2.2)<0,'the gutter');
 for(let d=0;d<3.3;d+=.01)assert(Math.abs(tw.floorAt(d+.01)-tw.floorAt(d))<.06||Math.abs(d+.01-tw.WALKWAY_KERB)<.011,`no jump in the floor at ${d.toFixed(2)} (the kerb is eased by the step)`);
 for(const [name,s0,dir] of [['west',W.s,1],['east',E.s,-1]])for(const [mode,v] of [['walk',-1.2],['walk',0],['walk',.68],['walk',3],['bike',0],['scooter',-3],['moped',1.6]]){
  const w=tw.createTunnelWalk(),p=at(s0+dir*.5,v);
  assert(!w.tryEnter({...p},B,'jetpack'),'the jetpack never starts it');assert(!w.tryEnter({...p},B+3,mode),'from the hill above, no');
  assert(w.tryEnter(p,B+.05,mode),`${name} mouth, ${mode} at ${v}: it starts`);
  let exited=false,lastH=w.state.height;for(let t=0;t<200&&!exited;t+=1/30){const g=tw.tunnelSpot(p.x,p.z),sp=mode==='walk'?4:9,vel={x:g.tx*dir*sp,z:g.tz*dir*sp};p.x+=vel.x/30;p.z+=vel.z/30;
   const r=w.constrain(p,vel,1/30,false,mode);if(r==='exit'){exited=true;break;}const h=tw.tunnelSpot(p.x,p.z);
   assert(h.d<=(mode==='walk'?tw.LANE_MAX:tw.RIDE_LANE_MAX)+.02,'inside the walls');assert(Math.abs(h.d-Math.abs(v))<.05||Math.abs(v)>tw.RIDE_LANE_MAX,`${mode} keeps its line across the bore (${h.d.toFixed(2)})`);
   if(h.u>2){assert(Math.abs(w.state.height-(B+tw.floorAt(h.d)))<.03,`${mode} at ${v}: on the floor (${(w.state.height-B).toFixed(3)} vs ${tw.floorAt(h.d)})`);assert(Math.abs(w.state.height-lastH)<.02,'no jitter');}
   lastH=w.state.height;if(h.u>-1)assert(w.state.k>.99,'chase view fully in');
   const cam={x:0,y:0,z:0},look={x:0,y:0,z:0};assert(w.chase(p.x,w.state.height,p.z,Math.atan2(vel.x,vel.z),1/30,false,cam,look));
   const c=tw.tunnelSpot(cam.x,cam.z);if(c&&c.u>.5){assert(c.d<=HW-tw.CAM_PAD+.01,'camera inside the lining');assert(cam.y<B+2.4+Math.sqrt((HW-tw.CAM_PAD)**2-c.d**2)+.01,'camera under the arch');
    const back=(p.x-cam.x)*vel.x/sp+(p.z-cam.z)*vel.z/sp;if(h.u>6)assert(back>3,'camera behind along the bore');}}
  assert(exited,`${name} ${mode}: it ends at the far mouth`);const g=tt.trackNearest(p.x,p.z,8);assert(g&&(dir>0?g.s>E.s:g.s<W.s),'left by the far mouth');}
 {const w=tw.createTunnelWalk(),p=at(W.s+.5,3);w.tryEnter(p,B,'walk');Object.assign(p,at(W.s-3,3));assert.equal(w.constrain(p,{x:0,z:0},1/30,false),'exit','back out the way they came');}
 // 3. turning 360 degrees in place: the camera never leaves the bore (owner 156)
 for(const ds of [2,10,40,(E.s-W.s)/2,E.s-W.s-10,E.s-W.s-2])for(const v of [-3,0,1.6,3.1]){const w=tw.createTunnelWalk(),p=at(W.s+ds,v);assert(w.tryEnter(p,B+.2,'walk'));
  const cam={x:0,y:0,z:0},look={x:0,y:0,z:0};for(let i=0;i<=240;i++){const yaw=i/240*Math.PI*4;w.chase(p.x,B+.3,p.z,yaw,1/60,false,cam,look);
   const c=tw.tunnelSpot(cam.x,cam.z,HW+12);assert(c,'camera near the line');if(c.u>-1){assert(c.d<=HW-tw.CAM_PAD+.01,`turning at ${ds.toFixed(0)}, ${v}: camera inside the bore (${c.d.toFixed(2)})`);
    assert(cam.y<=B+2.4+Math.sqrt(Math.max(0,(HW-tw.CAM_PAD)**2-c.d**2))+.01&&cam.y>=B+.59,'camera between the floor and the arch');}}}
 {const w=tw.createTunnelWalk(),c={x:0,y:0,z:0};const p=at(W.s+30,HW+3);Object.assign(c,p,{y:B+9});assert(w.clampCam(c));const g=tw.tunnelSpot(c.x,c.z);assert(g.d<=HW-tw.CAM_PAD+.01&&c.y<B+2.4+HW,'a camera out in the hill is pulled into the bore');}
 // a train near: the camera leans over to the walker's walkway (beside the car, never in it) and stays in the bore
 for(const side of [1,-1]){const w=tw.createTunnelWalk(),p=at(W.s+50,0);w.tryEnter(p,B+.2,'walk');w.state.trainSide=side;const cam={x:0,y:0,z:0},look={x:0,y:0,z:0};
  for(let i=0;i<120;i++)w.chase(p.x,B+.22,p.z,0,1/60,false,cam,look);const c=tw.tunnelSpot(cam.x,cam.z);const n=tt.leftNormal(c.tx,c.tz),v=(cam.x-c.cx)*n.x+(cam.z-c.cz)*n.z;
  assert(v*side>car.HALF_W+.4&&c.d<=HW-tw.CAM_PAD+.01,`leaned to side ${side}: ${v.toFixed(2)}`);}
 // 4. the train
 const LEN=sch.TRAIN_LENGTH,mid=W.s+60;
 {const w=tw.createTunnelWalk(),tr=[{s:mid-30,v:12},{s:mid+50,v:12},{s:mid-200,v:12}];const r=w.warn(tr,mid);assert.equal(r.train,0);assert(Math.abs(r.gap-30)<1e-6&&Math.abs(r.eta-2.5)<1e-6,'the coming train: gap and time');}
 {const w=tw.createTunnelWalk();
  assert.equal(w.hit([{s:mid-2,v:12}],mid,0,LEN),-1,'not before the front arrives');assert.equal(w.hit([{s:mid+.3,v:12}],mid,0,LEN),0,'the front reaches someone on the track');
  assert.equal(w.hit([{s:mid+.3,v:12}],mid,tw.LANE_MIN,LEN),-1,'never on the walkway');assert.equal(w.hit([{s:mid+.3,v:12}],mid,2.1,LEN),-1,'never in the gutter clear of the car');
  assert.equal(w.hit([{s:mid+LEN+1,v:12}],mid,0,LEN),-1,'never once it has passed');assert.equal(w.hit([{s:mid+.3,v:0}],mid,0,LEN),-1,'a stopped train does not bump');}
 for(const reduced of [false,true])for(const v of [-.9,0,.68,1.2]){const w=tw.createTunnelWalk(),p=at(mid,v);w.tryEnter(p,B+.2,'walk');w.constrain(p,{x:0,z:0},1/30,false);
  assert(w.bumpStart(p,reduced));let t=0,res='on',dizzy=false,maxFlat=0,maxRoll=0;
  while(res!=='done'&&t<3){t+=1/60;res=w.bumpStep(1/60,p);if(res==='dizzy')dizzy=true;const ps=w.pose();maxFlat=Math.max(maxFlat,ps.flat);maxRoll=Math.max(maxRoll,Math.abs(ps.roll));
   if(t>(reduced?tw.BUMP.slideR:tw.BUMP.push)){const g=tw.tunnelSpot(p.x,p.z);assert(g.d>=car.HALF_W+.35+.9,'pushed clear of the car');}}
  assert.equal(res,'done','the bump ends');assert(dizzy,'the dizzy beat');assert(t<=(reduced?tw.BUMP.doneR:tw.BUMP.done)+.02,`control back in ${t.toFixed(2)} s`);
  const g=tw.tunnelSpot(p.x,p.z);assert(g.d>=tw.LANE_MIN-.01&&g.d<=tw.LANE_MAX,'on the walkway lane');assert(Math.abs(w.state.height-(B+tw.WALKWAY_TOP))<.01,'on the walkway top');
  assert.equal(w.hit([{s:mid+5,v:12}],g.s,g.d,LEN),-1,'clear of the train after');
  if(reduced)assert(maxFlat===0&&maxRoll===0,'reduced motion: no squash, no tumble');else assert(maxFlat>.99&&maxRoll>6,'squash + a tumble');
  const after=w.constrain(p,{x:0,z:0},1/30,false);assert.equal(after,'in','still walking the tunnel after');}
 // 5. only walking and riding
 for(const m of ['walk','scooter','bike','moped'])assert(tw.tunnelMode(m),m);assert(!tw.tunnelMode('jetpack'),'no flying in the tunnel');
 {const m=at(W.s+.5,0),o=at(W.s-20,0),i=at(W.s+20,0);assert(tw.tunnelBlocksFlight(m.x,m.z,B+3),'flying into the mouth: blocked');assert(tw.tunnelBlocksFlight(i.x,i.z,B+3),'inside: blocked');
  assert(!tw.tunnelBlocksFlight(o.x,o.z,B+3),'out in the cutting: free');assert(!tw.tunnelBlocksFlight(m.x,m.z,B+12),'over the hill: free');}
 // 6. Town wiring
 const town=fs.readFileSync(path.join(ROOT,'components/Town.tsx'),'utf8');
 assert(/tunnelWalk\.state\.active\)\{const bs=tunnelWalk\.bumpStep\(dt,location\)/.test(town)&&/stepPlayer\(location,velocity,\{x:holdStill\?0:mx,z:holdStill\?0:mz,sprint\},dt,\[\],mode\)/.test(town),'inside, the tunnel step (walk or ride) replaces the hill step');
 assert(/tunnelMode\(rideRef\.current\)[^\n]*tunnelWalk\.tryEnter\(location,rooftop\.state\.height,rideRef\.current\)/.test(town),'walkers and ground rides start it');
 assert(/if\(!tunnelMode\(mode\)&&inTunnelRef\.current\)\{fuelStore\.say\(TUNNEL_MODE_NOTE\[0\]/.test(town)&&/inTunnelRef\.current=tunnelWalk\.state\.active\|\|tunnelWalk\.state\.k>0/.test(town),'the jetpack is refused in the tunnel, back on leaving');
 assert(/tunnelBlocksFlight\(location\.x,location\.z,flight\.height\)\)\{location\.x=ox;location\.z=oz/.test(town),'flying into a mouth is blocked');
 assert(/tunnelWalk\.chase\(visualLocation\.x,groundY/.test(town)&&/tunnelWalk\.clampCam\(camera\.position\)/.test(town),'the chase camera, held in the bore before the render');
 assert(/if\(tunnelWalk\.state\.active\)tunnelTrain\(\);else if\(tr\.knock/.test(town)&&/tunnelWalk\.hit\(st,f\.s,f\.d,TRAIN_LENGTH\)>=0&&tunnelWalk\.bumpStart\(location,reduced\)/.test(town),'the bump in the tunnel (not the throw)');
 assert(/Train coming: step aside!/.test(town),'the hint');
 // Follow-ups (Nov 27 2026): the ride button shows flying is off in the bore and the cycle skips the jetpack there; bubbles stay in the
 // low chase view; reduced motion gets a short dim instead of the squash.
 assert(/toggleAttribute\('data-no-fly',inTunnelRef\.current\)/.test(town)&&/className="travel-nofly"/.test(town),'the ride button greys the jetpack in the tunnel');
 assert(/\.filter\(m=>!inTunnelRef\.current\|\|tunnelMode\(m\)\)/.test(town),'the ride cycle skips the jetpack in the tunnel (moped -> walk)');
 const css=fs.readFileSync(path.join(ROOT,'app/globals.css'),'utf8');assert(/\.travel-mode\[data-no-fly\] \.travel-nofly\{display:grid/.test(css)&&/\.tunnel-fade\{/.test(css),'no-fly badge + fade layer styles');
 for(const k of ['bonkBubble.follow(0,pr.x,bubbleY(','emoteBubbles.follow(0,me.x,bubbleY(','kenjiBubble.follow(0,tr.cabX,bubbleY('])assert(town.includes(k),'bubble kept in view: '+k);
 assert.equal(tw.bumpFade(-1),0);assert.equal(tw.bumpFade(tw.BUMP.doneR),0);assert(Math.abs(tw.bumpFade(.2)-tw.BUMP_FADE)<1e-9,'held through the slide');
 assert(tw.bumpFade(.06)>0&&tw.bumpFade(.06)<tw.BUMP_FADE&&tw.bumpFade(.6)>0&&tw.bumpFade(.6)<tw.BUMP_FADE,'eased in and out');
 assert(/bumpFade\(tunnelWalk\.bump\.age\)/.test(town)&&/data-tunnel-fade=""/.test(town),'Town dims the view for a reduced-motion bump');

 // 7. Tunnel controls (Nov 27 2026, owner: "the keyboard arrows are hard to use in the tunnel"; "zoom out more"; "make it easier to go
 // in all directions and go on the track and sides"; "riding in the tunnel is very slow"; "match the other island speeds")
 // Leftovers A2 (owner 214 / 215): walking / riding into the wall at many angles keeps the body >= its radius (0.44 m walking, 0.72 m
 // riding) off the lining; standing beside the walkway's ledge never puts the feet in its face (auto-step onto the walkway)
 {let worst=0;for(const [mode,rad,sp] of [['walk',.44,4],['bike',.72,9]])for(const v0 of [-3,-1,1,3])for(let a=5;a<180;a+=12){const w=tw.createTunnelWalk(),s0=W.s+40,p=at(s0,v0);w.tryEnter(p,B+.3,mode);
   for(let t=0;t<2;t+=1/30){const g=tw.tunnelSpot(p.x,p.z),n=tt.leftNormal(g.tx,g.tz),out=Math.sign(v0),r=a*Math.PI/180,vel={x:(g.tx*Math.cos(r)+n.x*out*Math.sin(r))*sp,z:(g.tz*Math.cos(r)+n.z*out*Math.sin(r))*sp};
    p.x+=vel.x/30;p.z+=vel.z/30;w.constrain(p,vel,1/30,false,mode);const h=tw.tunnelSpot(p.x,p.z);worst=Math.max(worst,h.d+rad-HW);assert(h.d+rad<=HW+.005,`${mode} at ${a} deg: body ${(HW-h.d).toFixed(2)} m off the lining`);}}
  console.log('     body off the lining: worst',worst.toFixed(3));}
 for(let d=1.9;d<=2.6;d+=.02){const w=tw.createTunnelWalk(),p=at(W.s+30,d);w.tryEnter(p,B+.05,'walk');for(let i=0;i<60;i++)w.constrain(p,{x:0,z:0},1/30,false,'walk');
  const up=w.state.height-B>=tw.WALKWAY_TOP-.01;assert(up||d+tw.FOOT_R<=tw.WALKWAY_KERB+1e-6,`standing at ${d.toFixed(2)}: the feet are in the ledge (height ${(w.state.height-B).toFixed(2)})`);}

 {const sim=L('lib/town/simulation.ts'),TM=L('lib/town/travelModes.ts').TRAVEL_MODES,DT=1/60;
  // a Town frame: raw keys (sx right +, sy down +) -> the island's screen mapping -> tunnel steer -> the tunnel step -> the chase camera
  const run=(w,p,v,mode,keys,secs,each)=>{const out={x:0,z:0},cam={x:0,y:0,z:0},look={x:0,y:0,z:0};for(let t=0;t<secs;t+=DT){const [sx,sy,sprint]=keys(t);
   const ix=sx*.857+sy*.515,iz=-sx*.515+sy*.857;w.steer(sx,sy,ix,iz,p.x,p.z,v.x,v.z,DT,out);
   sim.stepPlayer(p,v,{x:out.x,z:out.z,sprint:!!sprint&&mode==='walk'},DT,[],mode);const r=w.constrain(p,v,DT,false,mode);if(r==='exit'){w.approach(p.x,p.z,true);}
   w.chase(p.x,w.state.height,p.z,Math.atan2(v.x,v.z),DT,false,cam,look);w.settle();if(each&&each(t,cam,look,out,r)===false)break;}};
  const lat=(p)=>{const g=tw.tunnelSpot(p.x,p.z,HW+12);return g.d*g.side;},along=(v,s)=>{const q=tt.trackAt(s);return v.x*q.tx+v.z*q.tz;};
  const inBore=(cam,what)=>{const c=tw.tunnelSpot(cam.x,cam.z,HW+12);if(!c||c.u< -.5)return;assert(c.d<=HW-tw.CAM_PAD+.01,`${what}: camera inside the lining (${c.d.toFixed(2)})`);
   assert(cam.y<=B+2.4+Math.sqrt(Math.max(0,(HW-tw.CAM_PAD)**2-c.d**2))+.01&&cam.y>=B+.59,`${what}: camera under the arch`);};
  const UP=()=>[0,-1],DOWN=()=>[0,1],LEFT=()=>[-1,0],RIGHT=()=>[1,0],NONE=()=>[0,0];
  for(const [dir,ds] of [[1,30],[-1,90]]){
   // (a) holding Up walks steadily on along the bore (the way the camera looks), never reversing; the camera end never changes
   const w=tw.createTunnelWalk(),p=at(W.s+ds,1.6),v={x:0,z:0};assert(w.tryEnter(p,B+.2,'walk'));w.constrain(p,v,DT,false);
   const cam={x:0,y:0,z:0},look={x:0,y:0,z:0};const q=tt.trackAt(W.s+ds);w.chase(p.x,B+.2,p.z,Math.atan2(q.tx*dir,q.tz*dir),DT,false,cam,look);assert.equal(w.state.camDir,dir);
   run(w,p,v,'walk',UP,3,(t)=>{const g=tw.tunnelSpot(p.x,p.z);const a=along(v,g.s)*dir;if(t>.6){assert(a>3.5,`Up walks on along the bore (${a.toFixed(2)} m/s)`);}});
   assert.equal(w.state.camFlips,0,'Up never turns the camera');
   // (b) Down walks back toward the camera at once (moving the other way within 0.5 s); kept up, the camera's end changes ONCE, by a
   // swing that stays inside the bore cylinder, done ~1.2 s in; the held Down keeps walking the same way all through (no flip-flop)
   let backAt=-1,flipAt=-1;const flips0=w.state.camFlips;
   run(w,p,v,'walk',DOWN,3,(t,cam)=>{const g=tw.tunnelSpot(p.x,p.z),a=along(v,g.s)*dir;if(backAt<0&&a< -1)backAt=t;if(backAt>=0&&t>backAt+.2)assert(a< -3,`held Down keeps walking back (${a.toFixed(2)})`);
    if(flipAt<0&&w.state.camFlips>flips0)flipAt=t;inBore(cam,'the swing');});
   assert(backAt>=0&&backAt<.5,`Down: walking back within 0.5 s (${backAt.toFixed(2)})`);assert.equal(w.state.camFlips-flips0,1,'the camera end changes exactly once');
   assert(flipAt>.55&&flipAt<1,`the camera turns after ~0.6 s of walking back (${flipAt.toFixed(2)})`);assert(w.state.camA===(w.state.camDir>0?0:1),'the swing finished');
   // let go: Up is now on the new way (the camera's), still no flip
   run(w,p,v,'walk',NONE,.3);run(w,p,v,'walk',UP,1,(t)=>{const g=tw.tunnelSpot(p.x,p.z);if(t>.4)assert(along(v,g.s)*dir< -3,'after the turn, Up walks on the new way');});
   // (c) 3 s of mixed short inputs (taps under REVERSE_HOLD): the camera never changes end
   {const f0=w.state.camFlips,seq=[[UP,.4],[DOWN,.25],[LEFT,.3],[DOWN,.3],[RIGHT,.4],[NONE,.2],[DOWN,.35],[UP,.3],[DOWN,.2],[LEFT,.3]];let tot=0;
    for(const [k,d] of seq){run(w,p,v,'walk',k,d,(t,cam)=>inBore(cam,'mixed'));tot+=d;}assert(tot>=2.99);assert.equal(w.state.camFlips,f0,'taps never turn the camera (no flip-flop)');}
  }
  // (d) Left / Right go across the bore (walkway <-> track bed <-> other walkway), both ways, walking and on a bike; the camera keeps
  // its end; across means across (under 10% along)
  for(const mode of ['walk','bike']){const w=tw.createTunnelWalk(),p=at(W.s+60,3),v={x:0,z:0};assert(w.tryEnter(p,B+.3,mode));const q=tt.trackAt(W.s+60);
   const cam={x:0,y:0,z:0},look={x:0,y:0,z:0};w.chase(p.x,B+.3,p.z,Math.atan2(q.tx,q.tz),DT,false,cam,look);const max=mode==='walk'?tw.LANE_MAX:tw.RIDE_LANE_MAX;
   // camera looks +s: screen right = the bore's right = -left normal: Right from +3 (left walkway) crosses to the right walkway
   run(w,p,v,mode,NONE,.4);// the controls blend in (0.3 s) from where the walk began
   let minV=9;run(w,p,v,mode,RIGHT,mode==='walk'?2.4:1,(t,cam)=>{minV=Math.min(minV,lat(p));const g=tw.tunnelSpot(p.x,p.z),sp=Math.hypot(v.x,v.z);if(sp>1)assert(Math.abs(along(v,g.s))<.1*sp+.05,`${mode}: across, not along (${along(v,g.s).toFixed(2)} of ${sp.toFixed(2)} at ${lat(p).toFixed(2)} t ${t.toFixed(2)})`);inBore(cam,'across');});
   assert(minV<-max+.05,`${mode}: Right crosses the track to the other walkway (${minV.toFixed(2)})`);
   let maxV=-9;run(w,p,v,mode,LEFT,mode==='walk'?2.4:1,()=>{maxV=Math.max(maxV,lat(p));});assert(maxV>max-.05,`${mode}: Left crosses back (${maxV.toFixed(2)})`);
   assert(Math.abs(w.state.height-(B+tw.WALKWAY_TOP))<.02,`${mode}: up on the walkway again`);assert.equal(w.state.camFlips,0,`${mode}: across never turns the camera`);}
  // (e) the island's own speeds in the bore (no tunnel multipliers): walk, sprint and every ride reach TRAVEL_MODES' top speed (sprint
  // 6 m/s) within 3 s of holding Up, on the track bed and on the walkway
  for(const [mode,sprint,top] of [['walk',false,TM.walk.maxSpeed],['walk',true,6],['scooter',false,TM.scooter.maxSpeed],['bike',false,TM.bike.maxSpeed],['moped',false,TM.moped.maxSpeed]])for(const v0 of [0,2.9]){
   const w=tw.createTunnelWalk(),p=at(W.s+3,v0),v={x:0,z:0};assert(w.tryEnter(p,B+.2,mode));let best=0;run(w,p,v,mode,()=>[0,-1,sprint],3,(t,c,l,o,r)=>{if(r==='exit')return false;best=Math.max(best,Math.hypot(v.x,v.z));});
   assert(best>top*.97&&best<top*1.01,`${mode}${sprint?' sprint':''} at ${v0}: island speed in the bore (${best.toFixed(2)} vs ${top})`);}
  // (f) the zoomed-out chase: ≥ 7.5 m back from the walker along the bore (mid-bore, not mid-swing), ~4 m up, inside the cylinder
  for(const v0 of [-3,0,1.6,3.1]){const w=tw.createTunnelWalk(),p=at(W.s+80,v0),cam={x:0,y:0,z:0},look={x:0,y:0,z:0};w.tryEnter(p,B+.2,'walk');w.constrain(p,{x:0,z:0},DT,false);
   const q=tt.trackAt(W.s+80);w.chase(p.x,w.state.height,p.z,Math.atan2(q.tx,q.tz),DT,false,cam,look);inBore(cam,'zoomed');
   const back=(p.x-cam.x)*q.tx+(p.z-cam.z)*q.tz;assert(back>=tw.CHASE.back-.3&&tw.CHASE.back>=8,`camera ${back.toFixed(2)} m back`);assert(cam.y-w.state.height>3.5,'camera well up');assert(look.y<cam.y-2,'looking down a little');}
  // (g) leaving by a mouth hands back to the island mapping over CTL_BLEND s with no jump: the move turns at most ~12 degrees a frame
  {const w=tw.createTunnelWalk(),p=at(W.s+6,0),v={x:0,z:0};w.tryEnter(p,B+.2,'walk');const q=tt.trackAt(W.s+6);const cam={x:0,y:0,z:0},look={x:0,y:0,z:0};w.chase(p.x,B+.2,p.z,Math.atan2(-q.tx,-q.tz),DT,false,cam,look);
   let prev=null,maxTurn=0,offAt=-1;run(w,p,v,'walk',UP,5,(t,c,l,o)=>{const a=Math.atan2(o.x,o.z);if(prev!==null){const d=Math.abs(Math.atan2(Math.sin(a-prev),Math.cos(a-prev)));maxTurn=Math.max(maxTurn,d);}prev=a;if(offAt<0&&w.state.ctlW===0)offAt=t;});
   assert(offAt>0,'out of the cutting: the island controls are back');assert(maxTurn<.21,`no jump in direction on leaving (${(maxTurn*180/Math.PI).toFixed(1)} deg / frame)`);}
  // (h) reduced motion: the camera's end change is a cut under a short dim
  {const w=tw.createTunnelWalk(),p=at(W.s+50,0),cam={x:0,y:0,z:0},look={x:0,y:0,z:0};w.tryEnter(p,B+.2,'walk');const q=tt.trackAt(W.s+50);w.chase(p.x,B+.2,p.z,Math.atan2(q.tx,q.tz),DT,true,cam,look);
   w.state.camDir=-1;w.chase(p.x,B+.2,p.z,0,DT,true,cam,look);assert.equal(w.state.camA,1,'reduced: a cut');assert(tw.cutFadeOpacity(w.state.cutFade)>0,'under a dim');inBore(cam,'reduced');
   for(let i=0;i<30;i++)w.chase(p.x,B+.2,p.z,0,DT,true,cam,look);assert.equal(w.state.cutFade,0,'the dim ends');}
  // (i) the ring lies flat over the highest floor under it (owner 169), and the ball rests at the walker's smoothed height
  for(const d of [0,.68,1.3,2.2,2.45,3])assert(tw.floorTopNear(d,.54)>=tw.floorAt(d)&&tw.floorTopNear(d,.54)<=.36+1e-9,'ring over the floor');
  assert(/const ringTun=tunnelWalk\.state\.active\?tunnelSpot\(visualLocation\.x,visualLocation\.z\):null;if\(ringTun\)\{ring\.rotation\.set\(-Math\.PI\/2,0,0\)/.test(town),'Town: the ring flat in the bore');
  assert(/walkBall\.syncDribble\(dribblePlayer,airBallFrom,tunnelWalk\.state\.active\?tunnelFloorSample:rooftop\.surface\)/.test(town)&&/const ballFloor=\(x:number,z:number\)=>nearSummit\(x,z\)&&\(inBore\(x,walkBall\.state\.y,z\)\|\|tunnelWalk\.state\.active&&tunnelSpot\(x,z\)\)\?tunnelFloorSample\(x,z\)/.test(town),'Town: the ball reads the bore floor, not the hill (owner 169: still ball when standing)');
  assert(/airborne:tunnelWalk\.state\.active/.test(town),'Town: the water step never wades the walker in the bore (the ball parked / recalled every 0.5 s)');
  assert(/tunnelWalk\.steer\(sx,sy,ix,iz,location\.x,location\.z,velocity\.x,velocity\.z,dt,tunMove\);ix=tunMove\.x;iz=tunMove\.z;/.test(town),'Town: the tunnel controls steer the step');
  assert(/stepPlayer\(location,velocity,\{x:holdStill\?0:mx,z:holdStill\?0:mz,sprint\},dt,\[\],mode\)/.test(town),'Town: the tunnel step is the island step (no speed scale)');
 }
 console.log('tunnel-walk: ok');
})().catch(e=>{console.error(e);process.exit(1);});
