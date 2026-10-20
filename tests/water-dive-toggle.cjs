// Dive (Oct 19 2026, user: "change the float on your back action to dive down into the water"; lib/town/water/waterState.ts DIVE):
// the tap goes under (eased, bounded by the seabed and the shelf), Surface comes back up, greyed in the shallows, auto-surface
// after DIVE.maxTime / at a shore / on a ride grab or the jetpack (R surfaces first), the HUD swap and icons, no allocation.
// Run: node tests/water-dive-toggle.cjs
const assert=require('node:assert/strict'),fs=require('node:fs');
const {createLoader}=require('./summit-harness.cjs');
const load=createLoader();
const W=load('lib/town/water/waterDepth.ts'),S=load('lib/town/water/waterState.ts'),H=load('lib/town/water/waterHud.ts');
let failed=0;const ok=(name,fn)=>{try{fn();console.log('ok   '+name);}catch(e){failed++;console.log('FAIL '+name+'\n  '+(e&&e.stack||e));}};
const island=()=>W.createWaterProbe((x,z)=>Math.max(0,Math.hypot(x,z)-10),(x,z)=>Math.hypot(x,z)<=10,()=>false);
const input=(o={})=>({stick:0,moving:false,speed:0,landY:0,yaw:Math.PI/2,airborne:false,...o});
const F=1/60;
/** A swimmer treading water at x (on z = 0) off the round island of radius 10. */
function swimmer(x=30){const water=S.createWaterState(island(),()=>false);for(let p=9;p<x;p+=.05)water.step(F,p,0,input({stick:1,moving:true,speed:3}));for(let i=0;i<60;i++)water.step(F,x,0,input());assert.equal(water.state.phase,'swim');return water;}
const run=(water,x,s,o)=>{const seen={};for(let i=0;i<Math.round(s*60);i++){const ev=water.step(F,x,0,input(o));for(const k of ['dived','rose','bubble','wake','stroke','ripple'])if(ev[k])seen[k]=(seen[k]||0)+1;}return seen;};

ok('enter: a tap eases down over ~1.2 s to DIVE.depth, head down on the way, level crawl below; tap again comes back up',()=>{
 const water=swimmer();assert.equal(water.canDive(),true);
 assert.equal(water.press('dive','tap'),true);assert.equal(water.diveActive,true);
 water.step(F,30,0,input());assert(water.events.dived||water.state.under>0);
 let maxTilt=0,prev=water.state.dive,mono=true;for(let i=0;i<Math.round(S.DIVE.ease*60*.5);i++){water.step(F,30,0,input());maxTilt=Math.max(maxTilt,water.pose.tilt);if(water.state.dive<prev-1e-9)mono=false;prev=water.state.dive;}
 assert(water.state.under>.3&&water.state.under<.7,'half way at ~0.6 s: '+water.state.under);assert(mono,'smooth descent');assert(maxTilt>.4,'head down on the way: '+maxTilt);
 run(water,30,1.5);assert.equal(water.state.under,1);assert(Math.abs(water.state.dive-S.diveRoom(20))<.02&&S.diveRoom(20)===S.DIVE.deepSea,'the open-sea depth out here: '+water.state.dive);assert(S.diveRoom(6)>S.DIVE.deepSea+.3,'deeper over the clear shallows');assert.equal(water.pose.tilt,0,'level below');
 assert.equal(water.pose.kind,'crawl');assert(water.pose.under>.99);assert(water.pose.effort>=.4,'the kick keeps going while hovering');
 // Controls work under water (user, Oct 19 2026: "unable to do anything until coming back up"): the stick swims the diver along
 // (the host's swimStep runs for every swim phase), Sprint still works, the dive stays under; no wake or arm splashes, a few bubbles.
 assert.equal(water.state.phase,'swim','diving is still the swim phase: the host swim step and every water action stay live');assert.equal(water.swimming,true);
 const probe={x:30,z:0},vel={x:0,z:0};for(let i=0;i<60;i++){W.swimStep(probe,vel,{x:0,z:1},water.state.fast,F,()=>true,()=>false);water.step(F,probe.x,probe.z,input({stick:1,moving:true,speed:Math.hypot(vel.x,vel.z)}));}
 assert(probe.z>1.5,'the stick moves the diver: '+probe.z);assert.equal(water.state.under,1,'still under while swimming');
 assert.equal(water.press('swimfast','down'),true,'Sprint works under water');assert.equal(water.state.fast,true);water.step(F,30,0,input({stick:1,moving:true,speed:5}));assert.equal(water.pose.fast,1);water.press('swimfast','up');
 const seen=run(water,30,4,{stick:1,moving:true,speed:W.SWIM_SPEED});assert(!seen.wake&&!seen.stroke,'no surface wake under');assert(seen.bubble>=4&&seen.bubble<=4/S.DIVE.bubble+1,'bubbles: '+seen.bubble);
 // Surface: the same button, eased back up, head up, the rose event once, the head-shake.
 assert.equal(water.press('dive','tap'),true);assert.equal(water.state.diving,false);
 let minTilt=0,rose=0,shake=0;for(let i=0;i<Math.round(S.DIVE.ease*60)+10;i++){const ev=water.step(F,30,0,input());if(ev.rose)rose++;minTilt=Math.min(minTilt,water.pose.tilt);shake=Math.max(shake,water.pose.shake);}
 assert.equal(rose,1);assert(minTilt<-.3,'head up coming back: '+minTilt);assert(shake>.8,'the surfacing head-shake');assert.equal(water.state.dive,0);assert.equal(water.diveActive,false);
});

