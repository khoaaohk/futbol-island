// The Island Line, Phase 4 (Nov 23 2026; brief .claude/worktrees/_recovery-nov20/train-phase4-brief.md). Run: node tests/train-station-npcs.cjs
//  1. station islanders (lib/town/stationNpcs.ts): two per station, on their written spots (= trainLayout stationSpot), on the
//     platform's height, the bench one on the bench (island bench sizes), facts with sources, registered, boarders known
//  2. station life (lib/town/stationLife.ts): an arrival turns that platform's islanders to the train; a boarder rides off once the
//     doors are open and comes back off a later train; never mid-chat
//  3. path crossings: every footpath, trail and road strip that meets the line meets it at a crossing (a deck + a barrier machine)
//  4. nothing on the tracks: no prop, collider, NPC, ball spot, vending machine, fishing / job spot or landmark within 3 m of the
//     rail centre (crossing decks and platforms excepted: nothing stands on them either)
//  5. heat and wiring: the station drink machines cast no shadow; station NPCs reuse the shared NPC runtime; Town wires the life
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {loadIslandWorld}=require('../scripts/island-world-load.cjs');
const ROOT=path.join(__dirname,'..'),read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
(async()=>{
 const env=await loadIslandWorld(ROOT),{world,L,obstacles}=env;
 const tt=L('lib/town/trainTrack.ts'),tl=L('lib/town/trainLayout.ts'),SN=L('lib/town/stationNpcs.ts'),ND=L('lib/town/npcDialogues.ts'),TR=tt.TRACK,K=tt.TrackKind,P=tl.trainLayout().profile;
 const ds=(a,b)=>Math.abs(tt.wrapS(a-b+TR.length/2)-TR.length/2);
 // 1. station islanders
 const N=SN.STATION_NPCS;assert.equal(N.length,10,'two per station');assert.equal(new Set(N.map(n=>n.id)).size,10,'unique ids');
 for(const st of tt.TRAIN_STATIONS){const here=N.filter(n=>n.station===st.id);assert.equal(here.length,2,st.id+': two islanders');
  const stand=tl.stationSpot(st,-6.2,3.3),bench=tl.stationSpot(st,-9,3.6);
  for(const n of here){const want=n.pose==='bench'?bench:stand,yaw=n.pose==='bench'?bench.yaw:stand.yaw+Math.PI;
   assert(Math.hypot(n.x-want.x,n.z-want.z)<.02,`${n.id} on its station spot (${n.x},${n.z} vs ${want.x.toFixed(2)},${want.z.toFixed(2)})`);
   assert(Math.abs(Math.atan2(Math.sin(n.workYaw-yaw),Math.cos(n.workYaw-yaw)))<.02,n.id+' faces '+(n.pose==='bench'?'the line':'the departure board'));
   assert(Math.abs(n.floor()-want.y)<.005,n.id+' stands on the platform top');assert(n.topics.length>=2&&n.topics.every(t=>t.followUp&&t.answer.length>40),n.id+' has facts to share');
   assert(ND.NPC_DIALOGUES.some(d=>d.id===n.id),n.id+' is in the NPC runtime');}
  assert.equal(here.filter(n=>n.pose==='bench').length,1,st.id+': one on the bench');}
 assert(SN.STATION_BOARDERS.length>=3,'some islanders ride the trains');
 {const src=read('lib/town/stationNpcs.ts');for(const k of ['Newton Heath','Kashima Soccer Stadium','SS Conte Verde','Gotthard','Miyake','JR Central'])assert(src.includes(k),'source noted: '+k);}
 {const w=read('lib/town/trainWorld.ts');assert(/bench\.box\(a\[0\],top\+\.6,a\[2\],c\.tx,c\.tz,1,\.325,\.04\)/.test(w),'station bench seat: the island bench (seat top .64, half depth .325)');
  const B=L('lib/graphics/npcSeatPose.ts').BENCH;assert.equal(B.seatTop,.64);}
 // 2. station life
 {const SL=L('lib/town/stationLife.ts'),TS=L('lib/town/trainSchedule.ts'),turned=[],away=new Set();
  const life=SL.createStationLife({reactToTruck:(id,x,z)=>turned.push(id),setAway:(id,on)=>on?away.add(id):away.delete(id),isAway:id=>away.has(id)});
  const k=TS.TRAIN_STOPS.findIndex(s=>s.station.id==='west'),st=TS.TRAIN_STOPS[k].station,states=[0,1,2].map(()=>TS.newTrainState());
  const p=tt.trackAt(st.s),player={x:p.x+40,z:p.z};
  life.update(states,0,player,null);assert.equal(turned.length,0,'nothing while running');
  states[0].at=k;states[0].s=st.s;life.update(states,1,player,null);assert.equal([...turned].sort().join(),N.filter(n=>n.station==='west').map(n=>n.id).sort().join(),'an arrival turns the platform to the train');
  life.update(states,1+SL.BOARD_AFTER-.1,player,null);assert.equal(away.size,0,'not before the doors are open');
  life.update(states,1+SL.BOARD_AFTER+.1,player,null);assert(away.has('stn-ines'),'the West Beach boarder steps on');
  states[0].at=-1;life.update(states,30,player,null);states[1].at=k;states[1].s=st.s;life.update(states,140,player,null);life.update(states,140+SL.BOARD_AFTER+.1,player,'stn-ines');assert(away.has('stn-ines'),'never while you talk to them');
  states[1].at=-1;life.update(states,200,player,null);states[2].at=k;life.update(states,260,player,null);life.update(states,260+SL.BOARD_AFTER+.1,player,null);assert(!away.has('stn-ines'),'and steps off a later train');
  turned.length=0;states[2].at=-1;life.update(states,300,{x:p.x+500,z:p.z},null);states[0].at=k;life.update(states,301,{x:p.x+500,z:p.z},null);assert.equal(turned.length,0,'far from the player: nothing');}
 // 3. path crossings: every path strip or trail the line runs through is inside a crossing's deck (or a station's platform)
 {const W=L('lib/town/westParkLayout.ts'),BK=L('lib/town/beachKitchenSquare.ts').BK_SQUARE,lines=W.parkPathLines();
  const covered=s=>tt.TRAIN_CROSSINGS.some(c=>ds(s,c.s)<c.width/2+1.5)||tt.TRAIN_STATIONS.some(t=>ds(s,t.s)<tt.STATION_HALF+2);
  const strips=world.surfaceAreas.filter(a=>a.kind==='path'&&a.w*a.d<1500/* plazas and the pond's box are judged by their own shapes (onWalkPath) */),miss=new Map();
  for(let i=0;i<TR.n;i++){if(P.kind[i]===K.Tunnel)continue;const x=TR.x[i],z=TR.z[i],s=i*tt.TRACK_DS;if(covered(s))continue;
   if(x>BK.minX-1&&x<BK.maxX+1&&z>BK.northZ&&z<BK.northZ+40)continue;// the Beach Kitchen square: one crossing at its middle (below)
   for(const a of strips)if(Math.abs(x-a.x)<a.w/2+.3&&Math.abs(z-a.z)<a.d/2+.3)miss.set(`path ${a.x.toFixed(1)},${a.z.toFixed(1)}`,`${x.toFixed(1)},${z.toFixed(1)}`);
   if(W.onWalkPath(x,z,.3))miss.set('west park walk',`${x.toFixed(1)},${z.toFixed(1)}`);
   for(const r of world.roads)if(Math.abs(x-r.x)<r.w/2+.3&&Math.abs(z-r.z)<r.d/2+.3)miss.set(`road ${r.x},${r.z}`,`${x.toFixed(1)},${z.toFixed(1)}`);}
  assert.equal(miss.size,0,'path meets the line with no crossing: '+[...miss].map(([k,v])=>k+' @ '+v).join('; '));
  const bk=tt.TRAIN_CROSSINGS.find(c=>c.id==='beach-kitchen-square'),q=tt.trackAt(bk.s);assert(q.x>BK.minX&&q.x<BK.maxX,'the Beach Kitchen square crossing is on the square');
  for(const id of ['park-west-trail','park-south-west-trail','park-south-east-trail']){const c=tt.TRAIN_CROSSINGS.find(x=>x.id===id),a=tt.trackAt(c.s);assert(lines.some(l=>W.segDistance(a.x,a.z,l)<1),id+' sits on its trail');}
  for(const c of tt.TRAIN_CROSSINGS)assert.equal(P.kind[Math.round(c.s/tt.TRACK_DS)%TR.n],K.Land,c.id+' on land');}
 // 4. nothing on the tracks (3 m from the rail centre, the tunnel excepted)
 {const {landmarks}=require('../scripts/island-connectivity-checks.cjs'),VC=L('lib/town/vendingCatalog.ts');
  const onTrack=(x,z,r=0)=>{const h=tt.trackNearest(x,z,3+r);return h&&P.kind[h.i]!==K.Tunnel&&h.d<3+r?h:null;};
  const bad=[];const check=(what,x,z,r=0)=>{const h=onTrack(x,z,r);if(h)bad.push(`${what} @${x.toFixed(1)},${z.toFixed(1)} (${h.d.toFixed(2)} m)`);};
  for(const l of landmarks({world,env,L}))if(l.group!=='destination'&&l.group!=='field'&&!(l.y>8))check(l.group+' '+l.name,l.x,l.z);// sky balls (60 m up) float far above the line
  for(const a of world.assets)check('asset '+a.kind,a.x,a.z);
  for(const o of obstacles)if(!o.train)check('collider',o.x,o.z,Math.min(o.w,o.d)/2);
  for(const m of VC.VENDING_MACHINES)check('vending '+m.id,m.x,m.z,.56);// the cabinet's half depth: its glass faces the line
  for(const n of ND.NPC_DIALOGUES)if(!n.floor||n.station)check('npc '+n.id,n.x,n.z);
  assert.equal(bad.length,0,'on the tracks: '+bad.slice(0,8).join('; '));}
 // 5. heat and wiring
 {const vm=read('lib/graphics/vendingMachines.ts'),town=read('components/Town.tsx'),npcs=read('lib/graphics/islandNpcs.ts');
  assert(/mesh\.castShadow=!m\.station/.test(vm),'station drink machines cast no shadow (no new shadow work)');
  assert(/createStationLife\(islandNpcs\)/.test(town)&&/stationLife\.update\(world\.trainRun\.states/.test(town),'Town drives the station life');
  assert(/setAway\(id:string,on:boolean\)/.test(npcs)&&/away\.has\(entry\.definition\.id\)/.test(npcs),'a riding islander is thinned like the others (not drawn or talkable)');
  const run=read('lib/town/trainRunning.ts');assert(/cue\('train-clack'/.test(run)&&/cue\('train-chime'/.test(run)&&/cue\('train-arrive'/.test(run),'wheel clack, door chime and arrival melody');
  const snd=read('lib/audio/islandSound.ts');for(const k of ['train-clack','train-chime','train-arrive'])assert(snd.includes(`case '${k}'`),k+' in the island sound kit');
  assert(/const e=x\.arm\*x\.arm\*\(3-2\*x\.arm\)/.test(run),'barrier arms ease (smoothstep), never snap');}
 console.log('train-station-npcs: ok');
})().catch(e=>{console.error(e);process.exit(1);});
