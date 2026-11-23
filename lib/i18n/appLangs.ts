/**
 * The coach apps' languages (round 4E, Nov 22 2026; owner: "a total of ten, Japanese and Portuguese as some of them ... languages
 * that are simple and don't require major changes": no right-to-left, no complex script beyond Japanese). /coach (all its tools),
 * /scan and /board share this list, the ?lang= hand-off and the choice saved in each app's own record. The public SEO pages stay
 * English and Spanish only (no new hreflang): `siteLang` maps an app language to the site's.
 * Portuguese is Brazilian (pt-BR: "goleiro", "técnico", "campo").
 */
export const APP_LANGS=['en','es','pt','fr','de','it','nl','pl','fi','ja'] as const;
export type AppLang=typeof APP_LANGS[number];
/** each language in its own name (the Language sheet) */
export const LANG_NAMES:Readonly<Record<AppLang,string>>={en:'English',es:'Español',pt:'Português',fr:'Français',de:'Deutsch',it:'Italiano',nl:'Nederlands',pl:'Polski',fi:'Suomi',ja:'日本語'};
/** the BCP 47 tag for <html lang> and Intl dates and times */
export const LOCALE:Readonly<Record<AppLang,string>>={en:'en',es:'es',pt:'pt-BR',fr:'fr',de:'de',it:'it',nl:'nl',pl:'pl',fi:'fi',ja:'ja'};
export const isAppLang=(v:unknown):v is AppLang=>typeof v==='string'&&(APP_LANGS as readonly string[]).includes(v);
/** the phone's languages in order (navigator.languages), the first one the apps speak; English when none */
export function langFromNavigator(list:readonly (string|undefined|null)[]):AppLang{
 for(const x of list){const l=(x||'').toLowerCase().split(/[-_]/)[0];if(isAppLang(l))return l;}
 return 'en';
}
export function phoneLang():AppLang{
 try{const n=navigator;return langFromNavigator(n.languages?.length?n.languages:[n.language]);}catch{return 'en';}
}
/** the public site's language for a link out of an app: the /es pages for Spanish, else the English pages */
export const siteLang=(l:AppLang):'en'|'es'=>l==='es'?'es':'en';
/** `?lang=xx` (or `&lang=xx`) for links between the apps; nothing for English */
export const langParam=(l:AppLang,sep:'?'|'&'='?')=>l==='en'?'':`${sep}lang=${l}`;
/** the shared header's two words (components/motion/AppHeader.tsx) */
export const SHELL_WORDS:Readonly<Record<AppLang,{back:string;exit:string;lang:string}>>={
 en:{back:'Back',exit:'Exit',lang:'Language'},es:{back:'Volver',exit:'Salir',lang:'Idioma'},pt:{back:'Voltar',exit:'Sair',lang:'Idioma'},
 fr:{back:'Retour',exit:'Quitter',lang:'Langue'},de:{back:'Zurück',exit:'Beenden',lang:'Sprache'},it:{back:'Indietro',exit:'Esci',lang:'Lingua'},
 nl:{back:'Terug',exit:'Sluiten',lang:'Taal'},pl:{back:'Wróć',exit:'Wyjdź',lang:'Język'},fi:{back:'Takaisin',exit:'Poistu',lang:'Kieli'},
 ja:{back:'戻る',exit:'終了',lang:'言語'},
};
