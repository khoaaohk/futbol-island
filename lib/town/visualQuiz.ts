import {lessonPositions,type FieldLesson,type FieldQuestion,type Point} from './formatLessons';
/**
 * Visual quiz questions (docs/quiz-design.md). A question with `visual` is answered on a small static SVG pitch inside the quiz
 * card instead of on the 3D pitch; a question with `interact` keeps the original 3D tap. Every kind still resolves to ONE option
 * index, so `options`, `correct`, `choiceExplanations`, the voice clips, progress keys and the transcript work unchanged.
 * Coordinates are the lesson's own 270×400 space (x across, y down the pitch; the gold team attacks toward y=0).
 */
export type QuizTone='gold'|'blue'|'good'|'bad'|'neutral';
/** A static drawing on the mini pitch. `from`/`to` take a point or an actor id. */
export type QuizMark={kind:'pass'|'run'|'dribble'|'zone'|'spot'|'label'|'cross';from?:Point|string;to?:Point|string;x?:number;y?:number;w?:number;h?:number;r?:number;text?:string;tone?:QuizTone};
/** A freeze-frame of the lesson: actor positions at `step` (progress 0–1, default 1), optionally changed for a what-if picture. */
export type QuizFrame={step:number;progress?:number;place?:Record<string,Point>;ball?:Point|string;hide?:string[];focus?:string[];marks?:QuizMark[];trails?:boolean;view?:{x:number;y:number;w:number;h:number};alt?:string};
export type VisualKind='tapSpot'|'bestPass'|'pickPicture'|'dragToZone'|'whatNext'|'trueFalse'|'order';
export type VisualQuestion={
 kind:VisualKind;
 /** The picture the question is asked about (every kind except pickPicture; optional for order). */
 frame?:QuizFrame;
 /** tapSpot: one circle per option. */
 spots?:{x:number;y:number;r?:number}[];
 /** bestPass: the passer (actor id) and one target per option (actor id or point). */
 from?:string;to?:(string|Point)[];
 /** pickPicture (required) and whatNext (optional; text options otherwise): one picture per option. */
 pictures?:QuizFrame[];
 /** dragToZone: the actor to drag, and one zone per option. */
 drag?:string;zones?:{x:number;y:number;w:number;h:number}[];
 /** order: optional small picture per item, aligned with options (which are written in the CORRECT order). */
 frames?:QuizFrame[];
};
export type VisualFieldQuestion=FieldQuestion&{visual:VisualQuestion};
export const isVisual=(q:FieldQuestion|undefined):q is VisualFieldQuestion=>!!q&&!!(q as {visual?:unknown}).visual;

/** Kid-facing instruction under the question. */
export function visualHint(q:VisualFieldQuestion){
 const v=q.visual;
 switch(v.kind){
  case 'tapSpot':return 'Tap the best space on the mini pitch.';
  case 'bestPass':return 'Tap the best pass arrow.';
  case 'pickPicture':return 'Tap the picture that shows it.';
  case 'dragToZone':return 'Drag the player to the right space, or tap a space.';
  case 'whatNext':return v.pictures?'Look at the freeze-frame. Tap what happens next.':'Look at the freeze-frame. Tap what happens next.';
  case 'trueFalse':return 'Look at the picture. Is it true or false?';
  case 'order':return 'Drag the steps into the order they happen, then tap Check order.';
 }
}
/** How many choices the visual carries (must equal options.length). */
export function visualChoiceCount(v:VisualQuestion,options:number){
 switch(v.kind){
  case 'tapSpot':return v.spots?.length??0;
  case 'bestPass':return v.to?.length??0;
  case 'pickPicture':return v.pictures?.length??0;
  case 'dragToZone':return v.zones?.length??0;
  case 'whatNext':return v.pictures?.length??options;
  case 'trueFalse':return 2;
  case 'order':return v.frames?.length??options;
 }
}
/** Display order for order questions: a fixed shuffle (never the answer order), stable across renders and retries. */
export function orderDisplay(count:number,seed:string){
 const idx=Array.from({length:count},(_,i)=>i);let h=2166136261;for(const c of seed)h=Math.imul(h^c.charCodeAt(0),16777619)>>>0;
 for(let i=count-1;i>0;i--){h=Math.imul(h^(h>>>13),1597334677)>>>0;const j=h%(i+1);[idx[i],idx[j]]=[idx[j],idx[i]];}
 if(count>1&&idx.every((v,i)=>v===i))idx.push(idx.shift()!);
 return idx;
}
/** Drag-to-reorder helpers for `order` questions (options are authored in the correct order, so slot k should hold option k). */
export const moveStep=(order:number[],from:number,to:number)=>{const o=[...order];const [x]=o.splice(from,1);o.splice(to,0,x);return o;};
/** Slot a dragged card lands in: how many OTHER cards' centres sit above the dragged card's centre. */
export const dropSlot=(centers:number[],from:number,center:number)=>centers.reduce((t,c,k)=>t+(k!==from&&c<center?1:0),0);
/** The answer a checked order reports: `correct` when solved, else the option sitting in the first wrong slot (never `correct`, so
 *  the usual wrong → "why" → Try again flow and outcome tracking apply, and only that one card is flagged). */
