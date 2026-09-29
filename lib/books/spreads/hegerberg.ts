/**
 * The six Hegerberg pop-up spreads (standing up for fairness): original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/hegerberg/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently: a tilted balance scale on a pin, a rain cloud, a calendar of months, a gate that opens again.
 * Kits are plain (red-pink for Norway, white for her club), with no crests or logos.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Person,type Part,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='hegerberg-',TAU=Math.PI*2;
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const show=(q:Part,v:number)=>{q.scale=v;q.visible=v>.02;};
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};
const ADA={skin:'#f4c9a8',hair:'long' as const,hairColor:'#e8c872'};
const ANDRINE={skin:'#f1c0a0',hair:'bun' as const,hairColor:'#c9a46a'};
const NOR=[INK.red,INK.white,INK.blue,INK.red,INK.white];

/* ───────────── page print helpers (solid ink) ───────────── */
function bar(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.04,c:string=INK.white){const L=Math.hypot(x1-x0,y1-y0)||1,nx=-(y1-y0)/L*w/2,ny=(x1-x0)/L*w/2;k.fill(poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]),c);}
function box(k:Kit,x:number,y:number,w:number,h:number,lw=.04,c:string=INK.white){bar(k,x,y,x+w,y,lw,c);bar(k,x+w,y,x+w,y+h,lw,c);bar(k,x+w,y+h,x,y+h,lw,c);bar(k,x,y+h,x,y,lw,c);}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function penaltyBox(k:Kit,x0:number,x1:number){bar(k,x0,Z(-2.05),x1,Z(-2.05),.05);const cx=(x0+x1)/2;box(k,cx-1.5,Z(-2.05),3.0,1.3,.05);box(k,cx-.7,Z(-2.05),1.4,.5,.05);k.fill(ell(cx,Z(-.1),.07,.07),INK.white);}
function meadow(k:Kit,x0:number,x1:number,tone='#b9c98a'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,INK.green,.06,(x,y)=>.12+.1*Math.sin(x*1.3+y*.7));for(let i=0;i<18;i++){const x=x0+.2+((i*29)%43)/43*(x1-x0-.4),y=.3+((i*31)%37)/37*5.6;bar(k,x,y,x+.04,y-.1,.02,INK.green);bar(k,x+.06,y,x+.08,y-.12,.02,INK.green);}}
function floor(k:Kit,x0:number,x1:number,tone:string,line:string){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,line,.06,.14);for(let y=.5;y<PAGE_D;y+=.5)bar(k,x0,y,x1,y,.02,line);}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.4);}}
function caption(k:Kit,x:number,big:string,small:string,c:string=INK.navy,bigC:string=INK.red,max=4.2){k.text(big,x,Z(2.62),.42,bigC,{max,weight:900});k.text(small,x,Z(2.92),.15,c,{weight:800,max});}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function peaks(k:Kit,w:number,y:number,tone:string,seed=0){const pts:number[][]=[[0,y+.6]];for(let i=0;i<=8;i++){const x=i/8*w,top=y-(.35+((i*7+seed)%5)*.12);pts.push([x,i%2?top:y+.15]);}pts.push([w,y+.6],[w,3.2],[0,3.2]);const p=poly(pts);k.fill(p,tone);k.hatch(p,INK.navy,.07,.7,.008);k.key(p,.012);
 for(let i=1;i<=8;i+=2){const x=i/8*w,top=y-(.35+((i*7+seed)%5)*.12);k.fill(poly([[x,top],[x+.12,top+.16],[x+.04,top+.12],[x-.04,top+.18],[x-.12,top+.16]]),INK.white);}}
function fjord(k:Kit,w:number,y:number,h:number){const s=rect(0,y,w,h);k.fill(s,INK.blue);k.dots(s,INK.navy,.045,.3);for(let i=0;i<7;i++)k.key(`M${.3+i*.62} ${y+.1+(i%2)*.12} l.22 0`,.012,INK.white);}
function woodHouses(k:Kit,x0:number,n:number,y:number,seed=1){const cs=['#c0392b','#e4574a','#f3d9a4','#d98a3a'];for(let i=0;i<n;i++){const x=x0+i*.42,h=.3+((i*5+seed)%3)*.08,b=rect(x,y-h,.34,h);k.fill(b,cs[(i+seed)%4]);k.key(b,.01);for(let j=1;j<4;j++)k.key(`M${x+j*.085} ${y-h} L${x+j*.085} ${y}`,.006,'#7a2a20');
 const r=poly([[x-.04,y-h],[x+.17,y-h-.16],[x+.38,y-h]]);k.fill(r,'#3d4a5c');k.key(r,.01);k.fill(rect(x+.12,y-h+.08,.1,.09),INK.yellow);}}
function gables(k:Kit,w:number,y:number){for(let i=0;i<9;i++){const x=.05+i*.49,h=.6+((i*3)%3)*.12,b=rect(x,y-h,.44,h);k.fill(b,i%2?'#e9d8b8':'#d8c4a0');k.key(b,.01);k.fill(poly([[x-.02,y-h],[x+.22,y-h-.32],[x+.46,y-h]]),'#a34a3a');for(let r=0;r<2;r++)k.fill(rect(x+.08+r*.18,y-h+.14,.1,.14),INK.sky2);}}
function norFlag(k:Kit,x:number,y:number,w:number,h:number){k.fill(rect(x,y,w,h),INK.red);k.fill(rect(x+w*.28,y,w*.18,h),INK.white);k.fill(rect(x,y+h*.38,w,h*.24),INK.white);k.fill(rect(x+w*.32,y,w*.1,h),INK.navy);k.fill(rect(x,y+h*.44,w,h*.12),INK.navy);k.key(rect(x,y,w,h),.01);}

/* ───────────── book-specific plates ───────────── */
const stormCloud=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#8d93a8');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26,ink,{max:w*.86,weight:900}));},{rim:.018});
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
const star=(key:string,s:number,c:string=INK.yellow)=>sp(key,s,s,k=>{const p=poly(Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,rr=i%2?s*.2:s*.48;return [s/2+Math.cos(a)*rr,s/2+Math.sin(a)*rr];}));k.fill(p,c);k.dots(p,INK.orange,.03,.3);k.key(p,.012);},{rim:.015});
const pow=(key:string,r:number)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:16},(_,i)=>{const a=i/16*TAU,rr=i%2?r*.5:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});k.fill(poly(pts),INK.yellow);k.dots(poly(pts),INK.orange,.03,.4);k.key(poly(pts),.012);},{rim:.02});
const qCover=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.hatch(b,INK.navy,.06,.7,.008);k.key(b,.013);k.fill(ell(w/2,h*.46,w*.26,w*.26),INK.white);k.text('?',w/2,h*.56,h*.34,INK.navy,{weight:900});},{rim:.015});
const board=(key:string,w:number,h:number,title:string,band:string=INK.navy)=>sp(key,w,h,k=>{k.keyFill(rect(w*.1,h*.8,w*.06,h*.2),INK.brown);k.keyFill(rect(w*.84,h*.8,w*.06,h*.2),INK.brown);const b=rect(0,0,w,h*.82);k.fill(b,INK.white);k.dots(b,INK.sky,.04,.18);k.key(b,.016);k.fill(rect(0,0,w,h*.15),band);k.text(title,w/2,h*.115,h*.08,INK.yellow,{max:w*.86,weight:900});});
const sisterCard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.sky);k.dots(b,INK.navy,.03,.15);k.key(b,.012);
 const face=(x:number,y:number,r:number,hair:string)=>{k.fill(`M${x-r*1.3} ${y+r*2.2} Q${x} ${y+r*.8} ${x+r*1.3} ${y+r*2.2} Z`,INK.red);k.fill(`M${x-r*1.1} ${y+r*1.4} L${x-r*1.05} ${y-r*.2} Q${x} ${y-r*1.5} ${x+r*1.05} ${y-r*.2} L${x+r*1.1} ${y+r*1.4} Z`,hair);k.fill(ell(x,y,r*.85,r),'#f4c9a8');k.key(ell(x,y,r*.85,r),.01);k.fill(`M${x-r*.9} ${y-r*.2} Q${x} ${y-r*1.3} ${x+r*.9} ${y-r*.2} Q${x} ${y-r*.6} ${x-r*.9} ${y-r*.2} Z`,hair);k.circle(x-r*.3,y,r*.1,INK.navy,true);k.circle(x+r*.3,y,r*.1,INK.navy,true);k.key(`M${x-r*.3} ${y+r*.42} Q${x} ${y+r*.62} ${x+r*.3} ${y+r*.42}`,.01);};
 face(w*.34,h*.36,w*.13,'#c9a46a');face(w*.68,h*.42,w*.11,'#e8c872');k.fill(rect(0,h*.8,w,h*.2),INK.white);k.text('ANDRINE',w/2,h*.95,h*.12,INK.navy,{max:w*.9,weight:900});},{rim:.015});
