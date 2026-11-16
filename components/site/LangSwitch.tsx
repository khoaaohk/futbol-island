'use client';
import {usePathname} from 'next/navigation';
import {hasEs,toEn,toEs} from '@/lib/i18n/esPaths';
import styles from '@/app/(site)/site.module.css';
/**
 * EN | ES (Spanish round 1, Nov 15 2026): a plain link to the same page in the other language, only where that page exists
 * (lib/i18n/esPaths.ts). Kid-safe: no geo or Accept-Language redirect, nothing stored; the reader chooses. It reads the path
 * (usePathname, prerendered into the HTML); the current language is plain text, the other one a link with hreflang.
 */
export default function LangSwitch(){
 const path=usePathname()||'/',en=toEn(path),es=en!==null;
 const enPath=es?en:path;if(!hasEs(enPath))return null;
 return <span className={styles.lang} data-lang-switch="">
  {es?<a href={enPath} hrefLang="en" lang="en">EN</a>:<b aria-current="true">EN</b>}<span aria-hidden="true"> | </span>
  {es?<b aria-current="true">ES</b>:<a href={toEs(enPath)} hrefLang="es" lang="es">ES</a>}
 </span>;
}
