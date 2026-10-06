import type {Decal} from '../decals';
/**
 * 2015 Conext15 Final Vancouver (Women's World Cup final, 5 July 2015), rebuilt Oct 6 2026 (docs/museum/BALL_SOURCES.md, row 36).
 * Construction: the Conext15's 6 S-seam panels (C15_CORE, wwc-2015-conext15.ts). Print: the Conext15 swoosh layout (the adidas
 * launch image of the final ball registers onto it), with the streaks in the final's two inks, Canada red and trophy gold
 * (adidas: "the vibrant red of Canada, combined with a gold trim"); which streak is red and which gold was traced from that
 * launch image (reference only) where it shows the ball and carried round by the print's symmetry. Marks as on the Conext15,
 * but the line reads 'conext15 final vancouver / official match ball' as on the final ball: the two CC-cut words set in the
 * boxes they occupy there, 'final vancouver' traced from the launch image (its text is ~4 px tall, so those glyphs are soft).
 */
import {C15_CORE} from './wwc-2015-conext15';
export default C15_CORE+/* glsl */`
Surf design(vec3 p){float e=c15_edge(p);float pim=vnoise(p*260.);
 return Surf(vec3(.88,.88,.87)*(.97+.04*pim),max(panelGroove(e,.012,.035),.06*pim),.58);}
`;
const CREDIT = 'Swoosh layout and marks built from "BALON DEL CAMPEONATO" (15774583044) and (16397047065) (Wikimedia Commons, Agencia de Noticias ANDES, CC BY-SA 2.0); final-ball red/gold inks and the words "final vancouver" traced in one flat ink from the adidas launch image (reference only; "conext15" and "official match ball" are the CC glyphs); adidas logo "Adidas Logo.svg" (Commons, PD, adidas trademark); FIFA Women\'s World Cup Canada 2015 emblem redrawn from the en.wikipedia non-free SVG (FIFA trademark). This bitmap CC BY-SA 2.0';
const F = (n: number, dir: [number, number, number], up: [number, number, number]): Decal => ({src: `/museum/wcballs/decals/wwc-2015-conext15-final-vancouver-${n}.webp`, dir, up, w: .74, h: .74, gloss: .58, credit: CREDIT});
export const decals: Decal[] = [
 F(1, [1, 0, 0], [0, 1, 0]), F(2, [-1, 0, 0], [0, 1, 0]), F(3, [0, 1, 0], [0, 0, -1]),
 F(4, [0, -1, 0], [0, 0, 1]), F(5, [0, 0, 1], [0, 1, 0]), F(6, [0, 0, -1], [0, 1, 0]),
];
