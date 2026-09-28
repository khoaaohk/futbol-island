/**
 * The six Cristiano Ronaldo pop-up spreads: original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/cristiano/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown symbolically: a boat leaving, a racing heart that calms, a covered photo frame, boos that flip to cheers.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='cristiano-',TAU=Math.PI*2;
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

/* ───────────── Cristiano plates ───────────── */
const CR={skin:'#e8b48f',hair:'short' as const,hairColor:'#2b2230'};
function calcada(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#efe6d0');k.dots(p,'#b3a88e',.06,.15);for(let y=.4;y<PAGE_D;y+=.55)k.key(`M${x0} ${y} Q${x0+(x1-x0)*.25} ${y-.2} ${x0+(x1-x0)*.5} ${y} T${x1} ${y}`,.07,'#3b3f4d');}
function tiles(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#e4ecef');for(let x=x0;x<x1;x+=.5)for(let y=0;y<PAGE_D;y+=.5)if(((x-x0)/.5+y/.5)%2<1)k.fill(rect(x,y,.5,.5),'#cfdde3');k.dots(p,INK.sky,.06,.08);}
function seaPrint(k:Kit,x0:number,x1:number,y0:number,y1:number){const r=rect(x0,y0,x1-x0,y1-y0);k.fill(r,INK.blue,.9);k.dots(r,INK.navy,.05,.3);for(let i=0;i<14;i++){const x=x0+.2+((i*37)%41)/41*(x1-x0-.6),y=y0+.2+((i*53)%47)/47*(y1-y0-.4);k.key(`M${x} ${y} q.1 -.08 .2 0 q.1 .08 .2 0`,.02,INK.white);}}
function terraces(k:Kit,w:number,y:number,seed=0){const hill=`M0 ${y+.9} Q${w*.3} ${y-.2} ${w*.55} ${y+.1} Q${w*.8} ${y+.35} ${w} ${y-.1} L${w} 3 L0 3 Z`;k.fill(hill,INK.leaf);k.dots(hill,INK.green,.05,.35);k.key(hill,.012);
 for(let r=0;r<4;r++)k.key(`M0 ${y+.55+r*.3} Q${w*.5} ${y+.25+r*.3} ${w} ${y+.35+r*.3}`,.012,INK.green);
 for(let i=0;i<10;i++){const x=.2+((i*37+seed*11)%41)/41*(w-.5),yy=y+.35+((i*23+seed)%5)*.16;const b=rect(x,yy,.2,.14);k.fill(b,INK.white);k.key(b,.008);k.fill(poly([[x-.02,yy],[x+.1,yy-.08],[x+.22,yy]]),INK.red);}}
const islandHouse=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const wall=rect(0,h*.3,w,h*.7);k.fill(wall,INK.white);k.dots(wall,INK.sky,.04,.15);k.key(wall,.014);const roof=poly([[-.06,h*.32],[w*.5,0],[w+.06,h*.32]]);k.fill(roof,INK.red);k.hatch(roof,'#9c3a30',.05,.4,.01);k.key(roof,.014);
 const d=rect(w*.1,h*.62,w*.2,h*.38);k.fill(d,INK.green);k.key(d,.012);
 // The one bedroom seen through the window: four children in one bed.
 const win=rect(w*.4,h*.4,w*.5,h*.38);k.fill(win,'#ffe7b0');k.key(win,.014);const bed=rect(w*.43,h*.62,w*.44,h*.12);k.fill(bed,INK.pink);k.key(bed,.01);
 for(let i=0;i<4;i++){const x=w*(.49+i*.105),y=h*.6;k.fill(ell(x,y,w*.04,w*.04),i===3?'#e8b48f':'#d99a6c');k.key(ell(x,y,w*.04,w*.04),.008);k.fill(`M${x-w*.04} ${y-w*.005} Q${x} ${y-w*.06} ${x+w*.04} ${y-w*.005} Z`,i===1||i===2?'#5a3a2a':'#2b2230');}
 k.fill(rect(w*.43,h*.5,w*.44,h*.02),INK.brown);});
const winCover=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.green);k.dots(b,INK.navy,.03,.25);for(let i=1;i<6;i++)k.key(`M0 ${i*h/6} L${w} ${i*h/6}`,.01,INK.navy);k.key(`M${w/2} 0 L${w/2} ${h}`,.012,INK.navy);k.key(b,.013);k.circle(w*.54,h*.5,.02,INK.gold);},{rim:.012});
const laundry=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.key(`M0 ${h*.1} Q${w/2} ${h*.3} ${w} ${h*.1}`,.012);const cs=[INK.pink,INK.white,INK.yellow,INK.sky,INK.orange];for(let i=0;i<5;i++){const t=(i+.5)/5,x=t*w,y=h*.1+Math.sin(t*Math.PI)*h*.2;
 const s=i%2?rect(x-.06,y,.12,h*.45):poly([[x-.09,y],[x+.09,y],[x+.09,y+h*.18],[x+.06,y+h*.18],[x+.06,y+h*.62],[x-.06,y+h*.62],[x-.06,y+h*.18],[x-.09,y+h*.18]]);k.fill(s,cs[i]);k.key(s,.008);if(i===2){k.fill(rect(x-.04,y+h*.25,.07,.07),INK.blue);k.key(rect(x-.04,y+h*.25,.07,.07),.006);}}},{rim:.015});
const pot=(key:string,s:number)=>sp(key,s,s*.8,k=>{const b=`M${s*.1} ${s*.25} L${s*.9} ${s*.25} L${s*.82} ${s*.75} L${s*.18} ${s*.75} Z`;k.fill(b,INK.grey);k.dots(b,INK.navy,.03,.2);k.key(b,.012);k.key(`M0 ${s*.3} L${s*.1} ${s*.3} M${s*.9} ${s*.3} L${s} ${s*.3}`,.02);for(let i=0;i<3;i++)k.key(`M${s*(.35+i*.15)} ${s*.2} q.03 -.08 0 -.16`,.012,INK.sky);});
const broom=(key:string,h:number)=>sp(key,h*.35,h,k=>{const w=h*.35;k.keyFill(rect(w*.44,0,w*.12,h*.7),INK.wood);const b=poly([[w*.2,h*.68],[w*.8,h*.68],[w,h],[0,h]]);k.fill(b,INK.yellow);k.hatch(b,INK.orange,.03,1.5,.008);k.key(b,.012);});
const wateringCan=(key:string,s:number)=>sp(key,s*1.2,s,k=>{const b=rect(s*.25,s*.35,s*.6,s*.6);k.fill(b,INK.teal);k.key(b,.012);k.key(`M${s*.85} ${s*.5} L${s*1.15} ${s*.2}`,.03,INK.teal);k.key(`M${s*.3} ${s*.35} Q${s*.55} ${s*.05} ${s*.8} ${s*.35}`,.02);});
const flower=(key:string,h:number,c:string)=>sp(key,h*.5,h,k=>{const w=h*.5;k.key(`M${w/2} ${h} L${w/2} ${h*.35}`,.018,INK.green);k.fill(ell(w*.3,h*.7,w*.18,h*.07),INK.leaf);for(let i=0;i<6;i++){const a=i/6*TAU;k.fill(ell(w/2+Math.cos(a)*w*.2,h*.22+Math.sin(a)*w*.2,w*.14,w*.14),c);}k.circle(w/2,h*.22,w*.1,INK.yellow);},{rim:.012});
const boat=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const hull=poly([[0,h*.6],[w,h*.6],[w*.85,h],[w*.12,h]]);k.fill(hull,INK.white);k.fill(rect(0,h*.6,w,h*.08),INK.red);k.key(hull,.014);const mast=rect(w*.48,0,.03,h*.6);k.fill(mast,INK.brown);
 const sail=poly([[w*.52,h*.04],[w*.9,h*.52],[w*.52,h*.52]]);k.fill(sail,INK.yellow);k.dots(sail,INK.orange,.03,.3);k.key(sail,.012);const s2=poly([[w*.46,h*.1],[w*.46,h*.52],[w*.16,h*.52]]);k.fill(s2,INK.white);k.key(s2,.012);
 // a small passenger waving from the deck
 k.fill(ell(w*.3,h*.48,.05,.05),'#e8b48f');k.key(ell(w*.3,h*.48,.05,.05),.008);k.fill(rect(w*.3-.05,h*.52,.1,.1),INK.orange);k.key(`M${w*.3+.05} ${h*.54} L${w*.3+.12} ${h*.42}`,.02);for(let i=0;i<4;i++)k.circle(w*(.2+i*.18),h*.8,.025,INK.navy);},{rim:.02});
