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
/** Every book with its own web page. Add one import + one entry per built book (catalog order is kept by lib/site/books.ts). */
export const BOOK_PAGES:Partial<Record<PlayerBookId,BookPageSpec>>={messi,falcao,marta,ronaldinho,pele,ronaldo,garrincha,cafu,
 maldini,zidane,cruyff,modric,cristiano,iniesta,vardy,kane,putellas,bronze};
