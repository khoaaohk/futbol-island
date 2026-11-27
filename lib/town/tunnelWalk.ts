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
export const LANE_MAX=TUNNEL_HALF_WIDTH-.34;
/** A ride keeps this far off the wall (its collision radius). */
export const RIDE_LANE_MAX=TUNNEL_HALF_WIDTH-.62;
/** The arch springs SPRING m over the bed (buildLitTube); the camera keeps CAM_PAD m inside the lining. */
export const SPRING=2.4,CAM_PAD=.5;
/** In from a mouth (m along the line, negative = outside): the walk begins at the sleeve's outer end, ends just past it. */
const ENTER_U=-1.3,EXIT_U=-1.45;
/** The chase camera: back along the bore, up over the walker, the look point ahead of the walker. */
export const CHASE={back:4.8,up:2.9,ahead:3,lookUp:.75} as const;
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

// ---- the wall lamps (buildLitTube builds them here; the shader lights the bore from the same list; Town tints the walker)
export const LAMP_STEP=12,LAMP_Y=2.05,LAMP_V=TUNNEL_HALF_WIDTH-.2;
export const TUNNEL_LAMPS:{s:number;x:number;y:number;z:number;side:number}[]=[];
{let side=1;for(let s=TUNNEL.west.s+6;s<TUNNEL.east.s-4;s+=LAMP_STEP,side=-side){const q=trackAt(s),n=leftNormal(q.tx,q.tz);TUNNEL_LAMPS.push({s,x:q.x+n.x*side*LAMP_V,y:TUNNEL_BED+LAMP_Y,z:q.z+n.z*side*LAMP_V,side});}}
/** The lamps' light at a point (0 … ~1): the same soft falloff as the shader (exp(−d²/LAMP_R2)), the three nearest lamps. */
export const LAMP_R2=9;
export function lampLight(x:number,y:number,z:number,s:number){const k=Math.round((s-TUNNEL.west.s-6)/LAMP_STEP);let L=0;
 for(let j=k-1;j<=k+1;j++){if(j<0||j>=TUNNEL_LAMPS.length)continue;const l=TUNNEL_LAMPS[j],d2=(x-l.x)**2+(y-l.y)**2+(z-l.z)**2;L+=Math.exp(-d2/LAMP_R2);}return Math.min(1.2,L);}

