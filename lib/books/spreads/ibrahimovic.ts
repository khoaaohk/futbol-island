/**
 * The six Ibrahimović pop-up spreads (different is strong): original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/ibrahimovic/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently and symbolically: an empty fridge, a rain cloud, a path home to Mum, a closed gate,
 * a calendar of months. Kits are plain colours with no crests.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Part,type Person,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='ibrahimovic-';
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const show=(q:Part,v:number)=>{q.scale=v;q.visible=v>.02;};
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};
const ZKID={skin:'#e8b48f',hair:'short' as const,hairColor:'#3b2a22'};
const ZMAN={skin:'#e8b48f',hair:'bun' as const,hairColor:'#3b2a22',beard:true};
const SK=['#f1b88f','#d99a6c','#b27650','#7f5138','#e8b48f'];

/* ───────────── page print helpers (solid ink: key lines don't read on prints) ───────────── */
function bar(k:Kit,x0:number,y0:number,x1:number,y1:number,w:number,c:string){const L=Math.hypot(x1-x0,y1-y0)||1,nx=-(y1-y0)/L*w/2,ny=(x1-x0)/L*w/2;k.fill(poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]),c);}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,.85);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function boxLines(k:Kit,x0:number,x1:number,y:number,d:number){bar(k,x0,Z(y),x1,Z(y),.05,INK.white);bar(k,x0,Z(y),x0,Z(y+d),.05,INK.white);bar(k,x0,Z(y+d),x1,Z(y+d),.05,INK.white);bar(k,x1,Z(y+d),x1,Z(y),.05,INK.white);}
function asphalt(k:Kit,x0:number,x1:number,tone='#8e8f98',dot='#5d5f6c'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,dot,.05,(x,y)=>.2+.12*Math.sin(x*2.1+y*1.3));}
function lawn(k:Kit,x:number,y:number,w:number,h:number){const p=rect(x,y,w,h);k.fill(p,INK.grass);k.dots(p,INK.leaf,.05,.3);}
function floorboards(k:Kit,x0:number,x1:number,tone='#e3c79a',line='#b99664'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);for(let y=.4;y<PAGE_D;y+=.4)bar(k,x0,y,x1,y,.025,line);for(let i=0;i<30;i++){const x=x0+((i*37)%50)/50*(x1-x0),y=Math.floor(((i*53)%64)/4)*.4;bar(k,x,y,x,y+.4,.025,line);}}
function water(k:Kit,x0:number,x1:number,y0:number,y1:number){const r=rect(x0,y0,x1-x0,y1-y0);k.fill(r,INK.blue);k.dots(r,INK.navy,.05,.35);for(let i=0;i<9;i++){const x=x0+.2+((i*37)%29)/29*(x1-x0-.7),y=y0+.2+((i*53)%31)/31*(y1-y0-.4);bar(k,x,y,x+.35,y,.04,INK.white);}}
function stepsPath(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.09:-.09);k.fill(ell(x,y,.06,.1),c,.75);}}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function nightSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function slabs(k:Kit,w:number,base:number,seed=1,lit=.3){const cs=['#d8cdb4','#c9bfa5','#e2d7bd'];for(let i=0;i<Math.ceil(w/.9);i++){const x=i*.9+.05,h=1.2+((i+seed)%3)*.28,b=rect(x,base-h,.8,h);k.fill(b,cs[(i+seed)%3]);k.dots(b,INK.grey,.04,.25);k.key(b,.012);
 for(let r=0;r<Math.floor((h-.1)/.2);r++)for(let c=0;c<4;c++){const n=(r*7+c*5+i*3+seed)%10;k.fill(rect(x+.06+c*.18,base-h+.1+r*.2,.12,.1),n<lit*10?INK.yellow:'#6f7fa3');}
 k.fill(rect(x,base-h,.8,.06),INK.grey);}}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function sea(k:Kit,w:number,y:number,h:number){const s=rect(0,y,w,h);k.fill(s,INK.blue);k.dots(s,INK.navy,.045,.3);for(let i=0;i<7;i++)k.key(`M${.3+i*.62} ${y+.12+(i%2)*.14} l.22 0`,.012,INK.white);}

/* ───────────── book-specific plates ───────────── */
const stormCloud=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#8d93a8');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26/Math.max(1,n*.62),ink,{max:w*.86,weight:900}));},{rim:.018});
function heartPath(cx:number,cy:number,s:number){return `M${cx} ${cy+s*.45} C${cx-s*.9} ${cy-s*.1} ${cx-s*.4} ${cy-s*.8} ${cx} ${cy-s*.25} C${cx+s*.4} ${cy-s*.8} ${cx+s*.9} ${cy-s*.1} ${cx} ${cy+s*.45} Z`;}
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
const doorLeaf=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,c);k.dots(d,INK.navy,.03,.25);k.key(d,.012);k.fill(rect(w*.15,h*.1,w*.7,h*.3),INK.sky2);k.key(rect(w*.15,h*.1,w*.7,h*.3),.01);k.circle(w*.82,h*.6,.02,INK.gold);},{rim:.012});
const suitcase=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const b=rect(0,h*.2,w,h*.8);k.fill(b,c);k.dots(b,INK.navy,.03,.2);k.key(b,.013);k.key(`M${w*.3} ${h*.2} L${w*.3} ${h*.04} L${w*.7} ${h*.04} L${w*.7} ${h*.2}`,.02);k.fill(rect(w*.12,h*.2,w*.08,h*.8),INK.brown);k.fill(rect(w*.8,h*.2,w*.08,h*.8),INK.brown);});
const flatBlock=(key:string,w:number,h:number,seed=1)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#e2d7bd');k.dots(b,INK.grey,.04,.25);k.key(b,.014);k.fill(rect(0,0,w,h*.05),INK.grey);
 const cs=[INK.red,INK.blue,INK.grass,INK.orange,INK.pink,INK.teal];const cols=Math.max(2,Math.round(w/.3)),rows=Math.max(3,Math.floor(h/.3));
 for(let r=0;r<rows-1;r++)for(let c=0;c<cols;c++){const x=w*(c+.2)/cols,y=h*.08+r*(h*.8/(rows-1)),n=(r*5+c*3+seed)%7;k.fill(rect(x,y,w*.6/cols,h*.1),n<3?INK.yellow:'#6f7fa3');k.key(rect(x,y,w*.6/cols,h*.1),.008);k.fill(rect(x-.02,y+h*.12,w*.6/cols+.04,h*.03),cs[(r+c+seed)%6]);}
 const d=rect(w*.4,h*.84,w*.2,h*.16);k.fill(d,INK.navy);k.key(d,.012);});
const clubhouse=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.3,w,h*.7);k.fill(b,'#e0a25f');for(let y=h*.34;y<h;y+=.09)k.key(`M0 ${y} L${w} ${y}`,.008,'#a86d38');k.key(b,.014);const roof=poly([[-.06,h*.32],[w/2,h*.04],[w+.06,h*.32]]);k.fill(roof,INK.red);k.hatch(roof,'#9c3a30',.05,.4,.01);k.key(roof,.014);
 const s=rect(w*.14,h*.32,w*.72,h*.13);k.fill(s,INK.white);k.key(s,.01);k.text('FBK BALKAN',w/2,h*.42,h*.09,INK.navy,{max:w*.68,weight:900});
 const d=rect(w*.36,h*.56,w*.28,h*.44);k.fill(d,'#2b1f1a');k.fill(ell(w/2,h*.8,w*.07,w*.07),INK.yellow,.8);k.key(d,.012);for(const x of [.08,.72]){k.fill(rect(w*x,h*.56,w*.2,h*.2),INK.sky2);k.key(rect(w*x,h*.56,w*.2,h*.2),.01);}});
