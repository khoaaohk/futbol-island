// East Jetty lighthouse spiral staircase (Oct 26 2026, lib/town/lighthouseStairs.ts): the level-aware height function, walking
// and riding (scooter, bike, moped) up and down through rooftopTravel with one held stick direction (the phone thumb), the
// gallery's collision footprint, the plaza-level wall and headroom, jetpack landings on the gallery, and the ball's solids.
const assert=require('node:assert/strict');
const fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm'),path=require('node:path');
const loaded=new Map();function load(file){file=path.resolve(file);if(loaded.has(file))return loaded.get(file);const mod={exports:{}};loaded.set(file,mod.exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,Map,Set,Uint8Array,Float32Array,JSON,require:id=>id.startsWith('.')?load(path.resolve(path.dirname(file),id+'.ts')):require(id)});loaded.set(file,mod.exports);return mod.exports;}
const LS=load('lib/town/lighthouseStairs.ts'),{LIGHTHOUSE_STAIRS:L,STAIR_SPAN,STAIR_END,STAIR_RISE,stairHeight,lighthouseFloor,lighthouseSolid,lighthouseConstrain,lighthouseLanding,towerSolidRadius,TOWER_FOOT_R,isLighthouseTower}=LS;
const {createRooftopTravel}=load('lib/town/rooftopTravel.ts');
const {JETTY_BEACON,KEEPER_HUT,EAST_PIER,onEastPier}=load('lib/town/eastPier.ts');
const at=(phi,r)=>{const a=L.theta0+phi;return {x:L.cx+Math.cos(a)*r,z:L.cz+Math.sin(a)*r};};
const polar=p=>{const dx=p.x-L.cx,dz=p.z-L.cz;let a=Math.atan2(dz,dx)-L.theta0;a%=Math.PI*2;if(a<0)a+=Math.PI*2;return {r:Math.hypot(dx,dz),p0:a};};
let checks=0;const ok=(c,m)=>{assert(c,m);checks++;};

// ---- Height function: monotonic, continuous, no gaps, reaches the gallery; levels a full headroom apart; on the plaza.
{let prev=0;for(let i=0;i<=4000;i++){const phi=STAIR_END*i/4000,h=stairHeight(phi);ok(h>=prev-1e-12,'monotonic at φ '+phi);ok(h-prev<.02,'continuous at φ '+phi);prev=h;}
 ok(stairHeight(0)===0&&Math.abs(stairHeight(STAIR_SPAN)-L.top)<1e-9&&stairHeight(STAIR_END)===L.top,'0 at the foot, the gallery height at the top, flat landing');
 ok(Math.abs(L.top-13.6)<.05,'top level is the gallery floor (13.6 m)');
 ok(STAIR_RISE*Math.PI*2>=L.head+3,'a full turn is well over the headroom apart ('+(STAIR_RISE*Math.PI*2).toFixed(1)+' m)');
 const grade=STAIR_RISE/((L.rIn+L.rOut)/2);ok(grade>.18&&grade<.32,'gentle grade on the walking line ('+grade.toFixed(3)+')');
 ok(STAIR_RISE/(L.rIn+.4)<.36,'inner lane grade under 0.36');
 ok(L.rOut-L.rIn>=1.5&&L.rIn>TOWER_FOOT_R+.1&&L.galleryR<L.rIn,'1.6 m band outside the plinth; gallery railing inside the band');
 // Every point of the band at a ground-level `from` near each turn finds that turn (no gaps across the band's width).
 for(let i=0;i<=600;i++){const phi=STAIR_END*i/600,h=stairHeight(phi);for(const r of [L.rIn+.01,(L.rIn+L.rOut)/2,L.rOut-.01]){const q=at(phi,r),f=lighthouseFloor(q.x,q.z,h);ok(Math.abs(f-h)<1e-6,`floor at φ ${phi.toFixed(2)} r ${r}: ${f} vs ${h}`);}}
 // From the sky: the top turn; from the plaza: nothing above the reach.
 {const q=at(1,4.1);ok(Math.abs(lighthouseFloor(q.x,q.z,Infinity)-stairHeight(1+2*Math.PI*1))<1e-6,'from the sky: the upper turn');ok(lighthouseFloor(q.x,q.z,0)===-Infinity,'from the plaza: no floor under a 1.1 m flight');}
 {const q=at(0,1.9);ok(lighthouseFloor(q.x,q.z,L.top)===L.top&&lighthouseFloor(q.x,q.z,0)===-Infinity,'the gallery is a floor only from its own height');}
 ok(lighthouseFloor(L.cx,L.cz,Infinity)===L.capTop,'from the sky over the lantern: the cap top');
 ok(lighthouseFloor(L.cx+L.rOut+.2,L.cz,Infinity)===-Infinity&&lighthouseFloor(L.cx+40,L.cz,5)===-Infinity,'nothing outside the band');
 // The stair clears the keeper's hut (east) and stays on the plaza.
 const H=KEEPER_HUT;for(let i=0;i<=400;i++){const phi=STAIR_END*i/400;for(const r of [L.rIn,L.rOut]){const q=at(phi,r);ok(onEastPier(q.x,q.z),'band on the plaza');if(Math.abs(q.x-H.x)<H.w/2+.3&&Math.abs(q.z-H.z)<H.d/2+.3)ok(stairHeight(phi)-.45>H.h+1.2,'stair passes over the keeper\'s hut roof at φ '+phi.toFixed(2));}}
}

