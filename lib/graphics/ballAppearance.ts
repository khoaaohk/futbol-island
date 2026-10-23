import * as T from 'three';
import {BALL_COLORS,type CharacterCustomization} from '../town/customization';
import {SPECIAL_BALL_IDS} from '../town/specialBalls';
import {drawSpecialBallSkin} from './specialBallSkins';
type BallStyle=CharacterCustomization['ball'];
/** The walking ball's six dark pentagon patches (components/Town.tsx 'player-ball'), shared with the shop snapshots
 * (components/StorePreviews.tsx) so the vending/backpack pictures show the same ball you dribble. Sized for a
 * SphereGeometry(radius,20,16): the patches sit just inside the true sphere and show through its flat facets. */
/** The equipped 'classic' skin: createBallAppearance.setStyle('classic') sets BALL_COLORS.classic (kept equal by tests/friend-ball-look.cjs; a literal so stubbed loaders work), no map, no emissive. */
export const CLASSIC_BALL={color:'#eee4c4',patch:'#344c43',roughness:.7,radius:.19,widthSegments:20,heightSegments:16,patchRadius:.078,patchOffset:.1915} as const;
const PATCH_DIRECTIONS=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]] as const;
function placePatch(o:T.Object3D,direction:readonly number[],k:number){const v=new T.Vector3(direction[0],direction[1],direction[2]);o.position.copy(v).multiplyScalar(CLASSIC_BALL.patchOffset*k);// just outside the low-poly sphere's vertices (radius .19): at .187 the facets poked through each patch as a hollow diamond (Sep 30 2026)
 o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),v);}
