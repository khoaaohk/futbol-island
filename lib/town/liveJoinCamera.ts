// Join a live game: the camera angle button (owner, Nov 4 2026: "a camera button on the top left ... able to change between
// different camera angles"). Pure maths, no three.js, no allocation per frame: lib/town/liveJoinRuntime.ts owns one
// controller and writes its result onto Town's follow camera (apply after Town's lookAt, restore before Town's lerp).
//
// The angles (cycled by the HUD button or C):
// - broadcast: Town's own follow camera, untouched (the default; weight 0 means the controller writes nothing).
// - side:      the TV view (owner, Nov 4 2026, "like the FIFA broadcast view"): from the touchline at a moderate height,
//              looking ACROSS the pitch, the goal you attack on the right of the screen; it tracks you along the length
//              (eased lag) and keeps the pitch's width in frame (a portrait phone zooms out to show enough length).
// - behind:    a low chase view behind you, looking down the pitch at the goal you attack (the attack axis, never your
//              facing, so it never swings while you turn or dribble back).
// - wide:      a high tactical view of the whole pitch from behind your own goal, the attack direction up the screen:
//              you see your teammates' spacing and the gaps (the football lesson of this angle).
// - close:     the broadcast direction dollied in to 55% of the current follow distance (same screen directions).
// Transitions ease (smoothstep weight, exponential follow); reduced motion takes every goal at once.
// Controls stay screen-relative: `ctrlDelta` is the yaw the stick is turned by (0 on broadcast and close). When the
// angle changes while the stick is pushed, the old mapping is held until the stick is released (or 3 s pass, then it
// eases over), so the player never reverses mid-run because the camera turned.

export type JoinCamAngle='broadcast'|'side'|'behind'|'wide'|'close';
export const JOIN_CAM_ANGLES:readonly JoinCamAngle[]=['broadcast','side','behind','wide','close'];
export const JOIN_CAM_LABEL:Record<JoinCamAngle,string>={broadcast:'Broadcast',side:'Side',behind:'Behind you',wide:'Wide',close:'Close'};
/** Town's fixed follow view (eye − look): the island camera looks along −(16, 23, 33). */
export const JOIN_CAM_VIEW={x:16,y:23,z:33} as const;
const VIEW_LEN=Math.hypot(JOIN_CAM_VIEW.x,JOIN_CAM_VIEW.y,JOIN_CAM_VIEW.z);
/** Yaw (atan2(x, z)) of the broadcast camera's forward on the ground. */
export const JOIN_CAM_BASE_YAW=Math.atan2(-JOIN_CAM_VIEW.x,-JOIN_CAM_VIEW.z);
/** Seconds for a weight transition (broadcast ↔ another angle). */
export const JOIN_CAM_BLEND_S=.6;
/** Follow rate (1/s) of the custom eye and look point: the island follow camera's walk rate. */
export const JOIN_CAM_FOLLOW=4;
/** Longest hold of the old stick mapping after an angle change while the stick is pushed. */
export const JOIN_CAM_HOLD_S=3;
const TAN_HALF_FOV=Math.tan(20*Math.PI/180);// Town's camera: 40° vertical fov
const WIDE_PITCH=58*Math.PI/180,SIDE_PITCH=30*Math.PI/180;

export const nextJoinCamAngle=(a:JoinCamAngle):JoinCamAngle=>JOIN_CAM_ANGLES[(JOIN_CAM_ANGLES.indexOf(a)+1)%JOIN_CAM_ANGLES.length];
export const isJoinCamAngle=(s:unknown):s is JoinCamAngle=>typeof s==='string'&&(JOIN_CAM_ANGLES as readonly string[]).includes(s);

export type JoinCamPitch={x:number;z:number;width:number;length:number;yaw?:number;ground:number};
export type JoinCamFrame={ex:number;ey:number;ez:number;lx:number;ly:number;lz:number};
export const createJoinCamFrame=():JoinCamFrame=>({ex:0,ey:0,ez:0,lx:0,ly:0,lz:0});

/** The goal (eye + look point) of a non-broadcast angle. (px, pz): you; (ax, az): unit attack direction on the ground;
 *  baseDist: the follow camera's current eye-to-you distance (close dollies relative to it, so a landscape phone's
 *  dolly is kept); aspect: width / height. Returns false for broadcast (Town's camera is used as it is). */
