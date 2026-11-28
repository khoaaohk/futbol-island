// Walking and riding through the Summit tunnel (Rail fixes, Nov 26 2026; Tunnel ride + track + train bump, Nov 27 2026).
// Owner Nov 26: "allow player to go through the tunnel same view as the train but see the player from the back and an angle from above".
// Owner Nov 27: "add riding, and also not on just the sides, walk on the tracks too. if train comes by. add animation to get flatten
// and pushed to the sides"; "only walking and riding" in the tunnel.
//
// The bore (trainWorld.ts buildLitTube): ballast + sleepers + rails in the middle, a gutter each side, a raised walkway (kerb at
// WALKWAY_KERB m from the centre line, top WALKWAY_TOP over the bed) out to the wall at TUNNEL_HALF_WIDTH. A walker or a ground ride
// (scooter / bike / moped) that comes in at track level is kept inside the bore (a lateral clamp to the wall, less its radius) at the
// floor's height under it (floorAt: sleepers / rails / ballast / gutter / walkway, eased so the kerb and a rail are stepped over, not
// snapped) until they leave by either mouth; the hill's ground over the bore is never used while inside. No flying in here (Town).
//
// A train in the bore: warn() gives the nearest train coming toward the walker on the track (horn + Kenji already come from
// trainRunning; Town adds the hint, the bore's headlight glow and a camera nudge). hit() is the bump test (a few float ops per train):
// on the track bed within the car's half width + radius, as the train's front passes. The bump (bump*): a cartoon squash, pushed /
// tumbled across to the nearer walkway lane, pop back with a wobble, then the dizzy stars (Town: rooftop recovery), ~1.5 s, control
// back. Reduced motion: a quick slide to the side, no squash or tumble. No damage, no coins; the train never changes speed.
//
// Camera: from 7 m out in the cutting to 1.5 m out (and all through the bore), the play camera blends to a chase view behind and above,
// along the bore (its heading is always one of the bore's two directions: the walker's turn picks which, never an orbit), held
// inside the bore cylinder (clampCam: also applied after every other camera effect, before the render). Pure maths, no allocation.
import {TUNNEL,TUNNEL_BED,TUNNEL_HALF_WIDTH,trackAt,trackNearest,leftNormal,wrapS} from './trainTrack';

export const WALKWAY_KERB=2.45,WALKWAY_TOP=.3;
/** The walkway lane (Nov 26): kerb + radius … wall less radius. Still where the bump puts you (clear of a car by 1 m+). */
export const LANE_MIN=WALKWAY_KERB+.3;
export const LANE_MAX=TUNNEL_HALF_WIDTH-.44;// leftovers A2 (owner 214): the body's radius at shoulder height (cap brim, arms, backpack), was .34
/** A ride keeps this far off the wall (its collision radius). */
export const RIDE_LANE_MAX=TUNNEL_HALF_WIDTH-.72;// leftovers A2: was .62
/** Leftovers A2 (owner 215: feet in the ledge): the foot's reach; a walker this close to the kerb stands on the walkway (auto-step). */
export const FOOT_R=.3;
/** The arch springs SPRING m over the bed (buildLitTube); the camera keeps CAM_PAD m inside the lining. */
export const SPRING=2.4,CAM_PAD=.5;
/** In from a mouth (m along the line, negative = outside): the walk begins at the sleeve's outer end, ends just past it. */
const ENTER_U=-1.3,EXIT_U=-1.45;
/** The chase camera: back along the bore, up over the walker, the look point ahead of the walker. */
/** Nov 27 2026 (owner: "zoom out more when walking or riding in the tunnel"): 8.4 m back (was 4.8), 4.1 m up (was 2.9; capped under
 *  the crown), looking at a point 4 m ahead at knee height: the walkways, both rails and the bore ahead in view. */