const car=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{k.fill(rect(w*.26,0,w*.46,h*.14),INK.brown);k.fill(rect(w*.3,h*.02,w*.16,h*.1),INK.red);k.fill(rect(w*.5,h*.02,w*.16,h*.1),INK.blue);
 const body=`M0 ${h*.82} L0 ${h*.52} L${w*.2} ${h*.47} L${w*.32} ${h*.16} L${w*.72} ${h*.16} L${w*.86} ${h*.47} L${w} ${h*.54} L${w} ${h*.82} Z`;k.fill(body,c);k.dots(body,INK.navy,.035,.2);k.key(body,.014);
 k.fill(poly([[w*.36,h*.22],[w*.5,h*.22],[w*.5,h*.46],[w*.26,h*.46]]),INK.sky2);k.fill(poly([[w*.54,h*.22],[w*.7,h*.22],[w*.8,h*.46],[w*.54,h*.46]]),INK.sky2);for(const x of [.22,.78]){k.fill(ell(w*x,h*.84,h*.16,h*.16),INK.navy);k.circle(w*x,h*.84,h*.06,INK.grey);}});
const doorFrame=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.fill(f,'#e2b77a');k.dots(f,INK.brown,.04,.3);k.key(f,.016);const o=rect(w*.14,h*.12,w*.72,h*.88);k.fill(o,INK.sky2);k.dots(o,INK.yellow,.035,(x,y)=>.6-y/h*.5);
 const hill=`M${w*.14} ${h*.8} Q${w*.4} ${h*.5} ${w*.86} ${h*.62} L${w*.86} ${h} L${w*.14} ${h} Z`;k.fill(hill,'#a9bd7e');k.fill(rect(w*.5,h*.46,w*.14,h*.14),'#f2e6cc');k.fill(poly([[w*.48,h*.46],[w*.57,h*.36],[w*.66,h*.46]]),'#d8ccb0');
 k.fill(rect(w*.14,h*.9,w*.72,h*.1),INK.blue);k.fill(rect(w*.2,h*.14,w*.6,h*.14),INK.white);k.text(label,w/2,h*.25,h*.09,INK.navy,{max:w*.55,weight:900});});
const doorLeaf=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,INK.blue);k.dots(d,INK.navy,.035,.3);k.key(d,.014);for(let i=1;i<5;i++)k.key(`M${i*w/5} ${h*.04} L${i*w/5} ${h*.96}`,.01,INK.navy);k.circle(w*.84,h*.55,.03,INK.gold);k.text('OPEN',w/2,h*.4,h*.1,INK.white,{weight:900,max:w*.8});},{rim:.014});
const scaleBase=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.fill(poly([[w*.2,h],[w*.8,h],[w*.62,h*.9],[w*.38,h*.9]]),INK.gold);k.key(poly([[w*.2,h],[w*.8,h],[w*.62,h*.9],[w*.38,h*.9]]),.012);k.keyFill(rect(w*.46,h*.06,w*.08,h*.86),INK.gold);k.fill(ell(w/2,h*.05,w*.07,w*.07),INK.orange);k.key(ell(w/2,h*.05,w*.07,w*.07),.012);});
const scaleBeam=(key:string,w:number,h:number,a:string,b:string)=>sp(key,w,h,k=>{k.keyFill(rect(0,h*.06,w,h*.07),INK.gold);
 for(const [x,l,c] of [[w*.1,a,INK.sky],[w*.9,b,INK.pink]] as const){k.key(`M${x} ${h*.1} L${x-w*.08} ${h*.66} M${x} ${h*.1} L${x+w*.08} ${h*.66}`,.012);const pan=`M${x-w*.1} ${h*.66} L${x+w*.1} ${h*.66} Q${x+w*.08} ${h*.84} ${x} ${h*.84} Q${x-w*.08} ${h*.84} ${x-w*.1} ${h*.66} Z`;k.fill(pan,INK.gold);k.key(pan,.012);
  const t=rect(x-w*.1,h*.86,w*.2,h*.14);k.fill(t,c);k.key(t,.01);k.text(l,x,h*.97,h*.1,INK.navy,{weight:900,max:w*.19});}},{rim:.015});
const shirtHang=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.key(`M${w/2} 0 L${w/2} ${h*.1} M${w*.2} ${h*.2} L${w/2} ${h*.1} L${w*.8} ${h*.2}`,.02,INK.navy);
 const p=poly([[w*.24,h*.2],[w*.4,h*.2],[w*.5,h*.28],[w*.6,h*.2],[w*.76,h*.2],[w,h*.38],[w*.88,h*.5],[w*.78,h*.44],[w*.78,h],[w*.22,h],[w*.22,h*.44],[w*.12,h*.5],[0,h*.38]]);k.fill(p,INK.red);k.dots(p,INK.navy,.035,.2);k.key(p,.014);k.fill(rect(w*.22,h*.56,w*.56,h*.06),INK.white);k.fill(rect(w*.22,h*.58,w*.56,h*.03),INK.blue);},{rim:.015});
const placard=(key:string,w:number,h:number,lines:string[],c:string)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.6,w*.08,h*.4),INK.brown);const b=rect(0,0,w,h*.62);k.fill(b,c);k.dots(b,INK.navy,.03,.15);k.key(b,.014);lines.forEach((l,i)=>k.text(l,w/2,h*(.22+i*.2),h*.13,INK.navy,{weight:900,max:w*.86}));});
const clock=(key:string,s:number)=>sp(key,s,s,k=>{k.fill(ell(s/2,s/2,s*.46,s*.46),INK.white);k.key(ell(s/2,s/2,s*.46,s*.46),.02);for(let i=0;i<12;i++){const a=i/12*TAU;k.key(`M${s/2+Math.cos(a)*s*.36} ${s/2+Math.sin(a)*s*.36} L${s/2+Math.cos(a)*s*.42} ${s/2+Math.sin(a)*s*.42}`,.012);}k.key(`M${s/2} ${s/2} L${s/2} ${s*.2} M${s/2} ${s/2} L${s*.72} ${s*.58}`,.025,INK.red);},{rim:.015});
const kneeScan=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.46,h*.8,w*.08,h*.2),INK.grey);const b=rect(0,0,w,h*.82);k.fill(b,'#1e2a4a');k.key(b,.016);
 k.fill(`M${w*.36} ${h*.06} L${w*.52} ${h*.06} L${w*.54} ${h*.36} Q${w*.62} ${h*.42} ${w*.56} ${h*.46} L${w*.34} ${h*.46} Q${w*.3} ${h*.4} ${w*.36} ${h*.36} Z`,'#cfe6f2');k.fill(`M${w*.36} ${h*.5} L${w*.56} ${h*.5} Q${w*.6} ${h*.54} ${w*.54} ${h*.58} L${w*.52} ${h*.78} L${w*.38} ${h*.78} L${w*.36} ${h*.58} Q${w*.3} ${h*.54} ${w*.36} ${h*.5} Z`,'#cfe6f2');
 k.key(`M${w*.4} ${h*.44} L${w*.47} ${h*.48} M${w*.52} ${h*.52} L${w*.5} ${h*.49}`,.02,INK.pink);k.fill(rect(w*.62,h*.4,w*.3,h*.14),INK.pink);k.text('ACL',w*.77,h*.51,h*.1,INK.white,{weight:900});},{rim:.015});
