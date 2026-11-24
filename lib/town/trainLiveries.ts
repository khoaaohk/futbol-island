// The Island Line's three liveries (train Phase 2; pure data, shared by the 3D trains and the map's train dots, Phase 3).
/** A: cream / maroon, two cream lines, our ball-emblem headmark (from ref 9.png). B: sea-green / sky-blue, red line (ref 8.png).
 *  C: cream / ocean-blue, sunflower line. All original: no real company's logo or emblem; the plates are our own "FI 01-03". */
export type Livery={upper:string;lower:string;stripes:readonly [number,number,string][];roof:string;plate:string;emblem:boolean};
export const LIVERIES:readonly Livery[]=[
 {upper:'#f2e9d2',lower:'#8c2a2f',stripes:[[1.62,.05,'#f2e9d2'],[1.78,.05,'#f2e9d2']],roof:'#b8bbbe',plate:'FI01',emblem:true},
 {upper:'#a3dccb',lower:'#5aa8de',stripes:[[2.05,.08,'#d6343a']],roof:'#bfc3c4',plate:'FI02',emblem:false},
 {upper:'#f2e9d2',lower:'#1f5c9c',stripes:[[2.05,.1,'#f5c21b']],roof:'#b8bbbe',plate:'FI03',emblem:false},
];
