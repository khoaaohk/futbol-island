import type {FishSpecies} from '@/lib/town/fishing/fishCatalog';

/** Flat island-style fish drawings (one SVG, no images to load). `hidden` draws a not-yet-caught silhouette. */
export default function FishArt({fish,hidden=false,size=96}:{fish:FishSpecies;hidden?:boolean;size?:number}){
 const body=hidden?'#b9b39c':fish.color,belly=hidden?'#b9b39c':fish.belly,ink=hidden?'#a39c84':'#244d40';
 const eye=!hidden&&<><circle cx="30" cy="27" r="3.4" fill="#fff8e8"/><circle cx="29.4" cy="27" r="1.7" fill="#1d3a32"/></>;
 let art;
 switch(fish.shape){
  case 'shrimp':art=<g><path d="M22 18c14-6 34-2 44 10 6 7 4 17-4 20-6 2-10-3-8-8 2-4-2-9-10-10-9-1-18 1-22 2z" fill={body}/><path d="M26 22c10-3 24-1 32 7" stroke={belly} strokeWidth="3" fill="none" strokeLinecap="round"/><path d="M22 18c-6-6-10-8-14-7M24 17c-3-7-4-11-8-13" stroke={ink} strokeWidth="1.6" fill="none" strokeLinecap="round"/><path d="M40 34l-3 8M48 34l-2 8M56 32l0 8" stroke={ink} strokeWidth="1.6" strokeLinecap="round"/><path d="M58 46l8 6 2-9z" fill={body}/>{!hidden&&<circle cx="25" cy="20" r="2" fill="#1d3a32"/>}</g>;break;
  case 'octopus':art=<g><ellipse cx="46" cy="22" rx="18" ry="15" fill={body}/>{[0,1,2,3,4].map(i=><path key={i} d={`M${32+i*7} 32c-2 8 ${i%2?6:-6} 12 ${i%2?2:-2} 20`} stroke={body} strokeWidth="5" fill="none" strokeLinecap="round"/>)}<ellipse cx="46" cy="26" rx="10" ry="4" fill={belly} opacity=".6"/>{!hidden&&<><circle cx="40" cy="22" r="3" fill="#fff8e8"/><circle cx="52" cy="22" r="3" fill="#fff8e8"/><circle cx="40" cy="22" r="1.5" fill="#1d3a32"/><circle cx="52" cy="22" r="1.5" fill="#1d3a32"/></>}</g>;break;
  case 'shark':art=<g><path d="M14 30c12-12 36-14 54-6l10-12-2 16 8 10-12-2c-16 8-40 8-58-6z" fill={body}/><path d="M42 18l6-12 6 14z" fill={body}/><path d="M20 32c14 5 32 6 46 2" stroke={belly} strokeWidth="5" fill="none" strokeLinecap="round"/><path d="M40 38l-4 8 10-6z" fill={body}/>{eye}<path d="M34 26v6M37 25v7" stroke={ink} strokeWidth="1.2"/></g>;break;
  case 'long':art=<g><path d="M12 28c14-14 42-16 60-4l12-12-4 16 4 16-12-12c-18 12-46 10-60-4z" fill={body}/><path d="M18 31c18 7 38 7 54 0" stroke={belly} strokeWidth="6" fill="none" strokeLinecap="round"/><path d="M44 16l6-8 4 10zM44 40l6 7 4-9z" fill={ink} opacity=".75"/>{eye}</g>;break;
  case 'round':art=<g><path d="M14 28c10-16 40-18 56-4l12-10v28l-12-10c-16 14-46 12-56-4z" fill={body}/><path d="M20 32c14 8 34 8 48 0" stroke={belly} strokeWidth="7" fill="none" strokeLinecap="round"/><path d="M38 14l10-6 6 10z" fill={body}/>{eye}<path d="M36 22c2 4 2 8 0 12" stroke={ink} strokeWidth="1.3" fill="none" opacity=".6"/></g>;break;
  default:art=<g><path d="M12 28c12-10 36-12 56-4l14-10-2 14 2 14-14-10c-20 8-44 6-56-4z" fill={body}/><path d="M18 30c16 5 34 5 48 0" stroke={belly} strokeWidth="5" fill="none" strokeLinecap="round"/>{!hidden&&fish.id==='mackerel'&&<path d="M28 20l4 5M36 18l4 5M44 18l4 5M52 19l4 5" stroke={ink} strokeWidth="1.6" strokeLinecap="round"/>}{eye}</g>;
 }
 return <svg viewBox="0 0 92 56" width={size} height={size*56/92} role="img" aria-label={hidden?'Not caught yet':fish.name}>{art}</svg>;
}
