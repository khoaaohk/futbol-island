import type {FieldStep} from './formatLessons';
/** Cached authored cue order; presentation follows the existing seekable lesson clock. */
const plans=new WeakMap<FieldStep,{text:string;ids:string[]}[]>();
export function teachingPresentation(step:FieldStep,progress:number,beatLabel?:string){
 let plan=plans.get(step);
 if(!plan){
  plan=(step.overlays??[]).filter(c=>c.kind==='callout'&&c.text&&c.anchor).map(c=>({text:c.text!,ids:[c.anchor!]}));
  if(beatLabel)plan=[{text:beatLabel,ids:(step.focusIds??plan[0]?.ids??[]).slice(0,2)}];
  if(!plan.length)plan=[{text:beatLabel||step.desc.split(/(?<=[.!?])\s/)[0],ids:(step.focusIds??step.highlight?.flatMap(h=>h.ids)??step.moves.map(m=>m.id)).slice(0,2)}];
  plans.set(step,plan);
 }
 const index=Math.min(plan.length-1,Math.floor(Math.max(0,Math.min(1,progress))*plan.length));
 return {...plan[index],index,count:plan.length};
}
