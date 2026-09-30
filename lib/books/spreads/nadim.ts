/**
 * The six Nadia Nadim pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/nadim/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * The war is shown only symbolically and gently: grey clouds over the city, a portrait in a frame, a closed door and a long
 * road. Denmark's kit is the orange-red `casual` shirt with a small Danish flag beside it (no crests or badges).
 * Overlap rules (Sep 29 audit): stands stay in front of the V-fold's glue lines (see `back`), titles print at the front edge.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,type Part,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='nadim-';
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
const NADIA={skin:'#d99a6c',hair:'long' as const,hairColor:'#2a1d18'};
const FAMILY={skin:'#d99a6c',hairColor:'#2a1d18'};
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};
const showPart=(q:Part,a:number)=>{q.scale=a;q.visible=a>.02;};
/** Front-most z of the V-fold glue line at x (apex -3.05, alpha 1.22): stands stay at least this far forward. */
const back=(x:number)=>-2.7+.365*Math.abs(x);

/* ───────────── page print helpers (solid ink) ───────────── */
function line(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.04,c:string=INK.white){const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*w/2,ny=dx/L*w/2;k.fill(poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]),c);}
function ring(k:Kit,x:number,y:number,r:number,w=.04,c:string=INK.white){const n=40;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,b=(i+1)/n*Math.PI*2;line(k,x+Math.cos(a)*r,y+Math.sin(a)*r,x+Math.cos(b)*r,y+Math.sin(b)*r,w,c);}}
function box(k:Kit,x:number,y:number,w:number,h:number,lw=.04,c:string=INK.white){line(k,x,y,x+w,y,lw,c);line(k,x+w,y,x+w,y+h,lw,c);line(k,x+w,y+h,x,y+h,lw,c);line(k,x,y+h,x,y,lw,c);}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,.85);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function sand(k:Kit,x0:number,x1:number,tone='#e3c48f'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,INK.orange,.06,(x,y)=>.12+.08*Math.sin(x*1.9+y*.7));}
function asphalt(k:Kit,x0:number,x1:number,tone='#9a9aa2'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,'#5d5f6c',.05,(x,y)=>.2+.12*Math.sin(x*2.1+y*1.3));}
function paperDesk(k:Kit,x0:number,x1:number,tone='#efe1c2'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,INK.orange,.06,.12);for(let y=.5;y<PAGE_D;y+=.5)line(k,x0,y,x1,y,.012,'#dcc7a0');}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.35);}}
function dotted(k:Kit,pts:number[][],c:string=INK.red,r=.035){for(let i=0;i<pts.length-1;i++){const [x0,y0]=pts[i],[x1,y1]=pts[i+1],n=Math.max(2,Math.round(Math.hypot(x1-x0,y1-y0)/.16));for(let j=0;j<n;j++){const t=j/n;k.circle(x0+(x1-x0)*t,y0+(y1-y0)*t,r,c);}}}
function road(k:Kit,x0:number,x1:number,y:number,h=.9){const r=rect(x0,y,x1-x0,h);k.fill(r,'#6e6f78');k.dots(r,'#3f4150',.05,.3);for(let x=x0+.2;x<x1;x+=.6)k.fill(rect(x,y+h/2-.03,.32,.06),INK.yellow);k.fill(rect(x0,y-.04,x1-x0,.04),INK.white);k.fill(rect(x0,y+h,x1-x0,.04),INK.white);}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function nightSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.5,.02,i%3?INK.yellow:INK.white);}
function peaks(k:Kit,w:number,y:number,tone:string,snow=true,seed=0){const pts:number[][]=[[0,y+.6]];for(let i=0;i<=8;i++){const x=i/8*w,top=y-(.35+((i*7+seed)%5)*.12);pts.push([x,i%2?top:y+.15]);}pts.push([w,y+.6],[w,3],[0,3]);const p=poly(pts);k.fill(p,tone);k.hatch(p,INK.navy,.07,.7,.008);k.key(p,.012);
 if(snow)for(let i=1;i<=8;i+=2){const x=i/8*w,top=y-(.35+((i*7+seed)%5)*.12);k.fill(poly([[x,top],[x+.12,top+.16],[x+.04,top+.12],[x-.04,top+.18],[x-.12,top+.16]]),INK.white);}}
/** Herat-style skyline: flat-roofed houses, blue-tiled domes and slim towers (generic, not a specific building). */
function domeCity(k:Kit,w:number,y:number){for(let i=0;i<9;i++){const x=i*w/9,h=.35+((i*5)%3)*.15,b=rect(x,y-h,w/9-.04,h);k.fill(b,['#e3c9a0','#d8b88a','#ead7b4'][i%3]);k.key(b,.01);k.fill(rect(x+.1,y-h+.1,.1,.12),INK.navy,.7);}
 for(const [cx,r] of [[1.1,.34],[3.2,.28]] as const){const d=`M${cx-r} ${y-.55} Q${cx-r} ${y-.55-r*1.5} ${cx} ${y-.55-r*1.7} Q${cx+r} ${y-.55-r*1.5} ${cx+r} ${y-.55} Z`;k.fill(rect(cx-r,y-.55,r*2,.55),'#e7d2ad');k.key(rect(cx-r,y-.55,r*2,.55),.01);k.fill(d,INK.teal);k.dots(d,INK.navy,.035,.3);k.key(d,.012);}
 for(const tx of [.5,1.9,3.9]){const t=rect(tx-.05,y-1.3,.1,1.3);k.fill(t,'#d9c29a');k.key(t,.01);k.fill(ell(tx,y-1.32,.07,.06),INK.teal);}}
function rowHouses(k:Kit,w:number,y:number){for(let i=0;i<7;i++){const x=i*w/7,h=.5+(i%2)*.18,b=rect(x,y-h,w/7-.02,h);k.fill(b,['#e8d5b4','#c9745b','#f0e6cf'][i%3]);k.key(b,.01);const roof=poly([[x-.02,y-h],[x+w/14,y-h-.3],[x+w/7,y-h]]);k.fill(roof,i%2?INK.red:'#6c7486');k.key(roof,.01);k.fill(rect(x+.18,y-h+.16,.14,.14),INK.sky);}}
function danishFlag(k:Kit,x:number,y:number,w:number,h:number){const f=rect(x,y,w,h);k.fill(f,INK.red);k.fill(rect(x,y+h*.42,w,h*.16),INK.white);k.fill(rect(x+w*.3,y,w*.12,h),INK.white);k.key(f,.01);}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}

