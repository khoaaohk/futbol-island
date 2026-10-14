import type {Piece} from './model';

/**
 * Trophy room · the eight cups in the cabinet (Oct 12 2026; user: "Change the your hall of fame exhibit to something else", chose
 * "Trophy room"). Pure data, so tests/museum-exp-hall-of-fame.cjs can read it in Node.
 *
 * Every number here is from the trophy's own source (checked Oct 12 2026). Where a source gives no number we say so: the Africa
 * Cup of Nations trophy has no published height or weight, so it is drawn at a modelled height and never measured on the ruler or
 * weighed on the scale. The models are made by us from the real shapes (base, rings, stem, bowl, handles, globe, petals), turned
 * on a lathe in centimetres; they are not scans, and small details (engravings, the Euro trophy's little juggler) are left off.
 */
export type TrophyId='worldcup'|'womens'|'ucl'|'copa'|'afcon'|'euro'|'asian'|'facup';
export type Part={id:string;label:string;
 /** How far this part lifts in the exploded view (cm at full explode) and how far handles swing out. */
 lift:number;out?:number};
export type Trophy={id:TrophyId;name:string;/** The official name when kids know it by another (e.g. "Champions League trophy"). */official?:string;short:string;tournament:string;
 /** The year shown on the label: the year this trophy (this design) was first won. */
 first:number;firstNote:string;
 /** Real height (cm) and weight (kg), or null when no source gives one. `drawH` is the model's height. */
 heightCm:number|null;weightKg:number|null;drawH:number;
 made:string;keeper:string;story:string;fun:string;
 sources:readonly {title:string;url:string}[];
 parts:readonly Part[];model:readonly Piece[]};

