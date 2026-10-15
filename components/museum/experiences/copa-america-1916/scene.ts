import * as k from '../anatomy/iso-kit';
import {CUPS,FACES,MATCHES_1916,PEG_AT,STEP,TAG,TEAMS,TROPHY_PARTS,YEAR0,YEAR1,droppedBy,table,threadsAt,type CupId,type Team,type TrophyPart} from './model';

/**
 * copa-america-1916 · THE TOURNAMENT MACHINE, drawn with the anatomy kit in the Paper theme (Oct 14 2026 redo). Pure: no DOM,
 * so the test renders it in Node. One SVG string per frame (the stadiums exhibit's pattern).
 *
 * The object: one heavy bench with three stations.
 *  - THE 1916 CUP: an eight-sided fixture drum between two cast stands, turned by a crank: one face per detent (start, the six
 *    matches, the champions). Behind it a flip-tile league table on two legs (P W D L PTS per team; a tile flips when its number
 *    changes, the rows slide into order). Beside it a map plate of South America with four team pegs; a thread is pulled between
 *    two pegs for every match played, so the six threads of a full round robin join every pair.
 *  - THE TIMELINE: a long rail with a year ruler (1910–1980), a carriage you slide along it, and a shelf of six cup slots: each
 *    continent's first cup for national teams drops into its slot when the carriage reaches its year.
 *  - THE TROPHY: the silver cup on its three-level wooden base with the winners' plaques; it lifts apart, level by level.
 * Painter's order: the bench, then every part sorted by true depth (kit depthOf); round things are painted bottom to top.
 */
export type Station='cup'|'line'|'trophy';
export type View={phi:number;state:number;rows:Record<Team,number>;flips:Record<string,number>;year:number;drops:Record<CupId,number>;apart:number;
 focus?:TrophyPart|null;team?:Team|null;cue?:'crank'|'carriage'|'trophy'|null;lite?:boolean};
export type Anchors={crank:k.Flat;crankR:number;drum:k.Flat;carriage:k.Flat;trophy:k.Flat;rail:[k.Flat,k.Flat];pegs:Record<Team,k.Flat>;parts:Partial<Record<TrophyPart,k.Flat>>;scale:number};

// ── The world (model units; the bench top is z = 0) ──────────────────────────────────────────────────────────────────
export const BENCH:k.Plan={x:-152,y:-96,w:300,d:186,r:10};
export const DRUM={x0:-104,x1:-52,y:14,z:24,r:15};
export const CRANK={x:DRUM.x1+9,r:11};
/** The table board stands turned toward you (45°), so its rows read straight across. */
export const BOARD={cx:-56,cy:-52,face:45,w:112,d:8,z0:6,h:70};
export const MAP:k.Plan={x:-30,y:-58,w:96,d:112,r:3};
export const MAP_Z=7;
export const RAIL={x0:-138,x1:138,y:70,yr:64};
export const TROPHY={x:104,y:-34};
export const xOfYear=(y:number)=>RAIL.x0+8+(y-YEAR0)/(YEAR1-YEAR0)*(RAIL.x1-RAIL.x0-16);
export const yearOfX=(x:number)=>YEAR0+(x-RAIL.x0-8)/(RAIL.x1-RAIL.x0-16)*(YEAR1-YEAR0);
export const mapXY=(lon:number,lat:number):[number,number]=>[MAP.x+4+(lon+82)*1.83,MAP.y+5+(13-lat)*1.48];
/** A simplified outline of South America (longitude, latitude), engraved on the map plate. */
const SA:[number,number][]=[[-77,8.5],[-72,12],[-63,10.8],[-60,8.4],[-52,5],[-50,.5],[-44,-2.5],[-35,-5.5],[-35,-9],[-39,-15],[-41,-22],[-48,-26],[-53,-33.7],[-58,-38],[-62,-39],[-65,-42],[-66,-47],[-69,-52],[-72,-54.5],[-75,-50],[-73.5,-44],[-73,-37],[-71.4,-30],[-70.3,-18],[-76,-14],[-81,-6],[-80,-1],[-78,2]];
const TEAM_TINT:Record<Team,string>={Uruguay:'#4f8fd6',Argentina:'#a9d2ef',Brazil:'#ece6cc',Chile:'#c94a3d'};

/** The world points each station's camera frames. */
export function stationPoints(s:Station|'all'):k.Point3[]{
 const box=(x0:number,x1:number,y0:number,y1:number,z0:number,z1:number):k.Point3[]=>[[x0,y0,z0],[x1,y0,z0],[x0,y1,z0],[x1,y1,z0],[x0,y0,z1],[x1,y0,z1],[x0,y1,z1],[x1,y1,z1]];
 if(s==='cup'){const f0=BOARD.face*Math.PI/180,t=[Math.sin(f0),-Math.cos(f0)],pts:k.Point3[]=[];
  for(const u of [-BOARD.w/2,BOARD.w/2])for(const z of [0,BOARD.z0+BOARD.h])pts.push([BOARD.cx+t[0]*u,BOARD.cy+t[1]*u,z]);
  return [...pts,...box(DRUM.x0-8,CRANK.x+4,DRUM.y-14,DRUM.y+14,-2,DRUM.z+DRUM.r+4),...box(MAP.x,MAP.x+MAP.w,MAP.y,MAP.y+MAP.d,-2,MAP_Z+14)];}
 if(s==='line')return box(RAIL.x0-4,RAIL.x1+4,48,82,-4,28);
 if(s==='trophy')return box(TROPHY.x-24,TROPHY.x+24,TROPHY.y-24,TROPHY.y+24,-4,92);
 const B=BENCH;return box(B.x,B.x+B.w,B.y,B.y+B.d,-22,BOARD.z0+BOARD.h);
}

