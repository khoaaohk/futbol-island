import type {MetadataRoute} from 'next';
/**
 * /manifest.webmanifest (SEO audit, Nov 8 2026: a phone-first game had no web manifest). Icons are the existing app/icon.png
 * (512), app/apple-icon.png (180) and app/icon.svg; colours are the reading pages' ink and paper (app/(site)/site.module.css).
 * "Add to Home Screen" opens the game at /play.
 */
export const dynamic='force-static';
export default function manifest():MetadataRoute.Manifest{
 return {name:'Futbol Island',short_name:'Futbol Island',
  description:'Futbol Island is a free football (soccer) learning game for kids aged 7 to 12: short lessons and quizzes on an island.',
  id:'/play',start_url:'/play',scope:'/',display:'standalone',lang:'en',
  theme_color:'#244d40',background_color:'#fff8e7',categories:['education','games','kids','sports'],
  icons:[{src:'/icon.png',sizes:'512x512',type:'image/png',purpose:'any'},{src:'/apple-icon.png',sizes:'180x180',type:'image/png'},{src:'/icon.svg',sizes:'any',type:'image/svg+xml'}]};
}
