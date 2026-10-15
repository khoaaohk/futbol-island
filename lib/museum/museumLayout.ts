import {EXHIBITS,type Exhibit} from '../endgame/museum';

/**
 * The walk-in History Museum's floor plan (Oct 3 2026; L-shaped the same day to match the building's new west wing). Pure, so
 * tests/museum-room.cjs can check it: where each exhibit case stands, the walls, the look-at spots (POIs), the zoom stops and
 * the tap-to-walk grid path.
 *
 * The main hall (24 × 16 m) seen from the front-left corner (the Konbini's iso camera), with the door at its front centre, and
 * the west wing (9 × 26 m) through a wide opening in the hall's west wall. Oct 14 2026 (user: "get rid of your pop-up books, your
 * player cards, your hidden balls, and your certificates … replace with other historical exhibits", then "don't remove the wing"):
 * the wing keeps its walls, opening and floor, and its "Your Collection" pieces became four history galleries, back to front:
 *
 *             x=−21        x=−12                                          x=12
 *   z=−8  ┌ FIRSTS (ink) ────┬ THE LAWS (blue) ─── timeline ─── WORLD CUP (red) ┐
 *         │ 1872 1878 1916   │ 3 cases                             4 cases       │
 *         │ ═══ partition    ·                                                   │
 *         │ RULES & TACTICS  · opening ── partition (kit wall) ─ aisle ─ partition┤ z=0
 *         │ offside form. gk ·                                                   │
 *         │                  ├ BALLS AND KITS (yellow): shirts, Telstar desk boots┤
 *   z=8   │ SKILLS & SCIENCE │─────────────────────── DOOR ───────────────────────┘
 *         │ free kick curve throw-in  ← sign on the wing's east wall
 *         │ LEGENDS: Ballon d'Or, Trophy room  ← sign on the wing's east wall
 *   z=18  └──────────────────┘
 *
 * Every case faces the front (+z), toward the camera; gallery signs hang on walls that face the camera (the back wall, the
 * wing's partition front, the wing's east wall seen from inside).
 */
export const ROOM={halfW:12,halfD:8,wallH:3.6,doorX:0,doorHalf:1.2,partitionZ:0,partitionH:1.5,aisleHalf:1.8,partitionWest:-10.2} as const;
/** The west wing: x from `x0` to the hall's west wall (−12), z from the back wall (−8) to `z1`; the opening spans |z| < `open`. */
export const WING={x0:-21,x1:-12,z0:-8,z1:18,open:5.5} as const;
/** The whole floor's extent (for the path grid and the camera). */
export const FLOOR={minX:WING.x0,maxX:ROOM.halfW,minZ:-ROOM.halfD,maxZ:WING.z1} as const;
/** Case footprint (plinth) and the glass vitrine on top. */
export const CASE={w:.96,d:.96,plinthH:.92,glassH:.78} as const;
/** The wing's rows (z) and columns (x) of cases. */
const WROW={firsts:-5.6,tactics:1.6,skills:7.4,legends:13} as const,WCOL=[-19.4,-16.6,-13.8] as const;
export const CASE_PLACES:Readonly<Record<string,{x:number;z:number}>>={
 // The Laws of the Game (back left)
 'laws-1863':{x:-10,z:-6},'penalty-1891':{x:-7,z:-6},'var-2018':{x:-4.2,z:-6},
 // World Cup history (back right; Stadiums of the World, Oct 12 2026, in the second row)
 'worldcup-1930':{x:4.2,z:-6},'wwc-1991':{x:7.2,z:-6},'futsal-1989':{x:10,z:-6},'stadiums':{x:7.2,z:-2.8},
 // Balls and kits (the whole front: the kit wall behind the shirts; Boots through time, Oct 12 2026, right of the aisle)
 'shirts':{x:-8.4,z:2.9},'telstar-1970':{x:-4.4,z:3.4},'boots':{x:5.6,z:2.8},'laced-leather':{x:7.6,z:3.2},
 // ---- The west wing (Oct 14 2026) ----
 // Firsts (the wing's back wall, beside the Laws): the first international, the first game under lights, the first cup for nations
 'first-international-1872':{x:WCOL[0],z:WROW.firsts},'floodlights-1878':{x:WCOL[1],z:WROW.firsts},'copa-america-1916':{x:WCOL[2],z:WROW.firsts},
 // Rules & tactics (in front of the wing's partition)
 'offside-rules':{x:WCOL[0],z:WROW.tactics},'formations-history':{x:WCOL[1],z:WROW.tactics},'keeper-hands-1912':{x:WCOL[2],z:WROW.tactics},
 // Skills & science
 'free-kick-wall':{x:WCOL[0],z:WROW.skills},'ball-curve':{x:WCOL[1],z:WROW.skills},'throw-in':{x:WCOL[2],z:WROW.skills},
 // Legends: the Ballon d'Or beside the Trophy room
 'ballon-dor':{x:-18.4,z:WROW.legends},'hall-of-fame':{x:-15.2,z:WROW.legends},
};
/** The wing's partition: a low white wall (like the hall's) from the wing's west wall, its front face carrying the Rules &
 *  tactics sign; the east end stays open (x0..x1). */
