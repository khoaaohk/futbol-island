/**
 * The trophy card as a picture (Nov 14 2026, docs/fishing.md "Bite cue, water and trophy moments"): a Rare / Legendary catch can be
 * saved as a PNG drawn on the client in the arcade's comic-print house style (components/games/comic: ink #231a2e, paper #fff3d6,
 * sun, red and teal, hard offset shadows, one Ben-Day dot screen, Arial Black italic lettering). The fish is the card's own
 * FishArt drawing (its SVG serialised into the canvas). No personal data on the picture: the fish, its size, the spot and the day.
 * Save / share follows lib/endgame/certificate.ts: the system share sheet when it can take a file (a phone's "Save image"),
 * otherwise a download.
 */
export type TrophySpec={fishName:string;legendary:boolean;sizeCm:number;sizeText:string;spot:string;date:string};
export const INK='#231a2e',PAPER='#fff3d6',SUN='#ffc83a',RED='#f0452e',TEAL='#19b5a5',ORANGE='#ff8a3c';
/** File name: futbol-island-trophy-<fish>-<size>cm.png (letters, digits and dashes only). */
export const trophyFileName=(s:TrophySpec)=>`futbol-island-trophy-${s.fishName.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}-${Math.round(s.sizeCm)}cm.png`;
/** The burst's word (comic lettering). */
export const trophyWord=(legendary:boolean)=>legendary?'Legend!':'Rare catch!';

/** A star-burst polygon round (cx, cy): `n` points between radii r0 and r1 (the comic kit's ComicBurst shape). */
export function burstPoints(cx:number,cy:number,rx:number,ry:number,n=14,inner=.72):[number,number][]{
 const out:[number,number][]=[];for(let i=0;i<n*2;i++){const a=i/(n*2)*Math.PI*2-Math.PI/2,k=i%2?inner:1;out.push([cx+Math.cos(a)*rx*k,cy+Math.sin(a)*ry*k]);}return out;}

function svgImage(svg:SVGSVGElement|null):Promise<HTMLImageElement|null>{
 if(!svg)return Promise.resolve(null);
 const copy=svg.cloneNode(true) as SVGSVGElement;copy.setAttribute('xmlns','http://www.w3.org/2000/svg');copy.setAttribute('width','920');copy.setAttribute('height','560');
 const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml'}));
 return new Promise(resolve=>{const img=new Image();img.onload=()=>{resolve(img);setTimeout(()=>URL.revokeObjectURL(url),1000);};img.onerror=()=>{URL.revokeObjectURL(url);resolve(null);};img.src=url;});
}

/** Draws the trophy card (1080 × 1350, a phone's 4:5 picture) and returns a PNG blob. Browser only. */
export async function trophyPng(spec:TrophySpec,art:SVGSVGElement|null):Promise<Blob|null>{
 if(typeof document==='undefined')return null;
 const W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');if(!g)return null;
 try{await document.fonts?.ready;}catch{/* system fonts are fine */}
 const title='italic 900 {px}px "Arial Black", Impact, system-ui, sans-serif',ui='800 {px}px system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
 const font=(f:string,px:number)=>f.replace('{px}',String(px));
 const accent=spec.legendary?SUN:TEAL;
 // The page: a dot screen on the sun field, then the inked card with its hard shadow.
 g.fillStyle=spec.legendary?ORANGE:SUN;g.fillRect(0,0,W,H);g.fillStyle=INK+'40';for(let y=8;y<H;y+=24)for(let x=(y/24)%2?20:8;x<W;x+=24){g.beginPath();g.arc(x,y,4,0,Math.PI*2);g.fill();}
 const X0=70,Y0=70,CW=W-140-14,CH=H-140-14;g.fillStyle=INK;g.fillRect(X0+18,Y0+18,CW,CH);g.fillStyle=PAPER;g.fillRect(X0,Y0,CW,CH);g.lineWidth=10;g.strokeStyle=INK;g.strokeRect(X0,Y0,CW,CH);
 // The art panel: accent field with a dot screen, the fish drawn large.
 const PX=X0+44,PY=Y0+230,PW=CW-88,PH=560;g.fillStyle=accent;g.fillRect(PX,PY,PW,PH);g.fillStyle=PAPER+'66';for(let y=PY+10;y<PY+PH;y+=20)for(let x=PX+((y-PY)/20%2?18:8);x<PX+PW;x+=20){g.beginPath();g.arc(x,y,3.2,0,Math.PI*2);g.fill();}
 const img=await svgImage(art);if(img){const iw=PW-80,ih=iw*56/92;g.drawImage(img,PX+40,PY+(PH-ih)/2,iw,ih);}
 g.lineWidth=8;g.strokeRect(PX,PY,PW,PH);
 // The burst with its word, tilted, over the top of the panel.
 g.save();g.translate(W/2,Y0+130);g.rotate(-.05);const pts=burstPoints(0,0,360,110,16,.78);
 const poly=(dx:number,dy:number)=>{g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x+dx,y+dy):g.moveTo(x+dx,y+dy));g.closePath();};
 poly(12,12);g.fillStyle=INK;g.fill();poly(0,0);g.fillStyle=RED;g.fill();g.lineWidth=7;g.strokeStyle=INK;g.stroke();
 g.textAlign='center';g.textBaseline='middle';g.font=font(title,74);g.lineJoin='round';g.lineWidth=14;g.strokeStyle=INK;const word=trophyWord(spec.legendary).toUpperCase();g.strokeText(word,0,4);g.fillStyle=SUN;g.fillText(word,0,4);g.restore();
 // The words: the fish's name lettered, its size, where and when.
 g.textAlign='center';g.textBaseline='alphabetic';g.fillStyle=INK;let px=86;g.font=font(title,px);while(g.measureText(spec.fishName).width>CW-80&&px>44){px-=4;g.font=font(title,px);}
 g.fillText(spec.fishName,W/2-7,PY+PH+120);
 g.font=font(ui,48);g.fillText(`${spec.sizeCm} cm`,W/2-7,PY+PH+196);
 g.font=font(ui.replace('800','600'),34);g.fillStyle='#51465f';g.fillText(spec.sizeText,W/2-7,PY+PH+246);
 g.fillText(`${spec.spot} · ${spec.date}`,W/2-7,PY+PH+300);
 g.font=font(ui,28);g.fillStyle=INK;g.fillText('futbolisland.app',W/2-7,Y0+CH-36);
 return new Promise(resolve=>c.toBlob(blob=>{c.width=c.height=0;resolve(blob);},'image/png'));
}

/** Save the trophy picture: the share sheet when it takes files (phones), else a download. */
export async function saveTrophy(spec:TrophySpec,art:SVGSVGElement|null):Promise<'saved'|'shared'|'cancelled'|'failed'>{
 const blob=await trophyPng(spec,art);if(!blob)return 'failed';
 const name=trophyFileName(spec);
 try{const file=new File([blob],name,{type:'image/png'});const nav=navigator as Navigator&{canShare?:(d:unknown)=>boolean};
  if(nav.share&&nav.canShare?.({files:[file]})&&matchMedia('(pointer: coarse)').matches){await nav.share({files:[file],title:`${spec.fishName} · Futbol Island`});return 'shared';}}
 catch(e){if((e as Error)?.name==='AbortError')return 'cancelled';}
 const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);return 'saved';
}
