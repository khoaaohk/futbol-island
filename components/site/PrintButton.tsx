'use client';
import t from '@/components/site/tools/tools.module.css';
/** "Print / Save as PDF" (seo-extras, Nov 15 2026): the browser's own print dialog, which also saves a PDF. No PDF library. */
export default function PrintButton({label='Print / Save as PDF'}:{label?:string}){
 return <button type="button" className={t.btn} onClick={()=>window.print()}>{label}</button>;
}