export const WING_PARTITION={x0:WING.x0,x1:-15.6,z:-1.6} as const;
/** The gallery signs (centre x, y, z; `ry` = the way the sign faces: 0 = +z, −π/2 = −x). `stand`: a free-standing sign on two
 *  slim legs (Skills & science, Legends), since the wing's east wall is seen almost edge-on from the camera. */
export const GALLERY_SIGNS:Readonly<Record<string,{x:number;y:number;z:number;ry:number;w:number;stand?:boolean}>>={
 laws:{x:-ROOM.halfW/2,y:2.72,z:-ROOM.halfD+.03,ry:0,w:4.2},worldcup:{x:ROOM.halfW/2,y:2.72,z:-ROOM.halfD+.03,ry:0,w:4.2},
 kit:{x:ROOM.halfW-.03,y:2.85,z:ROOM.halfD/2,ry:-Math.PI/2,w:4.2},
 firsts:{x:WCOL[1],y:2.72,z:-ROOM.halfD+.03,ry:0,w:4.2},
 tactics:{x:(WING_PARTITION.x0+WING_PARTITION.x1)/2+.2,y:1.12,z:WING_PARTITION.z+.135,ry:0,w:2.6},
 skills:{x:-18,y:1.72,z:WROW.skills-1.7,ry:0,w:2.6,stand:true},
 hall:{x:-16.8,y:1.72,z:WROW.legends-1.7,ry:0,w:2.6,stand:true},
};
/** The World Cup ball plinth (Oct 5 2026): a round pedestal with a big ball in the front-right corner of Balls and Kits, beside
 *  the laced-leather case. Looking at it opens the full-screen ball gallery (components/WorldCupBalls.tsx). */
export const BALL_PLINTH={x:10.45,z:3.2,r:.36,h:.9,ball:.3} as const;
/** The welcome desk and the museum guide behind it (right of the door). */
export const DESK={x:3.4,z:5.7,w:2.2,d:.7,h:1} as const;
export const GUIDE={x:3.4,z:4.95,yaw:0} as const;
/** The timeline wall (back wall centre). */
export const TIMELINE={x:0,z:-ROOM.halfD+.12,w:5,h:1.5,y:1.75} as const;
/** The kit wall: three shirts on the partition's front face, behind the shirts case. */
export const KIT_WALL={z:ROOM.partitionZ+.13,y:.78,xs:[-9.6,-8.2,-6.8]} as const;

export type MuseumPoiKind='case'|'timeline'|'guide'|'gallery';
/** A look-at spot: the player stands on segment a–b and faces `face`. */
export type MuseumPoi={id:string;kind:MuseumPoiKind;label:string;verb:string;a:{x:number;z:number};b:{x:number;z:number};face:{x:number;z:number};
 box:{minX:number;maxX:number;minZ:number;maxZ:number;h:number}};