// ── Small string painters ──────────────────────────────────────────────────────────────────────────────────────────────
const f1=(v:number)=>(Math.round(v*10)/10).toString();
const S=(paths:k.SolidPaths,o:k.SolidStyle={})=>k.solidSvg(paths,o);
const L=(d:string,tone:k.LineTone='lo',free=false)=>k.lineSvg(d,{tone,free});
const hexRgb=(h:string)=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];};
export const mix=(a:string,b:string,t:number)=>{const A=hexRgb(a),B=hexRgb(b);return '#'+A.map((v,i)=>Math.round(Math.max(0,Math.min(255,v+(B[i]-v)*t))).toString(16).padStart(2,'0')).join('');};
function tint(paths:k.SolidPaths,color:string,edge:k.LineTone='hi',inner=''){
 let o=`<g class="iso-solid"><path d="${paths.fill}" fill="${mix(color,'#000000',.12)}"/>`;
 paths.shades.forEach((d,i)=>{if(d)o+=`<path d="${d}" fill="${mix(color,'#000000',[.3,.22,.14,.07][i])}"/>`;});
 o+=`<path d="${paths.top}" fill="${mix(color,'#ffffff',.06)}"/>`;
 if(paths.crease)o+=`<path class="iso-line" data-tone="faint" style="stroke:${mix(color,'#ffffff',.3)}" d="${paths.crease}"/>`;
 return o+inner+`<path class="iso-line iso-edge" data-tone="${edge}" d="${paths.outline}"/></g>`;
}
const WOOD='#9a6a43',SILVER='#c9ccd1',IRON='#7d7f84';
const dot=(c:k.Flat,r=.9,o=.6)=>`<circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${r}" fill="var(--anatomy-dot)" opacity="${o}"/>`;
const screw=(x:number,y:number,z:number,P:k.Projection,r=1.4)=>L(k.ring(x,y,r,z,P,14),'lo')+dot(k.iso([x,y,z],P),.8,.55);
const poly=(pts:k.Flat[])=>k.pathOf(pts,true);
function ball(c:k.Flat,r:number,color='#f7f7f3'){
 return `<g><circle cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(r)}" fill="${mix(color,'#000000',.22)}"/><circle cx="${f1(c[0]-r*.14)}" cy="${f1(c[1]-r*.14)}" r="${f1(r*.84)}" fill="${color}"/>`+
  `<circle cx="${f1(c[0]-r*.34)}" cy="${f1(c[1]-r*.36)}" r="${f1(r*.32)}" fill="#ffffff" opacity=".75"/><circle class="iso-line" data-tone="hi" cx="${f1(c[0])}" cy="${f1(c[1])}" r="${f1(r)}" fill="none"/></g>`;
}
/** An affine matrix that maps local (u, v) on a 3D plane (origin o, unit directions eu, ev) to the screen. */
function planeMatrix(o:k.Point3,eu:k.Point3,ev:k.Point3,P:k.Projection){
 const O=k.iso(o,P),U=k.iso([o[0]+eu[0],o[1]+eu[1],o[2]+eu[2]],P),V=k.iso([o[0]+ev[0],o[1]+ev[1],o[2]+ev[2]],P),r=(v:number)=>Math.round(v*1000)/1000;
 return `matrix(${r(U[0]-O[0])} ${r(U[1]-O[1])} ${r(V[0]-O[0])} ${r(V[1]-O[1])} ${r(O[0])} ${r(O[1])})`;
}
const txt=(x:number,y:number,t:string,size:number,{fill='#1d1d1b',anchor='middle',weight=700,mono=true}:{fill?:string;anchor?:string;weight?:number;mono?:boolean}={})=>
 `<text x="${f1(x)}" y="${f1(y)}" font-size="${size}" text-anchor="${anchor}" fill="${fill}" font-weight="${weight}" font-family="${mono?'ui-monospace,Menlo,monospace':'Helvetica Neue,Helvetica,Arial,sans-serif'}">${t}</text>`;

type Item={k:number;svg:string};

// ── The bench ──────────────────────────────────────────────────────────────────────────────────────────────────────────
function bench(P:k.Projection){
 const B=BENCH,z0=-10;let o=`<path class="iso-halo" d="${k.slabOf(B,z0-8,18,P).fill}"/>`;
 const feet=k.corners(B,18).sort((a,b)=>k.depthOf([a[0],a[1],0],P)-k.depthOf([b[0],b[1],0],P));
 for(const [x,y] of feet)o+=S(k.cylinder(x,y,8,z0-8,2,P,28,.4),{tone:'lo'})+S(k.cylinder(x,y,6,z0-6,6,P,28),{tone:'mid'});
 o+=S(k.slabOf(B,z0,10,P,8,1.6),{tone:'mid',inner:L(k.sideSeam(B,z0+4,P,8),'faint')});
 o+=L(k.planOutline(k.insetPlan(B,5),0,P,8),'lo');
 for(const [x,y] of k.corners(B,10))o+=screw(x,y,0,P,2);
 // a label plate, engraved
 const lp={x:88,y:18,w:52,d:12,r:1.5};
 o+=S(k.slabOf(lp,0,.8,P,4),{tone:'mid'})+L(k.planOutline(k.insetPlan(lp,1.5),.8,P,4),'faint');
 o+=k.faceTextSvg(k.topMatrix([lp.x+4.5,lp.y+5.4],.8,P),'COPA AMÉRICA',{size:4,tone:'hi'})+k.faceTextSvg(k.topMatrix([lp.x+4.5,lp.y+10],.8,P),'BUENOS AIRES · 1916',{size:2.7,tone:'mid'});
 return o;
}

