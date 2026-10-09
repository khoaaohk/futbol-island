/**
 * Holo foil (card lab, Oct 8 2026): the football meaning of each foil, the tier strengths, and the cheap CSS pattern images
 * for small cards. Pure data and string builders, no imports, so tests/holo-foil.cjs can run it in Node.
 *
 * Our own implementation, written from scratch (clean-room: the general techniques only, no third-party component source).
 *
 * Each position gets a foil that shows its job, so a child can read the card's position from its shine:
 *  - goalkeeper: a goal net (diamond mesh with knots): the keeper guards the net;
 *  - defender: a wall of interlocking shield shards: defenders protect the goal together;
 *  - midfielder: passing lanes running out from the centre circle: midfielders link the team with passes;
 *  - forward: starbursts: forwards burst into space to score.
 */
export type HoloPattern='net'|'shield'|'lanes'|'burst';
/** Card value tier (lib/town/cardRewards.ts CardTier): sets how strong the foil is. */
export type HoloTier='regular'|'elite'|'icon';
export const HOLO_PATTERNS:readonly HoloPattern[]=['net','shield','lanes','burst'];
export const HOLO_TIERS:readonly HoloTier[]=['regular','elite','icon'];

/** Card roles (lib/town/positionPlayers.json keys) to foil patterns. Futsal roles follow their 11-a-side job: goleiro is the
 *  keeper, fixo the last defender, ala the wide midfielder who links play, pivô the target forward. Coaches get the passing lanes
 *  (the team's plan runs through the middle). */
export const ROLE_PATTERN:Readonly<Record<string,HoloPattern>>={
 goalkeeper:'net',goleiro:'net',
 centerback:'shield',fullback:'shield',fixo:'shield',
 midfielder:'lanes',ala:'lanes',coach:'lanes',
 striker:'burst',winger:'burst',pivot:'burst',
};
export const patternForRole=(role:string|undefined):HoloPattern=>(role&&ROLE_PATTERN[role])||'lanes';

/** What the foil means, in words a 7v7 player can read (the chip in the lab and the line on the card back). */
export const PATTERN_INFO:Readonly<Record<HoloPattern,{name:string;position:string;chip:string;line:string}>>={
 net:{name:'Goal-net foil',position:'goalkeeper',chip:'Goal-net foil: goalkeeper',line:'The net is what a goalkeeper guards.'},
 shield:{name:'Shield foil',position:'defender',chip:'Shield foil: defender',line:'Defenders link up like shields to protect the goal.'},
 lanes:{name:'Passing-lane foil',position:'midfielder',chip:'Passing-lane foil: midfielder',line:'Midfielders pass from the middle to every part of the pitch.'},
 burst:{name:'Starburst foil',position:'forward',chip:'Starburst foil: forward',line:'Forwards burst into space to score.'},
};

/** The user's settings (Oct 8 2026): every foil at full strength except the shield wall, which is busier, at 0.70. The one
 *  place both the WebGL foil (HoloFoil's default intensity) and the CSS mini foil (--holo-k) read. */
export const PATTERN_INTENSITY:Readonly<Record<HoloPattern,number>>={net:1,shield:.7,lanes:1,burst:1};
/** The card-back note for a role: the pattern's meaning, with coaches named as coaches (they wear the passing lanes). */
export function foilNote(pattern:HoloPattern,role?:string):{chip:string;line:string}{
 if(role==='coach'&&pattern==='lanes')return {chip:'Passing-lane foil: coach',line:'Coaches plan the passes that link the team.'};
 const info=PATTERN_INFO[pattern];return {chip:info.chip,line:info.line};
}
/** Tier strength: regular is subtle (pattern only round the edges and the picture's background border), elite the full
 *  pattern, icon the full pattern plus gold etching and frame-edge glitter. */
