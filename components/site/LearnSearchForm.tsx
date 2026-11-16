import site from '@/app/(site)/site.module.css';
/** A plain search form to /learn?q= (seo-extras, Nov 15 2026): no JavaScript, for index pages. The search page does the rest. */
export default function LearnSearchForm(){
 return <form role="search" action="/learn" method="get" style={{display:'flex',flexWrap:'wrap',gap:8,justifyContent:'center',width:'100%',maxWidth:520}}>
  <label htmlFor="learn-search-q" className={site.caption} style={{position:'absolute',width:1,height:1,overflow:'hidden',clip:'rect(0 0 0 0)'}}>Search the guides</label>
  <input id="learn-search-q" name="q" type="search" required placeholder="Search the guides: offside, rondo, 4-3-3" enterKeyHint="search"
   style={{flex:'1 1 220px',minWidth:0,minHeight:48,padding:'0 16px',borderRadius:24,border:'1px solid var(--rule)',background:'var(--surface)',color:'var(--ink)',font:'17px var(--sans)',boxSizing:'border-box'}}/>
 </form>;
}
