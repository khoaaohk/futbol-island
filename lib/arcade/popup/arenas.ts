/**
 * Pop-up target game (working id `popup`, Nov 21 2026, docs/arcade-aaa/popup-direction.md): the five arenas as plain data.
 * The rules (core.ts) and the picture (view.ts) read the SAME boxes, spots and rails, so what you see is what a ball bounces off.
 * World: metres; the ball rests at `ball` (near the origin), targets live at negative z (further = more negative), y is up.
 *  - box  [x, y(bottom), z, w, h, d, colour, look]: a solid thing balls bounce off and targets hide behind (centred on x and z).
 *  - deco [x, y, z, w, h, d, colour, look]: drawn only (no collision): trees, clouds of scenery beside the play cone.
 *  - spot [x, y, z, dir, scale]: where a target's base is when it is fully out. dir = the way it MOVES as it pops: u up, d down,
 *    l left (from behind something on its right), r right. scale: far targets are drawn larger than life.
 *  - rail [x0, x1, y, z, scale]: a runner crosses from one end to the other.
 * Pure data: no three.js here (tests/popup-core.cjs projects every spot at phone and desktop shapes).
 */
export type PopBox=readonly [x:number,y:number,z:number,w:number,h:number,d:number,colour:string,look:string];
export type PopSpot=readonly [x:number,y:number,z:number,dir:'u'|'d'|'l'|'r',scale:number];
export type PopRail=readonly [x0:number,x1:number,y:number,z:number,scale:number];
export type PopView={/** position */p:readonly [number,number,number];/** look-at */l:readonly [number,number,number];/** vertical field of view */fov:number};
/** Two framings of the same arena: wide screens, and upright phones (higher and further back, so depth runs up the tall screen). */
export type PopCam={wide:PopView;tall:PopView};
export type PopArena={id:string;name:string;line:string;cam:PopCam;ball:readonly [number,number,number];
 sky:readonly [top:string,low:string];fog:string;ground:readonly [a:string,b:string];groundLook:'paving'|'quay'|'grass'|'sand'|'pitch';
 /** light: sun colour and strength, sky fill */sun:readonly [string,number];hemi:readonly [string,string,number];
 /** what rides the rails here */runner:'trolley'|'duck'|'cart'|'boat'|'mascot';
 boxes:readonly PopBox[];deco:readonly PopBox[];spots:readonly PopSpot[];rails:readonly PopRail[]};

const plaza:PopArena={id:'plaza',name:'Town Plaza',line:'Shop windows, the bus and the bins.',
 cam:{wide:{p:[0,1.7,4.6],l:[0,2.5,-14],fov:58},tall:{p:[0,3.6,6.4],l:[0,2,-12],fov:60}},ball:[0,.11,0],
 sky:['#f08a5c','#ffd08a'],fog:'#f7c796',ground:['#dcc9a4','#cdb78f'],groundLook:'paving',sun:['#fff0d0',2.5],hemi:['#fff2dc','#a98fb0',.6],runner:'trolley',
 boxes:[
  [-6.6,0,-23,6.2,8.2,3,'#e9a45e','shop'],[0,0,-23.4,6.8,9.8,3,'#f6e6bd','shop'],[6.6,0,-23,6.2,7.6,3,'#dd6f5c','shop'],
  [-4.6,4.1,-21.2,1.9,.55,.6,'#19b5a5','flowerbox'],[0,4.9,-21.6,2,.55,.6,'#f0452e','flowerbox'],[4.6,4.1,-21.2,1.9,.55,.6,'#ffc83a','flowerbox'],
  [-2.6,0,-19.6,2.2,1.25,1,'#c98a4b','crate'],[2.7,0,-19.6,2.2,1.25,1,'#c98a4b','crate'],
  [-3.3,0,-12,5,2.5,2.1,'#f0452e','bus'],[3.5,0,-13.2,2.5,2.7,2.1,'#19b5a5','kiosk'],
  [0,0,-9,2.3,.75,2.3,'#cfd8dc','fountain'],
  [-1.9,0,-5.8,2.3,1.05,.8,'#3f9a5c','hedge'],[1.9,0,-5.4,.85,1.15,.85,'#5b6072','bin'],
 ],
 deco:[[-12.5,0,-18,5,9,8,'#c9785a','shop'],[12.5,0,-18,5,10,8,'#e9c46a','shop'],[-7.4,0,-8.5,1.2,5.2,1.2,'#3f9a5c','tree'],[7.2,0,-10.5,1.2,5.6,1.2,'#3f9a5c','tree'],[-5.4,0,-3.2,.3,4.2,.3,'#231a2e','lamp'],[5.6,0,-2.6,.3,4.2,.3,'#231a2e','lamp']],
 spots:[[-4.6,4.55,-21.35,'u',1.55],[0,5.35,-21.75,'u',1.55],[4.6,4.55,-21.35,'u',1.55],[-2.6,.75,-20.5,'u',1.45],[2.7,.75,-20.5,'u',1.45],
  [-3.6,2.1,-13.3,'u',1.2],[.15,0,-12.4,'r',1.2],[1.35,0,-13.6,'l',1.2],[3.5,2.3,-14.4,'u',1.2],[0,.5,-9.4,'u',1.05],
  [-1.9,.55,-6.5,'u',.9],[1.9,.85,-5.6,'u',.8]],
 rails:[[-8.6,8.6,0,-16.6,1.3]]};