const crutch=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.44,h*.1,w*.12,h*.9),INK.grey);k.keyFill(rect(w*.1,h*.02,w*.8,h*.08),INK.grey);k.keyFill(rect(w*.25,h*.45,w*.5,h*.05),INK.navy);},{rim:.012});
const stage=(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(let i=0;i<3;i++){const s=rect(w*(.1+i*.12),h*(.2+i*.27),w*(.8-i*.24),h*.27);k.fill(s,i===0?INK.gold:INK.wood);k.dots(s,INK.brown,.035,.3);k.key(s,.012);}k.text('A HUGE STEP',w/2,h*.4,h*.13,INK.navy,{weight:900,max:w*.72});k.text('FORWARD',w/2,h*.66,h*.12,INK.white,{weight:900,max:w*.5});});
const gatePost=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{for(const x of [0,w-.16]){const p=rect(x,h*.12,.16,h*.88);k.fill(p,INK.stone);k.dots(p,'#8f8367',.035,.3);k.key(p,.012);k.fill(rect(x-.03,h*.08,.22,.08),INK.grey);}
 const a=`M.08 ${h*.14} Q${w/2} ${-h*.06} ${w-.08} ${h*.14} L${w-.08} ${h*.26} Q${w/2} ${h*.08} .08 ${h*.26} Z`;k.fill(a,INK.red);k.key(a,.012);k.text(label,w/2,h*.2,h*.07,INK.white,{max:w*.6,weight:900});});
const gateLeaf=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.key(f,.03,c);for(let i=1;i<6;i++)k.key(`M${i*w/6} 0 L${i*w/6} ${h}`,.022,c);k.key(`M0 ${h*.3} L${w} ${h*.3} M0 ${h*.75} L${w} ${h*.75}`,.026,c);for(let i=0;i<6;i++)k.fill(poly([[i*w/6+.02,0],[(i+.5)*w/6,-.08],[(i+1)*w/6-.02,0]]),c);},{rim:.012});
const table=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.fill(rect(0,0,w,h*.18),INK.wood);k.key(rect(0,0,w,h*.18),.012);k.keyFill(rect(w*.08,h*.18,w*.06,h*.82),INK.brown);k.keyFill(rect(w*.86,h*.18,w*.06,h*.82),INK.brown);k.fill(rect(w*.3,-.0,w*.16,h*.06),INK.white);k.fill(rect(w*.56,0,w*.14,h*.06),INK.white);});
const flagPlate=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(0,0,.05,h),INK.brown);norFlag(k,.05,.02,w-.05,h*.55);},{rim:.015});
const keeperGoal=(B:Builder,key:string,x:number,z:number,skin:string)=>{B.stand(S.goal(K+key+'-goal',1.8,.9),x,z,{layer:1});return B.person(K+key+'-gk',x,z+.4,1.35,{shirt:'keeper',hair:'bun',skin,face:'open',layer:2,holdL:'glove',holdR:'glove'});};
/** Three goals in turn: returns ball position at time u (0–3 over three kicks). */
function kicks3(u:number,sx:number,sz:number,gx:number,gz:number):[number,number,number,boolean]{const i=Math.min(2,Math.floor(u)),f=u-i;if(u<=0)return [sx,sz,0,true];if(u>=3)return [gx+(i-1)*.4,gz,0,false];const e=smooth(Math.min(1,f*1.4));return [sx+(gx+(i-1)*.45-sx)*e,sz+(gz-sz)*e,.35*Math.sin(e*Math.PI),f<.85];}

