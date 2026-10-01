'use client';
/**
 * Print a self-contained HTML document (lib/grownups/report.ts) from a hidden same-origin iframe, so the browser's print
 * sheet (with "Save as PDF") shows only the report, not the 3D island. On demand only; the frame is removed afterwards.
 */
export const PRINT_FRAME_ATTR='data-grownups-print';
export function printHtml(html:string){
 document.querySelectorAll(`iframe[${PRINT_FRAME_ATTR}]`).forEach(f=>f.remove());
 const frame=document.createElement('iframe');
 frame.setAttribute(PRINT_FRAME_ATTR,'');frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;
 frame.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none';
 frame.onload=()=>{const w=frame.contentWindow;if(!w)return;const done=()=>setTimeout(()=>frame.remove(),1000);w.addEventListener('afterprint',done,{once:true});setTimeout(done,120000);w.focus();w.print();};
 frame.srcdoc=html;
 document.body.appendChild(frame);
 return frame;
}