ok('depth: bounded by the seabed curve (the clear window floor) and, in the shallows, by the shelf; never below the floor',()=>{
 const cw=fs.readFileSync('lib/town/water/clearWindow.ts','utf8');assert.match(cw,new RegExp('CLEAR_BED=\\{[^}]*floor:'+S.DIVE.bed+'[,}]'),'DIVE.bed = CLEAR_BED.floor');
 for(const d of [0,1,2,3,4,6,10,30]){const room=S.diveRoom(d),bed=.05+S.DIVE.bed*(1-Math.exp(-d/3.4));assert(room<=S.DIVE.depth+1e-9&&room>=0);assert(room<=bed-S.DIVE.clearance+1e-9||room===0,'above the floor at '+d);}
 assert.equal(S.diveShore(W.DEPTH_MAX),1);assert.equal(S.diveShore(S.DIVE.minWater-.1),0);
 // Settled under near the shelf's edge: shallower than out at sea.
 const near=swimmer(13.2);if(near.canDive()){near.press('dive','tap');run(near,13.2,2);assert(near.state.dive<S.DIVE.depth-.3,'shallower near the shore: '+near.state.dive);}
});

ok('shallow: Dive is greyed under DIVE.minWater of shelf water (the press is refused), and the HUD shows it disabled',()=>{
 const water=swimmer(12.4);/* 2.4 m out: shelf 1.08 m, swimming but shallow */assert.equal(water.state.phase,'swim');assert.equal(water.canDive(),false);
 assert.equal(water.press('dive','tap'),false);assert.equal(water.diveActive,false);
 const row=H.waterButtonsFor({inWater:true,swimming:true,flyOk:false,diving:false,diveOk:false});assert.equal(row[1].id,'dive');assert.equal(row[1].enabled,false);assert.ok(H.DIVE_SHALLOW_NOTE.length<80);
});