export function joinCamFrame(angle:JoinCamAngle,px:number,pz:number,ax:number,az:number,pitch:JoinCamPitch,aspect:number,baseDist:number,out:JoinCamFrame):boolean{
  const g=pitch.ground,portrait=aspect<.8;
  switch(angle){
    case 'close':{const d=Math.max(12,Math.min(VIEW_LEN,baseDist))*.55/VIEW_LEN;
      out.lx=px;out.ly=g+.6;out.lz=pz;out.ex=px+JOIN_CAM_VIEW.x*d;out.ey=out.ly+JOIN_CAM_VIEW.y*d;out.ez=pz+JOIN_CAM_VIEW.z*d;return true;}
    case 'behind':{const back=portrait?13:10.5,up=portrait?8.5:6.5,ahead=portrait?10:8;
      out.ex=px-ax*back;out.ey=g+up;out.ez=pz-az*back;out.lx=px+ax*ahead;out.ly=g+.5;out.lz=pz+az*ahead;return true;}
    case 'side':{
      // Looking along f = (az, −ax): three.js screen-right is (−fz, fx) = the attack direction, so you attack left → right.
      const yaw=pitch.yaw??0,lx=Math.sin(yaw),lz=Math.cos(yaw),dx=px-pitch.x,dz=pz-pitch.z;
      // Fit: the NEAR touchline (the tight one) inside the lower edge of the 40° fov, 1 m spare; the far one then fits too.
      const tb=Math.tan(SIDE_PITCH+17*Math.PI/180),span=portrait?24:36;
      const dv=tb*(pitch.width/2+1)/(tb*Math.cos(SIDE_PITCH)-Math.sin(SIDE_PITCH)),dh=span/2/(TAN_HALF_FOV*Math.max(.3,aspect));
      const d=Math.min(90,Math.max(26,Math.max(dv,dh))),lim=Math.max(0,pitch.length/2-span*.3);
      const along=Math.max(-lim,Math.min(lim,dx*lx+dz*lz)),fx=pitch.x+lx*along,fz=pitch.z+lz*along;// across: the pitch's middle (the whole width is in frame)
      const h=Math.cos(SIDE_PITCH)*d;out.lx=fx;out.ly=g;out.lz=fz;out.ex=fx-az*h;out.ey=g+Math.sin(SIDE_PITCH)*d;out.ez=fz+ax*h;return true;}
    case 'wide':{
      // The pitch's long axis (the attack axis) and its width axis; the focus leans a little toward you so you stay in frame.
      const yaw=pitch.yaw??0,lx=Math.sin(yaw),lz=Math.cos(yaw),wx=lz,wz=-lx,dx=px-pitch.x,dz=pz-pitch.z;
      const along=dx*lx+dz*lz,across=dx*wx+dz*wz,fx=pitch.x+lx*along*.25+wx*across*.35,fz=pitch.z+lz*along*.25+wz*across*.35;
      // Fit: the length (foreshortened by the pitch angle) in the vertical fov, the width in the horizontal; a portrait
      // phone may crop the touchlines (the focus follows you across) rather than shrink everyone to dots.
      // (+ a little more spare past 55 m: the focus leans toward you, and on the 70 m 9v9 that pushed a goal line just out of frame)
      const dv=(pitch.length/2*Math.sin(WIDE_PITCH)+3+Math.max(0,pitch.length-55)*.15)/TAN_HALF_FOV,dh=(pitch.width/2+2)/(TAN_HALF_FOV*Math.max(.3,aspect));
      const d=Math.min(pitch.length>80?150:95,Math.max(30,Math.max(dv,dh*(aspect<1?.7:1)))),h=Math.cos(WIDE_PITCH)*d;// ≤ 95 m up to the 9v9; the 100 m 11v11 needs ~145 m (Nov 5 2026)
      out.lx=fx;out.ly=g;out.lz=fz;out.ex=fx-ax*h;out.ey=g+Math.sin(WIDE_PITCH)*d;out.ez=fz-az*h;return true;}
    default:return false;
  }
}

const wrap=(a:number)=>Math.atan2(Math.sin(a),Math.cos(a));
const smooth=(u:number)=>u*u*(3-2*u);

