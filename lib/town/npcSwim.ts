// Swimming islanders (Nov 13 2026, owner: "NPC swimmers look dead" — beach islanders whose spot was in the sea lay face-down or
// sat still in the water). Anyone in the water now SWIMS with the player's own swim rig poses (lib/graphics/swimPose.ts, the
// same SwimRigPose the remote swimmers use): a gentle front-crawl loop round their spot with a tread-water rest, or (a floater)
// a slow drift on the back with a bob and a wave now and then. Head above the water: the root sits at the player's swim depth.
// Pure numbers, no three.js and no allocation per step (lib/graphics/islandNpcs.ts steps them; tests/beach-npcs.cjs checks the
// loops stay in swimming-depth water).
export type NpcSwim={kind:'swim'|'float';/** loop radius (m) round the islander's (x, z) */r:number};
/** The rig root while swimming: waterDepth.ts SWIM_ROOT_Y (WATER_LEVEL − SWIM_ROOT_DEPTH); tests pin them equal. */
export const NPC_SWIM_ROOT_Y=-1.43;
/** Crawl speed (m/s, an easy pace: the player's is 4.8), the tread-water rest between laps (s), the floater's drift (m/s), its
 *  wave (every `waveEvery` s, `waveFor` s long), and the range (m) inside which they spawn ripples. */
export const NPC_SWIM={speed:1.1,tread:5,drift:.1,waveEvery:11,waveFor:2.2,ripples:30} as const;
/** The two islanders in the sea, off Palm Coast Beach (loop centres in swimming-depth water). */
export const NPC_SWIMMERS={
 kiri:{x:-10,z:125,swim:{kind:'swim',r:3.5}},
 tavita:{x:-30.5,z:115.5,swim:{kind:'float',r:1.4}},
} as const satisfies Record<string,{x:number;z:number;swim:NpcSwim}>;
export type NpcSwimState={cx:number;cz:number;r:number;float:boolean;a:number;t:number;crawl:boolean;phase:number;
 x:number;z:number;yaw:number;kind:'crawl'|'tread'|'float';effort:number;wave:number;bob:number;clock:number};
export function createNpcSwim(cx:number,cz:number,swim:NpcSwim,seed:number):NpcSwimState{
 const a=seed%6.283;const s:NpcSwimState={cx,cz,r:swim.r,float:swim.kind==='float',a,t:0,crawl:swim.kind==='swim',phase:0,x:cx,z:cz,yaw:0,kind:swim.kind==='float'?'float':'crawl',effort:0,wave:0,bob:0,clock:seed%NPC_SWIM.waveEvery};
 place(s);return s;
}
function place(s:NpcSwimState){s.x=s.cx+Math.sin(s.a)*s.r;s.z=s.cz+Math.cos(s.a)*s.r;s.yaw=Math.atan2(Math.cos(s.a),-Math.sin(s.a));}
/** One step: `hold` (someone is talking to them, or they are stunned) stops the loop: the swimmer treads water, the floater stays. */
export function stepNpcSwim(s:NpcSwimState,dt:number,reduced:boolean,hold:boolean){
 s.clock+=dt;
 if(s.float){
  if(!hold&&!reduced){s.a+=NPC_SWIM.drift/s.r*dt;place(s);}
  s.kind='float';s.effort=0;s.phase=reduced?0:s.phase+dt*1.3;
  // a slow wave now and then: eases in and out over .3 s
  const w=s.clock%NPC_SWIM.waveEvery,up=Math.min(1,w/.3,(NPC_SWIM.waveFor-w)/.3);s.wave=reduced?0:Math.max(0,up);
  s.bob=0;return s;
 }
 s.wave=0;
 if(hold){s.crawl=false;s.t=0;}
 else{s.t+=dt;if(s.crawl&&s.t>=Math.PI*2*s.r/NPC_SWIM.speed){s.crawl=false;s.t=0;}else if(!s.crawl&&s.t>=NPC_SWIM.tread){s.crawl=true;s.t=0;}}
 if(s.crawl&&!reduced){s.a+=NPC_SWIM.speed/s.r*dt;place(s);}
 s.kind=s.crawl?'crawl':'tread';s.effort=s.crawl?.4:0;s.phase=reduced?0:s.phase+dt*(s.crawl?5:1.5);
 s.bob=reduced?0:.035*Math.sin(s.clock*1.7);
 return s;
}
