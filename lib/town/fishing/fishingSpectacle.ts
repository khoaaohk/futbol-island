/**
 * Fishing look-and-feel pass (Nov 14 2026, docs/fishing.md "Bite cue, water and trophy moments"). Data: of 24 missed bites in 14 days,
 * ALL were "too late" (players do not notice the bite), and phones are most players. So:
 * - the bite's "now!" FLASH: a thick gold-white ring with rays bursting round the float, twice (a "now-now"), sized to read on a phone
 *   at the normal fishing camera; the camera gets a small nudge (fishingCamera.kick) and the phone a double buzz (fishingStore);
 * - FOAM trails behind a fleeing shadow and a fish making a run; a foam patch where the fish is hooked;
 * - brief SPARKLES on the surface over a Rare / Legendary shadow, so the special ones read on a phone;
 * - LIFE on the water: now and then a fish just under the calm surface near the spot, and at sunset a fish jumping out there
 *   (the birds diving over the boat hotspots splash where they hit the water: fishingOverlay.ts);
 * - the SPOTLIGHT for a Rare / Legendary landing: a short slow-motion close-up of the catch (fishingCamera.closeUp), then the HUD's
 *   trophy card (components/FishingTrophy.tsx).
 *
 * Heat (AGENTS.md): no new mesh, material, texture, render target, timer or listener. Everything is a mark in the overlay's ONE
 * instanced draw (its FX pool of 24 slots a frame), driven by the visuals' frame while fishing only; positions come from a few
 * numbers kept here (no allocation per frame). Gate (`spectacleGate`): reduced motion drops the nudge and the slow motion;
 * the foam, sparkles and life need heat tiers 0-1 (life: tier 0 only on phones) and moving water. The bite flash is gameplay
 * feedback and always shows (held still with reduced motion).
 */
import type {createFishingOverlay} from './fishingOverlay';

type Overlay=ReturnType<typeof createFishingOverlay>;
type V2={x:number;z:number};
export type SpectacleGate={shake:boolean;slowmo:boolean;foam:boolean;sparkle:boolean;life:boolean};
/** One pure gate, read once per fishing frame. `waterDetail` < .5 is the still-water path (governor slow / static ambience). */
export function spectacleGate(tier:number,reduced:boolean,waterDetail:number,phone:boolean):SpectacleGate{
 const still=reduced||waterDetail<.5;
 return {shake:!reduced,slowmo:!reduced,foam:!still&&tier<2,sparkle:!reduced&&tier<2,life:!still&&(phone?tier<1:tier<2)};
}
/** The flash: two pulses of FLASH_S each, the second FLASH_GAP after the first. */
export const FLASH_S=.42,FLASH_GAP=.36;
/** The trophy moment is for Rare and Legendary catches only (delight RARITY_GLOW 2 and 3); Common / Good keep the quick flow. */
export const trophyGlow=(glow:number|undefined)=>(glow??0)>=2;
export const trophyRarity=(rarity:string)=>rarity==='rare'||rarity==='legendary';
/** The close-up: ease in, hold through the slowed leap, ease out (seconds). The leap's own clock runs at SLOWMO meanwhile. */
export const CLOSEUP={in:.3,hold:2.1,out:.45} as const,SLOWMO=.5;
export const CLOSEUP_S=CLOSEUP.in+CLOSEUP.hold+CLOSEUP.out;
/** The close-up's weight 0..1 at `age` seconds (smooth in and out). */
export function closeUpWeight(age:number){if(age<0||age>=CLOSEUP_S)return 0;const s=(u:number)=>u*u*(3-2*u);
 return age<CLOSEUP.in?s(age/CLOSEUP.in):age<CLOSEUP.in+CLOSEUP.hold?1:s(1-(age-CLOSEUP.in-CLOSEUP.hold)/CLOSEUP.out);}
/** The leap's time scale during the close-up (slow motion while it holds, normal otherwise or with reduced motion). */
export const leapScale=(age:number,on:boolean)=>on&&age<CLOSEUP.in+CLOSEUP.hold?SLOWMO:1;
const TRAIL=10,FOAM_LIFE=1.1,FISHY=3;

export type SpectacleShadow={x:number;z:number;heading:number;mode:string;alpha:number;len:number;glow:number}|null;
export type SpectacleFrame={reduced:boolean;gate:SpectacleGate;surface:number;timeOfDay:string;
 /** The float is out and nothing has bitten yet (calm water: the fish under the surface may show). */
 calm:boolean;float:V2;shadow:SpectacleShadow;run:V2|null};

