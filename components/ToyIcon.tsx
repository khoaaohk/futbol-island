/**
 * A gashapon toy's flat icon (Nov 10 2026, owner: "update all these icons to the art style we talked about and match each to their
 * toys"): the island's pixel-edged outlined style (FuelIcon, FruitArt), one drawing per toy from lib/gashapon/toyIcons. A toy with
 * no drawing yet gets a neutral two-tone capsule in its own colours. Static inline SVG: no canvas, no images, no WebGL per tile.
 * The markup injected is only the registry's own static strings (built from constants, never from user data).
 */
import {toyIconMarkup} from '@/lib/gashapon/toyIcons';
import {INK,LIGHT} from '@/lib/gashapon/toyIcons/types';
import {gashaponToy} from '@/lib/gashapon/toys';

/** Lighten very dark toy colours for the fallback capsule (owner: vibrant colours only, no black). */
function bright(hex:string|undefined,dflt:string){
 if(!hex||!/^#[0-9a-f]{6}$/i.test(hex))return dflt;
 const n=parseInt(hex.slice(1),16),l=(0.2126*(n>>16)+0.7152*((n>>8)&255)+0.0722*(n&255))/255;
 return l<0.3?dflt:hex;
}

export default function ToyIcon({id,size=56,className}:{id:string;size?:number;className?:string}){
 const markup=toyIconMarkup(id);
 const common={viewBox:'0 0 16 16',width:size,height:size,'aria-hidden':true as const,shapeRendering:'crispEdges' as const,className,'data-toy-icon':id};
 if(markup)return <svg {...common} dangerouslySetInnerHTML={{__html:markup}}/>;
 const toy=gashaponToy(id),top=bright(toy?.colors[0],'#f2b632'),bottom=bright(toy?.colors[1],'#fff3d6');
 return <svg {...common} data-toy-icon-fallback="">
  <path d="M2 8.4h12a6 6 0 0 1-12 0Z" fill={bottom} stroke={INK} strokeWidth="1.2" strokeLinejoin="round"/>
  <path d="M2 7.6a6 6 0 0 1 12 0Z" fill={top} stroke={INK} strokeWidth="1.2" strokeLinejoin="round"/>
  <path d="M4.6 5.4a3.6 3.6 0 0 1 2-1.6" fill="none" stroke={LIGHT} strokeWidth="1" strokeLinecap="round"/>
 </svg>;
}
