import { type CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import backDoubleChevron from "../../assets/wish-box/back-double-chevron.svg";
import backTouch from "../../assets/wish-box/announcement-back-touch.svg";
import bow from "../../assets/wish-box/activity-review-bow.png";
import bouquetRibbon from "../../assets/wish-box/activity-review-bouquet-ribbon.png";
import bouquetVertical from "../../assets/wish-box/activity-review-bouquet-vertical.png";
import cornerLeft from "../../assets/wish-box/activity-review-corner-left.png";
import cornerRight from "../../assets/wish-box/activity-review-corner-right.png";
import floralLeft from "../../assets/wish-box/activity-review-floral-left.png";
import floralRight from "../../assets/wish-box/activity-review-floral-right.png";
import headerPetalCenter from "../../assets/wish-box/activity-review-header-petal-center.png";
import headerPetalLeft from "../../assets/wish-box/activity-review-header-petal-left.png";
import headerPetalRight from "../../assets/wish-box/activity-review-header-petal-right.png";
import irisDivider from "../../assets/wish-box/activity-review-iris-divider.png";
import irisPurple from "../../assets/wish-box/activity-review-iris-purple.png";
import mobileCornerLeft from "../../assets/wish-box/activity-review-mobile-corner-left.png";
import mobileCornerRight from "../../assets/wish-box/activity-review-mobile-corner-right.png";
import photoPinGold from "../../assets/wish-box/activity-review-photo-pin-gold.png";
import photoStickerColorGold from "../../assets/wish-box/activity-review-photo-sticker-color-gold.png";
import photoStickerPink from "../../assets/wish-box/activity-review-photo-sticker-pink.png";
import photoTapeVGold from "../../assets/wish-box/activity-review-photo-tape-v-gold.png";
import rose from "../../assets/wish-box/activity-review-rose.png";
import whiteFlowers from "../../assets/wish-box/activity-review-white-flowers.png";
import { HttpError } from "../../services/request";
import { mapSupportRecordDetailToReview, type ActivityReviewViewModel } from "./activityReviewData";
import { useSupportRecordDetail } from "./hooks/useSupportRecordDetail";
import { isRecoverableWishBoxError } from "./hooks/requestPolicy";
import { formatTimelineDateRange } from "./timelinePresentation";
import WishBoxLoading from "./WishBoxLoading";
import WishBoxPhotoViewer, { type PhotoViewerMedia } from "./WishBoxPhotoViewer";

// List selection context; the formal Review consumes only recordId and requests its own detail.
export type ActivityReviewSelection = {
  recordId: number;
  title: string;
  date: string;
};

export type ActivityReviewPhotoSelection =
  | { source: "record"; recordId: number; imgKey: string }
  | { source: "preview"; fixtureId: string };

type ActivityReviewPhotoSelectionFixture = {
  fixtureId: string;
  placeholderColor: string;
};

// UI-only, design-derived fixture for this static scene; it is not a business or API model.
const ACTIVITY_REVIEW_UI_FIXTURE = {
  title: "光夜五周年&音乐会 · 限定应援",
  subtitle: "Happy 5th Anniversary",
  eyebrow: "✦  SPECIAL EVENT NOTICE  ✦",
  location: ["上海市静安区江场路1228号", "协信星光广场北里瑞幸咖啡"],
  time: "2026.7.4-7.5",
  introduction: [
    "传说有个漂亮哥哥站在花的后面，英俊得要命，需要一支鸢尾才能一睹真容。",
    "7月4日和7月5日，静安区协信星光广场将出现漂亮哥哥送的花和饮品，",
    "在鸢尾花香中开启无限幸福的第六年吧。",
  ],
} as const;

const ACTIVITY_REVIEW_SPARKLE_PATH =
  "M10.2385 0L11.976 8.50097L20.477 10.2385L11.976 11.976L10.2385 20.477L8.50097 11.976L0 10.2385L8.50097 8.50097L10.2385 0Z";
const ACTIVITY_PHOTO_PLACEHOLDER_COLOR = "#E8E1D7";

const toSceneCqw = (designPixels: number) =>
  `${(designPixels / 19.2).toFixed(7)}cqw`;

// Six entries exercise the largest supported layout; this is not a business default count.
const ACTIVITY_REVIEW_PHOTO_FIXTURE: readonly ActivityReviewPhotoSelectionFixture[] = [
  { fixtureId: "activity-review-photo-slot-1", placeholderColor: ACTIVITY_PHOTO_PLACEHOLDER_COLOR },
  { fixtureId: "activity-review-photo-slot-2", placeholderColor: ACTIVITY_PHOTO_PLACEHOLDER_COLOR },
  { fixtureId: "activity-review-photo-slot-3", placeholderColor: ACTIVITY_PHOTO_PLACEHOLDER_COLOR },
  { fixtureId: "activity-review-photo-slot-4", placeholderColor: ACTIVITY_PHOTO_PLACEHOLDER_COLOR },
  { fixtureId: "activity-review-photo-slot-5", placeholderColor: ACTIVITY_PHOTO_PLACEHOLDER_COLOR },
  { fixtureId: "activity-review-photo-slot-6", placeholderColor: ACTIVITY_PHOTO_PLACEHOLDER_COLOR },
];

const PHOTO_BOARD_DECORATION_ASSETS = {
  pin: photoPinGold,
  tape: photoTapeVGold,
  colorSticker: photoStickerColorGold,
  pinkSticker: photoStickerPink,
} as const;

type PhotoBoardSlot = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

type PhotoBoardDecoration = Omit<PhotoBoardSlot, "rotation"> & {
  type: keyof typeof PHOTO_BOARD_DECORATION_ASSETS;
};

type PhotoBoardLayout = {
  slots: readonly PhotoBoardSlot[];
  decorations: readonly PhotoBoardDecoration[];
};

// PC layouts from Figma 2349:84; rotations below use CSS (screen-coordinate) angles.
const PHOTO_BOARD_LAYOUTS: Partial<Record<number, PhotoBoardLayout>> = {
  1: { // 2447:84
    slots: [
      { x: 190, y: 75, width: 690, height: 430, rotation: -1 },
    ],
    decorations: [
      { type: "pin", x: 495.5, y: 53, width: 79, height: 79 },
    ],
  },
  2: { // 2447:94
    slots: [
      { x: 59.55, y: 147.891, width: 440, height: 274.203, rotation: 2 },
      { x: 575.45, y: 117.891, width: 440, height: 274.203, rotation: -2 },
    ],
    decorations: [
      { type: "pin", x: 240.05, y: 125.891, width: 79, height: 79 },
      { type: "pin", x: 755.95, y: 95.891, width: 79, height: 79 },
    ],
  },
  3: { // 2349:85
    slots: [
      { x: 44.287, y: 130.422, width: 480, height: 299.13, rotation: 2 },
      { x: 631.495, y: 49.075, width: 336.977, height: 210, rotation: -2 },
      { x: 617.496, y: 325.48, width: 345, height: 215, rotation: 1 },
    ],
    decorations: [
      { type: "pin", x: 244.787, y: 108.422, width: 79, height: 79 },
      { type: "pin", x: 760.5, y: 28, width: 79, height: 79 },
      { type: "pin", x: 750.5, y: 303, width: 79, height: 79 },
    ],
  },
  4: { // 2349:109
    slots: [
      { x: 103.465, y: 56.343, width: 353.023, height: 220, rotation: 2 },
      { x: 606.957, y: 63.884, width: 361.047, height: 225, rotation: -2 },
      { x: 108.475, y: 323.992, width: 353.023, height: 220, rotation: -1.5 },
      { x: 610.976, y: 330.942, width: 353.023, height: 220, rotation: 1.5 },
    ],
    decorations: [
      { type: "pin", x: 240.5, y: 33, width: 79, height: 79 },
      { type: "pin", x: 748, y: 43, width: 79, height: 79 },
      { type: "pin", x: 245.5, y: 303, width: 79, height: 79 },
      { type: "colorSticker", x: 763, y: 308, width: 49, height: 49 },
    ],
  },
  5: { // 2349:134
    slots: [
      { x: 56.915, y: 65.312, width: 401.163, height: 250, rotation: 1.5 },
      { x: 603.475, y: 48.992, width: 353.023, height: 220, rotation: -1.5 },
      { x: 58.596, y: 369.525, width: 272.791, height: 170, rotation: -2 },
      { x: 384.886, y: 346.521, width: 300, height: 186.957, rotation: 1 },
      { x: 735.108, y: 351.195, width: 285, height: 177.609, rotation: -1 },
    ],
    decorations: [
      { type: "pin", x: 218, y: 43, width: 79, height: 79 },
      { type: "pin", x: 740.5, y: 28, width: 79, height: 79 },
      { type: "pin", x: 155.5, y: 348, width: 79, height: 79 },
      { type: "colorSticker", x: 510.386, y: 324.521, width: 49, height: 49 },
      { type: "tape", x: 838.108, y: 329.195, width: 79, height: 79 },
    ],
  },
  6: { // 2349:160
    slots: [
      { x: 44.576, y: 77.13, width: 290, height: 180.725, rotation: 2 },
      { x: 395.318, y: 62.134, width: 290, height: 180.725, rotation: -1.5 },
      { x: 739.707, y: 81.192, width: 285, height: 177.609, rotation: 1.5 },
      { x: 55.252, y: 359.634, width: 290, height: 180.725, rotation: -1.5 },
      { x: 394.576, y: 352.13, width: 290, height: 180.725, rotation: 2 },
      { x: 735.187, y: 362.135, width: 290, height: 180.725, rotation: -1.5 },
    ],
    decorations: [
      { type: "pin", x: 150.076, y: 55.13, width: 79, height: 79 },
      { type: "pin", x: 500.818, y: 40.134, width: 79, height: 79 },
      { type: "pin", x: 842.707, y: 59.192, width: 79, height: 79 },
      { type: "colorSticker", x: 175.752, y: 337.634, width: 49, height: 49 },
      { type: "tape", x: 500.076, y: 330.13, width: 79, height: 79 },
      { type: "pinkSticker", x: 848.187, y: 340.135, width: 64, height: 64 },
    ],
  },
};

type PhotoBoardGeometry = Omit<PhotoBoardSlot, "rotation"> & { rotation?: number };

const PHOTO_BOARD_MOBILE_MEDIA =
  "(max-width: 1024px)";

const PHOTO_BOARD_IMAGE_STYLES = `
  [data-activity-review-photo-board] [data-activity-photo-key] > img {
    object-position: var(--photo-board-image-position, 50% 50%);
  }

  @media ${PHOTO_BOARD_MOBILE_MEDIA} {
    [data-activity-review-photo-board] {
      --photo-board-overflow: visible;
    }

    /* Native @2x exports retain rotation, filters and transparent margins.
       Convert their full 108x85 / 112x87 bitmaps from the 458-wide Figma board
       to Scene units, compensating for the parent's 1px inside border. */
    [data-activity-review-photo-board] [data-activity-photo-corner="left"] {
      left: ${toSceneCqw(-8.596 * 1119 / 458 - 1)};
      top: ${toSceneCqw(-4.502 * 1119 / 458 - 1)};
      --photo-board-corner-width: ${toSceneCqw(54 * 1119 / 458)};
      --photo-board-corner-height: ${toSceneCqw(42.5 * 1119 / 458)};
    }

    [data-activity-review-photo-board] [data-activity-photo-corner="right"] {
      left: ${toSceneCqw(411.646 * 1119 / 458 - 1)};
      top: ${toSceneCqw(218.948 * 1119 / 458 - 1)};
      right: auto;
      bottom: auto;
      --photo-board-corner-width: ${toSceneCqw(56 * 1119 / 458)};
      --photo-board-corner-height: ${toSceneCqw(43.5 * 1119 / 458)};
    }
  }
`;

function photoBoardGeometryStyle(current: PhotoBoardGeometry): CSSProperties {
  // Figma child coordinates include the parent's 1px inside border; CSS positioning starts inside it.
  return {
    left: toSceneCqw(current.x - 1),
    top: toSceneCqw(current.y - 1),
    width: toSceneCqw(current.width),
    height: toSceneCqw(current.height),
    ...(current.rotation !== undefined ? {
      transform: `rotate(${current.rotation}deg)`,
    } : {}),
  };
}

const activityReviewStars = [
  { node: "1058", x: 1498, y: 207, size: 20 },
  { node: "1098", x: 262, y: 293, size: 12.286 },
  { node: "1100", x: 1653.152, y: 346.240, size: 16.382 },
  { node: "1101", x: 498.249, y: 317.572, size: 20.477 },
  { node: "1102", x: 1192.419, y: 379.003, size: 12.286 },
  { node: "1103", x: 1407.428, y: 325.763, size: 12.286 },
  { node: "1104", x: 903.693, y: 293, size: 16.382 },
  { node: "1105", x: 230, y: 725.065, size: 12.286 },
  { node: "1106", x: 1673.629, y: 725.065, size: 16.382 },
  { node: "1107", x: 685.613, y: 873.523, size: 20.477 },
  { node: "1108", x: 608.825, y: 540.772, size: 20.477 },
  { node: "1109", x: 1218.015, y: 873.523, size: 12.286 },
  { node: "1110", x: 1620.388, y: 485.484, size: 20.477 },
  { node: "1111", x: 1454, y: 770, size: 20.477 },
  { node: "1112", x: 928.266, y: 759.876, size: 20.477 },
  { node: "1113", x: 391, y: 467, size: 20.477 },
  { node: "1114", x: 1053, y: 551, size: 16.382 },
  { node: "1115", x: 822, y: 1006, size: 16.382 },
  { node: "1116", x: 1141, y: 998, size: 16.382 },
  { node: "1117", x: 488, y: 879, size: 20.477 },
] as const;

function LocationIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 29 29" className="block h-full w-full">
      <path d="M14.5 2.41699C19.1714 2.41699 22.958 6.20359 22.958 10.875C22.958 17.0319 16.5762 20.6977 14.8994 21.5547C14.6458 21.6843 14.3542 21.6843 14.1006 21.5547C12.4238 20.6977 6.04199 17.0319 6.04199 10.875C6.04199 6.20359 9.82859 2.41699 14.5 2.41699ZM14.5 7.25C12.498 7.25 10.875 8.87297 10.875 10.875C10.875 12.877 12.498 14.5 14.5 14.5C16.502 14.5 18.125 12.877 18.125 10.875C18.125 8.87297 16.502 7.25 14.5 7.25Z" fill="#C7A16B" />
      <path d="M21.825 19.9375C22.5673 20.4886 22.9582 21.1137 22.9582 21.75C22.9582 22.3863 22.5673 23.0114 21.825 23.5625C21.0826 24.1136 20.0148 24.5712 18.729 24.8893C17.4432 25.2075 15.9846 25.375 14.4998 25.375C13.0151 25.375 11.5565 25.2075 10.2707 24.8893C8.98484 24.5712 7.91708 24.1136 7.17471 23.5625C6.43233 23.0114 6.0415 22.3863 6.0415 21.75C6.0415 21.1137 6.43233 20.4886 7.17471 19.9375" stroke="#C7A16B" strokeWidth="2" strokeLinecap="round" />
      <circle cx="14.5" cy="10.875" r="3.625" fill="#FFFFFF" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 29 29" className="block h-full w-full">
      <path d="M2.4165 10.0417C2.4165 8.15605 2.4165 7.21324 3.00229 6.62745C3.58808 6.04167 4.53089 6.04167 6.4165 6.04167H22.5832C24.4688 6.04167 25.4116 6.04167 25.9974 6.62745C26.5832 7.21324 26.5832 8.15605 26.5832 10.0417V11.0833C26.5832 11.5547 26.5832 11.7904 26.4367 11.9369C26.2903 12.0833 26.0546 12.0833 25.5832 12.0833H3.4165C2.9451 12.0833 2.7094 12.0833 2.56295 11.9369C2.4165 11.7904 2.4165 11.5547 2.4165 11.0833V10.0417Z" fill="#C7A16B" />
      <path d="M25.583 14.5C26.0542 14.5 26.2901 14.5002 26.4365 14.6465C26.583 14.7929 26.583 15.0286 26.583 15.5V22.583C26.583 24.4686 26.5829 25.4113 25.9971 25.9971C25.4113 26.5829 24.4686 26.583 22.583 26.583H6.41699C4.53137 26.583 3.58872 26.5829 3.00293 25.9971C2.41714 25.4113 2.41699 24.4686 2.41699 22.583V15.5C2.41699 15.0286 2.41703 14.7929 2.56348 14.6465C2.70994 14.5002 2.94576 14.5 3.41699 14.5H25.583ZM9.45801 21.75C8.98682 21.75 8.75091 21.7501 8.60449 21.8965C8.45821 22.0429 8.45801 22.2788 8.45801 22.75V23.167C8.45801 23.6382 8.45808 23.8741 8.60449 24.0205C8.75091 24.1669 8.98682 24.167 9.45801 24.167H12.292C12.7632 24.167 12.9991 24.1669 13.1455 24.0205C13.2919 23.8741 13.292 23.6382 13.292 23.167V22.75C13.292 22.2788 13.2918 22.0429 13.1455 21.8965C12.9991 21.7501 12.7632 21.75 12.292 21.75H9.45801ZM16.708 21.75C16.2368 21.75 16.0009 21.7501 15.8545 21.8965C15.7082 22.0429 15.708 22.2788 15.708 22.75V23.167C15.708 23.6382 15.7081 23.8741 15.8545 24.0205C16.0009 24.1669 16.2368 24.167 16.708 24.167H19.542C20.0132 24.167 20.2491 24.1669 20.3955 24.0205C20.5419 23.8741 20.542 23.6382 20.542 23.167V22.75C20.542 22.2788 20.5418 22.0429 20.3955 21.8965C20.2491 21.7501 20.0132 21.75 19.542 21.75H16.708ZM9.45801 16.917C8.98682 16.917 8.75091 16.9171 8.60449 17.0635C8.45837 17.2099 8.45801 17.4459 8.45801 17.917V18.333C8.45801 18.8041 8.45837 19.0401 8.60449 19.1865C8.75091 19.3329 8.98682 19.333 9.45801 19.333H12.292C12.7632 19.333 12.9991 19.3329 13.1455 19.1865C13.2916 19.0401 13.292 18.8041 13.292 18.333V17.917C13.292 17.4459 13.2916 17.2099 13.1455 17.0635C12.9991 16.9171 12.7632 16.917 12.292 16.917H9.45801ZM16.708 16.917C16.2368 16.917 16.0009 16.9171 15.8545 17.0635C15.7084 17.2099 15.708 17.4459 15.708 17.917V18.333C15.708 18.8041 15.7084 19.0401 15.8545 19.1865C16.0009 19.3329 16.2368 19.333 16.708 19.333H19.542C20.0132 19.333 20.2491 19.3329 20.3955 19.1865C20.5416 19.0401 20.542 18.8041 20.542 18.333V17.917C20.542 17.4459 20.5416 17.2099 20.3955 17.0635C20.2491 16.9171 20.0132 16.917 19.542 16.917H16.708Z" fill="#C7A16B" />
      <path d="M8.4585 3.625L8.4585 7.25" stroke="#C7A16B" strokeWidth="2" strokeLinecap="round" />
      <path d="M20.5415 3.625L20.5415 7.25" stroke="#C7A16B" strokeWidth="2" strokeLinecap="round" />
      <rect x="8.45833" y="16.91667" width="4.83333" height="2.41667" rx="0.5" fill="#273B4A" />
      <rect x="15.70833" y="16.91667" width="4.83333" height="2.41667" rx="0.5" fill="#273B4A" />
      <rect x="8.45833" y="21.75" width="4.83333" height="2.41667" rx="0.5" fill="#273B4A" />
      <rect x="15.70833" y="21.75" width="4.83333" height="2.41667" rx="0.5" fill="#273B4A" />
    </svg>
  );
}

function IntroductionIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 29 29" className="block h-full w-full">
      <path d="M14.708 8.875C14.708 9.31787 14.7063 9.75119 14.7539 10.1055C14.8054 10.4885 14.9311 10.926 15.2939 11.2891C15.657 11.652 16.0945 11.7776 16.4775 11.8291C16.8319 11.8767 17.265 11.875 17.708 11.875H24.167V19.333C24.167 22.7507 24.1662 24.4597 23.1045 25.5215C22.0428 26.583 20.3343 26.583 16.917 26.583H12.083C8.66572 26.583 6.95722 26.583 5.89551 25.5215C4.83377 24.4597 4.83301 22.7507 4.83301 19.333V9.66699C4.83301 6.24931 4.83377 4.54025 5.89551 3.47852C6.95722 2.41697 8.66572 2.41699 12.083 2.41699H14.708V8.875ZM10.875 19.542C10.3227 19.542 9.875 19.9897 9.875 20.542C9.87518 21.0941 10.3228 21.542 10.875 21.542H15.708C16.2602 21.542 16.7078 21.0941 16.708 20.542C16.708 19.9897 16.2603 19.542 15.708 19.542H10.875ZM10.875 14.708C10.3228 14.708 9.87518 15.1559 9.875 15.708C9.875 16.2603 10.3227 16.708 10.875 16.708H18.125C18.6773 16.708 19.125 16.2603 19.125 15.708C19.1248 15.1559 18.6772 14.708 18.125 14.708H10.875ZM16.708 2.41895C17.3257 2.42589 17.7024 2.4571 18.0488 2.60059C18.4929 2.78454 18.8425 3.13355 19.541 3.83203L22.751 7.04297C23.4492 7.74117 23.7984 8.09028 23.9824 8.53418C24.1259 8.88051 24.1571 9.25749 24.1641 9.875H17.708C17.2086 9.875 16.9343 9.87223 16.7441 9.84668C16.7416 9.84626 16.7388 9.84507 16.7363 9.84473C16.7361 9.84292 16.7356 9.84073 16.7354 9.83887C16.7098 9.64873 16.708 9.37415 16.708 8.875V2.41895Z" fill="#C7A16B" />
      <line x1="10.875" y1="15.70833" x2="18.125" y2="15.70833" stroke="#33363F" strokeWidth="2" strokeLinecap="round" />
      <line x1="10.875" y1="20.54167" x2="15.70833" y2="20.54167" stroke="#33363F" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SceneStar({ x, y, size }: { x: number; y: number; size: number }) {
  // CSS maps the original design coordinates into PC and Touch layouts.
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20.477 20.477"
      className="wish-box-review-star pointer-events-none absolute"
      style={{
        "--review-star-x": x,
        "--review-star-y": y,
        "--review-star-size": size,
      } as CSSProperties}
    >
      <path d={ACTIVITY_REVIEW_SPARKLE_PATH} fill="#DBA640" />
    </svg>
  );
}

