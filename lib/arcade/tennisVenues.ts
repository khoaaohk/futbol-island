/** Futbol Tennis tour stops (comic house style, Nov 10 2026): how each court in TENNIS_COURTS prints. Same club, a different floor,
 * hour and sky: every stop is its own comic panel. Pure data (no three.js): the world (lib/arcade/tennisWorld.ts) applies it, the
 * court picker and audio read the names. Looks only: bounce, skid, wind and scoring stay in lib/games/soccerTennis.ts. */
export type TennisSurfaceLook='clay'|'sand'|'hard'|'deck'|'lawn'|'rubber';
type Tint=[number,number,number];
export type TennisVenue={id:string;place:string;hour:string;surface:TennisSurfaceLook;set:'beach'|'pier';seed:number;
 /** Position of the one sun (the camera sits at +z looking toward -z): low and ahead, so shadows rake toward the player. */
 sun:[number,number,number];
 /** The sky panel: three flat bands (top, middle, horizon), the sun or moon as stacked discs (core, ring, outer ring), cut clouds
  * (lit, underside), headlands (near, far). `sunSide` = which side of the screen the disc sits, `sunAlt` = its height above the
  * horizon in disc radii, `night` = a moon and stars (no poster bars). */
 sky:[string,string,string];disc:[string,string,string];cloud:[string,string];head:[string,string];sunSide:-1|1;sunAlt:number;night?:1;
 /** Sea bands (far, near) and the glitter path; dry sand. */
 sea:[string,string,string];sand:string;
 /** Comic band tints (linear RGB multipliers): what shadow and light do to a flat colour on this panel. */
 shade:Tint;light:Tint;
 /** Bounce puff tint, ball-smudge tint + strength, gust-line strength, lantern strings (0/1), the stop's own breeze (signed, -1..1). */
 dust:string;mark:string;markOpacity:number;gust:number;lanterns:number;breeze:number;
 /** 1 = the centre-court grandstand (and its members) replaces the parasol row. */
 stand?:1;
 /** Audio: surf level 0..1 and how the bounce sounds. */
 surf:number;bounce:'clay'|'sand'|'hard'|'wood'|'grass'};
const DAY={sky:['#3f93d8','#8fd0ee','#fff1c9'] as [string,string,string],disc:['#fffbe0','#ffe58a','#ffc24a'] as [string,string,string],cloud:['#ffffff','#bfe0f2'] as [string,string],head:['#3f7f86','#8fc7c2'] as [string,string],sunAlt:1.1,
 sea:['#2b7fb8','#27b5ad','#fff7cf'] as [string,string,string],sand:'#f4d08c',shade:[.55,.47,.74] as Tint,light:[1,.96,.86] as Tint,lanterns:0,surf:.6};
const NIGHT={sky:['#141a44','#1f2a6b','#3d3f8f'] as [string,string,string],disc:['#f4f1ff','#aab4ff','#5a62c8'] as [string,string,string],cloud:['#4a52a8','#2a3080'] as [string,string],head:['#0f1338','#262c6e'] as [string,string],sunAlt:1.35,night:1 as const,
 sea:['#141f52','#23357a','#c9d0ff'] as [string,string,string],sand:'#c9a877',shade:[.36,.38,.7] as Tint,light:[1,.86,.62] as Tint,lanterns:1,surf:.75};
