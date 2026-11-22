## API 路由契约

`api-routes.json` 记录同源 API 入口的路径匹配、上游服务标识和重写方式。
优先级数字越小越先匹配。 `prefix` 的 `:path*` 从路径段边界匹配，
`template` 的 `:id` 匹配一个非空路径段。查询字符串不参与分流，转发时保留。
`gateway` 保留 `/api`，`core` 只移除开头的一层 `/api`。

`npm run check:api-routes` 加载实际 Vite 配置，读取 Vercel rewrites，并运行同一组路径用例。
脚本校验当前支持的规则形式和顺序。上游地址与服务标识的对应关系位于校验脚本，
更换部署地址时同步更新。校验器不启动服务器或请求上游，也不模拟 Vercel 的完整平台行为。
使用其他匹配形式时，应同步更新校验器及其用例。

`node --test scripts/check-api-routes.test.mjs` 验证校验器能接受符合契约的配置，
并报告错误优先级、未登记路由、路径或查询参数变化。

### 当前代理规则

- 公告、权益记录、每日语录 `/api/v1/daily-quotes/by-date` 和投票使用 `gateway`，
  转发时保留完整的 `/api` 路径。
- 投票仅匹配 `/api/v1/votes` 和 `/api/v1/votes/:id/submit`，其中 `:id` 只占一个路径段。
- 专用规则先于 `/api/:path*` 通用规则。其余 `/api` 请求走 `core`，只移除开头一层
  `/api`。类似 `/apiary` 的路径不会进入 API 代理。
- Vite 的上游代理规则必须显式设置 `changeOrigin: true`。Vercel 在所有 API 规则之后
  保留指向 `/index.html` 的 SPA 回退。

当前 `npm run check:api-routes` 预期对路由契约、Vite 和 Vercel 各通过 31 个路径用例，
报告 0 个配置问题并以 0 退出。发现配置或路径差异时会以非零状态退出。
