// Station house roofs (owner shot 90, Nov 25 2026: "building roof here is missing" at Coral Cay). Run: node tests/train-station-roofs.cjs
// The tiled hip roof of every station house faces OUT on all five stations (mirrored ones too): each roof triangle, by its winding
// (what back-face culling uses), faces up, or is the flat soffit facing straight down. Before the fix the two hip ends of a
// mirrored station were wound inward and culled, so from a high 3/4 view you saw into the house's open top.
const assert=require('node:assert/strict');
const {L}=require('./lib/tsLoad.cjs');
const T=require('three');
// the station boards draw on a canvas: a do-nothing 2D context is enough here (only the roof geometry is read)
const grad={addColorStop(){}},ctx=new Proxy({measureText:t=>({width:String(t).length*20}),createLinearGradient:()=>grad,createRadialGradient:()=>grad,createPattern:()=>null},{get:(o,k)=>k in o?o[k]:()=>{},set:()=>true});
global.document??={createElement:()=>({width:0,height:0,style:{},getContext:()=>ctx}),addEventListener(){}};
const W=L('lib/town/trainWorld.ts'),TT=L('lib/town/trainTrack.ts');
const ROOF='#566270',roofs=[];
const put=(g,c,x,y,z)=>{const m=new T.Mesh(g,new T.MeshStandardMaterial({color:c}));m.position.set(x,y,z);if(c===ROOF)roofs.push({g,x,y,z});return m;};
W.buildTrainWorld({put,lit:(m)=>m,boardMaterial:()=>new T.MeshBasicMaterial(),town:new T.Group(),obstacles:[],walkSurfaces:[],lite:false});
assert(roofs.length>=1,'the roof batch was built');
const near={};for(const s of TT.TRAIN_STATIONS)near[s.id]=0;let tris=0;
for(const {g,x,y,z} of roofs){const p=g.attributes.position.array,ix=g.index?g.index.array:null,n=ix?ix.length:p.length/3;
 const v=(i)=>{const k=(ix?ix[i]:i)*3;return [p[k]+x,p[k+1]+y,p[k+2]+z];};
 for(let t=0;t<n;t+=3){const a=v(t),b=v(t+1),c=v(t+2),ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],wx=c[0]-a[0],wy=c[1]-a[1],wz=c[2]-a[2];
  let nx=uy*wz-uz*wy,ny=uz*wx-ux*wz,nz=ux*wy-uy*wx;const l=Math.hypot(nx,ny,nz);if(l<1e-9)continue;ny/=l;tris++;
  const cx=(a[0]+b[0]+c[0])/3,cz=(a[2]+b[2]+c[2])/3;let best='',bd=1e9;for(const s of TT.TRAIN_STATIONS){const q=TT.trackAt(s.s),d=Math.hypot(q.x-cx,q.z-cz);if(d<bd){bd=d;best=s.id;}}
  if(bd<20)near[best]++;
  assert(ny>.05||ny<-.999,`${best}: a roof triangle at (${cx.toFixed(1)}, ${cz.toFixed(1)}) faces ${ny<0?'down/in':'sideways'} (ny ${ny.toFixed(2)}): culled from above`);}}
for(const [id,k] of Object.entries(near))assert(k>=8,`${id}: its station house roof was found (${k} triangles)`);
console.log(`train-station-roofs: ok (${tris} roof triangles, all facing out on ${Object.keys(near).length} stations)`);
