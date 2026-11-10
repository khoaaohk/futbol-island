/**
 * The shared toy reaction library + animator (round 3A, Nov 8 2026). Pure (three.js objects only, no DOM, no clock of its own:
 * the viewer passes `now` in seconds). A reaction is a short, self-ending offset on its target: the pose root (whole-body moves)
 * or named parts (lib/gashapon/toyKit.ts). Each frame the animator puts every part back to its rest pose and adds the active
 * reactions, so overlapping reactions never drift.
 *
 * References: 'hop' (its default target), 'wiggle:tail', 'flap:wingL+wingR'. `resolveReaction` checks a reference against a
 * toy's part names (tests/gashapon-viewer.cjs runs it over every toy). FX reactions (sparkle / puff / bubbles / petal) ask the
 * viewer's one particle mesh for a short burst; 'glow' lifts the toy material's emissive.
 *
 * Reduced motion: every reaction runs at 30 % amplitude, travel (hop height, spins, loops) at 25 %, and bursts are smaller.
 */
import type * as T from 'three';

export type Off={px:number;py:number;pz:number;rx:number;ry:number;rz:number;sx:number;sy:number;sz:number};
export type FxKind='sparkle'|'puff'|'bubbles'|'petal';
type Def={dur:number;target:'root'|'part'|'parts';part?:string;fx?:FxKind;glow?:boolean;
 /** t: 0..1 through the reaction; side: +1 for parts on the +x side, -1 on the −x side; a: amplitude (1, or 0.3 reduced). */
 apply?:(t:number,o:Off,a:number,side:number,travel:number)=>void};

const PI=Math.PI,bump=(t:number)=>Math.sin(PI*Math.min(1,Math.max(0,t))),decay=(t:number)=>1-t,ease=(t:number)=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
const osc=(t:number,n:number)=>Math.sin(t*PI*2*n);

