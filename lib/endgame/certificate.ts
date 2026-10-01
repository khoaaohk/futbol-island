import {GRAD_TITLES,GRADUATION_FORMATS,capRewardFor,type GradFormat,type GraduationRecord} from './graduationModel';

/**
 * Certificates (Lane 2, Sep 30 2026). A certificate is described by a pure spec (tests check it) and drawn on demand to one
 * canvas only when the child taps Save/Share/Print: no canvas exists while it is just being looked at (the on-screen card is
 * DOM/SVG). No personal data: no name, age, photo or location, only the format, the ideas learned and the date.
 *
 * Ids: `grad:<format>` for a path graduation, `diploma` for the Island Diploma (all four paths + the Matchday final).
 */
export type CertificateId=`grad:${GradFormat}`|'diploma';
export type CertificateSpec={id:CertificateId;kicker:string;title:string;subtitle:string;lines:string[];date:string;ink:string;paper:string;accent:string};
export const certificateIds=(record:GraduationRecord):CertificateId[]=>[...GRADUATION_FORMATS.filter(f=>record.formats[f]).map(f=>`grad:${f}` as CertificateId),...(record.finale?['diploma' as const]:[])];
export const isCertificateId=(v:unknown):v is CertificateId=>typeof v==='string'&&(v==='diploma'||GRADUATION_FORMATS.some(f=>v===`grad:${f}`));
const dateText=(at:number)=>{try{return new Date(at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});}catch{return '';}};
/** `lessons(format)` gives the 12 starter lesson names (graduationSync.starterLessons; injected so tests stay light). */
export function certificateSpec(id:CertificateId,record:GraduationRecord,lessons:(format:GradFormat)=>string[]):CertificateSpec|null{
 if(id==='diploma'){
  const f=record.finale;if(!f)return null;
  return {id,kicker:'FUTBOL ISLAND · ISLAND DIPLOMA',title:'Matchday Champion',subtitle:'Graduated futsal, 7v7, 9v9 and 11v11, and won the Matchday Ferry final.',
   lines:[...GRADUATION_FORMATS.map(g=>`${GRAD_TITLES[g]}: ${lessons(g).length} ideas learned`),`Coach’s exam: ${f.firstTry} of ${f.total} right first time`],date:dateText(f.at),ink:'#22366b',paper:'#fff1d3',accent:'#f2bb45'};
 }
 const format=id.slice(5) as GradFormat,entry=record.formats[format];if(!entry)return null;const cap=capRewardFor(format);
 return {id,kicker:'FUTBOL ISLAND · GRADUATE CERTIFICATE',title:`${GRAD_TITLES[format]} Graduate`,subtitle:`Finished all ${lessons(format).length} starter lessons of the ${GRAD_TITLES[format]} path.`,
  lines:lessons(format),date:dateText(entry.at),ink:cap.color,paper:'#fff1d3',accent:cap.color2};
}
export const certificateFileName=(spec:CertificateSpec)=>`futbol-island-${spec.id.replace(':','-')}.png`;