const bookStack=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const cs=[INK.blue,INK.pink,INK.yellow,INK.green];for(let i=0;i<4;i++){const b=rect(w*(.05+(i%2)*.06),h-(i+1)*h*.2,w*.85,h*.18);k.fill(b,cs[i]);k.key(b,.012);k.fill(rect(w*.12+(i%2)*w*.06,h-(i+1)*h*.2+h*.06,w*.5,h*.03),INK.white);}
 k.fill(ell(w*.72,h*.12,w*.18,w*.18),INK.white);k.key(ell(w*.72,h*.12,w*.18,w*.18),.012);k.text('?',w*.72,h*.2,w*.26,INK.red,{weight:900});});
const ecg=(key:string,w:number,h:number,fast:boolean)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.night);k.key(b,.014);for(let x=.1;x<w;x+=.15)k.key(`M${x} 0 L${x} ${h}`,.006,'#2d4a7a');
 let d=`M.05 ${h/2}`;const n=fast?9:3;for(let i=0;i<n;i++){const x0=.05+i*(w-.1)/n,s=(w-.1)/n;d+=` L${x0+s*.35} ${h/2} L${x0+s*.45} ${h*.15} L${x0+s*.55} ${h*.85} L${x0+s*.65} ${h/2} L${x0+s} ${h/2}`;}k.key(d,.025,fast?INK.pink:INK.grass);
 k.text(fast?'TOO FAST':'CALM',w*.8,h*.2,h*.14,fast?INK.pink:INK.grass,{weight:900});},{rim:.015});
const hospital=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.14,w,h*.86);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.2);k.key(b,.014);k.fill(rect(-.03,h*.1,w+.06,h*.06),INK.teal);
 for(let r=0;r<3;r++)for(let c=0;c<4;c++)k.fill(rect(w*(.08+c*.23),h*(.3+r*.18),w*.14,h*.1),INK.sky);const s=rect(w*.25,h*.17,w*.5,h*.1);k.fill(s,INK.teal);k.text('HOSPITAL',w/2,h*.25,h*.065,INK.white,{max:w*.46,weight:900});
 const hx=w*.5,hy=h*.03,hs=h*.1;k.fill(`M${hx} ${hy+hs*.9} C${hx-hs*.9} ${hy+hs*.4} ${hx-hs*.6} ${hy-hs*.3} ${hx} ${hy+hs*.15} C${hx+hs*.6} ${hy-hs*.3} ${hx+hs*.9} ${hy+hs*.4} ${hx} ${hy+hs*.9} Z`,INK.pink);
 const d=rect(w*.4,h*.8,w*.2,h*.2);k.fill(d,INK.teal);k.key(d,.012);});
const doorLeaf=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,c);k.key(d,.012);k.fill(rect(w*.18,h*.12,w*.64,h*.3),INK.sky2);k.circle(w*.8,h*.6,.02,INK.gold);},{rim:.012});
const bigHeart=(key:string,s:number)=>heart(key,s,INK.red);
const kitBag=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=`M${w*.05} ${h*.35} Q${w*.05} ${h*.25} ${w*.15} ${h*.25} L${w*.85} ${h*.25} Q${w*.95} ${h*.25} ${w*.95} ${h*.35} L${w*.95} ${h} L${w*.05} ${h} Z`;k.fill(b,INK.navy);k.dots(b,INK.blue,.03,.3);k.key(b,.012);k.key(`M${w*.3} ${h*.25} Q${w*.5} 0 ${w*.7} ${h*.25}`,.02);
 k.fill(rect(w*.15,h*.5,w*.7,h*.22),INK.white);k.text('KIT',w/2,h*.67,h*.16,INK.navy,{weight:900});const sh=poly([[w*.35,h*.1],[w*.65,h*.1],[w*.72,h*.2],[w*.6,h*.2],[w*.6,h*.3],[w*.4,h*.3],[w*.4,h*.2],[w*.28,h*.2]]);k.fill(sh,INK.red);k.key(sh,.008);});
const bricks=(k:Kit,w:number,y0:number,y1:number)=>{const b=rect(0,y0,w,y1-y0);k.fill(b,'#c9735a');k.dots(b,INK.red,.04,.3);for(let y=y0;y<y1;y+=.1){k.key(`M0 ${y} L${w} ${y}`,.006,'#8e4f3a');}for(let i=0;i<8;i++){const x=.2+i*.55;k.fill(rect(x,y0+.25,.22,.3),INK.yellow,.8);k.key(rect(x,y0+.25,.22,.3),.008);}k.fill(poly([[0,y0],[w*.25,y0-.25],[w*.5,y0],[w*.75,y0-.25],[w,y0]]),'#7e5a4a');};
const armband=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.yellow);k.dots(b,INK.orange,.03,.3);k.key(b,.012);k.text('C',w/2,h*.78,h*.7,INK.navy,{weight:900});},{rim:.015});

