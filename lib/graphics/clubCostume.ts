import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {getIslandCostume} from '../town/islandCostumes';
import {getCostume} from '../town/costumes';

type Anchors={head:T.Group;torso:T.Group;pelvis:T.Group;arms:{shoulder:T.Group;elbow:T.Group}[];legs:{hip:T.Group;knee:T.Group;ankle:T.Group}[]};
/** Club mascot onesies teach club culture; the original character stays under the suit.
 * Static pieces are merged by joint/material: no textures or additional update loop. */
export function createClubCostume(id:string,playerId:string,anchors:Anchors){
 const costume=id==='matchday-fox'?{animal:'fox' as const}:getCostume(id);if(!costume)return undefined;
 const {animal}=costume;const {color,accent,kitColor}=getIslandCostume(id);
 const colorfulKit=kitColor!==0x258b7a;
 const colors=[color,accent,kitColor,0x242a28,0xfff0d4];
 const materials=colors.map(color=>new T.MeshStandardMaterial({color,roughness:.86}));
 const buckets=new Map<T.Group,Map<number,T.BufferGeometry[]>>(),groups:T.Group[]=[],geometries:T.BufferGeometry[]=[];
 const matrix=new T.Matrix4(),quaternion=new T.Quaternion();
 function shape(anchor:T.Group,geometry:T.BufferGeometry,c:number,x:number,y:number,z:number,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){
  const g=geometry.index?geometry.toNonIndexed():geometry;if(g!==geometry)geometry.dispose();
  quaternion.setFromEuler(new T.Euler(rx,ry,rz));matrix.compose(new T.Vector3(x,y,z),quaternion,new T.Vector3(sx,sy,sz));g.applyMatrix4(matrix);
  let bucket=buckets.get(anchor);if(!bucket){bucket=new Map();buckets.set(anchor,bucket);}const list=bucket.get(c)??[];list.push(g);bucket.set(c,list);
 }
 const ball=(a:T.Group,c:number,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>shape(a,new T.SphereGeometry(1,10,7),c,x,y,z,sx,sy,sz);
 const box=(a:T.Group,c:number,x:number,y:number,z:number,w:number,h:number,d:number,rz=0)=>shape(a,new T.BoxGeometry(w,h,d),c,x,y,z,1,1,1,0,0,rz);
 const cone=(a:T.Group,c:number,x:number,y:number,z:number,r:number,h:number,rx=0,rz=0)=>shape(a,new T.ConeGeometry(r,h,7),c,x,y,z,1,1,1,rx,0,rz);
 function link(a:T.Group,c:number,start:number[],end:number[],radius:number){const p=new T.Vector3(...start),q=new T.Vector3(...end),dir=q.clone().sub(p);const geo=new T.CylinderGeometry(radius*.7,radius,dir.length(),7);geo.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),dir.normalize()));shape(a,geo,c,(p.x+q.x)/2,(p.y+q.y)/2,(p.z+q.z)/2);}
 const {head,torso,pelvis}=anchors;
 // A complete plush head shell encloses the original head and nose from every angle.
 // It stays attached to the animated head; unequipping reveals the untouched character.
 // Species are readable from the outline, before color or face details.
 const skull:Partial<Record<typeof animal,[number,number,number]>>={
  wildcat:[.225,.218,.205],puma:[.223,.225,.224],lynx:[.238,.211,.20],
  fox:[.196,id==='matchday-fox'?.259:.229,.207],wolf:[.213,id==='cerezo'?.251:.227,.226],
  bear:[.24,.229,.22],lion:[.215,.225,.211],dog:[.201,.245,.225],pig:[.236,.22,.214],
  liverbird:[.182,.259,.21],eagle:[.229,.222,.216],vulture:[.174,.26,.19],rooster:[.181,.231,.204],
  zebra:[.175,.265,.222],giraffe:[.18,.265,.226],deer:[.183,.241,.216],goat:[.199,.242,.212],
  dinosaur:[.241,.23,.231],orca:[id==='nagoya'?.245:.231,id==='nagoya'?.214:.26,.247],bee:[.229,.215,.21]
 };
 const [skullX,skullY,skullZ]=skull[animal]??[.211,.244,.21];
 ball(head,animal==='eagle'?4:0,0,.02,0,skullX,skullY,skullZ);
 // The onesie follows the same shoulders, knees, and ankles as the football rig.
 shape(torso,new T.CylinderGeometry(.245,.17,.45,10),0,0,.23,0,1,1,.72);
 box(torso,2,0,.28,.169,.33,.28,.026);box(torso,1,0,.09,.135,.24,.065,.022);
 // Shared island training scarf and football patch; no club kit, crest or initials.
 shape(torso,new T.TorusGeometry(.16,.025,5,10),2,0,.46,0,1,1,1,Math.PI/2);
 box(torso,2,.10,.36,.19,.065,.17,.03,-.3);
 // A simple football seam detail is deliberately crest-free.
 ball(torso,4,0,.285,.191,.055,.055,.018);box(torso,3,0,.285,.212,.025,.025,.006);
 for(let i=0;i<2;i++){
  const side=i===0?-1:1,{shoulder,elbow}=anchors.arms[i],{hip,knee,ankle}=anchors.legs[i];
  ball(shoulder,colorfulKit?2:0,0,-.075,0,.111,.137,.11);
  shape(shoulder,new T.CylinderGeometry(.085,.069,.24,8),0,0,-.14,0);
  shape(elbow,new T.CylinderGeometry(.073,.056,.25,8),0,0,-.13,0);
  ball(elbow,1,0,-.28,.005,.069,.079,.063);
  shape(hip,new T.CylinderGeometry(.116,.087,.42,8),colorfulKit?2:0,0,-.205,0);
  shape(knee,new T.CylinderGeometry(.086,.064,.39,8),0,0,-.2,0);
  ball(ankle,1,0,-.025,.07,.094,.075,.17);
  for(const offset of [-.04,0,.04])box(ankle,3,offset,-.005,.206,.009,.027,.015);
  if(animal==='zebra'){for(const y of [-.07,-.17,-.27])box(hip,3,0,y,.092,.18,.036,.027,side*.12);for(const y of [-.06,-.16])box(elbow,3,0,y,.064,.13,.027,.016);}
  if(animal==='giraffe'){for(const y of [-.1,-.25])ball(hip,1,side*.02,y,.097,.043,.055,.012);ball(shoulder,1,0,-.075,.11,.047,.053,.012);}
 }
 const bird=['liverbird','eagle','vulture','rooster'].includes(animal);
 const cat=['wildcat','fox','lynx','puma','wolf'].includes(animal);
 if(cat){for(const side of [-1,1]){
  if(animal==='puma'){
   // Cougars have low, rounded ears, not a house-cat silhouette.
   ball(head,3,side*.172,.231,-.015,.071,.077,.048);
   ball(head,0,side*.172,.237,.02,.047,.05,.027);
  }else{
   const tall=animal==='fox'?(id==='matchday-fox'?.26:.235):animal==='wolf'?(id==='cerezo'?.25:.19):.17;
   const spread=animal==='lynx'?.184:animal==='wildcat'?.157:.14;
   cone(head,animal==='fox'?3:0,side*spread,.267,-.015,.084,tall,0,-side*(animal==='lynx'?.42:.16));
   cone(head,1,side*spread,.273,.028,.045,tall*.66,0,-side*.16);
  }
 }
  if(animal==='lynx')for(const side of [-1,1]){
   cone(head,3,side*.211,.374,-.02,.018,.135,0,-side*.3);
   // Wide cheek ruffs distinguish the lynx even in a small preview.
   cone(head,1,side*.217,-.018,.047,.068,.14,Math.PI,-side*.65);
  }
  if(animal==='wildcat')for(const side of [-1,1])for(let i=0;i<2;i++)box(head,3,side*.151,.16-i*.055,.137,.055,.018,.018,side*.45);
  if(animal==='wolf')for(const side of [-1,1])cone(head,1,side*(id==='roma'?.198:.175),-.08,-.012,.068,id==='roma'?.2:.135,Math.PI,-side*.6);
 }
 if(['bear','lion','pig','dog'].includes(animal))for(const side of [-1,1]){
  if(animal==='dog'){
   ball(head,1,side*.202,.06,-.015,.065,.218,.075);
   ball(head,0,side*.205,-.052,.032,.051,.093,.039);
  }else if(animal==='pig'){
   cone(head,0,side*.171,.244,-.013,.098,.153,0,-side*.8);
   cone(head,1,side*.185,.248,.022,.056,.095,0,-side*.8);
  }else{ball(head,0,side*(animal==='bear'?.19:.16),.254,-.015,.077,.082,.055);ball(head,1,side*(animal==='bear'?.19:.16),.259,.03,.037,.043,.016);}
 }
 if(animal==='lion'){
  // Dune has a angular sunburst; Canopy has a broad, swept mane.
  for(let i=0;i<10;i++){
   const angle=i/10*Math.PI*2;
   if(id==='chelsea')cone(head,1,Math.cos(angle)*.235,Math.sin(angle)*.23+.04,-.055,.088,.175,0,angle-Math.PI/2);
   else ball(head,1,Math.cos(angle)*.24,Math.sin(angle)*.207+.057,-.07,.10,.085,.095);
  }
 }
 if(['goat','deer','giraffe','zebra'].includes(animal)){
  for(const side of [-1,1]){ball(head,0,side*(animal==='zebra'?.124:.195),animal==='zebra'?.313:.239,-.01,animal==='zebra'?.055:.097,animal==='zebra'?.117:.049,.054);ball(head,1,side*(animal==='zebra'?.124:.195),animal==='zebra'?.325:.249,.031,animal==='zebra'?.026:.056,animal==='zebra'?.074:.023,.015);}
  if(animal==='zebra'){for(let i=0;i<4;i++)box(head,3,0,.235,-.13+i*.055,.043,.09,.037);for(const side of [-1,1])box(head,3,side*.13,.17,.112,.035,.09,.025,side*.35);}
  else for(const side of [-1,1]){
   const height=animal==='deer'?.37:animal==='giraffe'?.25:.21;
   if(animal==='goat'){link(head,1,[side*.1,.24,-.035],[side*.139,.385,-.087],.028);link(head,1,[side*.139,.385,-.087],[side*.13,.45,-.145],.02);}
   else link(head,1,[side*.1,.24,-.035],[side*.14,.24+height,-.09],.026);
   if(animal==='giraffe'){ball(head,1,side*.14,.49,-.09,.043,.04,.036);ball(head,1,side*.09,.2,.12,.04,.027,.012);}
   if(animal==='deer')for(let i=0;i<2;i++)link(head,1,[side*(.12+i*.01),.36+i*.11,-.06],[side*(.24+i*.025),.44+i*.1,-.035],.019);
  }
  if(animal==='goat')cone(head,1,0,-.22,.045,.05,.14,Math.PI);
 }
 if(bird){

  for(let i=0;i<2;i++){const shoulder=anchors.arms[i].shoulder,side=i===0?-1:1;for(let feather=0;feather<3;feather++)ball(shoulder,feather%2?1:0,side*(.07+feather*.035),-.15-feather*.08,-.05,.07,.19,.055);}
  if(animal==='rooster')for(let i=0;i<3;i++)ball(head,1,0,.29+i%2*.035,-.085+i*.065,.037,.1,.045);
  if(animal==='vulture'){shape(head,new T.TorusGeometry(.17,.046,5,12),4,0,-.13,-.015,1,1,1,Math.PI/2);}
  if(animal==='liverbird')for(let i=0;i<3;i++)cone(head,1,(i-1)*.07,.32,-.055,.036,.17,0,(i-1)*-.3);
 }
 if(animal==='bee'){
  for(const y of [.13,.36])shape(torso,new T.CylinderGeometry(.24,.21,.058,10),3,0,y,0,1,1,.75);
  for(const side of [-1,1]){link(head,3,[side*.1,.25,-.01],[side*.16,.42,-.02],.015);ball(head,3,side*.16,.43,-.02,.035,.034,.034);ball(torso,4,side*.2,.34,-.19,.16,.22,.033);}
 }
 if(animal==='dinosaur'){
  for(let i=0;i<3;i++)cone(head,1,0,.235,-.15+i*.12,.052,.12);
  for(let i=0;i<4;i++)cone(torso,1,0,.08+i*.115,-.18,.055,.12,-Math.PI/2);
 }
 if(animal==='orca'){
  if(id==='nagoya')cone(head,0,0,.29,-.075,.085,.21);
  cone(torso,0,0,.35,-.24,.11,.28,-Math.PI/2);
  for(let i=0;i<2;i++)ball(anchors.arms[i].shoulder,0,(i===0?-1:1)*.08,-.18,-.035,.12,.23,.045);
 }
 // One face per animal: large readable eyes and a muzzle at the original face height.
 if(animal==='bee'){
  for(const side of [-1,1]){ball(head,3,side*.1,.06,.185,.081,.105,.055);ball(head,4,side*.088,.089,.233,.024,.032,.012);}
  ball(head,1,0,-.092,.19,.075,.05,.036);
 }else if(animal==='orca'){
  // Orca eye patches are swept sideways; the small dark eyes sit below them.
  for(const side of [-1,1]){
   ball(head,4,side*.163,.09,.18,.066,.044,.033);
   ball(head,3,side*.127,.006,.222,.022,.025,.018);
   ball(head,4,side*.123,.015,.235,.007,.008,.005);
  }
 }else{
  const eyeX=animal==='vulture'?.075:animal==='zebra'||animal==='giraffe'?.092:animal==='bear'?.108:.09;
  const eyeZ=skullZ*.87+.008;
  for(const side of [-1,1]){
   if(animal==='dog')ball(head,1,side*eyeX,.089,eyeZ-.014,.069,.089,.032);
   ball(head,4,side*eyeX,.084,eyeZ,bird?.049:.049,bird?.047:animal==='bear'?.052:.061,.029);
   ball(head,3,side*(eyeX-.004),.08,eyeZ+.026,.024,bird?.029:.035,.015);
   ball(head,4,side*(eyeX-.012),.098,eyeZ+.039,.009,.011,.005);
   if(animal==='eagle'||animal==='wolf')box(head,animal==='eagle'?0:3,side*eyeX,.14,eyeZ+.003,.107,.026,.035,side*.2);
  }
 }
 if(['fox','wolf'].includes(animal)){
  // Tapered canine snout, with contrasting cheek fur and a pointed nose.
  for(const side of [-1,1])ball(head,1,side*(animal==='fox'?.115:.10),-.054,.172,animal==='fox'?.10:.084,.073,.067);
  const snout=animal==='wolf'?.16:.21;
  shape(head,new T.CylinderGeometry(animal==='wolf'?.044:.012,animal==='wolf'?.084:.079,snout,8),1,0,-.046,.267,1,1,.8,Math.PI/2);
  ball(head,3,0,-.046,.267+snout/2,.033,.025,.022);
 }else if(['wildcat','lynx','puma','lion'].includes(animal)){
  for(const side of [-1,1]){ball(head,1,side*.049,-.046,.216,.065,.055,.055);for(const y of [-.03,-.063])link(head,3,[side*.09,y,.245],[side*.157,y+.01,.219],.004);}
  ball(head,3,0,-.012,.262,.033,.021,.019);
  link(head,3,[0,-.025,.26],[0,-.072,.26],.004);
 }else if(animal==='pig'){
  ball(head,1,0,-.039,.234,.112,.078,.081);
  for(const side of [-1,1])ball(head,3,side*.039,-.025,.309,.017,.024,.008);
 }else if(['bear','dog'].includes(animal)){
  ball(head,1,0,-.056,.213,.116,.086,animal==='dog'?.106:.075);
  ball(head,3,0,-.017,animal==='dog'?.309:.282,.045,.031,.025);
  ball(head,3,0,-.094,.279,.033,.009,.01);
 }else if(['giraffe','zebra','deer','goat'].includes(animal)){
  const long=animal==='giraffe'||animal==='zebra';
  ball(head,animal==='zebra'?3:1,0,-.071,.222,long?.116:.095,.083,long?.115:.082);
  for(const side of [-1,1])ball(head,animal==='zebra'?4:3,side*.049,-.051,long?.323:.296,.017,.012,.008);
  if(animal==='giraffe')for(const side of [-1,1])ball(head,1,side*.155,-.034,.128,.04,.044,.015);
 }else if(bird){
  const beakLength=animal==='liverbird'?.34:animal==='rooster'?.14:animal==='vulture'?.23:.19;
  cone(head,1,0,-.01,.228+beakLength*.25,animal==='liverbird'?.058:animal==='rooster'?.075:.081,beakLength,Math.PI/2);
  if(animal==='eagle'||animal==='vulture')cone(head,1,0,-.057,.326,.038,.09,Math.PI);
  if(animal==='rooster')ball(head,1,0,-.14,.174,.043,.079,.044);
 }else if(animal==='dinosaur'){
  ball(head,0,0,-.046,.236,.16,.095,.142);
  ball(head,1,0,-.108,.236,.137,.03,.119);
  for(const side of [-1,1]){ball(head,3,side*.075,-.012,.35,.016,.012,.007);cone(head,4,side*.103,-.079,.337,.017,.038,Math.PI);}
 }else if(animal==='orca'){
  ball(head,4,0,-.114,.13,.159,.081,.11);
  ball(head,0,0,-.029,.207,.126,.062,.071);
 }
 if(animal!=='bee'){
  if(bird){for(let i=0;i<3;i++)ball(pelvis,i%2?1:0,(i-1)*.07,-.02,-.26,.06,.11,.2);}
  else if(animal==='orca'){link(pelvis,0,[0,.05,-.1],[0,-.13,-.4],.055);for(const side of [-1,1])ball(pelvis,0,side*.1,-.14,-.44,.15,.035,.085);}
  else if(animal==='dinosaur'){cone(pelvis,0,0,-.05,-.37,.13,.53,-Math.PI/2);}
  else if(animal==='pig'){shape(pelvis,new T.TorusGeometry(.064,.018,5,10,Math.PI*1.7),1,0,.025,-.19);}
  else if(animal==='bear'){ball(pelvis,0,0,.01,-.2,.072,.072,.07);}
  else{link(pelvis,0,[0,.05,-.14],[.08,-.23,-.32],animal==='fox'?.085:.04);ball(pelvis,1,.08,-.25,-.33,animal==='fox'?.085:.045,.09,.06);}
 }
 for(const [anchor,bucket] of buckets){const group=new T.Group();group.name=`club-costume-${id}-${anchor.name||'joint'}`;group.userData.costumeId=id;
  // Plush costume volume wraps the existing rig without changing player size or stride.
  if(anchor===head){group.scale.set(2.3203125,2.1796875,2.25);group.position.y=.26;}
  else if(anchor===torso)group.scale.set(1.2,1.04,1.28);
  else if(anchor===pelvis)group.scale.setScalar(1.2);
  else if(anchors.legs.some(leg=>leg.ankle===anchor))group.scale.set(1.22,1.16,1.14);
  else group.scale.set(1.25,1.02,1.25);
  group.updateMatrix();group.matrixAutoUpdate=false;anchor.add(group);groups.push(group);for(const [c,parts] of bucket){const geometry=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());if(!geometry)continue;geometries.push(geometry);const mesh=new T.Mesh(geometry,materials[c]);mesh.name=`club-costume-${animal}`;mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.playerId=playerId;mesh.userData.costumeId=id;group.add(mesh);}}
 const headBounds=new T.Box3();
 for(const group of groups)if(group.parent===head)for(const child of group.children){const mesh=child as T.Mesh;mesh.geometry.computeBoundingBox();headBounds.union(mesh.geometry.boundingBox!.clone().applyMatrix4(group.matrix));}
 return {headBounds,dispose(){groups.forEach(g=>g.removeFromParent());geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
}