/* ───────────── 1 · Two sisters, a new town (sisters) ───────────── */
const sisters:SpreadDef={id:'sisters',rest:18.8,
 left:k=>{meadow(k,-5,0);bar(k,-4.8,Z(.2),-.1,Z(.6),.5,'#cdbf9f');caption(k,-2.5,'MOLDE · 1995','GREW UP IN SUNNDALSØRA',INK.navy,INK.blue);},
 right:k=>{pitch(k,0,5);penaltyBox(k,0,5);caption(k,2.5,'KOLBOTN · 2007','A NEW TOWN, A NEW CLUB',INK.navy,INK.red);},
 build:B=>{
  const bd=B.vfold({key:K+'s-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);peaks(k,4.5,1.4,'#9aa3bd',1);fjord(k,4.5,1.95,.35);woodHouses(k,.4,5,2.4,1);k.fill(rect(0,2.4,4.5,.6),'#b9c98a');}},
   {key:K+'s-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);const hill=`M0 1.8 Q1.4 1.3 2.6 1.7 Q3.6 1.9 4.5 1.5 L4.5 3 L0 3 Z`;k.fill(hill,'#6f9a52');k.dots(hill,INK.green,.05,.3);woodHouses(k,2.0,6,2.3,2);lightRig(k,.8,1.0);k.fill(rect(0,2.4,4.5,.6),INK.grass);}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'s-sun',.32),'R',3.8,1.2,{out:.012}),cl=bd.add(S.cloud(K+'s-cl',1.0,.45),'L',1.6,2.7);
  const sign=B.stand(S.sign(K+'s-sign',1.1,1.15,'MOLDE'),-.8,-1.5,{layer:1});const c95=sign.flap(S.flipCard(K+'s-1995',.85,.36,'1995',INK.blue),0,1.15*.56,{z:.03});
  const pines=[[-4.6,-1.2,1.4],[-3.9,-1.35,1.2],[-1.8,-1.9,1.3]].map(([x,z,h],i)=>B.stand(S.tree(K+`s-pine${i}`,.5,h,'pine'),x,z,{layer:1}));void pines;
  const place=B.stand(S.flipCard(K+'s-sunn',1.4,.32,'SUNNDALSØRA',INK.white,INK.navy),-2.9,-1.2,{layer:1,s:0});
  const ada=B.person(K+'s-ada',-3.3,.9,.9,{shirt:'casual',...ADA,face:'grin',legs:'kick',layer:3});
  const and=B.person(K+'s-and',-1.7,.6,1.05,{shirt:'bib',...ANDRINE,face:'grin',legs:'kick',layer:2});
  const sis=B.stand(S.flipCard(K+'s-sis',1.2,.3,'BIG SISTER',INK.pink),-1.6,1.55,{layer:3,s:0});
  const carP=B.stand(car('s-car',1.2,.62,INK.red),-4.2,1.6,{layer:3,s:0});const move=B.stand(S.flipCard(K+'s-move',1.1,.32,'MOVING · 2007',INK.yellow,INK.navy),-.9,-.4,{layer:2,s:0});
  const bdR=B.stand(board('s-who',1.2,1.25,'WHO CAME ALONG?',INK.red),.9,-1.4,{layer:1,s:0});bdR.add(sisterCard('s-card',.7,.8),0,.28,{z:.012});const flap=bdR.flap(qCover('s-q',.74,.84,INK.blue),-.37,.26,{z:.024,anchor:'bl',axis:'y'});
  const club=B.stand(S.sign(K+'s-club',1.2,1.15,'KOLBOTN',INK.yellow),4.3,-.9,{layer:1,s:0});
  const gk=keeperGoal(B,'s-keep',2.6,-1.75,'#f1c0a0');
  const ada2=B.person(K+'s-ada2',2.3,.9,1.05,{shirt:'navy',...ADA,face:'smile',legs:'kick',layer:3});
  const and2=B.person(K+'s-and2',1.2,1.35,1.15,{shirt:'navy',...ANDRINE,face:'grin',layer:3});
  const hat=B.stand(lineCard('s-hat',1.4,.5,['HAT-TRICK','AGED 16'],INK.yellow,INK.navy),4.1,.4,{layer:2,s:0});
  const balls=[0,1,2].map(i=>B.stand(S.ball(K+`s-b${i}`,.1),2.5,1.0,{layer:3,tab:false,s:0}));
  const hearts=[0,1,2].map(i=>B.stand(heart(`s-heart${i}`,.26),3.0+i*.5,1.95,{layer:3,s:0}));
  const ballL=B.stand(S.ball(K+'s-bl',.1),-3.0,1.0,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.8):b.t;
   cl.dx=.5*beat(t,0,36);sun.dy=.5*beat(t,0,3);c95.flip=-2.9+2.9*beat(t,3,3.8);place.s=beat(t,6.6,7.4);ada.body.s=beat(t,4.6,5.4);
   and.body.s=beat(t,10,10.8);sis.s=beat(t,11,11.8)*(1-beat(t,17.4,18));ballL.s=beat(t,10.6,11.2)*(1-beat(t,14.2,14.8));
   const [lx,lz]=track(t,[[0,-3.0,1.0],[11.4,-3.0,1.0],[12.2,-1.9,.75],[12.8,-1.9,.75],[13.6,-3.0,1.0]]);ballL.x=lx;ballL.z=lz;ada.leg!.rot=-.9*pulse(t,11.1,11.7);and.leg!.rot=-.9*pulse(t,12.5,13.1);
   carP.s=beat(t,14,14.8);carP.x=-4.2+2.6*beat(t,15,17.8);move.s=beat(t,14.6,15.4);ada.body.s=beat(t,4.6,5.4)*(1-beat(t,15.6,16.2));and.body.s=beat(t,10,10.8)*(1-beat(t,15.8,16.4));
   bdR.s=beat(t,17.4,18.2);const lift=Math.max(beat(t,19.6,20.8),manual?beat(act,0,.7):0);flap.flip=-2.6*lift;
   club.s=Math.max(beat(t,21.8,22.6),manual?beat(act,.5,.8):0);and2.body.s=Math.max(beat(t,22,22.8),manual?beat(act,.55,.85):0);ada2.body.s=Math.max(beat(t,22.6,23.4),manual?beat(act,.65,.95):0);cheer(and2,Math.max(beat(t,23.6,24.2)*(1-beat(t,25,25.6)),manual?beat(act,.85,1):0));
   gk.body.s=beat(t,24.6,25.4);
   const u=clamp01((t-26.2)/1.6)+clamp01((t-28.2)/1.6)+clamp01((t-30.2)/1.6);balls.forEach((bl,i)=>{const [x,z,dy,vis]=kicks3(clamp01(u-i),2.5,1.0,2.6,-1.6);bl.x=x;bl.z=z;bl.dy=dy;bl.s=t>25.6+i*2?1:0;bl.visible=bl.s>0;bl.rot=-t*3;void vis;});
   ada2.leg!.rot=-1*Math.max(pulse(t,25.9,26.5),pulse(t,27.9,28.5),pulse(t,29.9,30.5));gk.body.rot=.7*Math.max(pulse(t,26.4,27.6),pulse(t,28.4,29.6)*-1,pulse(t,30.4,31.6));
   hat.s=beat(t,31,31.8);cheer(ada2,beat(t,31.4,32));cheer(and2,beat(t,33.6,34.2));
   hearts.forEach((h,i)=>{h.s=beat(t,34+i*.5,34.6+i*.5);});
   return b.narrated?-.45*beat(t,2.6,3.6)+.45*beat(t,17,18)+.45*beat(t,18,19)-.45*beat(t,33,34):0;
  };
 }};

/* ───────────── 2 · Far from home (abroad) ───────────── */
const abroad:SpreadDef={id:'abroad',rest:19.0,
 left:k=>{pitch(k,-5,0,'#7fa77a','#5c7f63');penaltyBox(k,-5,0);caption(k,-2.5,'GERMANY · 2013','EURO FINAL · NORWAY LOST 1–0',INK.navy,INK.blue);},
 right:k=>{pitch(k,0,5);penaltyBox(k,0,5);caption(k,2.5,'LYON · 2014','26 GOALS IN 22 LEAGUE GAMES',INK.navy,INK.red);},
 build:B=>{
  const bd=B.vfold({key:K+'a-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#b8bccb',INK.navy,y=>.35-y*.06);gables(k,4.5,2.35);k.fill(rect(0,2.35,4.5,.65),'#7fa77a');}},
   {key:K+'a-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.6-y/3*.6);const hill=`M0 1.7 Q1.2 .9 2.6 1.3 Q3.6 1.6 4.5 1.3 L4.5 3 L0 3 Z`;k.fill(hill,'#8fae6a');k.dots(hill,INK.green,.05,.3);
    const bas=rect(1.6,.85,.8,.4);k.fill(bas,'#f2e6cc');k.key(bas,.012);for(const x of [1.6,2.3])k.fill(rect(x,.6,.1,.3),'#f2e6cc');k.fill(`M1.85 .85 Q2.0 .6 2.15 .85 Z`,'#d8ccb0');
    fjord(k,4.5,1.9,.3);for(let i=0;i<10;i++){const x=.1+i*.45,h=.35+((i*3)%3)*.08;k.fill(rect(x,2.3-h,.4,h),i%2?'#f3c98a':'#f6dcb0');k.fill(poly([[x-.02,2.3-h],[x+.2,2.3-h-.1],[x+.42,2.3-h]]),INK.orange);}k.fill(rect(0,2.3,4.5,.7),INK.grass);}},-3.05,1.22);
  const rain=bd.add(stormCloud('a-rain',1.4,.72),'L',2.4,2.3,{out:.03}),sun=bd.add(S.sun(K+'a-sun',.34),'R',3.7,1.5,{out:.012});
  const sign=B.stand(S.sign(K+'a-sign',1.1,1.1,'GERMANY'),-4.2,-1.2,{layer:1});const c13=sign.flap(S.flipCard(K+'a-2013',.85,.34,'2013',INK.blue),0,1.1*.56,{z:.03});
  const ada=B.person(K+'a-ada',-3.3,.7,1.2,{shirt:'casual',...ADA,face:'smile',layer:2,holdR:'suitcase'});const and=B.person(K+'a-and',-2.5,1.1,1.25,{shirt:'bib',...ANDRINE,face:'smile',layer:3,holdL:'suitcase'});
  const sb=B.stand(S.scoreboard(K+'a-sb',1.8,1.4,'EURO 2013 FINAL'),-1.6,-1.55,{layer:1,s:0});sb.add(lineCard('a-res',1.44,.64,['NORWAY 0','GERMANY 1'],INK.white,INK.navy),0,.38,{z:.012});const fin=sb.flap(lineCard('a-nvg',1.44,.64,['FINAL'],INK.red,INK.white),0,1.02,{z:.03});
  const ada1=B.person(K+'a-ada1',-1.5,.3,1.2,{shirt:'coach',...ADA,face:'sad',layer:2});
  const silver=B.stand(lineCard('a-silver',.9,.4,['SILVER'],INK.grey,INK.navy),-.8,1.1,{layer:3,s:0});
  const seconds=[['2ND','LEAGUE'],['2ND','CUP']].map((l,i)=>B.stand(lineCard(`a-2nd${i}`,.7,.5,l,INK.white,INK.blue),-4.4+i*.85,1.9,{layer:3,s:0}));
  const frame=B.stand(doorFrame('a-door',1.3,1.6,'LYON'),.95,-1.25,{layer:1,s:0});const leaf=frame.flap(doorLeaf('a-leaf',1.3*.72,1.6*.88),-1.3*.36,0,{anchor:'bl',axis:'y',z:.02});
  const ada2=B.person(K+'a-ada2',1.6,.8,1.25,{shirt:'ger',...ADA,face:'smile',legs:'kick',layer:3});
  const gk=keeperGoal(B,'a-keep',3.0,-1.5,'#e8b48f');
  const tally=B.stand(lineCard('a-tally',1.3,.5,['26 GOALS','22 GAMES'],INK.yellow,INK.navy),4.2,.6,{layer:2,s:0});
  const balls=[0,1,2].map(i=>B.stand(S.ball(K+`a-b${i}`,.1),2.0,.9,{layer:3,tab:false,s:0}));
  const mates=[[2.6,1.6,'#e8b48f'],[4.5,1.5,'#b27650']].map(([x,z,sk],i)=>B.person(K+`a-m${i}`,x as number,z as number,1.2,{shirt:'ger',hair:i?'curly':'bun',skin:sk as string,face:'grin',layer:3}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19):b.t;
   c13.flip=-2.9+2.9*beat(t,2,2.8);ada.body.s=beat(t,2.6,3.4);and.body.s=beat(t,3,3.8);const w=beat(t,4,6.4);ada.body.x=-3.3+.3*w;and.body.x=-2.5+.3*w;
   sb.s=beat(t,7.8,8.6);ada1.body.s=beat(t,8.4,9.2);fin.flip=-3.2*beat(t,12.8,13.4);silver.s=beat(t,13.6,14.4);ada1.body.yaw=-.2*beat(t,13.4,14.4);
   const r=beat(t,15.2,16.4)*(1-beat(t,19.4,21))*(manual?1-beat(act,.1,.5):1);show(rain,r);rain.dx=.2*wave(t,16,19.4,.3);
   seconds.forEach((s2,i)=>{s2.s=beat(t,15.6+i*1.2,16.3+i*1.2);});
   frame.s=beat(t,17,18);const open=Math.max(beat(t,19.4,20.6),manual?beat(act,0,.6):0);leaf.flip=1.55*open;
   ada2.body.s=Math.max(beat(t,21.4,22.2),manual?beat(act,.4,.7):0);sun.dy=.6*Math.max(beat(t,20,23),manual?beat(act,.4,1):0);
   gk.body.s=beat(t,23,23.8);mates.forEach((m,i)=>{m.body.s=beat(t,23.6+i*.4,24.4+i*.4);cheer(m,beat(t,30.2+i*.3,30.8+i*.3));});
   const u=clamp01((t-25.8)/1.4)+clamp01((t-27.4)/1.4)+clamp01((t-29)/1.4);balls.forEach((bl,i)=>{const [x,z,dy]=kicks3(clamp01(u-i),2.0,.9,3.0,-1.35);bl.x=x;bl.z=z;bl.dy=dy;bl.s=t>25.4+i*1.6?1:0;bl.visible=bl.s>0;bl.rot=-t*3;});
   ada2.leg!.rot=-1*Math.max(pulse(t,25.5,26.1),pulse(t,27.1,27.7),pulse(t,28.7,29.3));gk.body.rot=.7*Math.max(pulse(t,26,27.2),pulse(t,29.2,30.4));
   tally.s=beat(t,27,27.8);cheer(ada2,beat(t,30.4,31));
   return b.narrated?-.45*beat(t,1.6,2.4)+.45*beat(t,18.6,19.4)+.45*beat(t,20.8,21.6)-.45*beat(t,31,32):0;
  };
 }};

