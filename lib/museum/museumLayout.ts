import {EXHIBITS,type Exhibit} from '../endgame/museum';

/**
 * The walk-in History Museum's floor plan (Oct 3 2026; L-shaped the same day to match the building's new west wing). Pure, so
 * tests/museum-room.cjs can check it: where each of the 12 exhibit cases stands, the walls, the look-at spots (POIs), the zoom
 * stops and the tap-to-walk grid path.
 *
 * The main hall (24 × 16 m) seen from the front-left corner (the Konbini's iso camera), with the door at its front centre, and
 * the west wing ("Your Collection", 9 × 26 m) through a wide opening in the hall's west wall. The wing runs further toward the
 * front (south), like the building outside:
 *
 *             x=−21        x=−12                                          x=12
 *   z=−8  ┌ YOUR COLLECTION ┬ THE LAWS (teal) ──── timeline ──── WORLD CUP (pink) ┐
 *         │ ball pegboard   │ 5 cases                              3 cases         │
 *         │                 ·                                                      │
 *         │ card table      · opening ── partition (kit wall) ─ aisle ─ partition ─┤ z=0
 *         │                 ·                                                      │
 *         │ bookcase        ├ BALLS AND KITS (gold): shirts, Telstar  desk  leather ┤
 *   z=8   │                 │─────────────────────── DOOR ───────────────────────────┘
 *         │ Hall of Fame    │ ← certificate wall (the wing's east wall, seen from inside)
 *   z=18  └─────────────────┘
 *
 * Every case faces the front (+z), toward the camera; the certificate frames hang on the wing's east wall, which faces the camera.
 */
export const ROOM={halfW:12,halfD:8,wallH:3.6,doorX:0,doorHalf:1.2,partitionZ:0,partitionH:1.5,aisleHalf:1.8,partitionWest:-10.2} as const;
/** The west wing: x from `x0` to the hall's west wall (−12), z from the back wall (−8) to `z1`; the opening spans |z| < `open`. */
export const WING={x0:-21,x1:-12,z0:-8,z1:18,open:5.5} as const;
/** The whole floor's extent (for the path grid and the camera). */
export const FLOOR={minX:WING.x0,maxX:ROOM.halfW,minZ:-ROOM.halfD,maxZ:WING.z1} as const;
/** Case footprint (plinth) and the glass vitrine on top. */
export const CASE={w:.96,d:.96,plinthH:.92,glassH:.78} as const;
export const CASE_PLACES:Readonly<Record<string,{x:number;z:number}>>={
 // The Laws of the Game (back left)
 'laws-1863':{x:-10,z:-6},'penalty-1891':{x:-7,z:-6},'cards-1970':{x:-4.2,z:-6},'backpass-1992':{x:-8.6,z:-2.8},'var-2018':{x:-5.4,z:-2.8},
 // World Cup history (back right)
 'worldcup-1930':{x:4.2,z:-6},'wwc-1991':{x:7.2,z:-6},'futsal-1989':{x:10,z:-6},
 // Balls and kits (the whole front: the kit wall behind the shirts; the ball-compare case has the front right to itself)
 'shirts':{x:-8.4,z:2.9},'telstar-1970':{x:-4.4,z:3.4},'laced-leather':{x:7.6,z:3.2},
 // Hall of Fame (the wing, beside the certificate wall)
 'hall-of-fame':{x:-15.2,z:13},
};
/** The World Cup ball plinth (Oct 5 2026): a round pedestal with a big ball in the front-right corner of Balls and Kits, beside
 *  the laced-leather case. Looking at it opens the full-screen ball gallery (components/WorldCupBalls.tsx). */
