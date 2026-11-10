/**
 * The close-up machine's one status pill (owner, Nov 10 2026: "Simplify this to fit between Toy Shelf and Done btn on mobile").
 * Replaces the two chips ("Toys 2/6" with six dots + "None left today"): the capsule icon with "2/6" and, when it matters, one
 * short second fact. Pure text, no React (components/GashaponMachineFace.tsx renders it; tests/gashapon-status.cjs pins it).
 *  - `cap` (or 0 left): "None left"; `coins`: "Need coins"; 1-3 left: "3 left"; otherwise no second fact (owner, Nov 10 2026: the
 *    daily count only when 3 or fewer are left);
 *  - `label` is the full sentence for screen readers ("2 of 6 toys collected from this machine. No spins left today.").
 */
export type GashaponStatusInput={found:number;total:number;left:number;blocked:'cap'|'coins'|null};
export type GashaponStatus={count:string;fact:string|null;kind:'cap'|'coins'|'few'|null;label:string};

export function gashaponStatus({found,total,left,blocked}:GashaponStatusInput):GashaponStatus{
 const count=`${found}/${total}`,toys=`${found} of ${total} toys collected from this machine.`;
 if(blocked==='cap'||left<=0)return {count,fact:'None left',kind:'cap',label:`${toys} No spins left today.`};
 if(blocked==='coins')return {count,fact:'Need coins',kind:'coins',label:`${toys} Not enough coins for a spin.`};
 if(left<=3)return {count,fact:`${left} left`,kind:'few',label:`${toys} ${left} spin${left===1?'':'s'} left today.`};
 return {count,fact:null,kind:null,label:toys};
}