export const REACTIONS:Record<string,Def>={
 squash:{dur:.55,target:'root',apply:(t,o,a)=>{const k=osc(t,1.5)*decay(t)*a;o.sy*=1-.26*k;o.sx*=1+.16*k;o.sz*=1+.16*k;}},
 stretch:{dur:.6,target:'root',apply:(t,o,a)=>{const k=bump(t)*a;o.sy*=1+.22*k;o.sx*=1-.09*k;o.sz*=1-.09*k;}},
 jiggle:{dur:.5,target:'root',apply:(t,o,a)=>{const k=osc(t,5)*decay(t)*a;o.sx*=1+.07*k;o.sz*=1+.07*k;o.sy*=1-.07*k;o.rz+=.05*k;}},
 hop:{dur:.62,target:'root',apply:(t,o,a,_s,tr)=>{const up=t<.15?0:t>.9?0:4*((t-.15)/.75)*(1-(t-.15)/.75);o.py+=.32*up*tr;
  const sq=(t<.15?bump(t/.15):t>.88?bump((t-.88)/.12):0)*a;o.sy*=1-.18*sq;o.sx*=1+.1*sq;o.sz*=1+.1*sq;if(t>.15&&t<.9)o.sy*=1+.06*a;}},
 bounce:{dur:1.05,target:'root',apply:(t,o,a,_s,tr)=>{const n=3,u=(t*n)%1,h=[1,.6,.35][Math.min(2,Math.floor(t*n))];o.py+=.2*h*4*u*(1-u)*tr;const sq=u<.12||u>.92?.12*a:0;o.sy*=1-sq;o.sx*=1+sq*.6;o.sz*=1+sq*.6;}},
 spin:{dur:.8,target:'root',apply:(t,o,_a,_s,tr)=>{o.ry+=PI*2*ease(t)*(tr<1?.25:1);}},
 twirl:{dur:.9,target:'root',apply:(t,o,_a,_s,tr)=>{o.ry+=PI*2*ease(t)*(tr<1?.25:1);o.py+=.22*bump(t)*tr;}},
 wobble:{dur:.9,target:'root',apply:(t,o,a)=>{o.rz+=.24*osc(t,2.5)*decay(t)*a;}},
 rock:{dur:1.2,target:'root',apply:(t,o,a)=>{o.rz+=.38*osc(t,1.5)*decay(t)*a;o.rx+=.08*osc(t,1.5)*decay(t)*a;}},
 tip:{dur:1,target:'root',apply:(t,o,a)=>{const k=t<.35?ease(t/.35):t<.55?1:1-ease((t-.55)/.45);o.rx+=-1.1*k*a+.12*osc(Math.max(0,t-.55),3)*decay(t)*a;}},
 bow:{dur:.8,target:'root',apply:(t,o,a)=>{o.rx+=.42*bump(t)*a;}},
 nod:{dur:.7,target:'part',part:'head',apply:(t,o,a)=>{o.rx+=.22*osc(t,2)*decay(t)*a;}},
 shake:{dur:.6,target:'root',apply:(t,o,a)=>{o.ry+=.3*osc(t,3)*decay(t)*a;}},
 sway:{dur:1.3,target:'root',apply:(t,o,a)=>{o.rz+=.14*osc(t,1)*a;}},
 swim:{dur:1.2,target:'root',apply:(t,o,a,_s,tr)=>{o.px+=.16*osc(t,1)*tr;o.ry+=.45*osc(t,1)*a;o.py+=.08*bump(t)*tr;}},
 glide:{dur:1.1,target:'root',apply:(t,o,a,_s,tr)=>{o.py+=.2*bump(t)*tr;o.rz+=.18*osc(t,1)*a;o.px+=.1*osc(t,.5)*tr;}},
 loop:{dur:1.2,target:'root',apply:(t,o,a,_s,tr)=>{const k=ease(t);o.py+=.3*(1-Math.cos(PI*2*k))*.5*tr;o.pz+=.18*Math.sin(PI*2*k)*tr;o.rx+=-PI*2*k*(tr<1?0:1);if(tr<1)o.rx+=.2*bump(t)*a;}},
 flip:{dur:.9,target:'root',apply:(t,o,a,_s,tr)=>{o.py+=.4*bump(t)*tr;o.rx+=-PI*2*ease(t)*(tr<1?0:1);if(tr<1)o.sy*=1+.05*bump(t)*a;}},
 kickup:{dur:.7,target:'root',apply:(t,o,a,_s,tr)=>{o.py+=.24*bump(t)*tr;o.rx+=-.5*bump(t*1.3)*a;}},
 blink:{dur:.26,target:'part',part:'eyes',apply:(t,o)=>{o.sy*=1-.9*bump(t);}},
 wink:{dur:.4,target:'part',part:'eyeR',apply:(t,o)=>{o.sy*=1-.9*bump(t);}},
 wiggle:{dur:.8,target:'parts',apply:(t,o,a)=>{o.rz+=.38*osc(t,3.5)*decay(t)*a;}},
 swish:{dur:.8,target:'parts',apply:(t,o,a)=>{o.ry+=.6*osc(t,3)*decay(t)*a;}},
 wave:{dur:1.1,target:'parts',apply:(t,o,a,side)=>{const up=t<.2?ease(t/.2):t>.8?1-ease((t-.8)/.2):1;o.rz+=side*(1.1*up+.35*osc(t,3)*up)*a;}},
 flap:{dur:.9,target:'parts',apply:(t,o,a,side)=>{o.rz+=side*.65*Math.abs(osc(t,3))*decay(t*.6)*a;}},
 clap:{dur:.7,target:'parts',apply:(t,o,a,side)=>{o.px+=-side*.06*Math.abs(osc(t,2))*a;}},
 peek:{dur:.75,target:'parts',apply:(t,o,a,_s,tr)=>{o.py+=.14*bump(t)*Math.max(tr,a);}},
 pop:{dur:.5,target:'parts',apply:(t,o,a)=>{const k=1+.32*bump(t)*a;o.sx*=k;o.sy*=k;o.sz*=k;}},
 kick:{dur:.5,target:'parts',apply:(t,o,a)=>{o.rx+=-1.1*bump(t)*a;}},
 tilt:{dur:.8,target:'parts',apply:(t,o,a)=>{o.rz+=.35*bump(t)*a;}},
 glow:{dur:1.1,target:'root',glow:true},
 sparkle:{dur:.9,target:'root',fx:'sparkle'},
 puff:{dur:.9,target:'root',fx:'puff'},
 bubbles:{dur:1,target:'root',fx:'bubbles'},
 petal:{dur:1.6,target:'root',fx:'petal'},
 // Added for the Coral Cay sweets / bento and Cabinet Heroes toys (Nov 8 2026); nothing above changed.
 beat1:{dur:.9,target:'parts',apply:(t,o,a)=>{const k=bump(t*3)*a;o.sy*=1-.24*k;o.sx*=1+.15*k;o.sz*=1+.15*k;}},// three parts squish in turn
 beat2:{dur:.9,target:'parts',apply:(t,o,a)=>{const k=bump(t*3-1)*a;o.sy*=1-.24*k;o.sx*=1+.15*k;o.sz*=1+.15*k;}},
 beat3:{dur:.9,target:'parts',apply:(t,o,a)=>{const k=bump(t*3-2)*a;o.sy*=1-.24*k;o.sx*=1+.15*k;o.sz*=1+.15*k;}},
 stretchsnap:{dur:.85,target:'root',apply:(t,o,a)=>{const k=(t<.4?ease(t/.4):Math.cos((t-.4)/.6*PI*2.5)*(1-(t-.4)/.6)**2)*a;o.sy*=1+.42*k;o.sx*=1-.14*k;o.sz*=1-.14*k;}},
 boingy:{dur:.85,target:'root',apply:(t,o,a,_s,tr)=>{const k=osc(t,3)*decay(t)*a;o.sy*=1+.2*k;o.sx*=1-.1*k;o.sz*=1-.1*k;o.py+=.05*Math.abs(osc(t,1.5))*decay(t)*tr;}},
 rattle:{dur:.5,target:'parts',apply:(t,o,a)=>{o.px+=.03*osc(t,8)*decay(t)*a;o.py+=.012*Math.abs(osc(t,8))*a;}},
 chomp:{dur:.8,target:'parts',apply:(t,o,a)=>{o.rx+=-.42*Math.abs(osc(t,1))*a;}},// a hinged top opens and shuts twice
 lidopen:{dur:1.6,target:'parts',apply:(t,o,a)=>{const k=t<.22?ease(t/.22):t<.7?1:1-ease((t-.7)/.3);o.rx+=(-1.2*k+.06*osc(t,4)*k)*a;}},
 rollup:{dur:.9,target:'root',apply:(t,o,a)=>{const k=bump(t)*a;o.sz*=1-.26*k;o.sy*=1+.1*k;o.rx+=-.32*Math.sin(PI*2*t)*a;}},
 drip:{dur:1.1,target:'parts',apply:(t,o,a,_s,tr)=>{if(t<.7){const u=t/.7;o.py-=.16*ease(u)*Math.max(tr,a);o.sy*=1+.4*u*a;}else{const u=ease((t-.7)/.3);o.sx*=u;o.sy*=u;o.sz*=u;}}},
 hothot:{dur:.75,target:'root',apply:(t,o,a,_s,tr)=>{o.py+=.08*Math.abs(Math.sin(PI*4*t))*tr*(1-t*.4);o.rz+=.08*osc(t,5)*decay(t)*a;}},
 point:{dur:1.3,target:'parts',apply:(t,o,a,side)=>{const up=t<.2?ease(t/.2):t>.8?1-ease((t-.8)/.2):1;o.rz+=side*(1.3*up+.12*osc(t,2)*up)*a;o.rx+=-.5*up*a;}},
 circle:{dur:1.4,target:'root',apply:(t,o,a,_s,tr)=>{const k=ease(t)*PI*2;o.px+=.14*Math.sin(k)*tr;o.pz+=.1*(1-Math.cos(k))*tr;o.ry+=k*(tr<1?.25:1);o.rz+=.08*bump(t)*a;}},
 kneeslide:{dur:1.25,target:'root',apply:(t,o,a,_s,tr)=>{const k=t<.35?ease(t/.35):t<.7?1:1-ease((t-.7)/.3);o.pz+=.24*k*tr;o.rx+=-.35*k*a;o.sy*=1-.1*k*a;}},
 shoot:{dur:.95,target:'parts',apply:(t,o,a,_s,tr)=>{const m=Math.max(tr,.35);if(t<.55){const u=t/.55;o.pz+=.45*u*m;o.py+=(1.2*u*(1-u)+.05*u)*m;o.rx+=-u*7;}
  else if(t<.62){o.sx*=0;o.sy*=0;o.sz*=0;}else{const u=ease((t-.62)/.38);o.sx*=u;o.sy*=u;o.sz*=u;}void a;}},// a ball flies off, then a new one pops in
 sprint:{dur:1,target:'parts',apply:(t,o,a,side)=>{o.rx+=side*.75*osc(t,3.5)*(t<.85?1:(1-t)/.15)*a;}},
 sidestep:{dur:.7,target:'root',apply:(t,o,a,_s,tr)=>{const k=Math.sin(PI*2*ease(t));o.px+=.17*k*tr;o.rz+=-.14*k*a;}},
 juggle:{dur:1.2,target:'parts',apply:(t,o,a,_s,tr)=>{const u=(t*3)%1;o.py+=.24*4*u*(1-u)*Math.max(tr,a);o.rx+=t*9*a;}},
 flipup:{dur:.55,target:'parts',apply:(t,o,a)=>{const k=t<.16?ease(t/.16):1-ease((t-.16)/.84);o.rz+=.8*k*a;}},
 slide:{dur:.85,target:'root',apply:(t,o,a,_s,tr)=>{o.px+=.22*Math.sin(PI*Math.min(1,t/.75))*tr;if(t>.75){const u=bump((t-.75)/.25)*a;o.sy*=1-.08*u;o.sx*=1+.05*u;}}},
 zip:{dur:.6,target:'parts',apply:(t,o,a,_s,tr)=>{o.px+=.12*bump(t)*Math.max(tr,a);o.sx*=1+.3*bump(t)*a;}},
 grab:{dur:1.4,target:'parts',apply:(t,o,a,_s,tr)=>{const k=t<.3?ease(t/.3):t<.6?1:1-ease((t-.6)/.4);o.py-=.14*k*Math.max(tr,a);}},
 dangle:{dur:1.6,target:'parts',apply:(t,o,a)=>{o.rz+=.3*osc(t,1.5)*decay(t)*a;}},
};
// Added for the Boots & Kits, Trophies & Legends and Rides & Rollers toys (batch D, Nov 8 2026; every name starts d_); nothing above changed.
const dSpringBack=(t:number,at:number,n:number)=>t<at?ease(t/at):Math.cos((t-at)/(1-at)*PI*n)*(1-(t-at)/(1-at))**2;
const dHoldEnv=(t:number,up:number,down:number)=>t<up?ease(t/up):t<down?1:1-ease((t-down)/(1-down));
Object.assign(REACTIONS,{
 d_toetap:{dur:.75,target:'parts',apply:(t,o,a)=>{o.rz+=-.32*Math.abs(Math.sin(PI*2*t))*decay(t*.4)*a;}},// pivot at the toe: the heel lifts twice
 d_bendpop:{dur:.9,target:'root',apply:(t,o,a)=>{const k=dSpringBack(t,.3,3)*a;o.rx+=.32*k;o.sy*=1-.06*Math.max(0,k);}},
 d_leap:{dur:.85,target:'root',apply:(t,o,a,_s,tr)=>{const u=Math.min(1,Math.max(0,(t-.12)/.76));o.py+=.42*4*u*(1-u)*tr;o.pz+=.16*Math.sin(PI*u)*tr;o.rx+=-.3*bump(u)*a;
  const sq=(t<.12?bump(t/.12):t>.88?bump((t-.88)/.12):0)*a;o.sy*=1-.2*sq;o.sx*=1+.12*sq;o.sz*=1+.12*sq;if(u>0&&u<1)o.sy*=1+.1*a;}},
 d_catch:{dur:1.1,target:'parts',apply:(t,o,a,_s,tr)=>{const u=Math.min(1,t/.5);o.py+=.6*(1-u*u)*Math.max(tr,.5);const s=Math.min(1,t*8);o.sx*=s;o.sy*=s;o.sz*=s;
  if(t>.5){const k=bump((t-.5)/.25)*a;o.sy*=1-.25*k;o.sx*=1+.15*k;o.sz*=1+.15*k;}}},// a ball drops in from above and is caught
 d_widen:{dur:.9,target:'root',apply:(t,o,a)=>{const k=dSpringBack(t,.4,2.5)*a;o.sx*=1+.32*k;o.sz*=1+.32*k;o.sy*=1-.12*k;}},
 d_spring:{dur:1.2,target:'parts',apply:(t,o,a)=>{o.rz+=-.5*dSpringBack(t,.22,4)*a;}},
 d_flutter:{dur:.8,target:'parts',apply:(t,o,a)=>{o.ry+=.38*osc(t,6)*decay(t)*a;o.sy*=1+.05*osc(t,6)*a;}},
 d_flagwave:{dur:1.4,target:'parts',apply:(t,o,a)=>{o.rz+=.42*Math.sin(PI*3*t)*bump(t)*a;}},
 d_lift:{dur:1.5,target:'root',apply:(t,o,a,_s,tr)=>{const k=dHoldEnv(t,.28,.72);o.py+=.3*k*Math.max(tr,.3);o.rz+=.06*osc(t,2)*k*a;o.sy*=1+.05*k*a;}},
 d_ring:{dur:.7,target:'root',apply:(t,o,a)=>{const k=osc(t,10)*decay(t)*a;o.rz+=.035*k;o.sx*=1+.025*k;o.sz*=1+.025*k;}},
 d_spinpart:{dur:.9,target:'parts',apply:(t,o,_a,_s,tr)=>{o.ry+=PI*2*ease(t)*(tr<1?.25:1);}},
 d_toot:{dur:1.2,target:'parts',apply:(t,o,a)=>{const k=bump((t*3)%1)*a;o.sx*=1+.1*k;o.sy*=1+.14*k;o.sz*=1+.1*k;}},// three puffs (full time)
 d_chant:{dur:1.3,target:'root',apply:(t,o,a,_s,tr)=>{o.py+=.06*Math.abs(Math.sin(PI*4*t))*tr;o.rz+=.12*Math.sin(PI*2*t)*a;}},
 d_panelspin:{dur:1,target:'parts',apply:(t,o,_a,_s,tr)=>{o.ry+=PI*4/5*ease(t)*(tr<1?.25:1);}},// two fifths of a turn: a 5-fold panel ball looks the same after
 d_tvflicker:{dur:.6,target:'root',apply:(t,o,a)=>{const sq=osc(t,9)>0?1:-1,k=sq*decay(t)*a;o.sx*=1+.05*k;o.sy*=1-.035*k;o.px+=.012*k;}},
 d_rip1:{dur:1,target:'parts',apply:(t,o,a,_s,tr)=>{const k=bump(t*2.5);o.py+=.06*k*Math.max(tr,a);o.sy*=1+.25*k*a;}},// a crowd wave, four blocks in turn
 d_rip2:{dur:1,target:'parts',apply:(t,o,a,_s,tr)=>{const k=bump(t*2.5-.5);o.py+=.06*k*Math.max(tr,a);o.sy*=1+.25*k*a;}},
 d_rip3:{dur:1,target:'parts',apply:(t,o,a,_s,tr)=>{const k=bump(t*2.5-1);o.py+=.06*k*Math.max(tr,a);o.sy*=1+.25*k*a;}},
 d_rip4:{dur:1,target:'parts',apply:(t,o,a,_s,tr)=>{const k=bump(t*2.5-1.5);o.py+=.06*k*Math.max(tr,a);o.sy*=1+.25*k*a;}},
 d_lampblink:{dur:.9,target:'parts',apply:(t,o,a)=>{const k=(osc(t,3)>0?1:0)*decay(t*.5)*a;o.sx*=1+.3*k;o.sy*=1+.3*k;o.sz*=1+.3*k;}},
 d_rollfb:{dur:1.1,target:'root',apply:(t,o,a,_s,tr)=>{o.px+=.14*Math.sin(PI*2*t)*tr;o.rz+=-.05*Math.cos(PI*2*t)*bump(t)*a;}},
 d_wheelroll:{dur:1.1,target:'parts',apply:(t,o,_a,_s,tr)=>{o.rz+=-1.7*Math.sin(PI*2*t)*tr;}},// turns with d_rollfb
 d_tailwhip:{dur:.8,target:'parts',apply:(t,o,_a,_s,tr)=>{o.ry+=PI*2*ease(t)*(tr<1?.25:1);}},
 d_crank:{dur:1.1,target:'parts',apply:(t,o,a)=>{o.rz+=-PI*4*ease(t)*Math.max(a,.25);}},
 d_wheelie:{dur:1.3,target:'root',apply:(t,o,a)=>{const th=.42*dHoldEnv(t,.3,.65)*a,R=.32;o.rz+=th;o.px+=-R*(1-Math.cos(th));o.py+=R*Math.sin(th);}},// pivots on the back wheel at x = −0.32
 d_putter:{dur:.95,target:'root',apply:(t,o,a)=>{const d=t<.85?1:(1-t)/.15;o.py+=.016*Math.abs(osc(t,8))*a*d;o.rz+=.02*osc(t,8)*a*d;o.sy*=1+.025*osc(t,16)*a*d;}},
 d_hover:{dur:1.7,target:'root',apply:(t,o,a,_s,tr)=>{const k=dHoldEnv(t,.3,.72);o.py+=(.22*k+.025*Math.sin(PI*6*t)*k)*Math.max(tr,.3);o.rz+=.04*osc(t,1.5)*k*a;}},
 d_sputter:{dur:.85,target:'root',apply:(t,o,a)=>{const k=decay(t)*a;o.px+=.02*osc(t,13)*k;o.rz+=.06*osc(t,7)*k;o.py+=.03*Math.abs(osc(t,5))*k;}},
 d_flame:{dur:.85,target:'parts',apply:(t,o,a)=>{const k=a*decay(t*.6);o.sy*=1+.45*osc(t,7)*k;o.sx*=1-.1*osc(t,7)*k;}},
 d_bob:{dur:1.7,target:'parts',apply:(t,o,a,_s,tr)=>{const k=decay(t*.7);o.py+=.04*osc(t,2)*k*Math.max(tr,a);o.rz+=.1*osc(t,1.5)*k*a;o.rx+=.05*osc(t,2.5)*k*a;}},
 d_sweep:{dur:1.7,target:'parts',apply:(t,o,_a,_s,tr)=>{o.ry+=PI*2*ease(t)*(tr<1?.25:1);}},
} satisfies Record<string,Def>);
// Added for the Pixel Pitch, Beach Day and Shell Seekers toys (batch C, Nov 8 2026; every name starts c_); nothing above changed.
const cEnv=(t:number,up:number,down:number)=>t<up?ease(t/up):t<down?1:1-ease((t-down)/(1-down));
/** A ball / coin of centre height h rolling sideways along x on the floor (the root pivots at the floor, so the centre is kept on its line). */
const cRoll=(h:number,dist:number,R:number):Def['apply']=>(t,o,_a,_s,tr)=>{const d=dist*Math.sin(PI*t)*tr,th=-d/R;o.rz+=th;o.px+=d+h*Math.sin(th);o.py+=h-h*Math.cos(th);};
Object.assign(REACTIONS,{
 c_squarehop:{dur:1.2,target:'root',apply:(t,o,_a,_s,tr)=>{const q=Math.min(.999,Math.floor(t*16)/16)*4,seg=Math.floor(q),u=q-seg,h=.24*tr,P=[[0,0],[0,h],[h,h],[h,0],[0,0]];
  o.px+=P[seg][0]+(P[seg+1][0]-P[seg][0])*u;o.py+=P[seg][1]+(P[seg+1][1]-P[seg][1])*u;}},// an 8-bit hop round a square, in grid steps
 c_pixelshrink:{dur:.8,target:'root',apply:(t,o,a)=>{const s=1-.32*Math.round(cEnv(t,.3,.6)*4)/4*a;o.sx*=s;o.sy*=s;o.sz*=s;}},// shrinks in steps, then steps back
 c_dive:{dur:1.4,target:'root',apply:(t,o,a,_s,tr)=>{const side=t<.5?-1:1,k=bump((t%.5)/.5);o.rz+=-side*1.2*k*a;o.px+=side*.26*k*tr;o.py+=.06*k*tr;}},// left, then right
 c_punch:{dur:.55,target:'parts',apply:(t,o,a,_s,tr)=>{const k=t<.25?ease(t/.25):1-ease((t-.25)/.75);o.rx+=.9*k*a;o.pz+=.06*k*Math.max(tr,a);}},
 c_cardup:{dur:1.3,target:'parts',apply:(t,o,a,side)=>{const up=cEnv(t,.2,.75);o.rz+=side*(2.6*up+.08*osc(t,3)*up)*a;}},// an arm straight up, card high
 c_pointdown:{dur:1.3,target:'parts',apply:(t,o,a,side)=>{const up=cEnv(t,.2,.75);o.rx+=-1.2*up*a;o.rz+=side*.2*up*a;}},// forward and down, at the spot
 c_unroll:{dur:1.1,target:'parts',apply:(t,o,a)=>{const k=cEnv(t,.35,.6)*a;o.sx*=1+.7*k;o.sy*=1+.25*k;}},
 c_spinflat:{dur:.9,target:'parts',apply:(t,o,_a,_s,tr)=>{o.ry+=PI*2*ease(t)*(tr<1?.25:1);}},
 c_glideback:{dur:1.1,target:'parts',apply:(t,o,a,_s,tr)=>{o.px+=.32*bump(t)*Math.max(tr,a);o.rz+=-.06*bump(t)*a;}},
 c_flash:{dur:.9,target:'parts',apply:(t,o,a)=>{const on=Math.floor(t*8)%2===0?1:0,k=1+.2*on*a*(1-t);o.sx*=k;o.sy*=k;}},// blinks bigger, arcade style
 c_roll:{dur:1.1,target:'root',apply:cRoll(.44,.24,.4)},
 c_coinroll:{dur:1.2,target:'root',apply:cRoll(.43,.26,.38)},
 c_crumble:{dur:1.2,target:'parts',apply:(t,o,a,_s,tr)=>{const k=cEnv(t,.3,.55);o.py-=.1*k*Math.max(tr,a);o.rz+=.3*k*a;if(t>.55){const p=bump((t-.55)/.45)*a;o.sx*=1+.3*p;o.sy*=1+.3*p;o.sz*=1+.3*p;}}},
 c_dooropen:{dur:1.4,target:'parts',apply:(t,o,a)=>{o.ry+=-1.5*cEnv(t,.22,.7)*Math.max(a,.4);}},// hinged on its left edge
 c_flapflop:{dur:1,target:'root',apply:(t,o,a)=>{o.rx+=.3*osc(t,2.5)*decay(t)*a;}},
 c_slap:{dur:.7,target:'root',apply:(t,o,a)=>{const k=t<.18?ease(t/.18):Math.cos((t-.18)/.82*PI*2)*(1-(t-.18)/.82)**2;o.rx+=.5*k*a;}},
 c_bend:{dur:1.1,target:'root',apply:(t,o,a)=>{o.rz+=.2*osc(t,1.5)*decay(t)*a;o.rx+=.08*osc(t,1.5+.25)*decay(t)*a;o.sy*=1-.05*bump(t)*a;}},
 c_surf:{dur:1.4,target:'root',apply:(t,o,a,_s,tr)=>{o.px+=.22*Math.sin(PI*2*t)*tr;o.py+=.1*bump(t)*tr;o.rz+=-.24*Math.cos(PI*2*t)*bump(t)*a;}},
 c_brimflop:{dur:1,target:'parts',apply:(t,o,a)=>{o.rx+=.2*osc(t,2.5)*decay(t)*a;o.rz+=.12*osc(t,2)*decay(t)*a;}},
 c_tiphat:{dur:1,target:'root',apply:(t,o,a,_s,tr)=>{const k=cEnv(t,.25,.55);o.rz+=.3*k*a;o.rx+=-.12*k*a;o.py+=.08*k*tr;}},
 c_curl:{dur:.9,target:'parts',apply:(t,o,a)=>{const k=cEnv(t,.3,.55)*a,s=1-.3*k;o.sx*=s;o.sy*=s;o.sz*=1+.25*k;}},// every arm pulls in to the middle
 c_reach:{dur:1,target:'parts',apply:(t,o,a)=>{const k=1+.28*cEnv(t,.2,.7)*a;o.sx*=k;o.sy*=k;}},
 c_starspin:{dur:1,target:'parts',apply:(t,o,_a,_s,tr)=>{o.rz+=-PI*2*ease(t)*(tr<1?.25:1);o.py+=.08*bump(t)*tr;}},
 c_hide:{dur:1.3,target:'parts',apply:(t,o,a,_s,tr)=>{const k=cEnv(t,.2,.7),s=1-.35*k*a;o.pz-=.12*k*Math.max(tr,a);o.py-=.03*k*a;o.sx*=s;o.sy*=s;o.sz*=s;}},
 c_scuttle:{dur:1,target:'root',apply:(t,o,a,_s,tr)=>{o.px+=.18*Math.sin(PI*2*ease(t))*tr;o.py+=.025*Math.abs(osc(t,6))*tr;o.rz+=.05*osc(t,6)*a;}},
 c_crack:{dur:.55,target:'root',apply:(t,o,a)=>{o.rz+=.06*osc(t,7)*decay(t)**2*a;o.sy*=1-.05*bump(t*4)*a;}},
 c_toot:{dur:1,target:'root',apply:(t,o,a)=>{const k=cEnv(t,.2,.6)*a;o.sy*=1+.14*k;o.rx+=-.22*k;}},
 c_echo:{dur:1.2,target:'root',apply:(t,o,a)=>{o.rz+=.1*osc(t,3)*(1-t)**2*a;o.sy*=1+.05*Math.abs(osc(t,3))*(1-t)*a;}},
 c_tune:{dur:1.6,target:'root',apply:(t,o,a,_s,tr)=>{o.rz+=.12*osc(t,2)*a;o.py+=.04*Math.abs(osc(t,4))*tr;}},
 c_header:{dur:.7,target:'parts',apply:(t,o,a,_s,tr)=>{const k=t<.3?ease(t/.3):1-ease((t-.3)/.7);o.rx+=.7*k*a;o.pz+=.05*k*Math.max(tr,a);}},
 c_ruffle:{dur:.6,target:'root',apply:(t,o,a)=>{const k=decay(t)*a;o.sx*=1+.07*osc(t,9)*k;o.sz*=1-.05*osc(t,9)*k;o.rz+=.04*osc(t,11)*k;}},
} satisfies Record<string,Def>);
// Added for the Bug Squad, Reef Friends and Summit Orchard toys (batch E, Nov 8 2026; every name starts e_); nothing above changed.
const eEnv=(t:number,up:number,down:number)=>t<up?ease(t/up):t<down?1:1-ease((t-down)/(1-down));
const eClamp=(t:number)=>Math.min(1,Math.max(0,t));
Object.assign(REACTIONS,{
 // Bug Squad
 e_caseopen:{dur:1.2,target:'parts',apply:(t,o,a,side)=>{o.rz+=side*.75*eEnv(t,.2,.7)*Math.max(a,.4);}},// wing cases hinge up at the seam
 e_buzz:{dur:.75,target:'parts',apply:(t,o,a,side)=>{o.rz+=side*.3*osc(t,13)*decay(t)*a;}},
 e_flyhop:{dur:1.1,target:'root',apply:(t,o,a,_s,tr)=>{const k=bump(t);o.py+=.3*k*tr;o.pz+=.08*Math.sin(PI*2*t)*tr;o.rx+=-.15*k*a;o.rz+=.05*osc(t,6)*k*a;}},
 e_count:{dur:1.3,target:'parts',part:'head',apply:(t,o,a)=>{const s=t<.333?-1:t<.666?1:0,k=bump((t%.333)/.333);o.rz+=s*.22*k*a;o.rx+=.14*k*a;}},// looks left, right, nods
 e_legspring:{dur:.9,target:'parts',apply:(t,o,a)=>{o.rx+=.6*dSpringBack(t,.18,3)*a;}},
 e_chirpleg:{dur:.7,target:'parts',apply:(t,o,a)=>{o.rx+=.12*osc(t,9)*decay(t)*a;}},
 e_bighop:{dur:1,target:'root',apply:(t,o,a,_s,tr)=>{const u=eClamp((t-.12)/.76);o.py+=.55*4*u*(1-u)*tr;
  const sq=(t<.12?bump(t/.12):t>.88?bump((t-.88)/.12):0)*a;o.sy*=1-.22*sq;o.sx*=1+.12*sq;o.sz*=1+.12*sq;if(u>0&&u<1)o.sy*=1+.12*a;}},
 e_march:{dur:1.2,target:'root',apply:(t,o,a,_s,tr)=>{o.py+=.03*Math.abs(Math.sin(PI*6*t))*tr;o.rz+=.05*Math.sin(PI*6*t)*a;}},
 e_liftcrumb:{dur:1.4,target:'parts',apply:(t,o,a,_s,tr)=>{const k=eEnv(t,.25,.7);o.py+=.1*k*Math.max(tr,a);o.rz+=.04*osc(t,7)*k*a;}},
 e_dart:{dur:1,target:'root',apply:(t,o,a,_s,tr)=>{const x=t<.3?-ease(t/.3):t<.65?-1+2*ease((t-.3)/.35):1-ease((t-.65)/.35);o.px+=.18*x*tr;o.rz+=-.12*x*a;}},
 e_lanternpulse:{dur:.8,target:'parts',apply:(t,o,a)=>{const s=1+.14*bump(t)*a;o.sx*=s;o.sy*=s;o.sz*=s;}},
 e_flash3:{dur:1.2,target:'parts',apply:(t,o,a)=>{const k=t<.4?bump(t/.4):t<.5?0:t<.65?bump((t-.5)/.15):t<.75?0:t<.9?bump((t-.75)/.15):0,s=1+.13*k*a;o.sx*=s;o.sy*=s;o.sz*=s;}},// long, short, short
 e_wingfold:{dur:1.3,target:'parts',apply:(t,o,a,side)=>{o.ry+=side*1.25*eEnv(t,.25,.7)*Math.max(a,.35);}},// both wings swing back over the body
 e_flutter:{dur:.9,target:'parts',apply:(t,o,a,side)=>{o.ry+=side*.55*Math.abs(osc(t,4))*decay(t*.7)*a;}},
 e_wingspread:{dur:1.4,target:'parts',apply:(t,o,a,side)=>{const k=eEnv(t,.2,.75)*a;o.rz+=side*.2*k;o.sx*=1+.12*k;o.sy*=1+.12*k;}},
 // Reef Friends
 e_grin:{dur:1,target:'parts',part:'mouth',apply:(t,o,a)=>{const k=eEnv(t,.2,.7)*a;o.sx*=1+.45*k;o.sy*=1+.2*k;}},
 e_wriggle:{dur:.8,target:'root',apply:(t,o,a)=>{o.ry+=.3*osc(t,4)*decay(t)*a;o.rz+=.06*osc(t,8)*decay(t)*a;}},
 e_hidedart:{dur:1.4,target:'parts',apply:(t,o,a,_s,tr)=>{const k=eEnv(t,.15,.65),m=Math.max(tr,a),s=1-.25*k*a;o.px-=.16*k*m;o.pz-=.1*k*m;o.ry+=-.5*k*a;o.sx*=s;o.sy*=s;o.sz*=s;}},
 e_recoil:{dur:.7,target:'root',apply:(t,o,a,_s,tr)=>{const k=t<.15?ease(t/.15):1-ease((t-.15)/.85);o.pz-=.1*k*tr;o.sy*=1+.08*k*a;}},
 e_jugA:{dur:1.3,target:'parts',apply:(t,o,a,_s,tr)=>{const v=eClamp(t/.75),u=(v*2)%1;if(v<1){o.py+=.3*4*u*(1-u)*Math.max(tr,a);o.rx+=v*8*a;}}},// two throws, then B's two
 e_jugB:{dur:1.3,target:'parts',apply:(t,o,a,_s,tr)=>{const v=eClamp((t-.25)/.75),u=(v*2)%1;if(v>0&&v<1){o.py+=.3*4*u*(1-u)*Math.max(tr,a);o.rx+=v*8*a;}}},
 e_mantaflap:{dur:1.4,target:'parts',apply:(t,o,a,side)=>{o.ry+=side*.65*Math.sin(PI*3*t)*bump(t)*a;}},// slow, deep wing beats
 e_partglide:{dur:1.3,target:'parts',apply:(t,o,a,_s,tr)=>{o.py+=.14*bump(t)*Math.max(tr,a);o.rz+=.16*osc(t,1)*a;o.px+=.06*osc(t,.5)*tr;}},
 e_partloop:{dur:1.4,target:'parts',apply:(t,o,a,_s,tr)=>{const k=ease(t),m=Math.max(tr,.25);o.py+=.26*(1-Math.cos(PI*2*k))*.5*m;o.pz+=.14*Math.sin(PI*2*k)*m;o.rx+=-PI*2*k*(tr<1?0:1);if(tr<1)o.rx+=.2*bump(t)*a;}},
 e_tuck:{dur:1.5,target:'parts',apply:(t,o,a)=>{const s=1-.8*eEnv(t,.2,.7)*Math.max(a,.5);o.sx*=s;o.sy*=s;o.sz*=s;}},// head and flippers pull into the shell
 e_slowblink:{dur:1.2,target:'parts',part:'eyes',apply:(t,o)=>{o.sy*=1-.92*eEnv(t,.3,.6);}},
 e_paddle:{dur:1.4,target:'parts',apply:(t,o,a,side)=>{o.ry+=side*.5*Math.sin(PI*3*t)*(1-t*.5)*a;}},
 e_swimfwd:{dur:1.4,target:'root',apply:(t,o,_a,_s,tr)=>{o.pz+=.1*bump(t)*tr;o.py+=.03*Math.abs(osc(t,1.5))*tr;}},
 e_spout:{dur:1.1,target:'parts',apply:(t,o,a)=>{const k=eEnv(t,.15,.6)*Math.max(a,.4);o.sy*=1+1.3*k;o.sx*=1+.25*k;o.sz*=1+.25*k;}},
 e_sing:{dur:1.8,target:'root',apply:(t,o,a,_s,tr)=>{const k=eEnv(t,.25,.75);o.py+=.08*k*tr;o.rx+=-.12*k*a;o.rz+=.08*osc(t,1.5)*k*a;}},
 // Summit Orchard
 e_juicysquish:{dur:1,target:'root',apply:(t,o,a)=>{const k=dSpringBack(t,.3,3)*a;o.sy*=1-.32*k;o.sx*=1+.24*k;o.sz*=1+.24*k;}},
 e_mangoroll:{dur:1.2,target:'root',apply:cRoll(.47,.26,.34)},
 e_seedpop:{dur:1,target:'parts',apply:(t,o,a,_s,tr)=>{o.pz+=.22*dSpringBack(t,.25,2)*Math.max(tr,a);o.py+=.04*bump(t)*Math.max(tr,a);}},
 e_zest:{dur:.7,target:'root',apply:(t,o,a,_s,tr)=>{const k=decay(t)*a;o.sx*=1+.06*osc(t,10)*k;o.sz*=1+.06*osc(t,10)*k;o.sy*=1-.06*osc(t,10)*k;o.py+=.02*Math.abs(osc(t,5))*k*tr;}},
 e_curlshot:{dur:1.3,target:'root',apply:(t,o,a,_s,tr)=>{o.px+=.24*Math.sin(PI*t)*tr;o.pz+=.16*Math.sin(PI*2*t)*tr;o.py+=.3*bump(t)*tr;o.ry+=PI*2*ease(t)*(tr<1?.25:1);o.rz+=-.1*bump(t)*a;}},
 e_teeter:{dur:1.3,target:'parts',apply:(t,o,a)=>{o.rz+=.09*osc(t,2.5)*decay(t)*a;o.rx+=.04*osc(t,2.9)*decay(t)*a;}},// stacked parts add up: the top sways most
 e_clack:{dur:.6,target:'parts',apply:(t,o,a,_s,tr)=>{o.py+=.02*Math.abs(osc(t,5))*decay(t)*Math.max(tr,a);o.rz+=.03*osc(t,5)*decay(t)*a;}},
 e_netripple:{dur:1.1,target:'parts',apply:(t,o,a)=>{o.rx+=.16*osc(t,3)*decay(t)*a;o.sz*=1+.25*Math.abs(osc(t,3))*decay(t)*a;}},
 e_ping:{dur:.8,target:'parts',apply:(t,o,a)=>{const k=osc(t,14)*decay(t)**2*a;o.sx*=1+.05*k;o.sz*=1-.03*k;}},
 e_goalshot:{dur:1.3,target:'parts',apply:(t,o,a,_s,tr)=>{const m=Math.max(tr,.35);
  if(t<.4){const u=ease(t/.4);o.pz-=.48*u*m;o.py+=(.22*Math.sin(PI*u)+.08*u)*m;o.rx-=u*9;}
  else if(t<.7){o.pz-=.48*m;o.py+=.08*m;}else if(t<.76){o.sx*=0;o.sy*=0;o.sz*=0;}else{const u=ease((t-.76)/.24);o.sx*=u;o.sy*=u;o.sz*=u;}void a;}},// into the net, then a new ball pops in
} satisfies Record<string,Def>);
export const REACTION_NAMES=Object.keys(REACTIONS);

