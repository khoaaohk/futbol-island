'use client';
/**
 * One button of a running island job's action cluster (lib/town/jobs/jobMoves.ts jobButtons, docs/island-jobs.md §10). It takes
 * the place of the default Kick / Juggle / Ride button (same class, so the same size, colour and slot), with the job's icon and
 * a short word under it. Tap buttons act on touch-down (a click follows for mouse and keyboard); hold buttons (Pull, Rake, Paint)
 * press on down and release on up, by pointer or by holding Space / Enter while focused. A disabled button still answers a tap
 * with a hint (aria-disabled, not `disabled`), so a child learns where to go instead of tapping a dead button.
 */
import type {JobButton} from '@/lib/town/jobs/jobMoves';
import TravelIcon from './TravelIcon';
const SHORT:Record<string,string>={kick:'Kick',pull:'Pull',twist:'Twist',cut:'Snip',pickup:'Pick up',unload:'Unload',rake:'Rake',bag:'Bag',empty:'Empty',roll:'Throw',place:'Place',paint:'Paint',pick:'Pick up',toss:'Toss',flag:'Flag',
 'play-on':'Play on',next:'Next',pump:'Pump',release:'Air out',ready:'Ready',box:'Box',hammer:'Hammer',drop:'Drop',take:'Take',pluck:'Pick',crate:'Drop'};
export default function JobActionButton({b,className,onPress}:{b:JobButton;className:string;onPress:(b:JobButton,phase:'tap'|'down'|'up')=>void}){
 const word=SHORT[b.id]??b.label,title=`${b.label} · ${b.key==='Space'?'Space':b.key}${b.hold?' (hold)':''}`;
 const common={type:'button' as const,className:`${className} job-action`,'aria-label':b.label,title,'aria-disabled':!b.enabled||undefined,'aria-keyshortcuts':b.key==='Space'?'Space':b.key,
  'data-job-action':b.id,'data-job-slot':b.slot,onContextMenu:(e:React.MouseEvent)=>e.preventDefault(),children:<><TravelIcon kind={b.icon}/><small>{word}</small></>};
 if(b.hold){const key=(e:React.KeyboardEvent)=>e.key===' '||e.key==='Enter';
  return <button {...common} data-job-hold="" style={{touchAction:'none',userSelect:'none',WebkitUserSelect:'none',WebkitTouchCallout:'none'}}
   onPointerDown={e=>{e.preventDefault();try{e.currentTarget.setPointerCapture(e.pointerId);}catch{}onPress(b,'down');}}
   onPointerUp={()=>onPress(b,'up')} onPointerCancel={()=>onPress(b,'up')} onLostPointerCapture={()=>onPress(b,'up')}
   onKeyDown={e=>{if(!key(e))return;e.preventDefault();e.stopPropagation();if(!e.repeat)onPress(b,'down');}}
   onKeyUp={e=>{if(!key(e))return;e.preventDefault();e.stopPropagation();onPress(b,'up');}}/>;}
 return <button {...common}
  onPointerDown={e=>{if(e.pointerType==='mouse')return;e.preventDefault();e.currentTarget.dataset.touchActionUntil=String(performance.now()+700);onPress(b,'tap');}}
  onClick={e=>{if(e.detail!==0&&performance.now()<Number(e.currentTarget.dataset.touchActionUntil??0))return;onPress(b,'tap');}}/>;
}
