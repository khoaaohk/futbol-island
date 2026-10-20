// Swim ripples (user, Oct 19 2026: "when swimming, change this ring to more of water rippling out when the character moves the
// arms"). The player's foot ring is hidden in the sea; instead soft thin rings spread from the swimmer, one per arm entry (the
// swim pose's stroke clock, swimPose.ts SwimRigPose.phase, advances π per stroke), a slow one while treading, a faint one for
// a float and a V of two stretched rings behind the Swim-fast hold. The scheduler is pure: it only calls `sink.spawn` (the
// ballEffects swim-ripple pool, SWIM_RIPPLE_CAP live rings, world space so a moving swimmer leaves them behind). No allocation.
export const SWIM_RIPPLE_CAP=6;
export const SWIM_RIPPLE={tread:.8,float:1.6,vee:.45,lite:2,still:2.4,reach:1.6} as const;
/** 0 = full (waterFxOn), 1 = lite (heat tier 2+/slow: one slow ripple), 2 = reduced motion (a static faint ring). */
export type SwimRippleMode=0|1|2;
export type SwimRippleSink={spawn:(x:number,z:number,maxR:number,life:number,opacity:number,stretch:number,angle:number,still:number)=>void};
export type SwimRippleInput={on:boolean;kind:string;phase:number;effort:number;fast:number;under:number;x:number;z:number;yaw:number;mode:SwimRippleMode};
export function createSwimRipples(sink:SwimRippleSink){
 let last=-1,tread=0,vee=0,lite=0,still=0;
 const reset=()=>{last=-1;tread=vee=lite=still=0;};
 return {
  update(dt:number,s:SwimRippleInput){
   const swim=s.on&&s.under<.05&&(s.kind==='crawl'||s.kind==='tread'||s.kind==='float');
   if(!swim){reset();return;}
   if(s.mode===2){still+=dt;if(still>=SWIM_RIPPLE.still){still=0;sink.spawn(s.x,s.z,.95,SWIM_RIPPLE.still+.2,.16,1,0,1);}return;}
   if(s.mode===1){lite+=dt;if(lite>=SWIM_RIPPLE.lite){lite=0;sink.spawn(s.x,s.z,1.3,1.9,.2,1,0,0);}return;}
   const fx=Math.sin(s.yaw),fz=Math.cos(s.yaw),rx=fz,rz=-fx;
   if(s.kind==='crawl'){
    const idx=Math.floor(s.phase/Math.PI);
    if(idx!==last){const first=last<0;last=idx;if(!first){const side=idx%2?1:-1;/* the entering hand, ahead of the shoulder */
     sink.spawn(s.x+fx*.5+rx*.42*side,s.z+fz*.5+rz*.42*side,SWIM_RIPPLE.reach*(.7+.3*s.effort),1.05,.35*(.55+.45*s.effort),1,0,0);}}
    if(s.fast>0){vee+=dt;if(vee>=SWIM_RIPPLE.vee){vee=0;/* the bow wake: two ripples stretched along the arms of a V, behind the swimmer */
     sink.spawn(s.x-fx*.9+rx*.6,s.z-fz*.9+rz*.6,1.5,.75,.3,2.2,Math.atan2(fz*.8-rz*.6,-fx*.8+rx*.6),0);
     sink.spawn(s.x-fx*.9-rx*.6,s.z-fz*.9-rz*.6,1.5,.75,.3,2.2,Math.atan2(fz*.8+rz*.6,-fx*.8-rx*.6),0);}}else vee=0;
    tread=0;return;
   }
   last=-1;vee=0;
   if(s.kind==='tread'){tread+=dt;if(tread>=SWIM_RIPPLE.tread){tread=0;sink.spawn(s.x,s.z,1.2,1.4,.26,1,0,0);}}
   else{tread+=dt;if(tread>=SWIM_RIPPLE.float){tread=0;sink.spawn(s.x,s.z,1.1,1.8,.14,1,0,0);}}
  },
  reset,
 };
}
