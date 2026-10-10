import type {Metadata} from 'next';
import Landing from '@/components/landing/Landing';

/**
 * The Futbol Island front page (Oct 9 2026): what the game is, Play, and an optional save code. Static (prerendered at build,
 * CDN-cached): it reads no request data. The game itself stays at `/` (and `/?from=` still rewrites to /island-return).
 */
export const dynamic='force-static';

const title='Futbol Island: explore an island, learn football';
const description='A free football game for kids. Explore the island, learn 7v7, 9v9, 11v11 and futsal through short lessons and quizzes, collect player cards, visit the World Cup ball museum and play arcade games. No sign-up, no ads.';
export const metadata:Metadata={
 title,description,
 alternates:{canonical:'/start'},
 openGraph:{title,description,url:'/start',siteName:'Futbol Island',type:'website',images:[{url:'/opengraph-image.png',width:1200,height:630,alt:'Futbol Island'}]},
 twitter:{card:'summary_large_image',title,description,images:['/opengraph-image.png']},
};

export default function StartPage(){return <Landing/>;}
