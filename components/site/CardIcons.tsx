import type {CardIcon} from '@/lib/site/cardRules';
/**
 * One flat line icon per card offence (cards page, Nov 16 2026), drawn on a 48 grid in currentColor so it takes the card's
 * ink. Decorative: the offence name beside it carries the meaning, so every icon is aria-hidden.
 */
const P:Record<CardIcon,React.ReactNode>={
 mask:<><path d="M8 14c8-3 24-3 32 0 0 14-6 22-16 22S8 28 8 14Z"/><path d="M15 21c2-2 5-2 7 0M26 21c2-2 5-2 7 0M18 29c4 2 8 2 12 0"/></>,
 talk:<><path d="M8 10h32v20H22l-9 8v-8H8Z"/><path d="M24 15v7M24 26v.5"/></>,
 repeat:<><path d="M12 20a12 12 0 0 1 22-5l2 3"/><path d="M36 10v8h-8"/><path d="M36 28a12 12 0 0 1-22 5l-2-3"/><path d="M12 38v-8h8"/></>,
 clock:<><circle cx="24" cy="26" r="14"/><path d="M24 18v8l6 4M19 6h10M24 6v6"/></>,
 distance:<><path d="M6 24h36M12 17l-6 7 6 7M36 17l6 7-6 7"/><path d="M6 10v6M42 10v6"/></>,
 enter:<><path d="M26 8h12v32H26"/><path d="M8 24h20M21 17l7 7-7 7"/></>,
 leave:<><path d="M22 8H10v32h12"/><path d="M20 24h20M33 17l7 7-7 7"/></>,
 studs:<><path d="M8 30c0-10 6-18 16-20l4 10h10c3 0 4 3 3 6l-1 4Z"/><path d="M12 36v4M20 36v4M28 36v4M36 36v4"/></>,
 fist:<><path d="M14 20v-6a3 3 0 0 1 6 0v6M20 18v-6a3 3 0 0 1 6 0v6M26 18v-4a3 3 0 0 1 6 0v8"/><path d="M14 20c-3 0-5 2-5 5 0 8 5 13 13 13h3c6 0 10-5 10-11v-5"/><path d="M14 24h8"/></>,
 spit:<><path d="M24 8c6 9 10 15 10 20a10 10 0 0 1-20 0c0-5 4-11 10-20Z"/><path d="M38 12l4-2M40 20h4"/></>,
 hand:<><path d="M16 26V12a3 3 0 0 1 6 0v10M22 22V9a3 3 0 0 1 6 0v13M28 22v-10a3 3 0 0 1 6 0v14M16 24l-4-4a3 3 0 0 0-4 4l8 10c3 4 6 6 11 6h1c6 0 10-5 10-11v-3"/></>,
 goal:<><path d="M6 38V14h36v24"/><path d="M6 22h36M6 30h36M18 14v24M30 14v24" opacity=".45"/><path d="M24 44v-4"/></>,
 mouth:<><path d="M8 10h32v20H22l-9 8v-8H8Z"/><path d="M15 17l3 3-3 3M22 16v8M29 17l4 6M33 17l-4 6"/></>,
 twoCards:<><rect x="8" y="10" width="18" height="26" rx="2" transform="rotate(-10 17 23)"/><rect x="22" y="12" width="18" height="26" rx="2" transform="rotate(8 31 25)"/></>,
};
export default function CardIconSvg({icon,className}:{icon:CardIcon;className?:string}){
 return <svg className={className} viewBox="0 0 48 48" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{P[icon]}</svg>;
}
