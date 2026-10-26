import { useState } from "react";
import SignInOverlay from "../features/xiaoYiSignIn/SignInOverlay";

function SignInPreviewPage() {
  const [open, setOpen] = useState(false);

  return (
    <main className="xiao-yi-sign-in-preview">
      <h1 className="xiao-yi-sign-in-preview__title">萧逸家签到开发预览</h1>
      <p>此页面用于验证签到弹层的打开、关闭与键盘操作。</p>
      <button
        type="button"
        className="xiao-yi-sign-in-button"
        onClick={() => setOpen(true)}
      >
        打开签到
      </button>
      <SignInOverlay open={open} onClose={() => setOpen(false)} />
    </main>
  );
}

export default SignInPreviewPage;
