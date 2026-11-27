// Rail + beach props (Nov 27 2026, owner shot 185: "make all of these items more rounded and less blocky"): the beach loungers and
// towels. A lounger pad becomes a puffy cushion on a rounded wooden base (base down to the sand), its backrest a padded cushion, the
// flat towel a soft puffy mat. Same footprints, same pad TOP (beachLoungers.ts: the sunbathers lie at that height), same obstacles.
// The pieces are SoftBoxGeometry (userData.puff: the batching pass bakes the pool-float shading), in paints the sets already use
// (the umbrella pole's wood): 0 new draws. `?soft=0` / `?puff=0` -> null (the caller's boxes). Low tier (Battery saver / heat >= 2 at
// build): chamfers (seg 0).
import {SoftBoxGeometry,puffLevel,softLow} from '../graphics/softBox';

export const LOUNGER_WOOD='#9d805b';
type Piece={g:SoftBoxGeometry;y:number};
/** A lounger pad w x h x len centred at height y: [base (wood), cushion (the pad's colour)] with local y centres, or null (puff off). */
export function loungerPad(w:number,h:number,len:number,y:number):{base:Piece;cushion:Piece}|null{
 const p=puffLevel();if(p<=0)return null;const seg=softLow()?0:1,b=y-h/2,t=y+h/2,dome=.05;
 // the base: a low wooden frame with small rounds (reads as a frame, not a pebble); the cushion inset 5 cm, fat and domed
 const bh=b+.065,ch=t-dome*.5-(b+.035);
 return {base:{g:new SoftBoxGeometry(w+.04,bh,len+.04,{radius:.03,seg,openBottom:true}),y:bh/2},
  cushion:{g:new SoftBoxGeometry(w-.1,ch,len-.12,{puff:p*1.15,seg,dome,maxR:[.16,1,.2]}),y:b+.035+ch/2}};}
/** The backrest: a padded cushion of the old board's size (the caller keeps its tilt and place). */
export function loungerBackGeo(w:number,h:number,len:number){const p=puffLevel();if(p<=0)return null;return new SoftBoxGeometry(w-.04,h*1.6,len,{puff:p*1.15,seg:softLow()?0:1,dome:.04,maxR:[.14,1,.14]});}// a rounded-rectangle pad, not a disc}
/** A beach towel / mat: a soft 5 cm puffy mat on the sand (centre y returned). */
export function towelGeo(w:number,d:number){const p=puffLevel();if(p<=0)return null;return {g:new SoftBoxGeometry(w,.05,d,{puff:p*.8,seg:softLow()?0:1,openBottom:true,dome:.012}),y:.025};}
