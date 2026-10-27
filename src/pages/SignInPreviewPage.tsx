import { useState } from "react";
import SignInOverlay from "../features/xiaoYiSignIn/SignInOverlay";
import DrawCardOverlay, { type DrawCardStage } from "../features/xiaoYiSignIn/DrawCardOverlay";

function SignInPreviewPage() {
  const [open, setOpen] = useState(false);
  const [drawOpen, setDrawOpen] = useState(false);
  const [stage, setStage] = useState<DrawCardStage>("waiting");

  return (
    <main className="xiao-yi-sign-in-preview">
      <h1 className="xiao-yi-sign-in-preview__title">萧逸家签到开发预览</h1>
      <p>签到功能与抽卡静态构图的独立开发预览。</p>
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
      <DrawCardOverlay open={drawOpen} stage={stage}>
        <div className="sign-in-dev-controls">
          <span>DEV静态预览</span>
          <select aria-label="抽卡静态状态" value={stage} onChange={(event) => setStage(event.target.value as DrawCardStage)}>
            <option value="waiting">待抽</option>
            <option value="drawn">抽出</option>
            <option value="settled">轻落稳定</option>
          </select>
          <button type="button" onClick={() => setDrawOpen(false)}>关闭静态预览</button>
        </div>
      </DrawCardOverlay>
    </main>
  );
}

export default SignInPreviewPage;
