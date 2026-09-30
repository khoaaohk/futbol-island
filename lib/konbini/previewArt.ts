import {Iso} from './isoArt';
import {FOOD_SHADOW,type FoodLayer} from './foodArt';
import {drawVendingProduct} from '../graphics/vendingProductArt';
/**
 * Preview art for the Konbini gear shelf (user, Sep 30 2026: "allow options to preview before buying"): the item's REAL
 * vending picture (the same painter as the machines and the backpack: balls in their style, the card pack art) standing on a
 * small iso display stand, as FoodLayer[] so the big reveal view can show it. Painted by the reveal's bounded build only.
 */
export function gearPreviewLayers(id:string,itemKind:string):FoodLayer[]{
 // The vending painter draws balls under kind 'ball' (the backpack's VendingProductArt does the same).
 const kind=id.startsWith('ball:')?'ball':itemKind,ball=kind==='ball';FOOD_SHADOW[id]={rx:19,ry:8,dy:15};
 return [
  {name:'display stand',draw:(c,x,y)=>{const I=new Iso(c,x,y+15);I.lathe([0,0,0],[0,0,3.6],[[0,15],[1,15]],'#efe4cc',{segs:18,cap:'#fbf6ea'});I.lathe([0,0,3.6],[0,0,4.6],[[0,11.5],[1,11.5]],'#e9c16b',{segs:18,cap:'#f5d68a'});}},
  {name:kind==='pack'?'card pack':'the ball',draw:(c,x,y)=>{drawVendingProduct(c,id,kind,x,ball?y-9:y-8,ball?13.5:12,false);}},
  {name:'shine',kind:'glint',draw:(c,x,y)=>{c.fillStyle='#ffffff';for(const [gx,gy,r] of [[x+15,y-20,3],[x-17,y-4,2.2]] as const){c.fillRect(gx-r,gy-.5,r*2,1);c.fillRect(gx-.5,gy-r,1,r*2);}}},
 ];
}
