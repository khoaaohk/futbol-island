/**
 * The six Rashford pop-up spreads (remember where you came from): original riso paper artwork and narration-timed paper mechanics.
 * pose(beat) is a pure function of Coach Bella's narration time (public/voice/books/rashford/narration.json)
 * and the reader's action (0–1), so pause, seek, replay and manual play show the same paper state.
 * Hardship is shown gently and symbolically: an empty plate, a storm cloud, a closed school door, grey scribbles
 * over a mural that neighbours cover with hearts. Kits are plain colours with no crests.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from '../popupPlates';
import * as S from '../popupScenery';
import {type SpreadDef,type Beat,type Builder,type Part,type Person,beat,pulse,wave,smooth,clamp01,PAGE_D} from '../popupEngine';

const D2=PAGE_D/2,Z=(z:number)=>z+D2,K='rashford-';
const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
/** Piecewise eased keyframes [t, ...values]. */
const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
const show=(q:Part,v:number)=>{q.scale=v;q.visible=v>.02;};
const cheer=(p:Person,a:number,extra=0)=>{p.armL.rot=-.12-2.3*a-extra;p.armR.rot=.12+2.3*a+extra;};
const MARCUS={skin:'#7f5138',hair:'short' as const,hairColor:'#1d1a22'};
const MUM={skin:'#7f5138',hair:'bun' as const,hairColor:'#1d1a22'};
const SK=['#7f5138','#b27650','#d99a6c','#f1b88f','#e8b48f'];

/* ───────────── page print helpers (solid ink: key lines don't read on prints) ───────────── */
function bar(k:Kit,x0:number,y0:number,x1:number,y1:number,w:number,c:string){const L=Math.hypot(x1-x0,y1-y0)||1,nx=-(y1-y0)/L*w/2,ny=(x1-x0)/L*w/2;k.fill(poly([[x0+nx,y0+ny],[x1+nx,y1+ny],[x1-nx,y1-ny],[x0-nx,y0-ny]]),c);}
function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,.85);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
function pavement(k:Kit,x0:number,x1:number,tone='#c9c3b6',line='#a39c8c'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,line,.06,.16);for(let y=.6;y<PAGE_D;y+=.6)bar(k,x0,y,x1,y,.02,line);for(let x=x0+.6;x<x1;x+=.6)for(let y=0;y<PAGE_D;y+=1.2)bar(k,x,y,x,y+.6,.02,line);}
function road(k:Kit,x0:number,x1:number,y:number,w=.8){const r=rect(x0,y-w/2,x1-x0,w);k.fill(r,'#6f7282');k.dots(r,'#4d5060',.05,.3);for(let x=x0+.1;x<x1-.3;x+=.5)bar(k,x,y,x+.28,y,.05,INK.white);bar(k,x0,y-w/2,x1,y-w/2,.04,INK.white);bar(k,x0,y+w/2,x1,y+w/2,.04,INK.white);}
function tiles(k:Kit,x0:number,x1:number){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,'#efe0bd');for(let x=x0;x<x1;x+=.5)for(let y=0;y<PAGE_D;y+=.5)if(((x-x0)/.5+y/.5)%2<1)k.fill(rect(x,y,.5,.5),'#d9c39a');}
function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.35);}}

/* ───────────── backdrop helpers ───────────── */
function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
function terraces(k:Kit,w:number,base:number,seed=1){for(let i=0;i<Math.ceil(w/.62);i++){const x=i*.62,h=1.05+((i+seed)%2)*.08,b=rect(x,base-h,.6,h);k.fill(b,i%2?'#b5563f':'#c0634a');k.hatch(b,'#8a3a2a',.07,0,.006);k.key(b,.01);
 const roof=poly([[x-.02,base-h],[x+.3,base-h-.22],[x+.62,base-h]]);k.fill(roof,'#4f5770');k.key(roof,.01);k.fill(rect(x+.4,base-h-.3,.08,.16),'#6b4a3a');
 for(const [wx,wy] of [[.08,.25],[.36,.25],[.08,.62]])k.fill(rect(x+wx,base-h+wy,.16,.2),(i*3+wx*10)%3<1?INK.yellow:INK.sky2);k.fill(rect(x+.38,base-h+.62,.14,.43),INK.navy);}}
function nightSky(k:Kit,w:number,h:number){const p=rect(0,0,w,h);k.fill(p,INK.night);k.dots(p,INK.blue,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
function brickWall(k:Kit,x:number,y:number,w:number,h:number){const b=rect(x,y,w,h);k.fill(b,'#c46a4f');for(let r=0;r*.14<h;r++)for(let c=-1;c*.3<w;c++){const bx=x+c*.3+(r%2)*.15,by=y+r*.14;if(bx<x-.2||bx>x+w)continue;k.key(rect(Math.max(x,bx),by,.3,.14),.006,'#8a3a2a');}k.key(b,.012);}

/* ───────────── book-specific plates ───────────── */
const stormCloud=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.78],[0,h*.5],[w*.16,h*.28],[w*.32,h*.06],[w*.56,0],[w*.74,h*.18],[w*.92,h*.26],[w,h*.58],[w*.88,h*.78]]);k.fill(p,'#8d93a8');k.hatch(p,INK.navy,.05,-.5,.01);k.key(p,.014);
 for(let i=0;i<4;i++){const x=w*(.22+i*.19),y=h*.84;k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02});
const lineCard=(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26/Math.max(1,n*.62),ink,{max:w*.86,weight:900}));},{rim:.018});
const heart=(key:string,s:number,c:string=INK.pink)=>sp(key,s,s,k=>{const p=`M${s/2} ${s*.9} C${s*.05} ${s*.55} ${s*.02} ${s*.1} ${s/2} ${s*.3} C${s*.98} ${s*.1} ${s*.95} ${s*.55} ${s/2} ${s*.9} Z`;k.fill(p,c);k.dots(p,INK.navy,.03,.2);k.key(p,.012);},{rim:.015});
const terrace=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const b=rect(0,h*.22,w,h*.78);k.fill(b,c);k.hatch(b,'#8a3a2a',.07,0,.007);k.key(b,.014);const roof=poly([[-.04,h*.24],[w*.5,0],[w+.04,h*.24]]);k.fill(roof,'#4f5770');k.hatch(roof,INK.navy,.05,.5,.008);k.key(roof,.012);
 k.fill(rect(w*.7,h*.02,w*.09,h*.14),'#6b4a3a');for(const [x,y] of [[.12,.35],[.56,.35],[.12,.62]]){const wn=rect(w*x,h*y,w*.3,h*.18);k.fill(wn,INK.yellow);k.key(wn,.01);k.key(`M${w*(x+.15)} ${h*y} L${w*(x+.15)} ${h*(y+.18)}`,.008);}
 const d=rect(w*.6,h*.62,w*.22,h*.38);k.fill(d,INK.navy);k.key(d,.012);k.circle(w*.78,h*.8,.018,INK.gold);k.fill(rect(w*.57,h*.97,w*.28,h*.03),INK.stone);});
const table=(key:string,w:number,h:number,plates:number)=>sp(key,w,h,k=>{const top=poly([[w*.04,h*.18],[w*.96,h*.18],[w,h*.34],[0,h*.34]]);k.fill(top,INK.wood);k.dots(top,INK.brown,.04,.3);k.key(top,.012);k.fill(rect(0,h*.34,w,h*.08),'#94583a');k.key(rect(0,h*.34,w,h*.08),.01);
 for(const x of [.06,.9])k.keyFill(rect(w*x,h*.42,w*.04,h*.58),INK.brown);
 for(let i=0;i<plates;i++){const x=w*(.12+i*(.76/Math.max(1,plates-1)));k.fill(ell(x,h*.25,w*.055,h*.05),INK.white);k.key(ell(x,h*.25,w*.055,h*.05),.008);}});