export const orderAnswer=(order:number[],correct:number)=>{const k=order.findIndex((v,i)=>v!==i);return k<0?correct:order[k];};

export type FramePose={positions:Map<string,Point>;ball:Point;trails:Map<string,Point>};
/** Resolve a frame to actor positions (static; computed once per render, no loop). */
export function framePose(lesson:FieldLesson,frame:QuizFrame):FramePose{
 const step=Math.max(0,Math.min(lesson.steps.length-1,frame.step)),pose=lessonPositions(lesson,step,frame.progress??1);
 const positions=new Map(pose.positions);for(const id of frame.hide??[])positions.delete(id);
 for(const [id,p] of Object.entries(frame.place??{}))if(positions.has(id)||lesson.offense.some(a=>a.id===id)||lesson.defense.some(a=>a.id===id))positions.set(id,p);
 let ball=pose.ball;if(typeof frame.ball==='string'){const at=positions.get(frame.ball);if(at)ball={x:at.x+4,y:at.y-9};}else if(frame.ball)ball=frame.ball;
 const trails=new Map<string,Point>();
 if(frame.trails){const before=lessonPositions(lesson,step,0).positions;for(const [id,p] of positions){const b=before.get(id);if(b&&Math.hypot(b.x-p.x,b.y-p.y)>12)trails.set(id,b);}}
 return {positions,ball,trails};
}
export const pointOf=(pose:FramePose,p:Point|string|undefined):Point|undefined=>typeof p==='string'?pose.positions.get(p):p;

/** A crop around what matters, kept landscape-ish so it reads on a phone, and inside the pitch. */
export function frameView(lesson:FieldLesson,frame:QuizFrame,pose:FramePose,extra:Point[]=[],include:string[]=[],minAspect=1.05){
 if(frame.view)return frame.view;
 const ids=new Set([...(frame.focus??[]),...Object.keys(frame.place??{}),...include]);
 const pts:Point[]=[pose.ball,...extra,...[...pose.positions].filter(([id])=>ids.has(id)).map(([,p])=>p)];
 for(const m of frame.marks??[]){for(const k of [m.from,m.to]){const p=pointOf(pose,k);if(p)pts.push(p);}if(m.x!==undefined&&m.y!==undefined){pts.push({x:m.x-(m.w??0)/2,y:m.y-(m.h??0)/2},{x:m.x+(m.w??0)/2,y:m.y+(m.h??0)/2});}}
 if(pts.length<3)for(const p of pose.positions.values())pts.push(p);
 let x0=Math.min(...pts.map(p=>p.x))-38,x1=Math.max(...pts.map(p=>p.x))+38,y0=Math.min(...pts.map(p=>p.y))-38,y1=Math.max(...pts.map(p=>p.y))+38;
 const W=270,H=400,minW=150;
 if(x1-x0<minW){const c=(x0+x1)/2;x0=c-minW/2;x1=c+minW/2;}
 // Widen (never shrink) to the minimum aspect; a tall crop stays tall if the pitch is too narrow.
 if((x1-x0)/(y1-y0)<minAspect){const c=(x0+x1)/2,w=Math.min(W+20,(y1-y0)*minAspect);x0=c-w/2;x1=c+w/2;}
 if((x1-x0)/(y1-y0)>1.7){const c=(y0+y1)/2,h=(x1-x0)/1.7;y0=c-h/2;y1=c+h/2;}
 const fit=(a:number,b:number,lo:number,hi:number):[number,number]=>{const len=Math.min(b-a,hi-lo);let s=a;if(s<lo)s=lo;if(s+len>hi)s=hi-len;return [s,s+len];};
 [x0,x1]=fit(x0,x1,-10,W+10);[y0,y1]=fit(y0,y1,-10,H+10);
 return {x:Math.round(x0),y:Math.round(y0),w:Math.round(x1-x0),h:Math.round(y1-y0)};
}

