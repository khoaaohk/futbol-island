import type {PlayerBookId} from '@/lib/books/catalog';
import {ES_BOOK_IDS} from '../esPaths';
import baggio from './books/baggio.json';
import bale from './books/bale.json';
import bronze from './books/bronze.json';
import buffon from './books/buffon.json';
import cafu from './books/cafu.json';
import caicedo from './books/caicedo.json';
import cech from './books/cech.json';
import cristiano from './books/cristiano.json';
import cruyff from './books/cruyff.json';
import davies from './books/davies.json';
import debruyne from './books/debruyne.json';
import drogba from './books/drogba.json';
import dzeko from './books/dzeko.json';
import earps from './books/earps.json';
import eriksen from './books/eriksen.json';
import eusebio from './books/eusebio.json';
import falcao from './books/falcao.json';
import formiga from './books/formiga.json';
import garrincha from './books/garrincha.json';
import griezmann from './books/griezmann.json';
import hamm from './books/hamm.json';
import hegerberg from './books/hegerberg.json';
import howard from './books/howard.json';
import ibrahimovic from './books/ibrahimovic.json';
import iniesta from './books/iniesta.json';
import kane from './books/kane.json';
import kante from './books/kante.json';
import kerr from './books/kerr.json';
import lukaku from './books/lukaku.json';
import mahrez from './books/mahrez.json';
import maldini from './books/maldini.json';
import mane from './books/mane.json';
import marta from './books/marta.json';
import messi from './books/messi.json';
import milla from './books/milla.json';
import modric from './books/modric.json';
import morgan from './books/morgan.json';
import nadim from './books/nadim.json';
import oshoala from './books/oshoala.json';
import pele from './books/pele.json';
import putellas from './books/putellas.json';
import rashford from './books/rashford.json';
import renard from './books/renard.json';
import ronaldinho from './books/ronaldinho.json';
import ronaldo from './books/ronaldo.json';
import saka from './books/saka.json';
import salah from './books/salah.json';
import sawa from './books/sawa.json';
import sinclair from './books/sinclair.json';
import son from './books/son.json';
import vandijk from './books/vandijk.json';
import vardy from './books/vardy.json';
import vinicius from './books/vinicius.json';
import weah from './books/weah.json';
import wright from './books/wright.json';
import zidane from './books/zidane.json';
/**
 * The Spanish pop-up book pages (/es/books, /es/books/<id>; Spanish round E, Nov 22 2026). One JSON file per book in
 * lib/i18n/es/books/, 1:1 with the English page data (lib/site/books.ts SiteBook + lib/site/bookPages/<id>.ts): the Spanish
 * subtitle, summary, meta description, fact tiles, FAQ and every chapter (year, title, story paragraphs, lesson), same order
 * and lengths (tests/es-pages.cjs). No new facts: each file is a translation of the English one. The book itself (the 3D pop-up
 * reader and Coach Bella's narration) is in English; the pages say so.
 */
export type BookEs={id:string;title:string;subtitle:string;player:string;country:string;summary:string;description:string;
 facts:{label:string;value:string}[];faq:{q:string;a:string}[];chapters:{year:string;title:string;paragraphs:string[];lesson:string}[]};
const BOOKS_ES:Readonly<Record<string,BookEs>>={baggio,bale,bronze,buffon,cafu,caicedo,cech,cristiano,cruyff,davies,debruyne,drogba,dzeko,earps,eriksen,eusebio,falcao,formiga,garrincha,griezmann,hamm,hegerberg,howard,ibrahimovic,iniesta,kane,kante,kerr,lukaku,mahrez,maldini,mane,marta,messi,milla,modric,morgan,nadim,oshoala,pele,putellas,rashford,renard,ronaldinho,ronaldo,saka,salah,sawa,sinclair,son,vandijk,vardy,vinicius,weah,wright,zidane} as unknown as Record<string,BookEs>;
/** A book's Spanish words (null for a book with no Spanish page). */
export const esBook=(id:string):BookEs|null=>(ES_BOOK_IDS as readonly string[]).includes(id)?BOOKS_ES[id]??null:null;
export type {PlayerBookId};
