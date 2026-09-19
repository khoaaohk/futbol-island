import type {FieldLesson,FieldActor,Point,FieldBeat} from './formatLessons';
import {journeyById,stageVariant,type LearningId} from './learningJourneys';
/** Original small-sided situations. Every check starts frozen before the solution;
 * all options use identical pitch markers. Stages change the defender/teammate cue. */
export function journeyLesson(id:LearningId,stage:number):FieldLesson{
 const journey=journeyById(id)!,changed=stage===3||stage===5,review=stage>=4;
 let a:Point={x:135,y:290},b:Point={x:135,y:205},defense:FieldActor[]=[],extra:FieldActor[]=[],spots:Point[]=[],correct=0,prompt='',reason='',hint='',wrong:string[]=[];
 if(id==='support'){
  a={x:135,y:290};b={x:135,y:205};
  defense=[{id:'D',label:'D',x:135,y:245},{id:'E',label:'E',x:changed?105:165,y:245}];
  spots=[{x:65,y:205},{x:205,y:205},{x:135,y:205}];correct=changed?1:0;
  prompt='A has the ball. Where should B move so A can pass without either defender blocking the lane?';
  hint='Trace a line from A to each space. Which line misses both blue defenders?';
  reason=`The central defender blocks the straight pass and the other defender closes the ${changed?'left':'right'} diagonal. B changes direction into the ${changed?'right':'left'} lane, then A passes.`;
  wrong=spots.map((_,i)=>i===correct?reason:i===2?'Standing behind the central defender keeps the passing lane blocked. Change the angle.':'That diagonal passes through the second defender. Read both defenders before moving.');
 }else if(id==='width'){
  a={x:135,y:275};b={x:135,y:310};
  extra=[{id:'C',label:'C',x:changed?210:60,y:180}];defense=[{id:'D',label:'D',x:135,y:220}];
  spots=[{x:60,y:180},{x:210,y:180},{x:135,y:220}];correct=changed?0:1;
  prompt=review?'You are helping A escape a central press. Which run adds a NEW passing option?':'C already offers one wide option. Where should B run to give A space on the other side?';
  hint='Find C first. A second player in C’s space would crowd the same lane.';
  reason=`C already occupies the ${changed?'right':'left'} lane. B runs into the empty ${changed?'left':'right'} lane, stretching the defender and giving A a second option. A releases the ball after B creates room.`;
  wrong=spots.map((_,i)=>i===correct?reason:i===2?'The defender occupies that central space. A run straight into the defender does not create width.':'C already occupies that lane. Crowding C reduces the different passing options A can use.');
 }else{
  a={x:55,y:260};b={x:185,y:275};
  defense=[{id:'D',label:'D',x:changed?170:200,y:changed?175:250}];
  spots=[{x:170,y:165},{x:165,y:230},{x:70,y:260}];correct=changed?1:0;
  prompt=changed?'B checked away, but D stayed near goal. Where should B arrive to receive A’s low pass in space?':'B checked away and D followed. Where should B change direction to receive A’s low pass closer to goal?';
  hint='Look at D after B’s first movement. Did the defender leave the space near goal or protect it?';
  reason=changed?'D protects the space near goal, so repeating the long run would take B into the marker. B checks into the open pocket in front of D; A waits for the separation, then passes.':'D followed the first movement away from goal. B changes direction into the vacated finishing lane; A waits until B separates from D, then delivers the low pass.';
  wrong=spots.map((_,i)=>i===correct?reason:i===2?'Running toward A crowds the ball carrier instead of using the open space between A and goal.':changed?'D stayed in that lane. Look for the available space in front of the marker.':'That leaves B beside the marker. The space closer to goal is open after D followed the first movement.');
 }
 // Review scenes shift the complete formation and add a distant passing option;
 // the same tactical relationship must be recognized in a changed picture.
 if(review){const shift=(p:Point)=>({x:p.x-12,y:p.y+18});a=shift(a);b=shift(b);spots=spots.map(shift);defense=defense.map(p=>({...p,...shift(p)}));extra=extra.map(p=>({...p,...shift(p)}));extra.push({id:'R',label:'R',x:235,y:340});}
 // Rotate the displayed answers, keeping all authored geometry and explanations paired.
 const shift=stage%3,order=[0,1,2].map(i=>(i+shift)%3),targets=order.map(i=>spots[i]);
 const answer=order.indexOf(correct),destination=spots[correct];
 const beats:FieldBeat[]=[
  {start:0,end:.3,label:id==='width'?'Read the occupied lane':id==='support'?'Read both blocking defenders':'Read the marker after the first run',focusIds:id==='width'?['A','B','C','D']:id==='support'?['A','B','D','E']:['A','B','D'],moves:[],ball:a,overlays:[]},
  {start:.3,end:.7,label:'Change direction into the available space',focusIds:['A','B'],moves:[{id:'B',to:destination,via:{x:(b.x+destination.x)/2+15,y:(b.y+destination.y)/2+12}}],ball:a,links:[['A','B']],overlays:[{kind:'arrow',from:b,to:destination,arrow:true}]},
  {start:.7,end:1,label:'Pass after the lane opens',focusIds:['A','B'],moves:[{id:'B',to:destination}],ball:destination,links:[['A','B']],overlays:[{kind:'arrow',from:a,to:destination,arrow:true}]},
 ];
 return {id:stageVariant(id,stage),name:`${journey.title} · ${stage===1?'with help':review?'return challenge':changed?'changed situation':'your decision'}`,fmt:journey.format,ball:a,offense:[{id:'A',label:'A',...a},{id:'B',label:'B',...b},...extra],defense,catalog:{category:'futbo paths',what:journey.objective},steps:[
 {desc:prompt,say:prompt,ball:a,moves:[],dur:2,overlays:[],focusIds:['A','B','D']},
 {desc:reason,say:reason,ball:destination,moves:[{id:'B',to:destination}],dur:8,beats,links:[['A','B']]},
 ],questions:[{step:0,q:prompt,options:targets.map((_,i)=>`Space ${String.fromCharCode(65+i)}`),correct:answer,explain:reason,choiceExplanations:order.map(i=>wrong[i]),outcomeStep:1,interact:{kind:'spots',spots:targets.map((p,i)=>({...p,r:18,correct:i===answer,why:wrong[order[i]]}))}}]};
}
export function journeyHint(id:LearningId){return id==='support'?'Trace a line from A to each space. Which line misses both blue defenders?':id==='width'?'Find C first. Choose a different wide lane so A has two options.':'Read D after B’s first run. Use the space the marker has left open.';}
