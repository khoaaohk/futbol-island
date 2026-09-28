import type {BookData} from '../types';
/** Original child-readable retelling of Christian Eriksen's cardiac arrest and comeback, told gently. Facts come from the cited sources; the coping lessons are ours, not quotations. */
export const ERIKSEN_BOOK:BookData={
 title:'Eriksen',subtitle:'A team around you',itemId:'display:clubgrounds:book:eriksen',player:'Christian Eriksen',
 sources:[
  {label:'Wikipedia · Christian Eriksen',url:'https://en.wikipedia.org/wiki/Christian_Eriksen'},
  {label:'Wikipedia · UEFA President’s Award',url:'https://en.wikipedia.org/wiki/UEFA_President%27s_Award'},
 ],
 pages:[
  {id:'parken',year:'Euro 2020 · 12 June 2021',title:'A sudden, scary moment',
   text:'On 12 June 2021, Denmark played Finland at the European Championship, in Copenhagen. Just before half-time, Christian Eriksen was about to receive a throw-in when he suddenly fell to the ground.\n\nWave the help flag. His heart had stopped beating properly. This is called a cardiac arrest, and it is very rare. Straight away, his captain, Simon Kjær, turned him onto his side, and the medical team rushed onto the pitch.',
   lesson:'In an emergency, stay calm and get a grown-up to help straight away.',
   prompt:'Wave the help flag',response:'Help is on the way!',source:0},
  {id:'circle',year:'Copenhagen · 2021',title:'A circle of friends',
   text:'While the doctors worked, his Denmark teammates stood together in a circle around him. They made a wall with their backs, so that cameras could not see, and he had some privacy.\n\nClose the circle. Captain Simon Kjær also comforted Eriksen’s partner, and helped his teammates support each other. On the worst day, the team did not leave their friend alone. They stood by him.',
   lesson:'Good friends look after each other. Standing together is a kind of kindness.',
   prompt:'Close the circle',response:'A team around him.',source:1},
  {id:'helpers',year:'The first aid heroes',title:'Helpers who knew what to do',
   text:'The medical team gave him CPR, which means pressing on the chest to keep blood moving. They also used a defibrillator, a machine that can help a heart find its beat again. Their quick work saved his life.\n\nTurn over the helper cards. About an hour later, officials said he was stable and awake. Later in 2021, UEFA gave its President’s Award to Kjær and to Denmark’s medical staff, for their heroic help.',
   lesson:'Helpers are heroes too. Learning first aid can help save a life one day.',
   prompt:'Turn over the helper cards',response:'Everyone helped.',steps:3,source:1},
  {id:'icd',year:'June 2021',title:'A tiny helper inside',
   text:'In hospital, doctors fitted Eriksen with an ICD. It is a small device, placed inside the body, that watches the heartbeat and can help the heart if its rhythm goes wrong. On 18 June, he left hospital.\n\nOpen the door home. He visited his teammates, then went home to his family. The Danish team dedicated their next win, 4–1 against Russia, to him, and went all the way to the semi-finals.',
   lesson:'After something scary, it is okay to rest and be close to the people you love.',
   prompt:'Open the door home',response:'Home with his family.',source:0},
  {id:'inter',year:'Late 2021 to 2022',title:'A new way back',
   text:'There was another problem. In Italy, where Eriksen played for Inter Milan, the rules did not allow players with an ICD to play. In December 2021, Inter ended his contract. He had to find a new way back.\n\nOpen the gate to a new club. He trained on his own at OB, his old youth club in Denmark. Then he signed for Brentford in England, and played again eight months after his cardiac arrest.',
   lesson:'When one door closes, you can look for another way forward.',
   prompt:'Open the gate',response:'Welcome to Brentford!',source:0},
  {id:'back',year:'2022 and after',title:'Back with his team',
   text:'In March 2022, Eriksen played for Denmark again, and scored two minutes after coming on. That summer he joined Manchester United, where he won the League Cup and the FA Cup.\n\nFlip the counter. At Euro 2024, he scored in Denmark’s first match, and he became the most-capped player in Denmark’s history, with 133 games. He had come back, with a whole team of helpers behind him.',
   lesson:'Nobody gets through hard times alone. Remember to thank the people who help you.',
   prompt:'Flip the counter',response:'133 games for Denmark!',source:0},
 ]
};