/* ───────────── 3 · Speaking up (protest) ───────────── */
const protest:SpreadDef={id:'protest',rest:18.8,
 left:k=>{pitch(k,-5,0,'#7fa77a','#5c7f63');caption(k,-2.5,'NORWAY · 2017','SHE STOPPED PLAYING, AS A PROTEST',INK.navy,INK.red);},
 right:k=>{meadow(k,0,5,'#c9cf9a');bar(k,.2,Z(.9),4.8,Z(-.6),.55,'#cdbf9f');footprints(k,.5,Z(.85),4.5,Z(-.5),12,INK.brown);caption(k,2.5,'A LONG WAY TO GO','SPEAKING UP FOR WHAT IS FAIR',INK.navy,INK.blue);},
 build:B=>{
  const bd=B.vfold({key:K+'p-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.2,2.4,NOR,2);lightRig(k,1.0,.4);lightRig(k,3.5,.35);k.fill(rect(0,2.4,4.5,.6),'#7fa77a');}},
   {key:K+'p-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#e9d6e6',INK.pink,y=>.4-y/3*.3);peaks(k,4.5,1.5,'#9aa3bd',3);fjord(k,4.5,2.0,.35);k.fill(rect(0,2.35,4.5,.65),'#c9cf9a');}},-3.05,1.22);
  const cloud=bd.add(stormCloud('p-cloud',1.4,.72),'R',2.6,2.3,{out:.03}),sun=bd.add(S.sun(K+'p-sun',.34),'R',3.9,1.4,{out:.012});
  const flag=B.stand(flagPlate('p-flag',.9,.9),-4.6,-1.3,{layer:1});
  const base=B.stand(scaleBase('p-scale',.8,1.8),-2.7,-1.5,{layer:1,s:0});const beam=base.arm(scaleBeam('p-beam',2.2,1.0,'MEN','WOMEN'),0,1.75,{z:.02});
  const fairQ=B.stand(S.flipCard(K+'p-fairq',1.0,.32,'FAIR?',INK.yellow,INK.navy),-2.8,-.5,{layer:2,s:0});
  const team=[[-4.1,.5,'#f1b88f','bun'],[-3.3,.9,'#e8b48f','long']].map(([x,z,sk,hr],i)=>B.person(K+`p-t${i}`,x as number,z as number,1.25,{shirt:'coach',hair:hr as 'long',skin:sk as string,face:'smile',layer:2}));
  const ada=B.person(K+'p-ada',-2.2,.9,1.3,{shirt:'coach',...ADA,face:'open',layer:3});
  const shirt=B.stand(shirtHang('p-shirt',.7,.8),-1.2,.1,{layer:2,s:0});const prot=B.stand(S.flipCard(K+'p-prot',1.1,.32,'PROTEST · 2017',INK.blue),-1.2,1.0,{layer:3,s:0});
  const ada2=B.person(K+'p-ada2',1.5,.5,1.3,{shirt:'casual',...ADA,face:'smile',layer:2});
  const sign=B.stand(placard('p-plac',1.1,1.3,['FAIR FOR','EVERYONE'],INK.yellow),2.35,-.5,{layer:2,s:0});const signF=sign.flap(placard('p-placf',1.1,.806,['SPEAK','UP'],INK.white),0,1.3,{z:.02});
  const road=B.stand(S.sign(K+'p-road',1.3,1.2,'LONG WAY TO GO',INK.white),4.3,-1.15,{layer:1,s:0});
  const wc=B.stand(lineCard('p-wc',1.3,.55,['WORLD CUP','2019'],INK.white,INK.navy),3.6,.5,{layer:2,s:0});const missed=wc.flap(lineCard('p-miss',1.3,.55,['MISSED'],INK.grey,INK.navy),0,.55,{z:.02});
  const hearts=[0,1,2].map(i=>B.stand(heart(`p-heart${i}`,.26),1.2+i*.5,1.95,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.8):b.t;
   flag.s=beat(t,.4,1.2);flag.rot=.04*wave(t,1,40,.6);
   team.forEach((m,i)=>{m.body.s=beat(t,1.8+i*.3,2.6+i*.3);});ada.body.s=beat(t,2.4,3.2);
   base.s=beat(t,3.6,4.4);const tilt=.34*beat(t,4.4,5.6)-.12*beat(t,15,16.4)-.08*beat(t,31.4,33);beam.rot=tilt+.02*Math.sin(t*1.5);fairQ.s=beat(t,5.4,6.2);
   // Stepping away from the national team.
   const away=beat(t,9,11.2);ada.body.x=-2.2+1.4*away;ada.body.yaw=-.3*pulse(t,9,11.2);shirt.s=beat(t,10.8,11.6);prot.s=beat(t,11.6,12.4);team.forEach(m=>{m.armR.rot=.12+.5*pulse(t,10,12.6);});
   ada.body.s=beat(t,2.4,3.2)*(1-beat(t,14.4,15.2));ada2.body.s=beat(t,14.6,15.4);road.s=beat(t,16.4,17.2);
   sign.s=beat(t,17.6,18.4);const flip=Math.max(beat(t,19.2,20.4),manual?beat(act,0,.6):0);signF.flip=-2.9*flip;ada2.armR.rot=.12+2.1*Math.max(beat(t,20,20.6),manual?beat(act,.5,.9):0)*(1-beat(t,25.4,26));
   wc.s=beat(t,21.4,22.2);missed.flip=-2.9+2.9*beat(t,23.4,24.2);
   show(cloud,beat(t,25.8,27)*(1-beat(t,31.4,33.4))*(manual?0:1));cloud.dx=.2*wave(t,26,31,.25);ada2.body.yaw=-.15*pulse(t,26,31);
   sun.dy=.6*Math.max(beat(t,31.6,34),manual?beat(act,.4,1):0);hearts.forEach((h,i)=>{h.s=beat(t,32.4+i*.5,33+i*.5);});
   return b.narrated?-.45*beat(t,1.4,2.4)+.45*beat(t,13.8,14.6)+.45*beat(t,14.6,15.4)-.45*beat(t,31.6,32.6):0;
  };
 }};

