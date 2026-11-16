import site from '@/app/(site)/site.module.css';
/**
 * /embed/* (seo-extras, Nov 15 2026): the club embeds, framed by other sites (next.config.mjs frameHeaders). Minimal chrome: no
 * site nav, no footer, no ads (there are none anywhere), no analytics (lib/embed/isEmbed.ts), one attribution link per page.
 */
export default function EmbedLayout({children}:{children:React.ReactNode}){
 return <div className={site.page} data-embed-page="">
  <style>{'html,body{background:#fbf7ee;color-scheme:light}'}</style>
  <main className={site.main} style={{paddingTop:16,paddingBottom:16,gap:16}}>{children}</main>
 </div>;
}
