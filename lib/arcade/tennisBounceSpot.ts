import * as T from 'three';
import type {TennisState} from '@/lib/games/soccerTennis';
import {tennisAtlas,tennisAtlasUv,TENNIS_ATLAS} from './tennisArena';

/** Futbol Tennis bounce spot (round 3, Oct 26 2026): one flat decal on the exact spot the rival's ball will bounce
 * (dot + ring + four ticks: a chalk mark with a navy keyline, one cell of the shared decal sheet in tennisArena.ts). It shrinks as the ball closes in, so the ring reads as a
 * countdown: "it lands HERE, soon". Uses the landing the sim already solved at the rival's contact (`landX/landY`,
 * honouring drag, spin and wind), so it costs no extra flight prediction. Hidden after the bounce, after a net clip and
 * when the ball is flying out (the red "let it go" ring takes over). +1 draw only while a rival ball is in the air. */
export const TENNIS_BOUNCE_SPOT={size:1.5,min:.62,max:1.18,color:'#ffffff',sand:'#fff6c8'} as const;
/** Decal scale for the share of the flight still to go (1 = just struck, 0 = landing now). Pure. */
export const tennisBounceSpotScale=(left:number)=>TENNIS_BOUNCE_SPOT.min+(TENNIS_BOUNCE_SPOT.max-TENNIS_BOUNCE_SPOT.min)*Math.max(0,Math.min(1,left));
type Stage={scene:T.Scene;reduced:boolean};

export function createTennisBounceSpot(stage:Stage){
  const tex=tennisAtlas(stage.scene);
 const geo=tennisAtlasUv(new T.PlaneGeometry(TENNIS_BOUNCE_SPOT.size,TENNIS_BOUNCE_SPOT.size),TENNIS_ATLAS.bounce);geo.rotateX(-Math.PI/2);
 const mat=new T.MeshBasicMaterial({map:tex,color:TENNIS_BOUNCE_SPOT.color,transparent:true,opacity:.95,depthWrite:false,toneMapped:false});
 const mesh=new T.Mesh(geo,mat);mesh.name='tennis-bounce-spot';mesh.visible=false;mesh.renderOrder=4;mesh.position.y=.05;stage.scene.add(mesh);
 let kick=-1,net=-1,start=1,age=0;
 /** Per frame while the game loop runs. Returns true while the decal is showing. */
 function sync(dt:number,s:TennisState){const b=s.ball;
  const live=s.phase==='rally'&&b.last==='rival'&&b.bounces===0&&!b.netHit&&!s.incomingOut&&s.landY>0&&s.landY<8.2&&Math.abs(s.landX)<5.2;
  if(!live){if(mesh.visible)mesh.visible=false;return false;}
  if(kick!==s.kickCount||net!==s.netEvents){kick=s.kickCount;net=s.netEvents;start=Math.max(.5,Math.hypot(b.x-s.landX,b.y-s.landY));age=0;mesh.position.x=s.landX;mesh.position.z=s.landY;}
  age+=dt;const left=Math.hypot(b.x-s.landX,b.y-s.landY)/start,pulse=stage.reduced?0:Math.sin(age*10)*.04;
  mesh.scale.setScalar(tennisBounceSpotScale(left)+pulse);mat.opacity=.6+.35*(1-Math.min(1,left));mesh.visible=true;return true;}
 return{sync,mesh,reset(){mesh.visible=false;kick=-1;net=-1;},dispose(){mesh.removeFromParent();geo.dispose();mat.dispose();}};
}
