'use client';
import {arcadeCabinets,type ArcadeCabinetId} from '@/lib/arcade/arcadeCatalog';
import {NavigationButton} from './DoneButton';
import styles from './ArcadeLoading.module.css';

/**
 * Shared lightweight fallback while a machine's game bundle arrives. It carries the app's Back (QA, Oct 10 2026): a slow or
 * failed bundle (ChunkLoadError) must never leave a kid stuck here. Back reloads the arcade room itself (a full navigation, so a
 * broken chunk is fetched fresh next time), the same place the game's own Back returns to.
 */
export default function ArcadeGameLoading({game}:{game:ArcadeCabinetId}){
 const name=arcadeCabinets.find(c=>c.id===game)!.name;
 return <div className={styles.screen} data-arcade-game-loading={game}>
  <div className={styles.gameBack}><NavigationButton back label="Back" data-arcade-loading-back onNavigate={()=>window.location.assign('/arcade')}/></div>
  <div className={`${styles.copy} ${styles.gameCopy}`} role="status" aria-label={`Loading ${name}`}>
   <h2>{name}</h2>
   <span className="island-loading-track" aria-hidden="true"><span/></span>
  </div>
 </div>;
}