export const TIER_LOOK:Readonly<Record<HoloTier,{label:string;strength:number;edgeOnly:boolean;etching:boolean;glitter:boolean}>>={
 regular:{label:'Regular',strength:.62,edgeOnly:true,etching:false,glitter:false},
 elite:{label:'Elite',strength:1,edgeOnly:false,etching:false,glitter:false},
 icon:{label:'Icon',strength:1.08,edgeOnly:false,etching:true,glitter:true},
};
/** Shader indices (lib/graphics/holoFoil/shader.ts uPattern / uTier). */
export const PATTERN_INDEX:Readonly<Record<HoloPattern,number>>={net:0,shield:1,lanes:2,burst:3};
export const TIER_INDEX:Readonly<Record<HoloTier,number>>={regular:0,elite:1,icon:2};

/** Canvas pixel ratio cap (heat): 1.5 on touch phones and tablets, 2 on desktop. */
export const holoDpr=(devicePixelRatio:number,touch:boolean)=>Math.max(1,Math.min(devicePixelRatio||1,touch?1.5:2));
/** The arrival glint: one short light sweep when a card arrives, then the loop stops. */
export const GLINT_MS=1200;

// ── Small-card version (binder grid): a static pattern image per position, used as a CSS mask over a rainbow layer that moves
// only on hover/press. No WebGL, no loop. The SVGs are drawn in a 100×140 box (the 5:7 card).
const NS="xmlns='http://www.w3.org/2000/svg'";
/** Where the foil may go, baked into the same image (one mask layer, nothing to composite at paint time): a soft hole over the
 *  portrait's head and shoulders, and nothing below the picture window (the name plate stays plain). Regular: only a band round
 *  the edge. Card units: the 100×140 box is the card's padding box (the plate starts ~26 % from the bottom). */
let region:'full'|'edge'='full';
const keepArea=()=>region==='edge'
 ?`<radialGradient id='k' cx='50' cy='64' r='60' gradientUnits='userSpaceOnUse' gradientTransform='translate(50 64) scale(1 .97) translate(-50 -64)'><stop offset='.62' stop-color='#000'/><stop offset='.92' stop-color='#fff'/></radialGradient>`
 :`<radialGradient id='k' cx='50' cy='50' r='34' gradientUnits='userSpaceOnUse' gradientTransform='translate(50 50) scale(1 1.17) translate(-50 -50)'><stop offset='.72' stop-color='#000'/><stop offset='1' stop-color='#fff'/></radialGradient>`;
