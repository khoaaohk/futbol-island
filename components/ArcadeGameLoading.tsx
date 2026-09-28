import {arcadeCabinets,type ArcadeCabinetId} from '@/lib/arcade/arcadeCatalog';
import styles from './ArcadeLoading.module.css';

/** Shared lightweight fallback while a machine's game bundle arrives. */
export default function ArcadeGameLoading({game}:{game:ArcadeCabinetId}){
 const name=arcadeCabinets.find(c=>c.id===game)!.name;
 return <div className={styles.screen} data-arcade-game-loading={game} role="status" aria-label={`Loading ${name}`}>
  <div className={`${styles.copy} ${styles.gameCopy}`}>
   <h2>{name}</h2>
   <span className="island-loading-track" aria-hidden="true"><span/></span>
  </div>
 </div>;
}
