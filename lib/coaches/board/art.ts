import {pitchMarkings,type PitchSpec} from './pitch';
import {svgMatrix,type View} from './view';
import type {Chip} from './types';

/**
 * The magnetic board's pitch and counters as SVG markup strings: the live board injects the pitch once per format/size
 * (it never repaints while chips move), and the PNG export reuses the same markup for the whole picture.
 */
/** The island's own pitch colours (Nov 23 2026, owner: "use the same green colours as the game fields"): every game ground's
 *  surface '#7ba476' (lib/town/venues.ts) in its mown light/dark bands (×1.06 / ×0.94 in linear light, lib/graphics/pitchStripes.ts
 *  STRIPE_LIGHT/DARK), the plain light shade on the run-off, and the island lawn '#608870' (lib/town/shoreline.ts) beyond it. */
export const GREEN={lawn:'#608870',surface:'#7ba476',a:'#7ea879',b:'#789f73',line:'#f5f8f0'};
/** Futsal (Nov 23 2026, owner: "use the game's grey for the futsal court"): the Palm Coast Rooftop court's hard surface '#737c75'
 *  (lib/town/venues.ts), which the game lays 3 m past the lines on every side, with the game's cream lines '#f5eed5', its goal frame
 *  '#fff6df' and its net '#c6d4cc' (lib/town/fields.ts). The grass formats keep GREEN. */
export const COURT={surface:'#737c75',line:'#f5eed5',frame:'#fff6df',net:'#c6d4cc'};
/** A hex colour times a linear-light factor (the same sum three.js does for the game's stripes, without loading three here). */
export function shadeLinear(hex:string,f:number){const c=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 return '#'+c.map(v=>{v=Math.min(1,v*f);const s=v<=.0031308?v*12.92:1.055*v**(1/2.4)-.055;return Math.round(Math.min(1,Math.max(0,s))*255).toString(16).padStart(2,'0');}).join('');}
/** The game's mowing plan (lib/graphics/pitchStripes.ts stripePlan, kept in step): an even number of bands 4.5–6.5 m long, the one
 *  that best lands the penalty-area edge on a band edge; Eleven Park also gets the fainter cross-mown lanes (about 5.5 m). */
