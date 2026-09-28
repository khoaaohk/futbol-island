/**
 * The six Iniesta pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/iniesta/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown symbolically: a rain cloud that clears, an unlit star, a door to knock on, a message under a shirt.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='iniesta-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
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

/* ───────────── Iniesta plates ───────────── */
const AI={skin:'#f3cfae',hair:'short' as const,hairColor:'#6b4a2f'};
function court(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#e08a5a');k.dots(p,'#b0603a',.06,.2);const c=rect(x0+.35,.5,x1-x0-.7,4.3);k.key(c,.035,INK.white);k.key(`M${(x0+x1)/2} .5 L${(x0+x1)/2} 4.8`,.03,INK.white);k.key(ell((x0+x1)/2,2.65,.5,.5),.03,INK.white);}
function wheat(k:Kit,w:number,y:number){const f=`M0 ${y} Q${w*.5} ${y-.2} ${w} ${y} L${w} 3 L0 3 Z`;k.fill(f,'#e9c46a');k.dots(f,INK.orange,.05,.35);for(let i=0;i<5;i++)k.key(`M0 ${y+.2+i*.18} Q${w*.5} ${y+.05+i*.18} ${w} ${y+.2+i*.18}`,.01,'#c79a3a');}
function windmill(k:Kit,x:number,y:number,s:number){const b=poly([[x-s*.18,y],[x+s*.18,y],[x+s*.12,y-s*.7],[x-s*.12,y-s*.7]]);k.fill(b,INK.white);k.key(b,.01);k.fill(poly([[x-s*.15,y-s*.7],[x,y-s*.88],[x+s*.15,y-s*.7]]),INK.navy);for(let i=0;i<4;i++){const a=i*Math.PI/2+.4;k.key(`M${x} ${y-s*.72} L${x+Math.cos(a)*s*.5} ${y-s*.72+Math.sin(a)*s*.5}`,.02,INK.brown);k.fill(poly([[x+Math.cos(a)*s*.15,y-s*.72+Math.sin(a)*s*.15],[x+Math.cos(a)*s*.5,y-s*.72+Math.sin(a)*s*.5],[x+Math.cos(a+.25)*s*.45,y-s*.72+Math.sin(a+.25)*s*.45],[x+Math.cos(a+.3)*s*.15,y-s*.72+Math.sin(a+.3)*s*.15]]),INK.stone);}}
function whiteHouses(k:Kit,x0:number,n:number,y:number){for(let i=0;i<n;i++){const x=x0+i*.34,h=.22+((i*3)%3)*.06,b=rect(x,y-h,.3,h);k.fill(b,INK.white);k.key(b,.008);k.fill(rect(x+.1,y-h*.6,.08,.08),INK.blue);k.fill(poly([[x-.02,y-h],[x+.15,y-h-.1],[x+.32,y-h]]),'#c96a4a');}}
const farmhouse=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const wall=rect(0,h*.3,w,h*.7);k.fill(wall,'#e9dcc0');k.dots(wall,'#a59a80',.04,.3);k.key(wall,.014);
 for(let i=0;i<14;i++){const x=((i*37)%41)/41*w,y=h*(.35+((i*23)%9)/9*.6);k.key(ell(x,y,.05,.03),.008,'#a59a80');}
 const roof=poly([[-.06,h*.32],[w*.5,h*.02],[w+.06,h*.32]]);k.fill(roof,'#c96a4a');k.hatch(roof,'#8e4f3a',.05,.4,.01);k.key(roof,.014);
 for(let i=0;i<3;i++){const x=w*(.14+i*.28);if(i===1)continue;const wn=rect(x,h*.42,w*.14,h*.14);k.fill(wn,INK.yellow);k.key(wn,.01);k.fill(rect(x-w*.03,h*.42,w*.03,h*.14),INK.green);k.fill(rect(x+w*.14,h*.42,w*.03,h*.14),INK.green);}
 const cl=rect(w*.44,h*.08,w*.12,h*.14);k.fill(cl,INK.white);k.key(cl,.01);k.circle(w*.5,h*.15,w*.035,INK.navy);
 const arch=`M${w*.36} ${h} L${w*.36} ${h*.66} Q${w*.5} ${h*.52} ${w*.64} ${h*.66} L${w*.64} ${h} Z`;k.fill(arch,'#3b2e3f');k.key(arch,.012);
 k.fill(rect(w*.3,h*.3,w*.4,h*.07),INK.navy);k.text('LA MASIA',w/2,h*.36,h*.055,INK.yellow,{max:w*.36,weight:900});});