/** Draws the certificate to a fresh canvas (A4-ish landscape, print friendly) and returns a PNG blob. Browser only. */
export async function certificatePng(spec:CertificateSpec):Promise<Blob|null>{
 if(typeof document==='undefined')return null;
 const W=1600,H=1130,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');if(!g)return null;
 try{await document.fonts?.ready;}catch{/* system fonts are fine */}
 const brush='IslandBrush, "Arial Rounded MT Bold", sans-serif',body='system-ui, -apple-system, "Segoe UI", sans-serif';
 g.fillStyle=spec.paper;g.fillRect(0,0,W,H);
 // Riso print: a halftone band and an out-of-register frame in two inks.
 g.fillStyle=spec.accent+'55';for(let y=40;y<H;y+=18)for(let x=(y/18)%2?9:0;x<W;x+=18){g.beginPath();g.arc(x,y,3.2,0,Math.PI*2);g.fill();}
 g.fillStyle=spec.paper;g.fillRect(70,70,W-140,H-140);
 g.lineWidth=10;g.strokeStyle='#ff48b0aa';g.strokeRect(62,66,W-124,H-124);g.strokeStyle=spec.ink;g.strokeRect(56,58,W-124,H-124);
 g.fillStyle=spec.ink;g.textAlign='center';
 g.font=`800 30px ${body}`;g.fillText(spec.kicker,W/2,170);
 g.font=`96px ${brush}`;g.fillText(spec.title,W/2,290);
 g.font=`500 32px ${body}`;g.fillStyle='#294f43';wrap(g,spec.subtitle,W/2,356,W-360,42);
 // Ideas learned: two columns of ticks.
 g.textAlign='left';g.font=`600 26px ${body}`;const cols=spec.lines.length>6?2:1,per=Math.ceil(spec.lines.length/cols),colW=(W-360)/cols;
 spec.lines.forEach((line,i)=>{const col=Math.floor(i/per),row=i%per,x=180+col*colW,y=470+row*62;
  g.fillStyle=spec.ink;g.beginPath();g.arc(x+14,y-9,16,0,Math.PI*2);g.fill();g.strokeStyle=spec.paper;g.lineWidth=5;g.beginPath();g.moveTo(x+6,y-9);g.lineTo(x+12,y-2);g.lineTo(x+23,y-17);g.stroke();
  g.fillStyle='#244d40';g.fillText(fit(g,line,colW-70),x+44,y);});
 g.textAlign='center';g.fillStyle='#294f43';g.font=`600 26px ${body}`;g.fillText(spec.date,W/2,H-150);
 g.font=`600 22px ${body}`;g.fillStyle='#69715d';g.fillText('futbolisland.app · Play. Learn. Grow.',W/2,H-108);
 return new Promise(resolve=>c.toBlob(blob=>{c.width=c.height=0;resolve(blob);},'image/png'));
}
function wrap(g:CanvasRenderingContext2D,text:string,x:number,y:number,max:number,lh:number){let line='',yy=y;for(const word of text.split(' ')){const t=line?line+' '+word:word;if(g.measureText(t).width>max&&line){g.fillText(line,x,yy);line=word;yy+=lh;}else line=t;}if(line)g.fillText(line,x,yy);}
function fit(g:CanvasRenderingContext2D,text:string,max:number){if(g.measureText(text).width<=max)return text;let t=text;while(t.length>4&&g.measureText(t+'…').width>max)t=t.slice(0,-1);return t+'…';}

/** Save / share / print. Share uses the system share sheet (a parent's phone, AirDrop, Messages) when it can take a file. */
export async function saveCertificate(spec:CertificateSpec,mode:'save'|'share'|'print'):Promise<'saved'|'shared'|'printed'|'cancelled'|'failed'>{
 const blob=await certificatePng(spec);if(!blob)return 'failed';
 const name=certificateFileName(spec);
 if(mode==='share'){
  try{const file=new File([blob],name,{type:'image/png'});const nav=navigator as Navigator&{canShare?:(d:unknown)=>boolean};
   if(nav.share&&nav.canShare?.({files:[file]})){await nav.share({files:[file],title:spec.title,text:`${spec.title} · Futbol Island`});return 'shared';}}
  catch(e){if((e as Error)?.name==='AbortError')return 'cancelled';}
 }
 const url=URL.createObjectURL(blob);
 if(mode==='print'){
  const frame=document.createElement('iframe');frame.style.cssText='position:fixed;width:0;height:0;border:0;right:0;bottom:0';document.body.append(frame);
  const doc=frame.contentDocument;if(!doc){frame.remove();URL.revokeObjectURL(url);return 'failed';}
  doc.open();doc.write(`<!doctype html><title>${spec.title}</title><style>@page{size:landscape;margin:10mm}html,body{margin:0}img{width:100%;height:auto}</style><img src="${url}" alt="">`);doc.close();
  const img=doc.querySelector('img');await new Promise<void>(r=>{if(!img||img.complete)r();else{img.onload=()=>r();img.onerror=()=>r();}});
  try{frame.contentWindow?.focus();frame.contentWindow?.print();}catch{/* print blocked */}
  setTimeout(()=>{frame.remove();URL.revokeObjectURL(url);},60000);return 'printed';
 }
 const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);return 'saved';
}
