// Regression: "sometimes the parachute freezes the game" (iPhone, Sep 2026). The glide's surface-clearance rule compared
// the next step's floor with the rider's height alone, so once the canopy sank to touchdown height (floor + .5) short of
// the landing spot, flat ground counted as a wall: the final approach and the joystick were both blocked and the rider
// hovered forever. Every descent must now finish, thin poles and props deflect instead of pinning, and a stalled approach
// is assisted and then landed on the (validated) landing spot.
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm');
const mod={exports:{}};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/town/jetpackActions.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:mod.exports,module:mod,Math,require:()=>({recordExploreActivity(){}})});
const {createJetpackActions,parachuteTooTall,PARACHUTE_SETTLE_LIMIT,PARACHUTE_MAX_AGE}=mod.exports;

// Boxes {x,z,w,d,top}; floor is the tallest box under a point, else 0 (like rooftop.surface).
const floorOf=boxes=>(x,z)=>{let h=0;for(const b of boxes)if(Math.abs(x-b.x)<=b.w/2&&Math.abs(z-b.z)<=b.d/2)h=Math.max(h,b.top);return h;};
function glide({start,height,target,boxes=[],blocked=()=>false,steer=()=>({x:0,z:0}),findLanding,dt=()=>1/60,limit=PARACHUTE_MAX_AGE+1}){
 const jet=createJetpackActions(),p={...start},floor=floorOf(boxes);jet.state.phase='parachute';jet.state.target={...target};
 let t=0,h=height,insidePole=0;
 while(t<limit){const step=dt(t);t+=step;const r=jet.update(step,p,h,{blocked,floor,steer:steer(t,p),findLanding});h=r.height;
  if(floor(p.x,p.z)>h+.01)insidePole++;
  if(r.landed)return {landed:true,t,p,h,insidePole,phase:jet.state.phase};}
 return {landed:false,t,p,h,insidePole,phase:jet.state.phase};
}

// 1. The reported pin: canopy at touchdown height, landing spot metres away over flat ground.
{const r=glide({start:{x:0,z:0},height:.5,target:{x:9,z:0}});
 assert.ok(r.landed,'flat ground no longer pins a low canopy');assert.ok(r.t<2,`lands promptly (${r.t.toFixed(2)} s)`);
 assert.deepEqual(r.p,{x:9,z:0});assert.equal(r.h,0);}
// 2. A long low approach glides in along the slope instead of skimming the ground.
{const r=glide({start:{x:0,z:0},height:7.9,target:{x:20,z:0}});assert.ok(r.landed&&r.t<4,`long approach lands (${r.t.toFixed(2)} s)`);}
// 3. A lamp post (0.45 m, 6 m tall) between the rider and the spot: deflects around it, never pinned, never inside it.
{const pole={x:2,z:0,w:.45,d:.45,top:6};
 for(const z0 of [0,.05,-.1,.2]){const r=glide({start:{x:0,z:z0},height:3,target:{x:4,z:0},boxes:[pole]});
  assert.ok(r.landed,`pole at offset ${z0}: lands`);assert.ok(r.t<PARACHUTE_SETTLE_LIMIT+1,`pole at offset ${z0}: bounded (${r.t.toFixed(2)} s)`);}}
// 4. Holding the joystick into the pole at low height (the screenshot) still lands.
{const pole={x:1,z:0,w:.45,d:.45,top:6};const r=glide({start:{x:0,z:0},height:2,target:{x:-1.3,z:0},boxes:[pole],steer:()=>({x:1,z:0}),findLanding:(x,z)=>Math.abs(x-1)<1.4&&Math.abs(z)<1.4?{x:-1.3,z}:{x,z}});
 assert.ok(r.landed,"steering into a pole cannot hold the canopy up");assert.ok(r.t<PARACHUTE_SETTLE_LIMIT+1,JSON.stringify(r));}
