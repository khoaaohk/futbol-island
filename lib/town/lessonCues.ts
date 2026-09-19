import {teachingPresentation} from './teachingPresentation';
import * as T from 'three';
import {trimTeachingRoute,remainingPassRoute} from './teachingRoutes';
import {fieldPoint,type Venue} from './venues';
import {createTeachingGround,teachingAreaContains,type TeachingHitArea} from './teachingGround';
import {quizOutcomeStep,lessonVisualFrame,lessonPositions,type FieldSession,type Point,type CuePoint} from './formatLessons';

/** Reusable teaching geometry; no per-frame textures or extra render loop. */
export function createLessonCues(scene:T.Scene){
 const root=new T.Group();root.name='lesson-cues';scene.add(root);const ground=createTeachingGround();root.add(ground.mesh);
 const geometry=new T.BufferGeometry(),positions=new T.Float32BufferAttribute(new Float32Array(12288),3),colors=new T.Float32BufferAttribute(new Float32Array(12288),3);
 geometry.setAttribute('position',positions);geometry.setAttribute('color',colors);
 const material=new T.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.9,depthWrite:false});
 const lines=new T.LineSegments(geometry,material);lines.frustumCulled=false;root.add(lines);
 const arrowGeometry=new T.BufferGeometry();arrowGeometry.setAttribute('position',new T.Float32BufferAttribute([0,0,-.5,0,0,.5,.2,0,-.5,.2,0,.5,1,0,-.5,1,0,.5],3));arrowGeometry.setIndex([0,1,2,1,3,2,2,3,4,3,5,4]);arrowGeometry.setAttribute('color',new T.Float32BufferAttribute([1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],4));
 const arrowMaterial=new T.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false}),passArrow=new T.Mesh(arrowGeometry,arrowMaterial);passArrow.name='teaching-pass-arrow';root.add(passArrow);
 const headGeometry=new T.BufferGeometry();headGeometry.setAttribute('position',new T.Float32BufferAttribute([0,0,0,-1,0,-.5,-1,0,.5],3));const headMaterial=new T.MeshBasicMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false}),passHead=new T.Mesh(headGeometry,headMaterial);passHead.name='teaching-pass-tip';root.add(passHead);
 const discGeometry=new T.CircleGeometry(1,40),squareGeometry=new T.PlaneGeometry(2,2),fills:T.Mesh<T.BufferGeometry,T.MeshBasicMaterial>[]=[],labels:T.Sprite[]=[],targets:T.Sprite[]=[];
 const hitAreas:TeachingHitArea[]=[];let hitHeight=1;const hitPlane=new T.Plane(new T.Vector3(0,1,0),0),hitPoint=new T.Vector3();
 let routeKey='',routeLesson:FieldSession['lesson']|undefined;let routeSamples:ReturnType<typeof lessonPositions>[]=[];
 const raycaster=new T.Raycaster();let labelCount=0,fillCount=0,count=0;
 let teachingLabelBudget=Infinity;const teachingLabelTexts=new Set<string>();
 const gold=[.92,.76,.42],blue=[.38,.61,.89],neutral=[.98,.92,.72];
 function label(text:string,at:T.Vector3,color:number[]=gold,target?:number){
  if(target===undefined){if(teachingLabelBudget<=0||teachingLabelTexts.has(text))return;teachingLabelBudget--;teachingLabelTexts.add(text);}
  let sprite=labels[labelCount++];
  if(!sprite){sprite=new T.Sprite(new T.SpriteMaterial({transparent:true,depthTest:false,depthWrite:false,toneMapped:false}));sprite.renderOrder=8;root.add(sprite);labels.push(sprite);}
  const ink=new T.Color().setRGB(...color as [number,number,number]).getStyle(),textureKey=text+':'+ink;
  if(sprite.userData.textureKey!==textureKey){
   sprite.material.map?.dispose();const canvas=document.createElement('canvas');const c=canvas.getContext('2d')!;c.font='bold 56px Arial';canvas.width=target===undefined?Math.ceil(c.measureText(text).width+40):96;canvas.height=96;
   if(target===undefined){c.fillStyle='#203e35';c.fillRect(0,0,canvas.width,96);}c.fillStyle=target===undefined?ink:'#294f43';c.textAlign='center';c.textBaseline='middle';c.font='bold 56px Arial';if(target!==undefined){c.strokeStyle='#fff0cc';c.lineWidth=6;c.strokeText?.(text,canvas.width/2,50,canvas.width-20);}c.fillText(text,canvas.width/2,50,canvas.width-20);
   sprite.material.map=new T.CanvasTexture(canvas);sprite.material.map.colorSpace=T.SRGBColorSpace;sprite.material.needsUpdate=true;sprite.userData.text=text;sprite.userData.textureKey=textureKey;
  }
  sprite.visible=true;sprite.position.copy(at);sprite.material.color.set(0xffffff);sprite.scale.set(target===undefined?Math.min(10,Math.max(4,text.length*.35)):2.5,target===undefined?1.1:1.4,1);
  sprite.userData.answer=target;if(target!==undefined)targets.push(sprite);
 }
 function segment(a:T.Vector3,b:T.Vector3,color:number[]){if(count+6>positions.array.length)return;positions.array.set([a.x,a.y,a.z,b.x,b.y,b.z],count);colors.array.set([...color,...color],count);count+=6;}
 function fill(at:T.Vector3,rx:number,ry:number,color:number[],rect=false){
  let disc=fills[fillCount++];if(!disc){disc=new T.Mesh(discGeometry,new T.MeshBasicMaterial({transparent:true,opacity:.18,depthWrite:false,side:T.DoubleSide}));disc.rotation.x=-Math.PI/2;root.add(disc);fills.push(disc);}
  disc.geometry=rect?squareGeometry:discGeometry;disc.visible=true;disc.position.copy(at);disc.scale.set(rx,ry,1);disc.material.color.setRGB(...color as [number,number,number]);
 }
 function update(session:FieldSession|null,v?:Venue,camera?:T.Camera,viewportHeight=window.innerHeight){
  passArrow.visible=passHead.visible=false;ground.reset();
  hitAreas.length=0;hitHeight=viewportHeight;teachingLabelTexts.clear();teachingLabelBudget=0;
  root.visible=!!session;count=labelCount=fillCount=0;targets.length=0;labels.forEach(s=>s.visible=false);fills.forEach(s=>s.visible=false);
  if(!session||!v){geometry.setDrawRange(0,0);ground.finish();return;}
  const frame=lessonVisualFrame(session.lesson,session.step,session.progress),visualStep=frame.step,outcome=quizOutcomeStep(session)!==undefined;
  const presentation=teachingPresentation(visualStep,frame.progress,frame.label),focus=presentation.ids;
  const clearEnd=!session.quiz&&session.progress>=1;
  let routeBudget=2;
  const key=session.step+':'+frame.index;if(routeLesson!==session.lesson||routeKey!==key){routeLesson=session.lesson;routeKey=key;routeSamples=Array.from({length:17},(_,i)=>lessonPositions(session.lesson,session.step,frame.start+(frame.end-frame.start)*i/16));}
  const {positions:poses}=lessonPositions(session.lesson,session.step,session.progress),y=(v.elevation??0)+.23;hitPlane.constant=-y;
  if(camera instanceof T.PerspectiveCamera){const center=new T.Vector3(v.x,y,v.z),right=new T.Vector3(1,0,0).applyQuaternion(camera.quaternion);right.y=0;right.normalize();const a=center.clone().project(camera),b=center.clone().add(right).project(camera),pixels=Math.hypot((b.x-a.x)*camera.aspect,b.y-a.y)*viewportHeight/2;if(pixels>.01)ground.setWidthScale(1.8/(pixels*.16));}
  const point=(p:CuePoint|undefined):T.Vector3|null=>{if(!p)return null;const at='id'in p?poses.get(p.id):p;if(!at)return null;const w=fieldPoint(v,{x:at.x+('id'in p?p.dx??0:0),y:at.y+('id'in p?p.dy??0:0)});return new T.Vector3(w.x,y,w.z);};
  const start=routeSamples[0],end=routeSamples[16],ballNow=point(lessonPositions(session.lesson,session.step,session.progress).ball)!,ballFrom=point(start.ball)!,ballTo=point(end.ball)!;
  const owner=(poses:Map<string,Point>,ball:T.Vector3)=>{let closest:string|undefined,gap=1.8;for(const [id,p] of poses){const distance=point(p)!.distanceTo(ball);if(distance<gap){closest=id;gap=distance;}}return closest;};
  const passer=owner(start.positions,ballFrom),receiver=owner(end.positions,ballTo),q=session.lesson.questions[session.question];
  const pass=ballFrom.distanceTo(ballTo)>2&&passer!==undefined&&receiver!==undefined&&passer!==receiver&&(!session.quiz||outcome);
  const matchesPass=(a:T.Vector3,b:T.Vector3)=>pass&&a.distanceTo(ballFrom)<1.8&&b.distanceTo(ballTo)<1.8;
  if(pass&&!clearEnd){routeBudget--;const full=trimTeachingRoute(ballFrom.x,ballFrom.z,ballTo.x,ballTo.z,.8,.8),remaining=full&&remainingPassRoute(full,session.renderedBall?.x??ballNow.x,session.renderedBall?.z??ballNow.z,session.renderedBall?.landed??frame.progress>=1);
   if(remaining){const dx=remaining.bx-remaining.ax,dz=remaining.bz-remaining.az,length=Math.hypot(dx,dz),size=Math.min(1.2,length*.22),color=session.lesson.offense.some(actor=>actor.id===passer)?gold:blue;
    passArrow.visible=passHead.visible=true;passArrow.position.set(remaining.ax,y,remaining.az);passArrow.rotation.y=Math.atan2(-dz,dx);passArrow.scale.set(Math.max(.01,length-size*.85),1,.42);arrowMaterial.color.setRGB(...color as [number,number,number]);arrowMaterial.opacity=remaining.opacity*.9;
    passHead.position.set(remaining.bx,y+.005,remaining.bz);passHead.rotation.y=passArrow.rotation.y;passHead.scale.setScalar(size);headMaterial.color.copy(arrowMaterial.color);headMaterial.opacity=arrowMaterial.opacity;
   }
  }
  const route=(a:T.Vector3,b:T.Vector3,color:number[],arrow=false,dashed=false)=>{if(clearEnd||routeBudget<=0)return;routeBudget--;const size=Math.min(.8,a.distanceTo(b)*.3),end=arrow?b.clone().lerp(a,size*.8/a.distanceTo(b)):b;(dashed?ground.dashedLine:ground.line)(a,end,color,arrow?.2:.13);if(arrow)ground.arrow(a,b,color,size);};
  // Merge concentric authored, feedback and answer markers before drawing.
  const areas:{at:T.Vector3;rx:number;rz:number;color:number[];rect:boolean;priority:number;filled:boolean}[]=[];
  const area=(at:T.Vector3,rx:number,rz:number,color:number[],rect=false,priority=1,filled=true)=>{const existing=areas.findIndex(other=>Math.hypot(other.at.x-at.x,other.at.z-at.z)<Math.min(.8,Math.min(rx,rz,other.rx,other.rz)*.65));const next={at,rx,rz,color,rect,priority,filled};if(existing<0)areas.push(next);else if(priority>=areas[existing].priority)areas[existing]=next;};

  const drawnRoutes=new Set<string>();
  const movement=(id:string,color:number[])=>{if(clearEnd||drawnRoutes.has(id)||drawnRoutes.size>=1||routeBudget<=0)return;const samples=routeSamples.map(sample=>point(sample.positions.get(id))).filter((p):p is T.Vector3=>!!p);if(samples.length<2||samples[0].distanceTo(samples[samples.length-1])<.7)return;drawnRoutes.add(id);for(let i=1;i<samples.length;i++){const elapsed=i/16<frame.progress,tint=elapsed?color.map(c=>c*.7):color;if(i===samples.length-1)route(samples[i-1],samples[i],color,true);else ground.line(samples[i-1],samples[i],tint,elapsed?.13:.22);}};
  const question=session.lesson.questions[session.question];
  const cues=session.quiz?(session.answer===null?[]:outcome?[...(visualStep.overlays??[]),...(question?.feedback?.overlays??[])]:question?.feedback?.overlays??[]):visualStep.overlays??[];
  for(const cue of cues){const color=cue.color??gold;
   if(clearEnd)continue;
   const ids=cue.ids??(cue.anchor?[cue.anchor]:[]);
   if(ids.length&&focus.length&&!ids.some(id=>focus.includes(id)))continue;
   if(cue.kind==='spotlight'){for(const id of (cue.ids??(cue.anchor?[cue.anchor]:[])).filter(id=>!focus.length||focus.includes(id)).slice(0,2)){const p=point({id});if(p){area(p,1.15,1.15,color);}}}
   if(cue.kind==='callout'&&cue.anchor){const p=point({id:cue.anchor});if(p){p.y+=3.4;const home=session.lesson.offense.some(a=>a.id===cue.anchor);label(cue.text??'',p,home?gold:blue);}}
   if(cue.kind==='line'){const a=point(cue.from),b=point(cue.to);if(a&&b){const quizRoute=session.quiz&&question?.interact?.paths?.some(path=>{const from=point(path.from),to=point(path.to);return from&&to&&from.distanceToSquared(a)<.0001&&to.distanceToSquared(b)<.0001;});if(!quizRoute&&!(cue.arrow&&matchesPass(a,b)))route(a,b,color,cue.arrow,cue.style==='dashed');if(cue.label)label(cue.label,a.clone().lerp(b,.5).add(new T.Vector3(0,.9,0)),color);}}
   if(cue.kind==='space'&&cue.x!==undefined&&cue.y!==undefined){const p=point({x:cue.x,y:cue.y})!;const rx=(cue.rx??10)/250*v.width,rz=(cue.ry??10)/380*v.length;area(p,rx,rz,color,false,2);if(cue.label)label(cue.label,p.clone().add(new T.Vector3(0,.8,0)),color);}
   if(cue.kind==='ghostTrail'){for(const id of cue.ids??[])movement(id,color);}
   if(cue.kind==='angle'&&!clearEnd&&routeBudget>=2){const vertex=point(cue.vertex),a=point(cue.a),b=point(cue.b);if(vertex&&a&&b){route(vertex,a,color);route(vertex,b,color);const start=Math.atan2(a.z-vertex.z,a.x-vertex.x),end=Math.atan2(b.z-vertex.z,b.x-vertex.x),delta=Math.atan2(Math.sin(end-start),Math.cos(end-start)),r=Math.min(2,vertex.distanceTo(a)*.4,vertex.distanceTo(b)*.4);let last=vertex.clone().add(new T.Vector3(Math.cos(start)*r,0,Math.sin(start)*r));for(let i=1;i<=12;i++){const at=start+delta*i/12,next=vertex.clone().add(new T.Vector3(Math.cos(at)*r,0,Math.sin(at)*r));ground.line(last,next,color,.15);last=next;}if(cue.label)label(cue.label,vertex.clone().add(new T.Vector3(0,2,0)),color);}}
  }
  if(!session.quiz||outcome){
   for(const [from,to] of (visualStep.links??[]).filter(pair=>!focus.length||pair.some(id=>focus.includes(id))).slice(0,1)){const a=point({id:from}),b=point({id:to});if(a&&b){const trimmed=trimTeachingRoute(a.x,a.z,b.x,b.z,.8,.8);if(trimmed)route(new T.Vector3(trimmed.ax,y,trimmed.az),new T.Vector3(trimmed.bx,y,trimmed.bz),blue,false,true);}}
   for(const [from,to] of (visualStep.arrows??[]).filter(pair=>!focus.length||pair.some(id=>focus.includes(id))).slice(0,1)){const a=point({id:from}),b=point({id:to});if(a&&b&&!matchesPass(a,b)){const trimmed=trimTeachingRoute(a.x,a.z,b.x,b.z,.9,.9);if(trimmed)route(new T.Vector3(trimmed.ax,y,trimmed.az),new T.Vector3(trimmed.bx,y,trimmed.bz),gold,true);}}
   for(const zone of (visualStep.fieldZones??[]).slice(0,1)){const p=point(zone)!;const rx=zone.w/2/250*v.width,rz=zone.h/2/380*v.length,color=zone.color??gold;area(p,rx,rz,color,true,2);if(zone.label)label(zone.label,p.clone().add(new T.Vector3(0,.8,0)),color);}
   for(const cue of (visualStep.defensiveCues??[]).filter(c=>!focus.length||focus.includes(c.id)).slice(0,1)){const a=point({id:cue.id}),b=cue.markId?point({id:cue.markId}):null;if(a){area(a,1.05,1.05,blue,false,1,false);if(b){const distance=a.distanceTo(b);for(let i=.9;i<distance-.8;i+=.9){const from=a.clone().lerp(b,i/distance),to=a.clone().lerp(b,Math.min(i+.45,distance-.8)/distance);ground.line(from,to,blue,.12);}}}}
   const focused=focus;
   const movers=visualStep.moves.filter(move=>{const a=start.positions.get(move.id),b=end.positions.get(move.id);return a&&b&&point(a)!.distanceTo(point(b)!)>.7;});
   const selected=movers.filter(move=>focused.includes(move.id));
   for(const move of (selected.length?selected.slice(0,3):drawnRoutes.size?[]:movers.slice(0,2)))movement(move.id,session.lesson.offense.some(a=>a.id===move.id)?gold:blue);
   // A destination halo gives a weak authored step a concrete spatial reference.
   // It marks only actual focused movement, not an invented tactical answer.
   if(!cues.some(cue=>cue.kind==='space'||cue.kind==='spotlight'))for(const move of selected.slice(0,2)){const p=point(end.positions.get(move.id));if(p){area(p,1.4,1.4,gold);}}
   if(!cues.some(cue=>cue.kind==='spotlight'))for(const id of focused.slice(0,4)){const p=point({id});if(p)area(p,1.1,1.1,gold,false,1,false);}
  }
  if(session.quiz&&question?.interact&&!outcome){
   // Every answer route remains visible and selectable; instructional budgets never hide choices.
   routeBudget=Infinity;
   const interaction=question.interact;
   const choices:{at:Point|undefined;from?:Point;correct:boolean;rx?:number;rz?:number;rect?:boolean}[]=interaction.paths?.map(p=>({at:p.to,from:p.from,correct:p.correct}))??interaction.candidates?.map(p=>({at:poses.get(p.id),correct:p.correct}))??interaction.spots?.map(p=>({at:p as Point,correct:p.correct,rx:p.r/250*v.width,rz:p.r/380*v.length}))??interaction.zones?.map(p=>({at:{x:p.x,y:p.y},correct:p.correct,rx:p.w/2/250*v.width,rz:p.h/2/380*v.length,rect:true}))??[];
   choices.forEach((choice,i)=>{const p=point(choice.at);if(!p)return;const color=session.answer===null?neutral:choice.correct?[.4,.9,.62]:session.answer===i?[1,.55,.4]:neutral;
    const from=choice.from?point(choice.from):null;const rx=choice.rx??1,rz=choice.rz??1;hitAreas.push({answer:i,at:p.clone(),from:from??undefined,rx,rz,rect:choice.rect});
    if(from&&!(choice.correct&&matchesPass(from,p)))route(from,p,color,true);
    area(p,rx,rz,color,choice.rect,3);label(String(i+1),p.clone().add(new T.Vector3(0,1.25,0)),color,i);
   });
  }
  const highlighted=session.quiz?question?.feedback?.highlight:visualStep.highlight;
  if(!session.quiz||session.answer!==null)for(const id of highlighted?.flatMap(h=>h.ids)??[]){const p=point({id});if(p&&!areas.some(a=>a.at.distanceTo(p)<.8))area(p,1.1,1.1,session.lesson.offense.some(a=>a.id===id)?gold:blue,false,0,false);}
  const visibleAreas=clearEnd?[]:session.quiz&&!outcome?areas:[...areas].sort((a,b)=>b.priority-a.priority).slice(0,2);
  for(const a of visibleAreas){if(a.filled)fill(a.at,a.rx,a.rz,a.color,a.rect);ground.outline(a.at,a.rx,a.rz,a.color,a.rect);}
  if(camera instanceof T.PerspectiveCamera){
   const up=new T.Vector3(0,1,0).applyQuaternion(camera.quaternion);
   for(const sprite of labels){if(!sprite.visible)continue;const center=sprite.position.clone().project(camera),above=sprite.position.clone().add(up).project(camera),pixels=Math.abs(above.y-center.y)*viewportHeight/2;if(pixels<.001)continue;
    const target=sprite.userData.answer!==undefined,height=target?32:28,width=target?32:Math.min(220,Math.max(60,String(sprite.userData.text).length*8+20));sprite.scale.set(width/pixels,height/pixels,1);
   }
   // Labels are screen affordances: separate adjacent callouts and keep bodies visible.
   const width=viewportHeight*camera.aspect,placed:{x:number;y:number;w:number;h:number}[]=[];
   const actors=[...poses.values()].map(p=>{const at=point(p)!;at.y=(v.elevation??0)+1.2;at.project(camera);return {x:(at.x+1)*width/2,y:(1-at.y)*viewportHeight/2};});
   const roles=(session.quiz&&session.answer===null?[...session.lesson.offense,...session.lesson.defense].filter(actor=>new RegExp('\\b'+actor.label+'\\b').test(question?.q??'')):[]).flatMap(actor=>{const p=poses.get(actor.id);if(!p)return [];const at=point(p)!;at.y=(v.elevation??0)+2.65;at.project(camera);return [{x:(at.x+1)*width/2,y:(1-at.y)*viewportHeight/2-14,w:Math.min(96,Math.max(32,actor.label.length*6+14)),h:18}];});
   const visible=labels.filter(s=>s.visible).sort((a,b)=>Number(b.userData.answer!==undefined)-Number(a.userData.answer!==undefined));
   for(const sprite of visible){const original=sprite.position.clone(),projected=original.clone().project(camera),target=sprite.userData.answer!==undefined,w=target?32:Math.min(220,Math.max(60,String(sprite.userData.text).length*8+20)),h=target?32:28;
    const origin={x:(projected.x+1)*width/2,y:(1-projected.y)*viewportHeight/2};let best={x:origin.x,y:origin.y},score=Infinity;
    for(const [dx,dy] of [[0,0],[0,-34],[0,34],[-40,-34],[40,-34],[0,-68],[0,68],[-80,0],[80,0]]){
     const x=T.MathUtils.clamp(origin.x+dx,w/2+6,width-w/2-6),y=T.MathUtils.clamp(origin.y+dy,(session.quiz?(width<=600?80:86)+Math.min(viewportHeight*.24,150)+8:76)+h/2,viewportHeight-h/2-(session.quiz?(session.answer!==null?Math.min(viewportHeight*.38,275):110):frame.count>1?190:6));
     const collisions=placed.filter(p=>Math.abs(p.x-x)<(p.w+w)/2+4&&Math.abs(p.y-y)<(p.h+h)/2+4).length;
     const covered=actors.filter(p=>Math.abs(p.x-x)<w/2+7&&Math.abs(p.y-y)<h/2+8).length+roles.filter(p=>Math.abs(p.x-x)<(w+p.w)/2+3&&Math.abs(p.y-y)<(h+p.h)/2+3).length;
     const penalty=collisions*100000+covered*10000+(x-origin.x)**2+(y-origin.y)**2;if(penalty<score){score=penalty;best={x,y};}
    }
    placed.push({...best,w,h});sprite.position.set(best.x/width*2-1,1-best.y/viewportHeight*2,projected.z).unproject(camera);
    if(Math.hypot(best.x-origin.x,best.y-origin.y)>8)segment(original,sprite.position,neutral);
   }
  }
  geometry.setDrawRange(0,count/3);positions.needsUpdate=true;colors.needsUpdate=true;ground.finish();
 }
 return {root,update,pick(ndc:T.Vector2,camera:T.Camera){raycaster.setFromCamera(ndc,camera);const labelHit=raycaster.intersectObjects(targets,false)[0]?.object.userData.answer as number|undefined;if(labelHit!==undefined)return labelHit;
  const groundHit=raycaster.ray.intersectPlane(hitPlane,hitPoint);if(groundHit){const area=hitAreas.find(area=>teachingAreaContains(area,groundHit));if(area)return area.answer;}
  if(!(camera instanceof T.PerspectiveCamera))return;const width=hitHeight*camera.aspect,px=(ndc.x+1)*width/2,py=(1-ndc.y)*hitHeight/2;let best=24,bestAnswer:number|undefined;
  for(const area of hitAreas){if(!area.from)continue;const b=area.at.clone().project(camera),a=area.from?.clone().project(camera)??b,bx=(b.x+1)*width/2,by=(1-b.y)*hitHeight/2,ax=(a.x+1)*width/2,ay=(1-a.y)*hitHeight/2,dx=bx-ax,dy=by-ay,t=T.MathUtils.clamp(((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1),0,1),distance=Math.hypot(px-ax-t*dx,py-ay-t*dy);if(distance<best){best=distance;bestAnswer=area.answer;}}return bestAnswer;},dispose(){ground.dispose();squareGeometry.dispose();arrowGeometry.dispose();arrowMaterial.dispose();headGeometry.dispose();headMaterial.dispose();root.removeFromParent();geometry.dispose();material.dispose();discGeometry.dispose();fills.forEach(m=>m.material.dispose());labels.forEach(s=>{s.material.map?.dispose();s.material.dispose();});}};
}
