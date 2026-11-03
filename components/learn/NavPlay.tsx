'use client';
import {NavigationButton} from '../DoneButton';

/** The bar's Play: the game's own navigation button, its label folds into an arrow on press, then it goes to the game. */
export default function NavPlay({href,className}:{href:string;className?:string}){
 return <NavigationButton className={className} label="Play" icon="forward" onNavigate={()=>{window.location.assign(href);}}/>;
}
