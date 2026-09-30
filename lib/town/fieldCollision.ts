/**
 * Solid live-field players and island townsfolk for the main character (walk and ground rides).
 *
 * Circle-vs-circle push-out against every visible player rig on a live pitch (the three grass fields and the
 * rooftop futsal court). The character slides round a player (the tangential velocity is kept, only the part
 * driving into the player is removed) and a fresh contact gives a subtle bump: a small push-back, a squash
 * wobble on the character and a tiny sidestep + lean on the sim player. Never a knockdown, fall or daze.
 *
 * The match sim is never touched: the sim player's reaction is a render-only offset written to
 * `rig.root.userData.fieldNudge`, which fieldRuntime adds after posing (and it decays to nothing in ~.45 s).
 *
 * Cost: one AABB test per venue per tick; players are only visited while the character is on (or within
 * 1.5 m of) a pitch at the pitch's height, with a cheap squared-distance reject before any sqrt.
 */
export type FieldCollisionVenue={x:number;z:number;width:number;length:number;elevation?:number;/** A quarter-turned court (the beach court) swaps its x/z extents. */yaw?:number};
export type FieldCollisionRig={root:{visible:boolean;position:{x:number;z:number};scale:{x:number};rotation?:{y:number};userData:Record<string,unknown>}};
export type FieldCollisionEntry={venue:FieldCollisionVenue;root:{visible:boolean};rigs:Map<string,FieldCollisionRig>};
export type FieldNudge={x:number;z:number;lean:number};
export type FieldBumpEvent={id:string;venue:FieldCollisionVenue|null;nx:number;nz:number;speed:number;strength:number;kind:'field'|'npc'};
/** An island townsperson as lib/graphics/islandNpcs keeps it (its entries are passed as-is; nothing is copied). */
export type FieldCollisionNpc={id:string;position:{x:number;y:number;z:number};distance:number;stunned:boolean;ride:unknown;rig:{root:{visible:boolean;position:{x:number;z:number};scale:{x:number};rotation?:{y:number;z:number};userData:Record<string,unknown>}}};
export type FieldCollisionContext={
 entries:readonly FieldCollisionEntry[];
 /** Ground height under the character (rooftop.state.height). */
 height:number;
 ride:string;
 /** Skip everything (jetpack flight, falling, lessons, menus). */
 disabled?:boolean;
 /** Is (x,z) free for the character? A push-out into a wall or goal net is skipped. */
 canMove?:(x:number,z:number)=>boolean;
 /** Island townsfolk (islandNpcs.entries); their `distance` from islandNpcs.update is the broad phase. */
 npcs?:readonly FieldCollisionNpc[];
};

/** Limb clearance added round the bean shell (arms swing a little wider than the body). */
const LIMB_PAD=.1;
export const FIELD_BODY_MIN=.35,FIELD_BODY_MAX=.45,FIELD_BODY_DEFAULT=.38;
/** Extra reach for the character on a ground ride (the deck/frame is longer than the body). */
export const RIDE_PAD:Record<string,number>={scooter:.08,bike:.12,moped:.14};
/** Townsfolk further than this (islandNpcs' own per-frame distance) are skipped with one compare. */
const NPC_BROAD=3,NPC_RIDE_PAD=.1;
const MARGIN=1.5,HEIGHT_TOLERANCE=.9,BUMP_MIN_SPEED=.6,BUMP_COOLDOWN=.45,FEEDBACK_COOLDOWN=.45,NUDGE_TIME=.45;

/** Body radius from the bean body dims the skin publishes on the rig (`userData.beanBody`), scaled by the rig. */
export function fieldBodyRadius(userData:Record<string,unknown>|undefined,scale=1){
 const body=userData?.beanBody as {ground?:number[]}|undefined;let shell=0;
 if(body?.ground)for(let i=1;i<body.ground.length;i+=2)shell=Math.max(shell,body.ground[i]);
 const r=shell>0?shell*Math.max(.5,scale)+LIMB_PAD:FIELD_BODY_DEFAULT;
 return Math.min(FIELD_BODY_MAX,Math.max(FIELD_BODY_MIN,r));
}

/** Is the character on or next to this venue, at its height? */
export function nearVenue(v:FieldCollisionVenue,x:number,z:number,height:number,margin=MARGIN){
 const turned=Math.abs(Math.sin(v.yaw??0))>.5,hx=turned?v.length/2:v.width/2,hz=turned?v.width/2:v.length/2;
 return Math.abs(height-(v.elevation??0))<HEIGHT_TOLERANCE&&Math.abs(x-v.x)<hx+margin&&Math.abs(z-v.z)<hz+margin;
}

/**
 * Push `pos` out of a circle at (cx,cz) with combined radius `reach`, keeping tangential velocity.
 * Returns the approach speed into the body (≥0) or −1 when not touching.
 */
