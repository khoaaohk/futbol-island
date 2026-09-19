export const HIT_RECOVERY=2;
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
 const age=HIT_RECOVERY-p.hitFlash,fall=ease(age/.25),stand=ease((age-1.1)/.65);
 return {roll:p.hitFlash>0?1.4*fall*(1-stand)+(reduced?0:Math.sin(age*18)*.1*stand*(1-ease((age-1.75)/.25))):0,turn:0,lift:p.hitFlash>0?Math.sin(Math.min(1,age/.3)*Math.PI)*.13:0,scale:1,stretch:0,queued:false,daze:p.hitFlash>0&&age>.5||((p.shield??0)>SHIELD_DURATION-2.7&&(p.shield??0)<SHIELD_DURATION-1.7)};
}
