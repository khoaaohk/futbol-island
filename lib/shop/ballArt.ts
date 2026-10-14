/**
 * Football shop · Ball studio art (Oct 12 2026). Everything printed on a shop ball is drawn here with Canvas 2D, on demand:
 *  - stickers: our own original drawings (star, flame, bolt, crown, heart, paw, palm, planet, rocket, rainbow, smile, ball);
 *  - flags: SIMPLIFIED SELF-DRAWN flags (plain geometry, drawn by us for this game; no third-party flag artwork, so there is no
 *    external licence to carry; national flags themselves are public symbols). Emblems/crests are left out or reduced to shapes;
 *  - text (curated quotes, the kid's filtered name, the number);
 *  - the pattern layer: an equirectangular MASK (red = pattern colour 1 coverage, green = colour 2), so recolouring is a
 *    uniform change and only a new pattern/seed redraws (lib/shop/ballStage.ts debounces the upload).
 * No maker marks, no tournament names, no logos.
 */
import type {PatternKind} from './ball';

type G=CanvasRenderingContext2D;
const TAU=Math.PI*2;
/** Seeded PRNG (mulberry32) so a pattern seed always draws the same ball. */
export function rng(seed:number){let a=(seed|0)+0x6d2b79f5;return ()=>{a=(a+0x6d2b79f5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296;};}
function starPath(g:G,cx:number,cy:number,R:number,r:number,n=5,rot=-Math.PI/2){g.beginPath();for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n,rr=i%2?r:R;const x=cx+Math.cos(a)*rr,y=cy+Math.sin(a)*rr;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();}
function circle(g:G,x:number,y:number,r:number){g.beginPath();g.arc(x,y,r,0,TAU);}
function fill(g:G,c:string){g.fillStyle=c;g.fill();}

// ---- Stickers (drawn in a 100×100 box) --------------------------------------------------------------------------------------
const STICKERS:Record<string,(g:G)=>void>={
 star(g){starPath(g,50,54,46,20);fill(g,'#ffc928');g.save();g.clip();starPath(g,50,54,46,20);g.fillStyle='#ff9f1c';g.fillRect(50,0,60,110);g.restore();
  starPath(g,50,54,46,20);g.lineWidth=3;g.strokeStyle='#c46a00';g.lineJoin='round';g.stroke();circle(g,38,44,5);fill(g,'#fff6c9');},
 flame(g){const p=new Path2D('M50 4C58 22 78 30 80 56C82 80 66 96 50 96C32 96 18 82 20 60C21 46 30 38 34 28C38 40 44 44 48 44C46 30 44 18 50 4Z');g.fillStyle='#ff5a1f';g.fill(p);
  const q=new Path2D('M50 40C56 52 68 58 67 72C66 84 58 90 50 90C41 90 33 83 34 72C35 62 42 58 44 50C46 56 50 58 52 58C51 52 49 46 50 40Z');g.fillStyle='#ffb12a';g.fill(q);
  const r=new Path2D('M50 64C54 70 59 73 58 80C57 85 54 88 50 88C45 88 42 85 42 80C42 75 46 72 50 64Z');g.fillStyle='#fff1a8';g.fill(r);g.lineWidth=3;g.strokeStyle='#b8320a';g.stroke(p);},
 bolt(g){const p=new Path2D('M58 2L16 56H44L36 98L84 38H56L66 2Z');g.fillStyle='#ffd23f';g.fill(p);g.save();g.clip(p);g.fillStyle='#ffae00';g.fillRect(52,0,60,100);g.restore();g.lineWidth=4;g.lineJoin='round';g.strokeStyle='#1d1f24';g.stroke(p);},
 crown(g){const p=new Path2D('M10 34L30 54L50 18L70 54L90 34L82 80H18Z');g.fillStyle='#ffc928';g.fill(p);g.fillStyle='#e8a700';g.fillRect(18,70,64,10);g.lineWidth=3;g.lineJoin='round';g.strokeStyle='#a86a00';g.stroke(p);
  circle(g,50,18,6);fill(g,'#ff6fb5');circle(g,10,34,5);fill(g,'#3aa7ff');circle(g,90,34,5);fill(g,'#3aa7ff');circle(g,50,62,6);fill(g,'#e8423f');circle(g,32,64,4);fill(g,'#2fb36d');circle(g,68,64,4);fill(g,'#2fb36d');},
 heart(g){const p=new Path2D('M50 92C30 76 6 60 6 36C6 20 18 10 31 10C40 10 46 15 50 22C54 15 60 10 69 10C82 10 94 20 94 36C94 60 70 76 50 92Z');g.fillStyle='#ff3d6e';g.fill(p);g.save();g.clip(p);g.fillStyle='#d81e50';g.beginPath();g.ellipse(70,80,50,40,0,0,TAU);g.fill();g.restore();
  g.lineWidth=3;g.strokeStyle='#a5103a';g.stroke(p);g.beginPath();g.ellipse(28,30,9,6,-.6,0,TAU);fill(g,'#ffd0dc');},
 paw(g){g.fillStyle='#6b3fa0';g.beginPath();g.ellipse(50,66,24,20,0,0,TAU);g.fill();for(const [x,y,r] of [[20,40,10],[38,22,11],[62,22,11],[80,40,10]] as const){g.beginPath();g.ellipse(x,y,r,r*1.2,0,0,TAU);g.fill();}
  g.fillStyle='#c9a6f2';g.beginPath();g.ellipse(44,60,8,5,-.5,0,TAU);g.fill();},
 palm(g){g.fillStyle='#8b5a2b';const t=new Path2D('M46 96C48 74 50 56 56 40L62 42C58 58 56 76 58 96Z');g.fill(t);g.strokeStyle='#5d3a17';g.lineWidth=2;g.stroke(t);
  const leaf=(rot:number,len:number)=>{g.save();g.translate(58,38);g.rotate(rot);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(len*.5,-14,len,6);g.quadraticCurveTo(len*.5,-2,0,0);g.fillStyle='#2fb36d';g.fill();g.strokeStyle='#1d7a46';g.lineWidth=2;g.stroke();g.restore();};
  leaf(-2.7,40);leaf(-2.1,42);leaf(-1.3,38);leaf(-.4,42);leaf(.2,38);circle(g,52,44,5);fill(g,'#7a4a1c');circle(g,62,46,5);fill(g,'#7a4a1c');},
 planet(g){circle(g,50,50,30);fill(g,'#ff8a2a');g.save();circle(g,50,50,30);g.clip();g.fillStyle='#ffb35c';g.fillRect(0,34,100,8);g.fillRect(0,54,100,6);g.fillStyle='#e0651a';g.beginPath();g.ellipse(68,70,30,24,0,0,TAU);g.globalAlpha=.5;g.fill();g.restore();
  g.save();g.translate(50,50);g.rotate(-.35);g.beginPath();g.ellipse(0,0,48,13,0,0,TAU);g.lineWidth=7;g.strokeStyle='#8a5cf6';g.stroke();g.restore();
  g.save();circle(g,50,50,30);g.clip();g.translate(50,50);g.rotate(-.35);g.beginPath();g.ellipse(0,0,48,13,0,Math.PI,TAU);g.lineWidth=7;g.strokeStyle='#ff8a2a';g.stroke();g.restore();
  starPath(g,16,18,7,3,4,0);fill(g,'#ffd23f');starPath(g,86,84,6,2.5,4,0);fill(g,'#ffd23f');},
 rocket(g){g.save();g.translate(50,50);g.rotate(.62);g.translate(-50,-50);const b=new Path2D('M50 4C66 18 70 40 68 66H32C30 40 34 18 50 4Z');g.fillStyle='#f7f4ec';g.fill(b);g.lineWidth=3;g.strokeStyle='#1c2a5e';g.stroke(b);
  const n=new Path2D('M50 4C58 11 63 20 65 28H35C37 20 42 11 50 4Z');g.fillStyle='#e8423f';g.fill(n);circle(g,50,42,8);fill(g,'#3aa7ff');g.lineWidth=3;g.stroke();
  const f1=new Path2D('M32 50L18 72L32 68Z'),f2=new Path2D('M68 50L82 72L68 68Z');g.fillStyle='#e8423f';g.fill(f1);g.fill(f2);
  const fl=new Path2D('M38 68C40 82 46 90 50 98C54 90 60 82 62 68Z');g.fillStyle='#ffb12a';g.fill(fl);g.restore();},
 rainbow(g){const cols=['#e8423f','#ff8a2a','#ffd23f','#2fb36d','#3aa7ff','#8a5cf6'];cols.forEach((c,i)=>{g.beginPath();g.arc(50,74,44-i*6,Math.PI,TAU);g.lineWidth=6.5;g.strokeStyle=c;g.stroke();});
  for(const x of [14,86]){g.fillStyle='#fff';for(const [dx,dy,r] of [[-8,0,9],[4,-4,11],[14,2,8]] as const){circle(g,x+dx-4,76+dy,r);g.fill();}}},
 smile(g){circle(g,50,50,44);fill(g,'#ffd23f');g.save();circle(g,50,50,44);g.clip();circle(g,62,66,46);g.fillStyle='#ffbe0b';g.globalAlpha=.6;g.fill();g.restore();
  g.lineWidth=3;circle(g,50,50,44);g.strokeStyle='#c78a00';g.stroke();g.fillStyle='#3a2a10';g.beginPath();g.ellipse(36,40,5,8,0,0,TAU);g.fill();g.beginPath();g.ellipse(64,40,5,8,0,0,TAU);g.fill();
  g.beginPath();g.arc(50,54,24,.15*Math.PI,.85*Math.PI);g.lineWidth=6;g.lineCap='round';g.stroke();circle(g,26,60,6);g.fillStyle='#ff8a9a';g.fill();circle(g,74,60,6);g.fill();},
 ball(g){circle(g,50,50,44);fill(g,'#f7f4ec');g.save();circle(g,50,50,44);g.clip();g.fillStyle='#1d1f24';
  const pent=(cx:number,cy:number,r:number,rot:number)=>{g.beginPath();for(let i=0;i<5;i++){const a=rot+i*TAU/5;const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.fill();};
  pent(50,50,15,-Math.PI/2);for(let i=0;i<5;i++){const a=-Math.PI/2+Math.PI/5+i*TAU/5;pent(50+Math.cos(a)*42,50+Math.sin(a)*42,15,a+Math.PI);}g.restore();
  g.lineWidth=3;circle(g,50,50,44);g.strokeStyle='#1d1f24';g.stroke();},
};
export const stickerExists=(id:string)=>id in STICKERS;

// ---- Flags (drawn in a w×h box, 3:2) ----------------------------------------------------------------------------------------
type FlagFn=(g:G,w:number,h:number)=>void;
const hBands=(cols:string[],weights?:number[]):FlagFn=>(g,w,h)=>{const ws=weights??cols.map(()=>1),t=ws.reduce((a,b)=>a+b,0);let y=0;cols.forEach((c,i)=>{const bh=h*ws[i]/t;g.fillStyle=c;g.fillRect(0,y,w,bh+1);y+=bh;});};
const vBands=(cols:string[],weights?:number[]):FlagFn=>(g,w,h)=>{const ws=weights??cols.map(()=>1),t=ws.reduce((a,b)=>a+b,0);let x=0;cols.forEach((c,i)=>{const bw=w*ws[i]/t;g.fillStyle=c;g.fillRect(x,0,bw+1,h);x+=bw;});};
const nordic=(bg:string,cross:string,inner?:string):FlagFn=>(g,w,h)=>{g.fillStyle=bg;g.fillRect(0,0,w,h);const cx=w*.36,t=h*.2;g.fillStyle=cross;g.fillRect(cx-t/2,0,t,h);g.fillRect(0,h/2-t/2,w,t);
 if(inner){const t2=t*.5;g.fillStyle=inner;g.fillRect(cx-t2/2,0,t2,h);g.fillRect(0,h/2-t2/2,w,t2);}};
function star5(g:G,x:number,y:number,r:number,c:string){starPath(g,x,y,r,r*.4);g.fillStyle=c;g.fill();}
function unionJack(g:G,w:number,h:number){g.fillStyle='#012169';g.fillRect(0,0,w,h);g.save();g.beginPath();g.rect(0,0,w,h);g.clip();g.lineCap='butt';
 g.strokeStyle='#fff';g.lineWidth=h*.2;g.beginPath();g.moveTo(0,0);g.lineTo(w,h);g.moveTo(w,0);g.lineTo(0,h);g.stroke();
 g.strokeStyle='#c8102e';g.lineWidth=h*.067;g.beginPath();g.moveTo(0,0);g.lineTo(w,h);g.moveTo(w,0);g.lineTo(0,h);g.stroke();
 g.fillStyle='#fff';g.fillRect(w/2-h*.167,0,h*.333,h);g.fillRect(0,h/2-h*.167,w,h*.333);g.fillStyle='#c8102e';g.fillRect(w/2-h*.1,0,h*.2,h);g.fillRect(0,h/2-h*.1,w,h*.2);g.restore();}
function sun(g:G,x:number,y:number,r:number,c:string,face='#f6b40e'){g.save();g.translate(x,y);g.fillStyle=c;for(let i=0;i<16;i++){g.rotate(TAU/16);g.beginPath();g.moveTo(-r*.18,r*.55);g.lineTo(0,r*(i%2?1:1.25));g.lineTo(r*.18,r*.55);g.fill();}circle(g,0,0,r*.6);g.fillStyle=face;g.fill();g.restore();}
const FLAGS:Record<string,FlagFn>={
 ar(g,w,h){hBands(['#74acdf','#fff','#74acdf'])(g,w,h);sun(g,w/2,h/2,h*.13,'#f6b40e');},
 au(g,w,h){g.fillStyle='#012169';g.fillRect(0,0,w,h);unionJack(g,w/2,h/2);star5(g,w*.25,h*.75,h*.11,'#fff');for(const [x,y,r] of [[.75,.25,.06],[.62,.48,.06],[.75,.82,.065],[.86,.42,.06],[.81,.56,.035]])star5(g,w*x,h*y,h*r,'#fff');},
 be:vBands(['#1d1f24','#fdda24','#ef3340']),
 br(g,w,h){g.fillStyle='#009c3b';g.fillRect(0,0,w,h);g.beginPath();g.moveTo(w*.08,h/2);g.lineTo(w/2,h*.1);g.lineTo(w*.92,h/2);g.lineTo(w/2,h*.9);g.closePath();fill(g,'#ffdf00');circle(g,w/2,h/2,h*.24);fill(g,'#002776');
  g.save();circle(g,w/2,h/2,h*.24);g.clip();g.beginPath();g.arc(w/2-h*.08,h*.95,h*.5,-Math.PI*.82,-Math.PI*.18);g.lineWidth=h*.05;g.strokeStyle='#fff';g.stroke();g.restore();},
 ca(g,w,h){vBands(['#d52b1e','#fff','#d52b1e'],[1,2,1])(g,w,h);g.save();g.translate(w/2,h/2);const s=h/100;g.scale(s,s);
  const p=new Path2D('M0 -38L7 -24L15 -28L12 -6L25 -18L28 -11L40 -13L35 1L40 4L20 18L23 26L3 23L3 40H-3L-3 23L-23 26L-20 18L-40 4L-35 1L-40 -13L-28 -11L-25 -18L-12 -6L-15 -28L-7 -24Z');g.fillStyle='#d52b1e';g.fill(p);g.restore();},
 cm(g,w,h){vBands(['#007a5e','#ce1126','#fcd116'])(g,w,h);star5(g,w/2,h/2,h*.16,'#fcd116');},
 ch(g,w,h){g.fillStyle='#da291c';g.fillRect(0,0,w,h);g.fillStyle='#fff';const a=h*.6,t=h*.19;g.fillRect(w/2-t/2,h/2-a/2,t,a);g.fillRect(w/2-a/2,h/2-t/2,a,t);},
 cl(g,w,h){hBands(['#fff','#d52b1e'])(g,w,h);g.fillStyle='#0039a6';g.fillRect(0,0,h/2,h/2);star5(g,h/4,h/4,h*.12,'#fff');},
 co:hBands(['#fcd116','#003893','#ce1126'],[2,1,1]),
 de:hBands(['#1d1f24','#dd0000','#ffce00']),
 dk:nordic('#c8102e','#fff'),
 es(g,w,h){hBands(['#aa151b','#f1bf00','#aa151b'],[1,2,1])(g,w,h);g.fillStyle='#aa151b';g.fillRect(w*.26,h*.38,w*.08,h*.24);},
 fr:vBands(['#0055a4','#fff','#ef4135']),
 gb:unionJack,
 'gb-eng'(g,w,h){g.fillStyle='#fff';g.fillRect(0,0,w,h);g.fillStyle='#ce1124';const t=h*.2;g.fillRect(w/2-t/2,0,t,h);g.fillRect(0,h/2-t/2,w,t);},
 'gb-sct'(g,w,h){g.fillStyle='#005eb8';g.fillRect(0,0,w,h);g.save();g.beginPath();g.rect(0,0,w,h);g.clip();g.strokeStyle='#fff';g.lineWidth=h*.2;g.beginPath();g.moveTo(0,0);g.lineTo(w,h);g.moveTo(w,0);g.lineTo(0,h);g.stroke();g.restore();},
 gh(g,w,h){hBands(['#ce1126','#fcd116','#006b3f'])(g,w,h);star5(g,w/2,h/2,h*.15,'#1d1f24');},
 gr(g,w,h){for(let i=0;i<9;i++){g.fillStyle=i%2?'#fff':'#0d5eaf';g.fillRect(0,i*h/9,w,h/9+1);}g.fillStyle='#0d5eaf';g.fillRect(0,0,h*5/9,h*5/9);g.fillStyle='#fff';g.fillRect(h*2/9,0,h/9,h*5/9);g.fillRect(0,h*2/9,h*5/9,h/9);},
 hr(g,w,h){hBands(['#ff0000','#fff','#171796'])(g,w,h);const s=h*.07,x0=w/2-s*2.5,y0=h*.28;g.fillStyle='#fff';g.fillRect(x0,y0,s*5,s*6);g.fillStyle='#ff0000';for(let i=0;i<5;i++)for(let j=0;j<6;j++)if((i+j)%2===0)g.fillRect(x0+i*s,y0+j*s,s,s);g.strokeStyle='#ff0000';g.lineWidth=h*.015;g.strokeRect(x0,y0,s*5,s*6);},
 ie:vBands(['#169b62','#fff','#ff883e']),
 it:vBands(['#009246','#fff','#ce2b37']),
 jm(g,w,h){g.fillStyle='#009b3a';g.fillRect(0,0,w,h);g.fillStyle='#1d1f24';g.beginPath();g.moveTo(0,0);g.lineTo(w/2,h/2);g.lineTo(0,h);g.fill();g.beginPath();g.moveTo(w,0);g.lineTo(w/2,h/2);g.lineTo(w,h);g.fill();
  g.save();g.beginPath();g.rect(0,0,w,h);g.clip();g.strokeStyle='#fed100';g.lineWidth=h*.14;g.beginPath();g.moveTo(0,0);g.lineTo(w,h);g.moveTo(w,0);g.lineTo(0,h);g.stroke();g.restore();},
 jp(g,w,h){g.fillStyle='#fff';g.fillRect(0,0,w,h);circle(g,w/2,h/2,h*.3);fill(g,'#bc002d');},
 kr(g,w,h){g.fillStyle='#fff';g.fillRect(0,0,w,h);const r=h*.25,x=w/2,y=h/2;g.save();g.translate(x,y);g.rotate(Math.atan2(2,3));circle(g,0,0,r);fill(g,'#0047a0');g.beginPath();g.arc(0,0,r,Math.PI,TAU);fill(g,'#cd2e3a');
  circle(g,-r/2,0,r/2);fill(g,'#cd2e3a');circle(g,r/2,0,r/2);fill(g,'#0047a0');g.restore();
  g.fillStyle='#1d1f24';for(const [cx,cy,a] of [[.2,.22,1],[.8,.78,1],[.8,.22,-1],[.2,.78,-1]] as const){g.save();g.translate(w*cx,h*cy);g.rotate(a*Math.atan2(2,3)+Math.PI/2);for(let i=0;i<3;i++)g.fillRect(-h*.12,-h*.1+i*h*.075,h*.24,h*.05);g.restore();}},
 ma(g,w,h){g.fillStyle='#c1272d';g.fillRect(0,0,w,h);g.beginPath();for(let i=0;i<=5;i++){const a=-Math.PI/2+i*TAU*2/5;const x=w/2+Math.cos(a)*h*.24,y=h/2+Math.sin(a)*h*.24;i?g.lineTo(x,y):g.moveTo(x,y);}g.lineWidth=h*.045;g.lineJoin='miter';g.strokeStyle='#006233';g.stroke();},
 mx(g,w,h){vBands(['#006847','#fff','#ce1126'])(g,w,h);circle(g,w/2,h/2,h*.14);fill(g,'#8c5a2b');g.beginPath();g.arc(w/2,h/2,h*.17,.2*Math.PI,.8*Math.PI);g.lineWidth=h*.035;g.strokeStyle='#4c8c2b';g.stroke();},
 ng:vBands(['#008751','#fff','#008751']),
 nl:hBands(['#ae1c28','#fff','#21468b']),
 no:nordic('#ba0c2f','#fff','#00205b'),
 nz(g,w,h){g.fillStyle='#012169';g.fillRect(0,0,w,h);unionJack(g,w/2,h/2);for(const [x,y,r] of [[.75,.22,.07],[.66,.47,.07],[.86,.43,.06],[.75,.8,.08]]){star5(g,w*x,h*y,h*r*1.25,'#fff');star5(g,w*x,h*y,h*r,'#c8102e');}},
 pl:hBands(['#fff','#dc143c']),
 pt(g,w,h){vBands(['#006600','#ff0000'],[2,3])(g,w,h);circle(g,w*.4,h/2,h*.2);fill(g,'#ffcc00');circle(g,w*.4,h/2,h*.11);fill(g,'#fff');g.lineWidth=h*.03;g.strokeStyle='#ff0000';g.stroke();},
 se:nordic('#006aa7','#fecc00'),
 sn(g,w,h){vBands(['#00853f','#fdef42','#e31b23'])(g,w,h);star5(g,w/2,h/2,h*.15,'#00853f');},
 ua:hBands(['#0057b7','#ffd700']),
 us(g,w,h){for(let i=0;i<13;i++){g.fillStyle=i%2?'#fff':'#b22234';g.fillRect(0,i*h/13,w,h/13+1);}g.fillStyle='#3c3b6e';g.fillRect(0,0,w*.4,h*7/13);for(let r=0;r<5;r++)for(let c=0;c<6;c++)star5(g,w*.04+c*w*.064+(r%2)*w*.032,h*.055+r*h*.1,h*.028,'#fff');},
 uy(g,w,h){for(let i=0;i<9;i++){g.fillStyle=i%2?'#0038a8':'#fff';g.fillRect(0,i*h/9,w,h/9+1);}g.fillStyle='#fff';g.fillRect(0,0,h*5/9,h*5/9);sun(g,h*2.5/9,h*2.5/9,h*.17,'#fcd116');},
 vn(g,w,h){g.fillStyle='#da251d';g.fillRect(0,0,w,h);star5(g,w/2,h/2,h*.3,'#ffcd00');},
 ph(g,w,h){hBands(['#0038a8','#ce1126'])(g,w,h);g.beginPath();g.moveTo(0,0);g.lineTo(h*.866,h/2);g.lineTo(0,h);g.closePath();fill(g,'#fff');sun(g,h*.3,h/2,h*.12,'#fcd116','#fcd116');for(const [x,y] of [[.08,.12],[.08,.88],[.7,.5]])star5(g,h*x,h*y,h*.05,'#fcd116');},
 in(g,w,h){hBands(['#ff9933','#fff','#138808'])(g,w,h);circle(g,w/2,h/2,h*.13);g.lineWidth=h*.025;g.strokeStyle='#000080';g.stroke();g.save();g.translate(w/2,h/2);for(let i=0;i<24;i++){g.rotate(TAU/24);g.beginPath();g.moveTo(0,0);g.lineTo(0,h*.13);g.lineWidth=h*.008;g.stroke();}g.restore();},
};
export const flagExists=(code:string)=>code in FLAGS;

// ---- Decal images -----------------------------------------------------------------------------------------------------------
export const TEXT_FONT='Knewave';
/** Wait (briefly) for the decal font so the first draw isn't the fallback face. */
export async function loadDecalFonts(){try{await Promise.race([Promise.all([document.fonts.load(`64px ${TEXT_FONT}`),document.fonts.load('64px IslandBrush')]),new Promise(r=>setTimeout(r,1500))]);}catch{}}
/** Draw `art` into a w×h canvas, then put a white die-cut border (b px) round its silhouette with a soft shadow. */
function dieCut(w:number,h:number,b:number,art:(g:G)=>void,border='#ffffff'):HTMLCanvasElement{
 const pad=b+3,W=w+pad*2,H=h+pad*2;const a=document.createElement('canvas');a.width=W;a.height=H;const ga=a.getContext('2d')!;ga.translate(pad,pad);art(ga);
 const o=document.createElement('canvas');o.width=W;o.height=H;const go=o.getContext('2d')!;
 for(let i=0;i<20;i++){const t=i/20*TAU;go.drawImage(a,Math.cos(t)*b,Math.sin(t)*b);}go.globalCompositeOperation='source-in';go.fillStyle=border;go.fillRect(0,0,W,H);
 const out=document.createElement('canvas');out.width=W;out.height=H;const g=out.getContext('2d')!;g.drawImage(o,0,0);g.drawImage(a,0,0);return out;}

/** A decal's image and its aspect (width/height). Text decals measure their width. */
export function decalImage(kind:string,ref:string,color:string,text:string,px:number):{canvas:HTMLCanvasElement;aspect:number}{
 if(kind==='sticker'){const draw=STICKERS[ref]??STICKERS.star;const s=px/100*.86;const c=dieCut(px*.86,px*.86,px*.05,g=>{g.scale(s,s);draw(g);});return {canvas:c,aspect:c.width/c.height};}
 if(kind==='flag'){const draw=FLAGS[ref]??FLAGS.jp,h=Math.round(px*.62),w=Math.round(h*1.5);
  const c=dieCut(w,h,px*.045,g=>{g.save();const r=h*.12;g.beginPath();g.roundRect(0,0,w,h,r);g.clip();draw(g,w,h);
   const gl=g.createLinearGradient(0,0,w,h);gl.addColorStop(0,'rgba(255,255,255,.18)');gl.addColorStop(.5,'rgba(255,255,255,0)');gl.addColorStop(1,'rgba(0,0,0,.12)');g.fillStyle=gl;g.fillRect(0,0,w,h);g.restore();});
  return {canvas:c,aspect:c.width/c.height};}
 // Text: quotes in the brush face, names and numbers in the bold round face; ink in the kid's colour with a dark rim.
 const isNum=kind==='number',isQuote=kind==='quote',fs=Math.round(px*(isNum?.78:.42));
 const font=isQuote?`${fs}px IslandBrush, ${TEXT_FONT}, Arial Black, sans-serif`:`${fs}px ${TEXT_FONT}, Arial Black, sans-serif`;
 const m=document.createElement('canvas').getContext('2d')!;m.font=font;const label=isQuote?text:text.toUpperCase();
 const tw=Math.ceil(m.measureText(label).width),w=Math.min(px*4,tw+fs*.3),h=Math.round(fs*1.25);
 const dark=lum(color)>.55?'#1d1f24':'#ffffff';
 const c=dieCut(w,h,Math.max(3,fs*.11),g=>{g.font=font;g.textAlign='center';g.textBaseline='middle';const sx=tw>w-fs*.3?(w-fs*.3)/tw:1;g.save();g.translate(w/2,h*.54);g.scale(sx,1);
  g.lineJoin='round';g.lineWidth=fs*.12;g.strokeStyle=dark;g.strokeText(label,0,0);g.fillStyle=color;g.fillText(label,0,0);g.restore();},dark==='#ffffff'?'#1d1f24':'#ffffff');
 return {canvas:c,aspect:c.width/c.height};
}
function lum(hex:string){const n=parseInt(hex.slice(1),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255;return .2126*r+.7152*g+.0722*b;}

// ---- Pattern mask (equirectangular: x = longitude 0..2π, y = latitude north → south) ----------------------------------------
/**
 * Draw the pattern mask into a W×H canvas (W = 2H). Red = colour 1 coverage, green = colour 2 coverage, on black. Shapes
 * near the poles are kept small, shapes are stretched by 1/cos(latitude) so they look round on the ball, and anything that
 * crosses the 0/2π seam is drawn twice so the wrap is invisible.
 */
export function drawPatternMask(c:HTMLCanvasElement,kind:PatternKind,seed:number){
 const g=c.getContext('2d')!,W=c.width,H=c.height,R=rng(seed*7919+13);g.globalCompositeOperation='source-over';g.fillStyle='#000';g.fillRect(0,0,W,H);
 if(kind==='none')return;g.globalCompositeOperation='lighter';
 const RED='#ff0000',GREEN='#00ff00';
 const wrap=(x:number,r:number,fn:(dx:number)=>void)=>{fn(0);if(x-r<0)fn(W);if(x+r>W)fn(-W);};
 /** A shape at (lon x, lat y) with radius r in "ball pixels": stretched horizontally by 1/cos(lat). */
 const at=(x:number,y:number,r:number,draw:(g:G)=>void,rot=0)=>{const lat=(y/H-.5)*Math.PI,sx=1/Math.max(.25,Math.cos(lat));wrap(x,r*sx,dx=>{g.save();g.translate(x+dx,y);g.scale(sx,1);g.rotate(rot);draw(g);g.restore();});};
 const latY=(deg:number)=>H*(.5-deg/180);
 switch(kind){
  case 'stripes':{const bands=[[0,14,RED],[22,4,GREEN],[-22,4,GREEN],[34,2.5,RED],[-34,2.5,RED]] as const;
   for(const [lat,half,col] of bands){g.fillStyle=col;g.fillRect(0,latY(lat+half),W,latY(lat-half)-latY(lat+half));}break;}
  case 'swoosh':{const ph=R()*TAU;const ribbon=(amp:number,off:number,th0:number,th1:number,col:string,phase:number)=>{
    g.beginPath();const N=128;for(let i=0;i<=N;i++){const t=i/N,x=t*W,y=H/2+off+amp*Math.sin(t*TAU+phase),th=th0+(th1-th0)*(.5+.5*Math.sin(t*TAU*2+phase));i?g.lineTo(x,y-th):g.moveTo(x,y-th);}
    for(let i=N;i>=0;i--){const t=i/N,x=t*W,y=H/2+off+amp*Math.sin(t*TAU+phase),th=th0+(th1-th0)*(.5+.5*Math.sin(t*TAU*2+phase));g.lineTo(x,y+th*.4);}g.closePath();g.fillStyle=col;g.fill();};
   ribbon(H*.18,0,H*.02,H*.1,RED,ph);ribbon(H*.18,H*.07,H*.006,H*.025,GREEN,ph+.35);ribbon(H*.12,-H*.2,H*.004,H*.018,GREEN,ph+2.4);break;}
  case 'stars':{for(let i=0;i<46;i++){const y=latY((R()*2-1)*68),x=R()*W,r=H*(.018+R()*.045),col=R()<.7?RED:GREEN;at(x,y,r,gg=>{starPath(gg,0,0,r,r*.45);gg.fillStyle=col;gg.fill();},R()*TAU);}break;}
  case 'splatter':{for(let i=0;i<14;i++){const y=latY((R()*2-1)*60),x=R()*W,r=H*(.04+R()*.07),col=i%3===2?GREEN:RED;
    const rim=Array.from({length:15},()=>r*(.75+R()*.5));rim[14]=rim[0];const drops=Array.from({length:9},()=>{const a=R()*TAU,d=r*(1.2+R()*1.1);return [Math.cos(a)*d,Math.sin(a)*d,r*(.08+R()*.18)];});
    at(x,y,r*2.4,gg=>{gg.fillStyle=col;gg.beginPath();rim.forEach((rr,k)=>{const a=k/14*TAU;k?gg.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):gg.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);});gg.closePath();gg.fill();
     for(const [dx,dy,s] of drops){circle(gg,dx,dy,s);gg.fill();}});}break;}
  case 'gradient':{const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#ff0000');gr.addColorStop(.48,'#000000');gr.addColorStop(1,'#000000');g.fillStyle=gr;g.fillRect(0,0,W,H);
   const g2=g.createLinearGradient(0,0,0,H);g2.addColorStop(0,'#000000');g2.addColorStop(.52,'#000000');g2.addColorStop(1,'#00ff00');g.fillStyle=g2;g.fillRect(0,0,W,H);break;}
  case 'confetti':{for(let i=0;i<150;i++){const y=latY((R()*2-1)*72),x=R()*W,r=H*(.008+R()*.014),col=R()<.5?RED:GREEN,sh=R();
    at(x,y,r*2,gg=>{gg.fillStyle=col;if(sh<.45)gg.fillRect(-r*1.6,-r*.55,r*3.2,r*1.1);else if(sh<.75){circle(gg,0,0,r);gg.fill();}else{gg.beginPath();gg.moveTo(0,-r*1.3);gg.lineTo(r*1.2,r);gg.lineTo(-r*1.2,r);gg.closePath();gg.fill();}},R()*TAU);}break;}
  case 'waves':{const ph=R()*TAU;for(const [base,amp,k,col,fillDown] of [[latY(-8),H*.05,3,RED,true],[latY(14),H*.035,4,GREEN,false],[latY(-30),H*.03,5,GREEN,false]] as const){
    g.beginPath();const N=160;for(let i=0;i<=N;i++){const t=i/N,y=base+amp*Math.sin(t*TAU*k+ph);i?g.lineTo(t*W,y):g.moveTo(t*W,y);}
    if(fillDown){g.lineTo(W,H*.86);g.lineTo(0,H*.86);g.closePath();g.fillStyle=col;g.fill();}else{g.lineWidth=H*.022;g.strokeStyle=col;g.stroke();}}break;}
  case 'flames':{const n=12,base=latY(-62);for(const [col,scale] of [[RED,1],[GREEN,.55]] as const){g.fillStyle=col;g.beginPath();g.moveTo(0,H);g.lineTo(0,base);
    const R2=rng(seed*31+7);for(let i=0;i<n;i++){const x0=i/n*W,x1=(i+1)/n*W,mid=(x0+x1)/2,ht=H*(.28+R2()*.32)*scale,lean=(R2()-.5)*W/n*.9;
     g.bezierCurveTo(x0+W/n*.15,base-ht*.35,mid+lean-W/n*.25,base-ht*.75,mid+lean,base-ht);g.bezierCurveTo(mid+lean+W/n*.1,base-ht*.6,x1-W/n*.2,base-ht*.3,x1,base);}
    g.lineTo(W,H);g.closePath();g.fill();}break;}
 }
 g.globalCompositeOperation='source-over';
}