const harbour:PopArena={id:'harbour',name:'Harbour',line:'Crates, boats and the ducks on the water.',
 cam:{wide:{p:[0,4.6,5.4],l:[0,.2,-12],fov:58},tall:{p:[0,6.6,6.6],l:[0,0,-11.5],fov:60}},ball:[0,.11,-.6],
 sky:['#5ab8e6','#c9eef7'],fog:'#c4e8f2',ground:['#b9b2a6','#a59d90'],groundLook:'quay',sun:['#ffffff',2.6],hemi:['#ffffff','#8fa9c0',.6],runner:'duck',
 boxes:[
  [-5.4,0,-27.4,7,6.2,3.4,'#d96c5a','warehouse'],[3.6,0,-27.8,8.6,4.6,3.4,'#e8e2d4','warehouse'],[-3.4,0,-24.6,2,1.3,1,'#c98a4b','crate'],[1.9,0,-24.8,2,1.3,1,'#e0a865','crate'],[5.6,0,-24.8,2,1.3,1,'#c98a4b','crate'],
  [-4.4,-.5,-16.5,4.6,1.6,1.9,'#2f8fd8','boat'],[3.9,-.5,-18.5,5,1.7,2,'#f0452e','boat'],[0,-.5,-13.2,3.2,1.3,1.5,'#ffc83a','boat'],
  [-3,0,-8.4,1.5,1.5,1.5,'#c98a4b','crate'],[-1.75,0,-8.1,1.1,1.1,1.1,'#e0a865','crate'],[2.9,0,-8,1.6,1.6,1.6,'#c98a4b','crate'],
  [1.2,0,-5.2,.7,1.05,.7,'#f0452e','barrel'],[-1.2,0,-4.8,.6,.95,.6,'#19b5a5','barrel'],
 ],
 deco:[[0,-.06,-17,60,.02,13.6,'#1f8f96','water'],[0,-.5,-23.9,60,.5,.4,'#8a7f70','quayedge'],[0,-.5,-10.4,60,.6,.5,'#8a7f70','quayedge'],[-9.5,0,-9,.5,7,.5,'#e8e2d4','crane'],[9.6,-.5,-15,3.6,1.5,1.8,'#19b5a5','boat'],[-10.6,-.5,-20,4,1.5,1.8,'#fff3d6','boat'],[11.5,0,-30,3,12,3,'#fff3d6','lighthouse']],
 spots:[[-6.4,5.8,-26.6,'u',1.7],[-3.4,.85,-25.4,'u',1.6],[1.9,.85,-25.6,'u',1.6],[5.6,.85,-25.6,'u',1.6],
  [-4.4,.75,-17.2,'u',1.3],[3.9,.85,-19.2,'u',1.35],[0,.5,-13.7,'u',1.15],
  [-3,1.05,-9.1,'u',1],[-1.6,.6,-8.8,'u',.9],[2.9,1.1,-8.8,'u',1],[1.2,.75,-5.5,'u',.8],[-1.2,.65,-5.1,'u',.8]],
 rails:[[-8,8,-.05,-11.6,1],[9,-9,-.05,-21.2,1.5]]};