/* ───────────── 1 · One room, a whole family (madeira) ───────────── */
const madeira:SpreadDef={id:'madeira',rest:17.9,
 left:k=>{calcada(k,-5,0);k.text('FUNCHAL',-2.5,Z(2.62),.5,INK.blue,{max:3});k.text('MADEIRA · 1985',-2.5,Z(2.9),.17,INK.navy,{weight:800});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#d9b98a');k.dots(p,INK.brown,.06,.2);chalk(k,`M.5 ${Z(-1.9)} L4.6 ${Z(-1.9)} L4.6 ${Z(1.6)} L.5 ${Z(1.6)} Z`);chalk(k,ell(2.55,Z(-.15),.55,.55));
  k.text('ANDORINHA',2.5,Z(2.62),.44,INK.pink,{max:3.8});k.text('HIS FIRST CLUB · AGED SEVEN',2.5,Z(2.9),.15,INK.navy,{weight:800});},
 build:B=>{
  B.vfold({key:K+'m-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);sea(k,4.5,2.3,.5);terraces(k,4.5,1.0,1);k.fill(rect(0,2.8,4.5,.2),'#efe6d0');}},
   {key:K+'m-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);sea(k,4.5,1.6,1.0);terraces(k,4.5,1.4,3);k.fill(rect(0,2.6,4.5,.4),'#d9b98a');}},-3.05,1.22);
  const house=B.stand(islandHouse('m-house',2.0,1.75),-3.2,-1.35,{layer:1});
  const cover=house.flap(winCover('m-win',2.0*.52,1.75*.4),2.0*.65-1.0,1.75*(1-.39),{z:.02});
  const sign=B.stand(S.sign(K+'m-sign',1.1,1.15,'FUNCHAL'),-1.1,-1.6,{layer:1});const c85=sign.flap(S.flipCard(K+'m-1985',.85,.36,'1985',INK.pink),0,1.15*.56,{z:.03});
  const line=B.stand(laundry('m-laundry',1.4,.5),-1.2,-.5,{layer:2,s:0});
  B.stand(S.tree(K+'m-palm',.9,1.7,'palm'),-4.6,-.4,{layer:2});
  const boy=B.person(K+'m-boy',-2.2,.8,1.0,{shirt:'casual',...CR,face:'grin',layer:3});
  const sibs=[['HUGO',-4.1,.95,'short'],['ELMA',-3.4,1.35,'long'],['KÁTIA',-1.6,1.3,'bun']].map(([n,x,z,hr],i)=>({p:B.person(K+`m-sib${i}`,x as number,z as number,1.15,{shirt:(['navy','coach','bib'] as const)[i],hair:hr as 'short',skin:'#e8b48f',hairColor:'#2b2230',face:'grin',layer:3}),tag:B.stand(S.flipCard(K+`m-tag${i}`,.62,.26,n as string,[INK.blue,INK.pink,INK.orange][i]),(x as number),(z as number)+.55,{layer:3,s:0})}));
  const mum=B.person(K+'m-mum',-.6,.35,1.6,{shirt:'coach',hair:'long',adult:true,skin:'#e8b48f',hairColor:'#4a3025',face:'smile',layer:2});
  const potP=B.stand(pot('m-pot',.4),-.35,1.25,{layer:3,s:0}),broomP=B.stand(broom('m-broom',.8),-1.05,1.15,{layer:3,s:0});
  const dad=B.person(K+'m-dad',1.1,.1,1.72,{shirt:'keeper',hair:'short',adult:true,skin:'#d99a6c',face:'smile',layer:2});
  const can=B.stand(wateringCan('m-can',.34),.7,.9,{layer:3,s:0});const flowers=[0,1,2].map(i=>B.stand(flower(`m-fl${i}`,.42,[INK.pink,INK.yellow,INK.orange][i]),.35+i*.28,1.55,{layer:3,s:0}));
  const bag=B.stand(kitBag('m-bag',.6,.5),1.75,.75,{layer:3,s:0});const clubSign=B.stand(S.sign(K+'m-club',1.3,1.1,'ANDORINHA',INK.yellow),3.9,-1.9,{layer:1,s:0});
  B.stand(S.goal(K+'m-goal',1.3,.7),2.55,-1.75,{layer:1});B.stand(S.tree(K+'m-palm2',.9,1.6,'palm'),4.55,-.6,{layer:1});B.stand(S.fenceStrip(K+'m-fence',1.2,.4),.9,-1.9,{layer:1});B.stand(S.bush(K+'m-bush',.9,.34),4.3,1.9,{layer:3,tab:false});
  const H=B.person(K+'m-cr7',2.6,1.0,1.1,{shirt:'bib',...CR,number:'7',legs:'kick',face:'smile',layer:3});const seven=B.stand(S.flipCard(K+'m-seven',.5,.36,'7',INK.pink),3.6,1.4,{layer:3,s:0});
  const ball=B.stand(S.ball(K+'m-ball',.11),2.95,1.1,{layer:3,tab:false});
  const hearts=[0,1,2].map(i=>B.stand(heart(`m-h${i}`,.28),-4.2+i*1.2,2.05,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.9):b.t;
   house.s=beat(t,.4,1.6);c85.flip=-2.9+2.9*beat(t,3.2,4);boy.body.s=beat(t,5.2,6)*(1-beat(t,30.6,31.3));
   line.s=beat(t,10.2,11);line.rot=0;
   sibs.forEach((q,i)=>{q.p.body.s=beat(t,12.6+i*1.4,13.3+i*1.4);q.tag.s=beat(t,12.9+i*1.4,13.5+i*1.4)*(1-beat(t,20.4,21));});
   const open=Math.max(beat(t,18.6,19.8),manual?beat(act,0,.7):0);cover.flip=-2.9*open;
   hearts.forEach((h,i)=>{h.s=Math.max(beat(t,19.4+i*.4,20+i*.4),manual?beat(act,.6+i*.1,.8+i*.1):0)*(1-beat(t,24,25))+beat(t,36+i*.4,36.6+i*.4);});
   sibs.forEach((q,i)=>{const w2=Math.max(beat(t,19.6+i*.3,20.2+i*.3)*(1-beat(t,22.6,23.2)),manual?beat(act,.7,1):0);q.p.armR.rot=.12+2.1*w2+2.2*beat(t,36.2+i*.2,36.8+i*.2);q.p.armL.rot=-.12-2.2*beat(t,36.2+i*.2,36.8+i*.2);});
   mum.body.s=beat(t,20.8,21.6);potP.s=beat(t,21.8,22.4);broomP.s=beat(t,23,23.6);mum.armR.rot=.12+1.2*beat(t,22,22.5)-1.2*beat(t,23.2,23.7)+2.2*beat(t,36.6,37.2);mum.armL.rot=-.12-1.2*beat(t,23.3,23.8)+1.2*beat(t,24.5,25);
   dad.body.s=beat(t,24.9,25.7);can.s=beat(t,25.8,26.4);flowers.forEach((f,i)=>{f.s=beat(t,26.4+i*.4,27+i*.4);});dad.armL.rot=-.12-.9*beat(t,26,26.5)+.9*beat(t,28,28.5);
   bag.s=beat(t,28.4,29);clubSign.s=beat(t,29,29.8);dad.armR.rot=.12+1.3*beat(t,29.2,29.8)-1.3*beat(t,31,31.5)+2.2*beat(t,36.8,37.4);
   H.body.s=beat(t,31.3,32.1);seven.s=beat(t,32.4,33);
   const kick=pulse(t,33.4,34);H.leg!.rot=-1.1*kick;const bu=beat(t,33.7,34.5);ball.x=2.95+.2*bu-.4*bu;ball.z=1.1-2.5*bu;ball.dy=.3*Math.sin(bu*Math.PI);ball.rot=-bu*8;ball.s=beat(t,31.3,32.1);
   cheer(H,beat(t,34.5,35)*(1-beat(t,35.6,36))+beat(t,37,37.6));cheer(boy,0);
   return b.narrated?-.4*beat(t,2.4,3.4)+.4*beat(t,24.4,25.2)+.4*beat(t,25.2,26)-.4*beat(t,35.2,36):0;
  };
 }};

/* ───────────── 2 · Across the sea at twelve (lisbon) ───────────── */
const lisbon:SpreadDef={id:'lisbon',rest:17.4,
 left:k=>{seaPrint(k,-5,0,0,Z(1.2));const q=rect(-5,Z(1.2),5,PAGE_D-Z(1.2));k.fill(q,INK.stone);k.dots(q,'#9f9378',.05,.3);k.key(`M-5 ${Z(1.2)} L0 ${Z(1.2)}`,.03,INK.navy);
  k.text('MADEIRA',-2.5,Z(2.62),.5,INK.green,{max:3});k.text('LEAVING HOME AT TWELVE',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{seaPrint(k,0,5,0,Z(-.3));const q=rect(0,Z(-.3),5,PAGE_D-Z(-.3));k.fill(q,'#efe6d0');k.dots(q,'#b3a88e',.05,.2);k.key(`M0 ${Z(-.3)} L5 ${Z(-.3)}`,.03,INK.navy);for(let y=Z(.3);y<Z(2.2);y+=.5)k.key(`M0 ${y} Q1.2 ${y-.18} 2.5 ${y} T5 ${y}`,.05,'#3b3f4d');
  k.text('LISBON · 1997',2.5,Z(2.62),.44,INK.blue,{max:3.8});k.text('A NEW CITY, A NEW SCHOOL',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'l-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.45-y/3*.45);sea(k,4.5,1.8,1.2);const isl=`M.4 1.9 Q1.2 .9 2.0 1.2 Q2.8 .8 3.6 1.9 Z`;k.fill(isl,INK.leaf);k.dots(isl,INK.green,.05,.35);k.key(isl,.012);}},
   {key:K+'l-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);const hill=`M0 1.9 Q1.4 1.0 2.8 1.4 Q3.8 1.6 4.5 1.2 L4.5 3 L0 3 Z`;k.fill(hill,'#e7d3a6');k.dots(hill,INK.orange,.05,.2);roofs(k,.2,12,1.95,1);roofs(k,.4,11,1.55,3);
    const tw=rect(3.6,.6,.3,1.0);k.fill(tw,INK.stone);k.key(tw,.012);k.fill(poly([[3.55,.6],[3.75,.35],[3.95,.6]]),INK.red);sea(k,4.5,2.1,.9);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'l-sun',.34),'L',1.1,2.3,{out:.012}),birds=bd.add(S.birds(K+'l-birds',.8,.3),'R',2.6,2.4,{out:.02});
  const rain=bd.add(stormCloud('l-rain',1.2,.6),'R',.9,2.6,{out:.03});
  const sign=B.stand(S.sign(K+'l-sign',1.3,1.2,'SPORTING',INK.white),-1.2,-.95,{layer:1,s:0});
  const days=[0,1,2].map(i=>B.stand(S.icon(K+`l-day${i}`,.3,'tick'),-2.1+i*.42,-.1,{layer:2,s:0}));
  const signed=B.stand(stamp('l-signed',1.0,.36,'SIGNED'),-1.2,.45,{layer:2,s:0});
  const boy=B.person(K+'l-boy',-2.9,1.55,1.1,{shirt:'casual',...CR,face:'smile',layer:3,holdR:'suitcase'});
  const fam=[B.person(K+'l-mum',-4.1,1.5,1.6,{shirt:'coach',hair:'long',adult:true,skin:'#e8b48f',hairColor:'#4a3025',face:'open',layer:3}),B.person(K+'l-dad',-4.65,1.95,1.72,{shirt:'keeper',hair:'short',adult:true,skin:'#d99a6c',face:'open',layer:3}),B.person(K+'l-sis',-3.5,2.05,1.15,{shirt:'bib',hair:'bun',skin:'#e8b48f',hairColor:'#5a3a2a',face:'open',layer:3})];
  const bL=B.stand(boat('l-boatL',1.1,.9),-2,.3,{layer:2,tab:false}),bR=B.stand(boat('l-boatR',1.1,.9),2,.3,{layer:2,tab:false});B.slot(-3.4,.55,3.4,-.75);
  const boatAt=(x:number,z:number,vis:boolean,roll:number)=>{for(const [p,on] of [[bL,x<0],[bR,x>=0]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.rot=roll;}}};
  const sch=B.stand(school('l-school',1.8,1.5),3.7,-1.15,{layer:1,s:0});const doorL=sch.flap(doorLeaf('l-door',.29,.44,INK.red),-.144,0,{anchor:'bl',axis:'y',z:.02});
  const H=B.person(K+'l-cr',1.4,.75,1.15,{shirt:'casual',...CR,face:'grin',layer:3});
  const mates=[[2.2,1.3,'#7f5138','curly'],[2.9,.6,'#f1b88f','long'],[3.4,1.5,'#d99a6c','short']].map(([x,z,sk,hr],i)=>B.person(K+`l-mate${i}`,x as number,z as number,1.1,{shirt:(['navy','bib','fan'] as const)[i],hair:hr as 'short',skin:sk as string,face:'grin',layer:3}));
  const books=B.stand(bookStack('l-books',.6,.7),.55,1.55,{layer:3,s:0});
  const storm=B.stand(stormCloud('l-storm',.9,.46),2.6,-.4,{layer:2,s:0,tab:false});
  const helper=B.person(K+'l-helper',4.4,1.1,1.7,{shirt:'coach',hair:'short',adult:true,skin:'#f1b88f',face:'smile',layer:3});
  const hearts=[0,1].map(i=>B.stand(heart(`l-h${i}`,.28),.9+i*3.2,2.1,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.4):b.t;
   sun.dy=.4*beat(t,0,2);birds.dx=-1.2*beat(t,2,30);
   boy.body.s=beat(t,2.4,3.2)*(1-Math.max(beat(t,19.2,19.8),manual?beat(act,.02,.15):0));sign.s=beat(t,3.4,4.2);days.forEach((d,i)=>{d.s=beat(t,6+i*.9,6.5+i*.9);});signed.s=beat(t,9.6,10.3);
   fam.forEach((p,i)=>{p.body.s=beat(t,11.8+i*.4,12.6+i*.4);});
   const sail=Math.max(beat(t,19.4,23.6),manual?beat(act,.1,1):0);const x=-3.2+6.4*sail;boatAt(x,.55-1.3*sail,t>13.6||manual,.05*Math.sin(t*2.2));
   bL.s=beat(t,13.6,14.4);bR.s=1;
   fam.forEach((p,i)=>{p.armR.rot=.12+2.1*Math.max(beat(t,15+i*.3,15.6+i*.3),manual?1:0)*(1-beat(t,26,26.6))+.3*wave(t,15.6,26,1.3+i*.1);});
   rain.scale=beat(t,20,21)*(1-beat(t,27,28));rain.visible=rain.scale>.02;
   sch.s=beat(t,23.8,24.8);H.body.s=Math.max(beat(t,24.2,25),manual?beat(act,.85,1):0);mates.forEach((m,i)=>{m.body.s=beat(t,24.6+i*.4,25.4+i*.4);m.armR.rot=.12+1.8*beat(t,25.6+i*.3,26.2+i*.3)-1.8*beat(t,27.4,28);});
   books.s=beat(t,26.8,27.5)*(1-beat(t,33,33.8));H.armL.rot=-.12-.8*beat(t,27,27.6)+.8*beat(t,28.4,29);
   storm.s=beat(t,28.8,29.6)*(1-beat(t,33.4,34.2));doorL.flip=-1.4*(1-beat(t,31,31.8))*beat(t,24.8,25.6);
   H.body.x=1.4-.5*beat(t,31.6,33);mates.forEach(m=>{m.body.yaw=.4*pulse(t,29,33);});
   helper.body.s=beat(t,33.6,34.4);helper.armL.rot=-.12-1.2*beat(t,34.6,35.2);H.armR.rot=.12+1.2*beat(t,35.4,36);hearts.forEach((h,i)=>{h.s=beat(t,35.6+i*.6,36.2+i*.6);});
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,18.8,19.6)+.45*beat(t,23.4,24.4)-.45*beat(t,37.6,38.6):0;
  };
 }};

/* ───────────── 3 · A racing heart (heart) ───────────── */
const heartPage:SpreadDef={id:'heart',rest:14.3,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);for(let i=0;i<6;i++)k.circle(-4.5+i*.55,Z(1.4),.05,INK.orange);
  k.text('AGED 15',-2.5,Z(2.62),.5,INK.pink,{max:3});k.text('A HEART THAT BEAT TOO FAST',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{tiles(k,0,5);k.text('SAME DAY HOME',2.5,Z(2.62),.42,INK.teal,{max:3.8});k.text('TRAINING AGAIN A FEW DAYS LATER',2.5,Z(2.9),.15,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'h-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);const hills=`M0 1.9 Q1.2 1.4 2.4 1.7 Q3.4 1.9 4.5 1.5 L4.5 3 L0 3 Z`;k.fill(hills,INK.leaf);k.dots(hills,INK.green,.05,.3);lightRig(k,1.1,1.0);lightRig(k,3.5,.9);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},
   {key:K+'h-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#dff0f2',INK.teal,y=>.3-y/3*.3);roofs(k,.2,12,2.2,4);k.fill(rect(0,2.3,4.5,.7),'#e4ecef');}},-3.05,1.22);
  const sunP=bd.add(S.sun(K+'h-sun',.3),'R',.6,2.4,{out:.012}),moon=bd.add(sp('h-moon',.4,.4,k=>{k.fill(`M.3 .02 A.19 .19 0 1 0 .38 .3 A.15 .15 0 1 1 .3 .02 Z`,INK.yellow);k.key(`M.3 .02 A.19 .19 0 1 0 .38 .3 A.15 .15 0 1 1 .3 .02 Z`,.01);}),'R',3.9,2.4,{out:.012});
  const hosp=B.stand(hospital('h-hosp',2.3,1.9),3.2,-1.4,{layer:1});const door=hosp.flap(doorLeaf('h-door',.46,.38,INK.teal),-.23,0,{anchor:'bl',axis:'y',z:.02});
  const hb=B.stand(bigHeart('h-heart',1.25),-2.6,-1.2,{layer:1,s:0});
  const monitor=B.stand(ecg('h-ecgF',1.4,.6,true),-.95,-1.55,{layer:1,s:0});const calmCard=monitor.flap(ecg('h-ecgC',1.4,.6,false),0,.6,{z:.02});
  const doc=B.person(K+'h-doc',-3.9,-.1,1.72,{shirt:'ger',hair:'short',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const H=B.person(K+'h-cr',-1.7,.6,1.25,{shirt:'bib',...CR,legs:'kick',face:'open',layer:2});
  const stopQ=B.stand(S.flipCard(K+'h-stop',.95,.34,'FOOTBALL?',INK.orange),-3.5,1.3,{layer:3,s:0});const icons=[B.stand(S.icon(K+'h-ball',.3,'ball'),-4.3,1.75,{layer:3,s:0}),B.stand(S.icon(K+'h-boot',.3,'boot'),-3.5,1.85,{layer:3,s:0})];
  const mum=B.person(K+'h-mum',1.15,.2,1.6,{shirt:'coach',hair:'long',adult:true,skin:'#e8b48f',hairColor:'#4a3025',face:'smile',layer:2});
  const letter=B.stand(lineCard('h-letter',.8,.5,['CLUB','LETTER'],INK.white),.55,1.0,{layer:3,s:0});const yes=B.stand(S.icon(K+'h-yes',.3,'tick'),1.9,1.05,{layer:3,s:0});
  const docs=[B.person(K+'h-doc2',2.6,.55,1.7,{shirt:'ger',hair:'bun',adult:true,skin:'#b27650',face:'smile',layer:2}),B.person(K+'h-doc3',4.3,.35,1.7,{shirt:'ger',hair:'bald',adult:true,skin:'#d99a6c',face:'smile',layer:2})];
  const laser=B.stand(sp('h-laser',1.0,.2,k=>{k.fill(rect(0,.07,1.0,.06),INK.pink);k.dots(rect(0,.04,1.0,.12),INK.red,.02,.6);k.circle(1.0,.1,.05,INK.yellow);},{rim:.01}),3.4,1.2,{layer:3,s:0,tab:false});
  const star=B.stand(S.stars(K+'h-stars',1.0,.5,5),3.4,1.7,{layer:3,s:0,tab:false});
  const dayCard=B.stand(S.flipCard(K+'h-day',1.2,.34,'SAME DAY',INK.teal),1.1,1.75,{layer:3,s:0});
  const ball=B.stand(S.ball(K+'h-ball2',.11),-1.3,.7,{layer:2,tab:false});
  for(const [x,z] of [[-4.6,.9],[-1.0,-.2],[-.4,1.6]])B.stand(S.cone(K+`h-cone${x}`,.3),x,z,{layer:2});
  const hearts=[0,1].map(i=>B.stand(heart(`h-h${i}`,.26),.4+i*.5,2.2,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,14.3):b.t;
   // The heart races, then slows to calm (when the laser fix happens, or when the reader slows it).
   const calm=Math.max(beat(t,22.6,26.2),manual?beat(act,0,1):0);const hz=4-3.2*calm;hb.s=beat(t,.4,1.4);hb.scale=1+.12*(1-.5*calm)*Math.max(0,Math.sin(t*hz*Math.PI*2));
   calmCard.flip=-3.1+3.1*calm;calmCard.visible=calm>.02;
   doc.body.s=beat(t,2,2.8);H.body.s=beat(t,2.6,3.4);doc.armR.rot=.12+1.4*beat(t,3.4,4)-1.4*beat(t,6.4,6.9);
   monitor.s=beat(t,6.9,7.7);H.body.yaw=0;
   stopQ.s=beat(t,9.6,10.3)*(1-calm);icons.forEach((q,i)=>{q.s=beat(t,10.4+i*.5,11+i*.5)*(1-calm);});
   mum.body.s=beat(t,16.4,17.2);letter.s=beat(t,17.3,18)*(1-beat(t,21.6,22.2));yes.s=beat(t,19.6,20.2)*(1-beat(t,24,24.6));mum.armR.rot=.12+1.5*beat(t,19.4,20)-1.5*beat(t,21.2,21.8)+2.2*beat(t,33,33.6);
   door.flip=1.3*beat(t,20.6,21.4);docs.forEach((d,i)=>{d.body.s=beat(t,21.8+i*.4,22.6+i*.4);});
   laser.s=beat(t,22.8,23.4)*(1-beat(t,26,26.6));docs[1].armL.rot=-.12-1.2*beat(t,23,23.5)+1.2*beat(t,26,26.5);star.s=Math.max(beat(t,25.2,26),manual?beat(act,.7,1):0);
   sunP.dy=-.9*beat(t,26.8,28)+.9*beat(t,28.4,29.4);moon.dy=-.8*beat(t,27.4,28.4);moon.visible=t>27;dayCard.s=beat(t,27,27.8);
   const run=beat(t,29.2,31.4);H.body.x=-1.7-1.9*run;ball.x=-1.3-1.9*run;ball.rot=run*10;H.leg!.rot=-.7*Math.abs(Math.sin(t*6))*(t>29.2&&t<31.4?1:0);
   cheer(H,beat(t,31.6,32.2));hearts.forEach((h,i)=>{h.s=beat(t,32.4+i*.5,33+i*.5);});
   return b.narrated?-.35*beat(t,1.8,2.8)+.35*beat(t,14,14.8)+.5*beat(t,16,16.8)-.5*beat(t,28.8,29.6):0;
  };
 }};

/* ───────────── 4 · Missing his dad (father) ───────────── */
const father:SpreadDef={id:'father',rest:26.0,
 left:k=>{pitch(k,-5,0);chalk(k,`M-5 ${Z(-2.1)} L0 ${Z(-2.1)}`);chalk(k,ell(0,Z(-.3),1.0,1.0));
  k.text('MANCHESTER',-2.5,Z(2.62),.42,INK.red,{max:3.6});k.text('2003 · AGED EIGHTEEN',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{meadow(k,0,5);const bed=rect(.5,Z(1.0),4,.7);k.fill(bed,INK.brown,.5);k.dots(bed,INK.navy,.05,.2);
  k.text('JOSÉ',2.5,Z(2.62),.5,INK.blue,{max:3});k.text('KIT MAN AT HIS FIRST CLUB',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'f-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#b8bccb',INK.navy,y=>.3-y*.05);bricks(k,4.5,1.4,2.4);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},
   {key:K+'f-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.45-y/3*.45);sea(k,4.5,1.9,.5);terraces(k,4.5,1.3,5);k.fill(rect(0,2.4,4.5,.6),'#b9c98a');}},-3.05,1.22);
  const rainL=bd.add(stormCloud('f-rainL',1.3,.66),'L',2.6,2.5,{out:.03}),rainR=bd.add(stormCloud('f-rainR',1.3,.66),'R',1.6,2.4,{out:.03});
  const planeP=bd.add(plane('f-plane',.8,.36),'L',.5,2.7,{out:.035}),sunR=bd.add(S.sun(K+'f-sun',.34),'R',3.6,1.8,{out:.012});
  const sign=B.stand(S.sign(K+'f-sign',1.4,1.15,'MANCHESTER'),-1.1,-1.75,{layer:1});const c03=sign.flap(S.flipCard(K+'f-2003',.9,.36,'2003',INK.pink),0,1.15*.56,{z:.03});
  const H=B.person(K+'f-cr',-2.0,.45,1.35,{shirt:'casual',...CR,number:'7',face:'smile',layer:2});
  const fergie=B.person(K+'f-fergie',-3.2,.2,1.8,{shirt:'coach',hair:'short',hairColor:'#d8d4cc',adult:true,skin:'#f1b88f',face:'smile',layer:2});
  const fCard=B.stand(S.flipCard(K+'f-fis',1.5,.34,'FATHER IN SPORT',INK.yellow,INK.navy),-2.7,1.4,{layer:3,s:0});
  const mates=[[-4.3,1.1,'#7f5138'],[-1.0,1.3,'#f1b88f']].map(([x,z,sk],i)=>B.person(K+`f-mate${i}`,x as number,z as number,1.3,{shirt:'casual',hair:i?'curly':'short',skin:sk as string,face:'grin',layer:3}));
  const yr=B.stand(S.flipCard(K+'f-2005',.9,.36,'2005',INK.blue),1.0,-1.4,{layer:1,s:0});
  const frame=B.stand(portraitJose('f-frame',1.0,1.25),2.4,-.9,{layer:2,s:0});const cover=frame.flap(frameCover('f-cover',1.0,1.25),0,1.25,{z:.02});
  const benchP=B.stand(S.bench(K+'f-bench',1.0,.42),3.9,-.3,{layer:2});void benchP;
  const can=B.stand(wateringCan('f-can',.34),4.5,.45,{layer:3,s:0}),bag=B.stand(kitBag('f-bag',.62,.52),3.45,.55,{layer:3,s:0});
  const bagTag=B.stand(S.flipCard(K+'f-tag',1.1,.3,'ANDORINHA',INK.yellow,INK.navy),3.45,1.15,{layer:3,s:0});
  const flowers=[0,1,2,3,4].map(i=>B.stand(flower(`f-fl${i}`,.45,[INK.pink,INK.yellow,INK.orange,INK.white,INK.pink][i]),.8+i*.8,2.05,{layer:3,s:0}));
  const fam=[B.person(K+'f-mum',1.3,.5,1.6,{shirt:'coach',hair:'long',adult:true,skin:'#e8b48f',hairColor:'#4a3025',face:'smile',layer:3}),B.person(K+'f-hugo',.7,1.2,1.4,{shirt:'navy',hair:'short',skin:'#e8b48f',hairColor:'#2b2230',face:'smile',layer:3}),B.person(K+'f-sis',1.9,1.35,1.3,{shirt:'bib',hair:'long',skin:'#e8b48f',hairColor:'#5a3a2a',face:'smile',layer:3})];
  const hearts=[0,1,2].map(i=>B.stand(heart(`f-h${i}`,.28),1.9+i*.5,.25,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,26.0):b.t;
   c03.flip=-2.9+2.9*beat(t,2.2,3);H.body.s=beat(t,2.8,3.6);planeP.dx=-2.8*beat(t,2,7);planeP.visible=t<7.2;
   fergie.body.s=beat(t,8.6,9.4);fCard.s=beat(t,11.2,12)*(1-beat(t,14.4,15));const arm=beat(t,10,10.6)*(1-beat(t,13.8,14.4))+beat(t,37,37.8);fergie.armR.rot=.12+1.0*arm;
   mates.forEach((m,i)=>{m.body.s=beat(t,4.6+i*.5,5.4+i*.5);m.armR.rot=.12+1.8*beat(t,5.6+i*.3,6.2+i*.3)-1.8*beat(t,7.6,8.2)+1.5*beat(t,37.4,38);});
   const grey=beat(t,14,15.4)*(1-beat(t,36,38));rainL.scale=grey;rainR.scale=beat(t,14.4,15.8)*(1-beat(t,35.6,37.6));rainL.visible=rainL.scale>.02;rainR.visible=rainR.scale>.02;sunR.dy=-1.1*grey+.3*beat(t,37,39);
   yr.s=beat(t,14.2,15);H.body.yaw=-.35*beat(t,17,18)*(1-beat(t,36,37));
   frame.s=beat(t,18.6,19.6);can.s=beat(t,20,20.6);bag.s=beat(t,21.8,22.5);bagTag.s=beat(t,22.6,23.3);
   const lift=Math.max(beat(t,27,28.4),manual?beat(act,0,.8):0);cover.flip=-2.85*lift;
   flowers.forEach((f,i)=>{f.s=Math.max(beat(t,28.6+i*.35,29.2+i*.35),manual?beat(act,.4+i*.1,.6+i*.1):0);});
   fam.forEach((p,i)=>{p.body.s=beat(t,30.2+i*.5,31+i*.5);const hug=beat(t,32.4,33.2);if(i===0){p.armR.rot=.12+1.0*hug;}else{p.armL.rot=-.12-.9*hug;p.armR.rot=.12+.9*hug;}});
   hearts.forEach((h,i)=>{h.s=Math.max(beat(t,33.6+i*.5,34.2+i*.5),manual?beat(act,.8,1):0);});
   return b.narrated?-.4*beat(t,1.6,2.6)+.8*beat(t,15.8,16.8)-.4*beat(t,35.6,36.6):0;
  };
 }};
const portraitJose=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.fill(f,INK.wood);k.dots(f,INK.brown,.035,.4);k.key(f,.016);const m=rect(w*.1,h*.1,w*.8,h*.72);k.fill(m,INK.sky2);k.dots(m,INK.yellow,.04,(x,y)=>.5-y/h*.4);k.key(m,.012);
 const cx=w/2,cy=h*.42,r=w*.2;k.fill(`M${cx-w*.3} ${h*.82} Q${cx} ${h*.5} ${cx+w*.3} ${h*.82} Z`,INK.green);k.key(`M${cx-w*.3} ${h*.82} Q${cx} ${h*.5} ${cx+w*.3} ${h*.82}`,.012);
 k.fill(ell(cx,cy,r,r*1.15),'#d99a6c');k.key(ell(cx,cy,r,r*1.15),.012);k.fill(`M${cx-r} ${cy-r*.3} Q${cx-r*.9} ${cy-r*1.25} ${cx} ${cy-r*1.2} Q${cx+r*.9} ${cy-r*1.25} ${cx+r} ${cy-r*.3} Q${cx} ${cy-r*.8} ${cx-r} ${cy-r*.3} Z`,'#2b2230');
 k.circle(cx-r*.38,cy-r*.05,r*.09,INK.navy,true);k.circle(cx+r*.38,cy-r*.05,r*.09,INK.navy,true);k.fill(`M${cx-r*.5} ${cy+r*.35} Q${cx} ${cy+r*.15} ${cx+r*.5} ${cy+r*.35} Q${cx} ${cy+r*.5} ${cx-r*.5} ${cy+r*.35} Z`,'#2b2230');k.key(`M${cx-r*.35} ${cy+r*.62} Q${cx} ${cy+r*.8} ${cx+r*.35} ${cy+r*.62}`,.012);
 const pl=rect(w*.25,h*.85,w*.5,h*.1);k.fill(pl,INK.gold);k.key(pl,.01);k.text('JOSÉ',w/2,h*.93,h*.075,INK.navy,{max:w*.46});});

/* ───────────── 5 · Booed, but not beaten (booed) ───────────── */
const booed:SpreadDef={id:'booed',rest:22.4,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy,.92);chalk(k,`M-5 ${Z(-2.0)} L0 ${Z(-2.0)}`);chalk(k,ell(0,Z(-.3),1.0,1.0));
  k.text('WORLD CUP 2006',-2.5,Z(2.62),.4,INK.yellow,{max:4});k.text('PORTUGAL PLAYED ENGLAND',-2.5,Z(2.9),.16,INK.white,{weight:800});},
 right:k=>{pitch(k,0,5);chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);chalk(k,ell(0,Z(-.3),1.0,1.0));chalk(k,`M2.4 ${Z(-2.0)} L2.4 ${Z(-1.0)} L4.6 ${Z(-1.0)} L4.6 ${Z(-2.0)}`);
  k.text('TWENTY GOALS',2.5,Z(2.62),.42,INK.pink,{max:3.8});k.text('AND THE PREMIER LEAGUE TITLE',2.5,Z(2.9),.15,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'b-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.red,INK.green,INK.white,INK.red,INK.blue,INK.white],2);lightRig(k,1.2,.3);lightRig(k,3.5,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'b-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#b8bccb',INK.navy,y=>.3-y*.05);crowd(k,4.5,1.1,2.5,[INK.red,INK.white,'#2b2b33',INK.red,INK.yellow],4);lightRig(k,1.1,.3);lightRig(k,3.6,.3);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},-3.05,1.22);
  const conf=[bd.add(S.confetti(K+'b-cf1',2.2,1.1,2),'R',.4,1.2,{out:.04}),bd.add(S.confetti(K+'b-cf2',2.2,1.1,5),'R',2.3,1.3,{out:.04})];
  const board=B.stand(S.scoreboard(K+'b-board',2.0,1.5,'WORLD CUP 2006'),-3.3,-1.55,{layer:1});board.add(lineCard('b-pe',1.6,.68,['PORTUGAL','ENGLAND'],INK.white),0,.4,{z:.012});
  const H=B.person(K+'b-cr',-1.6,.4,1.3,{shirt:'casual',...CR,number:'7',face:'open',layer:2});
  const ref=B.person(K+'b-ref',-2.8,.6,1.72,{shirt:'navy',hair:'bald',adult:true,skin:'#f1b88f',face:'open',layer:2});
  const card=ref.body.add(sp('b-red',.15,.21,k=>{const b=rect(0,0,.15,.21);k.fill(b,INK.red);k.key(b,.012);},{rim:.015}),.42,ref.h*1.07,{anchor:'center',z:.02});
  const other=B.person(K+'b-other',-4.0,1.2,1.3,{shirt:'ger',hair:'short',skin:'#f1b88f',face:'shy',layer:3});
  const boos=[0,1,2].map(i=>{const st=B.stand(sp(`b-cheer${i}`,.95,.95,k=>{k.keyFill(rect(.44,.5,.07,.45),INK.brown);const bb=rect(0,0,.95,.52);k.fill(bb,INK.pink);k.dots(bb,INK.navy,.03,.2);k.key(bb,.013);k.text('YAY!',.475,.36,.24,INK.white,{weight:900});}),.9+i*1.3,-.95+(i%2)*.45,{layer:1,s:0});
   const f=st.flap(sp(`b-boo${i}`,.95,.52,k=>{const bb=rect(0,0,.95,.52);k.fill(bb,'#8d93a8');k.hatch(bb,INK.navy,.05,-.5,.008);k.key(bb,.013);k.text('BOO',.475,.36,.24,INK.navy,{weight:900});},{rim:.015}),0,.95,{z:.02});return {st,f};});
  const R=B.person(K+'b-cr2',2.0,1.05,1.3,{shirt:'casual',...CR,number:'7',legs:'kick',face:'smile',layer:3});
  const bagP=B.stand(suitcase('b-bag',.45,.4,INK.blue),2.7,1.6,{layer:3,s:0}),no=B.stand(stamp('b-no',.7,.34,'STAY'),3.5,1.65,{layer:3,s:0});
  const counter=B.stand(S.scoreboard(K+'b-count',1.1,1.1,'LEAGUE GOALS'),4.3,-.25,{layer:2,s:0});counter.add(S.flipCard(K+'b-g20',.8,.42,'20',INK.pink),0,.28,{z:.012});
  const gflaps=['15','10','5','0'].map((l,i)=>counter.flap(S.flipCard(K+`b-g${l}`,.8,.42,l,i%2?INK.blue:'#3d5da0'),0,.7,{z:.012+(i+1)*.005}));
  const goalP=B.stand(S.goal(K+'b-goal',1.5,.8),3.5,-1.75,{layer:1});void goalP;
  const trophy=B.stand(S.trophy(K+'b-trophy',.5,.85),.75,.5,{layer:2,s:0}),champ=B.stand(S.flipCard(K+'b-champ',1.3,.32,'CHAMPIONS',INK.yellow,INK.navy),.75,1.2,{layer:3,s:0});
  const ball=B.stand(S.ball(K+'b-ball',.11),2.4,1.15,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,22.4):b.t;
   H.body.s=beat(t,2.6,3.4);
   ref.body.s=beat(t,6.8,7.6);const raise=beat(t,8.6,9.3)*(1-beat(t,12.6,13.2));ref.armR.rot=.12+2.8*raise;card.visible=raise>.8;
   other.body.s=beat(t,7.2,8)*(1-beat(t,12.2,13.4));other.body.x=-4.0-.5*beat(t,10.4,12.4);
   const n=manual?act*3:0;boos.forEach((q,i)=>{q.st.s=beat(t,14.2+i*.8,14.9+i*.8);q.f.flip=-2.9*Math.max(clamp01(n-i),beat(t,24.9+i*.8,25.6+i*.8));});
   R.body.s=beat(t,14,14.8);R.body.yaw=-.35*pulse(t,15,18.4);
   bagP.s=beat(t,18.8,19.4)*(1-beat(t,22.4,23));no.s=beat(t,20.6,21.3)*(1-beat(t,23.4,24));
   const drib=beat(t,25,27.4);R.body.x=2.0+.9*drib;R.leg!.rot=-.6*Math.abs(Math.sin(t*5))*(t>25&&t<27.4?1:0);ball.s=R.body.s;
   counter.s=beat(t,27.6,28.3);const shots=[28.6,29.8,31,32.2];let bx=2.4+.9*drib,bz=1.15,dy=0;
   shots.forEach((a,i)=>{gflaps[i].flip=-3.2*beat(t,a+.5,a+.9);const u=(t-a)/.6;if(u>=0&&u<1){bx=3.3+.2*u;bz=1.15-2.6*u;dy=.3*Math.sin(u*Math.PI);}else if(u>=1&&u<1.6){bx=3.3;bz=1.15;dy=0;}});
   if(manual){bx=3.3;bz=1.15;}
   ball.x=bx;ball.z=bz;ball.dy=dy;ball.rot=-bx*6;R.leg!.rot+=-1*maxOf(shots.map(a=>pulse(t,a-.3,a+.2)));
   trophy.s=Math.max(beat(t,32.8,33.6),manual?beat(act,.9,1):0);champ.s=Math.max(beat(t,33.4,34),manual?beat(act,.9,1):0);
   cheer(R,Math.max(beat(t,33,33.6),manual?beat(act,.9,1):0));cheer(H,beat(t,35,35.6));
   conf.forEach((c,i)=>{c.dy=-1.1+1.3*(manual?beat(act,.9,1):beat(t,33.2+i*.4,35.4+i*.4));c.visible=t>33||manual;});
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,13.4,14.2)+.4*beat(t,14.2,15)-.4*beat(t,34,35):0;
  };
 }};