const food=(key:string,s:number)=>sp(key,s*1.6,s,k=>{const w=s*1.6;k.fill(ell(w/2,s*.78,w*.48,s*.2),INK.white);k.key(ell(w/2,s*.78,w*.48,s*.2),.01);k.fill(ell(w*.36,s*.6,w*.16,s*.2),INK.orange);k.fill(ell(w*.62,s*.58,w*.18,s*.18),INK.grass);k.fill(ell(w*.5,s*.5,w*.14,s*.18),INK.yellow);k.key(ell(w*.5,s*.5,w*.14,s*.18),.008);},{rim:.012});
const cloche=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const d=`M0 ${h} Q0 ${h*.1} ${w/2} ${h*.1} Q${w} ${h*.1} ${w} ${h} Z`;k.fill(d,'#cfd6e6');k.dots(d,INK.blue,.035,(x,y)=>.1+x/w*.3);k.key(d,.014);k.fill(ell(w/2,h*.1,w*.08,h*.08),INK.gold);k.key(ell(w/2,h*.1,w*.08,h*.08),.01);k.fill(rect(-.02,h*.92,w+.04,h*.08),INK.grey);k.text('LIFT',w/2,h*.7,h*.2,INK.navy,{weight:900});},{rim:.015});
const jar=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const j=`M${w*.2} ${h*.12} L${w*.8} ${h*.12} L${w*.86} ${h*.3} L${w*.86} ${h} L${w*.14} ${h} L${w*.14} ${h*.3} Z`;k.fill(j,INK.sky2,.9);k.dots(j,INK.sky,.03,.3);k.key(j,.014);k.fill(rect(w*.16,0,w*.68,h*.13),INK.brown);k.key(rect(w*.16,0,w*.68,h*.13),.012);k.fill(ell(w*.5,h*.93,w*.12,h*.035),INK.gold);k.key(ell(w*.5,h*.93,w*.12,h*.035),.008);});
const clock=(key:string,r:number)=>sp(key,r*2,r*2,k=>{k.fill(ell(r,r,r,r),INK.white);k.key(ell(r,r,r,r),.02);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;k.fill(ell(r+Math.cos(a)*r*.78,r+Math.sin(a)*r*.78,r*.06,r*.06),INK.navy);}},{rim:.015});
const hand=(key:string,l:number)=>sp(key,.05,l,k=>{k.fill(rect(0,0,.05,l),INK.red);},{rim:0});
const car=(key:string,w:number,h:number,c:string,kid=false)=>sp(key,w,h,k=>{const body=`M0 ${h*.8} L0 ${h*.5} L${w*.2} ${h*.45} L${w*.32} ${h*.12} L${w*.72} ${h*.12} L${w*.86} ${h*.45} L${w} ${h*.52} L${w} ${h*.8} Z`;k.fill(body,c);k.dots(body,INK.navy,.035,.2);k.key(body,.014);
 k.fill(poly([[w*.36,h*.18],[w*.5,h*.18],[w*.5,h*.44],[w*.26,h*.44]]),INK.sky2);k.fill(poly([[w*.54,h*.18],[w*.7,h*.18],[w*.8,h*.44],[w*.54,h*.44]]),INK.sky2);
 if(kid){k.fill(ell(w*.62,h*.34,w*.05,h*.09),'#7f5138');k.fill(`M${w*.57} ${h*.3} Q${w*.62} ${h*.2} ${w*.67} ${h*.3} Z`,'#1d1a22');k.fill(ell(w*.42,h*.33,w*.055,h*.1),'#f1b88f');k.fill(`M${w*.365} ${h*.3} Q${w*.42} ${h*.19} ${w*.475} ${h*.3} Z`,'#6b4a2f');}
 for(const x of [.22,.78]){k.fill(ell(w*x,h*.82,h*.17,h*.17),INK.navy);k.circle(w*x,h*.82,h*.07,INK.grey);}});
const workDoor=(key:string,w:number,h:number,label:string,c:string)=>sp(key,w,h,k=>{const b=rect(0,h*.2,w,h*.8);k.fill(b,c);k.dots(b,INK.navy,.035,.2);k.key(b,.014);const s=rect(w*.08,0,w*.84,h*.2);k.fill(s,INK.white);k.key(s,.01);k.text(label,w/2,h*.15,h*.12,INK.navy,{max:w*.8,weight:900});
 const d=rect(w*.32,h*.5,w*.36,h*.5);k.fill(d,INK.navy);k.key(d,.012);k.fill(rect(w*.12,h*.3,w*.2,h*.14),INK.yellow);k.fill(rect(w*.68,h*.3,w*.2,h*.14),INK.yellow);});
const trainGround=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.keyFill(rect(w*.08,h*.3,w*.05,h*.7),INK.grey);k.keyFill(rect(w*.87,h*.3,w*.05,h*.7),INK.grey);const s=rect(0,0,w,h*.32);k.fill(s,INK.red);k.dots(s,INK.navy,.035,.2);k.key(s,.014);k.text('TRAINING',w/2,h*.2,h*.14,INK.white,{max:w*.86,weight:900});
 for(let i=0;i<9;i++)k.key(`M${w*(.13+i*.093)} ${h*.4} L${w*(.13+i*.093)} ${h}`,.012,INK.grey);k.key(`M${w*.13} ${h*.55} L${w*.87} ${h*.55}`,.012,INK.grey);});
const school=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.3,w,h*.7);k.fill(b,'#f6e4c0');k.dots(b,INK.orange,.04,.18);k.key(b,.014);const roof=poly([[-.05,h*.32],[w/2,h*.08],[w+.05,h*.32]]);k.fill(roof,INK.blue);k.key(roof,.014);
 for(let i=0;i<4;i++){const wx=w*(.06+i*.25);if(i===1||i===2)continue;k.fill(rect(wx,h*.45,w*.16,h*.18),INK.sky);k.key(rect(wx,h*.45,w*.16,h*.18),.01);}
 const d=rect(w*.34,h*.62,w*.32,h*.38);k.fill(d,'#3a2a2a');k.key(d,.012);const s=rect(w*.2,h*.33,w*.6,h*.1);k.fill(s,INK.white);k.key(s,.01);k.text('SCHOOL',w/2,h*.41,h*.075,INK.navy,{max:w*.55});});
const doorLeaf=(key:string,w:number,h:number,c:string)=>sp(key,w,h,k=>{const d=rect(0,0,w,h);k.fill(d,c);k.dots(d,INK.navy,.03,.25);k.key(d,.012);k.fill(rect(w*.15,h*.1,w*.7,h*.3),INK.sky2);k.key(rect(w*.15,h*.1,w*.7,h*.3),.01);k.circle(w*.82,h*.6,.02,INK.gold);},{rim:.012});
const tray=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.teal);k.key(b,.014);k.fill(rect(w*.06,h*.1,w*.4,h*.5),INK.white);k.fill(ell(w*.26,h*.35,w*.12,h*.15),INK.orange);k.fill(rect(w*.54,h*.1,w*.4,h*.5),INK.white);k.fill(ell(w*.74,h*.35,w*.13,h*.13),INK.grass);k.fill(rect(w*.3,h*.66,w*.4,h*.24),INK.yellow);k.key(b,.012);
 k.text('SCHOOL MEALS',w/2,h*.87,h*.13,INK.navy,{max:w*.6,weight:900});},{rim:.015});
const van=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const body=`M0 ${h*.82} L0 ${h*.12} L${w*.7} ${h*.12} L${w*.7} ${h*.3} L${w*.88} ${h*.3} L${w} ${h*.55} L${w} ${h*.82} Z`;k.fill(body,INK.white);k.dots(body,INK.sky,.035,.25);k.key(body,.014);k.fill(rect(0,h*.46,w*.7,h*.12),INK.green);k.text('FARESHARE',w*.35,h*.4,h*.16,INK.green,{max:w*.62,weight:900});
 k.fill(poly([[w*.74,h*.36],[w*.87,h*.36],[w*.95,h*.55],[w*.74,h*.55]]),INK.sky2);for(const x of [.2,.8]){k.fill(ell(w*x,h*.84,h*.15,h*.15),INK.navy);k.circle(w*x,h*.84,h*.06,INK.grey);}});
const boxP=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#d7a86a');k.dots(b,INK.brown,.035,.3);k.key(b,.014);k.fill(rect(w*.44,0,w*.12,h),'#c49155');k.fill(heartPath(w*.5,h*.55,h*.28),INK.pink);},{rim:.015});
function heartPath(cx:number,cy:number,s:number){return `M${cx} ${cy+s*.45} C${cx-s*.9} ${cy-s*.1} ${cx-s*.4} ${cy-s*.8} ${cx} ${cy-s*.25} C${cx+s*.4} ${cy-s*.8} ${cx+s*.9} ${cy-s*.1} ${cx} ${cy+s*.45} Z`;}
const lid=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#c49155');k.dots(b,INK.brown,.035,.35);k.key(b,.012);},{rim:.012});
const groceries=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.fill(rect(w*.05,h*.25,w*.24,h*.75),INK.white);k.fill(rect(w*.05,h*.25,w*.24,h*.18),INK.blue);k.key(rect(w*.05,h*.25,w*.24,h*.75),.01);k.fill(ell(w*.5,h*.62,w*.17,h*.26),INK.red);k.key(ell(w*.5,h*.62,w*.17,h*.26),.01);k.fill(`M${w*.66} ${h} L${w*.7} ${h*.3} Q${w*.82} ${h*.1} ${w*.94} ${h*.3} L${w*.98} ${h} Z`,'#e0b36a');k.key(`M${w*.66} ${h} L${w*.7} ${h*.3} Q${w*.82} ${h*.1} ${w*.94} ${h*.3} L${w*.98} ${h} Z`,.01);},{rim:.012});
const desk=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const top=rect(0,h*.2,w,h*.12);k.fill(top,INK.wood);k.dots(top,INK.brown,.035,.3);k.key(top,.012);for(const x of [.04,.88])k.keyFill(rect(w*x,h*.32,w*.08,h*.68),INK.brown);k.fill(rect(w*.3,h*.32,w*.4,h*.2),'#94583a');k.key(rect(w*.3,h*.32,w*.4,h*.2),.01);
 k.fill(rect(w*.72,0,w*.06,h*.2),INK.grey);k.fill(poly([[w*.64,0],[w*.86,0],[w*.8,h*.06],[w*.7,h*.06]]),INK.yellow);});
const letter=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.012);k.text('DEAR GOVERNMENT',w/2,h*.15,h*.075,INK.navy,{max:w*.84,weight:900});k.text('PLEASE HELP',w/2,h*.33,h*.09,INK.red,{max:w*.84,weight:900});k.text('END CHILD',w/2,h*.47,h*.1,INK.red,{max:w*.84,weight:900});k.text('POVERTY',w/2,h*.61,h*.1,INK.red,{max:w*.84,weight:900});
 for(let i=0;i<3;i++)k.fill(rect(w*.12,h*(.7+i*.07),w*(i===2?.4:.76),h*.02),INK.grey);k.text('MARCUS',w*.7,h*.95,h*.07,INK.navy,{max:w*.4,weight:900});},{rim:.015});