export type ResolvedReaction={name:string;def:Def;parts:string[]};
/** `name` or `name:a+b` → the definition and the part names it moves ('root' for the pose root). Null if unknown or a part is missing. */
export function resolveReaction(ref:string,partNames:ReadonlySet<string>|readonly string[]):ResolvedReaction|null{
 const names=partNames instanceof Set?partNames:new Set(partNames as readonly string[]);
 const [name,list]=ref.split(':'),def=REACTIONS[name];if(!def)return null;
 if(def.target==='root'&&!list)return {name,def,parts:['root']};
 const parts=list?list.split('+').filter(Boolean):def.part?[def.part]:[];
 if(!parts.length||parts.some(p=>p!=='root'&&!names.has(p)))return null;
 return {name,def,parts};
}
export const asList=<X,>(x:X|readonly X[]):readonly X[]=>Array.isArray(x)?x as readonly X[]:[x as X];

type Rest={p:T.Vector3;r:T.Euler;s:T.Vector3};
type Active={r:ResolvedReaction;start:number;amp:number};
const blank=():Off=>({px:0,py:0,pz:0,rx:0,ry:0,rz:0,sx:1,sy:1,sz:1});

/**
 * Plays reactions on a rig's root + parts. `pressure` (0..1, the squeeze hold) and `idle` (0..1, breathing) are applied on top.
 * `onFx(kind)` / glow are reported once per reaction start; `update` returns true while anything is still moving.
 */