// ── The fixture drum and its crank ─────────────────────────────────────────────────────────────────────────────────────
export const WINDOW=50*Math.PI/180;// the face under the window points up and toward you
const i0top=(t:string)=>t.replace(' JULY',' JUL').replace('CHAMPIONS','1916');
function faceText(i:number):{top:string;main:string;sub:string;stack:string[]}{
 if(i===0)return {top:'1916',main:'KICK-OFF',sub:'2 JULY',stack:['KICK','OFF','2 JUL']};
 if(i===FACES-1)return {top:'CHAMPIONS',main:'URUGUAY',sub:'5 POINTS',stack:['URU','WIN','5 PTS']};
 const m=MATCHES_1916[i-1];return {top:m.date.toUpperCase(),main:`${TAG[m.home]} ${m.hg}-${m.ag} ${TAG[m.away]}`,sub:`MATCH ${i}`,stack:[TAG[m.home],`${m.hg}-${m.ag}`,TAG[m.away]]};
}
function drum(phi:number,state:number,P:k.Projection,cue:boolean):Item[]{
 const D=DRUM,h=STEP/2,Rv=D.r/Math.cos(h),c=k.cameraOf(P),V:k.Point3=[c.cosA*c.cosE,c.sinA*c.cosE,c.sinE],out:Item[]=[];
 const at=(x:number,t:number,r=Rv):k.Point3=>[x,D.y+r*Math.cos(t),D.z+r*Math.sin(t)];
 // the two cast stands with their bearings
 for(const sx of [D.x0-7,D.x1+1]){const st={x:sx,y:D.y-12,w:6,d:24,r:1.5};
  out.push({k:k.depthOf([sx+3,D.y,0],P)-(sx<D.x0?30:-2),svg:S(k.slabOf(st,0,3,P,3,.4),{tone:'mid'})+S(k.slabOf({x:sx+.8,y:D.y-4,w:4.4,d:8,r:1},3,D.z-3,P,3,.3),{tone:'mid'})+
   screw(sx+3,D.y-9,3,P,.8)+screw(sx+3,D.y+9,3,P,.8)});}
 // the drum: faces sorted back to front, then the near end cap
 let d='';const faces:{t:number;i:number;dep:number}[]=[];
 for(let i=0;i<FACES;i++){const t=WINDOW+i*STEP-phi,n:k.Point3=[0,Math.cos(t),Math.sin(t)];if(n[1]*V[1]+n[2]*V[2]<=0)continue;faces.push({t,i,dep:k.depthOf(at((D.x0+D.x1)/2,t),P)});}
 faces.sort((a,b)=>a.dep-b.dep);
 for(const f of faces){const a=f.t+h,b=f.t-h,pts=[at(D.x0,a),at(D.x1,a),at(D.x1,b),at(D.x0,b)].map(p=>k.iso(p,P));
  const lit=.5+.5*Math.max(0,Math.sin(f.t)*.8+Math.cos(f.t)*.2),now=f.i===state;
  d+=`<path d="${poly(pts)}" fill="${now?'#fbfbf6':mix('#c9c9c3','#f4f4ef',lit)}" class="iso-line" data-tone="${now?'hi':'mid'}" style="fill:${now?'#fbfbf6':mix('#c9c9c3','#f4f4ef',lit)}"/>`;
  // the card on the face: text laid in the face's own plane
  const len=D.x1-D.x0,wv=2*Rv*Math.sin(h),eu:k.Point3=[1,0,0],ev:k.Point3=[0,(Math.cos(b)-Math.cos(a))*Rv/wv,(Math.sin(b)-Math.sin(a))*Rv/wv];
  const facing=Math.cos(f.t)*V[1]+Math.sin(f.t)*V[2];
  if(facing>.25){const T=faceText(f.i),op=Math.min(1,(facing-.25)*3).toFixed(2),box=`stroke="${now?'var(--acc)':'#9a9a96'}" stroke-width="${now?1.4:.5}" vector-effect="non-scaling-stroke"`;
   const su=k.axisVector(P,[1,0,0]);
   if(Math.abs(su[0])>=Math.abs(su[1])*.8){// the drum lies across the screen: one line along the face
    const m=planeMatrix(at(D.x0,a),eu,ev,P);
    d+=`<g transform="${m}" opacity="${op}"><rect x="2" y="1.2" width="${f1(len-4)}" height="${f1(wv-2.4)}" rx=".8" fill="none" ${box}/>`+
     txt(len/2,wv*.34,T.top,2.6,{fill:'#6f6f72',weight:600})+txt(len/2,wv*.7,T.main,4.6,{fill:now?'#1d1d1b':'#3a3a3c'})+txt(len-4,wv*.34,T.sub,1.9,{fill:'#9a9a96',anchor:'end',weight:500})+`</g>`;}
   else{// the drum stands up the screen (a phone): the words stack down the face
    const sv=k.iso([0,ev[1],ev[2]],P),s0=k.iso([0,0,0],P),flip=sv[0]-s0[0]<0,o=flip?at(D.x0,b):at(D.x0,a),dv:k.Point3=flip?[0,-ev[1],-ev[2]]:ev;
    const m=planeMatrix(o,dv,eu,P),lines=T.stack;
    d+=`<g transform="${m}" opacity="${op}"><rect x="1.2" y="2" width="${f1(wv-2.4)}" height="${f1(len-4)}" rx=".8" fill="none" ${box}/>`+txt(wv/2,8,i0top(T.top),2.3,{fill:'#6f6f72',weight:600})+
     lines.map((ln,j)=>txt(wv/2,19+j*11,ln,ln.length>4?3.2:4.4,{fill:now?'#1d1d1b':'#3a3a3c'})).join('')+`</g>`;}}}
 // hub rings at both ends
 const cap=Array.from({length:FACES},(_,i)=>k.iso(at(D.x1,WINDOW+(i+.5)*STEP-phi),P));
 d+=`<path d="${poly(cap)}" class="iso-line" data-tone="hi" style="fill:#e3e3de"/>`;
 const hub=Array.from({length:20},(_,i)=>{const t=i/20*Math.PI*2;return k.iso([D.x1+.2,D.y+4*Math.cos(t),D.z+4*Math.sin(t)],P);});d+=`<path d="${poly(hub)}" class="iso-line" data-tone="mid" style="fill:#d3d3ce"/>`;
 // the window: two accent notches on the stands and a reading bar above the face
 const wa=at(D.x0-1,WINDOW,Rv+2.6),wb=at(D.x1+1,WINDOW,Rv+2.6);
 d+=`<path d="${k.pathOf([k.iso(wa,P),k.iso(wb,P)])}" stroke="#2d2d2f" stroke-width="2.2" stroke-linecap="round"/><path d="${k.pathOf([k.iso(wa,P),k.iso(wb,P)])}" stroke="var(--acc)" stroke-width="1" stroke-linecap="round"/>`;
 out.push({k:k.depthOf([(D.x0+D.x1)/2,D.y,D.z],P),svg:d});
 // the crank: a shaft, an arm and a turned grip
 const C=CRANK,th=Math.PI/2-phi,hx=C.x,hy=D.y+Math.cos(th)*C.r,hz=D.z+Math.sin(th)*C.r,kk=c.k/1.26;
 const shaft=k.pathOf([k.iso([D.x1,D.y,D.z],P),k.iso([C.x,D.y,D.z],P)]),arm=k.pathOf([k.iso([C.x,D.y,D.z],P),k.iso([hx,hy,hz],P)]);
 let cr=`<path d="${shaft}" stroke="#2d2d2f" stroke-width="${f1(3*kk+1.2)}" stroke-linecap="round"/><path d="${shaft}" stroke="#a7a7ab" stroke-width="${f1(3*kk)}" stroke-linecap="round"/>`;
 cr+=`<path d="${arm}" stroke="#2d2d2f" stroke-width="${f1(2.6*kk+1.2)}" stroke-linecap="round"/><path d="${arm}" stroke="${IRON}" stroke-width="${f1(2.6*kk)}" stroke-linecap="round"/>`;
 const g0=k.iso([hx,hy,hz],P),g1=k.iso([hx+7,hy,hz],P);
 cr+=`<path d="M${f1(g0[0])} ${f1(g0[1])}L${f1(g1[0])} ${f1(g1[1])}" stroke="#4a3a24" stroke-width="${f1(3.4*kk+1.4)}" stroke-linecap="round"/><path d="M${f1(g0[0])} ${f1(g0[1])}L${f1(g1[0])} ${f1(g1[1])}" stroke="#c9b48f" stroke-width="${f1(3.4*kk)}" stroke-linecap="round"/>`+ball(g1,1.8*kk);
 cr+=ball(k.iso([C.x,D.y,D.z],P),2*kk,'#d9d9d4');
 // detent ticks round the crank: one per face
 const tk:string[]=[];for(let i=0;i<FACES;i++){const t=Math.PI/2-i*STEP;tk.push(k.pathOf([k.iso([C.x-.5,D.y+Math.cos(t)*(C.r+2),D.z+Math.sin(t)*(C.r+2)],P),k.iso([C.x-.5,D.y+Math.cos(t)*(C.r+3.6),D.z+Math.sin(t)*(C.r+3.6)],P)]));}
 cr+=L(tk.join(''),'mid');
 if(cue){const ring=Array.from({length:40},(_,i)=>{const t=i/40*Math.PI*2;return k.iso([C.x,D.y+Math.cos(t)*(C.r+6),D.z+Math.sin(t)*(C.r+6)],P);});cr+=`<path d="${poly(ring)}" fill="none" stroke="var(--acc)" stroke-width="1.8"/>`;}
 out.push({k:k.depthOf([C.x,D.y,D.z],P)+4,svg:cr});
 return out;
}