const envelope=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.012);k.key(`M0 0 L${w/2} ${h*.55} L${w} 0`,.012);k.fill(rect(w*.72,h*.1,w*.18,h*.28),INK.red);},{rim:.012});
const postbox=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=`M0 ${h} L0 ${w*.5} Q0 0 ${w/2} 0 Q${w} 0 ${w} ${w*.5} L${w} ${h} Z`;k.fill(b,INK.red);k.dots(b,'#9c2e25',.035,.3);k.key(b,.014);k.fill(rect(w*.18,h*.24,w*.64,h*.06),INK.navy);k.fill(rect(w*.25,h*.38,w*.5,h*.16),INK.white);k.key(rect(w*.25,h*.38,w*.5,h*.16),.008);k.text('POST',w/2,h*.5,h*.1,INK.red,{weight:900});k.fill(rect(-.02,h*.92,w+.04,h*.08),'#2b2b33');});
const govt=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.3,w,h*.7);k.fill(b,'#e7dcc2');k.dots(b,INK.grey,.04,.3);k.key(b,.014);const ped=poly([[-.05,h*.32],[w/2,h*.08],[w+.05,h*.32]]);k.fill(ped,'#d3c6a6');k.key(ped,.014);
 for(let i=0;i<6;i++){const x=w*(.08+i*.16);k.fill(rect(x,h*.36,w*.06,h*.56),INK.white);k.key(rect(x,h*.36,w*.06,h*.56),.008);}k.fill(rect(0,h*.92,w,h*.08),'#bfb297');k.key(rect(0,h*.92,w,h*.08),.01);
 const s=rect(w*.2,h*.22,w*.6,h*.09);k.fill(s,INK.navy);k.text('GOVERNMENT',w/2,h*.29,h*.065,INK.white,{max:w*.56,weight:900});const d=rect(w*.4,h*.6,w*.2,h*.32);k.fill(d,'#3a2a2a');k.key(d,.012);});
const warehouse=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,h*.28,w,h*.72);k.fill(b,'#9fb3c8');for(let x=0;x<w;x+=.12)k.key(`M${x} ${h*.3} L${x} ${h}`,.008,'#6d819a');k.key(b,.014);const roof=poly([[-.04,h*.3],[w*.5,h*.12],[w+.04,h*.3]]);k.fill(roof,INK.grey);k.key(roof,.012);
 const d=rect(w*.3,h*.55,w*.4,h*.45);k.fill(d,'#6d819a');for(let y=h*.58;y<h;y+=.06)k.key(`M${w*.3} ${y} L${w*.7} ${y}`,.008,INK.navy);k.fill(heartPath(w*.5,h*.4,h*.14),INK.pink);});
const kidsRow=(key:string,w:number,h:number,n:number,seed=0)=>sp(key,w,h,k=>{for(let i=0;i<n;i++){const x=w*(i+.5)/n,s=h*(.8+((i*7+seed)%3)*.1),c=[INK.yellow,INK.sky,INK.pink,INK.orange,INK.grass][(i+seed)%5],sk=SK[(i*3+seed)%5];
 k.fill(`M${x-s*.22} ${h} L${x-s*.2} ${h-s*.55} Q${x} ${h-s*.68} ${x+s*.2} ${h-s*.55} L${x+s*.22} ${h} Z`,c);k.key(`M${x-s*.22} ${h} L${x-s*.2} ${h-s*.55} Q${x} ${h-s*.68} ${x+s*.2} ${h-s*.55} L${x+s*.22} ${h}`,.01);k.fill(ell(x,h-s*.78,s*.15,s*.17),sk);k.key(ell(x,h-s*.78,s*.15,s*.17),.01);k.fill(`M${x-s*.15} ${h-s*.8} Q${x} ${h-s*1.02} ${x+s*.15} ${h-s*.8} Z`,'#2e2230');}},{rim:.015});
const mural=(key:string,w:number,h:number)=>sp(key,w,h,k=>{brickWall(k,0,0,w,h);const f=rect(w*.12,h*.08,w*.76,h*.8);k.fill(f,INK.sky2);k.dots(f,INK.blue,.04,(x,y)=>.3-y/h*.25);k.key(f,.014);
 const cx=w/2,cy=h*.42,r=w*.17;k.fill(`M${cx-w*.3} ${h*.88} Q${cx} ${h*.52} ${cx+w*.3} ${h*.88} Z`,INK.red);k.key(`M${cx-w*.3} ${h*.88} Q${cx} ${h*.52} ${cx+w*.3} ${h*.88}`,.012);k.fill(ell(cx,cy,r,r*1.18),'#7f5138');k.key(ell(cx,cy,r,r*1.18),.014);
 k.fill(`M${cx-r} ${cy-r*.45} Q${cx} ${cy-r*1.55} ${cx+r} ${cy-r*.45} Q${cx} ${cy-r*.9} ${cx-r} ${cy-r*.45} Z`,'#1d1a22');k.circle(cx-r*.38,cy,r*.1,INK.white);k.circle(cx+r*.38,cy,r*.1,INK.white);k.circle(cx-r*.38,cy,r*.05,INK.navy,true);k.circle(cx+r*.38,cy,r*.05,INK.navy,true);k.key(`M${cx-r*.4} ${cy+r*.5} Q${cx} ${cy+r*.75} ${cx+r*.4} ${cy+r*.5}`,.016);
 const pl=rect(w*.25,h*.9,w*.5,h*.08);k.fill(pl,INK.navy);k.text('MARCUS',w/2,h*.965,h*.06,INK.yellow,{max:w*.46,weight:900});});
const scribble=(key:string,w:number,h:number,seed=1)=>sp(key,w,h,k=>{for(let i=0;i<5;i++){const y=h*(.15+i*.17),o=((i*7+seed)%3)*.05;k.key(`M${w*(.05+o)} ${y} Q${w*.3} ${y-h*.14} ${w*.5} ${y} T${w*(.95-o)} ${y}`,.045,'#4a4d5c');}},{rim:0});
const phone=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,'#2b2b33');k.key(b,.014);const s=rect(w*.08,h*.08,w*.84,h*.8);k.fill(s,'#5d6275');for(let i=0;i<3;i++){const y=h*(.14+i*.24),x=i%2?w*.3:w*.14;const bb=rect(x,y,w*.56,h*.16);k.fill(bb,'#3a3d4b');k.key(bb,.008,'#8d93a8');k.text('# ! ?',x+w*.28,y+h*.12,h*.09,'#b8bccb',{weight:900});}k.circle(w/2,h*.94,w*.05,INK.grey);},{rim:.015});
const grownUpCard=(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.yellow);k.dots(b,INK.orange,.035,.2);k.key(b,.013);k.text('TELL A',w/2,h*.42,h*.26,INK.navy,{max:w*.86,weight:900});k.text('GROWN-UP',w/2,h*.8,h*.26,INK.navy,{max:w*.86,weight:900});},{rim:.015});
const paintBrush=(key:string,w:number,h:number)=>sp(key,w,h,k=>{k.fill(rect(w*.4,h*.35,w*.2,h*.65),INK.wood);k.key(rect(w*.4,h*.35,w*.2,h*.65),.01);k.fill(rect(w*.3,h*.25,w*.4,h*.12),INK.grey);k.fill(`M${w*.3} ${h*.25} L${w*.2} 0 L${w*.8} 0 L${w*.7} ${h*.25} Z`,INK.pink);k.key(`M${w*.3} ${h*.25} L${w*.2} 0 L${w*.8} 0 L${w*.7} ${h*.25} Z`,.01);},{rim:.012});
const pow=(key:string,r:number,c:string=INK.yellow)=>sp(key,r*2,r*2,k=>{const pts=Array.from({length:16},(_,i)=>{const a=i/16*Math.PI*2,rr=i%2?r*.5:r;return [r+Math.cos(a)*rr,r+Math.sin(a)*rr];});k.fill(poly(pts),c);k.dots(poly(pts),INK.orange,.03,.4);k.key(poly(pts),.012);},{rim:.02});
const cal=(key:string,w:number,h:number,label:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.013);k.fill(rect(0,0,w,h*.28),INK.red);for(const x of [.25,.75])k.fill(rect(w*x-.02,-.02,.04,h*.12),INK.navy);k.text(label,w/2,h*.75,h*.34,INK.navy,{max:w*.86,weight:900});
 for(let i=0;i<6;i++)k.fill(rect(w*(.1+i*.14),h*.36,w*.08,h*.08),INK.grey);},{rim:.015});