/* ───────────── book-specific plates ───────────── */
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*(.8/n))+h*.08,Math.min(h*.26,h*.7/n),ink,{max:w*.88,weight:800}));},{rim:.018});
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
const stormCloud=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#7d8298');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);},{rim:.02});
const bubble=(key:string,w:number,h:number,text:string,c:string=INK.white)=>sp(key,w,h,k=>{const p=`M${w*.1} 0 L${w*.9} 0 Q${w} 0 ${w} ${h*.12} L${w} ${h*.62} Q${w} ${h*.74} ${w*.9} ${h*.74} L${w*.36} ${h*.74} L${w*.2} ${h} L${w*.24} ${h*.74} L${w*.1} ${h*.74} Q0 ${h*.74} 0 ${h*.62} L0 ${h*.12} Q0 0 ${w*.1} 0 Z`;k.fill(p,c);k.dots(p,INK.sky,.035,.15);k.key(p,.013);k.text(text,w/2,h*.5,h*.3,INK.navy,{max:w*.84,weight:900});},{rim:.016});
const stamp=(key:string,w:number,h:number,label:string,c:string=INK.red)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white,.92);k.key(b,.03,c);k.key(rect(.04,.04,w-.08,h-.08),.012,c);k.text(label,w/2,h*.68,h*.44,c,{max:w*.84,weight:900});},{rim:.015});
const stamper=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.fill(rect(w*.35,0,w*.3,h*.6),INK.wood);k.key(rect(w*.35,0,w*.3,h*.6),.012);k.fill(ell(w/2,h*.06,w*.24,h*.07),INK.brown);k.fill(rect(0,h*.6,w,h*.3),INK.navy);k.key(rect(0,h*.6,w,h*.3),.012);k.fill(rect(w*.05,h*.9,w*.9,h*.1),INK.red);},{rim:.014});
const pow=(key:string,r:number)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2,rr=i%2?r*.5:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});k.fill(poly(pts),INK.yellow);k.dots(poly(pts),INK.orange,.03,.4);k.key(poly(pts),.012);},{rim:.02});
const flag=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(0,0,.04,h),INK.brown);danishFlag(k,.04,0,w-.04,h*.5);},{rim:.014});
/** A framed portrait of her father: a general's cap with a star, drawn gently. */
const portrait=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.fill(f,INK.wood);k.hatch(f,'#8a5238',.03,1.2,.008);k.key(f,.014);const p=rect(w*.12,h*.1,w*.76,h*.74);k.fill(p,INK.sky2);k.dots(p,INK.sky,.035,.3);
 const cx=w/2;k.fill(ell(cx,h*.5,w*.17,w*.19),'#d99a6c');k.key(ell(cx,h*.5,w*.17,w*.19),.01);k.fill(`M${cx-w*.32} ${h*.84} Q${cx} ${h*.6} ${cx+w*.32} ${h*.84} Z`,'#5d6b4a');k.key(`M${cx-w*.32} ${h*.84} Q${cx} ${h*.6} ${cx+w*.32} ${h*.84}`,.01);
 k.fill(`M${cx-w*.22} ${h*.36} Q${cx} ${h*.18} ${cx+w*.22} ${h*.36} Z`,'#5d6b4a');k.fill(rect(cx-w*.26,h*.34,w*.52,h*.05),'#3f4a33');k.circle(cx,h*.3,.035,INK.gold);
 k.circle(cx-w*.06,h*.5,.012,INK.navy,true);k.circle(cx+w*.06,h*.5,.012,INK.navy,true);k.key(`M${cx-w*.06} ${h*.58} Q${cx} ${h*.62} ${cx+w*.06} ${h*.58}`,.01);
 k.fill(rect(w*.2,h*.86,w*.6,h*.1),INK.paper);k.text('FATHER',cx,h*.94,h*.07,INK.navy,{weight:900,max:w*.56});},{rim:.018});
const suitcaseBody=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.red);k.dots(b,INK.navy,.03,.2);k.key(b,.013);for(const x of [.14,.8])k.fill(rect(w*x,0,w*.07,h),INK.brown);k.fill(ell(w*.5,h*.55,w*.14,h*.16),INK.paper);k.key(ell(w*.5,h*.55,w*.14,h*.16),.01);},{rim:.016});
const suitcaseLid=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#c9443a');k.key(b,.012);k.key(`M${w*.38} 0 L${w*.38} ${-h*.9} L${w*.62} ${-h*.9} L${w*.62} 0`,.02);k.circle(w*.2,h*.5,.02,INK.gold);k.circle(w*.8,h*.5,.02,INK.gold);},{rim:.012});
const scarf=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=`M0 ${h*.3} Q${w*.5} 0 ${w} ${h*.3} L${w*.9} ${h} L${w*.6} ${h*.5} Q${w*.3} ${h*.45} ${w*.1} ${h} Z`;k.fill(p,INK.pink);k.hatch(p,INK.navy,.04,.6,.008);k.key(p,.012);},{rim:.014});
const miniPhoto=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.01);const p=rect(w*.1,h*.1,w*.8,h*.62);k.fill(p,INK.sky2);for(let i=0;i<4;i++)k.circle(w*(.22+i*.19),h*.46,w*.07,'#d99a6c');k.circle(w*.5,h*.3,w*.08,'#d99a6c');},{rim:.012});
const truck=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const cab=`M${w*.72} ${h*.22} L${w*.9} ${h*.22} L${w} ${h*.5} L${w} ${h*.82} L${w*.72} ${h*.82} Z`;k.fill(cab,INK.blue);k.dots(cab,INK.navy,.035,.3);k.key(cab,.013);k.fill(poly([[w*.76,h*.28],[w*.88,h*.28],[w*.95,h*.48],[w*.76,h*.48]]),INK.sky2);
 const body=rect(0,0,w*.7,h*.82);k.fill(body,'#c8ccd6');k.dots(body,INK.navy,.04,.18);k.key(body,.014);for(let i=1;i<6;i++)k.key(`M${w*.7*i/6} ${h*.06} L${w*.7*i/6} ${h*.76}`,.008,'#8d93a8');
 for(const x of [.16,.54,.86]){k.fill(ell(w*x,h*.86,h*.14,h*.14),'#2b2b33');k.fill(ell(w*x,h*.86,h*.06,h*.06),INK.grey);}},{rim:.02});
const truckDoor=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#aeb3c1');k.hatch(b,INK.navy,.05,1.5,.006);k.key(b,.012);k.fill(rect(w*.7,h*.45,w*.2,h*.06),INK.navy);},{rim:.01});
const plane=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=`M0 ${h*.5} Q${w*.1} ${h*.3} ${w*.3} ${h*.34} L${w*.9} ${h*.36} Q${w} ${h*.4} ${w} ${h*.5} Q${w} ${h*.6} ${w*.9} ${h*.64} L${w*.3} ${h*.66} Q${w*.1} ${h*.7} 0 ${h*.5} Z`;k.fill(b,INK.white);k.key(b,.012);
 const wing=poly([[w*.45,h*.5],[w*.62,h*.5],[w*.4,h],[w*.3,h]]);k.fill(wing,INK.sky);k.key(wing,.01);const tail=poly([[w*.82,h*.38],[w*.92,h*.38],[w,0],[w*.92,0]]);k.fill(tail,INK.red);k.key(tail,.01);for(let i=0;i<5;i++)k.circle(w*(.2+i*.1),h*.48,.018,INK.blue);},{rim:.018});
const centre=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(let i=0;i<2;i++){const x=i*w*.52,b=rect(x,h*.25,w*.48,h*.75);k.fill(b,i?'#e7ddc6':'#d9cfb8');k.dots(b,INK.navy,.045,.12);k.key(b,.013);const r=poly([[x-.03,h*.27],[x+w*.24,h*.05],[x+w*.51,h*.27]]);k.fill(r,'#6c7486');k.key(r,.012);
  for(let r2=0;r2<2;r2++)for(let c=0;c<3;c++){const wn=rect(x+w*(.05+c*.14),h*(.38+r2*.24),w*.08,h*.12);k.fill(wn,(r2+c+i)%3?INK.sky:INK.yellow);k.key(wn,.008);}}},{rim:.02});
const counter=(key:string,s:number,n:string)=>sp(key,s,s,k=>{k.fill(ell(s/2,s/2,s*.46,s*.46),INK.yellow);k.dots(ell(s/2,s/2,s*.46,s*.46),INK.orange,.03,.3);k.key(ell(s/2,s/2,s*.46,s*.46),.012);k.text(n,s/2,s*.68,s*.5,INK.navy,{weight:900});},{rim:.015});
const clockFace=(key:string,r:number)=>sp(key,r*2,r*2,k=>{k.fill(ell(r,r,r,r),INK.white);k.dots(ell(r,r,r,r),INK.sky,.035,.2);k.key(ell(r,r,r,r),.02);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.key(`M${r+Math.cos(a)*r*.78} ${r+Math.sin(a)*r*.78} L${r+Math.cos(a)*r*.9} ${r+Math.sin(a)*r*.9}`,.014);}k.circle(r,r,.03,INK.navy,true);},{rim:.018});
const clockHand=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.fill(poly([[w*.3,h],[w*.5,0],[w*.7,h]]),INK.red);k.key(poly([[w*.3,h],[w*.5,0],[w*.7,h]]),.008);},{rim:.008});
const teamSheet=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.014);k.fill(rect(0,0,w,h*.18),INK.red);k.text('TEAM SHEET',w/2,h*.13,h*.09,INK.white,{weight:900,max:w*.9});
 for(let i=0;i<6;i++){k.circle(w*.12,h*(.3+i*.1),.018,INK.navy);k.key(`M${w*.2} ${h*(.3+i*.1)} L${w*(i%2?.66:.86)} ${h*(.3+i*.1)}`,.01,INK.grey);}k.fill(rect(w*.18,h*.47,w*.7,h*.08),INK.yellow,.7);k.text('NADIM',w*.5,h*.53,h*.07,INK.navy,{weight:900,max:w*.6});},{rim:.016});
