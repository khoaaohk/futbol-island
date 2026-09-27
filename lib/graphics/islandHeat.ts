/**
 * Applies the heat tier (lib/graphics/heatTier) to the island and feeds the thermal governor from Town's rendered frames.
 * Tier 0 changes nothing: no resolution limit, shadows every frame, full NPC/traffic draw distance, animated water.
 */
import {ThermalGovernor,setGovernorTier,effectiveTier,subscribeHeatTier,forceHeatTier,batterySaverOn,heatOptions,TIERS,type HeatTier,type TierSettings} from './heatTier';
type ShadowRenderer={shadowMap:{autoUpdate:boolean;needsUpdate:boolean};getPixelRatio?:()=>number};
type Sun={shadow:{mapSize:{x:number;set:(x:number,y:number)=>unknown};map:{dispose():void}|null;normalBias?:number}};
type Car={pickup?:boolean;index:number;group:{visible:boolean;position:{x:number;z:number}}};
export type IslandHeatTargets={renderer:ShadowRenderer;sun:Sun;resolution:{setLimit(max:number):void};npcs:{setDrawDistance(metres:number|null):void};traffic:{cars:readonly Car[];rider:{index:number}};
 /** Sample frames for the governor (phones/tablets; desktop keeps only Battery saver and forced tiers). */governed:boolean};

export function createIslandHeat({renderer,sun,resolution,npcs,traffic,governed}:IslandHeatTargets){
 const governor=new ThermalGovernor();const hidden=new Set<Car>();
 let tier:HeatTier=effectiveTier(),settings:TierSettings=TIERS[tier],frame=0,spectating=false,limitApplied=-1;const options=heatOptions();
 // fewerAmbient (visible option, off): every 5th-and-3rd ordinary car (40%) is not drawn. Enabling it for real also needs them out of the traffic sim.
 const thinned=(car:Car)=>options.fewerAmbient&&governed&&!car.pickup&&(car.index%5===1||car.index%5===3);
 const applyLimit=()=>{const l=Math.min(settings.maxPixelRatio,spectating&&options.spectateDpr125&&governed?1.25:Infinity);if(l!==limitApplied){limitApplied=l;resolution.setLimit(l);}};
 // A tier's shadow size is a cap: phones start at 1024² (quality.ts), and tier 0 must never raise them back to 2048².
 const baseShadow=sun.shadow.mapSize.x,baseNormalBias=sun.shadow.normalBias;
 const restoreTraffic=()=>{for(const car of hidden)car.group.visible=true;hidden.clear();};
 const apply=(next:HeatTier)=>{
  tier=next;settings=TIERS[next];applyLimit();npcs.setDrawDistance(settings.npcDrawDistance);
  const size=Math.min(baseShadow,settings.shadowSize);if(sun.shadow.mapSize.x!==size){sun.shadow.mapSize.set(size,size);if(baseNormalBias!==undefined)sun.shadow.normalBias=baseNormalBias*baseShadow/size;sun.shadow.map?.dispose();sun.shadow.map=null;}
  renderer.shadowMap.autoUpdate=settings.shadowEvery<=1;renderer.shadowMap.needsUpdate=true;frame=0;
  if(settings.trafficDrawDistance===null)restoreTraffic();
 };
 // Hidden debug readout (quality pass): open the island with ?heat=1 to see the tier, resolution, frame rate and the governor's view.
 let readout:HTMLElement|null=null,readoutAt=0,frames=0;
 if(typeof window!=='undefined'&&typeof document!=='undefined'&&new URLSearchParams(window.location.search).get('heat')==='1'){readout=document.createElement('div');readout.dataset.heatReadout='';readout.setAttribute('aria-hidden','true');Object.assign(readout.style,{position:'fixed',left:'8px',top:'calc(env(safe-area-inset-top,0px) + 76px)',zIndex:'60',font:'600 11px/1.35 ui-monospace,Menlo,monospace',color:'#fff8e1',background:'rgba(20,32,28,.78)',padding:'5px 7px',borderRadius:'6px',pointerEvents:'none',whiteSpace:'pre'});document.body.appendChild(readout);}
 const frameMsNow=()=>spectating&&options.spectate24&&governed?Math.max(settings.frameMs,1000/24):settings.frameMs;
 apply(tier);const unsubscribe=subscribeHeatTier(apply);
 return {
  governor,
  get tier(){return tier;},get settings(){return settings;},get saver(){return batterySaverOn();},
  /** Phones are always capped at 30 fps; from tier 1 every device is. */get cap30(){return settings.cap30Everywhere;},
  /** Tiers 2–3: water ripples, waves and the ferry hold still (passed as `reduced` to those updates only). */get staticAmbience(){return settings.staticAmbience;},
  /** Frame slot for the capped loop: 30 fps, 24 fps at tier 3 (a uniform rate; never per-object); 24 fps while spectating with the spectate24 option. */get frameMs(){return frameMsNow();},
  get spectating(){return spectating;},
  force:forceHeatTier,
  /** Right before renderer.render: shadow refresh cadence and far-traffic thinning (render only; every car keeps driving). */
  beforeRender(player:{x:number;z:number},isSpectating=false){
   if(isSpectating!==spectating){spectating=isSpectating;applyLimit();}
   if(options.fewerAmbient&&governed)for(const car of traffic.cars)if(thinned(car)&&car.group.visible){car.group.visible=false;hidden.add(car);}
   if(settings.shadowEvery>1){if(frame%settings.shadowEvery===0)renderer.shadowMap.needsUpdate=true;frame++;}
   const limit=settings.trafficDrawDistance;if(limit===null)return;
   for(const car of traffic.cars){const far=!car.pickup&&car.index!==traffic.rider.index&&Math.hypot(car.group.position.x-player.x,car.group.position.z-player.z)>limit;
    if(far&&!hidden.has(car)&&car.group.visible){car.group.visible=false;hidden.add(car);}else if(!far&&hidden.has(car)){car.group.visible=true;hidden.delete(car);}}
  },
  /** Right after renderer.render: interval since the previous rendered frame, the frame's work, draw calls and the view (isolated field id or ''). */
  afterRender(now:number,interval:number,work:number,drawCalls:number,view:string){
   // Normalise to the 30 fps budget the governor judges against: at a 24 fps slot (tier 4, spectate24) every healthy frame is 41.7 ms,
   // which would otherwise read as "slow" (stepping down) and never as "calm" (never stepping back up).
   if(governed){const k=(1000/30)/frameMsNow();const next=governor.sample(now,interval*k,work*k,drawCalls,view);if(next!==-1)setGovernorTier(next);}
   if(readout){frames++;if(now-readoutAt>=500){const g=governor.last,fps=frames*1000/Math.max(1,now-readoutAt);readout.textContent=`heat tier ${tier}${batterySaverOn()?' (saver)':''} · res ${renderer.getPixelRatio?.().toFixed(2)??'?'}\n${fps.toFixed(0)} fps · median ${g.median.toFixed(0)} ms · base ${g.baseline.toFixed(0)} · ${g.state}`;readoutAt=now;frames=0;}}},
  dispose(){readout?.remove();unsubscribe();restoreTraffic();resolution.setLimit(Infinity);npcs.setDrawDistance(null);renderer.shadowMap.autoUpdate=true;}
 };
}