// ── The flip-tile table ────────────────────────────────────────────────────────────────────────────────────────────────
function board(state:number,rows:Record<Team,number>,flips:Record<string,number>,team:Team|null|undefined,P:k.Projection):Item[]{
 const B=BOARD,out:Item[]=[],played=Math.min(MATCHES_1916.length,state),T=table(played),f0=B.face*Math.PI/180;
 const n:[number,number]=[Math.cos(f0),Math.sin(f0)],t:[number,number]=[Math.sin(f0),-Math.cos(f0)],ring=(c:[number,number],w:number,d:number):k.Plane[]=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2]].map(([u,v])=>[c[0]+t[0]*u+n[0]*v,c[1]+t[1]*u+n[1]*v]);
 const at=(u:number,v:number):[number,number]=>[B.cx+t[0]*u+n[0]*v,B.cy+t[1]*u+n[1]*v];
 // two legs on feet
 for(const u of [-B.w/2+14,B.w/2-14]){const c=at(u,0);out.push({k:k.depthOf([c[0],c[1],0],P)-60,svg:S(k.extrude(ring(c,14,B.d+12),0,3,P,{bevel:.4}),{tone:'mid'})+S(k.extrude(ring(c,5,B.d-2),3,B.z0-2,P),{tone:'mid'})});}
 let o=S(k.extrude(ring([B.cx,B.cy],B.w,B.d),B.z0,B.h,P,{bevel:.8}),{tone:'hi',inner:L(k.ringSeam(ring([B.cx,B.cy],B.w,B.d),B.z0+B.h-3,P),'faint')});
 const fo=at(-B.w/2,B.d/2+.05),m=planeMatrix([fo[0],fo[1],B.z0+B.h],[t[0],t[1],0],[0,0,-1],P);
 let f=`<rect x="3" y="3" width="${B.w-6}" height="${B.h-6}" rx="2" fill="#2b2c2f" stroke="#141416" stroke-width=".6" vector-effect="non-scaling-stroke"/>`;
 f+=txt(8,11,'1916 · SOUTH AMERICAN CHAMPIONSHIP',3.2,{fill:'#f1efe6',anchor:'start'});
 const cols=['P','W','D','L','PTS'],cx=[56,66,76,86,99];
 cols.forEach((c,i)=>f+=txt(cx[i],18.5,c,2.8,{fill:'#a9a9a4'}));
 for(const tm of TEAMS){const r=T.find(x=>x.team===tm)!,y=21+rows[tm]*9.6,on=team===tm,champ=state>=MATCHES_1916.length+1&&T[0].team===tm;
  f+=`<rect x="6" y="${f1(y)}" width="${B.w-12}" height="8.4" rx="1" fill="${on?'#2f3a55':champ?'#3d3f44':'#323337'}"/>`;
  f+=`<rect x="8" y="${f1(y+1.6)}" width="5" height="5.2" rx=".8" fill="${TEAM_TINT[tm]}"/>`;
  f+=txt(16,y+6.2,tm.toUpperCase(),3.6,{fill:champ?'#a9c4ff':'#f1efe6',anchor:'start'});
  [r.p,r.w,r.d,r.l,r.pts].forEach((v,i)=>{const fx=cx[i]-4.4,fl=flips[`${tm}-${i}`]??1,big=i===4;
   f+=`<rect x="${f1(fx)}" y="${f1(y+.7)}" width="8.8" height="7" rx=".7" fill="${big?'#f4f2ea':'#e7e5dc'}"/>`+txt(cx[i],y+6.1,String(v),5,{fill:'#1d1d1b'});
   f+=`<path d="M${f1(fx)} ${f1(y+4.2)}h8.8" stroke="#8d8b84" stroke-width=".4" vector-effect="non-scaling-stroke"/>`;
   if(fl<1){const sc=Math.abs(Math.cos(fl*Math.PI)),hh=3.5*sc,top=fl<.5?y+4.2-hh:y+4.2;
    f+=`<rect data-flap x="${f1(fx)}" y="${f1(top)}" width="8.8" height="${f1(Math.max(.2,hh))}" fill="${mix('#e7e5dc','#6d6b64',1-sc)}" stroke="#8d8b84" stroke-width=".3" vector-effect="non-scaling-stroke"/>`;}});}
 f+=txt(8,B.h-6,'2 POINTS FOR A WIN · 1 FOR A DRAW',2.4,{fill:'#a9a9a4',anchor:'start',weight:500});
 o+=`<g transform="${m}">${f}</g>`;
 for(const u of [-B.w/2+4,B.w/2-4]){const c=at(u,B.d/2+.1);o+=dot(k.iso([c[0],c[1],B.z0+B.h-4],P),.8,.6);}
 out.push({k:k.depthOf([B.cx,B.cy,B.z0],P)-40,svg:o});
 return out;
}

