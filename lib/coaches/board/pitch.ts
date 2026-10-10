import type {Format,Vec,ZoomView} from './types';

/**
 * Pitch geometry per format, in metres (x along the length from the home goal line, y across from the attackers' left
 * touchline). Sizes follow the common youth guidance: futsal 40×20 (the Laws of the Game for futsal), 7v7 60×40 yd, 9v9
 * 80×50 yd (the FA's recommended youth sizes) and 105×68 m for 11v11. The boards teach that the same game is played in
 * smaller spaces: the markings shrink with the format.
 */
export type PitchSpec={
 format:Format;title:string;players:number;length:number;width:number;runoff:number;
 goal:number;goalDepth:number;
 /** Rectangular penalty area (depth from the goal line × width), or null for futsal's curved area. */
 box:{depth:number;width:number}|null;
 /** Futsal: quarter circles of this radius from each post. */
 futsalArea?:number;
 goalArea:{depth:number;width:number}|null;
 spot:number;secondSpot?:number;centreR:number;arcR:number;corner:number;
 /** Futsal substitution zones on the bench touchline (distance from halfway, length). */
 subs?:{from:number;length:number};
};
export const PITCHES:Record<Format,PitchSpec>={
 futsal:{format:'futsal',title:'Futsal',players:5,length:40,width:20,runoff:1.6,goal:3,goalDepth:1,box:null,futsalArea:6,goalArea:null,spot:6,secondSpot:10,centreR:3,arcR:0,corner:.25,subs:{from:5,length:5}},
 '7v7':{format:'7v7',title:'7v7',players:7,length:55,width:37,runoff:2.4,goal:3.66,goalDepth:1.2,box:{depth:9.1,width:16.5},goalArea:null,spot:7.3,centreR:5.5,arcR:0,corner:.8},
 '9v9':{format:'9v9',title:'9v9',players:9,length:73,width:46,runoff:3,goal:4.88,goalDepth:1.4,box:{depth:11.9,width:29.3},goalArea:{depth:3.7,width:12.8},spot:8.2,centreR:6.4,arcR:6.4,corner:1},
 '11v11':{format:'11v11',title:'11v11',players:11,length:105,width:68,runoff:4,goal:7.32,goalDepth:2,box:{depth:16.5,width:40.32},goalArea:{depth:5.5,width:18.32},spot:11,centreR:9.15,arcR:9.15,corner:1},
};
export const FORMAT_LABEL:Record<Format,string>={futsal:'Futsal','7v7':'7v7','9v9':'9v9','11v11':'11v11'};

/** Chips may sit a little outside the lines (corner takers, throw-ins): this fraction of the run-off. */
export const CHIP_MARGIN=.7;
export type Rect={x0:number;y0:number;x1:number;y1:number};
export function chipBounds(spec:PitchSpec):Rect{const m=spec.runoff*CHIP_MARGIN;return {x0:-m,y0:-m,x1:spec.length+m,y1:spec.width+m};}
/** The model rectangle a zoom view shows: the whole pitch, the attacking half, or the attacking penalty box. */
export function viewRect(spec:PitchSpec,view:ZoomView='full'):Rect{
 const r=spec.runoff,L=spec.length,W=spec.width;
 if(view==='half')return {x0:L/2-r,y0:-r,x1:L+r+spec.goalDepth,y1:W+r};
 if(view==='box'){const d=spec.box?.depth??spec.futsalArea??6,half=Math.min(W/2+r,Math.max((spec.box?.width??spec.goal+12)/2+d*.9,W*.36)+3);
  const depth=Math.min(L/2,d*2.3);return {x0:L-depth,y0:W/2-half,x1:L+r+spec.goalDepth,y1:W/2+half};}
 return {x0:-r-spec.goalDepth,y0:-r,x1:L+r+spec.goalDepth,y1:W+r};
}
export const toMetres=(spec:PitchSpec,[u,v]:Vec):Vec=>[u*spec.length,v*spec.width];
export const toNorm=(spec:PitchSpec,[x,y]:Vec):Vec=>[x/spec.length,y/spec.width];

