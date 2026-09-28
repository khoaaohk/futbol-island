/** Fallback paper spread for any book page without authored artwork: never shipped as the final scene,
 * but it keeps every page readable and animated (title print, backdrop, a player and the page action). */
import {INK,type Kit,rect,ell} from './popupPlates';
import * as S from './popupScenery';
import {type SpreadDef,beat,PAGE_D} from './popupEngine';
import type {BookPage} from './types';

export function genericSpread(bookId:string,page:BookPage,index:number):SpreadDef{
 const key=`${bookId}-${page.id}-g`,tone=[INK.grass,INK.sand,INK.sky2][index%3];
 const print=(k:Kit,x0:number)=>{const p=rect(x0,0,5,PAGE_D);k.fill(p,tone,.7);k.dots(p,INK.leaf,.06,.2);};
 return {id:page.id,rest:0,
  left:k=>{print(k,-5);k.text(page.year.toUpperCase(),-2.5,PAGE_D/2+2.2,.22,INK.navy,{max:4});k.text(page.title.toUpperCase(),-2.5,PAGE_D/2+2.62,.3,INK.blue,{max:4.2});},
  right:k=>{print(k,0);k.fill(ell(2.5,PAGE_D/2+1.9,.9,.5),INK.yellow,.6);},
  build:B=>{
   B.vfold({key:key+'L',w:4.4,h:2.8,paint:k=>{const p=rect(0,0,4.4,2.8);k.fill(p,INK.sky2);k.dots(p,INK.sky,.05,(x,y)=>.7-y/2.8*.7);k.fill(rect(0,2.2,4.4,.6),INK.grass);}},
    {key:key+'R',w:4.4,h:2.8,paint:k=>{const p=rect(0,0,4.4,2.8);k.fill(p,INK.sky2);k.dots(p,INK.sky,.05,(x,y)=>.7-y/2.8*.7);k.fill(rect(0,2.2,4.4,.6),INK.grass);}},-3.05,1.22);
   B.stand(S.tree(key+'t',1,1.6),-4.2,-.8,{layer:1});B.stand(S.goal(key+'g',1.5,.8),3.6,-1.3,{layer:1});
   const hero=B.person(key+'p',-1.4,.9,1.3,{shirt:'fan',hair:'short',face:'smile'});
   const ball=B.stand(S.ball(key+'b',.12),-.9,1.05,{layer:3,tab:false});
   return b=>{hero.armR.rot=.12+1.6*beat(b.t,2,3)+1.4*b.action;ball.x=-.9+3.6*Math.max(b.action,beat(b.t,4,8));ball.rot=-ball.x*5;};
  }};
}
