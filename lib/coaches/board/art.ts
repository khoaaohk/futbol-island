import {pitchMarkings,type PitchSpec} from './pitch';
import {svgMatrix,type View} from './view';
import type {Chip} from './types';

/**
 * The magnetic board's pitch and counters as SVG markup strings: the live board injects the pitch once per format/size
 * (it never repaints while chips move), and the PNG export reuses the same markup for the whole picture.
 */
export const GREEN={run:'#2d6f39',a:'#3a8a45',b:'#358240',court:'#378743',line:'#f5f8f0'};
export function lineWidthPx(view:View){return Math.max(1.4,Math.min(2.6,view.s*.24));}
export function pitchMarkup(spec:PitchSpec,view:View,idp='cb'):string{
 const L=spec.length,W=spec.width,r=spec.runoff,lw=lineWidthPx(view)/view.s,{d,spots,goals}=pitchMarkings(spec);
 const n=spec.format==='futsal'?0:spec.format==='11v11'?14:spec.format==='9v9'?10:8;
 let stripes='';for(let k=0;k<n;k++)stripes+=`<rect x="${(k*L/n).toFixed(3)}" y="0" width="${(L/n+.01).toFixed(3)}" height="${W}" fill="${k%2?GREEN.b:GREEN.a}"/>`;
 const net=`<pattern id="${idp}-net" patternUnits="userSpaceOnUse" width=".45" height=".45"><path d="M0 0L.45 .45M.45 0L0 .45" stroke="#ffffff" stroke-opacity=".55" stroke-width="${(lw*.35).toFixed(4)}"/></pattern>`;
 const shade=`<radialGradient id="${idp}-vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></radialGradient>`;
 return `<defs>${net}${shade}</defs><g transform="${svgMatrix(view)}">`+
  `<rect x="${-r-spec.goalDepth-2}" y="${-r-2}" width="${L+2*r+2*spec.goalDepth+4}" height="${W+2*r+4}" fill="${GREEN.run}"/>`+
  `<rect x="0" y="0" width="${L}" height="${W}" fill="${GREEN.court}"/>${stripes}`+
  goals.map(g=>`<rect x="${g.x.toFixed(3)}" y="${g.y.toFixed(3)}" width="${g.w}" height="${g.h.toFixed(3)}" fill="url(#${idp}-net)" stroke="${GREEN.line}" stroke-width="${(lw*.8).toFixed(4)}"/>`).join('')+
  `<path d="${d}" fill="none" stroke="${GREEN.line}" stroke-width="${lw.toFixed(4)}" stroke-linecap="round" stroke-linejoin="round"/>`+
  spots.map(([x,y])=>`<circle cx="${x.toFixed(3)}" cy="${y.toFixed(3)}" r="${(lw*1.5).toFixed(4)}" fill="${GREEN.line}"/>`).join('')+
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
