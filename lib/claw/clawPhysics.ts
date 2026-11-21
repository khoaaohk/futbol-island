/**
 * Claw machine physics (Nov 21 2026, owner: "make the claw physics lifelike and the toys too"). Pure: no three.js, no DOM, no
 * Math.random, no allocation per step. Deterministic: the same seed + the same inputs give the same result (tests/claw-machine.cjs).
 *
 * Model (sim space, metres; origin = the play-floor centre, +x right as you face the glass, +z toward the glass, +y up):
 *  - Gantry carriage (cx, cz): velocity follows the stick with an acceleration limit going and a stronger one stopping, so it
 *    starts and stops like a motor on a belt, not a cursor.
 *  - Cable + claw hub: a Verlet particle tied to the carriage by a max-length rope (inextensible when taut, slack when the claw
 *    rests on something). Carriage moves make it swing; air damping settles it in a few seconds.
 *  - Three prongs: each a spring-driven hinge angle (motor target open / closed) with two capsules (finger + curled tip). A prong
 *    that meets a toy is pushed back (angle) and pushes the toy (position), split by "mass".
 *  - Toys: two particles each (bottom + top sphere) joined by a distance constraint, so a toy can stand, lean, topple and roll.
 *    Gravity, floor/wall/toy contacts, friction, sleeping when still, a squash spring for the landing.
 *  - Grab: real contact decides it. When the prongs have closed, the toy touched by at least two prongs is held by a soft weld
 *    whose strength comes from the grab's geometry (how many prongs, how centred, whether tips got under it). While carried, the
 *    claw's (smoothed) acceleration + gravity is the load; a load over the grip makes the toy slide down the prongs, and once it
 *    has slid off it falls freely (and may still tumble off a tip or into the chute). A solid centred grab holds; there is NO
 *    timer that weakens the grip on purpose. `firm` (the pity rule, lib/claw/clawStore.ts) raises the grip for that try.
 *  - Chute: a hole in the front-left corner with a low clear baffle, a sloped shaft, a hinged flap and the front tray.
 */

export const CLAW_DT=1/120;
const G=9.8;
export const CLAW_BOX={halfX:.86,halfZ:.6,ceil:1.5,gantryY:1.62} as const;
export const CHUTE={x0:-.86,x1:-.36,z0:.1,z1:.6,baffle:.15,slopeY0:-.29,slopeK:.7,flapTop:-.3,flapLen:.3,trayY:-.66,trayZ:.9} as const;
/** Where the claw parks (above the chute) and the carriage limits. */
export const CLAW_HOME={x:-.61,z:.35} as const;
export const CARRIAGE={minX:-.66,maxX:.66,minZ:-.42,maxZ:.42,vmax:.5,acc:1.7,dec:2.6} as const;
export const CABLE={min:.26,max:1.36,drop:.6,lift:.42,liftAcc:1.1} as const;
export const PRONG={knuckle:.045,drop:.03,len:.23,tip:.065,rad:.017,open:.95,closed:.1,rest:.32,k:260,c:22} as const;
const HUB_R=.05;
export const CLAW_AIM_SECONDS=20;
/** Grip in g of load for a grab quality q: 0.35 + 1.5 q (q 0.5 holds 1.1 g, q 0.8 holds 1.55 g; carrying adds ~0.1–0.25 g). Firm (pity) ×1.3. */
export const gripFor=(q:number,firm:boolean)=>G*(.35+1.5*q)*(firm?FIRM_GRIP:1);export const FIRM_GRIP=1.3;

export type ClawPhase='home'|'aim'|'drop'|'close'|'lift'|'carry'|'release'|'reset'|'done';
export const enum ClawEvent{MotorOn=1,MotorOff=2,Drop=3,Clack=4,Lift=5,Top=6,Release=7,Land=8,Chute=9,Flap=10,Deliver=11,Slip=12,Grab=13,Bump=14}
export type ToyBody={r:number;d:number};

/** mulberry32: the sim's only randomness (pile layout, grip jitter, refills). */
export function clawRng(seed:number){let a=seed>>>0;return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
export function hashSeed(s:string){let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193);}return h>>>0;}

const MAX_TOYS=14,MAX_P=MAX_TOYS*2,MAX_EVENTS=64;
const PHI=[-Math.PI/2,Math.PI/6,Math.PI*5/6];// one prong at the back, two at the front corners
const PCOS=PHI.map(Math.cos),PSIN=PHI.map(Math.sin);