const archDoor=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const d=`M0 ${h} L0 ${h*.3} Q${w*.5} ${-h*.02} ${w} ${h*.3} L${w} ${h} Z`;k.fill(d,INK.wood);k.dots(d,INK.brown,.03,.35);k.key(d,.012);for(let i=1;i<4;i++)k.key(`M${i*w/4} ${h*.15} L${i*w/4} ${h}`,.008,INK.brown);k.circle(w*.8,h*.62,.02,INK.gold);},{rim:.012});
const bunk=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(const x of [0,w-.06])k.keyFill(rect(x,0,.06,h),INK.wood);for(const y of [h*.3,h*.8]){const m=rect(.06,y-h*.12,w-.12,h*.12);k.fill(m,INK.white);k.key(m,.01);k.fill(rect(.06,y-h*.14,w-.12,h*.04),INK.blue);}k.fill(ell(w*.25,h*.62,w*.1,h*.05),INK.white);k.key(ell(w*.25,h*.62,w*.1,h*.05),.008);});
const miniFrame=(key:string,s:number)=>sp(key,s,s*1.2,k=>{const f=rect(0,0,s,s*1.2);k.fill(f,INK.wood);k.key(f,.012);const m=rect(s*.12,s*.12,s*.76,s*.8);k.fill(m,INK.sky2);for(const [x,c] of [[.35,'#3b2e3f'],[.65,'#6b4a2f']] as const){k.fill(ell(s*x,s*.45,s*.1,s*.12),'#f3cfae');k.fill(`M${s*(x-.1)} ${s*.43} Q${s*x} ${s*.28} ${s*(x+.1)} ${s*.43} Z`,c);k.fill(`M${s*(x-.15)} ${s*.92} Q${s*x} ${s*.55} ${s*(x+.15)} ${s*.92} Z`,x<.5?INK.pink:INK.green);}k.text('HOME',s/2,s*1.1,s*.14,INK.white,{weight:900});});
const tears=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(let i=0;i<5;i++){const x=w*(.15+i*.18),y=h*(.2+(i%2)*.4);k.fill(`M${x} ${y} Q${x+.05} ${y+.1} ${x} ${y+.13} Q${x-.05} ${y+.1} ${x} ${y} Z`,INK.sky);k.key(`M${x} ${y} Q${x+.05} ${y+.1} ${x} ${y+.13} Q${x-.05} ${y+.1} ${x} ${y} Z`,.008,INK.blue);}},{rim:.012});
const starPlate=(key:string,r:number,c:string,glow=false)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:10},(_,i)=>{const a=i/10*TAU-Math.PI/2,rr=i%2?r*.45:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});if(glow)k.dots(ell(r,r,r,r),INK.yellow,.035,.35);k.fill(poly(pts),c);k.dots(poly(pts),glow?INK.orange:INK.navy,.03,.25);k.key(poly(pts),.014);},{rim:.02});
const bandage=(key:string,s:number)=>sp(key,s,s*.45,k=>{const b=`M${s*.1} 0 L${s*.9} 0 Q${s} ${s*.225} ${s*.9} ${s*.45} L${s*.1} ${s*.45} Q0 ${s*.225} ${s*.1} 0 Z`;k.fill(b,'#f0d3b0');k.key(b,.012);k.fill(rect(s*.35,s*.05,s*.3,s*.35),'#e6b98a');for(let i=0;i<3;i++)for(let j=0;j<2;j++)k.circle(s*(.42+i*.08),s*(.16+j*.12),.008,INK.brown);},{rim:.012});
const mic=(key:string,h:number)=>sp(key,h*.4,h,k=>{const w=h*.4;k.keyFill(rect(w*.46,h*.3,w*.08,h*.66),INK.grey);k.keyFill(rect(w*.2,h*.95,w*.6,h*.05),INK.grey);const head=ell(w/2,h*.16,w*.2,h*.14);k.fill(head,INK.navy);k.hatch(head,INK.grey,.02,.7,.006);k.key(head,.012);});
const chair=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{k.fill(rect(0,0,w*.18,h),c);k.key(rect(0,0,w*.18,h),.01);const s=rect(0,h*.5,w,h*.14);k.fill(s,c);k.key(s,.01);k.keyFill(rect(w*.84,h*.6,w*.12,h*.4),c);});
const knockCard=(key:string)=>sp(key,.6,.34,k=>{const b=poly([[0,.17],[.08,0],[.52,0],[.6,.17],[.52,.34],[.08,.34]]);k.fill(b,INK.yellow);k.key(b,.012);k.text('KNOCK',.3,.24,.14,INK.navy,{weight:900});},{rim:.015});
const bigShirt=(key:string,w:number,h:number,front:boolean)=>sp(key,w,h,k=>{const s=poly([[w*.28,0],[w*.72,0],[w,h*.18],[w*.9,h*.36],[w*.78,h*.3],[w*.78,h],[w*.22,h],[w*.22,h*.3],[w*.1,h*.36],[0,h*.18]]);
 if(front){k.fill(s,INK.red);k.dots(s,INK.navy,.035,.2);k.key(s,.016);k.key(`M${w*.4} 0 Q${w*.5} ${h*.12} ${w*.6} 0`,.02,INK.yellow);k.text('6',w/2,h*.62,h*.3,INK.yellow,{weight:900});k.text('LIFT',w/2,h*.9,h*.08,INK.white,{weight:900});}
 else{k.fill(s,INK.white);k.dots(s,INK.sky,.03,.15);k.key(s,.016);k.text('DANI JARQUE',w/2,h*.45,h*.11,INK.navy,{max:w*.52,weight:900});k.text('ALWAYS',w/2,h*.62,h*.1,INK.blue,{max:w*.5,weight:900});k.text('WITH US',w/2,h*.76,h*.1,INK.blue,{max:w*.5,weight:900});}});
const armband=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.yellow);k.dots(b,INK.orange,.03,.3);k.key(b,.012);k.text('C',w/2,h*.78,h*.7,INK.navy,{weight:900});},{rim:.015});
function starPair(B:Builder,key:string,s=.24){const L=B.stand(heart(key,s),-1,1,{layer:3,tab:false}),R=B.stand(heart(key,s),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;}}};}