export const CHASE={back:8.4,up:4.1,ahead:4,lookUp:.45} as const;
/** Tunnel controls (Nov 27 2026): the camera's swing to the other end (s); walking back toward the camera this long (s) at over
 *  REVERSE_SPEED m/s turns it; the controls blend in / out (s) and switch on at k ≥ CTL_ON, off under CTL_OFF (hysteresis); a stick
 *  under STICK_DEAD counts as let go; the reduced-motion cut's dim (s). */
export const SWING_S=.5,REVERSE_HOLD=.6,REVERSE_SPEED=1,CTL_BLEND=.3,CTL_ON=.5,CTL_OFF=.3,STICK_DEAD=.2,CUT_FADE_S=.3;
export const cutFadeOpacity=(t:number)=>t>0?.55*Math.min(1,t/(CUT_FADE_S*.6)):0;
/** The car's half width (trainCarModel HALF_W) + the solid-train radius (trainRunning PLAYER_R): on the track inside this. */
export const TRACK_HIT=1.4+.35;
/** Warn a walker on the track (inside WARN_D m of the centre) when a train is under WARN_ETA s away. */
export const WARN_D=2.2,WARN_ETA=4.5;
/** The bump starts HIT_LEAD s before the nose reaches them (so the squash plays as it shoves them, not inside the car). */
export const HIT_LEAD=.12;
/** The bump: squash (s), push across (s), pop / wobble ends (s), all done + control back (s); reduced motion: slide (s), done (s). */
export const BUMP={squash:.3,push:.5,pop:.8,done:1.5,slideR:.4,doneR:.75,dizzy:.7} as const;// dizzy: the stars from `pop` to `done`
/** Nov 27 2026: reduced motion swaps the squash / tumble for a short dim of the view (Town's [data-tunnel-fade]): up in 0.12 s, held
 *  through the 0.4 s slide, gone by the end (0.75 s). Opacity of a dark layer, 0 … BUMP_FADE. */
export const BUMP_FADE=.55;
export const bumpFade=(age:number)=>age<0||age>=BUMP.doneR?0:BUMP_FADE*(age<.12?age/.12:age<BUMP.slideR?1:1-(age-BUMP.slideR)/(BUMP.doneR-BUMP.slideR));

// ---- the floor across the bore (m over TUNNEL_BED), as buildLitTube draws it (sleepers / rails / ballast / gutter / walkway)
const RAIL_V=.68,SLEEPER=.22,RAIL=.36;
export function floorAt(d:number){
 if(d>=WALKWAY_KERB)return WALKWAY_TOP;
 if(d>=2.05)return -.06;
 if(d>=1.45)return .12-(d-1.45)/.6*.16;
 if(d>=1.15)return SLEEPER-(d-1.15)/.3*(SLEEPER-.12);
 const r=Math.abs(d-RAIL_V);return r<.16?SLEEPER+(RAIL-SLEEPER)*(1-r/.16)*(1-r/.16)*(3-2*(1-r/.16))/1:SLEEPER;}// over a rail: a smooth hump to its top (the foot steps over, the tyre rolls over)

/** Nov 27 2026 (owner 169: "the ring is not flat"): the foot ring in the bore lies flat just over the highest floor under it (a ring
 *  half on the walkway, half over the gutter showed as a broken arc). r = the ring's radius. */
export function floorTopNear(d:number,r:number){let m=-1;for(let i=-4;i<=4;i++)m=Math.max(m,floorAt(Math.abs(d+r*i/4)));return m;}

