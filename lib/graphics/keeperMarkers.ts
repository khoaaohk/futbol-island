import * as T from 'three';
/**
 * "You're the keeper" markers (owner Nov 5 2026, docs/join-live-game-design.md "Goalkeeper feel + body moves"): only while a
 * human is in goal, so a kid always knows he is the keeper and where his job is.
 *   ring  : a double ring under your feet in your bib colour (the outfield "you" compass is a single ring + chevron);
 *   glove : a glove badge over your head (one sprite, a canvas drawn once);
 *   zone  : a soft glow over the goal mouth you guard (vertex-colour gradient, additive), brighter while a shot threatens;
 *   arc   : your dive reach, a half ring in front of you facing out of goal, shown while an opponent can shoot.
 * Heat: four meshes built once (≤ 4 draw calls while you are the keeper, none otherwise), material colour / opacity and
 * transforms written per frame, no allocation per frame.
 */
export const KEEPER_MARK={ringR:.62,ringW:.075,ringGap:.17,glove:.6,gloveY:3.05,zoneDepth:1.7,arcW:.12,y:.125,tint:'#8fe3b4'} as const;
/** One flat band (inner..outer radius, an angle span) appended to the arrays; x/z plane, +z at angle 0. */
function band(pos:number[],col:number[],idx:number[],r0:number,r1:number,a0:number,span:number,seg:number,c0:number,c1:number){
  const base=pos.length/3;
  for(let i=0;i<=seg;i++){const a=a0+span*i/seg,s=Math.sin(a),c=Math.cos(a);pos.push(s*r0,0,c*r0,s*r1,0,c*r1);col.push(c0,c0,c0,c1,c1,c1);}
  for(let i=0;i<seg;i++){const k=base+i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}
}
function geometry(pos:number[],col:number[],idx:number[]){
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);return g;
}
/** The glove badge: a white goalkeeper glove with a dark outline and a coloured cuff, drawn once onto a 128 px canvas. */
function gloveTexture(){
  const c=typeof document!=='undefined'?document.createElement('canvas'):null;if(!c)return null;
  c.width=c.height=128;const g=c.getContext('2d');if(!g)return null;
  g.lineJoin='round';g.lineCap='round';
  const path=()=>{g.beginPath();
    // fingers (four rounded bars), the palm, the thumb out to the side
    g.moveTo(34,70);g.lineTo(34,34);g.arcTo(34,24,44,24,9);g.arcTo(54,24,54,34,9);g.lineTo(54,58);
    g.lineTo(56,26);g.arcTo(56,16,66,16,9);g.arcTo(76,16,76,26,9);g.lineTo(76,58);
    g.lineTo(78,30);g.arcTo(78,20,88,20,9);g.arcTo(98,20,98,30,9);g.lineTo(98,62);
    g.lineTo(100,42);g.arcTo(100,34,108,34,8);g.arcTo(116,34,116,42,8);g.lineTo(114,84);
    g.quadraticCurveTo(110,104,88,106);g.lineTo(52,106);g.quadraticCurveTo(30,104,26,84);
    g.lineTo(14,66);g.quadraticCurveTo(10,56,18,52);g.quadraticCurveTo(26,49,34,62);g.closePath();};
  g.fillStyle='#193f37';path();g.lineWidth=14;g.strokeStyle='#193f37';g.stroke();
  g.fillStyle='#ffffff';path();g.fill();
  g.fillStyle='#ffd23f';g.fillRect(44,96,58,14);g.lineWidth=4;g.strokeStyle='#193f37';g.strokeRect(44,96,58,14);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=2;return t;
}
export type KeeperGoal={x:number;z:number;yaw:number;width:number};
export function createKeeperMarkers(scene:T.Scene){
  const M=KEEPER_MARK;
  // ring: two thin bands, one geometry
  const rp:number[]=[],rc:number[]=[],ri:number[]=[];band(rp,rc,ri,M.ringR-M.ringW,M.ringR,0,Math.PI*2,40,1,1);band(rp,rc,ri,M.ringR+M.ringGap-M.ringW*.8,M.ringR+M.ringGap,0,Math.PI*2,44,1,1);
  const ringMat=new T.MeshBasicMaterial({color:'#ffd23f',transparent:true,opacity:.95,depthWrite:false,toneMapped:false,side:T.DoubleSide});
  const ring=new T.Mesh(geometry(rp,rc,ri),ringMat);
  // arc: a dim fill fan + a bright rim, unit radius, the front half (+z), scaled to the reach
  const ap:number[]=[],ac:number[]=[],ai:number[]=[];band(ap,ac,ai,.2,1-M.arcW,-Math.PI/2,Math.PI,28,0,.07);band(ap,ac,ai,1-M.arcW,1,-Math.PI/2,Math.PI,28,.55,.55);
  const arcMat=new T.MeshBasicMaterial({color:M.tint,vertexColors:true,transparent:true,opacity:0,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending,side:T.DoubleSide});
  const arc=new T.Mesh(geometry(ap,ac,ai),arcMat);
  // zone: the goal mouth glow, bright on the goal line and fading out into the pitch (unit width / depth, scaled)
  const zp=[-.5,0,0,.5,0,0,-.5,0,1,.5,0,1],zc=[.32,.32,.32,.32,.32,.32,0,0,0,0,0,0],zi=[0,2,1,1,2,3];
  const zoneMat=new T.MeshBasicMaterial({color:M.tint,vertexColors:true,transparent:true,opacity:.5,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending,side:T.DoubleSide});
  const zone=new T.Mesh(geometry(zp,zc,zi),zoneMat);
  const tex=gloveTexture(),gloveMat=new T.SpriteMaterial({map:tex,transparent:true,depthTest:false,depthWrite:false,toneMapped:false});
  const glove=new T.Sprite(gloveMat);glove.scale.set(M.glove,M.glove,1);glove.renderOrder=6;
  const all=[ring,arc,zone,glove];
  for(const m of all){m.visible=false;m.frustumCulled=false;if(m!==glove)m.renderOrder=3;scene.add(m);}
  let shown=false,arcW=0;
  return {
    setColour(hex:string){ringMat.color.set(hex);},
    /** Every frame while you are the keeper. `reach` = dive reach (world m), `threat` 0..1 (an opponent can shoot / a shot is on). */
    show(x:number,y:number,z:number,outYaw:number,reach:number,goal:KeeperGoal,threat:number,time:number,reduced:boolean,dt:number){
      if(!shown){shown=true;for(const m of all)m.visible=true;}
      ring.position.set(x,y+M.y,z);ring.rotation.y=outYaw;
      if(!reduced){const s=1+.04*Math.sin(time*3.2);ring.scale.set(s,1,s);}else ring.scale.set(1,1,1);
      glove.position.set(x,y+M.gloveY+(reduced?0:.05*Math.sin(time*2.4)),z);
      arcW+=(threat-arcW)*Math.min(1,dt*(threat>arcW?8:4));
      arc.visible=arcW>.02;if(arc.visible){arc.position.set(x,y+M.y-.005,z);arc.rotation.y=outYaw;arc.scale.set(reach,1,reach);arcMat.opacity=Math.min(1,arcW)*.85;}
      zone.position.set(goal.x,y+M.y-.01,goal.z);zone.rotation.y=goal.yaw;zone.scale.set(goal.width+.8,1,M.zoneDepth);
      zoneMat.opacity=.35+.4*arcW+(reduced?0:.1*arcW*Math.sin(time*6));
    },
    hide(){if(!shown)return;shown=false;arcW=0;for(const m of all)m.visible=false;},
    get visible(){return shown;},
    /** For headless checks. */
    get parts(){return {ring,arc,zone,glove,arcWeight:arcW};},
    dispose(){for(const m of all){m.removeFromParent();if(m instanceof T.Mesh)m.geometry.dispose();}ringMat.dispose();arcMat.dispose();zoneMat.dispose();gloveMat.dispose();tex?.dispose();},
  };
}
