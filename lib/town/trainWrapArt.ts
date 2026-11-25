/**
 * Kindness train wraps: the drawings (owner, Nov 24 2026: "a graphics wrap on each train … the theme is being kind to one another …
 * like Japanese trains sometimes have a Pokémon or anime theme … keep it positive"). ORIGINAL art only: the island's own bean
 * islanders (a round head on a bean body, stubby limbs, dot eyes, rosy cheeks) and Conductor Kenji (navy cap and jacket), drawn
 * from plain vector shapes with thick ink outlines so they read from the platform and the overview camera. No characters, logos
 * or look-alikes of any franchise or brand.
 * Pure canvas drawing (no three.js, no DOM look-ups): lib/town/trainWraps.ts lays the tiles out in ONE atlas and calls these once
 * at load. Every tile is drawn in its own units: 100 high, `w` wide (the panel's aspect × 100); the badge in a 100 × 100 square.
 */
export type WrapCtx=CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D;
const INK='#2b2420',WHITE='#fffdf7',CHEEK='rgba(242,120,120,.55)',GRASS='#7cc25a',GRASS2='#5fa846',BOOT='#3a3330';
const SKIN=['#fde6d2','#f6d2b0','#e9b98f','#c98f63','#a86f48','#7a4b31'] as const;
const HAIR=['#2b211c','#5a3a24','#c98a3c','#1d1a18','#8a4b2a'] as const;
/** Per theme: the tile background (top, bottom), the frame (the livery's accent, so the panels sit on the body), the slogan ribbon,
 *  and the two teams' kits (always two teams: kindness to the other side is the point). */
export const WRAP_LOOK=[
 {bg:'#fff6df',bg2:'#ffe3ad',frame:'#8c2a2f',ribbon:'#8c2a2f',ribbonInk:WHITE,accent:'#f2b12e',teamA:'#e5483d',teamB:'#2f7fd6',shortsA:'#ffffff',shortsB:'#1d3f73'},
 {bg:'#e8f8f1',bg2:'#c2ead9',frame:'#2f6fae',ribbon:'#2f6fae',ribbonInk:WHITE,accent:'#d6343a',teamA:'#36a35a',teamB:'#f08a2c',shortsA:'#ffffff',shortsB:'#7a3d12'},
 {bg:'#e9f2fd',bg2:'#c6dcf6',frame:'#f5c21b',ribbon:'#1f5c9c',ribbonInk:'#ffe27a',accent:'#f5c21b',teamA:'#e5483d',teamB:'#2f7fd6',shortsA:'#ffffff',shortsB:'#1d3f73'},
] as const;

// ---------------------------------------------------------------- shapes
function line(c:WrapCtx,x0:number,y0:number,x1:number,y1:number,col:string,w:number,ink=2.4){c.lineCap='round';
 c.strokeStyle=INK;c.lineWidth=w+ink*2;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();
 c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();}
function blob(c:WrapCtx,x:number,y:number,rx:number,ry:number,col:string,ink=2.4,rot=0){c.beginPath();c.ellipse(x,y,rx,ry,rot,0,Math.PI*2);c.fillStyle=col;c.fill();if(ink>0){c.lineWidth=ink;c.strokeStyle=INK;c.stroke();}}
export function heart(c:WrapCtx,x:number,y:number,s:number,col='#ef4f5f',ink=2){c.save();c.translate(x,y);c.scale(s/10,s/10);c.beginPath();
 c.moveTo(0,8);c.bezierCurveTo(-11,0,-9,-9,-4,-9);c.bezierCurveTo(-1.5,-9,0,-7,0,-5);c.bezierCurveTo(0,-7,1.5,-9,4,-9);c.bezierCurveTo(9,-9,11,0,0,8);c.closePath();
 c.fillStyle=col;c.fill();if(ink>0){c.lineWidth=ink*10/s;c.strokeStyle=INK;c.stroke();}c.beginPath();c.ellipse(-4.2,-5,1.8,1.2,-.6,0,Math.PI*2);c.fillStyle='rgba(255,255,255,.7)';c.fill();c.restore();}
