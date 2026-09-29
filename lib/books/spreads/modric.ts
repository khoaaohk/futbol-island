/**
 * The six Modrić pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/modric/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown symbolically: a figure folds away, lights go out, clouds pass, a covered photo frame.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='modric-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
const LUKA={skin:'#f1b88f',hair:'long' as const,hairColor:'#c9a46a'};
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};

/* ───────────── page print helpers ───────────── */
const chalk=(k:Kit,d:string,w=.03)=>k.key(d,w,INK.white);
function dash(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.03,color:string=INK.white,seg=.13){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.floor(L/seg));for(let i=0;i<n;i+=2){const a=i/n,b=Math.min(1,(i+1)/n);k.key(`M${x0+(x1-x0)*a} ${y0+(y1-y0)*a} L${x0+(x1-x0)*b} ${y0+(y1-y0)*b}`,w,color);}}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf,a=.8){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,a);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function meadow(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#b9c98a');k.dots(p,INK.green,.06,(x,y)=>.12+.1*Math.sin(x*1.3+y*.7));
 for(let i=0;i<14;i++){const x=x0+.3+((i*37)%41)/41*(x1-x0-.6),y=.4+((i*53)%47)/47*5.4;const r=.06+(i%3)*.04;k.fill(ell(x,y,r*1.4,r),INK.stone);k.key(ell(x,y,r*1.4,r),.01,'#8f8367');}
 for(let i=0;i<22;i++){const x=x0+.2+((i*29)%43)/43*(x1-x0-.4),y=.3+((i*31)%37)/37*5.6;k.key(`M${x} ${y} l.04 -.1 M${x+.05} ${y} l.02 -.12 M${x+.1} ${y} l-.01 -.09`,.012,INK.green);}}
function asphalt(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#8e8f98');k.dots(p,'#5d5f6c',.05,(x,y)=>.2+.12*Math.sin(x*2.1+y*1.3));}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.35);}}
function road(k:Kit,x0:number,x1:number,y:number,w=.7){const r=rect(x0,y-w/2,x1-x0,w);k.fill(r,'#cdbf9f');k.dots(r,'#8f8367',.05,.3);k.key(`M${x0} ${y-w/2} L${x1} ${y-w/2} M${x0} ${y+w/2} L${x1} ${y+w/2}`,.014,'#8f8367');dash(k,x0,y,x1,y,.03,INK.white,.2);}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function nightSky(k:Kit,w:number,h:number,base:string=INK.night,dot:string=INK.blue){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function peaks(k:Kit,w:number,y:number,tone:string,snow=true,seed=0){const pts:number[][]=[[0,y+.6]];for(let i=0;i<=8;i++){const x=i/8*w,top=y-(.35+((i*7+seed)%5)*.12);pts.push([x,i%2?top:y+.15]);}pts.push([w,y+.6],[w,3.2],[0,3.2]);const p=poly(pts);k.fill(p,tone);k.hatch(p,INK.navy,.07,.7,.008);k.key(p,.012);
 if(snow)for(let i=1;i<=8;i+=2){const x=i/8*w,top=y-(.35+((i*7+seed)%5)*.12);k.fill(poly([[x,top],[x+.12,top+.16],[x+.04,top+.12],[x-.04,top+.18],[x-.12,top+.16]]),INK.white);}}
function sea(k:Kit,w:number,y:number,h:number){const s=rect(0,y,w,h);k.fill(s,INK.blue);k.dots(s,INK.navy,.045,.3);for(let i=0;i<7;i++)k.key(`M${.3+i*.62} ${y+.12+(i%2)*.14} l.22 0`,.012,INK.white);}
function roofs(k:Kit,x0:number,n:number,y:number,seed=1){for(let i=0;i<n;i++){const x=x0+i*.36,h=.25+((i*5+seed)%3)*.08,b=rect(x,y-h,.3,h);k.fill(b,i%2?'#f0c89a':'#f6d9a4');k.key(b,.01);k.fill(poly([[x-.03,y-h],[x+.15,y-h-.12],[x+.33,y-h]]),INK.red);k.key(poly([[x-.03,y-h],[x+.15,y-h-.12],[x+.33,y-h]]),.008);}}
function hotelFace(k:Kit,x:number,y:number,w:number,h:number,sign:string){const b=rect(x,y,w,h);k.fill(b,'#f2e6cc');k.dots(b,INK.sky,.045,.2);k.key(b,.014);
 const cols=Math.max(3,Math.round(w/.26)),rows=Math.max(3,Math.floor((h-.4)/.26));for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const wx=x+.08+c*(w-.16)/cols,wy=y+.32+r*.26,n=(r*5+c*3)%7;k.fill(rect(wx+.02,wy,(w-.16)/cols-.05,.14),n===2?INK.yellow:INK.blue);k.key(`M${wx} ${wy+.17} L${wx+(w-.16)/cols-.02} ${wy+.17}`,.01);}
 const s=rect(x+w*.15,y+.05,w*.7,.2);k.fill(s,INK.pink);k.key(s,.01);k.text(sign,x+w/2,y+.21,.14,INK.white,{max:w*.66});}
function stormCloud(key:string,w:number,h:number){return sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#8d93a8');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});}

/* ───────────── book-specific plates ───────────── */
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26,ink,{max:w*.86}));},{rim:.018});
const stoneHouse=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const wall=rect(0,h*.34,w,h*.66);k.fill(wall,'#d8ccb0');
 for(let r=0;r<6;r++)for(let c=0;c<7;c++){const x=(c+(r%2)*.5)*w/7,y=h*.36+r*h*.11;if(x>w-.05)continue;const s=ell(x+w/14,y+h*.05,w/15,h*.045);k.fill(s,(r+c)%3?'#c8b894':'#b7a784');k.key(s,.008,'#8f8367');}
 k.key(wall,.014);const roof=poly([[-.06,h*.36],[w*.5,0],[w+.06,h*.36]]);k.fill(roof,INK.red);k.hatch(roof,'#9c3a30',.05,.4,.01);k.key(roof,.014);
 const dr=rect(w*.14,h*.62,w*.2,h*.38);k.fill(dr,INK.brown);k.key(dr,.012);k.circle(w*.3,h*.8,.02,INK.gold);
 const wn=rect(w*.56,h*.52,w*.26,h*.2);k.fill(wn,INK.yellow);k.key(wn,.012);k.key(`M${w*.69} ${h*.52} L${w*.69} ${h*.72} M${w*.56} ${h*.62} L${w*.82} ${h*.62}`,.01);
 k.keyFill(rect(w*.72,h*.04,w*.1,h*.2),'#9f9378');});
const shutters=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#5f6a7f');k.dots(b,INK.navy,.03,.35);for(let i=1;i<5;i++)k.key(`M0 ${i*h/5} L${w} ${i*h/5}`,.008,INK.navy);k.key(`M${w/2} 0 L${w/2} ${h}`,.01,INK.navy);k.key(b,.012);},{rim:.012});
const goat=(key:string,s:number,tone:string=INK.white)=>sp(key,s*1.3,s,k=>{const w=s*1.3,body=ell(w*.48,s*.5,w*.3,s*.2);k.fill(body,tone);k.dots(body,INK.grey,.03,.3);k.key(body,.012);
 for(const x of [.26,.36,.58,.68])k.keyFill(rect(w*x,s*.62,w*.05,s*.34),INK.brown);
 const head=poly([[w*.74,s*.42],[w*.86,s*.2],[w*.98,s*.3],[w*.92,s*.5]]);k.fill(head,tone);k.key(head,.012);k.key(`M${w*.84} ${s*.22} Q${w*.8} ${s*.04} ${w*.72} ${s*.08}`,.02,INK.brown);k.circle(w*.9,s*.3,.012,INK.navy,true);
 k.key(`M${w*.94} ${s*.48} L${w*.93} ${s*.58}`,.012);k.key(`M${w*.18} ${s*.42} Q${w*.1} ${s*.36} ${w*.12} ${s*.3}`,.014);});
const portrait=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.fill(f,INK.wood);k.dots(f,INK.brown,.035,.4);k.key(f,.016);const m=rect(w*.1,h*.1,w*.8,h*.72);k.fill(m,INK.sky2);k.dots(m,INK.yellow,.04,(x,y)=>.5-y/h*.4);k.key(m,.012);
 const cx=w/2,cy=h*.42,r=w*.2;k.fill(`M${cx-w*.3} ${h*.82} Q${cx} ${h*.5} ${cx+w*.3} ${h*.82} Z`,'#6b7fa8');k.key(`M${cx-w*.3} ${h*.82} Q${cx} ${h*.5} ${cx+w*.3} ${h*.82}`,.012);
 k.fill(ell(cx,cy,r,r*1.15),'#e8b48f');k.key(ell(cx,cy,r,r*1.15),.012);k.fill(`M${cx-r} ${cy-r*.3} Q${cx-r*.9} ${cy-r*1.2} ${cx} ${cy-r*1.2} Q${cx+r*.9} ${cy-r*1.2} ${cx+r} ${cy-r*.3} Q${cx} ${cy-r*.8} ${cx-r} ${cy-r*.3} Z`,INK.white);
 k.circle(cx-r*.38,cy-r*.05,r*.09,INK.navy,true);k.circle(cx+r*.38,cy-r*.05,r*.09,INK.navy,true);k.fill(`M${cx-r*.5} ${cy+r*.35} Q${cx} ${cy+r*.15} ${cx+r*.5} ${cy+r*.35} Q${cx} ${cy+r*.5} ${cx-r*.5} ${cy+r*.35} Z`,INK.grey);k.key(`M${cx-r*.35} ${cy+r*.62} Q${cx} ${cy+r*.8} ${cx+r*.35} ${cy+r*.62}`,.012);
 const pl=rect(w*.25,h*.85,w*.5,h*.1);k.fill(pl,INK.gold);k.key(pl,.01);k.text('LUKA',w/2,h*.93,h*.075,INK.navy,{max:w*.46});});