export const BALL_PLINTH={x:10.45,z:3.2,r:.36,h:.9,ball:.3} as const;
/** The welcome desk and the museum guide behind it (right of the door). */
export const DESK={x:3.4,z:5.7,w:2.2,d:.7,h:1} as const;
export const GUIDE={x:3.4,z:4.95,yaw:0} as const;
/** The timeline wall (back wall centre). */
export const TIMELINE={x:0,z:-ROOM.halfD+.12,w:5,h:1.5,y:1.75} as const;
/** The certificate wall: the wing's east wall seen from inside (faces −x), with the five frames' z positions. */
export const CERT_WALL={x:WING.x1-.12,z:13,w:7,h:1.5,y:1.85,frames:[10,11.5,13,14.5,16]} as const;
/** The kit wall: three shirts on the partition's front face, behind the shirts case. */
export const KIT_WALL={z:ROOM.partitionZ+.13,y:.78,xs:[-9.6,-8.2,-6.8]} as const;
/** Your Collection: the hidden-ball pegboard (wing back wall), the card table and the bookcase. */
export const PEGBOARD={x:-16.5,z:-ROOM.halfD+.1,w:7.6,h:1.9,y:1.65,cols:20,rows:5} as const;
export const CARD_TABLE={x:-16.5,z:2,w:2.4,d:1.1,h:.8} as const;
export const BOOKCASE={x:-16.8,z:7,w:2.6,d:.45,h:1.7} as const;

export type MuseumPoiKind='case'|'timeline'|'hall-wall'|'guide'|'collection'|'gallery';
/** A look-at spot: the player stands on segment a–b and faces `face`. */
export type MuseumPoi={id:string;kind:MuseumPoiKind;label:string;verb:string;a:{x:number;z:number};b:{x:number;z:number};face:{x:number;z:number};
 box:{minX:number;maxX:number;minZ:number;maxZ:number;h:number}};
export function museumPois(exhibits:readonly Exhibit[]=EXHIBITS):MuseumPoi[]{
 const out:MuseumPoi[]=exhibits.map(e=>{const p=CASE_PLACES[e.id],o=CASE.d/2+.62;
  return {id:e.id,kind:'case' as const,label:e.title,verb:'Look',a:{x:p.x-.32,z:p.z+o},b:{x:p.x+.32,z:p.z+o},face:{x:p.x,z:p.z},box:{minX:p.x-CASE.w/2,maxX:p.x+CASE.w/2,minZ:p.z-CASE.d/2,maxZ:p.z+CASE.d/2+.2,h:CASE.plinthH+CASE.glassH}};});
 out.push({id:'timeline',kind:'timeline',label:'Timeline wall',verb:'Look',a:{x:-1.6,z:TIMELINE.z+1.1},b:{x:1.6,z:TIMELINE.z+1.1},face:{x:0,z:TIMELINE.z},box:{minX:-TIMELINE.w/2,maxX:TIMELINE.w/2,minZ:TIMELINE.z-.2,maxZ:TIMELINE.z+.6,h:2.6}});
 out.push({id:'my-balls',kind:'collection',label:'Your hidden balls',verb:'Look',a:{x:PEGBOARD.x-2,z:PEGBOARD.z+1.2},b:{x:PEGBOARD.x+2,z:PEGBOARD.z+1.2},face:{x:PEGBOARD.x,z:PEGBOARD.z},box:{minX:PEGBOARD.x-PEGBOARD.w/2,maxX:PEGBOARD.x+PEGBOARD.w/2,minZ:PEGBOARD.z-.2,maxZ:PEGBOARD.z+.6,h:2.8}});
 out.push({id:'my-cards',kind:'collection',label:'Your player cards',verb:'Look',a:{x:CARD_TABLE.x-.6,z:CARD_TABLE.z+CARD_TABLE.d/2+.6},b:{x:CARD_TABLE.x+.6,z:CARD_TABLE.z+CARD_TABLE.d/2+.6},face:{x:CARD_TABLE.x,z:CARD_TABLE.z},box:{minX:CARD_TABLE.x-CARD_TABLE.w/2,maxX:CARD_TABLE.x+CARD_TABLE.w/2,minZ:CARD_TABLE.z-CARD_TABLE.d/2,maxZ:CARD_TABLE.z+CARD_TABLE.d/2,h:1.2}});
 out.push({id:'my-books',kind:'collection',label:'Your pop-up books',verb:'Look',a:{x:BOOKCASE.x-.6,z:BOOKCASE.z+BOOKCASE.d/2+.65},b:{x:BOOKCASE.x+.6,z:BOOKCASE.z+BOOKCASE.d/2+.65},face:{x:BOOKCASE.x,z:BOOKCASE.z},box:{minX:BOOKCASE.x-BOOKCASE.w/2,maxX:BOOKCASE.x+BOOKCASE.w/2,minZ:BOOKCASE.z-BOOKCASE.d/2,maxZ:BOOKCASE.z+BOOKCASE.d/2,h:BOOKCASE.h}});
 out.push({id:'hall-wall',kind:'hall-wall',label:'Certificate wall',verb:'Look',a:{x:CERT_WALL.x-1.1,z:10},b:{x:CERT_WALL.x-1.1,z:16},face:{x:CERT_WALL.x,z:CERT_WALL.z},box:{minX:CERT_WALL.x-.6,maxX:CERT_WALL.x+.2,minZ:CERT_WALL.z-CERT_WALL.w/2,maxZ:CERT_WALL.z+CERT_WALL.w/2,h:2.7}});
 out.push({id:'wc-balls',kind:'gallery',label:'World Cup balls',verb:'Look',a:{x:BALL_PLINTH.x-.35,z:BALL_PLINTH.z+BALL_PLINTH.r+.62},b:{x:BALL_PLINTH.x+.35,z:BALL_PLINTH.z+BALL_PLINTH.r+.62},face:{x:BALL_PLINTH.x,z:BALL_PLINTH.z},box:{minX:BALL_PLINTH.x-.45,maxX:BALL_PLINTH.x+.45,minZ:BALL_PLINTH.z-.45,maxZ:BALL_PLINTH.z+.45,h:BALL_PLINTH.h+BALL_PLINTH.ball*2}});
 out.push({id:'guide',kind:'guide',label:'Museum guide',verb:'Talk',a:{x:DESK.x-.6,z:DESK.z+DESK.d/2+.55},b:{x:DESK.x+.6,z:DESK.z+DESK.d/2+.55},face:{x:GUIDE.x,z:GUIDE.z},box:{minX:DESK.x-DESK.w/2,maxX:DESK.x+DESK.w/2,minZ:GUIDE.z-.4,maxZ:DESK.z+DESK.d/2,h:1.9}});
 return out;
}
/** The zoom stops, in the order ← → steps through them: the 12 cases (hall order), the timeline, then the Your Collection wing
 *  (hidden balls, cards, books, certificates). */