export function star(c:WrapCtx,x:number,y:number,r:number,col='#ffd23f',ink=1.8){c.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.46:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();
 c.fillStyle=col;c.fill();if(ink>0){c.lineJoin='round';c.lineWidth=ink;c.strokeStyle=INK;c.stroke();}}
/** A football: white with a dark centre patch and five spokes to dark edge patches (a simple, generic ball). */
export function ball(c:WrapCtx,x:number,y:number,r:number,ink=2){c.save();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=WHITE;c.fill();c.clip();
 const pent=(px:number,py:number,pr:number,rot:number)=>{c.beginPath();for(let k=0;k<5;k++){const a=rot+k*Math.PI*2/5;c.lineTo(px+Math.cos(a)*pr,py+Math.sin(a)*pr);}c.closePath();c.fillStyle=INK;c.fill();};
 pent(x,y,r*.34,-Math.PI/2);c.strokeStyle=INK;c.lineWidth=Math.max(.8,r*.07);
 for(let k=0;k<5;k++){const a=-Math.PI/2+k*Math.PI*2/5;c.beginPath();c.moveTo(x+Math.cos(a)*r*.34,y+Math.sin(a)*r*.34);c.lineTo(x+Math.cos(a)*r*.78,y+Math.sin(a)*r*.78);c.stroke();pent(x+Math.cos(a)*r*1.02,y+Math.sin(a)*r*1.02,r*.3,a+Math.PI);}
 c.restore();c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.lineWidth=ink;c.strokeStyle=INK;c.stroke();}
function confetti(c:WrapCtx,w:number,seed:number,n:number,y0=4,y1=60){let s=seed;const rnd=()=>{s=(s*16807)%2147483647;return s/2147483647;};
 const cols=['#ef4f5f','#ffd23f','#3fb3e8','#7bd06a','#b07ce8','#ff9a3c'];
 for(let k=0;k<n;k++){const x=6+rnd()*(w-12),y=y0+rnd()*(y1-y0),a=rnd()*Math.PI;c.save();c.translate(x,y);c.rotate(a);c.fillStyle=cols[k%cols.length];
  if(k%3===0){c.beginPath();c.arc(0,0,1.7,0,Math.PI*2);c.fill();}else c.fillRect(-2.4,-1,4.8,2);c.restore();}}
