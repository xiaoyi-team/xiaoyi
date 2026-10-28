import { useState } from "react";
import atticBackground from "../assets/xiao-yi-scene/attic-background.png";
import GuestLoginPrompt from "../features/xiaoYiGuestLogin/GuestLoginPrompt";

function GuestLoginPreviewPage() {
  const [open, setOpen] = useState(false);
  const [loginCalls, setLoginCalls] = useState(0);

  return (
    <main className="guest-login-preview">
      <img className="guest-login-preview__background" src={atticBackground} alt="" />
      <section className="guest-login-preview__controls" aria-label="DEV游客提示预览控制器">
        <h1>DEV · 游客登录引导预览</h1>
        <p>独立弹窗预览，不模拟认证。“去登录”仅记录回调，弹窗保持打开。</p>
        <button type="button" className="guest-login-preview__open" onClick={() => setOpen(true)}>
          打开游客登录提示
        </button>
        <p role="status">弹窗：{open ? "已打开" : "已关闭"}；onLogin回调次数：{loginCalls}</p>
      </section>
      <GuestLoginPrompt
        open={open}
        onClose={() => setOpen(false)}
        onLogin={() => setLoginCalls((previous) => previous + 1)}
      />
    </main>
  );
}

export default GuestLoginPreviewPage;
