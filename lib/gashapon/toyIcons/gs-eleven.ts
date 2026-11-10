/** Boots & Kits (gs-eleven) toy icons: see the guide in ./index.ts. */
import {ball,dot,edge,fill,hl,line,shape,type ToyIconSet} from './types';

/** Eleven Park navy, lifted to a bright stand-in (the real #23407e is under the fill floor). */
const NAVY='#3a5fb0';
const SHIN='M3.4 1.6C6.2.8 9.8.8 12.6 1.6C13 6.2 12.2 10.6 8 15C3.8 10.6 3 6.2 3.4 1.6Z';
const CUFF='M1.4 5.8C1.4 7.8 14.6 7.8 14.6 5.8V10.4C14.6 12.4 1.4 12.4 1.4 10.4Z';
const SHIRT='M5.4 1.6 2 3.4.8 7.4 3.4 8.4 3.8 7V14.6H12.2V7L12.6 8.4 15.2 7.4 14 3.4 10.6 1.6C10 2.8 9 3.4 8 3.4C7 3.4 6 2.8 5.4 1.6Z';

export const ICONS:ToyIconSet={
 // A gold football boot: navy soleplate and studs, white laces, a navy flash and the wind-up key on the heel.
 'golden-boot-gus':line('M2.2 8.6H1','#c9a227',1)+shape('M.4 6.8H1.4V10.4H.4Z','#ffd447',.8)
  +shape('M2 4.2H6.2C6.8 4.2 7.2 4.6 7.4 5.2L8 7.2C11.6 7.4 14.6 8.6 14.8 11.4V12.2H2Z','#ffd447',1.4)
  +fill('M3.2 10.4 7.6 8.8 8.4 9.8 3.6 11.4Z',NAVY)+line('M8.2 7.4 9 6.4M9.6 7.6 10.4 6.6M11 8 11.8 7','#ffffff',.9)
  +shape('M1.6 12H15.2V13.4H1.6Z',NAVY,1)+fill('M2.6 13.4h1.2v1.2H2.6ZM5 13.4h1.2v1.2H5ZM9.4 13.4h1.2v1.2H9.4ZM12.6 13.4h1.2v1.2h-1.2Z',NAVY)
  +hl('M3.2 5.4V8.4'),
 // A shin pad: a white shell with a navy star panel, three vents and the navy velcro strap.
 'shin-pad-shay':shape(SHIN,'#ffffff',1.4)+shape('M5.2 3.6C7 3 9 3 10.8 3.6C11 6.6 10.4 9 8 11.6C5.6 9 5 6.6 5.2 3.6Z','#7fa6ec',1)
  +fill('M8 4.6 8.6 6 10 6.1 8.9 7 9.3 8.4 8 7.6 6.7 8.4 7.1 7 6 6.1 7.4 6Z','#ffffff')
  +shape('M2.4 9.8H13.6V11.6H2.4Z',NAVY,1)+line('M11.4 10.2V11.2','#9fb4e0',.8)+hl('M4.2 3.2V6.4'),
 // A keeper frog: green, two bumps up top, a pale belly and two huge orange gloves raised for a save.
 'glove-frog':dot(5.4,5.4,1.8,'#4caf50',1.1)+dot(10.6,5.4,1.8,'#4caf50',1.1)
  +shape('M4.2 14.6C3 14.6 3 13.4 4 13H6ZM11.8 14.6C13 14.6 13 13.4 12 13H10Z','#4caf50',.9)
  +`<ellipse cx="8" cy="10" rx="4.6" ry="4.2" fill="#4caf50" stroke="#244d40" stroke-width="1.4"/>`
  +`<ellipse cx="8" cy="11" rx="2.6" ry="2.4" fill="#c8ec8a"/>`
  +shape('M.6 5C.6 3.4 1.4 2.4 2.8 2.4C4.2 2.4 5 3.4 5 5V8.6H.6Z','#ff9a3c',1.1)+shape('M11 5C11 3.4 11.8 2.4 13.2 2.4C14.6 2.4 15.4 3.4 15.4 5V8.6H11Z','#ff9a3c',1.1)
  +shape('M.6 8.6H5V10H.6ZM11 8.6H15.4V10H11Z','#ffffff',.9)+line('M2.2 2.8V5M3.6 2.8V5M12.6 2.8V5M14 2.8V5','#d06a1c',.7)+hl('M5.2 8.6C5.6 7.6 6.4 6.8 7.2 6.6',.9),
 // A yellow captain's armband seen as a loop: the inside shows at the top, a red C patch on the front, ribbed edges.
 'armband-andi':`<ellipse cx="8" cy="5.8" rx="6.6" ry="2.2" fill="#e8b830" stroke="#244d40" stroke-width="1.2"/>`
  +shape(CUFF,'#ffd447',1.4)+line('M2.4 8.2C5 9.6 11 9.6 13.6 8.2M2.4 10.8C5 12.2 11 12.2 13.6 10.8','#e8b830',.7)
  +shape('M12 8.2H14.6V11.4H12Z','#e94b3c',.9)
  +dot(7.4,10,2.4,'#e94b3c',1)+line('M8.4 9C7.8 8.4 6.4 8.6 6.4 10C6.4 11.4 7.8 11.6 8.4 11','#ffffff',1)+hl('M2.4 7.6V9.6',.9),
 // A red team shirt: white collar and cuffs, the white number 10 on the front.
 'kit-shirt-kip':shape(SHIRT,'#e94b3c',1.4)+line('M5.6 2.2C6.2 3.6 7 4.2 8 4.2C9 4.2 9.8 3.6 10.4 2.2','#ffffff',1)
  +line('M1.4 6.6 3.6 7.4M14.6 6.6 12.4 7.4','#ffffff',1)
  +line('M6 7.2 6.6 6.8V11.6M8.8 6.8H10.2V11.6H8.8Z','#ffffff',1.1)+hl('M4.8 8.4V11.6'),
 // The rare: the chequered red-and-yellow corner flag on its striped pole, the turf corner arc and a ball.
 'corner-flag-cora':shape('M1 13.4C4 12.4 12 12.4 15 13.4V15.2H1Z','#5cc65a',1.1)+line('M4.2 13.2C6 13.6 6.8 14.2 7 15','#ffffff',.8)
  +shape('M4.4 1.6H13.2V7.8H4.4Z','#ff4d4d',1.2)+fill('M4.4 1.6h2.2v2.1H4.4ZM8.8 1.6H11v2.1H8.8ZM6.6 3.7h2.2v2H6.6ZM11 3.7h2.2v2H11ZM4.4 5.7h2.2v2.1H4.4ZM8.8 5.7H11v2.1H8.8Z','#ffd447')
  +edge('M4.4 1.6H13.2V7.8H4.4Z')+line('M3.8 1 3.8 13.8','#244d40',2)+line('M3.8 1.2 3.8 13.6','#ffffff',.9)+line('M3.8 4v1.4M3.8 8v1.4M3.8 12v1.2','#ff4d4d',.9)
  +ball(11.4,11.6,1.8,'#4d5f86',.9)+hl('M5.2 2.4V4.4',.8),
};
