import type {PlayerBookId} from '@/lib/books/catalog';
import type {BookPageSpec} from './types';
import cafu from './cafu';
/** Every book with its own web page. Add one import + one entry per built book (catalog order is kept by lib/site/books.ts). */
export const BOOK_PAGES:Partial<Record<PlayerBookId,BookPageSpec>>={cafu};