const stampMark=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.key(ell(w/2,h/2,w*.46,h*.44),.03,INK.red);k.key(ell(w/2,h/2,w*.38,h*.36),.012,INK.red);k.text('PICKED',w/2,h*.6,h*.26,INK.red,{weight:900,max:w*.7});},{rim:.01});
const passport=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#8a2f35');k.dots(b,INK.navy,.035,.2);k.key(b,.014);k.circle(w/2,h*.4,w*.16,INK.gold);k.key(ell(w/2,h*.4,w*.16,w*.16),.01);k.text('DANISH',w/2,h*.8,h*.12,INK.gold,{weight:900,max:w*.8});k.text('2008',w/2,h*.94,h*.1,INK.white,{weight:900,max:w*.8});},{rim:.016});
const goalS=(key:string,w:number,h:number)=>S.goal(K+key,w,h);
const bag=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=`M0 ${h*.3} Q0 ${h*.18} ${w*.12} ${h*.18} L${w*.88} ${h*.18} Q${w} ${h*.18} ${w} ${h*.3} L${w} ${h} L0 ${h} Z`;k.fill(b,'#3b3550');k.dots(b,INK.navy,.035,.3);k.key(b,.013);
 k.fill(rect(w*.4,h*.5,w*.2,h*.22),INK.white);k.fill(rect(w*.47,h*.52,w*.06,h*.18),INK.blue);k.fill(rect(w*.42,h*.585,w*.16,h*.05),INK.blue);k.key(`M${w*.3} ${h*.18} Q${w*.3} 0 ${w*.5} 0 Q${w*.7} 0 ${w*.7} ${h*.18}`,.03);},{rim:.016});
const bagLid=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#4a4363');k.key(b,.012);k.circle(w/2,h*.5,.025,INK.gold);},{rim:.012});
const stethoscope=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.key(`M${w*.2} 0 Q${w*.1} ${h*.6} ${w*.5} ${h*.62} Q${w*.9} ${h*.6} ${w*.8} 0`,.03,INK.navy);k.key(`M${w*.5} ${h*.62} L${w*.5} ${h*.8}`,.03,INK.navy);k.fill(ell(w*.5,h*.88,w*.12,w*.12),INK.grey);k.key(ell(w*.5,h*.88,w*.12,w*.12),.01);},{rim:.014});
const books=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const cs=[INK.blue,INK.red,INK.green,INK.yellow];for(let i=0;i<4;i++){const y=h-(i+1)*h/4,b=rect(w*(.04+(i%2)*.06),y,w*.86,h/4-.01);k.fill(b,cs[i]);k.key(b,.01);k.fill(rect(w*.1+(i%2)*w*.06,y+h*.08,w*.5,h*.06),INK.white,.8);}
 k.text('MEDICINE',w*.47,h-.28*h+h*.05,h*.1,INK.white,{weight:900,max:w*.6});},{rim:.016});
const gradCap=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.fill(poly([[0,h*.35],[w*.5,0],[w,h*.35],[w*.5,h*.7]]),INK.navy);k.fill(rect(w*.26,h*.45,w*.48,h*.4),INK.navy);k.key(`M${w*.8} ${h*.4} L${w*.82} ${h*.95}`,.02,INK.gold);k.circle(w*.82,h*.95,.03,INK.gold);},{rim:.016});
const girlsRow=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const n=5;for(let i=0;i<n;i++){const x=w*(i+.5)/n,s=h*(.8+(i%2)*.15),c=[INK.pink,INK.yellow,INK.sky,INK.orange,INK.teal][i];const sk=['#f1b88f','#7f5138','#d99a6c','#b27650','#f1b88f'][i];
 k.fill(ell(x,h-s*.84,s*.12,s*.12),sk);k.keyFill(`M${x-s*.13} ${h-s*.86} Q${x} ${h-s*1.02} ${x+s*.13} ${h-s*.86} L${x+s*.15} ${h-s*.62} L${x+s*.1} ${h-s*.62} L${x+s*.1} ${h-s*.82} L${x-s*.1} ${h-s*.82} L${x-s*.1} ${h-s*.62} L${x-s*.15} ${h-s*.62} Z`,'#2a1d18');
 k.fill(poly([[x-s*.16,h-s*.68],[x+s*.16,h-s*.68],[x+s*.2,h-s*.2],[x-s*.2,h-s*.2]]),c);k.key(poly([[x-s*.16,h-s*.68],[x+s*.16,h-s*.68],[x+s*.2,h-s*.2],[x-s*.2,h-s*.2]]),.008);k.fill(rect(x-s*.12,h-s*.2,s*.08,s*.2),sk);k.fill(rect(x+s*.04,h-s*.2,s*.08,s*.2),sk);}},{rim:.014});

/* ───────────── shared mechanics ───────────── */
function ballPair(B:Builder,key:string,r=.1){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),Rt=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[Rt,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}