/** The eased state between Town's follow camera and the chosen angle. One per runtime; never allocates per frame. */
export function createJoinCamera(){
  const s={
    angle:'broadcast' as JoinCamAngle,
    /** The last non-broadcast angle (still shown while the weight eases back to 0). */
    shown:'behind' as JoinCamAngle,
    /** 0 = Town's camera, 1 = the custom eye / look. */
    w:0,u:0,primed:false,
    eye:{x:0,y:0,z:0},look:{x:0,y:0,z:0},
    /** Yaw the stick is turned by (screen-relative controls), and the hold after an angle change. */
    ctrlDelta:0,hold:false,holdT:0,
    set(a:JoinCamAngle,stickLen:number){if(a===s.angle)return;s.angle=a;if(a!=='broadcast')s.shown=a;if(stickLen>.2){s.hold=true;s.holdT=0;}},
    /** dt step. `goal`: the frame of `shown` (null when it cannot be computed, e.g. just left: the eye and look freeze). */
    step(dt:number,reduced:boolean,goal:JoinCamFrame|null){
      const want=s.angle!=='broadcast'&&goal?1:0;
      if(goal){
        if(!s.primed||s.w<=0&&want===1){s.eye.x=goal.ex;s.eye.y=goal.ey;s.eye.z=goal.ez;s.look.x=goal.lx;s.look.y=goal.ly;s.look.z=goal.lz;s.primed=true;}
        const k=reduced?1:1-Math.exp(-dt*JOIN_CAM_FOLLOW);
        s.eye.x+=(goal.ex-s.eye.x)*k;s.eye.y+=(goal.ey-s.eye.y)*k;s.eye.z+=(goal.ez-s.eye.z)*k;
        s.look.x+=(goal.lx-s.look.x)*k;s.look.y+=(goal.ly-s.look.y)*k;s.look.z+=(goal.lz-s.look.z)*k;
      }
      if(reduced)s.u=want;else s.u=want?Math.min(1,s.u+dt/JOIN_CAM_BLEND_S):Math.max(0,s.u-dt/JOIN_CAM_BLEND_S);
      s.w=smooth(s.u);
    },
    /** Blend onto Town's eye (bx, by, bz; its look point is eye − JOIN_CAM_VIEW). Writes the final eye and look into out;
     *  returns the final camera's ground yaw delta from broadcast (0 when the weight is 0). */
    blend(bx:number,by:number,bz:number,out:JoinCamFrame){
      const w=s.w,lx=bx-JOIN_CAM_VIEW.x,ly=by-JOIN_CAM_VIEW.y,lz=bz-JOIN_CAM_VIEW.z;
      out.ex=bx+(s.eye.x-bx)*w;out.ey=by+(s.eye.y-by)*w;out.ez=bz+(s.eye.z-bz)*w;
      out.lx=lx+(s.look.x-lx)*w;out.ly=ly+(s.look.y-ly)*w;out.lz=lz+(s.look.z-lz)*w;
      if(w<=0)return 0;
      const fx=out.lx-out.ex,fz=out.lz-out.ez;return Math.hypot(fx,fz)<1e-4?0:wrap(Math.atan2(fx,fz)-JOIN_CAM_BASE_YAW);
    },
    /** Per steer: the stick's yaw (screen-relative to camDelta, except while an angle change is held). */
    control(dt:number,camDelta:number,stickLen:number){
      if(s.hold){s.holdT+=dt;if(stickLen<.15)s.hold=false;else if(s.holdT<JOIN_CAM_HOLD_S)return s.ctrlDelta;
        else{s.ctrlDelta=wrap(s.ctrlDelta+wrap(camDelta-s.ctrlDelta)*Math.min(1,dt*3));if(Math.abs(wrap(camDelta-s.ctrlDelta))<.01)s.hold=false;return s.ctrlDelta;}}
      s.ctrlDelta=camDelta;return s.ctrlDelta;
    },
  };
  return s;
}

/** Turn a world stick vector (Town's fixed screen → world mapping) by `delta` (yaw, atan2(x, z) convention) into out. */
export function turnStick(ix:number,iz:number,delta:number,out:{x:number;z:number}){
  if(delta===0){out.x=ix;out.z=iz;return out;}
  const c=Math.cos(delta),n=Math.sin(delta);out.x=ix*c+iz*n;out.z=-ix*n+iz*c;return out;
}
