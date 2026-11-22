/**
 * Shared page-print, backdrop and plate helpers for the Nov 21 2026 player books (lib/books/spreads/<id>.ts).
 * They are the same riso helpers the Kerr and Davies books define inline, gathered once so the twenty new books
 * share code instead of copying it. Plates are book-scoped: `plates(K)` prefixes every key with the book id.
 * Pure helpers (no state); the engine (popupEngine / popupPlates / popupScenery) is unchanged.
 */
import {INK,type Kit,type PlateSpec,poly,rect,ell,blob} from './popupPlates';
import * as S from './popupScenery';
import {type Builder,type Person,smooth,PAGE_D} from './popupEngine';

export const D2=PAGE_D/2,Z=(z:number)=>z+D2,TAU=Math.PI*2;
export const SKINS=['#f1b88f','#7f5138','#d99a6c','#b27650','#5b3a2a'];
/** Piecewise eased keyframes [t, ...values]. */
export const track=(t:number,f:number[][]):number[]=>{if(t<=f[0][0])return f[0].slice(1);for(let i=1;i<f.length;i++)if(t<f[i][0]){const a=f[i-1],b=f[i],u=smooth((t-a[0])/Math.max(.001,b[0]-a[0]));return a.slice(1).map((v,j)=>v+(b[j+1]-v)*u);}return f[f.length-1].slice(1);};
export const maxOf=(xs:number[])=>xs.reduce((a,b)=>Math.max(a,b),0);
export const cheer=(p:Pick<Person,'armL'|'armR'>,v:number,extra=0)=>{p.armL.rot=-.12-2.3*v-extra;p.armR.rot=.12+2.3*v+extra;};
/** Show a part only while it has size (keeps hidden plates out of the draw list). */
export const pop=(q:{scale:number;visible:boolean},v:number)=>{q.scale=v;q.visible=v>.02;};

/* ───────────── page prints ───────────── */
export const chalk=(k:Kit,d:string,w=.03)=>k.key(d,w,INK.white);
export function dash(k:Kit,x0:number,y0:number,x1:number,y1:number,w=.03,color:string=INK.white,seg=.13){const L=Math.hypot(x1-x0,y1-y0),n=Math.max(2,Math.floor(L/seg));for(let i=0;i<n;i+=2){const a=i/n,b=Math.min(1,(i+1)/n);k.key(`M${x0+(x1-x0)*a} ${y0+(y1-y0)*a} L${x0+(x1-x0)*b} ${y0+(y1-y0)*b}`,w,color);}}
export function pitch(k:Kit,x0:number,x1:number,tone:string=INK.grass,stripe:string=INK.leaf,a=.8){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone,a);for(let i=0;i<8;i++)if(i%2)k.dots(rect(x0,i*.8,x1-x0,.8),stripe,.055,.3);k.dots(p,stripe,.08,.1);}
/** Pitch with the far touchline and a centre circle (the usual right-page ground). */
export function pitchLines(k:Kit,x0:number,x1:number,cx:number,tone?:string,stripe?:string){pitch(k,x0,x1,tone,stripe);chalk(k,`M${x0} ${Z(-2.1)} L${x1} ${Z(-2.1)}`);chalk(k,ell(cx,Z(.2),.7,.7));}
export function paving(k:Kit,x0:number,x1:number,tone='#e3d6bb',line='#b2a283'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,line,.06,.14);
 for(let y=.5;y<PAGE_D;y+=.5)k.key(`M${x0} ${y} L${x1} ${y}`,.01,line);for(let r=0;r<13;r++)for(let x=x0+(r%2)*.4;x<x1;x+=.8)k.key(`M${x} ${r*.5} L${x} ${r*.5+.5}`,.01,line);}