/* ───────────── 1 · A girl from Herat (herat) ───────────── */
const herat:SpreadDef={id:'herat',rest:25.8,
 left:k=>{sand(k,-5,0,'#e6cfa4');footprints(k,-4.4,Z(1.6),-.3,Z(1.2),14,INK.brown);
  k.text('HERAT',-2.5,Z(2.62),.5,INK.teal,{max:4});k.text('AFGHANISTAN · BORN 1988',-2.5,Z(2.9),.16,INK.navy,{weight:800,max:4.2});},
 right:k=>{sand(k,0,5,'#dcc39a');footprints(k,.3,Z(1.2),4.6,Z(.9),14,INK.brown);
  k.text('LEAVING TO STAY SAFE',2.5,Z(2.62),.36,INK.red,{max:4.3});k.text('NADIA, HER MOTHER AND HER FOUR SISTERS',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold({key:K+'h-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);peaks(k,4.5,1.5,'#b9a48a',true,2);domeCity(k,4.5,2.45);k.fill(rect(0,2.45,4.5,.55),'#e6cfa4');}},
   {key:K+'h-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#f3c9a0',INK.orange,y=>.5-y/3*.4);peaks(k,4.5,1.7,'#a88f76',false,5);const r=`M1.6 3 L2.1 1.9 L2.4 1.9 L2.9 3 Z`;k.fill(r,'#8f8373');k.fill(rect(0,2.45,4.5,.55),'#dcc39a');k.fill(r,'#8f8373');}},-3.05,1.22);
  const sunL=bd.add(S.sun(K+'h-sun',.3),'L',3.9,1.1,{out:.012});
  const clouds=[bd.add(stormCloud('h-st1',1.3,.62),'L',1.3,1.5,{out:.03}),bd.add(stormCloud('h-st2',1.1,.54),'L',3.2,1.75,{out:.035})];
  const birds=bd.add(S.birds(K+'h-birds',.9,.35),'R',3.2,1.4,{out:.02});
  // Left page: Herat, a young Nadia and the framed portrait.
  const home=B.stand(S.house(K+'h-house',1.5,1.35),-3.7,-1.2,{layer:1});
  const door=home.flap(S.door(K+'h-door',.3,.46),-.12,0,{anchor:'bl',axis:'y',z:.018});
  const trees=[B.stand(S.tree(K+'h-tree0',.6,1.3,'cypress'),-4.6,.1,{layer:2}),B.stand(S.bush(K+'h-bush',.9,.35),-3.3,1.0,{layer:3})];void trees;
  const born=B.stand(S.flipCard(K+'h-1988',.9,.34,'1988',INK.pink),-1.9,-1.35,{layer:1,s:0});
  const N=B.person(K+'h-n',-2.6,.2,.82,{shirt:'fan',...NADIA,face:'smile',layer:2});
  const frame=B.stand(portrait('h-father',.7,.9),-.75,-.35,{layer:2,s:0});
  const general=B.stand(S.flipCard(K+'h-gen',1.3,.3,'AN ARMY GENERAL',INK.white,INK.navy),-1.3,.55,{layer:2,s:0});
  const hearts=[0,1].map(i=>B.stand(heart(`h-h${i}`,.26),-.9+i*.5,1.3,{layer:3,s:0,tab:false}));
  // Right page: Hamida, four sisters and the suitcase.
  const mum=B.person(K+'h-mum',1.3,-.3,1.55,{shirt:'coach',hair:'long',...FAMILY,adult:true,face:'smile',layer:2});
  const N2=B.person(K+'h-n2',2.2,.15,.85,{shirt:'fan',...NADIA,face:'shy',layer:2});
  const sis=[[3.0,-.3,1.1,'bun'],[3.8,.05,1.0,'long'],[4.5,-.45,.95,'bun'],[4.3,.75,.75,'long']].map(([x,z,h,hr],i)=>B.person(K+`h-s${i}`,x as number,z as number,h as number,{shirt:(['bib','casual','fan','bib'] as const)[i],hair:hr as 'long',...FAMILY,face:'smile',layer:2}));
  const four=B.stand(S.flipCard(K+'h-four',1.2,.3,'FOUR SISTERS',INK.yellow,INK.navy),3.9,1.45,{layer:3,s:0});
  const safe=B.stand(lineCard('h-safe',1.4,.46,['TO STAY SAFE'],INK.white),1.2,.95,{layer:3,s:0});
  const cas=B.stand(suitcaseBody('h-case',.7,.44),2.3,1.7,{layer:3,s:0,tab:false});
  const lid=cas.flap(suitcaseLid('h-lid',.7,.08),0,.44,{anchor:'bottom',z:.02});
  const items=[cas.add(scarf('h-scarf',.3,.22),-.17,.44,{z:-.006}),cas.add(miniPhoto('h-photo',.22,.2),.02,.44,{z:-.008}),cas.add(S.ball(K+'h-ball',.09),.2,.44,{z:-.01})];
  const arrow=B.stand(S.arrow(K+'h-arrow',1.2,.42),3.9,-1.05,{layer:1,s:0});
  const long=B.stand(lineCard('h-long',1.6,.44,['A VERY LONG JOURNEY'],INK.yellow),1.25,.95,{layer:1,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,25.8):b.t;
   // Born in 1988 in Herat.
   born.s=beat(t,2.8,3.6);N.body.s=beat(t,4.2,5);sunL.dy=.3*beat(t,2,4)+.8*beat(t,8,10);
   // War: grey clouds cover the sun, the door closes.
   const st=beat(t,8,9.4)*(1-beat(t,28,31));clouds.forEach((c,i)=>{c.scale=st;c.visible=st>.02;c.dx=.12*wave(t,9.4,27,.3+i*.1);});door.flip=-1.1*(1-beat(t,8.4,9.6));N.body.yaw=-.3*pulse(t,8.6,15);
   // Her father, an army general: a portrait, remembered with love.
   frame.s=beat(t,11.6,12.4);general.s=beat(t,12.6,13.4);hearts.forEach((h,i)=>{h.s=beat(t,14.4+i*.4,15.1+i*.4);h.dy=.05*wave(t,15,38,.5+i*.2);});
   // Hamida decided the family had to leave to stay safe.
   mum.body.s=beat(t,15.9,16.7);N2.body.s=beat(t,16.6,17.4);N.body.s*=1-beat(t,16.4,17.2);safe.s=beat(t,18.6,19.4)*(1-beat(t,27.4,28));mum.armR.rot=.12+1.2*beat(t,17.2,17.8);
   sis.forEach((p,i)=>{p.body.s=beat(t,21+i*.4,21.8+i*.4);});four.s=beat(t,22.6,23.4)*(1-beat(t,31,31.6));cas.s=beat(t,23.8,24.6);
   // Pack the suitcase: lid opens, the scarf, photo and ball drop in, and the lid shuts.
   const pk=Math.max(beat(t,25.9,27.9),manual?act:0);
   lid.flip=-2.4*(beat(t,23.8,24.6)*(1-beat(pk,.75,.95)));
   items.forEach((q,i)=>{const d=beat(pk,.1+i*.2,.3+i*.2);q.dy=.5*(1-d)+.02;showPart(q,beat(t,24.2,24.8)*(1-beat(pk,.3+i*.2,.35+i*.2)));});
   // A very long journey: the arrow points down the road and everyone turns to go.
   arrow.s=Math.max(beat(t,28,28.8),manual?beat(act,.85,1):0);long.s=beat(t,28.8,29.6);birds.dx=.8*beat(t,28,38);
   const go=beat(t,29.6,31);[mum,N2,...sis].forEach(p=>{p.body.yaw=.35*go;});N2.armR.rot=.12+.9*go;mum.armL.rot=-.12-.9*go;
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,15.4,16.2)+.45*beat(t,16.2,17)-.45*beat(t,31,32):0;
  };
 }};

