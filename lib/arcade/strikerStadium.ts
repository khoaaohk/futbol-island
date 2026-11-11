import * as T from 'three';
import {STRIKER_PENALTY_X} from './strikerMatch';

/** Island Strikers night stadium (arcade AAA pass 2, Nov 10 2026, docs/arcade-aaa/strikers-direction.md): a floodlit bowl seen by a
 * low TV gantry camera, so the far stand, the LED boards, the lamp gantry and the night sky sit behind the pitch in every frame.
 * Everything is built once and costs NINE draws in play, whatever the crowd size:
 *   sky (one painted backdrop) · turf (unlit, one painted canvas: mown bands, sheen, wear AND the chalk, so no line mesh) · the built
 *   stadium (bowl with seat rows and aisles, banner fascia, lamp gantry, LED boards, dugouts, corner poles and both goal frames in one
 *   mesh on one atlas) · crowd (one instanced draw from a 16-pose atlas: supporters, scarves, flags, stewards, photographers, ball
 *   crew and subs; poses, bounce, the goal wave and flag sway run in the vertex shader, no matrix uploads) · goal nets (one mesh, the
 *   back panel bulges on a goal) · floodlight shadows under every body and the ball (one instanced draw, 45 matrices a frame; the
 *   stage's shadow pass is off in looks/strikers.ts) · lamp glare (one points draw) · haze beams (one merged draw) · camera flashes
 *   (one points draw, only after a goal or a near miss).
 * Pass 3 (Nov 10 2026): on phones the near side is the dark back edge of the TV gantry (deck, kick plate, handrail) instead of a stand,
 * and no supporters are seated there; the far lamp gantry sits 1.3 m lower so its glare stays in the follow frame. Still nine draws.
 * Nothing here allocates per frame. stage.dispose() walks the scene and frees every geometry, material and texture made here. */
