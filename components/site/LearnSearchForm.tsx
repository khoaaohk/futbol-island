import site from '@/app/(site)/site.module.css';
import fx from './siteForms.module.css';
/** A plain search form to /learn?q= (seo-extras, Nov 15 2026): no JavaScript, for index pages. The search page does the rest. */
export default function LearnSearchForm(){
 return <form role="search" action="/learn" method="get" className={fx.searchFormCentred}>
  <label htmlFor="learn-search-q" className={`${site.caption} ${fx.srOnly}`}>Search the guides</label>
  <input id="learn-search-q" name="q" type="search" required placeholder="Search the guides: offside, rondo, 4-3-3" enterKeyHint="search"
   className={fx.searchInput}/>
 </form>;
}