// ---- The world's colliders around the lighthouse, as eastPierWorld.ts builds them.
const tower={x:JETTY_BEACON.x,z:JETTY_BEACON.z,w:TOWER_FOOT_R*2,d:TOWER_FOOT_R*2,cornerRadius:TOWER_FOOT_R};
ok(isLighthouseTower(tower),'the round tower footprint is recognised');
const hut={x:KEEPER_HUT.x,z:KEEPER_HUT.z,w:KEEPER_HUT.w+.2,d:KEEPER_HUT.d+.2};
const benches=[-1,1].map(s=>({x:L.cx-.8,z:L.cz+s*6.5,w:2,d:.7}));
const signPosts=[-1,1].map(d=>{const a=L.theta0-.35,R=L.rOut+.08;return {x:L.cx+Math.cos(a)*R-Math.sin(a)*d,z:L.cz+Math.sin(a)*R+Math.cos(a)*d,w:.2,d:.2};});
const obstacles=[tower,hut,...benches,...signPosts];
{const w=fs.readFileSync('lib/town/eastPierWorld.ts','utf8');ok(/bench\(P\.cx-\.8,P\.cz-6\.5,-1\);bench\(P\.cx-\.8,P\.cz\+6\.5,1\)/.test(w)&&/R=LIGHTHOUSE_STAIRS\.rOut\+\.08/.test(w)&&/for\(const d of \[-1,1\]\)/.test(w),'test colliders match eastPierWorld.ts');}
// ---- Walking round the lighthouse on the plaza (outside the band, round the hut on its far side) never wedges between the
//      stair's side, the benches, the sign posts and the hut.
{const t=createRooftopTravel([],obstacles,{x:0,z:0}),ringR=a=>{let b=Math.atan2(Math.sin(a),Math.cos(a));return Math.abs(b)<.6?6.9:5.75;};
 for(const dir of [1,-1]){const s0=Math.PI*.75,p={x:L.cx+Math.cos(s0)*5.75,z:L.cz+Math.sin(s0)*5.75},v={x:0,z:0};t.reset(p.x,p.z,0);let travelled=0,last=s0;
  for(let i=0;i<60*40&&travelled<Math.PI*2;i++){const a=Math.atan2(p.z-L.cz,p.x-L.cx),g=a+dir*.35,R=ringR(g);t.update(1/60,p,v,{x:L.cx+Math.cos(g)*R-p.x,z:L.cz+Math.sin(g)*R-p.z,sprint:false},'walk');
   const b=Math.atan2(p.z-L.cz,p.x-L.cx);let d=b-last;d=Math.atan2(Math.sin(d),Math.cos(d));travelled+=d*dir;last=b;ok(t.state.height<.6&&!t.state.falling,'stays on the plaza');}
  ok(travelled>=Math.PI*2,`walks all the way round the lighthouse (${dir>0?'clockwise':'anticlockwise'}, ${(travelled/Math.PI*180).toFixed(0)}°)`);}}