export const TENNIS_VENUES:TennisVenue[]=[
 // 1 First Touch: the practice court, mid-morning. Fresh rake strokes, a lemon sun on the left.
 {...DAY,id:'morning-clay',place:'Practice court',hour:'Morning',surface:'clay',set:'beach',seed:11,sun:[-15.8,11.4,-20.2],sunSide:-1,dust:'#ffd9b8',mark:'#8a3a1e',markOpacity:.5,gust:.6,breeze:.16,bounce:'clay'},
 // 2 Beach Day: the sand court at high noon. Rope lines, a white sun riding high, the hardest light of the tour.
 {...DAY,id:'noon-sand',place:'Sand court',hour:'High noon',surface:'sand',set:'beach',seed:23,sun:[-6.2,21.4,-16.9],sunSide:-1,sunAlt:1.6,sky:['#1f7fde','#55b4ee','#c9ecf5'],disc:['#ffffff','#fff3a8','#ffe07a'],sea:['#1f7fc4','#16c2b8','#ffffff'],shade:[.5,.5,.8],light:[1,1,.94],sand:'#f6dc9c',dust:'#fff0c4',mark:'#a8793a',markOpacity:.5,gust:.8,breeze:.22,bounce:'sand'},
 // 3 Target Drill: the teal back court, late morning, sun from the right.
 {...DAY,id:'back-court',place:'Back court',hour:'Late morning',surface:'hard',set:'beach',seed:31,sun:[13.9,14,-19.9],sunSide:1,sunAlt:1.3,sky:['#3b8fd9','#7cc4ea','#e8f6e4'],dust:'#fff3d6',mark:'#0f5a55',markOpacity:.4,gust:.5,breeze:-.14,bounce:'hard'},
 // 4 Futnet Rules: centre court in the afternoon, flags out, the members in the stand.
 {...DAY,stand:1,id:'centre-court',place:'Centre court',hour:'Afternoon',surface:'clay',set:'beach',seed:47,sun:[17.4,10.5,-19.3],sunSide:1,sunAlt:.9,sky:['#3a78c9','#9fd0e8','#ffe9b8'],disc:['#fff6c8','#ffd76a','#ffb24a'],dust:'#ffd9b8',mark:'#8a3a1e',markOpacity:.5,gust:.6,breeze:.3,bounce:'clay'},
 // 5 Trick Shots: the sand court at golden hour. Breakaway's own evening: orange bands, a stacked-disc sun, long violet shadows.
 {...DAY,id:'golden-sand',place:'Sand court',hour:'Golden hour',surface:'sand',set:'beach',seed:59,sun:[-13.6,6.8,-23.5],sunSide:-1,sunAlt:.35,sky:['#e9825c','#f6a968','#ffcf7a'],disc:['#fff1b0','#ffc24a','#ff8a3c'],cloud:['#ffe1b0','#d9707a'],head:['#7a4a78','#c9788a'],sea:['#2b6fa3','#1f8f96','#fff1b0'],shade:[.56,.42,.7],light:[1,.9,.72],sand:'#f6c888',dust:'#ffe1b0',mark:'#a8793a',markOpacity:.5,gust:.7,breeze:-.2,bounce:'sand'},
 // 6 Neon Final: the evening final as a night panel. The one shadow-casting light is the lantern key from overhead; the comic
 // shader keeps its light band inside the warm lamp pools, so the court, players and ball sit in lamplight against blue shadow.
 {...DAY,...NIGHT,stand:1,id:'lantern-final',place:'Centre court',hour:'Lantern evening',surface:'clay',set:'beach',seed:61,sun:[-4,26,6],sunSide:1,dust:'#ffd9b8',mark:'#8a3a1e',markOpacity:.45,gust:.4,breeze:.12,bounce:'clay'},
 // 7 Windy Pier: a timber court out on the water under a slate, windy sky. Whitecaps as ink dashes, flags straining.
 {...DAY,id:'windy-pier',place:'Pier court',hour:'Windy afternoon',surface:'deck',set:'pier',seed:73,sun:[12.6,12.3,-21.8],sunSide:1,sunAlt:1.2,sky:['#39465a','#6f8aa3','#cfe0e6'],disc:['#fff6dc','#e9f0d8','#b9cbd3'],cloud:['#e9f0f2','#56677d'],head:['#2f3f55','#7f97a8'],sea:['#1f5f86','#2b8fa3','#ffffff'],shade:[.5,.52,.72],light:[.98,.98,.94],dust:'#ffffff',mark:'#4a3524',markOpacity:.4,gust:1,breeze:.5,surf:1,bounce:'wood'},
 // 8 Bounce House: the rubber kids' court at sunrise. Coral tiles, a pink and violet sky, the lowest sun of the tour.
 {...DAY,id:'sunrise-rubber',place:'Rubber court',hour:'Sunrise',surface:'rubber',set:'beach',seed:83,sun:[-19,5.8,-19.7],sunSide:-1,sunAlt:.15,sky:['#6f7fd6','#f08aa8','#ffd6a8'],disc:['#fff1d0','#ffb07a','#ff7f8a'],cloud:['#ffe1d0','#b86a9c'],head:['#5a4a8a','#c98aa8'],sea:['#4a6fb8','#4fb5b0','#ffe9d0'],shade:[.6,.46,.74],light:[1,.9,.84],sand:'#f6c8a0',dust:'#ffe6d4',mark:'#8a3b33',markOpacity:.35,gust:.5,breeze:.14,bounce:'hard'},
 // 9 Legend Cup: the lawn, championship afternoon. Two mowing bands, crisp paper lines.
 {...DAY,stand:1,id:'the-lawn',place:'The lawn',hour:'Championship afternoon',surface:'lawn',set:'beach',seed:97,sun:[14.5,13.1,-20],sunSide:1,sunAlt:1.2,sky:['#2f6fd0','#6fb4ee','#dff4c9'],dust:'#eaffc4',mark:'#2f6e33',markOpacity:.35,gust:.6,breeze:.3,bounce:'grass'},
];
/** The two endless tours reuse a stop in different weather. */
export const TENNIS_TOUR_VENUES:TennisVenue[]=[
 {...TENNIS_VENUES[3],id:'pro-tour',place:'Centre court',hour:'Sea breeze',seed:101,sun:[-14.1,12.3,-20.9],sunSide:-1,sunAlt:1.2,sky:['#2f8fd0','#7fd0e8','#eafbe4'],breeze:.4,gust:.9},
 {...TENNIS_VENUES[5],id:'legend-tour',place:'Centre court',hour:'Night final',seed:103,sky:['#2a1650','#4a1f6b','#8a2f6e'],disc:['#ff6a4a','#ff4a3a','#b8305a'],breeze:.35,gust:.8},
];
export function tennisVenueFor(level:number,tour=0):TennisVenue{
 if(tour===1||tour===2)return TENNIS_TOUR_VENUES[tour-1];
 return TENNIS_VENUES[Math.max(0,Math.min(TENNIS_VENUES.length-1,Math.floor(level||1)-1))];
}
/** Flat print colours of each surface: [court, second tone (mowing band, plank, tile), line, apron, printed-mark ink]. Shared by the
 * court sheet (tennisWorld.ts paintCourt) and the start-card thumbnails below. */
