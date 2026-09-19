import * as T from 'three';
/** Reuse static depth only when the light projection has stopped moving.
 * Color AND depth are copied, so dynamic shadows keep the same depth test/PCF.
 * Uses the framebuffer layout of the project's pinned Three r169 renderer.
 */
export function createStaticShadowCache(renderer:T.WebGLRenderer,scene:T.Scene,sun:T.DirectionalLight,enabled=true){
 // Cache is projection-dependent; camera travel falls back to normal rendering.
 if(!enabled)return {stats:{hits:0,builds:0,fallbacks:0},invalidate(){},setEnabled(_value:boolean){},dispose(){}};
 const gl=renderer.getContext() as WebGL2RenderingContext;
 const original=renderer.shadowMap.render.bind(renderer.shadowMap);
 const statics=scene.children.filter((o):o is T.Mesh=>o instanceof T.Mesh&&o.name.startsWith('island-chunk-')&&o.castShadow);
 const stats={hits:0,builds:0,fallbacks:0};let running=true;let cache:T.WebGLRenderTarget|null=null,key='',stable=0,valid=false;
 const invalidate=()=>{valid=false;stable=0;key='';};renderer.domElement.addEventListener('webglcontextrestored',invalidate);
 const framebuffer=(target:T.WebGLRenderTarget)=>{renderer.initRenderTarget(target);return (renderer.properties.get(target) as {__webglFramebuffer:WebGLFramebuffer}).__webglFramebuffer;};
 function copy(from:T.WebGLRenderTarget,to:T.WebGLRenderTarget){const source=framebuffer(from),destination=framebuffer(to),bound=renderer.getRenderTarget();const restore=bound?framebuffer(bound):null;
  try{gl.bindFramebuffer(gl.READ_FRAMEBUFFER,source);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,destination);gl.blitFramebuffer(0,0,from.width,from.height,0,0,to.width,to.height,gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT,gl.NEAREST);}finally{gl.bindFramebuffer(gl.READ_FRAMEBUFFER,restore);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,restore);}
 }
 renderer.shadowMap.render=(lights,cameraScene,camera)=>{
  if(!running||!renderer.shadowMap.enabled||lights.length!==1||lights[0]!==sun||typeof gl.blitFramebuffer!=='function'||renderer.shadowMap.type!==T.PCFSoftShadowMap){stats.fallbacks++;original(lights,cameraScene,camera);return;}
  const current=[...sun.position.toArray(),...sun.target.position.toArray(),...sun.shadow.camera.projectionMatrix.elements,sun.shadow.mapSize.x,sun.shadow.mapSize.y,camera.layers.mask,...camera.matrixWorld.elements,...statics.map(o=>Number(o.visible))].join(',');
  if(current!==key){key=current;stable=0;valid=false;}else stable++;
  if(stable<3){original(lights,cameraScene,camera);return;}
  if(!valid){
   const dynamic:T.Object3D[]=[];const staticSet=new Set<T.Object3D>(statics);scene.traverse(o=>{if(o.castShadow&&!staticSet.has(o)&&o.name!=='static-shadow-batch'){dynamic.push(o);o.castShadow=false;}});
   try{original(lights,cameraScene,camera);const map=sun.shadow.map;if(!map)return;if(!cache||cache.width!==map.width||cache.height!==map.height){cache?.dispose();cache=map.clone();}copy(map,cache);valid=true;stats.builds++;}finally{dynamic.forEach(o=>o.castShadow=true);}
  }
  if(!cache||!sun.shadow.map){original(lights,cameraScene,camera);return;}
  const clear=renderer.clear;statics.forEach(o=>o.castShadow=false);
  renderer.clear=(color,depth,stencil)=>{if(renderer.getRenderTarget()===sun.shadow.map&&color!==false&&depth!==false)copy(cache!,sun.shadow.map!);else clear.call(renderer,color,depth,stencil);};
  try{original(lights,cameraScene,camera);stats.hits++;}finally{renderer.clear=clear;statics.forEach(o=>o.castShadow=true);}
 };
 return{stats,invalidate,setEnabled(value:boolean){running=value;invalidate();},dispose(){renderer.shadowMap.render=original;cache?.dispose();renderer.domElement.removeEventListener('webglcontextrestored',invalidate);}};
}
