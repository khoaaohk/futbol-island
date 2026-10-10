/**
 * shirts · "Through the decades" (Oct 9 2026): the data and pure logic behind the paper-doll kit builder. No React, so the
 * Node test can check every date and rule. Real history only; each milestone names its source (DECADE_SOURCES).
 *
 * A part of a kit has an arrival year. Put it on the doll before that year and it flutters off ("Too early!"); slide the
 * years back past it and it falls off too. The weight test uses one sourced pair of numbers only: cotton can absorb 7% of its
 * weight in water, polyester about 0.4% (Compound Interest), shown as grams of water per 100 g of shirt.
 */
export type PartId='number'|'name'|'sponsor'|'synthetic'|'vneck';
export type Part={id:PartId;label:string;short:string;side:'back'|'front';arrives:number;when:string;why:string};
export const PARTS:readonly Part[]=[
 {id:'number',label:'Number on the back',short:'Number',side:'back',arrives:1928,when:'1928',why:'Numbers were first worn in English league games on 25 August 1928.'},
 {id:'vneck',label:'V-neck (no collar)',short:'V-neck',side:'front',arrives:1950,when:'the 1950s',why:'In the 1950s, kits in southern Europe and South America got lighter, with V-necks instead of collars.'},
 {id:'synthetic',label:'Man-made fabric',short:'Polyester',side:'front',arrives:1953,when:'1953',why:'Bolton Wanderers wore shirts made of a man-made fabric in the 1953 FA Cup final.'},
 {id:'sponsor',label:'Sponsor on the front',short:'Sponsor',side:'front',arrives:1973,when:'1973',why:'In 1973 Eintracht Braunschweig in Germany put a sponsor on their shirts. In England, Kettering Town were first, in 1976.'},
 {id:'name',label:'Name above the number',short:'Name',side:'back',arrives:1993,when:'1993',why:'Names above squad numbers became normal in the Premier League in 1993–94.'},
];
export const partOf=(id:PartId)=>PARTS.find(p=>p.id===id)!;
/** The year a part arrived if it is too early for `year`, else null. */
export const tooEarly=(id:PartId,year:number)=>year<partOf(id).arrives?partOf(id).arrives:null;
/** Parts on the doll that the given year can't have yet (they fall off when you scrub back past them). */
export const fallsOff=(on:ReadonlySet<PartId>,year:number)=>PARTS.filter(p=>on.has(p.id)&&year<p.arrives).map(p=>p.id);

export const YEAR_MIN=1880,YEAR_MAX=2026;
export type Milestone={year:number;tag:string;title:string;text:string;src:number};
/** The stops on the timeline (the scrubber snaps to these). `src` indexes DECADE_SOURCES. */
export const MILESTONES:readonly Milestone[]=[
 {year:1880,tag:'1880s',title:'Thick cotton',text:'Early players wore thick cotton shirts with collars, long knickerbockers and heavy leather boots.',src:0},
 {year:1928,tag:'1928',title:'Numbers!',text:'On 25 August 1928, Arsenal and Chelsea wore numbers in English league games for the first time.',src:1},
 {year:1939,tag:'1939',title:'Numbers for all',text:'From the 1939–40 season, the Football League said every team had to wear numbers.',src:1},
 {year:1953,tag:'1953',title:'Man-made fabric',text:'Bolton Wanderers wore shirts of a man-made fabric in the 1953 FA Cup final. Kits were getting lighter, with V-necks instead of collars.',src:2},
 {year:1954,tag:'1954',title:'Squad numbers',text:'At the 1954 World Cup, each player in a 22-player squad kept one number, from 1 to 22.',src:1},
 {year:1973,tag:'1973',title:'Sponsors',text:'Eintracht Braunschweig in Germany put a sponsor on their shirts in 1973. Kettering Town were first in England, in 1976.',src:0},
 {year:1980,tag:'1980s',title:'Polyester',text:'Polyester shirts were lighter than cotton and did not hold on to sweat and rain. By the 1990s most clubs wore them.',src:3},
 {year:1993,tag:'1993',title:'Names on the back',text:'In the 1993–94 Premier League, every player had their own squad number with their name printed above it.',src:1},
 {year:2026,tag:'Today',title:'Mesh',text:'Today’s shirts are usually polyester mesh, so sweat and heat can escape.',src:0},
];
export const nearestMilestone=(year:number)=>MILESTONES.reduce((a,b)=>Math.abs(b.year-year)<Math.abs(a.year-year)?b:a);
/** The milestone a year belongs to (the latest one at or before it). */
export const eraOf=(year:number)=>[...MILESTONES].reverse().find(m=>m.year<=year)??MILESTONES[0];
/** Where a flick lands: project the release velocity forward (a gentle friction), then pick the nearest milestone. */
export const flickTarget=(year:number,velocity:number)=>nearestMilestone(Math.max(YEAR_MIN,Math.min(YEAR_MAX,year+velocity*.22)));

/** Rain test (Compound Interest): water absorbed INTO the fibres per 100 g of dry shirt (cotton 7%, polyester 0.4%). Water caught
 *  between the threads is extra and not modelled, so the copy says "into the fibres", never "soaked through" (Oct 9 2026 fix). */
export const WATER_PER_100G={cotton:7,polyester:.4} as const;
export const waterHeld=(fabric:'cotton'|'polyester',wet:number)=>WATER_PER_100G[fabric]*Math.max(0,Math.min(1,wet));

export const DECADE_SOURCES:readonly {title:string;url:string}[]=[
 {title:'Wikipedia · Kit (association football)',url:'https://en.wikipedia.org/wiki/Kit_(association_football)'},
 {title:'Wikipedia · Squad number (association football)',url:'https://en.wikipedia.org/wiki/Squad_number_(association_football)'},
 {title:'Compound Interest · The chemistry of a football shirt',url:'https://www.compoundchem.com/2022/12/15/football-shirt-2022/'},
 {title:'Historical Football Kits · The miracle of polyester, 1980–1989',url:'https://historicalkits.co.uk/Articles/History/part-8.html'},
];
