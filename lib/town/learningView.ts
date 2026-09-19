import * as T from 'three';
import {fieldPoint,type Venue} from './venues';
import {quizOutcomeStep,lessonPositions,type FieldSession} from './formatLessons';

export type LearningAngle='default'|'top'|'side'|'goalkeeper'|'broadcast';

/** One shot per teaching step; quizzes and Broadcast never chase the ball. */
export function createLearningView(){
 const target=new T.Vector3(),destination=new T.Vector3(),look=new T.Vector3();let key='';
 return {get target(){return look;},reset(){key='';},update(camera:T.PerspectiveCamera,venue:Venue,session:FieldSession|null,dt:number,reduced:boolean,angle:LearningAngle='default',viewport?:{width:number;height:number;mobile:boolean}){
  const mobile=viewport?.mobile??camera.aspect<.85;
  const landscape=mobile&&camera.aspect>1.25;camera.up.set(landscape&&angle==='top'?1:0,landscape&&angle==='top'?0:1,0);
  const zoom=mobile&&angle==='goalkeeper'?1.16:1;if(camera.zoom!==zoom){camera.zoom=zoom;camera.updateProjectionMatrix();}
  const broadcast=angle==='broadcast'||session?.cameraMode==='broadcast';
  const question=session?.quiz?session.lesson.questions[session.question]:undefined;
  const outcome=quizOutcomeStep(session);
  const visualStep=outcome??session?.step;
  const next=[angle,venue.id,session?.lesson.id,session?.cameraMode,broadcast?'fixed':[visualStep,session?.quiz?session.question:'watch'].join('-'),camera.aspect.toFixed(3),mobile,viewport?.height,session?.quiz&&session.answer!==null].join(':');
  if(key!==next){key=next;const points:T.Vector3[]=[];const floor=venue.elevation??0;
   const step=visualStep===undefined?undefined:session?.lesson.steps[visualStep];
   const focus=step?.cameraFocusIds??step?.focusIds??step?.highlight?.flatMap(h=>h.ids)??[];
   if(session?.quiz&&!broadcast&&focus.length){
    for(const progress of [...new Set([0,.5,1,...(step?.beats??[]).flatMap(beat=>[beat.start,(beat.start+beat.end)/2,beat.end])])]){const poses=lessonPositions(session.lesson,visualStep??session.step,progress);const chosen=focus.map(id=>poses.positions.get(id)).filter((p):p is {x:number;y:number}=>!!p);chosen.push(poses.ball);
     // Retain nearby defensive context rather than crop to isolated attackers.
     for(const actor of session.lesson.defense){const p=poses.positions.get(actor.id);if(p&&chosen.some(q=>Math.hypot(p.x-q.x,p.y-q.y)<65))chosen.push(p);}
     for(const p of chosen){const at=fieldPoint(venue,p);points.push(new T.Vector3(at.x,floor+1,at.z));}
    }
   }
   if(points.length<2)for(const x of [-1,1])for(const z of [-1,1])points.push(new T.Vector3(venue.x+x*(venue.width/2+(mobile?.3:3)),floor+1,venue.z+z*(venue.length/2+(mobile?.6:3))));
   // A held quiz must frame every neutral option, including off-ball spaces.
   if(session?.quiz&&!broadcast&&question?.interact){const interaction=question.interact,poses=lessonPositions(session.lesson,question.step,1).positions;
    const choices=[...(interaction.paths?.flatMap(p=>[p.from,p.to])??[]),...(interaction.spots?.flatMap(p=>[{x:p.x-p.r,y:p.y-p.r},{x:p.x+p.r,y:p.y+p.r}])??[]),...(interaction.zones?.flatMap(p=>[{x:p.x-p.w/2,y:p.y-p.h/2},{x:p.x+p.w/2,y:p.y+p.h/2}])??[]),...(interaction.candidates?.flatMap(p=>poses.has(p.id)?[poses.get(p.id)!]:[])??[])];
    for(const p of choices){const at=fieldPoint(venue,p);points.push(new T.Vector3(at.x,floor+1,at.z));}
   }
   const box=new T.Box3().setFromPoints(points).expandByScalar(3);
   box.getCenter(target);target.y=floor+1;
   const guided=session?.quiz&&!broadcast;
   // Honor authored teaching shots while retaining one stable orientation.
   const shots:Record<string,[number,number,number]>={sideline:[.85,1.05,.7],closeup:[.3,.85,1],wide:[.2,1.45,1],broadcast:[0,1.05,1],tactical:[.2,1.7,1],top:[0,1,.001],aerial:[.2,2.2,1]};
   const shot=guided?shots[step?.camView??'']??[.28,1.05,1]:[0,1.05,1];
   const offset=(landscape&&angle==='default'&&!session?.quiz?new T.Vector3(1,1.05,.15):angle==='broadcast'?new T.Vector3(1,.7,.65):angle==='top'?new T.Vector3(0,1,.001):angle==='side'?new T.Vector3(1,1.05,0):new T.Vector3(...shot as [number,number,number])).normalize();
   const right=new T.Vector3().crossVectors(camera.up,offset).normalize(),up=new T.Vector3().crossVectors(offset,right).normalize();
   const vertical=Math.tan(T.MathUtils.degToRad(camera.fov/2))*.8,horizontal=vertical*camera.aspect;let distance=20;
   for(const x of [box.min.x,box.max.x])for(const y of [floor,floor+3])for(const z of [box.min.z,box.max.z]){const p=new T.Vector3(x,y,z).sub(target);distance=Math.max(distance,p.dot(offset)+Math.abs(p.dot(right))/horizontal,p.dot(offset)+Math.abs(p.dot(up))/vertical);}
   destination.copy(target).addScaledVector(offset,(distance+3)*(!session&&angle==='default'?.8:1));
   if((mobile||session?.quiz)&&angle!=='goalkeeper'){
    // Fit the actual projected play, not every corner of a padded world-space box.
    // Reserve real pixel space for the navigation and bottom controls.
    const height=viewport?.height??844,top=1-2*Math.min(session?.quiz?86+Math.min(height*.24,150):80,height*.4)/height,bottom=-1+2*Math.min(session?.quiz&&session.answer!==null?280:110,height*.38)/height;
    const tan=Math.tan(T.MathUtils.degToRad(camera.fov/2)),halfWidth=tan*camera.aspect;
    const fitPoints:T.Vector3[]=[];
    for(const point of points){fitPoints.push(point.clone().setY(floor));fitPoints.push(point.clone().setY(floor+2.5));}
    const bounds=new T.Box3().setFromPoints(fitPoints);bounds.getCenter(target);target.y=floor+1;
    const local=fitPoints.map(point=>{const p=point.clone().sub(target);return{x:p.dot(right),y:p.dot(up),z:p.dot(offset)};});
    const fit=(d:number)=>{let minShift=-Infinity,maxShift=Infinity,inside=true;for(const p of local){const depth=d-p.z;if(depth<=1||Math.abs(p.x/(depth*halfWidth))>(session?.quiz ? .84 : session ? .94 : .99))inside=false;minShift=Math.max(minShift,p.y-top*depth*tan);maxShift=Math.min(maxShift,p.y-bottom*depth*tan);}return{inside:inside&&minShift<=maxShift,shift:(minShift+maxShift)/2};};
    let low=2,high=1000;for(let i=0;i<24;i++){const middle=(low+high)/2;if(fit(middle).inside)high=middle;else low=middle;}
    target.addScaledVector(up,fit(high).shift);destination.copy(target).addScaledVector(offset,high);
   }
   if(angle==='goalkeeper'){destination.set(venue.x,floor+2.15,venue.z+venue.length/2-1);target.set(venue.x,floor+1.2,venue.z-venue.length*.2);}
   if(!look.lengthSq())look.copy(target);
  }
  const blend=reduced?1:1-Math.exp(-dt*5);camera.position.lerp(destination,blend);look.lerp(target,blend);camera.lookAt(look);
 }};
}
