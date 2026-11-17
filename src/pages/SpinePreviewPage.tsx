import { useEffect, useRef, useState } from "react";
import { SpinePlayer } from "@esotericsoftware/spine-player";
import "@esotericsoftware/spine-player/dist/spine-player.css";

const assetRoot = `${import.meta.env.BASE_URL}spine/xiaoyi`;

export default function SpinePreviewPage() {
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!container.current) return;
    let active = true;
    let player: SpinePlayer | undefined;

    function showError(message: string) {
      if (!active) return;
      setError(message);
      setStatus("error");
    }

    try {
      player = new SpinePlayer(container.current, {
        skeleton: `${assetRoot}/xiaoyi.skel`,
        atlas: `${assetRoot}/xiaoyi.atlas`,
        backgroundColor: "#111c2c",
        preserveDrawingBuffer: false,
        showControls: true,
        success: () => { if (active) setStatus("ready"); },
        error: (_player, message) => showError(message),
      });
    } catch (cause) {
      showError(cause instanceof Error ? cause.message : "无法初始化 Spine 播放器。");
    }

    return () => {
      active = false;
      player?.dispose();
    };
  }, []);

  return (
    <main className="min-h-dvh bg-[#0a121e] px-4 py-8 text-[#eef3fa] sm:py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold">萧逸动画预览</h1>
        <p className="mt-2 text-sm text-slate-300">调试版 · 可通过播放器菜单切换动作。</p>
        <div className="relative mt-5 overflow-hidden rounded-lg border border-slate-700 bg-[#111c2c]">
          <div ref={container} className="h-[65dvh] min-h-[250px] max-h-[680px]" />
          {status === "loading" && <p role="status" className="pointer-events-none absolute left-4 top-4 text-sm">正在加载动画…</p>}
        </div>
        {status === "error" && <p role="alert" className="mt-3 break-words text-sm text-red-200">动画加载失败：{error}</p>}
      </div>
    </main>
  );
}
