import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import backDoubleChevron from "../../assets/wish-box/back-double-chevron.svg";
import backTouch from "../../assets/wish-box/announcement-back-touch.svg";
import WishBoxLoading from "./WishBoxLoading";

const toSceneCqw = (designPixels: number) =>
  `${(designPixels / 19.2).toFixed(7)}cqw`;

export type PhotoViewerMedia =
  | { source: "record"; recordId: number; imgKey: string; imgUrl: string }
  | { source: "preview"; fixtureId: string; placeholderColor: string };

type WishBoxPhotoViewerProps = {
  media: PhotoViewerMedia;
  onClose: () => void;
  onTransitionChange: (dimmed: boolean) => void;
};

const mediaStyle = {
  transformOrigin: "top left",
};

function ViewerContent({
  media,
  onClose,
  onTransitionChange,
}: WishBoxPhotoViewerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const returnButtonRef = useRef<HTMLButtonElement>(null);
  const didInitialFocusRef = useRef(false);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    media.source === "record" ? "loading" : "ready",
  );
  const isLoading = status === "loading";
  const [closing, setClosing] = useState(false);
  const closingRef = useRef(false);
  const [loadingAtClose, setLoadingAtClose] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setLoadingAtClose(isLoading);
    setClosing(true);
    onTransitionChange(false);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touch = window.matchMedia("(max-width: 1024px)").matches;
    closeTimerRef.current = setTimeout(onClose, reduced ? 0 : touch ? 160 : 300);
  }, [isLoading, onClose, onTransitionChange]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => { if (!closingRef.current) onTransitionChange(true); });
    return () => {
      cancelAnimationFrame(frame);
      if (closeTimerRef.current !== null) clearTimeout(closeTimerRef.current);
    };
  }, [onTransitionChange]);
  const focusCloseControl = useCallback(() => {
    if (window.matchMedia("(max-width: 1024px)").matches && isLoading) {
      dialogRef.current?.focus({ preventScroll: true });
      return;
    }
    const returnButton = returnButtonRef.current;
    const target = returnButton?.getClientRects().length
      ? returnButton
      : closeButtonRef.current;
    target?.focus({ preventScroll: true });
  }, [isLoading]);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || closingRef.current) return;
    if (!didInitialFocusRef.current || document.activeElement === dialog ||
      (isLoading && document.activeElement === returnButtonRef.current)) focusCloseControl();
    didInitialFocusRef.current = true;
  }, [focusCloseControl, isLoading]);

  return (
    <section
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="活动图片放大预览"
      aria-busy={isLoading}
      data-photo-viewer-fixture={media.source === "preview" ? media.fixtureId : undefined}
      data-photo-viewer-record-id={media.source === "record" ? media.recordId : undefined}
      data-photo-viewer-img-key={media.source === "record" ? media.imgKey : undefined}
      data-viewer-transition={closing ? "closing" : "opening"}
      data-viewer-loading={isLoading || (closing && loadingAtClose) ? "true" : undefined}
      className="absolute inset-0 z-50 isolate overflow-hidden"
      onKeyDown={(event) => {
        if (event.key === "Tab") {
          event.preventDefault();
          focusCloseControl();
        } else if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          requestClose();
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
        onClick={requestClose}
        style={{ appearance: "none" }}
      />

      <button
        ref={returnButtonRef}
        type="button"
        data-photo-viewer-return
        aria-label="返回活动回顾"
        className="absolute z-40 overflow-hidden border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c392b]"
        onClick={requestClose}
      >
        <picture>
          <source media="(max-width: 1024px)" srcSet={backTouch} />
          <img src={backDoubleChevron} alt="" aria-hidden="true" />
        </picture>
        <span>返回</span>
      </button>

      {isLoading ? (
        <div
          data-photo-viewer-placeholder
          className="pointer-events-auto absolute z-20"
          aria-hidden="true"
          onPointerDown={(event) => {
            event.preventDefault();
            focusCloseControl();
          }}
          style={{ ...mediaStyle, opacity: 0.55 }}
        />
      ) : null}

      <div
        data-photo-viewer-placeholder
        data-photo-fixture={media.source === "preview" ? media.fixtureId : undefined}
        data-photo-viewer-status={status}
        className="pointer-events-auto absolute z-20"
        onPointerDown={(event) => {
          // The media is not focusable; keep keyboard ownership inside the dialog.
          event.preventDefault();
          focusCloseControl();
        }}
        style={{
          ...mediaStyle,
          visibility: status === "ready" ? "visible" : "hidden",
          ...(media.source === "preview" ? { backgroundColor: media.placeholderColor } : {}),
        }}
      >
        {media.source === "record" ? (
          <img
            src={media.imgUrl}
            alt="活动照片原图"
            draggable={false}
            className="block h-full w-full object-contain"
            onLoad={() => { if (!closingRef.current) setStatus("ready"); }}
            onError={() => { if (!closingRef.current) setStatus("error"); }}
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
