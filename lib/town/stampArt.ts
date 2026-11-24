import {BOOT_PROFILES} from '../shop/bootProfiles';
import {STAMPS,stampById,type StampId} from './islandStamps';

/**
 * The eight Island stamp book stamps as SVG strings (owner, Nov 23 2026). ORIGINAL line art in the style of Japanese eki stamps
 * (one ink colour, a round double ring, the stop's name on the ring's arc, a line-art island landscape with a football worked
 * into the scene). Nothing is traced from the reference photo: only its style is taken.
 *
 * Ink look, all in the SVG (no images): a speckle mask (fine noise punches small holes in the ink), uneven pressure (a broad
 * noise field lightens one side), a 2 px warp so lines wobble like rubber, and a faint offset "bleed" copy. The book adds the
 * per-stamp tilt (±4°) and offset fixed at stamping (lib/town/islandStamps.ts StampMark).
 *
 * Heat: strings only; the filter rasterises once when the book page paints (the book is the only place they render).
 * Shapes are designed not to cross; where one must sit over another (a ball in the surf) the scene names a `hole` that is
 * masked out of the background group, so the paper shows round it as in a real stamp.
 */
const SW=2.9,TH=1.9;
type Scene={bg:string;fg?:string;holes?:readonly (readonly [number,number,number])[]};
const p=(d:string,w=SW)=>`<path d="${d}" fill="none" stroke-width="${w}"/>`;
const f=(d:string)=>`<path d="${d}" stroke="none" fill="currentColor"/>`;
const r1=(n:number)=>+n.toFixed(1);
/** A football: the ring, a filled centre pentagon and five seams out to the edge. */
function ball(cx:number,cy:number,r:number,w=2){
 const pt=(a:number,k:number)=>[r1(cx+Math.cos(a)*r*k),r1(cy+Math.sin(a)*r*k)];
 const pent=[0,1,2,3,4].map(i=>pt(-Math.PI/2+i*Math.PI*2/5,.42));
 const seams=[0,1,2,3,4].map(i=>{const a=-Math.PI/2+i*Math.PI*2/5,[x0,y0]=pt(a,.42),[x1,y1]=pt(a,.98);return `M${x0} ${y0}L${x1} ${y1}`;}).join('');
 return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke-width="${w}"/>`+f(`M${pent.map(q=>q.join(' ')).join('L')}Z`)+p(seams,w*.75);
}
/** A row of scallop waves from x0 to x1 at y. */
function waves(y:number,x0:number,x1:number,len=10,amp=3.2,w=TH){let d=`M${x0} ${y}`;for(let x=x0;x+len<=x1+.01;x+=len)d+=`q${len/2} ${-amp} ${len} 0`;return p(d,w);}
/** The Kit Shop boot's side silhouette from its fitted profile (lib/shop/bootProfiles.ts, model `speed`), sole down, toe right. */
function boot(x:number,base:number,len:number,flip=false){
 const P=BOOT_PROFILES.speed!,k=len/1,top=[...P.rim.filter(([s])=>s<.4),...P.hsec.filter(([s])=>s>=.4)];
 const X=(s:number)=>r1(flip?x+len-s*k:x+s*k),Y=(h:number)=>r1(base-h*len/2.7);
 let d=`M${X(0)} ${base}`;for(const [s,h] of top)d+=`L${X(s)} ${Y(h)}`;
 d+=`Q${X(1.02)} ${Y(.1)} ${X(.98)} ${base}Z`;
 const studs=[.08,.2,.56,.72,.88].map(s=>`M${X(s)} ${base}l0 2.2`).join('');
 return p(d,2.2)+p(studs,2.4)+p(`M${X(.22)} ${Y(.62)}L${X(.6)} ${Y(.5)}`,1.4);
}
/** The station stamps' little train glyph (3 o'clock on the ring) and the counter stamps' star. */
const train=(x:number,y:number)=>p(`M${x-8} ${y+3}L${x-8} ${y-3}Q${x-8} ${y-5} ${x-6} ${y-5}L${x+5} ${y-5}Q${x+8} ${y-5} ${x+8} ${y-1}L${x+8} ${y+3}Z`,1.5)+f(`M${x-5.5} ${y-3.4}h3v2.6h-3zM${x-1} ${y-3.4}h3v2.6h-3z`)+`<circle cx="${x-4.5}" cy="${y+4.6}" r="1.5" stroke="none" fill="currentColor"/><circle cx="${x+4.5}" cy="${y+4.6}" r="1.5" stroke="none" fill="currentColor"/>`;
const star=(x:number,y:number,r=6)=>f(`M${[0,1,2,3,4,5,6,7,8,9].map(i=>{const a=-Math.PI/2+i*Math.PI/5,k=i%2?r*.45:r;return `${r1(x+Math.cos(a)*k)} ${r1(y+Math.sin(a)*k)}`;}).join('L')}Z`);

const SCENES:Record<StampId,()=>Scene>={
 // North: the lighthouse, the Kit Shop on the beach, the surf, and the ball riding a wave.
 north:()=>({bg:
  p('M56 112L60.5 64L69.5 64L74 112')+f('M59.4 76L70.6 76L71.4 84L58.6 84ZM57.7 94L72.3 94L73.1 102L56.9 102Z')+p('M57 64L73 64',2.2)+p('M60 64L60 56L70 56L70 64',2)+f('M58.5 56L65 49L71.5 56Z')
  +p('M75 54L86 50M75 58L87 60M55 54L45 50M55 58L44 60',TH)+p('M112 112L112 86L150 86L150 112')+f('M109 82L153 82L153 86L109 86Z')+p('M120 82L120 75L142 75L142 82',TH)
  +`<text x="131" y="80.6" font-size="6" text-anchor="middle" stroke="none" fill="currentColor" font-weight="900">KIT</text>`+p('M127 112L127 98L135 98L135 112',1.8)
  +f('M138 94L141 92.5L143 92.5L146 94L147.5 97L145.5 98L145.5 106L138.5 106L138.5 98L136.5 97Z')+p('M115 92L124 92L124 106L115 106',TH)+p('M118 54q4 -4 8 0q4 -4 8 0M136 46q3 -3 6 0q3 -3 6 0',TH)
  +p('M38 112L162 112')+waves(122,38,162,12)+waves(134,38,162,10)+waves(146,40,160,12)+waves(156,48,152,13),
  fg:ball(100,134,9)+p('M85 127q3 -5 7 -6M115 127q-3 -5 -7 -6',1.4),holes:[[100,134,12.5]]}),
 // West Beach: Drip FC Stadium under a football sun, floodlights, a palm and the sea.
 west:()=>{const ribs=[62,76,90,110,124,138].map(x=>{const t=(x-48)/104,y=102-24*t*(1-t);return `M${x} ${r1(y+2)}L${x} 116`;}).join('');
  const rays=Array.from({length:12},(_,i)=>{const a=i*Math.PI/6;return `M${r1(100+Math.cos(a)*17)} ${r1(60+Math.sin(a)*17)}L${r1(100+Math.cos(a)*22)} ${r1(60+Math.sin(a)*22)}`;}).join('');
  return {bg:ball(100,60,12)+p(rays,1.8)+f('M48 102Q100 90 152 102L152 97.5Q100 85.5 48 97.5Z')+p('M46 116L50 102M154 116L150 102')+p(ribs,TH)
   +p('M54 98L54 80M146 98L146 80',2)+p('M49 74h10v6h-10zM141 74h10v6h-10z',1.6)+f('M51 76h2v2h-2zM55 76h2v2h-2zM143 76h2v2h-2zM147 76h2v2h-2z')
   +`<text x="100" y="112" font-size="7" text-anchor="middle" stroke="none" fill="currentColor" font-weight="900" letter-spacing="1">DRIP FC</text>`
   +p('M38 120Q100 115 162 120')+p('M62 156Q59 140 66 126',2.6)+p('M66 126q-10 -4 -18 2M66 126q-6 -9 -15 -9M66 126q4 -10 14 -10M66 126q10 -2 16 6M66 126q2 6 -2 13',2)
   +waves(134,84,160,11)+waves(146,80,160,12)+waves(157,86,148,12)};},
 // South: the History Museum's columns, the boardwalk on its posts, and the ball bobbing like a buoy.
 south:()=>({bg:p('M64 74L100 57L136 74Z')+`<text x="100" y="71" font-size="5.6" text-anchor="middle" stroke="none" fill="currentColor" font-weight="900" letter-spacing=".6">MUSEUM</text>`
  +f('M64 74h72v4.5h-72z')+p('M72 79L72 99M86 79L86 99M100 79L100 99M114 79L114 99M128 79L128 99',3.2)+p('M60 100L140 100M56 104.5L144 104.5',2)
  +p('M38 112L162 112M38 118L162 118',2)+p(Array.from({length:20},(_,i)=>`M${41+i*6.3} 112L${41+i*6.3} 118`).join(''),1.1)+p(Array.from({length:7},(_,i)=>`M${44+i*18.5} 118L${44+i*18.5} 128`).join(''),2)
  +waves(132,38,162,11)+waves(144,40,160,12)+waves(155,46,154,12)+p('M64 52q3 -3 6 0q3 -3 6 0M132 50q3 -3 6 0q3 -3 6 0',TH),
  fg:ball(136,141,9),holes:[[136,141,12.5]]}),
 // Summit Isle: the mountain under a football sun, the tunnel portal and the Island Line train coming out of it.
 summit:()=>({bg:p('M38 118L70 80L84 90L104 54L122 78L134 70L162 108')+p('M96 66L100 70L104 63L108 70L113 66',TH)
  +p('M110 82l6 6M114 78l8 8M88 86l-5 6M76 92l-6 7M128 82l8 8M140 80l7 7',1.3)+ball(136,50,10)+p('M136 35v-4M147 39l3 -3M151 50h4M125 39l-3 -3',1.8)
  +p('M84 126L84 112A16 16 0 0 1 116 112L116 126')+f('M89 126L89 113A11 11 0 0 1 111 113L111 126Z')+p('M80 112h4M116 112h4M82 104l3 2M118 104l-3 2',1.4)
  +p('M56 126L56 114Q56 109 61 109L86 109L86 126Z',2.2)+f('M60 112h6v5h-6zM69 112h6v5h-6zM78 112h5v5h-5z')+p('M50 120h6',2)
  +`<circle cx="63" cy="128.5" r="2.2" stroke="none" fill="currentColor"/><circle cx="79" cy="128.5" r="2.2" stroke="none" fill="currentColor"/>`
  +p('M38 131L162 131',2.2)+p(Array.from({length:16},(_,i)=>`M${42+i*8} 131L${42+i*8} 135`).join(''),1.4)
  +f('M128 126l6 -14l6 14zM140 126l5 -11l5 11z')+p('M44 144q20 -4 40 0t40 0t36 0M48 154q18 -3 36 0t36 0t32 0',1.4)}),
 // Coral Cay: palms on the islet, the causeway on its arches, a ball floating, and the reef under the water.
 cay:()=>({bg:p('M38 104L162 104',2)+p('M40 104Q62 92 86 104',2)+p('M58 100Q55 84 50 70M66 99Q70 86 76 74',2.4)
  +p('M50 70q-9 -1 -14 6M50 70q-3 -8 -11 -9M50 70q5 -7 13 -5M50 70q8 2 10 10M76 74q-6 -6 -14 -3M76 74q1 -9 9 -11M76 74q8 -2 13 4M76 74q4 6 2 13',1.8)
  +p('M96 90L162 85',2.4)+p('M100 90L100 104M118 88.7L118 104M136 87.3L136 104M154 86L154 104',2.2)+p('M100 98Q109 92 118 97M118 97Q127 91 136 96M136 96Q145 90 154 95',1.6)
  +p('M38 116L48 116M56 116L66 116M74 116L84 116M128 116L138 116M146 116L156 116',1.4)
  +p('M58 162L58 140M58 148L50 139M58 144L66 133M50 139L46 134M66 133L70 128M86 162L86 146M86 152L80 145M86 150L93 141',2)
  +p('M120 162Q124 148 132 146Q140 148 144 162',1.8)+p('M104 138q6 -5 12 0q-6 5 -12 0M104 138l-5 -3l0 6z',1.6)+p('M132 128q5 -4 10 0q-5 4 -10 0M142 128l4 -2.5l0 5z',1.5)
  +'<circle cx="96" cy="128" r="1.6" fill="none" stroke-width="1.2"/><circle cx="99" cy="122" r="1.2" fill="none" stroke-width="1.1"/>',
  fg:ball(112,107,7.5,1.8),holes:[[112,107,10.5]]}),
 // Konbini: the shop front with its awning, onigiri and drinks on the shelves, the door, and a ball on the pavement.
 konbini:()=>{let aw='M50 81L150 81L150 87';for(let x=150;x>50;x-=10)aw+=`q-5 5 -10 0`;aw+='Z';
  return {bg:f('M46 64h108v6h-108z')+p('M50 124L50 70L150 70L150 124')+`<text x="100" y="78.6" font-size="7.4" text-anchor="middle" stroke="none" fill="currentColor" font-weight="900" letter-spacing="1.4">KONBINI</text>`
   +f(aw)+p('M56 94h52v28h-52z',1.8)+p('M56 103.5h52M56 113h52',1.3)+f('M60 102l4 -6l4 6zM70 102l4 -6l4 6zM80 102l4 -6l4 6z')
   +p('M60 100.6h8M70 100.6h8M80 100.6h8',1.2)+f('M93 102h4v-6h-4zM100 102h4v-6h-4z')
   +f('M60 112h3v-6.5h-3zM66 112h3v-6.5h-3zM72 112h3v-6.5h-3zM78 112h3v-6.5h-3zM84 112h3v-6.5h-3zM90 112h3v-6.5h-3zM96 112h3v-6.5h-3zM102 112h3v-6.5h-3z')
   +p('M116 124L116 93L142 93L142 124M129 93L129 124',1.8)+p('M126 108v4M132 108v4',1.6)+p('M38 124L162 124',2.2)+p('M38 146L162 146',1.6)+p('M48 135h10M146 135h10',1.2),
   fg:ball(100,136,9)};},
 // History Museum: an old laced leather ball and a trophy, in front of the gallery's arched window.
 museum:()=>({bg:p('M70 140L70 82A30 30 0 0 1 130 82L130 140',1.5)+p('M100 52L100 140M70 96L130 96',1.1)+p('M52 140L148 140',2.2)+p('M56 146L144 146',1.4),
  fg:`<circle cx="84" cy="114" r="23" fill="none" stroke-width="2.4"/>`+p('M63 106Q84 98 105 106M63 122Q84 130 105 122M77 92Q72 114 77 136M91 92Q96 114 91 136',1.6)
   +p('M84 95L84 109M80.5 97.5h7M80.5 101h7M80.5 104.5h7M80.5 108h7',1.4)
   +f('M116 82L142 82Q142 104 129 109Q116 104 116 82Z')+p('M116 86Q107 86 109 95Q111 101 118 101M142 86Q151 86 149 95Q147 101 140 101',2)
   +p('M129 109L129 120',2.6)+f('M121 120h16v4h-16zM118 124h22v5h-22z')+p('M118 133h22',1.4),holes:[[84,114,26],[129,104,22]]}),
 // Kit Shop: kit on the rail, a wall of boots (the shop's own boot silhouette) and a ball on the shelf.
 shop:()=>{const shirt=(x:number)=>f(`M${x-8} 60L${x-3} 57L${x+3} 57L${x+8} 60L${x+10} 65L${x+6.5} 66.5L${x+6.5} 75L${x-6.5} 75L${x-6.5} 66.5L${x-10} 65Z`)+p(`M${x} 57L${x} 53q0 -3 3 -3`,1.2);
  return {bg:p('M56 50L144 50',1.8)+shirt(76)+shirt(100)+shirt(124)+p('M46 80L154 80M44 106L156 106M46 132L154 132',2)
   +boot(52,104,42)+boot(106,104,42,true)+boot(50,130,38)+boot(112,130,38,true)
   +`<text x="100" y="146.5" font-size="6.6" text-anchor="middle" stroke="none" fill="currentColor" font-weight="900" letter-spacing="1">BOOTS</text>`,fg:ball(100,121,9)};},
};

/** The standalone SVG for one stamp. `uid` keeps the filter / path ids unique when several stamps share a page. */
export function stampSvg(id:StampId,uid:string=id):string{
 const def=stampById(id)!,index=STAMPS.indexOf(def),sc=SCENES[id](),station=def.where==='station',u=`st-${uid}`;
 const top=def.name.toUpperCase(),bottom=station?`ISLAND LINE · No.${index+1}`:'FUTBOL ISLAND';
 const holes=sc.holes?.length?`<mask id="${u}-m" maskUnits="userSpaceOnUse" x="0" y="0" width="200" height="200"><rect width="200" height="200" fill="#fff"/>${sc.holes.map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#000"/>`).join('')}</mask>`:'';
 const fs=top.length>12?13:15;
 const ring=`<circle cx="100" cy="100" r="93" fill="none" stroke-width="5"/><circle cx="100" cy="100" r="86" fill="none" stroke-width="1.6"/><circle cx="100" cy="100" r="64" fill="none" stroke-width="2.6"/>`
  +`<text font-size="${fs}" font-weight="900" letter-spacing="1.5" stroke="none" fill="currentColor"><textPath href="#${u}-t" startOffset="50%" text-anchor="middle">${top}</textPath></text>`
  +`<text font-size="10.5" font-weight="900" letter-spacing="1.4" stroke="none" fill="currentColor"><textPath href="#${u}-b" startOffset="50%" text-anchor="middle">${bottom}</textPath></text>`
  +(station?train(176,99):star(176,100))+ball(24,100,6.5,1.5);
 const scene=`<g clip-path="url(#${u}-c)"><g${holes?` mask="url(#${u}-m)"`:''}>${sc.bg}</g>${sc.fg??''}</g>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="${def.name} stamp" style="color:${def.ink}">`
  +`<defs><path id="${u}-t" d="M30 100A70 70 0 0 1 170 100"/><path id="${u}-b" d="M20 100A80 80 0 0 0 180 100"/><clipPath id="${u}-c"><circle cx="100" cy="100" r="62.6"/></clipPath>${holes}`
  +`<filter id="${u}-f" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">`
  +`<feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="${index*7+3}" result="n"/>`
  +`<feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -4 0 0 0 3.25" result="speck"/>`
  +`<feTurbulence type="fractalNoise" baseFrequency=".013" numOctaves="1" seed="${index*5+11}" result="p"/>`
  +`<feColorMatrix in="p" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1.1 0 0 0 .42" result="press"/>`
  +`<feComposite in="speck" in2="press" operator="arithmetic" k1="1" result="mask"/>`
  +`<feComposite in="SourceGraphic" in2="mask" operator="in" result="ink"/>`
  +`<feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="${index+2}" result="w"/>`
  +`<feDisplacementMap in="ink" in2="w" scale="2.4" xChannelSelector="R" yChannelSelector="G"/></filter></defs>`
  +`<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" font-family="IslandBrush,'Arial Black',Impact,sans-serif" filter="url(#${u}-f)">`
  +`<g opacity=".13" transform="translate(1.6 1.1)">${ring}${scene.replace(/id="[^"]*"/g,'')}</g>${ring}${scene}</g></svg>`;
}
