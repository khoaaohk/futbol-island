// Coral Cay causeway traffic (Sep 29 2026): cars drive the winding causeway, go round the one-way roundabout (anticlockwise
// on the map) and come back, always on the carriageway, clear of the rails, lamps, arch and island. Uses the real island
// streets (the same list as traffic-junctions.cjs) plus lib/town/cayTraffic.ts.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript'),T=require('three');
const src=fs.readFileSync(path.join(__dirname,'traffic-junctions.cjs'),'utf8');
const fixture=vm.runInNewContext(`(${src.match(/function fixture\(roads\)\{[\s\S]*?\n(?=\/\/ Authored)/)[0].trim()})`,{require,path,fs,vm,ts,T,Proxy,Map,Math,module:{},exports:{},process,__dirname});
const island=vm.runInNewContext(src.match(/const island=(\[[^\n]*?\}\]);/)[1]);
const load=f=>{const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports:m.exports,module:m,Math});return m.exports;};
const cay=load('lib/town/coralCay.ts'),R=cay.ROUNDABOUT;
const {traffic:a}=fixture(island);
assert(a.cayTraffic,'the causeway and roundabout joined the road graph');assert.equal(a.cars.length,11,'nine cars and two pickups');
assert.equal(a.cars.filter(c=>c.group.position.x>500).length,2,'two cars start at Coral Cay (roundabout arm and boulevard), so the causeway has traffic from the start');
assert(a.cars.every(c=>!a.cayTraffic.forbidden.has(c.from+':'+c.to)),'no car starts the wrong way round the ring');
const player={x:900,y:40,z:900},inter={vx:0,vz:0,reduced:true,onCrash(){}};
const onRoad=(x,z)=>{const r=Math.hypot(x-R.x,z-R.z);if(r<R.roadOuter+1)return r>R.roadInner-.4;if(x>R.x&&Math.abs(z-cay.CAUSEWAY.z)<4.3&&x<cay.CAY_BOULEVARD.x1+3)return true;return cay.causewayFrame(x,z,true).dist<4.3;};
const trips=a.cars.map(()=>({east:false,back:false})),angle=a.cars.map(()=>null);let offRoad=0,samples=0,wrongWay=0,ringMoves=0;
for(let tick=0;tick<20*3600;tick++){a.update(1/60,player,inter);
 if(tick%10)continue;
 a.cars.forEach((c,i)=>{const {x,z}=c.group.position;if(x<228)return;samples++;
  // Body corners too: a car never reaches past the kerb (lamps at 6.65 m, rails at 6.2 m, arch piers at 7.4 m).
  const yaw=c.group.rotation.y,fx=Math.sin(yaw),fz=Math.cos(yaw);for(const [f,s] of [[1.8,.95],[1.8,-.95],[-1.8,.95],[-1.8,-.95],[0,0]]){const px=x+fx*f+fz*s,pz=z+fz*f-fx*s;if(!onRoad(px,pz))offRoad++;}
  if(x>R.x-R.roadOuter)trips[i].east=true;if(trips[i].east&&x<232)trips[i].back=true;
  const r=Math.hypot(x-R.x,z-R.z);if(r<R.roadOuter&&r>R.roadInner&&Math.abs(z-R.z)>4){// circulating lane, away from the two arms (entries/exits cross radially)
  const ang=Math.atan2(z-R.z,x-R.x);if(angle[i]!==null){const d=Math.atan2(Math.sin(ang-angle[i]),Math.cos(ang-angle[i]));if(Math.abs(d)>1e-4){ringMoves++;if(d>0)wrongWay++;}}angle[i]=ang;}else angle[i]=null;});
}
console.log(JSON.stringify({samples,offRoad,ringMoves,wrongWay,roundTrips:trips.filter(t=>t.back).length}));
assert.equal(offRoad,0,'every car body stays on the causeway carriageway, the ring or the boulevard');
assert(ringMoves>50&&wrongWay===0,'cars circulate the roundabout anticlockwise (map view) only');
assert(trips.filter(t=>t.back).length>=2,'cars drive out to Coral Cay, turn at the roundabout and come back');
// A driven pickup left near the roundabout rejoins the road (resumeRoaming) without going the wrong way round the ring
// (code review finding 7): every ring node, both pickups (car 8 used to always take the backward link).
{const {traffic:b}=fixture(island);let rejoins=0;
 for(const id of b.cayTraffic.ring)for(const index of [7,8]){const car=b.cars[index],n=b.nodes[id];
  car.group.position.set(n.x,0,n.z);car.freeDriven=true;car.rejoin=null;car.rejoinAttempted=false;car.rejoinSearch=null;
  for(let t=0;t<60*40&&car.freeDriven;t++)b.update(1/60,player,inter);
  assert(!car.freeDriven,`pickup ${index} rejoined the road from ring node ${id}`);rejoins++;
  assert(!b.cayTraffic.forbidden.has(car.from+':'+car.to),`pickup ${index} rejoined at node ${car.from} heading ${car.to}: the right way round`);}
 assert(rejoins>=20);b.dispose();}
a.dispose();
console.log('PASS causeway traffic: two cay starters, one-way rejoin, on the carriageway, anticlockwise round the roundabout, round trips to Coral Cay');