ok('auto-surface: after DIVE.maxTime s, and swimming in to a shore; a splash-down or leaving the water drops it',()=>{
 const water=swimmer();water.press('dive','tap');let rose=0;for(let i=0;i<Math.round((S.DIVE.maxTime+S.DIVE.ease+.5)*60);i++)if(water.step(F,30,0,input()).rose)rose++;
 assert.equal(rose,1,'back up by itself');assert.equal(water.state.diving,false);assert.equal(water.state.dive,0);assert(S.DIVE.maxTime>=30&&S.DIVE.maxTime<=60);
 const w2=swimmer(16);w2.press('dive','tap');run(w2,16,1.5);let x=16,deepest=w2.state.dive,surfacedBy=0;while(x>11.5){x-=W.SWIM_SPEED*F;w2.step(F,x,0,input({stick:1,moving:true,speed:W.SWIM_SPEED}));if(!w2.state.diving&&!surfacedBy)surfacedBy=x;}
 assert(surfacedBy>0,'the shore ends the dive');assert(deepest>1,'was deep');assert(w2.state.dive<.6,'nearly up by the wade line: '+w2.state.dive);
 const w3=swimmer();w3.press('dive','tap');run(w3,30,1.5);w3.splashDown(30,0,'fall',5,0);assert.equal(w3.diveActive,false,'a splash-down resets the dive');
});