export function createFishingSpectacle(overlay:Overlay,inWater:(x:number,z:number)=>boolean=()=>true,rand:()=>number=Math.random){
 let stand:V2={x:0,z:0},dir:V2={x:0,z:1},clock=0;
 const flash={age:9,x:0,y:0,z:0,size:1};
 const trail=Array.from({length:TRAIL},()=>({x:0,z:0,age:9,size:.5}));let trailHead=0,trailWait=0;
 const hookFoam={age:9,x:0,z:0,size:1};
 const spark={wait:.6,age:9};
 const fishy=Array.from({length:FISHY},()=>({on:false,age:0,life:0,cx:0,cz:0,r:1,a:0,speed:.3,wait:2+rand()*6,len:.5}));
 const jump={on:false,age:0,x:0,z:0,wait:4+rand()*6,big:1};
 const spot={age:9,on:false,x:0,y:0,z:0};
 /** A point on the water in front of the angler: `out` metres along the cast, `across` to the side. */
 const at=(out:number,across:number):V2=>({x:stand.x+dir.x*out-dir.z*across,z:stand.z+dir.z*out+dir.x*across});
 return {
  begin(s:V2,d:V2){stand={...s};dir={...d};clock=0;flash.age=9;hookFoam.age=9;spark.age=9;spot.age=9;spot.on=false;jump.on=false;jump.wait=4+rand()*6;
   for(const t of trail)t.age=9;for(const f of fishy){f.on=false;f.wait=1.5+rand()*5;}},
  /** The bite: the "now!" flash round the float at (x, y, z); `g` the splash scale by the shadow's size. */
  bite(x:number,y:number,z:number,g=1){flash.age=0;flash.x=x;flash.y=y;flash.z=z;flash.size=g;},
  /** The hook: a foam patch where the fish was hooked. */
  hook(x:number,z:number,g=1){hookFoam.age=0;hookFoam.x=x;hookFoam.z=z;hookFoam.size=g;},
  /** A Rare / Legendary catch was held up: start the close-up (none with reduced motion: `on` false). */
  spotlight(on:boolean){spot.on=on;spot.age=on?0:9;},
  /** Follow the held catch for the close-up. */
  follow(x:number,y:number,z:number){spot.x=x;spot.y=y;spot.z=z;},
  /** The close-up's target and weight this frame (null when none): fishingWorld hands it to the camera. */
  get closeUp(){const w=spot.on?closeUpWeight(spot.age):0;return w>0?{x:spot.x,y:spot.y,z:spot.z,w}:null;},
  /** The leap's time scale (slow motion while the close-up holds). */
  get leapScale(){return leapScale(spot.age,spot.on);},
  get flashAge(){return flash.age;},
  frame(dt:number,f:SpectacleFrame){
   const step=Math.min(dt,.05),Y=f.surface,g=f.gate;clock+=step;
   if(spot.on){spot.age+=step;if(spot.age>=CLOSEUP_S)spot.on=false;}
   // The bite flash: always (gameplay). Two pulses; held still at mid-burst with reduced motion.
   if(flash.age<FLASH_GAP+FLASH_S){flash.age+=step;for(const o of [0,FLASH_GAP]){const k=(flash.age-o)/FLASH_S;if(k<0||k>=1)continue;
    overlay.fx('flash',flash.x,flash.y+.28,flash.z,(o?1.9:2.4)*flash.size,o?.8:1,f.reduced?.35:k);}}
   // Foam: a trail behind a fleeing shadow or a fish making a run, and the hook's patch.
   const src=g.foam?(f.run??(f.shadow&&f.shadow.mode==='flee'&&f.shadow.alpha>.2?f.shadow:null)):null;
   if(src){trailWait-=step;if(trailWait<=0){trailWait=.07;const t=trail[trailHead];trailHead=(trailHead+1)%TRAIL;t.x=src.x+(rand()-.5)*.12;t.z=src.z+(rand()-.5)*.12;t.age=0;t.size=f.run?.55:.4+Math.min(.5,(f.shadow?.len??.7)*.35);}}
   if(g.foam)for(let i=0;i<TRAIL;i++){const t=trail[i];if(t.age>=FOAM_LIFE)continue;t.age+=step;const k=t.age/FOAM_LIFE;overlay.fx('foam',t.x,Y+.008,t.z,t.size*(.6+k*.9),(1-k)*.85,i*1.7);}
   if(hookFoam.age<1.6){hookFoam.age+=step;const k=hookFoam.age/1.6;if(g.foam)overlay.fx('foam',hookFoam.x,Y+.009,hookFoam.z,(1+k*1.4)*hookFoam.size,(1-k)*.9,3.3);}
   // Sparkles over a Rare / Legendary shadow: a short twinkle every ~1.5 s while it swims in.
   const sh=f.shadow;
   if(g.sparkle&&sh&&sh.glow>=2&&sh.alpha>.2&&sh.mode!=='flee'){spark.wait-=step;if(spark.wait<=0){spark.wait=1.3+rand()*.6;spark.age=0;}
    if(spark.age<.75){spark.age+=step;const n=sh.glow>=3?5:3,k=spark.age/.75;
     for(let i=0;i<n;i++){const a=i*2.4+clock*.6,rr=sh.len*(.25+.18*(i%2)),tw=Math.sin(Math.min(1,k*1.4+i*.08)*Math.PI);if(tw<=0)continue;
      overlay.fx('glow',sh.x+Math.cos(a)*rr,Y+.07+i*.03,sh.z+Math.sin(a)*rr,(.2+.08*(sh.glow-2))*tw,tw,.5);}}}
   else spark.age=9;
   // Life on the water: a few fish just under the calm surface near the spot (not while something bites or fights).
   const showLife=g.life&&f.calm;
   for(const fi of fishy){
    if(!fi.on){if(!showLife)continue;fi.wait-=step;if(fi.wait>0)continue;
     const c=at(4+rand()*5,(rand()<.5?-1:1)*(1.6+rand()*3.4));fi.wait=6+rand()*12;
     // Never on land / the pier, and never right under the float (the cue there is the real fish).
     if(!inWater(c.x,c.z)||Math.hypot(c.x-f.float.x,c.z-f.float.z)<2.2)continue;
     Object.assign(fi,{on:true,age:0,life:6+rand()*4,cx:c.x,cz:c.z,r:.8+rand()*1.1,a:rand()*6.28,speed:(rand()<.5?-1:1)*(.18+rand()*.16),len:.38+rand()*.3});}
    fi.age+=step;if(fi.age>=fi.life||!showLife&&fi.age<fi.life-.8)fi.age=Math.max(fi.age,fi.life-.8);
    if(fi.age>=fi.life){fi.on=false;continue;}
    fi.a+=fi.speed*step/fi.r*2;const x=fi.cx+Math.cos(fi.a)*fi.r,z=fi.cz+Math.sin(fi.a)*fi.r,fade=Math.min(1,fi.age/.8,(fi.life-fi.age)/.8);
    // Heading along the circle (tangent); the mark's head is local -Z after the yaw.
    const tx=-Math.sin(fi.a)*Math.sign(fi.speed),tz=Math.cos(fi.a)*Math.sign(fi.speed);
    overlay.fx('fishy',x,Y-.03,z,fi.len*.42,fade,fi.cx,fi.len,Math.atan2(-tx,-tz));}
   // Sunset: now and then a fish jumps out there (an arc, a splash out and a splash in). It travels screen-right (the
   // fishing camera looks back along the cast, so screen right on the water is (dir.z, -dir.x)).
   if(g.life&&f.timeOfDay==='sunset'){
    if(!jump.on){jump.wait-=step;if(jump.wait<=0){jump.wait=6+rand()*9;const c=at(6+rand()*5,(rand()-.5)*7);
     if(inWater(c.x,c.z)&&Math.hypot(c.x-f.float.x,c.z-f.float.z)>2){Object.assign(jump,{on:true,age:0,x:c.x,z:c.z,big:.8+rand()*.5});overlay.ring(c.x,c.z,.55*jump.big,.8,Y+.004);overlay.burst(c.x,Y+.02,c.z,5,.6);}}}
    else{jump.age+=step;const T=.9,k=jump.age/T;
     if(k>=1){jump.on=false;const ex=jump.x+dir.z*1.3*jump.big,ez=jump.z-dir.x*1.3*jump.big;overlay.ring(ex,ez,.7*jump.big,.9,Y+.004);overlay.burst(ex,Y+.02,ez,6,.7);}
     else{const h=.75*jump.big,y=Y+4*h*k*(1-k),hx=jump.x+dir.z*1.3*jump.big*k,hz=jump.z-dir.x*1.3*jump.big*k,pitch=Math.atan2(4*h*(1-2*k),1.3*jump.big);
      overlay.fx('jumper',hx,y+.05,hz,.42*jump.big,1,pitch);}}}
   else jump.on=false;
  },
 };
}
