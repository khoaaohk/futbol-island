/** Onigiri Pals (gs-square-snacks) toy icons: see the guide in ./index.ts. */
import {dot,fill,hl,line,shape,type ToyIconSet} from './types';

const RICE='M8 1.8C9.2 1.8 14.6 10.6 14.6 12.4C14.6 13.7 13.7 14.3 12.4 14.3H3.6C2.3 14.3 1.4 13.7 1.4 12.4C1.4 10.6 6.8 1.8 8 1.8Z';
const NORI='M5.4 14.3V9.4H10.6V14.3Z';

export const ICONS:ToyIconSet={
 // A rice-ball triangle with its seaweed wrap and a plum peeking out.
 'onigiri-ollie':shape(RICE,'#fbf8ee',1.4)+shape(NORI,'#2f7a55')+line('M6.4 11h3.2M6.4 12.8h3.2','#5fae84',.8)+dot(8,7.2,1.2,'#e8506a',1)+hl('M6.4 4.6 4.6 7.6'),
 // Melon bread from above: a round yellow-green crust with its pressed diamond grid.
 'melon-pan-mimi':dot(8,8.5,6.4,'#f2d860',0)
  +line('M3.8 4.3 12.2 12.7M6.5 2.7 13.8 10M2.2 7 9.5 14.3M3.8 12.7 12.2 4.3M6.5 14.3 13.8 7M2.2 10 9.5 2.7','#b9b43c',.9)
  +`<circle cx="8" cy="8.5" r="6.4" fill="none" stroke="#244d40" stroke-width="1.4"/>`+hl('M3.4 6.2C4 4.6 5.2 3.4 6.6 3',1.1),
 // A tall white steamed bun with a pleated twist on top, steam rising, on its paper square.
 'nikuman-nico':shape('M2.2 13H13.8V14.6H2.2Z','#e2a86c',1)+shape('M2.4 13C1.2 13 1.2 11.4 1.8 10C2.8 6.6 5 4.4 8 4.4C11 4.4 13.2 6.6 14.2 10C14.8 11.4 14.8 13 13.6 13Z','#fffaf0',1.3)
  +line('M8 5.2 6 8M8 5.2 10 8M8 5.2V8.4M8 5.2 4.6 7.4M8 5.2 11.4 7.4','#d39a62',.8)+dot(8,4.6,1,'#fffaf0',1)
  +line('M11.6 3.4C10.8 2.6 12.4 1.8 11.6 .8M4.4 3.4C3.6 2.6 5.2 1.8 4.4 .8','#8fd0ea',1)+hl('M3.6 10.4C4 8.6 4.8 7.4 5.8 6.6'),
 // A lumpy golden fried-chicken bite with crispy crumbs and a gold wind-up key at his side.
 'karaage-kai':shape('M3 6C3.2 3.8 5.4 2.6 7.2 3.4C8.4 2.2 10.8 2.4 11.6 4.2C13.6 4.6 14.2 7 13.2 8.6C14 10.6 12.6 12.8 10.6 12.6C9.6 14.2 6.8 14.4 5.8 12.8C3.6 13.2 2 11.2 2.8 9.4C1.6 8.4 1.8 6.6 3 6Z','#dc8f2c',1.3)
  +fill('M5 6h1.2v1.2H5ZM8.6 5h1.2v1.2H8.6ZM10.6 8.2h1.2v1.2h-1.2ZM6.8 9.4H8v1.2H6.8ZM4.4 9.8h1v1h-1Z','#ffc75a')+hl('M4.4 5.4C4.8 4.4 5.8 4 6.6 4.2')
  +line('M12.8 8.4H14','#244d40',1.6)+shape('M14.2 8.4C13 6.8 13.2 5 14.4 5C15.6 5 15.6 7 14.2 8.4C15.6 9.8 15.6 11.8 14.4 11.8C13.2 11.8 13 10 14.2 8.4Z','#ffd447',1),
 // Oden on a stick: a speckled konnyaku triangle, a broth egg and a thick daikon round.
 'oden-odie':line('M8 .4V15.6','#244d40',2.2)+line('M8 .6V15.4','#d9a35c',1)
  +shape('M8 2.4 11.8 6.2H4.2Z','#a8a7bf',1.1)+fill('M7 4.6h.8v.8H7ZM8.8 4h.8v.8h-.8Z','#7e7c9a')
  +`<ellipse cx="8" cy="8.4" rx="3" ry="1.9" fill="#f3d79a" stroke="#244d40" stroke-width="1.2"/>`
  +shape('M3.2 11.2V13.2C3.2 14.8 12.8 14.8 12.8 13.2V11.2Z','#f6ead0',1.2)
  +`<ellipse cx="8" cy="11.2" rx="4.8" ry="1.5" fill="#fff8e8" stroke="#244d40" stroke-width="1.1"/>`+line('M8 10.4V12','#d9a35c',1)
  +line('M4.4 12.8C6.4 13.6 9.6 13.6 11.6 12.8','#d3a464',.8)+hl('M6.2 7.8C6.6 7.2 7.2 7 7.8 7',.9),
 // The rare: a shining gold rice ball with an orange-gold wrap, a star and sparkles.
 'golden-onigiri':shape(RICE,'#ffd447',1.4)+shape(NORI,'#f0a020')
  +shape('M8 6 8.7 7.4 10.2 7.6 9.1 8.6 9.4 10.1 8 9.4 6.6 10.1 6.9 8.6 5.8 7.6 7.3 7.4Z','#fff8d6',.8)
  +line('M13.2 1.4v2.4M12 2.6h2.4M2.6 2.6v2M1.6 3.6h2','#f0a020',.9)+hl('M6.4 4.6 4.6 7.6'),
};