export function floor(k:Kit,x0:number,x1:number,tone='#d9b98c',line='#a98455'){const p=rect(x0,0,x1-x0,PAGE_D);k.fill(p,tone);k.dots(p,line,.06,.12);for(let x=x0+.45;x<x1;x+=.45)k.key(`M${x} 0 L${x} ${PAGE_D}`,.012,line);}
export function footprints(k:Kit,x0:number,y0:number,x1:number,y1:number,n:number,c:string=INK.navy){for(let i=0;i<n;i++){const t=i/(n-1),x=x0+(x1-x0)*t,y=y0+(y1-y0)*t+(i%2?.08:-.08);k.fill(ell(x,y,.045,.07),c,.35);}}
export function road(k:Kit,x0:number,x1:number,y:number){const r=rect(x0,y-.22,x1-x0,.44);k.fill(r,'#8d8a86');k.dots(r,INK.navy,.05,.2);dash(k,x0+.1,y,x1-.1,y,.03,INK.yellow,.2);}
/** The two caption lines every page print carries at its foot. */
export function caption(k:Kit,cx:number,big:string,small:string,bigC:string=INK.blue,smallC:string=INK.navy,size=.4){k.text(big,cx,Z(2.62),size,bigC,{max:4.3});k.text(small,cx,Z(2.9),.14,smallC,{weight:800,max:4.4});}

/* ───────────── backdrop paints ───────────── */
export function wash(k:Kit,w:number,h:number,base:string,dot:string,amt:(y:number)=>number){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.055,(x,y)=>amt(y));}
export const daySky=(k:Kit,w:number,h:number)=>wash(k,w,h,INK.sky2,INK.sky,y=>.7-y/h*.7);
export function crowd(k:Kit,w:number,y0:number,y1:number,colors:string[],seed=1){const rows=Math.round((y1-y0)/.16);
 const st=`M0 ${y1} L0 ${y0} L${w} ${y0-.05} L${w} ${y1} Z`;k.fill(st,'#2d3f73');k.dots(st,INK.blue,.05,.35);
 for(let r=0;r<rows;r++){const y=y0+.1+r*.16;for(let i=0;i<Math.round(w/.13);i++){const x=.07+i*.13+(r%2)*.06,c=colors[(i*7+r*3+seed)%colors.length];k.circle(x,y,.045,c);k.fill(rect(x-.05,y+.03,.1,.07),c);}}
 k.key(`M0 ${y0} L${w} ${y0-.05}`,.02,INK.white);}
