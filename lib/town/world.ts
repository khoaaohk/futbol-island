import {createUmbrellaReaction} from '../graphics/umbrellaReaction';
import {ARENA_BLOCKS,ARENA_QUEUES,KNOCKOUT_ROOF} from '../games/rooftopKnockout';
import {FERRY_RAMP,FERRY_DECK} from './ferryBoarding';
import {buildEastCoast} from './eastCoast';
import {buildEastPier} from './eastPierWorld';
import {buildCoralCay} from './coralCayWorld';
import {createCaySharks} from '../graphics/caySharks';
import {createFarmDecor} from '../graphics/farmDecor';
import {fadeBand} from './shallows';
import {buildFarmersMarket} from './farmersMarket';
import {createWaterRipples} from '../graphics/waterRipples';
import * as T from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {COACHES_DOOR,VENUES,FIELD_SURFACE_Y} from './venues';
import {fieldLightLayout} from './fieldLightLayout';
import {ISLAND_SHORE,NORTH_BEACH_UMBRELLAS,NORTH_BEACH_PATHS,onIsland} from './shoreline';
import { Obstacle } from './simulation';

export function buildTown(scene: T.Scene) {
  const existingRoots=new Set(scene.children);
  const umbrellaReaction=createUmbrellaReaction();
  const town = new T.Group(); scene.add(town);
  const museumRails:(Obstacle&{floor:number;top:number})[]=[];
  const walkSurfaces:(Obstacle&{height:number})[]=[];
  const landingExclusions:Obstacle[]=[];
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

  // Arcade roof neon. Letters are polylines in a 1.3 m cap height; every tube
  // segment is a cylinder with a sphere at each joint, merged into one geometry.
  function buildArcadeNeon(){
    type P=[number,number];
    const arc=(cx:number,cy:number,rx:number,ry:number,a0:number,a1:number,n=12):P[]=>Array.from({length:n+1},(_,i)=>{const a=a0+(a1-a0)*i/n;return [cx+Math.cos(a)*rx,cy+Math.sin(a)*ry] as P;});
    const H=1.3,W=1.05,gap=.42,letters:P[][][]=[
      [[[0,0],[W/2,H],[W,0]],[[.2,.46],[W-.2,.46]]],
      [[[0,0],[0,H],[.58,H],...arc(.58,H-.34,.36,.34,Math.PI/2,-Math.PI/2,10).slice(1),[0,H-.68]],[[.42,H-.68],[W,0]]],
      [arc(.6,H/2,.56,H/2,Math.PI*.28,Math.PI*1.72,16)],
      [[[.36,0],[0,0],[0,H],[.36,H],...arc(.36,H/2,.66,H/2,Math.PI/2,-Math.PI/2,14).slice(1)]],
      [[[W-.05,H],[0,H],[0,0],[W-.05,0]],[[0,H/2],[W-.25,H/2]]],
    ],word=[0,1,2,0,3,4],total=word.length*W+(word.length-1)*gap;
    const strokes:{pts:P[];color:string}[]=[];
    // k sizes the letters to the neighbouring STORE sign's lettering (~0.9 m caps).
    const k=.68;word.forEach((glyph,i)=>{const ox=-total/2+i*(W+gap),oy=-H/2+.04;for(const line of letters[glyph])strokes.push({pts:line.map(([x,y])=>[(x+ox)*k,(y+oy)*k] as P),color:'#ff4fb4'});});
    const bw=7.5,bh=1.56,r=.22;
    strokes.push({pts:[...arc(bw/2-r,bh/2-r,r,r,0,Math.PI/2,5),...arc(-bw/2+r,bh/2-r,r,r,Math.PI/2,Math.PI,5),...arc(-bw/2+r,-bh/2+r,r,r,Math.PI,Math.PI*1.5,5),...arc(bw/2-r,-bh/2+r,r,r,Math.PI*1.5,Math.PI*2,5),[bw/2,bh/2-r]],color:'#3fe6ff'});
    const tube=(radius:number,colored:boolean)=>{
      const parts:T.BufferGeometry[]=[],up=new T.Vector3(0,1,0),c=new T.Color();
      const paint=(g:T.BufferGeometry,color:string)=>{if(!colored)return g;c.set(color);const n=g.getAttribute('position').count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set([c.r,c.g,c.b],i*3);g.setAttribute('color',new T.BufferAttribute(a,3));return g;};
      for(const {pts,color} of strokes)pts.forEach(([x,y],i)=>{
        parts.push(paint(new T.SphereGeometry(radius,8,6).translate(x,y,0),color));
        if(i===0)return;const [px,py]=pts[i-1],a=new T.Vector3(px,py,0),b=new T.Vector3(x,y,0),len=a.distanceTo(b);if(len<1e-3)return;
        const g=new T.CylinderGeometry(radius,radius,len,8,1,true);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(up,b.clone().sub(a).normalize()));g.translate((px+x)/2,(py+y)/2,0);parts.push(paint(g,color));
      });
      for(const g of parts)g.deleteAttribute('uv');
      const merged=mergeGeometries(parts)!;parts.forEach(g=>g.dispose());return merged;
    };
    // Tubes ignore scene light and tone mapping, so they read as lit glass day and night.
    const glass=new T.MeshBasicMaterial({vertexColors:true,toneMapped:false});materials.push(glass);
    const tubes=new T.Mesh(tube(.052,true),glass);tubes.castShadow=false;tubes.receiveShadow=false;tubes.name='arcade-neon-tubes';
    // Darker, fatter tube behind: the unlit glass/mounting that gives the letters depth.
    const backing=new T.Mesh(tube(.078,false),mat('#3a2340'));backing.name='arcade-neon-backing';
    // Halo: the same strokes blurred once into a canvas, added on top of the dark board.
    const canvas=document.createElement('canvas'),scale=80,cw=9.3,ch=3.2;canvas.width=Math.round(cw*scale);canvas.height=Math.round(ch*scale);
    const ctx=canvas.getContext('2d')!;ctx.lineCap=ctx.lineJoin='round';
    const trace=(width:number,alpha:number,blur:number)=>{for(const {pts,color} of strokes){ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.globalAlpha=alpha;ctx.lineWidth=width;ctx.beginPath();pts.forEach(([x,y],i)=>{const px=(x+cw/2)*scale,py=(ch/2-y)*scale;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);});ctx.stroke();}};
    trace(40,.28,48);trace(18,.5,26);trace(8,.7,10);
    const glowTexture=new T.CanvasTexture(canvas);glowTexture.colorSpace=T.SRGBColorSpace;textures.push(glowTexture);
    const glow=new T.MeshBasicMaterial({map:glowTexture,transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false,opacity:.8});materials.push(glow);
    const halo=new T.Mesh(new T.PlaneGeometry(cw,ch),glow);halo.castShadow=false;halo.receiveShadow=false;halo.renderOrder=1;halo.name='arcade-neon-halo';
    return {tubes,backing,halo,glow};
  }
  let arcadeNeonGlow:T.MeshBasicMaterial|null=null;

  // A single ocean surrounds the curved foundation on every side.
  const waterRipples=createWaterRipples();textures.push(waterRipples.texture);
  const oceanMat=new T.MeshStandardMaterial({color:'#368eb3',map:waterRipples.texture,emissive:'#185a94',emissiveIntensity:.3,roughness:.52,metalness:.02});materials.push(oceanMat);
  // 1800 m wide since Coral Cay (x up to ~770): the east edge stays past the camera's 500 m far plane from the cay. UVs are
  // stretched with the width so the ripple tiles keep their size (texture repeat is set for 1400 m).
  const oceanGeometry=new T.PlaneGeometry(1800,1400),oceanUv=oceanGeometry.getAttribute('uv');for(let i=0;i<oceanUv.count;i++)oceanUv.setX(i,oceanUv.getX(i)*1800/1400);
  const water=new T.Mesh(oceanGeometry,oceanMat);water.rotation.x=-Math.PI/2;water.position.set(270,-.43,10);
  // Shallows (Sep 29 2026): ONE shared lit material with per-vertex colour + alpha, fading from a light tint at the shore
  // to fully transparent at sea. Used round the main coast, the causeway, the sandbars and Coral Cay. Its pieces join the
  // 50 m spatial batches like any other mesh (one draw per chunk in view); depthWrite off, drawn after the opaque sea.
  const shallowMat=new T.MeshStandardMaterial({vertexColors:true,transparent:true,depthWrite:false,roughness:.52,metalness:.02});materials.push(shallowMat);
  const SHALLOW_Y=-.416;
  const shallows=(g:T.BufferGeometry,x:number,z:number)=>{const m=new T.Mesh(g,shallowMat);m.position.set(x,SHALLOW_Y,z);m.castShadow=false;m.receiveShadow=true;m.userData.skipRoofObstacle=true;town.add(m);return m;};water.name='surrounding-ocean';scene.add(water);
  const waves:T.Mesh[]=[];
  for(let i=0;i<30;i++){const w=box(.055,.008,8+(i%5)*2,'#a9d9ed',-88-(i%6)*5,-.405,-300+i*13);w.rotation.y=.12;waves.push(w);}
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
    const radius=buildingRadius(label),rounded=radius>0,knockout=label==='ROOFTOP KNOCKOUT',arcade=label==='ARCADE',front=w-radius*2;
    if(rounded){roundedBlock(w,h,d,radius,color,x,0,z);roundedBlock(w+.45,.23,d+.5,radius+.2,'#eddfbb',x,h-.035,z);roundedBlock(w+.15,.35,d+.16,radius+.1,'#d2bc94',x,.005,z);}
    else{box(w,h,d,color,x,h/2,z);box(w+.45,.23,d+.5,'#eddfbb',x,h+.08,z);box(w+.15,.35,d+.16,'#d2bc94',x,.18,z);}
    obstacles.push({x,z,w,d,...(rounded?{cornerRadius:radius}:{})});
    const floors=Math.min(label==='CAFE BY THE SEA'?2:4,Math.floor(h/2.5)),columns=Math.max(2,Math.min(6,Math.floor(front/2)));
    for(let floor=0;floor<floors;floor++)for(let col=0;col<columns;col++){
      const xx=x-front/2+(col+.5)*front/columns, yy=1.35+floor*2.45;
      // The knockout stair occupies the western 21 m of this facade.
      if(knockout&&(floor===0||xx<x+w/2-5))continue;
      // Arcade: keep the wall above the double door clear of windows/balconies.
      if(arcade&&floor>0&&Math.abs(xx-x)<2.4)continue;
      box(.88,1.25,.06,'#365b56',xx,yy,z+d/2+.04);box(1.04,.09,.21,'#f0debb',xx,yy-.65,z+d/2+.1);
      if(!knockout&&floor>0&&col%2===0){box(1.4,.11,.7,'#e9cfa5',xx,yy-.64,z+d/2+.35);for(let q=-2;q<=2;q++)cylinder(.018,.55,'#647169',xx+q*.26,yy-.32,z+d/2+.65);box(1.4,.04,.045,'#526b5e',xx,yy-.04,z+d/2+.65);}
    }
    // Side windows remain visible from the follow camera.
    for(let floor=0;floor<floors;floor++)for(let k=0;k<3;k++)if(!knockout||k!==1)box(.065,1.22,.86,'#3d625c',x+w/2+.035,1.4+floor*2.45,z-d/2+(k+.5)*d/3);
    if(knockout)return; // Plain stair wall: no shopfront, balcony or awning projections.
    // The arcade's name lives on its roof neon only; its awning splits around the door.
    if(label&&!arcade)sign(label,front*.86,.62,x,2.45,z+d/2+.1);
    if(arcade)for(const side of [-1,1])for(let col=0;col<3;col++){const inner=2.35,span=(front/2-inner)/3,awning=box(span,.10,1.3,col%2?'#ecdcb8':accent,x+side*(inner+(col+.5)*span),2.08,z+d/2+.58);awning.rotation.x=.14;}
    else for(let col=0;col<8;col++){const awning=box(front/8,.10,1.3,col%2?'#ecdcb8':accent,x-front/2+(col+.5)*front/8,2.08,z+d/2+.58);awning.rotation.x=.14;}
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

  for(const [x,z] of [[-24,-.5],[-26,43]])table(x,z);

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
  path(31,52,6,14); // Ramp foot at z45 meets the north sidewalk at z59.
  for(const x of [27.85,34.15]){
    line(new T.Vector3(x,1.05,45),new T.Vector3(x,7.05,-5),.05,'#477c6a');
    for(let z=-5;z<=45;z+=5)box(.08,1.05,.08,'#477c6a',x,(45-z)*.12+.53,z);
    obstacles.push({x,z:20,w:.15,d:50});
  }
  // Roof furniture stays outside all field markings and safety runoff.
  for(const [x,z] of [[5,-7],[17,-7],[1,43]]){const n=town.children.length;bench(x,z);for(const child of town.children.slice(n))child.position.y+=6;}
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

  // Trees and footways sit directly on the shared island lawn.
  for(const [x,z] of [[14.4,-214],[14.4,-230],[14.4,-250],[56,-246],[56,-222],[16,-203],[42,-202]])tree(x,z);
  for(const [x,z] of [[18,-200],[24,-197],[32,-196]])path(x,z,8,3);

  shift(oldStart,-24,155);
  // Westward extension completes the park's streets with real bunting anchors.
  for(const [i,z] of [-109,-91,-73,-55].entries())house(-64,z,14,13,[10,11,9,8][i],['WEST END BOOKS','CASA DO SOL','MAKERS HOUSE','CORNER DELI'][i],i+44);
  street(-45,-80.25,85.5);street(-30.5,-37.5,29,false);
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
  // A framed, freestanding sign at the patio edge, with posts reaching the ground.
  box(6.2,.8,.14,'#9d805b',218,1.8,-38.3);
  for(const x of [215.3,220.7])cylinder(.075,2.15,'#9d805b',x,1.075,-38.3);
  sign('POST-MATCH TABLES',6,.65,218,1.8,-38.22,'#477c6a');
  obstacles.push({x:218,z:-38.3,w:6.2,d:.3});
  const schoolStart=checkpoint();
  // Eleven Park: a formal high-school campus with bigger club buildings and supporter cafés.
  const ex=15,ez=80;
  const eleven:[number,number,number,number,number,string][]=[
    [287,-112,18,15,11,'ARTS WING'],[285,-81,18,15,13,'CLASSROOMS'],[285,-55,18,18,10,'DINING HALL'],
    [415,-110,18,17,12,'SCHOOL OFFICES'],[415,-84,18,17,10,'LIBRARY'],[415,-55,18,18,13,'STUDENT CENTRE'],[415,-13.5,18,40,18,'CAFE BY THE SEA'],
    [281,-8.25,28,50.5,10,'ROOFTOP KNOCKOUT']
  ];eleven.forEach(([x,z,w,d,h,label],i)=>house(x+ex,z+ez,w,d,h,label,label==='ROOFTOP KNOCKOUT'?44:i+34));
  // One school, five touching volumes: the central hall is the summit and both
  // teaching wings descend into planted roof terraces. No per-frame garden work.
  const schoolX=365,schoolZ=-67;
  function schoolRoofRail(x:number,z:number,length:number,vertical:boolean,roof:number){
    const w=vertical?.075:length,d=vertical?length:.075;
    for(const y of [.65,1.2])box(w,.065,d,'#477c6a',x,roof+y,z);
    const count=Math.ceil(length/1.5);
    for(let i=0;i<=count;i++){
      const offset=-length/2+i*length/count;
      box(.07,1.2,.07,'#477c6a',x+(vertical?0:offset),roof+.6,z+(vertical?offset:0));
    }
    museumRails.push({x:x-230,z:z+80,w,d,floor:roof-.1,top:roof+1.3});
  }
  const schoolVolumes=[{dx:0,w:24,h:17,name:'ISLAND HIGH SCHOOL'},
    {dx:-18,w:12,h:13,name:'HIGH SCHOOL WEST WING'},{dx:18,w:12,h:13,name:'HIGH SCHOOL EAST WING'},
    {dx:-30,w:12,h:9,name:'HIGH SCHOOL WEST GARDEN'},{dx:30,w:12,h:9,name:'HIGH SCHOOL EAST GARDEN'}];
  for(const {dx,w,h,name} of schoolVolumes){
    const x=schoolX+dx,d=20,roof=h+.23;
    box(w,h,d,'#d6b58a',x,h/2,schoolZ);
    box(w,.5,d+.12,'#b88472',x,.25,schoolZ);
    box(w+.18,.23,d+.3,'#eddfbb',x,h+.115,schoolZ);
    buildings.push({x,z:schoolZ,w,d,height:roof,name});obstacles.push({x,z:schoolZ,w,d});
    // Deep green window bays, warm reveals and continuous floor bands tie all
    // five pieces together; the middle bay leaves room for the entrance portal.
    for(let y=2;y<h-1;y+=3.5){
      for(let col=0;col<w/3;col++){
        const xx=x-w/2+1.5+col*3;
        if(dx===0&&Math.abs(xx-schoolX)<4.6&&y<9)continue;
        for(const side of [-1,1]){
          const zz=schoolZ+side*(d/2+.04);
          box(2.05,2.1,.1,'#eddfbb',xx,y,zz);
          box(1.7,1.8,.13,'#365b56',xx,y,zz+side*.08);
          box(.09,1.8,.16,'#d2bc94',xx,y,zz+side*.16);
          box(2.2,.12,.4,'#eddfbb',xx,y-1.06,zz+side*.13);
        }
      }
      for(const side of [-1,1])box(w,.16,.26,'#eddfbb',x,y+1.35,schoolZ+side*10.08);
    }
    // Outer end walls carry the same window rhythm in the oblique island view.
    if(Math.abs(dx)===30)for(const z of [-73,-67,-61])for(const y of [2,5.5]){
      box(.12,2.1,2.05,'#eddfbb',x+Math.sign(dx)*6.05,y,z);
      box(.14,1.8,1.7,'#365b56',x+Math.sign(dx)*6.13,y,z);
    }
    for(const side of [-1,1]){
      box(w,.75,.22,'#d2bc94',x,roof+.375,schoolZ+side*9.7);
      box(w+.08,.12,.34,'#eddfbb',x,roof+.8,schoolZ+side*9.7);
      schoolRoofRail(x,schoolZ+side*9.7,w,false,roof);
    }
    if(dx===0){
      for(const side of [-1,1])for(const [z,length] of [[-73.975,5.45],[-63.025,11.45]])schoolRoofRail(x+side*(w/2-.15),z,length,true,roof);
      continue;
    }
    const end=x+Math.sign(dx)*(w/2-.15);
    // An open section aligns with the landing from the next lower roof.
    for(const [z,length] of [[-74.1,5.2],[-61.9,9.2]]){
      box(.22,.75,length,'#d2bc94',end,roof+.375,z);
      box(.34,.12,length,'#eddfbb',end,roof+.8,z);
      museumRails.push({x:end-230,z:z+80,w:.25,d:length,floor:roof,top:roof+.9});
    }
    for(const [z,length] of [[-73.975,5.45],[-63.025,11.45]])schoolRoofRail(end,z,length,true,roof);
    // North gardens retain the stepped silhouette; the south and middle stay
    // open for unimpeded walking between successive stair flights.
    for(const z of [-73]){
      const bedX=x+Math.sign(dx)*1.6;
      box(5.6,.55,2.8,'#bd7657',bedX,roof+.275,z);
      box(5.2,.06,2.4,'#9d805b',bedX,roof+.58,z);
      for(const ox of [-1.8,0,1.8]){
        const shrub=put(new T.IcosahedronGeometry(.95,0),ox===0?'#8baa69':'#477c6a',bedX+ox,roof+1.15,z);
        shrub.scale.set(1,.72,.85);
      }
    }
    // Short masonry piers articulate the terrace ends without rail grids.
    for(const z of [-76.65,-57.35])box(.55,1.05,.55,'#eddfbb',end,roof+.525,z);
  }
  // A tall civic entrance anchors the highest volume, with shaded double doors
  // and a football-learning motto readable from the school forecourt.
  box(10,9,.38,'#bd7657',schoolX,4.5,-56.8);
  box(8.5,7.8,.18,'#eddfbb',schoolX,4.1,-56.55);
  box(7.6,6.5,.16,'#365b56',schoolX,3.7,-56.39);
  for(const x of [schoolX-2.5,schoolX,schoolX+2.5])box(.16,6.5,.18,'#d2bc94',x,3.7,-56.25);
  box(7.6,.18,.18,'#d2bc94',schoolX,3.1,-56.25);
  box(12,.45,3,'#eddfbb',schoolX,4.1,-55.5);
  sign('ISLAND HIGH SCHOOL',20,1.35,schoolX,10,-56.77,'#477c6a');
  sign('LEARN THE GAME · PLAY TOGETHER',13,.65,schoolX,8.35,-56.5,'#bd7657');
  // Six real flights connect ground → garden → wing → central roof on both
  // sides. Rise stays below the walking solver's .35 m step limit. Stair bodies
  // are registered as surfaces, never mistaken for rooftop props by the batch scan.
  function schoolStair(x:number,base:number,top:number,landingX:number,landingW:number){
    const count=Math.ceil((top-base)/.30),run=.5,start=-69,width=2.6;
    const tread=(xx:number,z:number,w:number,d:number,height:number,visualX=xx,visualW=w)=>{
      const m=box(visualW,height-base,d,'#d2bc94',visualX,base+(height-base)/2,z);m.userData.skipRoofObstacle=true;
      walkSurfaces.push({x:xx-230,z:z+80,w,d,height,stepAccess:true});obstacles.push({x:xx,z,w,d});
    };
    // The receiving roof already draws the inner part of the landing. Stop
    // this mesh at its cornice edge so no two top faces occupy the same plane.
    // Keep continuous walk support across that join, including the overhang.
    const side=Math.sign(x-schoolX),outer=landingX+side*landingW/2;
    const receivingEdge=schoolX+side*(base===0?36:base<10?24:12),join=receivingEdge+side*.09;
    tread(landingX,-70,landingW,2,top,(outer+join)/2,Math.abs(outer-join));
    for(let i=0;i<count;i++){
      const height=top-(i+1)*(top-base)/count,z=start+(i+.5)*run;
      // Last tread is raised one rise: the top landing provides the final step.
      const y=height+(top-base)/count;
      tread(x,z,width,run,y);
      const lip=box(width,.025,.075,'#eddfbb',x,y+.015,z+run/2-.04);lip.userData.skipRoofObstacle=true;
      if(i%2===0)for(const side of [-1,1]){
        const post=box(.07,1.05,.07,'#477c6a',x+side*width/2,y+.525,z);post.userData.skipRoofObstacle=true;
      }
    }
    // Continuous narrow colliders keep descending walkers on the stairs.
    for(const side of [-1,1]){
      line(new T.Vector3(x+side*width/2,top+1.05,start),new T.Vector3(x+side*width/2,base+1.05,start+count*run),.045,'#477c6a');
      museumRails.push({x:x+side*width/2-230,z:start+count*run/2+80,w:.1,d:count*run,floor:base,top:top+1.2});
    }
    // Back guard and short exposed end of the landing; the roof-facing end is open.
    for(const edge of [{x:landingX,z:-71,w:landingW,d:.1},{x:outer,z:-70,w:.1,d:2}]){
      schoolRoofRail(edge.x,edge.z,Math.max(edge.w,edge.d),edge.d>edge.w,top);
    }
  }
  for(const side of [-1,1]){
    schoolStair(schoolX+side*37.5,0,9.23,schoolX+side*36.5,4.6);
    schoolStair(schoolX+side*26.2,9.23,13.23,schoolX+side*24.5,6);
    schoolStair(schoolX+side*14.2,13.23,17.23,schoolX+side*12.5,6);
  }
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

  // A continuous shaded frontage joins the terraces to the central entrance.
  path(365,-54.5,73,5);
  for(const side of [-1,1])arcadeWalk(365+side*23,-55,26);
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
  // North-roof hangout: the stairs meet a clear east–west lane at z10 and the
  // entire south half remains open. Pergola beams never become a solid roof box.
  const schoolRoofY=17.23;
  const pergola={x:128.7,z:6.1,w:8.4,d:4.8};
  box(8.6,.045,5,'#c59b72',pergola.x,schoolRoofY+.025,pergola.z);
  for(const x of [124.5,132.9])for(const z of [3.7,8.5]){
    const post=box(.16,2.8,.16,'#9d805b',x,schoolRoofY+1.4,z);post.userData.skipRoofObstacle=true;
    museumRails.push({x,z,w:.18,d:.18,floor:schoolRoofY,top:schoolRoofY+2.85});
  }
  for(const z of [3.7,8.5]){const beam=box(8.8,.2,.2,'#9d805b',128.7,schoolRoofY+2.85,z);beam.userData.skipRoofObstacle=true;}
  for(let i=0;i<12;i++){
    const slat=box(.25,.12,5.2,i%3===0?'#eddfbb':'#d2bc94',124.65+i*.735,schoolRoofY+3,6.1);slat.userData.skipRoofObstacle=true;
  }
  // Cushions on low timber seats, two round tables and a small tabletop pitch.
  for(const [x,z,color] of [[126,4.65,'#bd7657'],[130.8,4.65,'#739568'],[125.6,7.2,'#678f8d'],[131.2,7.2,'#d69b61']] as [number,number,string][]){
    box(1.65,.18,1.15,'#9d805b',x,schoolRoofY+.13,z);
    box(1.55,.3,1.05,color,x,schoolRoofY+.37,z);
    const bolster=box(1.55,.36,.24,color,x,schoolRoofY+.65,z-.42);bolster.rotation.x=-.12;
  }
  for(const x of [127.6,129.7]){
    cylinder(.085,.73,'#477c6a',x,schoolRoofY+.365,6.15);
    cylinder(.66,.12,'#d2bc94',x,schoolRoofY+.79,6.15);
  }
  box(.72,.018,.42,'#477c6a',127.6,schoolRoofY+.86,6.15);
  for(const x of [127.27,127.6,127.93])box(.014,.012,.36,'#fff0cf',x,schoolRoofY+.878,6.15);
  for(const z of [5.97,6.33])box(.66,.012,.014,'#fff0cf',127.6,schoolRoofY+.878,z);
  // Small static bulbs reuse the same emissive material as existing street lamps.
  line(new T.Vector3(124.6,schoolRoofY+2.7,8.4),new T.Vector3(132.8,schoolRoofY+2.7,8.4),.018,'#477c6a');
  for(let i=0;i<8;i++){
    const bulb=put(new T.SphereGeometry(.09,6,4),'#ffe8ae',125+i*1.05,schoolRoofY+2.58,8.4);bulb.castShadow=false;bulb.userData.skipRoofObstacle=true;
  }
  // A painted-tile vending nook adds colour without changing the cabinet or its
  // unobstructed southern approach. The north plants and recycling stay out of it.
  box(7.6,.026,5.4,'#eddfbb',138.1,schoolRoofY+.018,6.3);
  for(let row=0;row<5;row++)for(let col=0;col<7;col++)if((row+col)%2===0)box(.9,.008,.9,(row+col)%4===0?'#678f8d':'#bd7657',135.1+col,schoolRoofY+.036,4.3+row);
  for(const [x,z] of [[135.4,4.4],[141,4.4]]){
    cylinder(.45,.65,'#bd7657',x,schoolRoofY+.325,z);
    put(new T.IcosahedronGeometry(.65,0),'#477c6a',x,schoolRoofY+1,z);
  }
  for(const [x,color] of [[141,'#477c6a'],[142.05,'#678f8d']] as [number,string][]){
    box(.68,.95,.65,color,x,schoolRoofY+.475,8);
    box(.74,.12,.71,'#d2bc94',x,schoolRoofY+1,8);
    box(.35,.05,.2,'#365b56',x,schoolRoofY+1.065,8);
  }
  sign('SORT & RECYCLE',2.15,.35,141.52,schoolRoofY+.65,8.36,'#477c6a');
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
  // Japanese convenience-store frontage: the market keeps its existing plot,
  // with a low flat canopy, wraparound stripe fascia and a glazed shopfront.
  {const x=46+sx,z=-5+sz,front=z+5;
   box(10,4.5,10,'#eee9d8',x,2.25,z);
   box(10.5,.22,10.6,'#d7ded7',x,4.61,z);
   box(10.5,.12,1.7,'#fff1d3',x,3.45,front+.55);
   box(10.5,.95,1.15,'#fff1d3',x,4.02,front+.35);
   // Continuous stripes read around both corners as on a neighbourhood konbini, in our own "しま KONBINI" colours (coral,
   // yellow, teal, matching the interior) rather than any real chain's stripe livery (Sep 29 2026).
   for(const [y,h,c] of [[4.31,.13,'#e8745f'],[4.15,.10,'#f2c14e'],[3.96,.2,'#2f8f8a']] as const){
    box(10.54,h,.06,c,x,y,front+.96);
    for(const side of [-1,1])box(.06,h,10.6,c,x+side*5.26,y,z+.25);
   }
   sign('KONBINI',3.15,.68,x-.3,4.08,front+1.01,'#fff7e5','#2f8f8a');
   // Window backing, bright shelves, aluminium frames and two sliding doors.
   box(9.4,2.7,.08,'#284e50',x,1.9,front+.04);
   for(const wx of [x-3.5,x+2.8]){
    box(2.5,2.2,.07,'#759f98',wx,1.8,front+.09);
    for(const y of [.9,1.55,2.2]){
     box(2.35,.08,.13,'#eee9d8',wx,y,front+.17);
     for(let i=0;i<5;i++)box(.25,.31,.08,['#f3d88e','#d78563','#b4ceab'][i%3],wx-1+i*.48,y+.20,front+.14);
    }
    box(.04,2.3,.06,'#dde6db',wx,1.8,front+.2);
   }
   const door=x-.55;
   for(const side of [-1,1]){
    box(.86,2.6,.08,'#87b1ad',door+side*.46,1.55,front+.22);
    box(.035,2.65,.06,'#e8e7d5',door+side*.92,1.55,front+.28);
    box(.86,.13,.04,'#fff1d3',door+side*.46,1.52,front+.28);
    box(.045,.5,.08,'#244d49',door+side*.12,1.4,front+.3);
   }
   box(.04,2.65,.06,'#e8e7d5',door,1.55,front+.28);
   box(2, .06,.1,'#e8e7d5',door,2.9,front+.28);
   box(2.15,.07,.75,'#879b92',door,.04,front+.35);
   for(const side of [-1,1])box(.18,3.2,.22,'#eee9d8',x+side*4.83,1.65,front+.14);
   sign('MATCH DAY',1.6,.55,x-3.5,2.65,front+.23,'#fff1d3','#247957');
   box(1.8,.65,1.3,'#bac5bc',x+2.6,4.98,z-2);
   for(let i=0;i<5;i++)box(1.3,.025,.05,'#536b65',x+2.6,5.32,z-2.4+i*.18);
   buildings.push({x,z,w:10,d:10,height:4.72,name:'KONBINI'});
   obstacles.push({x,z,w:10,d:10});
  }
  house(78+sx,-6+sz,14,12,6.2,'ARCADE',1);
  // Roof neon: static glass tubes on a dark board. One vertex-coloured unlit
  // tube mesh + one additive halo plane, drawn once; no lights, no loop.
  for(const dx of [-3,3])box(.16,2,.18,'#385a4e',78+sx+dx,7.2,-.2+sz);
  box(8.3,1.95,.34,'#1c2530',78+sx,8.3,.1+sz);box(8.6,.12,.42,'#385a4e',78+sx,9.3,.1+sz);box(8.6,.12,.42,'#385a4e',78+sx,7.3,.1+sz);
  const neon=buildArcadeNeon();arcadeNeonGlow=neon.glow;neon.tubes.position.set(78+sx,8.3,.36+sz);neon.backing.position.set(78+sx,8.3,.3+sz);neon.halo.position.set(78+sx,8.3,.28+sz);
  town.add(neon.backing,neon.halo,neon.tubes);
  box(4.1,3.35,.22,'#eddfbb',78+sx,1.72,.25+sz);box(3.4,2.94,.08,'#274c48',78+sx,1.5,.39+sz);box(.1,2.9,.1,'#d7c49e',78+sx,1.5,.47+sz);
  for(const dx of [-.3,.3])box(.07,.48,.1,'#f8d9a2',78+sx+dx,1.35,.56+sz);
  for(const side of [-1,1])for(const [dx,dy] of [[0,0],[-1,0],[1,0],[0,1],[0,-1]])box(.34,.34,.09,'#d69b61',78+sx+side*5.7+dx*.35,2.9+dy*.35,.4+sz);
  // Keep the square’s southern landing/runout lane clear; move its corner planter north-east.
  for(const [x,z] of [[165,-109],[215,-109],[165,-89],[218,-95]])planter(x,z);
  for(const [x,z] of [[177,-96],[213,-100],[212,-92]])table(x,z);
  for(const x of [181,210])bench(x,-90);


  shift(hubStart,-105,65);
  // Pocket futsal court fills the entire gap: Konbini ends at x76,
  // the arcade begins at x96. A central gate opens straight onto the square.
  {
   const cx=86,cz=-59;
   surfaceAreas.push({kind:'court',x:cx,z:cz,w:20,d:12});
   box(20,.10,12,'#477c6a',cx,0,cz);
   box(16,.012,9,'#648c72',cx,.057,cz);
   for(const z of [-63.5,-54.5])box(16,.014,.075,'#fff1d3',cx,.069,z);
   for(const x of [78,94,86])box(.075,.014,9,'#fff1d3',x,.069,cz);
   const circle=put(new T.RingGeometry(1.5,1.57,48),'#fff1d3',cx,.079,cz);circle.rotation.x=-Math.PI/2;circle.castShadow=false;
   cylinder(.09,.018,'#fff1d3',cx,.075,cz);
   // Wire cage with robust posts, fine mesh and a 2.4 m front entrance.
   const fence=(x:number,z:number,length:number,vertical=false)=>{
    const w=vertical?.12:length,d=vertical?length:.12;
    obstacles.push({x,z,w,d});arenaRails.push({x,z,w,d,floor:0,top:3.6});
    for(const y of [.16,3.6])box(vertical?.07:length,.07,vertical?length:.07,'#315b50',x,y,z);
    const count=Math.ceil(length/2.5);
    for(let i=0;i<=count;i++)box(.09,3.6,.09,'#315b50',x+(vertical?0:-length/2+i*length/count),1.8,z+(vertical?-length/2+i*length/count:0));
    for(let t=-length/2;t<=length/2;t+=.4)box(.018,3.5,.018,'#536b65',x+(vertical?0:t),1.82,z+(vertical?t:0)).castShadow=false;
    for(let y=.4;y<3.6;y+=.4)box(vertical?.018:length,.018,vertical?length:.018,'#536b65',x,y,z).castShadow=false;
   };
   fence(76,cz,12,true);fence(96,cz,12,true);fence(cx,-65,20);
   fence(80.4,-53,8.8);fence(91.6,-53,8.8);
   // Recessed mini goals at both ends, with shallow nets and penalty boxes.
   for(const side of [-1,1]){
    const gx=cx+side*8,back=gx+side*1.3,wall=cx+side*10;
    // Solid side nets and back (filled to the cage wall so nothing slips behind); the mouth stays open for the ball.
    for(const o of [{x:(gx+back)/2,z:cz-1.6,w:1.4,d:.12},{x:(gx+back)/2,z:cz+1.6,w:1.4,d:.12},{x:(back+wall)/2,z:cz,w:Math.abs(wall-back)+.1,d:3.32}]){obstacles.push(o);arenaRails.push({...o,floor:0,top:2.1});}
    for(const z of [cz-1.6,cz+1.6]){
     box(.10,2,.10,'#fff1d3',gx,1.07,z);
     box(1.3,.07,.07,'#fff1d3',(gx+back)/2,2.07,z);
     box(1.3,.07,.07,'#fff1d3',(gx+back)/2,.12,z);
    }
    box(.10,.10,3.3,'#fff1d3',gx,2.07,cz);
    for(let y=.15;y<=2.08;y+=.25)box(.022,.022,3.2,'#c3d1b9',back,y,cz).castShadow=false;
    for(let z=cz-1.6;z<=cz+1.61;z+=.25){box(.022,2,.022,'#c3d1b9',back,1.07,z).castShadow=false;box(1.3,.022,.022,'#c3d1b9',(gx+back)/2,2.07,z).castShadow=false;}
    for(const z of [cz-2.5,cz+2.5])box(2.5,.014,.07,'#fff1d3',gx-side*1.25,.069,z);
    box(.07,.014,5,'#fff1d3',gx-side*2.5,.069,cz);
   }
  }
  // Small konbini parking court west of the market. Open south entrance and
  // pedestrian strip connect to the square; all details join static batches.
  {const x=59.5,z=-58.75;
   // End at the storefront path; leave the existing grass and paths exposed below.
   surfaceAreas.push({kind:'path',x,z,w:11,d:13.5});
   box(11,.10,13.5,'#65716e',x,0,z);
   // Pale raised edging on the back and outside, leaving the drive mouth open.
   box(11,.16,.22,'#d2bc94',x,.05,-65.5);
   box(.22,.16,13.5,'#d2bc94',54,.05,z);
   box(1.05,.12,13.5,'#eddfbb',64.48,.01,z);
   for(let i=0;i<=3;i++)box(.09,.014,5.4,'#fff1d3',54.55+i*3.05,.062,-61.7);
   box(9.15,.014,.09,'#fff1d3',59.125,.062,-64.4);
   for(let i=0;i<3;i++){
    const bx=56.075+i*3.05;
    box(1.75,.18,.32,'#d2bc94',bx,.13,-63.55);
    for(const dx of [-.58,.58])box(.19,.018,.34,'#fff1d3',bx+dx,.229,-63.55);
    obstacles.push({x:bx,z:-63.55,w:1.75,d:.32});
   }
   // Painted pedestrian crossing from the bays to the storefront walkway.
   for(let i=0;i<6;i++)box(.32,.012,1.3,'#fff1d3',61.55+i*.55,.063,-54.2);
  }
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

  path(11,79,5,22);path(2.75,90,104.5,4);path(53,79.5,4,17);
  // Thin, curved pale shoreline follows the same outline as the land.
  for(let i=0;i<ISLAND_SHORE.length;i++){const a=ISLAND_SHORE[i],b=ISLAND_SHORE[(i+1)%ISLAND_SHORE.length];line(new T.Vector3(a.x,-.14,a.z),new T.Vector3(b.x,-.14,b.z),.12,'#f5e9cb');}
  // The same fading shallows round the main coast (outward normals, flipped like fishingVisuals' shoreline band).
  {const n=ISLAND_SHORE.length,normals=ISLAND_SHORE.map((p,i)=>{const a=ISLAND_SHORE[(i-1+n)%n],b=ISLAND_SHORE[(i+1)%n];let nx=b.z-a.z,nz=-(b.x-a.x);const l=Math.hypot(nx,nz)||1;nx/=l;nz/=l;if(onIsland(p.x+nx*2,p.z+nz*2)){nx=-nx;nz=-nz;}return {x:nx,z:nz};});
   for(let a=0;a<n;a+=10){const idx=Array.from({length:11},(_,k)=>(a+k)%n),mid=ISLAND_SHORE[idx[5]];shallows(fadeBand(idx.map(i=>ISLAND_SHORE[i]),idx.map(i=>normals[i]),.3,5.2,false,mid.x,mid.z),mid.x,mid.z);}}
  for(const [x,z] of [[-29,80],[-12,94],[35,96],[51,119],[51,138]])palm(x,z,5.5);
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
  const dockOutline=[{x:210,z:190},{x:238,z:190},{x:235,z:204},{x:235,z:207.2},{x:226.5,z:215},{x:210,z:215}];
  const dockShape=new T.Shape();dockOutline.forEach((p,i)=>i?dockShape.lineTo(p.x,-p.z):dockShape.moveTo(p.x,-p.z));dockShape.closePath();
  const dockGeo=new T.ShapeGeometry(dockShape);dockGeo.rotateX(-Math.PI/2);
  // Upward-facing planks share the pier material and lighting.
  put(dockGeo,'#b98f62',0,0,0);
  for(let x=210.4;x<238;x+=.6){const south=x<=226.5?215:x<=235?207.2+(235-x)*7.8/8.5:190+(238-x)*14/3;box(.025,.008,Math.max(.01,south-190),'#91704d',x,.004,(190+south)/2);}
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
  // The level paved forecourt meets the dock directly; no bridge or interior rails.
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
  path(46,150.5,4,117);path(90,188,88,4);path(135,190,5,40);
  for(let x=43;x<210;x+=6){
    const width=Math.min(6,210-x);box(width,.2,8,'#b98f62',x+width/2,-.1,211);
    for(let dx=.4;dx<width;dx+=.6)box(.025,.008,8,'#91704d',x+dx,.004,211);
    for(const z of [207.4,214.6])cylinder(.12,1.8,'#9d805b',x+.3,-.6,z);
  }
  for(let x=43;x<=209;x+=3){cylinder(.065,1.05,'#9d805b',x,.525,214.65);}
  line(new T.Vector3(43,1.05,214.65),new T.Vector3(210,1.05,214.65),.045,'#eddfbb');
  line(new T.Vector3(43,.55,214.65),new T.Vector3(210,.55,214.65),.032,'#eddfbb');
  obstacles.push({x:126.5,z:214.65,w:167,d:.16});
  for(const x of [43]){line(new T.Vector3(x,1.05,207),new T.Vector3(x,1.05,214.65),.045,'#eddfbb');obstacles.push({x,z:210.825,w:.16,d:7.65});}
  for(const x of [65,105,173,208.5])bench(x,208);
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
  bench(86,198);palm(88,203,5.5);
  sign('BEACH VOLLEYBALL',5.8,.7,84,1.8,191,'#477c6a');
  for(const x of [81.5,86.5])cylinder(.055,1.8,'#9d805b',x,.9,191);



  // Western infill completes a lived-in market street, facing the existing coastal
  // blocks. Its two junctions join the established road network, not a new enclave.
  street(-45,13.75,102.5);street(-29,65,32,false);
  for(const [z,h,label] of [[-18,8,'PRAÇA HOMES'],[2,9,'THE GROCER'],[22,7,'MARÉ WORKSHOP'],[42,8.5,'COAST APARTMENTS']] as [number,number,string][])house(-64,z,14,12,h,label,3);
  path(-62,62,24,15);table(-66,61);table(-59,66);bench(-71,65);
  planter(-70,55);planter(-53,56);tree(-76,62);
  house(-70,82,12,10,4.5,'BEACH KITCHEN',2);house(-49,83,12,10,5,'SURF & REPAIR',0);
  path(-62,97,25,13);table(-68,96);table(-58,96);bench(-71,101);
  path(-40.5,76,12,3);path(-36,83,3,14);
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
  path(190.75,190,30.5,4);path(204,177,4,30);path(204,205.25,4,3.5);
  path(200,169,12,4);
  for(const x of [99,118]){path(x,196,15,15);table(x-2,195);bench(x+4,200);}
  path(203.25,196,13.5,15);table(200,195);bench(207,200);
  // One rectangular museum forecourt, with a clear central route to the pier.
  path(168,194.5,15,18);path(168,205.25,4,3.5);
  table(163,195);bench(172,200);
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
  // Keep the shared island grass visible through the whole allotment area.
  // A separate tinted lawn slab made a hard rectangular colour seam here.
  surfaceAreas.push({kind:'garden',x:208,z:-5,w:54,d:70});
  // Low lawn tufts sit outside the paths, leaving the garden gates unobstructed.
  for(const [x,z] of [[184,-33],[184,-25],[184,-5],[184,5],[232,-33],[232,-23],[232,-12],[232,0],[232,7],[193,8],[220,8],[184,16],[184,25]]){
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

  // A broad garden glasshouse fills the southern lawn, leaving the school stair
  // corridor to its west and the existing market promenade to its east open.
  // Thin tinted panes share one non-refractive material and the static batches.
  const gh={x:202,z:19,w:28,d:18,eave:4.4,ridge:8.2};
  landingExclusions.push({x:gh.x,z:gh.z,w:28.4,d:18.4});
  // Glass is not a landing terrace: keeping it out of building roof surfaces
  // lets the existing walking solver pass underneath it through both doors.
  assets.push({kind:'greenhouse',x:gh.x,z:gh.z,w:gh.w,d:gh.d,canopyHeight:gh.ridge});
  for(const wall of [{x:188,z:19,w:.28,d:18},{x:216,z:19,w:.28,d:18},
    {x:194,z:10,w:12,d:.28},{x:210,z:10,w:12,d:.28},{x:194,z:28,w:12,d:.28},{x:210,z:28,w:12,d:.28}]){
    obstacles.push(wall);museumRails.push({...wall,floor:0,top:gh.eave});
  }
  box(28.4,.18,18.4,'#d2bc94',gh.x,-.06,gh.z);
  box(27.5,.08,17.5,'#bfae87',gh.x,.04,gh.z);
  box(3.8,.012,18,'#eddfbb',gh.x,.086,gh.z);
  const greenhouseGlass=new T.MeshStandardMaterial({color:'#a6d0bd',roughness:.28,metalness:.04,transparent:true,opacity:.32,depthWrite:false,side:T.DoubleSide});
  greenhouseGlass.forceSinglePass=true;materials.push(greenhouseGlass);
  function greenhousePane(points:[number,number,number][]){
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));
    const indices:number[]=[];for(let i=1;i<points.length-1;i++)indices.push(0,i,i+1);
    g.setIndex(indices);g.computeVertexNormals();g.setAttribute('uv',new T.Float32BufferAttribute(points.flatMap((_,i)=>[i%2,i>1?1:0]),2));
    const pane=new T.Mesh(g,greenhouseGlass);pane.position.set(gh.x,0,gh.z);pane.castShadow=false;pane.receiveShadow=false;town.add(pane);
  }
  // A low masonry plinth supports cream steel posts, dark green rails and gutters.
  for(const side of [-1,1]){
    for(const x of [194,210]){
      box(12,.65,.28,'#b88472',x,.425,gh.z+side*9);
      box(12,.15,.42,'#eddfbb',x,.82,gh.z+side*9);
      box(12,.13,.16,'#477c6a',x,2.35,gh.z+side*9);
    }
    box(28.25,.13,.16,'#477c6a',gh.x,gh.eave,gh.z+side*9);
    box(28.6,.22,.36,'#477c6a',gh.x,gh.eave+.03,gh.z+side*9.08);
    for(let bay=0;bay<7;bay++){
      const x0=-14+bay*4,x1=x0+4;
      for(const [y0,y1] of bay===3?[[3.5,gh.eave]]:[[.9,2.35],[2.35,gh.eave]])greenhousePane([[x0,y0,side*9],[x1,y0,side*9],[x1,y1,side*9],[x0,y1,side*9]]);
      // Each roof slope is divided by a continuous purlin halfway to the ridge.
      for(let half=0;half<2;half++){
        const z0=side*half*4.5,z1=side*(half+1)*4.5,y0=gh.ridge-half*1.9,y1=y0-1.9;
        greenhousePane([[x0,y0,z0],[x1,y0,z0],[x1,y1,z1],[x0,y1,z1]]);
      }
    }
    box(28.3,.13,.15,'#eddfbb',gh.x,6.3,gh.z+side*4.5);
    for(let i=0;i<=7;i++){
      const x=188+i*4;
      box(.16,3.65,.18,'#eddfbb',x,2.625,gh.z+side*9);
      line(new T.Vector3(x,gh.eave,gh.z+side*9),new T.Vector3(x,gh.ridge,gh.z),.085,'#eddfbb');
    }
  }
  box(28.4,.2,.22,'#477c6a',gh.x,gh.ridge+.03,gh.z);
  // Glazed gable ends expose the planting rows through a strong fan-shaped frame.
  for(const side of [-1,1]){
    const x=side*14;
    box(.3,.65,18,'#b88472',gh.x+x,.425,gh.z);
    for(const y of [.82,2.35,gh.eave])box(.2,.14,18,'#eddfbb',gh.x+x,y,gh.z);
    greenhousePane([[x,.9,-9],[x,.9,9],[x,gh.eave,9],[x,gh.eave,-9]]);
    greenhousePane([[x,gh.eave,-9],[x,gh.eave,9],[x,gh.ridge,0]]);
    for(const z of [-6,-3,0,3,6]){
      const top=gh.ridge-Math.abs(z)/9*(gh.ridge-gh.eave);
      box(.18,top-.8,.13,'#eddfbb',gh.x+x,(top+.8)/2,gh.z+z);
    }
  }
  // Three propped-open ridge vents and restrained pale reflections remain static.
  for(const x of [194,202,210]){
    const vent=box(3,.09,1.7,'#a6c9b5',x,7.97,17.5);vent.rotation.x=-.12;
    for(const dx of [-1.5,1.5]){const edge=box(.09,.14,1.75,'#477c6a',x+dx,7.97,17.5);edge.rotation.x=-.12;}
    for(const z of [16.65,18.35])box(3.1,.14,.09,'#477c6a',x,7.97+(z-17.5)*.12,z);
    for(const dx of [-1.35,1.35])line(new T.Vector3(x+dx,7.25,17),new T.Vector3(x+dx,7.95,16.65),.035,'#477c6a');
  }
  // Eight planted benches surround a broad central aisle, visible through glass.
  for(const x of [192,197,207,212])for(const z of [14.5,23.5]){
    box(3,.62,5.8,'#a67d55',x,.49,z);box(2.7,.09,5.5,'#6e5540',x,.85,z);
    obstacles.push({x,z,w:3,d:5.8});
    for(const dz of [-1.8,0,1.8]){
      const plant=put(new T.IcosahedronGeometry(.7,0),x<202?'#739568':'#477c6a',x,1.5,z+dz);plant.scale.set(1.3,.85,1);
      if(dz===0){cylinder(.035,1.65,'#9d805b',x,1.65,z);put(new T.IcosahedronGeometry(.2,0),'#bd7657',x+.35,1.6,z);}
    }
  }
  // Open double doors join a four-metre aisle from garden to boardwalk.
  // Door leaves stay outside the passage; no automatic door or animation loop.
  for(const side of [-1,1]){
    const z=gh.z+side*9;
    box(4.2,.15,.22,'#477c6a',gh.x,3.5,z);
    for(const x of [200,204]){
      box(.16,3.5,.16,'#477c6a',x,1.75,z);
      box(.1,3.1,1.6,'#97bcb0',x,1.75,z+side*.85);
      for(const y of [.2,3.3])box(.14,.12,1.75,'#477c6a',x,y,z+side*.85);
      box(.14,3.2,.12,'#477c6a',x,1.75,z+side*1.7);
      obstacles.push({x,z:z+side*.85,w:.16,d:1.7});
    }
  }
  sign('COMMUNITY GREENHOUSE',12,.85,gh.x,3.88,28.25,'#477c6a');
  sign('GROW & SHARE · MATCH-DAY TABLE',9,.48,gh.x,3.05,28.28,'#eddfbb','#365b56');
  path(202,19,3.8,24);destinations.push({name:'Community Greenhouse',x:202,z:29.3});

  destinations.push(buildFarmersMarket({box,cylinder,put,sign,path,obstacles,buildings,roads}));

  buildEastCoast({box,put,obstacles});
  // East Jetty (eastPierWorld.ts): static pieces join the same batches; its lamps join the night pools below.
  const eastPier=buildEastPier({box,cylinder,put,sign,shallows,obstacles,assets});destinations.push(eastPier.destination);
  // Coral Cay, its causeway and the two sandbar stops (lib/town/coralCayWorld.ts). Built before the batching pass below,
  // so it shares the same 50 m spatial paint batches; its lamps join the night pools after the lamp placement pass.
  const coralCay=buildCoralCay({box,cylinder,put,line,sign,palm,house,table,planter,path,districtSign,shallows,obstacles,buildings,assets,surfaceAreas});
  destinations.push(...coralCay.destinations);

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
  // Four inward-facing floodlights fixed to the shop/arcade walls.
  // Shared emissive lenses and baked floor washes avoid shadow-casting lights.
  for(const side of [-1,1])for(const z of [-61.6,-56.4]){
   const wall=side<0?76:96,x=wall-side*.48,y=side<0?4.05:4.8;
   box(.12,.52,.34,'#384443',wall-side*.04,y,z);
   box(.62,.08,.08,'#384443',wall-side*.31,y,z);
   const fixture=new T.Group();fixture.position.set(x,y,z);fixture.rotation.z=side*.62;town.add(fixture);
   box(.22,.55,1.04,'#384443',0,0,0,fixture);
   const lens=box(.025,.39,.88,'#ffe8ae',-side*.125,0,0,fixture);lens.material=lampLens;lens.castShadow=false;
   for(const dz of [-.24,0,.24])box(.03,.39,.018,'#d7ded7',-side*.145,0,dz,fixture).castShadow=false;
  }
  type LampSite={x:number;z:number;ground:number;region?:'pier'|'north-beach'|'market'|'garden'|'coral-cay'|'east-pier';poolDepth?:number;poolWidth?:number};
  const lampSites:LampSite[]=[];
  const lampCandidates:LampSite[]=[{x:79,z:-45,ground:.075},{x:108,z:-45,ground:.075},{x:62,z:-28,ground:.075},{x:113,z:-22,ground:.075}];
  const litVenues=new Set(['COACHES','HISTORY MUSEUM','CAFE BY THE SEA','PARK LIBRARY','COMMUNITY WORKSHOP','COAST CAFÉ','BEACH KITCHEN','ISLAND HIGH SCHOOL']);
  for(const building of buildings)if(litVenues.has(building.name))lampCandidates.push({x:building.x+building.w*.35,z:building.z+building.d/2+2.5,ground:.075});
  // Destination paths need their own sites: road sampling misses the coast and allotments.
  // Poles and their light pools sit on the lawn inland of the boardwalk (z207).
  // Skip the volleyball sand and the east dock; keep patio/path connections open.
  for(const x of [52,86,100,124,148,176,196,208])lampCandidates.push({x,z:205.5,ground:-.10,region:'pier',poolDepth:3});
  for(const [x,z]of [[-42,-184],[-42,-202],[-21,-215],[20,-219],[60,-218],[83,-183],[83,-203],[104,-216],[145,-210],[180,-202]])lampCandidates.push({x,z,ground:-.09,region:'north-beach'});
  for(const z of [14,42,70,112,140,168,190])lampCandidates.push({x:224.3,z,ground:z>=30?.025:-.022,region:'market'});
  for(const [x,z]of [[187,-36],[207,-36],[228,-26],[187,-13],[196,3],[228,1],[190,22],[218,23]])lampCandidates.push({x,z,ground:-.022,region:'garden'});
  // Alternate sidewalk edges every 32m. Round-robin sampling spreads the bounded
  // budget among roads, rather than filling the first district in build order.
  const streetRows=roads.map((r,index)=>{
    const length=r.vertical?r.d:r.w,count=Math.max(1,Math.floor((length-12)/32));
    return Array.from({length:count},(_,i)=>{
      const along=-length/2+(i+.5)*length/count,side=(i+index)%2?1:-1;
      const offset=(r.vertical?r.w:r.d)/2+1;
      return {x:r.x+(r.vertical?side*offset:along),z:r.z+(r.vertical?along:side*offset),ground:-.10};
    });
  });
  for(let i=0;i<Math.max(0,...streetRows.map(row=>row.length));i++)for(const row of streetRows)if(row[i])lampCandidates.push(row[i]);
  const pavedLampExclusions=[...roads,...roadJunctions,...surfaceAreas.filter(a=>a.kind==='path'||a.kind==='sand')];
  const blocksLamp=(site:{x:number;z:number})=>pavedLampExclusions.some(r=>Math.abs(site.x-r.x)<r.w/2+.65&&Math.abs(site.z-r.z)<r.d/2+.65);
  for(const candidate of lampCandidates){
    if(candidate.x>188&&candidate.x<216&&candidate.z>10&&candidate.z<28)continue; // No street poles inside the greenhouse.
    // One-time placement search moves entrance lights off paving too. No frame work.
    let site=candidate;
    if(blocksLamp(site)){
      const alternatives:LampSite[]=[];
      for(let dx=-6;dx<=6;dx++)for(let dz=-6;dz<=6;dz++)alternatives.push({...candidate,x:candidate.x+dx,z:candidate.z+dz,ground:-.10});
      const clear=alternatives.sort((a,b)=>Math.hypot(a.x-candidate.x,a.z-candidate.z)-Math.hypot(b.x-candidate.x,b.z-candidate.z)).find(p=>!blocksLamp(p)&&onIsland(p.x,p.z)&&!obstacles.some(o=>Math.abs(p.x-o.x)<o.w/2+.5&&Math.abs(p.z-o.z)<o.d/2+.5));
      if(!clear)continue;site=clear;
    }
    // Keep the ferry lettering clear; this gateway has its own paired lamps.
    if(site.x>214&&site.x<230&&site.z>184&&site.z<196)continue;
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
  // Frame the ferry sign from outside its two posts, never across its lettering.
  for(const x of [214.8,229.2]){
   const z=190.6;
   cylinder(.19,.22,'#384443',x,.11,z).castShadow=false;
   cylinder(.065,4.2,'#384443',x,2.1,z).castShadow=false;
   box(.62,.12,.62,'#384443',x,4.22,z).castShadow=false;
   box(.43,.32,.43,'#ffe8ae',x,3.99,z).castShadow=false;
   obstacles.push({x,z,w:.38,d:.38});assets.push({kind:'street-lamp',x,z,w:.38,d:.38,visualW:.65,visualD:.65});
   lampSites.push({x,z,ground:.018,poolWidth:9,poolDepth:9});
  }
  // Short warm lamps on both cafe terraces; shared lenses and cached pool texture.
  for(const [x,z,floor] of [[199,165.55,9.23],[208.05,159,9.23],[208.05,152,9.23],[200,127.45,18.23],[208.05,136,18.23],[202,145.55,18.23],[132.3,4.2,17.23],[142.2,4.2,17.23]]){
    cylinder(.16,.12,'#384443',x,floor+.06,z).castShadow=false;
    cylinder(.055,1.2,'#384443',x,floor+.6,z).castShadow=false;
    box(.36,.24,.36,'#ffe8ae',x,floor+1.15,z).castShadow=false;
    box(.48,.08,.48,'#384443',x,floor+1.31,z).castShadow=false;
    lampSites.push({x,z,ground:floor+.025,poolWidth:5,poolDepth:5});
    museumRails.push({x,z,w:.4,d:.4,floor,top:floor+1.35});
    assets.push({kind:'terrace-lamp',x,z,w:.4,d:.4,baseY:floor});
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
  lampSites.push(...coralCay.lampSites,...eastPier.lampSites);
  const signStates=nightSigns.map(material=>({material,intensity:material.emissiveIntensity}));

  // Spatial/material batches preserve culling: a distant city's meshes never share
  // one giant visible bounding sphere with the current neighborhood.
  town.traverse(o=>{if(o instanceof T.Mesh&&o.geometry instanceof T.ConeGeometry&&o.geometry.parameters.radius>1.5&&o.geometry.parameters.height<=1){const b=buildings.find(b=>Math.abs(o.position.x-b.x)<b.w/2&&Math.abs(o.position.z-b.z)<b.d/2&&o.position.y>b.height);umbrellaReaction.register(o,b?.height??0,o.userData.umbrellaTargets??[]);}});
  town.updateMatrixWorld(true);
  const roofObstacles:(Obstacle&{floor:number;top:number;noLanding?:boolean})[]=[...museumRails,...arenaRails];
  // Same layout as the visible lights; roof poles must not block the street below.
  for(const v of [...VENUES,{id:'knockout',x:KNOCKOUT_ROOF.x,z:KNOCKOUT_ROOF.z,elevation:KNOCKOUT_ROOF.height,width:24,length:44}]){
    const layout=fieldLightLayout(v),floor=(v.elevation??0)+FIELD_SURFACE_Y;
    for(const post of layout.posts){const body={x:v.x+post.x,z:v.z+post.z,w:.75,d:.75};
      if(v.elevation)roofObstacles.push({...body,floor,top:floor+layout.height});else obstacles.push(body);
      assets.push({...body,kind:'field-light',baseY:floor});
    }
  }
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
  // Coral Cay sharks: added after the static batching pass so their instanced meshes stay separate (caySharks.ts).
  const sharks=createCaySharks(scene);
  // Farm decorative planting: instanced, thinned on warm heat tiers (farmDecor.ts). Added after batching, like the sharks.
  const farmDecor=createFarmDecor(scene,coralCay.farmDecor);
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
  for(const x of [81.5,90.5])for(const z of [-61.4,-56.6])lampSites.push({x,z,ground:.085,poolWidth:13,poolDepth:10});
  for(const site of lampSites){const key=Math.floor(site.x/50)+':'+Math.floor(site.z/50);let chunk=poolChunks.get(key);if(!chunk){chunk=[];poolChunks.set(key,chunk);}chunk.push(site);}
  const poolMatrix=new T.Matrix4(),poolPosition=new T.Vector3(),poolScale=new T.Vector3(10,1,10),poolRotation=new T.Quaternion();
  for(const [key,sites] of poolChunks){
    const mesh=new T.InstancedMesh(poolGeometry,poolMaterial,sites.length);mesh.name='night-pool-chunk-'+key;
    for(let i=0;i<sites.length;i++){const site=sites[i];poolPosition.set(site.x,site.ground,site.z);poolScale.set(site.poolWidth??10,1,site.poolDepth??10);poolMatrix.compose(poolPosition,poolRotation,poolScale);mesh.setMatrixAt(i,poolMatrix);}
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
  // Coral Cay region gate (heat audit Sep 29 2026): the ~200 static batches east of x 250 (causeway, sandbars, cay) are
  // hidden with ONE frustum-box test per frame whenever that whole region is out of view, so the main island never pays
  // per-object culling for them. Visibility changes only on transitions; world.setVisible isolation still wins.
  // The East Jetty's chunks (x 250–400, z 0–150) sit outside that region box, so they keep ordinary per-object culling.
  const cayChunks=new Set(mergedMeshes.filter(m=>{const [cx,cz]=m.name.slice('island-chunk-'.length).split(':').map(Number);return cx>=5&&!(cx<=7&&cz>=0&&cz<=2);}));
  // minX 220: chunk island-chunk-5:-4's causeway geometry reaches x ≈ 226 (code review finding 15).
  const cayRegion=new T.Box3(new T.Vector3(220,-2,-330),new T.Vector3(800,16,20));let cayShown=true,sceneryShown=true;
  const applyCayVisibility=()=>{for(const m of cayChunks)m.visible=sceneryShown&&cayShown;};
  const updateCoralCay=(dt:number,reduced:boolean,camera:T.Camera,player:{x:number;z:number})=>{sharks.update(dt,reduced,camera,player);const show=sharks.frustum.intersectsBox(cayRegion);if(show!==cayShown){cayShown=show;applyCayVisibility();}};
  return {sharks,farmDecor,updateSharks:updateCoralCay,cayChunkCount:cayChunks.size,get cayShown(){return cayShown;},ferry,ferryBounds:new T.Box3(new T.Vector3(241.5,-.4,190),new T.Vector3(250.5,5.1,208)),ferryLockBounds:new T.Box3(new T.Vector3(243,6.8,196),new T.Vector3(249,12.4,202)),setFerryLockHovered:(hovered:boolean)=>{lockMaterial.opacity=hovered?1:.48;},setVisible:(visible:boolean)=>{sceneryShown=visible;for(const root of sceneryRoots)root.visible=visible&&(!cayChunks.has(root as T.Mesh)||cayShown);},dynamicScenery:town,umbrellaReaction,arenaBounds:new T.Box3(new T.Vector3(ar.x-ar.w/2,0,ar.z-ar.d/2),new T.Vector3(ar.x+ar.w/2,ar.height+5,ar.z+ar.d/2)),updateFerry,museumBounds:new T.Box3(new T.Vector3(152.7,0,176.2),new T.Vector3(183.3,8.8,185.8)),walkSurfaces,landingExclusions,updateWater:waterRipples.update,updateTrafficSignals:(mode:string)=>{const night=mode==='night',dusk=mode==='sunset';for(const lens of signalLenses)lens.emissiveIntensity=night?.85:dusk?.55:.35;const glow=night?.82:dusk?.16:0;const windowColor=night?'#ffc176':'#ffd294';windowPaint.emissive.set(windowColor);windowPaint.emissiveIntensity=glow;for(const material of windowSources){material.emissive.set(windowColor);material.emissiveIntensity=glow;}lampLens.emissive.set(night?'#ffcb82':'#ffd294');lampLens.emissiveIntensity=night?1.7:dusk?.4:0;for(const state of signStates)state.material.emissiveIntensity=Math.max(state.intensity,night?.75:dusk?.12:0);for(const material of gardenPlantMaterials.values())material.emissiveIntensity=night?.09:0;nightPools.visible=night;if(arcadeNeonGlow)arcadeNeonGlow.opacity=night?1:dusk?.9:.8;},coachesBounds:new T.Box3(new T.Vector3(149.7,0,-49.3),new T.Vector3(172.3,11,-36.4)),arcadeBounds:new T.Box3(new T.Vector3(95.7,0,-65.3),new T.Vector3(110.3,9.45,-52.3)),storeBounds:new T.Box3(new T.Vector3(77.7,0,-65.3),new T.Vector3(92.3,10.5,-52.4)),storeDoor:{x:85,z:-50},walls:[...buildings.map(b=>({...b,top:b.height,floor:0})),...roofObstacles,{x:156,z:-29.5,w:26,d:.35,top:2.4,floor:0}],obstacles,roofObstacles,waves,oceanMat,squareArrival,arcadeDoor,buildings,roads,roadJunctions,assets,surfaceAreas,destinations,// The roof neon is static (heat): kept as a no-op so callers need no change.
    updateArcade:(_time:number,_reduced:boolean)=>{},dispose:()=>{sharks.dispose();farmDecor.dispose();nightPools.traverse(o=>{if(o instanceof T.InstancedMesh)o.dispose();});nightRoot.removeFromParent();poolGeometry.dispose();umbrellaReaction.dispose();ferry.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Points)o.geometry.dispose();});ferry.removeFromParent();water.removeFromParent();water.geometry.dispose();for(const mesh of mergedMeshes){mesh.removeFromParent();mesh.geometry.dispose();}textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());}};
}