const training:PopArena={id:'training',name:'Training Ground',line:'Mannequins, tyres, the shed and the goal.',
 cam:{wide:{p:[0,1.05,4.2],l:[0,2.3,-14],fov:58},tall:{p:[0,2.3,5.8],l:[0,1.3,-12],fov:60}},ball:[0,.11,1.2],
 sky:['#49a9e0','#bfe9f5'],fog:'#bfe6d8',ground:['#4fb85c','#5fc76a'],groundLook:'grass',sun:['#ffffff',2.6],hemi:['#ffffff','#9fb59a',.58],runner:'cart',
 boxes:[
  [-4.9,0,-22.5,5.2,3.6,3.2,'#c9785a','shed'],[2.6,0,-23,7.32,2.44,.3,'#fffaf0','goal'],
  [0,0,-15,6.4,1.75,.35,'#ffc83a','wallm'],
  [-3.4,0,-10,1.3,1.5,1.3,'#3a3540','tyres'],[3.5,0,-10.6,1.3,1.9,1.3,'#3a3540','tyres'],
  [-1.5,0,-6,1.7,.95,.5,'#f0452e','board'],[1.7,0,-6.6,1.7,.95,.5,'#19b5a5','board'],[0,0,-18.6,1.6,1.3,1.6,'#2f8fd8','cage'],
 ],
 deco:[[0,0,-27,44,2.2,.2,'#2f7f4a','fence'],[-9,0,-13,1.4,6,1.4,'#3f9a5c','tree'],[9.4,0,-16,1.4,6.6,1.4,'#3f9a5c','tree'],[-10,0,-25,1.4,7,1.4,'#2f8a4f','tree'],[7.6,0,-3.6,.5,.5,.5,'#ff8a3c','cones'],[-6.6,0,-4.4,.5,.5,.5,'#ff8a3c','cones']],
 spots:[[-6,3.2,-23.4,'u',1.5],[-2.05,0,-22.6,'r',1.55],[1,2.05,-23.6,'u',1.5],[4.2,2.05,-23.6,'u',1.5],[0,.9,-19.6,'u',1.4],
  [-2.2,1.3,-15.7,'u',1.2],[2.2,1.3,-15.7,'u',1.2],[-3.4,1.05,-10.7,'u',1.05],[3.5,1.4,-11.3,'u',1.05],
  [-1.5,.5,-6.5,'u',.85],[1.7,.5,-7.1,'u',.85],[4.25,0,-14.8,'r',1.2]],
 rails:[[-8.5,8.5,0,-12.6,1.15]]};

