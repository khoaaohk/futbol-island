import * as T from 'three';
import {BALL_GLSL_PRELUDE,BALL_GLSL_POLY} from './glsl';

/**
 * Panel audit (Oct 5 2026, user: "make sure those balls are correct in shape, patterns, and have the correct panels and number of
 * panels"). Renders a design's seam groove as an equirectangular map on the GPU, then counts the panels: the connected regions
 * between seams (longitude wraps; each pole row is one point), weighted by true sphere area so tiny islands (lace holes, valves,
 * texture flecks) don't count. Dev/audit only: scripts/audit-wc-balls.cjs drives it through window.__wcSeamProbe.
 */
export type PanelCount={panels:number;areas:number[];seamFraction:number};
const FRAG=(design:string)=>`
uniform vec2 uSize;
${BALL_GLSL_PRELUDE}
${BALL_GLSL_POLY}
${design}
void main(){vec2 uv=gl_FragCoord.xy/uSize;float lon=(uv.x*2.-1.)*PI,lat=(uv.y-.5)*PI;vec3 p=vec3(cos(lat)*sin(lon),sin(lat),cos(lat)*cos(lon));
 Surf s=design(p);gl_FragColor=vec4(clamp(s.groove,0.,1.),pow(clamp(s.col,0.,1.),vec3(1./2.2)));}`;

export function probeSeams(design:string,w=2048,h=1024):{groove:Uint8Array;color:Uint8Array;w:number;h:number}{
 const renderer=new T.WebGLRenderer({antialias:false,preserveDrawingBuffer:false});renderer.setSize(8,8);
 const target=new T.WebGLRenderTarget(w,h,{type:T.UnsignedByteType,format:T.RGBAFormat,depthBuffer:false});
 const mat=new T.ShaderMaterial({vertexShader:'void main(){gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:FRAG(design),uniforms:{uSize:{value:new T.Vector2(w,h)}}});
 const scene=new T.Scene(),quad=new T.Mesh(new T.PlaneGeometry(2,2),mat);quad.frustumCulled=false;scene.add(quad);
 renderer.setRenderTarget(target);renderer.render(scene,new T.Camera());const px=new Uint8Array(w*h*4);renderer.readRenderTargetPixels(target,0,0,w,h,px);renderer.setRenderTarget(null);
 const groove=new Uint8Array(w*h),color=new Uint8Array(w*h*3);for(let i=0;i<w*h;i++){groove[i]=px[i*4];color[i*3]=px[i*4+1];color[i*3+1]=px[i*4+2];color[i*3+2]=px[i*4+3];}
 mat.dispose();quad.geometry.dispose();target.dispose();renderer.dispose();renderer.forceContextLoss();
 return {groove,color,w,h};
}

/** Connected non-seam regions; a region counts as a panel when it covers ≥ minFrac of the sphere. */
export function countPanels(groove:Uint8Array,w:number,h:number,seamAt=128,minFrac=.004):PanelCount{
 const label=new Int32Array(w*h).fill(-1),areas:number[]=[],rowW=new Float64Array(h);let total=0,seam=0;
 for(let y=0;y<h;y++){rowW[y]=Math.cos(((y+.5)/h-.5)*Math.PI);total+=rowW[y]*w;}
 const stack:number[]=[];
 for(let s=0;s<w*h;s++){if(label[s]>=0)continue;if(groove[s]>=seamAt){seam+=rowW[(s/w)|0];continue;}
  const id=areas.length;let a=0;label[s]=id;stack.push(s);
  while(stack.length){const i=stack.pop()!,y=(i/w)|0,x=i-y*w;a+=rowW[y];
   const nb=[y*w+(x+1)%w,y*w+(x+w-1)%w];if(y>0)nb.push(i-w);if(y<h-1)nb.push(i+w);
   // A pole row is a single point: its pixels touch the pixel half way round.
   if(y===0||y===h-1)nb.push(y*w+(x+(w>>1))%w);
   for(const j of nb)if(label[j]<0&&groove[j]<seamAt){label[j]=id;stack.push(j);}}
  areas.push(a/total);}
 const big=areas.filter(a=>a>=minFrac).sort((a,b)=>b-a);
 return {panels:big.length,areas:big.map(a=>Math.round(a*1000)/10),seamFraction:Math.round(seam/total*1000)/10};
}