/* ───────────── 4 · A message for girls (ballon) ───────────── */
const ballon:SpreadDef={id:'ballon',rest:11.0,
 left:k=>{floor(k,-5,0,'#c98f5f','#9c6a44');caption(k,-2.5,'2018','THE FIRST WOMEN’S BALLON D’OR',INK.white,INK.yellow);},
 right:k=>{pitch(k,0,5);penaltyBox(k,0,5);caption(k,2.5,'2019 FINAL','3 GOALS IN 16 MINUTES',INK.navy,INK.red);},
 build:B=>{
  const bd=B.vfold({key:K+'b-bdL',w:4.5,h:3,paint:k=>{const b=rect(0,0,4.5,3);k.fill(b,'#2b2350');k.dots(b,INK.blue,.06,.3);for(let i=0;i<9;i++){const x=i*.5,c=rect(x,0,.5,2.5);k.fill(c,i%2?'#b8323c':'#c9404a');k.hatch(c,'#7a1f28',.06,1.5,.01);}
    k.fill(rect(0,0,4.5,.35),'#9c2a33');for(let i=0;i<9;i++)k.fill(ell(.25+i*.5,.35,.25,.12),'#9c2a33');k.fill(rect(0,2.5,4.5,.5),'#c98f5f');}},
   {key:K+'b-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.night,INK.blue,y=>.4-y*.05);crowd(k,4.5,1.1,2.5,[INK.white,INK.red,INK.white,INK.blue,INK.yellow],3);lightRig(k,1.0,.3);lightRig(k,3.6,.25);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},-3.05,1.22);
  const beams=[bd.add(S.beam(K+'b-beam1',1.2,2.2),'L',3.2,.2,{out:.03}),bd.add(S.beam(K+'b-beam2',1.2,2.2),'L',1.2,.2,{out:.03})];
  const fw=[bd.add(S.firework(K+'b-fw1',.36,INK.yellow),'R',1.3,1.0,{out:.03}),bd.add(S.firework(K+'b-fw2',.32,INK.pink),'R',3.3,.9,{out:.03})];
  const podium=B.stand(stage('b-stage',1.8,1.0),-3.9,-1.5,{layer:1,s:0});
  const ada=B.person(K+'b-ada',-2.6,-.4,1.35,{shirt:'casual',...ADA,face:'smile',layer:2});
  const first=B.stand(lineCard('b-first',1.3,.5,['FIRST','EVER!'],INK.gold,INK.navy),-1.0,-.9,{layer:1,s:0});
  const ped=B.stand(S.post(K+'b-ped',.34,.9,INK.gold),-1.75,-.25,{layer:2,s:0});const gball=ped.add(S.goldenBall(K+'b-gb',.24),0,.9,{z:.02});
  const girls=[[-4.0,1.4,'#f1b88f','bun'],[-3.0,1.7,'#7f5138','curly'],[-1.9,1.5,'#d99a6c','long'],[-.9,1.2,'#e8b48f','short']].map(([x,z,sk,hr],i)=>B.person(K+`b-g${i}`,x as number,z as number,.9,{shirt:(['bib','fan','casual','bib'] as const)[i],hair:hr as 'bun',skin:sk as string,face:'grin',layer:3}));
  const msg=B.stand(S.banner(K+'b-msg',2.8,.42,'BELIEVE IN YOURSELVES',INK.pink),-2.5,2.05,{layer:3,s:0});
  const stars=([[-3.6,-.9],[-2.05,-1.0],[-.25,-.55]] as const).map(([x,z],i)=>B.stand(star(`b-star${i}`,.3),x,z,{layer:1,s:0,tab:false}));
  const role=B.stand(S.flipCard(K+'b-role',1.2,.3,'ROLE MODELS',INK.yellow,INK.navy),-4.4,1.95,{layer:2,s:0});
  const gk=keeperGoal(B,'b-keep',2.5,-1.75,'#e8b48f');
  const ada2=B.person(K+'b-ada2',2.3,.9,1.25,{shirt:'ger',...ADA,face:'smile',legs:'kick',layer:3});
  const card=B.stand(lineCard('b-3in16',1.4,.5,['3 GOALS','16 MINUTES'],INK.yellow,INK.navy),4.2,.4,{layer:2,s:0});const cup=B.stand(S.trophy(K+'b-cup',.45,.75),4.4,-1.1,{layer:1,s:0});
  const balls=[0,1,2].map(i=>B.stand(S.ball(K+`b-b${i}`,.1),2.5,1.0,{layer:3,tab:false,s:0}));
  const conf=bd.add(S.confetti(K+'b-conf',2.2,1.1,4),'R',1.1,1.3,{out:.04});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,11):b.t;
   beams.forEach((bm,i)=>{show(bm,beat(t,1.6+i*.4,2.4+i*.4));});podium.s=beat(t,2,2.8);ada.body.s=beat(t,2.6,3.4);first.s=beat(t,5.4,6.2);
   // Raise the golden ball.
   ped.s=beat(t,8.4,9.2);const raise=Math.max(beat(t,11.4,12.6),manual?beat(act,0,.7):0);gball.visible=raise>.02;gball.scale=.3+.7*raise;gball.dy=.6*raise;cheer(ada,raise);
   girls.forEach((g,i)=>{g.body.s=Math.max(beat(t,13.4+i*.3,14.2+i*.3),manual?beat(act,.5+i*.1,.7+i*.1):0);});msg.s=Math.max(beat(t,15,15.8),manual?beat(act,.8,1):0);
   stars.forEach((s2,i)=>{s2.s=beat(t,19.2+i*.5,19.8+i*.5);s2.rot=.1*Math.sin(t*1.4+i);});role.s=beat(t,20.6,21.4);girls.forEach((g,i)=>{g.armR.rot=.12+2.2*beat(t,21.6+i*.3,22.2+i*.3);g.body.yaw=0;});
   gk.body.s=beat(t,24.6,25.4);ada2.body.s=beat(t,24.8,25.6);
   const u=clamp01((t-26)/1.3)+clamp01((t-27.6)/1.3)+clamp01((t-29.2)/1.3);balls.forEach((bl,i)=>{const [x,z,dy]=kicks3(clamp01(u-i),2.5,1.0,2.5,-1.6);bl.x=x;bl.z=z;bl.dy=dy;bl.s=t>25.6+i*1.6?1:0;bl.visible=bl.s>0;bl.rot=-t*3;});
   ada2.leg!.rot=-1*Math.max(pulse(t,25.7,26.3),pulse(t,27.3,27.9),pulse(t,28.9,29.5));gk.body.rot=.7*Math.max(pulse(t,26.2,27.4),pulse(t,29.4,30.6));
   card.s=beat(t,28,28.8);cup.s=beat(t,30,30.8);cheer(ada2,beat(t,30.4,31));
   fw.forEach((f,i)=>{show(f,beat(t,30.6+i*.5,31.6+i*.5));f.rot=t*.2;});conf.visible=t>30.6;conf.dy=-1.1+1.3*beat(t,30.8,33.4);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,24,25)+.45*beat(t,25,26)-.45*beat(t,31.4,32.4):0;
  };
 }};