// ---- Walk and ride up and down with ONE held stick direction each way.
function climb(mode){
 const start=at(-.35,4.1),p={x:start.x,z:start.z},v={x:0,z:0},t=createRooftopTravel([],obstacles,p);t.reset(p.x,p.z);
 ok(t.state.height===0,mode+' starts on the plaza');
 let maxH=0,last=0,stuck=0,frames=0,lastJump=0,minR=Infinity,maxR=0;const stick={x:-1,z:0,sprint:false};// west: along the foot's climb
 for(let i=0;i<60*120;i++){const h0=t.state.height;t.update(1/60,p,v,stick,mode);frames++;const h=t.state.height,{r}=polar(p);
  ok(!t.state.falling&&t.state.recovery===0&&!t.jump.active,`${mode} up: never falls (frame ${i}, h ${h.toFixed(2)}, r ${r.toFixed(2)})`);
  lastJump=Math.max(lastJump,Math.abs(h-h0));if(h>L.upFrom){minR=Math.min(minR,r);maxR=Math.max(maxR,r);}
  if(h>maxH+.02){maxH=h;stuck=0;}else stuck++;
  ok(stuck<90||h>=L.top-.01,`${mode} up: not wedged (h ${h.toFixed(2)} at ${p.x.toFixed(2)},${p.z.toFixed(2)} r ${r.toFixed(2)})`);
  if(h>=L.top-1e-6){last=i;break;}}
 ok(t.state.height===L.top,`${mode} reaches the top landing (${t.state.height.toFixed(2)})`);
 ok(lastJump<.25,`${mode} up: smooth (largest height step ${lastJump.toFixed(3)} m per tick)`);
 ok(minR>=L.rIn+.3-1e-6&&maxR<=L.rOut-.3+1e-6,`${mode} up: stays between the rails (${minR.toFixed(2)}–${maxR.toFixed(2)})`);
 const secs=frames/60;ok(secs<(mode==='walk'?40:30)&&secs>(mode==='walk'?10:6),`${mode} up in ${secs.toFixed(1)} s`);
 // Onto the gallery: steer to the axis, then walk round it; never off it, never into the lantern.
 for(let i=0;i<60*3;i++){t.update(1/60,p,v,{x:L.cx-p.x,z:L.cz-p.z,sprint:false},mode);}
 {const {r}=polar(p);ok(t.state.height===L.top&&r<L.galleryR&&r>=L.lanternR+.3-1e-6,`${mode} steps onto the gallery (r ${r.toFixed(2)})`);}
 for(const dir of [[1,0],[0,-1],[-1,0],[.7,-.7],[-.7,-.7],[.7,.7]])/* every way but toward the opening (south to south-west) */{for(let i=0;i<60*2;i++){t.update(1/60,p,v,{x:dir[0],z:dir[1],sprint:false},mode);const {r,p0}=polar(p);
   ok(t.state.height===L.top&&!t.state.falling,`${mode}: stays on the gallery pushing ${dir} (h ${t.state.height})`);ok(r>=L.lanternR+.3-1e-6,`${mode}: never into the lantern room`);}}
 // Down: from the landing, hold one direction down the stair to the plaza.
 for(let i=0;i<60*3;i++){const target=at(STAIR_SPAN+L.landing/2,4.1);t.update(1/60,p,v,{x:target.x-p.x,z:target.z-p.z,sprint:false},mode);}
 {const q=polar(p);ok(q.r>L.rIn&&t.state.height===L.top,`${mode} back on the landing (r ${q.r.toFixed(2)})`);}
 let minH=t.state.height;stuck=0;lastJump=0;const down={x:1,z:-.2,sprint:false};let reached=false;
 for(let i=0;i<60*120;i++){const h0=t.state.height;t.update(1/60,p,v,down,mode);const h=t.state.height;
  ok(!t.state.falling&&t.state.recovery===0,`${mode} down: never falls (h ${h.toFixed(2)})`);lastJump=Math.max(lastJump,Math.abs(h-h0));
  if(h<minH-.02){minH=h;stuck=0;}else stuck++;ok(stuck<90||h===0,`${mode} down: not wedged at h ${h.toFixed(2)} (${p.x.toFixed(2)},${p.z.toFixed(2)})`);
  if(h===0&&polar(p).r>L.rOut){reached=true;break;}}
 ok(reached,`${mode} rides down to the plaza and off`);ok(lastJump<.25,`${mode} down: smooth (${lastJump.toFixed(3)})`);
}
for(const mode of ['walk','scooter','bike','moped'])climb(mode);

