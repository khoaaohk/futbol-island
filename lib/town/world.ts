import {createUmbrellaReaction} from '../graphics/umbrellaReaction';
import {ARENA_BLOCKS,ARENA_QUEUES,KNOCKOUT_ROOF} from '../games/rooftopKnockout';
import {FERRY_RAMP,FERRY_DECK} from './ferryBoarding';
import {buildEastCoast} from './eastCoast';
import {buildFarmersMarket} from './farmersMarket';
import {createWaterRipples} from '../graphics/waterRipples';
import * as T from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {COACHES_DOOR} from './venues';
import {ISLAND_SHORE,NORTH_BEACH_UMBRELLAS,NORTH_BEACH_PATHS,onIsland} from './shoreline';
import { Obstacle } from './simulation';

export function buildTown(scene: T.Scene) {
  const existingRoots=new Set(scene.children);
  const umbrellaReaction=createUmbrellaReaction();
  const town = new T.Group(); scene.add(town);
  const museumRails:(Obstacle&{floor:number;top:number})[]=[];
  const walkSurfaces:(Obstacle&{height:number})[]=[];
  const obstacles: Obstacle[] = [], textures: T.Texture[] = [], materials: T.Material[] = [];
  const assets:{kind:string;x:number;z:number;w:number;d:number;visualW?:number;visualD?:number;canopyHeight?:number;baseY?:number}[]=[];
  const surfaceAreas:{kind:string;x:number;z:number;w:number;d:number}[]=[];
  const palette = new Map<string,T.MeshStandardMaterial>();
  const nightSigns:T.MeshStandardMaterial[]=[];
  const mat = (color: string) => { if (!palette.has(color)) {const m=new T.MeshStandardMaterial({color,roughness:.85});palette.set(color,m);materials.push(m);}return palette.get(color)!;};
  const put = (g:T.BufferGeometry,color:string,x:number,y:number,z:number,parent:T.Group=town) => {if(parent===town&&g instanceof T.BoxGeometry&&y<.2&&['#7a9e67','#8b9e6b'].includes(color))surfaceAreas.push({kind:'garden',x,z,w:g.parameters.width,d:g.parameters.depth});const m=new T.Mesh(g,mat(color));m.position.set(x,y,z);m.castShadow=!(g instanceof T.BoxGeometry&&g.parameters.height<=.2&&y<.2);m.receiveShadow=true;parent.add(m);return m;};
  const box=(w:number,h:number,d:number,c:string,x:number,y:number,z:number,p=town)=>put(new T.BoxGeometry(w,h,d),c,x,y,z,p);
  const cylinder=(r:number,h:number,c:string,x:number,y:number,z:number,p=town)=>put(new T.CylinderGeometry(r,r,h,10),c,x,y,z,p);
  const line=(a:T.Vector3,b:T.Vector3,r:number,c:string,p=town)=>{const m=cylinder(r,a.distanceTo(b),c,(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,p);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),b.clone().sub(a).normalize());return m;};
  const sign=(text:string,w:number,h:number,x:number,y:number,z:number,bg='#244d49',ink='#fff0cf',rotation=0)=>{
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=Math.round(512*h/w);const ctx=canvas.getContext('2d')!;
    ctx.fillStyle=bg;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle=ink;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`900 ${Math.min(canvas.height*.54,canvas.width/(text.length*.64))}px monospace`;ctx.fillText(text,canvas.width/2,canvas.height/2);
    const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;textures.push(texture);
    // Keep the emissive-map shader present in every mode; mode changes only
    // adjust uniforms and reuse the existing sign texture (no extra image).
    const material=new T.MeshStandardMaterial({map:texture,emissiveMap:texture,emissive:'#ffe1aa',emissiveIntensity:0,roughness:.9});materials.push(material);nightSigns.push(material);
    const mesh=new T.Mesh(new T.PlaneGeometry(w,h),material);mesh.position.set(x,y,z);mesh.rotation.y=rotation;town.add(mesh);return mesh;
  };

  // A single ocean surrounds the curved foundation on every side.
  const waterRipples=createWaterRipples();textures.push(waterRipples.texture);
  const oceanMat=new T.MeshStandardMaterial({color:'#67b8af',map:waterRipples.texture,roughness:.36,metalness:.16});materials.push(oceanMat);
  const water=new T.Mesh(new T.PlaneGeometry(1400,1400),oceanMat);water.rotation.x=-Math.PI/2;water.position.set(70,-.43,10);water.name='surrounding-ocean';scene.add(water);
  const waves:T.Mesh[]=[];
  for(let i=0;i<30;i++){const w=box(.055,.008,8+(i%5)*2,'#a4d3be',-88-(i%6)*5,-.405,-300+i*13);w.rotation.y=.12;waves.push(w);}
  function palm(x:number,z:number,height=6){
    assets.push({kind:'palm',x,z,w:.45,d:.45,visualW:6.5,visualD:6.5,canopyHeight:height});
    const group=new T.Group();group.position.set(x,0,z);town.add(group);
    const trunk=put(new T.CylinderGeometry(.11,.22,height,9),'#9d805b',0,height/2,0,group);trunk.rotation.z=-.07;
    for(let i=0;i<7;i++){
      const angle=i/7*Math.PI*2, points:T.Vector3[]=[];
      const positions:number[]=[],indices:number[]=[];
      for(let j=0;j<=8;j++){const t=j/8,r=t*3.25,w=Math.sin(t*Math.PI)*.44;const y=height+.45*Math.sin(t*Math.PI)-t*t*1.05;points.push(new T.Vector3(Math.cos(angle)*r,y,Math.sin(angle)*r));positions.push(Math.cos(angle)*r-Math.sin(angle)*w,y,Math.sin(angle)*r+Math.cos(angle)*w,Math.cos(angle)*r+Math.sin(angle)*w,y-.05,Math.sin(angle)*r-Math.cos(angle)*w);if(j<8){const n=j*2;indices.push(n,n+1,n+2,n+1,n+3,n+2);}}
      const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const m=put(geo,i%2?'#5b895e':'#7a9e67',0,0,0,group);(m.material as T.MeshStandardMaterial).side=T.DoubleSide;
      for(let j=0;j<points.length-1;j++)line(points[j],points[j+1],.019,'#a1ac6d',group);
    }
    obstacles.push({x,z,w:.45,d:.45});
  }
  function roundedBlock(w:number,h:number,d:number,r:number,color:string,x:number,y:number,z:number){
    const a=w/2,b=d/2,shape=new T.Shape();
    shape.moveTo(-a+r,-b);shape.lineTo(a-r,-b);shape.absarc(a-r,-b+r,r,-Math.PI/2,0,false);
    shape.lineTo(a,b-r);shape.absarc(a-r,b-r,r,0,Math.PI/2,false);
    shape.lineTo(-a+r,b);shape.absarc(-a+r,b-r,r,Math.PI/2,Math.PI,false);
    shape.lineTo(-a,-b+r);shape.absarc(-a+r,-b+r,r,Math.PI,Math.PI*1.5,false);shape.closePath();
    const geometry=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,curveSegments:8,steps:1});geometry.rotateX(-Math.PI/2);
    const mesh=put(geometry,color,x,y,z);mesh.userData.skipRoofObstacle=true;return mesh;
  }
  const softBuildings=new Set(['PARK LIBRARY','COMMUNITY WORKSHOP','BEACH KITCHEN','COAST CAFÉ','ISLAND MARKET',
    'CAFÉ MARÉ','PALM HOUSE','SURF & SOLE','COAST ROOMS','BAKERY',
    'RUA DO SOL','WEST END BOOKS','CASA DO SOL','CORNER DELI','PIER BAKERY']);
  const buildingRadius=(label:string)=>label==='CAFE BY THE SEA'?4:softBuildings.has(label)?1.5:0;
  function building(x:number,z:number,w:number,d:number,h:number,color:string,label:string,accent='#bd7657'){
    const radius=buildingRadius(label),rounded=radius>0,knockout=label==='ROOFTOP KNOCKOUT',front=w-radius*2;
    if(rounded){roundedBlock(w,h,d,radius,color,x,0,z);roundedBlock(w+.45,.23,d+.5,radius+.2,'#eddfbb',x,h-.035,z);roundedBlock(w+.15,.35,d+.16,radius+.1,'#d2bc94',x,.005,z);}
    else{box(w,h,d,color,x,h/2,z);box(w+.45,.23,d+.5,'#eddfbb',x,h+.08,z);box(w+.15,.35,d+.16,'#d2bc94',x,.18,z);}
    obstacles.push({x,z,w,d,...(rounded?{cornerRadius:radius}:{})});
    const floors=Math.min(label==='CAFE BY THE SEA'?2:4,Math.floor(h/2.5)),columns=Math.max(2,Math.min(6,Math.floor(front/2)));
    for(let floor=0;floor<floors;floor++)for(let col=0;col<columns;col++){
      const xx=x-front/2+(col+.5)*front/columns, yy=1.35+floor*2.45;
      // The knockout stair occupies the western 21 m of this facade.
      if(knockout&&(floor===0||xx<x+w/2-5))continue;
      box(.88,1.25,.06,'#365b56',xx,yy,z+d/2+.04);box(1.04,.09,.21,'#f0debb',xx,yy-.65,z+d/2+.1);
      if(!knockout&&floor>0&&col%2===0){box(1.4,.11,.7,'#e9cfa5',xx,yy-.64,z+d/2+.35);for(let q=-2;q<=2;q++)cylinder(.018,.55,'#647169',xx+q*.26,yy-.32,z+d/2+.65);box(1.4,.04,.045,'#526b5e',xx,yy-.04,z+d/2+.65);}
    }
    // Side windows remain visible from the follow camera.
    for(let floor=0;floor<floors;floor++)for(let k=0;k<3;k++)if(!knockout||k!==1)box(.065,1.22,.86,'#3d625c',x+w/2+.035,1.4+floor*2.45,z-d/2+(k+.5)*d/3);
    if(knockout)return; // Plain stair wall: no shopfront, balcony or awning projections.
    if(label)sign(label,front*.86,.62,x,2.45,z+d/2+.1);
    for(let col=0;col<8;col++){const awning=box(front/8,.10,1.3,col%2?'#ecdcb8':accent,x-front/2+(col+.5)*front/8,2.08,z+d/2+.58);awning.rotation.x=.14;}
    box(front-.6,1.65,.06,'#274c48',x,.97,z+d/2+.07);
    for(let col=1;col<3;col++)box(.055,1.7,.09,'#d7c49e',x-front/2+col*front/3,.96,z+d/2+.13);
    if(label!=='ROOFTOP KNOCKOUT')box(1.2,1.1,1.1,'#dbccaa',x+w*.22,h+.7,z-d*.2);
  }

  // The four towns surround the island's civic square. No district changes lighting.
  const warm=['#d6b58a','#b88472','#d5aa83','#e2c69a'];
  const buildings:{x:number;z:number;w:number;d:number;height:number;name:string;cornerRadius?:number}[]=[];
  const roads:{x:number;z:number;w:number;d:number;carriageway:number;boulevard:boolean;vertical:boolean}[]=[];
  function house(x:number,z:number,w:number,d:number,h:number,label:string,index:number){
    if(label==='CAFE BY THE SEA'){
      building(x,z,w,d,9,warm[index%warm.length],label,'#bd7657');
      buildings.push({x,z,w,d,height:9.23,name:label,cornerRadius:4});
      const northZ=z-10;
      roundedBlock(w,9,20,4,warm[index%warm.length],x,9,northZ);
      roundedBlock(w+.45,.23,20.5,4.2,'#eddfbb',x,17.965,northZ);
      buildings.push({x,z:northZ,w,d:20,height:18.23,name:'CAFE BY THE SEA NORTH WING',cornerRadius:4});
      obstacles.push({x,z:northZ,w,d:20,cornerRadius:4});
      return;
    }
    building(x,z,w,d,h,warm[index%warm.length],label,index%3?'#bd7657':'#477c6a');
    buildings.push({x,z,w,d,height:h+.23,name:label,...(buildingRadius(label)?{cornerRadius:buildingRadius(label)}:{})});
    if(label==='CAFE BY THE SEA'||label==='ROOFTOP KNOCKOUT')return;
    // Parapets, roof tanks, stepped roof rooms and visible drainpipes vary silhouettes.
    for(const side of [-1,1])box(w,.42,.18,'#eddfbb',x,h+.4,z+side*(d/2-.15));
    if(index%3===0){cylinder(.75,1.25,'#d2bc94',x-w*.23,h+.8,z-d*.18);cylinder(.82,.12,'#9d805b',x-w*.23,h+1.46,z-d*.18);}
    if(index%3===1)box(w*.35,1.45,d*.42,warm[index%4],x-w*.16,h+.78,z-d*.12);
    cylinder(.045,h,'#9d805b',x+w/2-.18,h/2,z+d/2+.14);
    // Doors, doorstep, number plaque and shutters make ordinary homes readable too.
    box(1.15,1.95,.13,'#365b56',x-w*.26,1.02,z+d/2+.2);
    box(1.65,.15,.8,'#d2bc94',x-w*.26,.1,z+d/2+.45);
    box(.18,.07,.05,'#f8d9a2',x-w*.26+.34,1.01,z+d/2+.29);
    if(index%2===0){box(1.1,.34,.42,'#b88472',x+w*.25,3.1,z+d/2+.45);for(const dx of [-.3,0,.3])put(new T.IcosahedronGeometry(.22,0),'#739568',x+w*.25+dx,3.38,z+d/2+.45);}
  }
  function street(x:number,z:number,length:number,vertical=true,boulevard=false){
    const carriageway=8,footprint=12;
    roads.push({x,z,w:vertical?footprint:length,d:vertical?length:footprint,carriageway,boulevard,vertical});
  }
  function path(x:number,z:number,w:number,d:number){surfaceAreas.push({kind:'path',x,z,w,d});box(w,.035,d,'#eddfbb',x,-.055,z);}
  function bench(x:number,z:number){
    assets.push({kind:'bench',x,z,w:2,d:.7});
    box(2,.12,.65,'#a67d55',x,.58,z);box(2,.45,.09,'#a67d55',x,.91,z-.25);
    for(const dx of [-.75,.75])box(.13,.5,.5,'#385a4e',x+dx,.27,z);
    obstacles.push({x,z,w:2,d:.7});
  }
  function planter(x:number,z:number){
    assets.push({kind:'planter',x,z,w:1.6,d:1.6,visualW:1.9,visualD:1.9});
    box(1.6,.55,1.6,'#d2bc94',x,.3,z);put(new T.IcosahedronGeometry(.95,0),'#739568',x,1,z);
    obstacles.push({x,z,w:1.6,d:1.6});
  }
  function tree(x:number,z:number){
    assets.push({kind:'tree',x,z,w:.45,d:.45,visualW:3.6,visualD:3.6,canopyHeight:4.4});
    cylinder(.18,2.4,'#9d805b',x,1.18,z);put(new T.IcosahedronGeometry(1.8,1),'#739568',x,3.3,z);
    obstacles.push({x,z,w:.45,d:.45});
  }
  function table(x:number,z:number){
    assets.push({kind:'table',x,z,w:3.1,d:1.5});
    cylinder(.75,.12,'#a67d55',x,.85,z);cylinder(.08,.78,'#385a4e',x,.4,z);
    for(const dx of [-1.15,1.15]){box(.6,.12,.6,'#a67d55',x+dx,.5,z);box(.12,.5,.55,'#385a4e',x+dx,.25,z);}
    obstacles.push({x,z,w:3.1,d:1.5});
  }
  function districtSign(text:string,x:number,z:number){
    sign(text,8,.9,x,2.5,z,'#477c6a');
    for(const dx of [-3.3,3.3]){cylinder(.06,2.4,'#9d805b',x+dx,1.2,z);obstacles.push({x:x+dx,z,w:.15,d:.15});}
  }
  function arcadeWalk(x:number,z:number,w:number){
    // A shaded colonnade, with walkable openings between stone piers.
    box(w,.35,2,'#eddfbb',x,3.3,z);
    for(let dx=-w/2+.3;dx<w/2;dx+=3){box(.4,3.2,.4,'#d2bc94',x+dx,1.6,z);obstacles.push({x:x+dx,z,w:.4,d:.4});}
  }
  // Palm Coast: low seaside houses, striped awnings, a promenade and concrete court.
  const coast:[number,number,number,number,number,string][]=[
    [-30,-26,11,11,6,'CAFÉ MARÉ'],[-30,-8,11,12,7,'PALM HOUSE'],[-30,13,11,12,5.5,'SURF & SOLE'],[-30,34,11,12,6.5,'COAST ROOMS'],
    [-3,-23,12,11,5.5,'BAKERY'],[14,-23,12,12,7,'RUA DO SOL'],[32,-23,12,12,6,'FISH MARKET'],[62,5,12,12,5.5,'COURTSIDE'],
    [-30,52.5,14,11,6.5,'PROMENADE CAFÉ']
  ];coast.forEach(([x,z,w,d,h,label],i)=>house(x,z,w,d,h+4,label,i));
  street(-16,13.75,102.5);street(48,13.75,102.5);street(21,65,68,false);
  path(11,43,38,3);path(-6,15,3,64);
  for(const z of [-14,9,29,48])palm(-6,z,6+(z%3)*.2);
  for(const z of [-17.25,2.5,23.5,43.5])palm(-37,z,6.5);

  for(const [x,z] of [[-24,-.5],[-26,43],[36,2]])table(x,z);

  // Futsal is a real rooftop street court above a parking garage.
  // Parent ground support uses exactly this deck/ramp/bridge geometry.
  box(28,.35,56,'#d2bc94',11,5.825,18);
  box(12,.25,5,'#d2bc94',28,5.875,-7.5);
  for(const x of [-3,25]){
    for(const z of [-9,4,17,30,45])box(.7,5.8,.7,'#d6b58a',x,2.9,z);
    for(const y of [.3,2.9,5.5])box(.45,.48,56,'#d6b58a',x,y,18);
    // Dark recessed openings and narrow vertical mullions read as parking levels.
    for(const z of [-3,10,23,36])for(const y of [1.6,4.15])box(.09,1.9,10,'#365b56',x+(x<0?.23:-.23),y,z);
  }
  for(const z of [-10,46]){
    for(const x of [-2,5,12,19,24])box(.7,5.8,.7,'#d6b58a',x,2.9,z);
    for(const y of [.3,2.9,5.5])box(28,.48,.45,'#d6b58a',11,y,z);
    box(26,2,.08,'#365b56',11,1.7,z+(z<0?.22:-.22));
  }
  sign('P',1.5,1.6,23,2,46.65,'#477c6a');
  // Continuous perimeter collisions are walls at ground level and guards on the roof.
  for(const o of [{x:-3,z:18,w:.25,d:56},{x:25,z:20.5,w:.25,d:51},{x:11,z:-10,w:28,d:.25},{x:11,z:46,w:28,d:.25}])obstacles.push(o);
  function roofRail(x:number,z:number,length:number,vertical:boolean,y=6){
    box(vertical?.1:length,.08,vertical?length:.1,'#477c6a',x,y+1.05,z);
    for(let t=-length/2;t<=length/2;t+=3)box(.08,1.05,.08,'#477c6a',x+(vertical?0:t),y+.53,z+(vertical?t:0));
  }
  roofRail(-3,18,56,true);roofRail(25,20.5,51,true);roofRail(11,-10,28,false);roofRail(11,46,28,false);
  roofRail(29.5,-10,9,false);roofRail(26.5,-5,3,false);
  // The upper bridge right edge continues the ramp guard all the way to its north corner.
  roofRail(34.15,-7.5,5,true);obstacles.push({x:34.15,z:-7.5,w:.15,d:5.15});
  obstacles.push({x:29.5,z:-10,w:9,d:.15},{x:26.5,z:-5,w:3,d:.15});
  const ramp=box(6,.25,Math.hypot(50,6),'#d2bc94',31,3-.125*Math.cos(Math.atan(.12)),20-.125*Math.sin(Math.atan(.12)));ramp.rotation.x=Math.atan(.12);
  path(31,47.5,6,5);
  for(const x of [27.85,34.15]){
    line(new T.Vector3(x,1.05,45),new T.Vector3(x,7.05,-5),.05,'#477c6a');
    for(let z=-5;z<=45;z+=5)box(.08,1.05,.08,'#477c6a',x,(45-z)*.12+.53,z);
    obstacles.push({x,z:20,w:.15,d:50});
  }
  // Roof furniture stays outside all field markings and safety runoff.
  for(const [x,z] of [[5,-7],[17,-7],[1,43]]){const n=town.children.length;bench(x,z);for(const child of town.children.slice(n))child.position.y+=6;}
  for(let i=0;i<3;i++)box(.55,.25+i*.25,8,'#d6b58a',23.6+i*.3,6+(.25+i*.25)/2,18);
  // Venue lettering belongs on the garage front, never across the roadside.
  box(20.4,1.65,.25,'#244d49',11,6.7,46.5);
  sign('PALM STREET FUTSAL',20,1.4,11,6.7,46.65,'#477c6a');

  const checkpoint=()=>({child:town.children.length,obstacle:obstacles.length,building:buildings.length,road:roads.length,asset:assets.length,surface:surfaceAreas.length});
  const shift=(start:ReturnType<typeof checkpoint>,dx:number,dz:number)=>{
    for(const child of town.children.slice(start.child)){child.position.x+=dx;child.position.z+=dz;}
    for(const o of obstacles.slice(start.obstacle)){o.x+=dx;o.z+=dz;}
    for(const b of buildings.slice(start.building)){b.x+=dx;b.z+=dz;}
    for(const r of roads.slice(start.road)){r.x+=dx;r.z+=dz;}
    for(const a of assets.slice(start.asset)){a.x+=dx;a.z+=dz;}
    for(const a of surfaceAreas.slice(start.surface)){a.x+=dx;a.z+=dz;}
  };
  const oldStart=checkpoint();
  // Old Town: a dense quarter of taller stucco homes, arcades and intimate courtyards.
  const ox=24,oz=-65;
  const old:[number,number,number,number,number,string][]=[
    [-29,-200,10,13,10,'RUA 90'],[-29,-182,10,13,12,'CASA ROSA'],[-29,-163,10,13,9,'THE CORNER'],[-29,-145,10,13,7,'PARK CAFÉ'],
    [-1,-224,15,13,12,'PARK VISITOR CENTRE'],[16,-224,15,13,10,'MERCADO'],[34,-224,15,13,13,'RUA NOVA']
  ];old.forEach(([x,z,w,d,h,label],i)=>house(x+ox,z+oz,w,d,h,label,i+10));
  // The historic quarter's street ring follows its translated field bounds.
  street(-16+ox,-232.75,80.5);
  street(40,-273,64,false);
  path(35,-201,3,9);arcadeWalk(-5,-202,9);
  for(const [x,z] of [[-4,-201],[-6,-153]]){table(x,z);if(z!==-201)planter(x+3,z-2);}
  for(const x of [21,39])bench(x,-201.5);
  districtSign('COMMUNITY PARK',21,-202);

  // Park lawns, winding footways and static play structures frame the younger game.
  for(const [x,z,w,d] of [[19,-202,30,10],[13.8,-217,1.4,74],[56,-235,1.2,58]])box(w,.018,d,'#7a9e67',x,-.065,z);
  for(const [x,z] of [[14.4,-214],[14.4,-230],[14.4,-250],[56,-246],[56,-222],[16,-203],[42,-202]])tree(x,z);
  for(const [x,z] of [[18,-200],[24,-197],[32,-196],[41,-198],[47,-201]])path(x,z,8,3);

  // Playground sits beside the entry path, leaving the arrival and exit clear.
  box(9,.035,6,'#d2bc94',50,-.035,-201);
  for(const x of [48.5,51.5])for(const z of [-202.5,-200.5])box(.15,1.8,.15,'#9d805b',x,.9,z);
  box(3.3,.18,2.3,'#a67d55',50,1.8,-201.5);
  const slide=box(1,.12,2.4,'#bd7657',50,.9,-199.7);slide.rotation.x=.55;
  obstacles.push({x:50,z:-201,w:4,d:4});
  shift(oldStart,-24,155);
  // Westward extension completes the park's streets with real bunting anchors.
  for(const [i,z] of [-109,-91,-73,-55].entries())house(-64,z,14,13,[10,11,9,8][i],['WEST END BOOKS','CASA DO SOL','MAKERS HOUSE','CORNER DELI'][i],i+44);
  street(-45,-80.25,85.5);street(-30.5,-37.5,29,false);
  path(-54,-80,3,86);
  for(const z of [-73,-55]){
    const from=-56.95,to=-34.05,height=6.5;
    const y=(t:number)=>height-Math.sin(t*Math.PI)*.75;
    for(let i=0;i<24;i++){const a=i/24,b=(i+1)/24;line(new T.Vector3(from+(to-from)*a,y(a),z),new T.Vector3(from+(to-from)*b,y(b),z),.022,'#9d805b');}
    for(const x of [from,to]){const hook=put(new T.SphereGeometry(.1,8,6),'#385a4e',x,height,z);hook.name='bunting-wall-anchor';}
    for(let i=1;i<15;i++){const t=i/15,g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute([-.35,0,0,.35,0,0,0,-.8,0],3));g.computeVertexNormals();const flag=put(g,i%2?'#d69b61':'#eddfbb',from+(to-from)*t,y(t),z);(flag.material as T.MeshStandardMaterial).side=T.DoubleSide;}
  }

  const clubStart=checkpoint();
  // Club Grounds: garden homes, tree-lined residential streets and a local clubhouse.
  const cx=100,cz=-35;
  const club:[number,number,number,number,number,string][]=[
    [149,-228,13,13,7,'GARDEN HOUSE'],[149,-207,13,13,8,'CLUB COTTAGES'],[149,-193,13,13,6,'THE NURSERY'],
    [251,-228,13,13,7.5,'CEDAR HOUSE'],[251,-207,13,13,6.5,'LOCAL LIBRARY'],[251,-185,13,13,8,'GREEN TERRACE'],[251,-164,13,12,6,'CLUB KITCHEN'],
    [177,-267,15,13,7,'JUNIOR CLUB'],[199,-267,15,13,8,'CLUB GROUNDS'],[221,-267,15,13,7,'COMMUNITY HALL'],[240,-135,14,12,6.5,'THE GARDEN CAFÉ']
  ];club.forEach(([x,z,w,d,h,label],i)=>house(x+cx,z+cz,w,d,h,label,i+22));
  street(264,-235,98);street(336,-235,98);street(300,-284,72,false);street(300,-186,72,false);
  path(300,-193.5,3,13);
  for(const x of [272,328])for(const z of [-270,-250,-229,-207])tree(x,z);
  for(const [x,z] of [[249,-254],[351,-254],[248,-213.5],[350,-211],[327,-176]]){planter(x,z);bench(x+3,z);}
  districtSign('CLUB GROUNDS',316,-192);

  shift(clubStart,-140,125);
  // Garden Café's east patio: a clear central aisle connects four outdoor tables.
  box(20,.035,14,'#d2bc94',217,-.035,-45);
  surfaceAreas.push({kind:'cafe-patio',x:217,z:-45,w:20,d:14});
  for(const x of [213,221])for(const z of [-48.5,-41.5]){
    table(x,z);
    for(const side of [-1,1])box(.09,.55,.62,'#477c6a',x+side*1.43,.8,z);
    if((x===213&&z===-48.5)||(x===221&&z===-41.5)){
      cylinder(.045,3.2,'#9d805b',x,1.6,z);
      put(new T.ConeGeometry(2.1,.6,8),x===213?'#d7ad62':'#739568',x,3.1,z);
    }
  }
  for(const z of [-50,-40])planter(226.5,z);
  // A tiny tactics board invites football conversations after a match.
  box(.9,.025,.58,'#477c6a',221,.9275,-48.5);
  for(const z of [-48.75,-48.25])box(.8,.01,.018,'#eddfbb',221,.946,z);
  for(const x of [220.6,221,221.4])box(.018,.01,.5,'#eddfbb',x,.946,-48.5);
  sign('POST-MATCH TABLES',6,.65,218,1.8,-38.2,'#477c6a');
  const schoolStart=checkpoint();
  // Eleven Park: a formal high-school campus with bigger club buildings and supporter cafés.
  const ex=15,ez=80;
  const eleven:[number,number,number,number,number,string][]=[
    [287,-112,18,15,11,'ARTS WING'],[285,-81,18,15,13,'CLASSROOMS'],[285,-55,18,18,10,'DINING HALL'],
    [415,-110,18,17,12,'SCHOOL OFFICES'],[415,-84,18,17,10,'LIBRARY'],[415,-55,18,18,13,'STUDENT CENTRE'],[415,-13.5,18,40,18,'CAFE BY THE SEA'],
    [327,-147,19,18,12,'HUMANITIES'],[350,-147,19,18,15,'ISLAND HIGH SCHOOL'],[380,-147,19,18,12,'CLASSROOMS'],[281,-8.25,28,50.5,10,'ROOFTOP KNOCKOUT']
  ];eleven.forEach(([x,z,w,d,h,label],i)=>house(x+ex,z+ez,w,d,h,label,i+34));
  // A two-level seaside cafe with open terraces for post-match conversations.
  // Coordinates here precede the campus shift below; keep the old north wall fixed.
  sign('CAFE BY THE SEA',9.5,1.5,430,6.8,86.62,'#294f43','#f4cc7c');
  sign('COFFEE, CLUBS & CONVERSATION',9.5,.7,430,5.25,86.64,'#477c6a','#fff0cf');
  sign('CAFE BY THE SEA',11.5,2.3,420.55,13.9,56.5,'#294f43','#f4cc7c',-Math.PI/2);
  for(const z of [51,61.3,71.7,82]){const h=z<66.5?17.5:8.5;box(.34,h,.6,'#eddfbb',420.85,h/2,z);}
  for(const [z,label] of [[54,'THE GAME'],[66.5,'CLUBS'],[79,'PLAYERS']] as [number,string][]){
    sign(label,6,1.5,420.8,4.1,z,'#bd7657','#fff0cf',-Math.PI/2);
  }
  // Large glazed double doors open visually onto the south terrace of the tall wing.
  box(6,4,.22,'#eddfbb',430,11.23,66.62);
  box(5.5,3.55,.12,'#244d49',430,11.155,66.79);
  for(const side of [-1,1]){
    box(2.5,3.25,.06,'#678f8d',430+side*1.33,11.155,66.88);
    box(.075,.75,.10,'#f4cc7c',430+side*.2,10.95,66.96);
  }
  box(.12,3.6,.08,'#eddfbb',430,11.18,66.94);
  sign('CAFE TERRACE',5.7,.6,430,13.65,66.88,'#294f43','#f4cc7c');
  // Follow the rounded terrace edge with a waist-high fence and real roof-level barriers.
  const terraceEdge:{x:number;z:number}[]=[{x:421.5,z:66.5},{x:421.5,z:82.5}];
  for(let i=1;i<=8;i++){const a=Math.PI-i*Math.PI/16;terraceEdge.push({x:425+Math.cos(a)*3.5,z:82.5+Math.sin(a)*3.5});}
  terraceEdge.push({x:435,z:86});
  for(let i=1;i<=8;i++){const a=Math.PI/2-i*Math.PI/16;terraceEdge.push({x:435+Math.cos(a)*3.5,z:82.5+Math.sin(a)*3.5});}
  terraceEdge.push({x:438.5,z:70},{x:438.5,z:67.5},{x:438.5,z:66.5},{x:433.1,z:66.5},{x:426.9,z:66.5},terraceEdge[0]);
  for(let i=1;i<terraceEdge.length;i++){
    const a=terraceEdge[i-1],b=terraceEdge[i];
    if((a.x===438.5&&a.z===70&&b.z===67.5)||(a.z===66.5&&a.x===433.1&&b.x===426.9))continue;
    const length=Math.hypot(b.x-a.x,b.z-a.z),count=Math.ceil(length/.8);
    for(const y of [9.62,10.48])line(new T.Vector3(a.x,y,a.z),new T.Vector3(b.x,y,b.z),.045,'#477c6a');
    for(let n=0;n<count;n++){const t=n/count;cylinder(.035,1.25,'#477c6a',a.x+(b.x-a.x)*t,9.855,a.z+(b.z-a.z)*t);}
    museumRails.push({x:(a.x+b.x)/2-230,z:(a.z+b.z)/2+80,w:Math.abs(b.x-a.x)+.12,d:Math.abs(b.z-a.z)+.12,floor:9.23,top:10.55});
  }
  // Southeast stair: a top landing connects through the fence opening, then descends south.
  function stairSurface(x:number,z:number,w:number,d:number,height:number){
    const mesh=box(w,height,d,'#d2bc94',x,height/2,z);mesh.userData.skipRoofObstacle=true;
    const surface={x:x-230,z:z+80,w,d,height,stepAccess:true};walkSurfaces.push(surface);
    obstacles.push({x,z,w,d});
  }
  stairSurface(440.5,68.75,5,2.5,9.23);
  const stairCount=31,stairRun=.45,stairRise=9.23/stairCount;
  for(let i=0;i<stairCount;i++){
    const top=9.23-i*stairRise,z=70+(i+.5)*stairRun;
    stairSurface(441.5,z,3,stairRun,top);
    const nosing=box(3,.035,.08,'#eddfbb',441.5,top+.012,z+stairRun/2-.04);nosing.userData.skipRoofObstacle=true;
    for(const x of [440,443]){
      const post=cylinder(.035,1.1,'#477c6a',x,top+.55,z);post.userData.skipRoofObstacle=true;
      museumRails.push({x:x-230,z:z+80,w:.13,d:stairRun+.03,floor:Math.max(0,top-.5),top:top+1.15});
    }
  }
  for(const x of [440,443])line(new T.Vector3(x,10.33,70),new T.Vector3(x,1.1,83.95),.045,'#477c6a');
  for(const z of [67.5,70]){
    line(new T.Vector3(438.5,10.33,z),new T.Vector3(z===70?440:443,10.33,z),.045,'#477c6a');
    // Leave the south side open above the actual stair flight.
    museumRails.push({x:z===70?209.25:210.5,z:z+80,w:z===70?1.5:5,d:.12,floor:9.23,top:10.4});
  }
  // The top landing's east rail connects with the outside stair handrail.
  line(new T.Vector3(443,10.33,67.5),new T.Vector3(443,10.33,70),.045,'#477c6a');
  museumRails.push({x:213,z:148.75,w:.12,d:2.5,floor:9.23,top:10.4});
  // A second flight rises along the west side of the terrace onto the tall north roof.
  stairSurface(424.3,66.5,3,2,18.23);
  for(let i=0;i<stairCount;i++){
    const top=18.23-i*9/stairCount,z=67.5+(i+.5)*stairRun;
    stairSurface(424.3,z,3,stairRun,top);
    const nosing=box(3,.035,.08,'#eddfbb',424.3,top+.012,z+stairRun/2-.04);nosing.userData.skipRoofObstacle=true;
    for(const x of [422.8,425.8]){
      const post=cylinder(.035,1.1,'#477c6a',x,top+.55,z);post.userData.skipRoofObstacle=true;
      museumRails.push({x:x-230,z:z+80,w:.13,d:stairRun+.03,floor:top-.5,top:top+1.15});
    }
  }
  for(const x of [422.8,425.8])for(const y of [18.62,19.48])line(new T.Vector3(x,y,67.5),new T.Vector3(x,y-9,81.45),.045,'#477c6a');
  // Rounded safety railing on the upper roof, with an opening above the stair landing.
  const upperEdge:{x:number;z:number}[]=[];
  for(const [cx,cz,start] of [[435,62.5,0],[425,62.5,Math.PI/2],[425,50.5,Math.PI],[435,50.5,Math.PI*1.5]]){
    for(let i=0;i<=8;i++){const a=start+i*Math.PI/16;upperEdge.push({x:cx+Math.cos(a)*3.5,z:cz+Math.sin(a)*3.5});}
  }
  upperEdge.push(upperEdge[0]);
  // Split the rounded perimeter exactly at both stair sides, then join those
  // endpoints to the landing. Keep only the stair mouth open.
  for(let i=1;i<upperEdge.length;i++){
    const a=upperEdge[i-1],b=upperEdge[i];
    if(a.z<62.5||b.z<62.5)continue;
    const cuts=[422.8,425.8].filter(x=>x>Math.min(a.x,b.x)&&x<Math.max(a.x,b.x))
      .map(x=>({x,z:a.z+(b.z-a.z)*(x-a.x)/(b.x-a.x)}))
      .sort((p,q)=>(p.x-q.x)*Math.sign(b.x-a.x));
    if(cuts.length){upperEdge.splice(i,0,...cuts);i+=cuts.length;}
  }
  for(const x of [422.8,425.8]){
    const edge=upperEdge.find(p=>p.x===x&&p.z>62.5)!;
    for(const y of [18.62,19.48])line(new T.Vector3(x,y,edge.z),new T.Vector3(x,y,67.5),.045,'#477c6a');
    const count=Math.ceil((67.5-edge.z)/.8);
    for(let n=0;n<=count;n++)cylinder(.035,1.25,'#477c6a',x,18.855,edge.z+(67.5-edge.z)*n/count);
    museumRails.push({x:x-230,z:(edge.z+67.5)/2+80,w:.12,d:67.5-edge.z+.12,floor:18.23,top:19.55});
  }
  for(let i=1;i<upperEdge.length;i++){
    const a=upperEdge[i-1],b=upperEdge[i],mx=(a.x+b.x)/2,mz=(a.z+b.z)/2;
    if(mz>62.5&&mx>422.8&&mx<425.8)continue;
    const count=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.8));
    for(const y of [18.62,19.48])line(new T.Vector3(a.x,y,a.z),new T.Vector3(b.x,y,b.z),.045,'#477c6a');
    for(let n=0;n<count;n++){const t=n/count;cylinder(.035,1.25,'#477c6a',a.x+(b.x-a.x)*t,18.855,a.z+(b.z-a.z)*t);}
    museumRails.push({x:mx-230,z:mz+80,w:Math.abs(b.x-a.x)+.12,d:Math.abs(b.z-a.z)+.12,floor:18.23,top:19.55});
  }
  // Outdoor cafe furniture keeps the door, east landing and west stair route clear.
  function roofCafeTable(x:number,z:number,y:number,shade:boolean){
    cylinder(.08,.8,'#477c6a',x,y+.4,z);
    cylinder(1.05,.12,'#d2bc94',x,y+.86,z);
    for(const side of [-1,1]){
      box(.7,.12,.7,'#bd7657',x+side*1.6,y+.48,z);
      box(.12,.7,.7,'#477c6a',x+side*1.94,y+.81,z);
      for(const dx of [-.24,.24])for(const dz of [-.24,.24])cylinder(.035,.43,'#477c6a',x+side*1.6+dx,y+.215,z+dz);
    }
    cylinder(.15,.23,'#bd7657',x,y+1.03,z);
    put(new T.IcosahedronGeometry(.23,0),'#7a9e67',x,y+1.25,z);
    if(shade){
      cylinder(.045,2.9,'#9d805b',x,y+1.45,z);
      const canopy=put(new T.ConeGeometry(2.35,.65,8),'#739568',x,y+2.9,z);
      canopy.userData.skipRoofObstacle=false;
    }
  }
  function roofCafePlant(x:number,z:number,y:number){
    assets.push({kind:'small-tree',x,z,w:.9,d:.9,visualW:1.5,visualD:1.5,baseY:y,canopyHeight:y+2.55});
    box(.9,.65,.9,'#bd7657',x,y+.325,z);
    cylinder(.06,1.4,'#9d805b',x,y+1,z);
    put(new T.IcosahedronGeometry(.75,1),'#477c6a',x,y+1.65,z);
    put(new T.IcosahedronGeometry(.5,1),'#8baa69',x+.25,y+2.05,z);
  }
  for(const z of [73,79.5])roofCafeTable(432,z,9.23,z===73);
  for(const x of [426,434])for(const z of [52,59.5])roofCafeTable(x,z,18.23,z===52);
  for(const [x,z] of [[423,51],[437,51],[437,63],[429,64]])roofCafePlant(x,z,18.23);
  // A tabletop pitch invites friends to discuss passing routes over a drink.
  box(.9,.02,.58,'#477c6a',432,10.16,79.5);
  for(const x of [431.6,432,432.4])box(.018,.012,.5,'#fff0cf',x,10.18,79.5);
  for(const z of [79.25,79.75])box(.8,.012,.018,'#fff0cf',432,10.18,z);
  street(318,19.5,131);street(412,19.5,131);street(365,-46,94,false);street(365,85,94,false);
  path(365,78,4,13);path(365,76,42,3);
  for(const x of [325,405])for(const z of [-34,-10,16,41,65]){if(x===405&&z===16)continue;tree(x,z);bench(x,z+4);}
  districtSign('ISLAND HIGH SCHOOL',390,77);

  // A recognizable school campus: linked teaching wings, a broad gym roof,
  // sports bleachers and an open gate into a pedestrian school forecourt.
  path(365,-54.5,73,5);arcadeWalk(365,-55,62);
  sign('ISLAND HIGH SCHOOL',18,1.25,365,8,-57.7,'#477c6a');
  for(let row=0;row<3;row++){
    box(.9,.4+row*.4,18,'#d2bc94',402+row,(.4+row*.4)/2,10);
    for(let z=2;z<=18;z+=1)box(.7,.12,.7,'#477c6a',402+row,.5+row*.4,z);
  }
  obstacles.push({x:403,z:10,w:3,d:18});
  for(const x of [339,391]){box(.45,2.8,.45,'#d2bc94',x,1.4,78);obstacles.push({x,z:78,w:.45,d:.45});}
  for(const x of [345,385]){
    box(10,.08,.12,'#477c6a',x,1.15,78);
    for(let dx=-5;dx<=5;dx+=1)box(.06,1.1,.06,'#477c6a',x+dx,.55,78);
    obstacles.push({x,z:78,w:10,d:.15});
  }
  for(let z=48;z<55;z+=1.5){line(new T.Vector3(324.5,0,z),new T.Vector3(324.5,.75,z),.035,'#477c6a');line(new T.Vector3(324.5,.75,z),new T.Vector3(326,.75,z),.035,'#477c6a');line(new T.Vector3(326,.75,z),new T.Vector3(326,0,z),.035,'#477c6a');}
  obstacles.push({x:325.25,z:51,w:1.5,d:7});
  shift(schoolStart,-230,80);
  const arenaRails:(Obstacle&{floor:number;top:number})[]=[],ar=KNOCKOUT_ROOF;
  box(24,.035,44,'#648c72',ar.x,ar.height+.02,ar.z);
  for(const side of [-1,1]){box(.09,.04,44,'#f8edc9',ar.x+side*12,ar.height+.05,ar.z);box(24,.04,.09,'#f8edc9',ar.x,ar.height+.05,ar.z+side*22);}
  box(24,.04,.09,'#f8edc9',ar.x,ar.height+.05,ar.z);
  for(const side of [-1,1]){
   const x=ar.x+side*13,z=ar.z+side*24.25;
   arenaRails.push({x,z:ar.z,w:.2,d:48.5,floor:ar.height,top:ar.height+5},{x:side===1?68:ar.x,z,w:side===1?22:26,d:.2,floor:ar.height,top:ar.height+5});
   for(let h=0;h<=5;h+=.5){box(.035,.055,48.5,'#315b50',x,ar.height+h,ar.z);box(side===1?22:26,.035,.035,'#315b50',side===1?68:ar.x,ar.height+h,z);}
   for(let dz=-24.25;dz<=24.3;dz+=.5)box(.035,5,.035,'#315b50',x,ar.height+2.5,ar.z+dz);
   for(let dx=side===1?-9:-13;dx<=13;dx+=.5)box(.035,5,.035,'#315b50',ar.x+dx,ar.height+2.5,z);
  }
  for(const b of ARENA_BLOCKS){box(b.w,1.4,b.d,'#d4ab68',ar.x+b.x,ar.height+.7,ar.z+b.z);box(b.w+.08,.12,b.d+.08,'#f0d291',ar.x+b.x,ar.height+1.46,ar.z+b.z);}
  const queueFloorMaterial=new T.MeshStandardMaterial({color:'#bb6266',roughness:.85,transparent:true,opacity:.28,depthWrite:false});materials.push(queueFloorMaterial);
  for(const q of ARENA_QUEUES){const floor=new T.Mesh(new T.PlaneGeometry(q.w,q.d),queueFloorMaterial);floor.rotation.x=-Math.PI/2;floor.position.set(ar.x+q.x,ar.height+.065,ar.z+q.z);floor.receiveShadow=true;town.add(floor);}
  // South stair runs parallel to the facade, rising west into the cage landing.
  for(let i=0;i<=40;i++){const height=i===0?ar.height:ar.height*(41-i)/41,x=i===0?55:57+(i-.5)*.4,z=i===0?178.2:179,w=i===0?4:.4,d=i===0?5.4:4;
    const mesh=box(w,height,d,'#d2bc94',x,height/2,z);mesh.userData.skipRoofObstacle=true;
    walkSurfaces.push({x,z,w,d,height,stepAccess:true});obstacles.push({x,z,w,d});
    if(i>0)for(const rz of [177,181]){box(.07,1.15,.07,'#315b50',x,height+.575,rz);line(new T.Vector3(x-.2,height+1.15,rz),new T.Vector3(x+.2,height+1.15-ar.height/41,rz),.04,'#315b50');}
  }
  // Continuous side barriers cannot activate around a rider halfway up a tread.
  for(const z of [177,181])arenaRails.push({x:65,z,w:16,d:.12,floor:0,top:ar.height+1.3});
  // Guard the exposed top landing edges, leaving the north cage gate and east stairs open.
  for(const edge of [{x:53,z:178.2,w:.12,d:5.4},{x:55,z:180.9,w:4,d:.12}]){
    arenaRails.push({...edge,floor:ar.height-.3,top:ar.height+1.3});
    // Open guardrails retain fall protection without large green wall panels.
    box(edge.w, .07,edge.d,'#315b50',edge.x,ar.height+1.2,edge.z);
    const length=Math.max(edge.w,edge.d),vertical=edge.d>edge.w;
    for(let offset=-length/2;offset<=length/2+.01;offset+=length/Math.ceil(length/.8))box(.07,1.2,.07,'#315b50',edge.x+(vertical?0:offset),ar.height+.6,edge.z+(vertical?offset:0));
  }
  // Readable from the street, clear of the south stair and its upper landing.
  const knockoutSign=sign('ROOFTOP KNOCKOUT',22,1.5,ar.x+ar.w/2+.13,7.8,ar.z,'#294f43','#f4cc7c');knockoutSign.rotation.y=Math.PI/2;


  const hubStart=checkpoint();
  // Shared civic centre: the existing square and arcade, moved between all four cities.
  const sx=130,sz=-118;
  box(57,.045,33,'#c1b699',60+sx,.005,18+sz);box(54,.045,30,'#eddfbb',60+sx,.035,18+sz);
  for(let x=34;x<88;x+=3)box(.035,.008,30,'#d2bc94',x+sx,.062,18+sz);
  for(let z=3;z<=33;z+=3)box(54,.008,.035,'#d2bc94',60+sx,.063,z+sz);
  house(46+sx,-5+sz,10,10,5.3,'ISLAND MARKET',0);house(60+sx,-6+sz,14,12,7.2,'STORE',1);
  for(const dx of [-4.5,4.5])box(.14,2.1,.18,'#294f43',60+sx+dx,8.1,.1+sz);
  box(13.2,2.4,.3,'#294f43',60+sx,9.1,.2+sz);
  const storeSign=sign('STORE',12.7,2.1,60+sx,9.1,.37+sz,'#294f43','#f4cc7c');storeSign.name='store-sign';
  sign('BALLS · RIDES · GEAR',11,.8,60+sx,5.8,.35+sz,'#294f43','#fff0cf');
  house(78+sx,-6+sz,14,12,6.2,'ARCADE',1);
  // Roof marquee: emissive surfaces, no extra real-time lights or render loop.
  for(const dx of [-4,4])box(.16,2.3,.18,'#385a4e',78+sx+dx,7.5,-.2+sz);
  box(12.4,2.6,.4,'#bd7657',78+sx,8.8,.1+sz);
  const marquee=sign('ARCADE',11.3,2.05,78+sx,8.8,.32+sz,'#244d49','#ffe3a0');
  const marqueeMaterial=marquee.material as T.MeshStandardMaterial;marqueeMaterial.emissive.set('#ffe0a0');marqueeMaterial.emissiveMap=marqueeMaterial.map;marqueeMaterial.emissiveIntensity=.65;
  const arcadeBulbs=[0,1].map(()=>{const m=new T.MeshStandardMaterial({color:'#ffe5ac',emissive:'#ffd179',emissiveIntensity:1.8,roughness:.5});materials.push(m);return m;});
  let bulbIndex=0;
  const bulb=(x:number,y:number)=>{const mesh=new T.Mesh(new T.SphereGeometry(.12,8,6),arcadeBulbs[bulbIndex++%2]);mesh.position.set(x,y,.37+sz);town.add(mesh);};
  for(let dx=-5.6;dx<=5.7;dx+=.7){bulb(78+sx+dx,7.68);bulb(78+sx+dx,9.92);}
  for(const dx of [-5.9,5.9])for(const dy of [-.7,0,.7])bulb(78+sx+dx,8.8+dy);
  box(9.4,1.65,.25,'#244d49',78+sx,5.1,.2+sz);sign('ARCADE',8.5,1.25,78+sx,5.1,.34+sz,'#244d49','#f8d9a2');
  box(4.1,3.35,.22,'#eddfbb',78+sx,1.72,.25+sz);box(3.4,2.94,.08,'#274c48',78+sx,1.5,.39+sz);box(.1,2.9,.1,'#d7c49e',78+sx,1.5,.47+sz);
  for(const dx of [-.3,.3])box(.07,.48,.1,'#f8d9a2',78+sx+dx,1.35,.56+sz);
  const welcome=sign('PLAY GAMES',4.6,.9,78+sx,3.7,.41+sz,'#477c6a','#fff0cf');
  (welcome.material as T.MeshStandardMaterial).emissive.set('#53704b');(welcome.material as T.MeshStandardMaterial).emissiveIntensity=.4;
  for(const side of [-1,1])for(const [dx,dy] of [[0,0],[-1,0],[1,0],[0,1],[0,-1]])box(.34,.34,.09,'#d69b61',78+sx+side*5.7+dx*.35,2.9+dy*.35,.4+sz);
  // Keep the square’s southern landing/runout lane clear; move its corner planter north-east.
  for(const [x,z] of [[165,-109],[215,-109],[165,-89],[218,-95]])planter(x,z);
  for(const [x,z] of [[177,-96],[213,-100],[212,-92]])table(x,z);
  for(const x of [181,210])bench(x,-90);


  shift(hubStart,-105,65);
  // Continuous paved frontage, with open approaches to all three storefronts.
  surfaceAreas.push({kind:'path',x:88,z:-49,w:48,d:6});
  box(48,.12,6,'#eddfbb',88,0,-49);
  box(48,.15,.22,'#d2bc94',88,.025,-46);
  for(let x=64;x<=112;x+=2)box(.025,.008,5.7,'#d2bc94',x,.065,-49);
  for(const z of [-50,-48])box(48,.008,.025,'#d2bc94',88,.065,z);
  for(const x of [67,75,94,111]){
    assets.push({kind:'planter',x,z:-46.8,w:2.4,d:1.1,visualW:2.6,visualD:1.3});
    box(2.4,.42,1.1,'#bd7657',x,.27,-46.8);box(2.1,.08,.85,'#6b6049',x,.5,-46.8);
    for(const dx of [-.7,0,.7]){const shrub=put(new T.IcosahedronGeometry(.6,1),dx===0?'#7a9e67':'#5b895e',x+dx,.83,-46.8);shrub.scale.y=.8;}
    for(const dx of [-.5,.45])put(new T.IcosahedronGeometry(.13,0),'#f4cc7c',x+dx,1.2,-46.7);
    obstacles.push({x,z:-46.8,w:2.4,d:1.1});
  }
  bench(71,-46.8);planter(63,-49);planter(114,-49);


  // Tall bushes frame the west/high end of the landing ramp; the jump clears their tops.
  for(const [i,z] of [-21.65,-20.3,-18.95].entries()){
    const x=55.05;
    assets.push({kind:'ramp-bush',x,z,w:1.2,d:1.25,visualW:1.5,visualD:1.4});
    for(const [dx,dy,r] of [[-.15,1.45,.65],[.15,1.65,.7]]){
      const shrub=put(new T.IcosahedronGeometry(r,1),i%2?'#7a9e67':'#5b895e',x+dx,dy,z);
      shrub.scale.set(.85,1.9,.95);
    }
    obstacles.push({x,z,w:1.2,d:1.25});
  }

  // The original island's compact promenade grid now serves all four settings.
  // Adjacent districts share streets instead of carrying duplicate road rings.
  street(48,-65,106,true,true);street(124,-46,68,true,true);
  street(86,-80,76,false,true);street(86,-12,76,false,true);
  street(16,-37.5,64,false);street(88,11,46,true,true);
  street(71.5,65,33,false);
  path(60,-35,24,4);path(112,-35,16,4);path(95,-17,4,10);
  // Everyday shared spaces fill the short walk from the arcade to the school.
  // Buildings already face these streets; no additional generic houses are needed.
  box(16,.018,18,'#7a9e67',69,-.065,23);path(69,23,13,15);
  for(const [x,z] of [[74,15],[72,29]])tree(x,z);
  table(68,23);bench(68,33);planter(75,34);
  // A small shuttle shelter and cycle stop sit on the pedestrian side of the avenue.
  path(72,-24,11,7);bench(62,-28);planter(78,-29);
  box(7,.18,3,'#d2bc94',72,3,-27);
  for(const x of [69,75]){box(.15,3,.15,'#9d805b',x,1.5,-27);obstacles.push({x,z:-27,w:.2,d:.2});}
  sign('ISLAND SHUTTLE',5,.65,72,2.45,-26.82,'#477c6a');
  for(const [x,z] of [[64,-70],[114,-87],[138,-47],[211,-45]]){
    box(4,.018,5,'#7a9e67',x,-.065,z);tree(x,z);
  }
  // Palm Coast beach opens south of the garage; static shoreline costs no animation.

  path(11,79,5,22);path(11,89,88,4);
  // Thin, curved pale shoreline follows the same outline as the land.
  for(let i=0;i<ISLAND_SHORE.length;i++){const a=ISLAND_SHORE[i],b=ISLAND_SHORE[(i+1)%ISLAND_SHORE.length];line(new T.Vector3(a.x,-.14,a.z),new T.Vector3(b.x,-.14,b.z),.12,'#f5e9cb');}
  for(const [x,z] of [[-29,80],[-12,94],[35,96],[48,119],[51,138]])palm(x,z,5.5);
  for(const [x,z] of [[-18,101],[8,108],[32,116]]){
    cylinder(.045,2.5,'#9d805b',x,1.25,z);
    const umbrella=put(new T.ConeGeometry(2,.65,8),'#bd7657',x,2.6,z);umbrella.castShadow=true;
    const mat=box(.85,.22,2.4,'#eddfbb',x+1.4,.16,z+1);umbrella.userData.umbrellaTargets=[mat];obstacles.push({x:x+1.4,z:z+1,w:.85,d:2.4});
    obstacles.push({x,z,w:.2,d:.2});
  }
  districtSign('PALM COAST BEACH',23,79);
  // Northern dunes and simple beach furniture use the same footprints as the map.
  for(const p of NORTH_BEACH_PATHS)path(p.x,p.z,p.w,p.d);
  for(const [i,{x,z}] of NORTH_BEACH_UMBRELLAS.entries()){
    assets.push({kind:'beach-umbrella',x,z,w:.25,d:.25,visualW:4.2,visualD:4.2});
    cylinder(.055,2.7,'#9d805b',x,1.35,z);const canopy=put(new T.ConeGeometry(2.1,.7,10),i%2?'#477c6a':'#bd7657',x,2.8,z);canopy.rotation.y=i*.4;const umbrellaTargets:T.Mesh[]=[];canopy.userData.umbrellaTargets=umbrellaTargets;
    obstacles.push({x,z,w:.25,d:.25});
    for(const dx of [-1.1,1.1]){umbrellaTargets.push(box(.8,.18,2.2,'#eddfbb',x+dx,.12,z+1.2));const back=box(.8,.1,.75,i%2?'#589aa0':'#c8734f',x+dx,.38,z+.4);back.rotation.x=-.55;umbrellaTargets.push(back);obstacles.push({x:x+dx,z:z+1,w:.8,d:2.5});}
    const towel=box(1.1,.015,1.7,i%2?'#d69b61':'#8b9e6b',x+3,.008,z+1);towel.rotation.y=.15*i;umbrellaTargets.push(towel);
    if(i%2===0)palm(x-4,z+9,5.5);
    for(let j=0;j<3;j++){const rock=put(new T.IcosahedronGeometry(.22+j*.1,0),'#d2bc94',x-2+j*.65,.1,z-3);rock.scale.y=.5;}
  }
  for(const x of [-30,45,125,182]){const z=x>160?-199:x>100?-206:-210;box(5,.04,2,'#d6c394',x,-.045,z);for(let i=0;i<7;i++){const grass=put(new T.ConeGeometry(.09,.5+(i%3)*.1,4),'#8b9e6b',x-2+i*.55,.22,z+Math.sin(i)*.4);grass.rotation.z=Math.sin(i)*.25;}}
  bench(-42,-208);bench(83,-215);districtSign('NORTH BEACH',80,-207);
  // Southern boardwalk sits on the extended shoreline, with open ocean beyond.

  // Southeast ferry dock: a broad deck follows the inside of the curved coast.
  const dockOutline=[{x:210,z:190},{x:238,z:190},{x:235,z:204},{x:226.5,z:215},{x:210,z:215}];
  const dockShape=new T.Shape();dockOutline.forEach((p,i)=>i?dockShape.lineTo(p.x,-p.z):dockShape.moveTo(p.x,-p.z));dockShape.closePath();
  const dockGeo=new T.ShapeGeometry(dockShape);dockGeo.rotateX(-Math.PI/2);
  // Upward-facing planks share the pier material and lighting.
  put(dockGeo,'#b98f62',0,0,0);
  for(let x=210.4;x<238;x+=.6){const south=x<=226.5?215:x<=235?204+(235-x)*11/8.5:190+(238-x)*14/3;box(.025,.008,Math.max(.01,south-190),'#91704d',x,.004,(190+south)/2);}
  for(let i=1;i<dockOutline.length-1;i++){
    const a=dockOutline[i],b=dockOutline[i+1],cuts=[0,1];
    for(const z of [204,207.2])if(z>Math.min(a.z,b.z)&&z<Math.max(a.z,b.z))cuts.push((z-a.z)/(b.z-a.z));
    cuts.sort((a,b)=>a-b);
    for(let k=1;k<cuts.length;k++){
      const lo=cuts[k-1],hi=cuts[k],mid=a.z+(b.z-a.z)*(lo+hi)/2;
      if(i===2&&mid>204&&mid<207.2)continue;
      const start=new T.Vector3(a.x+(b.x-a.x)*lo,1.05,a.z+(b.z-a.z)*lo),end=new T.Vector3(a.x+(b.x-a.x)*hi,1.05,a.z+(b.z-a.z)*hi);
      line(start,end,.055,'#eddfbb');const n=Math.ceil(start.distanceTo(end)/.55);
      for(let j=0;j<=n;j++){const p=start.clone().lerp(end,j/n);if(j%4===0||j===n)cylinder(.07,1.05,'#9d805b',p.x,.525,p.z);obstacles.push({x:p.x,z:p.z,w:.24,d:.24});}
    }
  }
  path(204,193,8,5);
  // Broad level wooden entrance from the cafe path; the opening stays unobstructed.
  box(8,.2,5,'#b98f62',206,-.1,193);
  for(let x=202.4;x<210;x+=.6)box(.025,.008,5,'#91704d',x,.004,193);
  for(const z of [190.5,195.5]){line(new T.Vector3(202,1.05,z),new T.Vector3(210,1.05,z),.045,'#eddfbb');for(const x of [202,206,210]){cylinder(.07,1.05,'#9d805b',x,.525,z);obstacles.push({x,z,w:.2,d:.2});}}
  sign('FERRY DOCK',12,1.8,222,4.2,190.1,'#294f43','#f4cc7c');
  for(const x of [216,228])cylinder(.1,4.4,'#9d805b',x,2.2,190);
  for(const z of [196,202]){bench(213,z);planter(216,z);}
  // Moored passenger ferry, animated by the existing island frame loop.
  const ferry=new T.Group();ferry.name='southeast-ferry';town.add(ferry);
  box(8,1.6,17,'#477c6a',246,.5,199,ferry);box(8.3,.2,17.3,'#eddfbb',246,1.4,199,ferry);
  box(6,3,10,'#fff0cf',246,3,199,ferry);box(6.5,.22,10.5,'#bd7657',246,4.6,199,ferry);
  for(const z of [195.5,198,200.5,203])for(const x of [242.95,249.05])box(.06,1,1.6,'#365b56',x,3.3,z,ferry);
  box(5,1.1,.08,'#365b56',246,3.3,193.95,ferry);
  ferry.attach(sign('MATCHDAY FERRY',6,.6,246,2,207.56,'#294f43','#f4cc7c'));
  for(const child of ferry.children){child.position.x-=246;child.position.z-=199;}
  ferry.position.set(246,0,199);
  // A broad gangway crosses the open dock rail and reaches the aft passenger deck.
  const ferryDeckSurface={...FERRY_DECK};walkSurfaces.push(ferryDeckSurface);
  const rampStart=FERRY_RAMP.x-FERRY_RAMP.w/2,rampEnd=FERRY_RAMP.x+FERRY_RAMP.w/2;
  const gangway=box(Math.hypot(FERRY_RAMP.w,1.5),.12,FERRY_RAMP.d,'#b98f62',FERRY_RAMP.x,.69,FERRY_RAMP.z);
  gangway.rotation.z=Math.atan2(1.5,FERRY_RAMP.w);gangway.userData.skipRoofObstacle=true;
  for(let i=0;i<40;i++){
    const x=rampStart+(i+.5)*FERRY_RAMP.w/40,height=(i+1)/40*1.5;
    const tread={x,z:FERRY_RAMP.z,w:FERRY_RAMP.w/40+.01,d:FERRY_RAMP.d,height,stepAccess:true};walkSurfaces.push(tread);obstacles.push(tread);
    const seam=box(.025,.012,FERRY_RAMP.d,'#91704d',x,height-.015,FERRY_RAMP.z);seam.rotation.z=gangway.rotation.z;
  }
  for(const z of [204,207.2]){
    line(new T.Vector3(rampStart,1.1,z),new T.Vector3(rampEnd,2.6,z),.045,'#eddfbb');
    for(let i=0;i<=20;i++){const x=rampStart+i/20*FERRY_RAMP.w,y=i/20*1.5;if(i%4===0)cylinder(.055,1.1,'#9d805b',x,y+.55,z);museumRails.push({x,z,w:.16,d:.16,floor:0,top:y+1.1});}
  }
  // Cabin and deck rails remain solid while the hull gently moves beneath them.
  museumRails.push({x:246,z:199,w:6.6,d:10.5,floor:1.4,top:4.8});
  for(const [x,z,w,d] of [[246,190.5,8,.12],[246,207.5,8,.12],[250,199,.12,17],[242,197.2,.12,13.4]]){
    box(w,.07,d,'#eddfbb',x,2.55,z,ferry); // World placement is attached below.
    museumRails.push({x,z,w,d,floor:1.35,top:2.6});
  }
  // Newly added rails are converted to the ferry's local coordinates.
  for(const child of ferry.children)if(child.position.x>200){child.position.x-=246;child.position.z-=199;}
  // Translucent future-route marker; bounded particles, no light or shadow pass.
  const lockBody=new T.Shape();
  lockBody.moveTo(-.9,-.85);lockBody.lineTo(.9,-.85);lockBody.quadraticCurveTo(1.1,-.85,1.1,-.65);lockBody.lineTo(1.1,.5);lockBody.quadraticCurveTo(1.1,.7,.9,.7);lockBody.lineTo(-.9,.7);lockBody.quadraticCurveTo(-1.1,.7,-1.1,.5);lockBody.lineTo(-1.1,-.65);lockBody.quadraticCurveTo(-1.1,-.85,-.9,-.85);
  const keyhole=new T.Path();keyhole.absarc(0,.05,.21,0,Math.PI*2,true);lockBody.holes.push(keyhole);
  const bodyGeometry=new T.ExtrudeGeometry(lockBody,{depth:.38,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.06,bevelThickness:.06,curveSegments:6});bodyGeometry.translate(0,0,-.19);
  const shackleGeometry=new T.TorusGeometry(.73,.17,5,14,Math.PI).toNonIndexed();shackleGeometry.translate(0,.65,0);
  const lockGeometry=mergeGeometries([bodyGeometry,shackleGeometry])!;bodyGeometry.dispose();shackleGeometry.dispose();
  const lockMaterial=new T.MeshBasicMaterial({color:'#65ffab',transparent:true,opacity:.48,depthWrite:false,toneMapped:false});materials.push(lockMaterial);
  const ferryLock=new T.Mesh(lockGeometry,lockMaterial);ferryLock.name='matchday-ferry-locked';ferryLock.position.set(0,8.8,0);ferryLock.scale.setScalar(1.7);ferry.add(ferryLock);
  const lockParticleGeometry=new T.BufferGeometry(),lockSeeds=new Float32Array(36);
  for(let i=0;i<12;i++){const angle=i*2.399;lockSeeds.set([Math.cos(angle)*2.4,i/12*4,Math.sin(angle)*2.4],i*3);}
  lockParticleGeometry.setAttribute('position',new T.BufferAttribute(lockSeeds,3));lockParticleGeometry.boundingSphere=new T.Sphere(new T.Vector3(0,1,0),5);
  const lockParticleMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:{time:{value:0},tint:{value:new T.Color('#65ffab')}},
    vertexShader:'uniform float time; varying float alpha; void main(){float angle=time*.65+position.y*1.570796;float radius=2.6+.25*sin(position.y*3.0);vec3 p=vec3(cos(angle)*radius,.5+sin(angle+position.y)*1.5,sin(angle)*radius);alpha=.65;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(130.0/max(1.0,-mv.z),2.5,8.0);}',
    fragmentShader:'uniform vec3 tint; varying float alpha; void main(){float r=length(gl_PointCoord-.5);if(r>.5)discard;gl_FragColor=vec4(tint,alpha*(1.0-smoothstep(.12,.5,r)));}'});materials.push(lockParticleMaterial);
  const lockParticles=new T.Points(lockParticleGeometry,lockParticleMaterial);lockParticles.name='ferry-lock-particles';lockParticles.position.copy(ferryLock.position);ferry.add(lockParticles);
  let ferryTime=0,lockReduced=false;
  lockParticles.onBeforeRender=()=>{lockParticleMaterial.uniforms.time.value=ferryTime;};
  // Renderer calls this only for a visible marker; no second animation loop or frustum scan.
  ferryLock.onBeforeRender=()=>{if(lockReduced)return;const angle=ferryTime*.45;if(ferryLock.rotation.y!==angle){ferryLock.rotation.y=angle;ferryLock.updateMatrixWorld(true);}};
  function updateFerry(dt:number,reduced:boolean){
    lockParticles.visible=!reduced;lockReduced=reduced;if(reduced&&ferryLock.rotation.y!==0){ferryLock.rotation.y=0;ferryLock.updateMatrix();}
    if(reduced){ferryDeckSurface.height=1.5;ferry.position.set(246,0,199);ferry.rotation.set(0,0,0);return;}
    ferryTime+=Math.min(dt,.05);
    ferry.position.set(246+Math.sin(ferryTime*.38)*.12,Math.sin(ferryTime*.85)*.10,199+Math.sin(ferryTime*.46)*.22);
    ferry.rotation.set(Math.sin(ferryTime*.57)*.012,Math.sin(ferryTime*.32)*.008,Math.sin(ferryTime*.71)*.016);
    ferryDeckSurface.height=1.5+ferry.position.y;
  }
  for(const z of [193,205])line(new T.Vector3(237,.7,z),new T.Vector3(242,1,z),.045,'#9d805b');
  // Keep wide routes from both the beach and the school to the pier.
  path(46,174,4,70);path(90,188,88,4);path(135,190,5,40);
  for(let x=43;x<210;x+=6){
    const width=Math.min(6,210-x);box(width,.2,8,'#b98f62',x+width/2,-.1,211);
    for(let dx=.4;dx<width;dx+=.6)box(.025,.008,8,'#91704d',x+dx,.004,211);
    for(const z of [207.4,214.6])cylinder(.12,1.8,'#9d805b',x+.3,-.6,z);
  }
  for(let x=43;x<=209;x+=3){cylinder(.065,1.05,'#9d805b',x,.525,214.65);}
  line(new T.Vector3(43,1.05,214.65),new T.Vector3(210,1.05,214.65),.045,'#eddfbb');
  line(new T.Vector3(43,.55,214.65),new T.Vector3(226,.55,214.65),.032,'#eddfbb');
  obstacles.push({x:134.5,z:214.65,w:183,d:.16});
  for(const x of [43,226]){line(new T.Vector3(x,1.05,207),new T.Vector3(x,1.05,214.65),.045,'#eddfbb');obstacles.push({x,z:210.825,w:.16,d:7.65});}
  for(const x of [65,105,170,205])bench(x,208);
  districtSign('SOUTH PIER',146,203);
  // A sand court at the western pier approach; paths stay open on every side.
  surfaceAreas.push({kind:'sand',x:72,z:198,w:24,d:16});
  const sand=box(24,.07,16,'#e8d5a3',72,-.02,198);sand.name='pier-volleyball-sand';
  assets.push({kind:'volleyball-court',x:72,z:198,w:24,d:16});
  for(const x of [64,80])box(.085,.018,8,'#fff4d5',x,.03,198);
  for(const z of [194,202])box(16,.018,.085,'#fff4d5',72,.03,z);
  for(const z of [193.4,202.6]){cylinder(.085,2.6,'#477c6a',72,1.3,z);cylinder(.14,1.1,'#e6c477',72,.55,z);obstacles.push({x:72,z,w:.28,d:.28});}
  for(const y of [1.2,2.35])box(.05,.07,9.2,'#fff4d5',72,y,198);
  for(let z=193.4;z<=202.61;z+=.38)line(new T.Vector3(72,1.2,z),new T.Vector3(72,2.35,z),.012,'#526b5e');
  for(let y=1.4;y<2.35;y+=.2)line(new T.Vector3(72,y,193.4),new T.Vector3(72,y,202.6),.012,'#526b5e');
  // Full net barrier prevents walking or riding through the mesh.
  obstacles.push({x:72,z:198,w:.12,d:9.2});
  bench(86,198);palm(88,203,5.5);path(58,198,3,18);
  sign('BEACH VOLLEYBALL',5.8,.7,84,1.8,191,'#477c6a');
  for(const x of [81.5,86.5])cylinder(.055,1.8,'#9d805b',x,.9,191);



  // Western infill completes a lived-in market street, facing the existing coastal
  // blocks. Its two junctions join the established road network, not a new enclave.
  street(-45,18.25,111.5);street(-29,65,32,false);
  for(const [z,h,label] of [[-18,8,'PRAÇA HOMES'],[2,9,'THE GROCER'],[22,7,'MARÉ WORKSHOP'],[42,8.5,'COAST APARTMENTS']] as [number,number,string][])house(-64,z,14,12,h,label,3);
  path(-62,62,24,15);table(-66,61);table(-59,66);bench(-71,65);
  planter(-70,55);planter(-53,56);tree(-76,62);
  house(-70,82,12,10,4.5,'BEACH KITCHEN',2);house(-49,83,12,10,5,'SURF & REPAIR',0);
  path(-62,97,25,13);table(-68,96);table(-58,96);bench(-71,101);
  path(-44,94,40,3);path(-27,91.5,3,5);path(-40.5,76,12,3);path(-36,85,3,18);
  for(const [x,z] of [[-80,87],[-78,101],[-44,100]])palm(x,z,5.5);
  // A small shared learning/workshop square fills the gap between park and club.
  street(48,-138.5,41);
  // A continuous northern cross street closes the western, park, library and
  // academy routes into loops, providing alternatives to returning through the hub.
  street(39.5,-159,169,false); // west avenue (-45) to academy avenue (124).
  street(-45,-141,36);        // extends the west row from z -123 to -159.
  street(-16,-138.5,41);      // park approach meets its existing street at z -118.
  house(78,-146,14,12,7,'PARK LIBRARY',0);house(78,-126,14,12,6,'COMMUNITY WORKSHOP',1);
  path(80,-110,24,16);path(63,-108,20,4);
  table(76,-108);table(85,-108);bench(78,-103);planter(70,-104);planter(89,-115);tree(92,-107);
  // Pier trading rooms frame the school-to-water route; the middle stays open.
  for(const [x,label] of [[99,'PIER BAKERY'],[118,'COAST CAFÉ'],[168,'HISTORY MUSEUM']] as [number,string][])house(x,181,label==='HISTORY MUSEUM'?30:12,9,5,label,2);
  sign('HISTORY MUSEUM',25,2.5,168,7.4,185.7,'#294f43','#f4cc7c');
  sign('THE STORY OF FOOTBALL',18,.7,168,5.85,185.72,'#477c6a','#fff0cf');
  // Connected promenades: museum front, cafe entrance, and the southern boardwalk.
  path(184.5,190,43,4);path(204,177,4,30);path(205,199,4,20);
  path(168,187.5,5,5);path(200,169,12,4);
  for(const x of [99,118,177,204]){path(x,196,15,15);table(x-2,195);bench(x+4,200);}
  // Fixed shade structures, showers and a fishing station give the shoreline use.
  for(const [x,z] of [[100,196],[200,196]]){
    cylinder(.055,2.8,'#9d805b',x,1.4,z);put(new T.ConeGeometry(2.2,.7,8),'#bd7657',x,2.9,z);
    obstacles.push({x,z,w:.15,d:.15});
  }
  for(const x of [-36,-33]){
    cylinder(.05,2.3,'#477c6a',x,1.15,102);box(.55,.07,.13,'#477c6a',x+.23,2.3,102);
    obstacles.push({x,z:102,w:.15,d:.15});
  }
  box(3,.12,1,'#a67d55',219,.9,202);for(const x of [218,220])box(.12,.85,.7,'#477c6a',x,.43,202);
  obstacles.push({x:219,z:202,w:3,d:1});
  for(const x of [58,216]){const ring=put(new T.TorusGeometry(.36,.085,6,16),'#bd7657',x,.8,214.48);ring.castShadow=true;}
  const destinations=[{name:'Courtside Courtyard',x:69,z:29},{name:'West Market',x:-60,z:60},{name:'Beach Kitchen Courtyard',x:-63,z:94},{name:'Library Square',x:80,z:-105},{name:'Pier Cafés',x:108,z:196},{name:'Fishing Station',x:216,z:200}];


  // Player-development centre is an exterior destination; IDP and tactics tools
  // will live inside in a future update. The marked wall supports the shared drill.
  house(161,-43,22,12,7.5,'PLAYER DEVELOPMENT',0);
  sign('COACHES',12,1.35,161,5.2,-36.82,'#244d49');
  for(const dx of [-5,5])box(.16,2.1,.18,'#385a4e',161+dx,8.55,-36.9);
  box(14.2,2.4,.3,'#294f43',161,9.7,-36.8);
  const coachesSign=sign('COACHES',13.7,2.1,161,9.7,-36.63,'#294f43','#f4cc7c');coachesSign.name='coaches-sign';
  sign('COMING SOON',5,.6,161,3.5,-36.75,'#477c6a');
  path(145,-34,40,4);path(174,-24,6,26);
  box(28,.035,19.3,'#6e9678',156,-.055,-19.65);
  for(const x of [142.4,169.6])box(.1,.008,18.5,'#f5eed5',x,-.022,-19.65);
  for(const z of [-28.9,-10.4])box(27.2,.008,.1,'#f5eed5',156,-.022,z);
  box(26,2.3,.35,'#d6b58a',156,1.15,-29.5);
  box(26.3,.15,.5,'#eddfbb',156,2.33,-29.5);
  obstacles.push({x:156,z:-29.5,w:26,d:.35});
  for(const x of [150,162]){
    // Breakable quest targets fill these permanent practice-wall frames.
    for(const dx of [-1.9,1.9])box(.075,1.35,.025,'#f5eed5',x+dx,1.02,-29.298);
    for(const y of [.38,1.66])box(3.85,.075,.025,'#f5eed5',x,y,-29.298);

  }
  for(const z of [-25,-20,-15]){const cone=put(new T.ConeGeometry(.22,.55,8),'#d69b61',143.5,.275,z);cone.castShadow=true;}
  bench(175,-20);tree(179,-34);
  destinations.push({name:'Coaches Centre',...COACHES_DOOR});

  // Community allotments east of Coaches: broad paths remain open to every ride.
  // Keep the north edge at -40; carry the lawn18m farther south to z28.
  // Keep the north edge at -40; the south edge now meets the boardwalk at z30.
  box(54,.025,70,'#7a9e67',208,-.07,-5);
  // Low lawn tufts sit outside the paths, leaving the garden gates unobstructed.
  for(const [x,z] of [[184,-33],[184,-25],[184,-5],[184,5],[232,-33],[232,-23],[232,-12],[232,0],[232,7],[193,8],[220,8],[184,16],[184,25],[197,26],[210,26]]){
    for(let i=0;i<3;i++){
      const tuft=put(new T.ConeGeometry(.12,.35+i*.04,4),'#739568',x+(i-1)*.23,.12,z+(i%2)*.2);tuft.castShadow=false;
    }
  }
  path(208,-15,42,38);
  path(181,-15,14,4); // Connect the Coaches walkway directly to the garden gate.
  sign('COMMUNITY GARDEN',13,1.1,207,2.5,5.5,'#477c6a');
  for(const x of [201,213]){cylinder(.08,2.4,'#9d805b',x,1.2,5.5);obstacles.push({x,z:5.5,w:.2,d:.2});}
  const gardenPlantMaterials=new Map<T.Material,T.MeshStandardMaterial>();
  // Twelve timber beds, with a generous central crossing and paths between rows.
  for(let row=0;row<3;row++)for(let col=0;col<4;col++){
    const x=192+col*10,z=-28+row*11;
    box(6,.55,6,'#a67d55',x,.275,z);
    box(5.65,.08,5.65,'#6e5540',x,.58,z);
    obstacles.push({x,z,w:6,d:6});
    for(let a=0;a<3;a++)for(let b=0;b<3;b++){
      const px=x-1.8+a*1.8,pz=z-1.8+b*1.8;
      const crop=(row+col)%3;
      const plant=put(new T.IcosahedronGeometry(crop===1?.48:.62,0),crop===2?'#739568':'#547b50',px,.95,pz);
      const source=plant.material as T.MeshStandardMaterial;let bedPaint=gardenPlantMaterials.get(source);if(!bedPaint){bedPaint=source.clone();bedPaint.emissive.set('#d3ac72');bedPaint.emissiveIntensity=0;gardenPlantMaterials.set(source,bedPaint);materials.push(bedPaint);}plant.material=bedPaint;
      if(crop===1){cylinder(.035,1.35,'#9d805b',px,1.15,pz);put(new T.IcosahedronGeometry(.2,0),'#bd7657',px+.25,1.05,pz);}
      if(crop===2)put(new T.IcosahedronGeometry(.25,0),'#e8be71',px,1.45,pz);
    }
  }
  // A shaded gathering strip at the southern entrance and a shared potting table.
  bench(191,1);bench(222,1);table(207,0);
  for(const [x,z] of [[186,-34],[230,-34],[230,4]])tree(x,z);
  box(4,.15,1.5,'#a67d55',229,1,-15);
  for(const x of [227.5,230.5])box(.15,.95,1.3,'#385a4e',x,.475,-15);
  obstacles.push({x:229,z:-15,w:4,d:1.5});
  for(const x of [228,230]){cylinder(.28,.4,'#bd7657',x,1.25,-15);put(new T.IcosahedronGeometry(.35,0),'#739568',x,1.65,-15);}
  destinations.push({name:'Community Garden',x:207,z:4});

  destinations.push(buildFarmersMarket({box,cylinder,put,sign,path,obstacles,buildings,roads}));

  buildEastCoast({box,put,obstacles});

  // Canonical centre lines remove offsets and duplicated dash phases. Touching
  // collinear sections become one street before any road surface is generated.
  const aligned=new Map<string,typeof roads>();
  for(const r of roads){const key=(r.vertical?'x:':'z:')+(r.vertical?r.x:r.z);const group=aligned.get(key)||[];group.push(r);aligned.set(key,group);}
  const canonical:typeof roads=[];
  for(const group of aligned.values()){
    const vertical=group[0].vertical,axis=vertical?group[0].x:group[0].z;
    const intervals=group.map(r=>({start:(vertical?r.z:r.x)-(vertical?r.d:r.w)/2,end:(vertical?r.z:r.x)+(vertical?r.d:r.w)/2})).sort((a,b)=>a.start-b.start);
    const spans:{start:number;end:number}[]=[];
    for(const span of intervals){const previous=spans[spans.length-1];if(previous&&span.start<=previous.end+.001)previous.end=Math.max(previous.end,span.end);else spans.push({...span});}
    for(const span of spans){const centre=(span.start+span.end)/2,length=span.end-span.start;canonical.push({x:vertical?axis:centre,z:vertical?centre:axis,w:vertical?12:length,d:vertical?length:12,vertical,carriageway:8,boulevard:false});}
  }
  roads.splice(0,roads.length,...canonical);
  const roadJunctions:{x:number;z:number;w:number;d:number;carriageway:number}[]=[],junctionKeys=new Set<string>();
  for(const v of roads.filter(r=>r.vertical))for(const h of roads.filter(r=>!r.vertical)){
    if(v.x<h.x-h.w/2-.001||v.x>h.x+h.w/2+.001||h.z<v.z-v.d/2-.001||h.z>v.z+v.d/2+.001)continue;
    const key=v.x+':'+h.z;if(junctionKeys.has(key))continue;junctionKeys.add(key);roadJunctions.push({x:v.x,z:h.z,w:12,d:12,carriageway:8});
  }
  // Union the axis-aligned streets into non-overlapping cells. Coplanar slabs at
  // junctions used to shimmer from above; each layer now contains each cell once.
  function roadRects(carriageway:boolean){return [...roads.map(r=>({x:r.x,z:r.z,w:carriageway&&r.vertical?r.carriageway:r.w,d:carriageway&&!r.vertical?r.carriageway:r.d})),...roadJunctions.map(j=>({x:j.x,z:j.z,w:carriageway?8:12,d:carriageway?8:12}))];}
  const asphaltRects=roadRects(true);
  function roadSurface(carriageway:boolean){
    const rects=carriageway?asphaltRects:roadRects(false);
    // Cut the sidewalk around the asphalt instead of layering nearly coplanar
    // surfaces underneath it, which can flicker at parachute viewing distances.
    const boundaries=carriageway?rects:[...rects,...asphaltRects];
    const xs=[...new Set(boundaries.flatMap(r=>[r.x-r.w/2,r.x+r.w/2]))].sort((a,b)=>a-b);
    const zs=[...new Set(boundaries.flatMap(r=>[r.z-r.d/2,r.z+r.d/2]))].sort((a,b)=>a-b);
    const chunks=new Map<string,{x:number;z:number;positions:number[]}>();
    for(let ix=0;ix<xs.length-1;ix++)for(let iz=0;iz<zs.length-1;iz++){
      const x=(xs[ix]+xs[ix+1])/2,z=(zs[iz]+zs[iz+1])/2;
      if(!rects.some(r=>Math.abs(x-r.x)<r.w/2+1e-7&&Math.abs(z-r.z)<r.d/2+1e-7))continue;
      if(!carriageway&&asphaltRects.some(r=>Math.abs(x-r.x)<r.w/2&&Math.abs(z-r.z)<r.d/2))continue;
      const ox=Math.floor(x/50)*50,oz=Math.floor(z/50)*50,key=ox+':'+oz;
      let chunk=chunks.get(key);if(!chunk){chunk={x:ox,z:oz,positions:[]};chunks.set(key,chunk);}
      const a=xs[ix]-ox,b=xs[ix+1]-ox,c=zs[iz]-oz,d=zs[iz+1]-oz,y=carriageway?-.01:-.02;
      chunk.positions.push(a,y,c,a,y,d,b,y,d,a,y,c,b,y,d,b,y,c);
    }
    for(const chunk of chunks.values()){
      const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(chunk.positions,3));geometry.computeVertexNormals();
      const mesh=put(geometry,carriageway?'#737c75':'#eddfbb',chunk.x,0,chunk.z);mesh.castShadow=false;
    }
  }
  roadSurface(false);roadSurface(true);

  // Dashes share a world-space phase and stop before the intersection square.
  for(const r of roads){const start=(r.vertical?r.z:r.x)-(r.vertical?r.d:r.w)/2,end=(r.vertical?r.z:r.x)+(r.vertical?r.d:r.w)/2;
    for(let t=Math.ceil((start+8)/6)*6;t<end-8;t+=6){
      const x=r.vertical?r.x:t,z=r.vertical?t:r.z;
      if(roadJunctions.some(j=>Math.abs(x-j.x)<7&&Math.abs(z-j.z)<7))continue;
      box(r.vertical?.12:2,.008,r.vertical?2:.12,'#e6d7b5',x,.008,z);
    }
  }
  // Crossings are generated only on genuine approaches, never across a dead arm.
  for(const j of roadJunctions)for(const vertical of [true,false])for(const side of [-1,1]){
    const x=j.x+(vertical?0:side*6),z=j.z+(vertical?side*6:0);
    if(!roads.some(r=>r.vertical===vertical&&Math.abs((vertical?r.x:r.z)-(vertical?x:z))<.001&&(vertical?z:x)>(vertical?r.z-r.d/2:r.x-r.w/2)+1&&(vertical?z:x)<(vertical?r.z+r.d/2:r.x+r.w/2)-1))continue;
    for(let n=-3;n<=3;n+=1.5)box(vertical?.65:1.6,.008,vertical?1.6:.65,'#f5eed5',x+(vertical?n:0),.009,z+(vertical?0:n));
  }
  // Corner poles carry mast arms over the approaching traffic lanes.
  // Shared lens materials remain part of the existing static geometry batches.
  const signalColors=['#ef4545','#ffc43d','#39ce78'];
  const signalLenses=signalColors.map(color=>{const material=mat(color);material.emissive.set(color);material.emissiveIntensity=.35;return material;});
  const signalPoints:{x:number;z:number}[]=[];
  for(const junction of roadJunctions)for(const [dx,dz] of [[-5.3,-5.3],[5.3,5.3]]){
    const x=junction.x+dx,z=junction.z+dz;
    if(!onIsland(x,z)||signalPoints.some(p=>Math.hypot(p.x-x,p.z-z)<5)||obstacles.some(o=>Math.abs(x-o.x)<o.w/2+.55&&Math.abs(z-o.z)<o.d/2+.55))continue;
    // A dead-end corner can have no incoming approach. Only create its support
    // (and collision footprint) when at least one signal head will use it.
    const axes=(['x','z'] as const).filter(axis=>{
      const face=axis==='x'?-Math.sign(dx):-Math.sign(dz);
      const approach=axis==='x'?junction.x+face*8:junction.z+face*8;
      return roads.some(r=>r.vertical===(axis==='z')&&Math.abs((axis==='z'?r.x:r.z)-(axis==='z'?junction.x:junction.z))<.001&&approach>(axis==='z'?r.z-r.d/2:r.x-r.w/2)&&approach<(axis==='z'?r.z+r.d/2:r.x+r.w/2));
    });
    if(!axes.length)continue;
    signalPoints.push({x,z});assets.push({kind:'traffic-signal',x,z,w:.45,d:.45,visualW:8.5,visualD:8.5});
    cylinder(.24,.25,'#384443',x,.125,z);cylinder(.11,7,'#384443',x,3.5,z);
    // Suspend each head over its incoming lane on the far side of the crossing.
    // Roadside supports keep the pavement clear; lenses face approaching drivers.
    for(const axis of axes){
      const face=axis==='x'?-Math.sign(dx):-Math.sign(dz);
      const hx=axis==='z'?junction.x-Math.sign(dz)*2:x,hz=axis==='x'?junction.z+Math.sign(dx)*2:z;
      line(new T.Vector3(x,6.9,z),new T.Vector3(hx,6.9,hz),.1,'#384443');
      line(new T.Vector3(x,5.8,z),new T.Vector3(x+(hx-x)*.4,6.9,z+(hz-z)*.4),.045,'#384443');
      cylinder(.06,.35,'#384443',hx,6.725,hz);
      const head=new T.Group();head.position.set(hx,5.5,hz);head.rotation.y=axis==='x'?face*Math.PI/2:face<0?Math.PI:0;town.add(head);
      box(.87,2.22,.35,'#d6a944',0,0,0,head);
      box(.71,2.06,.08,'#202c2b',0,0,.21,head);
      for(let i=0;i<3;i++){
        const y=.64-i*.64;
        const rim=cylinder(.285,.09,'#131e1d',0,y,.28,head);rim.rotation.x=Math.PI/2;
        const lens=cylinder(.215,.055,signalColors[i],0,y,.34,head);lens.rotation.x=Math.PI/2;
        box(.58,.055,.29,'#202c2b',0,y+.28,.35,head);
      }
    }
    obstacles.push({x,z,w:.45,d:.45});
  }
  const squareArrival={x:95,z:-35},arcadeDoor={x:103,z:-48};

  // Steady welcoming pools connect learning venues and the surrounding streets.
  // These are painted light, not extra real-time lights or shadow passes.
  const windowSources=['#365b56','#3d625c','#274c48'].map(color=>mat(color));
  for(const material of windowSources){material.emissive.set('#ffd294');material.emissiveIntensity=0;}
  const windowPaint=new T.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:.85,emissive:'#ffd294',emissiveIntensity:0});materials.push(windowPaint);
  const lampLens=mat('#ffe8ae');lampLens.emissive.set('#ffd294');lampLens.emissiveIntensity=0;
  type LampSite={x:number;z:number;ground:number;region?:'pier'|'north-beach'|'market'|'garden';poolDepth?:number};
  const lampSites:LampSite[]=[];
  const lampCandidates:LampSite[]=[{x:79,z:-45,ground:.075},{x:108,z:-45,ground:.075},{x:62,z:-28,ground:.075},{x:113,z:-22,ground:.075}];
  const litVenues=new Set(['COACHES','HISTORY MUSEUM','CAFE BY THE SEA','PARK LIBRARY','COMMUNITY WORKSHOP','COAST CAFÉ','BEACH KITCHEN','ISLAND HIGH SCHOOL']);
  for(const building of buildings)if(litVenues.has(building.name))lampCandidates.push({x:building.x+building.w*.35,z:building.z+building.d/2+2.5,ground:.075});
  // Destination paths need their own sites: road sampling misses the coast and allotments.
  // Landward bench/volleyball edge; leave the middle and ocean railing clear.
  // Narrow pools remain on the actual eight-metre wooden deck.
  for(const x of [52,76,100,124,148,176,196,222])lampCandidates.push({x,z:208.9,ground:.025,region:'pier',poolDepth:3});
  for(const [x,z]of [[-42,-184],[-42,-202],[-21,-215],[20,-219],[60,-218],[83,-183],[83,-203],[104,-216],[145,-210],[180,-202]])lampCandidates.push({x,z,ground:-.09,region:'north-beach'});
  for(const z of [14,42,70,112,140,168,190])lampCandidates.push({x:224.3,z,ground:z>=30?.025:-.022,region:'market'});
  for(const [x,z]of [[187,-36],[207,-36],[228,-26],[187,-13],[196,3],[228,1],[190,22],[218,23]])lampCandidates.push({x,z,ground:-.022,region:'garden'});
  // Alternate sidewalk edges every 32m. Round-robin sampling spreads the bounded
  // budget among roads, rather than filling the first district in build order.
  const streetRows=roads.map((r,index)=>{
    const length=r.vertical?r.d:r.w,count=Math.max(1,Math.floor((length-12)/32));
    return Array.from({length:count},(_,i)=>{
      const along=-length/2+(i+.5)*length/count,side=(i+index)%2?1:-1;
      const offset=(r.vertical?r.w:r.d)/2-.6;
      return {x:r.x+(r.vertical?side*offset:along),z:r.z+(r.vertical?along:side*offset),ground:.035};
    });
  });
  for(let i=0;i<Math.max(0,...streetRows.map(row=>row.length));i++)for(const row of streetRows)if(row[i])lampCandidates.push(row[i]);
  for(const site of lampCandidates){
    const onPierDeck=site.region==='pier'&&site.x>=48&&site.x<=225&&site.z>=208&&site.z<=214;
    if(lampSites.length>=96||(!onIsland(site.x,site.z)&&!onPierDeck)||lampSites.some(p=>Math.hypot(p.x-site.x,p.z-site.z)<12)
      ||asphaltRects.some(r=>Math.abs(site.x-r.x)<r.w/2+.45&&Math.abs(site.z-r.z)<r.d/2+.45)
      ||roadJunctions.some(j=>Math.abs(site.x-j.x)<8&&Math.abs(site.z-j.z)<8)
      ||obstacles.some(o=>Math.abs(site.x-o.x)<o.w/2+.5&&Math.abs(site.z-o.z)<o.d/2+.5))continue;
    lampSites.push(site);const {x,z}=site,base=site.ground-.015;
    // Tiny poles need no additional shadow geometry. They join existing spatial
    // material batches; all pools reuse the same small texture below.
    cylinder(.19,.22,'#384443',x,base+.11,z).castShadow=false;cylinder(.065,4.2,'#384443',x,base+2.1,z).castShadow=false;
    box(.62,.12,.62,'#384443',x,base+4.22,z).castShadow=false;box(.43,.32,.43,'#ffe8ae',x,base+3.99,z).castShadow=false;
    obstacles.push({x,z,w:.38,d:.38});assets.push({kind:'street-lamp',x,z,w:.38,d:.38,visualW:.65,visualD:.65});
  }
  // South-end practice floodlights point north at the rebound wall. Keep poles
  // outside the marked playing width and leave the direct approach unobstructed.
  for(const x of [141,171]){
    cylinder(.1,5.4,'#384443',x,2.7,-8.6).castShadow=false;
    const bank=box(1.5,.65,.3,'#384443',x,5.3,-8.6);bank.rotation.x=-.24;bank.castShadow=false;
    const lens=box(1.22,.43,.045,'#ffe8ae',x,5.28,-8.77);lens.rotation.x=-.24;lens.castShadow=false;
    obstacles.push({x,z:-8.6,w:.3,d:.3});assets.push({kind:'practice-light',x,z:-8.6,w:.3,d:.3,visualW:1.5,visualD:.5});
  }
  // Low bed stakes sit inside existing bed obstacles, never narrowing paths.
  for(let row=0;row<3;row++)for(let col=0;col<4;col++){
    const x=192+col*10,z=-28+row*11;
    cylinder(.035,.5,'#384443',x+2.35,.86,z+2.35).castShadow=false;
    box(.22,.12,.22,'#ffe8ae',x+2.35,1.12,z+2.35).castShadow=false;
  }
  const signStates=nightSigns.map(material=>({material,intensity:material.emissiveIntensity}));

  // Spatial/material batches preserve culling: a distant city's meshes never share
  // one giant visible bounding sphere with the current neighborhood.
  town.traverse(o=>{if(o instanceof T.Mesh&&o.geometry instanceof T.ConeGeometry&&o.geometry.parameters.radius>1.5&&o.geometry.parameters.height<=1){const b=buildings.find(b=>Math.abs(o.position.x-b.x)<b.w/2&&Math.abs(o.position.z-b.z)<b.d/2&&o.position.y>b.height);umbrellaReaction.register(o,b?.height??0,o.userData.umbrellaTargets??[]);}});
  town.updateMatrixWorld(true);
  const roofObstacles:(Obstacle&{floor:number;top:number;noLanding?:boolean})[]=[...museumRails,...arenaRails];
  const roofBounds=new T.Box3();
  town.traverse(object=>{
    if(!(object instanceof T.Mesh)||object.userData.skipRoofObstacle)return;
    roofBounds.setFromObject(object);
    const w=roofBounds.max.x-roofBounds.min.x,d=roofBounds.max.z-roofBounds.min.z;
    if(object.geometry instanceof T.ConeGeometry&&object.geometry.parameters.radius>1.5&&object.geometry.parameters.height<=1){roofObstacles.push({x:(roofBounds.min.x+roofBounds.max.x)/2,z:(roofBounds.min.z+roofBounds.max.z)/2,w,d,floor:0,top:0,noLanding:true});}
    if(w<.5||d<.5)return; // Low parapets can be stepped over at the roof edge.
    const x=(roofBounds.min.x+roofBounds.max.x)/2,z=(roofBounds.min.z+roofBounds.max.z)/2;
    const roof=buildings.find(b=>Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2&&roofBounds.min.y>=b.height-.3&&roofBounds.max.y>b.height+.4);
    if(roof)roofObstacles.push({x,z,w,d,floor:roof.height,top:roofBounds.max.y,noLanding:x>=191&&x<=209&&z>=127&&z<=166});
  });
  const batches=new Map<string,{material:T.Material;castShadow:boolean;geometries:T.BufferGeometry[]}>(),original:T.Mesh[]=[],mergedMeshes:T.Mesh[]=[];
  // Plain palette paints share the same shader. Store paint in linear vertex
  // colors so each neighborhood needs fewer draws, without changing its light.
  // Textures and animated emissive signs/lenses retain their own materials.
  const paints=new Set<T.Material>(palette.values());
  const paintBatches=new Map<string,T.MeshStandardMaterial>();
  const paintMaterials=new Map<T.Material,T.MeshStandardMaterial>();
  for(const source of paints){
    const m=source as T.MeshStandardMaterial;
    if(m.map||m.emissive.getHex()!==0||m.transparent||m.vertexColors)continue;
    const settings=m.toJSON();
    const key=JSON.stringify({...settings,uuid:undefined,metadata:undefined,color:undefined});
    let shared=paintBatches.get(key);
    if(!shared){shared=m.clone();shared.color.set(0xffffff);shared.vertexColors=true;paintBatches.set(key,shared);materials.push(shared);}
    paintMaterials.set(m,shared);
  }
  // Three original glass colors still appear by day, carried in vertex colors;
  // at night they share one warm emissive uniform and one batch per city chunk.
  for(const source of windowSources)paintMaterials.set(source,windowPaint);
  const position=new T.Vector3();
  town.traverse(object=>{
    if(!(object instanceof T.Mesh)||object.userData.umbrellaAnimated||object.parent===ferry||waves.includes(object)||Array.isArray(object.material))return;
    object.getWorldPosition(position);
    const paint=object.castShadow?paintMaterials.get(object.material):undefined;
    const material=paint??object.material;
    const key=`${Math.floor(position.x/50)}:${Math.floor(position.z/50)}:${material.uuid}:${object.castShadow}`;
    const geom=object.geometry.clone().applyMatrix4(object.matrixWorld);
    if(paint){
      const color=(object.material as T.MeshStandardMaterial).color;
      const colors=new Float32Array(geom.getAttribute('position').count*3);
      for(let i=0;i<colors.length;i+=3){colors[i]=color.r;colors[i+1]=color.g;colors[i+2]=color.b;}
      geom.setAttribute('color',new T.BufferAttribute(colors,3));
    }
    if(!geom.getAttribute('uv'))geom.setAttribute('uv',new T.Float32BufferAttribute(new Float32Array(geom.getAttribute('position').count*2),2));
    if(!geom.index)geom.setIndex(Array.from({length:geom.getAttribute('position').count},(_,i)=>i));
    let batch=batches.get(key);if(!batch){batch={material,castShadow:object.castShadow,geometries:[]};batches.set(key,batch);}batch.geometries.push(geom);original.push(object);
  });
  for(const [key,{material,castShadow,geometries}] of batches){
    const merged=mergeGeometries(geometries);
    if(merged){merged.computeBoundingSphere();const mesh=new T.Mesh(merged,material);mesh.name='island-chunk-'+key;mesh.castShadow=castShadow;mesh.receiveShadow=true;mesh.matrixAutoUpdate=false;mesh.matrixWorldAutoUpdate=false;scene.add(mesh);mergedMeshes.push(mesh);}
    geometries.forEach(g=>g.dispose());
  }
  original.forEach(m=>{m.removeFromParent();m.geometry.dispose();});
  const nightRoot=new T.Group();nightRoot.name='night-atmosphere';scene.add(nightRoot);
  const nightPools=new T.Group();nightPools.name='night-light-pools';nightPools.visible=false;nightRoot.add(nightPools);
  // One 32px radial texture, generated once, for all selected ground pools.
  // Separate spatial chunks retain local culling instead of one island-sized bound.
  const poolCanvas=document.createElement('canvas');poolCanvas.width=poolCanvas.height=32;
  const poolCtx=poolCanvas.getContext('2d')!,gradient=poolCtx.createRadialGradient(16,16,0,16,16,16);
  gradient.addColorStop(0,'rgba(255,213,140,.56)');gradient.addColorStop(.3,'rgba(255,197,110,.34)');gradient.addColorStop(.7,'rgba(255,183,92,.09)');gradient.addColorStop(1,'rgba(255,196,112,0)');poolCtx.fillStyle=gradient;poolCtx.fillRect(0,0,32,32);
  const poolTexture=new T.CanvasTexture(poolCanvas);poolTexture.colorSpace=T.SRGBColorSpace;textures.push(poolTexture);
  const poolMaterial=new T.MeshBasicMaterial({map:poolTexture,transparent:true,depthWrite:false,blending:T.AdditiveBlending,toneMapped:false});materials.push(poolMaterial);
  const poolGeometry=new T.PlaneGeometry(1,1);poolGeometry.rotateX(-Math.PI/2);
  const poolChunks=new Map<string,typeof lampSites>();
  for(const site of lampSites){const key=Math.floor(site.x/50)+':'+Math.floor(site.z/50);let chunk=poolChunks.get(key);if(!chunk){chunk=[];poolChunks.set(key,chunk);}chunk.push(site);}
  const poolMatrix=new T.Matrix4(),poolPosition=new T.Vector3(),poolScale=new T.Vector3(10,1,10),poolRotation=new T.Quaternion();
  for(const [key,sites] of poolChunks){
    const mesh=new T.InstancedMesh(poolGeometry,poolMaterial,sites.length);mesh.name='night-pool-chunk-'+key;
    for(let i=0;i<sites.length;i++){const site=sites[i];poolPosition.set(site.x,site.ground,site.z);poolScale.set(10,1,site.poolDepth??10);poolMatrix.compose(poolPosition,poolRotation,poolScale);mesh.setMatrixAt(i,poolMatrix);}
    mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();mesh.matrixAutoUpdate=false;nightPools.add(mesh);
  }
  const detailPools=new T.Group();detailPools.name='night-detail-pools';nightPools.add(detailPools);
  const bedPoolMaterial=poolMaterial.clone();bedPoolMaterial.opacity=.3;materials.push(bedPoolMaterial);
  const bedPools=new T.InstancedMesh(poolGeometry,bedPoolMaterial,12);bedPools.name='garden-bed-glows';
  for(let i=0;i<12;i++){poolPosition.set(192+(i%4)*10,.625,-28+Math.floor(i/4)*11);poolScale.set(5.5,1,5.5);poolMatrix.compose(poolPosition,poolRotation,poolScale);bedPools.setMatrixAt(i,poolMatrix);}
  bedPools.computeBoundingSphere();bedPools.matrixAutoUpdate=false;detailPools.add(bedPools);
  const wallPoolMaterial=poolMaterial.clone();wallPoolMaterial.opacity=.42;materials.push(wallPoolMaterial);
  const practicePools=new T.InstancedMesh(poolGeometry,wallPoolMaterial,4);practicePools.name='practice-wall-light-wash';
  for(let i=0;i<4;i++){
    const wall=i>=2;poolPosition.set(i%2?162:150,wall?1.2:-.017,wall?-29.31:-20);
    poolScale.set(wall?15:17,1,wall?4.4:21);
    poolRotation.setFromAxisAngle(new T.Vector3(1,0,0),wall?Math.PI/2:0);
    poolMatrix.compose(poolPosition,poolRotation,poolScale);practicePools.setMatrixAt(i,poolMatrix);
  }
  practicePools.computeBoundingSphere();practicePools.matrixAutoUpdate=false;detailPools.add(practicePools);
  nightRoot.userData.detailPoolCount=16;
  nightRoot.userData.lampSites=lampSites;nightRoot.userData.lampCount=lampSites.length;nightRoot.userData.poolChunkCount=poolChunks.size;
  const sceneryRoots=scene.children.filter(root=>!existingRoots.has(root));
  return {ferry,ferryBounds:new T.Box3(new T.Vector3(241.5,-.4,190),new T.Vector3(250.5,5.1,208)),ferryLockBounds:new T.Box3(new T.Vector3(243,6.8,196),new T.Vector3(249,12.4,202)),setFerryLockHovered:(hovered:boolean)=>{lockMaterial.opacity=hovered?1:.48;},setVisible:(visible:boolean)=>{for(const root of sceneryRoots)root.visible=visible;},dynamicScenery:town,umbrellaReaction,arenaBounds:new T.Box3(new T.Vector3(ar.x-ar.w/2,0,ar.z-ar.d/2),new T.Vector3(ar.x+ar.w/2,ar.height+5,ar.z+ar.d/2)),updateFerry,museumBounds:new T.Box3(new T.Vector3(152.7,0,176.2),new T.Vector3(183.3,8.8,185.8)),walkSurfaces,updateWater:waterRipples.update,updateTrafficSignals:(mode:string)=>{const night=mode==='night',dusk=mode==='sunset';for(const lens of signalLenses)lens.emissiveIntensity=night?.85:dusk?.55:.35;const glow=night?.82:dusk?.16:0;const windowColor=night?'#ffc176':'#ffd294';windowPaint.emissive.set(windowColor);windowPaint.emissiveIntensity=glow;for(const material of windowSources){material.emissive.set(windowColor);material.emissiveIntensity=glow;}lampLens.emissive.set(night?'#ffcb82':'#ffd294');lampLens.emissiveIntensity=night?1.7:dusk?.4:0;for(const state of signStates)state.material.emissiveIntensity=Math.max(state.intensity,night?.75:dusk?.12:0);for(const material of gardenPlantMaterials.values())material.emissiveIntensity=night?.09:0;nightPools.visible=night;},coachesBounds:new T.Box3(new T.Vector3(149.7,0,-49.3),new T.Vector3(172.3,11,-36.4)),arcadeBounds:new T.Box3(new T.Vector3(95.7,0,-65.3),new T.Vector3(110.3,10.3,-52.3)),storeBounds:new T.Box3(new T.Vector3(77.7,0,-65.3),new T.Vector3(92.3,10.5,-52.4)),storeDoor:{x:85,z:-50},walls:[...buildings.map(b=>({...b,top:b.height,floor:0})),...roofObstacles,{x:156,z:-29.5,w:26,d:.35,top:2.4,floor:0}],obstacles,roofObstacles,waves,oceanMat,squareArrival,arcadeDoor,buildings,roads,roadJunctions,assets,surfaceAreas,destinations,updateArcade:(time:number,reduced:boolean)=>{const pulse=reduced?.5:(Math.sin(time*Math.PI*2)+1)/2;arcadeBulbs[0].emissiveIntensity=.25+pulse*1.75;arcadeBulbs[1].emissiveIntensity=2-pulse*1.75;},dispose:()=>{nightPools.traverse(o=>{if(o instanceof T.InstancedMesh)o.dispose();});nightRoot.removeFromParent();poolGeometry.dispose();umbrellaReaction.dispose();ferry.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Points)o.geometry.dispose();});ferry.removeFromParent();water.removeFromParent();water.geometry.dispose();for(const mesh of mergedMeshes){mesh.removeFromParent();mesh.geometry.dispose();}textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());}};
}
