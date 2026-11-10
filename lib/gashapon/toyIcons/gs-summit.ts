/** Summit Orchard (gs-summit) toy icons: see the guide in ./index.ts. */
import {ball,dot,edge,fill,hl,line,shape,type ToyIconSet} from './types';

const LEAF='#5ca83a';
const MANGO='M3.4 10.6C2 7.4 3.6 3.8 7.2 2.8C10.8 1.8 14 4.2 14.2 7.8C14.4 11.6 11.6 14.4 8.4 14.4C6 14.4 4.4 12.8 3.4 10.6Z';
const AVO='M8 1.4C9.8 1.4 10.8 3 11.2 5C13.4 6.4 14.2 8.4 14.2 10.2C14.2 13 11.6 14.8 8 14.8C4.4 14.8 1.8 13 1.8 10.2C1.8 8.4 2.6 6.4 4.8 5C5.2 3 6.2 1.4 8 1.4Z';

export const ICONS:ToyIconSet={
 // A ripe mango: a golden kidney with a red sunset blush, its stem and a green leaf.
 'mango-max':shape(MANGO,'#ffb03b',1.4)+fill('M9.4 3.2C11.8 3.4 13.8 5.4 13.8 8C12.4 8.4 10.6 7.6 9.6 6.2C9 5.2 9 4 9.4 3.2Z','#ff6a4d')+edge(MANGO,1.4)
  +line('M7.4 2.8 6.6 1.2','#8b5a2b',1)+shape('M6.8 1.6C4.6.6 2.6 1.2 1.6 2.6C3.4 3.6 5.6 3.4 6.8 1.6Z',LEAF,1)+hl('M4.6 10C4 8.2 4.4 6.4 5.4 5.2',1.1),
 // A papaya cut in half: green-yellow skin, orange flesh, a pale hollow full of plum-coloured seeds.
 'papaya-pia':shape('M8 1.6C11.2 1.6 13.4 4.6 13.4 8.4C13.4 12.2 11.2 14.8 8 14.8C4.8 14.8 2.6 12.2 2.6 8.4C2.6 4.6 4.8 1.6 8 1.6Z','#9ccc4a',1.4)
  +fill('M8 2.8C10.4 2.8 12.2 5.2 12.2 8.4C12.2 11.4 10.4 13.6 8 13.6C5.6 13.6 3.8 11.4 3.8 8.4C3.8 5.2 5.6 2.8 8 2.8Z','#ff8a4c')
  +`<ellipse cx="8" cy="9" rx="2.4" ry="3.4" fill="#ffd0a0" stroke="#e8703a" stroke-width=".7"/>`
  +[[7.4,6.8],[8.8,7.6],[7.2,8.8],[8.8,9.8],[7.6,11],[8.4,11.8],[7.4,7.8]].map(([x,y])=>dot(x,y,.55,'#7a4e94',0)).join('')
  +line('M8 1.6V.6','#5c8a2e',1)+hl('M4.8 6C5.2 4.6 6 3.6 7 3.2',.9),
 // An avocado half: a pebbly green skin, a lime ring, creamy flesh and the round brown seed with a little sprout.
 'avo-kicker':shape(AVO,'#3d7b2e',1.4)+fill('M8 2.6C9.2 2.6 10 3.8 10.2 5.6C12.2 6.8 13 8.6 13 10.2C13 12.4 10.8 13.8 8 13.8C5.2 13.8 3 12.4 3 10.2C3 8.6 3.8 6.8 5.8 5.6C6 3.8 6.8 2.6 8 2.6Z','#a6d65a')
  +fill('M8 3.6C8.8 3.6 9.2 4.6 9.4 6C11.2 7 12 8.6 12 10.2C12 11.8 10.4 12.8 8 12.8C5.6 12.8 4 11.8 4 10.2C4 8.6 4.8 7 6.6 6C6.8 4.6 7.2 3.6 8 3.6Z','#eef4a8')
  +dot(8,9.6,2.4,'#8b5a2b',1.1)+line('M8 7.2V5.8','#5ca83a',.8)+shape('M8 6C8.6 5 9.6 4.8 10.2 5.2C9.8 6 8.8 6.4 8 6Z',LEAF,.6)+hl('M7 8.6C7.2 8.2 7.6 8 8 8',.7),
 // A round orange: dimpled peel, a stem with a leaf, and a curving cyan shot line round her.
 'orange-orbit':line('M1.6 12.2C3.4 15.2 11.6 15.6 14.6 11.4','#3ec6e0',1)+shape('M13.2 10.8 15 10.8 14.6 12.6Z','#3ec6e0',.6)
  +dot(8,7.8,5.6,'#ff9a1f',1.4)+fill('M5.4 9.2h.8v.8h-.8ZM9.8 10.2h.8v.8h-.8ZM10.6 6.6h.8v.8h-.8ZM7.2 11.4h.8v.8h-.8ZM5.4 6h.8v.8h-.8Z','#ffc266')
  +line('M8 2.4 8.2 1.2','#6b4a2a',1)+shape('M8.2 1.8C9.4.6 11.4.6 12.4 1.6C11.2 2.8 9.4 2.8 8.2 1.8Z','#3c8d2f',.9)+hl('M3.8 7.2C4 5.6 4.8 4.4 6 3.8',1.1),
 // A cairn: three stacked grey stones, a moss patch, and the lookout's red flag on top.
 'cairn-carl':line('M8.8 6.2V.8','#244d40',1.6)+line('M8.8 6V1','#c48a4a',.7)+shape('M9.2 1H13L9.2 3.4Z','#e94b3c',.9)
  +shape('M1.6 13C1.6 11.2 4.4 10.4 8 10.4C11.6 10.4 14.4 11.2 14.4 13C14.4 14.4 11.6 15.2 8 15.2C4.4 15.2 1.6 14.4 1.6 13Z','#a9a9b8',1.3)
  +shape('M3.6 9.2C3.6 7.8 5.6 7 8.2 7C10.8 7 12.6 7.8 12.6 9.2C12.6 10.6 10.8 11.2 8.2 11.2C5.6 11.2 3.6 10.6 3.6 9.2Z','#c8c8d4',1.2)
  +shape('M5.6 6.2C5.6 5 6.8 4.4 8.4 4.4C10 4.4 11.2 5 11.2 6.2C11.2 7.4 10 8 8.4 8C6.8 8 5.6 7.4 5.6 6.2Z','#9a9aae',1.1)
  +fill('M2.6 12.8h1.6v.8H2.6ZM11 9.6h1.2v.8H11Z','#7fb13c')+hl('M3 12.4C3.6 11.8 4.6 11.4 5.6 11.2',.9),
 // The rare: the Summit 5s goal: white posts, a purple net, a ball flying in, a purple pennant, on its turf-and-rock plinth.
 'summit-goal-gigi':shape('M1 13H15V15.2H1Z','#5cc65a',1.1)+fill('M1.6 13.8h2.4v1H1.6Z','#a9a9b8')
  +line('M3.6 5H12.4M3.6 7.4H12.4M3.6 9.8H12.4M5.4 3.6V13M8 3.6V13M10.6 3.6V13','#9a8cf0',.6)
  +line('M2.4 13V3.4H13.6V13','#244d40',2.4)+line('M2.4 13V3.6H13.6V13','#ffffff',1.1)
  +line('M13.6 3.4V1','#244d40',.9)+shape('M13.8 1H15.4L13.8 2.2Z','#6a5acd',.7)
  +ball(9.6,9.4,1.9,'#6a5acd',.9)+line('M4.4 11.8 6.8 10.6','#ffd447',.9)+hl('M2.4 5V8',.8),
};