const giftBox=(key:string,s:number)=>sp(key,s,s*.8,k=>{const b=rect(0,s*.2,s,s*.6);k.fill(b,INK.pink);k.dots(b,INK.navy,.03,.2);k.key(b,.012);k.fill(rect(s*.44,s*.2,s*.12,s*.6),INK.yellow);},{rim:.012});
const boxLid=(key:string,s:number)=>sp(key,s*1.08,s*.22,k=>{const b=rect(0,0,s*1.08,s*.22);k.fill(b,INK.pink);k.key(b,.012);k.fill(rect(s*.48,0,s*.12,s*.22),INK.yellow);},{rim:.012});
const boots=(key:string,s:number)=>sp(key,s*1.3,s*.6,k=>{for(const [x,c] of [[0,INK.navy],[s*.62,'#243c7a']] as const){const p=`M${x} ${s*.25} L${x+s*.22} ${s*.25} L${x+s*.3} ${s*.4} Q${x+s*.62} ${s*.42} ${x+s*.64} ${s*.56} L${x} ${s*.56} Z`;k.fill(p,c);k.key(p,.01);for(let i=0;i<3;i++)k.circle(x+s*(.1+i*.18),s*.58,.012,INK.white);k.fill(rect(x+s*.05,s*.3,s*.16,s*.03),INK.white);}},{rim:.012});
const fridge=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.014);const i=rect(w*.08,h*.06,w*.84,h*.9);k.fill(i,'#dfe8ee');k.key(i,.01);for(let y=.3;y<.95;y+=.22)k.fill(rect(w*.1,h*y,w*.8,h*.02),INK.grey);k.fill(ell(w*.3,h*.26,w*.08,h*.03),INK.grey,.6);},{rim:.015});
const fridgeDoor=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#eef3f6');k.dots(b,INK.sky,.035,.2);k.key(b,.014);k.fill(rect(w*.82,h*.3,w*.06,h*.3),INK.grey);k.key(`M0 ${h*.35} L${w} ${h*.35}`,.012);},{rim:.012});
const house=(key:string,w:number,h:number,wall:string,roofC:string,glow=true)=>sp(key,w,h,k=>{const b=rect(0,h*.3,w,h*.7);k.fill(b,wall);k.dots(b,INK.orange,.04,.15);k.key(b,.014);const roof=poly([[-.05,h*.32],[w/2,h*.04],[w+.05,h*.32]]);k.fill(roof,roofC);k.key(roof,.014);
 for(const x of [.12,.62]){const wn=rect(w*x,h*.44,w*.26,h*.2);k.fill(wn,glow?INK.yellow:'#6f7fa3');k.key(wn,.01);}const d=rect(w*.4,h*.7,w*.2,h*.3);k.fill(d,INK.navy);k.key(d,.012);});
const plateFood=(key:string,s:number)=>sp(key,s*1.6,s,k=>{const w=s*1.6;k.fill(ell(w/2,s*.78,w*.48,s*.2),INK.white);k.key(ell(w/2,s*.78,w*.48,s*.2),.01);k.fill(ell(w*.36,s*.6,w*.16,s*.2),INK.orange);k.fill(ell(w*.62,s*.58,w*.18,s*.18),INK.grass);k.fill(ell(w*.5,s*.5,w*.14,s*.18),INK.yellow);k.key(ell(w*.5,s*.5,w*.14,s*.18),.008);},{rim:.012});
const tableP=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const top=poly([[w*.04,h*.2],[w*.96,h*.2],[w,h*.38],[0,h*.38]]);k.fill(top,INK.wood);k.dots(top,INK.brown,.04,.3);k.key(top,.012);for(const x of [.06,.9])k.keyFill(rect(w*x,h*.38,w*.04,h*.62),INK.brown);});
const tellCard=(key:string,w:number,h:number,a:string,b2:string,c:string=INK.yellow)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.orange,.035,.2);k.key(b,.013);k.text(a,w/2,h*.42,h*.26,INK.navy,{max:w*.86,weight:900});k.text(b2,w/2,h*.8,h*.26,INK.navy,{max:w*.86,weight:900});},{rim:.015});
const bigCard=(key:string,w:number,h:number,lines:string[],c:string,ink:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.035,.18);k.key(b,.016);k.key(rect(.05,.05,w-.1,h-.1),.01,ink);lines.forEach((l,i)=>k.text(l,w/2,h*(.38+i*.3),h*.2,ink,{max:w*.84,weight:900}));},{rim:.018});
const dojo=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.34,w,h*.66);k.fill(b,'#f2e6cc');k.key(b,.014);const roof=poly([[-.1,h*.38],[w*.1,h*.16],[w*.9,h*.16],[w+.1,h*.38]]);k.fill(roof,INK.navy);k.key(roof,.014);k.fill(poly([[w*.04,h*.16],[w*.5,0],[w*.96,h*.16]]),'#3d5da0');
 const s=rect(w*.2,h*.38,w*.6,h*.12);k.fill(s,INK.red);k.text('ENIGHET',w/2,h*.475,h*.09,INK.white,{max:w*.56,weight:900});for(let i=0;i<5;i++)k.key(`M${w*(.1+i*.2)} ${h*.55} L${w*(.1+i*.2)} ${h}`,.012,INK.brown);const d=rect(w*.38,h*.6,w*.24,h*.4);k.fill(d,'#c9a46a');k.key(d,.012);});
const poster=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.yellow);k.dots(b,INK.grass,.035,.3);k.key(b,.014);const cx=w/2;k.fill(`M${cx-w*.22} ${h*.78} L${cx-w*.18} ${h*.42} Q${cx} ${h*.34} ${cx+w*.18} ${h*.42} L${cx+w*.22} ${h*.78} Z`,INK.yellow);k.key(`M${cx-w*.22} ${h*.78} L${cx-w*.18} ${h*.42} Q${cx} ${h*.34} ${cx+w*.18} ${h*.42} L${cx+w*.22} ${h*.78} Z`,.012);
 k.fill(rect(cx-w*.18,h*.5,w*.36,h*.08),INK.green);k.fill(ell(cx,h*.26,w*.13,h*.1),'#7f5138');k.key(ell(cx,h*.26,w*.13,h*.1),.012);k.circle(cx+w*.25,h*.72,w*.08,INK.white);k.key(ell(cx+w*.25,h*.72,w*.08,w*.08),.01);k.fill(rect(0,h*.82,w,h*.18),INK.navy);k.text('RONALDO',w/2,h*.95,h*.11,INK.yellow,{max:w*.86,weight:900});},{rim:.016});
const book=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.navy);k.dots(b,INK.blue,.035,.3);k.key(b,.014);k.fill(rect(w*.08,0,w*.06,h),'#101a36');k.text('THE',w*.56,h*.32,h*.14,INK.yellow,{weight:900});k.text('BOOK',w*.56,h*.52,h*.16,INK.yellow,{weight:900});k.fill(rect(w*.24,h*.66,w*.64,h*.04),INK.white);},{rim:.015});
const crane=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.2,h*.2,w*.08,h*.8),INK.orange);for(let y=h*.25;y<h;y+=.12)k.key(`M${w*.2} ${y} L${w*.28} ${y+.1}`,.008,INK.navy);k.keyFill(rect(0,h*.14,w,h*.06),INK.orange);k.keyFill(poly([[w*.18,h*.14],[w*.24,0],[w*.3,h*.14]]),INK.orange);
 k.key(`M${w*.8} ${h*.2} L${w*.8} ${h*.5}`,.01);k.fill(rect(w*.72,h*.5,w*.16,h*.1),INK.red);k.key(rect(w*.72,h*.5,w*.16,h*.1),.01);k.fill(rect(w*.1,h*.2,w*.14,h*.08),INK.navy);});
const ship=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const hull=poly([[0,h*.55],[w,h*.55],[w*.88,h],[w*.08,h]]);k.fill(hull,INK.red);k.dots(hull,INK.navy,.03,.2);k.key(hull,.014);const cs=[INK.blue,INK.yellow,INK.grass,INK.orange,INK.teal];for(let i=0;i<6;i++){const c=rect(w*(.08+i*.12),h*(.3+(i%2)*.1),w*.11,h*(.25-(i%2)*.1));k.fill(c,cs[i%5]);k.key(c,.008);}
 const br=rect(w*.8,h*.1,w*.14,h*.45);k.fill(br,INK.white);k.key(br,.01);k.fill(rect(w*.82,h*.16,w*.1,h*.06),INK.sky);});
const hardHat=(key:string,s:number)=>sp(key,s,s*.55,k=>{const p=`M0 ${s*.5} L${s} ${s*.5} L${s*.88} ${s*.42} Q${s*.85} 0 ${s/2} 0 Q${s*.15} 0 ${s*.12} ${s*.42} Z`;k.fill(p,INK.yellow);k.key(p,.012);},{rim:.01});
const gatePost=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{for(const x of [0,w-.16]){const p=rect(x,h*.12,.16,h*.88);k.fill(p,INK.stone);k.dots(p,'#8f8367',.035,.3);k.key(p,.012);k.fill(rect(x-.03,h*.08,.22,.08),INK.grey);}
 const arch=`M.08 ${h*.14} Q${w/2} ${-h*.06} ${w-.08} ${h*.14} L${w-.08} ${h*.26} Q${w/2} ${h*.08} .08 ${h*.26} Z`;k.fill(arch,INK.sky);k.key(arch,.012);k.text(label,w/2,h*.2,h*.07,INK.navy,{max:w*.6,weight:900});});