/* ───────────── 1 · A small village, a big choice (village) ───────────── */
const village:SpreadDef={id:'village',rest:26.6,
 left:k=>{court(k,-5,0);k.text('FUENTEALBILLA',-2.5,Z(2.62),.4,INK.white,{max:4.2});k.text('A SMALL VILLAGE IN SPAIN',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{meadow(k,0,5);road(k,0,5,Z(.4),.7);k.text('LA MASIA',2.5,Z(2.62),.5,INK.blue,{max:3.4});k.text('WHERE BARCELONA’S YOUNG PLAYERS LIVE',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.4});},
 build:B=>{
  B.vfold({key:K+'v-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.55-y/3*.55);wheat(k,4.5,1.7);windmill(k,.8,1.75,.9);windmill(k,1.7,1.7,.7);whiteHouses(k,2.4,6,1.95);k.fill(rect(0,2.5,4.5,.5),'#e08a5a');}},
   {key:K+'v-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.65-y/3*.65);sea(k,4.5,1.6,.5);roofs(k,.2,12,1.95,2);const hill=`M0 2.1 Q1.5 1.7 2.8 2.0 Q3.8 2.2 4.5 1.9 L4.5 3 L0 3 Z`;k.fill(hill,'#b9c98a');k.dots(hill,INK.green,.05,.3);}},-3.05,1.22);
  const sign=B.stand(S.sign(K+'v-sign',1.4,1.15,'FUENTEALBILLA'),-2.4,-1.95,{layer:1});const c12=sign.flap(S.flipCard(K+'v-12',.9,.36,'AGE 12',INK.pink),0,1.15*.56,{z:.03});c12.flip=-2.9;
  const H=B.person(K+'v-ai',-2.5,.6,1.05,{shirt:'bib',...AI,legs:'kick',face:'smile',layer:2});
  const goals=[B.stand(S.goal(K+'v-g1',.9,.5),-4.3,.4,{layer:2,s:0,yaw:.9}),B.stand(S.goal(K+'v-g2',.9,.5),-.7,.4,{layer:2,s:0,yaw:-.9})];
  const kids=[[-3.4,1.2,'#d99a6c','curly'],[-1.6,1.25,'#b27650','bun']].map(([x,z,sk,hr],i)=>B.person(K+`v-kid${i}`,x as number,z as number,1.0,{shirt:'casual',hair:hr as 'short',skin:sk as string,face:'grin',layer:3}));
  const futsal=B.stand(S.flipCard(K+'v-futsal',1.0,.34,'FUTSAL',INK.yellow,INK.navy),-2.5,1.95,{layer:3,s:0});
  const tourn=B.stand(S.sign(K+'v-tourn',1.3,1.1,'7-A-SIDE',INK.yellow),-.9,-1.6,{layer:1,s:0});
  const scouts=[[-4.4,-.5],[-3.6,-.9]].map(([x,z],i)=>B.person(K+`v-scout${i}`,x,z,1.6,{shirt:'coach',hair:i?'cap':'short',adult:true,skin:i?'#b27650':'#f1b88f',face:'open',layer:2}));
  const stars=[0,1,2].map(i=>B.stand(starPlate(`v-star${i}`,.13,INK.yellow),-3.2+i*.35,-.2,{layer:2,s:0,tab:false}));
  const mum=B.person(K+'v-mum',.8,.9,1.55,{shirt:'coach',hair:'long',adult:true,skin:'#f3cfae',hairColor:'#3b2e3f',face:'smile',layer:3});
  const dad=B.person(K+'v-dad',1.4,1.25,1.65,{shirt:'casual',hair:'short',adult:true,skin:'#f3cfae',hairColor:'#3b2e3f',face:'smile',layer:3});
  const coach=B.person(K+'v-coach',3.0,.9,1.65,{shirt:'navy',hair:'short',adult:true,skin:'#f1b88f',hairColor:'#8a7a6a',face:'smile',layer:3});
  const nameC=B.stand(S.flipCard(K+'v-ori',1.1,.3,'ORIZAOLA',INK.blue),3.0,1.7,{layer:3,s:0});
  const house=B.stand(farmhouse('v-farm',2.4,1.8),3.1,-1.35,{layer:1});
  const door=house.flap(archDoor('v-door',2.4*.28,1.8*.34),-2.4*.14,0,{anchor:'bl',axis:'y',z:.02});
  const A2=B.person(K+'v-ai2',.35,1.55,1.05,{shirt:'bib',...AI,face:'grin',layer:3});
  const tick=B.stand(S.icon(K+'v-tick',.34,'tick'),4.4,1.4,{layer:3,s:0});
  const hearts=[0,1,2].map(i=>B.stand(heart(`v-h${i}`,.26),.6+i*.55,2.15,{layer:3,s:0}));
  const ball=ballPair(B,'v-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,26.6):b.t;
   H.body.s=beat(t,3,3.8)*(1-beat(t,28.8,29.6));c12.flip=-2.9+2.9*beat(t,15.6,16.4);
   goals.forEach((g,i)=>{g.s=beat(t,8.2+i*.4,9+i*.4);});kids.forEach((k2,i)=>{k2.body.s=beat(t,9+i*.5,9.8+i*.5);});futsal.s=beat(t,11,11.7)*(1-beat(t,15.2,15.8));
   let bx:number,bz:number;[bx,bz]=track(t,[[0,-2.1,.7],[11.8,-2.1,.7],[12.4,-3.1,1.25],[13,-3.1,1.25],[13.6,-1.9,1.3],[14.2,-1.9,1.3],[14.8,-.9,.45],[17.4,-.9,.45],[17.6,-2.1,.7],[18.6,-2.1,.7],[19.3,-4.1,.45]]);
   ball(bx,bz,0,t>8.6&&t<29);H.leg!.rot=-1*maxOf([11.8,18.6].map(a=>pulse(t,a-.3,a+.3)));
   tourn.s=beat(t,15.6,16.4);scouts.forEach((s2,i)=>{s2.body.s=beat(t,17+i*.5,17.8+i*.5);s2.armR.rot=.12+1.5*beat(t,19+i*.3,19.6+i*.3)-1.5*beat(t,21.6,22.2);});stars.forEach((s2,i)=>{s2.s=beat(t,19.6+i*.4,20.2+i*.4)*(1-beat(t,28.4,29));});
   mum.body.s=beat(t,22,22.8);dad.body.s=beat(t,22.4,23.2);coach.body.s=beat(t,23.8,24.6);nameC.s=beat(t,24.4,25.1)*(1-beat(t,28.4,29));
   const shake=beat(t,24.8,25.3)*(1-beat(t,26.4,26.9));dad.armR.rot=.12+1.2*shake;coach.armL.rot=-.12-1.2*shake;
   const open=Math.max(beat(t,29.8,31),manual?beat(act,0,.7):0);door.flip=-1.3*open;
   A2.body.s=Math.max(beat(t,29,29.8),manual?beat(act,.3,.6):0);
   const walk=beat(t,31.2,34.6);A2.body.x=.35+1.9*walk;A2.body.z=1.55-.85*walk;mum.body.x=.8+1.6*walk;mum.body.z=.9-.5*walk;dad.body.x=1.4+1.5*walk;dad.body.z=1.25-.3*walk;
   tick.s=Math.max(beat(t,35.4,36),manual?beat(act,.8,1):0);hearts.forEach((h,i)=>{h.s=beat(t,37.4+i*.5,38+i*.5);});
   [mum,dad,coach,A2].forEach((p,i)=>{if(t>37.5)cheer(p,beat(t,37.8+i*.3,38.4+i*.3));});
   return b.narrated?-.4*beat(t,2.4,3.4)+.4*beat(t,21.6,22.4)+.45*beat(t,22.4,23.4)-.45*beat(t,37,38):0;
  };
 }};

/* ───────────── 2 · Crying rivers (masia) ───────────── */
const masia:SpreadDef={id:'masia',rest:15.3,
 left:k=>{meadow(k,-5,0);road(k,-5,0,Z(.9),.7);k.text('THE DAY HE LEFT',-2.5,Z(2.62),.42,INK.blue,{max:4});k.text('HE LATER SAID HE CRIED RIVERS',-2.5,Z(2.9),.15,INK.navy,{weight:800});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,INK.stone);k.dots(p,'#9f9378',.05,.25);for(let x=.3;x<5;x+=.7)for(let y=.3;y<PAGE_D;y+=.5)k.key(rect(x,y,.6,.4),.008,'#b3a88e');
  k.text('LA MASIA',2.5,Z(2.62),.5,INK.pink,{max:3.4});k.text('MISSING HOME IS OKAY',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'m-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d9',INK.navy,y=>.3-y*.06);wheat(k,4.5,1.9);whiteHouses(k,.4,8,2.1);k.fill(rect(0,2.6,4.5,.4),'#b9c98a');}},
   {key:K+'m-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);roofs(k,.2,12,2.0,5);k.fill(rect(0,2.3,4.5,.7),INK.stone);}},-3.05,1.22);
  const cloud=bd.add(stormCloud('m-cloud',2.0,1.0),'L',1.8,1.5,{out:.03}),sunP=bd.add(S.sun(K+'m-sun',.36),'R',3.6,2.0,{out:.012}),bow=bd.add(S.rainbow(K+'m-bow',3.2,1.3),'R',.5,2.5,{out:.016});
  const farm=B.stand(farmhouse('m-farm',2.2,1.7),3.3,-1.45,{layer:1});void farm;
  const mum=B.person(K+'m-mum',-4.3,.4,1.55,{shirt:'coach',hair:'long',adult:true,skin:'#f3cfae',hairColor:'#3b2e3f',face:'open',layer:2}),dad=B.person(K+'m-dad',-3.6,.1,1.65,{shirt:'casual',hair:'short',adult:true,skin:'#f3cfae',hairColor:'#3b2e3f',face:'open',layer:2});
  const H=B.person(K+'m-ai',-1.8,.9,1.05,{shirt:'bib',...AI,face:'sad',layer:3,holdR:'suitcase'});
  const drops=B.stand(tears('m-tears',.6,.5),-1.2,.75,{layer:3,s:0,tab:false});
  const A2=B.person(K+'m-ai2',1.3,.55,1.05,{shirt:'navy',...AI,legs:'kick',face:'shy',layer:2});
  const bed=B.stand(bunk('m-bunk',.9,1.2),.6,-1.2,{layer:1,s:0});const photo=B.stand(miniFrame('m-photo',.36),1.85,.9,{layer:3,s:0});
  const shy=B.stand(S.flipCard(K+'m-shy',.7,.3,'SHY',INK.sky,INK.navy),1.3,1.5,{layer:3,s:0});
  const boys=[[3.0,.3,'#d99a6c','curly'],[3.8,.9,'#7f5138','short'],[4.5,.1,'#f1b88f','bun']].map(([x,z,sk,hr],i)=>B.person(K+`m-boy${i}`,x as number,z as number,1.05,{shirt:'navy',hair:hr as 'short',skin:sk as string,legs:i===0?'kick':undefined,face:'grin',layer:2}));
  const bigH=B.stand(heart('m-bigheart',.6),-2.6,1.7,{layer:3,s:0});const flyH=starPair(B,'m-fly',.22);
  const ball=B.stand(S.ball(K+'m-ball',.1),3.4,.55,{layer:2,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15.3):b.t;
   H.body.s=beat(t,2,2.8);mum.body.s=beat(t,2.4,3.2);dad.body.s=beat(t,2.8,3.6);
   const clr=Math.max(beat(t,16,17.4),manual?beat(act,0,.8):0);cloud.scale=beat(t,3,4.2)*(1-clr);cloud.visible=cloud.scale>.02;cloud.dx=.3*beat(t,3,15);
   drops.s=beat(t,5,5.6)*(1-clr);drops.dy=.04*Math.sin(t*4);
   [mum,dad].forEach((p,i)=>{p.armR.rot=.12+1.9*beat(t,4.4+i*.3,5+i*.3)+.3*wave(t,5,15,1.2+i*.2);});H.body.x=-1.8+.6*beat(t,6,7.3);H.body.yaw=-.4*beat(t,5,6);
   A2.body.s=beat(t,7.5,8.3);bed.s=beat(t,7.9,8.7);photo.s=beat(t,9.2,9.9);A2.armR.rot=.12+.9*beat(t,9.6,10.2)-.9*beat(t,11.6,12);
   boys.forEach((p,i)=>{p.body.s=beat(t,12.2+i*.4,13+i*.4);});shy.s=beat(t,13.2,13.9)*(1-beat(t,24.6,25.2));A2.body.yaw=-.35*beat(t,13,13.8)*(1-beat(t,24.4,25));
   sunP.scale=clr;sunP.visible=clr>.02;sunP.dy=.5*clr;bow.scale=Math.max(beat(t,29.4,30.6),manual?beat(act,.8,1):0);bow.visible=bow.scale>.02;
   bigH.s=beat(t,17.6,18.3);bigH.scale=1+.08*Math.max(0,Math.sin(t*6))*(t>18?1:0);
   const fu=beat(t,20.6,23.6);flyH(-2.4+4.0*fu,1.5-.8*fu,.9+.35*Math.sin(fu*Math.PI),t>20.5&&t<24.4);
   A2.armL.rot=-.12-1.4*beat(t,23.4,23.9)+1.4*beat(t,24.4,24.9);
   // Training with the other boys.
   ball.s=beat(t,24.1,24.6);const pts=[[3.4,.55],[1.7,.6],[3.95,1.1],[1.7,.6],[4.6,.35]];const seg=(t-24.6)/1.1;let bx=3.4,bz=.55;if(seg>0){const i=Math.min(3,Math.floor(seg)),u=smooth(Math.min(1,seg-i));bx=pts[i][0]+(pts[i+1][0]-pts[i][0])*u;bz=pts[i][1]+(pts[i+1][1]-pts[i][1])*u;}ball.x=bx;ball.z=bz;ball.rot=-bx*6;
   A2.body.x=1.3+.4*beat(t,24.4,25);A2.leg!.rot=-1*maxOf([25.7,27.9].map(a=>pulse(t,a-.3,a+.3)));boys[0].leg!.rot=-1*pulse(t,24.3,24.9);
   [A2,...boys].forEach((p,i)=>{if(t>29)cheer(p,beat(t,29.4+i*.3,30+i*.3));});cheer(H,0);H.armL.rot=-.12;
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,7,8)+.45*beat(t,8,8.8)-.45*beat(t,16,16.8)+.4*beat(t,24,24.8)-.4*beat(t,29,30):0;
  };
 }};

/* ───────────── 3 · Quiet, and a captain (shy) ───────────── */
const shyPage:SpreadDef={id:'shy',rest:19.0,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.0)} L0 ${Z(-2.0)}`);chalk(k,ell(0,Z(-.3),1.0,1.0));chalk(k,`M-4.6 ${Z(-2.0)} L-4.6 ${Z(-1.0)} L-2.4 ${Z(-1.0)} L-2.4 ${Z(-2.0)}`);
  k.text('1999',-2.5,Z(2.62),.56,INK.blue,{max:2.4});k.text('UNDER-15 CAPTAIN',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pitch(k,0,5,'#7fb35f');chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);chalk(k,ell(0,Z(-.3),1.0,1.0));
  k.text('QUIET · BRAVE',2.5,Z(2.62),.44,INK.pink,{max:3.8});k.text('YOU CAN LEAD IN YOUR OWN WAY',2.5,Z(2.9),.15,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'s-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.3,2.5,[INK.blue,INK.red,INK.yellow,INK.white,INK.blue],1);lightRig(k,1.2,.4);lightRig(k,3.6,.45);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},
   {key:K+'s-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);const hills=`M0 1.9 Q1.4 1.4 2.6 1.7 Q3.6 1.9 4.5 1.6 L4.5 3 L0 3 Z`;k.fill(hills,INK.leaf);k.dots(hills,INK.green,.05,.3);k.fill(rect(0,2.4,4.5,.6),'#7fb35f');}},-3.05,1.22);
  const ban=bd.add(S.banner(K+'s-ban',2.6,.4,'PREMIER CUP 1999',INK.blue),'L',.5,2.85,{out:.02});
  const conf=bd.add(S.confetti(K+'s-cf',2.2,1.1,3),'L',.8,1.3,{out:.04});
  const board=B.stand(S.scoreboard(K+'s-board',1.7,1.35,'FINAL'),-1.3,-1.6,{layer:1,s:0});board.add(lineCard('s-win',1.35,.6,['WINNING','GOAL!'],INK.pink,INK.white),0,.38,{z:.012});
  const lastMin=board.flap(lineCard('s-last',1.35,.6,['LAST','MINUTE'],'#3d5da0',INK.white),0,.98,{z:.024});
  B.stand(S.goal(K+'s-goal',1.6,.8),-3.5,-1.75,{layer:1});
  const keeper=B.person(K+'s-keeper',-3.5,-1.3,1.15,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const H=B.person(K+'s-ai',-1.9,.7,1.1,{shirt:'navy',...AI,legs:'kick',face:'shy',layer:2});
  const band=H.body.add(armband('s-band',.13,.11),-.26,H.h*.62,{anchor:'center',z:.02});
  const mates=[[-4.3,.9,'#d99a6c','curly'],[-.7,1.2,'#7f5138','short'],[-3.0,1.6,'#f1b88f','bun']].map(([x,z,sk,hr],i)=>B.person(K+`s-m${i}`,x as number,z as number,1.05,{shirt:'navy',hair:hr as 'short',skin:sk as string,face:'grin',layer:3}));
  const capCard=B.stand(S.flipCard(K+'s-cap',1.0,.3,'CAPTAIN',INK.yellow,INK.navy),-1.9,-.2,{layer:2,s:0});
  const bandFly=B.stand(armband('s-fly',.3,.24),-3.0,1.6,{layer:3,s:0,tab:false});B.slot(-3.0,1.8,-2.0,1.0);
  const best=B.stand(starPlate('s-best',.22,INK.gold,true),-.6,.2,{layer:2,s:0});const bestCard=B.stand(S.flipCard(K+'s-bestc',1.2,.3,'BEST PLAYER',INK.gold,INK.navy),-.8,.7,{layer:2,s:0});
  const pep=B.person(K+'s-pep',2.0,.1,1.72,{shirt:'navy',hair:'bald',adult:true,number:'4',skin:'#f1b88f',face:'smile',layer:2});
  const xavi=B.person(K+'s-xavi',3.3,.3,1.65,{shirt:'navy',hair:'short',adult:true,number:'6',skin:'#e8b48f',hairColor:'#3b2e3f',face:'open',layer:2});
  const bub=pep.body.add(S.bubble(K+'s-bub',.62,.52,'star'),.55,pep.h*1.02,{z:-.02});
  const A2=B.person(K+'s-ai2',4.3,1.3,1.05,{shirt:'navy',...AI,face:'shy',layer:3});
  const cards=[['QUIET',INK.sky],['BRAVE',INK.pink]].map(([l,c],i)=>B.stand(S.flipCard(K+`s-q${i}`,.9,.32,l,c,INK.navy),1.2+i*2.0,1.7,{layer:3,s:0}));
  const ball=B.stand(S.ball(K+'s-ball',.1),-1.5,.8,{layer:2,tab:false});B.stand(S.goal(K+'s-goal2',1.4,.75),3.9,-1.8,{layer:1});B.stand(S.bench(K+'s-bench',1.1,.45),1.0,-1.5,{layer:1});for(const [x,z] of [[.7,.9],[2.7,1.0],[4.6,.2]])B.stand(S.cone(K+`s-cone${x}`,.3),x,z,{layer:2});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.0):b.t;
   H.body.s=beat(t,2.2,3);ban.dy=.04*wave(t,5,38,.6);
   mates.forEach((m,i)=>{m.body.s=beat(t,5.4+i*.4,6.2+i*.4);});capCard.s=beat(t,6.6,7.3)*(1-beat(t,12,12.6));
   // The captain's armband is passed hand to hand along a slot, then appears on his arm.
   const pass=Math.max(beat(t,8,10),manual?beat(act,0,.8):0);bandFly.s=Math.max(beat(t,7.4,8),manual?1:0)*(1-Math.max(beat(t,10,10.4),manual?beat(act,.8,.9):0));bandFly.x=-3.0+1.0*pass;bandFly.z=1.6-.6*pass;bandFly.dy=.5*Math.sin(pass*Math.PI);
   band.scale=Math.max(beat(t,10,10.4),manual?beat(act,.8,.95):0);mates[2].armR.rot=.12+1.5*Math.max(beat(t,7.6,8.2)*(1-beat(t,10,10.5)),manual?1-beat(act,.8,1):0);
   board.s=beat(t,12.2,13);lastMin.flip=-3.2*beat(t,15,15.6);
   const u=beat(t,13.6,14.6);ball.x=-1.5-2.0*u;ball.z=.8-2.3*u;ball.dy=.3*Math.sin(u*Math.PI);H.leg!.rot=-1.1*pulse(t,13.3,13.9);ball.visible=t<18;
   const dive=pulse(t,13.9,15.2);keeper.body.rot=-.9*dive;keeper.body.dx=.25*dive;
   cheer(H,beat(t,14.8,15.4)*(1-beat(t,18.2,18.8))+(manual?beat(act,.9,1):0));mates.forEach((m,i)=>cheer(m,beat(t,15+i*.2,15.6+i*.2)*(1-beat(t,18.2,18.8))));
   conf.dy=-1.1+1.3*beat(t,15,17.2);conf.visible=t>14.9;best.s=beat(t,16.4,17.1);bestCard.s=beat(t,16.9,17.6);
   pep.body.s=beat(t,21.6,22.4);xavi.body.s=beat(t,22.6,23.4);A2.body.s=beat(t,23.6,24.4);
   bub.scale=beat(t,25.4,26)*(1-beat(t,31,31.6));bub.visible=bub.scale>.02;pep.armR.rot=.12+1.4*beat(t,26.4,27)-1.4*beat(t,30.4,31);xavi.body.yaw=.4*pulse(t,26,31);xavi.armL.rot=-.12-.6*pulse(t,27.6,30.6);
   cards.forEach((c,i)=>{c.s=beat(t,31.6+i*.8,32.3+i*.8);});cheer(A2,beat(t,35,35.6));
   return b.narrated?-.4*beat(t,1.8,2.8)+.4*beat(t,19.8,20.6)+.45*beat(t,21.2,22)-.45*beat(t,34,35):0;
  };
 }};

/* ───────────── 4 · Losing a friend (jarque) ───────────── */
const jarque:SpreadDef={id:'jarque',rest:18.3,
 left:k=>{pitch(k,-5,0,'#4f7f6a',INK.navy,.9);chalk(k,`M-5 ${Z(-2.0)} L0 ${Z(-2.0)}`);for(let i=0;i<6;i++)k.circle(-4.5+i*.55,Z(1.5),.05,INK.orange);
  k.text('AUGUST 2009',-2.5,Z(2.62),.44,INK.yellow,{max:4});k.text('LOSING A FRIEND',-2.5,Z(2.9),.16,INK.white,{weight:800});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#5f7f6a');k.dots(p,INK.navy,.06,.3);for(let i=0;i<20;i++)k.key(`M${.2+((i*37)%41)/41*4.6} ${.3+((i*53)%47)/47*5.4} l.04 -.1`,.012,INK.leaf);
  k.text('FOR DANI',2.5,Z(2.62),.5,INK.yellow,{max:3.4});k.text('A FRIEND REMEMBERED',2.5,Z(2.9),.16,INK.white,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'j-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3,'#2a3560',INK.blue);roofs(k,.2,12,2.2,3);k.fill(rect(0,2.2,4.5,.8),'#4f7f6a');}},
   {key:K+'j-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3,'#26305a',INK.navy);const hill=`M0 2.0 Q1.5 1.6 2.8 1.9 Q3.8 2.1 4.5 1.8 L4.5 3 L0 3 Z`;k.fill(hill,'#3f5f55');k.dots(hill,INK.navy,.05,.3);}},-3.05,1.22);
  const greyStar=bd.add(starPlate('j-grey',.4,'#8d93a8'),'R',2.0,1.3,{out:.02}),gold=bd.add(starPlate('j-gold',.46,INK.yellow,true),'R',1.95,1.25,{out:.03});
  const low=bd.add(stormCloud('j-low',1.4,.7),'L',1.3,2.3,{out:.03});
  const H=B.person(K+'j-ai',-2.0,1.0,1.3,{shirt:'navy',...AI,legs:'kick',face:'smile',layer:2});
  const kits=[['BARCELONA',INK.blue],['SPAIN',INK.red]].map(([l,c],i)=>B.stand(S.flipCard(K+`j-kit${i}`,1.1,.32,l,c),-3.9+i*1.3,-1.6,{layer:1,s:0}));
  const bands=[0,1,2].map(i=>B.stand(bandage(`j-band${i}`,.4),-4.3+i*.55,1.2,{layer:3,s:0}));
  const dani=B.person(K+'j-dani',-.9,.8,1.3,{shirt:'fan',hair:'short',skin:'#f1b88f',hairColor:'#3b2e3f',face:'grin',layer:2});
  const date=B.stand(S.flipCard(K+'j-date',1.3,.32,'8 AUGUST 2009',INK.white,INK.navy),-2.6,-.7,{layer:2,s:0});
  const chair=B.stand(S.bench(K+'j-bench',1.3,.55),1.7,-.5,{layer:2,s:0});
  const flowers=[0,1,2].map(i=>B.stand(flowerP(`j-fl${i}`,.6,[INK.white,INK.sky,INK.yellow][i]),1.25+i*.35,.2,{layer:3,s:0}));
  B.stand(S.lamp(K+'j-lamp',.4,1.8),.6,-1.4,{layer:1});B.stand(S.tree(K+'j-tree',1.0,1.5,'cypress','#3f5f55'),4.4,-1.2,{layer:1});B.stand(S.bush(K+'j-bush',.9,.34,'#3f5f55'),4.2,1.9,{layer:3,tab:false});
  const name=B.stand(S.flipCard(K+'j-name',.9,.32,'DANI',INK.sky,INK.navy),3.2,.9,{layer:3,s:0});
  const tired=B.stand(S.flipCard(K+'j-tired',.9,.3,'TIRED',INK.grey,INK.navy),-3.3,1.9,{layer:3,s:0});
  const cones=[[-4.4,.3],[-3.6,.5],[-2.8,.2]].map(([x,z])=>B.stand(S.cone(K+`j-cone${x}`,.3),x,z,{layer:2}));void cones;
  const ball=B.stand(S.ball(K+'j-ball',.1),-1.6,1.1,{layer:2,tab:false});
  const hearts=[0,1].map(i=>B.stand(heart(`j-h${i}`,.26),2.6+i*.9,1.8,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.3):b.t;
   H.body.s=beat(t,2.2,3);kits.forEach((c,i)=>{c.s=beat(t,3.4+i*.7,4.1+i*.7);});bands.forEach((q,i)=>{q.s=beat(t,6.6+i*.6,7.2+i*.6);});
   dani.body.s=beat(t,10,10.8)*(1-beat(t,15.6,17));dani.armL.rot=-.12-1.0*beat(t,11,11.6)*(1-beat(t,14.6,15.2));H.armR.rot=.12+1.0*beat(t,11,11.6)*(1-beat(t,14.6,15.2));date.s=beat(t,12.2,12.9);
   chair.s=beat(t,16.4,17.2);flowers.forEach((f,i)=>{f.s=beat(t,17+i*.3,17.6+i*.3);});
   const light=Math.max(beat(t,18.8,20.2),manual?beat(act,0,.8):0);gold.scale=light;gold.visible=light>.02;greyStar.scale=beat(t,16.6,17.6)*(1-light*.99);greyStar.visible=greyStar.scale>.02;gold.rot=.05*Math.sin(t);
   name.s=Math.max(beat(t,19.6,20.3),manual?beat(act,.6,.9):0);
   low.scale=beat(t,20.6,22)*(1-.5*beat(t,35,38));low.visible=low.scale>.02;H.body.yaw=-.35*beat(t,21,22);H.body.x=-2.0-1.2*beat(t,24.6,26);
   const tries=[25.6,26.8];ball.x=-1.6-1.2*beat(t,24.6,26)-.3*maxOf(tries.map(a=>pulse(t,a,a+.5)));H.leg!.rot=-.5*maxOf(tries.map(a=>pulse(t,a-.2,a+.3)));tired.s=beat(t,27.6,28.3);
   hearts.forEach((h,i)=>{h.s=beat(t,35+i*.6,35.6+i*.6);});
   return b.narrated?-.35*beat(t,1.6,2.6)+.35*beat(t,9.4,10.2)+.55*beat(t,16,17)-.55*beat(t,20.4,21.2)+.4*beat(t,34.6,35.4):0;
  };
 }};
const flowerP=(key:string,h:number,c:string)=>sp(key,h*.5,h,k=>{const w=h*.5;k.key(`M${w/2} ${h} L${w/2} ${h*.35}`,.018,INK.green);for(let i=0;i<6;i++){const a=i/6*TAU;k.fill(ell(w/2+Math.cos(a)*w*.2,h*.22+Math.sin(a)*w*.2,w*.14,w*.14),c);}k.circle(w/2,h*.22,w*.1,INK.yellow);},{rim:.012});

/* ───────────── 5 · Asking for help (help) ───────────── */
const help:SpreadDef={id:'help',rest:14.6,
 left:k=>{meadow(k,-5,0);footprints(k,-4.2,Z(1.2),-.4,Z(.6),10,INK.brown);k.text('NOT ALONE',-2.5,Z(2.62),.48,INK.blue,{max:3.8});k.text('HE ASKED FOR HELP',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#e9dcc0');k.dots(p,'#a59a80',.05,.2);const rug=ell(2.6,Z(.4),1.6,.9);k.fill(rug,INK.pink,.7);k.dots(rug,INK.orange,.04,.35);k.key(rug,.02);
  k.text('SPEAKING UP',2.5,Z(2.62),.44,INK.pink,{max:3.8});k.text('HELPS OTHERS KNOW THEY ARE NOT ALONE',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'h-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9c3d9',INK.navy,y=>.3-y*.06);const hill=`M0 2.0 Q1.4 1.5 2.6 1.8 Q3.6 2.0 4.5 1.7 L4.5 3 L0 3 Z`;k.fill(hill,'#a9bd7e');k.dots(hill,INK.green,.05,.3);}},
   {key:K+'h-bdR',w:4.5,h:3,paint:k=>{const wl=rect(0,0,4.5,3);k.fill(wl,'#f6e4c0');k.dots(wl,INK.orange,.05,.12);for(let x=.3;x<4.5;x+=.5)k.key(`M${x} 0 L${x} 3`,.008,'#e3c89a');const win=rect(2.6,.6,1.2,.9);k.fill(win,INK.sky2);k.key(win,.014);k.key(`M3.2 .6 L3.2 1.5 M2.6 1.05 L3.8 1.05`,.012);k.fill(rect(0,2.4,4.5,.6),'#e9dcc0');}},-3.05,1.22);
  const cloud=bd.add(stormCloud('h-cloud',1.3,.66),'L',1.2,2.1,{out:.03}),sunP=bd.add(S.sun(K+'h-sun',.34),'L',3.2,2.2,{out:.012});
  const H=B.person(K+'h-ai',-3.4,.8,1.3,{shirt:'casual',...AI,face:'shy',layer:2});
  const wall=B.stand(sp('h-wall',1.5,1.9,k=>{const b=rect(0,0,1.5,1.9);k.fill(b,'#f6e4c0');k.dots(b,INK.orange,.04,.15);k.key(b,.014);const d=rect(.45,.7,.6,1.2);k.fill(d,'#3b2e3f');k.key(d,.012);const s=rect(.2,.2,1.1,.3);k.fill(s,INK.teal);k.key(s,.01);k.text('HELP',.75,.43,.2,INK.white,{weight:900});}),.9,-1.0,{layer:1});
  const door=wall.flap(archDoor('h-door',.6,1.2),-.3,0,{anchor:'bl',axis:'y',z:.02});
  const inma=B.person(K+'h-inma',1.75,-.55,1.6,{shirt:'coach',hair:'long',adult:true,skin:'#f1b88f',hairColor:'#c9a46a',face:'smile',layer:1});
  const nameC=B.stand(S.flipCard(K+'h-name',1.2,.3,'PSYCHOLOGIST',INK.teal),2.4,-.5,{layer:2,s:0});
  const bubs=[B.stand(S.bubble(K+'h-b1',.6,.5,'dots'),-2.8,1.6,{layer:3,s:0}),B.stand(S.bubble(K+'h-b2',.6,.5,'heart'),-1.9,1.8,{layer:3,s:0})];
  const knocks=[0,1,2].map(i=>B.stand(knockCard(`h-k${i}`),-1.0+i*.0,-.2+i*.45,{layer:2,s:0,tab:false}));
  const A2=B.person(K+'h-ai2',3.6,.5,1.3,{shirt:'casual',...AI,face:'smile',layer:2});
  const micP=B.stand(mic('h-mic',.9),3.0,.8,{layer:3,s:0});const yr=B.stand(S.flipCard(K+'h-2018',.8,.32,'2018',INK.pink),4.3,-.6,{layer:2,s:0});
  const chairs=[B.stand(chair('h-ch1',.6,.7,INK.blue),4.4,.1,{layer:2,s:0}),B.stand(chair('h-ch2',.6,.7,INK.orange),2.1,.45,{layer:2,s:0})];
  const spoke=B.stand(S.bubble(K+'h-spoke',.7,.58,'heart'),4.0,1.35,{layer:3,s:0});
  const others=[[1.0,1.5,'#7f5138','curly'],[1.9,1.9,'#d99a6c','bun'],[4.6,1.8,'#b27650','short']].map(([x,z,sk,hr],i)=>B.person(K+`h-o${i}`,x as number,z as number,1.1,{shirt:(['bib','fan','navy'] as const)[i],hair:hr as 'short',skin:sk as string,face:'grin',layer:3}));
  const hearts=[0,1,2].map(i=>B.stand(heart(`h-h${i}`,.26),-4.3+i*.8,2.1,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.6):b.t;
   H.body.s=beat(t,2,2.8);cloud.scale=beat(t,2.4,3.4)*(1-.7*beat(t,24,28))*(manual?1-.5*act:1);cloud.visible=cloud.scale>.02;
   const walk=beat(t,5.4,8.6);H.body.x=-3.4+2.4*walk;H.body.z=.8-.4*walk;nameC.s=beat(t,7.6,8.3);
   bubs.forEach((q,i)=>{q.s=beat(t,10+i*1.8,10.7+i*1.8)*(1-beat(t,14,14.6));});
   const n=manual?act*3:0;knocks.forEach((q,i)=>{q.s=manual?(n>i+.01?1:0)*(1-beat(act,.9,1)):beat(t,15+i*.5,15.3+i*.5)*(1-beat(t,17.4,17.9));});
   const open=Math.max(beat(t,16.6,17.6),manual?beat(act,.67,1):0);door.flip=-1.3*open;H.armR.rot=.12+1.3*Math.max(pulse(t,14.9,16.6),manual?pulse(act,0,.66):0);
   inma.body.s=open;inma.armL.rot=-.12-1.1*open*(1-beat(t,22,22.6));
   A2.body.s=beat(t,17.2,18);micP.s=beat(t,18,18.6);yr.s=beat(t,18.4,19.1);chairs.forEach((c,i)=>{c.s=beat(t,17.4+i*.3,18+i*.3);});
   spoke.s=beat(t,23,23.7);A2.armR.rot=.12+1.1*beat(t,23.2,23.8)-1.1*beat(t,29.6,30.2);
   others.forEach((p,i)=>{p.body.s=beat(t,30.9+i*.4,31.7+i*.4);cheer(p,beat(t,32+i*.3,32.6+i*.3)*.7+.3*beat(t,36,36.6));});
   sunP.scale=beat(t,27,28.4);sunP.visible=sunP.scale>.02;sunP.dy=.4*beat(t,27,29);hearts.forEach((h,i)=>{h.s=beat(t,34.8+i*.5,35.4+i*.5);});cheer(A2,beat(t,36,36.6));H.armL.rot=-.12-1.2*beat(t,35,35.6);
   return b.narrated?-.35*beat(t,1.6,2.6)+.35*beat(t,4.8,5.6)+.5*beat(t,16.6,17.4)-.5*beat(t,34,35):0;
  };
 }};

/* ───────────── 6 · Always with us (final) ───────────── */
const final:SpreadDef={id:'final',rest:10.8,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy,.92);chalk(k,`M-5 ${Z(-2.0)} L0 ${Z(-2.0)}`);chalk(k,`M-4.6 ${Z(-2.0)} L-4.6 ${Z(-1.0)} L-2.4 ${Z(-1.0)} L-2.4 ${Z(-2.0)}`);
  k.text('2010',-2.5,Z(2.62),.56,INK.yellow,{max:2.4});k.text('WORLD CUP FINAL',-2.5,Z(2.9),.16,INK.white,{weight:800});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.92);chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);chalk(k,ell(0,Z(-.3),1.0,1.0));
  k.text('KINDNESS WINS',2.5,Z(2.62),.42,INK.sky,{max:3.8});k.text('EVEN RIVAL FANS STOOD AND CLAPPED',2.5,Z(2.9),.14,INK.white,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.red,INK.yellow,INK.orange,INK.red,INK.white],1);lightRig(k,1.2,.3);lightRig(k,3.5,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3,'#26305a');crowd(k,4.5,1.15,2.6,[INK.sky,INK.white,INK.blue,INK.white],3);lightRig(k,1.1,.3);lightRig(k,3.6,.3);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const star=bd.add(starPlate('f-star',.3,INK.yellow,true),'R',2.2,2.55,{out:.03});
  const conf=bd.add(S.confetti(K+'f-cf',2.2,1.1,2),'L',.6,1.3,{out:.04});
  const board=B.stand(S.scoreboard(K+'f-board',1.8,1.4,'SPAIN – NETHERLANDS'),-1.2,-1.6,{layer:1});board.add(S.flipCard(K+'f-10',1.4,.62,'1 – 0',INK.pink),0,.4,{z:.012});
  const f00=board.flap(S.flipCard(K+'f-00',1.4,.62,'0 – 0','#3d5da0'),0,1.02,{z:.024});
  B.stand(S.goal(K+'f-goal',1.6,.8),-3.5,-1.75,{layer:1});
  const keeper=B.person(K+'f-keeper',-3.5,-1.3,1.28,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const H=B.person(K+'f-ai',-1.9,.6,1.3,{shirt:'casual',...AI,legs:'kick',number:'6',face:'smile',layer:2});
  const ball=B.stand(S.ball(K+'f-ball',.11),-1.5,.7,{layer:2,tab:false});
  const shirt=B.stand(bigShirt('f-under',1.5,1.3,false),-3.1,1.2,{layer:3,s:0});const top=shirt.flap(bigShirt('f-top',1.5,1.3,true),0,1.3,{z:.02});
  const words=[['TEAM',INK.blue],['COLOURS',INK.orange],['RIVALRY',INK.grey]].map(([l,c],i)=>B.stand(S.flipCard(K+`f-w${i}`,.9,.3,l,c,INK.navy),.7+i*1.0,-1.5,{layer:1,s:0}));
  const good=B.stand(S.flipCard(K+'f-good',1.8,.42,'A GOOD PERSON',INK.pink),1.7,-.7,{layer:2,s:0});
  const fans=[[.9,.6],[1.8,1.2],[2.7,.4],[3.5,1.4],[4.4,.7]].map(([x,z],i)=>B.person(K+`f-fan${i}`,x,z,i%2?1.4:1.2,{shirt:'fan',hair:(['short','long','curly','bun','short'] as const)[i],skin:['#f1b88f','#d99a6c','#e8b48f','#b27650','#f3cfae'][i],adult:i%2===1,face:'grin',layer:3}));
  const A2=B.person(K+'f-ai2',2.3,1.9,1.3,{shirt:'navy',...AI,face:'grin',layer:3});
  const hearts=[0,1,2].map(i=>B.stand(heart(`f-h${i}`,.26),-4.4+i*.5,2.2,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,10.8):b.t;
   H.body.s=beat(t,2,2.8);const u=beat(t,5,6);ball.x=-1.5-2.3*u;ball.z=.7-2.2*u;ball.dy=.3*Math.sin(u*Math.PI);H.leg!.rot=-1.1*pulse(t,4.7,5.3);ball.visible=t<8.6;
   const dive=pulse(t,5.3,6.6);keeper.body.rot=.9*dive;keeper.body.dx=-.25*dive;f00.flip=-3.2*beat(t,6.2,6.8);
   conf.dy=-1.1+1.3*beat(t,6.4,8.6);conf.visible=t>6.3;
   cheer(H,beat(t,6.6,7.2)*(1-beat(t,8.8,9.2))+beat(t,10,10.6));
   shirt.s=beat(t,9.2,10);const lift=Math.max(beat(t,11,12.4),manual?beat(act,0,.8):0);top.flip=-2.85*lift;
   words.forEach((w,i)=>{w.s=beat(t,19.4+i*.8,20+i*.8);});good.s=beat(t,21.6,22.4);
   fans.forEach((f,i)=>{f.body.s=beat(t,25+i*.3,25.8+i*.3);const clap=beat(t,27+i*.2,27.6+i*.2);cheer(f,clap,.25*wave(t,27.6,38,1.6+i*.1));});
   A2.body.s=beat(t,26.4,27.2);A2.armR.rot=.12+2.1*beat(t,29,29.6)+.3*wave(t,29.6,38,1.2);
   star.scale=Math.max(beat(t,12.4,13.4),manual?beat(act,.6,1):0);star.visible=star.scale>.02;star.rot=.05*Math.sin(t);
   hearts.forEach((h,i)=>{h.s=beat(t,34+i*.5,34.6+i*.5);});
   return b.narrated?-.4*beat(t,1.6,2.6)+.4*beat(t,17.6,18.4)+.45*beat(t,24.4,25.2)-.45*beat(t,33.2,34):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={village,masia,shy:shyPage,jarque,help,final};
void TAU;void pulse;void wave;void clamp01;void track;void maxOf;
