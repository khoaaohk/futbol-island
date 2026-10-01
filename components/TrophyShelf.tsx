'use client';
import type {ReactNode} from 'react';
import type {BackpackItem} from '@/lib/town/backpack';
import {capRewardFor,GRADUATION_FORMATS,type GradFormat} from '@/lib/endgame/graduationModel';
import {openEndgame} from '@/lib/endgame/graduationStore';
import {isCertificateId} from '@/lib/endgame/certificate';
import {Seal} from './Certificate';

/** Backpack renderer for the Trophy shelf (lib/endgame/backpackTrophies.ts): a seal in the path's colours; tap to view. */
const colours=(ref:string)=>{const f=ref.slice(5) as GradFormat;return GRADUATION_FORMATS.includes(f)?capRewardFor(f):capRewardFor('finale');};
export const trophyRenderer={
 art:(item:BackpackItem):ReactNode=>{const c=colours(item.ref);return <span style={{display:'grid',placeItems:'center',width:'100%',height:'100%'}}><span style={{width:'58%',maxWidth:96}}><Seal ink={c.color} accent={c.color2}/></span></span>;},
 action:(item:BackpackItem)=>({verb:'View',run:()=>{if(isCertificateId(item.ref))openEndgame({target:'certificate',id:item.ref});}}),
};
