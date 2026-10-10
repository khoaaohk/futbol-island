import {chipMarkup,escapeXml,pitchMarkup} from '@/lib/coaches/board/art';
import {toM} from '@/lib/coaches/board/play';
import {smoothPath,type P} from '@/lib/coaches/board/render';
import {toScreen} from '@/lib/coaches/board/view';
import {FORMAT_LABEL} from '@/lib/coaches/board/pitch';
import {INKS} from '@/lib/coaches/board/types';
import {arrowScreen,type Scene} from './stage';

/**
 * "Save picture": the current step as a PNG, drawn from the same markup as the live board (pitch, marker ink, arrows,
 * counters) plus a caption with the play's name, the step and the coaching point. Built only when asked for.
 */
export function boardSvg(scene:Scene,opts:{title:string;caption:string}):{svg:string;w:number;h:number}{
 const {view,play,step:si,spec}=scene,step=play.steps[si],pad=18,capH=opts.caption?64:44,W=view.w+pad*2,H=view.h+pad*2+capH;
 const sp=(v:[number,number])=>toScreen(view,toM(spec,v)) as P;
 let ink='';
 for(const k of step.ink){const pts=k.pts.map(sp),c=INKS[k.ink]??INKS[0];
  ink+=k.kind==='zone'?`<path d="${smoothPath(pts,true)}" fill="${c}" fill-opacity=".22" stroke="${c}" stroke-width="2" stroke-dasharray="7 6" stroke-linecap="round"/>`
   :`<path d="${smoothPath(pts)}" fill="none" stroke="${c}" stroke-width="${Math.max(2.4,scene.r*.24).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`;}
 for(const a of step.arrows){const s=step.pos,start='c' in a.a?s[a.a.c]:a.a.p,end='c' in a.b?s[a.b.c]:a.b.p;if(!start||!end)continue;
  const d=arrowScreen(a,toM(spec,start),toM(spec,end),scene);if(!d)continue;const c=INKS[a.ink]??INKS[0];
  ink+=`<g fill="none" stroke="${c}" stroke-linecap="round" stroke-linejoin="round"><path d="${d.body}" stroke-width="${d.w.toFixed(1)}"${d.dash?` stroke-dasharray="${d.dash}"`:''}/><path d="${d.head}" stroke-width="${d.w.toFixed(1)}"/></g>`;}
 let chips='';const order=[...play.chips].sort((a,b)=>(a.team==='ball'?1:0)-(b.team==='ball'?1:0));
 order.forEach((c,i)=>{const at=step.pos[c.id];if(!at)return;const [x,y]=sp(at);chips+=chipMarkup(c,x,y,c.team==='ball'?scene.ballR:scene.r,`cbx${i}`);});
 const steps=play.steps.length>1?` · Step ${si+1} of ${play.steps.length}`:'';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`+
  `<defs><linearGradient id="cbframe" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3f5f6"/><stop offset=".45" stop-color="#c7cdd2"/><stop offset=".55" stop-color="#e9ecee"/><stop offset="1" stop-color="#a9b1b8"/></linearGradient></defs>`+
  `<rect width="${W}" height="${H}" rx="16" fill="url(#cbframe)"/>`+
  `<svg x="${pad}" y="${pad}" width="${view.w}" height="${view.h}" viewBox="0 0 ${view.w} ${view.h}">${pitchMarkup(spec,view,'cbx')}${ink}${chips}</svg>`+
  `<text x="${pad}" y="${view.h+pad*2+20}" font-family="Arial,Helvetica,sans-serif" font-size="17" font-weight="800" fill="#1d2b26">${escapeXml(opts.title)}<tspan font-weight="400" fill="#44534d"> · ${FORMAT_LABEL[spec.format]}${steps}</tspan></text>`+
  (opts.caption?`<text x="${pad}" y="${view.h+pad*2+44}" font-family="Arial,Helvetica,sans-serif" font-size="13" fill="#33423c">${escapeXml(opts.caption.slice(0,110))}${opts.caption.length>110?'…':''}</text>`:'')+
  `<text x="${W-pad}" y="${view.h+pad*2+20}" text-anchor="end" font-family="Arial,Helvetica,sans-serif" font-size="12" fill="#5d6b65">Futbol Island · Coaches Board</text></svg>`;
 return {svg,w:W,h:H};
}
export async function boardPng(scene:Scene,opts:{title:string;caption:string},scale=2):Promise<Blob>{
 const {svg,w,h}=boardSvg(scene,opts);
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
 try{
  const img=new Image();img.decoding='async';img.src=url;await img.decode();
  const canvas=document.createElement('canvas');canvas.width=Math.round(w*scale);canvas.height=Math.round(h*scale);
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('no 2d');ctx.scale(scale,scale);ctx.drawImage(img,0,0,w,h);
  const blob=await new Promise<Blob|null>(r=>canvas.toBlob(r,'image/png'));canvas.width=canvas.height=0;
  if(!blob)throw new Error('no png');return blob;
 }finally{URL.revokeObjectURL(url);}
}