/* ───────────── 2 · The long journey (journey) ───────────── */
const journey:SpreadDef={id:'journey',rest:19.3,
 left:k=>{const p=rect(-5,0,5,PAGE_D);k.fill(p,'#eadcb8');k.dots(p,INK.orange,.07,.14);road(k,-5,0,Z(.95),.9);
  dotted(k,[[-4.5,Z(-.6)],[-3.4,Z(-.2)],[-2.2,Z(-.7)],[-1.1,Z(-.3)],[-.2,Z(-.5)]],INK.red,.03);
  k.text('THE LONG JOURNEY',-2.5,Z(2.62),.38,INK.navy,{max:4.3});k.text('PAKISTAN · ITALY · A TRUCK HEADING NORTH',-2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.4});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#dfe7d8');k.dots(p,INK.green,.07,.14);road(k,0,5,Z(.95),.9);
  k.text('DENMARK',2.5,Z(2.62),.46,INK.red,{max:4});k.text('TAKEN IN AS REFUGEES · 2000',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'j-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#f3c9a0',INK.orange,y=>.45-y/3*.35);peaks(k,4.5,1.8,'#b09880',true,1);k.fill(rect(0,2.45,4.5,.55),'#eadcb8');}},
   {key:K+'j-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);rowHouses(k,4.5,2.45);k.fill(rect(0,2.45,4.5,.55),'#dfe7d8');}},-3.05,1.22);
  const moon=bd.add(S.sun(K+'j-moon',.24,INK.white),'R',3.9,1.1,{out:.012});
  const flags=bd.add(S.bunting(K+'j-bunt',2.6,.4,[INK.red,INK.white,INK.red,INK.white]),'R',1.0,2.0,{out:.03});
  const plane=bd.add(plane_('j-plane'),'L',.4,1.3,{out:.04});
  // Map pins along the dotted route.
  const pins=[['AFGHANISTAN',-4.3,-.95],['PAKISTAN',-2.6,-1.05],['ITALY',-.9,-1.15]].map(([l,x,z],i)=>B.stand(S.flipCard(K+`j-pin${i}`,l==='AFGHANISTAN'?1.25:1.0,.3,l as string,[INK.teal,INK.green,INK.blue][i],INK.white),x as number,z as number,{layer:1,s:0}));
  const uk=bd.add(bubble('j-uk',1.3,.62,'UNITED KINGDOM?',INK.white),'L',1.6,1.5,{out:.035});
  // The truck drives along a printed slot across both pages.
  B.slot(-4.4,1.4,-.35,1.4);B.slot(.35,1.4,4.4,1.4);
  const truckL=B.stand(truck('j-truckL',1.6,.9),-3.3,1.4,{layer:3,tab:false}),truckR=B.stand(truck('j-truckR',1.6,.9),1.3,1.4,{layer:3,tab:false});
  const doorR=truckR.flap(truckDoor('j-door',.5,.66),-.8+.02,.08,{anchor:'bl',axis:'y',z:.018});
  const moonDark=B.stand(lineCard('j-dark',1.5,.44,['A LONG, DARK RIDE'],INK.navy,INK.yellow),-1.5,.25,{layer:3,s:0});
  // Right page: Denmark, the family, a new language.
  const sign=B.stand(S.sign(K+'j-sign',1.3,1.1,'DENMARK',INK.white),4.2,-1.05,{layer:1,s:0});
  const flg=bd.add(flag('j-flag',.6,.8),'R',2.3,1.95,{out:.03});
  const fam=[B.person(K+'j-mum',3.0,.05,1.5,{shirt:'coach',hair:'long',...FAMILY,adult:true,face:'smile',layer:2}),B.person(K+'j-n',3.8,.3,.85,{shirt:'fan',...NADIA,face:'open',layer:2})];
  const sis=[[4.5,-.1],[2.5,.25]].map(([x,z],i)=>B.person(K+`j-s${i}`,x,z,.95,{shirt:i?'bib':'casual',hair:i?'bun':'long',...FAMILY,face:'smile',layer:2}));
  const eleven=B.stand(S.flipCard(K+'j-11',1.0,.3,'ABOUT 11',INK.pink),2.85,1.95,{layer:3,s:0});
  const words=[['HEJ?',INK.yellow],['TAK?',INK.sky2]].map(([w,c],i)=>B.stand(bubble(`j-w${i}`,.62,.46,w,c),3.1+i*.9,.95,{layer:3,s:0,tab:false}));
  const welcome=B.stand(lineCard('j-ref',1.6,.5,['TAKEN IN','AS REFUGEES'],INK.white),4.15,1.95,{layer:3,s:0});
  const hearts=[0,1].map(i=>B.stand(heart(`j-h${i}`,.26),.8+i*.7,-1.3,{layer:2,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.3):b.t;
   pins[0].s=beat(t,1.4,2.2);pins[1].s=beat(t,2.6,3.4);
   // From there they flew to Italy: the plane crosses the backdrop.
   const fl=beat(t,5,7.6);plane.dx=-3.2*fl;plane.dy=.4*Math.sin(fl*Math.PI);plane.visible=fl>0&&fl<.99;pins[2].s=beat(t,6.4,7.2);
   // Hid in the back of a truck for a long, dark ride north.
   truckL.s=beat(t,7.6,8.4);moonDark.s=beat(t,9.4,10.2)*(1-beat(t,19.4,20));
   // They hoped to reach the United Kingdom.
   showPart(uk,beat(t,12.2,13)*(1-beat(t,16.4,17.2)));uk.dy=.04*wave(t,13,16.4,.6);
   // But the truck took them to Denmark instead!
   sign.s=beat(t,16.4,17.2);showPart(flg,beat(t,17,17.8));moon.dy=.3*beat(t,16,20);
   // Drive the truck along the road: left cut-out drives to the gutter, the right one carries on.
   const dr=Math.max(beat(t,19.4,21.6),manual?beat(act,0,.8):0);
   truckL.x=-3.3+2.3*clamp01(dr*2);truckL.s*=1-beat(dr,.45,.52);truckR.s=beat(dr,.5,.58);truckR.x=.8+.5*clamp01(dr*2-1);truckL.dy=truckR.dy=.02*Math.abs(Math.sin(dr*20));
   doorR.flip=-1.4*Math.max(beat(t,21.6,22.6),manual?beat(act,.85,1):0);
   // Nadia, about eleven, in a new country with a new language.
   fam.forEach((p,i)=>{p.body.s=Math.max(beat(t,22+i*.4,22.8+i*.4),manual?beat(act,.9,1):0);});sis.forEach((p,i)=>{p.body.s=beat(t,22.6+i*.4,23.4+i*.4);});
   eleven.s=beat(t,23.4,24.2);words.forEach((w,i)=>{w.s=beat(t,24.4+i*.6,25+i*.6)*(1-beat(t,30.4,31));w.dy=.04*wave(t,25,30,.6+i*.2);});fam[1].body.yaw=-.3*pulse(t,24,27);
   // Denmark took the family in as refugees.
   welcome.s=beat(t,27,27.8);hearts.forEach((h,i)=>{h.s=beat(t,28+i*.4,28.7+i*.4);});flags.scale=beat(t,27.4,28.6);flags.visible=flags.scale>.02;
   cheer(fam[1],beat(t,31,31.6));fam[0].armR.rot=.12+1.3*beat(t,28.4,29);sis.forEach((p,i)=>cheer(p,beat(t,31.4+i*.3,32+i*.3)));
   return b.narrated?-.45*beat(t,1.2,2.2)+.45*beat(t,16,17)+.45*beat(t,21.6,22.4)-.45*beat(t,30,31):0;
  };
 }};
function plane_(key:string){return plane(key,.9,.4);}

/* ───────────── 3 · The pitch next door (nextdoor) ───────────── */
const nextdoor:SpreadDef={id:'nextdoor',rest:20.1,
 left:k=>{asphalt(k,-5,0,'#b3aca3');for(let i=0;i<5;i++)box(k,-4.6+i*.9,Z(1.3),.5,.5,.025,'#e8e1d0');
  k.text('AALBORG',-2.5,Z(2.62),.46,INK.navy,{max:4});k.text('A REFUGEE CENTRE · 2000',-2.5,Z(2.9),.16,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);box(k,1.4,Z(-2.1),2.2,.9,.05);ring(k,.0,Z(.3),.9,.05);
  k.text('THE PITCH NEXT DOOR',2.5,Z(2.62),.34,INK.navy,{max:4.3});k.text('A FOOTBALL CLUB · GIRLS PLAYING',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'n-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#cfd9e2',INK.sky,y=>.55-y/3*.5);rowHouses(k,4.5,2.3);k.fill(rect(0,2.3,4.5,.7),'#b3aca3');}},
   {key:K+'n-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);k.fill(rect(0,1.9,4.5,.6),'#6fae5c');crowd(k,4.5,1.6,2.3,[INK.red,INK.white,INK.yellow],2);k.fill(rect(0,2.3,4.5,.7),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'n-sun',.3),'R',3.9,1.1,{out:.012}),cloud=bd.add(S.cloud(K+'n-cloud',1.0,.45),'L',1.8,1.2,{out:.02});
  const home=B.stand(centre('n-centre',2.1,1.2),-3.2,-1.2,{layer:1});
  const tree=B.stand(S.tree(K+'n-tree',.9,1.2,'round'),-4.6,-.4,{layer:1});void tree;
  const moved=B.stand(S.flipCard(K+'n-moved',1.5,.3,'NEAR AALBORG',INK.blue),-1.3,-1.45,{layer:1,s:0});
  const fence=B.stand(S.fenceStrip(K+'n-fence',1.3,.55,INK.white),-.9,.1,{layer:2});
  const N=B.person(K+'n-n',-2.2,.35,.9,{shirt:'fan',...NADIA,legs:'kick',face:'open',layer:2});
  const nball=B.stand(S.ball(K+'n-nball',.1),-1.8,.6,{layer:3,tab:false,s:0});
  const counts=['1','2','3'].map((n,i)=>B.stand(counter(`n-c${i}`,.34,n),-4.3+i*.6,1.5,{layer:3,s:0,tab:false}));
  const training=B.stand(lineCard('n-train',1.5,.44,['TRAINING EVERY DAY'],INK.yellow),-3.3,.5,{layer:2,s:0});
  const want=B.stand(bubble('n-want',.9,.56,'ME TOO!',INK.white),-2.8,1.0,{layer:3,s:0,tab:false});
  // Right page: the club next door and its girls' team.
  const goal=B.stand(goalS('n-goal',1.6,.8),2.5,-1.55,{layer:1});void goal;
  const club=B.stand(S.sign(K+'n-club',1.3,1.1,'FOOTBALL CLUB',INK.yellow),4.3,-.7,{layer:1,s:0});
  const girls=[[1.4,-.3,'bun','#f1b88f'],[2.9,-.3,'long','#b27650'],[3.6,.4,'bun','#7f5138']].map(([x,z,hr,sk],i)=>B.person(K+`n-g${i}`,x as number,z as number,1.0,{shirt:'casual',hair:hr as 'bun',skin:sk as string,hairColor:'#3b2e3f',legs:i===1?'kick':'run',face:'grin',layer:2}));
  const N2=B.person(K+'n-n2',1.2,1.1,1.0,{shirt:'casual',...NADIA,face:'grin',layer:3});
  const twelve=B.stand(lineCard('n-12',1.5,.5,['AGE 12','A LOCAL CLUB'],INK.white),2.6,1.75,{layer:3,s:0});
  const begun=B.stand(S.flipCard(K+'n-begun',1.2,.3,'IT BEGINS!',INK.pink),4.1,1.5,{layer:3,s:0});
  const ball=ballPair(B,'n-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.1):b.t;
   cloud.dx=.5*beat(t,0,37);moved.s=beat(t,4,4.8);N.body.s=beat(t,5,5.8);
   // A football club right next door: girls playing.
   club.s=beat(t,7.2,8);girls.forEach((g,i)=>{g.body.s=beat(t,8.4+i*.5,9.2+i*.5);});
   const [bx,bz]=t<9.6?[2.4,.2]:[1.6+1.6*(.5+.5*Math.sin(t*.9)),-.1+.4*Math.cos(t*1.1)];ball(bx,bz,.04*Math.abs(Math.sin(t*3)),t>9.6);
   girls[1].leg!.rot=-1*maxOf([11,13.5,17].map(a=>pulse(t,a-.3,a+.3)));
   N.body.yaw=.35*pulse(t,9,14);
   // She wanted to play too.
   want.s=beat(t,13.3,14)*(1-beat(t,16,16.6));
   // She kicked a ball every day and got training at the centre.
   nball.s=beat(t,15.4,16.2);training.s=beat(t,17.2,18);
   // Tap the ball three times: one keepy-up per step, a counter pops for each.
   const n=manual?act*3:0;const taps=[0,1,2].map(i=>Math.max(clamp01(n-i),beat(t,20.3+i*.65,20.8+i*.65)));
   const hop=maxOf([0,1,2].map(i=>pulse(manual?n:t,manual?i:20.3+i*.65,manual?i+1:20.95+i*.65)));nball.dy=.5*hop;nball.rot=2*t;N.leg!.rot=-.9*hop;
   counts.forEach((c,i)=>{c.s=taps[i];});
   // At twelve she joined a small local club in Aalborg.
   N2.body.s=Math.max(beat(t,22.6,23.4),manual?beat(act,.95,1):0);twelve.s=beat(t,23.8,24.6);
   // Her football story in Denmark had begun.
   begun.s=beat(t,26.6,27.4);cheer(N2,beat(t,27,27.6));girls.forEach((g,i)=>{if(i!==1)cheer(g,beat(t,27.4+i*.3,28+i*.3));});cheer(N,beat(t,28,28.6));
   sun.dy=.4*beat(t,20,26);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,7,8)-.45*beat(t,13,14)+.45*beat(t,22.4,23.2)-.0*beat(t,30,31):0;
  };
 }};