const frameCover=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#f3d9e4');k.dots(b,INK.pink,.04,.3);k.key(b,.014);for(let i=0;i<5;i++){const x=w*(.2+(i%3)*.3),y=h*(.25+Math.floor(i/3)*.4);k.fill(`M${x} ${y+.05} C${x-.08} ${y-.02} ${x-.05} ${y-.08} ${x} ${y-.03} C${x+.05} ${y-.08} ${x+.08} ${y-.02} ${x} ${y+.05} Z`,INK.pink);}k.text('LIFT',w/2,h*.92,h*.1,INK.navy,{weight:900});},{rim:.015});
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
const car=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const body=`M0 ${h*.8} L0 ${h*.5} L${w*.2} ${h*.45} L${w*.32} ${h*.12} L${w*.72} ${h*.12} L${w*.86} ${h*.45} L${w} ${h*.52} L${w} ${h*.8} Z`;k.fill(body,c);k.dots(body,INK.navy,.035,.2);k.key(body,.014);
 k.fill(poly([[w*.36,h*.18],[w*.5,h*.18],[w*.5,h*.44],[w*.26,h*.44]]),INK.sky2);k.fill(poly([[w*.54,h*.18],[w*.7,h*.18],[w*.8,h*.44],[w*.54,h*.44]]),INK.sky2);for(const x of [.22,.78]){k.fill(ell(w*x,h*.82,h*.17,h*.17),INK.navy);k.circle(w*x,h*.82,h*.07,INK.grey);}});
const suitcase=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const b=rect(0,h*.2,w,h*.8);k.fill(b,c);k.dots(b,INK.navy,.03,.2);k.key(b,.013);k.key(`M${w*.3} ${h*.2} L${w*.3} ${h*.04} L${w*.7} ${h*.04} L${w*.7} ${h*.2}`,.02);k.fill(rect(w*.12,h*.2,w*.08,h*.8),INK.brown);k.fill(rect(w*.8,h*.2,w*.08,h*.8),INK.brown);});
const school=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.3,w,h*.7);k.fill(b,'#f6e4c0');k.dots(b,INK.orange,.04,.18);k.key(b,.014);const roof=poly([[-.05,h*.32],[w/2,h*.08],[w+.05,h*.32]]);k.fill(roof,INK.blue);k.key(roof,.014);
 k.fill(rect(w*.44,0,w*.12,h*.14),INK.white);k.key(rect(w*.44,0,w*.12,h*.14),.01);k.fill(ell(w/2,h*.09,w*.035,w*.035),INK.gold);for(let i=0;i<4;i++){const wx=w*(.08+i*.24);k.fill(rect(wx,h*.45,w*.14,h*.18),INK.sky);k.key(rect(wx,h*.45,w*.14,h*.18),.01);}
 const d=rect(w*.42,h*.7,w*.16,h*.3);k.fill(d,INK.red);k.key(d,.012);const s=rect(w*.2,h*.33,w*.6,h*.1);k.fill(s,INK.white);k.key(s,.01);k.text('SCHOOL',w/2,h*.41,h*.075,INK.navy,{max:w*.55});});
const jar=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const j=`M${w*.2} ${h*.12} L${w*.8} ${h*.12} L${w*.86} ${h*.3} L${w*.86} ${h} L${w*.14} ${h} L${w*.14} ${h*.3} Z`;k.fill(j,INK.sky2,.9);k.dots(j,INK.sky,.03,.3);k.key(j,.014);k.fill(rect(w*.16,0,w*.68,h*.13),INK.brown);k.key(rect(w*.16,0,w*.68,h*.13),.012);
 for(let i=0;i<3;i++){const c=ell(w*(.35+i*.14),h*.93-(i%2)*.03,w*.12,h*.035);k.fill(c,INK.gold);k.key(c,.008);}});
const coin=(key:string,r:number)=>sp(key,r*2,r*2,k=>{k.fill(ell(r,r,r,r),INK.gold);k.dots(ell(r,r,r,r),INK.orange,.025,.4);k.key(ell(r,r,r,r),.012);k.key(ell(r,r,r*.62,r*.62),.008,INK.orange);},{rim:.012});
const helpBoard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.1,h*.8,w*.06,h*.2),INK.brown);k.keyFill(rect(w*.84,h*.8,w*.06,h*.2),INK.brown);const b=rect(0,0,w,h*.82);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.18);k.key(b,.016);k.fill(rect(0,0,w,h*.14),INK.navy);k.text('WHO HELPED?',w/2,h*.11,h*.08,INK.yellow,{max:w*.8});});
const helperCard=(key:string,w:number,h:number,who:'family'|'uncle'|'coach',label:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,[INK.yellow,INK.sky,INK.pink][who==='family'?0:who==='uncle'?1:2]);k.dots(b,INK.navy,.03,.15);k.key(b,.012);
 const face=(x:number,y:number,r:number,hair:string,beard=false)=>{k.fill(`M${x-r*1.3} ${y+r*2.2} Q${x} ${y+r*.8} ${x+r*1.3} ${y+r*2.2} Z`,INK.blue);k.fill(ell(x,y,r,r*1.1),'#e8b48f');k.key(ell(x,y,r,r*1.1),.01);k.fill(`M${x-r} ${y-r*.2} Q${x} ${y-r*1.5} ${x+r} ${y-r*.2} Q${x} ${y-r*.7} ${x-r} ${y-r*.2} Z`,hair);k.circle(x-r*.35,y,r*.1,INK.navy,true);k.circle(x+r*.35,y,r*.1,INK.navy,true);k.key(`M${x-r*.35} ${y+r*.45} Q${x} ${y+r*.65} ${x+r*.35} ${y+r*.45}`,.01);if(beard)k.fill(`M${x-r*.7} ${y+r*.4} Q${x} ${y+r*1.3} ${x+r*.7} ${y+r*.4} Q${x} ${y+r*.8} ${x-r*.7} ${y+r*.4} Z`,'#5a4030');};
 if(who==='family'){face(w*.28,h*.36,w*.12,'#3b2e3f');face(w*.72,h*.36,w*.12,'#6b4a2f');face(w*.5,h*.5,w*.09,'#c9a46a');}
 else if(who==='uncle')face(w*.5,h*.38,w*.17,'#3b2e3f',true);
 else{face(w*.5,h*.38,w*.17,'#6b5a48');k.key(`M${w*.62} ${h*.62} L${w*.78} ${h*.55}`,.012);k.circle(w*.8,h*.54,w*.04,INK.grey);}
 k.fill(rect(0,h*.78,w,h*.22),INK.white);k.text(label,w/2,h*.94,h*.13,INK.navy,{max:w*.9,weight:900});},{rim:.015});
const qCover=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.hatch(b,INK.navy,.06,.7,.008);k.key(b,.013);k.fill(ell(w/2,h*.46,w*.26,w*.26),INK.white);k.text('?',w/2,h*.56,h*.34,INK.navy,{weight:900});},{rim:.015});
const gatePost=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{for(const x of [0,w-.16]){const p=rect(x,h*.12,.16,h*.88);k.fill(p,INK.stone);k.dots(p,'#8f8367',.035,.3);k.key(p,.012);k.fill(rect(x-.03,h*.08,.22,.08),INK.grey);}
 const arch=`M.08 ${h*.14} Q${w/2} ${-h*.06} ${w-.08} ${h*.14} L${w-.08} ${h*.26} Q${w/2} ${h*.08} .08 ${h*.26} Z`;k.fill(arch,INK.navy);k.key(arch,.012);k.text(label,w/2,h*.2,h*.07,INK.yellow,{max:w*.6,weight:900});});
const gateLeaf=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.key(f,.03,c);for(let i=1;i<6;i++)k.key(`M${i*w/6} 0 L${i*w/6} ${h}`,.022,c);k.key(`M0 ${h*.3} L${w} ${h*.3} M0 ${h*.75} L${w} ${h*.75}`,.026,c);for(let i=0;i<6;i++)k.fill(poly([[i*w/6+.02,0],[(i+.5)*w/6,-.08],[(i+1)*w/6-.02,0]]),c);},{rim:.012});
const heightChart=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.013);for(let i=0;i<16;i++){const y=h-.08-i*(h-.16)/15;k.key(`M0 ${y} L${i%5===0?w*.6:w*.3} ${y}`,.01,INK.navy);}const top=rect(0,0,w,h*.18);k.fill(top,INK.red);k.text('TALL?',w/2,h*.14,h*.07,INK.white,{max:w*.86,weight:900});});
const stamp=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white,.9);k.key(b,.03,INK.red);k.key(rect(.04,.04,w-.08,h-.08),.012,INK.red);k.text(label,w/2,h*.68,h*.44,INK.red,{max:w*.84,weight:900});},{rim:.015});
const flats=(key:string,w:number,h:number,wall:string,shade:string,seed=1)=>sp(key,w,h,k=>{
 const b=rect(0,h*.05,w,h*.95);k.fill(b,wall);k.dots(b,shade,.045,(x,y)=>.1+y/h*.3);k.fill(rect(w*.84,h*.05,w*.16,h*.95),shade,.4);k.key(b,.014);
 const roof=rect(-.03,0,w+.06,h*.06);k.fill(roof,INK.grey);k.key(roof,.012);
 const cols=Math.max(2,Math.round(w/.3)),rows=Math.max(3,Math.floor((h*.78)/.3)),cw=(w-.16)/cols,rh=(h*.74)/rows;
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const x=.08+c*cw,y=h*.1+r*rh,n=(r*7+c*13+seed*5)%11;
  const win=rect(x+cw*.2,y+rh*.12,cw*.6,rh*.46);k.fill(win,n%4===0?INK.yellow:INK.blue);k.key(win,.008);
  const bal=rect(x+cw*.08,y+rh*.6,cw*.84,rh*.12);k.fill(bal,INK.white);k.key(bal,.008);}
 const door=rect(w*.4,h-.26,w*.2,.26);k.fill(door,INK.navy);k.key(door,.012);});