// ---- the wall lamps (buildLitTube builds them here; the shader lights the bore from the same list; Town tints the walker)
export const LAMP_STEP=12,LAMP_Y=2.05,LAMP_V=TUNNEL_HALF_WIDTH-.2;
export const TUNNEL_LAMPS:{s:number;x:number;y:number;z:number;side:number}[]=[];
{let side=1;for(let s=TUNNEL.west.s+6;s<TUNNEL.east.s-4;s+=LAMP_STEP,side=-side){const q=trackAt(s),n=leftNormal(q.tx,q.tz);TUNNEL_LAMPS.push({s,x:q.x+n.x*side*LAMP_V,y:TUNNEL_BED+LAMP_Y,z:q.z+n.z*side*LAMP_V,side});}}
/** The lamps' light at a point (0 … ~1.2): the same falloff as the shader, the nearest lamps. Nov 27 2026 (owner 199: "the light
 *  circles need to be more gradients and not so harsh of a circle"): two gaussians per lamp, a small warm bloom at the bulb
 *  (LAMP_CORE) over a wide soft pool (LAMP_POOL) with no edge, eased toward white by lampTone (a soft knee, never a flat clipped disc). */
export const LAMP_R2=16,LAMP_CORE={k:.5,r2:1.6},LAMP_POOL={k:.8,r2:LAMP_R2};
export const lampFall=(d2:number)=>LAMP_CORE.k*Math.exp(-d2/LAMP_CORE.r2)+LAMP_POOL.k*Math.exp(-d2/LAMP_POOL.r2);
export const lampTone=(L:number)=>L/(1+.45*L);
export function lampLight(x:number,y:number,z:number,s:number){const k=Math.round((s-TUNNEL.west.s-6)/LAMP_STEP);let L=0;
 for(let j=k-2;j<=k+2;j++){if(j<0||j>=TUNNEL_LAMPS.length)continue;const l=TUNNEL_LAMPS[j],d2=(x-l.x)**2+(y-l.y)**2+(z-l.z)**2;L+=lampFall(d2);}return Math.min(1.2,lampTone(L)*1.45);}

export type TunnelSpot={s:number;d:number;side:number;u:number;tx:number;tz:number;cx:number;cz:number};
const W=TUNNEL.west,E=TUNNEL.east,spot:TunnelSpot={s:0,d:0,side:1,u:0,tx:1,tz:0,cx:0,cz:0},q={x:0,z:0,tx:1,tz:0},cq={x:0,z:0,tx:1,tz:0};
/** Where (x, z) is on the tunnel's line: s, unsigned lateral d and its side, u = metres in from the nearer mouth. null off it. */
export function tunnelSpot(x:number,z:number,reach=TUNNEL_HALF_WIDTH+1):TunnelSpot|null{
 const hit=trackNearest(x,z,reach,W.s-4,E.s+4);if(!hit)return null;
 trackAt(hit.s,q);spot.s=hit.s;spot.d=hit.d;spot.side=hit.side||1;spot.u=Math.min(hit.s-W.s,E.s-hit.s);spot.tx=q.tx;spot.tz=q.tz;spot.cx=q.x;spot.cz=q.z;return spot;}

export const smooth=(a:number,b:number,x:number)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
/** Only walking and the ground rides in the tunnel (owner Nov 27): the jetpack (flying) is not. */
export const tunnelMode=(mode:string)=>mode!=='jetpack';
export const TUNNEL_MODE_NOTE=['Only walking and riding in the tunnel','Walk or ride out of the tunnel to fly again.'] as const;