// ---- Plaza level: the stair's low side is a wall; under the high flights there is headroom; rides arriving fast are braked.
{const t=createRooftopTravel([],obstacles,{x:0,z:0});
 const q=at(1.2,L.rOut+1.5),p={...q},v={x:0,z:0};t.reset(p.x,p.z,0);const inward={x:L.cx-q.x,z:L.cz-q.z,sprint:false};
 for(let i=0;i<120;i++)t.update(1/60,p,v,inward,'walk');ok(polar(p).r>=L.rOut+.32-1e-3&&t.state.height===0,`the stair's side at 1.3 m is a wall at plaza level (r ${polar(p).r.toFixed(2)})`);
 const hi=at(Math.PI+.5,L.rOut+1),p2={...hi},v2={x:0,z:0};t.reset(p2.x,p2.z,0);for(let i=0;i<120;i++)t.update(1/60,p2,v2,{x:L.cx-hi.x,z:L.cz-hi.z,sprint:false},'walk');
 ok(polar(p2).r<L.rIn+.2&&t.state.height===0,`under the 3.9 m flight there is headroom (r ${polar(p2).r.toFixed(2)})`);
 for(const mode of ['scooter','bike','moped']){const s=at(-.9,6.8),p3={...s},v3={x:0,z:0};t.reset(p3.x,p3.z,0);let top=0,maxSpeed=0,onFoot=false;
  for(let i=0;i<60*40&&top<L.top;i++){const {r,p0}=polar(p3);if(t.state.height>.1)onFoot=true;const goal=onFoot?null:at(.3,4.1);t.update(1/60,p3,v3,goal?{x:goal.x-p3.x,z:goal.z-p3.z,sprint:false}:{x:-1,z:-.3,sprint:false},mode);top=Math.max(top,t.state.height);if(t.state.height>1)maxSpeed=Math.max(maxSpeed,Math.hypot(v3.x,v3.z));ok(!t.state.falling,mode+' run-up never falls');}
  ok(top===L.top,`${mode}: a run-up from the plaza reaches the top (${top.toFixed(2)})`);ok(maxSpeed<=L.maxRideSpeed*1.12,`${mode}: capped on the stair (${maxSpeed.toFixed(1)} m/s)`);}
}

// ---- Gallery collision footprint: the rails hold at every bearing except the opening; the landing's end wall holds.
{const v={x:0,z:0};let held=0;
 for(let i=0;i<72;i++){const a=i/72*Math.PI*2,p={x:L.cx+Math.cos(a)*(L.galleryR-.32+.08),z:L.cz+Math.sin(a)*(L.galleryR-.32+.08)};
  const from={x:L.cx+Math.cos(a)*(L.galleryR-.33),z:L.cz+Math.sin(a)*(L.galleryR-.33)};const moved=lighthouseConstrain(from.x,from.z,p,v,L.top,.32);const {r,p0}=polar(p);
  const opening=[p0,p0+Math.PI*2,p0+Math.PI*4].some(q=>q>=STAIR_SPAN-L.openBefore+.1&&q<=STAIR_END-.1);
  if(!opening){ok(moved&&r<=L.galleryR-.32+1e-6,`gallery railing holds at bearing ${(a*180/Math.PI).toFixed(0)}° (r ${r.toFixed(2)})`);held++;}
  else ok(r>L.galleryR-.32,'the opening lets you onto the landing');}
 ok(held>=60,'railed nearly all round');
 {const p=at(STAIR_END-.1,4.1);let from=at(STAIR_END-.2,4.1);for(let i=0;i<30;i++){const q={...p};p.x+=(p.x-from.x);p.z+=(p.z-from.z);from=q;lighthouseConstrain(from.x,from.z,p,v,L.top,.32);}
  const end=STAIR_END-Math.PI*4;ok(polar(p).p0<=end-.32/4.1+1e-6&&polar(p).p0>end-.2,`the landing ends in a wall (${polar(p).p0.toFixed(3)} vs ${end.toFixed(3)})`);}
 const p2=at(2.5,L.rOut+.6);lighthouseConstrain(at(2.5,4.1).x,at(2.5,4.1).z,p2,v,stairHeight(2.5),.4);ok(polar(p2).r<=L.rOut-.4+1e-6,'the outer rail holds a ride');
 const p3=at(9,L.rIn-.6);lighthouseConstrain(at(9,4.1).x,at(9,4.1).z,p3,v,stairHeight(9),.4);ok(polar(p3).r>=L.rIn+.4-1e-6,'the inner rail holds a ride');
}

