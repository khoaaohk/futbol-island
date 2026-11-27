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
 console.log('tunnel-walk: ok');
})().catch(e=>{console.error(e);process.exit(1);});
