import irisCenter from "../../assets/wish-box/loading-iris-center.svg";
import irisCorner from "../../assets/wish-box/loading-iris-corner.svg";
import "./WishBoxLoading.css";

export type WishBoxLoadingProps = {
  variant: "center" | "corner";
  className?: string;
  "aria-label"?: string;
};

export default function WishBoxLoading({
  variant,
  className,
  "aria-label": ariaLabel = "加载中",
}: WishBoxLoadingProps) {
  return (
    <div
      className={`wish-box-loading wish-box-loading--${variant}${className ? ` ${className}` : ""}`}
      role="status"
      aria-label={ariaLabel}
      aria-atomic="true"
    >
      {variant === "center" ? (
        <>
          <div className="wish-box-loading__icon" aria-hidden="true">
            <span className="wish-box-loading__badge" />
            <span className="wish-box-loading__ring" />
            <div className="wish-box-loading__orbit">
              <svg
                className="wish-box-loading__orbit-art"
                viewBox="0 0 96 96"
                focusable="false"
              >
                <path
                  d="M96 48A48 48 0 1 1 48 0L48 2.5A45.5 45.5 0 1 0 93.5 48Z"
                  fill="#7A5C9C"
                />
                <circle cx="96" cy="48" r="3.5" fill="#927A54" />
              </svg>
            </div>
            <img
              className="wish-box-loading__iris wish-box-loading__iris--center"
              src={irisCenter}
              alt=""
              draggable={false}
            />
          </div>
          <span className="wish-box-loading__pill" aria-hidden="true">
            加载中
          </span>
        </>
      ) : (
        <>
          <span className="wish-box-loading__corner-background" aria-hidden="true" />
          <img
            className="wish-box-loading__iris wish-box-loading__iris--corner"
            src={irisCorner}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <span className="wish-box-loading__corner-label" aria-hidden="true">
            加载中
          </span>
          <div className="wish-box-loading__dots" aria-hidden="true">
            <span className="wish-box-loading__dot wish-box-loading__dot--first" />
            <span className="wish-box-loading__dot wish-box-loading__dot--second" />
            <span className="wish-box-loading__dot wish-box-loading__dot--third" />
          </div>
        </>
      )}
    </div>
  );
}