// ---- Jetpack landings: on the gallery ring only; never inside the tower, on the lantern, or on the band; the plaza still works.
{const t=createRooftopTravel([],obstacles,{x:0,z:0});
 ok(t.canLand(L.cx+2.2,L.cz,Infinity)&&t.surface(L.cx+2.2,L.cz,Infinity)===L.top,'lands on the gallery ring at 13.6 m');
 ok(!t.canLand(L.cx,L.cz,Infinity)&&!t.canLand(L.cx+1,L.cz,Infinity),'never on the lantern');
 for(let i=0;i<24;i++){const q=at(i/24*Math.PI*2,4.1);ok(!t.canLand(q.x,q.z,Infinity),'never on the stair band');}
 for(const [x,z] of [[L.cx,L.cz],[L.cx+.5,L.cz-.3],[L.cx+4,L.cz+1],[L.cx-3,L.cz-3.5]]){const s=t.findLanding(x,z);ok(s,'a landing is found near '+x+','+z);const {r}=polar(s),h=t.surface(s.x,s.z,Infinity);
  ok(r>=L.lanternR+.5-1e-6&&r<=L.galleryR-.5+1e-6&&h===L.top||r>L.rOut+.3&&h===0,`lands on the gallery or the plaza, never in the tower (r ${r.toFixed(2)}, h ${h})`);}
 ok(t.canLand(L.cx-6.5,L.cz,Infinity)&&t.surface(L.cx-6.5,L.cz,Infinity)===0,'the plaza outside the stair is still a landing');
 // Take off from the gallery and drop back: a gallery landing resets onto it; walking from there is on the gallery.
 const p={x:L.cx+2.2,z:L.cz},v={x:0,z:0};t.reset(p.x,p.z,t.surface(p.x,p.z,Infinity));ok(t.state.height===L.top,'a jetpack landing on the gallery stands at 13.6 m');
 for(let i=0;i<60;i++)t.update(1/60,p,v,{x:1,z:0,sprint:false},'walk');ok(t.state.height===L.top&&!t.state.falling,'and walks on it (no fall)');
}

// ---- Ball: rests on treads, cannot pass through a tread or the rails, the tower is solid by height, the gallery holds a ball.
{const q=at(3,4.1),h=stairHeight(3);
 ok(Math.abs(lighthouseFloor(q.x,q.z,h+.2-.15,.25)-h)<1e-9,'a ball resting on a tread keeps that tread as its floor');
 ok(lighthouseSolid(q.x,q.z,h-.1)&&lighthouseSolid(q.x,q.z,h-.4),'the tread slab is solid from below');
 ok(!lighthouseSolid(q.x,q.z,h+.3),'above the tread is free');
 const o=at(3,L.rOut-.05);ok(lighthouseSolid(o.x,o.z,h+.5),'the outer rail stops a ball');const i=at(3,L.rIn+.05);ok(lighthouseSolid(i.x,i.z,h+.5),'the inner rail stops a ball');
 ok(lighthouseSolid(L.cx+1.8,L.cz,5)&&!lighthouseSolid(L.cx+2.2,L.cz,5)&&!lighthouseSolid(L.cx+2,L.cz,L.top+.3),'tower solid at 5 m; the gallery is open above its floor');
 ok(lighthouseSolid(L.cx+1,L.cz,L.top+.5),'the lantern room is solid');
 const g=at(1.5,L.galleryR-.02);ok(lighthouseSolid(g.x,g.z,L.top+.5),'the gallery railing stops a ball');
 ok(towerSolidRadius(.5)===L.plinthR&&towerSolidRadius(L.top-.1)===L.galleryR,'plinth and gallery deck radii');
 // A ball falling 13 m onto a tread at ~19 m/s (one 60 Hz tick ≈ 0.32 m) cannot tunnel: from its y plus the fall speed's tick.
 let y=h+.2+.3;const vy=-19,dt=1/60;y+=vy*dt;const f=lighthouseFloor(q.x,q.z,y-.15+Math.max(0,-vy)*(1/30),.25);ok(Math.abs(f-h)<1e-9&&y<h+.2,'a fast fall onto a tread is caught by its floor');
 // The jetty-lighthouse hunt ball rests on the plaza, clear of the stair band.
 const balls=load('lib/town/eastJettyBalls.ts').EAST_JETTY_BALL_SPOTS,b=balls.find(s=>s.id==='jetty-lighthouse');const {r}=polar(b);
 ok(r>L.rOut+.8&&onEastPier(b.x,b.z)&&!lighthouseSolid(b.x,b.z,.2)&&lighthouseFloor(b.x,b.z,0)===-Infinity,`the hunt ball sits on the plaza clear of the stair (r ${r.toFixed(2)})`);
}
console.log(`PASS lighthouse stairs physics: ${checks} checks (height function, walk/scooter/bike/moped up and down, gallery footprint, landings, ball)`);
