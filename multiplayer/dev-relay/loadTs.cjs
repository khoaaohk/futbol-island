// Loads a TypeScript module (and its relative TS imports) via ts.transpileModule, like tests/*.cjs do.
// Used by the dev relay, the bots and tests/mp-room-core.cjs. Node built-ins and bare packages go through require.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const cache = new Map();

function resolveTs(base) {
  const cands = [base, base + '.ts', path.join(base, 'index.ts')];
  for (const c of cands) if (c.endsWith('.ts') && fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  throw new Error('loadTs: cannot resolve ' + base);
}

function loadTs(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file).exports;
  const m = { exports: {} };
  cache.set(file, m);
  const out = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const req = (id) => (id.startsWith('.') ? loadTs(resolveTs(path.resolve(path.dirname(file), id))) : require(id));
  vm.runInThisContext('(function(module,exports,require){' + out + '\n})', { filename: file })(m, m.exports, req);
  return m.exports;
}

module.exports = { loadTs };