export function boardStripes(length:number,boxDepth:number|undefined,lanesWidth?:number){
 let best=0,score=Infinity;for(let n=2;n<=64;n+=2){const band=length/n;if(band<4.5||band>6.5)continue;
  const off=boxDepth?Math.abs(boxDepth/band-Math.round(boxDepth/band))*band:0,sc=off*4+Math.abs(band-5);if(sc<score){score=sc;best=n;}}
 if(!best)best=Math.max(2,2*Math.round(length/10));
 return {bands:best,lanes:lanesWidth?Math.max(2,2*Math.round(lanesWidth/5.5/2)):0};
}
export function lineWidthPx(view:View){return Math.max(1.4,Math.min(2.6,view.s*.24));}
export function pitchMarkup(spec:PitchSpec,view:View,idp='cb'):string{
 const L=spec.length,W=spec.width,r=spec.runoff,lw=lineWidthPx(view)/view.s,{d,spots,goals}=pitchMarkings(spec);
 // Futsal has no mown bands (the game's futsal court has none either); the grass grounds are mown like the island's.
 const court=spec.format==='futsal',plan=court?null:boardStripes(L,spec.box?.depth,spec.format==='11v11'?W:undefined);
 const line=court?COURT.line:GREEN.line,frame=court?COURT.frame:GREEN.line,surf=court?COURT.surface:GREEN.surface,mesh=court?COURT.net:'#ffffff';
 let stripes='';
 if(plan){const bl=L/plan.bands,ln=plan.lanes?W/plan.lanes:W;
  for(let k=0;k<plan.bands;k++)for(let j=0;j<(plan.lanes||1);j++){const f=(k%2?.94:1.06)*(plan.lanes?(j%2?.98:1.02):1);
   stripes+=`<rect x="${(k*bl).toFixed(3)}" y="${(j*ln).toFixed(3)}" width="${(bl+.01).toFixed(3)}" height="${(ln+.01).toFixed(3)}" fill="${shadeLinear(GREEN.surface,f)}"/>`;}}
 const net=`<pattern id="${idp}-net" patternUnits="userSpaceOnUse" width=".5" height=".5"><path d="M0 0L.5 .5M.5 0L0 .5" stroke="${mesh}" stroke-opacity=".7" stroke-width="${(lw*.4).toFixed(4)}"/></pattern>`;
 const shade=`<radialGradient id="${idp}-vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient>`;
 // Goals (Nov 23 2026, owner: "the goals look small"): a darker net box behind the goal line with its mesh, a white frame, and the
 // two posts as solid round heads on the goal line, so the mouth reads at a glance on a phone at both ends.
 const goalSvg=goals.map(g=>{const home=g.x<0,mx=home?0:L,bx=home?g.x:g.x+g.w,pw=lw*1.7;
  return `<rect x="${g.x.toFixed(3)}" y="${g.y.toFixed(3)}" width="${g.w}" height="${g.h.toFixed(3)}" fill="#1f3a2c" fill-opacity=".45"/>`+
   `<rect x="${g.x.toFixed(3)}" y="${g.y.toFixed(3)}" width="${g.w}" height="${g.h.toFixed(3)}" fill="url(#${idp}-net)"/>`+
   `<path d="M${mx} ${g.y.toFixed(3)}H${bx.toFixed(3)}V${(g.y+g.h).toFixed(3)}H${mx}" fill="none" stroke="${frame}" stroke-width="${(lw*.9).toFixed(4)}" stroke-linejoin="round"/>`+
   `<path d="M${mx} ${g.y.toFixed(3)}V${(g.y+g.h).toFixed(3)}" stroke="${frame}" stroke-width="${(lw*1.5).toFixed(4)}"/>`+
   [g.y,g.y+g.h].map(y=>`<circle cx="${mx}" cy="${y.toFixed(3)}" r="${pw.toFixed(4)}" fill="${court?COURT.frame:'#ffffff'}" stroke="#22283a" stroke-opacity=".35" stroke-width="${(lw*.3).toFixed(4)}"/>`).join('');}).join('');
 return `<defs>${net}${shade}</defs><g transform="${svgMatrix(view)}">`+
  `<rect x="${-r-spec.goalDepth-2}" y="${-r-2}" width="${L+2*r+2*spec.goalDepth+4}" height="${W+2*r+4}" fill="${GREEN.lawn}"/>`+
  `<rect x="${-r}" y="${-r}" width="${L+2*r}" height="${W+2*r}" fill="${plan?GREEN.a:surf}"/>`+
  `<rect x="0" y="0" width="${L}" height="${W}" fill="${surf}"/>${stripes}`+
  `<path d="${d}" fill="none" stroke="${line}" stroke-width="${lw.toFixed(4)}" stroke-linecap="round" stroke-linejoin="round"/>`+
  goalSvg+
  spots.map(([x,y])=>`<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${(lw*1.5).toFixed(4)}" fill="${line}"/>`).join('')+
  `</g><rect width="${view.w}" height="${view.h}" fill="url(#${idp}-vig)"/>`;
}
export type ChipLook={face:string;light:string;edge:string;ink:string};
export const CHIP_LOOK:Record<'home'|'away'|'homeGk'|'awayGk',ChipLook>={
 home:{face:'#d7353b',light:'#f0676a',edge:'#86191f',ink:'#ffffff'},
 away:{face:'#2458c9',light:'#5c8ae8',edge:'#132f72',ink:'#ffffff'},
 homeGk:{face:'#f2c531',light:'#fbe17e',edge:'#94740f',ink:'#2a2205'},
 awayGk:{face:'#2c2e35',light:'#565a66',edge:'#0b0c0f',ink:'#f4f4f4'},
};
export const lookOf=(c:Pick<Chip,'team'|'gk'>):ChipLook|null=>c.team==='ball'?null:CHIP_LOOK[c.team==='home'?(c.gk?'homeGk':'home'):(c.gk?'awayGk':'away')];
/** A classic ball (white with black patches) in a 20×20 box. */
export const BALL_SVG='<circle cx="10" cy="10" r="9.3" fill="#fbfbf7" stroke="#22252b" stroke-width="1"/><path d="M10 6.2l3.4 2.5-1.3 4H7.9l-1.3-4z" fill="#22252b"/><path d="M10 .9v5.3M13.4 8.7l4.9-1.7M12.1 12.7l3 4.2M7.9 12.7l-3 4.2M6.6 8.7L1.7 7" stroke="#22252b" stroke-width=".9"/><path d="M4.5 2.9l1.8 2.2M15.5 2.9l-1.8 2.2M18.9 12.6l-2.6.6M1.1 12.6l2.6.6M10 19.1v-2.4" stroke="#22252b" stroke-width="1.6" stroke-linecap="round"/>';
const esc=(s:string)=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]!));
/** One counter for the PNG export (the live board draws the same look with CSS). */
export function chipMarkup(c:Chip,x:number,y:number,r:number,id:string):string{
 if(c.team==='ball')return `<g transform="translate(${(x-r).toFixed(1)} ${(y-r).toFixed(1)}) scale(${(r/10).toFixed(4)})"><circle cx="10.6" cy="11.4" r="9.4" fill="#000" fill-opacity=".3"/>${BALL_SVG}</g>`;
 const k=lookOf(c)!;
 return `<defs><radialGradient id="${id}" cx=".36" cy=".3" r=".8"><stop offset="0" stop-color="${k.light}"/><stop offset=".55" stop-color="${k.face}"/><stop offset="1" stop-color="${k.edge}"/></radialGradient></defs>`+
  `<circle cx="${x.toFixed(1)}" cy="${(y+r*.16).toFixed(1)}" r="${(r*1.04).toFixed(1)}" fill="#000" fill-opacity=".32"/>`+
  `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#${id})" stroke="${k.edge}" stroke-width="1"/>`+
  `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(r*.74).toFixed(1)}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="1"/>`+
  `<text x="${x.toFixed(1)}" y="${(y+r*.36).toFixed(1)}" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="${(r*(c.label.length>2?.78:1.02)).toFixed(1)}" fill="${k.ink}">${esc(c.label)}</text>`;
}
export {esc as escapeXml};
