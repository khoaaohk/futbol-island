import {PITCH,type GuideFormat} from '../pitch';
/**
 * A printable sheet as plain data (Nov 10 2026, the free coach tools under /tools): a list of rectangles, lines, circles,
 * polylines and text on a page. One layout, three renderers that can never disagree:
 *  - toSvgString (here): the downloadable .svg file and the picture the lineup builder turns into a PNG in the browser;
 *  - lib/site/tools/SheetSvg.tsx: inline SVG on the page (server or client, no effects);
 *  - lib/site/tools/sheetImage.tsx: the element tree for the static PNG route (Next's ImageResponse).
 * The field is drawn from lib/site/pitch.ts (the same proportions as every guide diagram), upright or on its side, with the
 * penalty arc, corner arcs and optional thirds, zones and build-out lines. Pure maths: no DOM, no React, no timers.
 */
export type Item=
 |{t:'rect';x:number;y:number;w:number;h:number;fill?:string;stroke?:string;sw?:number;rx?:number;dash?:string;op?:number}
 |{t:'line';x1:number;y1:number;x2:number;y2:number;stroke:string;sw:number;dash?:string}
 |{t:'circle';cx:number;cy:number;r:number;fill?:string;stroke?:string;sw?:number}
 |{t:'poly';pts:[number,number][];stroke:string;sw:number}
 |{t:'text';x:number;y:number;text:string;size:number;fill:string;weight?:number;anchor?:'start'|'middle'|'end'};
export type Sheet={w:number;h:number;bg:string;title:string;desc:string;items:Item[]};
export type Theme={grass:string|null;line:string;ink:string;dot:string;keeper:string;page:string;soft:string};
/** The site's pitch (lib/site/PitchDiagram.tsx): pitch green, white lines, gold players, white keeper, on the home paper. */
export const GRASS:Theme={grass:'#1d6b55',line:'#ffffff',ink:'#14221d',dot:'#e9c16b',keeper:'#ffffff',page:'#fbf7ee',soft:'#5b675f'};
/** Black on white, for printers: no filled grass, dark lines, white dots with a dark rim. */
export const INK:Theme={grass:null,line:'#14221d',ink:'#14221d',dot:'#ffffff',keeper:'#d9dcd6',page:'#ffffff',soft:'#4a544e'};
/** US Letter at 100 units per inch (the PNG route renders it at 1.5x: 150 dpi). */
export const LETTER={portrait:{w:850,h:1100},landscape:{w:1100,h:850}} as const;
export const CREDIT='futbolisland.app';
export const LICENCE='Free to print and share for teams, clubs and schools. Made by Futbol Island.';
export type FieldOpts={landscape?:boolean;thirds?:boolean;zones?:boolean;buildOut?:boolean;theme:Theme;sw?:number;pad?:number};
export type Field={items:Item[];at:(x:number,y:number)=>[number,number];k:number;x:number;y:number;w:number;h:number};
const r1=(n:number)=>Math.round(n*10)/10;
/**
 * The field of one format fitted into a box. `at(x, y)` turns a team spot (x 0-100 from the left touchline, y 0-100 from the
 * team's own goal line, lib/site/pitch.ts `place`) into page units: the team attacks up an upright field and to the right on a
 * field on its side.
 */
