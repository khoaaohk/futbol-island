// The ball in the Summit tunnel (lib/town/tunnelBall.ts + the island ball lib/town/walkBall.ts). Run: node tests/tunnel-ball.cjs
// Tunnel ball (Nov 27 2026, owner: "kicking the ball while walking in the tunnel doesn't work. the ball should be bouncing all around
// with the correct physics"):
//  1. a kick along the bore travels and slows like the same kick on a flat road (the same walkBall, the same ISLAND_SHOT constants)
//  2. kicks into the wall / arch over many seeded angles and speeds: always inside the lining, never under the floor
//  3. a lob hits the crown and drops (the vertical speed flips at the arch, then it lands)
//  4. at rest (at the feet) on sleepers, a rail, ballast, the gutter, the walkway: < 2 cm over 2 s; dribbling keeps it at the feet
//  5. the kerb: a low ball rolling at the walkway bounces off it; the ball can leave by a portal (no lining past the sleeve)
//  6. a train reaching a free ball on the track knocks it clear (ahead of the nose / off the track bed), never left inside the car
//  7. Town wiring
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadIslandWorld}=require('../scripts/island-world-load.cjs');
const ROOT=path.join(__dirname,'..');
(async()=>{
 const {L}=await loadIslandWorld(ROOT);const tt=L('lib/town/trainTrack.ts'),tw=L('lib/town/tunnelWalk.ts'),tb=L('lib/town/tunnelBall.ts'),wb=L('lib/town/walkBall.ts');
 const W=tt.TUNNEL.west,E=tt.TUNNEL.east,HW=tt.TUNNEL_HALF_WIDTH,B=tt.TUNNEL_BED,S=wb.ISLAND_SHOT,R=HW-tb.BALL_R,SP=tw.SPRING;
 assert.equal(tb.BALL_R,S.radius);assert.equal(tb.LINING_E,S.wallBounce,'the lining bounces like the island walls');
 const at=(s,v)=>{const q=tt.trackAt(s),n=tt.leftNormal(q.tx,q.tz);return {x:q.x+n.x*v,z:q.z+n.z*v,tx:q.tx,tz:q.tz};};
 const floor=(x,z)=>{const g=tb.boreFloor(x,z);return g===g?g:B;};// out of the mouths: the cutting's bed
 const env={floor,blocked:(x,z,y)=>tb.inBore(x,y,z)?tb.boreStep(x,z,y):false,bound:(a,b)=>tb.boreSweep(a,b),impact(){},strike(){}};
 const flat={floor:()=>B,blocked:()=>false,impact(){},strike(){}};
 let seed=20261127;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 /** inside the lining (ball centre), over the floor */
 const check=(b,msg)=>{const f=tw.tunnelSpot(b.x,b.z,HW+3);if(!f||f.u<0)return;const h=b.y-B;
  if(h<=SP)assert(f.d<=R+.02,`${msg}: inside the wall (d ${f.d.toFixed(3)})`);else assert(Math.hypot(f.d,h-SP)<=R+.02,`${msg}: under the arch (${Math.hypot(f.d,h-SP).toFixed(3)})`);
  assert(b.y>=B+tw.floorAt(Math.min(f.d,HW))+tb.BALL_R-.02,`${msg}: never in the floor (${(b.y-B).toFixed(3)} at d ${f.d.toFixed(2)})`);};
 // 1. a kick along the bore vs the same kick on a flat road (straight stretch: compare the first 0.5 s of flight)
 {const s0=W.s+12,p0=at(s0,0),yaw=Math.atan2(p0.tx,p0.tz);
  const run=(e,p)=>{const b=wb.createWalkBall(),pl={x:p.x,y:B+tw.floorAt(0),z:p.z,yaw};b.reset(pl);b.shoot(pl,yaw,0);const out=[];
   for(let i=0;i<60;i++){b.update(1/60,pl,e);if(b.state.mode==='shot')out.push({x:b.state.x,z:b.state.z,v:Math.hypot(b.state.vx,b.state.vz)});}return out;};
  const a=run(env,p0),c=run(flat,p0);assert(a.length>20&&c.length>20,'both fly');
  const n=Math.min(a.length,c.length,25),da=Math.hypot(a[n-1].x-a[0].x,a[n-1].z-a[0].z),dc=Math.hypot(c[n-1].x-c[0].x,c[n-1].z-c[0].z);
  assert(Math.abs(da-dc)/dc<.08,`travels like on a flat road (${da.toFixed(2)} vs ${dc.toFixed(2)} m)`);
  assert(Math.abs(a[n-1].v-c[n-1].v)/c[n-1].v<.08,`slows like on a flat road (${a[n-1].v.toFixed(2)} vs ${c[n-1].v.toFixed(2)} m/s)`);
  assert(a[0].v>30,'a real kick ('+a[0].v.toFixed(1)+' m/s)');}
 // 2. kicks into the wall / arch: seeded angles and speeds from across the bore, the whole flight inside the lining
 {let hits=0;for(let k=0;k<400;k++){const s=W.s+4+rnd()*(E.s-W.s-8),v=(rnd()*2-1)*2.2,p=at(s,v),b=wb.createWalkBall(),pl={x:p.x,y:B+tw.floorAt(Math.abs(v)),z:p.z,yaw:0};
   b.reset(pl);b.state.y=pl.y+.4;const n=tt.leftNormal(p.tx,p.tz),a=rnd()*Math.PI*2,sp=4+rnd()*44,up=rnd()*18,side=Math.cos(a),along=Math.sin(a);
   b.knock((n.x*side+p.tx*along)*sp,up,(n.z*side+p.tz*along)*sp);let hit=false;const e={...env,impact(){hit=true;}};
   for(let i=0;i<150&&b.state.mode==='shot';i++){b.update(1/60,pl,e);check(b.state,`kick ${k} (sp ${sp.toFixed(1)} up ${up.toFixed(1)}) frame ${i}`);}if(hit)hits++;}
  assert(hits>300,'most kicks ricochet ('+hits+'/400)');}
 // straight into the wall: it comes back inside at the island's wall bounce
 {const p=at(W.s+30,0),n=tt.leftNormal(p.tx,p.tz),b=wb.createWalkBall(),pl={x:p.x,y:B+.22,z:p.z,yaw:0};b.reset(pl);b.state.y=B+1.2;b.knock(n.x*20,0,n.z*20);let back=null;
  for(let i=0;i<60;i++){b.update(1/120,pl,env);const vn=b.state.vx*n.x+b.state.vz*n.z;if(vn<0&&back===null)back=-vn;check(b.state,'into the wall');}
  assert(back!==null&&Math.abs(back/20-S.wallBounce)<.12,`bounces back off the wall at ~${S.wallBounce} (${back&&(back/20).toFixed(2)})`);}
 // 3. a lob hits the crown and drops
 {const p=at(W.s+40,.3),b=wb.createWalkBall(),pl={x:p.x,y:B+.22,z:p.z,yaw:0};b.reset(pl);b.state.y=B+.6;b.knock(p.tx*3,16,p.tz*3);let top=0,crown=false,landed=false,prevVy=16;
  const e={...env,impact(){if(b.state.y>B+SP)crown=true;}};
  for(let i=0;i<240;i++){b.update(1/60,pl,e);check(b.state,'lob');top=Math.max(top,b.state.y);if(crown&&b.state.vy<0&&prevVy>0)assert(b.state.y>B+SP,'turns down at the arch');prevVy=b.state.vy;if(crown&&b.state.y<B+.7)landed=true;if(b.state.mode!=='shot')break;}
  assert(crown,'the lob hits the crown');assert(top<=B+SP+R+.02,'never through the crown ('+(top-B).toFixed(2)+')');assert(landed,'and drops back to the floor');}
 // 4. at rest at the feet on every floor across the bore, and dribbling
 for(const v of [0,.68,1.6,2.25,3.1]){const p=at(W.s+50,v),b=wb.createWalkBall(),pl={x:p.x,y:B+tw.floorAt(v),z:p.z,yaw:Math.atan2(p.tx,p.tz)};b.reset(pl);
  for(let i=0;i<30;i++)b.update(1/60,pl,env);const x0=b.state.x,y0=b.state.y,z0=b.state.z;let m=0;
  for(let i=0;i<120;i++){b.update(1/60,pl,env);m=Math.max(m,Math.hypot(b.state.x-x0,b.state.y-y0,b.state.z-z0));}
  assert(m<.02,`at rest at d ${v}: moved ${(m*100).toFixed(1)} cm`);assert(b.state.y>=B+tw.floorAt(v)-.01,'on the floor');}
 {const b=wb.createWalkBall();let s=W.s+10;const p0=at(s,.4),pl={x:p0.x,y:B+.22,z:p0.z,yaw:Math.atan2(p0.tx,p0.tz)};b.reset(pl);
  for(let i=0;i<240;i++){s+=3.7/60;const p=at(s,.4);Object.assign(pl,{x:p.x,z:p.z,yaw:Math.atan2(p.tx,p.tz),y:B+tw.floorAt(.4)});b.update(1/60,pl,{...env,moving:true});
   assert.equal(b.state.mode,'attached');assert(Math.hypot(b.state.x-pl.x,b.state.z-pl.z)<1.1,'dribble stays at the feet');check(b.state,'dribble');}}
 // 5. the kerb: a low roll toward the walkway bounces off it; out of a portal
 {const p=at(W.s+60,1),n=tt.leftNormal(p.tx,p.tz),b=wb.createWalkBall(),pl={x:p.x,y:B+.22,z:p.z,yaw:0};b.reset(pl);b.state.y=B+.12+.2;b.knock(n.x*5,0,n.z*5);let maxD=0;
  for(let i=0;i<60&&b.state.mode==='shot';i++){b.update(1/60,pl,env);const f=tw.tunnelSpot(b.state.x,b.state.z);maxD=Math.max(maxD,f.d);}
  assert(maxD<tw.WALKWAY_KERB,'a low roll does not climb the kerb ('+maxD.toFixed(2)+')');}
 for(const [name,s0,dir] of [['west',W.s+6,-1],['east',E.s-6,1]]){const p=at(s0,.2),b=wb.createWalkBall(),pl={x:p.x,y:B+.22,z:p.z,yaw:0};b.reset(pl);b.state.y=B+.5;b.knock(p.tx*dir*16,2,p.tz*dir*16);let out=false;
  for(let i=0;i<120&&b.state.mode==='shot';i++){b.update(1/60,pl,env);check(b.state,name+' portal');const f=tw.tunnelSpot(b.state.x,b.state.z,HW+3);if(!f||f.u<tb.SLEEVE_U-.5)out=true;}
  assert(out,`the ball leaves by the ${name} portal`);}
 // 6. a train knock: the front reaches a free ball on the track
 {const C=L('lib/town/trainCarModel.ts');for(const v of [-1,0,.7,1.3])for(const tv of [6,12,18]){const s0=W.s+80,p=at(s0,v),b=wb.createWalkBall(),pl={x:p.x+30,y:B+.22,z:p.z,yaw:0};b.reset(pl);b.state.x=p.x;b.state.z=p.z;b.state.y=B+.42;b.knock(0,0,0);
  const len=60,train={s:s0-.3,v:tv};let knocked=false;
  for(let i=0;i<180;i++){train.s+=tv/60;{const k=tb.trainKnock([train],b.state.x,b.state.y,b.state.z,len);if(k){b.knock(k.vx,k.vy,k.vz);knocked=true;}}/* Town tests every frame: a ball that bounces back off the wall into a passing car is knocked out again */b.update(1/60,pl,env);if(b.state.mode!=='shot')break;check(b.state,'knocked');
   const f=tw.tunnelSpot(b.state.x,b.state.z,HW+3);if(!f)break;const behindNose=train.s-f.s;if(behindNose>0&&behindNose<len)assert(f.d>C.HALF_W||b.state.y>B+4.6,`never inside a car (d ${f.d.toFixed(2)}, v ${v}, train ${tv})`);}
  assert(knocked,'the train knocks the ball ('+v+', '+tv+')');}
  const p=at(W.s+80,3.1);assert.equal(tb.trainKnock([{s:W.s+80,v:12}],p.x,B+.5,p.z,60),null,'a ball on the walkway is clear of the train');}
 // 7. Town wiring
 {const t=fs.readFileSync(path.join(ROOT,'components/Town.tsx'),'utf8');
  assert(/bound:\(from,to\)=>nearSummit\(from\.x,from\.z\)\?boreSweep\(from,to\)/.test(t),'the lining is the ball\'s bound');
  assert(/inBore\(x,walkBall\.state\.y,z\)/.test(t),'the ball\'s floor in the bore');assert(/inBore\(x,y,z\)\)return boreStep/.test(t),'the kerb, and the hill is not a solid in the bore');
  assert(/trainKnock\(world\.trainRun\.states/.test(t),'the train knock');assert(/tunnelWalk\.state\.active&&!walkingBall\)ball\.position\.y/.test(t),'the walked ball is drawn at its own height');}
 console.log('tunnel-ball: all passed');
})().catch(e=>{console.error(e);process.exit(1);});