type ReviewControls = {
  selectedPhoto: ActivityReviewPhotoSelection | null;
  onOpenPhoto: (photo: ActivityReviewPhotoSelection) => void;
  onClosePhoto: (expected: ActivityReviewPhotoSelection) => void;
  onBack: () => void;
};

type WishBoxActivityReviewProps = ReviewControls & (
  | { source: "record"; recordId: number }
  | { source: "preview" }
);

type DetailMappingResult =
  | { status: "pending" }
  | { status: "success"; viewModel: ActivityReviewViewModel }
  | { status: "error"; error: unknown };

type ReviewStatePanel = {
  title: string;
  description: string;
  canRetry: boolean;
};

function requestFailurePanel(error: unknown): ReviewStatePanel {
  if (error instanceof HttpError && (error.status === 401 || error.status === 403)) {
    return { title: "暂时无法访问此活动", description: "当前无法查看活动详情，请重试或返回时间轴。", canRetry: true };
  }
  if (error instanceof HttpError && error.status === 404) {
    return { title: "活动暂不可用", description: "暂时无法找到此活动，请重试或返回时间轴。", canRetry: true };
  }
  return { title: "活动详情加载失败", description: "活动详情加载失败，请重试", canRetry: true };
}

type ReviewData =
  | { source: "preview" }
  | {
      source: "record";
      recordId: number;
      viewModel: ActivityReviewViewModel | null;
      panel: ReviewStatePanel | null;
      retry?: () => void;
      retryPending: boolean;
      isPaused: boolean;
      isFetching: boolean;
      showCenterLoading: boolean;
    };