const newspaper=(key:string,w:number,h:number,head:string)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.72,w*.08,h*.28),INK.brown);const b=rect(0,0,w,h*.74);k.fill(b,INK.white);k.dots(b,INK.grey,.035,.35);k.key(b,.013);k.fill(rect(0,0,w,h*.14),INK.navy);k.text('NEWS',w/2,h*.11,h*.08,INK.white,{weight:900});
 k.text(head,w/2,h*.3,h*.1,INK.red,{max:w*.88,weight:900});for(let i=0;i<5;i++)k.key(`M${w*.08} ${h*(.4+i*.06)} L${w*(i%2?.6:.9)} ${h*(.4+i*.06)}`,.012,INK.grey);k.fill(rect(w*.62,h*.4,w*.3,h*.22),INK.sky);k.key(rect(w*.62,h*.4,w*.3,h*.22),.01);});
const feather=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=`M${w*.1} ${h} Q${w*.2} ${h*.3} ${w*.9} 0 Q${w*.7} ${h*.5} ${w*.1} ${h} Z`;k.fill(p,INK.white);k.hatch(p,INK.sky,.03,-.8,.008);k.key(p,.012);k.key(`M${w*.1} ${h} Q${w*.35} ${h*.45} ${w*.9} 0`,.012);},{rim:.012});
const skyline=(k:Kit,w:number,y:number)=>{const cs=['#8f95ad','#a3a8bd','#7e849e'];for(let i=0;i<11;i++){const x=i*w/11,h=.4+((i*7)%5)*.14,b=rect(x,y-h,w/11-.03,h);k.fill(b,cs[i%3]);k.key(b,.01);for(let r=0;r<Math.floor(h/.14);r++)k.fill(rect(x+.05,y-h+.06+r*.14,.06,.06),INK.yellow,.7);}
 const tw=rect(w*.62,y-1.3,.22,1.3);k.fill(tw,'#b9a47c');k.key(tw,.012);k.fill(poly([[w*.62,y-1.3],[w*.62+.11,y-1.6],[w*.62+.22,y-1.3]]),'#7e849e');k.fill(ell(w*.62+.11,y-1.1,.07,.07),INK.white);k.key(ell(w*.62+.11,y-1.1,.07,.07),.01);};
const river=(k:Kit,x0:number,x1:number,y0:number,y1:number)=>{const r=rect(x0,y0,x1-x0,y1-y0);k.fill(r,INK.blue);k.dots(r,INK.navy,.045,.35);for(let i=0;i<5;i++)k.key(`M${x0+.1+(i%2)*.2} ${y0+.2+i*.22} l.3 0`,.012,INK.white);};
const pow=(key:string,r:number)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:16},(_,i)=>{const a=i/16*TAU,rr=i%2?r*.5:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});k.fill(poly(pts),INK.yellow);k.dots(poly(pts),INK.orange,.03,.4);k.key(poly(pts),.012);},{rim:.02});
const bannerPoles=(key:string,w:number,h:number,lines:string[])=>sp(key,w,h,k=>{for(const x of [0,w-.07]){const p=rect(x,0,.07,h);k.fill(p,INK.white);for(let y=0;y<h;y+=.16)k.fill(rect(x,y,.07,.08),INK.red);k.key(p,.008);}
 const b=rect(.1,h*.06,w-.2,h*.46);k.fill(b,INK.red);k.dots(b,INK.navy,.035,.2);k.key(b,.014);for(let i=0;i<8;i++){const x=.1+i*(w-.2)/8;k.fill(rect(x,h*.06,(w-.2)/16,h*.06),INK.white);}
 lines.forEach((l,i)=>k.text(l,w/2,h*(.3+i*.16),h*.12,INK.white,{max:w*.8,weight:900}));});
const plane=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const body=`M0 ${h*.5} Q${w*.1} ${h*.35} ${w*.9} ${h*.4} L${w} ${h*.5} L${w*.9} ${h*.6} Q${w*.1} ${h*.65} 0 ${h*.5} Z`;k.fill(body,INK.grey);k.key(body,.012);k.fill(poly([[w*.4,h*.45],[w*.62,0],[w*.7,0],[w*.58,h*.45]]),'#9aa0b5');k.fill(poly([[w*.4,h*.55],[w*.62,h],[w*.7,h],[w*.58,h*.55]]),'#9aa0b5');k.fill(poly([[w*.02,h*.45],[w*.1,h*.1],[w*.16,h*.1],[w*.14,h*.45]]),'#9aa0b5');for(let i=0;i<5;i++)k.circle(w*(.3+i*.1),h*.47,.018,INK.sky);},{rim:.015});

/* ───────────── shared mechanics ───────────── */
function ballPair(B:Builder,key:string,r=.12){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),R=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}

