'use client';
/**
 * Print a self-contained HTML document (lib/grownups/report.ts, the save-code card, the IDP fridge card) so the browser's print
 * sheet (with "Save as PDF") shows only that document, not the 3D island or the title screen.
 *
 * Oct 9 2026 (user: "the print option should only have the code and not all that stuff in the background"): iPhone browsers
 * print the whole top page even when print() is called on a hidden iframe, so the document now goes into the page itself: its
 * body in a shadow root (its CSS scoped there, `body` → `:host`) on a print-only layer, plus a print stylesheet that hides
 * everything else on the page while printing. Works the same in every browser. On demand only; both are removed after printing.
 */
export const PRINT_FRAME_ATTR='data-grownups-print';
export function printHtml(html:string,{now=false}:{now?:boolean}={}){
 document.querySelectorAll(`[${PRINT_FRAME_ATTR}]`).forEach(f=>f.remove());
 const doc=new DOMParser().parseFromString(html,'text/html');
 const css=[...doc.querySelectorAll('style')].map(s=>s.textContent??'').join('\n')
  .replace(/@page\s*\{[^}]*\}/g,'').replace(/(^|[\s,{}])body(?=[\s,{.:#[>~+])/g,'$1:host');
 const host=document.createElement('div');host.setAttribute(PRINT_FRAME_ATTR,'');host.setAttribute('aria-hidden','true');
 const root=host.attachShadow({mode:'open'});
 root.innerHTML=`<style>:host{display:block}${css}</style>${doc.body.innerHTML}`;
 const sheet=document.createElement('style');sheet.setAttribute(PRINT_FRAME_ATTR,'');
 sheet.textContent=`body>[${PRINT_FRAME_ATTR}]{display:none}`+
  `@media print{@page{size:auto;margin:12mm}html,body{background:#fff!important;height:auto!important;min-height:0!important;overflow:visible!important}`+
  `body>*:not([${PRINT_FRAME_ATTR}]){display:none!important}body>[${PRINT_FRAME_ATTR}]{display:block!important}}`;
 document.head.appendChild(sheet);document.body.appendChild(host);
 let cleaned=false;
 const done=()=>{if(cleaned)return;cleaned=true;host.remove();sheet.remove();};
 window.addEventListener('afterprint',()=>setTimeout(done,500),{once:true});setTimeout(done,120000);
 // `now`: straight from the tap (the browser still treats it as the user's action); otherwise a beat for layout (fonts, images).
 if(now)window.print();else setTimeout(()=>window.print(),60);
 return host;
}