type BoardPhoto = {
  selection: ActivityReviewPhotoSelection;
  thumbnailUrl?: string;
  posX: number;
  posY: number;
  placeholderColor: string;
};

function RecordActivityReview(props: ReviewControls & { recordId: number }) {
  const { recordId } = props;
  const { query, isValidRecordId } = useSupportRecordDetail(recordId);
  // Keyed by recordId at the component boundary. Keep only interaction feedback,
  // never a second copy of the server data or the last valid ViewModel.
  const [retryState, setRetryState] = useState<{
    pending: boolean;
    panel: ReviewStatePanel;
    dataUpdatedAt: number;
    error?: unknown;
  } | null>(null);
  const retryInFlight = useRef(false);
  const mapped = useMemo<DetailMappingResult>(() => {
    if (query.data === undefined) return { status: "pending" };
    try {
      return { status: "success", viewModel: mapSupportRecordDetailToReview(query.data, recordId) };
    } catch (error) {
      return { status: "error", error };
    }
  }, [query.data, recordId]);
  const viewModel = isValidRecordId && mapped.status === "success" ? mapped.viewModel : null;
  const retryPending = retryState?.pending === true;
  // A later automatic success also releases a previous explicit Retry intent.
  // HTTP 200 alone is insufficient: the current response must map successfully.
  if (retryState && !retryPending && query.isSuccess && !query.isFetching && viewModel
    && query.dataUpdatedAt > retryState.dataUpdatedAt) {
    setRetryState(null);
  }
  const requestError = query.isError ? query.error : retryState?.error;
  const hasRequestError = query.isError || (retryState !== null && "error" in retryState);
  const silentRefreshFailure = isValidRecordId && viewModel !== null && retryState === null
    && isRecoverableWishBoxError(requestError);
  const accessFailure = requestError instanceof HttpError && [401, 403, 404].includes(requestError.status);
  const panel: ReviewStatePanel | null = !isValidRecordId
    ? { title: "无法打开此活动", description: "无法打开此活动，请返回时间轴", canRetry: false }
    : retryPending ? retryState.panel
    : accessFailure ? requestFailurePanel(requestError)
    : mapped.status === "error"
      ? { title: "活动内容暂不可用", description: "活动内容暂时无法显示，请重试", canRetry: true }
      : hasRequestError && !silentRefreshFailure ? requestFailurePanel(requestError)
      : query.isPaused && viewModel === null ? { title: "等待网络连接", description: "网络恢复后将继续加载活动详情。", canRetry: false }
      : null;
  const visibleViewModel = panel ? null : viewModel;
  const showCenterLoading =
    isValidRecordId && query.isLoading && viewModel === null && panel === null;

  async function retry() {
    if (!panel?.canRetry || !isValidRecordId || retryInFlight.current || query.isFetching || query.isPaused) return;
    retryInFlight.current = true;
    const feedback = { panel, dataUpdatedAt: query.dataUpdatedAt };
    setRetryState({ ...feedback, pending: true });
    try {
      // refetch resolves a Query result on normal request failure; it does not
      // throw by default. Rendering classifies that result and maps its data.
      const result = await query.refetch();
      if (result.isSuccess && result.data !== undefined) {
        try {
          mapSupportRecordDetailToReview(result.data, recordId);
          setRetryState(null);
          return;
        } catch {
          // The render-time mapping retains the original exception for debugging.
        }
      }
      setRetryState({ ...feedback, pending: false });
    } catch (error) {
      setRetryState({ ...feedback, pending: false, error });
    } finally {
      retryInFlight.current = false;
    }
  }

  return (
    <ReviewScene
      {...props}
      data={{
        source: "record", recordId, viewModel: visibleViewModel, panel,
        retry: panel?.canRetry ? () => { void retry(); } : undefined,
        retryPending,
        isPaused: query.isPaused,
        isFetching: query.isFetching,
        showCenterLoading,
      }}
    />
  );
}