/* ───────────── shared mechanics ───────────── */
function ballPair(B:Builder,key:string,r=.12){const L=B.stand(S.ball(K+key,r),-1,1,{layer:3,tab:false}),R=B.stand(S.ball(K+key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}

/* ───────────── 1 · A mum who worked so hard (mum) ───────────── */
const mum:SpreadDef={id:'mum',rest:25.2,
 left:k=>{pavement(k,-5,0);road(k,-5,0,Z(-.3),.8);footprints(k,-4.4,Z(1.6),-.5,Z(1.2),10,INK.navy);
  k.text('MANCHESTER',-2.5,Z(2.62),.46,INK.red,{max:4});k.text('1997 · THE YOUNGEST OF FIVE',-2.5,Z(2.9),.16,INK.navy,{weight:800,max:4});},
 right:k=>{tiles(k,0,5);k.fill(rect(0,0,5,.9),'#d9c39a');
  k.text('THE KITCHEN TABLE',2.5,Z(2.62),.36,INK.blue,{max:4.2});k.text('MUM MADE SURE THEY ATE',2.5,Z(2.9),.16,INK.navy,{weight:800,max:4});},
 build:B=>{
  const bd=B.vfold({key:K+'m-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9ccd9',INK.navy,y=>.28-y/3*.2);terraces(k,4.5,2.35,1);k.fill(rect(0,2.35,4.5,.65),'#9a9aa3');}},
   {key:K+'m-bdR',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#f3dfb4');k.dots(p,INK.orange,.05,.14);for(let x=.2;x<4.5;x+=.45)k.key(`M${x} 0 L${x} 3`,.006,'#d9b98a');
    const win=rect(.5,.5,1.3,1.0);k.fill(win,INK.sky2);k.dots(win,INK.sky,.05,.3);k.key(win,.03,INK.white);k.key('M1.15 .5 L1.15 1.5 M.5 1 L1.8 1',.03,INK.white);terraces(k,1.3,1.5,3);
    k.fill(rect(2.6,.9,1.5,.06),INK.brown);for(let i=0;i<4;i++)k.fill(ell(2.8+i*.36,.82,.12,.08),[INK.red,INK.yellow,INK.blue,INK.grass][i]);k.fill(rect(0,2.3,4.5,.7),'#e2cda2');}},-3.05,1.22);
  const rain=bd.add(stormCloud('m-rain',1.4,.7),'L',2.6,2.25,{out:.03}),sun=bd.add(S.sun(K+'m-sun',.32),'R',4.0,2.5,{out:.012});
  const clk=bd.add(clock('m-clock',.3),'R',2.0,2.22,{out:.02});const hH=bd.add(hand('m-hh',.17),'R',2.0,2.52,{out:.028}),hM=bd.add(hand('m-hm',.24),'R',2.0,2.52,{out:.032});
  const sign=B.stand(S.sign(K+'m-sign',1.2,1.2,'MANCHESTER',INK.white),-4.35,1.55,{layer:3});B.stand(S.lamp(K+'m-lamp',.3,1.5),-.45,-.9,{layer:1});B.stand(S.bush(K+'m-bush',.9,.45),-.7,1.9,{layer:3});B.stand(S.bench(K+'m-bench',.9,.4),4.35,2.0,{layer:3});const c97=sign.flap(S.flipCard(K+'m-1997',.9,.36,'1997',INK.red),0,1.2*.56,{z:.03});
  const house=B.stand(terrace('m-house',1.5,1.55,'#b5563f'),-3.9,-1.55,{layer:1});
  const work1=B.stand(workDoor('m-work1',1.0,1.0,'WORK',INK.sky),-2.3,-1.9,{layer:1,s:0});
  const kids=[[-4.1,.6,1.3],[-3.55,.9,1.25],[-3.0,.5,1.2],[-2.45,.85,1.12],[-1.75,1.25,.95]].map(([x,z,h],i)=>B.person(K+`m-kid${i}`,x,z,h,{shirt:(['casual','bib','fan','navy','casual'] as const)[i],skin:i===4?MARCUS.skin:SK[i%2],hair:(['short','long','short','bun','short'] as const)[i],hairColor:'#1d1a22',face:i===4?'grin':'smile',layer:2}));
  const five=B.stand(S.flipCard(K+'m-five',1.2,.34,'FIVE CHILDREN',INK.yellow,INK.navy),-2.9,2.0,{layer:3,s:0});
  const marcusTag=B.stand(S.flipCard(K+'m-tag',.9,.3,'MARCUS',INK.pink),-1.25,2.05,{layer:3,s:0});
  const mom=B.person(K+'m-mum',-1.2,-.3,1.62,{shirt:'coach',...MUM,adult:true,face:'smile',layer:2,holdR:'suitcase'});
  const jarP=B.stand(jar('m-jar',.5,.62),.55,-1.25,{layer:2,s:0});
  const tbl=B.stand(table('m-table',2.6,.95,5),2.55,.2,{layer:2});
  const sit=[[1.55,-.35],[2.1,-.5],[2.65,-.55],[3.2,-.5],[3.75,-.35]].map(([x,z],i)=>B.person(K+`m-sit${i}`,x,z,i===4?.85:1.0,{shirt:(['casual','bib','fan','navy','casual'] as const)[i],skin:i===4?MARCUS.skin:SK[i%2],hair:(['short','long','short','bun','short'] as const)[i],hairColor:'#1d1a22',face:'smile',layer:1}));
  const foods=[0,1,2,3,4].map(i=>tbl.add(food(`m-food${i}`,.16),-1.3+2.6*(.12+i*.19),.95*.7,{z:.02}));
  const emptyCard=B.stand(S.flipCard(K+'m-empty',1.3,.3,'MUM’S PLATE',INK.white,INK.navy),4.1,1.35,{layer:3,s:0});
  const plateStand=B.stand(sp('m-mplate',.8,.4,k=>{k.fill(ell(.4,.28,.38,.1),INK.white);k.key(ell(.4,.28,.38,.1),.012);k.fill(rect(.35,.3,.1,.1),INK.grey);}),4.1,.85,{layer:3,s:0});
  const coverStand=B.stand(sp('m-coverbase',.9,.2,k=>{k.fill(ell(.45,.12,.44,.08),INK.white);k.key(ell(.45,.12,.44,.08),.012);}),1.2,1.55,{layer:3});
  const meal=coverStand.add(food('m-meal',.32),0,.1,{z:.01});const cover=coverStand.flap(cloche('m-cloche',.82,.62),0,.72,{z:.03});
  const hearts=[0,1,2].map(i=>B.stand(heart(`m-heart${i}`,.3),1.9+i*.55,1.95,{layer:3,s:0}));
  const leader=B.stand(S.flipCard(K+'m-leader',1.1,.32,'MUM LEADS',INK.blue),.9,-1.9,{layer:1,s:0});
  const thanks=B.stand(S.banner(K+'m-thanks',2.0,.42,'THANK YOU, MUM',INK.pink),2.6,-1.95,{layer:1,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,25.2):b.t;
   c97.flip=-2.9+2.9*beat(t,3,3.8);house.s=beat(t,2.4,3.4);
   kids.forEach((p,i)=>{p.body.s=beat(t,8+i*.45,8.7+i*.45)*(1-beat(t,19.4,20.2));});five.s=beat(t,9.6,10.3)*(1-beat(t,17,17.6));marcusTag.s=beat(t,5,5.6)*(1-beat(t,17,17.6));kids[4].armR.rot=.12+1.8*beat(t,5.2,5.8)-1.8*beat(t,7.4,7.9);
   mom.body.s=beat(t,11,11.8);work1.s=beat(t,12.2,13);
   const shuttle=track(t,[[0,-1.2],[12.6,-1.2],[13.8,-2.3],[15,-1.2],[16.2,-2.3],[17.4,-1.2]])[0];mom.armL.rot=-.12-.3*wave(t,12.6,17.4,1.2);
   hM.rot=t<11?0:-(t-11)*3*(t<18?1:0)-(t>=18?21:0);hH.rot=t<11?0:-(t-11)*.25*(t<18?1:0)-(t>=18?1.75:0);clk.scale=1;
   const tight=beat(t,17.7,18.6)*(1-beat(t,33,35));rain.scale=tight;rain.visible=tight>.02;rain.dx=.2*wave(t,18,33,.25);
   jarP.s=beat(t,17.9,18.6)*(1-beat(t,33.4,34.2));jarP.rot=.06*wave(t,18.6,20,2);
   sit.forEach((p,i)=>{p.body.s=beat(t,20+i*.3,20.7+i*.3);});foods.forEach((f,i)=>{f.s=beat(t,21+i*.35,21.6+i*.35);});
   plateStand.s=beat(t,22.6,23.3);emptyCard.s=beat(t,23.2,23.9)*(1-beat(t,30,30.8));
   const lift=Math.max(beat(t,25.8,27),manual?beat(act,0,.7):0);cover.flip=-2.85*lift;meal.s=1;
   hearts.forEach((h,i)=>{h.s=Math.max(beat(t,26.6+i*.4,27.2+i*.4),manual?beat(act,.55+i*.12,.75+i*.12):0);});
   const lead=beat(t,28,28.8);leader.s=lead;cheer(mom,Math.max(lead*(1-beat(t,32,32.6)),manual?beat(act,.8,1):0)*.6);mom.body.x=t<19.4?shuttle:-1.2+.9*beat(t,27.6,29);
   thanks.s=beat(t,33.8,34.8);sit.forEach((p,i)=>cheer(p,beat(t,34.4+i*.2,35+i*.2)));sun.scale=beat(t,33.6,35);sun.visible=sun.scale>.02;
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,17.4,18.4)+.45*beat(t,19.6,20.6):0;
  };
 }};

