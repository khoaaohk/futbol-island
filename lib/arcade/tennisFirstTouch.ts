import * as T from 'three';
import {canTennisTrap,tennisCourtOf,tennisFirstTouchSpot,TENNIS_FIRST_TOUCH,type TennisState} from '@/lib/games/soccerTennis';

/** Futbol Tennis first-touch target (Nov 10 2026, arcade part 3). One soft flat ring on YOUR side, a stride in front of you,
 * where a cushioned trap should set the ball down for the second touch (the same spot trap() aims for before its wobble).
 * Shown only on two-touch courts, only while a rival ball is trappable (the HUD's trap call) and, after your trap, frozen on
 * the spot until your strike: gold when the touch landed in it, else it fades. Nothing renders outside a live rally. Same
 * pattern as tennisBounceSpot: one 128 px canvas drawn once, +1 draw only while showing, no allocation per frame. Read only:
 * the zone never changes the rally. */
export const TENNIS_FIRST_TOUCH_RING={size:TENNIS_FIRST_TOUCH.r*2+.3,color:'#73fff1',hit:'#ffc93c',opacity:.55} as const;
type Stage={scene:T.Scene;reduced:boolean};

export function createTennisFirstTouch(stage:Stage){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
 const g=canvas.getContext('2d');
 if(g){g.clearRect(0,0,128,128);g.strokeStyle='#fff';g.fillStyle='#fff';g.lineWidth=7;g.setLineDash([16,10]);g.beginPath();g.arc(64,64,54,0,Math.PI*2);g.stroke();
  g.setLineDash([]);g.globalAlpha=.22;g.beginPath();g.arc(64,64,48,0,Math.PI*2);g.fill();g.globalAlpha=1;}
 const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
 const geo=new T.PlaneGeometry(TENNIS_FIRST_TOUCH_RING.size,TENNIS_FIRST_TOUCH_RING.size);geo.rotateX(-Math.PI/2);
 const mat=new T.MeshBasicMaterial({map:tex,color:TENNIS_FIRST_TOUCH_RING.color,transparent:true,opacity:TENNIS_FIRST_TOUCH_RING.opacity,depthWrite:false,toneMapped:false});
 const mesh=new T.Mesh(geo,mat);mesh.name='tennis-first-touch';mesh.visible=false;mesh.renderOrder=3;mesh.position.y=.04;stage.scene.add(mesh);
 let shownHit=false,age=0;
 /** Per frame while the game loop runs. Returns true while the ring is showing. */
 function sync(dt:number,s:TennisState){
  const b=s.ball,rally=s.phase==='rally'&&tennisCourtOf(s).touches>=2;
  const set=rally&&s.youTrapped&&s.setBonus>0&&b.last!=='you';// after your trap, until your strike
  const ready=rally&&!s.youTrapped&&canTennisTrap(s,'you');
  if(!set&&!ready){if(mesh.visible){mesh.visible=false;shownHit=false;}return false;}
  if(set){mesh.position.x=s.trapSpotX;mesh.position.z=s.trapSpotY;if(s.trapOnTarget!==shownHit||!mesh.visible){shownHit=s.trapOnTarget;mat.color.set(shownHit?TENNIS_FIRST_TOUCH_RING.hit:TENNIS_FIRST_TOUCH_RING.color);}
   mat.opacity=shownHit?.9:Math.max(0,mat.opacity-dt*1.5);}
  else{const spot=tennisFirstTouchSpot(s.you.x,s.you.y,b.x);mesh.position.x=spot.x;mesh.position.z=spot.y;if(shownHit||!mesh.visible){shownHit=false;mat.color.set(TENNIS_FIRST_TOUCH_RING.color);}mat.opacity=TENNIS_FIRST_TOUCH_RING.opacity;}
  age+=dt;mesh.scale.setScalar(stage.reduced?1:1+Math.sin(age*6)*.03);mesh.visible=true;return true;}
 return{sync,mesh,reset(){mesh.visible=false;shownHit=false;},dispose(){mesh.removeFromParent();geo.dispose();mat.dispose();tex.dispose();}};
}
