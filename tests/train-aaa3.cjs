// Island Line AAA audit 3 + the live-site audit fixes (Nov 25 2026). Run: node tests/train-aaa3.cjs
//  1. the ride camera keeps out of each station's name board and line board (live audit #3: phone Seat view at Summit Isle)
const assert=require('node:assert/strict');
const {L,read}=require('./lib/tsLoad.cjs');
const C=L('lib/town/trainCamClear.ts'),Ly=L('lib/town/trainLayout.ts'),Tk=L('lib/town/trainTrack.ts');
for(const st of Tk.TRAIN_STATIONS){
 const nb=Ly.stationSpot(st,9.5,3.57),lb=Ly.stationSpot(st,-12.5,3.57);
 assert(C.camBlocked(nb.x,nb.y+1.95,nb.z,null,true),st.id+': the name board blocks the camera');
 assert(C.camBlocked(lb.x,lb.y+1.75,lb.z,null,true),st.id+': the line board blocks the camera');
 // a camera out on the platform behind the name board, looking at a rider in the car: pulled in to the near side of the board
 const head=Ly.stationSpot(st,9.5,-.2),cam=Ly.stationSpot(st,9.5,6);const f=C.camClearFraction(head.x,head.y+1.95,head.z,cam.x,cam.y+1.95,cam.z,null,true);
 assert(!C.camBlocked(nb.x,nb.y+1.95,nb.z),st.id+': the outside views ignore the boards');
 assert(f<.6&&f>.15,st.id+': the arm stops before the board ('+f.toFixed(2)+')');
 // the open platform beside the boards stays free
 const free=Ly.stationSpot(st,6.5,3.57);assert(!C.camBlocked(free.x,free.y+1.95,free.z,null,true),st.id+': platform beside the name board stays open');
}
console.log('train-aaa3 camera clear of the boards: ok');
//  2. a station pin lands you more than 5 m from every machine's walk-up spot (its "Go" reach is 3.2 m: live audit, Summit Isle zoom)
{const R=L('lib/town/trainRide.ts'),V=L('lib/town/vendingCatalog.ts');assert.equal(R.STATION_ARRIVAL_DU,-2);
 assert.equal((read('components/Town.tsx').match(/platformSpot\(stationTo,TRAIN_STATIONS\[stationTo\]\.s\+STATION_ARRIVAL_DU,/g)||[]).length,2,'Town lands station pins on the new spot');
 Tk.TRAIN_STATIONS.forEach((st,i)=>{const a=R.platformSpot(i,st.s+R.STATION_ARRIVAL_DU,{x:0,y:0,z:0,yaw:0});
  for(const m of V.VENDING_MACHINES){const fx=Math.sin(m.yaw),fz=Math.cos(m.yaw),d=Math.hypot(m.x+fx*1.5-a.x,m.z+fz*1.5-a.z);assert(d>5,st.id+' arrival '+d.toFixed(1)+' m from '+m.id+"'s walk-up spot");}
  const nb=Ly.stationSpot(st,9.5,3.57),ns=Ly.stationSpot(st,-6.2,3.3);assert(Math.hypot(nb.x-a.x,nb.z-a.z)>8&&Math.hypot(ns.x-a.x,ns.z-a.z)>3.5,st.id+': clear of the board and the islander');});}
console.log('train-aaa3 station arrival clear of the machines: ok');
assert(/camClearFraction\(hx,hy,hz,camPos\.x,camPos\.y,camPos\.z,ports\.ground,true\)/.test(read('lib/town/trainRide.ts')),'the Seat view asks for the boards');
