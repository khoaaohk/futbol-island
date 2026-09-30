/** Lightweight ownership mapping; story text and artwork load only when a reader opens.
 * `machine` is the vending machine whose book display sells it; null = not sold (a free starter book). */
export const PLAYER_BOOKS = {
 island: { itemId: 'starter:island-book', title: 'Futbol Island: Learn the beautiful game', player: 'Futbol Island', machine: null },
 // Original eight (legacy item ids keep existing purchases valid).
 messi: { itemId: 'display:plaza:book', title: 'Messi: Keep going, together', player: 'Lionel Messi', machine: 'plaza' },
 falcao: { itemId: 'display:rooftop:book', title: 'Falcão: Closed doors and coming back', player: 'Falcão', machine: 'rooftop' },
 marta: { itemId: 'display:oldtown:book', title: 'Marta: A place to belong', player: 'Marta', machine: 'oldtown' },
 maldini: { itemId: 'display:clubgrounds:book', title: 'Maldini: Calm through the storms', player: 'Paolo Maldini', machine: 'clubgrounds' },
 zidane: { itemId: 'display:eleven:book', title: 'Zidane: Two homes, one story', player: 'Zinedine Zidane', machine: 'eleven' },
 ronaldinho: { itemId: 'display:beach:book', title: 'Ronaldinho: Joy after sadness', player: 'Ronaldinho', machine: 'beach' },
 pele: { itemId: 'display:pier:book', title: 'Pelé: Making the most of what you have', player: 'Pelé', machine: 'pier' },
 cruyff: { itemId: 'display:market:book', title: 'Cruyff: Making space for others', player: 'Johan Cruyff', machine: 'market' },
 // Hardship stories, three more per machine (ready once their story, spreads and narration exist).
 modric: { itemId: 'display:plaza:book:modric', title: 'Modrić: From refugee to Ballon d’Or', player: 'Luka Modrić', machine: 'plaza' },
 cristiano: { itemId: 'display:plaza:book:cristiano', title: 'Cristiano Ronaldo: A long way from home', player: 'Cristiano Ronaldo', machine: 'plaza' },
 iniesta: { itemId: 'display:plaza:book:iniesta', title: 'Iniesta: It’s okay to ask for help', player: 'Andrés Iniesta', machine: 'plaza' },
 vardy: { itemId: 'display:rooftop:book:vardy', title: 'Vardy: Too small? Not for ever', player: 'Jamie Vardy', machine: 'rooftop' },
 salah: { itemId: 'display:rooftop:book:salah', title: 'Salah: The long journey to training', player: 'Mohamed Salah', machine: 'rooftop' },
 kane: { itemId: 'display:rooftop:book:kane', title: 'Kane: Released, then ready', player: 'Harry Kane', machine: 'rooftop' },
 putellas: { itemId: 'display:oldtown:book:putellas', title: 'Putellas: For my father', player: 'Alexia Putellas', machine: 'oldtown' },
 bronze: { itemId: 'display:oldtown:book:bronze', title: 'Bronze: Brave enough to start again', player: 'Lucy Bronze', machine: 'oldtown' },
 kerr: { itemId: 'display:oldtown:book:kerr', title: 'Kerr: Back from the big injury', player: 'Sam Kerr', machine: 'oldtown' },
 buffon: { itemId: 'display:clubgrounds:book:buffon', title: 'Buffon: Strong enough to talk', player: 'Gianluigi Buffon', machine: 'clubgrounds' },
 eriksen: { itemId: 'display:clubgrounds:book:eriksen', title: 'Eriksen: A team around you', player: 'Christian Eriksen', machine: 'clubgrounds' },
 debruyne: { itemId: 'display:clubgrounds:book:debruyne', title: 'De Bruyne: Not wanted, not finished', player: 'Kevin De Bruyne', machine: 'clubgrounds' },
 ibrahimovic: { itemId: 'display:eleven:book:ibrahimovic', title: 'Ibrahimović: Different is strong', player: 'Zlatan Ibrahimović', machine: 'eleven' },
 lukaku: { itemId: 'display:eleven:book:lukaku', title: 'Lukaku: A promise to my mother', player: 'Romelu Lukaku', machine: 'eleven' },
 rashford: { itemId: 'display:eleven:book:rashford', title: 'Rashford: Remember where you came from', player: 'Marcus Rashford', machine: 'eleven' },
 ronaldo: { itemId: 'display:beach:book:ronaldo', title: 'Ronaldo: Back from two knee injuries', player: 'Ronaldo Nazário', machine: 'beach' },
 garrincha: { itemId: 'display:beach:book:garrincha', title: 'Garrincha: Different legs, dazzling feet', player: 'Garrincha', machine: 'beach' },
 davies: { itemId: 'display:beach:book:davies', title: 'Davies: Born in a refugee camp', player: 'Alphonso Davies', machine: 'beach' },
 eusebio: { itemId: 'display:pier:book:eusebio', title: 'Eusébio: Far from home', player: 'Eusébio', machine: 'pier' },
 weah: { itemId: 'display:pier:book:weah', title: 'Weah: From Clara Town to the world', player: 'George Weah', machine: 'pier' },
 drogba: { itemId: 'display:pier:book:drogba', title: 'Drogba: A late start and a peace wish', player: 'Didier Drogba', machine: 'pier' },
 mane: { itemId: 'display:market:book:mane', title: 'Mané: Leaving the village', player: 'Sadio Mané', machine: 'market' },
 saka: { itemId: 'display:market:book:saka', title: 'Saka: After the penalty', player: 'Bukayo Saka', machine: 'market' },
 hegerberg: { itemId: 'display:market:book:hegerberg', title: 'Hegerberg: Standing up for fairness', player: 'Ada Hegerberg', machine: 'market' },
 // Sep 29 2026: four more hardship stories, one per new machine (North Beach, the causeway and two on Coral Cay).
 cafu: { itemId: 'display:northbeach:book', title: 'Cafu: Told no, again and again', player: 'Cafu', machine: 'northbeach' },
 nadim: { itemId: 'display:causeway:book', title: 'Nadim: A long road to a new home', player: 'Nadia Nadim', machine: 'causeway' },
 kante: { itemId: 'display:cayplaza:book', title: 'Kanté: Told no, and still working', player: 'N’Golo Kanté', machine: 'cayplaza' },
 oshoala: { itemId: 'display:sharks:book', title: 'Oshoala: Playing when few believed', player: 'Asisat Oshoala', machine: 'sharks' },
} as const;
export type PlayerBookId = keyof typeof PLAYER_BOOKS;
/** Books every player owns from the start (their Backpack lists them; nothing is bought). */
export const STARTER_BOOKS = ['island'] as const satisfies readonly PlayerBookId[];
/** The first (original) book sold by a machine, if any. */
export function bookForMachine(machine:string):PlayerBookId|undefined{return booksForMachine(machine)[0];}
/** Every book a machine sells, in shelf order (four per original machine, one per Sep 29 book machine). */
export function booksForMachine(machine:string):PlayerBookId[]{return (Object.keys(PLAYER_BOOKS) as PlayerBookId[]).filter(id=>PLAYER_BOOKS[id].machine!==null&&PLAYER_BOOKS[id].machine===machine);}
/** Every pop-up book costs the same. */
export const BOOK_PRICE=100;
export function readableBook(item: {id:string;storyId?:string}): PlayerBookId | null {
 const id=item.storyId;
 return id && Object.prototype.hasOwnProperty.call(PLAYER_BOOKS,id) && PLAYER_BOOKS[id as PlayerBookId].itemId===item.id ? id as PlayerBookId : null;
}
