import * as k from '../anatomy/iso-kit';
import type {Plan,Projection,SolidPaths,Tone,LineTone} from '../anatomy/iso-kit';
import {POSES,ballItem,byDepth,figureItems,joints,shadowAt,type Fig,type Item,type Part} from '../anatomy/figure';
export type {Part};
import {actorsAt,ballAt,frameOf,lightSpot,refSpot,type Card,type Moment} from './model';

/**
 * cards-1970 · the table-top pitch (Oct 12 2026 anatomy Paper rebuild). Pure: tests render it in Node.
 * The object is a match model on a bench: a heavy base plate on feet with a groove, corner screws, a centimetre ruler along the
 * front edge and an engraved label plate; a turf deck with mown stripes and painted lines; advertising boards along the far
 * touchline; and Ken Aston's traffic light (Kensington High Street, 1966) standing on its plinth beside the pitch. The players
 * are paper mannequins (figure.ts); the referee is you.
 */
export const AZ=62,EL=24;
export const PLATE:Plan={x:-1000,y:-560,w:2000,d:1060,r:36};
export const TURF=k.insetPlan(PLATE,40);


/** The camera for a moment in a card of w × h CSS px. Wide cards see the whole bench front; tall (phone) cards close in on the play. */
export function cameraFor(m:Moment,w:number,h:number):Projection{
 const f=frameOf(m),wide=w/h>1.15,L=lightSpot(m,!wide),R=refSpot(m,!wide),pts:k.Point3[]=[];
 const box=(x0:number,x1:number,y0:number,y1:number,z1:number)=>{for(const x of [x0,x1])for(const y of [y0,y1])for(const z of [0,z1])pts.push([x,y,z]);};
 if(wide){const x0=Math.max(PLATE.x+30,Math.min(f.x0-110,R.x-90)),x1=Math.min(PLATE.x+PLATE.w-30,Math.max(f.x1+110,L.x+70));
  box(x0,x1,-500,Math.max(f.y1+110,200),200);pts.push([L.x,L.y,292]);}
 else{const cx=m.contact.x;box(cx-200,cx+200,-150,140,200);pts.push([R.x,R.y,230],[L.x,L.y,300]);}
 return k.fitProjection(pts,Math.max(1,w),Math.max(1,h),{pad:wide?Math.min(44,w*.03):14,headroom:wide?24:30,azimuth:AZ,elevation:wide?EL:40});
}

