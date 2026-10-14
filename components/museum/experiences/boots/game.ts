import type {Boot,BootSpec,PartId} from './boot';
import {BUILD_ORDER,ICONS,LAYERS,MATCH_ROUND,PLATES,type PlateId,type Power} from './facts';
/**
 * boots · the rules of play, pure (tests/museum-exp-boots.cjs runs them in Node). No timers and no frames here: Experience.tsx
 * advances `stepSpin` / `ease` from the shared Paper loop only while something moves.
 */
export const TAU=Math.PI*2;
export const STEP=Math.PI/4;// 8 fixed angles (buttons, keys, reduced motion)
export const HOME=-.42;// the resting turn: the outside of the boot, toe to the right

// ── Spinning ───────────────────────────────────────────────────────────────────────────────────────────────────────────
/** θ turns the boot about its vertical axis; φ rolls it over (π = the sole up). ω is the spin speed (rad/s) after a flick. */
export type Spin={theta:number;omega:number;phi:number;phiV:number;to:number|null;phiTo:number;dragging:boolean;tv:number};
export const newSpin=():Spin=>({theta:HOME,omega:0,phi:0,phiV:0,to:null,phiTo:0,dragging:false,tv:0});
export const DRAG_RAD_PX=.0095,ROLL_RAD_PX=.011;
/** The nearest of the 8 fixed angles, offset by HOME so the first rest is the classic view. */
export const snapAngle=(t:number)=>HOME+Math.round((t-HOME)/STEP)*STEP;
/** A critically damped spring step toward a target (returns true while still moving). */
function springTo(x:number,v:number,to:number,dt:number,k=46){const d=2*Math.sqrt(k);let px=x,pv=v;const n=Math.max(1,Math.ceil(dt*240)),h=dt/n;
 for(let i=0;i<n;i++){pv+=((to-px)*k-pv*d)*h;px+=pv*h;}const done=Math.abs(to-px)<4e-4&&Math.abs(pv)<4e-3;return {x:done?to:px,v:done?0:pv,done};}
/** One step of the spin after the finger lets go: glide on the flick (friction), then settle on the nearest fixed angle. */
export function stepSpin(s:Spin,dt:number):boolean{
 if(s.dragging)return true;
 let moving=false;
 if(s.to==null){if(Math.abs(s.omega)>.55){s.theta+=s.omega*dt;s.omega*=Math.exp(-2.6*dt);moving=true;}
  else{s.to=snapAngle(s.theta+s.omega*.25);s.tv=s.omega;s.omega=0;}}
 if(s.to!=null){const r=springTo(s.theta,s.tv,s.to,dt);s.theta=r.x;s.tv=r.v;if(r.done){s.to=null;s.tv=0;s.theta=norm(s.theta);}else moving=true;}
 const p=springTo(s.phi,s.phiV,s.phiTo,dt,38);s.phi=p.x;s.phiV=p.v;if(!p.done)moving=true;
 return moving;
}
/** Keep θ in (−π, π] around HOME so numbers stay small; the picture is the same. */
export const norm=(t:number)=>{let x=t-HOME;x=((x%TAU)+TAU)%TAU;if(x>Math.PI)x-=TAU;return HOME+x;};
/** Let go of a drag: keep the flick's speed; a roll springs to upright or to the sole. */
export function release(s:Spin){s.dragging=false;s.to=null;s.phiTo=s.phi>Math.PI/2?Math.PI:0;if(Math.abs(s.omega)>9)s.omega=Math.sign(s.omega)*9;}
/** A button or key turn by one fixed angle (or the reduced-motion step). */
export function nudge(s:Spin,dir:number,reduced:boolean){const t=snapAngle((s.to??s.theta)+dir*STEP);s.omega=0;if(reduced){s.theta=norm(t);s.to=null;s.tv=0;}else{s.to=t;}}
export function flip(s:Spin,reduced:boolean,up?:boolean){s.phiTo=up!=null?(up?Math.PI:0):(s.phiTo>Math.PI/2?0:Math.PI);if(reduced){s.phi=s.phiTo;s.phiV=0;}}
export const degOf=(t:number)=>{const d=Math.round((norm(t)-HOME)*180/Math.PI);return ((d%360)+360)%360;};

/** Exponential follow that snaps to rest (explode, see-through, build placement). */
export const ease=(cur:number,to:number,dt:number,tau=.16)=>{const n=cur+(to-cur)*(1-Math.exp(-dt/tau));return Math.abs(to-n)<1.5e-3?to:n;};

