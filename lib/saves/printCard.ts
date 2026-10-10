'use client';
/**
 * The printable code card (doc §3.4): the four tiles with their pictures (every word has one; the number shows 🔢), a line on what
 * a save code is, "Futbol Island save code. Keep it safe, like a key.",
 * and a QR code for https://futbolisland.app/#save=<code>. The #fragment is never sent to a server or written to a log;
 * opening it fills in the restore boxes and still asks "Load my island?". Self-contained HTML (no scripts, no network: the QR
 * is an inline PNG made on this device by the `qrcode` package, loaded only when printing), printed from a hidden iframe
 * (lib/grownups/printHtml.ts).
 */
import {NUMBER_PICTURE,codeFromNormal,pictureFor} from './code';
import {printHtml} from '../grownups/printHtml';

const esc=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const CARD_ORIGIN='https://futbolisland.app';
export const qrLink=(code:string)=>`${CARD_ORIGIN}/#save=${code}`;

export function codeCardHtml(code:string,qrDataUrl:string|null):string{
 const c=codeFromNormal(code);if(!c)return '';
 const tile=(pic:string,word:string,num=false)=>`<div class="tile${num?' num':''}"><div class="pic">${esc(pic)}</div><b>${esc(word)}</b></div>`;
 const tiles=c.words.map(w=>tile(pictureFor(w)??'',w)).join('')+tile(NUMBER_PICTURE,String(c.number),true);
 const card=`<section class="card"><h1>Futbol Island save code</h1><div class="tiles">${tiles}</div>
<p class="what">This code is the key to your island. Type it on any phone, tablet or computer to keep playing where you left off.</p>
<p class="key">Keep it safe, like a key. Don't share it with friends.</p>
<div class="foot">${qrDataUrl?`<img src="${esc(qrDataUrl)}" width="120" height="120" alt="QR code that opens Futbol Island with this code filled in">`:''}
<p>On any phone, tablet or computer: open <b>futbolisland.app</b>, tap <b>I have a save code</b> and type the three words and the number.${qrDataUrl?' Or scan the square.':''}</p></div></section>`;
 const css=`*{box-sizing:border-box}body{margin:0;padding:24px;font:14px/1.45 Arial,Helvetica,sans-serif;color:#244d40;background:#fff}
.card{max-width:640px;margin:0 auto;border:3px dashed #244d40;border-radius:22px;padding:22px 24px;break-inside:avoid}
h1{margin:0 0 14px;font-size:22px}.tiles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.tile{border:2px solid #244d40;border-radius:16px;padding:10px 6px;text-align:center;background:#fff8e3}.tile.num{background:#f9d665}
.pic{font-size:30px;min-height:36px;line-height:36px}.tile b{display:block;font-size:20px;letter-spacing:.5px}
.what{margin:14px 0 0}.key{font-weight:700;margin:8px 0 8px}.foot{display:flex;gap:16px;align-items:center}.foot p{margin:0}
@page{size:auto;margin:12mm}@media print{body{padding:0}}`;
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Futbol Island save code</title><style>${css}</style></head><body>${card}</body></html>`;
}

const qrCache=new Map<string,string|null>();
/** Make the card's QR ahead of time (called when the code is shown), so Print can open the print sheet straight from the tap:
 *  browsers (Safari especially) refuse print() once the tap is too far back, and loading the QR library on a slow connection or
 *  the dev server took longer than that (Oct 10 2026: "print doesn't seem to be working on desktop"). */
export async function prepareCodeCard(code:string){
 if(qrCache.has(code))return;
 try{const {default:QR}=await import('qrcode');qrCache.set(code,await QR.toDataURL(qrLink(code),{width:240,margin:1,errorCorrectionLevel:'M'}));}catch{qrCache.set(code,null);}
}
export function printCodeCard(code:string){
 if(qrCache.has(code))return printHtml(codeCardHtml(code,qrCache.get(code)??null),{now:true});
 return prepareCodeCard(code).then(()=>printHtml(codeCardHtml(code,qrCache.get(code)??null)));
}