/* ───────────── 2 · No way to get to training (rides) ───────────── */
const rides:SpreadDef={id:'rides',rest:23.1,
 left:k=>{pitch(k,-5,0);bar(k,-5,Z(-1.6),0,Z(-1.6),.05,INK.white);bar(k,-3.6,Z(-1.6),-3.6,Z(-.8),.05,INK.white);bar(k,-3.6,Z(-.8),-1.4,Z(-.8),.05,INK.white);bar(k,-1.4,Z(-.8),-1.4,Z(-1.6),.05,INK.white);
  k.text('FLETCHER MOSS RANGERS',-2.5,Z(2.62),.3,INK.navy,{max:4.4});k.text('AGE FIVE · IN GOAL',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pavement(k,0,5,'#cfc8b8');road(k,0,5,Z(1.9),.9);
  k.text('TO TRAINING',2.5,Z(2.62),.4,INK.red,{max:4});k.text('HIS COACHES FOUND DRIVERS',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'r-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);const t=`M0 2.4 Q1.2 1.9 2.4 2.1 Q3.5 2.3 4.5 2.0 L4.5 3 L0 3 Z`;k.fill(t,'#7fb46a');k.dots(t,INK.green,.05,.3);for(let i=0;i<6;i++){const x=.3+i*.8;k.fill(ell(x,1.95-(i%2)*.1,.32,.4),INK.leaf);k.keyFill(rect(x-.04,2.2,.08,.3),INK.brown);}}},
   {key:K+'r-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);terraces(k,2.4,2.3,2);const g=rect(2.6,1.6,1.9,.7);k.fill(g,INK.grass);k.dots(g,INK.leaf,.05,.3);lightRig(k,3.0,1.0);lightRig(k,4.2,1.0);k.fill(rect(0,2.3,4.5,.7),'#a9a497');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'r-sun',.3),'L',3.6,2.4,{out:.012}),storm=bd.add(stormCloud('r-storm',1.3,.66),'R',1.3,2.3,{out:.03});
  const goal=B.stand(S.goal(K+'r-goal',1.6,.85),-2.5,-1.75,{layer:1});void goal;
  const keeper=B.person(K+'r-keeper',-2.5,-1.1,.95,{shirt:'keeper',...MARCUS,face:'grin',layer:2,holdL:'glove',holdR:'glove'});
  const mate=B.person(K+'r-mate',-2.3,1.1,1.0,{shirt:'bib',hair:'curly',skin:'#f1b88f',legs:'kick',face:'smile',layer:3});
  const five=B.stand(S.flipCard(K+'r-five',.8,.32,'AGE 5',INK.yellow,INK.navy),-4.2,-.4,{layer:2,s:0});
  const acad=B.stand(S.sign(K+'r-acad',1.4,1.25,'ACADEMY',INK.red),-.85,-1.5,{layer:1,s:0});const c7=acad.flap(S.flipCard(K+'r-7',1.0,.38,'AGE 7',INK.yellow,INK.navy),0,1.25*.56,{z:.03});
  const boy=B.person(K+'r-boy',-1.1,.35,1.0,{shirt:'casual',...MARCUS,face:'smile',layer:2});
  const bros=[[-4.3,.9],[-3.7,1.35]].map(([x,z],i)=>B.person(K+`r-bro${i}`,x,z,1.5,{shirt:i?'navy':'fan',skin:'#7f5138',hair:'short',hairColor:'#1d1a22',adult:true,face:'smile',layer:3}));
  const work=B.stand(workDoor('r-work',1.3,1.2,'WORK',INK.sky),1.0,-1.8,{layer:1,s:0});
  const mom=B.person(K+'r-mum',1.5,-.5,1.5,{shirt:'coach',...MUM,adult:true,face:'smile',layer:2});
  const alone=B.stand(S.flipCard(K+'r-missed',1.5,.34,'MISSED TRAINING',INK.white,INK.navy),-1.1,1.5,{layer:3,s:0});
  const tg=B.stand(trainGround('r-tg',1.8,1.2),3.6,-1.5,{layer:1});
  const carP=B.stand(car('r-car',1.2,.6,INK.yellow,true),.9,1.85,{layer:3,tab:false});B.slot(.6,2.05,3.9,2.05);
  const coaches=[[2.2,.75,'#f1b88f','short'],[3.0,.5,'#e8b48f','bald'],[3.8,.8,'#d99a6c','short']].map(([x,z,sk,hr],i)=>B.person(K+`r-coach${i}`,x as number,z as number,1.5,{shirt:'navy',skin:sk as string,hair:hr as 'short',hairColor:i===1?INK.grey:'#4a3a30',adult:true,face:'smile',layer:2}));
  const names=['BUSHELL','MULVEY','WHELAN'].map((n,i)=>B.stand(S.flipCard(K+`r-n${i}`,.85,.28,n,[INK.pink,INK.blue,INK.orange][i]),2.2+i*.8,1.3,{layer:3,s:0}));
  B.stand(S.lamp(K+'r-lamp',.3,1.5),.45,-.8,{layer:1});B.stand(S.bush(K+'r-bush',.9,.45),-4.4,1.9,{layer:3});B.stand(S.cone(K+'r-cone1',.3),-3.3,1.6,{layer:3});B.stand(S.cone(K+'r-cone2',.3),-1.9,1.9,{layer:3});
  const boy2=B.person(K+'r-boy2',4.45,1.35,1.0,{shirt:'bib',...MARCUS,legs:'kick',face:'grin',layer:3});
  const ball=ballPair(B,'r-ball',.1);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,23.1):b.t;
   keeper.body.s=beat(t,2.4,3.2)*(1-beat(t,12.6,13.4));mate.body.s=beat(t,2.8,3.6)*(1-beat(t,12.6,13.4));five.s=beat(t,4.4,5)*(1-beat(t,12.6,13.4));
   const save=pulse(t,5.6,7.2);keeper.armL.rot=-.12-2.2*save;keeper.armR.rot=.12+2.2*save;keeper.body.dy=.15*save;mate.leg!.rot=-1.1*pulse(t,5,5.8);
   let [bx,bz]=track(t,[[0,-2.3,1.2],[5.3,-2.3,1.2],[6.3,-2.5,-.95],[7.4,-2.5,-.95],[8,-3.2,.3]]);ball(bx,bz,.3*pulse(t,5.3,6.3),t>2.8&&t<12.6);
   acad.s=beat(t,8.5,9.3);c7.flip=-2.9+2.9*beat(t,9.6,10.4);boy.body.s=beat(t,9.2,10);
   bros.forEach((p,i)=>{p.body.s=beat(t,12.6+i*.4,13.4+i*.4);p.armR.rot=.12+1.5*beat(t,13.4+i*.3,14+i*.3)-1.5*beat(t,15.6,16.2);});
   const st=beat(t,15.2,16.2)*(1-beat(t,25.6,27))*(manual?1-beat(act,.3,.8):1);storm.scale=st;storm.visible=st>.02;storm.dx=.15*wave(t,16,25,.3);
   work.s=beat(t,17.3,18.1);mom.body.s=beat(t,17.6,18.4);
   bros.forEach((p,i)=>{p.body.x=[-4.3,-3.7][i]+1.2*beat(t,18.6,20.6)*0;p.body.s*=1-beat(t,19+i*.3,19.8+i*.3);});mom.body.x=1.5-.5*beat(t,19,20.5);
   alone.s=beat(t,21,21.7)*(1-beat(t,25.5,26.2))*(manual?1-beat(act,0,.3):1);boy.body.yaw=0;
   const drive=Math.max(beat(t,23.6,27.4),manual?beat(act,0,.75):0);carP.x=.9+2.6*drive;carP.dy=.02*Math.abs(Math.sin(t*12))*(drive>0&&drive<1?1:0);
   boy.body.s=beat(t,9.2,10)*(1-beat(t,23.4,23.9)*(manual?1:1));if(manual)boy.body.s=0;
   coaches.forEach((p,i)=>{p.body.s=Math.max(beat(t,25.8+i*.6,26.6+i*.6),manual?beat(act,.4+i*.1,.6+i*.1):0);p.armR.rot=.12+2.0*Math.max(beat(t,28.6+i*.4,29.2+i*.4),manual?beat(act,.8,1):0);});
   names.forEach((n,i)=>{n.s=Math.max(beat(t,26.4+i*1.4,27+i*1.4),manual?beat(act,.5+i*.1,.7+i*.1):0);});
   boy2.body.s=Math.max(beat(t,30.4,31.2),manual?beat(act,.85,1):0);cheer(boy2,beat(t,33,33.6));boy2.leg!.rot=-.9*pulse(t,31.4,32.2);
   sun.dy=.5*beat(t,32.4,34);coaches.forEach((p,i)=>cheer(p,beat(t,34+i*.3,34.6+i*.3)));
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,16.8,17.8)+.5*beat(t,23,24)-.5*beat(t,33,34):0;
  };
 }};