const svg=(body:string)=>`<svg ${NS} viewBox='0 0 100 140' preserveAspectRatio='none'><defs>${keepArea()}<linearGradient id='t' x1='0' y1='0' x2='0' y2='140' gradientUnits='userSpaceOnUse'><stop offset='.735' stop-color='#fff'/><stop offset='.75' stop-color='#000'/></linearGradient><mask id='a' maskUnits='userSpaceOnUse' x='0' y='0' width='100' height='140'><rect width='100' height='140' fill='url(#k)'/></mask><mask id='b' maskUnits='userSpaceOnUse' x='0' y='0' width='100' height='140'><rect width='100' height='140' fill='url(#t)'/></mask></defs><g mask='url(#a)'><g mask='url(#b)'>${body}</g></g></svg>`;
function netSvg(){
 // A diamond goal net with knots: two sets of diagonal cords and a dot at every crossing.
 let cords='',knots='';
 for(let k=-140;k<=240;k+=12){cords+=`M${k} 0L${k-140} 140M${k-100} 0L${k+40} 140`;}
 for(let y=0;y<=146;y+=12)for(let x=(y/12)%2?6:0;x<=106;x+=12)knots+=`<circle cx='${x}' cy='${y}' r='1.5'/>`;
 return svg(`<path d='${cords}' stroke='#fff' stroke-width='1.1' fill='none'/><g fill='#fff'>${knots}</g>`);
}
function shieldSvg(){
 // Staggered shields: each tip sits in the dip between two shields of the row below (a shield wall).
 const shield=(cx:number,cy:number)=>`<path d='M${cx-7} ${cy-6}L${cx} ${cy-9}L${cx+7} ${cy-6}V${cy+1}Q${cx+7} ${cy+7} ${cx} ${cy+11}Q${cx-7} ${cy+7} ${cx-7} ${cy+1}Z' /><path d='M${cx} ${cy-8}V${cy+10}M${cx-6.5} ${cy}L${cx} ${cy+3}L${cx+6.5} ${cy}' />`;
 let body='';
 for(let r=0,y=4;y<=150;r++,y+=17)for(let x=r%2?8:0;x<=110;x+=16)body+=shield(x,y);
 return svg(`<g stroke='#fff' stroke-width='1.2' fill='none' stroke-linejoin='round'>${body}</g>`);
}
function lanesSvg(){
 // The centre circle and spot, the halfway line, and ten lanes with pass arrows running out of the circle.
 const cx=50,cy=60;let lanes='';
 for(let i=0;i<10;i++){const a=i/10*Math.PI*2+.31,dx=Math.cos(a),dy=Math.sin(a),px=-dy,py=dx;
  for(const s of [-1,1])lanes+=`M${(cx+dx*30+px*s*2.4).toFixed(1)} ${(cy+dy*30+py*s*2.4).toFixed(1)}L${(cx+dx*95+px*s*2.4).toFixed(1)} ${(cy+dy*95+py*s*2.4).toFixed(1)}`;
  for(let d=38;d<95;d+=11)lanes+=`M${(cx+dx*(d-2.6)+px*2).toFixed(1)} ${(cy+dy*(d-2.6)+py*2).toFixed(1)}L${(cx+dx*d).toFixed(1)} ${(cy+dy*d).toFixed(1)}L${(cx+dx*(d-2.6)-px*2).toFixed(1)} ${(cy+dy*(d-2.6)-py*2).toFixed(1)}`;}
 return svg(`<g stroke='#fff' fill='none' stroke-width='1.1'><circle cx='${cx}' cy='${cy}' r='24' stroke-width='1.8'/><path d='M0 ${cy}H100'/><path d='${lanes}'/></g><circle cx='${cx}' cy='${cy}' r='2' fill='#fff'/>`);
}
function burstSvg(){
 // One big starburst round the player and small bursts scattered over the card.
 const star=(cx:number,cy:number,n:number,r1:number,r0:number,rot:number)=>{let d='';for(let i=0;i<n*2;i++){const a=rot+i/(n*2)*Math.PI*2,r=i%2?r0:(i%4?r1*.62:r1);d+=`${i?'L':'M'}${(cx+Math.cos(a)*r).toFixed(1)} ${(cy+Math.sin(a)*r).toFixed(1)}`;}return `<path d='${d}Z'/>`;};
 let small='';const spots=[[12,12],[86,16],[8,96],[92,92],[20,128],[80,130],[50,6],[94,56],[6,52]];
 spots.forEach(([x,y],i)=>{small+=star(x,y,4,7-(i%3),1.6,i*.4);});
 return svg(`<g fill='none' stroke='#fff' stroke-width='1.1' stroke-linejoin='round'>${star(50,60,14,62,9,.1)}</g><g fill='#fff'>${small}</g>`);
}
const SVGS:Record<HoloPattern,()=>string>={net:netSvg,shield:shieldSvg,lanes:lanesSvg,burst:burstSvg};
const urls:Record<string,string>={};
/** The pattern as a data: URL (white on transparent, the portrait hole and the plate cut baked in), built once per pattern and
 *  region (`edge` for Regular cards). */
export const miniPatternUrl=(pattern:HoloPattern,tier:HoloTier='elite')=>{const key=`${pattern}|${tier==='regular'?'edge':'full'}`;
 if(!urls[key]){region=tier==='regular'?'edge':'full';urls[key]=`data:image/svg+xml,${encodeURIComponent(SVGS[pattern]())}`;region='full';}return urls[key];};
