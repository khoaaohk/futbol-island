import * as T from 'three';
/** Skip hidden groups only during the renderer's scene refresh, never explicit rig/bounds updates. */
export function createHiddenTransformGate(scene:T.Scene){
 const originalScene=scene.updateMatrixWorld,entries:{node:T.Object3D;original:T.Object3D['updateMatrixWorld'];own:boolean}[]=[];
 let updating=false,enabled=true;const stats={skipped:0};
 scene.traverse(node=>{if(node===scene||!node.isObject3D||!(node instanceof T.Group))return;const original=node.updateMatrixWorld,own=Object.prototype.hasOwnProperty.call(node,'updateMatrixWorld');let slept=false;entries.push({node,original,own});node.updateMatrixWorld=function(force){if(updating&&enabled&&!this.visible){slept=true;stats.skipped++;return;}const refresh=force||slept;slept=false;original.call(this,refresh);};});
 scene.updateMatrixWorld=function(force){stats.skipped=0;updating=true;try{originalScene.call(this,force);}finally{updating=false;}};
 return {stats,setEnabled(value:boolean){enabled=value;},dispose(){scene.updateMatrixWorld=originalScene;for(const {node,original,own} of entries){if(own)node.updateMatrixWorld=original;else delete (node as Partial<T.Object3D>).updateMatrixWorld;}}};
}
