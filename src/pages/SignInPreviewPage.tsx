import { useState } from "react";
import SignInOverlay from "../features/xiaoYiSignIn/SignInOverlay";
import DrawCardOverlay, { type DrawCardStage } from "../features/xiaoYiSignIn/DrawCardOverlay";
import RewardNotice, { type RewardMilestone } from "../features/xiaoYiSignIn/RewardNotice";

import { SIGN_IN_DEMO_DATE } from "../features/xiaoYiSignIn/sign-in-dates";

function SignInPreviewPage() {
  const [open, setOpen] = useState(false);
  const [drawOpen, setDrawOpen] = useState(false);
  const [collectCount, setCollectCount] = useState(0);
  const [mode, setMode] = useState<DrawCardStage | "auto">("waiting");
  const [rewardMilestone, setRewardMilestone] = useState<RewardMilestone>(30);
  const [reward, setReward] = useState<RewardMilestone | null>(null);

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
      <p role="status">DEV收录回调：{collectCount} 次</p>
      <SignInOverlay open={open} onClose={() => setOpen(false)}>
        <div className="sign-in-dev-controls" onClick={(event) => event.stopPropagation()}>
          <span>DEV · 收录回调：{collectCount} 次</span>
          <button type="button" onClick={() => setDrawOpen(true)}>预览抽卡</button>
          <select aria-label="奖励通知预览类型" value={rewardMilestone} onChange={(event) => setRewardMilestone(Number(event.target.value) as RewardMilestone)}>
            <option value={30}>30天奖励</option>
            <option value={111}>111天奖励</option>
            <option value={365}>365天奖励</option>
          </select>
          <button type="button" onClick={() => setReward(rewardMilestone)}>预览奖励通知</button>
        </div>
      </SignInOverlay>
      <DrawCardOverlay
        signInDate={SIGN_IN_DEMO_DATE}
        open={drawOpen}
        stage={mode === "auto" ? "waiting" : mode}
        autoPlay={mode === "auto"}
        onCollect={() => {
          setCollectCount((count) => count + 1);
          setDrawOpen(false);
        }}
      >
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
      {reward !== null && <RewardNotice milestone={reward} onClose={() => setReward(null)} />}
    </main>
  );
}

export default SignInPreviewPage;
