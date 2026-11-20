const esbuild = require('esbuild');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const code = esbuild.transformSync(fs.readFileSync(path.join(__dirname, '../pages/candy/candy-api.ts'), 'utf8'), {
  loader: 'ts', format: 'cjs', target: 'es2020',
}).code;
const mod = { exports: {} };
new Function('exports', 'module', code)(mod.exports, mod);
(async () => {
  const calls = [];
  let response = { list: [], total: 0, page: 2, size: 16, pages: 3 };
  let status = 200;
  global.fetch = async (url, init) => { calls.push({ url, init }); return new Response(JSON.stringify(response), { status }); };
  const config = { baseUrl: '/api', getToken: () => 'test-token', updateOwnPath: '/candy/goods/updateown' };
  const api = mod.exports.createCandyApi(config);
  await api.list({ keyword: '困兽', category: '徽章', sort: 'collect_first', filter_mode: 'collected', page: 2 });
  const query = new URL(calls[0].url, 'http://localhost').searchParams;
  assert.equal(query.get('keyword'), '困兽'); assert.equal(query.get('page'), '2'); assert.equal(query.get('sort'), 'collect_first'); assert.equal(query.get('filter_mode'), 'collected');
  assert.equal(calls[0].init.headers.get('Authorization'), 'Bearer test-token');
  response = { code: 200, msg: 'ok' };
  await api.updateOwn({ goods_id: 12, own_status: 1, count: 3, total_value: 120 });
  assert.deepEqual(JSON.parse(calls[1].init.body), { goods_id: 12, own_status: 1, count: 3, total_value: 120 });
  assert.equal(calls[1].init.method, 'POST');
  assert.throws(() => api.updateOwn({ goods_id: 12, own_status: 2, count: 3, total_value: 120 }));
  await api.toggleCollect(12);
  assert.equal(calls.at(-1).url, '/api/candy/collect?goods_id=12');
  assert.equal(calls.at(-1).init.method, 'POST');
  assert.equal(calls.at(-1).init.body, undefined);
  await api.toggleCollect(12);
  assert.equal(calls.at(-1).url, '/api/candy/collect?goods_id=12');
  assert.throws(() => api.toggleCollect(0));
  assert.throws(() => api.updateOwn({ goods_id: 12, own_status: 1, count: -1, total_value: 0 }));
  assert.throws(() => api.updateOwn({ goods_id: 12, own_status: 1, count: 1, total_value: 1.5 }));
  config.baseUrl = '/changed'; await api.detail(12); assert.equal(calls.at(-1).url, '/changed/candy/goods/12');
  status = 401; response = { detail: '登录失效' }; await assert.rejects(() => api.detail(12), /登录失效/);
  status = 200; response = { code: 403, msg: '无权限' }; await assert.rejects(() => api.updateOwn({ goods_id: 12, own_status: 0, count: 0, total_value: 0 }), /无权限/);
  config.getToken = () => null;
  response = { list: [], total: 0, page: 1, size: 16, pages: 0 };
  await api.list(); assert.equal(calls.at(-1).init.headers.has('Authorization'), false);
  response = { id: 12, own_status: 0, count: 0, total_value: 0 };
  assert.equal((await api.detail(12)).own_status, 0);
  assert.equal(calls.at(-1).init.headers.has('Authorization'), false);
  const count = calls.length;
  await assert.rejects(() => api.myOwn(), /请先登录/);
  await assert.rejects(() => api.updateOwn({ goods_id: 12, own_status: 1, count: 1, total_value: 0 }), /请先登录/);
  await assert.rejects(() => api.toggleCollect(12), /请先登录/);
  assert.equal(calls.length, count);
  const hookModule = { exports: {} };
  const state = [];
  const changes = [];
  let failCollect = false;
  const hookCode = esbuild.transformSync(fs.readFileSync(path.join(__dirname, '../pages/candy/useCandyArchive.ts'), 'utf8'), { loader: 'ts', format: 'cjs' }).code;
  new Function('exports', 'module', 'require', hookCode)(hookModule.exports, hookModule, name => {
    if (name === 'react') return {
      useState(initial) { const index = state.length; state.push(initial); return [initial, value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }]; },
      useRef: current => ({ current }), useEffect() {},
    };
    if (name === './candy-api') return mod.exports;
    if (name === './candy-runtime') return { candyApi: {
      async toggleCollect(id) { changes.push(['collect', id]); if (failCollect) throw new Error('收藏失败'); },
      async updateOwn(input) { changes.push(['own', input]); },
    } };
    throw new Error(`Unexpected dependency: ${name}`);
  });
  const goods = { id: 12, goods_name: '徽章', category: '徽章', cover_img: { img_url: '/test.png' }, count: 3, total_value: 120 };
  for (const own_status of [0, 1]) for (const is_collect of [false, true]) {
    const item = hookModule.exports.mapGoods({ ...goods, own_status, is_collect });
    assert.equal(item.owned, own_status === 1);
    assert.equal(item.favorite, is_collect);
  }
  assert.equal(hookModule.exports.mapGoods({ ...goods, own_status: 2, is_collect: false }).favorite, false);
  const initial = hookModule.exports.mapGoods({ ...goods, own_status: 1, is_collect: false });
  const hook = hookModule.exports.useCandyArchive({ open: false, category: '', query: '', status: '全部', sort: '' }, [initial]);
  await hook.toggleFavorite(initial);
  assert.equal(state[0][0].favorite, true);
  assert.equal(state[0][0].owned, true);
  assert.equal(state[0][0].quantity, 3);
  assert.equal(changes.length, 1, 'collection must not call updateOwn');
  await hook.save({ ...initial, owned: false, quantity: 0, price: '0' });
  assert.equal(state[0][0].favorite, true, 'saving ownership must preserve latest favorite, even with stale editor props');
  assert.equal(state[0][0].owned, false);
  assert.equal(changes[1][1].own_status, 0);
  assert.equal('is_collect' in changes[1][1], false);
  await hook.toggleFavorite(state[0][0]);
  assert.equal(state[0][0].favorite, false);
  assert.equal(state[0][0].owned, false);
  failCollect = true;
  await assert.rejects(() => hook.toggleFavorite(state[0][0]), /收藏失败/);
  assert.equal(state[0][0].favorite, false, 'failed collection must not change local state');
  console.log('PASS: query mapping, pagination, authentication, update payload, integer validation, runtime config, HTTP/business errors, no unauthenticated request');
  console.log('PASS: independent owned/collected combinations, collection toggle endpoint, ownership preservation, stale editor save, failed toggle rollback');
})().catch(error => { console.error(error); process.exitCode = 1; });
