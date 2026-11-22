import type {PlayerBookId} from '@/lib/books/catalog';
import type {BookPageSpec} from './types';
import messi from './messi';
import falcao from './falcao';
import marta from './marta';
import ronaldinho from './ronaldinho';
import pele from './pele';
import ronaldo from './ronaldo';
import garrincha from './garrincha';
import cafu from './cafu';
import maldini from './maldini';
import zidane from './zidane';
import cruyff from './cruyff';
import modric from './modric';
import cristiano from './cristiano';
import iniesta from './iniesta';
import vardy from './vardy';
import kane from './kane';
import putellas from './putellas';
import bronze from './bronze';
import buffon from './buffon';
import eriksen from './eriksen';
import debruyne from './debruyne';
import ibrahimovic from './ibrahimovic';
import lukaku from './lukaku';
import rashford from './rashford';
import eusebio from './eusebio';
import saka from './saka';
import hegerberg from './hegerberg';
import nadim from './nadim';
import kante from './kante';
import salah from './salah';
import weah from './weah';
import drogba from './drogba';
import mane from './mane';
import oshoala from './oshoala';
import kerr from './kerr';
import davies from './davies';
import caicedo from './caicedo';
import vinicius from './vinicius';
import son from './son';
import earps from './earps';
import griezmann from './griezmann';
import vandijk from './vandijk';
import hamm from './hamm';
import sawa from './sawa';
import cech from './cech';
import mahrez from './mahrez';
import baggio from './baggio';
import formiga from './formiga';
import milla from './milla';
/** Every book's web page (the 36 player books of Nov 17 2026, plus the Nov 21 2026 books). A new book needs one import + one entry here (catalog order is kept
 *  by lib/site/books.ts); tests/books-site.cjs fails until it has one. */
export const BOOK_PAGES:Partial<Record<PlayerBookId,BookPageSpec>>={messi,falcao,marta,ronaldinho,pele,ronaldo,garrincha,cafu,
 maldini,zidane,cruyff,modric,cristiano,iniesta,vardy,kane,putellas,bronze,
 buffon,eriksen,debruyne,ibrahimovic,lukaku,rashford,eusebio,saka,hegerberg,nadim,kante,
 salah,weah,drogba,mane,oshoala,kerr,davies,
 caicedo,vinicius,son,earps,griezmann,vandijk,hamm,sawa,cech,mahrez,baggio,formiga,milla};
