const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const esbuild = require('esbuild');
const code = esbuild.transformSync(fs.readFileSync(path.join(__dirname, '../services/home.ts'), 'utf8'), { loader: 'ts', format: 'cjs' }).code;
const mod = { exports: {} };
let token = 'test-token', reply;
const calls = [];
class ApiError extends Error { constructor(message, status) { super(message); this.status = status; } }
new Function('exports', 'module', 'require', code)(mod.exports, mod, () => ({
  ApiError, getAccessToken: () => token,
  apiRequest: async (url, options) => { calls.push({ url, options }); return reply; },
}));
const api = mod.exports;
(async () => {
  reply = { announcements: [{ id: 1, version: 2 }] };
  await api.getHomeAnnouncements();
  assert.equal(calls.at(-1).options.auth, false);
  assert.equal(calls.at(-1).options.cache, 'no-store');
  reply = { announcements: [{ id: 1 }] };
  await assert.rejects(api.getHomeAnnouncements(), e => e.status === 502);
  reply = { should_popup: true, announcement_id: 1, version: 2 };
  assert.equal((await api.getAnnouncementPopupStatus()).version, 2);
  assert.equal(calls.at(-1).url, '/v1/announcements/popup-status');
  assert.notEqual(calls.at(-1).options.auth, false);
  reply = { should_popup: false, announcement_id: null, version: null };
  assert.equal((await api.getAnnouncementPopupStatus()).should_popup, false);
  reply = { should_popup: true, check_date: '2026-11-20' };
  await assert.rejects(api.getAnnouncementPopupStatus(), e => e.status === 502);
  reply = { success: true, announcement_id: 1, version: 2, read_at: '2026-11-20T12:00:00+08:00' };
  await api.recordAnnouncementRead({ announcement_id: 1, version: 2 });
  assert.deepEqual(JSON.parse(calls.at(-1).options.body), { announcement_id: 1, version: 2 });
  assert.equal(calls.at(-1).options.method, 'POST');
  assert.notEqual(calls.at(-1).options.auth, false);
  reply = { success: true, announcement_id: 1, version: 3 };
  await assert.rejects(api.recordAnnouncementRead({ announcement_id: 1, version: 2 }), e => e.status === 502);
  await assert.rejects(api.recordAnnouncementRead({ announcement_id: 1, version: 0 }), e => e.status === 422);
  token = null;
  const count = calls.length;
  await assert.rejects(api.getAnnouncementPopupStatus(), e => e.status === 401);
  await assert.rejects(api.recordAnnouncementRead({ announcement_id: 1, version: 2 }), e => e.status === 401);
  assert.equal(calls.length, count, 'guests never send authenticated API calls');
  console.log('PASS: versioned API contract, exact read payload, response identity, auth requirements, invalid schema rejection');
})().catch(error => { console.error(error); process.exitCode = 1; });
