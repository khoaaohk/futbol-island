/**
 * Friends on the map (Oct 23 2026, owner: "on the map, can we show where friends are?"). Pure rules, no React and no network:
 * which party friends get a dot, where (world metres = map units, clamped onto the map), and how it looks. The dots are drawn by
 * components/FriendMapDots.tsx on the full travel map and the corner minimap (tests/friend-map-dots.cjs).
 */
type Bounds={minX:number;maxX:number;minZ:number;maxZ:number};
export type FriendPresence='active'|'busy'|'indoors'|'away';
export type FriendMember={id:number;name:string;nick:string|null;colourHex:string;presence:FriendPresence;room:number};
export type FriendDoor={room:number;x:number;z:number};
export type FriendDot={id:number;x:number;z:number;hex:string;initial:string;name:string;dim:boolean;indoors:boolean;presence:FriendPresence;room:number};

/** World x / z to map units. The maps' SVG viewBox is world metres (IslandOverview), so this only keeps a far friend (past the
 *  flight area, e.g. a stale spot) on the map's own rim instead of off its edge. `rim` = the map's border around the bounds. */
export function friendMapPoint(x:number,z:number,b:Bounds,rim=8):{x:number;z:number}{
 const inset=4; // a dot's centre stays this far inside the drawn edge so the whole dot shows
 return{x:Math.min(b.maxX+rim-inset,Math.max(b.minX-rim+inset,x)),z:Math.min(b.maxZ+rim-inset,Math.max(b.minZ-rim+inset,z))};
}

/** The first letter of what the party list calls them (typed first name, else the colour name 'Red'). */
export const friendInitial=(m:Pick<FriendMember,'name'|'nick'>)=>{const n=(m.nick||m.name||'?').trim();return(Array.from(n)[0]||'?').toUpperCase();};

/** The tooltip line after a friend's name on the full map. `roomPhrase` = the party list's room words, lower-cased ("in the Konbini"). */
export function friendDotText(d:Pick<FriendDot,'presence'>,roomPhrase?:string):string{
 if(d.presence==='indoors')return roomPhrase||'is inside';
 if(d.presence==='busy')return 'busy right now';
 if(d.presence==='away')return 'away for a moment';
 return 'is here';
}

/**
 * The dots to draw. Rules: never me; no dot for a friend the player HID (Hide in the party list); muted friends ARE drawn; busy and
 * away friends are dimmed; a friend indoors in a room sits at that building's door (from `doors`; else their last island spot, which
 * is where they went in) with a door badge; a friend with no known spot yet gets no dot. Members keep the party list's order.
 */
export function friendDots(members:readonly FriendMember[],you:number|null,spot:(id:number)=>{x:number;z:number}|undefined,hidden:ReadonlySet<number>,doors:readonly FriendDoor[],bounds:Bounds):FriendDot[]{
 const out:FriendDot[]=[];
 for(const m of members){
  if(m.id===you||hidden.has(m.id))continue;
  const indoors=m.presence==='indoors',door=indoors&&m.room>=0?doors.find(d=>d.room===m.room):undefined;
  const at=door??spot(m.id);if(!at)continue;
  const p=friendMapPoint(at.x,at.z,bounds);
  out.push({id:m.id,x:p.x,z:p.z,hex:m.colourHex,initial:friendInitial(m),name:m.nick||m.name,dim:m.presence==='busy'||m.presence==='away',indoors,presence:m.presence,room:m.room});
 }
 return out;
}

/** True when the drawn dots should change: a friend added / removed / restyled, or one moved at least `minMove` map units.
 *  The minimap uses 1 m (it only redraws for a real step); the open full map a little less. */
export function friendDotsChanged(prev:readonly FriendDot[],next:readonly FriendDot[],minMove:number):boolean{
 if(prev.length!==next.length)return true;
 for(let i=0;i<next.length;i++){const a=prev[i],b=next[i];
  if(a.id!==b.id||a.hex!==b.hex||a.initial!==b.initial||a.name!==b.name||a.presence!==b.presence||a.room!==b.room)return true;
  if(Math.hypot(a.x-b.x,a.z-b.z)>=minMove)return true;}
 return false;
}