type TrainLike={s:number;v:number};
export function createTunnelWalk(){
 const state={active:false,k:0,/** the chase camera's end (+1 looks +s, −1 looks −s, 0 not chosen) and its eased swing 0 … 1 */camDir:0 as 0|1|-1,camA:0,swingSide:1,/** Nov 27 2026 controls: the input frame (±1), the controls' weight (0 … 1), on (hysteresis), walking-back timer, camera end changes (count), the reduced-motion cut's dim (s) */ctlDir:0 as 0|1|-1,ctlW:0,ctlOn:false,revT:0,camFlips:0,cutFade:0,height:TUNNEL_BED+WALKWAY_TOP,mode:'walk',/** the chase camera's lean to one walkway while a train is near (-1 … 1) */camSide:0,/** Town: a train is in / near the bore by the walker; its side (±1), 0 none */trainSide:0,/** Town: the train-coming nudge (look back at it) */scan:false};
 const bump={active:false,age:0,reduced:false,x0:0,z0:0,x1:0,z1:0,h0:0,h1:0,side:1,tx:1,tz:0,dizzy:false};
 const bumpPose={flat:0,roll:0,wobble:0,hop:0};
 const warnOut={train:-1,gap:Infinity,eta:Infinity};
 /** After the normal step: a walker or ground ride at track level in a mouth (or anywhere in the bore: a restored spot) starts it. */
 function tryEnter(p:{x:number;z:number},height:number,mode:string){
  if(!tunnelMode(mode)||state.active)return false;const f=tunnelSpot(p.x,p.z);
  if(!f||f.u<ENTER_U||f.d>TUNNEL_HALF_WIDTH-.1||height>TUNNEL_BED+1.2)return false;
  state.active=true;state.height=height;state.mode=mode;keep(p,f,mode);return true;}
 /** Inside the walls (less the walker's / ride's radius). */
 function keep(p:{x:number;z:number},f:TunnelSpot,mode:string){const max=mode==='walk'?LANE_MAX:RIDE_LANE_MAX;if(f.d<=max)return;const n=leftNormal(f.tx,f.tz);p.x=f.cx+n.x*max*f.side;p.z=f.cz+n.z*max*f.side;}
 /** While inside, after the step: the wall clamp and the floor's height; leaving by a mouth ends it ('exit'). */
 function constrain(p:{x:number;z:number},v:{x:number;z:number},dt:number,reduced:boolean,mode=state.mode){
  state.mode=mode;const f=tunnelSpot(p.x,p.z);if(!f||f.u<EXIT_U){state.active=false;state.k=0;bump.active=false;return 'exit' as const;}
  const before=f.d,max=mode==='walk'?LANE_MAX:RIDE_LANE_MAX,side=f.side;keep(p,f,mode);
  if(before>max){const n=leftNormal(f.tx,f.tz),vn=(v.x*n.x+v.z*n.z)*side;if(vn>0){v.x-=n.x*side*vn;v.z-=n.z*side*vn;}}
  // the floor under them, eased (the kerb is a 0.36 m step, a rail a 0.14 m hump): a quick ease, never a snap
  const dd=Math.min(before,max),want=TUNNEL_BED+(dd>=WALKWAY_KERB-FOOT_R?WALKWAY_TOP:floorAt(dd));// the highest floor under the feet: never standing in the kerb face
  state.height+=(want-state.height)*(reduced?1:1-Math.exp(-dt*(want>state.height?16:12)));
  state.k=smooth(-7,-1.5,f.u);return 'in' as const;}
 /** Outside (not in the tunnel yet): the chase view eases in down the cutting toward a mouth. */
 function approach(x:number,z:number,ok:boolean){if(state.active)return state.k;const f=ok?tunnelSpot(x,z):null;state.k=f&&f.d<TUNNEL_HALF_WIDTH+.5&&f.u<0?smooth(-7,-1.5,f.u):0;return state.k;}
 /** The chase pose for the walker at (x, y, z) (the game's yaw: +z at 0): camera and look point, blended in by state.k.
  *  Tunnel controls (Nov 27 2026, owner: "make it very easy to turn back and not glitchy"; "zoom out more"): the camera looks along
  *  the bore toward one end (state.camDir, ±1 along +s), chosen when the chase view starts (the way the walker faces) and changed
  *  only by steer() (kept walking the other way for REVERSE_HOLD s) or the train-coming look back (state.scan). The change is a swing,
  *  never a cut: state.camA eases 0 (looking +s) … 1 (looking −s) over SWING_S, the camera going round beside the walker INSIDE the
  *  bore (along offset −back·cos(πa), across offset ±lim·sin(πa) toward the bore's middle), every frame held in the clamp cylinder.
  *  Reduced motion: a cut under a short dim (state.cutFade). */
 function chase(x:number,y:number,z:number,yaw:number,dt:number,reduced:boolean,cam:{x:number;y:number;z:number},look:{x:number;y:number;z:number}){
  const f=tunnelSpot(x,z,TUNNEL_HALF_WIDTH+3);if(!f)return false;
  const fs=f.s,fv=f.d*f.side;
  if(!state.camDir){const fx=Math.sin(yaw),fz=Math.cos(yaw);state.camDir=fx*f.tx+fz*f.tz>=0?1:-1;state.camA=state.camDir>0?0:1;}
  // a train near: the camera moves over to the walker's walkway (beside the train, never inside a car: owner Nov 27 bump strip)
  const ws=state.trainSide;state.camSide+=(ws-state.camSide)*(reduced?1:1-Math.exp(-dt*5));
  const target=(state.scan?-1:state.camDir)>0?0:1;// scan: the train-coming nudge looks back down the bore at it (trains run +s)
  if(state.camA!==target){
   if(state.camA===0||state.camA===1)state.swingSide=Math.abs(fv)<.5?1:-Math.sign(fv);// round by the bore's middle (more room)
   if(reduced){state.camA=target;state.cutFade=CUT_FADE_S;}else{const st=dt/SWING_S;state.camA=target>state.camA?Math.min(target,state.camA+st):Math.max(target,state.camA-st);}}
  state.cutFade=Math.max(0,state.cutFade-(reduced?dt:state.cutFade));
  const e=smooth(0,1,state.camA),ca=Math.cos(Math.PI*e),sa=Math.sin(Math.PI*e),lim=TUNNEL_HALF_WIDTH-CAM_PAD-.1;
  // along: behind the walker (−back along the view); across: the walker's own offset pulled toward the axis, the swing's arc, the lean
  trackAt(fs-CHASE.back*ca,cq);const n=leftNormal(cq.tx,cq.tz);
  let v=Math.max(-lim,Math.min(lim,fv*.4))+state.swingSide*lim*sa;const cs=Math.abs(state.camSide);v+=(Math.sign(state.camSide)*lim-v)*cs;v=Math.max(-lim,Math.min(lim,v));
  cam.x=cq.x+n.x*v;cam.z=cq.z+n.z*v;cam.y=Math.min(y+CHASE.up,TUNNEL_BED+SPRING+TUNNEL_HALF_WIDTH-.9);
  // the look point: ahead of the walker along the view (across the bore mid-swing), a little up: the view looks down the bore
  trackAt(fs,cq);const m=leftNormal(cq.tx,cq.tz),hx=cq.tx*ca-m.x*state.swingSide*sa,hz=cq.tz*ca-m.z*state.swingSide*sa;
  look.x=x+hx*CHASE.ahead;look.y=y+CHASE.lookUp;look.z=z+hz*CHASE.ahead;
  // leaning over: the look point swings the other way a little (the walker stays mid-frame, not at its edge)
  if(state.camSide){const lk=-.35*cs*Math.sign(state.camSide)*lim;look.x+=m.x*lk;look.z+=m.z*lk;}
  clampCam(cam);return true;}
 /** Tunnel controls (Nov 27 2026): the stick / keys / joystick (sx right +, sy down +, as Town reads them) mapped to the CHASE camera
  *  (Up = away along the bore, Down = toward the camera, Left / Right = across the bore, diagonals combine) instead of the island's
  *  fixed screen heading, blended in / out over CTL_BLEND s (no jump in direction on leaving). The frame used is state.ctlDir: it
  *  follows the camera's end only while the stick is let go, so a held direction never reverses when the camera swings round
  *  (no flip-flop). Walking (or riding) back toward the camera for REVERSE_HOLD s turns the camera round (steady; a tap never does).
  *  Writes the world move into out (same length as the screen-mapped (ix, iz) Town passes: island speeds untouched). */
 function steer(sx:number,sy:number,ix:number,iz:number,x:number,z:number,vx:number,vz:number,dt:number,out:{x:number;z:number}){
  const on=state.active||state.k>=CTL_ON||state.ctlOn&&state.k>CTL_OFF;state.ctlOn=on;
  state.ctlW=on?Math.min(1,state.ctlW+dt/CTL_BLEND):Math.max(0,state.ctlW-dt/CTL_BLEND);
  out.x=ix;out.z=iz;const f=state.ctlW>0?tunnelSpot(x,z,TUNNEL_HALF_WIDTH+12):null;
  if(!on&&state.ctlW===0||!f){state.revT=0;return out;}
  if(!state.camDir)state.camDir=vx*f.tx+vz*f.tz>=0?1:-1;
  const held=Math.hypot(sx,sy)>STICK_DEAD;if(!held||!state.ctlDir)state.ctlDir=state.camDir;
  const d=state.ctlDir,fx=f.tx*d,fz=f.tz*d;// forward along the bore (the camera's view); right on screen = (−fz, fx)
  let tx=-fz*sx-fx*sy,tz=fx*sx-fz*sy;
  // walked back toward the camera long enough: the camera's end changes (once; held input keeps its frame until let go)
  const along=(vx*f.tx+vz*f.tz)*state.camDir,sp=Math.hypot(vx,vz);
  if(on&&along< -REVERSE_SPEED&&-along>.7*sp)state.revT+=dt;else state.revT=Math.max(0,state.revT-2*dt);
  if(state.revT>=REVERSE_HOLD){state.camDir=-state.camDir as 1|-1;state.revT=0;state.camFlips++;}
  const w=state.ctlW,il=Math.hypot(ix,iz),tl=Math.hypot(tx,tz);if(tl>1e-6){tx*=il/tl;tz*=il/tl;}
  let ox=ix+(tx-ix)*w,oz=iz+(tz-iz)*w;const ol=Math.hypot(ox,oz);if(ol>1e-6){ox*=il/ol;oz*=il/ol;}out.x=ox;out.z=oz;return out;}
 /** Off the chase view (k back to 0, not in the bore): forget the camera's end (the next entry picks it from the walker). */
 function settle(){if(!state.active&&state.k===0&&state.ctlW===0){state.camDir=0;state.ctlDir=0;state.camA=0;state.revT=0;}}
 /** Holds a camera point inside the bore cylinder (lateral ≤ half width − CAM_PAD, between the floor and the arch less CAM_PAD) when it
  *  is inside the bore's length (or within 1 m of a mouth). True when it moved it. A few float ops. */
 function clampCam(c:{x:number;y:number;z:number}){const g=tunnelSpot(c.x,c.z,TUNNEL_HALF_WIDTH+12);if(!g||g.u< -1)return false;
  const lim=TUNNEL_HALF_WIDTH-CAM_PAD;let moved=false;
  if(g.d>lim){const n=leftNormal(g.tx,g.tz);c.x=g.cx+n.x*lim*g.side;c.z=g.cz+n.z*lim*g.side;g.d=lim;moved=true;}
  const r=TUNNEL_HALF_WIDTH-CAM_PAD,top=TUNNEL_BED+SPRING+Math.sqrt(Math.max(0,r*r-g.d*g.d)),bot=TUNNEL_BED+.6;
  if(c.y>top){c.y=top;moved=true;}else if(c.y<bot){c.y=bot;moved=true;}return moved;}
 /** The nearest train coming toward (s) along the line (trains run +s): its index, the gap from its front (m) and the time (s). */
 function warn(trains:ArrayLike<TrainLike>,s:number){warnOut.train=-1;warnOut.gap=warnOut.eta=Infinity;
  for(let i=0;i<trains.length;i++){const t=trains[i],gap=wrapS(s-t.s);if(gap>80)continue;const eta=gap/Math.max(t.v,.5);if(eta<warnOut.eta){warnOut.train=i;warnOut.gap=gap;warnOut.eta=eta;}}return warnOut;}
 /** The bump test: a walker / ride on the track (d < TRACK_HIT), the train's front at or just past them (it reaches them this frame). */
 function hit(trains:ArrayLike<TrainLike>,s:number,d:number,len:number){if(d>=TRACK_HIT||bump.active)return -1;
  for(let i=0;i<trains.length;i++){const t=trains[i];if(t.v<.5)continue;const pre=Math.max(1,t.v*HIT_LEAD),past=wrapS(t.s-s+pre);if(past<len+pre)return i;}return -1;}
 /** Starts the bump at p: across to the nearer walkway lane at the same s. */
 function bumpStart(p:{x:number;z:number},reduced:boolean){const f=tunnelSpot(p.x,p.z);if(!f)return false;const n=leftNormal(f.tx,f.tz),dd=LANE_MIN+.25;
  Object.assign(bump,{active:true,age:0,reduced,x0:p.x,z0:p.z,x1:f.cx+n.x*dd*f.side,z1:f.cz+n.z*dd*f.side,h0:state.height,h1:TUNNEL_BED+WALKWAY_TOP,side:f.side,tx:f.tx,tz:f.tz,dizzy:false});return true;}
 /** Ages the bump and writes the spot; 'dizzy' once (Town starts the stars), 'done' when control is back, else 'on' / 'idle'. */
 function bumpStep(dt:number,p:{x:number;z:number}):'idle'|'on'|'dizzy'|'done'{
  if(!bump.active)return 'idle';bump.age+=dt;const a=bump.age,red=bump.reduced,T=red?BUMP.slideR:BUMP.push,t=Math.min(1,a/T),e=1-(1-t)**3;
  p.x=bump.x0+(bump.x1-bump.x0)*e;p.z=bump.z0+(bump.z1-bump.z0)*e;state.height=bump.h0+(bump.h1-bump.h0)*e;
  if(a>=(red?BUMP.doneR:BUMP.done)){bump.active=false;return 'done';}
  if(!bump.dizzy&&a>=(red?BUMP.slideR:BUMP.pop)){bump.dizzy=true;return 'dizzy';}return 'on';}
 /** The drawn overlay: flat 0 … 1 (pancake), roll (rad, about the bore's axis: the tumble), wobble (scale ±), hop (m). */
 function pose(){bumpPose.flat=bumpPose.roll=bumpPose.wobble=bumpPose.hop=0;if(!bump.active||bump.reduced)return bumpPose;const a=bump.age;
  bumpPose.flat=a<.05?a/.05:a<BUMP.squash?1:a<BUMP.push?1-(a-BUMP.squash)/(BUMP.push-BUMP.squash):0;
  const r=Math.min(1,Math.max(0,(a-.12)/(BUMP.push-.12)));bumpPose.roll=Math.PI*2*r*r*(3-2*r)*bump.side;bumpPose.hop=Math.sin(Math.min(1,a/BUMP.push)*Math.PI)*.35;
  if(a>=BUMP.push&&a<BUMP.pop+.3){const w=(a-BUMP.push)/(BUMP.pop+.3-BUMP.push);bumpPose.wobble=Math.sin(w*Math.PI*4)*.22*(1-w);}return bumpPose;}
 return {state,bump,tryEnter,constrain,chase,steer,settle,approach,clampCam,warn,hit,bumpStart,bumpStep,pose};
}
export type TunnelWalk=ReturnType<typeof createTunnelWalk>;
/** A flyer low enough to be in the bore's mouth (or inside it) is blocked like a wall: flying never ends up in the tunnel. */
export function tunnelBlocksFlight(x:number,z:number,height:number){const f=tunnelSpot(x,z,TUNNEL_HALF_WIDTH+.6);return !!f&&f.u>-1&&height<TUNNEL_BED+SPRING+TUNNEL_HALF_WIDTH+.6;}
