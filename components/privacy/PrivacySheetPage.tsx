'use client';
import {BackButton} from '../BackButton';
import shell from '../ModalShell.module.css';
import title from '../landing/Title.module.css';
import PrivacyPolicy from './PrivacyPolicy';

/**
 * /privacy as a full page that looks exactly like the play page's Privacy sheet (components/landing/GrownUps.tsx): the game's modal
 * shell, the gold Back top left, the brush title, the same policy text. The one privacy page (owner, Nov 4 2026): the main page's
 * footer Privacy links here. Back returns to the page the reader came from (the main page at the same scroll spot, or the play page);
 * opened directly, it goes to /play.
 */
export default function PrivacySheetPage(){
 const back=()=>{
  let same=false;
  try{same=!!document.referrer&&new URL(document.referrer).origin===location.origin&&history.length>1;}catch{}
  if(same)history.back();else location.assign('/play');
 };
 return <main style={{minHeight:'100dvh',background:'#f7f0db'}}>
  <section className={`${shell.shell} ${shell.drawer} ${title.grownSheet}`} aria-labelledby="privacy-title" style={{maxHeight:'none',minHeight:'100dvh',height:'auto'}}>
   <header className={`${shell.header} ${title.grownHeader}`}><BackButton onBack={back}/><h1 id="privacy-title" style={{margin:0,textAlign:'center',color:'#244d40',font:'400 clamp(26px,3.4vw,40px)/1 IslandBrush,var(--btn-font)',paddingTop:'.02em'}}>Privacy policy</h1><span aria-hidden="true"/></header>
   <div className={`${shell.body} ${title.grownBody}`} style={{overflow:'visible'}}><div className={title.grownInner}><PrivacyPolicy/></div></div>
  </section>
 </main>;
}