/* ───────────── 1 · A stone house on the mountain (hamlet) ───────────── */
const hamlet:SpreadDef={id:'hamlet',rest:33.9,
 left:k=>{meadow(k,-5,0);footprints(k,-3.2,Z(1.4),-.4,Z(1.9),9,INK.brown);
  k.text('VELEBIT',-2.4,Z(2.62),.52,INK.green,{max:3});k.text('CROATIA · 1985',-2.4,Z(2.9),.17,INK.navy,{weight:800});},
 right:k=>{meadow(k,0,5);road(k,0,5,Z(1.25),.65);
  k.text('DECEMBER 1991',2.5,Z(2.62),.42,INK.pink,{max:4.2});k.text('THE FAMILY HAD TO LEAVE HOME',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4});},
 build:B=>{
  const bd=B.vfold(
   {key:K+'h-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);peaks(k,4.5,1.3,'#9aa3bd',true,1);const hill=`M0 2.1 Q1.4 1.6 2.6 1.9 Q3.6 2.1 4.5 1.8 L4.5 3 L0 3 Z`;k.fill(hill,'#a9bd7e');k.dots(hill,INK.green,.05,.3);
    for(let i=0;i<5;i++)k.key(`M${.3+i*.9} 2.5 L${.7+i*.9} 2.5`,.014,'#8f8367');}},
   {key:K+'h-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d9',INK.navy,y=>.3-y/3*.2);peaks(k,4.5,1.45,'#8a91ab',true,4);const hill=`M0 1.9 Q1.6 1.5 2.9 1.8 Q3.9 2.0 4.5 1.7 L4.5 3 L0 3 Z`;k.fill(hill,'#a3b57c');k.dots(hill,INK.green,.05,.3);
    sea(k,4.5,2.35,.35);k.fill(rect(0,2.7,4.5,.3),'#a3b57c');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'h-sun',.34),'L',3.5,1.6,{out:.012}),cloud=bd.add(S.cloud(K+'h-cloud',.9,.4),'L',1.6,2.55),birds=bd.add(S.birds(K+'h-birds',.8,.3),'R',3.3,2.4,{out:.02});
  const stormR=bd.add(stormCloud('h-stormR',1.5,.8),'R',1.2,1.6,{out:.03}),stormL=bd.add(stormCloud('h-stormL',1.2,.65),'L',.9,1.7,{out:.03});
  const house=B.stand(stoneHouse('h-house',1.6,1.5),-3.55,-1.45,{layer:1});
  const shut=house.flap(shutters('h-shut',.46,.34),1.6*.19,1.5*.48,{z:.02});
  B.stand(S.tree(K+'h-olive',1.0,1.3,'olive'),-1.6,-1.95,{layer:1});B.stand(S.tree(K+'h-cyp',.45,1.5,'cypress'),-4.7,-.9,{layer:1});
  const sign=B.stand(S.sign(K+'h-sign',1.0,1.15,'ZADAR'),-.75,-1.2,{layer:1});const card85=sign.flap(S.flipCard(K+'h-1985',.8,.36,'1985',INK.pink),0,1.15*.56,{z:.03});
  const bench=B.stand(S.bench(K+'h-bench',.9,.4),-2.35,-.55,{layer:2});void bench;
  const grandpa=B.person(K+'h-grandpa',-2.3,-.4,1.72,{shirt:'casual',hair:'bald',hairColor:INK.white,adult:true,skin:'#e8b48f',face:'smile',layer:2,beard:true});
  const boy=B.person(K+'h-boy',-3.0,.55,1.0,{shirt:'bib',...LUKA,face:'grin',layer:2});
  const tagG=B.stand(S.flipCard(K+'h-tagG',.62,.28,'LUKA',INK.blue),-1.55,.1,{layer:2,s:0}),tagB=B.stand(S.flipCard(K+'h-tagB',.62,.28,'LUKA',INK.pink),-3.95,1.0,{layer:3,s:0});
  const goats=[[-1.6,1.2],[-.85,.75],[-.75,1.75]].map(([x,z],i)=>B.stand(goat(`h-goat${i}`,.42,i===1?'#e9dcc2':INK.white),x,z,{layer:3,s:0}));
  const mum=B.person(K+'h-mum',1.3,.95,1.6,{shirt:'coach',hair:'long',adult:true,skin:'#f1b88f',face:'open',layer:3,holdR:'suitcase'});
  const dad=B.person(K+'h-dad',2.05,.8,1.72,{shirt:'navy',hair:'short',adult:true,skin:'#e8b48f',face:'open',layer:3,holdL:'suitcase'});
  const son=B.person(K+'h-son',.75,1.35,1.0,{shirt:'bib',...LUKA,face:'shy',layer:3});
  const frame=B.stand(portrait('h-frame',1.0,1.25),1.15,-.75,{layer:2,s:0});
  const cover=frame.flap(frameCover('h-cover',1.0,1.25),0,1.25,{z:.02});
  const hearts=[0,1,2].map(i=>B.stand(heart(`h-heart${i}`,.3),.5+i*.55,.05,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,33.9):b.t;
   sun.dy=.6*beat(t,0,2.2)-.9*beat(t,21,25)+.9*beat(t,38,41);cloud.dx=.5*beat(t,0,40);birds.dx=-1*beat(t,1,18)+1.2*beat(t,38,43);birds.visible=t<20||t>37.5;
   card85.flip=-2.9+2.9*beat(t,3,3.8);boy.body.s=beat(t,4.4,5.3);
   house.s=beat(t,8,9.2);grandpa.body.s=beat(t,10.4,11.4)*(1-beat(t,27.6,29));grandpa.armR.rot=.12+1.9*beat(t,11.6,12.2)-1.9*beat(t,14,14.6)+.3*wave(t,12.2,14,1.3);
   tagG.s=beat(t,15.1,15.8)*(1-beat(t,19.8,20.6));tagB.s=beat(t,15.7,16.4)*(1-beat(t,19.8,20.6));
   goats.forEach((g,i)=>{g.s=beat(t,17.6+i*.45,18.3+i*.45)*(1-beat(t,21,22));g.rot=.05*wave(t,18.5,21,.8+i*.2);});
   boy.body.x=-3.0+1.1*beat(t,17.8,19.6);boy.armR.rot=.12+1.5*beat(t,18.6,19.1)-1.5*beat(t,20,20.6);boy.body.s=beat(t,4.4,5.3)*(1-beat(t,21,21.8));
   const st=beat(t,20.8,22.4);stormR.scale=st*(1-.55*beat(t,37,40));stormR.visible=stormR.scale>.02;stormR.dx=-.3*beat(t,21,30);
   stormL.scale=beat(t,27.2,28.4)*(1-beat(t,37,39.5));stormL.visible=stormL.scale>.02;stormL.dx=.25*wave(t,28,37,.25);
   // The family leaves along the road, then gathers round the photo frame.
   [mum,dad,son].forEach((p,i)=>{p.body.s=beat(t,21.4+i*.35,22.3+i*.35);p.body.x=[1.3,2.05,.75][i]+1.25*beat(t,23,26.4)-.2*beat(t,36.8,39);});
   mum.armL.rot=-.12-.4*beat(t,23,23.6)+.4*beat(t,26.4,27);son.armL.rot=-.12-1.2*beat(t,24,24.6)+1.2*beat(t,26.4,27);
   shut.flip=-2.8+2.8*beat(t,31.2,32.2);
   frame.s=beat(t,32.6,33.6);const lift=Math.max(manual?beat(act,0,.8):0,beat(t,35,36.4));cover.flip=-2.85*lift;
   hearts.forEach((h,i)=>{h.s=Math.max(manual?beat(act,.6+i*.12,.8+i*.12):0,beat(t,37.2+i*.6,37.9+i*.6));});
   const hug=beat(t,38.6,39.4);dad.armR.rot=.12+1.1*hug;mum.armR.rot=.12+.9*hug+(manual?.6*beat(act,.7,1):0);son.armR.rot=.12+1.6*Math.max(hug,manual?beat(act,.7,1):0);
   return b.narrated?-.45*beat(t,2.2,3.4)+.45*beat(t,20.4,21.4)+.45*beat(t,21.4,22.6)-.45*beat(t,26.6,27.6)+.5*beat(t,33.6,34.4)-.5*beat(t,40,41):0;
  };
 }};

