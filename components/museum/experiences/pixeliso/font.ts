/**
 * pixeliso · a 3×5 pixel font for words that live INSIDE the drawing (a scoreboard, a machine's dial, a shirt number, a clock).
 * Anything a child has to read sits in the HUD in the cabinet's DOM fonts instead (Press Start 2P / Pixelify Sans).
 * Each glyph is 5 rows of 3 bits (left = 4).
 */
export const GLYPH_W=3,GLYPH_H=5;
const G:Record<string,readonly number[]>={
 '0':[7,5,5,5,7],'1':[2,6,2,2,7],'2':[7,1,7,4,7],'3':[7,1,3,1,7],'4':[5,5,7,1,1],'5':[7,4,7,1,7],'6':[7,4,7,5,7],'7':[7,1,2,2,2],'8':[7,5,7,5,7],'9':[7,5,7,1,7],
 A:[2,5,7,5,5],B:[6,5,6,5,6],C:[3,4,4,4,3],D:[6,5,5,5,6],E:[7,4,6,4,7],F:[7,4,6,4,4],G:[3,4,5,5,3],H:[5,5,7,5,5],I:[7,2,2,2,7],J:[1,1,1,5,2],
 K:[5,5,6,5,5],L:[4,4,4,4,7],M:[5,7,7,5,5],N:[6,5,5,5,5],O:[2,5,5,5,2],P:[6,5,6,4,4],Q:[2,5,5,6,3],R:[6,5,6,5,5],S:[3,4,2,1,6],T:[7,2,2,2,2],
 U:[5,5,5,5,7],V:[5,5,5,5,2],W:[5,5,7,7,5],X:[5,5,2,5,5],Y:[5,5,2,2,2],Z:[7,1,2,4,7],
 ' ':[0,0,0,0,0],'.':[0,0,0,0,2],':':[0,2,0,2,0],'-':[0,0,7,0,0],'+':[0,2,7,2,0],'/':[1,1,2,4,4],'%':[5,1,2,4,5],'!':[2,2,2,0,2],'?':[6,1,2,0,2],
 "'":[2,2,0,0,0],'×':[0,5,2,5,0],'=':[0,7,0,7,0],'<':[1,2,4,2,1],'>':[4,2,1,2,4],'#':[5,7,5,7,5],
};
export const glyph=(ch:string)=>G[ch]??G['?'];
export const textWidth=(s:string)=>Math.max(0,s.length*(GLYPH_W+1)-1);
export const GLYPHS=Object.keys(G);
