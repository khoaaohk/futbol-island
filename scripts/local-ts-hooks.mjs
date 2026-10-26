// Async loader hooks for Node versions without built-in TypeScript stripping (registered by scripts/register-local-ts.mjs).
// resolve: an extensionless relative import that names a .ts file gets the extension. load: .ts is transpiled to an ES module.
import {existsSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const ts=createRequire(import.meta.url)('typescript');
export async function resolve(specifier,context,next){
 if(specifier.startsWith('.')&&context.parentURL){const u=new URL(specifier,context.parentURL);if(!/\.[a-z]+$/i.test(u.pathname)&&existsSync(new URL(u.href+'.ts')))return next(u.href+'.ts',context);}
 return next(specifier,context);
}
export async function load(url,context,next){
 if(!url.startsWith('file:')||!url.endsWith('.ts'))return next(url,context);
 const source=ts.transpileModule(readFileSync(fileURLToPath(url),'utf8'),{fileName:fileURLToPath(url),compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,verbatimModuleSyntax:false,isolatedModules:true}}).outputText;
 return {format:'module',source,shortCircuit:true};
}