/** Cases with a place on the floor (an exhibit added to the registry before it has a place is simply not built yet). */
const placed=(exhibits:readonly Exhibit[])=>exhibits.filter(e=>CASE_PLACES[e.id]);
export function museumPois(exhibits:readonly Exhibit[]=EXHIBITS):MuseumPoi[]{
 const out:MuseumPoi[]=placed(exhibits).map(e=>{const p=CASE_PLACES[e.id],o=CASE.d/2+.62;
  return {id:e.id,kind:'case' as const,label:e.title,verb:'Look',a:{x:p.x-.32,z:p.z+o},b:{x:p.x+.32,z:p.z+o},face:{x:p.x,z:p.z},box:{minX:p.x-CASE.w/2,maxX:p.x+CASE.w/2,minZ:p.z-CASE.d/2,maxZ:p.z+CASE.d/2+.2,h:CASE.plinthH+CASE.glassH}};});
 out.push({id:'timeline',kind:'timeline',label:'Timeline wall',verb:'Look',a:{x:-1.6,z:TIMELINE.z+1.1},b:{x:1.6,z:TIMELINE.z+1.1},face:{x:0,z:TIMELINE.z},box:{minX:-TIMELINE.w/2,maxX:TIMELINE.w/2,minZ:TIMELINE.z-.2,maxZ:TIMELINE.z+.6,h:2.6}});
 out.push({id:'wc-balls',kind:'gallery',label:'World Cup balls',verb:'Look',a:{x:BALL_PLINTH.x-.35,z:BALL_PLINTH.z+BALL_PLINTH.r+.62},b:{x:BALL_PLINTH.x+.35,z:BALL_PLINTH.z+BALL_PLINTH.r+.62},face:{x:BALL_PLINTH.x,z:BALL_PLINTH.z},box:{minX:BALL_PLINTH.x-.45,maxX:BALL_PLINTH.x+.45,minZ:BALL_PLINTH.z-.45,maxZ:BALL_PLINTH.z+.45,h:BALL_PLINTH.h+BALL_PLINTH.ball*2}});
 out.push({id:'guide',kind:'guide',label:'Museum guide',verb:'Talk',a:{x:DESK.x-.6,z:DESK.z+DESK.d/2+.55},b:{x:DESK.x+.6,z:DESK.z+DESK.d/2+.55},face:{x:GUIDE.x,z:GUIDE.z},box:{minX:DESK.x-DESK.w/2,maxX:DESK.x+DESK.w/2,minZ:GUIDE.z-.4,maxZ:DESK.z+DESK.d/2,h:1.9}});
 return out;
}
/** The galleries in walking order: the hall (Laws, World Cup, Balls and kits), then the wing back to front. */
export const GALLERY_ORDER=['laws','worldcup','kit','firsts','tactics','skills','hall'] as const;
/** The cases in the order ← → steps through them: gallery by gallery (GALLERY_ORDER), each row back to front, left to right. */
export function hallOrder(exhibits:readonly Exhibit[]=EXHIBITS):Exhibit[]{
 const gi=(e:Exhibit)=>{const i=(GALLERY_ORDER as readonly string[]).indexOf(e.gallery);return i<0?GALLERY_ORDER.length:i;};
 return placed(exhibits).sort((a,b)=>{const p=CASE_PLACES[a.id],q=CASE_PLACES[b.id];return gi(a)-gi(b)||Math.round(p.z/1.5)-Math.round(q.z/1.5)||p.x-q.x;});
}
/** The zoom stops, in the order ← → steps through them: every case (hallOrder), then the timeline. */
export const ZOOM_STOPS:readonly string[]=[...hallOrder().map(e=>e.id),'timeline'];