/* ───────────── 2 · A hotel for a home (hotel) ───────────── */
const hotel:SpreadDef={id:'hotel',rest:19.8,
 left:k=>{asphalt(k,-5,0);for(let i=0;i<6;i++)k.key(`M${-4.8+i*.8} ${Z(-1.2)} L${-4.8+i*.8} ${Z(-.2)}`,.03,INK.white);dash(k,-5,Z(.2),0,Z(.2),.035,INK.yellow);
  k.text('HOTEL KOLOVARE',-2.4,Z(2.62),.4,INK.pink,{max:4});k.text('ZADAR · HOME FOR SEVEN YEARS',-2.4,Z(2.9),.15,INK.white,{weight:800});},
 right:k=>{asphalt(k,0,5);for(let i=0;i<5;i++)k.key(`M${.6+i*.9} ${Z(-1.3)} L${.6+i*.9} ${Z(-.3)}`,.03,INK.white);dash(k,0,Z(.2),5,Z(.2),.035,INK.yellow);chalk(k,`M.3 ${Z(.9)} Q2.3 ${Z(.5)} 4.3 ${Z(.75)}`,.02);
  k.text('THE CAR PARK PITCH',2.5,Z(2.62),.38,INK.yellow,{max:4.2});k.text('FOOTBALL WAS A WAY TO ESCAPE THE WAR',2.5,Z(2.9),.14,INK.white,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'o-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);sea(k,4.5,1.9,.5);hotelFace(k,.3,.55,2.6,1.9,'HOTEL');k.fill(rect(0,2.45,4.5,.55),'#8e8f98');k.key(`M0 2.45 L4.5 2.45`,.014);}},
   {key:K+'o-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);sea(k,4.5,1.75,.45);roofs(k,.3,11,2.3,2);const bell=rect(3.2,.7,.28,1.6);k.fill(bell,'#e7d3a6');k.key(bell,.012);k.fill(poly([[3.18,.7],[3.34,.4],[3.5,.7]]),INK.red);k.fill(rect(0,2.45,4.5,.55),'#8e8f98');k.key(`M0 2.45 L4.5 2.45`,.014);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'o-sun',.34),'R',3.9,1.7,{out:.012});
  const clouds=[bd.add(stormCloud('o-st1',1.4,.7),'L',3.75,2.35,{out:.03}),bd.add(stormCloud('o-st2',1.3,.66),'R',1.3,2.1,{out:.03}),bd.add(stormCloud('o-st3',1.1,.56),'R',3.2,2.5,{out:.03})];
  const planeP=bd.add(plane('o-plane',.8,.36),'R',.4,2.5,{out:.035});
  const bunt=bd.add(S.bunting(K+'o-bunt',2.6,.4,[INK.pink,INK.yellow,INK.sky,INK.white]),'L',.9,2.55,{out:.03});
  const sign=B.stand(S.sign(K+'o-sign',1.4,1.25,'HOTEL'),-.8,-1.55,{layer:1});
  const nameA=sign.flap(S.flipCard(K+'o-iz',1.25,.4,'HOTEL IŽ',INK.blue),0,.42,{z:.024});const nameB=sign.flap(S.flipCard(K+'o-kol',1.25,.4,'KOLOVARE',INK.pink),0,.42,{z:.032});
  const cars=[B.stand(car('o-car1',1.1,.55,INK.red),-4.25,-.8,{layer:1}),B.stand(car('o-car2',1.1,.55,INK.sky),1.2,-.9,{layer:1}),B.stand(car('o-car3',1.05,.52,INK.yellow),3.9,-.95,{layer:1})];
  const days=Array.from({length:7},(_,i)=>B.stand(S.sun(K+`o-day${i}`,.12),-4.6+i*.34,2.1,{layer:3,s:0,tab:false}));
  const mum=B.person(K+'o-mum',-4.2,.6,1.6,{shirt:'coach',hair:'long',adult:true,skin:'#f1b88f',face:'smile',layer:2,holdR:'suitcase'});
  const dad=B.person(K+'o-dad',-3.45,.35,1.72,{shirt:'keeper',hair:'cap',adult:true,skin:'#e8b48f',face:'smile',layer:2});
  const H=B.person(K+'o-luka',-2.6,1.0,1.05,{shirt:'casual',...LUKA,legs:'kick',face:'smile',layer:3});
  const kids=[[1.1,.95,'bib','curly','#7f5138'],[2.3,1.4,'navy','short','#d99a6c'],[2.9,.5,'bib','bun','#f1b88f'],[.55,1.75,'casual','short','#b27650']].map(([x,z,sh,hr,sk],i)=>B.person(K+`o-kid${i}`,x as number,z as number,1.0,{shirt:sh as 'bib',hair:hr as 'short',skin:sk as string,legs:i===0?'kick':undefined,face:'grin',layer:3}));
  const posts=[B.stand(suitcase('o-bag1',.46,.4,INK.red),4.2,-.05,{layer:2}),B.stand(suitcase('o-bag2',.46,.4,INK.blue),4.45,.95,{layer:2})];void posts;
  const ball=ballPair(B,'o-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.8):b.t;
   sun.dy=.4*beat(t,0,2)-1.2*beat(t,16,18)+1.2*Math.max(beat(t,21.5,24),manual?beat(act,.4,1):0);
   [mum,dad].forEach((p,i)=>{p.body.s=beat(t,2.5+i*.4,3.4+i*.4);p.body.x=[-4.2,-3.45][i]+.35*beat(t,3.8,5.4);});H.body.s=beat(t,3.2,4.1);
   nameB.flip=-3.2*beat(t,10.2,11);nameA.flip=0;days.forEach((d,i)=>{d.s=beat(t,6.4+i*.45,6.8+i*.45);});
   planeP.dx=-2.9*beat(t,12.2,15.6)+(t<12.2?0:0);planeP.visible=t>12&&t<15.8;planeP.dy=.15*Math.sin(t*1.5)*(t>12?1:0);dad.armR.rot=.12+2.4*beat(t,12.6,13.2)-2.4*beat(t,15.4,16);
   const storm=beat(t,16.3,17.6)*(1-beat(t,21,23))*(manual?1-beat(act,.3,.9):1);clouds.forEach((c,i)=>{c.scale=storm;c.visible=storm>.02;c.dx=.15*wave(t,16.3,21,.3+i*.1);});
   mum.armL.rot=-.12-.9*storm;dad.armL.rot=-.12-.9*storm;
   // Parking-lot football: Luka passes, friends join, and the ball rolls between two suitcases.
   kids.forEach((k2,i)=>{k2.body.s=i===0?Math.max(beat(t,22.6,23.4),manual?beat(act,.05,.3):0):beat(t,29+i*.5,29.8+i*.5);});
   let bx:number,bz:number,dy=0;
   if(manual)[bx,bz]=track(act,[[.05,-2.2,1.05],[.5,.9,1.0],[.6,.9,1.0],[1,4.3,.45]]);
   else [bx,bz]=track(t,[[0,-2.2,1.05],[23.6,-2.2,1.05],[24.6,.9,1.0],[25.6,.9,1.0],[26.6,-2.2,1.05],[27.4,-2.2,1.05],[28.4,4.3,.45],[31.4,4.3,.45],[32.2,2.3,1.2],[33,-2.2,1.05]]);
   dy=.06*Math.abs(Math.sin(t*5))*(t>33?1:0);
   ball(bx,bz,dy,t>19.4||manual);
   H.leg!.rot=-1*Math.max(maxOf([23.6,27.4].map(a=>pulse(t,a-.3,a+.3))),manual?pulse(act,0,.12):0);kids[0].leg!.rot=-1*Math.max(pulse(t,25.3,25.9),manual?pulse(act,.55,.7):0);
   const goal=Math.max(beat(t,28.4,29)*(1-beat(t,31,31.6)),manual?beat(act,.9,1):0);cheer(H,goal);cheer(kids[0],goal);
   kids.forEach((k2,i)=>{if(i>0)k2.armR.rot=.12+2.2*beat(t,30+i*.3,30.6+i*.3)-2.2*beat(t,33,33.6)+2.3*beat(t,37+i*.3,37.6+i*.3)*1;if(i>0)k2.armL.rot=-.12-2.3*beat(t,37+i*.3,37.6+i*.3);});
   const wave2=beat(t,34,34.6);mum.armR.rot=.12+2*wave2+.3*wave(t,34.6,42,1.2);dad.armR.rot+=2*wave2;
   if(t>37){cheer(H,beat(t,37,37.6));cheer(kids[0],beat(t,37.2,37.8));}
   bunt.scale=beat(t,36.4,37.4);bunt.visible=bunt.scale>.02;
   cars.forEach((c,i)=>{c.s=beat(t,.6+i*.3,1.4+i*.3);});
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,11.8,12.6)+.4*beat(t,22.4,23.2)-.4*beat(t,28.8,29.6):0;
  };
 }};

/* ───────────── 3 · The people behind him (academy) ───────────── */
const academy:SpreadDef={id:'academy',rest:19.6,
 left:k=>{meadow(k,-5,0);const yard=rect(-4.8,Z(-2.2),3.2,1.6);k.fill(yard,INK.stone);k.dots(yard,'#9f9378',.05,.3);for(let i=0;i<4;i++)chalk(k,rect(-4.5+i*.5,Z(-1.4),.4,.4),.02);
  k.text('1992',-2.4,Z(2.62),.56,INK.blue,{max:2.4});k.text('SCHOOL AND A SPORTS ACADEMY',-2.4,Z(2.9),.15,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,ell(0,Z(0),1.0,1.0));chalk(k,`M2.4 ${Z(-2.1)} L2.4 ${Z(-1.2)} L4.6 ${Z(-1.2)} L4.6 ${Z(-2.1)}`);
  k.text('NK ZADAR',2.5,Z(2.62),.46,INK.pink,{max:4});k.text('SUPPORTED BY HIS FAMILY',2.5,Z(2.9),.15,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'a-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);peaks(k,4.5,1.6,'#aab2c7',false,2);roofs(k,.2,12,2.3,3);k.fill(rect(0,2.3,4.5,.7),'#b9c98a');}},
   {key:K+'a-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);sea(k,4.5,1.7,.4);lightRig(k,1.1,1.0);lightRig(k,3.6,.9);k.hatch(rect(0,1.95,4.5,.45),INK.navy,.08,.78,.008);k.hatch(rect(0,1.95,4.5,.45),INK.navy,.08,-.78,.008);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'a-sun',.34),'L',3.8,2.1,{out:.012}),clouds=[bd.add(S.cloud(K+'a-cl1',1.0,.45),'L',1.4,2.6),bd.add(S.cloud(K+'a-cl2',.9,.4),'R',2.6,2.6)];
  const sch=B.stand(school('a-school',1.7,1.5),-3.9,-1.2,{layer:1});
  const acad=B.stand(S.sign(K+'a-acad',1.2,1.2,'ACADEMY',INK.yellow),.7,-1.95,{layer:1,s:0});
  const board=B.stand(helpBoard('a-board',2.1,1.45),-1.2,-.9,{layer:1});
  const who=([['family','FAMILY'],['uncle','UNCLE'],['coach','COACH']] as const).map(([w,l],i)=>{const x=-2.1/2+.36+i*.69;board.add(helperCard(`a-card${i}`,.58,.72,w,l),x,.28,{z:.012});return board.flap(qCover(`a-q${i}`,.6,.74,[INK.pink,INK.orange,INK.blue][i]),x-.3,.27,{anchor:'bl',axis:'y',z:.024});});
  const jarP=B.stand(jar('a-jar',.5,.62),-3.05,1.55,{layer:3});
  const coins=[0,1,2].map(i=>jarP.add(coin(`a-coin${i}`,.07),.25,.62+.5,{anchor:'center',z:.02}));
  const mum=B.person(K+'a-mum',-4.4,.95,1.6,{shirt:'coach',hair:'long',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const dad=B.person(K+'a-dad',-3.8,.7,1.72,{shirt:'keeper',hair:'short',adult:true,skin:'#e8b48f',face:'smile',layer:2});
  const uncle=B.person(K+'a-uncle',-2.65,.85,1.72,{shirt:'casual',hair:'curly',adult:true,skin:'#d99a6c',face:'grin',layer:2,beard:true});
  const H=B.person(K+'a-luka',-1.1,1.2,1.05,{shirt:'bib',...LUKA,legs:'kick',face:'smile',layer:3});
  const coach=B.person(K+'a-coach',1.75,-.2,1.75,{shirt:'coach',hair:'short',adult:true,skin:'#e8b48f',face:'smile',layer:2});
  const fatherCard=B.stand(S.flipCard(K+'a-sfather',1.2,.32,'SPORTING FATHER',INK.yellow,INK.navy),1.75,.55,{layer:2,s:0});
  const mates=[[2.6,.9,'#7f5138'],[3.7,.3,'#d99a6c'],[3.2,1.6,'#b27650']].map(([x,z,sk],i)=>B.person(K+`a-m${i}`,x as number,z as number,1.0,{shirt:'bib',hair:(['curly','short','bun'] as const)[i],skin:sk as string,face:'grin',layer:3}));
  B.stand(S.goal(K+'a-goal',1.4,.75),3.5,-1.35,{layer:1});for(const [x,z] of [[1.9,-1.3],[2.0,-.6],[4.5,.8]])B.stand(S.cone(K+`a-cone${x}`,.3),x,z,{layer:2});
  const hearts=[0,1,2,3].map(i=>B.stand(heart(`a-heart${i}`,.24),-4.3+i*.95,2.1,{layer:3,s:0}));
  const ball=ballPair(B,'a-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.6):b.t;
   sun.dy=.6*beat(t,0,2);clouds[0].dx=.5*beat(t,0,40);clouds[1].dx=-.4*beat(t,0,40);
   sch.s=beat(t,2.2,3.2);H.body.s=beat(t,3.4,4.3);acad.s=beat(t,5.6,6.4);
   mum.body.s=beat(t,8.4,9.2);dad.body.s=beat(t,8.8,9.6);
   coins.forEach((c,i)=>{const drop=beat(t,[9.6,11,13][i],[10.2,11.6,13.6][i]);c.dy=-.45*drop;c.visible=t>[9.3,10.7,12.7][i]&&drop<.98;c.rot=t*2;});
   uncle.body.s=beat(t,12.2,13);uncle.armR.rot=.12+1.2*beat(t,12.8,13.2)-1.2*beat(t,14,14.5);dad.armR.rot=.12+1.2*beat(t,9.4,9.8)-1.2*beat(t,11.2,11.6);
   coach.body.s=beat(t,15,15.8);mates.forEach((m,i)=>{m.body.s=beat(t,15.4+i*.4,16.2+i*.4);});
   let bx:number,bz:number;[bx,bz]=track(t,[[0,-.75,1.25],[16.4,-.75,1.25],[17.3,2.6,.95],[18.2,2.6,.95],[19,-.75,1.25],[31,-.75,1.25],[31.8,3.4,-1.5]]);ball(bx,bz,0,t>15);
   H.leg!.rot=-1*maxOf([16.4,31].map(a=>pulse(t,a-.3,a+.3)));
   // Lift the flaps: family, uncle, coach.
   const n=manual?act*3:0;const open=[0,1,2].map(i=>Math.max(clamp01(n-i),beat(t,[22.6,24.6,26.6][i],[23.3,25.3,27.3][i])));
   who.forEach((f,i)=>{f.flip=-1.5*open[i];});
   const glow=[mum,uncle,coach];glow.forEach((p,i)=>{const pt=open[i]*(1-beat(t,30,30.6));if(i<2){p.armR.rot=.12+1.5*pt+2.2*beat(t,36+i*.3,36.6+i*.3);p.armL.rot=-.12-2.2*beat(t,36+i*.3,36.6+i*.3);}else{p.armL.rot=-.12-1.5*pt-2.2*beat(t,36+i*.3,36.6+i*.3);}});
   fatherCard.s=Math.max(beat(t,28.4,29.2),manual?beat(act,.8,1):0);coach.armR.rot=.12+1.2*beat(t,28.4,29)-1.2*beat(t,30.6,31.2)+2.2*beat(t,36.6,37.2);
   hearts.forEach((h,i)=>{h.s=beat(t,31.2+i*.5,31.8+i*.5);});
   cheer(H,beat(t,33.6,34.2)*(1-beat(t,35,35.4))+beat(t,37,37.6));mates.forEach((m,i)=>cheer(m,beat(t,37.4+i*.3,38+i*.3)));dad.armL.rot=-.12-2.2*beat(t,36.4,37);
   return b.narrated?-.4*beat(t,1.8,2.8)+.4*beat(t,14.4,15.2)+.35*beat(t,15.2,16)-.35*beat(t,19.2,20)-.3*beat(t,22.2,23)+.3*beat(t,27,27.6):0;
  };
 }};

/* ───────────── 4 · Too small, they said (toosmall) ───────────── */
const toosmall:SpreadDef={id:'toosmall',rest:13.1,
 left:k=>{meadow(k,-5,0);road(k,-1.6,0,Z(.35),.7);
  k.text('TOO LIGHT?',-2.4,Z(2.62),.5,INK.red,{max:3.6});k.text('ONE CLUB SAID NO',-2.4,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{meadow(k,0,5);road(k,0,5,Z(.35),.7);footprints(k,.3,Z(.35),4.7,Z(.35),14,INK.brown);
  k.text('ANOTHER DOOR',2.5,Z(2.62),.44,INK.blue,{max:4});k.text('ZAGREB · MOSTAR · HOME TO ZADAR',2.5,Z(2.9),.15,INK.navy,{weight:800,max:4.2});},
 build:B=>{
  const bd=B.vfold({key:K+'t-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d9',INK.navy,y=>.3-y*.06);peaks(k,4.5,1.5,'#9aa3bd',false,3);const st=rect(.4,1.2,2.6,1.2);k.fill(st,'#d8d0bc');k.dots(st,INK.grey,.04,.3);k.key(st,.013);for(let i=0;i<9;i++)k.fill(rect(.5+i*.28,1.35,.18,.3),INK.navy,.8);k.fill(rect(0,2.4,4.5,.6),'#b9c98a');}},
   {key:K+'t-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.6-y/3*.6);const hill=`M0 1.9 Q1.4 1.3 2.6 1.7 Q3.6 1.9 4.5 1.5 L4.5 3 L0 3 Z`;k.fill(hill,'#a9bd7e');k.dots(hill,INK.green,.05,.3);sea(k,4.5,2.1,.35);roofs(k,2.6,5,2.2,4);k.fill(rect(0,2.45,4.5,.55),'#b9c98a');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'t-sun',.36),'R',3.4,1.9,{out:.012}),stormL=bd.add(stormCloud('t-storm',1.2,.62),'L',2.4,1.1,{out:.03});
  const closed=B.stand(gatePost('t-closed',1.5,1.5,'BIG CLUB'),-3.6,-1.3,{layer:1});
  const cl=closed.add(gateLeaf('t-clL',.6,1.05,INK.navy),-.31,0,{anchor:'bottom',z:.01}),cr=closed.add(gateLeaf('t-clR',.6,1.05,INK.navy),.31,0,{anchor:'bottom',z:.01});void cl;void cr;
  const chart=B.stand(heightChart('t-chart',.35,1.5),-3.15,-.25,{layer:2,s:0});
  const H=B.person(K+'t-luka',-2.75,-.1,1.05,{shirt:'bib',...LUKA,legs:'kick',face:'shy',layer:2});
  const stamps=[B.stand(stamp('t-young',.9,.34,'TOO YOUNG'),-4.2,1.2,{layer:3,s:0}),B.stand(stamp('t-light',.9,.34,'TOO LIGHT'),-3.9,1.85,{layer:3,s:0})];
  const jball=B.stand(S.ball(K+'t-jball',.1),-2.4,.05,{layer:2,tab:false,s:0});
  const gate=B.stand(gatePost('t-gate',1.45,1.55,'OPEN'),-.9,.75,{layer:3});
  const gl=gate.flap(gateLeaf('t-gL',.56,1.1,INK.gold),-1.45/2+.16,0,{anchor:'bl',axis:'y',z:.012}),gr=gate.flap(gateLeaf('t-gR',.56,1.1,INK.gold),1.45/2-.16,0,{anchor:'br',axis:'y',z:.012});
  const coachP=B.person(K+'t-coach',-2.15,1.15,1.7,{shirt:'coach',hair:'short',adult:true,skin:'#e8b48f',face:'smile',layer:3});
  const signs=[['ZAGREB · 16',.7,-.9,INK.white],['MOSTAR · 2003',2.1,-1.4,INK.yellow]].map(([l,x,z,c],i)=>B.stand(S.sign(K+`t-sg${i}`,1.15,1.2,l as string,c as string),x as number,z as number,{layer:1,s:0}));
  const L2=B.person(K+'t-luka2',1.0,1.25,1.2,{shirt:'navy',...LUKA,number:'10',legs:'kick',face:'smile',layer:3});
  const bigs=[[1.6,.7],[2.6,1.5]].map(([x,z],i)=>B.person(K+`t-big${i}`,x,z,1.45,{shirt:'casual',hair:i?'bald':'short',skin:i?'#b27650':'#f1b88f',face:'open',layer:3}));
  const trophy=B.stand(S.trophy(K+'t-trophy',.5,.85),2.75,-.8,{layer:2,s:0});const poy=B.stand(S.flipCard(K+'t-poy',1.3,.34,'PLAYER OF THE YEAR',INK.pink),2.75,-.2,{layer:2,s:0});
  const flat=B.stand(flats('t-flat',1.2,1.9,'#f2d3a0','#d9a066',3),4.3,-1.5,{layer:1,s:0});
  const homeCard=B.stand(S.flipCard(K+'t-home',.8,.32,'HOME',INK.blue),4.3,-.4,{layer:2,s:0});
  const fam=[B.person(K+'t-mum',4.15,1.55,1.5,{shirt:'coach',hair:'long',adult:true,skin:'#f1b88f',face:'grin',layer:2}),B.person(K+'t-dad',4.65,.8,1.6,{shirt:'keeper',hair:'short',adult:true,skin:'#e8b48f',face:'grin',layer:2})];
  const ball=B.stand(S.ball(K+'t-ball',.11),1.4,1.35,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,13.1):b.t;
   sun.dy=.5*beat(t,13.2,16);closed.s=beat(t,1.8,2.8);chart.s=beat(t,3.2,4);H.body.s=beat(t,3.6,4.4);
   stamps.forEach((s2,i)=>{s2.s=beat(t,5.2+i*1.1,5.8+i*1.1)*(1-beat(t,13.2,14.2));s2.rot=0;});
   stormL.scale=beat(t,7.9,9)*(1-beat(t,12,13.5));stormL.visible=stormL.scale>.02;
   H.body.yaw=-.3*pulse(t,8,11);
   const jug=beat(t,11,11.4)*(1-beat(t,13.4,13.8));jball.s=jug;jball.dy=.35*Math.abs(Math.sin((t-11)*4.5))*jug;H.leg!.rot=-.6*Math.abs(Math.sin((t-11)*4.5))*jug;
   const open=Math.max(beat(t,15,16.4),manual?beat(act,0,.6):0);gl.flip=-1.25*open;gr.flip=1.25*open;gate.s=beat(t,.8,1.8);
   coachP.body.s=beat(t,14.6,15.4);coachP.armR.rot=.12+1.4*beat(t,15.4,16)-1.4*beat(t,19,19.6);
   signs[0].s=Math.max(beat(t,16.6,17.4),manual?beat(act,.55,.8):0);signs[1].s=beat(t,21,21.8);
   L2.body.s=Math.max(beat(t,17.4,18.2),manual?beat(act,.7,.95):0);bigs.forEach((p,i)=>{p.body.s=beat(t,22.2+i*.4,23+i*.4);p.armL.rot=-.12-.6*beat(t,23,23.6);});
   ball.s=L2.body.s;const dr=beat(t,24,27.4);L2.body.x=1.0+2.3*dr;L2.body.z=1.25-.25*dr;ball.x=1.4+2.3*dr;ball.z=1.35-.25*dr;ball.rot=-dr*12;L2.leg!.rot=-.7*Math.abs(Math.sin(t*5))*(t>24&&t<27.4?1:0);
   trophy.s=beat(t,27.6,28.4);poy.s=beat(t,28.2,29);cheer(L2,beat(t,28,28.6)*(1-beat(t,30.4,31)));
   flat.s=beat(t,31,32.2);fam.forEach((p,i)=>{p.body.s=beat(t,32.4+i*.4,33.2+i*.4);p.armR.rot=.12+2.1*beat(t,33.4+i*.3,34+i*.3)+.3*wave(t,34,43,1.2);});homeCard.s=beat(t,34.4,35.2);
   cheer(H,beat(t,38,38.6));H.body.yaw+=0;cheer(coachP,beat(t,38.4,39));if(t>38)cheer(L2,beat(t,38.2,38.8));
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,14.4,15.2)+.45*beat(t,16.4,17.2)-.45*beat(t,37.4,38.2):0;
  };
 }};

/* ───────────── 5 · Called a lightweight (lightweight) ───────────── */
const lightweight:SpreadDef={id:'lightweight',rest:25.6,
 left:k=>{const p=rect(-5,0,5,PAGE_D);k.fill(p,'#cfc6b0');k.dots(p,'#8f8367',.06,.18);for(let x=-4.6;x<-.8;x+=.8)k.key(`M${x} 0 L${x} ${Z(1.1)}`,.012,'#a3967b');river(k,-1.0,0,Z(.9),Z(3.2));
  k.text('LONDON · 2008',-2.8,Z(2.62),.4,INK.navy,{max:3.2});k.text('A HARD START IN ENGLAND',-2.8,Z(2.9),.15,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5);river(k,0,1.0,Z(.9),Z(3.2));chalk(k,`M1.2 ${Z(-2.1)} L5 ${Z(-2.1)}`);chalk(k,`M2.4 ${Z(-2.1)} L2.4 ${Z(-1.1)} L4.6 ${Z(-1.1)} L4.6 ${Z(-2.1)}`);
  k.text('BACK · DECEMBER 2009',3.05,Z(2.62),.3,INK.pink,{max:3.6});k.text('HE SCORED WITH THE LEG HE HAD BROKEN',3.05,Z(2.9),.13,INK.navy,{weight:800,max:3.8});},
 build:B=>{
  const bd=B.vfold({key:K+'l-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#b8bccb',INK.navy,y=>.35-y*.05);skyline(k,4.5,2.3);k.fill(rect(0,2.3,4.5,.7),'#cfc6b0');}},
   {key:K+'l-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.2,2.5,[INK.white,INK.navy,INK.sky,INK.white,INK.yellow],2);lightRig(k,1.2,.3);lightRig(k,3.6,.35);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},-3.05,1.22);
  const rainL=bd.add(stormCloud('l-rainL',1.4,.7),'L',1.3,2.1,{out:.03}),rainR=bd.add(stormCloud('l-rainR',1.2,.6),'L',3.4,2.5,{out:.035});
  const sun=bd.add(S.sun(K+'l-sun',.36),'R',3.6,2.2,{out:.012}),bow=bd.add(S.rainbow(K+'l-bow',3.2,1.3),'R',.4,2.6,{out:.016});
  const sign=B.stand(S.sign(K+'l-sign',1.1,1.1,'LONDON'),-4.45,-.45,{layer:1});const c08=sign.flap(S.flipCard(K+'l-2008',.85,.34,'2008',INK.pink),0,1.1*.56,{z:.03});
  const papers=['LIGHTWEIGHT?','TOO LIGHT','LIGHTWEIGHT!'].map((h,i)=>B.stand(newspaper(`l-news${i}`,.9,1.2,h),-3.5+i*1.0,-.75+(i%2)*.35,{layer:2,s:0}));
  const fth=B.stand(feather('l-feather',.7,.5),-4.3,.95,{layer:3,s:0});const fthCard=B.stand(S.flipCard(K+'l-fthc',1.0,.3,'LIGHT?',INK.white,INK.navy),-4.2,1.5,{layer:3,s:0});
  const arrow=B.stand(S.arrow(K+'l-fwd',1.0,.42,INK.yellow),-2.9,1.95,{layer:3,s:0});const fwdCard=B.stand(S.flipCard(K+'l-fwdc',1.0,.3,'FORWARD',INK.blue),-2.9,1.45,{layer:3,s:0});
  const cal=B.stand(S.scoreboard(K+'l-cal',1.2,1.1,'OUT UNTIL'),-2.35,-1.75,{layer:1,s:0});
  cal.add(S.flipCard(K+'l-dec',.9,.38,'DEC',INK.pink),0,.04,{z:.012});const months=['SEP','OCT','NOV'].map((m,i)=>cal.flap(S.flipCard(K+`l-m${m}`,.9,.38,m,i%2?INK.blue:'#3d5da0'),0,.42,{z:.03-i*.005}));
  const H=B.person(K+'l-luka',-1.75,1.2,1.3,{shirt:'ger',...LUKA,number:'14',legs:'kick',face:'smile',layer:2});
  const deckL=B.flat(S.bridgeDeck(K+'l-deckL',.96,1.25),-.98,1.95,{edge:'left',hinge:-1.45}),deckR=B.flat(S.bridgeDeck(K+'l-deckR',.96,1.25),.98,1.95,{edge:'right',hinge:1.45});
  const goal=B.stand(S.goal(K+'l-goal',1.6,.85),3.5,-1.3,{layer:1});void goal;
  const keeper=B.person(K+'l-keeper',3.5,-.95,1.28,{shirt:'keeper',hair:'short',skin:'#d99a6c',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const mates=[[1.7,-.2,'#7f5138'],[4.4,.6,'#f1b88f']].map(([x,z,sk],i)=>B.person(K+`l-mate${i}`,x as number,z as number,1.25,{shirt:'ger',hair:i?'curly':'short',skin:sk as string,face:'grin',layer:2}));
  const boom=B.stand(pow('l-pow',.3),3.2,-.6,{layer:2,s:0,tab:false});const goalCard=B.stand(S.flipCard(K+'l-goalc',.9,.36,'GOAL!',INK.pink),2.4,1.35,{layer:3,s:0});
  const ball=ballPair(B,'l-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,25.6):b.t;
   c08.flip=-2.9+2.9*beat(t,2.4,3.2);H.body.s=beat(t,3.4,4.3);
   const rain=beat(t,6.8,8)*(1-beat(t,29,31));rainL.scale=rain;rainR.scale=beat(t,19.8,21)*(1-beat(t,29,31));rainL.visible=rainL.scale>.02;rainR.visible=rainR.scale>.02;rainL.dx=.15*wave(t,8,29,.25);
   papers.forEach((p,i)=>{p.s=beat(t,10+i*1.1,10.7+i*1.1)*(1-beat(t,17+i*.4,17.8+i*.4));p.rot=0;});
   const fl=beat(t,12.6,13.3)*(1-beat(t,18.6,19.4));fth.s=fl;fth.rot=.12*wave(t,13.3,18.6,.5);fthCard.s=beat(t,13.2,13.9)*(1-beat(t,18.6,19.4));
   arrow.s=beat(t,15.2,15.9);arrow.dx=.25*wave(t,15.9,19.6,.8);fwdCard.s=beat(t,15.8,16.5)*(1-beat(t,34,35));H.armR.rot=.12+1.2*beat(t,16,16.6)-1.2*beat(t,18.8,19.4);H.body.yaw=0;
   cal.s=beat(t,19.8,20.6);months.forEach((m,i)=>{m.flip=-3.2*beat(t,21.6+i*1.2,22.3+i*1.2);});
   const unfold=Math.max(beat(t,26,27.8),manual?beat(act,0,.6):0);deckL.s=unfold;deckR.s=unfold;
   H.body.x=-1.75+.55*Math.max(beat(t,28.4,29.6),manual?beat(act,.6,.8):0);
   let bx:number,bz:number,dy=0;
   if(manual){[bx,bz]=track(act,[[.75,-.75,1.35],[1,3.35,-1.15]]);dy=.2*pulse(act,.75,1);}
   else{[bx,bz]=track(t,[[0,-.75,1.35],[30,-.75,1.35],[31,3.35,-1.15]]);dy=.25*pulse(t,30,31);}
   ball(bx,bz,dy,t>28.2||manual);H.leg!.rot=-1.1*Math.max(pulse(t,29.7,30.3),manual?pulse(act,.7,.8):0);
   const sc=Math.max(beat(t,31,31.4)*(1-beat(t,33.6,34.2)),manual?beat(act,.95,1):0);boom.s=sc;goalCard.s=Math.max(beat(t,31.2,31.9),manual?beat(act,.95,1):0);
   const dive=Math.max(pulse(t,30.4,31.8),manual?pulse(act,.8,1):0);keeper.body.rot=-.9*dive;keeper.body.dx=.25*dive;keeper.armL.rot=-.12-2.2*dive;keeper.armR.rot=.12+2.2*dive;
   const cel=Math.max(beat(t,31.4,32)*(1-beat(t,33.6,34.2)),beat(t,35.4,36),manual?beat(act,.95,1):0);cheer(H,cel);mates.forEach((m,i)=>{m.body.s=beat(t,27.8+i*.4,28.6+i*.4);cheer(m,Math.max(beat(t,31.8+i*.3,32.4+i*.3),manual?beat(act,.95,1):0));});
   sun.scale=beat(t,31,32);sun.visible=sun.scale>.02;sun.dy=.5*beat(t,31,33);bow.scale=beat(t,34.4,35.6);bow.visible=bow.scale>.02;
   return b.narrated?-.4*beat(t,1.6,2.6)+.4*beat(t,25.2,26)+.5*beat(t,29.8,30.6)-.5*beat(t,34,35):0;
  };
 }};

/* ───────────── 6 · Welcome home (zadar, 2018) ───────────── */
const zadar:SpreadDef={id:'zadar',rest:28.5,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy,.92);chalk(k,`M-5 ${Z(-2.0)} L0 ${Z(-2.0)}`);chalk(k,`M-4.1 ${Z(-2.0)} L-4.1 ${Z(-.9)} L-1.2 ${Z(-.9)} L-1.2 ${Z(-2.0)}`);k.circle(-2.65,Z(.5),.05,INK.white);
  k.text('2018',-2.5,Z(2.62),.56,INK.yellow,{max:2.4});k.text('WORLD CUP · TRY AGAIN',-2.5,Z(2.9),.16,INK.white,{weight:800});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,INK.stone);k.dots(p,'#9f9378',.06,.2);for(let x=.4;x<5;x+=.6)for(let y=.3;y<PAGE_D;y+=.6)k.key(rect(x,y,.5,.5),.008,'#b3a88e');
  k.text('ZADAR',2.5,Z(2.62),.52,INK.pink,{max:3});k.text('TENS OF THOUSANDS WELCOMED HIM HOME',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'z-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.red,INK.white,INK.red,INK.blue,INK.white],1);lightRig(k,1.3,.3);lightRig(k,3.4,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'z-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.5-y/3*.5);sea(k,4.5,1.55,.5);roofs(k,.2,12,2.2,5);hotelFace(k,3.1,1.1,1.1,1.1,'HOTEL');const bell=rect(1.5,.8,.26,1.4);k.fill(bell,'#e7d3a6');k.key(bell,.012);k.fill(poly([[1.48,.8],[1.63,.5],[1.78,.8]]),INK.red);k.fill(rect(0,2.3,4.5,.7),INK.stone);}},-3.05,1.22);
  const fw=[bd.add(S.firework(K+'z-fw1',.4,INK.red),'R',1.2,1.1,{out:.03}),bd.add(S.firework(K+'z-fw2',.36,INK.white),'R',3.4,.9,{out:.03}),bd.add(S.firework(K+'z-fw3',.38,INK.yellow),'R',2.3,1.4,{out:.03})];
  const conf=[bd.add(S.confetti(K+'z-cf1',2.2,1.1,1),'R',.5,1.2,{out:.04}),bd.add(S.confetti(K+'z-cf2',2.2,1.1,3),'R',2.4,1.4,{out:.04})];
  const board=B.stand(S.scoreboard(K+'z-board',1.9,1.45,'WORLD CUP 2018'),-3.85,-1.25,{layer:1});
  board.add(lineCard('z-final',1.5,.66,['FINAL','FRANCE 4–2'],INK.white),0,.36,{z:.012});
  const flaps=[['THROUGH!',INK.pink],['DENMARK','#3d5da0']].map(([l,c],i)=>board.flap(S.flipCard(K+`z-f${i}`,1.5,.66,l,c),-.75,.36,{anchor:'bl',axis:'y',z:.03-i*.006}));
  const goalP=B.stand(S.goal(K+'z-goal',1.7,.85),-2.65,-1.7,{layer:1});void goalP;
  const keeper=B.person(K+'z-keeper',-2.65,-1.3,1.28,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const H=B.person(K+'z-luka',-1.6,.95,1.3,{shirt:'casual',...LUKA,number:'10',legs:'kick',face:'smile',layer:3});
  const saved=B.stand(S.flipCard(K+'z-saved',.8,.3,'SAVED',INK.blue),-4.2,.6,{layer:2,s:0}),again=B.stand(S.flipCard(K+'z-again',1.0,.3,'TRY AGAIN',INK.yellow,INK.navy),-4.1,1.2,{layer:3,s:0});
  const boom=B.stand(pow('z-pow',.28),-2.0,-1.2,{layer:2,s:0,tab:false});
  const gb=B.stand(S.goldenBall(K+'z-gb',.26),-.55,-.3,{layer:2,s:0}),gbCard=B.stand(S.flipCard(K+'z-gbc',1.1,.3,'BEST PLAYER',INK.gold,INK.navy),-.8,.35,{layer:2,s:0});
  const bdo=B.stand(S.trophy(K+'z-bdo',.45,.8),-3.6,1.7,{layer:3,s:0}),bdoCard=B.stand(S.flipCard(K+'z-bdoc',1.1,.3,'BALLON D’OR',INK.gold,INK.navy),-2.6,1.95,{layer:3,s:0});
  const ball=B.stand(S.ball(K+'z-ball',.11),-2.1,.95,{layer:3,tab:false});
  const banner=B.stand(bannerPoles('z-banner',3.0,1.5,['WELCOME HOME','LUKA']),2.4,-1.35,{layer:1,s:0});
  const L2=B.person(K+'z-luka2',2.4,.1,1.3,{shirt:'casual',...LUKA,number:'10',face:'grin',layer:2});
  const fans=[[.8,.6,'coach','long'],[1.4,1.3,'fan','short'],[3.3,1.2,'casual','curly'],[4.2,.4,'fan','bun'],[4.5,1.6,'coach','short'],[.6,1.9,'bib','curly']].map(([x,z,sh,hr],i)=>B.person(K+`z-fan${i}`,x as number,z as number,i%2?1.35:1.15,{shirt:sh as 'fan',hair:hr as 'short',skin:['#f1b88f','#d99a6c','#e8b48f','#b27650'][i%4],face:'grin',adult:i%2===1,layer:3}));
  const flagsP=[0,1].map(i=>B.stand(heart(`z-hr${i}`,.34,INK.red),1.6+i*2.3,-.4,{layer:2,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,28.5):b.t;
   H.body.s=beat(t,1.8,2.6);
   // Penalty in extra time: saved. Shoot-out: scored.
   let bx=-2.1,bz=.95,dy=0,vis=true;
   if(t<6.6){}else if(t<7.6){const u=beat(t,6.6,7.6);bx=-2.1-.5*u;bz=.95-2.05*u;dy=.35*Math.sin(u*Math.PI);}
   else if(t<10.6){bx=-2.6;bz=-1.1;dy=.5;vis=t<9.2;}
   else if(t<11.6){bx=-2.1;bz=.95;vis=t>11;}
   else if(t<12.6){const u=beat(t,11.6,12.6);bx=-2.1-.2*u+(-.9)*u;bz=.95-2.2*u;dy=.45*Math.sin(u*Math.PI)+.15*u;}
   else if(t<15.8){bx=-3.2;bz=-1.25;dy=.15;}
   else{vis=false;}
   ball.x=bx;ball.z=bz;ball.dy=dy;ball.visible=vis;ball.rot=-bx*4;
   H.leg!.rot=-1.1*maxOf([6.6,11.6].map(a=>pulse(t,a-.3,a+.3)));
   const save=pulse(t,6.9,8.6);keeper.armL.rot=-.12-2.1*save;keeper.armR.rot=.12+2.1*save;keeper.body.dy=.15*save;
   const dive=pulse(t,11.8,13.4);keeper.body.rot+=0;keeper.body.rot=.9*dive;keeper.body.dx=.3*dive;
   saved.s=beat(t,8,8.6)*(1-beat(t,20.4,21));again.s=beat(t,10.8,11.4)*(1-beat(t,20.4,21));
   boom.s=beat(t,12.5,12.8)*(1-beat(t,14.4,15));flaps[1].flip=-1.4*beat(t,13,13.6);flaps[0].flip=-1.55*beat(t,16.8,17.4);
   H.body.yaw=0;const hurrah=beat(t,12.8,13.3)*(1-beat(t,15.4,16));cheer(H,hurrah);
   H.armL.rot+=-.3*pulse(t,17.4,20);
   gb.s=beat(t,21,21.8);gbCard.s=beat(t,21.6,22.4);bdo.s=beat(t,23.8,24.6);bdoCard.s=beat(t,24.4,25.2);
   const raise=Math.max(beat(t,28.9,30.4),manual?beat(act,0,.75):0);banner.s=raise;
   L2.body.s=Math.max(beat(t,29.2,30),manual?beat(act,.6,.9):0);
   fans.forEach((f,i)=>{f.body.s=beat(t,26.6+i*.25,27.3+i*.25);const w=Math.max(beat(t,30.6+i*.2,31.2+i*.2),manual?beat(act,.75,1):0);cheer(f,w,.25*wave(t,31.2,42,1.2+i*.1));});
   cheer(L2,Math.max(beat(t,31.4,32),manual?beat(act,.85,1):0));flagsP.forEach((f,i)=>{f.s=Math.max(beat(t,32+i*.5,32.6+i*.5),manual?beat(act,.8,1):0);});
   fw.forEach((f,i)=>{const a=Math.max(beat(t,30.8+i*.5,31.8+i*.5),manual?beat(act,.8+i*.05,.95+i*.05):0);f.scale=a;f.rot=t*.2;f.visible=a>.02;});
   conf.forEach((c,i)=>{const on=t>30.5||manual;c.dy=-1.1+1.3*(manual?beat(act,.8,1):beat(t,30.8+i*.4,33+i*.4));c.visible=on;});
   cheer(H,Math.max(hurrah,beat(t,36,36.6)));
   return b.narrated?-.4*beat(t,1.6,2.6)+.4*beat(t,20.4,21.2)+.55*beat(t,26.2,27)-.55*beat(t,38,39):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={hamlet,hotel,academy,toosmall,lightweight,zadar};
void TAU;void pulse;void wave;void clamp01;