const gateLeaf=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const f=rect(0,0,w,h);k.key(f,.03,c);for(let i=1;i<6;i++)k.key(`M${i*w/6} 0 L${i*w/6} ${h}`,.022,c);k.key(`M0 ${h*.3} L${w} ${h*.3} M0 ${h*.75} L${w} ${h*.75}`,.026,c);for(let i=0;i<6;i++)k.fill(poly([[i*w/6+.02,0],[(i+.5)*w/6,-.08],[(i+1)*w/6-.02,0]]),c);},{rim:.012});
const pitchMat=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,'#4fae5f');for(let i=0;i<6;i++)if(i%2)k.fill(rect(i*w/6,0,w/6,h),'#5fbf6c');k.key(rect(.08,.08,w-.16,h-.16),.03,INK.white);k.key(`M${w/2} .08 L${w/2} ${h-.08}`,.03,INK.white);k.key(ell(w/2,h/2,h*.18,h*.18),.03,INK.white);},{rim:.012});
const shirtP=(key:string,s:number,c:string)=>sp(key,s,s,k=>{const p=poly([[s*.3,0],[s*.7,0],[s,s*.2],[s*.86,s*.4],[s*.76,s*.32],[s*.76,s],[s*.24,s],[s*.24,s*.32],[s*.14,s*.4],[0,s*.2]]);k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);k.fill(poly([[s*.38,0],[s*.5,s*.12],[s*.62,0]]),INK.white);},{rim:.012});
const glow=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=poly([[w*.4,0],[w*.6,0],[w,h],[0,h]]);k.fill(p,INK.yellow,.35);k.dots(p,INK.yellow,.04,(x,y)=>.8-y/h*.5);},{rim:0});
const calendar=(key:string,w:number,h:number,title:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h*.84);k.fill(b,INK.white);k.key(b,.014);k.fill(rect(0,0,w,h*.2),INK.red);k.text(title,w/2,h*.15,h*.11,INK.white,{max:w*.86,weight:900});k.keyFill(rect(w*.46,h*.84,w*.08,h*.16),INK.brown);});
const crutch=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.42,h*.1,w*.16,h*.9),INK.grey);k.keyFill(rect(0,0,w,h*.08),INK.grey);k.keyFill(rect(w*.2,h*.45,w*.6,h*.05),INK.grey);},{rim:.012});
const pow=(key:string,r:number,c:string=INK.yellow)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2,rr=i%2?r*.5:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});k.fill(poly(pts),c);k.dots(poly(pts),INK.orange,.03,.4);k.key(poly(pts),.012);},{rim:.02});

/* ───────────── shared mechanics ───────────── */
function ballPair(B:Builder,key:string,r=.12){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),R=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}