/** A short spoken/screen-reader description of a frame, so the picture is never the only way in. */
export function describeFrame(lesson:FieldLesson,frame:QuizFrame,pose:FramePose){
 if(frame.alt)return frame.alt;
 const name=(id:string)=>[...lesson.offense,...lesson.defense].find(a=>a.id===id)?.label??id;
 const holder=[...pose.positions].sort((a,b)=>Math.hypot(a[1].x-pose.ball.x,a[1].y-pose.ball.y)-Math.hypot(b[1].x-pose.ball.x,b[1].y-pose.ball.y))[0];
 const gold=lesson.offense.some(a=>a.id===holder?.[0]);
 const focus=(frame.focus??[]).map(name);
 return `Mini pitch, gold team attacks up.${holder?` The ball is with the ${gold?'gold':'blue'} ${name(holder[0])}.`:''}${focus.length?` Look at ${focus.join(', ')}.`:''}`;
}

/** Structural check used by tests and the authoring merge script. Returns problems (empty = valid). */
export function validateVisualQuestion(lesson:FieldLesson,q:VisualFieldQuestion):string[]{
 const errs:string[]=[],v=q.visual,ids=new Set([...lesson.offense,...lesson.defense].map(a=>a.id));
 const n=q.options.length,kinds:VisualKind[]=['tapSpot','bestPass','pickPicture','dragToZone','whatNext','trueFalse','order'];
 if(!kinds.includes(v.kind))errs.push('unknown kind '+v.kind);
 if(n<2||n>4&&v.kind!=='order'||n>5)errs.push('options must be 2–4 (order: 2–5)');
 if(!Number.isInteger(q.correct)||q.correct<0||q.correct>=n)errs.push('correct index out of range');
 if(v.kind==='order'&&q.correct!==0)errs.push('order questions use correct:0 (options are in the correct order)');
 if(v.kind==='trueFalse'&&(n!==2||!/^true$/i.test(q.options[0])||!/^false$/i.test(q.options[1])))errs.push('trueFalse options must be ["True","False"]');
 if(visualChoiceCount(v,n)!==n)errs.push(`choices (${visualChoiceCount(v,n)}) must match options (${n})`);
 if(q.choiceExplanations?.length!==n||q.choiceExplanations.some(s=>!s?.trim()))errs.push('one choiceExplanation per option');
 else if(q.choiceExplanations[q.correct]!==q.explain)errs.push('choiceExplanations[correct] must equal explain');
 if(!q.q.trim()||!q.explain.trim())errs.push('question and explain are required');
 if(v.kind!=='pickPicture'&&v.kind!=='order'&&!v.frame)errs.push('frame is required');
 const frames=[v.frame,...v.pictures??[],...v.frames??[]].filter(Boolean) as QuizFrame[];
 for(const f of frames){
  if(!Number.isInteger(f.step)||f.step<0||f.step>=lesson.steps.length)errs.push('frame step out of range');
  for(const id of [...f.focus??[],...f.hide??[],...Object.keys(f.place??{}),...typeof f.ball==='string'?[f.ball]:[]])if(!ids.has(id))errs.push('unknown actor '+id);
  for(const m of f.marks??[])for(const k of [m.from,m.to])if(typeof k==='string'&&!ids.has(k))errs.push('unknown mark actor '+k);
 }
 if(v.kind==='bestPass'){if(!v.from||!ids.has(v.from))errs.push('bestPass from must be an actor');for(const t of v.to??[])if(typeof t==='string'&&!ids.has(t))errs.push('unknown pass target '+t);}
 if(v.kind==='dragToZone'&&(!v.drag||!ids.has(v.drag)))errs.push('dragToZone drag must be an actor');
 if(v.kind==='pickPicture'&&v.frame)errs.push('pickPicture uses pictures, not frame');
 if(!Number.isInteger(q.step)||q.step<0||q.step>=lesson.steps.length)errs.push('step out of range');
 return errs;
}