/** Collision boxes: cases, the partition halves, the wing's partition, the desk and the wall stubs either side of the opening. */
export type Obstacle={minX:number;maxX:number;minZ:number;maxZ:number};
const rect=(x:number,z:number,w:number,d:number):Obstacle=>({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
export function museumObstacles():Obstacle[]{
 const o:Obstacle[]=placed(EXHIBITS).map(e=>CASE_PLACES[e.id]).map(p=>rect(p.x,p.z,CASE.w,CASE.d));
 o.push({minX:ROOM.partitionWest,maxX:-ROOM.aisleHalf,minZ:ROOM.partitionZ-.12,maxZ:ROOM.partitionZ+.12},{minX:ROOM.aisleHalf,maxX:ROOM.halfW,minZ:ROOM.partitionZ-.12,maxZ:ROOM.partitionZ+.12});
 o.push(rect(BALL_PLINTH.x,BALL_PLINTH.z,BALL_PLINTH.r*2,BALL_PLINTH.r*2));
 o.push({minX:DESK.x-DESK.w/2,maxX:DESK.x+DESK.w/2,minZ:GUIDE.z-.35,maxZ:DESK.z+DESK.d/2});
 o.push({minX:WING_PARTITION.x0,maxX:WING_PARTITION.x1,minZ:WING_PARTITION.z-.12,maxZ:WING_PARTITION.z+.12});
 // the free-standing signs' legs
 for(const g of Object.values(GALLERY_SIGNS))if(g.stand)for(const s of [-1,1])o.push(rect(g.x+s*(g.w/2-.08),g.z,.08,.08));
 // The hall's west wall survives only either side of the opening; the wing's east wall closes it beyond the hall's front.
 o.push({minX:WING.x1-.12,maxX:WING.x1+.12,minZ:-ROOM.halfD,maxZ:-WING.open},{minX:WING.x1-.12,maxX:WING.x1+.12,minZ:WING.open,maxZ:WING.z1});
 return o;
}
const R=.3,M=.3;
/** Inside the L (the door gap lets you step out the front) and clear of every obstacle by the body radius. */
export function museumBlocked(x:number,z:number,obstacles:readonly Obstacle[],r=R){
 if(z<-ROOM.halfD+M+r)return true;
 const wing=x>=WING.x0+M+r&&x<=WING.x1&&z<=WING.z1-M-r,hall=x>=WING.x1&&x<=ROOM.halfW-M-r&&(z<=ROOM.halfD-M-r||(Math.abs(x-ROOM.doorX)<=ROOM.doorHalf-.15&&z<=ROOM.halfD+.6));
 if(!wing&&!hall)return true;
 for(const o of obstacles)if(x>o.minX-r&&x<o.maxX+r&&z>o.minZ-r&&z<o.maxZ+r)return true;
 return false;
}
/** Which gallery a floor point is in (the header label and the guide). */
export const inWing=(x:number)=>x<WING.x1;

// ---- Tap-to-walk: grid A* (0.25 m) over the floor; runs only on a tap (the Konbini's konbiniPath, sized for this hall) ----
export type FloorPoint={x:number;z:number};
const S=.25,GX=Math.round((FLOOR.maxX-FLOOR.minX)/S),GZ=Math.round((FLOOR.maxZ-FLOOR.minZ+1)/S);
const ix=(x:number)=>Math.round((x-FLOOR.minX)/S),iz=(z:number)=>Math.round((z-FLOOR.minZ)/S),wx=(i:number)=>i*S+FLOOR.minX,wz=(j:number)=>j*S+FLOOR.minZ;
const STEPS:[number,number][]=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
type Node=[number,number,number];
function push(h:Node[],n:Node){h.push(n);let i=h.length-1;while(i>0){const p=(i-1)>>1;if(h[p][0]<=h[i][0])break;[h[p],h[i]]=[h[i],h[p]];i=p;}}
function pop(h:Node[]):Node{const top=h[0],last=h.pop()!;if(h.length){h[0]=last;let i=0;for(;;){const l=2*i+1,r=l+1;let m=i;if(l<h.length&&h[l][0]<h[m][0])m=l;if(r<h.length&&h[r][0]<h[m][0])m=r;if(m===i)break;[h[m],h[i]]=[h[i],h[m]];i=m;}}return top;}
/** A path of corner points from `from` to `to`; an unreachable goal walks to the closest reachable cell ([] = stay put). */
export function findMuseumPath(from:FloorPoint,to:FloorPoint,blocked:(x:number,z:number)=>boolean):FloorPoint[]{
 let tx=to.x,tz=to.z;const sx=ix(from.x),sz=iz(from.z);let gx=ix(tx),gz=iz(tz);
 if(blocked(wx(gx),wz(gz))){let best=Infinity;for(let dj=-6;dj<=6;dj++)for(let di=-6;di<=6;di++){const a=gx+di,b=gz+dj;if(!blocked(wx(a),wz(b))){const d=di*di+dj*dj;if(d<best){best=d;tx=wx(a);tz=wz(b);}}}gx=ix(tx);gz=iz(tz);}
 const key=(i:number,j:number)=>j*(GX+1)+i,start=key(sx,sz),came=new Map<number,number>(),g=new Map<number,number>([[start,0]]),open:Node[]=[[0,sx,sz]];
 const goal=key(gx,gz),closed=new Set<number>();let found=false,guard=0,closest=start,closestH=Math.hypot(gx-sx,gz-sz);
 while(open.length&&guard++<16000){const [,ci,cj]=pop(open),ck=key(ci,cj);if(closed.has(ck))continue;closed.add(ck);if(ck===goal){found=true;break;}
  const h=Math.hypot(gx-ci,gz-cj);if(h<closestH){closestH=h;closest=ck;}
  for(const [di,dj] of STEPS){const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>GX||nj>GZ||blocked(wx(ni),wz(nj)))continue;const nk=key(ni,nj),cost=g.get(ck)!+Math.hypot(di,dj);if(cost<(g.get(nk)??Infinity)){g.set(nk,cost);came.set(nk,ck);push(open,[cost+Math.hypot(gx-ni,gz-nj),ni,nj]);}}}
 const end=found?goal:closest;if(end===start)return [];
 const path:FloorPoint[]=[];let k=end;while(k!==start&&came.has(k)){path.unshift({x:wx(k%(GX+1)),z:wz(Math.floor(k/(GX+1)))});k=came.get(k)!;}
 return path.filter((_,i)=>i===path.length-1||i%3===2);
}
