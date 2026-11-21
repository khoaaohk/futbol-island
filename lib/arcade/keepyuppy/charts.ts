/**
 * Keepy-Uppy Beat tracks (Nov 21 2026, docs/arcade-aaa/keepyuppy-direction.md): six short tracks, slow to fast. Everything here is
 * data: the touch chart (hand-written, never random; format in core.ts) and the music (original patterns, played by audio.ts with
 * WebAudio; no audio files and no borrowed melodies). A music bar is 16 steps. `x` = a drum hit (`X` = accent); bass and lead are
 * scale degrees 0-9 over two octaves of the track's five-note scale. A pattern may be one, two or four bars long and loops.
 */
export type Music={root:number;scale:readonly number[];lead:'tri'|'square'|'bell'|'pluck'|'steel'|'whistle';kick:string;clap:string;shaker:string;bass:string;motif:string};
export type Track={id:string;name:string;venue:string;bpm:number;/** drops allowed before the ball is gone for good (kinder on the first tracks) */balls:number;/** the weak-foot section, in bars (first, last), 1-based */weak:readonly [number,number];
 tip:{title:string;line:string};chart:string;music:Music};
const MAJ=[0,2,4,7,9],MIN=[0,3,5,7,10];

export const TRACKS:readonly Track[]=[
 {id:'park',name:'Park Kickabout',venue:'The park, after school',bpm:80,balls:5,weak:[13,16],
  tip:{title:'Soft touches',line:'Tap the pad when the ball lands in its ring. A soft, high touch gives you more time before the next one.'},
  chart:'S...S... S...S... S...W... S...W... T...S... T...S... S.S.T... W...T... H...S... H...T... S.T.H... S.W.H... '
   +'W...W... W.W.T... W...H... W.W.H... S.W.T.H. S.W.T.H. S.S.W.W. T.H.S...',
  music:{root:48,scale:MAJ,lead:'whistle',kick:'x.......x.......',clap:'....x.......x...',shaker:'x.x.x.x.x.x.x.x.',bass:'0.......0.....2.0.......3.....2.',motif:'4...5...7.5.4.......2...4...5...4...2...........'+'................'}},
 {id:'school',name:'Schoolyard Shuffle',venue:'The schoolyard, at break',bpm:92,balls:4,weak:[11,14],
  tip:{title:'Both feet',line:'Great jugglers use both feet. Watch for the weak-foot part: it counts on its own, and it gets better every time.'},
  chart:'S...W... S.W.T... S.W.S.W. T.T.H... S.W.T.H. S.S.W.W. [TST]..H.. S.W.S... [TST]..W.. H.H.S.W. '
   +'W...W... W.T.W.H. W.W.T... [TWT]..W.. S.W.S.W. T.H.T.H. S.SW..T. [TST]..H.. S.W.T.H. SW..SW.. [TST].H... S.W.S...',
  music:{root:50,scale:MAJ,lead:'tri',kick:'x...x...x...x...',clap:'....x.......x..x',shaker:'x.x.x.x.x.x.x.x.',bass:'0...0..2....3...0...0..2....4.3.',motif:'5.5.7...5.4.2...4.4.5...4.2.0...'}},
 {id:'beach',name:'Beach Bounce',venue:'The beach, at low tide',bpm:104,balls:4,weak:[13,16],
  tip:{title:'Eyes on the ball',line:'Watch the ball all the way onto your foot, your thigh or your forehead. Your head follows the ball.'},
  chart:'S...W... S.W.T... H.H.S.W. T.H.S... N=====.. S.W.S.W. [H.H.H.].. SW..T.H. N===..S. W.S.TH.. [H.H.H.]W. S.W.T... '
   +'W...W.W. W.T.W.H. WT..W.H. W.W.N==. S.W.S.W. TH..TH.. [H.H.H.].. SW.TH.S. N=====.. S.W.T.H. SW..SW.. [H.H.H.]..',
  music:{root:53,scale:MAJ,lead:'steel',kick:'x...x...x...x...',clap:'....x.......x...',shaker:'X.xxX.xxX.xxX.xx',bass:'0..0..0...0.3...0..0..0...2.4...',motif:'7..5..4.5.......7..5..4.2.......4..5..7.9...7...5..4..2.0.......'}},
 {id:'cage',name:'Cage Night',venue:'The street cage, under the lamps',bpm:116,balls:3,weak:[13,16],
  tip:{title:'Find the rhythm',line:'Juggling has a beat. Some touches here land between the drum hits. Count "one-and-two-and".'},
  chart:'S.W.S.W. T.H.T.H. SW..SW.. [TST]..H.. A...S.W. T.H.SW.. A...W.S. [TST].H... .S.W.S.W T...A... .S.W.T.H S...a... '
   +'W.W.T... a...W.H. WT..WH.. [TWT]..W.. S.W.SW.T S.H.A... .S.WT.H. [TST]..a.. ..S.W.H. SW.TH.S. A...[TST]. .W.S.H.T '
   +'S.W.S.W. TH..TH.. A...a... [TST].H...',
  music:{root:45,scale:MIN,lead:'square',kick:'x...x...x...x.x.',clap:'....x.......x...',shaker:'x.xxx.xxx.xxx.xx',bass:'0.0...3.0.0...5.0.0...3.0.5.3.2.',motif:'7...5.7...5.4...7...5.7...9.7...'}},
 {id:'roof',name:'Rooftop Rhythm',venue:'The rooftop pitch, at sunset',bpm:128,balls:3,weak:[17,20],
  tip:{title:'Controlled height',line:'Fast touches stay low. Before a trick, lift the ball a little higher: height is time.'},
  chart:'S.W.S.W. T.H.T.H. SW..TH.. S.W.K... S.W.S.W. TH..K... .S.W.T.H T...X... W.S.W.S. X...TH.. [H.H.H.].. SW.S.W.. '
   +'N=====.. S.WS..H. K...x... .W.S.T.. W.W.T.W. k...W.H. W.H.W.T. x...W.W. S.W.TH.S W.T.H.K. S.W.SW.. N===..X. '
   +'.S.W.S.W S.H.TH.. K...k... [H.H.H.]S. SW..SW.. TH.S.W.H T.S.X... N=====..',
  music:{root:52,scale:MIN,lead:'pluck',kick:'x...x...x...x...',clap:'....x..x....x...',shaker:'..x...x...x...x.',bass:'..0...0...3...5...0...0...7...5.',motif:'9.7.5...7.5.4...5.7.9...7.......'}},
 {id:'cup',name:'Cup Final Carnival',venue:'The stadium, on cup final night',bpm:140,balls:3,weak:[17,22],
  tip:{title:'Put it all together',line:'Every trick, both feet, at full speed. Stay calm: a soft touch still buys you time.'},
  chart:'S.W.S.W. T.H.T.H. SW..SW.. TH..TH.. S.W.A... S.WS.W.. [T.S.T.]H. .S.W.T.. K...X... SW.TH.S. W.S.a... [H.H.H.].. '
   +'SWSW..T. H.T.H.K. ..SW.TH. N=====.. W.W.T.W. a...W.H. W.T.W.H. k...x... .W.T.W.H [T.W.T.]W. S.W.SWSW S.T.H.A. '
   +'..TH.SW. X...K... SW.S.W.H T.N===.. S.W.S.W. TH.TH.S. a...A... [H.H.H.]W. SWSW.TH. .S.W.S.. [T.S.T.].. X...N===',
  music:{root:55,scale:MAJ,lead:'bell',kick:'x...x...x...x...',clap:'....x.......x.x.',shaker:'x.xx.xx.x.xx.xx.',bass:'0..0..3.0..0..4.0..0..3.5..4..2.',motif:'7..7.9..7.9.7...5..5.7..5.7.4...'}},
];
