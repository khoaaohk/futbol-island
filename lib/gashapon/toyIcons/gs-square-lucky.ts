/** Lucky Little Japan (gs-square-lucky) toy icons: see the guide in ./index.ts. */
import {ball,dot,fill,hl,line,shape,type ToyIconSet} from './types';

export const ICONS:ToyIconSet={
 // A round red daruma doll: the blank cream face window (no face drawn), a gold mark on the belly.
 'daruma-dash':shape('M8 1.4C12 1.4 14.2 4.8 14.2 8.8C14.2 12.6 11.6 14.8 8 14.8C4.4 14.8 1.8 12.6 1.8 8.8C1.8 4.8 4 1.4 8 1.4Z','#e0362c',1.4)
  +`<ellipse cx="8" cy="6.6" rx="3.8" ry="3" fill="#fff1d6" stroke="#244d40" stroke-width="1.1"/>`
  +line('M6 11.6C7 12.4 9 12.4 10 11.6M8 10.8V13','#ffd447',1.1)+hl('M3.6 6.6C3.8 4.8 4.6 3.6 5.6 2.8',1.1),
 // A white beckoning cat: one paw raised, an orange calico patch, a red collar and a gold bell.
 'maneki-mika':shape('M3.6 3.8 4.2 1 6.6 2.6ZM8.2 2.6 10.6 1 11.2 3.8Z','#fffaf2',1)
  +shape('M11.4 8.2V3.8C11.4 3 12 2.4 12.8 2.4C13.6 2.4 14.2 3 14.2 3.8V8.2Z','#fffaf2',1.1)+fill('M12 3.2h1.6v1.2H12Z','#f6a0b4')
  +shape('M3.2 14.6V10C3.2 8.6 4.4 7.8 5.4 7.8H9.4C10.4 7.8 11.6 8.6 11.6 10V14.6Z','#fffaf2',1.2)
  +dot(7.4,5.6,3.9,'#fffaf2',1.2)+fill('M4 4.4C4.6 3 5.8 2.2 7 2.2L6.8 4.6C5.8 4.8 4.8 5 4 4.4Z','#f39a3a')
  +line('M4 9.2C6 10 8.8 10 10.8 9.2','#e94b3c',1.4)+dot(7.4,10.4,1.1,'#ffd447',.9)+fill('M4.6 12.2h1.6v1.4H4.6Z','#f39a3a'),
 // A folded paper crane side on: one big pale wing up, a blue diamond body, a pointed neck and tail.
 'origami-orin':shape('M4.4 10.2 1.6 3.8 2.4 3.4 1 4.6 2.8 4.2 6 9.6Z','#5aaed6',1)+shape('M11.6 10.2 15 4.2 10.4 9.6Z','#5aaed6',1)
  +shape('M3.2 10.6 8 8.4 12.8 10.6 8 13.4Z','#5aaed6',1.2)+shape('M5.4 9.6 10.6 1.2 10.6 9.6Z','#bfe6f5',1.2)+line('M8 8.8V13.2','#8fcbe6',.8)+hl('M7.4 7.2 9.4 3.8',.9),
 // A koinobori carp streamer on its pole: a blue carp with white scales and a red one below.
 'koinobori-koi':line('M2 1.6V15','#c48a4a',1.4)+dot(2,1.4,.9,'#ffd447',.8)
  +shape('M2.6 2.8C7 2.2 10 2.6 12 3.6L15 2.4 13.8 5.4 15 8.4 12 7.2C10 8.2 7 8.6 2.6 8Z','#2f7ae0',1.1)
  +line('M6.6 4.2q.8.8 0 1.6M8.6 4q.8.9 0 1.8M10.6 4.2q.8.8 0 1.6','#ffffff',.8)+dot(4.4,5.4,1.2,'#ffffff',.8)+dot(4.4,5.4,.4,'#2f7ae0',0)
  +shape('M2.6 9.6C6 9.2 8.4 9.6 9.8 10.2L12.2 9.4 11.2 11.6 12.2 13.8 9.8 13C8.4 13.6 6 14 2.6 13.6Z','#ff6b6b',1.1)+hl('M4.4 3.4C5.6 3.2 6.6 3.2 7.6 3.2',.8),
 // A wooden ema wish plaque: a little roof, a red-and-white cord loop and a football drawn on it.
 'ema-emi':line('M6 3.6C6 1 10 1 10 3.6','#e94b3c',1.1)+line('M7 1.6l.8.8','#ffffff',.8)
  +shape('M8 3 14.4 6.4V14.4H1.6V6.4Z','#e2ac72',1.3)+shape('M8 3 14.8 6.6 14.4 7.8 8 4.4 1.6 7.8 1.2 6.6Z','#b8763a',1)
  +line('M3.4 13H12.6M3.4 8.8h1.4','#c88d50',.8)+ball(8,10.4,3.3,'#4d5f86',1.1)+hl('M3 9.4V12',.9),
 // The rare: a red torii gate, its top beam swept up at the ends, a crossbar, two posts and a petal.
 'torii-tomo':shape('M3.6 6.6H5.4V14.6H3.6ZM10.6 6.6H12.4V14.6H10.6Z','#ec4a33',1.1)
  +shape('M2.4 7H13.6V8.6H2.4Z','#ec4a33',1.1)+shape('M7.2 4.6H8.8V7H7.2Z','#ec4a33',.9)
  +shape('M.8 2.6C4 3.4 12 3.4 15.2 2.6L14.6 4.8C11.6 5.4 4.4 5.4 1.4 4.8Z','#c7341f',1.2)
  +shape('M2.6 14.4H6.4V15.4H2.6ZM9.6 14.4H13.4V15.4H9.6Z','#d9c9a8',.8)+fill('M7.4 10.6c.6-.6 1.6-.4 1.6.4-.8.4-1.2.2-1.6-.4Z','#ff9ab8')+hl('M4.2 7.4V9.6',.8),
};
