/** Contact-normalized football techniques. Distances are rig-local metres, angles radians.
 * The forward tangent is shared across impact: contact is not the end of the swing.
 * Original curves; no third-party animation assets or runtime solver dependency.
 */
export const STRIKE_CONTACT=.36;
export type StrikeKind='pass'|'shot'|'loft';
export type StrikePose={forward:number;height:number;open:number;pitch:number;load:number;drive:number;follow:number};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{x=clamp(x);return x*x*(3-2*x);};
function hermite(t:number,a:number,b:number,va:number,vb:number,duration:number){
 t=clamp(t);const t2=t*t,t3=t2*t;
 return (2*t3-3*t2+1)*a+(t3-2*t2+t)*va*duration+(-2*t3+3*t2)*b+(t3-t2)*vb*duration;
}
export function strikePose(phase:number,kind:StrikeKind,power:number,out:StrikePose):StrikePose{
 const p=clamp(phase),strength=clamp(power),pass=kind==='pass',loft=kind==='loft';
 const back=pass?-.15-.09*strength:loft?-.3:-.32-.09*strength;
 const end=pass?.48+.12*strength:loft?.57:.59+.04*strength,peak=pass?.55:.59;
 const speed=pass?1.6+.8*strength:loft?2.6:2.9+.5*strength;
 out.forward=p<.16?hermite(p/.16,0,back,0,0,.16):p<STRIKE_CONTACT?
  hermite((p-.16)/.2,back,.32,0,speed,.2):p<peak?
  hermite((p-STRIKE_CONTACT)/(peak-STRIKE_CONTACT),.32,end,speed,0,peak-STRIKE_CONTACT):
  hermite((p-peak)/(1-peak),end,0,0,0,1-peak);
 // Lift grows after the equatorial contact. A loft continues upward, not backwards.
 out.height=p<STRIKE_CONTACT?.075+(pass?.035:loft?.14:.18+.025*strength)*Math.sin(Math.PI*p/STRIKE_CONTACT)**2:
  .075+(loft?.3:pass?.11:.23+.04*strength)*Math.sin(Math.PI*(p-STRIKE_CONTACT)/(1-STRIKE_CONTACT))**2;
 out.open=pass?1.15*ease(p/.23)*(1-ease((p-.68)/.32)):loft?.12*ease(p/.2)*(1-ease((p-.7)/.3)):0;
 out.pitch=pass?0:(loft?-.12:.22)*ease(p/.22)*(1-ease((p-.64)/.36));
 out.load=ease(p/.15)*(1-ease((p-.18)/.2));
 out.drive=ease((p-.18)/.25)*(1-ease((p-.65)/.35));
 out.follow=ease((p-STRIKE_CONTACT)/.2)*(1-ease((p-.75)/.25));
 return out;
}