export const STADIUM={innerX:28.6,innerZ:16.6,rows:7,tread:.95,riser:.62,wall:.9,lampX:12,lampZ:24.6,lampY:10,goalHalf:4.6,goalHeight:2.77,goalDepth:2.2} as const;
const FONT='800 92px "Avenir Next Condensed","Roboto Condensed","Arial Narrow",Arial,sans-serif';
/** Deterministic noise so the pitch wear and the crowd are the same on every visit (and in screenshots). */
function seeded(seed:number){let s=seed>>>0;return()=>{s=(s+0x6d2b79f5)>>>0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function canvasOf(w:number,h:number){const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')!] as const;}

/** The pitch, painted once: 57.2 x 33.2 m of grass (the playing area plus the apron out to the stand wall), chalk included. */
function paintTurf(w:number,h:number){const [canvas,g]=canvasOf(w,h),rnd=seeded(7),W=STADIUM.innerX*2,H=STADIUM.innerZ*2,sx=w/W,sz=h/H,X=(x:number)=>(x+STADIUM.innerX)*sx,Z=(z:number)=>(z+STADIUM.innerZ)*sz;
 g.fillStyle='#17432a';g.fillRect(0,0,w,h);
 // Ten 5 m mown bands goal to goal (the same bands the old two-material mesh drew), each with the nap falling across it, then six
 // cross-mown bands for the checker sheen.
 for(let i=0;i<10;i++){g.fillStyle=i%2?'#1f5a2e':'#2a7239';g.fillRect(X(-25+i*5),Z(-14.2),5*sx+1,28.4*sz);const nap=g.createLinearGradient(X(-25+i*5),0,X(-20+i*5),0);nap.addColorStop(i%2?0:1,'rgba(255,255,255,.045)');nap.addColorStop(i%2?1:0,'rgba(0,0,0,.05)');g.fillStyle=nap;g.fillRect(X(-25+i*5),Z(-14.2),5*sx+1,28.4*sz);}
 for(let i=0;i<6;i++){g.fillStyle=i%2?'rgba(255,255,255,.028)':'rgba(0,0,0,.035)';g.fillRect(X(-25),Z(-14.2+i*28.4/6),50*sx,28.4/6*sz);}
 // Blade grain: short strokes, lighter and darker, so the surface never reads as flat colour (kept green: no yellow stains).
 for(let i=0;i<38000;i++){const light=rnd()>.5;g.fillStyle=light?`rgba(150,225,140,${.025+rnd()*.05})`:`rgba(4,28,12,${.04+rnd()*.07})`;g.fillRect(rnd()*w,rnd()*h,1+rnd()*1.2,2+rnd()*4);}
 // Wear: thinner, duller grass in both goalmouths and round the centre spot; a few faint stud scuffs down the middle.
 const patch=(x:number,z:number,rx:number,rz:number,a:number,rgb='38,74,44')=>{g.save();g.translate(X(x),Z(z));g.scale(rx*sx,rz*sz);const r=g.createRadialGradient(0,0,0,0,0,1);r.addColorStop(0,`rgba(${rgb},${a})`);r.addColorStop(.6,`rgba(${rgb},${a*.5})`);r.addColorStop(1,`rgba(${rgb},0)`);g.fillStyle=r;g.fillRect(-1,-1,2,2);g.restore();};
 for(const side of [-1,1]){patch(side*23.4,0,2.4,4.2,.42,'58,84,50');patch(side*STRIKER_PENALTY_X,0,1.1,1.1,.2);}patch(0,0,2,2,.2);
 for(let i=0;i<26;i++)patch((rnd()-.5)*44,(rnd()-.5)*14,.4+rnd()*1.1,.3+rnd()*.8,.05+rnd()*.06,'14,46,24');
 // Floodlight on the grass: the far gantry throws a long sheen toward the camera, the near lamps a softer pool; the LED boards
 // spill a little cold light on the far touchline.
 g.globalCompositeOperation='lighter';
 const pool=(x:number,z:number,rx:number,rz:number,rgba:string)=>{g.save();g.translate(X(x),Z(z));g.scale(rx*sx,rz*sz);const r=g.createRadialGradient(0,0,0,0,0,1);r.addColorStop(0,rgba);r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(-1,-1,2,2);g.restore();};
 for(const x of [-18,-6,6,18]){pool(x,-8,9,11,'rgba(120,190,130,.085)');pool(x*.9,-11.5,5,4,'rgba(190,235,200,.07)');}
 for(const x of [-12,12])pool(x,8,17,9,'rgba(96,150,96,.075)');pool(0,0,24,12,'rgba(90,140,90,.06)');
 {const spill=g.createLinearGradient(0,Z(-14.2),0,Z(-11.8));spill.addColorStop(0,'rgba(170,205,255,.11)');spill.addColorStop(1,'rgba(170,205,255,0)');g.fillStyle=spill;g.fillRect(X(-25),Z(-14.2),50*sx,2.4*sz);}
 g.globalCompositeOperation='source-over';
 // Chalk: touchlines and goal lines just inside the boards, halfway line, centre circle and spot, both boxes (x 17..25, z -5..5),
 // penalty spots and corner arcs. A faint overspray first, the crisp line on top, then the grass wearing through where boots go.
 for(const pass of [0,1]){const grow=pass?.012:.07;g.fillStyle=g.strokeStyle=pass?'rgba(244,247,240,.97)':'rgba(236,244,232,.13)';
  const rect=(x0:number,z0:number,x1:number,z1:number)=>g.fillRect(X(x0-grow),Z(z0-grow),(x1-x0+grow*2)*sx,(z1-z0+grow*2)*sz),
   arc=(cx:number,cz:number,r:number,a0:number,a1:number,half=.05)=>{g.lineWidth=(half+grow)*2*sx;g.beginPath();g.ellipse(X(cx),Z(cz),r*sx,r*sz,0,a0,a1);g.stroke();};
  for(const z of [-13.75,13.75])rect(-24.8,z-.05,24.8,z+.05);for(const x of [-24.75,24.75])rect(x-.05,-13.8,x+.05,13.8);rect(-.045,-13.75,.045,13.75);arc(0,0,4,0,Math.PI*2);
  for(const side of [-1,1]){for(const z of [-5,5])rect(side*17-.05,z-.05,side*24.75,z+.05);rect(side*17-.05,-5,side*17+.05,5);}
  for(const x of [-STRIKER_PENALTY_X,0,STRIKER_PENALTY_X])arc(x,0,.09,0,Math.PI*2,.09);
  for(const qx of [-1,1])for(const qz of [-1,1]){const a0=qx>0?(qz>0?Math.PI:Math.PI/2):(qz>0?Math.PI*1.5:0);arc(qx*24.75,qz*13.75,.97,a0,a0+Math.PI/2);}}
 for(let i=0;i<5200;i++){const goal=i<2600,x=goal?(rnd()<.5?-1:1)*(21+rnd()*4):(rnd()-.5)*50,z=goal?(rnd()-.5)*11:(rnd()-.5)*28;g.fillStyle=`rgba(40,104,54,${.35+rnd()*.4})`;g.fillRect(X(x),Z(z),1+rnd()*2,1+rnd()*1.6);}
 // The light dies toward the apron and the corners.
 g.globalCompositeOperation='multiply';{g.save();g.translate(w/2,h/2);g.scale(w/2,h/2);const r=g.createRadialGradient(0,0,.5,0,0,1.4);r.addColorStop(0,'#ffffff');r.addColorStop(.6,'#bccabc');r.addColorStop(1,'#566456');g.fillStyle=r;g.fillRect(-1,-1,2,2);g.restore();}
 g.globalCompositeOperation='source-over';
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;return map;}

/** One atlas for the whole built stadium (1024 x 512): the LED board strip (25 m of boards per repeat) on top, the banner fascia of
 * the back wall, one band of seat rows with aisles, then sixteen flat colour bands. The boards' "sponsors" and the supporters'
 * banners are the habits the game teaches. */
const NEAR_EXTRA=8,BANDS=['#262c39','#151a23','#0e1218','#3b4352','#ffffff','#0a0c11','#313848','#f2d21b','#f4f6f0','#aeb7bf','#1c4f96','#7f97a8','#12161d','#5b677a','#e9ece4','#20252f'] as const,TREAD=0,RISER=1,WALL=2,STEEL=3,LAMP=4,BACK=5,TREAD_LIT=6,SIGNAL=7,POST=8,POST_SHADE=9,BENCH=10,GLASS=11,ROOF=12,STEEL_LIT=13,POLE=14,CAGE=15;
const BOARD_V=[.75,1] as const,FASCIA_V=[.625,.75] as const,SEAT_V=[.5,.625] as const;
function paintAtlas(){const [canvas,g]=canvasOf(1024,512);g.fillStyle='#07090d';g.fillRect(0,0,1024,128);
 const slots:[string,string,string][]=[['SCAN FIRST','#07090d','#f2d21b'],['PASS + MOVE','#1c5fb8','#f3f1ea'],['FIND SPACE','#f2d21b','#0d1015'],['FIRST TOUCH','#f3f1ea','#0d1015']];
 slots.forEach(([word,back,ink],i)=>{g.fillStyle=back;g.fillRect(i*256,0,256,128);g.save();g.translate(i*256+128,70);g.scale(.31,1);g.font=FONT;g.textAlign='center';g.textBaseline='middle';g.fillStyle=ink;g.fillText(word,0,0);g.restore();g.fillStyle=i===3?'#e5372b':ink;g.globalAlpha=i===3?1:.5;g.fillRect(i*256+18,112,220,5);g.globalAlpha=1;});
 // LED dot matrix: faint dark rows and columns over the strip.
 g.fillStyle='rgba(0,0,0,.22)';for(let y=0;y<128;y+=4)g.fillRect(0,y,1024,1);for(let x=0;x<1024;x+=4)g.fillRect(x,0,1,128);
 // Supporters' banners hung on the back wall (32 m per repeat): cloth, not LEDs, so matt colours and a stitched edge.
 const cloths:[string,string,string][]=[['LOOK UP','#b98519','#15120a'],['PLAY SIMPLE','#1d4f96','#e6e9ee'],['ONE TOUCH','#c9c5ba','#15171c'],['WIN IT BACK','#14171d','#c9a81a']];
 g.fillStyle='#0b0e13';g.fillRect(0,128,1024,64);cloths.forEach(([word,back,ink],i)=>{g.fillStyle=back;g.fillRect(i*256+10,136,236,48);g.strokeStyle='rgba(255,255,255,.18)';g.lineWidth=2;g.strokeRect(i*256+14,140,228,40);g.save();g.translate(i*256+128,162);g.scale(.42,.5);g.font=FONT;g.textAlign='center';g.textBaseline='middle';g.fillStyle=ink;g.fillText(word,0,0);g.restore();});
 // Seat rows (8 m per 512 px): the concrete walkway in front, tip-up seats behind, an aisle of lit steps every 8 m.
 g.fillStyle='#232936';g.fillRect(0,192,1024,64);g.fillStyle='#2c3342';g.fillRect(0,236,1024,20);
 for(let s=0;s<64;s++){const x=s*16,inAisle=s%32===0||s%32===31;if(inAisle){g.fillStyle='#3a4254';g.fillRect(x,192,16,64);g.fillStyle='#596379';g.fillRect(x,206,16,3);g.fillRect(x,228,16,3);g.fillRect(x,250,16,3);continue;}
  const gold=(s>>3)%4===1;g.fillStyle=gold?'#7d6117':'#1b3f7c';g.fillRect(x+2,196,12,26);g.fillStyle=gold?'#a37f1f':'#2857a6';g.fillRect(x+2,196,12,9);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x+2,222,12,4);}
 BANDS.forEach((color,k)=>{g.fillStyle=color;g.fillRect(0,256+k*16,1024,16);});
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=T.RepeatWrapping;return map;}
const bandV=(k:number)=>1-(256+k*16+8)/512;

/** A soft white dot: camera flashes use it additively. */
function paintDot(){const [canvas,g]=canvasOf(64,64),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.22,'rgba(255,255,255,.62)');r.addColorStop(.55,'rgba(255,255,255,.16)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new T.CanvasTexture(canvas);}
/** A lamp bank through a TV lens: a hot core, a wide veil and the horizontal streak a broadcast camera smears across the picture. */
function paintGlare(){const [canvas,g]=canvasOf(256,256),r=g.createRadialGradient(128,128,0,128,128,128);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.07,'rgba(255,255,255,.9)');r.addColorStop(.2,'rgba(235,242,255,.3)');r.addColorStop(.5,'rgba(215,228,255,.085)');r.addColorStop(1,'rgba(210,225,255,0)');g.fillStyle=r;g.fillRect(0,0,256,256);
 g.globalCompositeOperation='lighter';for(const [rx,ry,a] of [[1,.035,.55],[.05,.5,.22]] as const){g.save();g.translate(128,128);g.scale(rx,ry);const s=g.createRadialGradient(0,0,0,0,0,128);s.addColorStop(0,`rgba(255,255,255,${a})`);s.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=s;g.fillRect(-128,-128,256,256);g.restore();}
 return new T.CanvasTexture(canvas);}
/** One floodlight shadow: densest and narrowest at the feet (the top of the canvas), widening and dissolving along its length. */
function paintShadow(){const [canvas,g]=canvasOf(64,128);for(let y=0;y<128;y++){const t=y/127,half=7+t*17,alpha=Math.pow(1-t,1.5)*(t<.06?t/.06:1),row=g.createLinearGradient(32-half,0,32+half,0);row.addColorStop(0,'rgba(255,255,255,0)');row.addColorStop(.5,`rgba(255,255,255,${alpha})`);row.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=row;g.fillRect(32-half,y,half*2,1);}
 return new T.CanvasTexture(canvas);}
/** Net cord: a square mesh on a faint veil, tiled over the net panels. */
function paintNet(){const [canvas,g]=canvasOf(64,64);g.fillStyle='rgba(255,255,255,.1)';g.fillRect(0,0,64,64);g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=7;g.strokeRect(0,0,64,64);const map=new T.CanvasTexture(canvas);map.wrapS=map.wrapT=T.RepeatWrapping;map.colorSpace=T.SRGBColorSpace;return map;}
/** The night behind the far stand: floodlit haze low down, the island's ridge with a few house lights, stars above. */
function paintSky(){const [canvas,g]=canvasOf(1024,256),rnd=seeded(19),sky=g.createLinearGradient(0,256,0,0);sky.addColorStop(0,'#27405c');sky.addColorStop(.16,'#1a2c47');sky.addColorStop(.42,'#0c1629');sky.addColorStop(1,'#04060c');g.fillStyle=sky;g.fillRect(0,0,1024,256);
 for(let i=0;i<170;i++){const y=rnd()*150;g.fillStyle=`rgba(225,235,255,${(.25+rnd()*.6)*(1-y/190)})`;g.fillRect(rnd()*1024,y,rnd()>.86?2:1,1);}
 // Ridge line of the island, far away, a shade darker than the haze, with a scatter of warm windows.
 g.fillStyle='#0b1422';g.beginPath();g.moveTo(0,256);let y=212;for(let x=0;x<=1024;x+=8){y+=(rnd()-.5)*7+Math.sin(x*.011)*1.2;y=Math.max(188,Math.min(228,y));g.lineTo(x,y);}g.lineTo(1024,256);g.fill();
 for(let i=0;i<70;i++){g.fillStyle=`rgba(255,${190+Math.floor(rnd()*50)},130,${.35+rnd()*.5})`;g.fillRect(rnd()*1024,226+rnd()*26,2,1);}
 // The gantry lights the air above the stand.
 g.globalCompositeOperation='lighter';for(const u of [.44,.48,.52,.56]){g.save();g.translate(u*1024,214);g.scale(1.7,1);const r=g.createRadialGradient(0,0,0,0,0,70);r.addColorStop(0,'rgba(170,200,255,.22)');r.addColorStop(1,'rgba(170,200,255,0)');g.fillStyle=r;g.fillRect(-70,-70,140,140);g.restore();}
 g.globalCompositeOperation='source-over';const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;return map;}

/** The people, 8 x 2 cells of 64 x 128. Top row calm, bottom row the same person celebrating. Pure green is the shirt key (the shader
 * swaps it for the instance colour); skin, hair, scarves, flags' poles and kit are painted as they are.
 * Cells: 0 arms down · 1 seated · 2 scarf across the chest · 3 clapping · 4 flag bearer · 5 steward · 6 photographer · 7 ball crew. */
function paintPeople(){const [canvas,g]=canvasOf(512,256),KEY='#00ff00',KEY_SHADE='#00c400',SKIN=['#e2b08c','#c98f68','#8d5a3c','#f0c8a8','#b97a52','#6d4630','#dba882','#9c6a48'],HAIR=['#1b1512','#3a2a1c','#0e0e10','#6b4a2a','#15110f','#262019','#8a7a66','#101012'];
 const limb=(x0:number,y0:number,x1:number,y1:number,w:number,color:string)=>{g.strokeStyle=color;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();};
 const torso=(x:number,top:number,w:number,color:string,shade:string)=>{g.fillStyle=color;g.beginPath();g.moveTo(x-w/2+6,top);g.lineTo(x+w/2-6,top);g.quadraticCurveTo(x+w/2,top,x+w/2,top+8);g.lineTo(x+w/2-2,128);g.lineTo(x-w/2+2,128);g.lineTo(x-w/2,top+8);g.quadraticCurveTo(x-w/2,top,x-w/2+6,top);g.fill();g.fillStyle=shade;g.fillRect(x-w/2+2,top+30,w-4,128-top-30);};
 const head=(x:number,y:number,r:number,skin:string,hair:string)=>{g.fillStyle=skin;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.fillStyle=hair;g.beginPath();g.arc(x,y-1.5,r+.6,Math.PI*1.02,Math.PI*1.98);g.fill();};
 for(let row=0;row<2;row++)for(let cell=0;cell<8;cell++){const up=row===1,ox=cell*64,oy=row*128,skin=SKIN[cell],hair=HAIR[cell];g.save();g.translate(ox,oy);g.beginPath();g.rect(2,2,60,126);g.clip();
  if(cell<=3){const seated=cell===1,top=seated?74:64,hy=top-13;
   if(up){ // arms thrown up: a V, a scarf held overhead, one fist, hands clapping above the head
    if(cell===0){limb(20,top+8,8,top-36,9,KEY);limb(44,top+8,56,top-36,9,KEY);limb(8,top-38,7,top-44,8,skin);limb(56,top-38,57,top-44,8,skin);}
    else if(cell===1){limb(21,top+8,12,top-30,9,KEY);limb(43,top+8,52,top-30,9,KEY);g.fillStyle='#efe9da';g.fillRect(6,top-40,52,9);g.fillStyle='#b8322a';for(let s=0;s<4;s++)g.fillRect(9+s*13,top-40,6,9);}
    else if(cell===2){limb(44,top+8,52,top-34,9,KEY);limb(52,top-36,52,top-42,9,skin);limb(20,top+10,13,top+34,9,KEY);g.fillStyle='#efe9da';g.fillRect(16,top+2,32,7);}
    else{limb(20,top+8,26,top-32,9,KEY);limb(44,top+8,38,top-32,9,KEY);limb(27,top-34,37,top-34,10,skin);}
   }else{
    if(cell===0){limb(19,top+10,14,top+38,9,KEY);limb(45,top+10,50,top+38,9,KEY);}
    else if(cell===1){limb(19,top+10,24,top+30,9,KEY);limb(45,top+10,40,top+30,9,KEY);limb(24,top+31,40,top+31,8,skin);}
    else if(cell===2){limb(19,top+10,15,top+36,9,KEY);limb(45,top+10,49,top+36,9,KEY);}
    else{limb(19,top+10,27,top+24,9,KEY);limb(45,top+10,37,top+24,9,KEY);limb(28,top+22,36,top+22,9,skin);}
   }
   torso(32,top,34,KEY,KEY_SHADE);if(cell===2&&!up){g.fillStyle='#efe9da';g.fillRect(15,top+6,34,9);g.fillStyle='#b8322a';for(let s=0;s<3;s++)g.fillRect(18+s*12,top+6,5,9);}
   head(32,hy,11,skin,hair);if(cell===3){g.fillStyle='#d9d4c8';g.fillRect(21,hy-12,22,6);}
  }else if(cell===4){const top=66,lean=up?-.5:.28;limb(20,top+8,up?14:20,top-(up?20:8),9,KEY);limb(44,top+8,up?42:40,top-(up?24:10),9,KEY);torso(32,top,34,KEY,KEY_SHADE);head(32,top-13,11,skin,hair);
   g.save();g.translate(up?28:32,top-14);g.rotate(lean);g.fillStyle='#d8d2c4';g.fillRect(-1.5,-50,3,56);g.fillStyle=KEY;g.beginPath();g.moveTo(1,-50);g.quadraticCurveTo(16,-56,30,-48);g.lineTo(30,-22);g.quadraticCurveTo(16,-28,1,-22);g.fill();g.fillStyle='#efe9da';g.beginPath();g.moveTo(1,-37);g.quadraticCurveTo(16,-43,30,-35);g.lineTo(30,-22);g.quadraticCurveTo(16,-28,1,-22);g.fill();g.restore();
  }else if(cell===5){const top=72;limb(19,top+10,16,top+34,9,'#e9722a');limb(45,top+10,48,top+34,9,'#e9722a');torso(32,top,36,'#f08a2c','#d96f1c');g.fillStyle='#e8e6dc';g.fillRect(15,top+16,34,5);head(32,top-13,11,skin,'#15171c');
  }else if(cell===6){const top=84;torso(32,top,38,'#2b3038','#1e2228');head(30,top-12,11,skin,hair);g.fillStyle='#0c0d10';g.fillRect(34,top-20,22,13);g.fillStyle='#3d434d';g.beginPath();g.arc(56,top-13,7,0,Math.PI*2);g.fill();g.fillStyle=up?'#ffffff':'#8fa6c2';g.beginPath();g.arc(56,top-13,up?4.5:3,0,Math.PI*2);g.fill();
  }else{const top=76;if(up){limb(20,top+8,12,top-26,8,KEY);limb(44,top+8,52,top-26,8,KEY);}else{limb(20,top+10,17,top+32,8,KEY);limb(44,top+10,47,top+32,8,KEY);}torso(32,top,30,KEY,KEY_SHADE);head(32,top-11,10,skin,hair);}
  g.restore();}
 const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;return map;}

export function createStrikerStadium(scene:T.Scene,opts:{mobile:boolean;reduced:boolean;anisotropy:number}){
 const {innerX:IX,innerZ:IZ,rows,tread,riser,wall,goalHalf:GH,goalHeight:GT,goalDepth:GD}=STADIUM,group=new T.Group();group.name='striker-stadium';scene.add(group);
 // 0. Night sky: one painted backdrop far behind the far stand, untouched by fog.
 {const sky=new T.Mesh(new T.PlaneGeometry(320,86),new T.MeshBasicMaterial({map:paintSky(),fog:false,depthWrite:false}));sky.name='striker-sky';sky.position.set(0,33,-64);sky.renderOrder=-2;sky.frustumCulled=false;group.add(sky);}
 // 1. Turf, chalk included.
 const turfMap=paintTurf(2048,1024);turfMap.anisotropy=Math.min(8,opts.anisotropy);
 const turfMaterial=new T.MeshBasicMaterial({map:turfMap}),turf=new T.Mesh(new T.PlaneGeometry(IX*2,IZ*2),turfMaterial);turf.name='striker-turf';turf.rotation.x=-Math.PI/2;turf.position.y=.012;group.add(turf);
 // 2. The built stadium in one mesh: stepped bowl with seat rows, banner fascia, the far lamp gantry, LED boards, dugouts, corner
 // poles and both goal frames.
 const atlas=paintAtlas();atlas.anisotropy=Math.min(4,opts.anisotropy);const lamps:T.Vector3[]=[],banks:T.Vector3[]=[],aims:T.Vector3[]=[],boardU:number[]=[];let builtUV:T.BufferAttribute;
 {const p:number[]=[],uv:number[]=[],ix:number[]=[];type V=[number,number,number];
  const quad=(a:V,b:V,c:V,d:V,u0:number,v0:number,u1:number,v1:number)=>{const n=p.length/3;p.push(...a,...b,...c,...d);uv.push(u0,v0,u1,v0,u1,v1,u0,v1);ix.push(n,n+1,n+2,n,n+2,n+3);},flat=(a:V,b:V,c:V,d:V,k:number)=>quad(a,b,c,d,.5,bandV(k),.5,bandV(k));
  const board=(a:V,b:V,c:V,d:V,u0:number,u1:number)=>{const n=uv.length;quad(a,b,c,d,u0,BOARD_V[0],u1,BOARD_V[1]);boardU.push(n,n+2,n+4,n+6);};
  const corners=(o:number,y:number):V[]=>[[-(IX+o),y,-(IZ+o)],[IX+o,y,-(IZ+o)],[IX+o,y,IZ+o],[-(IX+o),y,IZ+o]];
  /** Four mitred quads between the rectangle `o0` metres outside the bowl's inner edge at height y0 and the one at o1 / y1. */
  const ring=(o0:number,y0:number,o1:number,y1:number,k:number,sides=[0,1,2,3])=>{const a=corners(o0,y0),b=corners(o1,y1);for(const i of sides)flat(a[i],a[(i+1)%4],b[(i+1)%4],b[i],k);};
  /** The same ring with a strip of the atlas running along each side, centred, `period` metres per repeat (side 0 far, 1 right end, 2 near, 3 left end). */
  const strip=(o0:number,y0:number,o1:number,y1:number,v:readonly [number,number],period:number,sides=[0,1,2,3])=>{const a=corners(o0,y0),b=corners(o1,y1);for(const i of sides){const half=(i%2?IZ+o0:IX+o0)/period;quad(a[i],a[(i+1)%4],b[(i+1)%4],b[i],-half,v[0],half,v[1]);}};
  const block=(x:number,y:number,z:number,w:number,h:number,d:number,side:number,top:number)=>{const x0=x-w/2,x1=x+w/2,z0=z-d/2,z1=z+d/2,y1=y+h;flat([x0,y,z1],[x1,y,z1],[x1,y1,z1],[x0,y1,z1],side);flat([x0,y,z0],[x1,y,z0],[x1,y1,z0],[x0,y1,z0],side);flat([x0,y,z0],[x0,y,z1],[x0,y1,z1],[x0,y1,z0],top);flat([x1,y,z0],[x1,y,z1],[x1,y1,z1],[x1,y1,z0],top);flat([x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],top);};
  ring(0,0,0,wall,WALL);ring(-.06,wall,.06,wall,SIGNAL);
  // Pass 3: on phones the near side is not a stand (see the gantry deck below), so the bowl is three-sided there.
  const bowlSides=opts.mobile?[0,1,3]:[0,1,2,3];
  for(let r=0;r<rows;r++){const o=r*tread,y=wall+r*riser;if(r)ring(o,y-riser,o,y,RISER,bowlSides);strip(o,y,o+tread,y,SEAT_V,16,bowlSides);}
  const rimO=rows*tread,rimY=wall+(rows-1)*riser;strip(rimO,rimY,rimO,rimY+1.5,FASCIA_V,32,[0,1,3]);ring(rimO,rimY+1.5,rimO+.5,rimY+1.5,STEEL,[0,1,3]);
  // The near stand climbs on past the others, under and behind the camera: its top rows are the dark foreground of the desktop frame.
  // Desktop only. On a phone the bottom of the frame is under the player's thumbs, so the foreground there is the quiet back edge of
  // the TV gantry instead of a stand: the dark deck the main camera stands on, a kick plate and one steel handrail. Nothing in it
  // moves or carries colour, so the stick and the keys read cleanly over it and the pitch gets the depth the stand used to take.
  if(!opts.mobile)for(let r=rows;r<rows+NEAR_EXTRA;r++){const o=r*tread,y=wall+r*riser,z=IZ+o,x=IX+o+9;flat([-x,y-riser,z],[x,y-riser,z],[x,y,z],[-x,y,z],RISER);quad([x,y,z],[-x,y,z],[-x,y,z+tread],[x,y,z+tread],-x/16,SEAT_V[0],x/16,SEAT_V[1]);}
  else{const x=IX+16,z=IZ+.02,rail=wall+.95;flat([-x,wall,z],[x,wall,z],[x,wall+3.2,z+16],[-x,wall+3.2,z+16],ROOF);flat([-x,wall,z],[x,wall,z],[x,wall+.16,z+.05],[-x,wall+.16,z+.05],STEEL);
   flat([-x,rail,z+.3],[x,rail,z+.3],[x,rail+.07,z+.3],[-x,rail+.07,z+.3],STEEL_LIT);for(let px=-32;px<=32;px+=4)flat([px-.035,wall,z+.3],[px+.035,wall,z+.3],[px+.035,rail,z+.3],[px-.035,rail,z+.3],STEEL);}
  // Dugouts on the far side: a back wall, a tinted shelter roof and a bench; the subs are cut-outs in the crowd draw.
  for(const x of [-7,7]){const z=-15.9;block(x,0,z-.5,5.6,1.7,.1,BACK,ROOF);flat([x-2.8,1.7,z-.55],[x+2.8,1.7,z-.55],[x+2.8,1.55,z+.75],[x-2.8,1.55,z+.75],GLASS);block(x,0,z,5,.42,.4,BENCH,BENCH);for(const e of [-2.8,2.8])flat([x+e,0,z-.55],[x+e,0,z+.75],[x+e,1.55,z+.75],[x+e,1.7,z-.55],GLASS);}
  // Far gantry: five masts off the back of the stand, a truss along the roofline and four lamp banks tilted at the pitch.
  const up=new T.Vector3(0,1,0),f=new T.Vector3(),right=new T.Vector3(),tilt=new T.Vector3(),at=(c:T.Vector3,r:number,u:number,d=0):V=>[c.x+right.x*r+tilt.x*u+f.x*d,c.y+right.y*r+tilt.y*u+f.y*d,c.z+right.z*r+tilt.z*u+f.z*d];
  {const z=-(IZ+rimO+.9),y0=rimY+1.5,GY=STADIUM.lampY-1.3,y1=GY-.9;for(const x of [-24,-12,0,12,24]){flat([x-.22,y0-3,z],[x+.22,y0-3,z],[x+.16,y1,z],[x-.16,y1,z],STEEL_LIT);}
   flat([-26,y1,z],[26,y1,z],[26,y1+.22,z],[-26,y1+.22,z],STEEL_LIT);flat([-26,y1-.9,z],[26,y1-.9,z],[26,y1-.72,z],[-26,y1-.72,z],STEEL);for(let x=-26;x<26;x+=2)flat([x,y1-.72,z],[x+.14,y1-.72,z],[x+2.14,y1,z],[x+2,y1,z],STEEL);
   for(const x of [-18,-6,6,18]){const c=new T.Vector3(x,GY,z+.2),aim=new T.Vector3(x*.72,0,1.5);f.copy(aim).sub(c).normalize();right.crossVectors(f,up).normalize();tilt.crossVectors(right,f).normalize();
    flat(at(c,-2.5,-1.05),at(c,2.5,-1.05),at(c,2.5,1.05),at(c,-2.5,1.05),ROOF);
    for(let i=0;i<6;i++)for(let j=0;j<2;j++){const r=-2.05+i*.82,u=-.5+j*1;flat(at(c,r-.33,u-.36,.06),at(c,r+.33,u-.36,.06),at(c,r+.33,u+.36,.06),at(c,r-.33,u+.36,.06),LAMP);}
    banks.push(c.clone().addScaledVector(f,.4));aims.push(aim);}}
  // Light for the shadows comes from four points: two on the far gantry, two on the roof behind the camera.
  for(const sx of [-1,1])for(const sz of [-1,1])lamps.push(new T.Vector3(sx*STADIUM.lampX,STADIUM.lampY,sz*STADIUM.lampZ));
  // LED boards on the lines the ball bounces off: far side and both ends show the strip, the near side shows its dark back.
  const far=-14.22,near=14.22,end=25.22,H=.95;
  board([-25.4,0,far],[25.4,0,far],[25.4,H,far],[-25.4,H,far],0,2.032);flat([-25.4,H,far],[25.4,H,far],[25.4,H,far-.16],[-25.4,H,far-.16],STEEL);
  flat([-25.4,0,near],[25.4,0,near],[25.4,.62,near],[-25.4,.62,near],BACK);flat([-25.4,.62,near],[25.4,.62,near],[25.4,.62,near+.16],[-25.4,.62,near+.16],STEEL);
  for(const side of [-1,1])for(const zs of [-1,1]){const z0=zs*(GH+.9),z1=zs*14.22,x=side*end,u0=side>0?.1:.6,span=(14.22-GH-.9)/25;board([x,0,side>0?z0:z1],[x,0,side>0?z1:z0],[x,H,side>0?z1:z0],[x,H,side>0?z0:z1],u0,u0+span*zs);flat([x,H,z0],[x,H,z1],[x+side*.16,H,z1],[x+side*.16,H,z0],STEEL);}
  // Corner flag poles (the cloths ripple in strikerScene.ts).
  for(const sx of [-1,1])for(const sz of [-1,1])block(sx*24.55,0,sz*13.55,.07,1.62,.07,POLE,POLE);
  // Goal frames: square-section posts and bar you can read from the gantry, lit on the pitch side, with net stanchions behind.
  for(const side of [-1,1]){const x=side*25,w=.2;for(const z of [-GH,GH]){block(x,0,z,w,GT,w,POST,POST_SHADE);block(x+side*GD,0,z*1.03,.07,GT*.62,.07,CAGE,STEEL);}
   flat([x-side*w/2,GT-w,-GH-w/2],[x-side*w/2,GT-w,GH+w/2],[x-side*w/2,GT,GH+w/2],[x-side*w/2,GT,-GH-w/2],POST);flat([x-w/2,GT,-GH-w/2],[x+w/2,GT,-GH-w/2],[x+w/2,GT,GH+w/2],[x-w/2,GT,GH+w/2],POST);flat([x-w/2,GT-w,-GH-w/2],[x+w/2,GT-w,-GH-w/2],[x+w/2,GT-w,GH+w/2],[x-w/2,GT-w,GH+w/2],POST_SHADE);flat([x+side*w/2,GT-w,-GH-w/2],[x+side*w/2,GT-w,GH+w/2],[x+side*w/2,GT,GH+w/2],[x+side*w/2,GT,-GH-w/2],POST_SHADE);}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));builtUV=new T.Float32BufferAttribute(uv,2);geometry.setAttribute('uv',builtUV);geometry.setIndex(ix);
  const built=new T.Mesh(geometry,new T.MeshBasicMaterial({map:atlas,side:T.DoubleSide}));built.name='striker-bowl';built.frustumCulled=false;group.add(built);}
 // 3. Goal nets: one mesh for both goals. The roof and back are one 12 x 8 grid per goal that the ball can push out.
 const NZ=12,NJ=8,netRest:number[]=[],netPos:number[]=[],netUV:number[]=[],netIx:number[]=[],netState=[{t:-1,z:0,y:1,power:0},{t:-1,z:0,y:1,power:0}];
 for(let g=0;g<2;g++){const side=g?1:-1,base=netPos.length/3;let run=0,px=0,py:number=GT;
  for(let j=0;j<=NJ;j++){const t=j<=2?j/2:(j-2)/(NJ-2),dx=j<=2?t*1:1+t*(GD-1),y=j<=2?GT-.34*t:(GT-.34)*(1-t);run+=Math.hypot(dx-px,y-py);px=dx;py=y;for(let i=0;i<=NZ;i++){const z=-GH+GH*2*i/NZ;netPos.push(side*(25+dx),y,z);netUV.push(z/.46,run/.46);}}
  for(let j=0;j<NJ;j++)for(let i=0;i<NZ;i++){const a=base+j*(NZ+1)+i,b=a+1,c=a+NZ+1,d=c+1;netIx.push(a,c,b,b,c,d);}
  for(const z of [-GH,GH]){const n=netPos.length/3,pts:[number,number][]=[[0,0],[0,GT],[1,GT-.34],[GD,0]];for(const [dx,y] of pts){netPos.push(side*(25+dx),y,z);netUV.push(dx/.46,y/.46);}netIx.push(n,n+1,n+2,n,n+2,n+3);}}
 netRest.push(...netPos);const netGeometry=new T.BufferGeometry(),netAttribute=new T.Float32BufferAttribute(netPos,3);netAttribute.setUsage(T.DynamicDrawUsage);netGeometry.setAttribute('position',netAttribute);netGeometry.setAttribute('uv',new T.Float32BufferAttribute(netUV,2));netGeometry.setIndex(netIx);
 const netMap=paintNet();netMap.anisotropy=Math.min(4,opts.anisotropy);const nets=new T.Mesh(netGeometry,new T.MeshBasicMaterial({map:netMap,color:'#dfe8f2',transparent:true,opacity:.62,depthWrite:false,side:T.DoubleSide}));nets.name='striker-nets';nets.frustumCulled=false;nets.renderOrder=2;group.add(nets);
 const GRID=(NZ+1)*(NJ+1),PER=GRID+8;
 function stepNets(dt:number){for(let g=0;g<2;g++){const n=netState[g];if(n.t<0)continue;n.t+=dt;const side=g?1:-1,done=n.t>2.4,amp=done?0:n.power*(1-Math.exp(-n.t*26))*Math.exp(-n.t*2.4)*Math.cos(n.t*9.5),a=netAttribute.array as Float32Array;
   for(let j=1;j<NJ;j++){const wj=Math.sin(Math.PI*j/NJ);for(let i=1;i<NZ;i++){const k=(g*PER+j*(NZ+1)+i)*3,z=netRest[k+2],y=netRest[k+1],w=wj*Math.sin(Math.PI*i/NZ)*(.35+.65*Math.exp(-((z-n.z)**2)*.11-((y-n.y)**2)*.2));a[k]=netRest[k]+side*amp*w*1.5;a[k+1]=y+amp*w*.18;}}
   netAttribute.needsUpdate=true;if(done)n.t=-1;}}
 // 4. The people: one instanced draw. Seats follow the bowl's rows with aisles and empty seats; Gold's end is -x, Blue's +x.
 const crowdTime={value:0},crowdEnergy={value:0},crowdWave={value:new T.Vector2(0,0)};let fanTotal=0;
 {const rnd=seeded(31),fan:number[]=[],dress=['#39415a','#50586c','#6a5252','#62707f','#8f949c','#bdb8ad','#34424d','#7a654f','#4a3b4d','#3d5247','#d8d4ca','#a23b33'],gold=new T.Color('#e8a920'),blue=new T.Color('#2f78d0'),steward=new T.Color('#ffffff'),color=new T.Color(),step=opts.mobile?.6:.54;
  // x, y, z, yaw, lean, scale, seed, cell, shade, r, g, b
  const put=(x:number,y:number,z:number,yaw:number,lean:number,scale:number,cell:number,shade:number,c:T.Color)=>fan.push(x,y,z,yaw,lean,scale,rnd(),cell,shade,c.r,c.g,c.b);
  for(let r=0;r<rows+NEAR_EXTRA;r++){const o=r*tread+tread*.42,y=wall+r*riser,hx=IX+o,hz=IZ+o,fall=Math.max(.5,1-r*.058);
   const seat=(x:number,z:number,yaw:number,lean:number,along:number,face:number)=>{const m=((along%8)+8)%8;if(m<.55||m>7.45)return;if(rnd()<.06+r*.012)return;const lean2=Math.min(1,Math.abs(x)/hx),goldShare=x<0?.5+lean2*.42:.5-lean2*.42,team=rnd();let cell=Math.floor(rnd()*4);
     if(team<.44)color.copy(rnd()<goldShare?gold:blue);else color.set(dress[Math.floor(rnd()*dress.length)]);const shade=fall*face*(.62+rnd()*.38);color.multiplyScalar(shade);
     if(team<.5&&rnd()<.03&&r>1&&face>.6){cell=4;put(x,y+.35,z,yaw,lean*.4,1.35,cell,shade,color);return;}put(x,y,z,yaw,lean,1,cell,shade,color);};
   if(r>=rows){if(!opts.mobile)for(let x=-hx-7;x<hx+7;x+=step)seat(x,hz,Math.PI,.5,x,.2);continue;}
   for(let x=-hx+.6;x<hx-.5;x+=step){seat(x,-hz,0,-.42,x,1);if(!opts.mobile)seat(x,hz,Math.PI,.5,x,.26);}for(let z=-hz+.6;z<hz-.5;z+=step){seat(-hx,z,.72,-.36,z,.86);seat(hx,z,-.72,-.36,z,.86);}}
  // Apron life: stewards with their backs to the match along the far wall, photographers on both sides of each goal, the ball crew
  // by the boards, and the subs on both benches.
  for(let x=-25;x<=25;x+=5)put(x+.4,0,-(IZ-.55),Math.PI,0,.92,5,.9,steward);for(const sx of [-1,1])for(let z=-12;z<=12;z+=6)put(sx*(IX-.55),0,z,sx*Math.PI/2,0,.92,5,.82,steward);
  for(const sx of [-1,1])for(const zs of [-1,1])for(let i=0;i<5;i++)put(sx*(26.5+(i%2)*.6),0,zs*(6+i*1.25),-sx*.9,-.1,.9,6,.85,steward);
  for(const x of [-21,-14,14,21])put(x,0,-15.2,0,-.1,.8,7,.95,color.set('#e5372b'));for(const x of [-18,18])put(x,0,15.1,Math.PI,.1,.8,7,.5,color.set('#e5372b'));
  for(const bx of [-7,7])for(let i=0;i<6;i++)put(bx-2+i*.8,.2,-15.75,0,-.1,.86,1,.9,color.copy(bx<0?gold:blue).multiplyScalar(.9));
  fanTotal=fan.length/12;const geometry=new T.PlaneGeometry(.84,1.68);geometry.translate(0,.84,0);const data=new Float32Array(fanTotal*3),dummy=new T.Object3D();
  const people=paintPeople();people.anisotropy=Math.min(4,opts.anisotropy);const material=new T.MeshBasicMaterial({map:people,alphaTest:.5,side:T.DoubleSide});
  material.onBeforeCompile=shader=>{shader.uniforms.uTime=crowdTime;shader.uniforms.uEnergy=crowdEnergy;shader.uniforms.uWave=crowdWave;
   shader.vertexShader='attribute vec3 aFan;uniform float uTime;uniform float uEnergy;uniform vec2 uWave;varying float vTone;\n'+shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
float seed=aFan.x,isFan=step(aFan.y,4.5)+step(6.5,aFan.y),isFlag=step(3.5,aFan.y)*step(aFan.y,4.5);
float wave=uWave.y*smoothstep(7.,0.,abs(instanceMatrix[3].x-uWave.x));
float lift=clamp(max(uEnergy*(.42+seed*1.15),wave),0.,1.)*isFan;float armsUp=step(.5,lift);
float hop=abs(sin(uTime*(5.5+seed*3.)+seed*40.));
transformed.y+=hop*lift*.3*(1.-isFlag)+sin(uTime*1.1+seed*61.)*.022*isFan;
transformed.x+=sin(uTime*(.7+isFlag*(1.6+uEnergy*2.))+seed*23.)*(.03+isFlag*.26)*uv.y*isFan;
vMapUv=vec2((uv.x+aFan.y)*.125,(uv.y+1.-armsUp)*.5);vTone=aFan.z*(.5+.5*fract(seed*7.31));`);
   shader.fragmentShader='varying float vTone;\n'+shader.fragmentShader.replace('#include <map_fragment>','vec4 person=texture2D(map,vMapUv);float shirt=clamp((person.g-max(person.r,person.b))*2.5,0.,1.);diffuseColor=vec4(mix(person.rgb*vTone,vColor*(.3+.7*person.g),shirt),person.a);').replace('#include <color_fragment>','');};
  material.customProgramCacheKey=()=>'striker-people';
  const fans=new T.InstancedMesh(geometry,material,fanTotal);fans.name='striker-crowd';fans.frustumCulled=false;
  for(let n=0;n<fanTotal;n++){const k=n*12;dummy.position.set(fan[k],fan[k+1],fan[k+2]);dummy.rotation.set(fan[k+4],fan[k+3],0,'YXZ');dummy.scale.setScalar(fan[k+5]);dummy.updateMatrix();fans.setMatrixAt(n,dummy.matrix);data[n*3]=fan[k+6];data[n*3+1]=fan[k+7];data[n*3+2]=fan[k+8];fans.setColorAt(n,color.setRGB(fan[k+9],fan[k+10],fan[k+11]));}
  geometry.setAttribute('aFan',new T.InstancedBufferAttribute(data,3));group.add(fans);}
 // 5. Floodlight shadows: every body and the ball throw one soft tapered shadow away from each of the four lamps, plus a tight
 // contact shadow under the feet, so a body is pinned to the grass and the cross is clean.
 const BODIES=9,ARMS=4,shadowGeometry=new T.PlaneGeometry(1,1);shadowGeometry.rotateX(-Math.PI/2);shadowGeometry.translate(0,0,.44);
 const shadowMesh=new T.InstancedMesh(shadowGeometry,new T.MeshBasicMaterial({map:paintShadow(),color:'#010805',transparent:true,opacity:.5,depthWrite:false}),BODIES*ARMS);shadowMesh.name='striker-shadows';shadowMesh.frustumCulled=false;shadowMesh.renderOrder=1;shadowMesh.position.y=.04;shadowMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);group.add(shadowMesh);
 const sm=shadowMesh.instanceMatrix.array as Float32Array;sm.fill(0);
 const contactGeometry=new T.PlaneGeometry(1,1);contactGeometry.rotateX(-Math.PI/2);const contactMesh=new T.InstancedMesh(contactGeometry,new T.MeshBasicMaterial({map:paintDot(),color:'#010805',transparent:true,opacity:.62,depthWrite:false}),BODIES);contactMesh.name='striker-contact';contactMesh.frustumCulled=false;contactMesh.renderOrder=1;contactMesh.position.y=.045;contactMesh.instanceMatrix.setUsage(T.DynamicDrawUsage);group.add(contactMesh);
 const cm=contactMesh.instanceMatrix.array as Float32Array;cm.fill(0);for(let i=0;i<BODIES;i++){cm[i*16+5]=1;cm[i*16+15]=1;}
 const contact=(slot:number,x:number,z:number,size:number)=>{const o=slot*16;cm[o]=size;cm[o+10]=size*.62;cm[o+12]=x;cm[o+14]=z;};
 function shade(slot:number,x:number,z:number,width:number,reach:number,height:number){for(let t=0;t<ARMS;t++){const o=(slot*ARMS+t)*16,lamp=lamps[t],dx=x-lamp.x,dz=z-lamp.z,dist=Math.hypot(dx,dz)||1,ux=dx/dist,uz=dz/dist,length=reach*(.5+dist*.03),push=height*dist/lamp.y,w=width;
   sm[o]=uz*w;sm[o+1]=0;sm[o+2]=-ux*w;sm[o+3]=0;sm[o+4]=0;sm[o+5]=1;sm[o+6]=0;sm[o+7]=0;sm[o+8]=ux*length;sm[o+9]=0;sm[o+10]=uz*length;sm[o+11]=0;sm[o+12]=x+ux*push;sm[o+13]=0;sm[o+14]=z+uz*push;sm[o+15]=1;}}
 /** Bodies are the eight rigs (root positions, so the replay moves them too); the ball's shadows slide out as it rises. */
 function castShadows(bodies:readonly{root:T.Object3D}[],ball:T.Vector3,bodyScale:number){for(let i=0;i<bodies.length&&i<BODIES-1;i++){const q=bodies[i].root.position;shade(i,q.x,q.z,.52*bodyScale,1.1*bodyScale,0);contact(i,q.x,q.z,1.05*bodyScale);}const lift=Math.max(0,ball.y-.36);shade(BODIES-1,ball.x,ball.z,.5,.62,lift);contact(BODIES-1,ball.x,ball.z,.95/(1+lift*.5));shadowMesh.instanceMatrix.needsUpdate=true;contactMesh.instanceMatrix.needsUpdate=true;}
 // 6. Light in the air: glare on the four lamp banks, haze cones down to the grass, camera flashes in the stands.
 const dot=contactMesh.material.map as T.Texture,glareGeometry=new T.BufferGeometry();glareGeometry.setAttribute('position',new T.Float32BufferAttribute(banks.flatMap(v=>[v.x,v.y,v.z]),3));
 const glareMaterial=new T.PointsMaterial({map:paintGlare(),color:'#f4f7ff',size:30,sizeAttenuation:true,transparent:true,opacity:.95,depthWrite:false,depthTest:false,blending:T.AdditiveBlending,fog:false}),glare=new T.Points(glareGeometry,glareMaterial);glare.name='striker-glare';glare.frustumCulled=false;glare.renderOrder=4;group.add(glare);
 const beamMaterial=new T.MeshBasicMaterial({color:'#cfe0ff',transparent:true,opacity:.04,depthWrite:false,blending:T.AdditiveBlending,side:T.DoubleSide,fog:false});
 {const p:number[]=[],axis=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3(),SEG=14;banks.forEach((lamp,t)=>{axis.copy(aims[t]).sub(lamp).normalize();a.crossVectors(axis,new T.Vector3(0,1,0)).normalize();b.crossVectors(axis,a).normalize();const base=lamp.clone().lerp(aims[t],.62),R=4.4;
   for(let i=0;i<SEG;i++){const t0=i/SEG*Math.PI*2,t1=(i+1)/SEG*Math.PI*2;p.push(lamp.x,lamp.y,lamp.z,base.x+(a.x*Math.cos(t0)+b.x*Math.sin(t0))*R,base.y+(a.y*Math.cos(t0)+b.y*Math.sin(t0))*R,base.z+(a.z*Math.cos(t0)+b.z*Math.sin(t0))*R,base.x+(a.x*Math.cos(t1)+b.x*Math.sin(t1))*R,base.y+(a.y*Math.cos(t1)+b.y*Math.sin(t1))*R,base.z+(a.z*Math.cos(t1)+b.z*Math.sin(t1))*R);}});
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(p,3));const beams=new T.Mesh(geometry,beamMaterial);beams.name='striker-beams';beams.frustumCulled=false;beams.renderOrder=3;group.add(beams);}
 const FLASHES=30,flashPoints=new Float32Array(FLASHES*3).fill(-200),flashGeometry=new T.BufferGeometry(),flashAttribute=new T.BufferAttribute(flashPoints,3);flashAttribute.setUsage(T.DynamicDrawUsage);flashGeometry.setAttribute('position',flashAttribute);
 const flashes=new T.Points(flashGeometry,new T.PointsMaterial({map:dot,color:'#ffffff',size:4.4,sizeAttenuation:true,transparent:true,depthWrite:false,blending:T.AdditiveBlending,fog:false}));flashes.name='striker-flashes';flashes.frustumCulled=false;flashes.visible=false;flashes.renderOrder=4;group.add(flashes);
 let flashLeft=0,flashTick=0,flashEnd=0,clock=0,glow=0,waveT=-1,waveFrom=1;
 /** Camera flashes for `seconds`, thickest behind the goal at `side` (-1 / 1, 0 = all round). Off under reduced motion. */
 function flash(seconds:number,side=0){if(opts.reduced)return;flashLeft=Math.max(flashLeft,seconds);flashEnd=side;flashes.visible=true;}
 function stepFlashes(dt:number){if(!flashes.visible)return;flashLeft-=dt;flashTick-=dt;if(flashLeft<=0){flashes.visible=false;flashPoints.fill(-200);flashAttribute.needsUpdate=true;return;}if(flashTick>0)return;flashTick=.07;
  for(let i=0;i<FLASHES;i++){const o=i*3;if(Math.random()>.3*Math.min(1,flashLeft)){flashPoints[o+1]=-200;continue;}const r=Math.floor(Math.random()*rows),off=r*tread+tread*.5,y=wall+r*riser+1.05,pick=Math.random(),behind=flashEnd!==0&&pick<.4;
   if(behind){flashPoints[o]=flashEnd*(IX+off);flashPoints[o+2]=(Math.random()-.6)*2*IZ;}else if(pick<.9){flashPoints[o]=(Math.random()-.5)*2*IX;flashPoints[o+2]=-(IZ+off);}else{flashPoints[o]=(Math.random()<.5?-1:1)*(IX+off);flashPoints[o+2]=(Math.random()-.6)*2*IZ;}flashPoints[o+1]=y;}
  flashAttribute.needsUpdate=true;}
 /** A goal at `side` (-1 / 1): the ball punches the net out at (z, y) and a wave of raised arms runs round from that end. */
 function goal(side:number,z:number,y:number,power=1){if(opts.reduced)return;const n=netState[side>0?1:0];n.t=0;n.z=Math.max(-GH+.6,Math.min(GH-.6,z));n.y=Math.max(.5,Math.min(GT-.5,y));n.power=power;waveT=0;waveFrom=side>0?1:-1;}
 /** Per frame: crowd energy (0 calm .. 1.4 roar) drives the stand, `burst` (0..1, a goal) flares the lamps and scrolls the boards. */
 function update(dt:number,energy:number,burst:number,beamBase:number){if(dt<=0)return;clock+=dt;const lift=opts.reduced?0:Math.max(0,Math.min(1,(energy-.3)/.8));
  if(!opts.reduced)crowdTime.value=clock;crowdEnergy.value+=(lift-crowdEnergy.value)*(1-Math.exp(-dt*(lift>crowdEnergy.value?7:1.6)));
  if(waveT>=0){waveT+=dt;const span=IX+rows*tread+8,travel=waveT*34;if(travel>span*4){waveT=-1;crowdWave.value.set(0,0);}else{const leg=travel%(span*2),back=Math.floor(travel/(span*2))%2===1;crowdWave.value.set(waveFrom*(back?-1:1)*(span-leg),1);}}
  glow+=(burst-glow)*(1-Math.exp(-dt*6));const pulse=opts.reduced?0:glow;glareMaterial.size=30+pulse*10;glareMaterial.opacity=.9+pulse*.1;
  const beam=beamBase+pulse*.05;if(Math.abs(beamMaterial.opacity-beam)>.002)beamMaterial.opacity=beam;
  if(pulse>.02){const a=builtUV.array as Float32Array,d=dt*.22*pulse;for(const k of boardU)a[k]+=d;builtUV.needsUpdate=true;}
  stepNets(dt);stepFlashes(dt);}
 return{group,turfMaterial,beamMaterial,glareMaterial,castShadows,flash,goal,update,fanTotal};
}