// ── The map plate, the pegs and the threads ────────────────────────────────────────────────────────────────────────────
function mapPlate(state:number,team:Team|null|undefined,P:k.Projection):Item[]{
 const out:Item[]=[],z=MAP_Z,played=Math.min(MATCHES_1916.length,state);
 let o='';for(const [x,y] of k.corners(MAP,6))o+=S(k.cylinder(x,y,3,0,z-1.6,P,16),{tone:'mid'});
 o+=S(k.slabOf(MAP,z-1.6,1.6,P,4,.4),{tone:'hi',inner:''});
 o+=L(k.planOutline(k.insetPlan(MAP,2.4),z,P,4),'faint');
 // the continent: an engraved, lightly tinted outline; the sea hatched
 const sa=SA.map(([lo,la])=>mapXY(lo,la));
 o+=`<path d="${k.onTop(sa,z+.02,P,true)}" fill="#e9e3cf" class="iso-line" data-tone="mid" style="fill:#ebe5d1"/>`;
 // graticule: a few lines of latitude, faint
 const gr:string[]=[];for(const la of [0,-20,-40]){const [x0,y0]=mapXY(-81,la),[x1]=mapXY(-36,la);gr.push(k.lineOnTop([x0,y0],[x1,y0],z,P));}
 o+=L(gr.join(''),'faint');
 for(const [x,y] of k.corners(MAP,3.4))o+=screw(x,y,z,P,.9);
 o+=k.faceTextSvg(k.topMatrix([MAP.x+5,MAP.y+MAP.d-5],z,P),'SOUTH AMERICA · 1916',{size:3,tone:'mid'});
 out.push({k:k.depthOf([MAP.x+MAP.w/2,MAP.y+MAP.d/2,0],P)-20,svg:o});
 // pegs (built at their spots) and their tags
 const head:Record<string,k.Point3>={};
 for(const t of TEAMS){const [x,y]=mapXY(...PEG_AT[t]),zz=z,h=13;head[t]=[x,y,zz+h-3.4];
  let p=`<path class="iso-halo" style="opacity:.3;filter:blur(2px);transform:none" d="${k.cylinder(x,y,3,zz,.1,P,16).fill}"/>`;
  p+=S(k.cylinder(x,y,2.8,zz,1,P,20,.2),{tone:'hi'})+S(k.cylinder(x,y,1.5,zz+1,h-5,P,18),{tone:'hi'});
  p+=tint(k.cylinder(x,y,2,zz+h-7.4,2.6,P,20),TEAM_TINT[t],'hi');
  p+=ball(k.iso([x,y,zz+h-2],P),2*k.cameraOf(P).k/1.26,team===t?'#fff6d6':'#f7f7f3');
  if(team===t)p+=`<path d="${k.ring(x,y,5,zz+.1,P,30)}" fill="none" stroke="var(--acc)" stroke-width="1.6"/>`;
  p+=k.faceTextSvg(k.topMatrix([x+3.4,y+4.6],zz,P),TAG[t],{size:3.2,tone:'hi'});
  out.push({k:k.depthOf([x,y,zz],P)+1,svg:p});}
 // the threads: one per match played (tied from collar to collar), the newest in the accent
 for(const th of threadsAt(played)){const a=head[th.a],b=head[th.b],hi=th.now||(team&&(th.a===team||th.b===team));
  const sag:k.Point3=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2-1.2];
  const d=k.pathOf([k.iso(a,P),k.iso(sag,P),k.iso(b,P)]);
  out.push({k:Math.max(k.depthOf(a,P),k.depthOf(b,P))+.5,svg:`<path d="${d}" fill="none" stroke="${hi?'var(--acc)':'#3a3a3c'}" stroke-width="${hi?2:1.3}" stroke-linecap="round" stroke-linejoin="round"/>`});}
 return out;
}

