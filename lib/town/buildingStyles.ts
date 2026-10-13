/**
 * Building paint schemes (Oct 12 2026): the town's houses and shops all share one box recipe (world.ts building()/house()),
 * and used to share four beige walls, one cream roof and two awning colours, so every street read as the same building.
 *
 * Variety here is paint only. Every part a scheme recolours is a plain palette box that the static batching pass in
 * world.ts folds into the 50 m spatial chunks as per-vertex colour, so a scheme adds no draw call, no triangle, no texture,
 * no shader and no per-frame work: the same geometry, in different colours. Shapes, footprints, heights and roof furniture
 * are untouched (rooftop travel, collisions and coin spots depend on them).
 *
 * Schemes are whole, hand-matched sets (wall + roof + trim + awning + door + sign), never independent random picks, so
 * nothing clashes. The pick is a hash of the building's name (stable on every load and device), nudged so a building never
 * repeats the scheme of the one built just before it (its neighbour along the same street).
 */
export type AwningPattern='stripe'|'wide'|'solid'|'tricolour';
export type BuildingScheme={
  name:string;
  /** Wall render. */ wall:string;
  /** Roof slab (the cornice box's top is the roof seen from the play camera). */ roof:string;
  /** Parapets, sills, mullions, plinth. */ trim:string;
  /** Awning colours: main, light partner, and a third for the tricolour pattern. */ awning:string; awningLight:string; awningThird:string;
  pattern:AwningPattern;
  /** Front door. */ door:string;
  /** Shop sign board (its own canvas texture already, so free). */ sign:string;
  /** Balconies sit on even or odd window columns (same count either way). */ balconyOdd:boolean;
};

const S=(name:string,wall:string,roof:string,trim:string,awning:string,awningLight:string,awningThird:string,pattern:AwningPattern,door:string,sign:string,balconyOdd=false):BuildingScheme=>
  ({name,wall,roof,trim,awning,awningLight,awningThird,pattern,door,sign,balconyOdd});

/** Island pastels, terracotta and sea blues; the cay bungalows (coralCay.ts CAY_HOMES) use the same family. */
export const BUILDING_SCHEMES:readonly BuildingScheme[]=[
  S('sand & terracotta','#d6b58a','#c4704f','#eddfbb','#bd7657','#ecdcb8','#d69b61','stripe','#365b56','#244d49'),
  S('brick & slate','#b88472','#7fa3a2','#eddfbb','#477c6a','#ecdcb8','#8fb08a','wide','#2f4f4a','#294f43',true),
  S('mint & clay','#b4d6c2','#bd7657','#f4ecd6','#477c6a','#f4ecd6','#bd7657','tricolour','#8a5a44','#2f5a4c'),
  S('butter & sea','#efd38e','#74a8ae','#f6edd6','#3f7fa0','#f6edd6','#e0b04f','stripe','#3f7fa0','#23465c',true),
  S('rose & teal','#ecb3b3','#86aba5','#f5e8d8','#c75b5b','#f5e8d8','#678f8d','wide','#678f8d','#5a2f33'),
  S('peach & green','#f0c9b0','#8fae86','#f6ebd9','#d9a441','#f6ebd9','#c4704f','solid','#477c6a','#3d4f2c',true),
  S('sea blue & tile','#a8c8d3','#c4704f','#f2ead8','#2f6f8f','#f2ead8','#e2c69a','stripe','#2f6f8f','#23465c'),
  S('sand & sage','#e2c69a','#a3b98c','#f1e5c8','#5d8a5c','#f1e5c8','#bd7657','tricolour','#9d5a3c','#2f4f3a',true),
  S('pistachio & tile','#cdd8a4','#c4704f','#f4ecd2','#c75b5b','#f4ecd2','#3f7fa0','wide','#7a5a3c','#3d4f2c'),
  S('whitewash & tile','#efe3cc','#c4704f','#fbf3e2','#3f7fa0','#fbf3e2','#c4704f','solid','#3f7fa0','#23465c'),
  S('coral & cream','#e8a184','#f0e2c2','#f8eedb','#3f7fa0','#f8eedb','#e0b04f','stripe','#3f7fa0','#23465c',true),
  S('ochre & tile','#d9a865','#a8573f','#f1e3c4','#477c6a','#f1e3c4','#a8573f','wide','#a8573f','#294f43'),
];

/**
 * Buildings that must stay as they are: landmarks, the coaches building under its big sign, the school campus (one
 * institution, one paint), the hostel and anything with its own story. The museum and the Konbinis don't use house().
 */
export const LANDMARK_BUILDINGS=new Set([
  'CAFE BY THE SEA','ROOFTOP KNOCKOUT','ARCADE','PLAYER DEVELOPMENT','CORAL CAY HOSTEL',
  'ARTS WING','CLASSROOMS','DINING HALL','SCHOOL OFFICES','LIBRARY','STUDENT CENTRE',
]);

/** FNV-1a: tiny, stable across engines. */
export function nameHash(text:string){let h=0x811c9dc5;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,0x01000193);}return h>>>0;}

/**
 * A scheme picker for one town build. Call in build order; returns null for landmarks (keep their original paint).
 * Deterministic: the same names in the same order always give the same schemes.
 */
export function createSchemePicker(schemes:readonly BuildingScheme[]=BUILDING_SCHEMES){
  let previous=-1;
  return (label:string):BuildingScheme|null=>{
    if(LANDMARK_BUILDINGS.has(label))return null;
    let i=nameHash(label)%schemes.length;
    if(i===previous)i=(i+1)%schemes.length;
    previous=i;return schemes[i];
  };
}

/** Awning stripe colour for column `col` of a scheme's pattern. */
export function awningColour(scheme:BuildingScheme,col:number,cols:number){
  switch(scheme.pattern){
    case 'wide':return (col>>1)%2?scheme.awningLight:scheme.awning;
    case 'solid':return col===0||col===cols-1?scheme.awningLight:scheme.awning;
    case 'tricolour':return [scheme.awning,scheme.awningLight,scheme.awningThird,scheme.awningLight][col%4];
    default:return col%2?scheme.awningLight:scheme.awning;
  }
}