export function nightSky(k:Kit,w:number,h:number,base:string=INK.night,dot:string=INK.blue){const p=rect(0,0,w,h);k.fill(p,base);k.dots(p,dot,.06,(x,y)=>.45-y/h*.3);for(let i=0;i<14;i++)k.circle(((i*53)%97)/97*w,((i*31)%41)/41*h*.4,.02,i%3?INK.yellow:INK.white);}
export function lightRig(k:Kit,x:number,y:number){k.keyFill(rect(x-.03,y,.06,.9),'#1a2447');const l=rect(x-.22,y-.2,.44,.22);k.fill(l,INK.grey);k.key(l,.01);for(let i=0;i<4;i++)k.circle(x-.15+i*.1,y-.09,.035,INK.yellow);}
export function hills(k:Kit,w:number,h:number,y:number,tone:string,dot:string=INK.navy){const p=`M0 ${y} Q${w*.28} ${y-.5} ${w*.52} ${y-.15} Q${w*.78} ${y+.1} ${w} ${y-.3} L${w} ${h} L0 ${h} Z`;k.fill(p,tone);k.dots(p,dot,.05,.22);}
export function roofs(k:Kit,x0:number,x1:number,y:number,seed=1){for(let x=x0,i=0;x<x1;x+=.42,i++){const hh=.3+((i*7+seed)%4)*.09,b=rect(x,y-hh,.36,hh);k.fill(b,['#f2d3a0','#f0b7a4','#f6e2b8','#e9c28e'][(i+seed)%4]);k.key(b,.01);k.fill(poly([[x-.04,y-hh],[x+.18,y-hh-.16],[x+.4,y-hh]]),INK.red);k.key(poly([[x-.04,y-hh],[x+.18,y-hh-.16],[x+.4,y-hh]]),.01);k.fill(rect(x+.12,y-hh+.08,.1,.1),(i+seed)%3?INK.blue:INK.yellow);}}
export function skyline(k:Kit,w:number,y:number,cs=['#8f95ad','#a3a8bd','#7e849e']){for(let i=0;i<11;i++){const x=i*w/11,h=.35+((i*7)%5)*.14,b=rect(x,y-h,w/11-.03,h);k.fill(b,cs[i%cs.length]);k.key(b,.008);for(let r=0;r<Math.floor(h/.14);r++)k.fill(rect(x+.06,y-h+.06+r*.14,.06,.05),INK.yellow,.7);}}
export function sea(k:Kit,w:number,y:number,h:number){const s=rect(0,y,w,h);k.fill(s,INK.blue);k.dots(s,INK.navy,.045,.3);for(let i=0;i<9;i++){const x=.2+i*w/9;k.key(`M${x} ${y+.15+(i%3)*.12} q.1 -.06 .2 0 q.1 .06 .2 0`,.012,INK.white);}}
export function palms(k:Kit,w:number,y:number,n=6){for(let i=0;i<n;i++){const x=.3+i*w/n;k.key(`M${x} ${y} Q${x+.05} ${y-.3} ${x+.02} ${y-.55}`,.03,INK.brown);for(let j=0;j<5;j++){const a=-Math.PI+j*Math.PI/4;k.key(`M${x+.02} ${y-.55} Q${x+.02+Math.cos(a)*.15} ${y-.6+Math.sin(a)*.12} ${x+.02+Math.cos(a)*.26} ${y-.5+Math.sin(a)*.1}`,.025,INK.leaf);}}}
/** Standard V-fold: two 4.5 × 3 panels across the gutter. */
export function backdrop(B:Builder,key:string,left:(k:Kit)=>void,right:(k:Kit)=>void){return B.vfold({key:key+'L',w:4.5,h:3,paint:left},{key:key+'R',w:4.5,h:3,paint:right},-3.05,1.22);}

