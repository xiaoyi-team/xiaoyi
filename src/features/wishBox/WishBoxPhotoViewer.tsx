import { useRef, useState } from "react";
import WishBoxLoading from "./WishBoxLoading";

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

const mediaStyle = {
  left: sceneX(315),
  top: sceneY(146.421875),
  width: toSceneCqw(1278.943481),
  height: toSceneCqw(802.892273),
  boxShadow: `${toSceneCqw(7)} ${toSceneCqw(6)} ${toSceneCqw(9.9)} rgba(0, 0, 0, 0.32)`,
  transform: "rotate(-0.735704deg)",
  transformOrigin: "top left",
};

function ViewerContent({
  media,
  onClose,
}: WishBoxPhotoViewerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    media.source === "record" ? "loading" : "ready",
  );
  const isLoading = status === "loading";

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label="活动图片放大预览"
      aria-busy={isLoading}
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

      {isLoading ? (
        <div
          data-photo-viewer-placeholder
          className="pointer-events-auto absolute z-20"
          aria-hidden="true"
          onPointerDown={(event) => {
            event.preventDefault();
            closeButtonRef.current?.focus();
          }}
          style={{ ...mediaStyle, backgroundColor: "#FEF8EE", opacity: 0.55 }}
        />
      ) : null}

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
          ...mediaStyle,
          visibility: status === "ready" ? "visible" : "hidden",
          backgroundColor: media.source === "preview" ? media.placeholderColor : "#FEF8EE",
        }}
      >
        {media.source === "record" ? (
          <img
            src={media.imgUrl}
            alt="活动照片原图"
            draggable={false}
            className="block h-full w-full object-contain"
            onLoad={() => setStatus("ready")}
            onError={() => setStatus("error")}
          />
        ) : null}
      </div>

      {isLoading ? <WishBoxLoading variant="center" className="z-30" /> : null}
      {status === "error" ? (
        <p
          role="status"
          className="pointer-events-none absolute inset-0 z-30 m-0 grid place-items-center text-[#614B35]"
          style={{ fontSize: `clamp(16px, ${toSceneCqw(18)}, 18px)`, lineHeight: 1.5 }}
        >
          <span
            style={{
              boxSizing: "border-box",
              maxWidth: "calc(100% - 32px)",
              padding: "12px 20px",
              border: "1px solid #927A54",
              borderRadius: "12px",
              backgroundColor: "#FFF9E9",
              boxShadow: "0 4px 14px rgba(59, 48, 36, 0.18)",
              textAlign: "center",
              overflowWrap: "anywhere",
            }}
          >
            原图加载失败
          </span>
        </p>
      ) : null}
    </section>
  );
}

function WishBoxPhotoViewer(props: WishBoxPhotoViewerProps) {
  const { media } = props;
  // Reset atomically with image identity; late events belong to the old instance.
  const mediaKey = media.source === "record"
    ? JSON.stringify([media.recordId, media.imgKey, media.imgUrl])
    : media.fixtureId;
  return <ViewerContent key={mediaKey} {...props} />;
}

export default WishBoxPhotoViewer;