/* ───────────── 1 · A family from far away (rosengard) ───────────── */
const rosengard:SpreadDef={id:'rosengard',rest:25.9,
 left:k=>{asphalt(k,-5,0);lawn(k,-4.8,Z(.6),1.6,1.1);lawn(k,-2.4,Z(1.0),1.3,.9);stepsPath(k,-4.4,Z(2.0),-.4,Z(1.4),11,INK.navy);
  k.text('ROSENGÅRD',-2.5,Z(2.62),.46,INK.pink,{max:4});k.text('MALMÖ · SWEDEN · 1981',-2.5,Z(2.9),.16,INK.white,{weight:800});},
 right:k=>{const p=rect(0,0,5,PAGE_D);k.fill(p,'#d8c29a');k.dots(p,'#a88f62',.05,.3);lawn(k,.4,Z(-1.0),4.2,1.4);
  k.text('FBK BALKAN',2.5,Z(2.62),.44,INK.red,{max:4});k.text('STARTED BY PEOPLE FROM YUGOSLAVIA',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'a-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);slabs(k,4.5,2.4,1,.4);k.fill(rect(0,2.4,4.5,.6),'#8e8f98');}},
   {key:K+'a-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);slabs(k,1.8,2.2,3,.4);const t=`M1.8 2.3 Q3 1.8 4.5 2.0 L4.5 3 L1.8 3 Z`;k.fill(t,'#9fbf72');k.dots(t,INK.green,.05,.3);k.fill(rect(0,2.3,4.5,.7),'#c9b48a');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'a-sun',.32),'R',3.8,2.4,{out:.012}),bunt=bd.add(S.bunting(K+'a-bunt',2.6,.4,[INK.red,INK.yellow,INK.sky,INK.white]),'R',2.0,2.6,{out:.03}),plane=bd.add(S.plane(K+'a-plane',.5,.3),'L',.6,2.5,{out:.03});
  const sign=B.stand(S.sign(K+'a-sign',1.2,1.2,'MALMÖ',INK.white),-.8,-1.7,{layer:1});const c81=sign.flap(S.flipCard(K+'a-1981',.9,.36,'1981',INK.pink),0,1.2*.56,{z:.03});
  const baby=B.person(K+'a-baby',-1.3,.6,.85,{shirt:'fan',...ZKID,face:'grin',layer:2});
  const dad=B.person(K+'a-dad',-4.3,.7,1.65,{shirt:'navy',skin:'#e8b48f',hair:'short',hairColor:'#3b2a22',adult:true,face:'smile',layer:3,holdR:'suitcase'});
  const mum=B.person(K+'a-mum',-3.4,1.1,1.55,{shirt:'coach',skin:'#f1b88f',hair:'long',hairColor:'#6b4a2f',adult:true,face:'smile',layer:3,holdL:'suitcase'});
  const tags=[B.stand(S.flipCard(K+'a-tagD',1.0,.3,'BOSNIAK',INK.blue),-4.3,1.9,{layer:3,s:0}),B.stand(S.flipCard(K+'a-tagM',.8,.3,'CROAT',INK.red),-3.2,2.15,{layer:3,s:0})];
  const met=B.stand(heart('a-met',.4),-3.8,-.2,{layer:2,s:0});const metCard=B.stand(S.flipCard(K+'a-metc',1.2,.3,'MET IN SWEDEN',INK.pink),-3.8,.3,{layer:2,s:0});
  const block=B.stand(flatBlock('a-block',1.5,1.9,2),-2.3,-1.8,{layer:1,s:0});
  const hoodKids=[[-2.9,-.4],[-2.2,-.2],[-1.6,-.5]].map(([x,z],i)=>B.person(K+`a-hk${i}`,x,z,.95,{shirt:(['bib','casual','keeper'] as const)[i],skin:SK[(i*2+1)%5],hair:(['curly','bun','short'] as const)[i],face:'grin',layer:2}));
  const manyCard=B.stand(S.flipCard(K+'a-many',1.6,.3,'FROM MANY COUNTRIES',INK.yellow,INK.navy),-2.3,.25,{layer:2,s:0});
  const gift=B.stand(giftBox('a-gift',.5),-.7,1.6,{layer:3,s:0});const giftLid=gift.flap(boxLid('a-glid',.5),0,.4,{anchor:'bottom',z:.02});const bootP=gift.add(boots('a-boots',.36),0,.36,{z:-.01});
  const six=B.stand(S.flipCard(K+'a-six',.7,.3,'AGE 6',INK.yellow,INK.navy),-1.9,1.9,{layer:3,s:0});
  const club=B.stand(clubhouse('a-club',2.0,1.6),2.4,-1.6,{layer:1});const cdoor=club.flap(doorLeaf('a-cdoor',.56,.7,INK.navy),-.28,0,{anchor:'bl',axis:'y',z:.02});
  const coach=B.person(K+'a-coach',2.4,-.9,1.4,{shirt:'coach',skin:'#e8b48f',hair:'short',hairColor:'#5a4030',adult:true,face:'smile',layer:2});
  const B2=B.person(K+'a-zlatan',1.2,.9,1.0,{shirt:'fan',...ZKID,legs:'kick',face:'grin',layer:3});
  const team=[[3.3,.8,'#d99a6c','curly'],[4.1,.3,'#f1b88f','short'],[3.8,1.5,'#b27650','bun']].map(([x,z,sk,hr],i)=>B.person(K+`a-t${i}`,x as number,z as number,1.0,{shirt:'fan',skin:sk as string,hair:hr as 'short',face:'grin',layer:3}));
  const yugo=B.stand(S.flipCard(K+'a-yugo',1.5,.3,'FROM YUGOSLAVIA',INK.white,INK.navy),3.9,-.35,{layer:2,s:0});
  const goal=B.stand(S.goal(K+'a-goal',1.2,.65),4.3,-1.95,{layer:1});void goal;
  const ball=ballPair(B,'a-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,25.9):b.t;
   c81.flip=-2.9+2.9*beat(t,3,3.8);baby.body.s=beat(t,5,5.8)*(1-beat(t,14.6,15.2));plane.dx=-3.2*beat(t,7.6,14.5);plane.visible=t>7.4&&t<14.6;
   dad.body.s=beat(t,8,8.8);mum.body.s=beat(t,9.6,10.4);tags[0].s=beat(t,8.6,9.2)*(1-beat(t,14.6,15.2));tags[1].s=beat(t,10.2,10.8)*(1-beat(t,14.6,15.2));
   dad.body.x=-4.3+.35*beat(t,12,13.4);mum.body.x=-3.4-.25*beat(t,12,13.4);met.s=beat(t,13.2,13.8);metCard.s=beat(t,13.6,14.3)*(1-beat(t,20.6,21.2));met.rot=.1*wave(t,13.8,20,1);
   block.s=beat(t,15.2,16.2);hoodKids.forEach((p,i)=>{p.body.s=beat(t,16.8+i*.5,17.6+i*.5);p.armR.rot=.12+1.8*pulse(t,18.2+i*.5,19.8+i*.5);});manyCard.s=beat(t,18.6,19.3)*(1-beat(t,25,25.6));
   gift.s=beat(t,22,22.6);giftLid.flip=-2.7*beat(t,22.8,23.8);bootP.dy=.18*beat(t,23.2,24.2);six.s=beat(t,22.4,23);
   const open=Math.max(beat(t,26.4,27.6),manual?beat(act,0,.6):0);cdoor.flip=-1.3*open;
   coach.body.s=Math.max(beat(t,27.2,28),manual?beat(act,.35,.7):0);coach.armR.rot=.12+1.6*Math.max(beat(t,28,28.6),manual?beat(act,.6,.8):0)-1.6*beat(t,31,31.6);
   B2.body.s=Math.max(beat(t,24.2,25),manual?1:0);team.forEach((p,i)=>{p.body.s=Math.max(beat(t,28.6+i*.4,29.4+i*.4),manual?beat(act,.55+i*.1,.8+i*.1):0);});
   yugo.s=Math.max(beat(t,30,30.8),manual?beat(act,.8,1):0);
   let [bx,bz,dy]=track(t,[[0,1.5,1.0,0],[31.6,1.5,1.0,0],[32.4,3.3,1.2,.25],[33.2,3.3,1.2,0],[34,4.3,-1.6,.3]]);ball(bx,bz,dy,t>24.8||manual);B2.leg!.rot=-1*pulse(t,31.3,31.9);
   const hug=beat(t,35.4,36.2);cheer(dad,hug*.5);cheer(mum,hug*.5);cheer(B2,beat(t,35.8,36.4));team.forEach((p,i)=>cheer(p,beat(t,36+i*.2,36.6+i*.2)));
   bunt.scale=beat(t,35,36);bunt.visible=bunt.scale>.02;sun.dy=.4*beat(t,35,37);
   return b.narrated?-.4*beat(t,2.4,3.4)+.4*beat(t,25,26)+.4*beat(t,26,27)-.4*beat(t,34.6,35.6):0;
  };
 }};

/* ───────────── 2 · Running home for dinner (dinner) ───────────── */
const dinner:SpreadDef={id:'dinner',rest:17.1,
 left:k=>{floorboards(k,-5,0,'#d4bd98','#a78b62');stepsPath(k,-3.3,Z(1.5),-.2,Z(1.5),9,INK.brown);
  k.text('DAD’S HOME',-2.5,Z(2.62),.44,INK.blue,{max:4});k.text('OFTEN NOT MUCH FOOD',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{asphalt(k,0,5,'#a6a39a','#7d7a70');const path=`M0 ${Z(1.2)} Q1.6 ${Z(1.9)} 3.1 ${Z(.6)} L3.6 ${Z(.9)} Q1.8 ${Z(2.4)} 0 ${Z(1.8)} Z`;k.fill(path,'#d9c7a0');stepsPath(k,.3,Z(1.55),3.2,Z(.8),9,INK.brown);
  k.text('MUM’S HOME',2.5,Z(2.62),.44,INK.pink,{max:4});k.text('DINNER AT MUM’S',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'d-bdL',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#c8ccd8');k.dots(p,INK.navy,.05,.14);const win=rect(2.3,.5,1.4,1.1);k.fill(win,'#8d93a8');k.key(win,.03,INK.white);k.key('M3 .5 L3 1.6',.03,INK.white);slabs(k,1.4,1.6,4,.1);k.fill(rect(0,2.3,4.5,.7),'#b3a88e');}},
   {key:K+'d-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#ffd9a0',INK.pink,y=>.45-y/3*.4);slabs(k,4.5,2.2,5,.7);k.fill(rect(0,2.2,4.5,.8),'#a6a39a');}},-3.05,1.22);
  const rain=bd.add(stormCloud('d-rain',1.3,.66),'L',2.5,2.2,{out:.03}),sun=bd.add(S.sun(K+'d-sun',.3),'R',3.9,2.5,{out:.012}),moon=bd.add(heart('d-bdheart',.3),'R',1.0,2.4,{out:.02});
  const mumP=B.person(K+'d-mum',3.4,-.4,1.55,{shirt:'coach',skin:'#f1b88f',hair:'long',hairColor:'#6b4a2f',adult:true,face:'smile',layer:2});
  const five=B.stand(S.flipCard(K+'d-five',1.2,.3,'FIVE CHILDREN',INK.yellow,INK.navy),2.1,.35,{layer:2,s:0});
  const sibs=[[1.2,-.7],[1.7,-.5],[2.2,-.75],[2.7,-.55]].map(([x,z],i)=>B.person(K+`d-sib${i}`,x,z,.9+(i%2)*.1,{shirt:(['bib','casual','fan','keeper'] as const)[i],skin:SK[(i+4)%5],hair:(['long','short','bun','curly'] as const)[i],hairColor:'#4a3326',face:'smile',layer:1}));
  const mhouse=B.stand(house('d-mhouse',1.6,1.5,'#f6d9a4',INK.red),4.1,-1.65,{layer:1});
  const dadP=B.person(K+'d-dad',-3.9,-.5,1.65,{shirt:'navy',skin:'#e8b48f',hair:'short',hairColor:'#3b2a22',adult:true,face:'open',layer:2});
  const nine=B.stand(S.flipCard(K+'d-nine',.8,.3,'AGE 9',INK.pink),-2.2,1.95,{layer:3,s:0});
  const boy=B.person(K+'d-boy',-2.7,1.1,1.0,{shirt:'casual',...ZKID,legs:'run',face:'shy',layer:3,holdR:'suitcase'});
  const fr=B.stand(fridge('d-fridge',.8,1.3),-1.4,-1.3,{layer:1});const frDoor=fr.flap(fridgeDoor('d-frdoor',.8,1.3),-.4,0,{anchor:'bl',axis:'y',z:.02});
  const hungry=B.stand(S.flipCard(K+'d-hungry',1.1,.3,'HUNGRY',INK.white,INK.navy),-1.5,.45,{layer:2,s:0});
  const runL=B.person(K+'d-runL',-2.6,1.55,1.0,{shirt:'casual',...ZKID,legs:'run',face:'smile',layer:3});B.slot(-3.0,1.75,-.3,1.75);
  const runR=B.person(K+'d-runR',.5,1.55,1.0,{shirt:'casual',...ZKID,legs:'run',face:'grin',layer:3});
  const tbl=B.stand(tableP('d-table',1.4,.75),2.7,.55,{layer:2,s:0});const dish=tbl.add(plateFood('d-dish',.2),0,.55,{z:.02});
  const fault=B.stand(tellCard('d-fault',1.8,.5,'NOT A',"CHILD’S FAULT",INK.sky2),-2.6,-.05,{layer:2,s:0});
  const teacher=B.person(K+'d-teacher',4.3,1.2,1.55,{shirt:'keeper',skin:'#b27650',hair:'bun',hairColor:'#2e2230',adult:true,face:'smile',layer:3});
  const tell=B.stand(tellCard('d-tell',1.2,.5,'TELL A','GROWN-UP'),1.2,2.0,{layer:3,s:0});
  const hearts=[0,1].map(i=>B.stand(heart(`d-h${i}`,.3),2.2+i*1.0,1.25,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.1):b.t;
   mhouse.s=beat(t,2.2,3);mumP.body.s=beat(t,3.4,4.2);sibs.forEach((p,i)=>{p.body.s=beat(t,4.4+i*.4,5+i*.4);});five.s=beat(t,5.2,5.9)*(1-beat(t,11,11.6));dadP.body.s=beat(t,2.6,3.4);
   boy.body.s=beat(t,8,8.8)*(1-beat(t,17.2,17.6))*(manual?1-beat(act,0,.08):1);boy.body.x=-.8-1.9*beat(t,8.6,10.6);nine.s=beat(t,8.4,9)*(1-beat(t,16.6,17.2));
   frDoor.flip=-1.35*beat(t,12,13);hungry.s=beat(t,14.4,15.1)*(1-Math.max(beat(t,24.4,25),manual?beat(act,.6,.9):0));
   const r=beat(t,13.2,14.4)*(1-Math.max(beat(t,27.6,29),manual?beat(act,.4,.9):0));rain.scale=r;rain.visible=r>.02;rain.dx=.15*wave(t,14,27,.3);
   // Run along the path: one cut-out per page (paper can't cross the gutter).
   const run=manual?act:beat(t,19.9,23.6);const uL=clamp01(run/.5),uR=clamp01((run-.5)/.5);
   runL.body.s=(t>17.3||manual)?beat(uL,0,.08)*(1-beat(uL,.92,1)):0;runL.body.x=-2.6+2.3*uL;runL.body.dy=.05*Math.abs(Math.sin(uL*18));
   runR.body.s=beat(uR,0,.1);const [rx,rz]=track(uR,[[0,.5,1.55],[.6,2.0,1.2],[1,2.8,.95]]);runR.body.x=rx;runR.body.z=rz;runR.body.dy=.05*Math.abs(Math.sin(uR*18))*(uR<1?1:0);
   tbl.s=Math.max(beat(t,21.8,22.6),manual?beat(act,.75,1):0);dish.s=1;mumP.armL.rot=-.12-1.8*Math.max(beat(t,23,23.6),manual?beat(act,.85,1):0)+1.2*beat(t,27,27.6);
   cheer(runR,Math.max(beat(t,24,24.6)*(1-beat(t,26,26.6)),manual?beat(act,.9,1):0)*.8);
   fault.s=beat(t,28,28.8);hearts.forEach((h,i)=>{h.s=beat(t,29+i*.5,29.6+i*.5);});sun.dy=.5*beat(t,28,30);moon.scale=beat(t,29.6,30.4);moon.visible=moon.scale>.02;
   teacher.body.s=beat(t,31.4,32.2);tell.s=beat(t,32.2,33);teacher.armL.rot=-.12-1.3*beat(t,32.4,33);cheer(mumP,beat(t,35,35.6)*.6);
   return b.narrated?.45*beat(t,1.8,2.8)-.9*beat(t,7.4,8.4)+.9*beat(t,19.6,21)-.45*beat(t,27.4,28.4):0;
  };
 }};

/* ───────────── 3 · The wrong clothes (clothes) ───────────── */
const clothes:SpreadDef={id:'clothes',rest:16.8,
 left:k=>{pitch(k,-5,0);boxLines(k,-4.2,-1.0,-2.0,1.0);
  k.text('THE WRONG CLOTHES',-2.5,Z(2.62),.36,INK.navy,{max:4.2});k.text('HE FELT HE DID NOT FIT IN',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{floorboards(k,0,5);const mat=rect(.6,Z(-.4),3.8,2.2);k.fill(mat,INK.sky2);k.dots(mat,INK.blue,.05,.3);bar(k,.6,Z(-.4),4.4,Z(-.4),.05,INK.red);bar(k,.6,Z(1.8),4.4,Z(1.8),.05,INK.red);
  k.text('ENIGHET MEANS UNITY',2.5,Z(2.62),.32,INK.red,{max:4.4});k.text('TAEKWONDO CLASSES IN MALMÖ',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'c-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);const h=`M0 2.3 Q1.5 1.8 2.8 2.0 Q3.8 2.2 4.5 1.9 L4.5 3 L0 3 Z`;k.fill(h,'#8fc467');k.dots(h,INK.green,.05,.3);for(let i=0;i<5;i++){const x=.4+i*.9;k.fill(ell(x,1.95,.3,.36),INK.leaf);}k.fill(rect(0,2.4,4.5,.6),INK.grass);}},
   {key:K+'c-bdR',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#f2e6cc');k.dots(p,INK.orange,.05,.12);for(let x=.3;x<4.5;x+=.6)k.key(`M${x} 0 L${x} 2.3`,.01,'#c9a46a');const bn=rect(.9,.35,2.7,.45);k.fill(bn,INK.red);k.key(bn,.014);k.text('ENIGHET · UNITY',2.25,.7,.26,INK.white,{weight:900,max:2.5});
    const belts=[INK.white,INK.yellow,INK.orange,INK.grass,INK.blue,'#7a4d35','#22222a'];belts.forEach((c,i)=>{const x=.5+i*.52;k.fill(rect(x,1.15,.08,.7),c);k.fill(rect(x+.14,1.15,.08,.7),c);k.fill(rect(x-.02,1.1,.26,.12),c);k.key(rect(x-.02,1.1,.26,.12),.008);});k.fill(rect(0,2.3,4.5,.7),'#e3c79a');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'c-sun',.3),'L',3.9,2.5,{out:.012}),cloud=bd.add(stormCloud('c-cloud',1.2,.6),'L',1.6,2.3,{out:.03});
  const rich=[[-4.2,-.6,'#f1b88f','short'],[-3.5,-.3,'#e8b48f','long'],[-2.8,-.7,'#d99a6c','curly']].map(([x,z,sk,hr],i)=>B.person(K+`c-r${i}`,x as number,z as number,1.05,{shirt:'arg',skin:sk as string,hair:hr as 'short',hairColor:'#8a6a40',face:'smile',layer:2}));
  const Zk=B.person(K+'c-zlatan',-1.8,.9,1.05,{shirt:'casual',...ZKID,face:'shy',layer:3});
  const noMoney=B.stand(S.flipCard(K+'c-nomoney',1.0,.3,'NO MONEY',INK.white,INK.navy),-1.3,1.7,{layer:3,s:0}),wrong=B.stand(S.flipCard(K+'c-wrong',1.3,.3,'WRONG CLOTHES',INK.white,INK.navy),-3.5,.55,{layer:2,s:0});
  const bookP=B.stand(book('c-book',.6,.8),-.55,-1.5,{layer:1,s:0});
  const card=B.stand(sp('c-cardback',1.5,1.0,k=>{const b=rect(0,0,1.5,1.0);k.fill(b,INK.navy);k.dots(b,INK.blue,.035,.3);k.key(b,.016);k.text('ONE DAY',.75,.4,.22,INK.yellow,{weight:900});k.text('I’LL SHOW THEM!',.75,.74,.18,INK.yellow,{weight:900,max:1.36});},{rim:.018}),-2.4,1.55,{layer:3,s:0});
  const cardFront=card.flap(bigCard('c-cardfront',1.5,1.0,['DIFFERENT?','FLIP ME'],INK.white,INK.navy),-.75,0,{anchor:'bl',axis:'y',z:.02});
  const arrow=B.stand(S.arrow(K+'c-arrow',.9,.36,INK.yellow),-.85,2.05,{layer:3,s:0});
  const dj=B.stand(dojo('c-dojo',2.2,1.7),2.0,-1.65,{layer:1,s:0});const unity=B.stand(S.flipCard(K+'c-unity',1.2,.3,'UNITY',INK.red),2.0,-.55,{layer:2,s:0});
  const kickers=[[1.2,.5,'#d99a6c','short'],[2.4,.9,'#f1b88f','bun'],[3.5,.4,'#7f5138','curly']].map(([x,z,sk,hr],i)=>B.person(K+`c-k${i}`,x as number,z as number,1.0,{shirt:'ger',skin:sk as string,hair:hr as 'short',legs:'kick',face:'grin',layer:2}));
  const Zt=B.person(K+'c-zt',2.9,1.4,1.05,{shirt:'ger',...ZKID,legs:'kick',face:'grin',layer:3});
  const hero=B.stand(poster('c-hero',.9,1.2),4.2,-1.2,{layer:1,s:0});const heroCard=B.stand(S.flipCard(K+'c-heroc',.9,.3,'HIS HERO',INK.yellow,INK.navy),4.2,-.1,{layer:2,s:0});
  const strong=B.stand(heart('c-strong',.4,INK.red),.5,1.9,{layer:3,s:0});
  const ball=B.stand(S.ball(K+'c-ball',.1),-1.5,1.05,{layer:3,tab:false,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,16.8):b.t;
   rich.forEach((p,i)=>{p.body.s=beat(t,2.2+i*.4,2.9+i*.4);p.armR.rot=.12+.8*pulse(t,3.4+i*.3,5+i*.3);});Zk.body.s=beat(t,4.6,5.4);Zk.body.x=-1.8+.35*beat(t,6,7.4);
   wrong.s=beat(t,7.4,8.1)*(1-beat(t,16.6,17.2));noMoney.s=beat(t,8.6,9.3)*(1-beat(t,16.6,17.2));
   const cl=beat(t,5.6,6.8)*(1-Math.max(beat(t,18.6,20),manual?beat(act,.4,1):0));cloud.scale=cl;cloud.visible=cl>.02;
   bookP.s=beat(t,10.6,11.4);card.s=beat(t,12.8,13.6);
   const flip=Math.max(beat(t,17.2,18.4),manual?beat(act,0,.7):0);cardFront.flip=-2.8*flip;
   arrow.s=Math.max(beat(t,19,19.7),manual?beat(act,.7,.9):0);arrow.dx=.3*wave(t,19.7,22,.8);Zk.armR.rot=.12+2.1*Math.max(beat(t,19.2,19.8)*(1-beat(t,21.2,21.8)),manual?beat(act,.75,1):0);
   ball.s=beat(t,19.6,20.2)*(1-beat(t,21.8,22.4));ball.dy=.3*Math.abs(Math.sin((t-19.6)*4.5));
   dj.s=beat(t,22,23);unity.s=beat(t,26.2,26.9);
   kickers.forEach((p,i)=>{p.body.s=beat(t,23.2+i*.35,23.9+i*.35);p.leg!.rot=-1.4*pulse(t,24.6+i*.5,25.6+i*.5)-1.4*pulse(t,27+i*.3,28+i*.3);});
   Zt.body.s=beat(t,24,24.8);Zt.leg!.rot=-1.9*Math.max(pulse(t,25.2,26.4),pulse(t,27.6,28.8));
   hero.s=beat(t,29.2,30.2);heroCard.s=beat(t,30.2,30.9);
   rich.forEach((p,i)=>{p.body.x=[-4.2,-3.5,-2.8][i]+.6*beat(t,33.4,34.6);cheer(p,beat(t,34.6+i*.2,35.2+i*.2));});cheer(Zk,beat(t,34.4,35));strong.s=beat(t,35.2,35.9);kickers.forEach((p,i)=>cheer(p,beat(t,35+i*.2,35.6+i*.2)));
   sun.dy=.5*beat(t,33,35);
   return b.narrated?-.45*beat(t,1.6,2.6)+.45*beat(t,21.4,22.4)+.45*beat(t,22.4,23.4)-.45*beat(t,33,34):0;
  };
 }};

/* ───────────── 4 · Almost giving up (port) ───────────── */
const port:SpreadDef={id:'port',rest:15.7,
 left:k=>{pitch(k,-5,0);boxLines(k,-4.1,-1.0,-2.0,1.0);
  k.text('MALMÖ FF',-2.5,Z(2.62),.46,INK.blue,{max:4});k.text('AT FIFTEEN, HE NEARLY GAVE UP',-2.5,Z(2.9),.16,INK.navy,{weight:800,max:4});},
 right:k=>{const q=rect(0,0,5,Z(.2));k.fill(q,'#b9b3a6');k.dots(q,'#8d877a',.05,.25);water(k,0,5,Z(.2),PAGE_D);bar(k,0,Z(.2),5,Z(.2),.07,INK.navy);
  k.text('PORT OF MALMÖ',2.5,Z(2.62),.4,INK.white,{max:4});k.text('WHERE THE BIG SHIPS COME IN',2.5,Z(2.9),.16,INK.white,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'p-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.3,2.5,[INK.sky,INK.white,INK.sky,INK.navy,INK.white],1);lightRig(k,1.1,.4);lightRig(k,3.5,.45);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},
   {key:K+'p-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9ccd9',INK.navy,y=>.3-y/3*.2);sea(k,4.5,1.9,.6);k.fill(rect(0,2.5,4.5,.5),'#b9b3a6');for(let i=0;i<4;i++){const x=.4+i*1.1;k.fill(rect(x,1.4,.8,.5),['#d0d4de','#b9c0cf'][i%2]);k.key(rect(x,1.4,.8,.5),.01);}}},-3.05,1.22);
  const cloud=bd.add(stormCloud('p-cloud',1.4,.7),'R',2.3,2.3,{out:.03}),sun=bd.add(S.sun(K+'p-sun',.32),'L',3.9,2.5,{out:.012}),planeP=bd.add(S.plane(K+'p-plane',.5,.3),'R',.4,2.6,{out:.03});
  const teen=B.person(K+'p-teen',-2.4,.6,1.3,{shirt:'fan',...ZKID,legs:'kick',face:'smile',layer:3});
  const fifteen=B.stand(S.flipCard(K+'p-15',.8,.3,'AGE 15',INK.pink),-1.2,1.6,{layer:3,s:0});
  const goalP=B.stand(S.goal(K+'p-goal',1.6,.85),-2.55,-1.75,{layer:1});void goalP;
  const gate=B.stand(gatePost('p-gate',1.5,1.55,'MALMÖ FF'),-.95,-.55,{layer:2});
  const gl=gate.flap(gateLeaf('p-gL',.58,1.1,INK.navy),-1.5/2+.16,0,{anchor:'bl',axis:'y',z:.012}),gr=gate.flap(gateLeaf('p-gR',.58,1.1,INK.navy),1.5/2-.16,0,{anchor:'br',axis:'y',z:.012});
  const manager=B.person(K+'p-manager',-3.9,.2,1.6,{shirt:'coach',skin:'#f1b88f',hair:'short',hairColor:'#8a6a40',adult:true,face:'smile',layer:2});
  const board=B.stand(S.scoreboard(K+'p-board',1.6,1.3,'MALMÖ FF'),-4.1,-1.6,{layer:1,s:0});
  const c99=board.flap(lineCard('p-1999',1.28,.58,['FIRST TEAM','1999'],INK.yellow),0,.95,{z:.02});
  const craneP=B.stand(crane('p-crane',1.4,2.0),3.8,-1.7,{layer:1,s:0});
  const shipP=B.stand(ship('p-ship',1.8,.8),3.0,.9,{layer:2,s:0,tab:false});B.slot(1.6,1.2,4.6,1.2);
  const portSign=B.stand(S.sign(K+'p-sign',1.3,1.2,'PORT JOB?',INK.yellow),1.2,-1.4,{layer:1,s:0});
  const worker=B.person(K+'p-worker',2.1,-.5,1.3,{shirt:'casual',...ZKID,face:'shy',layer:2});const hat=worker.body.add(hardHat('p-hat',.36),0,1.3*1.22*.9,{z:.02});
  const ajax=B.stand(S.sign(K+'p-ajax',1.3,1.2,'AJAX · 2001',INK.white),1.0,.1,{layer:2,s:0});
  const cheerCard=B.stand(S.flipCard(K+'p-believe',1.4,.3,'SOMEONE BELIEVES',INK.blue),-3.9,1.2,{layer:3,s:0});
  const ball=B.stand(S.ball(K+'p-ball',.1),-2.0,.75,{layer:3,tab:false});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15.7):b.t;
   teen.body.s=beat(t,2,2.8);board.s=beat(t,3,3.8);const juggle=beat(t,3.6,4)*(1-beat(t,7.4,7.8));ball.dy=.35*Math.abs(Math.sin((t-3.6)*4.5))*juggle;teen.leg!.rot=-.6*Math.abs(Math.sin((t-3.6)*4.5))*juggle;
   fifteen.s=beat(t,7.6,8.3)*(1-beat(t,21,21.6));
   const cl=beat(t,7.6,8.8)*(1-Math.max(beat(t,18.6,20),manual?beat(act,.4,1):0));cloud.scale=cl;cloud.visible=cl>.02;cloud.dx=-.2*wave(t,9,18,.3);
   const leave=beat(t,8.8,10.4)*(1-Math.max(beat(t,18.6,19.6),manual?beat(act,.4,.8):0));teen.body.x=-2.4+1.1*leave;teen.body.s=beat(t,2,2.8)*(1-beat(leave,.7,1));
   craneP.s=beat(t,11,11.8);shipP.s=beat(t,11.6,12.4);shipP.x=4.3-1.6*beat(t,11.6,15.6);portSign.s=beat(t,12,12.8)*(1-Math.max(beat(t,19,19.8),manual?beat(act,.5,.9):0));
   worker.body.s=beat(t,12.8,13.6)*(1-Math.max(beat(t,18.6,19.4),manual?beat(act,.3,.7):0));hat.s=1;
   const open=Math.max(beat(t,16.2,17.6),manual?beat(act,0,.55):0);gl.flip=-1.25*open;gr.flip=1.25*open;
   manager.body.s=Math.max(beat(t,18.4,19.2),manual?beat(act,.3,.6):0);manager.armR.rot=.12+1.3*Math.max(beat(t,19.2,19.8)*(1-beat(t,22,22.6)),manual?beat(act,.55,.8):0);
   cheerCard.s=Math.max(beat(t,19.4,20.1),manual?beat(act,.6,.9):0)*(1-beat(t,27,27.6));
   c99.flip=-2.9+2.9*Math.max(beat(t,22.8,23.6),manual?beat(act,.8,1):0);
   ajax.s=beat(t,27.6,28.4);planeP.dx=-3.2*beat(t,28.4,31.4);planeP.visible=t>28.2&&t<31.5;
   cheer(teen,Math.max(beat(t,23.6,24.2)*(1-beat(t,26,26.6)),beat(t,32.4,33),manual?beat(act,.9,1):0));cheer(manager,beat(t,32.8,33.4));sun.dy=.5*beat(t,31.6,33.6);
   return b.narrated?-.4*beat(t,1.6,2.6)+.4*beat(t,10.4,11.2)+.4*beat(t,11.2,12)-.4*beat(t,15.6,16.4)-.4*beat(t,16.4,17.2)+.4*beat(t,27,28)-.4*beat(t,31.4,32.4):0;
  };
 }};

