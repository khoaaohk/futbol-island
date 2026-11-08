/**
 * Fishing delight pass, the 3D side (Nov 7 2026, docs/fishing.md "Delight pass"). Small cosmetic life round the spot, all drawn as
 * EXTRAS in the overlay's one instanced draw (fishingOverlay.ts): no new mesh, material, texture or render target.
 * - Sparkles orbiting a rare / legendary catch as it is held up (about 1.8 s).
 * - An idle gull circling over the float while you wait, now and then calling (sound via the island kit, rate-limited there).
 * - Fireflies / lantern glows drifting over the shallows at night (a few at sunset).
 * - Very rarely, a whale or manta passing far out (a dark shape, a spout and the whale's low song).
 * - Now and then a golden glint on the water (day / sunset): cast while it shows for the glint secret (fishingDelightStore.ts).
 * Gate (fishingDelight.ts delightGate): everything here needs `rich` (no reduced motion, heat tiers 0-1, the life gate on);
 * otherwise it draws nothing and costs one boolean check a frame. Driven by the visuals' frame (only while fishing): no timers,
 * no listeners, no allocation per frame (positions come from the clock and a few numbers kept here).
 */
import type {createFishingOverlay} from './fishingOverlay';
import {AMBIENT,pickPasser} from './fishingDelight';

type Overlay=ReturnType<typeof createFishingOverlay>;
type V2={x:number;z:number};
const SURF=-.385;
const cue=(detail:string)=>{try{if(localStorage.getItem('fi2-sound-muted')==='true')return;document.dispatchEvent(new CustomEvent('fi2-job-cue',{detail}));}catch{/* sound only */}};

export function createFishingAmbient(overlay:Overlay,rand:()=>number=Math.random){
 let time='day',stand:V2={x:0,z:0},dir:V2={x:0,z:1},clock=0;
 let gullT=AMBIENT.gullWait(.5),whaleT=AMBIENT.whaleWait(.5),glintT=AMBIENT.glintWait(.5);
 const pass={on:false,age:0,kind:'whale' as 'whale'|'manta',side:1 as -1|1,spout:false};
 const glint={on:false,age:0,x:0,z:0};
 const orbit={age:9,n:0,x:0,y:0,z:0,big:1};
 return {
  begin(s:V2,d:V2,timeOfDay:string){stand={...s};dir={...d};time=timeOfDay;clock=0;pass.on=false;glint.on=false;orbit.age=9;
   gullT=AMBIENT.gullWait(rand());whaleT=AMBIENT.whaleWait(rand());glintT=AMBIENT.glintWait(rand());},
  /** A rare+ catch was held up at (x, y, z): `n` sparkles orbit it (0 = none). */
  celebrate(n:number,x:number,y:number,z:number,big=1){if(n<=0)return;orbit.age=0;orbit.n=n;orbit.x=x;orbit.y=y;orbit.z=z;orbit.big=big;},
  /** Follow the held catch (it rises with the leap). */
  follow(x:number,y:number,z:number){orbit.x=x;orbit.y=y;orbit.z=z;},
  get glintOn(){return glint.on;},
  /** `rich`: the delight gate; `waiting`: the float is out and nothing is hooked; (fx, fz): the float. */
  frame(dt:number,rich:boolean,waiting:boolean,fx:number,fz:number){
   if(!rich){pass.on=false;glint.on=false;orbit.age=9;return;}
   clock+=dt;
   // Sparkles round a rare catch: they spiral out and fade over 1.8 s.
   if(orbit.age<1.8){orbit.age+=dt;const k=orbit.age/1.8,fade=k<.15?k/.15:1-(k-.15)/.85;
    for(let i=0;i<orbit.n;i++){const a=clock*2.4+i/orbit.n*Math.PI*2,r=(.35+k*.5)*orbit.big,h=Math.sin(clock*3+i)*.15;
     overlay.extra('glow',orbit.x+Math.cos(a)*r,orbit.y+h,orbit.z+Math.sin(a)*r,.16+.08*Math.sin(clock*9+i*1.7),fade,.2);}}
   // The idle gull: circles 4-5 m above the float while you wait; a call every 25-55 s.
   if(waiting){const a=clock*.45,r=2.6;overlay.extra('gull',fx+Math.cos(a)*r,SURF+4.4+Math.sin(clock*.7)*.4,fz+Math.sin(a)*r,.6,.9,3.3);
    gullT-=dt;if(gullT<=0){gullT=AMBIENT.gullWait(rand());cue('gull');}}
   // Fireflies / lanterns over the shallows between the angler and the float (night; a few at sunset).
   const flies=AMBIENT.fireflies(time);
   for(let i=0;i<flies;i++){const s=i*1.37,t=clock*.25+s,along=1.5+((i*.618)%1)*4,side=Math.sin(t*.8+s*2)*2.2;
    const x=stand.x+dir.x*along-dir.z*side,z=stand.z+dir.z*along+dir.x*side,y=SURF+.5+Math.sin(t*1.3)*.25;
    const blink=.35+.65*Math.max(0,Math.sin(clock*1.6+s*3));overlay.extra('glow',x,y,z,.11,blink,1.5);}
   // The rare far pass: a whale or manta crossing 26-30 m out over ~22 s, with one spout (the whale) and its song.
   whaleT-=dt;if(!pass.on&&whaleT<=0&&waiting){const p=pickPasser(rand());pass.on=true;pass.age=0;pass.kind=p.kind;pass.side=p.dir;pass.spout=false;if(p.kind==='whale')cue('whale-far');}
   if(pass.on){pass.age+=dt;const k=pass.age/AMBIENT.whaleSeconds;if(k>=1){pass.on=false;whaleT=AMBIENT.whaleWait(rand());}
    else{const along=27,across=(k-.5)*30*pass.side,x=stand.x+dir.x*along-dir.z*across,z=stand.z+dir.z*along+dir.x*across,a=Math.sin(k*Math.PI)*.3;
     const yaw=Math.atan2(-dir.z*pass.side,dir.x*pass.side);
     overlay.extra('shadow',x,SURF-.3,z,pass.kind==='whale'?2.4:3.2,a,1,pass.kind==='whale'?7:2.6,yaw);
     if(pass.kind==='whale'&&!pass.spout&&k>.45){pass.spout=true;overlay.burst(x,SURF+.05,z,8,1.5);}}}
   // The golden glint (day and sunset): a sparkle on the water off to one side of the float, for a few seconds.
   if(time!=='night'){glintT-=dt;if(!glint.on&&glintT<=0&&waiting){glint.on=true;glint.age=0;const side=rand()<.5?-1:1,d=3+rand()*3;
     glint.x=fx-dir.z*side*d;glint.z=fz+dir.x*side*d;try{window.dispatchEvent(new Event('fi2-fishing-glint'));}catch{/* cosmetic */}}
    if(glint.on){glint.age+=dt;if(glint.age>=AMBIENT.glintSeconds){glint.on=false;glintT=AMBIENT.glintWait(rand());}
     else overlay.extra('glow',glint.x,SURF+.12,glint.z,.38+.12*Math.sin(clock*6),Math.min(1,glint.age*2,(AMBIENT.glintSeconds-glint.age)*2),.4);}}
  },
 };
}
