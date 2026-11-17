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
/** Every book with its own web page. Add one import + one entry per built book (catalog order is kept by lib/site/books.ts). */
export const BOOK_PAGES:Partial<Record<PlayerBookId,BookPageSpec>>={messi,falcao,marta,ronaldinho,pele,ronaldo,garrincha,cafu};
