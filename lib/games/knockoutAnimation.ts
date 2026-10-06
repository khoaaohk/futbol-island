// Oct 4 2026 polish (A6): a hit is a short knock-back, fall and get-up (1.15 s), not a 2 s stun-lock.
export const HIT_RECOVERY=1.15;
export const OUT_TELEPORT=2.7;
export const OUT_ARRIVAL=.5;
export const SHIELD_DURATION=5;
export const OUT_DISSOLVE=OUT_TELEPORT-.75;
const ease=(t:number)=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
export function knockoutPose(p:{alive:boolean;hitFlash:number;outAge:number;shield?:number},reduced=false){
 if(!p.alive){
  const age=p.outAge,queued=age>=OUT_TELEPORT;
  const vanish=ease((age-OUT_DISSOLVE)/(OUT_TELEPORT-OUT_DISSOLVE));
  return {roll:queued?0:1.5*ease(age/.35),turn:queued||reduced?0:Math.sin(Math.min(1,age/.5)*Math.PI)*.65,lift:queued?0:Math.sin(Math.min(1,age/.45)*Math.PI)*.35+vanish*.8,scale:queued?ease((age-OUT_TELEPORT)/OUT_ARRIVAL):1-vanish,stretch:queued?0:vanish,queued,daze:!queued&&age>.3&&age<OUT_DISSOLVE+.1};
 }
 // Fall (0-0.2 s), lie briefly, get up (0.5-0.95 s) with a small wobble that settles by HIT_RECOVERY.
 const age=HIT_RECOVERY-p.hitFlash,fall=ease(age/.2),stand=ease((age-.5)/.45);
 const shieldAge=SHIELD_DURATION-(p.shield??0);
 return {roll:p.hitFlash>0?1.4*fall*(1-stand)+(reduced?0:Math.sin(age*18)*.1*stand*(1-ease((age-.95)/.2))):0,turn:0,lift:p.hitFlash>0?Math.sin(Math.min(1,age/.25)*Math.PI)*.13:0,scale:1,stretch:0,queued:false,daze:p.hitFlash>0&&age>.3||((p.shield??0)>0&&shieldAge>=HIT_RECOVERY&&shieldAge<HIT_RECOVERY+.8)};
}