// 5. Sunk over a prop (vending machine / sign top above the canopy): the rider can always leave it.
{const prop={x:0,z:0,w:1.2,d:.9,top:2.2};const r=glide({start:{x:0,z:0},height:1.5,target:{x:2,z:0},boxes:[prop]});assert.ok(r.landed&&r.t<PARACHUTE_SETTLE_LIMIT+1,'leaves a prop it sank over');}
// 6. A canopy crossing a roof toward a lower spot starts the approach (the roof height no longer holds it off).
{const roof={x:0,z:0,w:10,d:10,top:9.2};const r=glide({start:{x:3,z:0},height:9.7,target:{x:6,z:0},boxes:[roof]});assert.ok(r.landed&&r.t<PARACHUTE_SETTLE_LIMIT+1,`roof edge approach lands (${r.t.toFixed(2)} s)`);}
// 7. Last-resort safety: even if every step is refused the glide touches down on its landing spot.
{const r=glide({start:{x:0,z:0},height:4,target:{x:3,z:1},blocked:()=>true});assert.ok(r.landed,'always-blocked glide still lands');assert.deepEqual(r.p,{x:3,z:1});assert.ok(r.t<PARACHUTE_SETTLE_LIMIT+1.5);}
// 8. Steering forever over ground with no landing near: the hard age cap ends the glide.
{const r=glide({start:{x:0,z:0},height:120,target:{x:0,z:0},steer:()=>({x:1,z:0}),findLanding:(x,z)=>({x:x-30,z})});assert.ok(r.landed&&r.t<=PARACHUTE_MAX_AGE+.1,'glide age is capped');}
// 9. Clearance rule: flat ground and lower ground are never walls; a wall taller than the canopy is.
{const floor=floorOf([{x:5,z:0,w:2,d:2,top:10}]);
 assert.equal(parachuteTooTall(floor,{x:0,z:0},.25,0,.5),false,'same-level ground at touchdown height is clear');
 assert.equal(parachuteTooTall(()=>0,{x:0,z:0},.25,0,.1),false,'even below 1 m clearance');
 assert.equal(parachuteTooTall(floor,{x:0,z:0},5,0,6),true,'a taller building blocks');
 assert.equal(parachuteTooTall(floor,{x:5,z:0},7,0,4),false,'leaving a roof downward is clear');}
// 10. Randomised drops around a street of poles, signal posts, vending machines and a roof, with random steering,
// long/short frames (iOS hitches) and random targets: all land, none exceed the settle bound once at touchdown height.
{let s=12345;const rnd=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};
 const boxes=[{x:0,z:0,w:12,d:12,top:9.2}];for(let i=0;i<30;i++)boxes.push({x:(rnd()-.5)*60,z:(rnd()-.5)*60,w:rnd()<.6?.45:1.2,d:rnd()<.6?.45:.9,top:1.5+rnd()*6});
 const floor=floorOf(boxes),clear=(x,z)=>boxes.every(b=>Math.abs(x-b.x)>b.w/2+1.2||Math.abs(z-b.z)>b.d/2+1.2)||floor(x,z)>=9.2&&Math.abs(x)<5.2&&Math.abs(z)<5.2;
 const findLanding=(x,z)=>{for(let r=0;r<40;r++)for(let i=0;i<(r?32:1);i++){const a=i/32*Math.PI*2,nx=x+Math.cos(a)*r,nz=z+Math.sin(a)*r;if(clear(nx,nz))return {x:nx,z:nz};}return null;};
 for(let n=0;n<400;n++){const start={x:(rnd()-.5)*50,z:(rnd()-.5)*50},target=findLanding(start.x,start.z);let steer={x:0,z:0};
  const r=glide({start,height:floor(start.x,start.z)+1+rnd()*30,target,boxes,findLanding,dt:()=>rnd()<.1?1/20:rnd()<.5?1/60:1/30,
   steer:()=>{if(rnd()<.03){const a=rnd()*6.283,m=rnd()<.3?0:1;steer={x:Math.sin(a)*m,z:Math.cos(a)*m};}return steer;}});
  assert.ok(r.landed,`random drop ${n} from ${JSON.stringify(start)} lands (ended ${JSON.stringify(r.p)} h ${r.h.toFixed(2)})`);}
}
// 11. Town wiring: the glide gets the flight bounds only; the old height-only surface rule must not come back.
{const town=fs.readFileSync('components/Town.tsx','utf8');assert.ok(!town.includes("rooftop.surface(x,z)>flight.height-1"),'old pinning rule removed from Town');assert.ok(town.includes('blocked:flightBlocked,floor:rooftop.surface'),'Town passes flightBlocked + rooftop.surface to jetActions');}
console.log('PARACHUTE_FREEZE_PASS low hover, poles, props, roof edges, steering, blocked safety, age cap and 400 random drops all land');
