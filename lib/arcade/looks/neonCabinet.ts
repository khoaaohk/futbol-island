import * as T from 'three';
import {neonColor,neonEmissive} from '../neonPalette';
import type {ArcadeStageKit,ArcadeEnvironment,ArcadeStageLook} from './stageLook';

/** The look all five games shipped with before the per-game split (moved verbatim from arcadeStage.ts, Nov 10 2026).
 * COORDINATOR FILE: game builders do not edit this. To diverge, override fields (or replace `environment`) in your own
 * lib/arcade/looks/<game>.ts. */
export function neonCabinetEnvironment(kit:ArcadeStageKit):ArcadeEnvironment{
 const {scene,mat,box,sphere,cylinder}=kit;
 const paper=document.createElement('canvas');paper.width=paper.height=128;const paint=paper.getContext('2d')!;paint.fillStyle='#fff';paint.fillRect(0,0,128,128);for(let i=0;i<2200;i++){paint.fillStyle=`rgba(74,64,38,${.035+Math.random()*.045})`;paint.fillRect(Math.random()*128,Math.random()*128,1,1);}const grain=new T.CanvasTexture(paper);grain.wrapS=grain.wrapT=T.RepeatWrapping;grain.repeat.set(20,20);grain.colorSpace=T.SRGBColorSpace;
 const ground=box(0,-.4,-8,90,.6,100,'#dbbd8e',scene);ground.castShadow=false;
 const grid=new T.GridHelper(100,40,'#533369','#202443');grid.position.y=-.095;scene.add(grid);(ground.material as T.MeshStandardMaterial).map=grain;
 // Tall scenery stays outside the playable space. Reused geometry/materials.
 const scenery=new T.Group();scene.add(scenery);for(const side of[-1,1])for(let i=0;i<5;i++){const x=side*(11+(i%2)*2),z=-34+i*14;
 cylinder(x,1.5,z,.15,3,'#916949',scenery);for(let j=0;j<5;j++){const leaf=sphere(x+Math.cos(j*1.256)*.72,3.1,z+Math.sin(j*1.256)*.72,1,'#307967',scenery);leaf.scale.set(1.35,.13,.43);leaf.rotation.y=-j*1.256;leaf.rotation.z=.22;}
 box(x+side*3,1.3,z+4,3.5,2.6,3,'#d68f74',scenery);box(x+side*3,2.65,z+4,3.8,.2,3.3,'#eacb9a',scenery);for(const dx of[-.9,.9])box(x+side*3+dx,1.5,z+5.52,.6,.75,.08,'#36566a',scenery);box(x+side*3,.65,z+5.55,.65,1.3,.1,'#578b81',scenery);box(x+side*3,2.25,z+5.75,3.6,.14,.65,'#edbd65',scenery);
 if(i%2===0){const lx=side*8.8,lz=z+3;cylinder(lx,2.2,lz,.065,4.4,'#324f56',scenery);box(lx,4.45,lz,.42,.24,.42,'#ffe3a0',scenery);const material=mat('#ffe3a0');material.emissive.set('#ffc46e');}
 }
 return{scenery,dispose(){grain.dispose();}};
}

export const NEON_CABINET_LOOK:Omit<ArcadeStageLook,'id'>={
 renderer:{antialias:true,powerPreference:'low-power',pixelRatioCap:{mobile:1.5,desktop:2},shadows:true,shadowType:T.PCFSoftShadowMap,toneMapping:T.ACESFilmicToneMapping,exposure:.95},
 background:'#080b1b',
 fog:{color:'#080b1b',near:52,far:115},
 camera:{fov:38,near:.1,far:180},
 hemi:{sky:'#b7eaff',ground:'#34204a',intensity:1.55},
 sun:{color:'#d8d5ff',intensity:2.1,position:[-14,24,10],shadowMapSize:{mobile:1024,desktop:2048},frustum:{left:-24,right:24,top:34,bottom:-24,near:1,far:90},normalBias:.035,bias:-.0002,radius:3},
 surface:{color:neonColor,emissive:neonEmissive,roughness:.65,emissiveIntensity:.7},
 ball:{base:'#fff8e3',patch:'#294c49'},
 sparks:{color:'#ffdd82'},
 environment:neonCabinetEnvironment,
};
