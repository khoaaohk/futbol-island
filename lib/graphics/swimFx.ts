// Swim rings and wake drawn IN the sea (Nov 17 2026, docs/graphics/island-graphics-plan-nov17.md S1, owner: "How can we make the
// swimming graphics look even better ... without increasing heat"). The six blended ring meshes that lay ON the water
// (ballEffects.ts swim-ripple pool) are gone. The ocean shader now draws, from a few uniforms (waterSurface.ts SWIM_FX_GLSL):
//  - SWIM_FX.rings expanding rings, each a bright crest with a darker trough inside it (arm entries, treading, splash-downs);
//  - one V wake behind the moving swimmer: two foam arms that open with the distance behind, and a churned patch at the feet.
// Everything here is CPU side and pure (no three.js, no DOM): ring ages -> radius and strength, the wake's towed tail (so the V
// bends when the swimmer turns instead of swinging like a rigid tail), and ONE bounding circle that the shader tests first, so
// only sea pixels within a few metres of a live ring pay for the rings. Nothing live = uSwimFx.z 0 = one uniform branch skipped.
// No allocation after create.
export const SWIM_FX={
 /** Ring uniforms (the old mesh pool's cap): the last one is the player's contact collar, the others a pool shared by the
  *  player's strokes, the swimming islanders and the splash-downs. */
 rings:6,
 /** The contact collar: a small foam ring that stays where the body lies in the water (radius m, strength). */
 collarR:.16,collarAmp:.62,
 /** Half-width of a ring's crest + trough (m); the shader's 1 / width. */
 width:.26,
 /** The wake's length (m) at an easy crawl and on Swim fast, and the half-opening of the V (width / length behind). */
 wakeLen:[2.6,4.4] as const,wakeHalf:.4,
 /** Ease rates (per s) of the wake's strength in and out; below `wakeMin` m of tail the wake has no direction yet. */
 wakeIn:2.2,wakeOut:1.6,wakeMin:.35,
} as const;
type V4={set(x:number,y:number,z:number,w:number):unknown};
export type SwimFxUniforms={uSwimRing:{value:V4[]};uSwimWake:{value:V4};uSwimFx:{value:V4}};
/** A ring's radius (m) and strength at age fraction `t` (0..1): fast out, slowing; a quick rise, then a square fade. */
export function swimRingAt(t:number,maxR:number,amp:number,still:number,out:{r:number;a:number}){
 if(still){out.r=maxR;out.a=amp*Math.min(1,t*6,(1-t)*3);return out;}
 out.r=maxR*(.12+.88*(1-(1-t)*(1-t)));out.a=amp*Math.min(1,t*12)*(1-t)*(1-t);return out;
}
export function createSwimFx(u:SwimFxUniforms){
 const N=SWIM_FX.rings-1,C=N,rx=new Float32Array(N),rz=new Float32Array(N),rMax=new Float32Array(N),rLife=new Float32Array(N),rAge=new Float32Array(N),rAmp=new Float32Array(N),rStill=new Uint8Array(N);
 let cursor=0,live=0,wasLive=false,cOn=false,cx0=0,cz0=0,cAmp=0;
 // The wake: head (the swimmer), a towed tail, eased strength.
 let wOn=false,hx=0,hz=0,tx=0,tz=0,wk=0,wLen=0,wTarget=0,wMax=SWIM_FX.wakeLen[0] as number;
 const tmp={r:0,a:0};
 for(let i=0;i<N;i++){rLife[i]=0;rAge[i]=1;}
 const off=()=>{for(let i=0;i<=N;i++)u.uSwimRing.value[i].set(0,0,0,0);u.uSwimWake.value.set(0,0,0,0);u.uSwimFx.value.set(0,0,0,0);wasLive=false;};
 off();
 return {
  /** A ring at (x, z) that spreads to `maxR` m over `life` s; `amp` 0..~1.6 its strength (1 = an arm entry at full effort); `still` holds it at maxR (reduced motion). */
  ring(x:number,z:number,maxR:number,life:number,amp:number,still=0){
   if(!(life>0)||!(amp>0))return;const i=cursor;cursor=(cursor+1)%N;rx[i]=x;rz[i]=z;rMax[i]=maxR;rLife[i]=life;rAge[i]=0;rAmp[i]=amp;rStill[i]=still?1:0;
  },
  /** Once per frame: the swimmer at (x, z); `speed` 0..1 of the swim speed (0 or `on` false = the wake fades where it lies), `fast` 0..1 the Swim-fast hold. */
  wake(dt:number,on:boolean,x:number,z:number,speed:number,fast:number){
   if(on&&!wOn&&wk<=0){tx=x;tz=z;}/* a fresh wake starts at the swimmer: nothing drawn until it has swum its first stroke (a wake still fading keeps its tail: no pop on a quick stop-and-go) */
   wOn=on;
   if(on){hx=x;hz=z;wMax=SWIM_FX.wakeLen[0]+(SWIM_FX.wakeLen[1]-SWIM_FX.wakeLen[0])*Math.max(0,Math.min(1,fast));
    const dx=hx-tx,dz=hz-tz,l=Math.hypot(dx,dz);if(l>wMax){tx=hx-dx/l*wMax;tz=hz-dz/l*wMax;}}
   wTarget=on?Math.max(0,Math.min(1,speed))*(.7+.3*Math.max(0,Math.min(1,fast))):0;
   wk=wTarget>wk?Math.min(wTarget,wk+dt*SWIM_FX.wakeIn):Math.max(wTarget,wk-dt*SWIM_FX.wakeOut);
  },
  /** Once per frame: the contact collar at the swimmer's hips (x, z), `amp` 0..1 (0 or `on` false = it eases away). */
  collar(dt:number,on:boolean,x:number,z:number,amp:number){
   const target=on?Math.max(0,Math.min(1,amp)):0;if(on){cx0=x;cz0=z;}
   cAmp=target>cAmp?Math.min(target,cAmp+dt*3):Math.max(target,cAmp-dt*3);cOn=cAmp>.004;
  },
  /** Ages the rings and writes the uniforms. Returns how many rings are live. `focus` (the swimming player): rings centred more than
   *  `focus.r` m from it still age but are not drawn, so a swimming islander 20 m away cannot stretch the one bounds circle (and
   *  the per-pixel ring loop) over most of the visible sea (Nov 17 2026 review). */
  update(dt:number,focus:{x:number;z:number;r:number}|null=null){
   let minX=Infinity,maxX=-Infinity,minZ=Infinity,maxZ=-Infinity;live=0;
   for(let i=0;i<N;i++){const v=u.uSwimRing.value[i];if(rAge[i]>=rLife[i]){if(wasLive)v.set(0,0,0,0);continue;}
    rAge[i]+=dt;if(rAge[i]>=rLife[i]||focus&&Math.abs(rx[i]-focus.x)+Math.abs(rz[i]-focus.z)>focus.r){v.set(0,0,0,0);continue;}
    const o=swimRingAt(rAge[i]/rLife[i],rMax[i],rAmp[i],rStill[i],tmp);v.set(rx[i],rz[i],o.r,o.a);live++;
    const e=o.r+SWIM_FX.width+.2;if(rx[i]-e<minX)minX=rx[i]-e;if(rx[i]+e>maxX)maxX=rx[i]+e;if(rz[i]-e<minZ)minZ=rz[i]-e;if(rz[i]+e>maxZ)maxZ=rz[i]+e;}
   if(cOn){u.uSwimRing.value[C].set(cx0,cz0,SWIM_FX.collarR,cAmp*SWIM_FX.collarAmp);const e=SWIM_FX.collarR+SWIM_FX.width+.2;
    if(cx0-e<minX)minX=cx0-e;if(cx0+e>maxX)maxX=cx0+e;if(cz0-e<minZ)minZ=cz0-e;if(cz0+e>maxZ)maxZ=cz0+e;}
   else if(wasLive)u.uSwimRing.value[C].set(0,0,0,0);
   const dx=tx-hx,dz=tz-hz;wLen=Math.hypot(dx,dz);
   const k=wLen>SWIM_FX.wakeMin?wk*Math.min(1,(wLen-SWIM_FX.wakeMin)/.8):0;
   if(k>.004){const inv=1/(wLen*wLen),e=wLen*SWIM_FX.wakeHalf+.5;/* zw = (unit direction to the tail) / length: dot() gives 0 at the swimmer, 1 at the tail */
    u.uSwimWake.value.set(hx,hz,dx*inv,dz*inv);
    for(let j=0;j<2;j++){const px=j?tx:hx,pz=j?tz:hz;if(px-e<minX)minX=px-e;if(px+e>maxX)maxX=px+e;if(pz-e<minZ)minZ=pz-e;if(pz+e>maxZ)maxZ=pz+e;}}
   else if(wk<=0&&!wOn){tx=hx;tz=hz;}
   if(!live&&!cOn&&k<=.004){if(wasLive)off();return 0;}
   const cx=(minX+maxX)/2,cz=(minZ+maxZ)/2,hw=(maxX-minX)/2,hd=(maxZ-minZ)/2;
   u.uSwimFx.value.set(cx,cz,hw*hw+hd*hd,k>.004?k:0);wasLive=true;return live;
  },
  /** Live rings and the wake's drawn strength (tests / heat checks). */
  get live(){return live;},get wakeK(){return wLen>SWIM_FX.wakeMin?wk*Math.min(1,(wLen-SWIM_FX.wakeMin)/.8):0;},
  get collarOn(){return cOn;},
  clear(){for(let i=0;i<N;i++)rAge[i]=rLife[i];wk=0;wOn=false;live=0;cAmp=0;cOn=false;off();},
 };
}
export type SwimFx=ReturnType<typeof createSwimFx>;
