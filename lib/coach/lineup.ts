/**
 * The coach app's lineup moves (round 4D, Nov 22 2026). Pure data: the Lineup tab (components/coach/CoachApp.tsx) and
 * tests/coach-app.cjs share it. The lineup is ONE array of spot ids (`spots[i]` = the player in formation spot i, '' = empty);
 * the bench is never stored, it is "everyone here who is not in a spot" (derive() in CoachApp). So a player can only ever be
 * in one place: a move rewrites the spots array and the bench follows from it.
 * Round 4D bug (owner's screenshot: a disc "8" left below the pitch while the bench "8" was still selected): the state was
 * never wrong; the drag ghost and the tap selection were separate UI state that a lost pointer release never cleared. The
 * drag controller now ends on every release path (up, cancel, lost capture, blur, hidden page, unmount).
 */
export type Ref={k:'s';i:number}|{k:'b';id:string};
export const refKey=(r:Ref)=>r.k==='s'?`s:${r.i}`:`b:${r.id}`;
export const parseRef=(s:string|null|undefined):Ref|null=>{if(!s)return null;const [k,v]=s.split(':');
 return k==='s'&&/^\d+$/.test(v??'')?{k:'s',i:Number(v)}:k==='b'&&v?{k:'b',id:v}:null;};
export type Move={spots:string[];kind:'swap'|'in'|'place';/** the player now in spot `to` */on:string;/** the player who left spot `to` ('' for none): to the bench ('in') or to the other spot ('swap') */off:string;to:number};
/**
 * Move `a` onto `b` (a drag from `a` dropped on `b`, or tap `a` then tap `b`). Returns null when nothing changes:
 * bench onto bench, a spot onto itself, an empty source, a player who is not in the lineup or on the bench.
 * - spot onto spot: the two swap (a player onto an empty spot moves there);
 * - bench onto spot, or spot onto bench: the bench player takes the spot and the spot's player goes to the bench.
 */
export function moveSpots(spots:readonly string[],bench:readonly string[],a:Ref,b:Ref):Move|null{
 const s=[...spots];
 if(a.k==='b'&&b.k==='b')return null;
 if(a.k==='s'&&b.k==='s'){if(a.i===b.i||a.i<0||b.i<0||a.i>=s.length||b.i>=s.length)return null;const x=s[a.i]??'',y=s[b.i]??'';if(!x)return null;
  s[a.i]=y;s[b.i]=x;return {spots:s,kind:y?'swap':'place',on:x,off:y,to:b.i};}
 const [bn,sp]=a.k==='b'?[a,b as Extract<Ref,{k:'s'}>]:[b as Extract<Ref,{k:'b'}>,a];
 if(sp.i<0||sp.i>=s.length||!bench.includes(bn.id)||s.includes(bn.id))return null;
 const out=s[sp.i]??'';if(a.k==='s'&&!out)return null;s[sp.i]=bn.id;
 return {spots:s,kind:out?'in':'place',on:bn.id,off:out,to:sp.i};
}
/** The invariant: nobody twice on the pitch, nobody both on the pitch and on the bench. */
export function onePlace(spots:readonly string[],bench:readonly string[]):boolean{
 const on=spots.filter(Boolean),set=new Set(on);
 return set.size===on.length&&bench.every(id=>!set.has(id))&&new Set(bench).size===bench.length;
}