// ── The timeline rail, the carriage and the shelf of cups ──────────────────────────────────────────────────────────────
function cupToken(x:number,y:number,z:number,color:string,P:k.Projection,scale=1){
 const s=scale;let o=tint(k.cylinder(x,y,3*s,z,1.2*s,P,20,.2),WOOD,'hi')+tint(k.cylinder(x,y,1*s,z+1.2*s,3.2*s,P,14),color,'hi');
 for(let i=0;i<4;i++)o+=tint(k.cylinder(x,y,(1.8+i*.75)*s,z+(4.4+i*1.2)*s,1.25*s,P,22),color,'hi');
 o+=`<path d="${k.ring(x,y,4.2*s,z+9.2*s,P,24)}" fill="${mix(color,'#000000',.25)}" class="iso-line" data-tone="hi" style="fill:${mix(color,'#000000',.25)}"/>`;
 return o;
}
function rail(year:number,drops:Record<CupId,number>,P:k.Projection,cue:boolean):Item[]{
 const out:Item[]=[],R=RAIL;
 // the shelf behind the rail, with a slot for every cup
 const sh={x:R.x0,y:R.yr-14,w:R.x1-R.x0,d:10,r:1.5};
 out.push({k:k.depthOf([0,sh.y,0],P)-30,svg:S(k.slabOf(sh,0,4,P,3,.5),{tone:'mid',inner:L(k.sideSeam(sh,2,P,3),'faint')})});
 for(const c of CUPS){const x=xOfYear(c.year),sy=sh.y+5;
  out.push({k:k.depthOf([x,sy,0],P)-29,svg:L(k.ring(x,sy,3.6,4,P,24),'lo')+k.faceTextSvg(k.topMatrix([x-4,sh.y+sh.d-.8],4,P),String(c.year),{size:2.2,tone:'mid'})});
  const dp=drops[c.id]??0;if(dp<=0)continue;
  const fall=dp<1?Math.max(0,1-dp)**2*34-(dp>.82?Math.sin((dp-.82)/.18*Math.PI)*1.6:0):0;
  out.push({k:k.depthOf([x,sy,6],P),svg:`<g opacity="${Math.min(1,dp*3).toFixed(2)}">${cupToken(x,sy,4+fall,c.id==='copa'?'#2a5bd7':SILVER,P,c.id==='copa'?1.15:.95)}</g>`});}
 // the 40-year bracket once the second cup is down
 const d1=droppedBy(year);if(d1.length>=2&&(drops.asia??0)>=1){const a=xOfYear(1916),b=xOfYear(1956),y0=sh.y+1.4,z=4.05;
  out.push({k:k.depthOf([0,sh.y,4],P)-28,svg:`<path d="${k.onTop([[a,y0+2],[a,y0],[b,y0],[b,y0+2]],z,P)}" fill="none" stroke="var(--acc)" stroke-width="1.6"/>`+
   k.faceTextSvg(k.topMatrix([(a+b)/2-10,y0+5.4],z,P),'40 YEARS ALONE',{size:3,tone:'hi'})});}
 // the rail: a long bar with a ruler (a tick a year, a big one each decade, the decade engraved)
 const rb={x:R.x0,y:R.yr,w:R.x1-R.x0,d:12,r:1.5};
 let r=S(k.slabOf(rb,0,5,P,3,.6),{tone:'hi',inner:L(k.sideSeam(rb,2.5,P,3),'faint')});
 const mi:string[]=[],ma:string[]=[];for(let y=YEAR0;y<=YEAR1;y++){const x=xOfYear(y),big=y%10===0;(big?ma:mi).push(k.lineOnTop([x,R.yr+.8],[x,R.yr+(big?4.4:2.2)],5,P));}
 r+=L(mi.join(''),'lo')+L(ma.join(''),'mid');
 for(let y=YEAR0;y<=YEAR1;y+=10)r+=k.faceTextSvg(k.topMatrix([xOfYear(y)-3.6,R.yr+9],5,P),String(y),{size:2.6,tone:'hi'});
 r+=L(k.lineOnTop([R.x0+3,R.yr+10.6],[R.x1-3,R.yr+10.6],5,P),'faint');
 for(const x of [R.x0+3,R.x1-3])r+=S(k.slabOf({x:x-2,y:R.yr-1,w:4,d:14,r:.6},5,3,P,2),{tone:'mid'});
 out.push({k:k.depthOf([0,R.yr,0],P)-26,svg:r});
 // the carriage: a block riding the rail, a pointer down to the ruler, the year on its front
 const cx=xOfYear(year),cb={x:cx-7,y:R.yr-3,w:14,d:16,r:1.5};
 let c=S(k.slabOf(cb,5,9,P,3,.6),{tone:'hi',lit:true,inner:L(k.sideSeam(cb,8,P,3),'faint')});
 c+=`<path d="${k.onTop([[cx-1.6,R.yr+13],[cx,R.yr+15.4],[cx+1.6,R.yr+13]],5.05,P,true)}" fill="var(--acc)" stroke="#1d1d1b" stroke-width=".5"/>`;
 const fm=k.sideMatrix([cb.x,cb.y+cb.d+.05],14,P,'left');
 c+=`<g transform="${fm}"><rect x="1.6" y="1.4" width="${cb.w-3.2}" height="6" rx=".8" fill="#2b2c2f"/>${txt(cb.w/2,6.1,String(Math.round(year)),4.6,{fill:'#f1efe6'})}</g>`;
 c+=S(k.cylinder(cx,R.yr+5,2,14,2.2,P,20,.3),{tone:'mid',inner:L(k.knurl(cx,R.yr+5,2,14.1,16.1,24,P,.1),'faint')});
 if(cue)c+=`<path d="${k.planOutline(k.insetPlan(cb,-3),5,P,3)}" fill="none" stroke="var(--acc)" stroke-width="1.8"/>`;
 out.push({k:k.depthOf([cx,R.yr+8,5],P)+2,svg:c});
 return out;
}

