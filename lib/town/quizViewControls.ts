import * as T from 'three';

/** Canvas-only lesson and quiz gestures. Restore the authored pose before its next update. */
export function createQuizViewControls(canvas:HTMLCanvasElement,camera:T.PerspectiveCamera,active:()=>boolean){
 const pointers=new Map<number,{x:number;y:number}>();
 const basePosition=new T.Vector3(),baseRotation=new T.Quaternion();
 let saved=false,baseZoom=1,zoom=1,panX=0,panY=0,moved=false,lastSpan=0,azimuth=0,displayAzimuth=0,spinVelocity=0,lastMove=0,tilt=0,basePhi=Math.PI/4,context='',suppressUntil=0;
 const reset=()=>{zoom=1;panX=0;panY=0;azimuth=0;displayAzimuth=0;spinVelocity=0;tilt=0;};
 const span=()=>{const p=[...pointers.values()];return p.length===2?Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y):0;};
 type Gesture=Pick<PointerEvent,'pointerId'|'clientX'|'clientY'|'button'|'shiftKey'|'pointerType'|'type'|'preventDefault'>;
 const down=(e:Gesture)=>{if(!active()||e.button>0)return;if(!pointers.size)moved=false;spinVelocity=0;lastMove=performance.now();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(e.pointerType!=='touch')canvas.setPointerCapture(e.pointerId);lastSpan=span();if(pointers.size>1)moved=true;};
 const move=(e:Gesture)=>{const p=pointers.get(e.pointerId);if(!p||!active())return;const dx=e.clientX-p.x,dy=e.clientY-p.y;if(!moved&&Math.hypot(dx,dy)<6)return;moved=true;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===1&&!e.shiftKey){const now=performance.now(),elapsed=Math.max(1/120,(now-lastMove)/1000),delta=-dx*.007;azimuth+=delta;spinVelocity=T.MathUtils.lerp(spinVelocity,T.MathUtils.clamp(delta/elapsed,-4,4),.5);lastMove=now;tilt=T.MathUtils.clamp(basePhi+tilt-dy*Math.PI/Math.max(240,canvas.clientHeight),.05,Math.PI*.49)-basePhi;}else{spinVelocity=0;panX=T.MathUtils.clamp(panX-dx/pointers.size/canvas.clientHeight/zoom,-1.5,1.5);panY=T.MathUtils.clamp(panY+dy/pointers.size/canvas.clientHeight/zoom,-1.5,1.5);const next=span();if(lastSpan>0)zoom=T.MathUtils.clamp(zoom*next/lastSpan,.7,3);lastSpan=next;}e.preventDefault();};
 const up=(e:Gesture)=>{if(!pointers.has(e.pointerId))return;if(e.type==='pointercancel'||e.type==='lostpointercapture'||performance.now()-lastMove>100)spinVelocity=0;if(moved)suppressUntil=performance.now()+350;pointers.delete(e.pointerId);lastSpan=span();if(e.pointerType!=='touch'&&canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);};
 const wheel=(e:WheelEvent)=>{if(!active())return;e.preventDefault();zoom=T.MathUtils.clamp(zoom*Math.exp(-e.deltaY*.0015),.7,3);};
 // Native non-passive touch movement keeps iOS gestures on the pitch. Mouse/pen
 // retain pointer capture; ignoring touch pointers avoids applying each move twice.
 const pointerDown=(e:PointerEvent)=>{if(e.pointerType!=='touch')down(e);};
 const pointerMove=(e:PointerEvent)=>{if(e.pointerType!=='touch')move(e);};
 const pointerUp=(e:PointerEvent)=>{if(e.pointerType!=='touch')up(e);};
 const touch=(event:TouchEvent)=>{if(!active()&&event.type==='touchstart')return;for(const t of Array.from(event.changedTouches)){const e:Gesture={pointerId:t.identifier,clientX:t.clientX,clientY:t.clientY,button:0,shiftKey:false,pointerType:'touch',type:event.type==='touchcancel'?'pointercancel':event.type,preventDefault:()=>{if(event.cancelable)event.preventDefault();}};if(event.type==='touchstart')down(e);else if(event.type==='touchmove')move(e);else up(e);}};
 const cancel=()=>{pointers.clear();spinVelocity=0;lastSpan=0;};
 canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('lostpointercapture',pointerUp);canvas.addEventListener('wheel',wheel,{passive:false});
 for(const event of ['touchstart','touchmove','touchend','touchcancel'] as const)canvas.addEventListener(event,touch,{passive:false});
 window.addEventListener('blur',cancel);
 return {reset,blocksSelection:()=>moved||performance.now()<suppressUntil,
  restore(){if(saved){camera.position.copy(basePosition);camera.quaternion.copy(baseRotation);camera.zoom=baseZoom;camera.updateProjectionMatrix();saved=false;}},
  apply(key:string,target:T.Vector3,dt=1/60,reduced=false){if(key!==context){context=key;reset();}if(!active())return;const frameDt=Math.min(.05,Math.max(0,dt));if(reduced)spinVelocity=0;if(!pointers.size&&Math.abs(spinVelocity)>.01){const decay=Math.exp(-3.5*frameDt);azimuth+=spinVelocity*(1-decay)/3.5;spinVelocity*=decay;}else if(!pointers.size)spinVelocity=0;displayAzimuth=reduced?azimuth:T.MathUtils.damp(displayAzimuth,azimuth,22,frameDt);basePosition.copy(camera.position);baseRotation.copy(camera.quaternion);baseZoom=camera.zoom;saved=true;const offset=basePosition.clone().sub(target),spherical=new T.Spherical().setFromVector3(offset);basePhi=spherical.phi;spherical.theta+=displayAzimuth;spherical.phi=T.MathUtils.clamp(spherical.phi+tilt,.05,Math.PI*.49);if(displayAzimuth||tilt){camera.position.copy(target).add(offset.setFromSpherical(spherical));camera.lookAt(target);}const distance=Math.max(1,basePosition.distanceTo(target)),scale=2*distance*Math.tan(T.MathUtils.degToRad(camera.fov/2));camera.position.addScaledVector(new T.Vector3(1,0,0).applyQuaternion(camera.quaternion),panX*scale).addScaledVector(new T.Vector3(0,1,0).applyQuaternion(camera.quaternion),panY*scale);camera.zoom=baseZoom*zoom;camera.updateProjectionMatrix();camera.updateMatrixWorld();},
  dispose(){canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('lostpointercapture',pointerUp);canvas.removeEventListener('wheel',wheel);pointers.clear();for(const event of ['touchstart','touchmove','touchend','touchcancel'] as const)canvas.removeEventListener(event,touch);window.removeEventListener('blur',cancel);}
 };
}
