/**
 * Other players on the map (Nov 13 2026; the relay's S.Map, lib/multiplayer/mapDots.ts). Pure rules, no React and no network: where
 * each anonymous dot goes (the centre of its MAP_DOTS.cellM cell, in world metres = map units, kept on the map like a friend's dot)
 * and its count badge. The cell I stand in is left out, so a dot never sits on "You" and never points at someone right beside me
 * (they are on screen anyway). Drawn by components/PlayerMapDots.tsx; tests/mp-map-dots.cjs.
 */
import {MAP_DOTS,type MapCell} from '../../multiplayer/protocol';
import {friendMapPoint} from './friendMarks';

type Bounds={minX:number;maxX:number;minZ:number;maxZ:number};
export type PlayerDot={key:string;x:number;z:number;n:number};

/** The dots to draw for `cells`; `me` = my island spot (null = unknown: nothing left out). Keeps the relay's order. */
export function playerDots(cells:readonly MapCell[],me:{x:number;z:number}|null,bounds:Bounds):PlayerDot[]{
 const C=MAP_DOTS.cellM,mx=me?Math.floor(me.x/C):NaN,mz=me?Math.floor(me.z/C):NaN,out:PlayerDot[]=[];
 for(const [cx,cz,n] of cells){
  if(cx===mx&&cz===mz)continue;
  const p=friendMapPoint((cx+.5)*C,(cz+.5)*C,bounds);
  out.push({key:cx+','+cz,x:p.x,z:p.z,n});
 }
 return out;
}

/** The count badge: none for one player, the number up to 9, then "9+". */
export const playerBadge=(n:number):string|null=>n<=1?null:n>9?'9+':String(n);