// ── Build mode ─────────────────────────────────────────────────────────────────────────────────────────────────────────
/** The boot's layers in build order (from the ground up). */
export const buildOrder=(boot:Boot):PartId[]=>BUILD_ORDER.filter(id=>boot.parts.some(p=>p.id===id));
/** The next layer to place, or null when the boot is built. */
export const nextPart=(order:readonly PartId[],placed:ReadonlySet<PartId>)=>order.find(id=>!placed.has(id))??null;
/** A tap on a layer chip: right (the next layer up) or wrong, with a kid line. */
export function tryPlace(order:readonly PartId[],placed:ReadonlySet<PartId>,id:PartId,names:Record<string,{name:string}>):{ok:boolean;say:string}{
 const want=nextPart(order,placed);if(!want)return {ok:false,say:'The boot is built!'};
 if(id===want)return {ok:true,say:`${names[id].name}: in place.`};
 const below=order.indexOf(id)>order.indexOf(want);
 return {ok:false,say:below?`Not yet: the ${names[id].name.toLowerCase()} sits higher up. What goes on next, from the ground up?`:`That one is already in.`};
}
/** Build score: first-try placements out of the layers, scaled to 10. */
export const buildScore=(firstTry:number,total:number)=>total?Math.round(firstTry/total*10):0;
/** A fair shuffle for the layer chips (a seeded rng in tests), never in build order. */
export function shuffled<T>(list:readonly T[],rng:()=>number=Math.random):T[]{
 const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
 if(a.length>2&&a.every((x,i)=>x===list[i]))a.push(a.shift()!);return a;
}

// ── Superpowers ────────────────────────────────────────────────────────────────────────────────────────────────────────
export const powerOf=(id:string):Power|undefined=>ICONS.find(i=>i.id===id)?.power;
export const matchRound=()=>MATCH_ROUND.map(id=>ICONS.find(i=>i.id===id)!);

// ── Score ──────────────────────────────────────────────────────────────────────────────────────────────────────────────
export const MAX_SCORE=10+10+4;
export const total=(build:number,grip:number,power:number)=>Math.max(0,Math.min(MAX_SCORE,build+grip+power));
export function verdict(score:number){
 if(score>=21)return 'Boot master: you built it, picked the right studs and know every boot’s superpower.';
 if(score>=15)return 'Great work! You know your studs from your blades.';
 if(score>=9)return 'Good start. Try the grip test again and listen to the pitch.';
 return 'Every expert started somewhere. Have another go!';
}

// ── Layers and materials of a boot ───────────────────────────────────────────────────────────────────────────────────
/** The layer → material id of a boot (the studs show their tip when they have one: aluminium, metal). */
export function matOf(sp:BootSpec,id:PartId){
 const m=sp.mats;return ({studs:m.tip??m.studs,sole:m.sole,midsole:m.mid,insole:m.insole,counter:m.counter,foam:m.foam??'foam',lining:m.lining,upper:m.upper,toecap:m.toecap,laces:m.laces,grip:m.grip??'grip',collar:m.collar??'sock',tongue:m.tongue??m.upper} as Record<PartId,string>)[id];
}
/** Layer names for this boot (a lace cover, a soleplate, a toe box, a flat indoor sole…). */
export function namesFor(sp:BootSpec):Record<PartId,{name:string;does:string}>{
 const n={...LAYERS};
 if(sp.laces==='cover')n.laces={name:'Lace cover',does:'A flap over the laces, for a clean surface to strike the ball.'};
 if(['tpu','carbon','nylon'].includes(sp.mats.sole))n.sole={name:'Soleplate',does:'A light, stiff plate under the boot, with the studs on it.'};
 if(sp.mats.sole==='gum')n.sole={name:'Flat sole',does:'Flat rubber with grooves: it grips a smooth hall floor.'};
 if(sp.mats.mid==='board')n.midsole={name:'Inner board',does:'A thin layer stitched under the upper.'};
 if(sp.toecap==='box')n.toecap={name:'Toe box',does:'A thin layer that keeps the toe’s shape.'};
 if(sp.studs==='ic')n.studs={name:'Tread',does:'Grooves in the flat sole, instead of studs.'};
 return n;
}
export const withPlate=(sp:BootSpec,p:PlateId):BootSpec=>({...sp,studs:PLATES[p].studs,mats:{...sp.mats,studs:PLATES[p].mat,tip:PLATES[p].tip,sole:PLATES[p].sole}});
