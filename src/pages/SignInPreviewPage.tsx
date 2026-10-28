import { useState } from "react";
import SignInOverlay from "../features/xiaoYiSignIn/SignInOverlay";
import DrawCardOverlay, { type DrawCardStage } from "../features/xiaoYiSignIn/DrawCardOverlay";

function SignInPreviewPage() {
  const [open, setOpen] = useState(false);
  const [drawOpen, setDrawOpen] = useState(false);
  const [mode, setMode] = useState<DrawCardStage | "auto">("waiting");

  return (
    <main className="xiao-yi-sign-in-preview">
      <h1 className="xiao-yi-sign-in-preview__title">萧逸家签到开发预览</h1>
      <p>签到功能、抽卡静态构图与自动动画的独立开发预览。</p>
      <button
        type="button"
        className="xiao-yi-sign-in-button"
        onClick={() => setOpen(true)}
      >
        打开签到
      </button>
      <button type="button" className="xiao-yi-sign-in-button" onClick={() => setDrawOpen(true)}>
        预览抽卡
      </button>
      <SignInOverlay open={open} onClose={() => setOpen(false)}>
        <div className="sign-in-dev-controls" onClick={(event) => event.stopPropagation()}>
          <span>DEV</span>
          <button type="button" onClick={() => setDrawOpen(true)}>预览抽卡</button>
        </div>
      </SignInOverlay>
      <DrawCardOverlay open={drawOpen} stage={mode === "auto" ? "waiting" : mode} autoPlay={mode === "auto"}>
        <div className="sign-in-dev-controls">
          <span>DEV抽卡预览</span>
          <select aria-label="抽卡预览模式" value={mode} onChange={(event) => setMode(event.target.value as DrawCardStage | "auto")}>
            <option value="waiting">待抽</option>
            <option value="drawn">抽出</option>
            <option value="settled">轻落稳定</option>
            <option value="auto">自动播放</option>
          </select>
          <button type="button" onClick={() => setDrawOpen(false)}>关闭抽卡预览</button>
        </div>
      </DrawCardOverlay>
    </main>
  );
}

export default SignInPreviewPage;
