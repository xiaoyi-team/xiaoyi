import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ArchivePage from "./candy/ArchivePage";
import { configureCandyApi } from "./candy/candy-runtime";
import { getAccessToken, clearAuthToken, AUTH_UNAUTHORIZED_EVENT } from "../api/client";
import { buildLoginPath } from "../auth/navigation";
import { useAuth } from "../auth/AuthContext";

configureCandyApi({ getToken: getAccessToken, baseUrl: "/api" });

export default function CandyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLogin, isLoading } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (showLoginPrompt && !isLogin && !dialog.current?.open) dialog.current?.showModal();
    else if ((!showLoginPrompt || isLogin) && dialog.current?.open) dialog.current.close();
  }, [showLoginPrompt, isLogin]);

  function canEdit() {
    if (isLoading) return false;
    if (isLogin) return true;
    setShowLoginPrompt(true);
    return false;
  }

  function sessionExpired() {
    if (getAccessToken()) {
      clearAuthToken();
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }
    setShowLoginPrompt(true);
  }

  const params = new URLSearchParams(location.search);
  function goLogin() {
    params.set("archive", "1");
    navigate(buildLoginPath({ pathname: location.pathname, search: `?${params}`, hash: location.hash }));
  }

  return <div className="garage-candy">
    <ArchivePage initialOpen={params.get("archive") === "1"} onBack={() => navigate("/home")} canEdit={canEdit} onLoginRequired={sessionExpired} />
    <dialog ref={dialog} onClose={() => setShowLoginPrompt(false)} aria-labelledby="candy-login-title" className="m-auto w-[min(90vw,420px)] rounded-xl border border-[#b99b65] bg-[#f6ead5] p-6 text-[#161811] backdrop:bg-black/60">
      <h2 id="candy-login-title" className="text-xl font-semibold">请先登录</h2>
      <p className="my-4">登录后可修改数量和购入价格，也可以收藏和保存记录。</p>
      <div className="flex justify-end gap-3">
        <button type="button" autoFocus onClick={() => setShowLoginPrompt(false)} className="rounded border border-[#b99b65] px-4 py-2">取消</button>
        <button type="button" onClick={goLogin} className="rounded bg-[#263957] px-4 py-2 text-white">去登录</button>
      </div>
    </dialog>
  </div>;
}