function sparkle(c:WrapCtx,x:number,y:number,r:number,col=WHITE){c.save();c.translate(x,y);c.fillStyle=col;c.beginPath();
 for(let k=0;k<8;k++){const a=k*Math.PI/4,rr=k%2?r*.22:r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();c.restore();}
function bottle(c:WrapCtx,x:number,y:number,rot:number){c.save();c.translate(x,y);c.rotate(rot);
 c.beginPath();c.roundRect(-4.2,-9,8.4,17,3);c.fillStyle='#7fd0f5';c.fill();c.lineWidth=2;c.strokeStyle=INK;c.stroke();
 c.fillStyle='rgba(255,255,255,.65)';c.fillRect(-2.6,-6,1.8,10);c.beginPath();c.roundRect(-3,-13,6,4.5,1.5);c.fillStyle='#2f7fd6';c.fill();c.stroke();c.restore();}

// ---------------------------------------------------------------- the bean islander
export type BeanPose={
 x:number;/** feet */y:number;/** scale (1: ~84 units tall) */s?:number;skin:number;kit:string;shorts?:string;hair?:number;
 style?:'crop'|'bob'|'puffs'|'bun'|'spiky'|'cap';cap?:string;
 /** arm angles from straight down (rad): + swings out to that side, π is straight up, − reaches across the body */armL?:number;armR?:number;
 handL?:'open'|'thumb'|'glove';handR?:'open'|'thumb'|'glove';glove?:string;
 legs?:'stand'|'jump'|'sit'|'kick'|'run';face?:'smile'|'joy'|'open';/** eye shift toward a side (−1 … 1) */look?:number;tilt?:number;collar?:string;sash?:string;
 /** drawn first: the arm behind (L or R) for a hug */backArm?:'L'|'R';
};
function arm(c:WrapCtx,side:-1|1,a:number,skin:string,kit:string,hand:'open'|'thumb'|'glove',glove:string){
 const sx=side*13.5,sy=-50,len=21,ex=sx+side*Math.sin(a)*len,ey=sy+Math.cos(a)*len;
 line(c,sx,sy,sx+(ex-sx)*.42,sy+(ey-sy)*.42,kit,8.5);line(c,sx+(ex-sx)*.38,sy+(ey-sy)*.38,ex,ey,skin,6.5);// the sleeve, then the arm
 if(hand==='glove'){blob(c,ex,ey,6.6,6.2,glove,2.2);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(ex-4,ey-1,8,2);}
 else if(hand==='thumb'){// a clear thumbs-up: a wide fist with finger creases, a short thick thumb up at its OUTER edge (never a single raised finger)
  const tx=ex+side*3.4;c.beginPath();c.roundRect(tx-3,ey-12.5,6,9.5,3);c.fillStyle=skin;c.fill();c.lineWidth=2.2;c.strokeStyle=INK;c.stroke();
  c.beginPath();c.roundRect(ex-7,ey-5,14,11.5,4.2);c.fillStyle=skin;c.fill();c.lineWidth=2.2;c.stroke();
  c.lineWidth=1.5;c.lineCap='round';for(const fy of [-1.2,2.4]){c.beginPath();c.moveTo(ex-side*6.2,ey+fy);c.lineTo(ex+side*1.5,ey+fy);c.stroke();}}
 else blob(c,ex,ey,4.7,4.7,skin,2.2);}
function leg(c:WrapCtx,hx:number,hy:number,fx:number,fy:number,skin:string,sock:string){line(c,hx,hy,(hx+fx)/2,(hy+fy)/2,skin,7.5);line(c,(hx+fx)/2,(hy+fy)/2,fx,fy,sock,7.5);
 blob(c,fx+Math.sign(fx-hx||fx||1)*2,fy+1.2,6.2,3.6,BOOT,2);}
export function bean(c:WrapCtx,p:BeanPose){
 const s=p.s??1,skin=SKIN[p.skin%SKIN.length],hair=HAIR[(p.hair??0)%HAIR.length],shorts=p.shorts??'#ffffff',look=(p.look??0)*2.6,glove=p.glove??'#ff9a3c';
 const aL=p.armL??.35,aR=p.armR??.35;
 c.save();c.translate(p.x,p.y);c.scale(s,s);c.rotate(p.tilt??0);c.lineJoin='round';
 // legs
 const L=p.legs??'stand';
 if(L==='stand'){leg(c,-6.5,-18,-8.5,-3,skin,p.kit);leg(c,6.5,-18,8.5,-3,skin,p.kit);}
 else if(L==='jump'){leg(c,-6.5,-18,-13,-9,skin,p.kit);leg(c,6.5,-18,13,-9,skin,p.kit);}
 else if(L==='sit'){leg(c,-6.5,-6,-20,-3,skin,p.kit);leg(c,6.5,-6,20,-3,skin,p.kit);c.translate(0,13);}// sat on the grass: the body drops
 else if(L==='kick'){leg(c,-6.5,-18,-8.5,-3,skin,p.kit);leg(c,6.5,-18,24,-14,skin,p.kit);}
 else {leg(c,-6.5,-18,-15,-6,skin,p.kit);leg(c,6.5,-18,11,-2,skin,p.kit);}
 const hands={L:p.handL??'open',R:p.handR??'open'};
 if(p.backArm==='L')arm(c,-1,aL,skin,p.kit,hands.L,glove);if(p.backArm==='R')arm(c,1,aR,skin,p.kit,hands.R,glove);
 // body: the bean in the kit, the shorts at its foot, a collar
 c.save();c.beginPath();c.ellipse(0,-37,16.5,21.5,0,0,Math.PI*2);c.fillStyle=p.kit;c.fill();c.clip();
 c.fillStyle=shorts;c.fillRect(-20,-27,40,30);if(p.sash){c.fillStyle=p.sash;c.beginPath();c.moveTo(-17,-56);c.lineTo(-8,-56);c.lineTo(17,-30);c.lineTo(17,-22);c.closePath();c.fill();}
 c.fillStyle='rgba(255,255,255,.22)';c.beginPath();c.ellipse(-6,-46,5,9,-.3,0,Math.PI*2);c.fill();c.restore();
 c.beginPath();c.ellipse(0,-37,16.5,21.5,0,0,Math.PI*2);c.lineWidth=2.6;c.strokeStyle=INK;c.stroke();
 c.beginPath();c.moveTo(-6,-57);c.quadraticCurveTo(0,-50,6,-57);c.lineWidth=2.6;c.strokeStyle=p.collar??WHITE;c.stroke();
 // hair behind the head
 if(p.style==='bob'){blob(c,0,-69,17.5,15,hair,2.4);}
 if(p.style==='puffs'){blob(c,-14.5,-77,7.2,7.2,hair,2.2);blob(c,14.5,-77,7.2,7.2,hair,2.2);}
 if(p.style==='bun')blob(c,0,-87,7,6.5,hair,2.2);
 // head
 blob(c,0,-69,15.5,15,skin,2.6);
 // hair on top (clipped to the head), the cap
 c.save();c.beginPath();c.arc(0,-69,15.4,0,Math.PI*2);c.clip();c.fillStyle=hair;
 if(p.style==='spiky'){c.beginPath();c.moveTo(-17,-70);for(let k=0;k<=6;k++){c.lineTo(-15+k*5,k%2?-80:-86);}c.lineTo(17,-70);c.lineTo(17,-90);c.lineTo(-17,-90);c.closePath();c.fill();}
 else if(p.style!=='cap'){c.beginPath();c.ellipse(0,-80.5,18,10.5,0,0,Math.PI*2);c.fill();c.beginPath();c.ellipse(-6+look,-73.5,7,3.2,.25,0,Math.PI*2);c.fill();}
 c.restore();
 if(p.style==='cap'){const cc=p.cap??'#1d2c4a';c.beginPath();c.moveTo(-15.5,-72);c.quadraticCurveTo(-15,-88,0,-88.5);c.quadraticCurveTo(15,-88,15.5,-72);c.closePath();c.fillStyle=cc;c.fill();c.lineWidth=2.4;c.strokeStyle=INK;c.stroke();
  blob(c,4+look*2,-72,13,3.4,cc,2.2);blob(c,0,-80,4.4,3.4,'#f2c230',1.6);}
 // face
 const ey=-68;
 if(p.face==='joy'){c.lineWidth=2.4;c.strokeStyle=INK;c.lineCap='round';for(const ex of [-5.5,5.5]){c.beginPath();c.arc(ex+look,ey+1.4,3,Math.PI*1.15,Math.PI*1.85);c.stroke();}}
 else for(const ex of [-5.5,5.5]){c.beginPath();c.ellipse(ex+look,ey,2.1,2.8,0,0,Math.PI*2);c.fillStyle=INK;c.fill();c.beginPath();c.arc(ex+look+.7,ey-1,.8,0,Math.PI*2);c.fillStyle=WHITE;c.fill();}
 for(const ex of [-10,10]){c.beginPath();c.arc(ex+look*.5,-62.5,3,0,Math.PI*2);c.fillStyle=CHEEK;c.fill();}
 if(p.face==='open'||p.face==='joy'){c.beginPath();c.moveTo(-5+look,-63);c.quadraticCurveTo(look,-54,5+look,-63);c.closePath();c.fillStyle='#8a2f35';c.fill();c.lineWidth=2;c.strokeStyle=INK;c.stroke();
  c.beginPath();c.ellipse(look,-59.6,2.6,1.4,0,0,Math.PI*2);c.fillStyle='#f07a84';c.fill();}
 else{c.beginPath();c.arc(look,-64.5,4.6,.18*Math.PI,.82*Math.PI);c.lineWidth=2.2;c.strokeStyle=INK;c.lineCap='round';c.stroke();}
 // the front arms
 if(p.backArm!=='L')arm(c,-1,aL,skin,p.kit,hands.L,glove);if(p.backArm!=='R')arm(c,1,aR,skin,p.kit,hands.R,glove);
 c.restore();}
/** Conductor Kenji (trainConductor.ts KENJI_NPC: skin 2, a dark crop, a navy cap and jacket), waving. */
export function kenji(c:WrapCtx,x:number,y:number,s:number){bean(c,{x,y,s,skin:2,hair:0,style:'cap',cap:'#1d2c4a',kit:'#1f3352',shorts:'#1f3352',collar:'#f2c230',armL:2.6,armR:.3,face:'open',look:.25});}

// ---------------------------------------------------------------- a tile's frame: background, grass, border
function frame(c:WrapCtx,w:number,t:number,grass=true){const L=WRAP_LOOK[t];
 const g=c.createLinearGradient(0,0,0,100);g.addColorStop(0,L.bg);g.addColorStop(1,L.bg2);c.fillStyle=L.frame;c.fillRect(0,0,w,100);
 c.save();c.beginPath();c.roundRect(4,4,w-8,92,9);c.fillStyle=g;c.fill();c.clip();
 // soft sun rays behind everything
 c.save();c.translate(w/2,108);c.fillStyle='rgba(255,255,255,.28)';for(let k=0;k<12;k++){c.rotate(Math.PI/12);c.beginPath();c.moveTo(0,0);c.lineTo(-9,-160);c.lineTo(9,-160);c.closePath();c.fill();}c.restore();
 if(grass){c.fillStyle=GRASS;c.fillRect(0,80,w,20);c.fillStyle=GRASS2;for(let x=-4;x<w;x+=16)c.fillRect(x,80,8,20);c.fillStyle='rgba(255,255,255,.75)';c.fillRect(0,85,w,1.6);}
 c.restore();}
function finish(c:WrapCtx,w:number,t:number){const L=WRAP_LOOK[t];c.beginPath();c.roundRect(4,4,w-8,92,9);c.lineWidth=3;c.strokeStyle=INK;c.stroke();
 c.beginPath();c.roundRect(1.2,1.2,w-2.4,97.6,11);c.lineWidth=2.4;c.strokeStyle=L.frame;c.stroke();}
function inside(c:WrapCtx,w:number,draw:()=>void){c.save();c.beginPath();c.roundRect(4,4,w-8,92,9);c.clip();draw();c.restore();}

// ---------------------------------------------------------------- the scenes (theme t, tile k; tile 1 is always the slogan)
/** The panel tiles of a theme in slot order (car-local −z → +z): a scene, the slogan, a scene, a scene. */
export const WRAP_TILES=['scene0','slogan','scene1','scene2'] as const;
export function drawWrapTile(c:WrapCtx,t:number,k:number,w:number,slogan:readonly [string,string]){
 const L=WRAP_LOOK[t];frame(c,w,t,k!==1);
 inside(c,w,()=>{
  if(k===1){// the slogan: Kenji waving, two big lines on a ribbon, a heart + ball
   confetti(c,w,7+t,14,8,92);kenji(c,w*.15,93,.86);
   const tx=w*.58,tw=w*.68;c.save();c.translate(tx,50);c.rotate(-.035);
   c.beginPath();c.roundRect(-tw/2,-32,tw,64,14);c.fillStyle=L.ribbon;c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();
   c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
   const fs=Math.min(26,tw/(Math.max(slogan[0].length,slogan[1].length)*.56));
   c.font=`900 ${fs}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
   for(const [i,s] of slogan.entries()){const y=(i?1:-1)*fs*.58;c.lineWidth=5;c.strokeStyle=INK;c.strokeText(s,0,y,tw-14);c.fillStyle=L.ribbonInk;c.fillText(s,0,y,tw-14);}
   c.restore();heart(c,tx+tw/2-4,20,9,'#ef4f5f');ball(c,tx+tw/2+1,80,8.5);star(c,tx-tw/2+3,18,6);return;}
  if(t===0){
   if(k===0){// the referee: a thumbs-up for a fair game, whistle on its cord
    for(const [x,y,r] of [[w*.2,22,7],[w*.82,18,8],[w*.75,48,5],[w*.16,52,5]] as const)star(c,x,y,r);
    bean(c,{x:w/2,y:93,skin:4,hair:3,style:'crop',kit:'#f2d23c',shorts:'#22252b',collar:'#22252b',armL:.35,armR:2.05,handR:'thumb',face:'open',look:.2});
    c.beginPath();c.moveTo(w/2-6,-51+93);c.quadraticCurveTo(w/2,-40+93,w/2+5,-43+93);c.lineWidth=1.3;c.strokeStyle=INK;c.stroke();
    c.beginPath();c.roundRect(w/2+3,-46+93,7,4.5,2);c.fillStyle='#d9dde2';c.fill();c.lineWidth=1.6;c.stroke();sparkle(c,w*.68,32,6);}
   else if(k===2){// two teams shaking hands
    heart(c,w/2,20,10);heart(c,w/2-16,30,6,'#ff8fa0');heart(c,w/2+16,30,6,'#ff8fa0');
    bean(c,{x:w/2-27,y:93,skin:1,hair:2,style:'bob',kit:L.teamA,shorts:L.shortsA,armL:.3,armR:1.25,look:.7,face:'smile'});
    bean(c,{x:w/2+27,y:93,skin:5,hair:0,style:'puffs',kit:L.teamB,shorts:L.shortsB,armL:1.25,armR:.3,look:-.7,face:'smile'});
    blob(c,w/2,93-44,5.6,5,SKIN[3],2.2);c.beginPath();c.moveTo(w/2-2.5,93-47);c.lineTo(w/2+2.5,93-41.5);c.lineWidth=1.4;c.strokeStyle=INK;c.stroke();}// the clasped hands
   else{// a jumping high five
    star(c,w/2,13,10,'#ffd23f');for(let k2=0;k2<6;k2++){const a=-Math.PI/2+(k2-2.5)*.5;line(c,w/2+Math.cos(a)*13,13+Math.sin(a)*13,w/2+Math.cos(a)*19,13+Math.sin(a)*19,'#ffd23f',2,1);}
    bean(c,{x:w/2-23,y:88,skin:3,hair:1,style:'spiky',kit:L.teamB,shorts:L.shortsB,armL:.6,armR:2.55,legs:'jump',face:'joy',look:.5});
    bean(c,{x:w/2+23,y:93,skin:0,hair:4,style:'bun',kit:L.teamA,shorts:L.shortsA,armL:2.55,armR:.6,face:'joy',look:-.5});ball(c,w*.86,86,6.5);}
  }else if(t===1){
   if(k===0){// a kid shares a water bottle
    for(const [x,y] of [[w*.5,16],[w*.3,26],[w*.72,24]] as const)c.fillStyle='#7fd0f5',c.beginPath(),c.ellipse(x,y,2.4,3.4,0,0,Math.PI*2),c.fill();
    bean(c,{x:w/2-22,y:93,s:.86,skin:2,hair:0,style:'crop',kit:L.teamA,shorts:L.shortsA,armL:.3,armR:1.45,look:.7,face:'open'});
    bean(c,{x:w/2+23,y:93,s:.86,skin:4,hair:3,style:'puffs',kit:L.teamB,shorts:L.shortsB,armL:1.2,armR:.3,look:-.7,face:'smile'});
    bottle(c,w/2+1,93-43,-.5);heart(c,w/2,20,8);}
   else if(k===2){// a player helps a fallen opponent up
    bean(c,{x:w*.32,y:95,s:.92,skin:5,hair:0,style:'spiky',kit:L.teamB,shorts:L.shortsB,armL:.5,armR:2.3,legs:'sit',look:.8,face:'smile'});
    bean(c,{x:w*.68,y:93,skin:1,hair:2,style:'bob',kit:L.teamA,shorts:L.shortsA,armL:1.2,armR:.3,look:-.8,face:'open',tilt:-.1});
    heart(c,w/2,20,9);for(const [x,y] of [[w*.2,30],[w*.84,26]] as const)sparkle(c,x,y,6,'#ffffff');ball(c,w*.86,87,6);}
   else{// teammates passing the ball
    const x0=w*.24,x1=w*.78;c.setLineDash([3,4]);c.beginPath();c.moveTo(x0+14,78);c.quadraticCurveTo(w/2,30,x1-10,58);c.lineWidth=2.2;c.strokeStyle='rgba(43,36,32,.7)';c.stroke();c.setLineDash([]);
    bean(c,{x:x0,y:93,skin:3,hair:1,style:'crop',kit:L.teamA,shorts:L.shortsA,armL:.8,armR:.6,legs:'kick',look:.8,face:'smile'});
    bean(c,{x:x1,y:93,skin:0,hair:2,style:'bun',kit:L.teamA,shorts:L.shortsA,armL:1.9,armR:1.9,look:-.6,face:'open'});
    ball(c,w*.56,40,7);star(c,w*.5,16,6);}
  }else{
   if(k===0){// the keeper and the striker hug after the match
    confetti(c,w,31,22,6,70);
    bean(c,{x:w/2-22,y:93,skin:2,hair:3,style:'crop',kit:'#36b37e',shorts:'#1d5c43',collar:'#ffffff',armL:.45,armR:1.55,handL:'glove',handR:'glove',glove:'#ff9a3c',look:.6,face:'joy',tilt:.09});
    bean(c,{x:w/2+22,y:93,skin:4,hair:0,style:'puffs',kit:L.teamA,shorts:L.shortsA,armL:1.75,armR:.45,look:-.6,face:'joy',tilt:-.09});
    heart(c,w/2,11,7.5);}
   else if(k===2){// the crowd cheers both teams (a scarf of each)
    confetti(c,w,53,26,6,60);const xs=[.14,.38,.62,.86];
    xs.forEach((f,i)=>bean(c,{x:w*f,y:93,s:.74,skin:(i*2+1)%6,hair:i,style:(['crop','puffs','spiky','bob'] as const)[i],kit:i%2?L.teamB:L.teamA,shorts:i%2?L.shortsB:L.shortsA,
     sash:i%2?L.teamA:L.teamB,armL:2.6,armR:2.6,face:i%2?'joy':'open'}));}
   else{// waving a flag for each team, balls bouncing
    confetti(c,w,77,18,6,60);
    const fx=w*.5,fy=93;for(const [dx,col] of [[-1,L.teamA],[1,L.teamB]] as const){const hx=fx+dx*22,hy=fy-66;line(c,hx,hy+10,hx+dx*4,hy-16,'#c9a56b',2.4,1.4);
     c.beginPath();c.moveTo(hx+dx*4,hy-16);c.lineTo(hx+dx*22,hy-11);c.lineTo(hx+dx*4,hy-4);c.closePath();c.fillStyle=col;c.fill();c.lineWidth=2;c.strokeStyle=INK;c.stroke();}
    bean(c,{x:fx,y:fy,skin:1,hair:4,style:'bun',kit:'#ffd23f',shorts:'#2f7fd6',armL:2.35,armR:2.35,face:'joy',legs:'jump'});
    ball(c,w*.14,70,7);ball(c,w*.86,58,6);heart(c,w*.16,26,7);heart(c,w*.84,24,7);}
  }});
 finish(c,w,t);}

/** The round kindness badge for the cab ends (heart + ball) in a 100 × 100 square. */
export function drawWrapBadge(c:WrapCtx,t:number){const L=WRAP_LOOK[t];
 c.beginPath();c.arc(50,50,48,0,Math.PI*2);c.fillStyle=L.frame;c.fill();c.lineWidth=3;c.strokeStyle=INK;c.stroke();
 c.beginPath();c.arc(50,50,38,0,Math.PI*2);c.fillStyle=WHITE;c.fill();c.lineWidth=2.4;c.stroke();
 for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.PI/8;star(c,50+Math.cos(a)*43,50+Math.sin(a)*43,3.2,L.accent===L.frame?WHITE:L.accent,1);}
 heart(c,45,47,30,'#ef4f5f',2.6);ball(c,66,66,13,2.4);}
