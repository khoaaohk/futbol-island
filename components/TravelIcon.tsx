/** Shared, text-free island controls. The parent button supplies its accessible name. */
export default function TravelIcon({kind,size}:{kind:string;size?:number}){
 const paths:Record<string,string>={
 ballFeint:'M9 17a3 3 0 1 0 6 0 3 3 0 0 0-6 0 M4 14a8 8 0 0 1 16 0 M16 10l4 4 2-5',
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
 stand:'M12 3a2 2 0 1 0 0 .01 M5 9h14 M12 7v8 M8 21l4-6 4 6',
 // Island job actions (Sep 30 2026, components/JobActionButton.tsx).
 treekick:'M17 21V11 M12 9a5 5 0 1 1 10 0 5 5 0 0 1-10 0 M2 19a2 2 0 1 0 4 0 2 2 0 0 0-4 0 M7 19h7 M11 16l3 3-3 3',
 pull:'M12 21v-9 M8 7l4-4 4 4 M9 12c-3-1-4-4-3-6 M15 12c3-1 4-4 3-6 M5 21h14',
 twist:'M12 13a4 4 0 1 0 0 .01 M12 9V5 M10 5h4 M4 12a8 8 0 0 1 3-6 M7 3v3H4 M20 12a8 8 0 0 1-3 6 M17 21v-3h3',
 snip:'M6 6a2.5 2.5 0 1 0 0 .01 M6 18a2.5 2.5 0 1 0 0 .01 M8 7.5 20 17 M8 16.5 20 7',
 basket:'M3 10h18l-2 10H5z M8 10l3-6 M16 10l-3-6 M9 14v3 M15 14v3',
 rake:'M4 20 16 8 M13 5l6 6 M14 4l1.5 1.5 M16 3.5l1.5 1.5 M18 5l1.5 1.5 M19.5 7l1.5 1.5',
 bag:'M6 8h12l-1 13H7z M9 8a3 3 0 0 1 6 0 M10 13h4',
 bin:'M5 7h14 M9 7V4h6v3 M7 7l1 14h8l1-14 M10 11v6 M14 11v6',
 throw:'M12 2a2 2 0 1 0 0 .01 M8 9a4 4 0 1 1 8 0 M12 9v6 M9 22l3-7 3 7 M8 9l-2-3 M16 9l2-3',
 scoop:'M12 12a3 3 0 1 0 0 .01 M4 16c2 4 14 4 16 0 M4 16l-1-3 M20 16l1-3',
 cone:'M12 3 6 19h12z M8.5 12h7 M5 21h14',
 paint:'M4 20h16 M6 16a2 2 0 1 0 4 0 2 2 0 0 0-4 0 M10 16h6l3-9 M15 4l4 3',
 flag:'M6 21V3 M6 4h11l-3 4 3 4H6',
 flagdown:'M6 3v18 M6 20h11l-3-4 3-4H6',
 next:'M5 5l8 7-8 7 M15 5v14',
 pump:'M12 3v12 M8 3h8 M9 15h6v5H9z M15 17h3a3 3 0 0 1 3 3',
 air:'M3 9h11a3 3 0 1 0-3-3 M3 14h15a3 3 0 1 1-3 3 M3 19h6',
 check:'M4 12l5 5L20 6',
 hammer:'M13 7 4 20 M10 3l9 9 2-2-9-9z',
 // Summit Isle bug jobs (Oct 20 2026): a butterfly net, a jar with fireflies, and an open jar with bugs flying out.
 net:'M15 9a5 5 0 1 0-10 0 5 5 0 0 0 10 0 M13.5 12.5 21 20 M7 7l6 4 M7 11l6-4',
 /* The firefly jar's Cup (Oct 21 2026): a jar tipped over a firefly, the lid swung open, the scoop's arc. */
 cup:'M7 14V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v8 M6 14h12 M18 14l3 2.5 M12 18.5h.01 M9 21l1-1 M15 21l-1-1 M3 13c0-3 1-6 3-8',
 jar:'M8 3h8 M7 6h10v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z M10 11h.01 M14 13h.01 M11 16h.01',
 /* Bug squad's net toggle (Oct 20 2026): net held low and forward (the stalk) / net carried upright on the shoulder. */
 netlow:'M4 4l9 9 M19 16a4 3 0 1 0-8 0 4 3 0 0 0 8 0 M3 21h18 M13 18l2 2 M17 18l-2 2',
 netup:'M16 7a4 4 0 1 0-8 0 4 4 0 0 0 8 0 M12 11v11 M9 5l6 4 M9 9l6-4',
 release:'M7 11h10v8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z M12 8V3 M9 5l3-2 3 2 M5 8 3 5 M19 8l2-3',
 crate:'M3 10h18v10H3z M3 14h18 M8 10V7h8v3 M12 4v6 M9 7l3 3 3-3',
 take:'M3 14h18v6H3z M12 11V3 M9 6l3-3 3 3 M8 17h8',
 // Zipline ride actions (Oct 14 2026, lib/town/zipline.ts ZIP_BUTTONS): tuck (knees up, speed lines), spin (a turn under the bar),
 // wave (one hand on the bar, the other up and waving).
 ziptuck:'M5 4h14 M12 4v5 M12 9a2.4 2.4 0 1 0 0 .01 M12 12v4l4 3 M12 16l-4 3',
 zipspin:'M5 4h14 M12 4v3 M19 13a7 7 0 1 1-2.1-5 M19 5v4h-4',
 zipwave:'M3 4h10 M8 4v5 M8 9a2.4 2.4 0 1 0 0 .01 M8 12v8 M8 13l7-5 M17 4l2 2 M19 9h3',
 // Water actions (Oct 15 2026, lib/town/water/waterHud.ts WATER_BUTTONS). Redrawn Oct 15 2026 (user: "icons need to be larger and
 // simplified to match with main actions"): the walk / shoot / juggle weight, 2–3 bold strokes over one wave. swim (the ride
 // switcher's ride: head, body, one arm reaching over), swimfast (sprint: the arm stretched forward, speed lines behind), float (on
 // the back, knees up). JobActionButton renders these at the land buttons' 32 px.
 swim:'M16.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0 M15 13H4 M9 13l4-8 5 1.5 M2 19c2-2 4-2 6.5 0s4.5 2 6.5 0 4.5-2 6.5 0',
 swimfast:'M16.5 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0 M15 13H8 M11 13l4-7h6 M2 8h6 M2 13h3 M2 19c2-2 4-2 6.5 0s4.5 2 6.5 0 4.5-2 6.5 0',
 // letgo (water P1b, the ride's Let go): two open hands parting over the wave, arrows out.
 letgo:'M9 4v6 M6 7l3-3 3 3 M15 4v6 M12 7l3-3 3 3 M3 13h4 M17 13h4 M2 19c2-2 4-2 6.5 0s4.5 2 6.5 0 4.5-2 6.5 0',
 float:'M3 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0 M9 13h5l3-6 3 6 M2 19c2-2 4-2 6.5 0s4.5 2 6.5 0 4.5-2 6.5 0',
 // dive / surface (Oct 19 2026, the Dive toggle that replaced Float): one bold arrow down into the wave, and back up out of it.
 dive:'M12 3v12 M7.5 10.5 12 15l4.5-4.5 M2 19c2-2 4-2 6.5 0s4.5 2 6.5 0 4.5-2 6.5 0',
 surface:'M12 15V3 M7.5 7.5 12 3l4.5 4.5 M2 19c2-2 4-2 6.5 0s4.5 2 6.5 0 4.5-2 6.5 0'
 };
 return <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={size?{width:size,height:size}:undefined}><path d={paths[kind]??paths.walk}/></svg>;
}