export function pushOutCircle(pos:{x:number;z:number},vel:{x:number;z:number},cx:number,cz:number,reach:number,canMove?:(x:number,z:number)=>boolean){
 let dx=pos.x-cx,dz=pos.z-cz;const d2=dx*dx+dz*dz;
 if(d2>=reach*reach)return -1;
 let d=Math.sqrt(d2);
 // Dead centre: push back against the direction of travel (or +x when still).
 if(d<1e-6){const v=Math.hypot(vel.x,vel.z);dx=v>1e-6?-vel.x/v:1;dz=v>1e-6?-vel.z/v:0;d=1;}
 const nx=dx/d,nz=dz/d,x=cx+nx*reach,z=cz+nz*reach;
 const into=-(vel.x*nx+vel.z*nz);
 if(canMove&&!canMove(x,z))return -1;
 pos.x=x;pos.z=z;
 // Remove only the inward normal component: the slide round the player keeps its pace.
 if(into>0){vel.x+=nx*into;vel.z+=nz*into;}
 return Math.max(0,into);
}

type Nudge={nx:number;nz:number;amount:number;lean:number;age:number;out:FieldNudge};
type Bumpable={root:{rotation?:{y:number};userData:Record<string,unknown>}};

export function createFieldCollision(){
 const nudges=new Map<Bumpable,Nudge>(),npcNudged=new Set<FieldCollisionNpc>();
 let clock=0,feedbackAt=-Infinity;
 // Character wobble: squash spring (x = squash amount) and a roll away from the player.
 let squashX=0,squashV=0,roll=0,rollV=0,rollX=0,rollZ=0;
 const stats={checks:0,bodies:0,bumps:0,npcBodies:0};
 // One reused event: the step allocates nothing per tick (a bump allocates a nudge record once per body).
 const event:FieldBumpEvent={id:'',venue:null,nx:0,nz:0,speed:0,strength:0,kind:'field'};
 let best=0;

 /** Push out of one body; on a fresh contact start a soft bump. Returns true when touching. */
 function contact(pos:{x:number;z:number},vel:{x:number;z:number},body:Bumpable,id:string,venue:FieldCollisionVenue|null,kind:'field'|'npc',cx:number,cz:number,reach:number,ride:string,fresh:boolean,canMove?:(x:number,z:number)=>boolean){
  const pre=Math.hypot(vel.x,vel.z),into=pushOutCircle(pos,vel,cx,cz,reach,canMove);
  if(into<0)return false;
  const ud=body.root.userData;
  if(fresh&&into>=BUMP_MIN_SPEED&&clock-((ud.fieldBumpAt as number|undefined)??-Infinity)>BUMP_COOLDOWN){
   ud.fieldBumpAt=clock;
   const d=Math.hypot(pos.x-cx,pos.z-cz)||1,nx=(pos.x-cx)/d,nz=(pos.z-cz)/d;
   // Rides at pace bump a little harder, but it stays a nudge.
   const riding=ride!=='walk',strength=Math.min(1,into/(riding?9:6))*(riding?1.35:1);
   // Small push-back: a fraction of the approach, capped (walk ≤ .9 m/s, rides ≤ 1.6 m/s).
   const kick=Math.min(riding?1.6:.9,.25*into+.2);vel.x+=nx*kick;vel.z+=nz*kick;
   if(strength>best){best=strength;event.id=id;event.venue=venue;event.nx=nx;event.nz=nz;event.speed=pre;event.strength=strength;event.kind=kind;}
   const k=Math.min(1,strength);let n=nudges.get(body);
   if(!n){n={nx:0,nz:0,amount:0,lean:0,age:0,out:(ud.fieldNudge as FieldNudge|undefined)??{x:0,z:0,lean:0}};nudges.set(body,n);}
   n.nx=-nx;n.nz=-nz;n.amount=.04+.07*k;n.lean=.05+.08*k;n.age=0;
   squashV-=(1.1+1.6*strength);rollX=nx;rollZ=nz;rollV+=1.4+1.6*strength;stats.bumps++;
  }
  return true;
 }

 /** One movement tick: resolves contacts on `pos`/`vel` in place. Returns the strongest new bump (a reused object) or null. */
 function step(dt:number,pos:{x:number;z:number},vel:{x:number;z:number},ctx:FieldCollisionContext):FieldBumpEvent|null{
  clock+=Math.max(0,dt);
  if(ctx.disabled||ctx.ride==='jetpack')return null;
  const self=FIELD_BODY_DEFAULT+(RIDE_PAD[ctx.ride]??0);best=0;
  for(const e of ctx.entries){
   const v=e.venue;stats.checks++;
   if(!e.root.visible||!nearVenue(v,pos.x,pos.z,ctx.height))continue;
   // Two passes settle a squeeze between two players.
   for(let pass=0;pass<2;pass++){let touched=false;
    for(const id of e.rigs.keys()){
     const rig=e.rigs.get(id)!;if(!rig.root.visible)continue;
     const n=rig.root.userData.fieldNudge as FieldNudge|undefined,cx=rig.root.position.x-(n?.x??0),cz=rig.root.position.z-(n?.z??0);
     const dx=pos.x-cx,dz=pos.z-cz;if(dx*dx+dz*dz>1.21)continue;// broad phase: combined reach ≤ 1.04 m
     stats.bodies++;
     if(contact(pos,vel,rig,id,v,'field',cx,cz,self+fieldBodyRadius(rig.root.userData,rig.root.scale.x),ctx.ride,pass===0,ctx.canMove))touched=true;
    }
    if(!touched)break;
   }
  }
  // Townsfolk: `distance` is what islandNpcs.update already measured this frame (3D, to the character), so
  // the broad phase is one compare per NPC and nobody further than NPC_BROAD metres is ever touched.
  if(ctx.npcs)for(let pass=0;pass<2;pass++){let touched=false;
   for(let i=0;i<ctx.npcs.length;i++){
    const npc=ctx.npcs[i];if(!(npc.distance<NPC_BROAD)||npc.stunned||!npc.rig.root.visible)continue;
    const p=npc.position;if(Math.abs(p.y-ctx.height)>HEIGHT_TOLERANCE)continue;
    const dx=pos.x-p.x,dz=pos.z-p.z;if(dx*dx+dz*dz>1.44)continue;
    stats.npcBodies++;
    if(contact(pos,vel,npc.rig,npc.id,null,'npc',p.x,p.z,self+fieldBodyRadius(npc.rig.root.userData,npc.rig.root.scale.x)+(npc.ride?NPC_RIDE_PAD:0),ctx.ride,pass===0,ctx.canMove)){touched=true;npcNudged.add(npc);}
   }
   if(!touched)break;
  }
  return best>0?event:null;
 }

 /** Feedback gate: true at most once per .45 s (soft sound + haptic tick). */
 function feedbackReady(){if(clock-feedbackAt<FEEDBACK_COOLDOWN)return false;feedbackAt=clock;return true;}

 /** Advance the render-only nudges (call once per frame, before fieldRuntime.update poses the field players). */
 function updateNudges(dt:number,reduced=false){
  if(!nudges.size)return;
  for(const [body,n] of nudges){
   n.age+=Math.max(0,dt);const t=n.age/NUDGE_TIME;
   if(t>=1){nudges.delete(body);delete body.root.userData.fieldNudge;continue;}
   // Quick sidestep out (first ~20 %), eased settle back to the true spot.
   const env=(t<.2?Math.sin(t/.2*Math.PI/2):.5+.5*Math.cos((t-.2)/.8*Math.PI))*(reduced?.5:1);
   const yaw=body.root.rotation?.y??0,side=n.nx*Math.cos(yaw)-n.nz*Math.sin(yaw);
   n.out.x=n.nx*n.amount*env;n.out.z=n.nz*n.amount*env;n.out.lean=-side*n.lean*env;body.root.userData.fieldNudge=n.out;
  }
 }

 /**
  * Draw the townsfolk nudges: call right after islandNpcs.update. The rig is placed from the NPC's own route position
  * (`entry.position`, never changed here) plus the nudge, so it is idempotent even for a frame the NPC was not re-posed,
  * and the route, routine and Talk distance are untouched. Nothing runs when nobody was bumped.
  */
 function applyNpcNudges(){
  if(!npcNudged.size)return;
  for(const npc of npcNudged){
   const root=npc.rig.root,n=root.userData.fieldNudge as FieldNudge|undefined;
   if(npc.stunned){npcNudged.delete(npc);continue;}
   root.position.x=npc.position.x+(n?.x??0);root.position.z=npc.position.z+(n?.z??0);
   if(root.rotation)root.rotation.z=n?.lean??0;
   if(!n)npcNudged.delete(npc);
  }
 }

 /** Character wobble: multiply onto the root's scale and add a tiny roll. Call after Town sets the pose. */
 function pose(root:{scale:{x:number;y:number;z:number;set:(x:number,y:number,z:number)=>unknown};rotation:{y:number;z:number}},dt:number,reduced=false){
  if(dt>0&&(squashX||squashV||roll||rollV)){
   const steps=Math.min(4,Math.ceil(dt*60-1e-9)),h=dt/steps;
   for(let i=0;i<steps;i++){squashV+=(-196*squashX-17*squashV)*h;squashX+=squashV*h;rollV+=(-160*roll-16*rollV)*h;roll+=rollV*h;}
   if(Math.abs(squashX)<2e-4&&Math.abs(squashV)<3e-3){squashX=squashV=0;}
   if(Math.abs(roll)<2e-4&&Math.abs(rollV)<3e-3){roll=rollV=0;}
  }
  if(!squashX&&!roll)return;
  const k=reduced?.4:1,s=1+Math.max(-.1,Math.min(.1,squashX))*k,r=1/Math.sqrt(s);
  root.scale.set(root.scale.x*r,root.scale.y*s,root.scale.z*r);
  const yaw=root.rotation.y,side=rollX*Math.cos(yaw)-rollZ*Math.sin(yaw);
  root.rotation.z+=-side*Math.max(-.12,Math.min(.12,roll))*k;
 }

 function reset(){for(const body of nudges.keys())delete body.root.userData.fieldNudge;nudges.clear();applyNpcNudges();npcNudged.clear();squashX=squashV=roll=rollV=0;}
 return {step,updateNudges,applyNpcNudges,pose,feedbackReady,reset,stats,get wobble(){return {squash:squashX,roll};}};
}
