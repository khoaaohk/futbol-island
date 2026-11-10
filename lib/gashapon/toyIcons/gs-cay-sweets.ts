/** Sweet Shop Treats (gs-cay-sweets) toy icons: see the guide in ./index.ts. */
import {dot,fill,hl,line,shape,type ToyIconSet} from './types';

export const ICONS:ToyIconSet={
 // A golden fish-shaped cake: forked tail, a fin on top, baked scale marks.
 'taiyaki-tai':shape('M6 3.8 8.4 1.8 9.8 3.8Z','#c97a2c',1)
  +shape('M1.2 8C2.4 4.8 5.6 3.4 8.6 3.6C10.6 3.7 11.6 4.6 12.4 5.6L15 3.4 14.2 8 15 12.6 12.4 10.4C11.6 11.4 10.6 12.3 8.6 12.4C5.6 12.6 2.4 11.2 1.2 8Z','#e09a40',1.3)
  +line('M4.4 5.6C5.4 7 5.4 9 4.4 10.4','#b46a24',.9)+line('M7 7q1 1 0 2M9 6.4q1 1 0 2M9 8.8q1 1 0 2M11 7.4q.8.8 0 1.6','#b46a24',.8)+hl('M3 7C3.6 5.8 4.6 5 5.6 4.6'),
 // A soft white-pink daifuku on a green sakura leaf, a pink blossom on top.
 'mochi-momo':shape('M1 13.4C3 11.6 13 11.6 15 13.4C13 15 3 15 1 13.4Z','#6fbf4a',1)
  +shape('M2.4 13C2.4 8.4 4.8 5.6 8 5.6C11.2 5.6 13.6 8.4 13.6 13Z','#fff0f5',1.3)
  +dot(8,4.2,1,'#f6a9c2',.8)+dot(6.6,5,1,'#f6a9c2',.8)+dot(9.4,5,1,'#f6a9c2',.8)+dot(7.2,6.2,1,'#f6a9c2',.8)+dot(8.8,6.2,1,'#f6a9c2',.8)+dot(8,5.3,.6,'#ffd447',0)
  +fill('M5 10h.8v.8H5ZM10.4 9.4h.8v.8h-.8ZM8 11h.8v.8H8Z','#f7d3df')+hl('M3.8 11C4 9.4 4.6 8.2 5.6 7.4'),
 // Three dango on a skewer: pink, white and green.
 'dango-trio':line('M8 .6V15.6','#c48a4a',1.4)+dot(8,3.6,2.6,'#f6a9c2')+dot(8,8,2.6,'#fffaf2')+dot(8,12.4,2.6,'#8bc34a')
  +hl('M6.4 3C6.6 2.4 7 2 7.6 1.8',.9)+hl('M6.4 7.4C6.6 6.8 7 6.4 7.6 6.2',.9),
 // A codd-neck soda bottle: pale blue glass, the marble in its pinched neck, a pink cap and rising bubbles.
 'ramune-rin':shape('M5 14.2V9C5 7.8 6.2 7.2 6.4 6.2C6.5 5.6 6 5 6 4.2V2.6H10V4.2C10 5 9.5 5.6 9.6 6.2C9.8 7.2 11 7.8 11 9V14.2C11 14.8 10.6 15.2 10 15.2H6C5.4 15.2 5 14.8 5 14.2Z','#8fdcff',1.2)
  +shape('M5.6 1H10.4V2.8H5.6Z','#ff7fa8',1)+dot(8,5.2,1.2,'#e8fbff',.8)+shape('M5 10.4H11V12.6H5Z','#ffffff',.9)+line('M6 11.5q1-.8 2 0t2 0','#3ea8e0',.8)
  +dot(9,8.6,.5,'#e8fbff',0)+dot(7.4,13.8,.5,'#e8fbff',0)+hl('M6.2 8.6V9.8',.9),
 // A dorayaki: two golden-brown pancakes with sweet red bean filling between.
 'dorayaki-doug':shape('M1.6 10.6C1.6 12.8 4.4 14.4 8 14.4C11.6 14.4 14.4 12.8 14.4 10.6Z','#c97f3a',1.2)
  +shape('M2 9.4H14V11H2Z','#b04a3c',1)
  +shape('M1.6 9.4C1.6 5.8 4.4 3.6 8 3.6C11.6 3.6 14.4 5.8 14.4 9.4Z','#d6904a',1.3)+line('M3.4 8.6C3.8 6.4 5.6 5 8 5C10.4 5 12.2 6.4 12.6 8.6','#eab36e',1)+hl('M4.2 6.2C4.8 5.4 5.6 4.8 6.6 4.6'),
 // The rare: rainbow shaved ice in a footed glass, a cherry on top and a little ice flag.
 'kakigori-kiki':line('M2.2 2V8.8','#c48a4a',.9)+shape('M2.4 2H5.6V4.4H2.4Z','#ffffff',.8)+line('M3.2 3.2h1.6','#3ea8e0',.9)
  +shape('M6.4 13H9.6L10.4 15H5.6Z','#d8f1ff',1)+shape('M2.6 9.4H13.4L11.4 13.2H4.6Z','#d8f1ff',1.2)
  +shape('M3 9.6C3 5.6 5.2 3.6 8 3.6C10.8 3.6 13 5.6 13 9.6Z','#f4fbff',1.3)
  +fill('M3.6 9C3.8 7 4.6 5.6 5.8 4.8C6.2 6.4 6 8 5.4 9Z','#ff5f8f')+fill('M6.6 9C6.8 7 7.2 5.2 8 4.2C8.8 5.2 9.2 7 9.4 9Z','#ffd447')+fill('M10.6 9C10 8 9.8 6.4 10.2 4.8C11.4 5.6 12.2 7 12.4 9Z','#5fc3ff')
  +line('M8.4 2.6C8.6 1.6 9.4 1 10.2 .8','#4f9a3a',.8)+dot(8.2,3,1.1,'#e8283c',.8)+hl('M3.8 10.4H5.4',.8),
};