/** All line markings as one SVG path in metres, plus the spots (drawn as dots). */
export function pitchMarkings(spec:PitchSpec):{d:string;spots:Vec[];goals:{x:number;y:number;w:number;h:number}[]}{
 const L=spec.length,W=spec.width,c=W/2,f=(n:number)=>+n.toFixed(3);
 const parts:string[]=[`M0 0H${f(L)}V${f(W)}H0Z`,`M${f(L/2)} 0V${f(W)}`];
 const circle=(x:number,y:number,r:number)=>`M${f(x-r)} ${f(y)}a${f(r)} ${f(r)} 0 1 0 ${f(2*r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2*r)} 0`;
 parts.push(circle(L/2,c,spec.centreR));
 for(const end of [0,1]){
  const X=(x:number)=>f(end?L-x:x);
  if(spec.box){const b=spec.box;parts.push(`M${X(0)} ${f(c-b.width/2)}H${X(b.depth)}V${f(c+b.width/2)}H${X(0)}`);}
  if(spec.goalArea){const g=spec.goalArea;parts.push(`M${X(0)} ${f(c-g.width/2)}H${X(g.depth)}V${f(c+g.width/2)}H${X(0)}`);}
  if(spec.futsalArea){const r=spec.futsalArea,p=1.58,sweep=end?0:1;
   parts.push(`M${X(0)} ${f(c-p-r)}A${r} ${r} 0 0 ${sweep} ${X(r)} ${f(c-p)}L${X(r)} ${f(c+p)}A${r} ${r} 0 0 ${sweep} ${X(0)} ${f(c+p+r)}`);}
  if(spec.box&&spec.arcR>spec.box.depth-spec.spot){const r=spec.arcR,t=Math.acos((spec.box.depth-spec.spot)/r),dx=r*Math.cos(t),dy=r*Math.sin(t);
   parts.push(`M${X(spec.spot+dx)} ${f(c-dy)}A${f(r)} ${f(r)} 0 0 ${end?0:1} ${X(spec.spot+dx)} ${f(c+dy)}`);}
  const k=spec.corner;
  parts.push(`M${X(0)} ${f(k)}A${k} ${k} 0 0 ${end?1:0} ${X(k)} 0`,`M${X(0)} ${f(W-k)}A${k} ${k} 0 0 ${end?0:1} ${X(k)} ${f(W)}`);
 }
 if(spec.subs){const s=spec.subs,t=.6;for(const x of [L/2-s.from-s.length,L/2-s.from,L/2+s.from,L/2+s.from+s.length])parts.push(`M${f(x)} ${f(W-t)}V${f(W+t)}`);}
 const spots:Vec[]=[[L/2,c],[spec.spot,c],[L-spec.spot,c]];
 if(spec.secondSpot)spots.push([spec.secondSpot,c],[L-spec.secondSpot,c]);
 const goals=[{x:-spec.goalDepth,y:c-spec.goal/2,w:spec.goalDepth,h:spec.goal},{x:L,y:c-spec.goal/2,w:spec.goalDepth,h:spec.goal}];
 return {d:parts.join(''),spots,goals};
}

/** Team shapes per format (the shapes the Paths graduate with come first). Rows run from the back; numbers left to right. */
export type Formation={id:string;format:Format;name:string;why:string;rows:number[][]};
export const FORMATIONS:readonly Formation[]=[
 {id:'futsal-121',format:'futsal',name:'1–2–1 diamond',why:'A fixo at the back, two alas wide and a pivot up top.',rows:[[4],[3,2],[5]]},
 {id:'futsal-22',format:'futsal',name:'2–2 square',why:'Two back, two up: simple to rotate and cover.',rows:[[3,2],[5,4]]},
 {id:'7v7-231',format:'7v7',name:'2–3–1',why:'Fewer players means more touches for everyone.',rows:[[3,2],[6,4,7],[9]]},
 {id:'7v7-321',format:'7v7',name:'3–2–1',why:'A back three keeps the team safe while it learns to build.',rows:[[3,4,2],[6,8],[9]]},
 {id:'9v9-323',format:'9v9',name:'3–2–3',why:'A back three that defends together.',rows:[[3,4,2],[6,8],[11,9,7]]},
 {id:'9v9-332',format:'9v9',name:'3–3–2',why:'A midfield three to win the middle.',rows:[[3,4,2],[6,8,7],[10,9]]},
 {id:'11v11-433',format:'11v11',name:'4–3–3',why:'The full game with a midfield three.',rows:[[3,5,4,2],[8,6,10],[11,9,7]]},
 {id:'11v11-442',format:'11v11',name:'4–4–2',why:'Two banks of four: compact and easy to learn.',rows:[[3,5,4,2],[11,8,6,7],[10,9]]},
 {id:'11v11-4231',format:'11v11',name:'4–2–3–1',why:'Two holding midfielders protect the back four.',rows:[[3,5,4,2],[6,8],[11,10,7],[9]]},
];
export const formationsFor=(format:Format)=>FORMATIONS.filter(f=>f.format===format);
/** Home slots (attacking toward u=1, set up in the home half for kick-off), keeper first. */
export function formationSlots(f:Formation):{label:string;gk:boolean;at:Vec}[]{
 const out:{label:string;gk:boolean;at:Vec}[]=[{label:'1',gk:true,at:[.035,.5]}];
 const n=f.rows.length,first=.16,last=.44;
 f.rows.forEach((row,r)=>{const u=n===1?.3:first+(last-first)*r/(n-1),m=row.length>3?.1:row.length===3?.18:.26;
  row.forEach((num,i)=>{const v=row.length===1?.5:m+(1-2*m)*i/(row.length-1);out.push({label:String(num),gk:false,at:[+u.toFixed(3),+v.toFixed(3)]});});});
 return out;
}
export const mirror=([u,v]:Vec):Vec=>[+(1-u).toFixed(3),+(1-v).toFixed(3)];

/** Where a spot is, in football words (used for screen readers and keyboard moves): "right wing, attacking third". */
export function zoneName([u,v]:Vec,team:'home'|'away'|'ball'='home'):string{
 const a=team==='away'?1-u:u,s=team==='away'?1-v:v;
 const third=a<1/3?'defensive third':a<2/3?'middle third':'attacking third';
 const lane=s<.2?'left wing':s<.4?'left half-space':s<=.6?'centre':s<=.8?'right half-space':'right wing';
 return `${lane}, ${third}`;
}
