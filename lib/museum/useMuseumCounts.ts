'use client';
import {useCoinProgress} from '../town/coinProgress';
import {useBackpack} from '../town/backpackStore';
import type {BackpackItem} from '../town/backpack';
import {graduatedFormats} from '../endgame/graduationModel';
import {useGraduations} from '../endgame/graduationStore';
import type {MuseumCounts} from '../endgame/museum';

/** The player's own collection, for the "Your Collection" wing: found ball-hunt spot ids, and the backpack's card and book
 *  items with each group's own one-line lesson (lib/town/backpack.ts). Nothing here is new content. */
export type MuseumCollection={balls:readonly string[];cards:readonly BackpackItem[];books:readonly BackpackItem[];cardLesson:string;bookLesson:string};
/** What opens the museum's cases (unchanged from the Sep 30 dialog): hidden balls found, player cards and pop-up books in the
 *  backpack, and path graduations. `ready` = the backpack has read its stores (cases are built only then). */
export function useMuseumCounts():MuseumCounts&{ready:boolean;collection:MuseumCollection}{
 const coins=useCoinProgress(),{groups,ready}=useBackpack(),record=useGraduations();
 const group=(kind:string)=>groups.find(g=>g.kind===kind);
 const cards=group('card'),books=group('book');
 return {balls:coins.collected.length,cards:cards?.items.length??0,books:books?.items.length??0,graduations:graduatedFormats(record).length,ready,
  collection:{balls:coins.collected,cards:cards?.items??[],books:books?.items??[],cardLesson:cards?.lesson??'',bookLesson:books?.lesson??''}};
}
