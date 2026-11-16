/**
 * Card groups that the roster data does not carry as a field (SEO hubs, Nov 15 2026, lib/site/collections.ts): which cards are
 * women players and coaches, and which won a senior FIFA World Cup (men's, women's or futsal). Names are the roster keys of
 * lib/town/positionPlayers.json; tests/seo-links.cjs checks every name is a real card, that the women list matches the cards
 * whose own text says "she"/"her", and that each World Cup winner's card text names the World Cup (Cafu is the one exception:
 * his blurb names his three finals, he won in 1994 and 2002).
 * SOURCES (checked Nov 15 2026): each card's own blurb (lib/town/playerProfiles.json), which states the win; FIFA's lists of
 * World Cup, Women's World Cup and Futsal World Cup winners for the few blurbs that say "World Cup winner" without a year.
 * A new card that belongs here must be added by hand: the test fails when a new "she"/"her" card is missing from WOMEN.
 */
export const WOMEN:readonly string[]=['Aitana Bonmatí','Alexia Putellas','Mariona Caldentey','Patri Guijarro','Lindsey Heaps','Hannah Hampton','Mary Earps',
 'Alyssa Naeher','Lucy Bronze','Wendie Renard','Leah Williamson','Mapi León','Caroline Graham Hansen','Salma Paralluelo','Trinity Rodman','Lauren James',
 'Chloe Kelly','Clàudia Pina','Sam Kerr','Alessia Russo','Ewa Pajor','Khadija Shaw','Sophia Wilson','Temwa Chawinga','Ada Hegerberg','Vivianne Miedema',
 'Pernille Harder','Marta','Barbra Banda','Asisat Oshoala','Mia Hamm','Megan Rapinoe','Abby Wambach','Birgit Prinz','Christine Sinclair','Alex Morgan',
 'Carli Lloyd','Hope Solo','Nadine Angerer','Formiga','Homare Sawa','Sun Wen','Michelle Akers','Kristine Lilly','Lieke Martens',
 'Sarina Wiegman','Emma Hayes','Pia Sundhage','Jill Ellis','Silvia Neid'];
/** Players who won the men's FIFA World Cup (the year is in each blurb). */
export const WORLD_CUP_MEN:readonly string[]=['Pelé','Garrincha','Nílton Santos','Bobby Moore','Gordon Banks','Bobby Charlton','Carlos Alberto','Franz Beckenbauer',
 'Gerd Müller','Sepp Maier','Daniel Passarella','Dino Zoff','Paolo Rossi','Diego Maradona','Lothar Matthäus','Romário','Cafu','Zinedine Zidane','Fabien Barthez',
 'Lilian Thuram','Laurent Blanc','Patrick Vieira','Thierry Henry','Ronaldo Nazário','Roberto Carlos','Rivaldo','Kaká','Lúcio','Andrea Pirlo','Fabio Cannavaro',
 'Gianluigi Buffon','Francesco Totti','Alessandro Del Piero','Filippo Inzaghi','Andrés Iniesta','Carles Puyol','Iker Casillas','Gerard Piqué','Cesc Fàbregas',
 'Manuel Neuer','Philipp Lahm','Toni Kroos','Mesut Özil','Thomas Müller','Bastian Schweinsteiger','Kylian Mbappé','Antoine Griezmann','N\'Golo Kanté',
 'Olivier Giroud','Raphaël Varane','Lionel Messi','Emiliano Martínez','Cristian Romero','Julián Álvarez','Lautaro Martínez','Enzo Fernández',
 'Alexis Mac Allister','Rodrigo De Paul','Lisandro Martínez','Ángel Di María','Marc Cucurella','Martín Zubimendi','Dani Olmo','Fabián Ruiz','Mikel Merino',
 'Mikel Oyarzabal'];
/** Players who won the FIFA Women's World Cup. */
export const WORLD_CUP_WOMEN:readonly string[]=['Michelle Akers','Mia Hamm','Kristine Lilly','Birgit Prinz','Nadine Angerer','Homare Sawa','Abby Wambach',
 'Carli Lloyd','Hope Solo','Alex Morgan','Megan Rapinoe','Lindsey Heaps','Alyssa Naeher','Aitana Bonmatí','Alexia Putellas','Mariona Caldentey','Salma Paralluelo'];
/** Players who won the FIFA Futsal World Cup. */
export const WORLD_CUP_FUTSAL:readonly string[]=['Manoel Tobias','Daniel Ibañes','Javi Rodríguez','Luis Amado','Julio García Mera','Jordi Torras','Paco Sedano',
 'Falcão','Schumacher','Tiago Marinho','Wilde','Neto','Ricardinho','André Coelho','Afonso Jesus','Pany Varela','Tomás Paçó','Pito','João Victor','Willian Dorn'];
/** Head coaches who won a World Cup as the coach. */
export const WORLD_CUP_COACHES:readonly string[]=['Vittorio Pozzo','Alf Ramsey','Mário Zagallo','Vicente del Bosque','Marcello Lippi','Lionel Scaloni',
 'Luis de la Fuente','Jill Ellis','Silvia Neid'];
