import type {Metadata} from 'next';
import {toEs} from '@/lib/i18n/esPaths';
import styles from '../(site)/site.module.css';
/** A Spanish page that does not exist (yet): inside the Spanish layout, noindex, three ways back. */
export const metadata:Metadata={title:'Página no encontrada | Futbol Island',robots:{index:false,follow:true}};
export default function EsNotFound(){
 return <header className={styles.intro}>
  <h1 className={styles.title}>Esta cancha está vacía</h1>
  <p className={styles.lead}>No encontramos esa página. Puede que todavía no esté en español, o que la dirección tenga un error.</p>
  <p><a className={styles.cta} href="/play">Juega gratis</a></p>
  <p className={styles.caption}><a href={toEs('/')}>Inicio en español</a> · <a href="/">English home</a></p>
 </header>;
}