export function createClawSim(seed:number,toyBodies:readonly ToyBody[]){
 const bodies:ToyBody[]=toyBodies.slice(0,MAX_TOYS),n=bodies.length,rand=clawRng(seed);
 // ---- particles (2 per toy slot) ----
 const px=new Float64Array(MAX_P),py=new Float64Array(MAX_P),pz=new Float64Array(MAX_P),ox=new Float64Array(MAX_P),oy=new Float64Array(MAX_P),oz=new Float64Array(MAX_P);
 const cmu=new Float64Array(MAX_P),pvx=new Float64Array(MAX_P),pvy=new Float64Array(MAX_P),pvz=new Float64Array(MAX_P);let wm=.55;
 const pr=new Float64Array(MAX_P),contact=new Uint8Array(MAX_P),cnx=new Float64Array(MAX_P),cny=new Float64Array(MAX_P),cnz=new Float64Array(MAX_P);
 // ---- toys ----
 const rest=new Float64Array(MAX_TOYS),active=new Uint8Array(MAX_TOYS),asleep=new Uint8Array(MAX_TOYS),stillFor=new Float64Array(MAX_TOYS);
 const squash=new Float64Array(MAX_TOYS),squashV=new Float64Array(MAX_TOYS),delivered=new Uint8Array(MAX_TOYS),inChute=new Uint8Array(MAX_TOYS);
 const landCool=new Float64Array(MAX_TOYS);
 // ---- claw ----
 const s={phase:'home' as ClawPhase,t:0,aimLeft:CLAW_AIM_SECONDS,cx:CLAW_HOME.x as number,cz:CLAW_HOME.z as number,vx:0,vz:0,L:CABLE.min as number,Lv:0,
  hx:CLAW_HOME.x as number,hy:CLAW_BOX.gantryY-.06-CABLE.min,hz:CLAW_HOME.z as number,hox:0,hoy:0,hoz:0,
  avx:0,avy:0,avz:0,ax:0,ay:0,az:0,load:0,slackSteps:0,moving:false,firm:false,jitter:1,
  held:-1,quality:0,grip:0,slid:0,slipMax:0,wx0:0,wy0:0,wz0:0,wx1:0,wy1:0,wz1:0,result:-1,flap:0,flapV:0,steps:0,carryTo:0,settle:0,bumpCool:0};
 s.hox=s.hx;s.hoy=s.hy;s.hoz=s.hz;
 const theta=new Float64Array(3).fill(PRONG.rest),thetaV=new Float64Array(3),thetaTarget=new Float64Array(3).fill(PRONG.rest);
 const fingerToy=new Int16Array(3).fill(-1),fingerY=new Float64Array(3);
 // ---- events ----
 const evCode=new Uint8Array(MAX_EVENTS),evValue=new Float32Array(MAX_EVENTS);let evCount=0;
 const emit=(code:ClawEvent,value=0)=>{if(evCount<MAX_EVENTS){evCode[evCount]=code;evValue[evCount]=value;evCount++;}};
 const anchorY=CLAW_BOX.gantryY-.06;

 function placeToy(i:number,x:number,y:number,z:number,lean:number,dir:number){
  const b=bodies[i],d=Math.max(.03,b.d);rest[i]=d;pr[2*i]=pr[2*i+1]=b.r;active[i]=1;asleep[i]=0;stillFor[i]=0;delivered[i]=0;inChute[i]=0;squash[i]=squashV[i]=0;
  const sx=Math.sin(lean)*Math.cos(dir)*d,sz=Math.sin(lean)*Math.sin(dir)*d,sy=Math.cos(lean)*d;
  px[2*i]=ox[2*i]=x;py[2*i]=oy[2*i]=y;pz[2*i]=oz[2*i]=z;px[2*i+1]=ox[2*i+1]=x+sx;py[2*i+1]=oy[2*i+1]=y+sy;pz[2*i+1]=oz[2*i+1]=z+sz;
 }
 /** A pile: toys dropped onto the floor away from the chute, then settled offline (no frame cost later). */
 function spawnPile(){
  // a heap: up to 9 on the floor (never in front of the chute), the rest dropped on top near the middle
  const cells:number[]=[];for(const z of [-.4,-.12,.16,.42])for(const x of [-.62,-.32,-.02,.28,.58])if(!(x<-.15&&z>0))cells.push(x,z);
  for(let c=cells.length/2-1;c>0;c--){const j=Math.floor(rand()*(c+1));[cells[2*c],cells[2*j]]=[cells[2*j],cells[2*c]];[cells[2*c+1],cells[2*j+1]]=[cells[2*j+1],cells[2*c+1]];}
  for(let i=0;i<n;i++){const top=i>=9,c=top?(i*5)%9:i,x=cells[2*c]*(top?.6:1)+(rand()-.5)*.08,z=cells[2*c+1]*(top?.6:1)+(rand()-.5)*.08;
   placeToy(i,x,top?.5+rand()*.3:.16+rand()*.12,z,(rand()-.5)*1.2,rand()*Math.PI*2);}
  settleOffline(4);
  // a toy that rolled into the chute while the pile settled goes back on top (the tray starts empty)
  for(let round=0;round<4;round++){let moved=false;for(let i=0;i<n;i++)if(inChute[i]||delivered[i]||py[2*i]<.02){placeToy(i,(rand()-.3)*.7,.7+rand()*.2,(rand()-.6)*.5,(rand()-.5)*.8,rand()*Math.PI*2);moved=true;}if(!moved)break;settleOffline(3);}
 }
 function settleOffline(seconds:number){const keep=s.phase;for(let k=0;k<seconds/CLAW_DT;k++)stepToysOnly();s.phase=keep;evCount=0;}

 // ---- geometry helpers (scalars, no allocation) ----
 let qx=0,qy=0,qz=0;// closest-point output
 function closestOnSeg(ax:number,ay:number,az:number,bx:number,by:number,bz:number,x:number,y:number,z:number){
  const dx=bx-ax,dy=by-ay,dz=bz-az,l2=dx*dx+dy*dy+dz*dz;let t=l2>0?((x-ax)*dx+(y-ay)*dy+(z-az)*dz)/l2:0;t=t<0?0:t>1?1:t;qx=ax+dx*t;qy=ay+dy*t;qz=az+dz*t;return t;}
 // Finger k joints: knuckle K, joint J, tip T (written into the arrays below).
 const kx=new Float64Array(3),ky=new Float64Array(3),kz=new Float64Array(3),jx=new Float64Array(3),jy=new Float64Array(3),jz=new Float64Array(3),tx=new Float64Array(3),ty=new Float64Array(3),tz=new Float64Array(3);
 function fingers(){for(let k=0;k<3;k++){const c=PCOS[k],sn=PSIN[k],th=theta[k];
  kx[k]=s.hx+c*PRONG.knuckle;kz[k]=s.hz+sn*PRONG.knuckle;ky[k]=s.hy-PRONG.drop;
  const rad=Math.sin(th)*PRONG.len,dn=Math.cos(th)*PRONG.len;jx[k]=kx[k]+c*rad;jz[k]=kz[k]+sn*rad;jy[k]=ky[k]-dn;
  const ht=th-1.75,hr=Math.sin(ht)*PRONG.tip,hd=Math.cos(ht)*PRONG.tip;tx[k]=jx[k]+c*hr;tz[k]=jz[k]+sn*hr;ty[k]=jy[k]-hd;}}

 function wake(i:number){if(asleep[i]){asleep[i]=0;stillFor[i]=0;}}
 const invMass=(i:number)=>asleep[i]?0:1;

 // ---- the world: floor, walls, chute ----
 function touch(p:number,nx:number,ny:number,nz:number,mu=wm){contact[p]=1;cmu[p]=mu;cnx[p]=nx;cny[p]=ny;cnz[p]=nz;}
 function world(p:number){
  const r=pr[p];let x=px[p],y=py[p],z=pz[p];const C=CHUTE,B=CLAW_BOX;
  if(y>B.ceil-r)y=B.ceil-r;
  if(x< -B.halfX+r){x=-B.halfX+r;touch(p,1,0,0);}else if(x>B.halfX-r){x=B.halfX-r;touch(p,-1,0,0);}
  if(z< -B.halfZ+r){z=-B.halfZ+r;touch(p,0,0,1);}
  const hole=x<C.x1&&z>C.z0;wm=hole?.2:.6;
  if(!hole){if(y<r){y=r;touch(p,0,1,0);}if(z>B.halfZ-r){z=B.halfZ-r;touch(p,0,0,-1);}}
  else{
   if(y>C.flapTop&&z>B.halfZ-r){z=B.halfZ-r;touch(p,0,0,-1);}
   // the clear baffle on the hole's two inner edges (also its rim)
   for(let w=0;w<2;w++){const cx=w===0?C.x1:Math.min(C.x1,Math.max(C.x0,x)),cz=w===0?Math.min(C.z1,Math.max(C.z0,z)):C.z0,cy=Math.min(C.baffle,Math.max(0,y));
    let dx=x-cx,dy=y-cy,dz=z-cz,d=Math.hypot(dx,dy,dz);if(d<r){if(d<1e-6){if(w===0)dx=x<C.x1?-1:1;else dz=z>C.z0?1:-1;dy=0;d=1;}const k=(r-d)/d;x+=dx*k;y+=dy*k;z+=dz*k;touch(p,dx/d,dy/d,dz/d);}}
   if(y<0){
    if(x<C.x0+r){x=C.x0+r;touch(p,1,0,0);}else if(x>C.x1-r){x=C.x1-r;touch(p,-1,0,0);}
    if(z<C.z0+r){z=C.z0+r;touch(p,0,0,1);}
    if(z<=C.z1+.02){// sloped shaft floor, normal (0,1,k)/|.|
     const inv=1/Math.hypot(1,C.slopeK),sd=((y-C.slopeY0)+C.slopeK*(z-C.z0))*inv;
     if(sd<r){const k=r-sd;y+=k*inv;z+=k*C.slopeK*inv;touch(p,0,inv,C.slopeK*inv);}}
    if(z>C.z1){// the tray
     {const fy=C.trayY-.3*(z-C.z1),inv=1/Math.hypot(1,.3),sd=(y-fy)*inv;if(sd<r){const k=r-sd;y+=k*inv*inv;z+=k*.3*inv*inv;touch(p,0,inv,.3*inv);}}// the tray tips forward a little, toward your hand
     if(z>C.trayZ-r){z=C.trayZ-r;touch(p,0,0,-1);}
     if(y>C.flapTop-r&&z>C.z1+r*.5){y=C.flapTop-r;touch(p,0,-1,0);}
    }
    flapContact(p);
   }
  }
  px[p]=x;py[p]=y;pz[p]=z;wm=.5;
 }
 /** The prize flap: a hinged plate at the shaft's front (y,z plane), pushed open by a toy, springing shut behind it. */
 function flapContact(p:number){
  const C=CHUTE,r=pr[p],a=s.flap,hy=C.flapTop,hz=C.z1,ey=hy-Math.cos(a)*C.flapLen,ez=hz+Math.sin(a)*C.flapLen;
  const y=py[p],z=pz[p],dy=ey-hy,dz=ez-hz,l2=dy*dy+dz*dz;let t=((y-hy)*dy+(z-hz)*dz)/l2;t=t<0?0:t>1?1:t;
  const cy=hy+dy*t,cz=hz+dz*t;let ny=y-cy,nz=z-cz,d=Math.hypot(ny,nz);if(d>=r)return;
  if(d<1e-6){ny=-dz;nz=dy;d=Math.hypot(ny,nz);}
  ny/=d;nz/=d;const pen=r-d,inside=nz<0;// inside: the particle is on the shaft side of the plate
  const share=inside?.85:.2;// a toy pushing out swings the light flap; the flap falling back nudges a toy only a little
  py[p]+=ny*pen*(1-share);pz[p]+=nz*pen*(1-share);touch(p,0,ny,nz);
  const lever=Math.max(.05,t*C.flapLen),da=pen*share/lever*(inside?1:-1);
  const before=s.flap;s.flap=Math.max(0,Math.min(1.35,s.flap+da));if(s.flap-before>.02&&s.flapV<.5)emit(ClawEvent.Flap,Math.min(1,(s.flap-before)*20));
 }

 // ---- toy contacts ----
 function pairContacts(){
  for(let a=0;a<2*n;a++){const ta=a>>1;if(!active[ta])continue;
   for(let b=a+1;b<2*n;b++){const tb=b>>1;if(tb===ta||!active[tb])continue;
    const dx=px[b]-px[a],dy=py[b]-py[a],dz=pz[b]-pz[a],rr=pr[a]+pr[b],d2=dx*dx+dy*dy+dz*dz;if(d2>=rr*rr)continue;
    const d=Math.sqrt(d2)||1e-6,pen=rr-d;
    if(asleep[ta]&&!asleep[tb]&&pen>.004)wake(ta);if(asleep[tb]&&!asleep[ta]&&pen>.004)wake(tb);
    const wa=invMass(ta),wb=invMass(tb),w=wa+wb;if(w===0)continue;const k=pen/d/w;
    px[a]-=dx*k*wa;py[a]-=dy*k*wa;pz[a]-=dz*k*wa;px[b]+=dx*k*wb;py[b]+=dy*k*wb;pz[b]+=dz*k*wb;
    touch(a,-dx/d,-dy/d,-dz/d);touch(b,dx/d,dy/d,dz/d);}}
 }
 function links(){for(let i=0;i<n;i++){if(!active[i]||asleep[i])continue;const a=2*i,b=a+1,dx=px[b]-px[a],dy=py[b]-py[a],dz=pz[b]-pz[a],d=Math.hypot(dx,dy,dz)||1e-6,k=(d-rest[i])/d*.5;
  px[a]+=dx*k;py[a]+=dy*k;pz[a]+=dz*k;px[b]-=dx*k;py[b]-=dy*k;pz[b]-=dz*k;}}

 // ---- claw vs toys ----
 /** A claw push moves a toy but mostly does not throw it: 75 % of the shift also moves its previous position (less injected speed). */
 function shove(p:number,dx:number,dy:number,dz:number){px[p]+=dx;py[p]+=dy;pz[p]+=dz;ox[p]+=dx*.75;oy[p]+=dy*.75;oz[p]+=dz*.75;}
 function clawContacts(record:boolean){
  fingers();
  for(let p=0;p<2*n;p++){const ti=p>>1;if(!active[ti]||ti===s.held)continue;const r=pr[p],held=false,cap=.012,opening=s.phase==='release';
   // hub sphere: the claw is heavier than a toy
   {const dx=px[p]-s.hx,dy=py[p]-s.hy,dz=pz[p]-s.hz,rr=r+HUB_R,d2=dx*dx+dy*dy+dz*dz;if(d2<rr*rr){const d=Math.sqrt(d2)||1e-6,pen=Math.min(cap,rr-d);wake(ti);const wt=held?1:.75,k=pen/d;
    shove(p,dx*k*wt,dy*k*wt,dz*k*wt);s.hx-=dx*k*(1-wt);s.hy-=dy*k*(1-wt);s.hz-=dz*k*(1-wt);touch(p,dx/d,dy/d,dz/d);}}
   if(!opening)for(let k=0;k<3;k++)for(let seg=0;seg<2;seg++){
    const t=seg===0?closestOnSeg(kx[k],ky[k],kz[k],jx[k],jy[k],jz[k],px[p],py[p],pz[p]):closestOnSeg(jx[k],jy[k],jz[k],tx[k],ty[k],tz[k],px[p],py[p],pz[p]);
    const dx=px[p]-qx,dy=py[p]-qy,dz=pz[p]-qz,rr=r+PRONG.rad,d2=dx*dx+dy*dy+dz*dz;if(d2>=rr*rr)continue;
    const d=Math.sqrt(d2)||1e-6,nx=dx/d,ny=dy/d,nz=dz/d,pen=Math.min(cap,rr-d);wake(ti);
    const closing=thetaTarget[k]<theta[k]+.02,wt=held?1:closing?.6:.72,rem=pen*(1-wt);
    shove(p,nx*pen*wt,ny*pen*wt,nz*pen*wt);touch(p,nx,ny,nz);
    // the reaction: a little moves the claw (it swings, or rests on the pile), most pushes the prong back open around its hinge
    s.hx-=nx*rem*.08;s.hy-=ny*rem*.08;s.hz-=nz*rem*.08;
    const lever=seg===0?Math.max(.03,t*PRONG.len):PRONG.len,c=PCOS[k],sn=PSIN[k],th=theta[k];
    const tr=Math.cos(th),tyv=Math.sin(th),along=-(nx*c+nz*sn)*tr-ny*tyv;// finger's opening direction · (−n)
    theta[k]=Math.max(0,Math.min(PRONG.open+.15,th+along*rem*.85/lever));
    if(record){fingerToy[k]=ti;fingerY[k]=qy;}
   }
  }
  // prong tips and the hub never sink through the play floor (outside the hole)
  for(let k=0;k<3;k++){const lo=Math.min(ty[k],jy[k])-PRONG.rad;if(lo<0&&!(tx[k]<CHUTE.x1&&tz[k]>CHUTE.z0)){s.hy-=lo;}}
  if(s.hy<HUB_R)s.hy=HUB_R;
 }

 // ---- integration ----
 function integrateToys(dt:number){
  const g=G*dt*dt;
  for(let p=0;p<2*n;p++){const ti=p>>1;contact[p]=0;if(!active[ti]||asleep[ti])continue;
   let vx=(px[p]-ox[p])*.999,vy=(py[p]-oy[p])*.999,vz=(pz[p]-oz[p])*.999;const sp=Math.hypot(vx,vy,vz),cap=5*dt;if(sp>cap){vx*=cap/sp;vy*=cap/sp;vz*=cap/sp;}ox[p]=px[p];oy[p]=py[p];oz[p]=pz[p];px[p]+=vx;py[p]+=vy-g;pz[p]+=vz;}
 }
 /** After the solve: friction (contacts eat tangential speed, tiny speeds stop), landing squash, sleep, chute/tray bookkeeping. */
 function finishToys(dt:number){
  for(let i=0;i<n;i++){if(!active[i]||asleep[i])continue;let maxV=0;
   for(let h=0;h<2;h++){const p=2*i+h;let vx=(px[p]-ox[p])/dt,vy=(py[p]-oy[p])/dt,vz=(pz[p]-oz[p])/dt;
    if(contact[p]){// Coulomb: the tangential speed lost is mu × the normal speed the contact removed this step (resting weight included)
     const vn=vx*cnx[p]+vy*cny[p]+vz*cnz[p],vnb=pvx[p]*cnx[p]+pvy[p]*cny[p]+pvz[p]*cnz[p],removed=Math.max(0,vn-vnb);let tX=vx-vn*cnx[p],tY=vy-vn*cny[p],tZ=vz-vn*cnz[p];const ts=Math.hypot(tX,tY,tZ),dv=cmu[p]*removed+.002;
     const f=ts<=dv?0:(ts-dv)/ts;tX*=f;tY*=f;tZ*=f;
     const vnKeep=vn<0?vn*0:vn;vx=tX+cnx[p]*vnKeep;vy=tY+cny[p]*vnKeep;vz=tZ+cnz[p]*vnKeep;
     ox[p]=px[p]-vx*dt;oy[p]=py[p]-vy*dt;oz[p]=pz[p]-vz*dt;}
    maxV=Math.max(maxV,Math.hypot(vx,vy,vz));}
   // landing: the speed lost this step against a floor-ish contact squashes the toy (and is a sound)
   landCool[i]=Math.max(0,landCool[i]-dt);
   const fall=Math.max(prevVy[2*i]-0,prevVy[2*i+1]-0);// downward speed before the solve (positive = falling)
   const hitNow=(contact[2*i]&&cny[2*i]>.3)||(contact[2*i+1]&&cny[2*i+1]>.3);
   if(hitNow&&fall>.55&&landCool[i]===0){squashV[i]-=Math.min(3.2,fall*1.4);landCool[i]=.18;emit(py[2*i]<0?ClawEvent.Chute:ClawEvent.Land,Math.min(1,fall/2.5));}
   // squash spring
   squashV[i]+=(-160*squash[i]-9*squashV[i])*dt;squash[i]=Math.max(-.24,Math.min(.18,squash[i]+squashV[i]*dt));
   const still=maxV<.035&&i!==s.held;stillFor[i]=still?stillFor[i]+dt:0;
   if(stillFor[i]>.45&&Math.abs(squash[i])<.004){asleep[i]=1;squash[i]=squashV[i]=0;for(let h=0;h<2;h++){const p=2*i+h;ox[p]=px[p];oy[p]=py[p];oz[p]=pz[p];}}
   if(py[2*i]<-.02&&py[2*i+1]<-.02)inChute[i]=1;
   if(!delivered[i]&&pz[2*i]+pz[2*i+1]>2*CHUTE.z1+.01&&py[2*i]<CHUTE.flapTop&&py[2*i+1]<CHUTE.flapTop){delivered[i]=1;emit(ClawEvent.Deliver,i);}
  }
 }
 const prevVy=new Float64Array(MAX_P);
 function solveToys(dt:number,claw:boolean,record:boolean){
  for(let p=0;p<2*n;p++){prevVy[p]=-(py[p]-oy[p])/dt;pvx[p]=(px[p]-ox[p])/dt;pvy[p]=(py[p]-oy[p])/dt;pvz[p]=(pz[p]-oz[p])/dt;}
  for(let it=0;it<4;it++){links();pairContacts();if(claw)clawContacts(record&&it===3);for(let p=0;p<2*n;p++)if(active[p>>1]&&!asleep[p>>1])world(p);}
 }
 function stepFlap(dt:number){s.flapV+=(-14*s.flap-3*s.flapV)*dt;s.flap+=s.flapV*dt;if(s.flap<0){if(s.flapV< -1.2)emit(ClawEvent.Flap,Math.min(1,-s.flapV/5));s.flap=0;s.flapV=0;}if(s.flap>1.35){s.flap=1.35;s.flapV=0;}}
 function stepToysOnly(){integrateToys(CLAW_DT);solveToys(CLAW_DT,false,false);finishToys(CLAW_DT);}

 // ---- the claw ----
 function stepCarriage(dt:number,ix:number,iz:number,maxSpeed:number){
  const m=Math.hypot(ix,iz);if(m>1){ix/=m;iz/=m;}
  const tvx=ix*maxSpeed,tvz=iz*maxSpeed;
  const ax=tvx-s.vx,az=tvz-s.vz,speeding=tvx*tvx+tvz*tvz>s.vx*s.vx+s.vz*s.vz-1e-9,lim=(speeding?CARRIAGE.acc:CARRIAGE.dec)*dt,am=Math.hypot(ax,az);
  if(am>lim){s.vx+=ax/am*lim;s.vz+=az/am*lim;}else{s.vx=tvx;s.vz=tvz;}
  s.cx+=s.vx*dt;s.cz+=s.vz*dt;s.bumpCool=Math.max(0,s.bumpCool-dt);
  const bump=(v:number)=>{if(Math.abs(v)>.12&&s.bumpCool===0){emit(ClawEvent.Bump,Math.min(1,Math.abs(v)/CARRIAGE.vmax));s.bumpCool=.3;}};
  if(s.cx<CARRIAGE.minX){s.cx=CARRIAGE.minX;bump(s.vx);s.vx=0;}else if(s.cx>CARRIAGE.maxX){s.cx=CARRIAGE.maxX;bump(s.vx);s.vx=0;}
  if(s.cz<CARRIAGE.minZ){s.cz=CARRIAGE.minZ;bump(s.vz);s.vz=0;}else if(s.cz>CARRIAGE.maxZ){s.cz=CARRIAGE.maxZ;bump(s.vz);s.vz=0;}
  const moving=Math.hypot(s.vx,s.vz)>.015;if(moving!==s.moving){s.moving=moving;emit(moving?ClawEvent.MotorOn:ClawEvent.MotorOff);}
 }
 function stepHub(dt:number){
  const vx=(s.hx-s.hox)*.9975,vy=(s.hy-s.hoy)*.9975,vz=(s.hz-s.hoz)*.9975;s.hox=s.hx;s.hoy=s.hy;s.hoz=s.hz;
  s.hx+=vx;s.hy+=vy-G*dt*dt;s.hz+=vz;
 }
 function rope(){const dx=s.hx-s.cx,dy=s.hy-anchorY,dz=s.hz-s.cz,d=Math.hypot(dx,dy,dz)||1e-6;if(d>s.L){const k=s.L/d;s.hx=s.cx+dx*k;s.hy=anchorY+dy*k;s.hz=s.cz+dz*k;}return d;}
 function stepFingers(dt:number){for(let k=0;k<3;k++){const a=PRONG.k*(thetaTarget[k]-theta[k])-PRONG.c*thetaV[k];thetaV[k]+=a*dt;const before=theta[k];theta[k]+=thetaV[k]*dt;
  if(theta[k]<0){theta[k]=0;thetaV[k]=0;}if(theta[k]>PRONG.open+.15){theta[k]=PRONG.open+.15;thetaV[k]=0;}if(Math.abs(theta[k]-before)<1e-7)thetaV[k]*=.5;}}
 /** Holding: the weld pulls the toy toward its grab pose under the claw; load over grip slides it down the prongs. */
 function stepHold(dt:number){
  const i=s.held;if(i<0)return;
  // the claw's acceleration, smoothed over ~0.1 s (a real toy feels the jerk, not one step's numerical spike)
  const hvx=(s.hx-s.hox)/dt,hvy=(s.hy-s.hoy)/dt,hvz=(s.hz-s.hoz)/dt,f=1-Math.exp(-dt/.1);
  const ax=(hvx-s.avx)/dt,ay=(hvy-s.avy)/dt,az=(hvz-s.avz)/dt;s.avx=hvx;s.avy=hvy;s.avz=hvz;
  s.ax+=(ax-s.ax)*f;s.ay+=(ay-s.ay)*f;s.az+=(az-s.az)*f;
  s.load=Math.hypot(s.ax,s.ay+G,s.az);
  if(s.load>s.grip){const before=s.slid;s.slid+=(s.load-s.grip)/s.grip*.05*dt*60;if(before<.004&&s.slid>=.004)emit(ClawEvent.Slip,Math.min(1,(s.load-s.grip)/s.grip));}
  const stiff=.06+.28*s.quality;
  for(let h=0;h<2;h++){const p=2*i+h,tx_=s.hx+(h?s.wx1:s.wx0),ty_=s.hy+(h?s.wy1:s.wy0)-s.slid,tz_=s.hz+(h?s.wz1:s.wz0);
   px[p]+=(tx_-px[p])*stiff;py[p]+=(ty_-py[p])*stiff;pz[p]+=(tz_-pz[p])*stiff;world(p);}// the glass and walls still win over the weld
  if(s.slid>s.slipMax){s.held=-1;emit(ClawEvent.Slip,1);}
 }
 function evaluateGrab(){
  // the toy with the most prongs on it
  let best=-1,bestCount=0;for(let k=0;k<3;k++){const ti=fingerToy[k];if(ti<0)continue;let c=0;for(let j=0;j<3;j++)if(fingerToy[j]===ti)c++;if(c>bestCount){bestCount=c;best=ti;}}
  if(best<0||bestCount<2){s.held=-1;s.quality=0;return;}
  const a=2*best,b=a+1,cx=(px[a]+px[b])/2,cy=(py[a]+py[b])/2,cz=(pz[a]+pz[b])/2,r=bodies[best].r,size=bodies[best].r*2+rest[best];
  let under=0;for(let k=0;k<3;k++)if(fingerToy[k]===best&&fingerY[k]<cy-.15*r)under++;
  const centre=1-Math.min(1,Math.hypot(cx-s.hx,cz-s.hz)/(r*1.6)),sizeFit=Math.max(.6,Math.min(1,.42/Math.max(.2,size)));
  let q=(.12+.3*(bestCount/3)+.32*centre+.26*(under/bestCount))*sizeFit*s.jitter;if(s.firm)q=Math.max(q,Math.min(1,q+.18));
  q=Math.max(0,Math.min(1,q));
  s.held=best;s.quality=q;s.grip=gripFor(q,s.firm);s.slid=0;s.slipMax=size*.42;s.ax=s.az=0;s.ay=0;
  s.avx=(s.hx-s.hox)/CLAW_DT;s.avy=(s.hy-s.hoy)/CLAW_DT;s.avz=(s.hz-s.hoz)/CLAW_DT;
  s.wx0=px[a]-s.hx;s.wy0=py[a]-s.hy;s.wz0=pz[a]-s.hz;s.wx1=px[b]-s.hx;s.wy1=py[b]-s.hy;s.wz1=pz[b]-s.hz;
  emit(ClawEvent.Grab,q);
 }
 function setTargets(v:number){thetaTarget[0]=thetaTarget[1]=thetaTarget[2]=v;}
 function go(phase:ClawPhase){s.phase=phase;s.t=0;}

 /** One fixed step. `ix`/`iz`: the stick (−1…1; +z toward the glass); `drop`: the button (edge or held). */
 function step(ix:number,iz:number,drop:boolean){
  const dt=CLAW_DT;s.t+=dt;s.steps++;
  switch(s.phase){
   case 'home':case 'done':stepCarriage(dt,0,0,CARRIAGE.vmax);break;
   case 'aim':s.aimLeft=Math.max(0,s.aimLeft-dt);stepCarriage(dt,ix,iz,CARRIAGE.vmax);
    if((drop&&s.t>.25)||s.aimLeft<=0){go('drop');setTargets(PRONG.open);s.Lv=0;s.slackSteps=0;fingerToy.fill(-1);emit(ClawEvent.Drop);}break;
   case 'drop':{stepCarriage(dt,0,0,CARRIAGE.vmax);s.Lv=Math.min(CABLE.drop,s.Lv+2.5*dt);s.L=Math.min(CABLE.max,s.L+s.Lv*dt);
    const d=Math.hypot(s.hx-s.cx,s.hy-anchorY,s.hz-s.cz);s.slackSteps=d<s.L-.012?s.slackSteps+1:0;
    if(s.slackSteps>5||s.L>=CABLE.max||s.t>3.2){s.L=Math.min(s.L,d+.004);go('close');setTargets(PRONG.closed);fingerToy.fill(-1);}break;}
   case 'close':stepCarriage(dt,0,0,CARRIAGE.vmax);
    if(s.t>=.55){evaluateGrab();go('lift');s.Lv=0;emit(ClawEvent.Clack,s.held>=0?1:.6);emit(ClawEvent.Lift);}break;
   case 'lift':{stepCarriage(dt,0,0,CARRIAGE.vmax);const left=s.L-CABLE.min,vmax=Math.min(CABLE.lift,Math.sqrt(2*CABLE.liftAcc*Math.max(0,left)));
    s.Lv=Math.min(vmax,s.Lv+CABLE.liftAcc*dt);s.L=Math.max(CABLE.min,s.L-s.Lv*dt);if(s.t<.35)s.L+= (s.Lv*dt)*(1-s.t/.35);/* the cable takes up slack first */
    if(s.L<=CABLE.min+1e-4&&s.t>.5){s.L=CABLE.min;go('carry');emit(ClawEvent.Top);s.carryTo=0;}break;}
   case 'carry':{if(s.t<.3){stepCarriage(dt,0,0,CARRIAGE.vmax);break;}
    const dx=CLAW_HOME.x-s.cx,dz=CLAW_HOME.z-s.cz,d=Math.hypot(dx,dz),sp=Math.min(.42,Math.sqrt(2*CARRIAGE.dec*.8*d));
    stepCarriage(dt,d>1e-4?dx/d*sp/CARRIAGE.vmax:0,d>1e-4?dz/d*sp/CARRIAGE.vmax:0,CARRIAGE.vmax);
    if(d<.006&&Math.hypot(s.vx,s.vz)<.02){s.cx=CLAW_HOME.x;s.cz=CLAW_HOME.z;s.vx=s.vz=0;s.carryTo+=dt;if(s.carryTo>.35){go('release');setTargets(PRONG.open);if(s.held>=0)emit(ClawEvent.Release);s.held=-1;}}
    else if(s.t>9){go('release');setTargets(PRONG.open);s.held=-1;}break;}
   case 'release':stepCarriage(dt,0,0,CARRIAGE.vmax);if(s.t>=.8){go('reset');setTargets(PRONG.rest);}break;
   case 'reset':{stepCarriage(dt,0,0,CARRIAGE.vmax);let busy=false;for(let i=0;i<n;i++)if(active[i]&&!asleep[i])busy=true;// wait until everything the try moved has come to rest (a toy still sliding down the chute counts)
    if((!busy&&s.t>1)||s.t>6){let won=-1;for(let i=0;i<n;i++)if(active[i]&&delivered[i]){won=i;break;}s.result=won;go('done');}break;}
  }
  stepFingers(dt);stepHub(dt);rope();
  const clawLive=s.phase!=='home'||s.hy<1.2;
  integrateToys(dt);solveToys(dt,clawLive,s.phase==='close');rope();stepHold(dt);
  finishToys(dt);stepFlap(dt);
 }

 spawnPile();
 return {
  state:s,theta,count:n,px,py,pz,pr,active,asleep,squash,delivered,
  events:{code:evCode,value:evValue,get count(){return evCount;},clear(){evCount=0;}},
  /** Fixed-step advance for `seconds` of real time (carries the remainder; caps catch-up at 0.1 s). */
  advance:(()=>{let acc=0;return (seconds:number,ix:number,iz:number,drop:boolean)=>{acc=Math.min(.1,acc+seconds);let k=0;while(acc>=CLAW_DT){step(ix,iz,drop);acc-=CLAW_DT;k++;}return k;};})(),
  step,
  /** A paid try begins: the claw at home, the timer full. `firm`: the pity rule's firmer grip; `jitter`: 0.95…1.05 from the play id. */
  begin(opts:{firm?:boolean;jitterSeed?:number}={}){if(s.phase!=='home'&&s.phase!=='done')return false;s.firm=!!opts.firm;const j=clawRng(opts.jitterSeed??s.steps)();s.jitter=.95+j*.1;
   for(let i=0;i<n;i++)if(delivered[i])active[i]=0;// a prize left in the tray is the player's: it leaves the machine
   s.result=-1;s.aimLeft=CLAW_AIM_SECONDS;s.held=-1;go('aim');return true;},
  /** Stop a try before the drop (the player left): no result, the claw stays where it is. True when it was stopped. */
  abort(){if(s.phase!=='aim')return false;s.result=-1;s.held=-1;setTargets(PRONG.rest);go('done');return true;},
  /** Toys asleep, claw parked and the flap shut: nothing to simulate (the caller stops stepping). */
  get sleeping(){if(s.phase!=='home'&&s.phase!=='done')return false;if(Math.abs(s.flapV)>2e-3||Math.hypot(s.vx,s.vz)>1e-4)return false;
   const sw=Math.hypot(s.hx-s.hox,s.hy-s.hoy,s.hz-s.hoz);if(sw>2e-5)return false;for(let k=0;k<3;k++)if(Math.abs(thetaV[k])>1e-3)return false;
   for(let i=0;i<n;i++)if(active[i]&&!asleep[i])return false;return true;},
  /** The won toy leaves the tray; a new toy (`body` index slot reuse) drops in from above the pile. */
  replace(slot:number,body:ToyBody){if(slot<0||slot>=n)return;bodies[slot]=body;placeToy(slot,-.1+rand()*.6,1.25,-.3+rand()*.5,(rand()-.5)*.8,rand()*Math.PI*2);},
  remove(slot:number){active[slot]=0;},
  /** Tests: put a toy at a point (upright, at rest). */
  place(slot:number,x:number,y:number,z:number){if(slot>=0&&slot<n)placeToy(slot,x,y,z,0,0);},
  /** Fast-forward (leaving mid-try after the drop): runs steps with no input until the try is done. */
  finish(maxSeconds=20){let k=0;while(s.phase!=='done'&&s.phase!=='home'&&k<maxSeconds/CLAW_DT){step(0,0,s.phase==='aim');k++;}return s.result;},
  rest:(i:number)=>rest[i],
  settleOffline,
 };
}
export type ClawSim=ReturnType<typeof createClawSim>;
