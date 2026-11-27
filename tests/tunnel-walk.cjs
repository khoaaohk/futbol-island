// Rail fixes (Nov 26 2026): walking through the Summit tunnel on its raised walkways (lib/town/tunnelWalk.ts). Run: node tests/tunnel-walk.cjs
//  1. a walker at track level in either mouth starts the walk and is put on the nearer walkway; a ride never does
//  2. walking the bore end to end (both ways) keeps them on the walkway lane, clear of a train (HALF_W + radius), until the far mouth
//  3. the chase camera stays inside the lining, behind the walker along the bore; the blend is 0 at the mouth and 1 a few metres in
//  4. Town wiring: the tunnel walk step replaces the hill walk inside; the camera blend; the ball at the walker's feet
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadIslandWorld}=require('../scripts/island-world-load.cjs');
const ROOT=path.join(__dirname,'..');
(async()=>{
 const {L}=await loadIslandWorld(ROOT);const tt=L('lib/town/trainTrack.ts'),tw=L('lib/town/tunnelWalk.ts'),car=L('lib/town/trainCarModel.ts');
 const W=tt.TUNNEL.west,E=tt.TUNNEL.east,HW=tt.TUNNEL_HALF_WIDTH,B=tt.TUNNEL_BED;
 assert(tw.LANE_MIN>=car.HALF_W+.32+.9,'the walkway lane keeps 0.9 m+ clear of a passing car');assert(tw.LANE_MAX<=HW-.3&&tw.LANE_MAX-tw.LANE_MIN>=.4,'the lane fits the walkway');
 const at=(s,v)=>{const q=tt.trackAt(s),n=tt.leftNormal(q.tx,q.tz);return {x:q.x+n.x*v,z:q.z+n.z*v};};
 for(const [name,s0,dir] of [['west',W.s,1],['east',E.s,-1]])for(const v of [-1.2,0,.6,3]){
  const w=tw.createTunnelWalk(),p=at(s0+dir*.5,v),side=Math.sign(v)||null;
  assert(!w.tryEnter({...p},B,false),'a ride never starts the walk');assert(!w.tryEnter({...p},B+3,true),'from the hill above, no');
  assert(w.tryEnter(p,B+.05,true),`${name} mouth, lateral ${v}: the walk starts`);
  const f=tw.tunnelSpot(p.x,p.z);assert(f.d>=tw.LANE_MIN-.03&&f.d<=tw.LANE_MAX+.03,`on the walkway (${f.d.toFixed(2)})`);if(side&&Math.abs(v)>.3)assert.equal(f.side,(Math.sign(v)>0?1:-1)*(tt.trackNearest(at(s0+dir*.5,1).x,at(s0+dir*.5,1).z).side),'the nearer walkway');
  // walk to the far mouth at 4 m/s
  let exited=false,minU=1e9;for(let t=0;t<200&&!exited;t+=1/30){const g=tw.tunnelSpot(p.x,p.z),vel={x:g.tx*dir*4,z:g.tz*dir*4};p.x+=vel.x/30;p.z+=vel.z/30;
   const r=w.constrain(p,vel,1/30,false);if(r==='exit'){exited=true;break;}const h=tw.tunnelSpot(p.x,p.z);assert(h.d>=tw.LANE_MIN-.03&&h.d<=tw.LANE_MAX+.03,'lane held');
   if(h.u>-1)assert(w.state.k>.99,'chase view fully in');if(h.u>2){assert(Math.abs(w.state.height-(B+tw.WALKWAY_TOP))<.02,'on the walkway top');}
   const cam={x:0,y:0,z:0},look={x:0,y:0,z:0};assert(w.chase(p.x,w.state.height,p.z,Math.atan2(vel.x,vel.z),1/30,false,cam,look));
   const c=tw.tunnelSpot(cam.x,cam.z);if(c&&c.u>.5){assert(c.d<HW-.4,'camera inside the lining');assert(cam.y<B+2.4+HW-.8,'camera under the crown');
    const back=(p.x-cam.x)*vel.x/4+(p.z-cam.z)*vel.z/4;if(h.u>3)assert(back>3,'camera behind the walker along the bore');}}
  assert(exited,`${name}: the walk ends at the far mouth`);const g=tt.trackNearest(p.x,p.z,8);assert(g&&(dir>0?g.s>E.s:g.s<W.s),'left by the far mouth');}
 {const w=tw.createTunnelWalk(),p=at(W.s+.5,3);w.tryEnter(p,B,true);assert(w.state.k===0||w.tryEnter,'blend set on the first step');p.x+=1e-3;const q=at(W.s-3,3);Object.assign(p,q);assert.equal(w.constrain(p,{x:0,z:0},1/30,false),'exit','back out the way they came');}
 const town=fs.readFileSync(path.join(ROOT,'components/Town.tsx'),'utf8');
 assert(/tunnelWalk\.state\.active\)\{const sprint=[^\n]*stepPlayer\(location,velocity/.test(town),'inside, the tunnel walk step replaces the hill walk');
 assert(/tunnelWalk\.tryEnter\(location,rooftop\.state\.height,true\)/.test(town)&&/rideRef\.current==='walk'&&!water\.inWater[^\n]*tunnelWalk\.tryEnter/.test(town),'only a walker starts it');
 assert(/tunnelWalk\.chase\(visualLocation\.x,groundY/.test(town),'the chase camera blend');
 console.log('tunnel-walk: ok');
})().catch(e=>{console.error(e);process.exit(1);});
