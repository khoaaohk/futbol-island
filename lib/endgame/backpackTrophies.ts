import {registerBackpackCategory,type BackpackItem} from '../town/backpack';
import {GRAD_TITLES,GRADUATION_FORMATS,type GraduationRecord} from './graduationModel';

/**
 * Backpack → Trophy shelf (Lane 2, Sep 30 2026). Certificates are derived from the graduation record (never a second ledger):
 * one per graduated path plus the Island Diploma after the Matchday final. The source is passed in as `trophies` by
 * backpackStore.ts; tapping one opens the certificate (components/TrophyShelf.tsx renderer).
 */
export type TrophySource={id:string;label:string;detail:string;at:number};
export function trophiesFrom(record:GraduationRecord):TrophySource[]{
 const out:TrophySource[]=GRADUATION_FORMATS.filter(f=>record.formats[f]).map(f=>({id:`grad:${f}`,label:`${GRAD_TITLES[f]} Graduate`,detail:'Certificate · 12 ideas learned',at:record.formats[f]!.at}));
 if(record.finale)out.push({id:'diploma',label:'Island Diploma',detail:'Matchday Champion',at:record.finale.at});
 return out;
}
registerBackpackCategory({kind:'trophy',label:'Trophy shelf',order:80,
 lesson:'Each certificate lists the football ideas you learned on that path. Save it, print it or show a grown-up.',
 emptyHint:'Graduate a path (all 12 starter lessons) to put your first certificate on the shelf.',
 collect:s=>(s.trophies??[]).map((t):BackpackItem=>({id:`trophy:${t.id}`,kind:'trophy',ref:t.id,label:t.label,detail:t.detail,source:'reward',acquiredAt:t.at}))});