export function addBallPatches(ball:T.Object3D,radius:number){
 const k=radius/CLASSIC_BALL.radius,material=new T.MeshStandardMaterial({color:CLASSIC_BALL.patch,roughness:.8,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),geometry=new T.CircleGeometry(CLASSIC_BALL.patchRadius*k,5);
 for(const direction of PATCH_DIRECTIONS){const patch=new T.Mesh(geometry,material);placePatch(patch,direction,k);ball.add(patch);}
 return {dispose(){geometry.dispose();material.dispose();}};
}
/** The classic island ball (cream sphere + the six dark pentagons of addBallPatches) as ONE vertex-coloured geometry, so
 * friends' balls (lib/graphics/remoteAvatars.ts) look like the standard island ball at one draw call each. Pair it with
 * createClassicBallMaterial(). The wire carries no ball skin, so every friend shows this classic ball. */
export function createClassicBallGeometry(radius:number=CLASSIC_BALL.radius){
 const k=radius/CLASSIC_BALL.radius,sphere=new T.SphereGeometry(radius,CLASSIC_BALL.widthSegments,CLASSIC_BALL.heightSegments).toNonIndexed(),circle=new T.CircleGeometry(CLASSIC_BALL.patchRadius*k,5).toNonIndexed();
 const base=new T.Color(CLASSIC_BALL.color),dark=new T.Color(CLASSIC_BALL.patch),dummy=new T.Object3D();
 const sn=sphere.attributes.position.count,cn=circle.attributes.position.count,total=sn+cn*PATCH_DIRECTIONS.length;
 const pos=new Float32Array(total*3),nor=new Float32Array(total*3),col=new Float32Array(total*3);
 pos.set(sphere.attributes.position.array as Float32Array,0);nor.set(sphere.attributes.normal.array as Float32Array,0);
 for(let i=0;i<sn;i++)base.toArray(col,i*3);
 const v=new T.Vector3(),nm=new T.Matrix3();let o=sn;
 for(const direction of PATCH_DIRECTIONS){placePatch(dummy,direction,k);dummy.updateMatrix();nm.getNormalMatrix(dummy.matrix);
  for(let i=0;i<cn;i++,o++){v.fromBufferAttribute(circle.attributes.position,i).applyMatrix4(dummy.matrix).toArray(pos,o*3);v.fromBufferAttribute(circle.attributes.normal,i).applyMatrix3(nm).normalize().toArray(nor,o*3);dark.toArray(col,o*3);}}
 sphere.dispose();circle.dispose();
 const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('color',new T.BufferAttribute(col,3));g.computeBoundingSphere();g.name='classic-ball';return g;
}
/** White base so the vertex colours give the island ball's exact cream + pentagon tones (same roughness as Town's ballMaterial). */
export function createClassicBallMaterial(){const m=new T.MeshStandardMaterial({color:'#ffffff',roughness:CLASSIC_BALL.roughness,vertexColors:true});m.name='classic-ball';return m;}
/** Tiny, locally drawn skins shared by the store and equipped ball. Textures are
 * created only when selected, reused for that renderer, and disposed with it. */
export function createBallAppearance(material:T.MeshStandardMaterial){
 const textures=new Map<BallStyle,T.CanvasTexture>();
 function texture(style:BallStyle){
  const saved=textures.get(style);if(saved)return saved;
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const c=canvas.getContext('2d')!;
  c.fillStyle=BALL_COLORS[style];c.fillRect(0,0,128,64);
  if(drawSpecialBallSkin(c,style)!==null){/* vending special: drawn above */}
  else if(style==='frost'){
   c.strokeStyle='#649fc6';c.lineWidth=2;c.lineJoin='round';
   for(let row=-1;row<4;row++)for(let col=-1;col<5;col++){
    const x=col*32+(row%2)*16,y=row*24;c.beginPath();c.moveTo(x,y+6);c.lineTo(x+16,y);c.lineTo(x+32,y+6);c.lineTo(x+32,y+18);c.lineTo(x+16,y+24);c.lineTo(x,y+18);c.closePath();c.stroke();
    c.strokeStyle='#ecfaff';c.lineWidth=1;c.beginPath();c.moveTo(x+8,y+10);c.lineTo(x+16,y+7);c.lineTo(x+23,y+10);c.stroke();c.strokeStyle='#649fc6';c.lineWidth=2;
   }
  }else if(style==='solar'){
   c.fillStyle='#e18d29';c.fillRect(0,4,128,3);c.fillRect(0,57,128,3);
   for(const x of [24,88]){
    c.strokeStyle='#a9651d';c.lineWidth=2;
    for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.moveTo(x+Math.cos(a)*11,32+Math.sin(a)*11);c.lineTo(x+Math.cos(a)*17,32+Math.sin(a)*17);c.stroke();}
    c.fillStyle='#fff0a8';c.beginPath();c.arc(x,32,9,0,Math.PI*2);c.fill();c.stroke();
   }
  }else if(style==='cosmic'){
   c.fillStyle='#5b3b9b';c.fillRect(0,0,128,64);
   for(let i=0;i<22;i++){
    const x=(i*47+11)%128,y=(i*29+7)%64,r=i%4===0?3:1.4;c.fillStyle=i%3?'#ead9ff':'#bba4ff';c.beginPath();
    for(let n=0;n<8;n++){const a=n*Math.PI/4,rr=n%2?r*.25:r;n?c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):c.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fill();
   }
   c.strokeStyle='#a889e0';c.lineWidth=1.5;c.beginPath();c.ellipse(64,32,22,8,-.35,0,Math.PI*2);c.stroke();
  }
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.wrapS=T.RepeatWrapping;map.name='ball-skin-'+style;textures.set(style,map);return map;
 }
 let current:BallStyle|undefined;
 return{setStyle(style:BallStyle){
  if(style===current)return;current=style;const special=SPECIAL_BALL_IDS.has(style),patterned=special||style==='frost'||style==='solar'||style==='cosmic';
  material.map=patterned?texture(style):null;material.color.set(patterned?'#ffffff':BALL_COLORS[style]);
  material.emissive.set(special?'#000000':style==='neon'?'#527627':style==='frost'?'#305770':style==='solar'?'#8b5116':style==='cosmic'?'#4b287b':'#000000');
  material.emissiveIntensity=style==='cosmic'?.2:.25;material.roughness=style==='frost'?.4:.7;material.needsUpdate=true;
 },dispose(){for(const map of textures.values())map.dispose();textures.clear();material.map=null;current=undefined;}};
}
