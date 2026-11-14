/**
 * Blocked browser storage (QA robust pass, Nov 14 2026). With cookies and site data blocked (Safari "Block All Cookies", Chrome
 * "Block third-party cookies" in an iframe, some school-managed devices), merely READING `window.localStorage` throws a
 * SecurityError. The game guards its own reads and writes, but dozens of modules check `typeof localStorage!=='undefined'`
 * first, and `typeof` on a throwing getter throws too: the island crashed straight to its error screen.
 *
 * This pre-paint script (app/layout.tsx, first thing in <body>, before any game chunk runs) tests both stores and, only when
 * one throws, puts an in-memory Storage in its place for this page's life. The island then plays exactly like a first visit that
 * cannot save (nothing persists across a reload), instead of not playing at all. Storage that works is never touched.
 */
export const STORAGE_FALLBACK_BOOT=`(function(){function mem(){var d=Object.create(null);var s={getItem:function(k){k=String(k);return k in d?d[k]:null},setItem:function(k,v){d[String(k)]=String(v)},removeItem:function(k){delete d[String(k)]},clear:function(){for(var k in d)delete d[k]},key:function(i){var k=Object.keys(d);return i>=0&&i<k.length?k[i]:null}};Object.defineProperty(s,'length',{get:function(){return Object.keys(d).length}});return s}['localStorage','sessionStorage'].forEach(function(n){try{var t=window[n];t.getItem('fi2-probe');return}catch(e){}try{Object.defineProperty(window,n,{configurable:true,enumerable:true,value:mem()});window.__fiMemoryStorage=true;if(n==='localStorage')window.__fiNoSave=true}catch(e){}})})();`;