export const ZOOM_STOPS:readonly string[]=[...EXHIBITS.map(e=>e.id),'timeline','my-balls','my-cards','my-books','hall-wall'];
/** The wing's stops (the guide's "Your Collection" button walks to the first). */
export const COLLECTION_STOPS=['my-balls','my-cards','my-books','hall-wall'] as const;

/** Collision boxes: cases, the partition halves, the desk, the wing furniture and the wall stubs either side of the opening. */
export type Obstacle={minX:number;maxX:number;minZ:number;maxZ:number};
const rect=(x:number,z:number,w:number,d:number):Obstacle=>({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
export function museumObstacles():Obstacle[]{
 const o:Obstacle[]=Object.values(CASE_PLACES).map(p=>rect(p.x,p.z,CASE.w,CASE.d));
 o.push({minX:ROOM.partitionWest,maxX:-ROOM.aisleHalf,minZ:ROOM.partitionZ-.12,maxZ:ROOM.partitionZ+.12},{minX:ROOM.aisleHalf,maxX:ROOM.halfW,minZ:ROOM.partitionZ-.12,maxZ:ROOM.partitionZ+.12});
 o.push(rect(BALL_PLINTH.x,BALL_PLINTH.z,BALL_PLINTH.r*2,BALL_PLINTH.r*2));
 o.push({minX:DESK.x-DESK.w/2,maxX:DESK.x+DESK.w/2,minZ:GUIDE.z-.35,maxZ:DESK.z+DESK.d/2});
 o.push(rect(CARD_TABLE.x,CARD_TABLE.z,CARD_TABLE.w,CARD_TABLE.d),rect(BOOKCASE.x,BOOKCASE.z,BOOKCASE.w,BOOKCASE.d));
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
