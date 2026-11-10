/** Bento Box Buddies (gs-cay-bento) toy icons: see the guide in ./index.ts. */
import {dot,fill,hl,line,shape,type ToyIconSet} from './types';

export const ICONS:ToyIconSet={
 // A green lunch box from above: rice with a plum, a yellow rolled egg, a red octopus sausage and a leaf divider.
 'bento-ben':shape('M2.6 2.6H13.4C14.2 2.6 14.8 3.2 14.8 4V12.6C14.8 13.4 14.2 14 13.4 14H2.6C1.8 14 1.2 13.4 1.2 12.6V4C1.2 3.2 1.8 2.6 2.6 2.6Z','#3f9a6f',1.4)
  +shape('M2.8 4.2H8.4V12.4H2.8Z','#fffaf0',1)+dot(5.6,8.3,1.1,'#e8506a',.8)
  +shape('M9.6 4.2H13.2V7.6H9.6Z','#ffd54a',1)+line('M10.6 5.4q.8-.6 1.6 0','#f3a712',.8)
  +shape('M9.6 9H13.2V12.4H9.6Z','#ff6a4a',1)+fill('M10.2 9.8h.8v.8h-.8ZM11.8 10.8h.8v.8h-.8Z','#ffb0a0')+line('M9 8.3h4.6','#9be05a',1.2)+hl('M2.4 5V7',.9),
 // A rolled-egg slice: a soft yellow block with the spiral layers on its cut face.
 'tamago-tama':shape('M4.4 3.4H12.8C14 3.4 14.8 4.6 14.8 6.4V11C14.8 12.8 14 13.8 12.8 13.8H4.4Z','#f7c43a',1.2)
  +shape('M4.4 3.4C2.6 3.4 1.2 5.6 1.2 8.6C1.2 11.6 2.6 13.8 4.4 13.8C6.2 13.8 7.6 11.6 7.6 8.6C7.6 5.6 6.2 3.4 4.4 3.4Z','#ffe066',1.2)
  +line('M4.4 8.8C4.8 8.8 5 8.4 4.8 8C4.4 7.4 3.6 7.8 3.6 8.6C3.6 9.6 4.8 10.2 5.6 9.4C6.4 8.4 6 6.4 4.6 6C3.2 5.6 2.4 7.2 2.4 8.8C2.4 10.8 3.6 12.2 5 12','#f0a316',.8)
  +line('M9.4 3.4V13.8','#f0a316',.8)+hl('M9 5h3.6',.9),
 // A fried curry bun: a crunchy golden oval with panko crumbs, a curry drip and a curl of steam.
 'curry-bun-cooper':line('M8 1.2C7 2 9 2.8 8 3.8M10.6 1.8C9.8 2.6 11.4 3.2 10.6 4','#8fd0ea',1)
  +`<ellipse cx="8" cy="9.4" rx="6.8" ry="4.8" fill="#cf8a30" stroke="#244d40" stroke-width="1.3"/>`
  +fill('M4 7.6h1v1H4ZM6.6 6.2h1v1h-1ZM9.4 6.8h1v1h-1ZM11.6 8.6h1v1h-1ZM5.4 10.6h1v1h-1ZM8.4 9.4h1v1h-1ZM10.2 11.4h1v1h-1Z','#f4c064')
  +shape('M13.4 11.2C14.4 11.6 14.6 13 14 13.8C13.4 13.4 13 12.4 13.4 11.2Z','#e8781c',.9)+hl('M3.2 8C3.8 6.6 5 5.6 6.4 5.2'),
 // A curved yellow banana with a brown stem and tip.
 'banana-bolt':shape('M2.6 2.8C3 8.6 6.6 12.6 12.6 12.4C14 12.4 14.6 13.6 13.8 14.4C7.4 16 1 11.6 1.2 4C1.2 2.6 2.6 2.2 2.6 2.8Z','#ffe14d',1.3)
  +line('M2.4 5.6C3.2 9.8 6.6 13.2 11.6 13.6','#f2c230',1)+shape('M1.4 3.2 1.2 1.4H2.8L2.6 3.2Z','#9a7028',.9)+fill('M13.6 13.4h1v1h-1Z','#9a7028')+hl('M3.6 6.4C4.4 9 6 10.8 8 11.6',.9),
 // A fruit-juice box: an orange carton with an orange slice on the front and a bendy white straw.
 'juice-box-jun':shape('M10.8 5.6 13.4 4.2V12.6L10.8 14.4Z','#ffbe73',1.1)+shape('M3.2 5.6 5.8 4.2H13.4L10.8 5.6Z','#ffd29a',1.1)
  +shape('M3.2 5.6H10.8V14.4H3.2Z','#ff9a3c',1.3)+dot(7,10.2,2.2,'#ffffff',.9)+dot(7,10.2,1.4,'#ffd447',0)+line('M7 8.8v2.8M5.6 10.2h2.8','#ffffff',.6)
  +line('M9.8 4.8V2.4L12.6 .9','#244d40',1.9)+line('M9.8 4.8V2.4L12.6 .9','#ffffff',1)+hl('M4.2 7V9'),
 // The rare: a sushi roll from above: a green seaweed ring, white rice, a coral salmon and cucumber centre.
 'sushi-roll-sora':dot(8,8,6.6,'#2f7a55',1.4)+dot(8,8,4.8,'#fffaf0',.9)+fill('M5.8 9.4C5.4 7.4 6.6 5.8 8.4 5.8C9 7.8 7.8 9.4 5.8 9.4Z','#ff7f50')
  +fill('M8.2 10.4C8.4 8.8 9.4 8 10.4 8C10.6 9.6 9.6 10.4 8.2 10.4Z','#8bd35a')+fill('M5 5.6h.8v.8H5ZM10.4 5h.8v.8h-.8ZM10.8 11h.8v.8h-.8ZM4.8 10.6h.8v.8h-.8Z','#efe6d2')+hl('M3 6.4C3.4 5 4.4 3.8 5.6 3.2',1.1),
};