export type TunnelSpot={s:number;d:number;side:number;u:number;tx:number;tz:number;cx:number;cz:number};
const W=TUNNEL.west,E=TUNNEL.east,spot:TunnelSpot={s:0,d:0,side:1,u:0,tx:1,tz:0,cx:0,cz:0},q={x:0,z:0,tx:1,tz:0};
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
 const state={active:false,k:0,camYaw:NaN,height:TUNNEL_BED+WALKWAY_TOP,mode:'walk',/** the chase camera's lean to one walkway while a train is near (-1 … 1) */camSide:0,/** Town: a train is in / near the bore by the walker; its side (±1), 0 none */trainSide:0,/** Town: the train-coming nudge (look back at it) */scan:false};
 const bump={active:false,age:0,reduced:false,x0:0,z0:0,x1:0,z1:0,h0:0,h1:0,side:1,tx:1,tz:0,dizzy:false};
 const bumpPose={flat:0,roll:0,wobble:0,hop:0};
 const warnOut={train:-1,gap:Infinity,eta:Infinity};
 /** After the normal step: a walker or ground ride at track level in a mouth (or anywhere in the bore: a restored spot) starts it. */
 function tryEnter(p:{x:number;z:number},height:number,mode:string){
  if(!tunnelMode(mode)||state.active)return false;const f=tunnelSpot(p.x,p.z);
  if(!f||f.u<ENTER_U||f.d>TUNNEL_HALF_WIDTH-.1||height>TUNNEL_BED+1.2)return false;
  state.active=true;state.height=height;state.camYaw=NaN;state.mode=mode;keep(p,f,mode);return true;}
 /** Inside the walls (less the walker's / ride's radius). */
 function keep(p:{x:number;z:number},f:TunnelSpot,mode:string){const max=mode==='walk'?LANE_MAX:RIDE_LANE_MAX;if(f.d<=max)return;const n=leftNormal(f.tx,f.tz);p.x=f.cx+n.x*max*f.side;p.z=f.cz+n.z*max*f.side;}
 /** While inside, after the step: the wall clamp and the floor's height; leaving by a mouth ends it ('exit'). */
 function constrain(p:{x:number;z:number},v:{x:number;z:number},dt:number,reduced:boolean,mode=state.mode){
  state.mode=mode;const f=tunnelSpot(p.x,p.z);if(!f||f.u<EXIT_U){state.active=false;state.k=0;bump.active=false;return 'exit' as const;}
  const before=f.d,max=mode==='walk'?LANE_MAX:RIDE_LANE_MAX,side=f.side;keep(p,f,mode);
  if(before>max){const n=leftNormal(f.tx,f.tz),vn=(v.x*n.x+v.z*n.z)*side;if(vn>0){v.x-=n.x*side*vn;v.z-=n.z*side*vn;}}
  // the floor under them, eased (the kerb is a 0.36 m step, a rail a 0.14 m hump): a quick ease, never a snap
  const want=TUNNEL_BED+floorAt(Math.min(before,max));state.height+=(want-state.height)*(reduced?1:1-Math.exp(-dt*(want>state.height?16:12)));
  state.k=smooth(-7,-1.5,f.u);return 'in' as const;}
 /** Outside (not in the tunnel yet): the chase view eases in down the cutting toward a mouth. */
 function approach(x:number,z:number,ok:boolean){if(state.active)return state.k;const f=ok?tunnelSpot(x,z):null;state.k=f&&f.d<TUNNEL_HALF_WIDTH+.5&&f.u<0?smooth(-7,-1.5,f.u):0;return state.k;}
 /** The chase pose for the walker at (x, y, z) facing yaw (the game's yaw: +z at 0): camera and look point, blended in by state.k.
  *  Its heading is one of the bore's two directions (the one the walker faces more), eased round on a turn, the camera on the
  *  bore's axis behind them (never orbiting out through the lining: owner 156). */
 function chase(x:number,y:number,z:number,yaw:number,dt:number,reduced:boolean,cam:{x:number;y:number;z:number},look:{x:number;y:number;z:number}){
  const f=tunnelSpot(x,z);if(!f)return false;
  // a train near: the camera moves over to the walker's walkway (beside the train, never inside a car: owner Nov 27 bump strip)
  const ws=state.trainSide;state.camSide+=(ws-state.camSide)*(reduced?1:1-Math.exp(-dt*5));
  const fx=Math.sin(yaw),fz=Math.cos(yaw),dir=state.scan?-1:fx*f.tx+fz*f.tz>=0?1:-1,want=Math.atan2(f.tx*dir,f.tz*dir);// scan: the train-coming nudge turns the view to look back down the bore at it (trains run +s)
  // a turn to the other way along the bore is a cut (owner 156: a swing round put the camera sideways, through the lining); the
  // eased part only follows the bore's own bend
  let dy=want-state.camYaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));if(state.camYaw!==state.camYaw||reduced||Math.abs(dy)>Math.PI/2)state.camYaw=want;else state.camYaw+=dy*(1-Math.exp(-dt*3.2));
  // back along the bore (the eased heading), then pulled onto the axis: a turn swings it round through the bore's middle
  const bx=-Math.sin(state.camYaw),bz=-Math.cos(state.camYaw);let px=x+bx*CHASE.back,pz=z+bz*CHASE.back;
  const g=tunnelSpot(px,pz,TUNNEL_HALF_WIDTH+CHASE.back+1);if(g){const n=leftNormal(g.tx,g.tz),lim=TUNNEL_HALF_WIDTH-CAM_PAD-.1,v0=Math.min(lim,g.d*.4)*g.side,cs=Math.abs(state.camSide),v=v0+(Math.sign(state.camSide)*lim-v0)*cs;px=g.cx+n.x*v;pz=g.cz+n.z*v;}
  cam.x=px;cam.y=Math.min(y+CHASE.up,TUNNEL_BED+SPRING+TUNNEL_HALF_WIDTH-.9);cam.z=pz;
  look.x=x-bx*CHASE.ahead;look.y=y+CHASE.lookUp;look.z=z-bz*CHASE.ahead;
  // leaning over: the look point swings the other way a little (the walker stays mid-frame, not at its edge)
  if(g&&state.camSide){const lk=-.35;look.x+=(cam.x-(x+bx*CHASE.back))*lk;look.z+=(cam.z-(z+bz*CHASE.back))*lk;}
  clampCam(cam);return true;}
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
 return {state,bump,tryEnter,constrain,chase,approach,clampCam,warn,hit,bumpStart,bumpStep,pose};
}
export type TunnelWalk=ReturnType<typeof createTunnelWalk>;
/** A flyer low enough to be in the bore's mouth (or inside it) is blocked like a wall: flying never ends up in the tunnel. */
export function tunnelBlocksFlight(x:number,z:number,height:number){const f=tunnelSpot(x,z,TUNNEL_HALF_WIDTH+.6);return !!f&&f.u>-1&&height<TUNNEL_BED+SPRING+TUNNEL_HALF_WIDTH+.6;}