/** The bench: base, deck, lines, boards, the goal (handball moment) and the traffic light, back to front. */
export function benchParts(m:Moment,lamp:'green'|'yellow'|'red'|null,P:Projection,narrow=false):Part[]{
 const out:Part[]=[],S=(paths:SolidPaths,o:Omit<Extract<Part,{kind:'solid'}>,'kind'|'paths'>={})=>out.push({kind:'solid',paths,...o});
 const Ln=(d:string,tone:LineTone='lo',free=false)=>out.push({kind:'line',d,tone,free});
 const byD=(pts:k.Plane[])=>[...pts].sort((a,b)=>k.depthOf([a[0],a[1],0],P)-k.depthOf([b[0],b[1],0],P));
 // Base plate on feet.
 out.push({kind:'halo',d:k.haloOf(PLATE,-62,50,P)});
 for(const [x,y] of byD(k.corners(PLATE,70))){S(k.cylinder(x,y,30,-62,4,P,40),{tone:'mid',crease:'none'});S(k.cylinder(x,y,24,-58,14,P,40),{tone:'hi',crease:'lo'});}
 S(k.slabOf(PLATE,-46,36,P,8,1.6),{tone:'hi',crease:'lo',inner:k.lineSvg(k.sideSeam(PLATE,-30,P,8),{tone:'faint'})});
 Ln(k.planOutline(k.insetPlan(PLATE,14),-10,P),'lo');
 for(const [x,y] of k.corners(PLATE,27)){Ln(k.ring(x,y,7,-10,P,20),'lo');out.push({kind:'dots',pts:[k.iso([x,y,-10],P)],size:1.1,tone:'hi'});}
 // Ruler along the front edge and the label plate.
 const strip:Plan={x:-930,y:PLATE.y+PLATE.d-30,w:1600,d:14,r:2};
 S(k.slabOf(strip,-10,1.4,P,3),{tone:'lo',crease:'none'});
 const t=k.topTicks(strip.x+10,strip.x+strip.w-10,20,5,strip.y+.6,-8.6,[5,9.5],P);Ln(t.minor,'lo');Ln(t.major,'mid');
 const label:Plan={x:720,y:PLATE.y+PLATE.d-34,w:200,d:24,r:3};
 S(k.slabOf(label,-10,1.8,P,4,.6),{tone:'mid',crease:'faint'});Ln(k.planOutline(k.insetPlan(label,3),-8.2,P),'faint');
 for(const [x,y] of [[label.x+9,label.y+12],[label.x+label.w-9,label.y+12]] as k.Plane[])out.push({kind:'dots',pts:[k.iso([x,y,-8.2],P)],size:1,tone:'mid'});
 out.push({kind:'text',transform:k.topMatrix([label.x+22,label.y+15],-8.2,P),text:'LAW 12 · MEXICO 1970',size:9});
 // The turf deck: mown stripes edge to edge, painted lines as inlays (two hairlines a stripe apart).
 S(k.slabOf(TURF,-10,10,P,6,1),{tone:'hi',crease:'lo'});
 const y0=TURF.y+2,y1=TURF.y+TURF.d-2,x0=TURF.x+2,x1=TURF.x+TURF.w-2;
 for(let x=TURF.x+120;x<TURF.x+TURF.w-20;x+=120)Ln(k.lineOnTop([x,y0],[x,y1],0,P),'faint');
 const paint=(a:k.Plane,b:k.Plane)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*6,ny=dx/l*6;
  Ln(k.lineOnTop([a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],0,P),'mid');Ln(k.lineOnTop([a[0]-nx,a[1]-ny],[b[0]-nx,b[1]-ny],0,P),'mid');};
 paint([x0,-430],[x1,-430]);// far touchline
 if(m.goal){paint([-430,y0],[-430,y1]);paint([120,y0],[120,y1]);Ln(k.ring(670,0,9,0,P,16),'mid');}
 else{paint([-700,y0],[-700,y1]);Ln(k.ring(-700,-30,10,0,P,16),'mid');}
 // Advertising boards behind the far touchline, each with an inset panel on its face.
 for(let i=0;i<7;i++){const b:Plan={x:-930+i*268,y:-505,w:250,d:10,r:1};S(k.slabOf(b,0,58,P,2,.5),{tone:'hi',crease:'faint'});
  const f=b.y+b.d+.2;out.push({kind:'line',d:k.pathOf([[b.x+12,f,8],[b.x+b.w-12,f,8],[b.x+b.w-12,f,50],[b.x+12,f,50]].map(p=>k.iso(p as k.Point3,P)),true),tone:'faint'});}
 if(m.goal)goalParts(out,P);
 trafficLight(out,lightSpot(m,narrow),lamp,P);
 return out;
}
/** A goal (handball moment) on the line x = −430: net behind, then the far post, the crossbar, the near post. */
function goalParts(out:Part[],P:Projection){
 const S=(paths:SolidPaths,tone:Tone='hi')=>out.push({kind:'solid',paths,tone,crease:'lo'}),Ln=(d:string,tone:LineTone='faint')=>out.push({kind:'line',d,tone});
 const gx=-430,bx=-610,ya=-366,yb=366,H=244,hb=190;
 for(let y=ya;y<=yb+.1;y+=61)Ln(k.segment([bx,y,0],[bx,y,hb],P));for(let z=0;z<=hb+.1;z+=38)Ln(k.segment([bx,ya,z],[bx,yb,z],P));
 for(let y=ya;y<=yb+.1;y+=61)Ln(k.segment([gx,y,H],[bx,y,hb],P));
 for(let x=gx;x>=bx;x-=45)Ln(k.segment([x,ya,0],[x,ya,H+(hb-H)*(gx-x)/(gx-bx)],P));
 S(k.cylinder(bx,ya,3,0,hb,P,16),'mid');S(k.cylinder(gx,ya,6,0,H,P,24));
 S(k.slabOf({x:gx-6,y:ya-6,w:12,d:yb-ya+12,r:5},H-12,12,P,3));
 for(let x=gx;x>=bx;x-=45)Ln(k.segment([x,yb,0],[x,yb,H+(hb-H)*(gx-x)/(gx-bx)],P));
 S(k.cylinder(bx,yb,3,0,hb,P,16),'mid');S(k.cylinder(gx,yb,6,0,H,P,24));
}
/** Ken Aston's traffic light: plinth, collar, post, housing with three hooded lenses, cap. The lit lens takes the call's colour. */
function trafficLight(out:Part[],L:{x:number;y:number},lamp:'green'|'yellow'|'red'|null,P:Projection){
 const S=(paths:SolidPaths,o:Omit<Extract<Part,{kind:'solid'}>,'kind'|'paths'>={})=>out.push({kind:'solid',paths,...o});
 const pl:Plan={x:L.x-44,y:L.y-44,w:88,d:88,r:8};
 S(k.slabOf(pl,0,10,P,4,.8),{tone:'hi',crease:'lo'});
 for(const [x,y] of k.corners(pl,10))out.push({kind:'dots',pts:[k.iso([x,y,10],P)],size:1.1,tone:'mid'});
 S(k.cylinder(L.x,L.y,12,10,9,P,28,.6),{tone:'hi',crease:'lo'});
 S(k.cylinder(L.x,L.y,6,19,132,P,24),{tone:'hi',crease:'none',inner:k.lineSvg(k.sideArc(L.x,L.y,6,90,P,12),{tone:'faint'})});
 const hz=150,hh=132,box:Plan={x:L.x-25,y:L.y-19,w:50,d:38,r:6};
 S(k.slabOf(box,hz,hh,P,4,1),{tone:'hi',crease:'lo',inner:k.lineSvg(k.sideSeam(box,hz+8,P,4),{tone:'faint'})});
 S(k.slabOf(k.insetPlan(box,-3),hz+hh,7,P,4,.8),{tone:'hi',crease:'lo'});
 const fy=box.y+box.d;
 for(const [z,c] of [[hz+hh-28,'red'],[hz+hh-68,'yellow'],[hz+hh-108,'green']] as [number,'red'|'yellow'|'green'][]){
  out.push({kind:'lens',d:k.sideRing([L.x,fy+.3,z],15,'y',P,36),on:lamp,colour:c,glow:k.iso([L.x,fy,z],P),r:15*k.cameraOf(P).k});
  out.push({kind:'line',d:k.sideRing([L.x,fy+.4,z],10,'y',P,28),tone:'faint'});
  S(k.slabOf({x:L.x-19,y:fy,w:38,d:11,r:2},z+17,3,P,2,.4),{tone:'hi',crease:'faint'});
 }
}

