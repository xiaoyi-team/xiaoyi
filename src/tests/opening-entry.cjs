const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const esbuild = require('esbuild');
const source = fs.readFileSync(path.join(__dirname, '../features/opening/entryPolicy.ts'), 'utf8');
const moduleValue = { exports: {} };
vm.runInNewContext(esbuild.transformSync(source, { loader: 'ts', format: 'cjs' }).code,
  { module: moduleValue, exports: moduleValue.exports, URL });
const { shouldShowOpening } = moduleValue.exports;
const origin = 'https://xiaoyi.example';
for (const route of ['/', '/home']) {
  assert.equal(shouldShowOpening(route, 'navigate', '', origin), true, 'direct arrival');
  assert.equal(shouldShowOpening(route, 'navigate', 'https://search.example/results', origin), true, 'external arrival');
  assert.equal(shouldShowOpening(route, 'reload', '', origin), false, 'refresh skips');
  assert.equal(shouldShowOpening(route, 'back_forward', '', origin), false, 'history skips');
  assert.equal(shouldShowOpening(route, 'navigate', origin + '/xiaoyi', origin), false, 'same-site arrival skips');
}
assert.equal(shouldShowOpening('/login', 'navigate', '', origin), false, 'login deep link remains available');
assert.equal(shouldShowOpening('/xiaoyi', 'navigate', '', origin), false, 'scene deep link remains available');
console.log('PASS: opening direct/external arrivals, reload/history/same-site skips, deep links');
