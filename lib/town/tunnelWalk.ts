// Walking through the Summit tunnel (Rail fixes, Nov 26 2026; owner: "for the tunnel, allow player to go through the tunnel same view
// as the train but see the player from the back and an angle from above").
//
// The bore has a raised walkway each side (trainWorld.ts buildLitTube: kerb at 2.45 m from the centre line, top 0.3 m over the bed,
// out to the wall at TUNNEL_HALF_WIDTH). A walker who comes into a mouth at track level is taken on to the nearer walkway and kept on
// it (lateral lane clamp) until they leave by either mouth; the hill's ground over the bore is never used while inside. Rides do not
// come in: a walkway is 1.15 m wide and a ride needs 1.6 m. A train passes at ±HALF_W (1.4 m) + the player's 0.32 m: the lane's inner
// edge (LANE_MIN, 2.75 m) keeps a clear metre, so the solid-train rules never fire in here.
//
// Camera: from 7 m out in the cutting to 1.5 m out (and all through the bore), the play camera blends to a chase view behind and above the walker, along the bore,
// turning round with them; it stays inside the lining. Pure maths here; Town applies it. Reduced motion: no easing (the blend still
// follows position, so nothing jumps).
import {TUNNEL,TUNNEL_BED,TUNNEL_HALF_WIDTH,trackAt,trackNearest,leftNormal} from './trainTrack';

export const WALKWAY_KERB=2.45,WALKWAY_TOP=.3;
/** The walker's centre stays this far from the centre line (kerb + radius) … */
export const LANE_MIN=WALKWAY_KERB+.3;
/** … and this far at most (the wall less the walker's radius). */
export const LANE_MAX=TUNNEL_HALF_WIDTH-.34;
/** In from a mouth (m along the line, negative = outside): the walk begins at the sleeve's outer end, ends just past it. */
const ENTER_U=-1.3,EXIT_U=-1.45,ENTER_MAX_U=2;
/** The chase camera: back along the bore, up over the walkway, the look point ahead of the walker. */
export const CHASE={back:4.8,up:2.9,ahead:3,lookUp:.75} as const;

export type TunnelSpot={s:number;d:number;side:number;u:number;tx:number;tz:number;cx:number;cz:number};
const W=TUNNEL.west,E=TUNNEL.east,spot:TunnelSpot={s:0,d:0,side:1,u:0,tx:1,tz:0,cx:0,cz:0},q={x:0,z:0,tx:1,tz:0};
/** Where (x, z) is on the tunnel's line: s, unsigned lateral d and its side, u = metres in from the nearer mouth. null off it. */
export function tunnelSpot(x:number,z:number):TunnelSpot|null{
 const hit=trackNearest(x,z,TUNNEL_HALF_WIDTH+1,W.s-4,E.s+4);if(!hit)return null;
 trackAt(hit.s,q);spot.s=hit.s;spot.d=hit.d;spot.side=hit.side||1;spot.u=Math.min(hit.s-W.s,E.s-hit.s);spot.tx=q.tx;spot.tz=q.tz;spot.cx=q.x;spot.cz=q.z;return spot;}

export const smooth=(a:number,b:number,x:number)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};

export function createTunnelWalk(){
 const state={active:false,k:0,camYaw:NaN,height:TUNNEL_BED+WALKWAY_TOP};
 /** After the normal walk step: a walker at track level in a mouth starts the tunnel walk. */
 function tryEnter(p:{x:number;z:number},height:number,walking:boolean){
  if(!walking||state.active)return false;const f=tunnelSpot(p.x,p.z);
  if(!f||f.u<ENTER_U||f.u>ENTER_MAX_U||f.d>TUNNEL_HALF_WIDTH-.1||height>TUNNEL_BED+1.2)return false;
  state.active=true;state.height=height;state.camYaw=NaN;keep(p,f);return true;}
 /** Onto the walkway (nearer side) and inside the bore's two ends. */
 function keep(p:{x:number;z:number},f:TunnelSpot){const d=Math.min(LANE_MAX,Math.max(LANE_MIN,f.d)),n=leftNormal(f.tx,f.tz);p.x=f.cx+n.x*d*f.side;p.z=f.cz+n.z*d*f.side;}
 /** While inside, after the walk step: the lane clamp; leaving by a mouth ends it ('exit'). */
 function constrain(p:{x:number;z:number},v:{x:number;z:number},dt:number,reduced:boolean){
  const f=tunnelSpot(p.x,p.z);if(!f||f.u<EXIT_U){state.active=false;state.k=0;return 'exit' as const;}
  const before=f.d;keep(p,f);if(before<LANE_MIN||before>LANE_MAX){const n=leftNormal(f.tx,f.tz),vn=(v.x*n.x+v.z*n.z)*f.side;if(before<LANE_MIN&&vn<0||before>LANE_MAX&&vn>0){v.x-=n.x*f.side*vn;v.z-=n.z*f.side*vn;}}
  // the step up onto the walkway eases (0.3 m), and down again past the sleeve
  const want=TUNNEL_BED+(f.u>-1.4?WALKWAY_TOP:0);state.height+=(want-state.height)*(reduced?1:1-Math.exp(-dt*14));
  state.k=smooth(-7,-1.5,f.u);return 'in' as const;}
 /** Outside (not walking the tunnel): the chase view already eases in down the cutting toward a mouth (a walker on the line's
  *  corridor within 7 m of it), so the camera is low behind them before the hill is overhead (the follow view looks down on the hill). */
 function approach(x:number,z:number,walking:boolean){if(state.active)return state.k;const f=walking?tunnelSpot(x,z):null;state.k=f&&f.d<TUNNEL_HALF_WIDTH+.5&&f.u<0?smooth(-7,-1.5,f.u):0;return state.k;}
 /** The chase pose for the walker at (x, y, z) facing yaw (the game's yaw: +z at 0): camera and look point, blended in by state.k. */
 function chase(x:number,y:number,z:number,yaw:number,dt:number,reduced:boolean,cam:{x:number;y:number;z:number},look:{x:number;y:number;z:number}){
  const f=tunnelSpot(x,z);if(!f)return false;
  // along the bore, the way the walker faces (or backs: it turns round with them, the long way round never)
  const fx=Math.sin(yaw),fz=Math.cos(yaw),dir=fx*f.tx+fz*f.tz>=0?1:-1,want=Math.atan2(f.tx*dir,f.tz*dir);
  if(state.camYaw!==state.camYaw||reduced)state.camYaw=want;else{let dy=want-state.camYaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));state.camYaw+=dy*(1-Math.exp(-dt*3.2));}
  const bx=-Math.sin(state.camYaw),bz=-Math.cos(state.camYaw);
  // the camera stays within the lining: its lateral offset is held inside ±(half width − 0.5)
  let px=x+bx*CHASE.back,pz=z+bz*CHASE.back;const g=tunnelSpot(px,pz);
  if(g){const n=leftNormal(g.tx,g.tz),lim=TUNNEL_HALF_WIDTH-.55,dd=Math.min(lim,g.d*.55);px=g.cx+n.x*dd*g.side;pz=g.cz+n.z*dd*g.side;}
  cam.x=px;cam.y=Math.min(y+CHASE.up,TUNNEL_BED+2.4+TUNNEL_HALF_WIDTH-.9);cam.z=pz;
  look.x=x-bx*CHASE.ahead;look.y=y+CHASE.lookUp;look.z=z-bz*CHASE.ahead;return true;}
 return {state,tryEnter,constrain,chase,approach};
}