ok('exits: a ride grab eases up (surfaceDive), the jetpack surfaces quickly first then launches, fishing never starts in the sea',()=>{
 const water=swimmer();water.press('dive','tap');run(water,30,1.5);assert.equal(water.surfaceDive(),true);let t=0;while(water.diveActive&&t<5){water.step(F,30,0,input());t+=F;}assert(t>S.DIVE.ease-.1&&t<S.DIVE.ease+.2,'eased: '+t);
 assert.equal(water.surfaceDive(),false,'already up');
 water.press('dive','tap');run(water,30,1.5);assert.equal(water.surfaceDive(true),true);t=0;while(water.diveActive&&t<5){water.step(F,30,0,input());t+=F;}assert(t<=S.DIVE.quick+.1,'quick for the jetpack: '+t);
 const town=fs.readFileSync('components/Town.tsx','utf8');
 assert.match(town,/if\(water\.diveActive\)\{water\.surfaceDive\(true\);flyAfterDive=true;return true;\}/,'R while diving surfaces first');
 assert.match(town,/if\(flyAfterDive&&\(!water\.inWater\|\|!water\.diveActive\)\)\{flyAfterDive=false;if\(water\.inWater\)flyUp\(\);\}/,'then launches at the surface');
 assert.match(town,/countRideStart\(re\.grabbed\);water\.state\.fast=false;water\.surfaceDive\(\);/,'a grab eases up');
 assert.match(town,/onFoot:[^,]*&&!water\.inWater,/,'fishing needs dry feet (no fishing while diving)');
 assert.match(town,/SWIM_ROOT_DEPTH\+water\.state\.dive,beanSkinOf/,'the swim seabed stays under the diver');
 assert.match(town,/if\(ev\.bubble&&!reduced&&!animalRides\.riding\)[^\n]*ballEffects\.ripple\(/,'bubbles from the ring pool on every tier (the diver marker)');assert.match(town,/cap=1-\.5\*Math\.min\(1,\(water\.pose\.under\?\?0\)\*SWIM_DIVE_CLEAR\)/,'the body keeps a visibility floor (reached a third of the way under)');
 assert(S.DIVE.depth<=1.8,'deep enough to read as under, shallow enough to see');
});

ok('HUD + keys + icons: Dive then Surface in the juggle slot (Q / J / 2), Sprint stays live under water; icon-only glyphs; analytics id',()=>{
 const up=H.waterButtonsFor({inWater:true,swimming:true,flyOk:true,diving:false,diveOk:true}),down=H.waterButtonsFor({inWater:true,swimming:true,flyOk:true,diving:true,diveOk:true});
 assert.deepEqual(up.map(b=>b.icon),['swimfast','dive','swim']);assert.deepEqual(down.map(b=>b.icon),['swimfast','surface','swim']);assert.equal(down[0].enabled,true,'Sprint stays live under water');assert.equal(down[1].enabled,true);assert.equal(down[2].enabled,true,'the jetpack stays offered');
 assert.equal(up,H.waterButtonsFor({inWater:true,swimming:true,flyOk:true,diving:false,diveOk:true}),'cached rows (no allocation)');
 for(const [c,k] of [['KeyQ','q'],['KeyJ','j'],['Digit2','2']])assert.equal(H.waterKeyAction(c,k),'dive');
 const icons=fs.readFileSync('components/TravelIcon.tsx','utf8');assert.match(icons,/\bdive:'M12 3v12/);assert.match(icons,/\bsurface:'M12 15V3/);assert.match(icons,/\bfloat:'/,'the old glyph stays');
 const btn=fs.readFileSync('components/JobActionButton.tsx','utf8');assert.match(btn,/WATER_IDS=new Set\(\['swimfast','dive',/);
 const ev=fs.readFileSync('lib/analytics/waterEvents.ts','utf8');assert.match(ev,/countDive=\(\)=>count\('wa:dive'\)/);assert.match(ev,/countFloat=\(\)=>count\('wa:float'\)/,'the history id stays');
 const ids=fs.readFileSync('lib/analytics/countIds.ts','utf8');assert.match(ids,/\['dive','“Dive” used'\]/);assert.match(ids,/\['float',/);
});

ok('no allocation: the dive adds no object literals / arrays to step(), press() or surfaceDive()',()=>{
 const src=fs.readFileSync('lib/town/water/waterState.ts','utf8');const strip=t=>t.replace(/\/\/[^\n]*/g,'').replace(/\/\*[\s\S]*?\*\//g,'');
 const step=strip(src.slice(src.indexOf('function step('),src.indexOf('function splashDown(')));assert(!/new |\[\]|=>\s*\(\{|\{\.\.\./.test(step),'step() allocates');
 const press=strip(src.slice(src.indexOf('function press('),src.indexOf('function takeOff(')));assert(!/new |\[\]|\{\.\.\./.test(press),'press() allocates');
 const water=swimmer();water.press('dive','tap');const ev0=water.step(F,30,0,input());for(let i=0;i<600;i++)assert.equal(water.step(F,30,0,input({stick:1,moving:true,speed:3})),ev0,'one events object');
});

ok('the swim cluster always shows while swimming (user, Oct 19 2026): one store across module reloads; every swim view maps to the water buttons',()=>{
 const H2=createLoader()('lib/town/water/waterHud.ts');assert.equal(H2.waterStore,H.waterStore,'a reloaded waterHud hands back the same store');assert.equal(H2.waterActions,H.waterActions,'and the same action hook');
 let pressed=null;H.waterActions.press=(id)=>{pressed=id;};H2.waterActions.press('dive','tap');assert.equal(pressed,'dive');
 H.waterStore.set({inWater:true,swimming:true});assert.equal(H2.waterStore.get().swimming,true,'the HUD reads what the loop wrote');H.waterStore.reset();
 for(const diving of [false,true])for(const diveOk of [false,true,undefined])for(const flyOk of [false,true]){const row=H.waterButtonsFor({inWater:true,swimming:true,flyOk,diving,diveOk});
  assert(row&&row.length===3&&row.every(b=>['swimfast','dive','swimride'].includes(b.id)),'water cluster '+JSON.stringify({diving,diveOk,flyOk}));assert.equal(row[1].enabled,diving||diveOk!==false);}
 // In the swim state at the shallow swim line (1.0–1.2 m of shelf water): swimming, the water cluster, Dive greyed.
 const water=swimmer(12.4);assert.equal(water.swimming,true);const row=H.waterButtonsFor({inWater:water.inWater,swimming:water.swimming,flyOk:false,diving:water.diveActive,diveOk:water.canDive()});assert.equal(row[1].enabled,false);assert.equal(row[0].enabled,true);
});

ok('shore (user, Oct 19 2026: "when diving and headed to the shore, diver goes missing"): the body stays above the drawn seabed, rises before the shore band, controls stay live',()=>{
 // The drawn waterline runs 1 m further out than the logical land (Coral Cay's Sharks Beach): the bed is the clear window's curve of it.
 const drawn=(x,z)=>Math.hypot(x,z)-11,bed=(x,z)=>.05+S.DIVE.bed*(1-Math.exp(-Math.max(drawn(x,z),0)/3.4))-.01;
 const water=S.createWaterState(island(),()=>false,bed);for(let p=9;p<40;p+=.05)water.step(F,p,0,input({stick:1,moving:true,speed:3}));for(let i=0;i<60;i++)water.step(F,40,0,input());
 assert.equal(water.canDive(),true);water.press('dive','tap');for(let i=0;i<150;i++)water.step(F,40,0,input());assert.equal(water.state.under,1);assert(water.state.dive>1,'deep out at sea: '+water.state.dive);
 const p={x:40,z:0},vel={x:0,z:0};let minGap=9,surfacedAt=-1,swimSteps=0;
 for(let i=0;i<60*12&&water.state.phase!=='land';i++){W.swimStep(p,vel,{x:-1,z:0},false,F,()=>true,()=>false);water.step(F,p.x,p.z,input({stick:1,moving:true,speed:Math.hypot(vel.x,vel.z)}));
  if(water.state.phase==='swim')swimSteps++;
  const rootDepth=W.WATER_LEVEL-water.state.rootY;if(water.state.dive>.05)minGap=Math.min(minGap,bed(p.x,p.z)-rootDepth);
  if(surfacedAt<0&&!water.state.diving)surfacedAt=drawn(p.x,p.z);
  if(drawn(p.x,p.z)<4&&water.state.phase==='swim')assert(water.state.dive<.05,'risen before the shore band: dive '+water.state.dive.toFixed(2)+' at '+drawn(p.x,p.z).toFixed(1)+' m');}
 assert(minGap>=S.DIVE.body-.02,'the body never sinks into the drawn bed: gap '+minGap.toFixed(2));
 assert(surfacedAt>4,'auto-surfaced before the shore band: '+surfacedAt.toFixed(1));assert(swimSteps>200,'the stick kept the diver moving all the way in');
 assert.equal(water.state.phase,'land','swam out onto the beach');
 // Dive is greyed over a bed with no room (the shore band), live again further out; the no-seabed host keeps the old behaviour.
 assert(S.diveBedRoom(2.5)===0&&S.diveBedRoom(4.2)===S.DIVE.depth&&S.diveBedRoom(3.4)>0&&S.diveBedRoom(3.4)<S.DIVE.depth);
 const T=fs.readFileSync('components/Town.tsx','utf8');assert.match(T,/createWaterState\(waterProbe,\(\)=>reduced,\(x,z\)=>\{const f=world\.islandShore\.field;return f\?clearBedDepthAt\(f,x,z\)/,'Town feeds the drawn bed');
});

ok('clearBedDepthAt: the bed mesh as drawn (lattice vertices at uwDepthAt of the field distance, the PlaneGeometry triangle split)',()=>{
 const C=load('lib/town/water/clearWindow.ts'),f={distance:(x,z)=>x*.5+z*.1,lift:()=>-.5},uw=d=>.05+S.DIVE.bed*(1-Math.exp(-Math.max(d,0)/3.4));
 for(const [x,z] of [[8,4],[12,-8],[0,0]])assert(Math.abs(C.clearBedDepthAt(f,x,z)-uw(f.distance(x,z)))<1e-9,'vertex '+x+','+z);
 const mid=C.clearBedDepthAt(f,10,6),A=uw(f.distance(8,4)),D=uw(f.distance(12,4)),B=uw(f.distance(8,8));assert(Math.abs(mid-(A+(D-A)*.5+(B-A)*.5))<1e-9,'linear on the (a,b,d) triangle');
});

if(failed){console.log(failed+' failed');process.exit(1);}
console.log('WATER_DIVE_PASS dive enter/ease/depth bounds, shallow disable, auto-surface (time, shore, splash-down), grab/jetpack exits, HUD/keys/icons, no allocation');
