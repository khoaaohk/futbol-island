// Offline, manually selected CMU trials only. Never crawls/downloads the database.
// Usage: node scripts/bake-motion-reference.mjs /tmp/fi-mocap-reference
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as T from 'three';
const directory=process.argv[2];if(!directory)throw Error('Provide a directory with 09.asf, 09_01.amc, 10.asf, 10_01.amc');
const radians=Math.PI/180,unit=.0254/.45;
const rotation=a=>new T.Quaternion().setFromEuler(new T.Euler(...a.map(x=>x*radians),'ZYX'));
function skeleton(text){
 const bones={root:{children:[]}};
 for(const block of text.split(':bonedata')[1].split(':hierarchy')[0].split(/\bbegin\b/).slice(1)){
  const get=k=>block.match(new RegExp('\\b'+k+'\\s+([^\\r\\n]+)'))?.[1].trim().split(/\s+/);
  const name=get('name')[0],axis=rotation(get('axis').slice(0,3).map(Number));
  bones[name]={direction:new T.Vector3(...get('direction').map(Number)),length:Number(get('length')[0])*unit,axis,inverse:axis.clone().invert(),dof:get('dof')??[],children:[]};
 }
 for(const line of text.split(':hierarchy')[1].trim().split(/\r?\n/)){const [parent,...children]=line.trim().split(/\s+/);if(bones[parent])bones[parent].children=children;}
 return bones;
}
function frames(text){const out=[];let frame;for(const line of text.split(/\r?\n/)){if(/^\d+$/.test(line)){frame={};out.push(frame);}else if(frame){const [name,...values]=line.trim().split(/\s+/);if(name)frame[name]=values.map(Number);}}return out;}
function pose(bones,frame){
 const root=frame.root,points={root:new T.Vector3(...root.slice(0,3)).multiplyScalar(unit)},rootQ=rotation(root.slice(3)),rotations={root:rootQ};
 const visit=parent=>{for(const name of bones[parent].children){const b=bones[name],angles=[0,0,0];b.dof.forEach((d,i)=>{const axis='xyz'.indexOf(d[1]);if(axis>=0)angles[axis]=frame[name]?.[i]??0;});const q=rotations[parent].clone().multiply(b.axis).multiply(rotation(angles)).multiply(b.inverse);rotations[name]=q;points[name]=points[parent].clone().add(b.direction.clone().multiplyScalar(b.length).applyQuaternion(q));visit(name);}};visit('root');
 const facing=new T.Vector3(0,0,1).applyQuaternion(rootQ),yaw=Math.atan2(facing.x,facing.z),inv=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,1,0),-yaw);
 const local={};for(const [name,p] of Object.entries(points))local[name]=p.clone().sub(points.root).applyQuaternion(inv);
 return local;
}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function channels(p){
 const chest=p.thorax.clone().sub(p.lowerback),shoulders=p.rclavicle.clone().sub(p.lclavicle);
 const arms=side=>{const upper=p[side+'humerus'].clone().sub(p[side+'clavicle']).normalize(),lower=p[side+'radius'].clone().sub(p[side+'humerus']).normalize();return [clamp(Math.atan2(-upper.z,-upper.y),-1.4,1.4),-Math.acos(clamp(upper.dot(lower),-1,1))];};
 return [clamp(Math.atan2(chest.z,chest.y),-.5,.5),clamp(Math.atan2(-shoulders.z,Math.abs(shoulders.x)),-.6,.6),...arms('l'),...arms('r')];
}
const rows={},reports=[],drawings=[];
for(const [kind,subject,trial] of [['run','09','09_01'],['shot','10','10_01']]){
 const asf=fs.readFileSync(path.join(directory,subject+'.asf'),'utf8'),amc=fs.readFileSync(path.join(directory,trial+'.amc'),'utf8'),bones=skeleton(asf),input=frames(amc),poses=input.map(f=>pose(bones,f));
 const rate=120;let start,end,contact,mirror=false;
 if(kind==='run'){
  const peaks=[];for(let i=12;i<poses.length-12;i++){const z=poses[i].ltibia.z;if(z<poses[i-1].ltibia.z&&z<=poses[i+1].ltibia.z&&(peaks.length===0||i-peaks.at(-1)>30))peaks.push(i);}
  const pair=peaks.map((v,i)=>[v,peaks[i+1]]).find(([a,b])=>b-a>=40&&b-a<=120);if(!pair)throw Error('No clean run cycle; select manually: '+JSON.stringify({peaks,frames:poses.length,z:poses.filter((_,i)=>i%10===0).map(p=>p.ltibia.z)}));[start,end]=pair;
 }else{
  let best=-Infinity;for(let i=30;i<poses.length-60;i++)for(const side of ['l','r']){const velocity=(poses[i+1][side+'tibia'].z-poses[i-1][side+'tibia'].z)*rate/2;if(velocity>best){best=velocity;contact=i;mirror=side==='l';}}
  start=contact-30;end=contact+60;
 }
 const sample=f=>{const i=Math.floor(f),t=f-i,a=channels(poses[i]),b=channels(poses[Math.min(poses.length-1,i+1)]);return a.map((v,j)=>v+(b[j]-v)*t);};
 const data=[];for(let i=0;i<=24;i++){const phase=i/24,f=kind==='shot'?(phase<=.36?start+(contact-start)*phase/.36:contact+(end-contact)*(phase-.36)/.64):start+(end-start)*phase;let values=sample(f);if(mirror)values=[values[0],-values[1],values[4],values[5],values[2],values[3]];data.push(values);}
 // Close the run loop without a seam, and retain shape rather than captured absolute posture.
 if(kind==='run')for(let j=0;j<6;j++){const mismatch=data.at(-1)[j]-data[0][j];data.forEach((r,i)=>r[j]-=mismatch*i/24);}
 const mean=Array.from({length:6},(_,j)=>data.reduce((n,r)=>n+r[j],0)/data.length);
 rows[kind]=data.map(r=>r.map((v,j)=>Number((v-mean[j]).toFixed(5))));
 reports.push({kind,trial,frames:input.length,rate,start,end,contactProxy:contact??null,mirrorToRight:mirror,sha256:crypto.createHash('sha256').update(amc).digest('hex'),channels:['chestPitch','chestYaw','leftShoulderPitch','leftElbow','rightShoulderPitch','rightElbow'],mean});
 for(let k=0;k<6;k++){
  const index=Math.round(start+(end-start)*k/5),p=poses[index],col=k+(kind==='shot'?6:0),x=(col%6)*180,y=Math.floor(col/6)*270;
  let svg=`<g transform="translate(${x+90},${y+150})"><text x="-80" y="-200" font-size="12">${kind} frame ${index+1}</text>`;
  for(const [parent,b] of Object.entries(bones))for(const child of b.children){const a=p[parent],v=p[child];svg+=`<line x1="${a.z*95}" y1="${-a.y*95}" x2="${v.z*95}" y2="${-v.y*95}" stroke="${child.startsWith('l')?'#217d86':'#b94e37'}" stroke-width="3"/>`;}
  drawings.push(svg+'</g>');
 }
}
const output=`// Generated by scripts/bake-motion-reference.mjs; CMU Graphics Lab, NSF EIA-0196217.\n// Retargeted, demeaned upper-body curves only. See docs/body-mechanics/motion-reference-provenance.md.\nexport const MOTION_REFERENCE=${JSON.stringify(rows)} as const;\n`;
fs.writeFileSync('lib/graphics/motionReference.ts',output);
fs.writeFileSync('docs/body-mechanics/motion-reference-analysis.json',JSON.stringify(reports,null,2)+'\n');
fs.writeFileSync('/tmp/fi-mocap-reference.svg',`<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="540" viewBox="0 0 1080 540"><rect width="1080" height="540" fill="#f2f0e7"/>${drawings.join('')}</svg>`);
console.log(JSON.stringify(reports,null,2));
