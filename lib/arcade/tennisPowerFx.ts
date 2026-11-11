import * as T from 'three';
import {TENNIS_CHARGE} from '@/lib/games/tennisPower';
import type {TennisState} from '@/lib/games/soccerTennis';

/** Futbol Tennis power + bounce effects (Oct 26 2026; comic house style Nov 10 2026). Three pooled draws, nothing allocated per frame:
 * 1. the inked charge ring: 28 instanced segments in a ring at your feet that ink in clockwise while you hold a shot (teal → the
 *    sun-yellow SWEET band → red OVERHIT) over unfilled ink segments, so the yellow target is readable; in the same draw, eight
 *    speed lines radiate from the ring and grow with the charge (none under reduced motion).
 * 2. the rival's wind-up ring: a red ring under the rival that grows as its telegraphed power shot nears contact.
 * 3. bounce marks: 6 flat print-colour discs where the ball lands, tinted by the shot (power = orange, drop = blue), shrinking
 *    away over 1.6 s. Reduced motion keeps the meter and ring (they are information) but drops the shake. */
export const TENNIS_METER_SEGMENTS=28,TENNIS_BOUNCE_MARKS=6,TENNIS_SPEED_LINES=8;
/** Segment i covers charge [i, i+1] × max/segments. Exported so the test and HUD agree on the bands. */
export const tennisMeterBand=(i:number)=>{const at=(i+.5)*TENNIS_CHARGE.max/TENNIS_METER_SEGMENTS;return at>TENNIS_CHARGE.sweetHi?'over':at>=TENNIS_CHARGE.sweetLo?'sweet':'build';};
export const tennisMeterFilled=(level:number)=>Math.max(0,Math.min(TENNIS_METER_SEGMENTS,Math.ceil(level/TENNIS_CHARGE.max*TENNIS_METER_SEGMENTS-1e-6)));
type Stage={scene:T.Scene;reduced:boolean};
export function createTennisPowerFx(stage:Stage){
 const meter=new T.InstancedMesh(new T.BoxGeometry(.17,.035,.075),new T.MeshBasicMaterial({toneMapped:false}),TENNIS_METER_SEGMENTS+TENNIS_SPEED_LINES);meter.name='tennis-power-meter';meter.frustumCulled=false;meter.castShadow=false;meter.visible=false;
 const m=new T.Matrix4(),q=new T.Quaternion(),p=new T.Vector3(),sc=new T.Vector3(1,1,1),up=new T.Vector3(0,1,0),color=new T.Color();
 const bright={build:new T.Color('#19b5a5'),sweet:new T.Color('#ffc83a'),over:new T.Color('#f0452e')},dim={build:new T.Color('#231a2e'),sweet:new T.Color('#6a5518'),over:new T.Color('#5a2420')},lineInk=new T.Color('#231a2e'),lineQ=new T.Quaternion(),lineS=new T.Vector3();
 for(let i=0;i<TENNIS_METER_SEGMENTS;i++){const a=-(i+.5)/TENNIS_METER_SEGMENTS*Math.PI*2;q.setFromAxisAngle(up,a);p.set(Math.sin(a+Math.PI)*.98,0,Math.cos(a+Math.PI)*.98);meter.setMatrixAt(i,m.compose(p,q,sc));meter.setColorAt(i,dim[tennisMeterBand(i)]);}
 for(let i=0;i<TENNIS_SPEED_LINES;i++){meter.setMatrixAt(TENNIS_METER_SEGMENTS+i,m.makeScale(0,0,0));meter.setColorAt(TENNIS_METER_SEGMENTS+i,lineInk);}
 const group=new T.Group();group.name='tennis-power';group.add(meter);stage.scene.add(group);
 const windup=new T.Mesh(new T.RingGeometry(.78,.9,40),new T.MeshBasicMaterial({color:'#f0452e',transparent:true,opacity:.85,depthWrite:false,side:T.DoubleSide,toneMapped:false}));windup.rotation.x=-Math.PI/2;windup.name='tennis-rival-windup';windup.visible=false;stage.scene.add(windup);
 const marks=new T.InstancedMesh(new T.CircleGeometry(.26,18),new T.MeshBasicMaterial({transparent:true,opacity:.6,depthWrite:false,toneMapped:false}),TENNIS_BOUNCE_MARKS);marks.name='tennis-bounce-marks';marks.frustumCulled=false;marks.count=0;
 const flat=new T.Quaternion().setFromAxisAngle(new T.Vector3(1,0,0),-Math.PI/2),markLife=new Float32Array(TENNIS_BOUNCE_MARKS),markX=new Float32Array(TENNIS_BOUNCE_MARKS),markZ=new Float32Array(TENNIS_BOUNCE_MARKS),markTint:T.Color[]=Array.from({length:TENNIS_BOUNCE_MARKS},()=>new T.Color());
 for(let i=0;i<TENNIS_BOUNCE_MARKS;i++)marks.setColorAt(i,color.setRGB(0,0,0));stage.scene.add(marks);
 let filled=-1,bounceSeen=-1,next=0,alive=0,shake=0;
 const tint={power:new T.Color('#ff8a3c'),drop:new T.Color('#7fd0f0'),lob:new T.Color('#ffffff'),plain:new T.Color('#fff3d6'),over:new T.Color('#f0452e')};
 /** Per frame. `dt` is real seconds. Returns true while anything here is animating (keeps frames coming). */
 function sync(dt:number,s:TennisState){
  // 1. Power meter at your feet.
  const holding=!!s.chargeShot&&(s.phase==='rally'||s.phase==='serve');meter.visible=holding;
  if(holding){group.position.set(s.you.x,.05,s.you.y);const n=tennisMeterFilled(s.charge);
   if(n!==filled){for(let i=0;i<TENNIS_METER_SEGMENTS;i++){const band=tennisMeterBand(i);meter.setColorAt(i,i<n?bright[band]:dim[band]);}filled=n;if(meter.instanceColor)meter.instanceColor.needsUpdate=true;}
   const over=s.charge>TENNIS_CHARGE.sweetHi;shake+=dt;group.rotation.y=over&&!stage.reduced?Math.sin(shake*38)*.06:0;const pulse=s.charge>=TENNIS_CHARGE.sweetLo&&!over&&!stage.reduced?1+Math.sin(shake*18)*.04:1;group.scale.setScalar(pulse);
   // Speed lines: eight ink strokes round the ring that lengthen with the charge and jitter a little (drawn comic energy).
   if(!stage.reduced){const c=Math.min(1,s.charge/TENNIS_CHARGE.max),tick=Math.floor(shake*12);for(let i=0;i<TENNIS_SPEED_LINES;i++){const a=(i+.5)/TENNIS_SPEED_LINES*Math.PI*2+(tick%2)*.16,len=(.18+c*.75)*(.7+((i*7+tick)%5)*.12),r=1.26+len/2;lineQ.setFromAxisAngle(up,-a);p.set(Math.cos(a)*r,0,Math.sin(a)*r);meter.setMatrixAt(TENNIS_METER_SEGMENTS+i,m.compose(p,lineQ,lineS.set(len/.17,1,.9)));}meter.instanceMatrix.needsUpdate=true;}}
  else if(filled!==-1){filled=-1;for(let i=0;i<TENNIS_METER_SEGMENTS;i++)meter.setColorAt(i,dim[tennisMeterBand(i)]);if(meter.instanceColor)meter.instanceColor.needsUpdate=true;}
  // 2. The rival's wind-up: grows as the ball nears its telegraphed power shot.
  const winding=s.phase==='rally'&&s.ball.last==='you'&&!!s.rivalPlan&&s.rivalPower>0;windup.visible=winding;
  if(winding){const d=Math.hypot(s.ball.x-s.rival.x,s.ball.y-s.rival.y),k=Math.max(0,Math.min(1,1-(d-.8)/3.2));windup.position.set(s.rival.x,.06,s.rival.y);windup.scale.setScalar(.6+k*.7);(windup.material as T.MeshBasicMaterial).opacity=.35+k*.55;}
  // 3. Bounce marks.
  if(s.bounceEvents!==bounceSeen){const fresh=bounceSeen>=0&&s.bounceEvents>bounceSeen;bounceSeen=s.bounceEvents;
   if(fresh){const i=next;next=(next+1)%TENNIS_BOUNCE_MARKS;markLife[i]=1.6;markX[i]=s.fxLandX;markZ[i]=s.fxLandY;const shot=s.lastShot,mine=s.lastKicker==='you';
    markTint[i].copy(mine&&s.powerGrade==='over'?tint.over:shot==='drop'?tint.drop:shot==='lob'||shot==='flick'?tint.lob:(mine?s.powerGrade==='sweet'||s.powerGrade==='power':s.rivalPowerGrade==='sweet'||s.rivalPowerGrade==='power')||shot==='drive'?tint.power:tint.plain);alive=TENNIS_BOUNCE_MARKS;}}
  if(alive>0){let live=0;for(let i=0;i<TENNIS_BOUNCE_MARKS;i++){if(markLife[i]>0){markLife[i]=Math.max(0,markLife[i]-dt);live++;}const life=markLife[i]/1.6;
    p.set(markX[i],.028+i*.0008,markZ[i]);sc.setScalar(life>0?(.45+life*.6):0);marks.setMatrixAt(i,m.compose(p,flat,sc));marks.setColorAt(i,color.copy(markTint[i]));}
   sc.set(1,1,1);marks.count=TENNIS_BOUNCE_MARKS;marks.instanceMatrix.needsUpdate=true;if(marks.instanceColor)marks.instanceColor.needsUpdate=true;if(!live){alive=0;marks.count=0;}}
  return holding||winding||alive>0;
 }
 function reset(){markLife.fill(0);alive=0;marks.count=0;meter.visible=false;windup.visible=false;filled=-1;}
 return {sync,reset,meter,windup,marks};
}
