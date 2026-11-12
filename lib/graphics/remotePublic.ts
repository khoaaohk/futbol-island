// Public island (phase 1, Nov 11 2026; docs/multiplayer-public-island-plan-2026-11-11.md): what the remote-player DRAWING needs to know
// about strangers, in one small adapter (Agent D). remoteAvatars.ts and FriendMapDots.tsx read only this file for it.
//
// Source (the client, lib/multiplayer/**, never edited from here):
//   isPublic()   publicWorld.ts isPublic(): this page's connection is a public world. Party friends do not also see the public world,
//                so in that mode EVERY remote is a stranger: generated name, no map dot, no bumps / knock-overs, the personal-space
//                fade, the room cap of 6, the stranger emote cap, a fade-out when they leave.
//   nameIdx(id)  the store member's wire pair [colour, animal] (store.ts Member.nameIdx). The label shows worldNameFor(idx) ("Teal
//                Puffin"). A stranger's typed first name is NEVER drawn: the relay drops it in a world, the store keeps nick null there,
//                and even a name passed to upsert() is ignored for a stranger (tests/mp-public-draw.cjs).
//   hidden(id)   strangers.ts isHiddenStranger(id): the session Hide / Report list (roomParty.ts also passes it to setHidden).
// setPublicDrawSource() replaces the source (tests, and the dev-only heat / screenshot hook below).
import {NAME_COLOURS,worldNameFor,type MemberId,type NameIdx} from '../../multiplayer/protocol';
import {COLOUR_HEX} from '../multiplayer/names';
import {isPublic} from '../multiplayer/publicWorld';
import {isHiddenStranger} from '../multiplayer/strangers';
import {partyStore} from '../multiplayer/store';

export interface PublicDrawSource{
 isPublic():boolean;
 nameIdx(id:MemberId):NameIdx|null;
 hidden?(id:MemberId):boolean;
 /** Optional: bumps whenever any of the above changes (the layer also re-reads once a second and on every upsert). */
 version?():number;
}

/** The client's accessors (no allocation: a plain loop over the store's members). */
export const clientSource:PublicDrawSource={
 isPublic,
 nameIdx(id){const ms=partyStore.get().members;for(let i=0;i<ms.length;i++)if(ms[i].id===id)return ms[i].nameIdx??null;return null;},
 hidden:isHiddenStranger,
};

let src:PublicDrawSource=clientSource,srcVer=0;
/** Replace the source (null = the client's accessors again). */
export function setPublicDrawSource(s:PublicDrawSource|null):void{src=s??clientSource;srcVer++;}

/** What the drawing reads. */
export const publicDraw={
 isPublic():boolean{return src.isPublic();},
 nameIdx(id:MemberId):NameIdx|null{return src.nameIdx(id);},
 hidden(id:MemberId):boolean{return src.hidden?src.hidden(id):false;},
 version():number{return srcVer*1000003+(src.version?src.version():0);},
};

/** A stranger's label: the generated pair ("Teal Puffin"); without one, the colour name of their ring; never a typed name. */
export function strangerLabel(idx:NameIdx|null,hex:string|undefined):string{
 if(idx)return worldNameFor(idx);
 const c=hex?COLOUR_HEX.indexOf(hex.toUpperCase()):-1;
 return c>=0?NAME_COLOURS[c]:'Player';
}

// Dev builds only (never production): heat / screenshot checks (scripts/check-mp-public-heat.cjs) force the public drawing rules and
// reach the friend layers to drive them with synthetic strangers.
type DevHook={setPublicDrawSource:typeof setPublicDrawSource;layers:unknown[]};
export function devRegisterLayer(layer:unknown):void{
 if(process.env.NODE_ENV==='production'||typeof window==='undefined')return;
 const w=window as unknown as {__fi2PublicDraw?:DevHook};
 const h=w.__fi2PublicDraw??(w.__fi2PublicDraw={setPublicDrawSource,layers:[]});
 h.layers.push(layer);if(h.layers.length>4)h.layers.shift();
}