/* ───────────── 4 · Waiting to play for Denmark (wait) ───────────── */
const wait:SpreadDef={id:'wait',rest:24.2,
 left:k=>{paperDesk(k,-5,0);
  k.text('DANISH CITIZEN · 2008',-2.5,Z(2.62),.34,INK.red,{max:4.3});k.text('A FIFA RULE SAID: WAIT',-2.5,Z(2.9),.16,INK.navy,{weight:800,max:4.2});},
 right:k=>{pitch(k,0,5);line(k,0,Z(-2.1),5,Z(-2.1),.05);box(k,1.4,Z(-2.1),2.2,.9,.05);
  k.text('FIRST GAME · 2009',2.5,Z(2.62),.38,INK.red,{max:4.3});k.text('THE ALGARVE CUP',2.5,Z(2.9),.16,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'w-bdL',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#f6ead0');k.dots(p,INK.orange,.05,.12);for(let i=0;i<2;i++){const w=rect(.5+i*2.5,.45,1.0,1.0);k.fill(w,INK.sky2);k.key(w,.012);}danishFlag(k,1.9,.5,.8,.55);k.fill(rect(0,2.2,4.5,.8),'#dcc7a0');}},
   {key:K+'w-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.3,2.45,[INK.red,INK.white,INK.red,INK.yellow],2);lightRig(k,1.0,.4);lightRig(k,3.6,.35);k.fill(rect(0,2.45,4.5,.55),INK.grass);}},-3.05,1.22);
  const fw=[bd.add(S.firework(K+'w-fw1',.34,INK.red),'R',1.3,.9,{out:.03}),bd.add(S.firework(K+'w-fw2',.3,INK.white),'R',3.3,.8,{out:.03})];
  const pass=B.stand(passport('w-pass',.62,.8),-4.1,-.95,{layer:1,s:0});
  const N=B.person(K+'w-n',-3.0,.3,1.4,{shirt:'fan',...NADIA,adult:true,face:'smile',layer:2});
  const desk=B.stand(S.bench(K+'w-desk',1.1,.45),-4.0,.35,{layer:2});void desk;
  const clock=B.stand(clockFace('w-clock',.42),-1.5,-1.2,{layer:1,s:0});const hand=clock.arm(clockHand('w-hand',.08,.32),0,.42);
  const waitS=B.stand(stamp('w-wait',.9,.32,'WAIT'),-1.5,-.3,{layer:2,s:0});
  const ask=B.stand(lineCard('w-ask',1.6,.54,['PLEASE LOOK AGAIN','AT HER CASE'],INK.white),-2.3,1.25,{layer:3,s:0});
  const exc=B.stand(S.flipCard(K+'w-exc',1.3,.32,'AN EXCEPTION!',INK.yellow,INK.navy),-.9,.7,{layer:3,s:0});
  // Right page: the Algarve Cup, the team sheet and the stamp.
  const sheet=B.stand(teamSheet('w-sheet',.8,1.05),1.1,-.9,{layer:1,s:0});const mark=sheet.add(stampMark('w-mark',.56,.34),.04,.12,{anchor:'bottom',z:.02});
  const press=B.stand(stamper('w-stamper',.34,.46),1.9,-.4,{layer:2,s:0});
  const N2=B.person(K+'w-n2',2.9,.2,1.35,{shirt:'casual',...NADIA,adult:true,legs:'kick',face:'grin',layer:2});
  const flg=B.stand(flag('w-flag',.55,.75),4.5,-.9,{layer:1,s:0});
  const first=B.stand(lineCard('w-first',1.9,.56,['FIRST NATURALISED DANE','IN A DENMARK SENIOR TEAM'],INK.gold),3.3,1.75,{layer:3,s:0});
  const hundred=B.stand(S.flipCard(K+'w-100',1.4,.34,'100+ GAMES',INK.red),1.2,1.75,{layer:3,s:0});
  const mates=[[3.7,.95,'#f1b88f','bun'],[1.7,.8,'#e3b48f','short']].map(([x,z,sk,hr],i)=>B.person(K+`w-m${i}`,x as number,z as number,1.3,{shirt:'casual',hair:hr as 'bun',skin:sk as string,hairColor:'#8a6a3a',adult:true,face:'grin',layer:2}));
  const ball=B.stand(S.ball(K+'w-ball',.1),2.1,1.15,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,24.2):b.t;
   N.body.s=beat(t,2.4,3.2);pass.s=beat(t,3.4,4.2);
   // A FIFA rule said wait: the clock ticks round.
   clock.s=beat(t,6.4,7.2);waitS.s=beat(t,7.6,8.3)*(1-beat(t,17.4,18));hand.rot=-Math.PI*2*beat(t,7.2,17.4);N.body.yaw=-.3*pulse(t,8,12);
   // The Danish football association asked FIFA to look again.
   ask.s=beat(t,12.2,13)*(1-beat(t,26.6,27.2));
   // An exception, and the first game in 2009 at the Algarve Cup.
   exc.s=beat(t,17.2,18);cheer(N,beat(t,18,18.6)*(1-beat(t,21,21.6)));sheet.s=beat(t,19.4,20.2);N2.body.s=beat(t,20.4,21.2);flg.s=beat(t,21.6,22.4);press.s=beat(t,22.6,23.4);
   // Stamp the team sheet.
   const st=Math.max(beat(t,24.3,25.8),manual?beat(act,0,.8):0);press.dy=.32*(1-pulse(st,.2,.9))*st-.02;if(!manual)press.s*=1-beat(t,28,28.6);press.dx=-.72*beat(st,0,.35)*(1-beat(st,.85,1));mark.visible=st>.55;mark.s=beat(st,.5,.7);
   cheer(N2,Math.max(beat(t,26,26.6)*(1-beat(t,28.4,29)),manual?beat(act,.85,1):0));
   // First naturalised Dane; more than one hundred games.
   first.s=beat(t,26.8,27.6);mates.forEach((m,i)=>{m.body.s=beat(t,28.6+i*.4,29.4+i*.4);});ball.s=beat(t,30,30.6);ball.x=2.1+.3*pulse(t,30.6,32);N2.leg!.rot=-1*pulse(t,30.4,31);
   hundred.s=beat(t,32.4,33.2);fw.forEach((f,i)=>{const a=beat(t,33+i*.5,34+i*.5);f.scale=a;f.rot=t*.2;f.visible=a>.02;});
   mates.forEach((m,i)=>cheer(m,beat(t,34+i*.3,34.6+i*.3)));cheer(N2,beat(t,34.4,35));
   return b.narrated?-.45*beat(t,1.8,2.8)+.45*beat(t,18.8,19.6)+.45*beat(t,19.6,20.4)-.45*beat(t,36,37):0;
  };
 }};

/* ───────────── 5 · The penalty in the final (final) ───────────── */
const final:SpreadDef={id:'final',rest:22.8,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);line(k,-5,Z(-2.0),0,Z(-2.0),.05);box(k,-3.9,Z(-2.0),2.5,1.0,.05);
  k.text('EURO 2017',-2.5,Z(2.62),.46,INK.yellow,{max:4});k.text('QUARTER-FINAL · DENMARK 2–1 GERMANY',-2.5,Z(2.9),.14,INK.white,{weight:800,max:4.3});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy);line(k,0,Z(-2.0),5,Z(-2.0),.05);box(k,1.3,Z(-2.0),2.5,1.0,.05);k.circle(2.55,Z(-.6),.06,INK.white);
  k.text('THE FINAL',2.5,Z(2.62),.46,INK.yellow,{max:4});k.text('A PENALTY FOR DENMARK · LOST 4–2',2.5,Z(2.9),.14,INK.white,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.red,INK.white,INK.red,INK.yellow],1);lightRig(k,1.2,.3);lightRig(k,3.4,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.orange,INK.red,INK.white,INK.orange],4);lightRig(k,1.1,.35);lightRig(k,3.5,.3);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const fw=[bd.add(S.firework(K+'f-fw1',.36,INK.red),'L',1.2,.9,{out:.03}),bd.add(S.firework(K+'f-fw2',.34,INK.white),'R',1.3,.8,{out:.03})];
  const trophy=bd.add(S.bunting(K+'f-bunt',2.4,.4,[INK.red,INK.white,INK.red,INK.white]),'R',1.2,2.1,{out:.03});
  // Left page: the quarter-final equaliser against Germany.
  const goalL=B.stand(goalS('f-goalL',1.6,.8),-2.65,-1.45,{layer:1});void goalL;
  const keeperL=B.person(K+'f-kL',-2.65,-1.2,1.2,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const N=B.person(K+'f-n',-2.0,.5,1.3,{shirt:'casual',...NADIA,adult:true,legs:'kick',face:'grin',layer:2});
  const eq=B.stand(S.flipCard(K+'f-eq',1.3,.3,'EQUALISER!',INK.yellow,INK.navy),-.85,.6,{layer:2,s:0});
  const board=B.stand(S.scoreboard(K+'f-board',1.2,1.0,'DENMARK · GERMANY'),-.8,-1.1,{layer:1,s:0});
  const s11=board.add(lineCard('f-11',.95,.4,['1–1'],INK.white),0,.3,{z:.012}),s21=board.add(lineCard('f-21',.95,.4,['2–1'],INK.yellow),0,.3,{z:.018});
  const matesL=[[-4.3,1.3,'#f1b88f','bun'],[-3.3,1.85,'#e3b48f','short']].map(([x,z,sk,hr],i)=>B.person(K+`f-m${i}`,x as number,z as number,1.2,{shirt:'casual',hair:hr as 'bun',skin:sk as string,hairColor:'#8a6a3a',adult:true,face:'grin',layer:3}));
  const flgL=bd.add(flag('f-flag',.5,.7),'L',2.3,1.95,{out:.03});
  // Right page: the penalty in the final.
  const goalR=B.stand(goalS('f-goalR',1.7,.85),2.55,-1.6,{layer:1});void goalR;
  const keeperR=B.person(K+'f-kR',2.55,-1.3,1.25,{shirt:'keeper',hair:'bun',skin:'#f1b88f',hairColor:'#c9a25a',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const N2=B.person(K+'f-n2',1.9,.55,1.3,{shirt:'casual',...NADIA,adult:true,legs:'kick',face:'smile',layer:2});
  const pen=B.stand(S.flipCard(K+'f-pen',1.1,.3,'PENALTY',INK.pink),4.1,-.3,{layer:2,s:0});
  const boom=B.stand(pow('f-pow',.28),3.6,-1.0,{layer:2,s:0,tab:false});
  const goalCard=B.stand(lineCard('f-goal',1.3,.46,['GOAL!'],INK.yellow),4.1,.55,{layer:2,s:0});
  const lost=B.stand(lineCard('f-lost',1.5,.5,['FINAL: LOST 4–2'],INK.white),.9,1.6,{layer:3,s:0});
  const together=B.stand(S.flipCard(K+'f-tog',1.4,.32,'TOGETHER',INK.red),3.2,1.85,{layer:3,s:0});
  const matesR=[[4.4,1.3,'#f1b88f','bun'],[2.4,1.3,'#e3b48f','short']].map(([x,z,sk,hr],i)=>B.person(K+`f-r${i}`,x as number,z as number,1.2,{shirt:'casual',hair:hr as 'bun',skin:sk as string,hairColor:'#8a6a3a',adult:true,face:'grin',layer:3}));
  const ball=ballPair(B,'f-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,22.8):b.t;
   N.body.s=beat(t,2.4,3.2);matesL.forEach((m,i)=>{m.body.s=beat(t,3.4+i*.4,4.2+i*.4);});showPart(flgL,beat(t,5,5.8));showPart(trophy,beat(t,5,6.4));
   // The equaliser against Germany, and the 2–1 win.
   board.s=beat(t,8.8,9.6);eq.s=beat(t,11,11.8);
   let bx=-1.8,bz=.3,dy=0,vis=t>8.8&&t<11;
   if(t>=10&&t<10.8){const u=(t-10)/.8;bx=-1.8-.6*u;bz=.3-1.6*u;dy=.2*Math.sin(u*Math.PI);}
   N.leg!.rot=-1*pulse(t,9.6,10.3);keeperL.body.rot=.7*pulse(t,10.2,11.6);showPart(s11,beat(t,10.8,11.4));showPart(s21,beat(t,13.6,14.2));
   cheer(N,beat(t,11,11.6)*(1-beat(t,15,15.6)));matesL.forEach((m,i)=>cheer(m,beat(t,13.8+i*.3,14.4+i*.3)*(1-beat(t,16,16.6))));
   // The final: a penalty for Denmark.
   N2.body.s=beat(t,15.8,16.6);pen.s=beat(t,17.6,18.4);
   if(t>=15.8||manual){vis=true;const k2=Math.max(beat(t,22.9,23.7),manual?beat(act,0,.55):0);if(k2<=0){bx=2.3;bz=-.55;}else{bx=2.3+.7*k2;bz=-.55-.85*k2;dy=.3*Math.sin(k2*Math.PI);}}
   ball(bx,bz,dy,vis);N2.leg!.rot=-1.1*Math.max(pulse(t,22.6,23.3),manual?pulse(act,0,.3):0);keeperR.body.rot=-.8*Math.max(pulse(t,23,24.4),manual?pulse(act,.1,.7):0);
   N2.body.yaw=-.2*pulse(t,20.4,22.8);
   boom.s=Math.max(beat(t,23.6,23.9)*(1-beat(t,25.4,25.8)),manual?beat(act,.5,.65):0);goalCard.s=Math.max(beat(t,23.8,24.5),manual?beat(act,.55,.85):0);
   cheer(N2,Math.max(beat(t,23.8,24.4)*(1-beat(t,25,25.6)),manual?beat(act,.75,1):0));
   // Lost 4–2, but together, and brave from the spot.
   lost.s=beat(t,25,25.8);matesR.forEach((m,i)=>{m.body.s=beat(t,27+i*.4,27.8+i*.4);});together.s=beat(t,28.4,29.2);
   const hug=beat(t,29.2,30);matesR.forEach(m=>{m.armL.rot=-.12-1.2*hug;m.armR.rot=.12+1.2*hug;});N2.armL.rot=-.12-1.1*hug*(1-beat(t,31,31.6));
   fw.forEach((f,i)=>{const a=beat(t,30.4+i*.5,31.4+i*.5);f.scale=a;f.rot=t*.2;f.visible=a>.02;});cheer(N2,beat(t,31.6,32.2));
   return b.narrated?-.45*beat(t,1.8,2.8)+.45*beat(t,15.4,16.2)+.45*beat(t,16.2,17)-.45*beat(t,32,33):0;
  };
 }};

/* ───────────── 6 · Doctor Nadia (doctor) ───────────── */
const doctor:SpreadDef={id:'doctor',rest:18.2,
 left:k=>{paperDesk(k,-5,0,'#e9e2cf');
  k.text('AARHUS UNIVERSITY',-2.5,Z(2.62),.36,INK.navy,{max:4.3});k.text('MEDICINE AND FOOTBALL',-2.5,Z(2.9),.16,INK.navy,{weight:800,max:4.2});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#dbe9ee');k.dots(p,INK.sky,.06,.18);
  k.text('DOCTOR NADIA',2.5,Z(2.62),.44,INK.blue,{max:4.2});k.text('JANUARY 2022 · QUALIFIED AS A DOCTOR',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.4});},
 build:B=>{
  const bd=B.vfold({key:K+'d-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);rowHouses(k,4.5,2.3);k.fill(rect(0,2.3,4.5,.7),'#e9e2cf');}},
   {key:K+'d-bdR',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#f4f1e6');k.dots(p,INK.sky,.05,.12);for(let i=0;i<3;i++){const w=rect(.4+i*1.4,.4,1.0,.9);k.fill(w,INK.sky2);k.key(w,.012);}k.fill(rect(0,2.2,4.5,.8),'#dbe9ee');}},-3.05,1.22);
  const planeB=bd.add(plane('d-plane',.9,.4),'L',.4,1.3,{out:.04});const sun=bd.add(S.sun(K+'d-sun',.28),'L',3.9,1.0,{out:.012});
  // Left page: the footballer who studied.
  const N=B.person(K+'d-n',-2.7,.2,1.4,{shirt:'casual',...NADIA,adult:true,face:'smile',layer:2,holdR:'ball'});
  const lamp=B.stand(S.lamp(K+'d-lamp',.3,1.1),-4.5,.3,{layer:2});void lamp;
  const stack=B.stand(books('d-books',.9,.8),-1.2,-.5,{layer:2,s:0});
  const hat=B.stand(gradCap('d-cap',.5,.4),-4.1,-.7,{layer:1,s:0});
  const both=B.stand(lineCard('d-both',1.6,.52,['STUDYING DURING','THE FOOTBALL SEASON'],INK.white),-3.6,1.4,{layer:3,s:0});
  const far=B.stand(S.flipCard(K+'d-far',1.5,.3,'FAR FROM DENMARK',INK.blue),-1.3,1.7,{layer:3,s:0});
  // Right page: Doctor Nadia, the bag, languages and UNESCO.
  const doc=B.person(K+'d-doc',1.55,.1,1.45,{shirt:'ger',...NADIA,adult:true,face:'grin',layer:2});
  const bagS=B.stand(bag('d-bag',.8,.56),2.25,.95,{layer:3,s:0,tab:false});const lid=bagS.flap(bagLid('d-lid',.8,.08),0,.56,{anchor:'bottom',z:.02});
  const scope=bagS.add(stethoscope('d-scope',.36,.42),-.14,.3,{z:-.008}),hrt=bagS.add(heart('d-heart',.22),.2,.34,{z:-.01});
  const jan=B.stand(S.flipCard(K+'d-2022',1.3,.3,'JANUARY 2022',INK.pink),3.9,-.4,{layer:2,s:0});
  const langs=[['HEJ',INK.yellow],['HELLO',INK.white],['SALAAM',INK.sky2],['BONJOUR',INK.white]].map(([w,c],i)=>B.stand(bubble(`d-l${i}`,.78,.46,w,c),[.6,2.55,3.5,4.45][i],[-1.2,-1.35,-1.1,-.9][i],{layer:1,s:0,tab:false}));
  const unesco=B.stand(lineCard('d-unesco',1.9,.56,['UNESCO CHAMPION · 2019','GIRLS’ AND WOMEN’S EDUCATION'],INK.gold),3.9,1.55,{layer:3,s:0});
  const girls=B.stand(girlsRow('d-girls',1.6,.6),1.1,1.85,{layer:3,s:0});
  const same=B.stand(S.flipCard(K+'d-same',1.5,.3,'THE SAME CHANCES',INK.red),3.6,.55,{layer:2,s:0});
  const hearts=[0,1].map(i=>B.stand(heart(`d-h${i}`,.26),-4.4+i*3.4,1.95,{layer:3,s:0,tab:false}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.2):b.t;
   N.body.s=beat(t,2.2,3);stack.s=beat(t,5,5.8);hat.s=beat(t,6.2,7);N.armR.rot=.12+.6*wave(t,3,8,.6);
   // Studying during the season, even far from Denmark.
   both.s=beat(t,8.4,9.2);const fl=beat(t,10.4,13);planeB.dx=-3.2*fl;planeB.dy=.3*Math.sin(fl*Math.PI);planeB.visible=fl>0&&fl<.99;far.s=beat(t,11.4,12.2);
   // January 2022: qualified as a doctor.
   doc.body.s=beat(t,14,14.8);jan.s=beat(t,15.4,16.2);bagS.s=beat(t,16.6,17.4);cheer(N,beat(t,15.6,16.2)*(1-beat(t,18,18.6)));
   // Open the doctor's bag: the lid swings back and the tools rise.
   const op=Math.max(beat(t,18.3,19.6),manual?beat(act,0,.7):0);lid.flip=-2.5*op;
   showPart(scope,beat(op,.4,.8));scope.dy=.12*beat(op,.4,1);showPart(hrt,beat(op,.6,1));hrt.dy=.14*beat(op,.6,1);
   doc.armR.rot=.12+1.1*Math.max(beat(t,19.6,20.2),manual?beat(act,.7,1):0);
   // Many languages, and UNESCO's champion for girls' and women's education.
   langs.forEach((l,i)=>{l.s=beat(t,20.6+i*.6,21.2+i*.6);l.dy=.04*wave(t,21.2,38,.5+i*.15);});
   unesco.s=beat(t,24.2,25);girls.s=beat(t,25.4,26.2);
   // The same chances for all women.
   same.s=beat(t,28.2,29);cheer(doc,beat(t,29,29.6));hearts.forEach((h,i)=>{h.s=beat(t,29.6+i*.5,30.3+i*.5);});cheer(N,beat(t,32,32.6));
   sun.dy=.5*beat(t,0,3);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,13.4,14.2)+.45*beat(t,14.2,15)-.45*beat(t,31,32):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={herat,journey,nextdoor,wait,final,doctor};
void smooth;void back;