export const TENNIS_SURFACE_INK:Record<TennisSurfaceLook,[string,string,string,string,string]>={clay:['#d9623b','#e2714a','#fff3d6','#c9542f','#a8421f'],sand:['#f4d08c','#f9dc9f','#2f6fb0','#e9bd72','#c9974a'],hard:['#1fa396','#27b0a2','#fff3d6','#d9623b','#127a70'],deck:['#d9a868','#c9945a','#fff3d6','#b98248','#7a5230'],lawn:['#57b56a','#49a660','#fff3d6','#3f9455','#2f7d46'],rubber:['#f08a6c','#ff9f80','#fff3d6','#2f6fb0','#c9603f']};

/** Court preview for the start card: a small comic panel of a tour stop (sky bands, stacked-disc sun or moon, banded sea, the
 * parasol row or the stand, the flat court with inked lines), drawn ONCE into a 2D canvas from the venue's own palette and
 * cached as a data URL. No WebGL and no animation: the menu still draws 0 frames. Returns '' on the server. */
const INK='#231a2e',PAPER='#fff3d6',thumbCache=new Map<string,string>();
export function tennisVenueThumb(v:TennisVenue,W=208,H=136):string{
 if(typeof document==='undefined')return '';const hit=thumbCache.get(v.id);if(hit!==undefined)return hit;
 const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');if(!g)return '';
 const [court,court2,line,apron]=TENNIS_SURFACE_INK[v.surface],pier=v.set==='pier',night=!!v.night,hz=H*.34,X=(x:number,t:number)=>W/2+x*(W*.2+t*W*.26),Y=(t:number)=>H*.52+t*t*H*.46+t*H*.06; // x in -1..1 across the court, t 0 (far baseline) .. 1 (near)
 const quad=(x0:number,x1:number,t0:number,t1:number,fill:string)=>{g.fillStyle=fill;g.beginPath();g.moveTo(X(x0,t0),Y(t0));g.lineTo(X(x1,t0),Y(t0));g.lineTo(X(x1,t1),Y(t1));g.lineTo(X(x0,t1),Y(t1));g.closePath();g.fill();};
 const dots=(y:number,fill:string)=>{g.fillStyle=fill;for(let r=0;r<2;r++)for(let x=(r%2)*3;x<W;x+=6){g.beginPath();g.arc(x,y-r*3-1.5,2.2-r*.9,0,7);g.fill();}};
 // sky: three flat bands with a dot-screen turn, the disc, a cut cloud, a headland
 g.fillStyle=v.sky[0];g.fillRect(0,0,W,hz);g.fillStyle=v.sky[1];g.fillRect(0,hz*.36,W,hz);dots(hz*.36,v.sky[1]);g.fillStyle=v.sky[2];g.fillRect(0,hz*.72,W,hz);dots(hz*.72,v.sky[2]);
 if(night){g.fillStyle=PAPER;for(let i=0;i<14;i++)g.fillRect((i*53+11)%W,(i*29+5)%(hz*.7),1.6,1.6);}
 {const sx=v.sunSide<0?W*.22:W*.78,R=13,sy=hz-R*v.sunAlt*.8;g.fillStyle=v.disc[2];g.globalAlpha=.4;g.beginPath();g.arc(sx,sy,R*1.5,0,7);g.fill();g.globalAlpha=1;g.fillStyle=v.disc[1];g.beginPath();g.arc(sx,sy,R*1.2,0,7);g.fill();g.fillStyle=v.disc[0];g.beginPath();g.arc(sx,sy,R,0,7);g.fill();
  if(!night){g.fillStyle=v.disc[1];for(let i=0;i<3;i++)g.fillRect(sx-R,sy+R*(.25+i*.24),R*2,1.4+i*.6);}
  g.fillStyle=v.cloud[1];g.beginPath();g.ellipse(W-sx+8,hz*.3+2,26,4.5,0,0,7);g.fill();g.fillStyle=v.cloud[0];g.beginPath();g.ellipse(W-sx+6,hz*.3,24,4,0,0,7);g.fill();
  g.fillStyle=v.head[0];g.beginPath();g.ellipse(W-sx,hz,W*.24,H*.05,0,Math.PI,0);g.fill();}
 // sea: far and near band, glitter under the disc, an ink horizon line
 g.fillStyle=v.sea[0];g.fillRect(0,hz,W,H-hz);g.fillStyle=v.sea[1];g.fillRect(0,hz+(pier?H*.2:H*.05),W,H);g.fillStyle=v.sea[2];for(let i=0;i<(pier?22:8);i++){const x=(v.sunSide<0?W*.22:W*.78)+((i*37)%50-25)*(pier?3:1),y=hz+2+(i*13)%(pier?H*.6:H*.09);g.fillRect(x,y,5+(i%3)*3,1.5);}
 g.fillStyle=INK;g.fillRect(0,hz-.6,W,1.2);
 if(!pier){g.fillStyle='#ffffff';g.fillRect(0,H*.445,W,2);g.fillStyle=v.sand;g.fillRect(0,H*.455,W,H);
  // far side of the club: the grandstand with its members, or the row of striped parasols; then the whitewashed wall
  if(v.stand){for(const sd of[-1,1]){const x0=sd<0?W*.06:W*.6,w=W*.34;g.fillStyle=INK;g.fillRect(x0-1.5,H*.37-1.5,w+3,H*.13+3);g.fillStyle='#fff0dc';g.fillRect(x0,H*.37,w,H*.13);g.fillStyle='#2f6fb0';g.fillRect(x0,H*.37,w,3);for(let k=0;k<2;k++)for(let i=0;i<8;i++){g.fillStyle=['#f0452e',PAPER,'#ffc83a','#19b5a5'][(i+k)%4];g.fillRect(x0+4+i*(w-8)/8,H*.405+k*6,4,4);}}}
  else for(let i=0;i<6;i++){const x=W*(.1+i*.16),y=H*.44,col=['#f0452e','#2f6fb0','#ffc83a','#19b5a5'][i%4];g.fillStyle=INK;g.beginPath();g.moveTo(x,y-9);g.lineTo(x-15,y+1.5);g.lineTo(x+15,y+1.5);g.closePath();g.fill();for(let k=0;k<6;k++){g.fillStyle=k&1?PAPER:col;g.beginPath();g.moveTo(x,y-6.5);g.lineTo(x-12+k*4,y);g.lineTo(x-8+k*4,y);g.closePath();g.fill();}}
  g.fillStyle=INK;g.fillRect(0,H*.475-1.5,W*.43+1.5,H*.045+3);g.fillRect(W*.57-1.5,H*.475-1.5,W*.43+1.5,H*.045+3);g.fillStyle='#fff0dc';g.fillRect(0,H*.475,W*.43,H*.045);g.fillRect(W*.57,H*.475,W*.43,H*.045);g.fillStyle='#d9623b';g.fillRect(0,H*.475,W*.43,2);g.fillRect(W*.57,H*.475,W*.43,2);}
 // the court: ink keyline, apron, flat surface (bands, planks or tiles where the floor has them), inked paper lines, net
 quad(-1.34,1.34,-.09,1.2,INK);quad(-1.3,1.3,-.06,1.2,pier?'#b98248':apron);quad(-1,1,0,1,court);
 if(v.surface==='lawn'||v.surface==='deck'||v.surface==='rubber'){const n=v.surface==='deck'?16:8;for(let i=0;i<n;i+=2)quad(-1,1,i/n,(i+1)/n,court2);}
 const ln=(x0:number,t0:number,x1:number,t1:number)=>{g.beginPath();g.moveTo(X(x0,t0),Y(t0));g.lineTo(X(x1,t1),Y(t1));g.stroke();};
 for(const[col,w]of[[INK,3.6],[line,1.8]] as const){g.strokeStyle=col;g.lineWidth=w;ln(-1,0,1,0);ln(-1,1,1,1);ln(-1,0,-1,1);ln(1,0,1,1);ln(-1,.23,1,.23);ln(-1,.77,1,.77);ln(0,.23,0,.77);}
 // shade: a hard violet palm shadow across the near court by day; at night the blue wash with the court cut out as lamp pools
 if(night){g.fillStyle='rgba(28,30,110,.5)';g.fillRect(0,hz,W,H);g.save();g.beginPath();for(const sd of[-1,1])for(let i=0;i<4;i++){const t=i/3,x=X(sd*.62,t),y=Y(t);g.moveTo(x+30+t*26,y);g.ellipse(x,y,30+t*26,13+t*9,0,0,7);}g.clip();quad(-1.3,1.3,-.06,1.2,pier?'#b98248':apron);quad(-1,1,0,1,court);for(const[col,w]of[[INK,3.6],[line,1.8]] as const){g.strokeStyle=col;g.lineWidth=w;ln(-1,0,1,0);ln(-1,1,1,1);ln(-1,0,-1,1);ln(1,0,1,1);ln(-1,.23,1,.23);ln(-1,.77,1,.77);ln(0,.23,0,.77);}g.restore();
  for(const sd of[-1,1])for(let i=0;i<5;i++){const t=i/4,x=X(sd*1.16,t),y=Y(t)-14-t*16;g.fillStyle=INK;g.beginPath();g.arc(x,y,2.6+t*1.4,0,7);g.fill();g.fillStyle='#ffe9a8';g.beginPath();g.arc(x,y,1.6+t*1.2,0,7);g.fill();}}
 else{g.fillStyle='rgba(84,60,150,.42)';const px=v.sunSide<0?X(-1.15,.6):X(1.15,.6),py=Y(.6),dir=v.sunSide<0?1:-1;for(let k=0;k<6;k++){const a=-.5+k*.3;g.beginPath();g.moveTo(px,py);g.quadraticCurveTo(px+dir*26*Math.cos(a),py+22*Math.sin(a)+6,px+dir*46*Math.cos(a),py+34*Math.sin(a)+12);g.lineTo(px+dir*38*Math.cos(a+.16),py+30*Math.sin(a+.16)+12);g.closePath();g.fill();}}
 {const x0=X(-1.08,.5),x1=X(1.08,.5),y=Y(.5);g.fillStyle=INK;g.fillRect(x0-1,y-10.5,x1-x0+2,4.5);g.fillStyle=PAPER;g.fillRect(x0,y-9.5,x1-x0,2.5);g.globalAlpha=.55;g.fillRect(x0,y-7,x1-x0,7);g.globalAlpha=1;for(const sd of[-1,1]){g.fillStyle=INK;g.fillRect(X(sd*1.08,.5)-2.5,y-12,5,13);g.fillStyle=PAPER;g.fillRect(X(sd*1.08,.5)-1.2,y-11,2.4,11);}}
 // flags answer the stop's breeze
 for(const sd of[-1,1]){const x=X(sd*1.22,0),y=Y(0);g.fillStyle=INK;g.fillRect(x-1.2,y-31,2.4,31);const w=(8+Math.abs(v.breeze)*14)*(v.breeze<0?-1:1);for(const[col,o]of[[INK,1.6],[sd<0?'#f0452e':'#2f6fb0',0]] as const){g.fillStyle=col;g.beginPath();g.moveTo(x,y-30-o);g.lineTo(x+w+Math.sign(w)*o*1.6,y-26);g.lineTo(x,y-22+o);g.closePath();g.fill();}}
 g.strokeStyle=INK;g.lineWidth=4;g.strokeRect(0,0,W,H);
 let url='';try{url=c.toDataURL('image/png');}catch{url='';}thumbCache.set(v.id,url);return url;
}