export function createToyAnimator(root:T.Object3D,parts:Map<string,T.Object3D>,opts:{reduced:boolean;onFx?:(kind:FxKind)=>void;setGlow?:(v:number)=>void}){
 const targets=new Map<string,T.Object3D>([['root',root],...parts]);const rest=new Map<string,Rest>();
 for(const [k,o] of targets)rest.set(k,{p:o.position.clone(),r:o.rotation.clone(),s:o.scale.clone()});
 const names=new Set(parts.keys());const active:Active[]=[];let glowUntil=0,glowFrom=0;
 const amp=opts.reduced?.3:1,travel=opts.reduced?.25:1;
 const sideOf=(k:string)=>{const r=rest.get(k);if(!r)return 1;if(/L$/.test(k))return -1;if(/R$/.test(k))return 1;return r.p.x<0?-1:1;};
 return {
  names,
  /** Start reactions by reference; unknown ones are skipped (returns how many started). At most 6 run at once. */
  play(refs:readonly string[],now:number){let n=0;for(const ref of refs){const r=resolveReaction(ref,names);if(!r)continue;
   // Rapid taps (QA Nov 8 2026): the same reaction on the same parts never stacks on itself (five hops at once flew the toy off
   // screen); it plays out, and a new tap can start it again once it is done.
   if(active.some(a=>a.r.name===r.name&&a.r.parts.join('+')===r.parts.join('+')&&now<a.start+a.r.def.dur))continue;
   if(active.length>=6)active.shift();active.push({r,start:now,amp});n++;
   if(r.def.fx)opts.onFx?.(r.def.fx);if(r.def.glow){glowFrom=now;glowUntil=now+r.def.dur;}}return n;},
  busy:(now:number)=>active.some(a=>now<a.start+a.r.def.dur)||now<glowUntil,
  update(now:number,pressure:number,idle:number):boolean{
   for(const [k,o] of targets){const r=rest.get(k)!;o.position.copy(r.p);o.rotation.copy(r.r);o.scale.copy(r.s);}
   for(let i=active.length-1;i>=0;i--)if(now>=active[i].start+active[i].r.def.dur)active.splice(i,1);
   const offs=new Map<string,Off>();const off=(k:string)=>{let o=offs.get(k);if(!o){o=blank();offs.set(k,o);}return o;};
   for(const a of active){const t=(now-a.start)/a.r.def.dur;if(!a.r.def.apply)continue;for(const p of a.r.parts)a.r.def.apply(t,off(p),a.amp,sideOf(p),travel);}
   // The squeeze hold: squash about the feet, with a tiny tremble; idle: a slow breath and bob.
   if(pressure>.001||idle>.001){const o=off('root'),tr=Math.sin(now*55)*.01*pressure*amp;o.sy*=1-.24*pressure+tr;o.sx*=1+.15*pressure;o.sz*=1+.15*pressure;
    const b=Math.sin(now*2*PI*.32)*idle;o.sy*=1+.016*b;o.sx*=1-.006*b;o.sz*=1-.006*b;o.py+=.012*(Math.sin(now*2*PI*.32+1)*.5+.5)*idle;}
   for(const [k,o] of offs){const t=targets.get(k);if(!t)continue;t.position.x+=o.px;t.position.y+=o.py;t.position.z+=o.pz;t.rotation.x+=o.rx;t.rotation.y+=o.ry;t.rotation.z+=o.rz;t.scale.x*=o.sx;t.scale.y*=o.sy;t.scale.z*=o.sz;}
   const g=now<glowUntil?bump((now-glowFrom)/Math.max(.01,glowUntil-glowFrom))*.45*(opts.reduced?.6:1):0;opts.setGlow?.(g);
   return active.length>0||now<glowUntil;
  },
  clear(){active.length=0;glowUntil=0;},
 };
}
export type ToyAnimator=ReturnType<typeof createToyAnimator>;