/* ───────────── 3 · Meals for hungry children (meals) ───────────── */
const meals:SpreadDef={id:'meals',rest:24.7,
 left:k=>{pavement(k,-5,0);bar(k,-5,Z(-.4),0,Z(-.4),.06,INK.yellow);
  k.text('LOCKDOWN · 2020',-2.5,Z(2.62),.4,INK.navy,{max:4});k.text('CHILDREN MISSED THEIR SCHOOL MEALS',-2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.3});},
 right:k=>{pavement(k,0,5,'#d6cdb8');road(k,0,5,Z(-.6),.8);
  k.text('3 MILLION MEALS',2.5,Z(2.62),.4,INK.green,{max:4.2});k.text('BY JUNE · PEOPLE GAVE OVER £20 MILLION',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'e-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9ccd9',INK.navy,y=>.3-y/3*.2);terraces(k,4.5,2.4,3);k.fill(rect(0,2.4,4.5,.6),'#9a9aa3');}},
   {key:K+'e-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);terraces(k,4.5,2.3,4);k.fill(rect(0,2.3,4.5,.7),'#b9b2a0');}},-3.05,1.22);
  const cloud=bd.add(stormCloud('e-cloud',1.4,.7),'L',2.2,2.3,{out:.03}),sun=bd.add(S.sun(K+'e-sun',.32),'R',3.8,2.5,{out:.012});
  const lock=B.stand(S.flipCard(K+'e-lock',1.5,.36,'LOCKDOWN',INK.pink),-4.0,-.3,{layer:2,s:0});
  const sch=B.stand(school('e-school',1.9,1.6),-2.5,-1.6,{layer:1});const door=sch.flap(doorLeaf('e-door',.6,.6,INK.red),-.3,0,{anchor:'bl',axis:'y',z:.02});
  const closed=B.stand(S.flipCard(K+'e-closed',1.0,.32,'CLOSED',INK.navy),-2.5,-.5,{layer:2,s:0});
  const trayS=B.stand(sp('e-trayleg',.14,.5,k=>{k.fill(rect(.03,0,.08,.5),INK.grey);}),-1.0,.5,{layer:2,s:0,tab:false});const trayF=trayS.flap(tray('e-tray',1.3,.8),0,.5,{anchor:'bottom',z:.02});
  const missing=B.stand(S.flipCard(K+'e-missing',1.3,.32,'MISSING OUT',INK.white,INK.navy),-1.0,1.0,{layer:3,s:0});
  const kids=[[-4.3,1.2],[-3.6,1.6],[-2.9,1.25],[-2.2,1.7]].map(([x,z],i)=>B.person(K+`e-kid${i}`,x,z,1.0,{shirt:(['bib','casual','fan','bib'] as const)[i],skin:SK[(i*2)%5],hair:(['short','bun','curly','long'] as const)[i],hairColor:'#3b2e3f',face:'smile',layer:3}));
  const H=B.person(K+'e-marcus',.75,-.2,1.55,{shirt:'navy',...MARCUS,adult:true,face:'smile',layer:2});
  const memory=B.stand(S.bubble(K+'e-memory',.9,.7,'heart'),1.35,1.25,{layer:3,s:0});
  const vanP=B.stand(van('e-van',1.7,.85),3.9,-1.6,{layer:1,s:0});
  const vols=[[2.4,-.5,'#f1b88f'],[4.4,-.2,'#b27650']].map(([x,z,sk],i)=>B.person(K+`e-vol${i}`,x as number,z as number,1.4,{shirt:'keeper',skin:sk as string,hair:i?'curly':'long',adult:true,face:'grin',layer:2}));
  const boxes=[0,1,2].map(i=>{const bs=B.stand(boxP(`e-box${i}`,.72,.5),2.1+i*1.05,1.85,{layer:3});const g=bs.add(groceries(`e-g${i}`,.6,.42),0,.3,{z:-.01});const l=bs.flap(lid(`e-lid${i}`,.72,.34),0,.5,{anchor:'bottom',z:.02});return {bs,g,l};});
  const money=B.stand(lineCard('e-money',1.3,.46,['£20 MILLION'],INK.yellow),1.3,.55,{layer:3,s:0}),mealsC=B.stand(lineCard('e-meals',1.6,.46,['3 MILLION MEALS'],INK.grass),3.6,.6,{layer:3,s:0});
  const hearts=[0,1,2].map(i=>B.stand(heart(`e-h${i}`,.26),-4.2+i*.9,2.15,{layer:3,s:0}));
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,24.7):b.t;
   lock.s=beat(t,3,3.8)*(1-beat(t,16,16.8));const cl=beat(t,3.4,4.4)*(1-beat(t,35,37));cloud.scale=cl;cloud.visible=cl>.02;cloud.dx=.2*wave(t,4.4,35,.25);
   door.flip=-1.3+1.3*beat(t,5.6,6.6);closed.s=beat(t,6.6,7.3)*(1-beat(t,16,16.8));
   const back=Math.max(beat(t,27.6,28.6),manual?beat(act,.85,1):0);trayS.s=beat(t,9.2,9.8)*(1-beat(t,14.2,15)*(1-back));trayF.flip=0;missing.s=beat(t,14.6,15.3)*(1-back);
   kids.forEach((p,i)=>{p.body.s=beat(t,10.4+i*.4,11+i*.4);const sad=beat(t,14.4,15)*(1-Math.max(beat(t,30,30.8),manual?beat(act,.85,1):0));p.armL.rot=-.12-.5*sad;cheer(p,Math.max(beat(t,30.4+i*.25,31+i*.25),manual?beat(act,.9,1):0));});
   H.body.s=beat(t,16.5,17.3);memory.s=beat(t,17.4,18.1)*(1-beat(t,22,22.6));H.armR.rot=.12+.9*beat(t,17.6,18.2)-.9*beat(t,21.6,22.2);
   vanP.s=beat(t,19.8,20.8);vanP.dx=-.25*beat(t,20.8,23)+.25*beat(t,33,35);vols.forEach((p,i)=>{p.body.s=beat(t,21.6+i*.5,22.4+i*.5);});
   const n=manual?act*3:0;boxes.forEach((bx,i)=>{const f=Math.max(clamp01(n-i),beat(t,25+i*.7,25.6+i*.7));bx.l.flip=-2.7*beat(f,0,.4);bx.g.s=Math.max(.001,beat(f,.25,.7));bx.g.dy=.3*beat(f,.3,1);bx.bs.rot=.04*pulse(f,.5,1);});
   vols.forEach((p,i)=>{p.armR.rot=.12+1.2*pulse(t,25+i*.9,26.4+i*.9);});
   money.s=Math.max(beat(t,27.6,28.3),manual?beat(act,.95,1):0);mealsC.s=Math.max(beat(t,31,31.7),manual?beat(act,.95,1):0);
   hearts.forEach((h,i)=>{h.s=beat(t,35.4+i*.4,36+i*.4);});cheer(H,beat(t,35.6,36.2));sun.scale=beat(t,34.8,36.2);sun.visible=sun.scale>.02;
   return b.narrated?-.45*beat(t,2.2,3.2)+.45*beat(t,16,17)+.35*beat(t,17,18)-.35*beat(t,34.6,35.6):0;
  };
 }};

