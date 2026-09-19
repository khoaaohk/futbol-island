/** Shared, text-free island controls. The parent button supplies its accessible name. */
export default function TravelIcon({kind}:{kind:string}){
 const paths:Record<string,string>={
 walk:'M14 4a1.5 1.5 0 1 0 0 .01 M10 21l2-7-3-3 2-4 4 2 3 1 M7 13l2-4 M12 14l5 6',
 map:'m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5 M9 3v16 M15 5v16',
 minus:'M5 12h14',stop:'M7 7h10v10H7z',
 shoot:'M3 8h7 M2 12h6 M3 16h7 M19 8a5 5 0 1 1-6 8 5 5 0 0 1 6-8 M16 10l2 2-1 3h-3l-1-3z',
 juggle:'M9 6a3 3 0 1 0 6 0 3 3 0 0 0-6 0 M6 20l3-5 3 3 3-3 3 5 M12 10v3',
 scooter:'M4 18h11l4-12h-4 M3 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0 M17 18a2 2 0 1 0 4 0 2 2 0 0 0-4 0',
 bike:'M2 16a4 4 0 1 0 8 0 4 4 0 0 0-8 0 M14 16a4 4 0 1 0 8 0 4 4 0 0 0-8 0 M6 16l4-8 8 8 M8 8h4 M10 10h6l-2 6H6 M16 10l-1-5h3',
 moped:'M2 17a3 3 0 1 0 6 0 3 3 0 0 0-6 0 M16 17a3 3 0 1 0 6 0 3 3 0 0 0-6 0 M5 14h8l4-7h-3 M9 11h5 M8 17h8',
 jetpack:'M6 5h4v12H6z M14 5h4v12h-4z M10 9h4 M7 20v2 M17 20v2 M12 3v3',
 boost:'m4 5 8 7-8 7 M12 5l8 7-8 7',
 skydive:'M3 10a9 9 0 0 1 18 0H3 M3 10l9 10 9-10 M12 10v10',
 spin:'M20 8a8 8 0 1 0 0 8 M20 3v5h-5',
 jump:'M12 21V4 M6 10l6-6 6 6',
 front:'M3 19h18 M6 15l12-9 M14 6h4v4',
 back:'M3 19h18 M18 15 6 6 M6 10V6h4',
 stand:'M12 3a2 2 0 1 0 0 .01 M5 9h14 M12 7v8 M8 21l4-6 4 6'
 };
 return <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[kind]??paths.walk}/></svg>;
}