/* ───────────── 5 · A pitch for the next kids (court) ───────────── */
const court:SpreadDef={id:'court',rest:17.2,
 left:k=>{asphalt(k,-5,0);lawn(k,-4.8,Z(1.2),1.4,.9);stepsPath(k,-4.4,Z(2.0),-.4,Z(.8),10,INK.white);
  k.text('ROSENGÅRD · 2007',-2.5,Z(2.62),.38,INK.yellow,{max:4});k.text('NEW KITS FOR FBK BALKAN',-2.5,Z(2.9),.16,INK.white,{weight:800});},
 right:k=>{asphalt(k,0,5,'#7d7f8a');
  k.text('ZLATAN COURT',2.5,Z(2.62),.46,INK.yellow,{max:4});k.text('A MAT, GOALPOSTS, LIGHTS AND A FENCE',2.5,Z(2.9),.14,INK.white,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'k-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);slabs(k,4.5,2.4,6,.55);k.fill(rect(0,2.4,4.5,.6),'#6f717c');}},
   {key:K+'k-bdR',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);slabs(k,4.5,2.3,8,.5);k.fill(rect(0,2.3,4.5,.7),'#6f717c');}},-3.05,1.22);
  const stars=bd.add(S.stars(K+'k-stars',3.6,.9,11),'R',.4,2.95,{out:.02}),moon=bd.add(S.sun(K+'k-moon',.26,INK.white),'L',3.9,2.55,{out:.012});
  const Zm=B.person(K+'k-zlatan',-1.3,.2,1.6,{shirt:'casual',...ZMAN,adult:true,face:'smile',layer:2});
  const tag=B.stand(S.flipCard(K+'k-2007',1.0,.32,'LATE 2007',INK.pink),-2.4,-.6,{layer:2,s:0});
  const matL=B.flat(pitchMat('k-matL',3.6,2.1),.7,1.05,{edge:'left',hinge:.7});
  const posts=[B.stand(S.goal(K+'k-goalL',1.0,.6),1.0,-.3,{layer:2,s:0}),B.stand(S.goal(K+'k-goalR',1.0,.6),4.0,-.3,{layer:2,s:0})];
  const fence=B.stand(S.fenceStrip(K+'k-fence',4.4,.5,INK.grey),2.5,-1.3,{layer:1,s:0});
  const lights=[B.stand(S.floodlight(K+'k-fl1',.5,1.8),.6,-1.8,{layer:1,s:0}),B.stand(S.floodlight(K+'k-fl2',.5,1.8),4.4,-1.8,{layer:1,s:0})];
  const beams=[bd.add(glow('k-beam1',1.4,1.9),'R',.9,.25,{out:.05}),bd.add(glow('k-beam2',1.4,1.9),'R',3.9,.25,{out:.05})];
  const courtSign=B.stand(S.banner(K+'k-sign',2.0,.4,'ZLATAN COURT',INK.yellow,INK.navy),2.5,-.85,{layer:2,s:0});
  const listC=B.stand(lineCard('k-list',1.6,.5,['MAT · GOALS · LIGHTS · FENCE'],INK.white),-3.6,1.3,{layer:3,s:0});
  const kitSign=B.stand(S.sign(K+'k-kitsign',1.3,1.2,'FBK BALKAN',INK.white),-3.9,-1.6,{layer:1,s:0});
  const shirts=[0,1,2].map(i=>B.stand(shirtP(`k-shirt${i}`,.42,INK.red),-4.3+i*.55,-.4,{layer:2,s:0}));
  const kids=[[1.5,1.0,'#d99a6c','curly'],[2.5,1.7,'#f1b88f','bun'],[3.4,.9,'#7f5138','short'],[2.4,.55,'#b27650','long']].map(([x,z,sk,hr],i)=>B.person(K+`k-kid${i}`,x as number,z as number,1.0,{shirt:i%2?'bib':'casual',skin:sk as string,hair:hr as 'short',legs:i===0?'kick':undefined,face:'grin',layer:3}));
  const balkanKids=[[-2.9,1.4],[-2.2,1.9]].map(([x,z],i)=>B.person(K+`k-bk${i}`,x,z,1.0,{shirt:'fan',skin:SK[i*2+1],hair:i?'bun':'short',hairColor:'#3b2e3f',face:'grin',layer:3}));
  const ball=ballPair(B,'k-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,17.2):b.t;
   Zm.body.s=beat(t,2.6,3.4);tag.s=beat(t,3,3.7)*(1-beat(t,12,12.6));Zm.armR.rot=.12+1.7*beat(t,6.4,7)-1.7*beat(t,9.6,10.2);
   matL.s=beat(t,11,12.6);courtSign.s=beat(t,11.8,12.6);
   posts.forEach((p,i)=>{p.s=beat(t,14.2+i*.3,14.9+i*.3);});lights.forEach((p,i)=>{p.s=beat(t,15.2+i*.3,16+i*.3);});fence.s=beat(t,16.2,17);listC.s=beat(t,13.4,14.1)*(1-beat(t,19.2,19.8));
   const on=Math.max(beat(t,17.8,18.6),manual?beat(act,0,.6):0);beams.forEach((q,i)=>show(q,beat(on,i*.3,.7+i*.3)));stars.scale=1-.5*on;moon.scale=1;
   kitSign.s=beat(t,19.6,20.4);shirts.forEach((q,i)=>{q.s=beat(t,21+i*.4,21.6+i*.4);q.rot=.08*wave(t,21.6+i*.4,24,1.2);});balkanKids.forEach((p,i)=>{p.body.s=beat(t,22.4+i*.4,23+i*.4);cheer(p,beat(t,23.6+i*.3,24.2+i*.3)*(1-beat(t,26,26.6))+beat(t,32,32.6));});
   kids.forEach((p,i)=>{p.body.s=Math.max(beat(t,25+i*.4,25.7+i*.4),manual?beat(act,.6+i*.08,.8+i*.08):0);});
   let [bx,bz,dy]=track(t,[[0,1.8,1.25,0],[26.6,1.8,1.25,0],[27.4,2.5,.8,.2],[28.2,3.2,1.1,0],[29,4.0,.4,.25],[29.8,2.6,1.4,0]]);if(manual)[bx,bz,dy]=track(act,[[.7,1.8,1.25,0],[1,3.9,.4,.25]]);ball(bx,bz,dy,t>25.4||manual);
   kids[0].leg!.rot=-1*Math.max(pulse(t,26.3,26.9),manual?pulse(act,.68,.8):0);
   cheer(Zm,Math.max(beat(t,30,30.6),manual?beat(act,.8,1):0)*.8);kids.forEach((p,i)=>{if(t>31.4)cheer(p,beat(t,31.4+i*.2,32+i*.2));});
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,10.6,11.6)-.4*beat(t,19.2,20)+.4*beat(t,24.6,25.4):0;
  };
 }};