/* ───────────── 6 · Carried by his team (captain) ───────────── */
const captain:SpreadDef={id:'captain',rest:20.5,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy,.92);chalk(k,`M-5 ${Z(-2.0)} L0 ${Z(-2.0)}`);chalk(k,ell(0,Z(-.3),1.0,1.0));
  k.text('2004 · 2016',-2.5,Z(2.62),.46,INK.yellow,{max:3.8});k.text('TWO FINALS, TWELVE YEARS APART',-2.5,Z(2.9),.15,INK.white,{weight:800});},
 right:k=>{pitch(k,0,5,'#3f7f5a',INK.navy,.92);chalk(k,`M0 ${Z(-2.0)} L5 ${Z(-2.0)}`);chalk(k,ell(0,Z(-.3),1.0,1.0));chalk(k,`M2.4 ${Z(-2.0)} L2.4 ${Z(-1.0)} L4.6 ${Z(-1.0)} L4.6 ${Z(-2.0)}`);
  k.text('EURO 2016',2.5,Z(2.62),.46,INK.pink,{max:3.8});k.text('PORTUGAL’S FIRST MAJOR TROPHY',2.5,Z(2.9),.15,INK.white,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'c-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3,'#2a2a5e',INK.pink);crowd(k,4.5,1.2,2.6,[INK.red,INK.green,INK.white,INK.blue,INK.white],3);lightRig(k,1.3,.3);lightRig(k,3.4,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.15,2.6,[INK.red,INK.green,INK.yellow,INK.red,INK.white],6);lightRig(k,1.1,.3);lightRig(k,3.6,.3);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},-3.05,1.22);
  const fw=[bd.add(S.firework(K+'c-fw1',.4,INK.red),'R',1.2,1.1,{out:.03}),bd.add(S.firework(K+'c-fw2',.36,INK.green),'R',3.3,.9,{out:.03}),bd.add(S.firework(K+'c-fw3',.38,INK.yellow),'L',3.0,1.0,{out:.03})];
  const conf=[bd.add(S.confetti(K+'c-cf1',2.2,1.1,1),'R',.5,1.2,{out:.04}),bd.add(S.confetti(K+'c-cf2',2.2,1.1,4),'R',2.4,1.3,{out:.04})];
  const rain=bd.add(stormCloud('c-rain',1.2,.6),'L',1.4,2.5,{out:.03});
  const board=B.stand(S.scoreboard(K+'c-board',1.9,1.45,'FINAL'),-3.6,-1.5,{layer:1});board.add(lineCard('c-2016',1.5,.66,['2016','PORTUGAL WIN'],INK.white),0,.4,{z:.012});
  const f04=board.flap(lineCard('c-2004',1.5,.66,['2004','GREECE WIN'],'#3d5da0',INK.white),0,1.06,{z:.024});
  const teen=B.person(K+'c-teen',-2.2,.2,1.2,{shirt:'casual',...CR,number:'17',face:'sad',layer:2});
  const H=B.person(K+'c-cr',-1.5,.9,1.35,{shirt:'casual',...CR,number:'7',face:'smile',layer:3});
  const band=H.body.add(armband('c-band',.14,.12),-.28,H.h*.62,{anchor:'center',z:.02});band.scale=0;
  const capCard=B.stand(S.flipCard(K+'c-cap',1.1,.3,'CAPTAIN',INK.yellow,INK.navy),-3.2,1.7,{layer:3,s:0});
  const benchP=B.stand(S.bench(K+'c-bench',1.1,.45),-4.1,.4,{layer:2,s:0});const offCard=B.stand(S.flipCard(K+'c-off',.9,.3,'25 MIN',INK.blue),-4.1,1.05,{layer:3,s:0});
  const mates=[[1.2,.6,'#d99a6c','short'],[2.1,1.2,'#7f5138','curly'],[3.0,.5,'#f1b88f','bald'],[3.8,1.3,'#b27650','short']].map(([x,z,sk,hr],i)=>B.person(K+`c-m${i}`,x as number,z as number,1.3,{shirt:'casual',hair:hr as 'short',skin:sk as string,number:String(i+3),legs:i===1?'kick':undefined,face:'grin',layer:3}));
  const cup=B.stand(S.trophy(K+'c-cup',.55,.95),2.55,.9,{layer:3,s:0,tab:false});
  const keeper=B.person(K+'c-keeper',3.5,-1.3,1.28,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  B.stand(S.goal(K+'c-goal',1.6,.8),3.5,-1.75,{layer:1});
  const ball=B.stand(S.ball(K+'c-ball',.11),2.4,1.25,{layer:3,tab:false,s:0});
  const airport=B.stand(S.sign(K+'c-air',1.6,1.2,'AIRPORT',INK.sky),-3.6,-1.9,{layer:1,s:0});const airName=airport.flap(lineCard('c-airn',1.45,.4,['CRISTIANO RONALDO'],INK.white),0,1.2*.56,{z:.03});airName.flip=0;
  const planeP=bd.add(plane('c-plane',.8,.36),'L',.6,2.75,{out:.035});
  const hosp=B.stand(hospital('c-hosp',1.4,1.25),-1.6,-1.6,{layer:1,s:0});const cc=B.stand(lineCard('c-cc',1.2,.4,['CANCER CENTRE'],INK.pink,INK.white),-1.6,-.6,{layer:2,s:0});
  const coins=[0,1,2].map(i=>B.stand(coinP(`c-coin${i}`,.08),-2.0+i*.3,-.3,{layer:2,s:0,tab:false}));
  const mum=B.person(K+'c-mum',-.6,.25,1.55,{shirt:'coach',hair:'long',adult:true,skin:'#e8b48f',hairColor:'#4a3025',face:'grin',layer:2});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,20.5):b.t;
   teen.body.s=beat(t,2.4,3.2)*(1-beat(t,9.8,10.6));rain.scale=beat(t,5,6)*(1-beat(t,10.2,11));rain.visible=rain.scale>.02;f04.flip=-3.2*beat(t,11,11.6);
   H.body.s=beat(t,10.6,11.4);band.scale=beat(t,12.4,13);capCard.s=beat(t,12.8,13.4)*(1-beat(t,27.4,28));
   mates.forEach((m,i)=>{m.body.s=beat(t,13.6+i*.4,14.4+i*.4);});keeper.body.s=1;
   benchP.s=beat(t,17,17.8);offCard.s=beat(t,18.6,19.2)*(1-beat(t,27.4,28));const walk=beat(t,17.8,20);H.body.x=-1.5-2.0*walk;H.body.z=.9-.1*walk;
   // The team plays on, scores, and lifts the trophy.
   ball.s=beat(t,21.8,22.4);const u=beat(t,23.2,24.2);ball.x=2.4+1.0*u;ball.z=1.25-2.5*u;ball.dy=.3*Math.sin(u*Math.PI);mates[1].leg!.rot=-1.1*pulse(t,22.9,23.5);ball.visible=t<25;
   const dive=pulse(t,23.5,24.8);keeper.body.rot=.9*dive;keeper.body.dx=-.25*dive;
   const lift=Math.max(beat(t,25,26.4),manual?beat(act,0,.8):0);cup.s=Math.max(beat(t,24.6,25.2),manual?beat(act,0,.2):0);cup.dy=.95*lift;
   mates.forEach((m,i)=>{const w2=Math.max(beat(t,24.4+i*.15,25+i*.15),manual?beat(act,.2+i*.1,.5+i*.1):0);cheer(m,w2,.2*wave(t,26,44,1.3+i*.1));});
   cheer(H,Math.max(beat(t,25.4,26),manual?beat(act,.5,.9):0));
   fw.forEach((f,i)=>{const a=Math.max(beat(t,25.6+i*.4,26.6+i*.4),manual?beat(act,.6+i*.1,.8+i*.1):0);f.scale=a;f.rot=t*.2;f.visible=a>.02;});
   conf.forEach((c,i)=>{c.dy=-1.1+1.3*(manual?beat(act,.6,1):beat(t,25.8+i*.4,28+i*.4));c.visible=t>25.6||manual;});
   board.s=1-beat(t,27.4,28.1);airport.s=beat(t,28,28.8);planeP.dx=-2.6*beat(t,28.6,31.4);planeP.visible=t>28.4&&t<31.6;
   hosp.s=beat(t,31.8,32.6);coins.forEach((c,i)=>{c.s=beat(t,33.4+i*.4,33.9+i*.4);c.dy=.2*beat(t,34.8,35.6);});cc.s=beat(t,35.4,36.2);mum.body.s=beat(t,33,33.8);mum.armR.rot=.12+2.1*beat(t,36.4,37)+.3*wave(t,37,44,1.2);
   return b.narrated?-.45*beat(t,1.8,2.8)+.9*beat(t,13.2,14.2)-.9*beat(t,16.8,17.6)+.9*beat(t,21.8,22.6)-.9*beat(t,27.6,28.4)+.45*beat(t,38.6,39.4):0;
  };
 }};
const coinP=(key:string,r:number)=>sp(key,r*2,r*2,k=>{k.fill(ell(r,r,r,r),INK.gold);k.dots(ell(r,r,r,r),INK.orange,.025,.4);k.key(ell(r,r,r,r),.012);k.key(ell(r,r,r*.62,r*.62),.008,INK.orange);},{rim:.012});

export const SPREADS:Record<string,SpreadDef>={madeira,lisbon,heart:heartPage,father,booed,captain};
void TAU;void pulse;void wave;void clamp01;void track;void maxOf;void Math;