// ── The trophy on its base ────────────────────────────────────────────────────────────────────────────────────────────
function trophy(apart:number,focus:TrophyPart|null|undefined,P:k.Projection):{items:Item[];parts:Partial<Record<TrophyPart,k.Flat>>}{
 const {x,y}=TROPHY,e=apart,parts:Partial<Record<TrophyPart,k.Flat>>={},vx=Math.cos(((P.azimuth??45))*Math.PI/180),vy=Math.sin(((P.azimuth??45))*Math.PI/180);
 const dim=(id:TrophyPart)=>focus&&focus!==id&&e>.3?' opacity=".35"':'';
 const tiers:{id:TrophyPart;r:number;z:number;h:number;lift:number;n:number}[]=[{id:'tier3',r:17,z:0,h:7,lift:0,n:7},{id:'tier2',r:13.6,z:7,h:7,lift:10,n:6},{id:'tier1',r:10.2,z:14,h:7,lift:20,n:5}];
 let o=`<path class="iso-halo" d="${k.cylinder(x,y,19,0,1,P,30).fill}"/>`;
 for(const T of tiers){const z0=T.z+T.lift*e;
  o+=`<g${dim(T.id)}>${tint(k.cylinder(x,y,T.r,z0,T.h,P,8,.6),WOOD,'hi',L(k.sideArc(x,y,T.r,z0+1.2,P,20),'faint'))}</g>`;
  // the plaques on the faces turned toward you (they pull out a little when apart)
  let pl='';const facing=Math.atan2(vy,vx);
  for(let i=0;i<8;i++){const a=(i+.5)/8*Math.PI*2,dd=Math.cos(a-facing);if(dd<.25)continue;const ro=T.r*Math.cos(Math.PI/8)+.15+e*3.5,w=T.r*.36,za=z0+1.6,zb=z0+T.h-1.6,px=Math.cos(a),py=Math.sin(a),tx=-py,ty=px;
   const q=[[ro*px-w*tx,ro*py-w*ty,za],[ro*px+w*tx,ro*py+w*ty,za],[ro*px+w*tx,ro*py+w*ty,zb],[ro*px-w*tx,ro*py-w*ty,zb]].map(([u,v,z])=>k.iso([x+u,y+v,z],P));
   pl+=`<path d="${poly(q)}" fill="${mix('#d8d1b8','#ffffff',dd*.3)}" class="iso-line" data-tone="mid" style="fill:${mix('#d6cfb4','#fbf8ec',dd*.4)}"/>`;
   const l1=k.iso([x+ro*px-w*.6*tx,y+ro*py-w*.6*ty,(za+zb)/2+.5],P),l2=k.iso([x+ro*px+w*.5*tx,y+ro*py+w*.5*ty,(za+zb)/2+.5],P);pl+=`<path d="M${f1(l1[0])} ${f1(l1[1])}L${f1(l2[0])} ${f1(l2[1])}" stroke="#8d8672" stroke-width=".5"/>`;
   if(T.id==='tier3'&&i===Math.round(facing/(Math.PI/4)-.5+8)%8)parts.plaques=k.iso([x+ro*px,y+ro*py,(za+zb)/2],P);}
  o+=`<g${dim('plaques')}>${pl}</g>`;
  parts[T.id]=k.iso([x+T.r*vx*.0,y,z0+T.h/2],P);}
 if(!parts.plaques)parts.plaques=k.iso([x+17*vx,y+17*vy,3.5],P);
 // the silver cup: a foot, a stem with a knop, the bowl in turned bands, a rim, two handles
 const cz=21+e*34;let cu='';
 cu+=tint(k.cylinder(x,y,7.4,cz,1.6,P,28,.3),SILVER,'hi')+tint(k.cylinder(x,y,5.6,cz+1.6,1.6,P,28,.3),SILVER,'hi');
 cu+=tint(k.cylinder(x,y,1.9,cz+3.2,10,P,18),SILVER,'hi')+tint(k.cylinder(x,y,3.2,cz+7,2,P,22,.3),SILVER,'hi');
 const bands=[4,5.6,7,8.2,9.1,9.8,10.2,10.4];bands.forEach((r,i)=>cu+=tint(k.cylinder(x,y,r,cz+13.2+i*2.6,2.7,P,32),SILVER,'hi'));
 const top=cz+13.2+bands.length*2.6;cu+=`<path d="${k.ring(x,y,9.8,top,P,36)}" fill="${mix(SILVER,'#000000',.35)}" class="iso-line" data-tone="hi" style="fill:${mix(SILVER,'#000000',.35)}"/>`;
 // handles: loops in the plane across your view, from the bowl's shoulder to its waist
 for(const s of [-1,1]){const ax=-vy*s,ay=vx*s,pts:k.Flat[]=[];for(let i=0;i<=16;i++){const t=i/16*Math.PI;pts.push(k.iso([x+ax*(9.6+Math.sin(t)*6),y+ay*(9.6+Math.sin(t)*6),cz+31-Math.cos(t)*-1-t*3.4],P));}
  const hd=k.pathOf(pts);cu+=`<path d="${hd}" fill="none" stroke="#5d6066" stroke-width="3" stroke-linecap="round"/><path d="${hd}" fill="none" stroke="${SILVER}" stroke-width="1.8" stroke-linecap="round"/>`;}
 parts.cup=k.iso([x,y,cz+24],P);
 o+=`<g${dim('cup')}>${cu}</g>`;
 return {items:[{k:k.depthOf([x,y,0],P),svg:o}],parts};
}