/* ───────────── book-scoped plates ───────────── */
export function plates(K:string){
 const sp=(key:string,w:number,h:number,paint:(k:Kit)=>void,extra:Partial<PlateSpec>={}):PlateSpec=>({key:K+key,w,h,paint,...extra});
 return {sp,
  lineCard:(key:string,w:number,h:number,lines:string[],color:string=INK.white,ink:string=INK.navy)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.dots(b,INK.navy,.035,.12);k.key(b,.013);const n=lines.length;lines.forEach((l,i)=>k.text(l,w/2,h*(.5+(i-(n-1)/2)*.36)+h*.1,h*.26,ink,{max:w*.86}));},{rim:.018}),
  rainCloud:(key:string,w:number,h:number)=>sp(key,w,h,k=>{const p=blob([[w*.08,h*.7],[0,h*.45],[w*.16,h*.24],[w*.32,h*.05],[w*.56,0],[w*.74,h*.16],[w*.92,h*.24],[w,h*.52],[w*.88,h*.7]]);k.fill(p,'#b9a3c0');k.hatch(p,INK.pink,.05,-.5,.012);k.key(p,.014);
   for(let i=0;i<5;i++){const x=w*(.16+i*.17),y=h*(.78+(i%2)*.1);k.fill(`M${x} ${y} Q${x+.03} ${y+.06} ${x} ${y+.09} Q${x-.03} ${y+.06} ${x} ${y} Z`,INK.sky);}},{rim:.02}),
  faceCard:(key:string,s:number,mood:'happy'|'sad'|'worried',color:string)=>sp(key,s,s,k=>{const c=s/2,r=s*.46;k.fill(ell(c,c,r,r),color);k.dots(ell(c,c,r,r),INK.navy,.03,.18);k.key(ell(c,c,r,r),.014);
   k.circle(c-s*.15,c-s*.06,s*.045,INK.navy,true);k.circle(c+s*.15,c-s*.06,s*.045,INK.navy,true);const lw=s*.05;
   if(mood==='happy')k.key(`M${c-s*.18} ${c+s*.1} Q${c} ${c+s*.3} ${c+s*.18} ${c+s*.1}`,lw);
   else if(mood==='sad')k.key(`M${c-s*.16} ${c+s*.25} Q${c} ${c+s*.08} ${c+s*.16} ${c+s*.25}`,lw);
   else k.key(`M${c-s*.18} ${c+s*.2} Q${c-s*.09} ${c+s*.12} ${c} ${c+s*.2} Q${c+s*.09} ${c+s*.28} ${c+s*.18} ${c+s*.2}`,lw*.9);},{rim:.02}),
  medal:(key:string,s:number,face:string=INK.gold,ribbon:string=INK.pink)=>sp(key,s,s*1.3,k=>{k.fill(poly([[s*.3,0],[s*.5,s*.45],[s*.7,0]]),ribbon);k.key(poly([[s*.3,0],[s*.5,s*.45],[s*.7,0]]),.008);const c=ell(s/2,s*.85,s*.4,s*.4);k.fill(c,face);k.dots(c,INK.navy,.025,.2);k.key(c,.01);k.circle(s/2,s*.85,s*.18,INK.white,true);},{rim:.012}),
  sunArm:(key:string,len:number,r:number)=>sp(key,r*2,len,k=>{k.fill(rect(r-.03,r,.06,len-r),INK.stock);k.key(rect(r-.03,r,.06,len-r),.006,'#9c8a66');for(let i=0;i<12;i++){const a=i/12*TAU;k.fill(poly([[r+Math.cos(a)*r*.62,r+Math.sin(a)*r*.62],[r+Math.cos(a+.13)*r,r+Math.sin(a+.13)*r],[r+Math.cos(a+.26)*r*.62,r+Math.sin(a+.26)*r*.62]]),INK.orange);}const c=ell(r,r,r*.6,r*.6);k.fill(c,INK.yellow);k.dots(c,INK.orange,.03,.3);k.key(c,.012);},{rim:.012}),
  segment:(key:string,w:number,h:number,label:string,color:string)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.hatch(b,INK.white,.08,.8,.012);k.key(b,.013);k.text(label,w/2,h*.66,h*.36,INK.navy,{weight:900,max:w*.88});},{rim:.015}),
  barFrame:(key:string,w:number,h:number,title:string)=>sp(key,w,h,k=>{k.keyFill(rect(w*.1,h*.7,.06,h*.3),INK.brown);k.keyFill(rect(w*.9-.06,h*.7,.06,h*.3),INK.brown);const b=rect(0,0,w,h*.7);k.fill(b,INK.white);k.key(b,.016);const inner=rect(w*.04,h*.2,w*.92,h*.4);k.fill(inner,'#e9e2cf');k.key(inner,.01);k.text(title,w/2,h*.14,h*.1,INK.pink,{weight:900});}),
  gatePosts:(key:string,w:number,h:number)=>sp(key,w,h,k=>{for(const x of [0,w-.12]){const p=rect(x,h*.1,.12,h*.9);k.fill(p,INK.stone);k.dots(p,INK.navy,.03,.2);k.key(p,.012);k.fill(ell(x+.06,h*.1,.08,.05),INK.grey);}k.key(`M.06 ${h*.14} Q${w/2} ${-h*.02} ${w-.06} ${h*.14}`,.03,INK.navy);}),
  gateLeaf:(key:string,w:number,h:number,c:string=INK.navy)=>sp(key,w,h,k=>{k.key(`M0 .02 L${w} .02 M0 ${h-.03} L${w} ${h-.03}`,.035,c);for(let x=.04;x<w;x+=.1)k.key(`M${x} 0 L${x} ${h}`,.022,c);k.circle(w*.5,h*.5,.05,INK.gold);},{rim:.012,grain:.5}),
  /** A flat card painted with a picture (used as the front of flaps and frames). */
  frame:(key:string,w:number,h:number,paint:(k:Kit)=>void,color:string=INK.white)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,color);k.key(b,.016);paint(k);const i=rect(w*.06,h*.06,w*.88,h*.88);k.key(i,.01,INK.gold);},{rim:.02}),
  windowFrame:(key:string,w:number,h:number)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,INK.white);k.key(b,.016);const g=rect(w*.08,h*.08,w*.84,h*.84);k.fill(g,INK.sky2);k.dots(g,INK.sky,.04,.4);k.key(g,.01);k.key(`M${w/2} ${h*.08} L${w/2} ${h*.92} M${w*.08} ${h/2} L${w*.92} ${h/2}`,.025,INK.white);}),
  bed:(key:string,w:number,h:number)=>sp(key,w,h,k=>{const head=rect(0,0,w*.12,h);k.fill(head,INK.wood);k.key(head,.012);const m=rect(w*.1,h*.45,w*.9,h*.3);k.fill(m,INK.white);k.key(m,.012);const q=rect(w*.32,h*.4,w*.66,h*.36);k.fill(q,INK.sky);k.dots(q,INK.blue,.035,.3);k.key(q,.012);k.fill(ell(w*.2,h*.42,w*.08,h*.08),INK.white);k.key(ell(w*.2,h*.42,w*.08,h*.08),.01);k.keyFill(rect(w*.92,h*.72,w*.06,h*.28),INK.brown);}),
  doorway:(key:string,w:number,h:number,c:string=INK.blue)=>sp(key,w,h,k=>{const b=rect(0,0,w,h);k.fill(b,c);k.dots(b,INK.navy,.035,.3);k.key(b,.014);k.key(rect(w*.15,h*.1,w*.7,h*.35),.012,INK.white);k.key(rect(w*.15,h*.55,w*.7,h*.35),.012,INK.white);k.circle(w*.82,h*.52,.03,INK.gold);},{rim:.014}),
  suitcase:(key:string,w:number,h:number,label:string,c:string=INK.red)=>sp(key,w,h,k=>{const b=rect(0,h*.2,w,h*.8);k.fill(b,c);k.dots(b,INK.navy,.03,.2);k.key(b,.013);k.key(`M${w*.3} ${h*.2} L${w*.3} ${h*.06} L${w*.7} ${h*.06} L${w*.7} ${h*.2}`,.02);const tag=rect(w*.12,h*.42,w*.5,h*.22);k.fill(tag,INK.paper);k.key(tag,.008);k.text(label,w*.37,h*.58,h*.12,INK.navy,{weight:900,max:w*.46});k.key(`M${w*.08} ${h*.3} L${w*.08} ${h*.94} M${w*.92} ${h*.3} L${w*.92} ${h*.94}`,.02,INK.yellow);}),
  /** Little armband / badge disc with one letter or number (captain C, shirt numbers). */
  disc:(key:string,s:number,label:string,c:string=INK.yellow,ink:string=INK.navy)=>sp(key,s,s,k=>{k.fill(ell(s/2,s/2,s*.46,s*.46),c);k.key(ell(s/2,s/2,s*.46,s*.46),.01);k.text(label,s/2,s*.68,s*.5,ink,{weight:900});},{rim:.012}),
  flag:(key:string,w:number,h:number,bands:string[],vertical=false)=>sp(key,w,h,k=>{k.keyFill(rect(0,0,.04,h),INK.brown);const fw=w-.04,fh=h*.55;bands.forEach((c,i)=>{const r=vertical?rect(.04+i*fw/bands.length,0,fw/bands.length,fh):rect(.04,i*fh/bands.length,fw,fh/bands.length);k.fill(r,c);});k.key(rect(.04,0,fw,fh),.012);}),
 };
}

/** Two ball cut-outs (one per page) share one trajectory so a pass can cross the gutter. */
export function ballPair(B:Builder,key:string,r=.11){const L=B.stand(S.ball(key,r),-1,1,{layer:3,tab:false}),R=B.stand(S.ball(key,r),1,1,{layer:3,tab:false});
 return (x:number,z:number,dy=0,vis=true)=>{const l=x<0;for(const [p,on] of [[L,l],[R,!l]] as const){p.visible=vis&&on;if(on){p.x=x;p.z=z;p.dy=dy;p.rot=-x*5;}}};}
