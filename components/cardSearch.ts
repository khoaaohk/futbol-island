/**
 * Instant card search for "Collect cards". Pure (no imports) so tests/card-collection.cjs can run it directly.
 * Accent- and punctuation-insensitive: "mbappe" finds "Kylian Mbappé", "alexander arnold" and "alexanderarnold"
 * find "Trent Alexander-Arnold", and "42", "#42" or "No. 042" find card 42.
 */
const EXTRA:Record<string,string>={ø:'o',æ:'ae',œ:'oe',ß:'ss',đ:'d',ð:'d',ł:'l',ı:'i',þ:'th'};
export function fold(text:string):string{
 return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[øæœßđðłıþ]/g,ch=>EXTRA[ch]??ch).replace(/[^a-z0-9]+/g,' ').trim();
}
/** A card number typed on its own ("42", "#42", "no 42", "No. 042"), else null. */
export function numberQuery(query:string):number|null{
 const match=/^(?:no\.?\s*|#\s*)?(\d{1,3})$/i.exec(query.trim());return match?Number(match[1]):null;
}
/** True when `name` (or card `number`) matches the typed query. An empty query matches nothing. */
export function matchesCard(query:string,name:string,number:number):boolean{
 const wanted=numberQuery(query);if(wanted!==null)return wanted===number;
 const q=fold(query);if(!q)return false;
 const n=fold(name);return n.includes(q)||n.replace(/ /g,'').includes(q.replace(/ /g,''));
}
/** Missing players stay secret until the query is specific (3+ letters): typing "a" must not reveal every name. */
export const revealsName=(query:string)=>numberQuery(query)===null&&fold(query).replace(/ /g,'').length>=3;
