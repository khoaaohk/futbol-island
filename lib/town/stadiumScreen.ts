// West Stadium, phase 3 (Nov 12 2026, docs/stadium/PLAN.md): the big screen's score and match clock during a match at the stadium.
// The sponsor card (lib/stadium/sponsors setScreenSponsor) shows otherwise; during a match the sponsor screen goes dark and this
// plane sits just in front of it.
// Heat: one 256 × 144 canvas texture and one plane (1 draw, only while a match is on and the player is near). The canvas is
// redrawn and re-uploaded only when the text changes: a goal, or the clock's minute ticking over (so at most once a minute in
// play, never more than 1 Hz). Built lazily on the first match; nothing runs per frame beyond a few comparisons.
import * as T from 'three';
import {STADIUM} from './westParkLayout';
import {SCREEN} from './stadiumSeats';

export const SCREEN_CANVAS={w:256,h:144} as const;
/** The match clock as the screen shows it: the minute being played (real seconds on the sim clock), like a stadium board: the
 *  first minute is 1' (football's convention; phase 3b: the board no longer sat at 0' for the first minute after the match woke). */
export const screenMinute=(seconds:number)=>Math.max(0,Math.floor(Number.isFinite(seconds)?seconds/60:0))+1;
/** exhibition: nobody (me or a friend) is playing in it: an all-AI match kids can join or just watch (phase 3b). */
export type ScreenScore={home:string;away:string;gold:number;blue:number;minute:number;exhibition?:boolean};
/** What the board says (also the change key: a redraw happens only when this string changes). */
export const screenText=(s:ScreenScore)=>`${s.exhibition?'EXHIBITION · ':''}${s.home.toUpperCase()} ${s.gold}-${s.blue} ${s.away.toUpperCase()} ${s.minute}'`;
/** The stadium's pitch bar (FieldPathCard) while an exhibition is on vs a match with players in it. */
export const stadiumBarText=(exhibition:boolean)=>exhibition?{tag:'WEST COAST STADIUM · EXHIBITION',action:'Join in or just watch'}:{tag:'WEST COAST STADIUM · BIG MATCH',action:'Join the match'};

export function createStadiumScreen(parent:T.Object3D,colours:{home:string;away:string}){
 let mesh:T.Mesh|null=null,canvas:HTMLCanvasElement|null=null,texture:T.CanvasTexture|null=null,shown='',lastDraw=-Infinity;
 function build(){
  canvas=document.createElement('canvas');canvas.width=SCREEN_CANVAS.w;canvas.height=SCREEN_CANVAS.h;
  texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.generateMipmaps=false;texture.minFilter=T.LinearFilter;
  const m=new T.MeshBasicMaterial({map:texture,toneMapped:false});
  mesh=new T.Mesh(new T.PlaneGeometry(SCREEN.w,SCREEN.h),m);mesh.name='stadium-score-screen';
  // The screen's face (stadiumSeats sponsor layout: z SCREEN.z-.32, facing north to the pitch), a hair in front of the sponsor quad.
  mesh.position.set(STADIUM.x,SCREEN.y-.045,STADIUM.z+SCREEN.z-.36);mesh.rotation.y=Math.PI;mesh.visible=false;mesh.matrixAutoUpdate=false;mesh.updateMatrix();
  parent.add(mesh);
 }
 function draw(s:ScreenScore){
  const c=canvas!.getContext('2d');if(!c)return;const {w,h}=SCREEN_CANVAS;
  c.fillStyle='#0d1b22';c.fillRect(0,0,w,h);
  c.textAlign='center';c.textBaseline='middle';
  if(s.exhibition){c.fillStyle='#ffd23f';c.font='900 15px system-ui, sans-serif';c.fillText('EXHIBITION MATCH',w/2,18);}
  else{c.fillStyle='#7fd1c7';c.font='800 15px system-ui, sans-serif';c.fillText('WEST COAST STADIUM',w/2,18);}
  // Team chips and names
  for(const [side,name,colour] of [[-1,s.home,colours.home],[1,s.away,colours.away]] as const){
   const x=w/2+side*78;c.fillStyle=colour;c.fillRect(x-34,36,68,8);
   c.fillStyle='#f4f1e6';c.font='800 18px system-ui, sans-serif';c.fillText(name.toUpperCase(),x,60);
  }
  c.fillStyle='#ffffff';c.font='900 54px system-ui, sans-serif';c.fillText(`${s.gold} - ${s.blue}`,w/2,96);
  c.fillStyle='#ffd23f';c.font='800 20px system-ui, sans-serif';c.fillText(`${s.minute}'`,w/2,130);
  texture!.needsUpdate=true;
 }
 return {
  /** Each frame from stadiumSit: `on` = a match is on at the stadium and the player is near enough to read it. */
  update(on:boolean,s:ScreenScore|null,nowMs:number){
   if(!on||!s){if(mesh&&mesh.visible)mesh.visible=false;return;}
   if(!mesh)build();
   if(!mesh!.visible)mesh!.visible=true;
   const key=screenText(s);if(key!==shown&&nowMs-lastDraw>=1000){shown=key;lastDraw=nowMs;draw(s);}
  },
  get visible(){return !!mesh?.visible;},
  dispose(){if(!mesh)return;mesh.removeFromParent();mesh.geometry.dispose();(mesh.material as T.Material).dispose();texture?.dispose();mesh=null;canvas=null;texture=null;},
 };
}
export type StadiumScreen=ReturnType<typeof createStadiumScreen>;