/* ───────────── 4 · A letter to the government (letter) ───────────── */
const letterS:SpreadDef={id:'letter',rest:15.2,
 left:k=>{tiles(k,-5,0);k.fill(rect(-5,0,5,.9),'#d9c39a');
  k.text('15 JUNE 2020',-2.5,Z(2.62),.44,INK.red,{max:4});k.text('AN OPEN LETTER',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pavement(k,0,5,'#d9d2c0');
  k.text('1.3 MILLION CHILDREN',2.5,Z(2.62),.36,INK.blue,{max:4.4});k.text('FREE MEALS OVER THE SUMMER HOLIDAYS',2.5,Z(2.9),.14,INK.navy,{weight:800,max:4.3});},
 build:B=>{
  const bd=B.vfold({key:K+'l-bdL',w:4.5,h:3,paint:k=>{const p=rect(0,0,4.5,3);k.fill(p,'#e8dcc0');k.dots(p,INK.orange,.05,.12);const win=rect(1.4,.4,1.6,1.2);k.fill(win,INK.sky2);k.key(win,.03,INK.white);k.key('M2.2 .4 L2.2 1.6',.03,INK.white);terraces(k,1.6,1.6,5);k.fill(rect(0,2.3,4.5,.7),'#d9c39a');}},
   {key:K+'l-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.sky,y=>.6-y/3*.6);k.fill(rect(0,2.3,4.5,.7),'#bdb6a4');for(let i=0;i<8;i++){const x=.2+i*.56;k.fill(ell(x,2.15,.26,.28),INK.leaf);}}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'l-sun',.34),'R',1.2,2.4,{out:.012}),bunt=bd.add(S.bunting(K+'l-bunt',2.6,.4,[INK.yellow,INK.pink,INK.sky,INK.grass]),'R',2.1,2.6,{out:.03});
  const deskP=B.stand(desk('l-desk',1.8,1.0),-2.4,-.6,{layer:2});
  const H=B.person(K+'l-marcus',-3.6,-.9,1.5,{shirt:'casual',...MARCUS,adult:true,face:'smile',layer:1});
  const paper=B.stand(letter('l-letter',1.1,1.3),-1.1,-1.4,{layer:1,s:0});
  const date=B.stand(S.flipCard(K+'l-date',1.3,.34,'15 JUNE 2020',INK.pink),-4.1,.6,{layer:3,s:0});
  const kidsL=B.stand(kidsRow('l-kidsL',3.8,.8,9,1),-2.5,1.7,{layer:3,s:0});
  const gov=B.stand(govt('l-govt',2.4,1.8),3.1,-1.6,{layer:1});const gdoor=gov.flap(doorLeaf('l-gdoor',.48,.58,'#3a2a2a'),-.24,.14,{anchor:'bl',axis:'y',z:.02});
  const pbox=B.stand(postbox('l-post',.55,1.05),1.2,-.2,{layer:2});
  const env=B.stand(envelope('l-env',.5,.32),.6,.5,{layer:3,s:0,tab:false});
  const summer=B.stand(lineCard('l-summer',1.8,.5,['SUMMER MEALS'],INK.yellow),3.2,-.15,{layer:2,s:0});
  const count=B.stand(lineCard('l-count',1.6,.46,['1.3 MILLION'],INK.sky2),1.2,1.25,{layer:3,s:0});
  const kidsR=B.stand(kidsRow('l-kidsR',2.2,.75,6,3),3.5,1.3,{layer:3,s:0});
  const ware=B.stand(warehouse('l-ware',1.3,1.0),4.4,-.6,{layer:2,s:0});const wcard=B.stand(S.flipCard(K+'l-wcard',1.3,.3,'NAMED AFTER MUM',INK.pink),4.1,.35,{layer:2,s:0});
  const proud=B.stand(heart('l-proud',.4),-.6,.6,{layer:3,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15.2):b.t;
   H.body.s=beat(t,2.4,3.2);date.s=beat(t,3,3.7);paper.s=beat(t,4.6,5.6);H.armR.rot=.12+1.0*pulse(t,5,7.6)+.25*wave(t,5,15,2);H.body.x=-3.6+.2*beat(t,4,5);
   kidsL.s=beat(t,10.6,11.6);deskP.s=1;
   // Post the letter (manual action; narration posts at "Post the letter").
   const post=Math.max(beat(t,23.1,24.4),manual?beat(act,0,.45):0);env.s=beat(t,15.4,16)*(1-beat(post,.85,1));const [ex,ez,ey]=track(post,[[0,.6,.5,0],[.5,.9,.1,.55],[1,1.2,-.2,.6]]);env.x=ex;env.z=ez;env.dy=ey;env.rot=-.3*post;
   paper.s*=1-.0*post;pbox.rot=.05*pulse(post,.8,1);
   const change=Math.max(beat(t,16.2,17.6),manual?beat(act,.45,.7):0);gdoor.flip=-1.3*change;summer.s=Math.max(beat(t,18.4,19.2),manual?beat(act,.55,.8):0);
   bunt.scale=Math.max(beat(t,19.4,20.4),manual?beat(act,.6,.85):0);bunt.visible=bunt.scale>.02;sun.dy=.5*Math.max(beat(t,17,19),manual?beat(act,.5,.8):0);
   count.s=Math.max(beat(t,25.4,26.2),manual?beat(act,.75,.95):0);kidsR.s=Math.max(beat(t,26,27),manual?beat(act,.8,1):0);proud.s=Math.max(beat(t,26.6,27.3),manual?beat(act,.85,1):0);
   cheer(H,Math.max(beat(t,26.8,27.4)*(1-beat(t,29,29.6)),manual?beat(act,.85,1):0)*.8);
   ware.s=beat(t,29.8,30.8);wcard.s=beat(t,30.6,31.4);cheer(H,beat(t,34,34.6));
   return b.narrated?-.45*beat(t,2,3)+.45*beat(t,15.4,16.4)-.45*beat(t,33.6,34.6):0;
  };
 }};

/* ───────────── 5 · The penalty that hit the post (post) ───────────── */
const post:SpreadDef={id:'post',rest:18.4,
 left:k=>{pitch(k,-5,0,'#3f7f5a',INK.navy);bar(k,-5,Z(-2.0),0,Z(-2.0),.05,INK.white);bar(k,-4.1,Z(-2.0),-4.1,Z(-.9),.05,INK.white);bar(k,-4.1,Z(-.9),-1.0,Z(-.9),.05,INK.white);bar(k,-1.0,Z(-.9),-1.0,Z(-2.0),.05,INK.white);k.circle(-2.55,Z(-.1),.06,INK.white);
  k.text('EURO 2020 FINAL',-2.5,Z(2.62),.36,INK.yellow,{max:4.2});k.text('JULY 2021 · ENGLAND AND ITALY',-2.5,Z(2.9),.16,INK.white,{weight:800,max:4});},
 right:k=>{pavement(k,0,5,'#bfb8a8');
  k.text('WITHINGTON',2.5,Z(2.62),.44,INK.red,{max:4});k.text('WHERE HE HAD LIVED AS A BOY',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'p-bdL',w:4.5,h:3,paint:k=>{nightSky(k,4.5,3);crowd(k,4.5,1.2,2.6,[INK.white,INK.red,INK.white,INK.blue,INK.white,INK.sky],2);lightRig(k,1.2,.3);lightRig(k,3.4,.35);k.fill(rect(0,2.6,4.5,.4),'#3f7f5a');}},
   {key:K+'p-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,'#c9ccd9',INK.navy,y=>.3-y/3*.2);terraces(k,4.5,2.3,6);k.fill(rect(0,2.3,4.5,.7),'#9a9aa3');}},-3.05,1.22);
  const storm=bd.add(stormCloud('p-storm',1.5,.75),'R',2.2,2.3,{out:.03}),storm2=bd.add(stormCloud('p-storm2',1.1,.55),'L',1.2,2.5,{out:.03});
  const board=B.stand(S.scoreboard(K+'p-board',1.8,1.4,'EURO 2020'),-4.1,-1.3,{layer:1});
  board.add(lineCard('p-miss',1.44,.64,['A MISS IS','NOT THE END'],INK.yellow),0,.38,{z:.012});
  const flaps=[['ITALY WIN',INK.blue],['FINAL','#3d5da0']].map(([l,c],i)=>board.flap(S.flipCard(K+`p-f${i}`,1.44,.64,l,c),0,1.02,{z:.03-i*.006}));
  const goalP=B.stand(S.goal(K+'p-goal',1.8,.9),-2.55,-1.75,{layer:1});void goalP;
  const keeper=B.person(K+'p-keeper',-2.55,-1.3,1.28,{shirt:'keeper',hair:'short',skin:'#f1b88f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const H=B.person(K+'p-marcus',-1.2,1.1,1.3,{shirt:'ger',...MARCUS,number:'11',legs:'kick',face:'smile',layer:3});
  const pw=B.stand(pow('p-pow',.26),-1.7,-1.45,{layer:2,s:0,tab:false});const postCard=B.stand(S.flipCard(K+'p-postc',.9,.32,'THE POST',INK.white,INK.navy),-.8,-.5,{layer:2,s:0});
  const ball=B.stand(S.ball(K+'p-ball',.11),-2.55,.35,{layer:3,tab:false,s:0});
  const wall=B.stand(mural('p-mural',2.4,1.9),2.5,-1.55,{layer:1});
  const scr=[0,1,2].map(i=>wall.add(scribble(`p-scr${i}`,.9,.55,i),-.6+i*.6,.45+(i%2)*.55,{z:.02}));
  const ph=B.stand(phone('p-phone',.6,1.0),.9,.3,{layer:2,s:0});
  B.stand(S.lamp(K+'p-lamp',.3,1.5),4.6,-.6,{layer:1});B.stand(S.bench(K+'p-bench',1.0,.42),1.2,1.95,{layer:3});
  const kid=B.person(K+'p-kid',3.3,1.3,1.0,{shirt:'bib',skin:'#b27650',hair:'curly',face:'sad',layer:3});
  const adult=B.person(K+'p-adult',4.3,.8,1.55,{shirt:'coach',skin:'#f1b88f',hair:'long',adult:true,face:'smile',layer:3});
  const tell=B.stand(grownUpCard('p-tell',1.1,.5),2.2,1.7,{layer:3,s:0});
  const hrt=B.stand(heart('p-heart',.34),3.95,-.1,{layer:2,s:0});
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,18.4):b.t;
   flaps[1].flip=-2.9*Math.max(1-beat(t,3,3.8),Math.max(beat(t,18.8,19.8),manual?beat(act,0,.7):0));H.body.s=beat(t,8.6,9.4);H.body.x=-.6-.6*beat(t,8.6,10.2);
   ball.s=beat(t,12,12.6);let [bx,bz,dy]=track(t,[[0,-2.55,.35,0],[14.6,-2.55,.35,0],[15.4,-1.72,-1.55,.45],[16.2,-.9,-.6,.1],[17,-.6,.2,0]]);ball.x=bx;ball.z=bz;ball.dy=dy;ball.rot=-t*4*(t>14.6&&t<17?1:0);
   H.body.x=t>12?-1.2-1.1*beat(t,12.4,14.2)+.3*beat(t,14.6,15):H.body.x;H.leg!.rot=-1.1*pulse(t,14.3,14.9);
   const dive=pulse(t,14.8,16.4);keeper.body.rot=.9*dive;keeper.body.dx=.35*dive;
   pw.s=beat(t,15.3,15.6)*(1-beat(t,17.2,17.8));postCard.s=beat(t,15.6,16.2)*(1-beat(t,21,21.6));const fl=Math.max(beat(t,18.8,19.8),manual?beat(act,0,.7):0);flaps[0].flip=-2.9*Math.max(1-beat(t,17,17.6),fl);
   H.body.yaw=0;H.armL.rot=-.12-.4*beat(t,16,16.6)*(1-beat(t,19.4,20));cheer(H,Math.max(beat(t,19.6,20.2)*(1-beat(t,22,22.6)),manual?beat(act,.75,1):0)*.7);
   ph.s=beat(t,21,21.8)*(1-beat(t,37,38));ph.rot=.05*wave(t,22,25,2);
   const st=beat(t,22.4,23.6)*(1-beat(t,37.4,39));storm.scale=st;storm.visible=st>.02;storm2.scale=beat(t,25.6,26.6)*(1-beat(t,37.4,39));storm2.visible=storm2.scale>.02;
   scr.forEach((s2,i)=>{show(s2,beat(t,31.4+i*.8,32.2+i*.8));});
   kid.body.s=beat(t,26,26.8);adult.body.s=beat(t,37,37.8);tell.s=beat(t,39,39.8);hrt.s=beat(t,40.2,40.9);adult.armL.rot=-.12-1.1*beat(t,38,38.6);kid.armR.rot=.12+1.1*beat(t,38.4,39);
   return b.narrated?-.4*beat(t,2,3)+.4*beat(t,20.2,21)+.45*beat(t,21,22)-.45*beat(t,42,43):0;
  };
 }};

/* ───────────── 6 · A wall of hearts (hearts) ───────────── */
const hearts:SpreadDef={id:'hearts',rest:15.0,
 left:k=>{pitch(k,-5,0);bar(k,-5,Z(-2.0),0,Z(-2.0),.05,INK.white);bar(k,-3.8,Z(-2.0),-3.8,Z(-1.1),.05,INK.white);bar(k,-3.8,Z(-1.1),-1.2,Z(-1.1),.05,INK.white);bar(k,-1.2,Z(-1.1),-1.2,Z(-2.0),.05,INK.white);
  k.text('WORLD CUP 2022',-2.5,Z(2.62),.4,INK.navy,{max:4});k.text('THREE GOALS FOR ENGLAND',-2.5,Z(2.9),.16,INK.navy,{weight:800});},
 right:k=>{pavement(k,0,5,'#d6cfbd');
  k.text('A WALL OF HEARTS',2.5,Z(2.62),.4,INK.pink,{max:4.2});k.text('KINDNESS ANSWERED BACK',2.5,Z(2.9),.16,INK.navy,{weight:800});},
 build:B=>{
  const bd=B.vfold({key:K+'h-bdL',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);crowd(k,4.5,1.3,2.6,[INK.white,INK.red,INK.white,INK.yellow,INK.sky],4);k.fill(rect(0,2.6,4.5,.4),INK.grass);}},
   {key:K+'h-bdR',w:4.5,h:3,paint:k=>{wash(k,4.5,3,INK.sky2,INK.yellow,y=>.5-y/3*.5);terraces(k,4.5,2.3,7);k.fill(rect(0,2.3,4.5,.7),'#b9b2a0');}},-3.05,1.22);
  const sun=bd.add(S.sun(K+'h-sun',.36),'R',3.9,1.9,{out:.012}),rainbow=bd.add(S.rainbow(K+'h-bow',3.0,1.2),'R',.5,2.5,{out:.016}),bunt=bd.add(S.bunting(K+'h-bunt',3.0,.4,[INK.red,INK.white,INK.pink,INK.yellow]),'L',.8,2.7,{out:.03});
  const storm=bd.add(stormCloud('h-storm',1.2,.6),'R',1.6,2.3,{out:.03});
  const wall=B.stand(mural('h-mural',2.4,1.9),2.5,-1.55,{layer:1});
  const scr=[0,1,2].map(i=>wall.add(scribble(`h-scr${i}`,.9,.55,i),-.6+i*.6,.45+(i%2)*.55,{z:.02}));
  const notes=[[-1.05,.3,'#ffd23f'],[1.0,1.35,'#bfe2ef'],[-1.0,1.4,'#ffc7dd'],[1.05,.25,'#ffd23f'],[0,1.72,'#fffaf0']].map(([x,y,c],i)=>wall.add(sp(`h-note${i}`,.34,.3,k=>{const b=rect(0,0,.34,.3);k.fill(b,c as string);k.key(b,.01);k.fill(heartPath(.17,.14,.1),INK.pink);},{rim:.01}),x as number,y as number,{z:.03}));
  const smallH=[[-.8,.9],[.85,.8],[-.3,.05],[.35,.1],[.75,1.55],[-.65,1.65]].map(([x,y],i)=>wall.add(heart(`h-sh${i}`,.2,i%2?INK.red:INK.pink),x,y,{z:.034}));
  const bigH=[0,1,2].map(i=>wall.add(heart(`h-big${i}`,.6,[INK.pink,INK.red,INK.pink][i]),[-.82,0,.82][i],[.75,.08,.75][i],{z:.04}));
  const hood=[[.7,.3,'#f1b88f','long','coach'],[1.3,1.4,'#7f5138','short','casual'],[4.45,.4,'#d99a6c','bun','fan'],[3.8,1.5,'#b27650','curly','navy']].map(([x,z,sk,hr,sh],i)=>B.person(K+`h-n${i}`,x as number,z as number,i===3?1.0:1.45,{shirt:sh as 'fan',skin:sk as string,hair:hr as 'short',hairColor:'#3b2e3f',adult:i!==3,face:'grin',layer:3}));
  const artist=B.person(K+'h-akse',3.95,-.75,1.5,{shirt:'casual',skin:'#e8b48f',hair:'cap',adult:true,face:'smile',layer:2});const brush=artist.body.add(paintBrush('h-brush',.18,.4),.35,1.35,{z:.02});
  const akse=B.stand(S.flipCard(K+'h-aksec',.9,.3,'AKSE',INK.yellow,INK.navy),2.5,.35,{layer:3,s:0});
  const walkers=[[-1.1,1.3,'#e8b48f','long','coach'],[-2.1,1.8,'#7f5138','short','fan']].map(([x,z,sk,hr,sh],i)=>B.person(K+`h-w${i}`,x as number,z as number,1.4,{shirt:sh as 'fan',skin:sk as string,hair:hr as 'short',adult:true,face:'smile',layer:3}));
  const wHearts=[0,1].map(i=>B.stand(heart(`h-wh${i}`,.28,INK.pink),-.5-i*1.2,1.7+i*.3,{layer:3,s:0}));
  const calP=B.stand(cal('h-cal',.9,.8,'1½ YRS'),-.8,-1.5,{layer:1,s:0});
  const board=B.stand(S.scoreboard(K+'h-board',1.7,1.35,'WORLD CUP 2022'),-4.1,-1.35,{layer:1,s:0});
  const iran=board.flap(lineCard('h-iran',1.36,.6,['IRAN · 1 GOAL'],INK.white),0,.98,{z:.02}),wales=board.flap(lineCard('h-wales',1.36,.6,['WALES · 2 GOALS'],INK.yellow),0,.98,{z:.028});
  const H=B.person(K+'h-marcus',-1.6,.9,1.3,{shirt:'ger',...MARCUS,number:'11',legs:'kick',face:'smile',layer:3});
  const keeper=B.person(K+'h-keeper',-2.5,-1.3,1.25,{shirt:'keeper',hair:'short',skin:'#e8b48f',face:'open',layer:2,holdL:'glove',holdR:'glove'});
  const goals=[0,1,2].map(i=>B.stand(S.ball(K+`h-g${i}`,.13),-4.3+i*.45,.4,{layer:3,s:0,tab:false}));
  const three=B.stand(S.flipCard(K+'h-three',1.2,.32,'3 GOALS',INK.pink),-3.85,1.0,{layer:3,s:0});
  const ball=ballPair(B,'h-ball',.11);
  return (b:Beat)=>{const act=b.action,manual=act>0,t=manual?Math.max(b.t,15):b.t;
   const st=1-beat(t,2,3.6);storm.scale=st;storm.visible=st>.02;sun.dy=.6*beat(t,2.2,4.2);
   hood.forEach((p,i)=>{p.body.s=beat(t,4.6+i*.45,5.3+i*.45);p.armR.rot=.12+1.9*pulse(t,5.6+i*.9,7+i*.9);});
   walkers.forEach((p,i)=>{p.body.s=beat(t,2.2+i*.5,3+i*.5)*(1-beat(t,20.4,21));p.armR.rot=.12+1.3*beat(t,3.4,4)*(1-beat(t,9,9.6));});wHearts.forEach((h,i)=>{h.s=beat(t,3.6+i*.4,4.2+i*.4)*(1-beat(t,20.4,21));h.rot=.1*wave(t,4,20,1);});
   notes.forEach((q,i)=>show(q,beat(t,6+i*.7,6.5+i*.7)));smallH.forEach((q,i)=>show(q,beat(t,7.2+i*.45,7.7+i*.45)));
   artist.body.s=beat(t,10.4,11.2);akse.s=beat(t,11,11.7)*(1-beat(t,18,18.6));artist.armR.rot=.12+1.8*beat(t,11.6,12.2)+.35*wave(t,12.2,15,1.4);brush.rot=0;
   scr.forEach((q,i)=>show(q,1-beat(t,12.2+i*.8,13+i*.8)));
   const n=manual?act*3:0;bigH.forEach((q,i)=>{const v=Math.max(clamp01(n-i),beat(t,15.4+i*.6,16+i*.6));show(q,v);q.rot=.1*wave(t,16+i*.6,18+i*.6,1.5);});
   hood.forEach((p,i)=>{if(manual)cheer(p,beat(act,.7+i*.05,.9+i*.05));});
   calP.s=beat(t,17.8,18.6)*(1-beat(t,21,21.6));
   board.s=beat(t,21,21.8);H.body.s=beat(t,21.6,22.4);keeper.body.s=beat(t,21.2,22);
   let [bx,bz,dy]=track(t,[[0,-1.2,1.0,0],[24,-1.2,1.0,0],[25,-2.1,-1.7,.3],[26,-1.2,1.0,0],[28.2,-1.2,1.0,0],[29,-3.1,-1.6,.3],[29.6,-1.2,1.0,0],[30.4,-1.2,1.0,0],[31.2,-1.9,-1.7,.35],[32,-1.2,1.0,0]]);ball(bx,bz,dy,t>22.2);
   H.leg!.rot=-1.1*Math.max(pulse(t,23.7,24.3),pulse(t,27.9,28.5),pulse(t,30.1,30.7));
   const dive=Math.max(pulse(t,24.2,25.6),pulse(t,28.4,29.8),pulse(t,30.6,32));keeper.body.rot=(t<28?.8:t<30.2?-.8:.8)*dive;
   iran.flip=-2.9+2.9*beat(t,25,25.6);wales.flip=-2.9+2.9*beat(t,29,29.6);
   goals.forEach((g,i)=>{g.s=beat(t,[25,29,31.2][i],[25.5,29.5,31.7][i]);});three.s=beat(t,31.6,32.3);
   cheer(H,Math.max(beat(t,25.2,25.8)*(1-beat(t,26.8,27.4)),beat(t,31.6,32.2)));
   rainbow.scale=beat(t,32.6,34);rainbow.visible=rainbow.scale>.02;bunt.scale=beat(t,32.4,33.6);bunt.visible=bunt.scale>.02;hood.forEach((p,i)=>{if(!manual)cheer(p,beat(t,33+i*.3,33.6+i*.3));});
   return b.narrated?.45*beat(t,1.6,2.6)-.45*beat(t,20.4,21.4)-.45*beat(t,21.4,22.4)+.45*beat(t,32,33):0;
  };
 }};

export const SPREADS:Record<string,SpreadDef>={mum,rides,meals,letter:letterS,post,hearts};