function BoardThumbnail({ url, posX, posY }: { url: string; posX: number; posY: number }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  return (
    <>
      <img
        src={url}
        alt=""
        draggable={false}
        className="block h-full w-full object-cover"
        style={{
          visibility: status === "ready" ? "visible" : "hidden",
          "--photo-board-image-position": `${posX}% ${posY}%`,
        } as CSSProperties}
        onLoad={() => setStatus("ready")}
        onError={() => setStatus("error")}
      />
      {status !== "ready" ? (
        <span className="pointer-events-none absolute inset-0 grid place-items-center text-[#243D61]" style={{ fontSize: toSceneCqw(14) }}>
          {status === "error" ? "缩略图加载失败" : "正在加载照片…"}
        </span>
      ) : null}
    </>
  );
}

function ReviewScene({ data, selectedPhoto, onOpenPhoto, onClosePhoto, onBack }: ReviewControls & { data: ReviewData }) {
  const visualRef = useRef<HTMLDivElement>(null);
  const wasCenterLoadingRef = useRef(false);
  const [viewerDimmed, setViewerDimmed] = useState(false);
  const previousViewerSelectionRef = useRef<ActivityReviewPhotoSelection | null>(null);
  const isPreview = data.source === "preview";
  const viewModel = data.source === "record" ? data.viewModel : null;
  const centerTitle = data.source === "record" && data.viewModel !== null;
  const showContent = isPreview || viewModel !== null;
  const reviewContent = isPreview ? ACTIVITY_REVIEW_UI_FIXTURE : {
    title: viewModel?.title ?? "活动回顾",
    location: viewModel
      ? (viewModel.location?.trim() ? viewModel.location : "暂无地点信息")
      : "",
    time: viewModel ? formatTimelineDateRange(viewModel.startDate, viewModel.endDate) : "—",
    introduction: viewModel
      ? (viewModel.content?.trim() ? viewModel.content : "暂无活动介绍")
      : "",
  };
  const photos: BoardPhoto[] = isPreview
    ? ACTIVITY_REVIEW_PHOTO_FIXTURE.map((photo) => ({
        selection: { source: "preview", fixtureId: photo.fixtureId },
        posX: 50,
        posY: 50,
        placeholderColor: photo.placeholderColor,
      }))
    : viewModel?.photos.status === "ready" ? viewModel.photos.items.map((photo) => ({
        selection: { source: "record", recordId: viewModel.recordId, imgKey: photo.imgKey },
        thumbnailUrl: photo.thumbnailUrl,
        posX: photo.posX,
        posY: photo.posY,
        placeholderColor: ACTIVITY_PHOTO_PLACEHOLDER_COLOR,
      })) : [];
  const photoBoardLayout = PHOTO_BOARD_LAYOUTS[photos.length];
  let viewerMedia: PhotoViewerMedia | null = null;
  if (selectedPhoto?.source === "record" && viewModel?.recordId === selectedPhoto.recordId && viewModel.photos.status === "ready") {
    const photo = viewModel.photos.items.find((item) => item.imgKey === selectedPhoto.imgKey);
    if (photo) viewerMedia = { source: "record", recordId: viewModel.recordId, imgKey: photo.imgKey, imgUrl: photo.imgUrl };
  } else if (selectedPhoto?.source === "preview" && isPreview) {
    const photo = ACTIVITY_REVIEW_PHOTO_FIXTURE.find((item) => item.fixtureId === selectedPhoto.fixtureId);
    if (photo || selectedPhoto.fixtureId === "photo-viewer-dev-preview") {
      viewerMedia = { source: "preview", fixtureId: selectedPhoto.fixtureId, placeholderColor: photo?.placeholderColor ?? ACTIVITY_PHOTO_PLACEHOLDER_COLOR };
    }
  }
  const viewerOpen = viewerMedia !== null;
  const showCenterLoading =
    data.source === "record" && data.showCenterLoading && !viewerOpen;
  const showCornerLoading =
    data.source === "record" && viewModel !== null && data.isFetching && !viewerOpen;
  const statusData = data.source === "record" && data.panel ? data : null;

  // Render already excludes invalid media; this only synchronizes Page's identity state.
  useEffect(() => {
    if (selectedPhoto && !viewerOpen) onClosePhoto(selectedPhoto);
  }, [selectedPhoto, viewerOpen, onClosePhoto]);

  useLayoutEffect(() => {
    const previous = previousViewerSelectionRef.current;
    if (previous && !viewerOpen && !showCenterLoading) {
      const opener = Array.from(visualRef.current?.querySelectorAll<HTMLButtonElement>("button[data-activity-photo-key]") ?? []).find((button) =>
        previous.source === "record"
          ? button.dataset.activityPhotoRecordId === String(previous.recordId) && button.dataset.activityPhotoKey === previous.imgKey
          : button.dataset.activityPhotoFixture === previous.fixtureId,
      );
      (opener ?? visualRef.current?.querySelector<HTMLButtonElement>("button[data-activity-review-return]"))?.focus({ preventScroll: true });
    }
    previousViewerSelectionRef.current = viewerOpen ? selectedPhoto : null;
  }, [viewerOpen, selectedPhoto, showCenterLoading]);

  useLayoutEffect(() => {
    const visual = visualRef.current;
    if (!visual || viewerOpen) {
      wasCenterLoadingRef.current = showCenterLoading;
      return;
    }
    const touch = window.matchMedia("(max-width: 1024px)").matches;
    if (showCenterLoading && touch && !wasCenterLoadingRef.current) {
      visual.focus({ preventScroll: true });
    } else if (!showCenterLoading && wasCenterLoadingRef.current && document.activeElement === visual) {
      visual.querySelector<HTMLButtonElement>("button[data-activity-review-return]")?.focus({ preventScroll: true });
    }
    wasCenterLoadingRef.current = showCenterLoading;
  }, [showCenterLoading, viewerOpen]);

  return (
    <>
    <div
      ref={visualRef}
      tabIndex={-1}
      aria-label={showCenterLoading ? "活动回顾加载中" : undefined}
      aria-busy={showCenterLoading || undefined}
      data-review-center-loading={showCenterLoading ? "true" : undefined}
      className="wish-box-review-visual absolute inset-0"
      inert={viewerOpen}
      aria-hidden={viewerOpen ? true : undefined}
      style={{ opacity: viewerOpen && viewerDimmed ? 0.32 : 1, pointerEvents: viewerOpen ? "none" : undefined }}
      onKeyDown={(event) => {
        if (showCenterLoading && window.matchMedia("(max-width: 1024px)").matches && event.key === "Tab") {
          event.preventDefault();
        }
      }}
    >
    <section
      aria-label="活动回顾"
      data-activity-review-layout
      data-activity-review-record-id={data.source === "record" ? data.recordId : undefined}
      data-activity-review-fixture={isPreview ? "activity-review-preview" : undefined}
      className="absolute inset-0 isolate overflow-hidden"
      style={{ backgroundColor: "#F6E9E1", opacity: showCenterLoading ? 0.55 : 1 }}
    >
      <img
        src={floralLeft}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute left-0 top-0 h-full select-none"
        // Existing final-render PNGs already contain the visible Scene-edge crop.
        style={{ maxWidth: "none", zIndex: 13 }}
      />
      <img
        src={floralRight}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute top-0 h-full select-none"
        style={{ maxWidth: "none", zIndex: 13 }}
      />
      {showContent ? <>
      <img
        src={rose}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          maxWidth: "none",
          zIndex: 11,
        }}
      />
      <img
        src={irisDivider}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          maxWidth: "none",
          zIndex: 12,
        }}
      />

      <div
        data-activity-review-header
        className="absolute"
        style={{
          boxSizing: "border-box",
          overflow: "hidden",
          backgroundColor: "#FEF8EE",
          zIndex: 10,
        }}
      >
        <h1
          data-activity-review-title={centerTitle ? "success" : "status"}
          className="absolute m-0 flex items-center justify-center text-center"
          style={{
            color: "#1F427A",
            fontFamily: '"Noto Serif SC", serif',
            fontWeight: 600,
          }}
        >
          <span className="block min-w-0 max-w-full truncate" title={reviewContent.title}>{reviewContent.title}</span>
        </h1>
        {isPreview ? <>
        <p
          className="absolute m-0 flex items-center justify-center text-center"
          style={{
            left: toSceneCqw(266),
            top: toSceneCqw(85),
            width: toSceneCqw(376),
            height: toSceneCqw(44),
            color: "#8C522E",
            fontFamily: '"Noto Serif SC", serif',
            fontSize: toSceneCqw(28),
            fontWeight: 600,
            lineHeight: toSceneCqw(40),
            whiteSpace: "nowrap",
          }}
        >
          {ACTIVITY_REVIEW_UI_FIXTURE.subtitle}
        </p>
        <p
          className="absolute m-0 flex items-center justify-center text-center"
          style={{
            left: toSceneCqw(323),
            top: toSceneCqw(131),
            width: toSceneCqw(262),
            height: toSceneCqw(28),
            color: "#946B3D",
            fontFamily: '"Noto Serif SC", serif',
            fontSize: toSceneCqw(12),
            fontWeight: 500,
            lineHeight: toSceneCqw(20),
            letterSpacing: "0.08em",
            whiteSpace: "nowrap",
          }}
        >
          {ACTIVITY_REVIEW_UI_FIXTURE.eyebrow}
        </p>
        </> : null}
        <img
          src={headerPetalCenter}
          data-review-header-petal="center"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute select-none"
          style={{ zIndex: 21 }}
        />
        <img
          src={headerPetalLeft}
          data-review-header-petal="left"
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute select-none"
          style={{ zIndex: 21 }}
        />
      </div>

      <img
        src={headerPetalRight}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{ zIndex: 10 }}
      />

      <article
        aria-label="活动信息"
        data-activity-review-info-card
        className="absolute"
        style={{
          boxSizing: "border-box",
          overflow: "hidden",
          zIndex: 20,
        }}
      >
        <div data-activity-review-info-scroll className="contents">
          <div
            data-review-info-label
            className="absolute flex items-center"
            style={{ left: toSceneCqw(22), top: toSceneCqw(26) }}
          >
            <span className="block shrink-0"><LocationIcon /></span>
            <span className="flex items-center justify-center whitespace-nowrap" style={{ color: "#C7A16B", fontFamily: '"Noto Serif SC", serif', fontWeight: 600 }}>活动地点</span>
          </div>
          <div
            data-review-info-content="location"
            role={isPreview ? undefined : "region"}
            aria-label={isPreview ? undefined : "活动地点详情"}
            tabIndex={isPreview ? undefined : 0}
            className={isPreview ? "absolute flex flex-col whitespace-nowrap" : "absolute overflow-auto focus-visible:outline-2 whitespace-pre-wrap"}
            style={{ left: toSceneCqw(161), top: toSceneCqw(26), color: "#1F3B66", fontFamily: '"Noto Serif SC", serif', fontWeight: 400, gap: toSceneCqw(14), overflowWrap: "anywhere" }}
          >
            {typeof reviewContent.location === "string" ? reviewContent.location : reviewContent.location.map((line) => <span key={line}>{line}</span>)}
          </div>

          <div
            data-review-info-label
            className="absolute flex items-center"
            style={{ left: toSceneCqw(22), top: toSceneCqw(98) }}
          >
            <span className="block shrink-0"><CalendarIcon /></span>
            <span className="flex items-center justify-center whitespace-nowrap" style={{ color: "#C7A16B", fontFamily: '"Noto Serif SC", serif', fontWeight: 600 }}>活动时间</span>
          </div>
          <div
            data-review-info-content="time"
            className="absolute flex items-center whitespace-nowrap"
            style={{ left: toSceneCqw(161), top: toSceneCqw(101.5), color: "#1F3B66", fontFamily: '"Noto Serif SC", serif', fontWeight: 400 }}
          >
            <span className="block min-w-0 truncate" title={reviewContent.time}>{reviewContent.time}</span>
          </div>

          <div
            data-review-info-label
            className="absolute flex items-center"
            style={{ left: toSceneCqw(22), top: toSceneCqw(138) }}
          >
            <span className="block shrink-0"><IntroductionIcon /></span>
            <span className="flex items-center justify-center whitespace-nowrap" style={{ color: "#C7A16B", fontFamily: '"Noto Serif SC", serif', fontWeight: 600 }}>活动介绍</span>
          </div>
          <div
            data-review-info-content="introduction"
            role={isPreview ? undefined : "region"}
            aria-label={isPreview ? undefined : "活动介绍正文"}
            tabIndex={isPreview ? undefined : 0}
            className={isPreview ? "absolute flex flex-col" : "absolute overflow-auto focus-visible:outline-2"}
            style={{ left: toSceneCqw(22), top: toSceneCqw(178), gap: toSceneCqw(14), color: "#243D61", fontFamily: '"Noto Serif SC", serif', fontWeight: 400, whiteSpace: isPreview ? undefined : "pre-wrap", overflowWrap: "anywhere" }}
          >
            {typeof reviewContent.introduction === "string" ? reviewContent.introduction : reviewContent.introduction.map((paragraph) => (
              <p key={paragraph} className="m-0">{paragraph}</p>
            ))}
          </div>
        </div>
        <svg
          data-review-info-sparkle
          aria-hidden="true"
          viewBox="0 0 20.477 20.477"
          className="pointer-events-none absolute"
        >
          <path d={ACTIVITY_REVIEW_SPARKLE_PATH} fill="#DBA640" />
        </svg>
      </article>

      <section
        aria-label="活动照片区域"
        data-activity-review-photo-board
        className="absolute"
        style={{
          boxSizing: "border-box",
          overflow: "var(--photo-board-overflow, hidden)",
          border: `${toSceneCqw(1)} solid #C7944D`,
          borderRadius: toSceneCqw(18),
          backgroundColor: "#FEF8EE",
          zIndex: 20,
        }}
      >
        <div
          data-activity-photo-board-inner
          className="absolute"
          style={{
            ...photoBoardGeometryStyle({ x: 25, y: 23, width: 1070, height: 584 }),
            boxSizing: "border-box",
            overflow: "hidden",
            border: `${toSceneCqw(1)} solid #C7944D`,
            borderRadius: toSceneCqw(18),
            backgroundColor: "#FFF1DB",
            boxShadow: `inset 0 0 ${toSceneCqw(10.4)} rgba(0, 0, 0, 0.36)`,
          }}
        >
          {photoBoardLayout ? (
            <>
              {photos.map((photo, index) => {
                const slot = photoBoardLayout.slots[index];
                return (
                  <button
                    key={photo.selection.source === "record" ? photo.selection.imgKey : photo.selection.fixtureId}
                    type="button"
                    data-activity-photo-placeholder={isPreview ? index + 1 : undefined}
                    data-activity-photo-key={photo.selection.source === "record" ? photo.selection.imgKey : photo.selection.fixtureId}
                    data-activity-photo-record-id={photo.selection.source === "record" ? photo.selection.recordId : undefined}
                    data-activity-photo-fixture={photo.selection.source === "preview" ? photo.selection.fixtureId : undefined}
                    aria-label={`放大${isPreview ? "示例" : "活动"}照片 ${index + 1}`}
                    onClick={() => onOpenPhoto(photo.selection)}
                    className="pointer-events-auto absolute overflow-hidden cursor-zoom-in border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4c392b]"
                    style={{
                      ...photoBoardGeometryStyle(slot),
                      appearance: "none",
                      backgroundColor: photo.placeholderColor,
                      borderRadius: 0,
                      margin: 0,
                      boxShadow: `${toSceneCqw(7)} ${toSceneCqw(6)} ${toSceneCqw(9.9)} rgba(0, 0, 0, 0.32)`,
                      transformOrigin: "top left",
                    }}
                  >
                    {photo.thumbnailUrl !== undefined ? (
                      <BoardThumbnail
                        key={JSON.stringify([photo.selection, photo.thumbnailUrl])}
                        url={photo.thumbnailUrl}
                        posX={photo.posX}
                        posY={photo.posY}
                      />
                    ) : null}
                  </button>
                );
              })}
              {photoBoardLayout.decorations.map((decoration, index) => (
                <img
                  key={`${decoration.type}-${index}`}
                  src={PHOTO_BOARD_DECORATION_ASSETS[decoration.type]}
                  data-activity-photo-decoration={decoration.type}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="pointer-events-none absolute select-none"
                  style={{
                    ...photoBoardGeometryStyle(decoration),
                    maxWidth: "none",
                    zIndex: 1,
                  }}
                />
              ))}
            </>
          ) : (
            <p role="status" className="absolute inset-0 m-0 grid place-items-center text-[#243D61]" style={{ fontSize: toSceneCqw(18) }}>
              {viewModel?.photos.status === "empty" ? "暂无活动照片"
                : viewModel?.photos.status === "invalid" ? "活动照片数据错误"
                : "正在加载活动照片…"}
            </p>
          )}
        </div>

        <style>{PHOTO_BOARD_IMAGE_STYLES}</style>

        {/* These PNGs already contain the final Figma rotation/crop; scene placement remains a local calibration estimate. */}
        <picture className="contents">
          <source media={PHOTO_BOARD_MOBILE_MEDIA} srcSet={mobileCornerLeft} />
          <img
            src={cornerLeft}
            data-activity-photo-corner="left"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute left-0 top-0 select-none"
            style={{
              width: `var(--photo-board-corner-width, ${toSceneCqw(111)})`,
              height: `var(--photo-board-corner-height, ${toSceneCqw(92)})`,
              maxWidth: "none",
              zIndex: 2,
            }}
          />
        </picture>
        <picture className="contents">
          <source media={PHOTO_BOARD_MOBILE_MEDIA} srcSet={mobileCornerRight} />
          <img
            src={cornerRight}
            data-activity-photo-corner="right"
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none absolute bottom-0 right-0 select-none"
            style={{
              width: `var(--photo-board-corner-width, ${toSceneCqw(113.5)})`,
              height: `var(--photo-board-corner-height, ${toSceneCqw(95.5)})`,
              maxWidth: "none",
              zIndex: 2,
            }}
          />
        </picture>
      </section>

      <img
        src={bow}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          maxWidth: "none",
          zIndex: 30,
        }}
      />
      <img
        src={irisPurple}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          maxWidth: "none",
          zIndex: 30,
        }}
      />
      {activityReviewStars.map((star) => (
        <SceneStar key={star.node} x={star.x} y={star.y} size={star.size} />
      ))}
      <img
        src={bouquetRibbon}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          maxWidth: "none",
          zIndex: 30,
        }}
      />
      <img
        src={bouquetVertical}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          maxWidth: "none",
          zIndex: 30,
        }}
      />
      <img
        src={whiteFlowers}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          maxWidth: "none",
          zIndex: 30,
        }}
      />

      </> : null}

      {statusData?.panel ? (
        <div className="wish-box-review-standalone-state">
          <div className="wish-box-review-standalone-panel" role="status" aria-live="polite" aria-busy={statusData.retryPending}>
            <h1>{statusData.panel.title}</h1>
            <p>{statusData.panel.description}</p>
            {statusData.isPaused && statusData.panel.canRetry ? <p>正在等待网络连接，恢复后将继续请求。</p> : null}
            {statusData.retry ? (
              <button type="button" className="wish-box-review-standalone-retry"
                disabled={statusData.retryPending || statusData.isFetching || statusData.isPaused}
                onClick={() => {
                  visualRef.current?.querySelector<HTMLButtonElement>("button[data-activity-review-return]")?.focus({ preventScroll: true });
                  statusData.retry?.();
                }}>
                {statusData.retryPending ? "正在重试…" : "重试"}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {showCornerLoading ? (
        <WishBoxLoading variant="corner" className="z-40" />
      ) : null}

        <button
          type="button"
          autoFocus={!isPreview}
          data-activity-review-return
          onClick={onBack}
          aria-label="返回时间轴"
          className="absolute overflow-hidden border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c392b]"
          style={{
            zIndex: 40,
            visibility: viewerOpen ? "hidden" : undefined,
          }}
        >
          <picture className="absolute">
            <source media="(max-width: 1024px)" srcSet={backTouch} />
            <img src={backDoubleChevron} alt="" aria-hidden="true" className="h-full w-full" />
          </picture>
          <span
            className="absolute text-left text-white"
            style={{
              fontFamily: '"Noto Serif SC", serif',
              fontWeight: 600,
            }}
          >
            返回
          </span>
        </button>
    </section>
    {showCenterLoading ? <WishBoxLoading variant="center" className="z-40" /> : null}
    </div>
    {viewerMedia && selectedPhoto ? (
      <WishBoxPhotoViewer media={viewerMedia} onTransitionChange={setViewerDimmed} onClose={() => onClosePhoto(selectedPhoto)} />
    ) : null}
    </>
  );
}

function WishBoxActivityReview(props: WishBoxActivityReviewProps) {
  return props.source === "record"
    ? <RecordActivityReview key={props.recordId} {...props} />
    : <ReviewScene {...props} data={{ source: "preview" }} />;
}

export default WishBoxActivityReview;