/* ───────────── 5 · Twenty-one months (knee) ───────────── */
const knee:SpreadDef={id:'knee',rest:13.9,
 left:k=>{floor(k,-5,0,'#e3eef2','#b9ccd6');caption(k,-2.5,'JANUARY 2020','A TORN KNEE LIGAMENT: THE ACL',INK.navy,INK.blue);},
 right:k=>{pitch(k,0,5);penaltyBox(k,0,5);footprints(k,.4,Z(1.6),4.6,Z(1.2),14,INK.white);caption(k,2.5,'OCTOBER 2021','BACK AFTER 21 MONTHS',INK.navy,INK.red);},
 build:B=>{
  const bd=B.vfold({key:K+'k-bdL',w:4.5,h:3,paint:k=>{const b=rect(0,0,4.5,3);k.fill(b,'#dbe8ee');k.dots(b,INK.sky,.05,.25);const w=rect(2.6,.5,1.4,1.1);k.fill(w,INK.sky2);k.key(w,.014);k.fill(rect(2.6,1.2,1.4,.4),'#9aa3bd');k.key('M3.3 .5 L3.3 1.6 M2.6 1.05 L4.0 1.05',.02,INK.white);k.fill(rect(0,2.4,4.5,.6),'#e3eef2');k.key('M0 2.4 L4.5 2.4',.014);}},
   {key:K+'k-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.1,2.5,[INK.white,INK.red,INK.white,INK.blue,INK.white],4);lightRig(k,1.1,.25);lightRig(k,3.5,.3);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},-3.05,1.22);
  const snow=bd.add(S.stars(K+'k-snow',1.2,.8,7),'L',3.3,1.55,{out:.02});
  const clk=bd.add(clock('k-clock',.6),'L',1.2,1.6,{out:.02});
  const ada=B.person(K+'k-ada',-3.4,.4,1.3,{shirt:'ger',...ADA,face:'shy',layer:2});
  const cr=B.stand(crutch('k-crutch',.3,1.1),-2.85,.45,{layer:2,s:0});
  const scan=B.stand(kneeScan('k-scan',1.1,1.3),-1.8,-1.4,{layer:1,s:0});
  const bench=B.stand(S.bench(K+'k-bench',1.1,.46),-4.1,-1.3,{layer:1,s:0});
  const long=B.stand(S.flipCard(K+'k-long',1.3,.32,'A VERY LONG TIME',INK.blue),-3.3,1.5,{layer:3,s:0});
  const cal=B.stand(S.scoreboard(K+'k-cal',1.5,1.3,'OUT FOR'),-.9,.2,{layer:2,s:0});cal.add(lineCard('k-21',1.2,.6,['21 MONTHS'],INK.yellow,INK.navy),0,.34,{z:.012});
  const pages=['2021','2020','JANUARY'].map((l,i)=>cal.flap(lineCard(`k-p${i}`,1.2,.6,[l],[INK.pink,INK.blue,'#3d5da0'][i],INK.white),0,.94,{z:.024+i*.006}));
  const ada2=B.person(K+'k-ada2',1.6,.7,1.3,{shirt:'ger',...ADA,face:'grin',legs:'kick',layer:3});
  const oct=B.stand(S.flipCard(K+'k-oct',1.2,.32,'OCTOBER 2021',INK.pink),.9,-1.3,{layer:1,s:0});
  const gk=keeperGoal(B,'k-keep',2.8,-1.55,'#e8b48f');
  const two=B.stand(lineCard('k-two',1.2,.5,['TWO GOALS','NOV 2021'],INK.yellow,INK.navy),4.3,-.5,{layer:2,s:0});const cup=B.stand(S.trophy(K+'k-cup',.45,.75),4.4,.7,{layer:2,s:0});
  const cupC=B.stand(S.flipCard(K+'k-cupc',1.3,.3,'FINAL · 2022',INK.gold,INK.navy),4.1,1.5,{layer:3,s:0});
  const balls=[0,1].map(i=>B.stand(S.ball(K+`k-b${i}`,.1),1.9,.8,{layer:3,tab:false,s:0}));
  const mates=[[.7,1.5,'#e8b48f'],[3.3,1.6,'#b27650']].map(([x,z,sk],i)=>B.person(K+`k-m${i}`,x as number,z as number,1.2,{shirt:'ger',hair:i?'curly':'bun',skin:sk as string,face:'grin',layer:3}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,13.9):b.t;
   ada.body.s=beat(t,1.9,2.7);bench.s=beat(t,2.4,3.2);cr.s=beat(t,4.4,5.2);ada.armR.rot=.12+.4*beat(t,4.6,5.2);
   scan.s=beat(t,6.4,7.2);snow.dx=.1*wave(t,0,36,.2);clk.rot=.1*Math.sin(t*.8);long.s=beat(t,11.4,12.2)*(1-beat(t,16,16.6));
   cal.s=beat(t,12.4,13.2);const n=manual?act*3:0;const flips=[2,1,0].map((j,i)=>Math.max(clamp01(n-i),beat(t,14.3+i*.7,14.9+i*.7)));flips.forEach((f,i)=>{const pg=pages[[2,1,0][i]];pg.flip=-3.1*f;pg.visible=f<.97;});
   ada2.body.s=Math.max(beat(t,16.4,17.2),manual?beat(act,.7,1):0);oct.s=Math.max(beat(t,17.6,18.4),manual?beat(act,.85,1):0);cheer(ada2,Math.max(beat(t,19,19.6)*(1-beat(t,21.4,22)),manual?beat(act,.9,1):0));
   gk.body.s=beat(t,20.6,21.4);mates.forEach((m,i)=>{m.body.s=beat(t,21+i*.4,21.8+i*.4);cheer(m,beat(t,25.4+i*.3,26+i*.3)*(1-beat(t,27.4,28))+beat(t,30+i*.3,30.6+i*.3));});
   const u=clamp01((t-22.6)/1.3)+clamp01((t-24.2)/1.3);balls.forEach((bl,i)=>{const [x,z,dy]=kicks3(clamp01(u-i),1.9,.8,2.8,-1.4);bl.x=x;bl.z=z;bl.dy=dy;bl.s=t>22.2+i*1.6?1:0;bl.visible=bl.s>0;bl.rot=-t*3;});
   ada2.leg!.rot=-1*Math.max(pulse(t,22.3,22.9),pulse(t,23.9,24.5));gk.body.rot=.7*Math.max(pulse(t,22.8,24),-pulse(t,24.4,25.6));
   two.s=beat(t,25,25.8);cup.s=beat(t,27.6,28.4);cupC.s=beat(t,28.4,29.2);cheer(ada2,beat(t,29,29.6));
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,15.8,16.6)+.45*beat(t,16.6,17.4)-.45*beat(t,31.4,32.4):(manual?.3*beat(act,.6,.9):0);
  };
 }};

/* ───────────── 6 · Back for Norway (return) ───────────── */
const back:SpreadDef={id:'return',rest:18.5,
 left:k=>{floor(k,-5,0,'#e9d9b4','#b9a57c');caption(k,-2.5,'TALKING IT THROUGH','THE FUTURE OF WOMEN’S FOOTBALL',INK.navy,INK.blue);},
 right:k=>{pitch(k,0,5);penaltyBox(k,0,5);caption(k,2.5,'NORWAY 5–1 KOSOVO','7 APRIL 2022 · A HAT-TRICK',INK.navy,INK.red);},
 build:B=>{
  const bd=B.vfold({key:K+'r-bdL',w:4.5,h:3,paint:k=>{const b=rect(0,0,4.5,3);k.fill(b,'#f2e6cc');k.dots(b,INK.orange,.05,.15);const w=rect(.6,.4,3.3,1.5);k.fill(w,INK.sky2);k.key(w,.016);
    k.fill(`M.6 1.4 L1.3 .9 L1.9 1.3 L2.6 .75 L3.3 1.25 L3.9 1.0 L3.9 1.9 L.6 1.9 Z`,'#9aa3bd');k.fill(rect(.6,1.6,3.3,.3),INK.blue);k.key('M2.25 .4 L2.25 1.9',.03,INK.white);k.fill(rect(0,2.4,4.5,.6),'#e9d9b4');}},
   {key:K+'r-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.7-y/3*.7);crowd(k,4.5,1.0,2.5,NOR,1);lightRig(k,1.0,.2);lightRig(k,3.6,.25);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},-3.05,1.22);
  const fw=[bd.add(S.firework(K+'r-fw1',.36,INK.red),'R',1.2,1.0,{out:.03}),bd.add(S.firework(K+'r-fw2',.32,INK.white),'R',3.4,.9,{out:.03})];
  const conf=bd.add(S.confetti(K+'r-conf',2.4,1.2,5),'R',1.0,1.3,{out:.04});const bow=bd.add(S.rainbow(K+'r-bow',3.0,1.2),'R',.6,2.4,{out:.02});
  const tbl=B.stand(table('r-table',1.6,.6),-2.5,-.1,{layer:2,s:0});
  const lise=B.person(K+'r-lise',-3.2,-.4,1.6,{shirt:'navy',hair:'long',hairColor:'#6b4a2f',adult:true,skin:'#f1c0a0',face:'smile',layer:2});
  const name=B.stand(lineCard('r-name',1.5,.5,['LISE KLAVENESS','NEW PRESIDENT'],INK.white,INK.navy),-3.9,.7,{layer:3,s:0});
  const ada=B.person(K+'r-ada',-1.4,-.35,1.35,{shirt:'casual',...ADA,face:'smile',layer:2});
  const bubbles=[B.stand(S.bubble(K+'r-bb1',.6,.45,'ball'),-3.1,-1.6,{layer:1,s:0,tab:false}),B.stand(S.bubble(K+'r-bb2',.6,.45,'heart'),-1.8,-1.7,{layer:1,s:0,tab:false}),B.stand(S.bubble(K+'r-bb3',.6,.45,'star'),-2.45,-1.95,{layer:1,s:0,tab:false})];
  const base=B.stand(scaleBase('r-scale',.5,1.2),-4.35,-1.25,{layer:1,s:0});const beam=base.arm(scaleBeam('r-beam',1.3,.62,'MEN','WOMEN'),0,1.17,{z:.02});
  const march=B.stand(S.flipCard(K+'r-march',1.2,.32,'MARCH 2022',INK.pink),-1.0,1.3,{layer:3,s:0});
  const yrs=B.stand(S.flipCard(K+'r-back',1.3,.32,'COMING BACK',INK.grass),-2.4,1.9,{layer:3,s:0});const yrsTop=yrs.flap(S.flipCard(K+'r-5y',1.3,.32,'5 YEARS AWAY',INK.grey,INK.navy),0,.32,{z:.02});
  const gate=B.stand(gatePost('r-gate',1.45,1.55,'NORWAY'),1.0,-1.0,{layer:1,s:0});
  const gl=gate.flap(gateLeaf('r-gL',.56,1.1,INK.gold),-1.45/2+.16,0,{anchor:'bl',axis:'y',z:.012}),gr=gate.flap(gateLeaf('r-gR',.56,1.1,INK.gold),1.45/2-.16,0,{anchor:'br',axis:'y',z:.012});
  const ada2=B.person(K+'r-ada2',1.0,-.4,1.3,{shirt:'coach',...ADA,face:'grin',legs:'kick',layer:2});
  const gk=keeperGoal(B,'r-keep',3.1,-1.45,'#e8b48f');
  const sb=B.stand(lineCard('r-sb',1.4,.5,['NORWAY 5','KOSOVO 1'],INK.navy,INK.white),4.3,.4,{layer:2,s:0});const hat=B.stand(S.flipCard(K+'r-hat',1.1,.32,'HAT-TRICK!',INK.yellow,INK.navy),4.2,1.2,{layer:3,s:0});
  const mates=[[.8,1.5,'#f1b88f','bun'],[2.6,1.6,'#e8b48f','long']].map(([x,z,sk,hr],i)=>B.person(K+`r-m${i}`,x as number,z as number,1.2,{shirt:'coach',hair:hr as 'long',skin:sk as string,face:'grin',layer:3}));
  const flags=[0,1].map(i=>B.stand(flagPlate(`r-flag${i}`,.7,.75),.3+i*4.4,.3-i*.2,{layer:2,s:0}));
  const balls=[0,1,2].map(i=>B.stand(S.ball(K+`r-b${i}`,.1),2.0,.7,{layer:3,tab:false,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.5):b.t;
   lise.body.s=beat(t,2,2.8);name.s=beat(t,3.2,4)*(1-beat(t,11,11.6));tbl.s=beat(t,6.9,7.6);ada.body.s=beat(t,7.2,8);
   bubbles.forEach((bb,i)=>{bb.s=pulse(t,7.8+i*1.1,9.4+i*1.1)+beat(t,10.8,11.2)*(1-beat(t,17,17.6))*(i===2?1:0);});lise.armR.rot=.12+.9*pulse(t,7.8,9.6);ada.armL.rot=-.12-.9*pulse(t,8.9,10.6);
   base.s=beat(t,4.6,5.4);beam.rot=.3*(1-beat(t,9,12))+.02*Math.sin(t*1.5);
   march.s=beat(t,11.8,12.6);yrs.s=beat(t,13,13.8);yrsTop.flip=-2.9*beat(t,15.6,16.4);ada.body.x=-1.4+.9*beat(t,16.6,18.2);
   gate.s=beat(t,17.4,18.2);const open=Math.max(beat(t,18.8,20),manual?beat(act,0,.6):0);gl.flip=-1.25*open;gr.flip=1.25*open;
   ada.body.s=beat(t,7.2,8)*(1-beat(t,19.6,20.2));const run=Math.max(beat(t,20,21.6),manual?beat(act,.5,.9):0);ada2.body.s=Math.max(beat(t,19.8,20.4),manual?beat(act,.4,.6):0);ada2.body.x=1.0+1.0*run;ada2.body.z=-.4+1.2*run;
   gk.body.s=beat(t,20.4,21.2);
   const u=clamp01((t-22.4)/1.4)+clamp01((t-24.2)/1.4)+clamp01((t-26)/1.4);balls.forEach((bl,i)=>{const [x,z,dy]=kicks3(clamp01(u-i),2.2,.9,3.1,-1.3);bl.x=x;bl.z=z;bl.dy=dy;bl.s=t>22+i*1.8?1:0;bl.visible=bl.s>0;bl.rot=-t*3;});
   ada2.leg!.rot=-1*Math.max(pulse(t,22.1,22.7),pulse(t,23.9,24.5),pulse(t,25.7,26.3));gk.body.rot=.7*Math.max(pulse(t,22.6,23.8),-pulse(t,24.4,25.6),pulse(t,26.2,27.4));
   sb.s=beat(t,26.6,27.4);hat.s=beat(t,27.6,28.4);cheer(ada2,beat(t,27.8,28.4));
   mates.forEach((m,i)=>{m.body.s=beat(t,28.6+i*.3,29.4+i*.3);cheer(m,beat(t,29.6+i*.3,30.2+i*.3),.2*wave(t,30.2,39,1.2+i*.1));});flags.forEach((f,i)=>{f.s=beat(t,29+i*.5,29.8+i*.5);f.rot=.04*wave(t,29.8,39,.6);});
   fw.forEach((f,i)=>{show(f,beat(t,29.4+i*.5,30.4+i*.5));f.rot=t*.2;});conf.visible=t>29.2;conf.dy=-1.1+1.3*beat(t,29.4,32);show(bow,beat(t,33.6,34.8));
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,17,18)+.45*beat(t,18,19)-.45*beat(t,33,34):(manual?.3*beat(act,0,.3):0);
  };
 }};

export const SPREADS:Record<string,SpreadDef>={sisters,abroad,protest,ballon,knee,return:back};
void pulse;void wave;void clamp01;void blob;void ell;void track;void TAU;
