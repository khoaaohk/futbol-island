import styles from './IslandReturnLoading.module.css';
/** A document-boundary return, not the first-visit island introduction. */
export default function IslandReturnLoading({exiting=false}:{exiting?:boolean}){
 return <div className={`${styles.screen} ${exiting?styles.exiting:''}`} data-island-return-loading role="status" aria-label="Back to the island">
  <div className={styles.copy}><span className={styles.eyebrow}>PLAY · LEARN · GROW</span><h2>Futbol Island</h2><p className={styles.caption}>Your adventure continues</p><span className="island-loading-track" aria-hidden="true"><span/></span></div>
  <svg className={styles.scenery} viewBox="0 0 1200 380" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><circle cx="850" cy="155" r="70" fill="#f9d55d"/><path d="M0 220Q130 80 290 210T600 190T920 160T1200 170V380H0Z" fill="#153f43"/></svg>
  <svg className={`${styles.scenery} ${styles.land}`} data-island-return-land viewBox="0 0 1200 380" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><path d="M0 300Q160 180 350 290T730 275T1200 250V380H0Z" fill="#dfc587"/><path className={styles.shoreLine} d="M0 337Q160 217 350 327T730 312T1200 287" fill="none" stroke="#fff2d3" strokeWidth="9"/></svg>
  <svg className={styles.signpost} viewBox="-75 -85 370 530" role="img" aria-label="A signpost that says Back to Island">
   <ellipse cx="96" cy="406" rx="60" ry="10" fill="#153f43" opacity=".22"/>
   <path d="M84 14H108V404Q96 410 84 404Z" fill="#8a5a33"/><path d="M100 14H108V404L100 406Z" fill="#6b4426"/>
   <g transform="rotate(-5 12 24)">
    <path d="M-48-63H235L250-21 235 21H-48Q-57 21-57 12V-54Q-57-63-48-63Z" fill="#153f43" transform="translate(0 5)"/>
    <path d="M-48-63H235L250-21 235 21H-48Q-57 21-57 12V-54Q-57-63-48-63Z" fill="#f9d55d" stroke="#fff2d3" strokeWidth="4"/>
    <path d="M-40-51H224M-40 9H224" stroke="#dcae3e" strokeWidth="2"/>
    <text x="77" y="-33" textAnchor="middle" fill="#153f43" fontSize="17" fontWeight="800" letterSpacing="2">BACK TO</text>
    <text x="77" y="-6" textAnchor="middle" fill="#153f43" fontSize="29" fontWeight="900" letterSpacing="1">ISLAND</text>
    <path d="M171-22H213m-12-12 13 12-13 12" fill="none" stroke="#153f43" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
   </g>
  </svg>
 </div>;
}
