/** Line icons for the tactics board controls (24×24, currentColor). Decorative: every button carries its own label. */
const P:Record<string,string>={
 move:'M8 13V5.5a1.5 1.5 0 0 1 3 0V12m0-1V4a1.5 1.5 0 0 1 3 0v7m0-.5V5.5a1.5 1.5 0 0 1 3 0V13m0-4.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-2a6 6 0 0 1-4.6-2.2L4.2 15.6a1.6 1.6 0 0 1 2.5-2L8 15',
 arrow:'M4 19C8 11 12 9 19 6m0 0h-5m5 0v5',
 marker:'M14.5 4.5l5 5L9 20H4v-5L14.5 4.5ZM12 7l5 5',
 erase:'M16 4l5 5-9.5 9.5H6.5L3 15l13-11ZM8.5 11.5l5 5M11 19h10',
 add:'M12 5v14M5 12h14',
 undo:'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
 redo:'M15 14l5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13',
 play:'M8 5.5v13l10.5-6.5L8 5.5Z',
 pause:'M8 5v14M16 5v14',
 share:'M12 15V3m0 0L8 7m4-4 4 4M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8',
 zoom:'M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13ZM20 20l-4.8-4.8M10.5 7.5v6M7.5 10.5h6',
 gear:'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.4 7.4 0 0 0-1.7-1l-.3-2.6h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.4-1-2 3.4L4.6 11a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.4 7.4 0 0 0 1.7 1l.4 2.6h4l.3-2.6a7.4 7.4 0 0 0 1.7-1l2.4 1 2-3.4-2.1-1.6Z',
 trash:'M4 7h16M10 11v6m4-6v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3',
 plays:'M5 4h11l3 3v13H5V4Zm4 6h6m-6 4h6m-6-8h3',
 close:'M6 6l12 12M18 6 6 18',
 link:'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11.5 6.8M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5',
 image:'M4 5h16v14H4V5Zm0 11 5-5 4 4 2-2 5 5M15.5 9.5h.01',
 copy:'M8 8h11v11H8V8Zm-3 8H4V5a1 1 0 0 1 1-1h11v1',
 steps:'M5 12h14M5 12a1.5 1.5 0 1 0 0 .01M12 12a1.5 1.5 0 1 0 0 .01M19 12a1.5 1.5 0 1 0 0 .01',
 select:'M4 4h4M4 4v4M20 4h-4M20 4v4M4 20h4M4 20v-4M20 20h-4M20 20v-4M9 12h6',
 left:'M15 6l-6 6 6 6',right:'M9 6l6 6-6 6',
 loop:'M17 2l3 3-3 3M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3M20 13v2a4 4 0 0 1-4 4H4',
};
export function BoardIcon({name,size=22}:{name:string;size?:number}){
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={P[name]??''} fill={name==='play'?'currentColor':'none'}/></svg>;
}