const beach:PopArena={id:'beach',name:'Beach',line:'The huts, the tower and the umbrellas.',
 cam:{wide:{p:[-3.4,2.7,4.8],l:[1.4,1.2,-13],fov:60},tall:{p:[-4.6,4.4,6.2],l:[.6,.6,-12],fov:60}},ball:[-2.6,.11,-.4],
 sky:['#2f9fe0','#bfeaf7'],fog:'#d9f0f2',ground:['#f2d28a','#e9c476'],groundLook:'sand',sun:['#fffbe8',2.8],hemi:['#ffffff','#c9b08a',.6],runner:'boat',
 boxes:[
  [-3.9,0,-7.4,2.1,2.5,2,'#f0452e','hut'],[-1.5,0,-10.6,2.1,2.5,2,'#19b5a5','hut'],[1,0,-13.8,2.1,2.5,2,'#ffc83a','hut'],[3.6,0,-17,2.1,2.5,2,'#2f8fd8','hut'],
  [6.2,0,-20.6,2.6,3.3,2.6,'#fff3d6','tower'],[0,0,-6.2,1.6,.8,1.2,'#e9c476','castle'],[2.6,0,-9,1.3,1.5,1,'#f0452e','deckchair'],[5.2,0,-12.6,1.5,1.2,1.5,'#c98a4b','crate'],
 ],
 deco:[[6,-.06,-36,90,.02,26,'#2b9fd0','water'],[-1.6,0,-4.4,.2,2.6,.2,'#f0452e','umbrella'],[4.6,0,-6.4,.2,2.8,.2,'#19b5a5','umbrella'],[9.4,0,-11.4,.2,2.8,.2,'#ffc83a','umbrella'],[-8.6,0,-12,1,6.6,1,'#3f9a5c','palm'],[-5.8,0,-20,1,7.4,1,'#3f9a5c','palm'],[11,0,-18,1,7,1,'#3f9a5c','palm']],
 spots:[[-2.15,0,-7.9,'r',1],[-3.5,2.2,-8.2,'u',1],[.3,0,-11.1,'r',1.1],[-1.5,2.2,-11.4,'u',1.1],[2.9,0,-14.3,'r',1.2],[1,2.2,-14.6,'u',1.2],
  [5.55,0,-17.5,'r',1.35],[3.6,2.2,-17.8,'u',1.35],[6.2,2.95,-20.8,'u',1.5],[0,.5,-6.7,'u',.85],[2.6,1,-9.5,'u',.95],[5.2,.75,-13.4,'u',1.15]],
 rails:[[-7,12,-.05,-23.5,1.9]]};

const stands:PopArena={id:'stands',name:'Stadium Stands',line:'Boards, the tunnel and three tiers of seats.',
 cam:{wide:{p:[0,1.3,5],l:[0,4.4,-14],fov:64},tall:{p:[0,1.5,5.2],l:[0,5,-14],fov:68}},ball:[0,.11,-.3],
 sky:['#2c2560','#6a5aa8'],fog:'#514a8c',ground:['#2f8f5a','#38a066'],groundLook:'pitch',sun:['#e6e9ff',2.2],hemi:['#b8baf0','#3a3460',.75],runner:'mascot',
 boxes:[
  [0,0,-11.2,30,2.6,3,'#e8e2d4','tier'],[0,2.6,-14.2,30,2.7,3,'#f0452e','tier'],[0,5.3,-17.2,30,2.7,3,'#19b5a5','tier'],[0,8,-20.2,30,3.2,3,'#ffc83a','tier'],
  [0,11.2,-21,7,3.2,.8,'#231a2e','score'],
  [-2.2,0,-5.6,2.6,.95,.4,'#ffc83a','board'],[2.2,0,-5.6,2.6,.95,.4,'#f0452e','board'],[0,0,-8.6,2,1.5,1,'#2f8fd8','dugout'],
 ],
 deco:[[-11,0,-21,1,17,1,'#cfd8dc','floodlight'],[11,0,-21,1,17,1,'#cfd8dc','floodlight'],[0,0,-9.66,3,2.3,.1,'#231a2e','tunnel']],
 spots:[[-2.2,.5,-6.1,'u',.85],[2.2,.5,-6.1,'u',.85],[0,1.05,-9.3,'u',1],[-3.4,2.25,-12.2,'u',1.1],[3.4,2.25,-12.2,'u',1.1],[0,2.25,-12.5,'u',1.1],
  [-2,4.95,-15.2,'u',1.3],[2.6,4.95,-15.2,'u',1.3],[-3.6,7.65,-18.2,'u',1.5],[.6,7.65,-18.2,'u',1.5],[4,10.8,-21,'u',1.6],[-2.6,14,-21.4,'u',1.7]],
 rails:[[-7,7,0,-7.4,1],[8,-8,5.3,-14.6,1.3]]};

export const ARENAS:readonly PopArena[]=[plaza,harbour,training,beach,stands];
