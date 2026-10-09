import { useRef, useState } from "react";

const toSceneCqw = (designPixels: number) =>
  `${(designPixels / 19.2).toFixed(7)}cqw`;

const sceneX = (designPixels: number) =>
  `${((designPixels / 1920) * 100).toFixed(7)}%`;

const sceneY = (designPixels: number) =>
  `${((designPixels / 1080) * 100).toFixed(7)}%`;

export type PhotoViewerMedia =
  | { source: "record"; recordId: number; imgKey: string; imgUrl: string }
  | { source: "preview"; fixtureId: string; placeholderColor: string };

type WishBoxPhotoViewerProps = {
  media: PhotoViewerMedia;
  onClose: () => void;
};

function ViewerImage({ url }: { url: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  return (
    <>
      <img
        src={url}
        alt="活动照片原图"
        draggable={false}
        className="block h-full w-full object-contain"
        style={{ visibility: status === "ready" ? "visible" : "hidden" }}
        onLoad={() => setStatus("ready")}
        onError={() => setStatus("error")}
      />
      {status !== "ready" ? (
        <p role="status" className="pointer-events-none absolute inset-0 m-0 grid place-items-center text-[#243D61]" style={{ fontSize: toSceneCqw(18) }}>
          {status === "error" ? "原图加载失败" : "正在加载原图…"}
        </p>
      ) : null}
    </>
  );
}

function WishBoxPhotoViewer({
  media,
  onClose,
}: WishBoxPhotoViewerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label="活动图片放大预览"
      data-photo-viewer-fixture={media.source === "preview" ? media.fixtureId : undefined}
      data-photo-viewer-record-id={media.source === "record" ? media.recordId : undefined}
      data-photo-viewer-img-key={media.source === "record" ? media.imgKey : undefined}
      className="absolute inset-0 z-50 isolate overflow-hidden"
      onKeyDown={(event) => {
        if (event.key === "Tab") {
          event.preventDefault();
          closeButtonRef.current?.focus();
        } else if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <button
        ref={closeButtonRef}
        type="button"
        autoFocus
        data-photo-viewer-background
        aria-label="关闭活动图片放大"
        className="absolute inset-0 z-10 m-0 cursor-default border-0 bg-transparent p-0"
        onClick={onClose}
        style={{ appearance: "none" }}
      />

      <div
        data-photo-viewer-placeholder
        data-photo-fixture={media.source === "preview" ? media.fixtureId : undefined}
        className="pointer-events-auto absolute z-20"
        onPointerDown={(event) => {
          // The media is not focusable; keep keyboard ownership inside the dialog.
          event.preventDefault();
          closeButtonRef.current?.focus();
        }}
        style={{
          left: sceneX(315),
          top: sceneY(146.421875),
          width: toSceneCqw(1278.943481),
          height: toSceneCqw(802.892273),
          backgroundColor: media.source === "preview" ? media.placeholderColor : "#FEF8EE",
          boxShadow: `${toSceneCqw(7)} ${toSceneCqw(6)} ${toSceneCqw(9.9)} rgba(0, 0, 0, 0.32)`,
          transform: "rotate(-0.735704deg)",
          transformOrigin: "top left",
        }}
      >
        {media.source === "record" ? (
          <ViewerImage key={JSON.stringify([media.recordId, media.imgKey, media.imgUrl])} url={media.imgUrl} />
        ) : null}
      </div>

    </section>
  );
}

export default WishBoxPhotoViewer;
