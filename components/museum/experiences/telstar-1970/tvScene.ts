import * as T from 'three';
import {createBallMaterial} from '@/lib/museum/wcBalls/ballViewer';
import telstarGlsl from '@/lib/museum/wcBalls/designs/1970-telstar';

/**
 * The 1970 broadcast (telstar-1970 experience, Oct 5 2026): one ball on a mown pitch, filmed by a "TV camera". Loaded lazily
 * the first time the TV is switched on.
 *  - Ball: the gallery's exact 1970 Telstar shader (read-only import) or an 18-panel brown leather ball (the shared
 *    leatherStrips helper), both through ballViewer.createBallMaterial so they share the studio shading.
 *  - Shots: 'wide' (a broadcast camera behind the touchline, ~23 m of pitch in view: a real ball is only a few pixels) and
 *    'close' (the ball fills a third of the screen, held in the air so you can watch its spin).
 *  - Heat: the picture renders at a capped, TV-like resolution (≤ 560 px wide, pixel ratio 1; the browser's soft upscale is the
 *    CRT look), only on demand: the loop runs while the ball moves or is held and sleeps the moment it stops, and while the tab
 *    is hidden. dispose() frees the renderer, geometries and materials.
 */
export type BallKind='leather'|'telstar';
export type Shot='wide'|'close';
export type TvScene={
 setBall(k:BallKind):void;setShot(s:Shot):void;
 /** Wide shot: roll the ball to a new spot. */
 pass():void;
 /** Close-up: spin the ball about the vertical, front surface moving right (1) or left (−1); onSpinEnd fires when it stops. */
 spin(dir:-1|1):void;
 grab():void;drag(dx:number,dy:number):void;release(vx:number,vy:number):void;
 setPaused(p:boolean):void;dispose():void;
};

/** The old brown leather ball: 18 panels in the volleyball layout, no laces (the shared helper from the ball gallery). */
const LEATHER_GLSL=/* glsl */`Surf design(vec3 p){return leatherStrips(p,hex(0xa86f3c),3.,false);}`;

const PITCH_VERT=/* glsl */`varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`;
/** Mown stripes (5.5 m), the halfway line, centre circle (9.15 m) and spot, grass noise, and the ball's soft contact shadow. */
const PITCH_FRAG=/* glsl */`
uniform vec3 uBall;uniform float uR;varying vec3 vW;
float h2(vec2 p){p=fract(p*vec2(.1031,.103));p+=dot(p,p.yx+33.33);return fract((p.x+p.y)*p.x);}
float n2(vec2 x){vec2 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x),f.y);}
float line(float d,float w){float a=fwidth(d)*.8+1e-4;return 1.-smoothstep(w-a,w+a,abs(d));}
void main(){
 vec2 p=vW.xz;float stripe=step(.5,fract(p.x/11.));
 vec3 c=mix(vec3(.105,.205,.06),vec3(.135,.25,.075),stripe);
 c*=.9+.16*n2(p*3.)+.08*n2(p*.4);
 float l=max(line(p.x,.06),line(length(p)-9.15,.06));l=max(l,1.-smoothstep(.1,.13,length(p)));
 l=max(l,line(p.y+34.,.06));c=mix(c,vec3(.78),l*.92);
 if(p.y<-35.){float boards=step(-36.2,p.y);vec3 crowd=vec3(.05,.045,.04)+vec3(.2,.17,.14)*h2(floor(p*vec2(3.,1.5)))*smoothstep(-36.,-40.,p.y);c=mix(crowd,vec3(.75,.72,.6)*(.6+.4*step(.5,fract(p.x/6.))),boards);}
 float d=length(p-uBall.xz),lift=uBall.y-uR;float r=uR*(1.05+lift*2.2);
 c*=1.-.45/(1.+lift*6.)*(1.-smoothstep(r*.15,r,d));
 gl_FragColor=vec4(c,1.);
 #include <colorspace_fragment>
}`;