// ── The whole drawing ──────────────────────────────────────────────────────────────────────────────────────────────────
export function render(P:k.Projection,V:View):{svg:string;anchors:Anchors}{
 let o=bench(P);
 const tr=trophy(V.apart,V.focus,P);
 const items:Item[]=[...board(V.state,V.rows,V.flips,V.team,P),...drum(V.phi,V.state,P,V.cue==='crank'),...mapPlate(V.state,V.team,P),...rail(V.year,V.drops,P,V.cue==='carriage'),...tr.items];
 o+=items.sort((a,b)=>a.k-b.k).map(i=>i.svg).join('');
 const kk=k.cameraOf(P).k/1.26,D=DRUM;
 const pegs={} as Record<Team,k.Flat>;for(const t of TEAMS){const [x,y]=mapXY(...PEG_AT[t]);pegs[t]=k.iso([x,y,MAP_Z+8],P);}
 return {svg:o,anchors:{crank:k.iso([CRANK.x,D.y,D.z],P),crankR:CRANK.r*kk,drum:k.iso([(D.x0+D.x1)/2,D.y,D.z],P),carriage:k.iso([xOfYear(V.year),RAIL.yr+5,12],P),trophy:k.iso([TROPHY.x,TROPHY.y,26+V.apart*20],P),
  rail:[k.iso([RAIL.x0,RAIL.yr+6,5],P),k.iso([RAIL.x1,RAIL.yr+6,5],P)],pegs,parts:V.apart>.3?tr.parts:{},scale:kk}};
}
export {TROPHY_PARTS};