/** The moving things at film time t: the players, the ball, the referee (you) and, while held, the pulled shirt. */
export type View={t:number;ref:'stand'|'whistle'|'card';card?:Card;lamp:'green'|'yellow'|'red'|null};
export function actorItems(m:Moment,v:View,P:Projection,narrow=false){
 const figs:Fig[]=actorsAt(m,v.t),r=refSpot(m,narrow),items:Item[]=[];
 const refFig:Fig={id:'ref',x:r.x,y:r.y,h:m.goal?150:160,kit:'dark',pose:v.ref==='card'&&v.card&&v.card!=='none'?POSES.card:v.ref!=='stand'?POSES.whistle:POSES.stand,
  card:v.ref==='card'&&v.card&&v.card!=='none'?v.card:undefined};
 for(const f of [...figs,refFig])items.push(...figureItems(f,P));
 const b=ballAt(m,v.t);items.push(ballItem([b.x,b.y,b.z+11],P,v.t*9));
 if(m.pull&&v.t>=m.pull.t0&&v.t<=m.pull.t1){const A=figs.find(f=>f.id==='A')!,D=figs.find(f=>f.id==='D')!;
  const back:[number,number,number]=[A.x-12,A.y-6,124],hand=handOf(D);const w=11;
  items.push({kind:'poly',depth:k.depthOf(back,P)+40,tone:'shirtLight',pts:[[back[0],back[1]-w,back[2]+w],[back[0],back[1]+w,back[2]-w],[hand[0],hand[1],hand[2]-2],[hand[0],hand[1],hand[2]+2]].map(p=>k.iso(p as k.Point3,P))});}
 const shadows=[...figs,refFig].map(f=>shadowAt(f.x,f.y,f.pose.lean>60?70:34,P));shadows.push(shadowAt(b.x,b.y,12,P));
 return {items:byDepth(items),shadows,figs};
}
const handOf=(f:Fig)=>joints(f).handL;
/** The contact point on screen (the magnifier centres on it). */
export const contactOn=(m:Moment,P:Projection)=>k.iso([m.contact.x,m.contact.y,m.contact.z],P);
