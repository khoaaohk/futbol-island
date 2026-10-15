/**
 * Flat 2D art for each beach find (docs/beachcombing.md): the Shellbook, Rosa's stand and the island pocket. Same gentle palette
 * as the 3D finds (lib/graphics/beachFinds.ts). `hidden`: a soft silhouette for a find not discovered yet.
 */
import type {BeachFind} from '@/lib/town/beachcombing';

const INK='#3d4a3f';
export default function BeachFindArt({find,size=48,hidden=false}:{find:Pick<BeachFind,'shape'|'color'|'name'>;size?:number;hidden?:boolean}){
 const c=hidden?'#cfc4a4':find.color,l=hidden?'#ddd3b6':'#fff3dd',s=hidden?'#bdb293':INK,sw=2.5;
 let art;
 switch(find.shape){
  case 'scallop':art=<><path d="M32 52 10 26c6-14 38-14 44 0Z" fill={c} stroke={s} strokeWidth={sw} strokeLinejoin="round"/>{[18,25,32,39,46].map(x=><path key={x} d={`M32 50 ${x} 20`} stroke={l} strokeWidth="2" opacity=".7"/>)}<path d="M26 52h12l-2 6h-8Z" fill={c} stroke={s} strokeWidth="2"/></>;break;
  case 'spiral':case 'hermit':art=<><path d="M14 40c0-14 10-24 24-24 9 0 16 6 16 14 0 7-6 12-12 12-5 0-9-4-9-8 0-4 3-6 6-6" fill={hidden?c:'#e9cfa3'} stroke={s} strokeWidth={sw} strokeLinecap="round"/><path d="M14 40c4 6 14 8 24 2" fill="none" stroke={s} strokeWidth={sw}/>
   {find.shape==='hermit'&&<><path d="M12 42c-4 2-6 8-2 10s10-2 12-6" fill={c} stroke={s} strokeWidth="2"/><circle cx="9" cy="40" r="2" fill={s}/><circle cx="15" cy="38" r="2" fill={s}/></>}</>;break;
  case 'glass':art=<><path d="M12 38l8-10 12 2 4 10-10 6Z" fill={c} stroke={s} strokeWidth={sw} strokeLinejoin="round"/><path d="M36 30l10-6 8 8-6 10-10-2Z" fill={hidden?c:'#9bd98f'} stroke={s} strokeWidth={sw} strokeLinejoin="round"/><path d="M18 33l6-4" stroke={l} strokeWidth="3" strokeLinecap="round" opacity=".8"/></>;break;
  case 'driftwood':art=<><path d="M6 38c10-6 34-10 52-8l-2 8c-16 0-34 4-48 6Z" fill={c} stroke={s} strokeWidth={sw} strokeLinejoin="round"/><path d="M30 33l10-12" stroke={s} strokeWidth={sw+1} strokeLinecap="round"/><path d="M14 39c8-3 20-5 30-5" stroke={l} strokeWidth="2" opacity=".5"/></>;break;
  case 'mussel':art=<><path d="M10 40c4-14 26-22 44-16-6 14-28 22-44 16Z" fill={c} stroke={s} strokeWidth={sw}/><path d="M16 38c10-2 24-8 32-12" stroke={hidden?l:'#7b8fb5'} strokeWidth="2" opacity=".8"/></>;break;
  case 'crab':art=<><ellipse cx="32" cy="38" rx="16" ry="10" fill={c} stroke={s} strokeWidth={sw}/>{[-1,1].map(d=><g key={d}><path d={`M${32+d*14} 32c${d*6}-6 ${d*10}-6 ${d*12}-12`} fill="none" stroke={s} strokeWidth={sw}/><circle cx={32+d*26} cy="20" r="5" fill={c} stroke={s} strokeWidth="2"/>{[0,1,2].map(k=><path key={k} d={`M${32+d*12} ${40+k*3}l${d*10} ${4+k*2}`} stroke={s} strokeWidth="2"/>)}<circle cx={32+d*5} cy="26" r="2.5" fill={s}/></g>)}</>;break;
  case 'cowrie':case 'golden':art=<><ellipse cx="32" cy="34" rx="22" ry="14" fill={c} stroke={s} strokeWidth={sw}/><ellipse cx="32" cy="30" rx="14" ry="7" fill={l} opacity=".55"/><path d="M14 40c10 4 26 4 36 0" stroke={s} strokeWidth="2" fill="none"/>{find.shape==='golden'&&!hidden&&<path d="M50 14l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#fff1a8"/>}</>;break;
  case 'sanddollar':art=<><circle cx="32" cy="34" r="20" fill={c} stroke={s} strokeWidth={sw}/>{[0,1,2,3,4].map(k=>{const a=k/5*Math.PI*2-Math.PI/2;return <ellipse key={k} cx={32+Math.cos(a)*8} cy={34+Math.sin(a)*8} rx="2.5" ry="6" transform={`rotate(${a*180/Math.PI+90} ${32+Math.cos(a)*8} ${34+Math.sin(a)*8})`} fill={hidden?l:'#cdbd9c'}/>;})}</>;break;
  case 'starfish':art=<path d="M32 8l6 16 17 1-13 11 5 17-15-10-15 10 5-17-13-11 17-1Z" fill={c} stroke={s} strokeWidth={sw} strokeLinejoin="round"/>;break;
  case 'conch':art=<><path d="M8 34 46 14c8 6 10 18 4 26-8 10-26 12-42-6Z" fill={hidden?c:'#f0d2b4'} stroke={s} strokeWidth={sw} strokeLinejoin="round"/><path d="M24 36c8-2 18 0 24 6-8 6-20 6-24-6Z" fill={c} stroke={s} strokeWidth="2"/>{[30,38,44].map((x,k)=><path key={x} d={`M${x} ${20-k*2}l2-6`} stroke={s} strokeWidth="2.5" strokeLinecap="round"/>)}</>;break;
  case 'urchin':art=<><circle cx="32" cy="36" r="13" fill={c} stroke={s} strokeWidth={sw}/>{Array.from({length:12},(_,k)=>{const a=k/12*Math.PI*2;return <path key={k} d={`M${32+Math.cos(a)*12} ${36+Math.sin(a)*12}L${32+Math.cos(a)*24} ${36+Math.sin(a)*24}`} stroke={hidden?s:'#6b4482'} strokeWidth="2.5" strokeLinecap="round"/>;})}</>;break;
 }
 return <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label={hidden?'Not found yet':find.name}>{art}</svg>;
}