const W='https://en.wikipedia.org/wiki/';
/** Profiles are [radius, height] in cm, bottom to top. */
export const TROPHIES:readonly Trophy[]=[
 {id:'worldcup',name:'FIFA World Cup Trophy',short:'World Cup',tournament:'FIFA World Cup',first:1974,firstNote:'first won in 1974 (the World Cup began in 1930)',
  heightCm:36.8,weightKg:6.175,drawH:36.8,
  made:'18-carat gold, with two green bands of malachite (a stone) in its base. Designed by Silvio Gazzaniga of Italy.',
  keeper:'FIFA keeps the real one in its museum in Zürich. The champions take home a replica.',
  story:'The first World Cup trophy, the Jules Rimet, was stolen in London in 1966. Seven days later a dog called Pickles sniffed it out, wrapped in newspaper under a garden hedge.',
  fun:'The smallest cup in this cabinet, but solid gold makes it heavy: 6.175 kg.',
  sources:[{title:'Wikipedia · FIFA World Cup Trophy',url:W+'FIFA_World_Cup_Trophy'}],
  parts:[{id:'foot',label:'Gold foot',lift:0},{id:'rings',label:'Malachite bands',lift:7},{id:'body',label:'Spiral body',lift:15},{id:'globe',label:'The globe',lift:24}],
  model:[
   {k:'lathe',part:'foot',mat:'gold',prof:[[6.6,0],[6.75,.3],[6.75,1.7],[6.55,2]]},
   {k:'lathe',part:'rings',mat:'malachite',prof:[[6.4,2],[6.45,2.3],[6.45,4],[6.4,4.3]]},
   {k:'lathe',part:'rings',mat:'gold',prof:[[6.5,4.3],[6.5,5.1]]},
   {k:'lathe',part:'rings',mat:'malachite',prof:[[6.3,5.1],[6.35,5.4],[6.35,7],[6.3,7.3]]},
   {k:'lathe',part:'body',mat:'gold',prof:[[6.3,7.3],[6.3,7.9],[5.4,8.3],[4.5,9.8],[3.8,12],[3.5,14.5],[3.7,17],[4.4,19.5],[5.4,22],[6.2,24.4],[6.4,26],[6,27.6],[5,29]],rings:[7.9]},
   {k:'helix',part:'body',mat:'gold',prof:[[4.5,9.8],[3.8,12],[3.5,14.5],[3.7,17],[4.4,19.5],[5.4,22],[6.2,24.4],[6.4,26],[6.1,27.4]],turns:.75,count:4,t:.55},
   {k:'sphere',part:'globe',mat:'gold',z:30.6,r:6.2,grid:'globe'},
  ]},
 {id:'womens',name:'FIFA Women’s World Cup Trophy',short:'Women’s World Cup',tournament:'FIFA Women’s World Cup',first:1999,firstNote:'first won in 1999 (the tournament began in 1991)',
  heightCm:47,weightKg:4.6,drawH:47,
  made:'Sterling silver covered in yellow and white gold. Designed by William Sawaya and made in Milan.',
  keeper:'A new trophy is made for each champion to keep.',
  story:'A spiral band winds up around the trophy and holds a football at the very top.',
  fun:'Taller than the men’s World Cup trophy, but lighter: 4.6 kg.',
  sources:[{title:'Wikipedia · FIFA Women’s World Cup Trophy',url:W+'FIFA_Women%27s_World_Cup_Trophy'}],
  parts:[{id:'cone',label:'Cone base',lift:0},{id:'spiral',label:'Spiral band',lift:9,out:3},{id:'ball',label:'The football',lift:20}],
  model:[
   {k:'lathe',part:'cone',mat:'whitegold',prof:[[7.4,0],[7.5,.4],[7.5,1],[7,1.4],[5.8,5],[4.8,9.4],[4.5,11.6],[4.3,12]],rings:[1]},
   {k:'lathe',part:'spiral',mat:'whitegold',prof:[[1.5,12],[1.4,22],[1.3,32]]},
   {k:'helix',part:'spiral',mat:'gold',prof:[[2.2,12.5],[4.2,16],[6.4,21],[7.8,26.5],[8.2,31],[7.6,35.5],[6.4,38.5]],turns:1.05,count:2,t:1.25},
   {k:'sphere',part:'ball',mat:'whitegold',z:39.5,r:7.5,grid:'ball'},
  ]},
 {id:'ucl',name:'Champions League trophy',official:'European Champion Clubs’ Cup',short:'Champions League',tournament:'UEFA Champions League',first:1967,firstNote:'this design first won in 1967 (the European Cup began in 1955–56)',
  heightCm:74,weightKg:11,drawH:74,
  made:'Silver. Designed by Jörg Stadelmann, a jeweller from Bern in Switzerland.',
  keeper:'Five clubs won it 5 times or 3 in a row and kept a real one: Real Madrid, Ajax, Bayern Munich, AC Milan and Liverpool.',
  story:'Its huge handles gave it a nickname in many languages: “big ears”. In Spanish it is La Orejona.',
  fun:'At 11 kg it weighs more than the Copa América trophy, which is taller.',
  sources:[{title:'Wikipedia · European Champion Clubs’ Cup',url:W+'European_Champion_Clubs%27_Cup'}],
  parts:[{id:'base',label:'Base',lift:0},{id:'stem',label:'Stem and knop',lift:8},{id:'bowl',label:'Bowl',lift:18},{id:'ears',label:'The “big ears”',lift:18,out:9}],
  model:[
   {k:'lathe',part:'base',mat:'silver',prof:[[10,0],[10.2,.3],[10.2,1],[9.7,1.4],[9.7,5.4],[9,5.9],[6.2,6.6]],rings:[3.4]},
   {k:'lathe',part:'stem',mat:'silver',prof:[[3.6,6.6],[3.2,10],[2.9,15.8],[3.6,17.6],[4.3,19],[3.6,20.4],[3,22],[3.4,25],[5,27]]},
   {k:'lathe',part:'bowl',mat:'silver',prof:[[5,27],[7,29],[9.5,33],[11.8,40],[13.4,48],[14.4,56],[15,64],[15.2,70],[15.7,72.6],[15.7,74]],open:true,rings:[69.4]},
   {k:'handle',part:'ears',mat:'silver',at:[Math.PI/2,-Math.PI/2],t:1.05,curve:[[15.2,72],[18.6,73.6],[24.5,72.8],[29.2,67.6],[30.6,59],[29,49.5],[24.8,41],[19.4,35],[14,31.8],[9.6,30.6]]},
  ]},
 {id:'copa',name:'Copa América trophy',short:'Copa América',tournament:'Copa América',first:1916,firstNote:'bought in 1916, the year of the first Copa América',
  heightCm:77,weightKg:9,drawH:77,
  made:'Silver, on a three-level wooden base covered in small plaques with the winners’ names. Bought from Casa Escasany, a jeweller in Buenos Aires.',
  keeper:'The same trophy has been played for since 1916. Winners’ names go on the plaques.',
  story:'It cost 3,000 Swiss francs in 1916. Before 1979 it had no base at all. Now it stands on three wooden levels covered in winners’ plaques.',
  fun:'The Copa América is the oldest continental football competition still played.',
  sources:[{title:'Wikipedia · Copa América',url:W+'Copa_Am%C3%A9rica'}],
  parts:[{id:'base',label:'Wooden base (3 levels)',lift:0},{id:'stem',label:'Foot and stem',lift:9},{id:'urn',label:'Silver cup',lift:17},{id:'handles',label:'Handles',lift:17,out:5},{id:'lid',label:'Lid and finial',lift:27}],
  model:[
   {k:'lathe',part:'base',mat:'wood',prof:[[17.2,0],[17.2,5.6],[16.9,6]]},
   {k:'plaques',part:'base',mat:'silver',n:14,r:17.2,z:1.4,h:3,w:4.6},
   {k:'lathe',part:'base',mat:'wood',prof:[[14.6,6],[14.6,11.6],[14.3,12]]},
   {k:'plaques',part:'base',mat:'silver',n:12,r:14.6,z:7.4,h:3,w:4.4},
   {k:'lathe',part:'base',mat:'wood',prof:[[12,12],[12,16.6],[11.7,17]]},
   {k:'plaques',part:'base',mat:'silver',n:10,r:12,z:13.2,h:2.6,w:4.2},
   {k:'lathe',part:'stem',mat:'silver',prof:[[8,17],[8.1,17.4],[8,18.2],[7,19.2],[4.4,21.8],[2.9,25],[2.6,29],[3.7,30.8],[2.8,32.6],[3.2,33]]},
   {k:'lathe',part:'urn',mat:'silver',prof:[[3.2,33],[5,35],[8.4,39.6],[10.4,45.6],[10.8,51],[9.6,55],[7.6,58],[7.2,59.8],[8,60.6],[8,61]],rings:[51]},
   {k:'handle',part:'handles',mat:'silver',at:[Math.PI/2,-Math.PI/2],t:.85,curve:[[7.6,58.4],[10.2,60.2],[13.6,59.4],[15.2,55.4],[14.6,50.6],[12.6,47.4],[10.7,47]]},
   {k:'lathe',part:'lid',mat:'silver',prof:[[7.7,61],[7.5,62.6],[6.2,65],[3.6,67.6],[1.7,69],[1.5,71]]},
   {k:'lathe',part:'lid',mat:'silver',prof:[[2.3,71],[3,72.4],[2.7,74.6],[1.5,76],[.3,77]]},
  ]},
 {id:'afcon',name:'Africa Cup of Nations trophy',short:'Africa Cup of Nations',tournament:'Africa Cup of Nations',first:2002,firstNote:'this trophy first won in 2002 (the tournament began in 1957)',
  heightCm:null,weightKg:null,drawH:58,
  made:'A gold-plated cup, designed and made in Italy. CAF has not published its height or weight, so we don’t measure it here.',
  keeper:'The winners take home a replica the same size as the real one.',
  story:'Africa has had three trophies. Ghana kept the first one in 1978 and Cameroon kept the second in 2000, each after winning three titles.',
  fun:'Cameroon was the first team to lift this new trophy, in 2002.',
  sources:[{title:'Wikipedia · Africa Cup of Nations trophy',url:W+'Africa_Cup_of_Nations_trophy'},{title:'Wikipedia · Africa Cup of Nations',url:W+'Africa_Cup_of_Nations'}],
  parts:[{id:'base',label:'Base',lift:0},{id:'stem',label:'Stem',lift:8},{id:'cup',label:'Cup',lift:17},{id:'handles',label:'Handles',lift:17,out:6}],
  model:[
   {k:'lathe',part:'base',mat:'gold',prof:[[9,0],[9.1,.3],[9.1,3.6],[8.2,4.6],[6.4,5.5]],rings:[1.9]},
   {k:'lathe',part:'stem',mat:'gold',prof:[[3.2,5.5],[2.7,11],[2.4,19],[3.5,21.6],[2.5,23.6],[3,27],[5,30]]},
   {k:'lathe',part:'cup',mat:'gold',prof:[[5,30],[8.5,33],[11,39],[12,46],[12.2,52.4],[12.9,55.8],[12.9,58]],open:true,rings:[52.6]},
   {k:'handle',part:'handles',mat:'gold',at:[Math.PI/2,-Math.PI/2],t:.95,curve:[[12.5,55],[15.6,56.2],[18.6,52.4],[18.2,45.6],[15.2,41],[11.4,40]]},
  ]},
 {id:'euro',name:'Euros trophy',official:'Henri Delaunay Trophy',short:'Euros',tournament:'UEFA European Championship',first:1960,firstNote:'first won in 1960; remade bigger in 2008',
  heightCm:60,weightKg:8,drawH:60,
  made:'Sterling silver, remade in 2008: 18 cm taller and 2 kg heavier, with a bigger silver base instead of the old marble one.',
  keeper:'Named after Henri Delaunay, UEFA’s first general secretary. His son Pierre designed the first one.',
  story:'Henri Delaunay dreamed up the European Championship but died in 1955, five years before the first one was played in 1960.',
  fun:'A little figure of a boy juggling a ball sits on its back.',
  sources:[{title:'Wikipedia · Henri Delaunay Trophy',url:W+'Henri_Delaunay_Trophy'}],
  parts:[{id:'base',label:'Silver base',lift:0},{id:'stem',label:'Stem',lift:8},{id:'cup',label:'Cup',lift:17},{id:'handles',label:'Handles',lift:17,out:5}],
  model:[
   {k:'lathe',part:'base',mat:'silver',prof:[[12,0],[12.1,.3],[12.1,1.2],[11.2,2],[9.8,5.6],[6.8,8.4],[4.2,9.5]],rings:[1.2]},
   {k:'lathe',part:'stem',mat:'silver',prof:[[3.7,9.5],[3.2,15],[3,22],[4.1,24],[5.6,26]]},
   {k:'lathe',part:'cup',mat:'silver',prof:[[5.6,26],[8.5,30],[10.5,36],[11,42],[10.3,48],[8.7,53],[8.3,56],[9.4,59],[9.6,60]],open:true,rings:[40,44]},
   {k:'handle',part:'handles',mat:'silver',at:[Math.PI/2,-Math.PI/2],t:.7,curve:[[8.9,57],[12,58.6],[14.6,56.8],[14.6,51],[12.8,46.4],[10.7,45.4]]},
  ]},
 {id:'asian',name:'AFC Asian Cup trophy',short:'Asian Cup',tournament:'AFC Asian Cup',first:2019,firstNote:'this trophy first won in 2019 (the Asian Cup began in 1956)',
  heightCm:78,weightKg:15,drawH:78,
  made:'15 kg of sterling silver, made by Thomas Lyte, silversmiths in London. 42 cm wide.',
  keeper:'Shaped like a lotus flower. Its five petals stand for the five zones of the Asian Football Confederation.',
  story:'It was unveiled in 2018 at the Burj Khalifa in Dubai, the tallest building in the world.',
  fun:'The tallest and the heaviest trophy in this cabinet.',
  sources:[{title:'Wikipedia · AFC Asian Cup',url:W+'AFC_Asian_Cup'}],
  parts:[{id:'base',label:'Base',lift:0},{id:'stem',label:'Stem',lift:8},{id:'cup',label:'Inner cup',lift:18},{id:'petals',label:'Five lotus petals',lift:30,out:5}],
  model:[
   {k:'lathe',part:'base',mat:'silver',prof:[[10.5,0],[10.6,.3],[10.6,2],[9.8,3],[9.8,5],[6,6.5]],rings:[4]},
   {k:'lathe',part:'stem',mat:'silver',prof:[[3.4,6.5],[3,20],[2.8,34],[3.9,36],[2.8,38],[3.2,42],[5,45]]},
   {k:'petals',part:'petals',mat:'silver',n:5,curve:[[4.2,44.5],[9,50],[13.8,57],[17.6,64.6],[20.2,71.6],[21,78]],half:[1.4,4.2,6.4,7.2,5.8,.4]},
   {k:'lathe',part:'cup',mat:'silver',prof:[[5,45],[8,50],[10.4,57],[12.2,64],[13.2,70],[13.6,73.4]],open:true},
  ]},
 {id:'facup',name:'The FA Cup',short:'FA Cup',tournament:'The FA Cup (England)',first:1911,firstNote:'this design first won in 1911; the FA Cup began in 1871–72',
  heightCm:61.5,weightKg:6.3,drawH:61.5,
  made:'Sterling silver. The 1911 design is by Fattorini & Sons of Bradford; today’s copy was handmade by Thomas Lyte over 250 hours in 2014.',
  keeper:'The FA Cup is the oldest national football competition in the world, first played in 1871–72.',
  story:'The very first FA Cup, the “little tin idol”, was stolen from a shoe-shop window in Birmingham in 1895 while Aston Villa held it. It was never seen again.',
  fun:'Bradford City won the 1911 cup the first time it was played for, the same city where it was made.',
  sources:[{title:'Wikipedia · FA Cup',url:W+'FA_Cup'}],
  parts:[{id:'foot',label:'Foot',lift:0},{id:'stem',label:'Stem',lift:7},{id:'bowl',label:'Bowl',lift:14},{id:'handles',label:'Scroll handles',lift:14,out:6},{id:'lid',label:'Lid and finial',lift:24}],
  model:[
   {k:'lathe',part:'foot',mat:'silver',prof:[[10,0],[10.1,.3],[10.1,1.2],[9,2.5],[6.5,4],[4.5,5]],rings:[1.2]},
   {k:'lathe',part:'stem',mat:'silver',prof:[[3.2,5],[2.8,9],[3.9,11],[2.8,13],[3,16],[5.5,18]]},
   {k:'lathe',part:'bowl',mat:'silver',prof:[[5.5,18],[9.5,21],[12,26],[13,32],[13,36],[12.4,39],[12.8,40.2],[12.8,40.6]],rings:[36]},
   {k:'handle',part:'handles',mat:'silver',at:[Math.PI/2,-Math.PI/2],t:1,curve:[[12.7,38.4],[16,40],[20,39],[22.4,35],[22,29.4],[19.2,25],[15.8,23],[13.6,23.6],[13.4,25.2]]},
   {k:'lathe',part:'lid',mat:'silver',prof:[[12.2,40.6],[11.7,42],[9.6,45],[6,48],[3.1,50],[2.7,52]]},
   {k:'lathe',part:'lid',mat:'silver',prof:[[3.2,52],[4,54],[3.6,56.5],[2.4,58.5],[3,59.6],[1.5,61],[.3,61.5]]},
  ]},
];
export const byId=(id:string)=>TROPHIES.find(t=>t.id===id);
/** The widest reach of a trophy from its axis (body or handles), for spacing and camera fits. */
export function reach(t:Trophy){let r=0;for(const p of t.model){
 if(p.k==='lathe')for(const [x] of p.prof)r=Math.max(r,x);
 else if(p.k==='handle')for(const [x] of p.curve)r=Math.max(r,x+p.t);
 else if(p.k==='helix')for(const [x] of p.prof)r=Math.max(r,x+p.t);
 else if(p.k==='sphere')r=Math.max(r,p.r);
 else if(p.k==='petals')p.curve.forEach(([x])=>{r=Math.max(r,x);});}
 return r;}
/** The foot's radius (what stands on the turntable or the shelf). */
export const footOf=(t:Trophy)=>{const l=t.model.find(p=>p.k==='lathe');return l&&l.k==='lathe'?Math.max(...l.prof.map(p=>p[0])):8;};
