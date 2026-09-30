import { useEffect } from "react";
import WishBoxActivityReview, {
  type ActivityReviewPhotoSelectionFixture,
  type ActivityReviewSelectionFixture,
} from "./WishBoxActivityReview";

const toSceneCqw = (designPixels: number) =>
  `${(designPixels / 19.2).toFixed(7)}cqw`;

const sceneX = (designPixels: number) =>
  `${((designPixels / 1920) * 100).toFixed(7)}%`;

const sceneY = (designPixels: number) =>
  `${((designPixels / 1080) * 100).toFixed(7)}%`;

type WishBoxPhotoViewerProps = {
  photo?: ActivityReviewPhotoSelectionFixture;
  activity?: ActivityReviewSelectionFixture;
  onClose: () => void;
};

const photoViewerPreviewFixture: ActivityReviewPhotoSelectionFixture = {
  fixtureId: "photo-viewer-dev-preview",
  placeholderColor: "#E8E1D7",
};

function WishBoxPhotoViewer({
  photo = photoViewerPreviewFixture,
  activity,
  onClose,
}: WishBoxPhotoViewerProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <section
      aria-label="活动图片放大预览"
      data-photo-viewer-fixture={photo.fixtureId}
      className="absolute inset-0 isolate overflow-hidden bg-white"
    >
      <div
        aria-hidden="true"
        inert
        className="pointer-events-none absolute inset-0"
        style={{ opacity: 0.32 }}
      >
        <WishBoxActivityReview activity={activity} showReturnControl={false} />
      </div>

      <button
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
        data-photo-fixture={photo.fixtureId}
        aria-hidden="true"
        className="pointer-events-auto absolute z-20"
        style={{
          left: sceneX(315),
          top: sceneY(146.421875),
          width: toSceneCqw(1278.943481),
          height: toSceneCqw(802.892273),
          backgroundColor: photo.placeholderColor,
          boxShadow: `${toSceneCqw(7)} ${toSceneCqw(6)} ${toSceneCqw(9.9)} rgba(0, 0, 0, 0.32)`,
          transform: "rotate(-0.735704deg)",
          transformOrigin: "top left",
        }}
      />

    </section>
  );
}

export default WishBoxPhotoViewer;