/* ───────────── 6 · Back at thirty-six (knee) ───────────── */
const knee:SpreadDef={id:'knee',rest:19.5,
 left:k=>{floorboards(k,-5,0,'#d8d2c4','#aaa292');water(k,-1.0,0,Z(1.0),PAGE_D);
  k.text('20 APRIL 2017',-2.9,Z(2.62),.38,INK.navy,{max:3.6});k.text('A VERY SERIOUS KNEE INJURY',-2.9,Z(2.9),.15,INK.navy,{weight:800,max:3.8});},
 right:k=>{pitch(k,0,5);water(k,0,1.0,Z(1.0),PAGE_D);boxLines(k,1.6,4.6,-2.1,1.0);
  k.text('BACK · 18 NOVEMBER 2017',3.05,Z(2.62),.27,INK.navy,{max:3.7});k.text('AT FORTY: ITALIAN CHAMPION',3.05,Z(2.9),.15,INK.navy,{weight:800,max:3.8});},
 build:B=>{
  const bd=B.vfold({key:K+'n-bdL',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#dfe6ec');k.dots(p,INK.sky,.05,.2);const win=rect(.4,.5,1.5,1.1);k.fill(win,'#9aa3bd');k.key(win,.03,INK.white);k.key('M1.15 .5 L1.15 1.6',.03,INK.white);k.fill(rect(0,2.3,4.5,.7),'#c9c2b2');}},
   {key:K+'n-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);crowd(k,4.5,1.2,2.5,[INK.red,INK.navy,INK.white,INK.red,INK.navy],3);lightRig(k,1.2,.3);lightRig(k,3.6,.35);k.fill(rect(0,2.5,4.5,.5),INK.grass);}},-3.05,1.22);
  const rain=bd.add(stormCloud('n-rain',1.3,.66),'L',2.4,2.2,{out:.03}),sun=bd.add(S.sun(K+'n-sun',.34),'R',3.8,2.2,{out:.012});
  const fw=[bd.add(S.firework(K+'n-fw1',.36,INK.red),'R',1.2,1.0,{out:.03}),bd.add(S.firework(K+'n-fw2',.34,INK.yellow),'R',3.0,1.2,{out:.03})];
  const Zi=B.person(K+'n-zlatan',-2.2,.6,1.4,{shirt:'ger',...ZMAN,number:'9',adult:true,face:'shy',layer:2});
  const benchP=B.stand(S.bench(K+'n-bench',1.1,.45),-2.2,.95,{layer:3});void benchP;
  const cr=B.stand(crutch('n-crutch',.3,1.2),-1.35,.8,{layer:3,s:0});
  const kneeC=B.stand(S.flipCard(K+'n-knee',1.1,.3,'RIGHT KNEE',INK.white,INK.navy),-3.5,1.8,{layer:3,s:0}),age35=B.stand(S.flipCard(K+'n-35',.7,.34,'AGE 35',INK.pink),-4.3,.6,{layer:2,s:0});
  const cal=B.stand(calendar('n-cal',1.1,1.3,'2017'),-3.9,-1.4,{layer:1});
  cal.add(S.flipCard(K+'n-nov',.9,.44,'NOV',INK.grass),0,.35,{z:.012});
  const months=['OCT','SEP','AUG','JUL','JUN','MAY','APR'].map((m,i)=>cal.flap(S.flipCard(K+`n-m${m}`,.9,.44,m,i%2?INK.blue:'#3d5da0'),0,.79,{z:.016+i*.004}));
  const work=B.stand(S.flipCard(K+'n-work',1.2,.3,'HARD WORK',INK.yellow,INK.navy),-1.4,-1.0,{layer:1,s:0});
  const deckL=B.flat(S.bridgeDeck(K+'n-deckL',.96,1.25),-.98,1.95,{edge:'left',hinge:-1.45}),deckR=B.flat(S.bridgeDeck(K+'n-deckR',.96,1.25),.98,1.95,{edge:'right',hinge:1.45});
  const Zb=B.person(K+'n-back',1.7,1.1,1.4,{shirt:'ger',...ZMAN,number:'10',adult:true,legs:'kick',face:'grin',layer:3});
  const back=B.stand(S.flipCard(K+'n-backc',1.4,.3,'18 NOV 2017',INK.pink),1.9,1.9,{layer:3,s:0});
  const goalP=B.stand(S.goal(K+'n-goal',1.6,.85),3.1,-1.8,{layer:1});void goalP;
  const Zmil=B.person(K+'n-milan',3.3,.3,1.4,{shirt:'navy',...ZMAN,number:'11',adult:true,face:'grin',layer:2});
  const c39=B.stand(lineCard('n-39',1.4,.44,['AT 39: SCORED'],INK.white),2.3,-.6,{layer:2,s:0}),c40=B.stand(lineCard('n-40',1.4,.44,['AT 40: CHAMPIONS'],INK.yellow),4.1,-.55,{layer:2,s:0});
  const trophy=B.stand(S.trophy(K+'n-trophy',.5,.85),4.3,.9,{layer:3,s:0});
  const mates=[[2.6,1.4,'#7f5138'],[4.2,1.7,'#f1b88f']].map(([x,z,sk],i)=>B.person(K+`n-mate${i}`,x as number,z as number,1.3,{shirt:'navy',skin:sk as string,hair:i?'curly':'short',adult:true,face:'grin',layer:3}));
  const ball=ballPair(B,'n-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,19.5):b.t;
   Zi.body.s=beat(t,2.2,3);const hurt=beat(t,6,7)*(1-Math.max(beat(t,20,21),manual?beat(act,.2,.6):0));rain.scale=hurt;rain.visible=hurt>.02;rain.dx=.15*wave(t,7,19,.3);
   kneeC.s=beat(t,7,7.7)*(1-beat(t,19.6,20.2));cr.s=beat(t,8.2,8.9)*(1-Math.max(beat(t,18.6,19.2),manual?1:0));age35.s=beat(t,11.6,12.3)*(1-beat(t,19.6,20.2));
   months.forEach((m,i)=>{m.flip=-3.2*beat(t,14.4+(6-i)*.65,14.9+(6-i)*.65);});
   work.s=beat(t,14.6,15.3)*(1-beat(t,20,20.6));Zi.armR.rot=.12+1.4*Math.abs(Math.sin((t-14.6)*2.4))*(t>14.6&&t<19?1:0);Zi.armL.rot=-.12-1.4*Math.abs(Math.sin((t-14.6)*2.4))*(t>14.6&&t<19?1:0);
   const unfold=Math.max(beat(t,20,21.6),manual?beat(act,0,.6):0);deckL.s=unfold;deckR.s=unfold;
   Zi.body.x=-2.2+.9*Math.max(beat(t,21.6,22.6),manual?beat(act,.55,.75):0);Zi.body.s=beat(t,2.2,3)*(1-Math.max(beat(t,22.4,22.9),manual?beat(act,.7,.8):0));
   Zb.body.s=Math.max(beat(t,22.6,23.3),manual?beat(act,.75,.95):0);back.s=Math.max(beat(t,17.6,18.4)*(1-beat(t,19.4,19.8))+beat(t,23,23.7),manual?beat(act,.85,1):0);
   let [bx,bz,dy]=track(t,[[0,2.0,1.25,0],[23.6,2.0,1.25,0],[24.4,3.1,-1.4,.3],[25,3.1,-1.4,0],[27,3.1,-1.4,0],[27.8,3.4,.5,0]]);ball(bx,bz,dy,t>23.2||manual);Zb.leg!.rot=-1.1*Math.max(pulse(t,23.3,23.9),manual?pulse(act,.85,1):0);
   cheer(Zb,Math.max(beat(t,24.2,24.8)*(1-beat(t,26,26.6)),manual?beat(act,.95,1):0));
   Zmil.body.s=beat(t,25,25.8);c39.s=beat(t,26.6,27.3);c40.s=beat(t,30.4,31.1);trophy.s=beat(t,31,31.8);mates.forEach((p,i)=>{p.body.s=beat(t,31.2+i*.4,32+i*.4);cheer(p,beat(t,32.4+i*.3,33+i*.3));});
   cheer(Zmil,beat(t,31.6,32.2));fw.forEach((f,i)=>{const a=beat(t,32+i*.5,33+i*.5);f.scale=a;f.visible=a>.02;f.rot=t*.2;});sun.dy=.5*beat(t,21,23);
   return b.narrated?-.4*beat(t,1.6,2.6)+.4*beat(t,19.4,20.2)+.45*beat(t,22.2,23)-.45*beat(t,34,35):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={rosengard,dinner,clothes,port,court,knee};
