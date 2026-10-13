/**
 * laws-1863 · tiny keyframe films for the match moments (Oct 12 2026; the keyframe idea of the Oct 10 films, drawn now as
 * anatomy pegs). Each actor is a list of keys (time, world position in metres, pose); positions move linearly between keys and
 * the pose is the one of the last key reached. The ball is a list of (time, x, y, z) keys. Pure: runs in Node.
 */
export type Pose='stand'|'run'|'kick'|'ready'|'dive'|'cheer'|'stumble';
export type Facing='front'|'back';
export type Key={t:number;x:number;y:number;z?:number;pose:Pose;flip?:boolean;facing?:Facing};
export type BallKey={t:number;x:number;y:number;z?:number};
export type Actor={id:string;num:number;kit:'red'|'blue';keys:Key[]};
export type ActorAt={id:string;num:number;kit:'red'|'blue';x:number;y:number;z:number;pose:Pose;flip:boolean;facing:Facing};
type KO={z?:number;flip?:boolean;facing?:Facing};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
/** A key in world metres. */
export const KW=(t:number,x:number,y:number,pose:Pose,o:KO={}):Key=>({t,x,y,pose,...o});
export const BW=(t:number,x:number,y:number,z=0):BallKey=>({t,x,y,z});

function seg<T extends {t:number}>(ks:readonly T[],t:number){let i=0;while(i<ks.length-1&&t>=ks[i+1].t)i++;const k=ks[i],n=ks[Math.min(ks.length-1,i+1)];
 return {k,n,u:n===k||n.t===k.t?0:clamp((t-k.t)/(n.t-k.t),0,1)};}
export function actorsAt(actors:readonly Actor[],t:number):ActorAt[]{
 return actors.map(a=>{const {k,n,u}=seg(a.keys,t);
  return {id:a.id,num:a.num,kit:a.kit,x:lerp(k.x,n.x,u),y:lerp(k.y,n.y,u),z:lerp(k.z??0,n.z??0,u),pose:k.pose,flip:!!k.flip,facing:k.facing??'front'};});
}
export function ballAt(keys:readonly BallKey[],t:number){const {k,n,u}=seg(keys,t);return {x:lerp(k.x,n.x,u),y:lerp(k.y,n.y,u),z:lerp(k.z??0,n.z??0,u)};}