export function createTvScene(canvas:HTMLCanvasElement,opts:{reducedMotion?:boolean;onSpinEnd?:()=>void;onMove?:()=>void}={}):TvScene{
 const reduced=!!opts.reducedMotion;
 const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'low-power'});
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.setPixelRatio(1);renderer.setClearColor(0x0b0d0a,1);
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(30,4/3,.05,200);
 const R=.11;// a size 5 ball is about 22 cm across
 const pitchGeo=new T.PlaneGeometry(260,220);pitchGeo.rotateX(-Math.PI/2);
 const pitchMat=new T.ShaderMaterial({vertexShader:PITCH_VERT,fragmentShader:PITCH_FRAG,uniforms:{uBall:{value:new T.Vector3(0,R,0)},uR:{value:R}}});
 const pitch=new T.Mesh(pitchGeo,pitchMat);scene.add(pitch);
 const ballGeo=new T.SphereGeometry(1,96,64);
 const mats:Record<BallKind,T.ShaderMaterial>={telstar:createBallMaterial(telstarGlsl),leather:createBallMaterial(LEATHER_GLSL)};
 const ball=new T.Mesh(ballGeo,mats.telstar);ball.scale.setScalar(R);scene.add(ball);

 let panning=false,shot:Shot='wide',frame=0,last=0,paused=false,disposed=false,held=false,spinning=false;
 const pos=new T.Vector3(0,R,0),q=new T.Quaternion().setFromEuler(new T.Euler(.4,-.6,.1)),omega=new T.Vector3(),tmpQ=new T.Quaternion(),tmpV=new T.Vector3(),inv=new T.Quaternion();
 let roll:{from:T.Vector3;to:T.Vector3;t:number;dur:number;prev:number}|null=null;

 // Small screens get a tighter wide shot, so the ball is a few pixels on a phone too (not one).
 let pan=0,wideK=1;
 function place(){ball.position.copy(pos);pitchMat.uniforms.uBall.value.copy(pos);
  if(shot==='wide'){camera.fov=24;camera.position.set(pan,7.5*wideK,18*wideK);camera.lookAt(pan,0,0);}
  else{camera.fov=26;camera.position.set(pos.x,pos.y+.42,pos.z+1.15);camera.lookAt(pos.x,pos.y-.03,pos.z);}
  camera.updateProjectionMatrix();}
 function resize(){const w=canvas.clientWidth||400,h=canvas.clientHeight||300;wideK=Math.max(.6,Math.min(1,w/700));const k=Math.min(1,560/w);renderer.setSize(Math.max(80,Math.round(w*k)),Math.max(60,Math.round(h*k)),false);camera.aspect=w/h;place();wake();}

 function step(now:number){
  frame=0;if(disposed||paused)return;const dt=Math.min(.05,last?(now-last)/1000:1/60);last=now;
  if(roll){roll.t+=dt;const k=Math.min(1,roll.t/roll.dur),e=1-Math.pow(1-k,3);const np=tmpV.lerpVectors(roll.from,roll.to,e);const moved=e-roll.prev;roll.prev=e;
   const dir=new T.Vector3().subVectors(roll.to,roll.from);const dist=dir.length()*moved;dir.y=0;
   if(dist>0&&dir.lengthSq()>0){dir.normalize();const axis=new T.Vector3(0,1,0).cross(dir).normalize();tmpQ.setFromAxisAngle(axis,dist/R);q.premultiply(tmpQ);}
   pos.copy(np);if(k>=1)roll=null;}
  if(!held){const decay=spinning?(reduced?2.6:1.8):3;omega.multiplyScalar(Math.exp(-dt*decay));}
  const speed=omega.length();
  if(speed>1e-4){tmpQ.setFromAxisAngle(tmpV.copy(omega).normalize(),speed*dt);q.premultiply(tmpQ);}
  if(spinning&&speed<.18){spinning=false;omega.set(0,0,0);opts.onSpinEnd?.();}
  else if(!spinning&&!held&&speed<.01)omega.set(0,0,0);
  pan+=(pos.x*.85-pan)*Math.min(1,dt*3);if(Math.abs(pos.x*.85-pan)>.01&&!roll)panning=true;else panning=false;
  ball.quaternion.copy(q);place();
  // A touch of motion blur (≈ 1/40 s shutter) on the spinning ball, in ball-local space.
  const blur=Math.min(.9,speed/40);for(const m of Object.values(mats)){m.uniforms.uBlur.value=blur>.03?blur:0;if(blur>.03){inv.copy(q).invert();m.uniforms.uBlurAxis.value.copy(omega).normalize().applyQuaternion(inv);}}
  renderer.render(scene,camera);
  if(roll||held||spinning||panning||omega.lengthSq()>0)frame=requestAnimationFrame(step);else last=0;
 }
 function wake(){if(!frame&&!disposed&&!paused&&!document.hidden){last=0;frame=requestAnimationFrame(step);}}
 const vis=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();};document.addEventListener('visibilitychange',vis);
 const ro=new ResizeObserver(resize);ro.observe(canvas);
 place();resize();

 return {
  setBall(k){ball.material=mats[k];wake();},
  setShot(s){shot=s;roll=null;pos.y=s==='close'?R+.2:R;omega.set(0,0,0);spinning=false;wake();},
  pass(){if(shot!=='wide')return;const to=new T.Vector3((Math.random()*2-1)*7,R,(Math.random()*2-1)*3.5);if(to.distanceTo(pos)<4)to.x=pos.x>0?pos.x-6:pos.x+6;
   to.x=Math.max(-8,Math.min(8,to.x));roll={from:pos.clone(),to,t:0,dur:reduced?.7:Math.min(2.6,1.1+to.distanceTo(pos)*.12),prev:0};opts.onMove?.();wake();},
  spin(dir){if(shot!=='close')return;held=false;const tilt=(Math.random()-.5)*.35;omega.set(Math.sin(tilt)*.4,dir*(reduced?6:11),Math.sin(tilt));spinning=true;wake();},
  grab(){held=true;spinning=false;omega.set(0,0,0);wake();},
  drag(dx,dy){const k=2.6/(canvas.clientHeight||300)*1.6;tmpQ.setFromAxisAngle(tmpV.set(0,1,0),dx*k);q.premultiply(tmpQ);tmpQ.setFromAxisAngle(tmpV.set(1,0,0),dy*k);q.premultiply(tmpQ);opts.onMove?.();wake();},
  release(vx,vy){held=false;const k=2.6/(canvas.clientHeight||300)*1.6;omega.set(vy*k,vx*k,0);if(omega.length()>14)omega.setLength(14);wake();},
  setPaused(p){paused=p;if(p){cancelAnimationFrame(frame);frame=0;}else wake();},
  dispose(){disposed=true;cancelAnimationFrame(frame);frame=0;ro.disconnect();document.removeEventListener('visibilitychange',vis);
   for(const m of Object.values(mats))m.dispose();pitchMat.dispose();pitchGeo.dispose();ballGeo.dispose();renderer.dispose();renderer.forceContextLoss();},
 };
}