export function fieldItems(format:GuideFormat,box:{x:number;y:number;w:number;h:number},o:FieldOpts):Field{
 const p=PITCH[format],T=o.theme,sw=o.sw??2,pad=o.pad??(T.grass?10:0);
 const aw=box.w-2*pad,ah=box.h-2*pad,k=o.landscape?Math.min(aw/p.l,ah/p.w):Math.min(aw/p.w,ah/p.l);
 const fw=(o.landscape?p.l:p.w)*k,fh=(o.landscape?p.w:p.l)*k,x0=box.x+(box.w-fw)/2,y0=box.y+(box.h-fh)/2;
 /* u across the field (0..w), v along it (0..l, 0 = the goal the team attacks on an upright field) */
 const P=(u:number,v:number):[number,number]=>o.landscape?[r1(x0+(p.l-v)*k),r1(y0+u*k)]:[r1(x0+u*k),r1(y0+v*k)];
 const items:Item[]=[],cx=p.w/2;
 const ln=(a:[number,number],b:[number,number],dash?:string)=>items.push({t:'line',x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:T.line,sw,...(dash?{dash}:{})});
 const rc=(a:[number,number],b:[number,number],fill?:string)=>items.push({t:'rect',x:Math.min(a[0],b[0]),y:Math.min(a[1],b[1]),w:r1(Math.abs(a[0]-b[0])),h:r1(Math.abs(a[1]-b[1])),...(fill?{fill}:{}),stroke:T.line,sw});
 const arc=(f:(a:number)=>[number,number],from:number,to:number)=>{const pts:[number,number][]=[];for(let i=0;i<=14;i++)pts.push(f(from+(to-from)*i/14));items.push({t:'poly',pts,stroke:T.line,sw});};
 if(T.grass)items.push({t:'rect',x:r1(x0-pad),y:r1(y0-pad),w:r1(fw+2*pad),h:r1(fh+2*pad),fill:T.grass,rx:12});
 rc(P(0,0),P(p.w,p.l));ln(P(0,p.l/2),P(p.w,p.l/2));
 const c=P(cx,p.l/2);items.push({t:'circle',cx:c[0],cy:c[1],r:r1(p.circle*k),stroke:T.line,sw},{t:'circle',cx:c[0],cy:c[1],r:2.5,fill:T.line});
 for(const [v0,d] of [[0,1],[p.l,-1]] as const){
  if(p.box){rc(P(cx-p.box[0]/2,v0),P(cx+p.box[0]/2,v0+d*p.box[1]));
   const dy=p.box[1]-p.spot;if(dy<p.circle){const a0=Math.acos(dy/p.circle);arc(a=>P(cx+p.circle*Math.sin(a),v0+d*(p.spot+p.circle*Math.cos(a))),-a0,a0);}}
  if(p.six)rc(P(cx-p.six[0]/2,v0),P(cx+p.six[0]/2,v0+d*p.six[1]));
  if(p.arc){const R=p.arc,g=p.goal/2;
   arc(a=>P(cx-g-R*Math.cos(a),v0+d*R*Math.sin(a)),0,Math.PI/2);arc(a=>P(cx+g+R*Math.cos(a),v0+d*R*Math.sin(a)),0,Math.PI/2);ln(P(cx-g,v0+d*R),P(cx+g,v0+d*R));}
  for(const s of [p.spot,p.spot2])if(s){const q=P(cx,v0+d*s);items.push({t:'circle',cx:q[0],cy:q[1],r:2.5,fill:T.line});}
  if(p.buildOut&&o.buildOut!==false&&!o.thirds&&!o.zones)ln(P(0,v0+d*p.buildOut),P(p.w,v0+d*p.buildOut),'8 6');
  const cr=Math.min(1,p.w/30);for(const u0 of [0,p.w])arc(a=>P(u0+(u0?-1:1)*cr*Math.cos(a),v0+d*cr*Math.sin(a)),0,Math.PI/2);
  const gd=Math.max(1.2,6/k);rc(P(cx-p.goal/2,v0),P(cx+p.goal/2,v0-d*gd),T.grass?T.line:undefined);
 }
 if(o.thirds||o.zones)for(const v of [p.l/3,2*p.l/3])ln(P(0,v),P(p.w,v),'10 7');
 if(o.zones){const us=p.box?(format==='11v11'&&p.six?[cx-p.box[0]/2,cx-p.six[0]/2,cx+p.six[0]/2,cx+p.box[0]/2]:[cx-p.box[0]/2,cx+p.box[0]/2]):[p.w/3,2*p.w/3];
  for(const u of us)ln(P(u,0),P(u,p.l),'10 7');}
 const at=(x:number,y:number):[number,number]=>P(x/100*p.w,p.l-y/100*p.l);
 return {items,at,k,x:r1(x0),y:r1(y0),w:r1(fw),h:r1(fh)};
}
/** A numbered player dot with a name or position label under it. */
export function dotItems(x:number,y:number,o:{n:string;label?:string;keeper?:boolean;r:number;theme:Theme;size?:number}):Item[]{
 const T=o.theme,out:Item[]=[{t:'circle',cx:x,cy:y,r:o.r,fill:o.keeper?T.keeper:T.dot,stroke:T.ink,sw:2},
  {t:'text',x,y:r1(y+o.r*.33),text:o.n,size:r1(o.n.length>2?o.r*.6:o.r*.92),fill:T.ink,weight:700,anchor:'middle'}];
 /* the keeper stands on the goal line: a label under the dot would land on the goal, so it sits beside the dot */
 if(o.label)out.push(o.keeper?{t:'text',x:r1(x+o.r+6),y:r1(y+(o.size??11)*.36),text:o.label,size:o.size??11,fill:T.grass?T.line:T.ink,weight:700,anchor:'start'}
  :{t:'text',x,y:r1(y+o.r+(o.size??11)+2),text:o.label,size:o.size??11,fill:T.grass?T.line:T.ink,weight:700,anchor:'middle'});
 return out;
}
/** Break a text into lines of at most `max` characters, on spaces (SVG has no text wrapping). */
export function wrapText(text:string,max:number,maxLines=99):string[]{
 const out:string[]=[];
 for(const para of text.split('\n')){let line='';
  for(const word of para.split(/\s+/).filter(Boolean)){
   if(!line)line=word;else if((line+' '+word).length<=max)line+=' '+word;else{out.push(line);line=word;}
   while(line.length>max){out.push(line.slice(0,max));line=line.slice(max);}}
  if(line)out.push(line);}
 return out.length>maxLines?[...out.slice(0,maxLines-1),out[maxLines-1].slice(0,max-1)+'…']:out;
}
export const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const FONT='Arial,Helvetica,sans-serif';
export function itemSvg(i:Item):string{
 const a=(o:Record<string,string|number|undefined>)=>Object.entries(o).filter(([,v])=>v!==undefined).map(([k,v])=>` ${k}="${typeof v==='number'?v:esc(v as string)}"`).join('');
 if(i.t==='rect')return `<rect${a({x:i.x,y:i.y,width:i.w,height:i.h,rx:i.rx,fill:i.fill??'none',stroke:i.stroke,'stroke-width':i.stroke?i.sw:undefined,'stroke-dasharray':i.dash,opacity:i.op})}/>`;
 if(i.t==='line')return `<line${a({x1:i.x1,y1:i.y1,x2:i.x2,y2:i.y2,stroke:i.stroke,'stroke-width':i.sw,'stroke-dasharray':i.dash})}/>`;
 if(i.t==='circle')return `<circle${a({cx:i.cx,cy:i.cy,r:i.r,fill:i.fill??'none',stroke:i.stroke,'stroke-width':i.stroke?i.sw:undefined})}/>`;
 if(i.t==='poly')return `<polyline${a({points:i.pts.map(p=>p.join(',')).join(' '),fill:'none',stroke:i.stroke,'stroke-width':i.sw})}/>`;
 return `<text${a({x:i.x,y:i.y,'font-size':i.size,'font-weight':i.weight,fill:i.fill,'text-anchor':i.anchor})}>${esc(i.text)}</text>`;
}
/** The sheet as a standalone SVG file (`scale` only changes the width and height attributes; the drawing is a viewBox). */
export function toSvgString(s:Sheet,scale=1):string{
 return `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 ${s.w} ${s.h}" width="${s.w*scale}" height="${s.h*scale}" font-family="${FONT}"><title>${esc(s.title)}</title><desc>${esc(s.desc)}</desc>`
  +`<rect width="${s.w}" height="${s.h}" fill="${s.bg}"/>${s.items.map(itemSvg).join('')}</svg>`;
}
