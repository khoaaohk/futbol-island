/** Beach Day (gs-westbeach) toy icons: see the guide in ./index.ts. */
import {dot,fill,hl,line,shape,type ToyIconSet} from './types';

export const ICONS:ToyIconSet={
 // A beach ball: red, yellow and blue panels meeting at a white cap.
 'beachball-bea':dot(8,8,6.6,'#ffffff',0)
  +fill('M8 1.4C4.6 3.8 4.6 12.2 8 14.6C3.8 14.2 1.4 11.4 1.4 8C1.4 4.6 3.8 1.8 8 1.4Z','#ff5a5a')
  +fill('M8 1.4C9.8 4 9.8 12 8 14.6C6.2 12 6.2 4 8 1.4Z','#ffe14d')
  +fill('M8 1.4C11.4 3.8 11.4 12.2 8 14.6C12.2 14.2 14.6 11.4 14.6 8C14.6 4.6 12.2 1.8 8 1.4Z','#3ec6e0')
  +`<circle cx="8" cy="8" r="6.6" fill="none" stroke="#244d40" stroke-width="1.4"/>`+dot(8,2.6,1.3,'#ffffff',.9)+hl('M3.2 6C3.6 4.8 4.2 4 5 3.4',1.1),
 // A sandcastle: two crenellated towers (goal posts), a keep with an arched door and a goal net, a cyan flag.
 'sandcastle-sam':line('M8 1V4.4','#c48a4a',.9)+shape('M8.2 1H11V2.8H8.2Z','#3ec6e0',.8)
  +shape('M4.4 14.6V7.4H11.6V14.6Z','#e8c98a',1.2)+shape('M4.4 7.4V5.6H5.8V6.6H7.2V5.6H8.8V6.6H10.2V5.6H11.6V7.4Z','#e8c98a',1)
  +shape('M1.2 14.6V5.4H2.2V4.2H3.2V5.4H4.4V14.6ZM11.6 14.6V5.4H12.8V4.2H13.8V5.4H14.8V14.6Z','#f0d79e',1.2)
  +shape('M6.4 14.6V11.4C6.4 10.4 7.2 9.8 8 9.8C8.8 9.8 9.6 10.4 9.6 11.4V14.6Z','#ffffff',1)+line('M7.4 10.4V14.6M8.6 10.4V14.6M6.4 12.4H9.6','#3ec6e0',.6)
  +fill('M5.4 9h.8v.8h-.8ZM10 12h.8v.8H10Z','#cfa96a')+hl('M2.2 7V10',.9),
 // A flip-flop from above: orange sole, cyan footbed, white Y strap and a pink hibiscus.
 'flip-flop-flo':shape('M8 1.2C11 1.2 12.4 3.4 12 6.4C11.7 8.4 11 9.4 11.2 11.4C11.4 13.6 10 15 8 15C6 15 4.8 13.6 4.8 11.4C4.8 9.4 4.2 8.4 4 6.4C3.6 3.4 5 1.2 8 1.2Z','#ff9a3c',1.3)
  +fill('M8 2.4C10.2 2.4 11.2 4 10.8 6.4C10.5 8.4 9.9 9.4 10 11.4C10.2 13 9.4 13.8 8 13.8C6.6 13.8 5.8 13 6 11.4C6.1 9.4 5.5 8.4 5.2 6.4C4.8 4 5.8 2.4 8 2.4Z','#3ec6e0')
  +line('M8 4 4.6 8.4M8 4 11.4 8.4','#244d40',2)+line('M8 4 4.6 8.4M8 4 11.4 8.4','#ffffff',1)
  +dot(8,4,1.3,'#ff6fae',.8)+dot(8,4,.5,'#ffe14d',0)+hl('M5.6 10.4V12.2',.9),
 // A surfboard on a wave: orange deck, blue stripe and a white stringer, the wave curl below.
 'surfboard-sid':shape('M2.2 13.8C2.6 8.8 7.2 3.4 13.8 2.2C12.8 8.6 7.4 13.4 2.2 13.8Z','#ffb347',1.3)
  +line('M3 13 13 3','#fff6e4',.7)+line('M6.2 7.6 8.4 9.8','#2f86d6',1.6)
  +shape('M1 15.4C3.4 13.6 6.2 13.4 8.4 14.6C9.8 12.6 12.6 12 15 13.6V15.4Z','#4fb8f0',1)+line('M9.8 13.4c.6-.4 1.4-.4 2 0','#ffffff',.7)+hl('M4.6 10.4C5.4 8.8 6.4 7.4 7.6 6.2',.9),
 // A floppy straw sunhat: a wide brim with weave rings, a red ribbon band and a white daisy.
 'sunhat-sunny':`<ellipse cx="8" cy="10.6" rx="7.2" ry="3.4" fill="#f6d36b" stroke="#244d40" stroke-width="1.3"/>`
  +line('M2.6 11.6C5.4 13.2 10.6 13.2 13.4 11.6','#d9a93c',.7)
  +shape('M4.2 10.4C4.2 6.2 5.8 4 8 4C10.2 4 11.8 6.2 11.8 10.4C10 11.2 6 11.2 4.2 10.4Z','#f9df85',1.2)
  +shape('M4.2 8.6C6 9.4 10 9.4 11.8 8.6V10.4C10 11.2 6 11.2 4.2 10.4Z','#ff5a5a',1)
  +dot(10.2,9.4,1.3,'#ffffff',.8)+dot(10.2,9.4,.5,'#ffd447',0)+hl('M5.6 7.6C5.8 6.4 6.4 5.4 7.2 5'),
 // The rare: a lifeguard tower on stilts: red roof, red-and-white hut, a ladder and a flag.
 'lifeguard-lou':line('M4.8 9.6 3 15.2M11.2 9.6 13 15.2','#c48a4a',1.2)+line('M6 11.4 7.2 15.2M10 11.4 8.8 15.2M6.4 12.8H9.6','#ffffff',.9)
  +shape('M4 5.6H12V10H4Z','#ffffff',1.2)+fill('M5.6 6.2h1.6v3.2H5.6ZM8.8 6.2h1.6v3.2H8.8Z','#ff4d4d')
  +shape('M2.6 5.8 8 2.6 13.4 5.8Z','#ff4d4d',1.2)+line('M8 2.6V.6','#c48a4a',.8)+shape('M8.2 .6H11V2H8.2Z','#ffd447',.7)
  +line('M1.2 15.2H14.8','#e8c98a',1)+hl('M4.8 6.4V8.6',.8),
};
