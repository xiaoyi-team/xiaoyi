import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import backDoubleChevron from "../../assets/wish-box/back-double-chevron.svg";
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
import photoPinGold from "../../assets/wish-box/activity-review-photo-pin-gold.png";
import photoStickerColorGold from "../../assets/wish-box/activity-review-photo-sticker-color-gold.png";
import photoStickerPink from "../../assets/wish-box/activity-review-photo-sticker-pink.png";
import photoTapeVGold from "../../assets/wish-box/activity-review-photo-tape-v-gold.png";
import rose from "../../assets/wish-box/activity-review-rose.png";
import whiteFlowers from "../../assets/wish-box/activity-review-white-flowers.png";
import { mapSupportRecordDetailToReview, type ActivityReviewViewModel } from "./activityReviewData";
import { useSupportRecordDetail } from "./hooks/useSupportRecordDetail";
import { formatTimelineDateRange } from "./timelinePresentation";
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

const sceneX = (designPixels: number) =>
  `${((designPixels / 1920) * 100).toFixed(7)}%`;

const sceneY = (designPixels: number) =>
  `${((designPixels / 1080) * 100).toFixed(7)}%`;

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

// Local UI layout coordinates within the 1070 × 584 board, not transport data.
const PHOTO_BOARD_LAYOUTS: Partial<Record<number, PhotoBoardLayout>> = {
  1: {
    slots: [
      { x: 190, y: 75, width: 690, height: 430, rotation: 1 },
    ],
    decorations: [
      { type: "pin", x: 495.5, y: 53, width: 79, height: 79 },
    ],
  },
  2: {
    slots: [
      { x: 60, y: 135, width: 440, height: 300, rotation: -2 },
      { x: 575, y: 105, width: 440, height: 300, rotation: 2 },
    ],
    decorations: [
      { type: "pin", x: 240.5, y: 113, width: 79, height: 79 },
      { type: "pin", x: 755.5, y: 83, width: 79, height: 79 },
    ],
  },
  3: {
    slots: [
      { x: 45, y: 110, width: 480, height: 340, rotation: -2 },
      { x: 605, y: 50, width: 390, height: 210, rotation: 2 },
      { x: 590, y: 325, width: 400, height: 215, rotation: -1 },
    ],
    decorations: [
      { type: "pin", x: 245.5, y: 88, width: 79, height: 79 },
      { type: "pin", x: 760.5, y: 28, width: 79, height: 79 },
      { type: "pin", x: 750.5, y: 303, width: 79, height: 79 },
    ],
  },
  4: {
    slots: [
      { x: 65, y: 55, width: 430, height: 220, rotation: -2 },
      { x: 575, y: 65, width: 425, height: 225, rotation: 2 },
      { x: 70, y: 325, width: 430, height: 220, rotation: 1.5 },
      { x: 575, y: 330, width: 425, height: 220, rotation: -1.5 },
    ],
    decorations: [
      { type: "pin", x: 240.5, y: 33, width: 79, height: 79 },
      { type: "pin", x: 748, y: 43, width: 79, height: 79 },
      { type: "pin", x: 245.5, y: 303, width: 79, height: 79 },
      { type: "colorSticker", x: 763, y: 308, width: 49, height: 49 },
    ],
  },
  5: {
    slots: [
      { x: 45, y: 65, width: 425, height: 250, rotation: -1.5 },
      { x: 565, y: 50, width: 430, height: 220, rotation: 1.5 },
      { x: 45, y: 370, width: 300, height: 170, rotation: 2 },
      { x: 385, y: 340, width: 300, height: 200, rotation: -1 },
      { x: 735, y: 345, width: 285, height: 190, rotation: 1 },
    ],
    decorations: [
      { type: "pin", x: 218, y: 43, width: 79, height: 79 },
      { type: "pin", x: 740.5, y: 28, width: 79, height: 79 },
      { type: "pin", x: 155.5, y: 348, width: 79, height: 79 },
      { type: "colorSticker", x: 510.5, y: 318, width: 49, height: 49 },
      { type: "tape", x: 838, y: 323, width: 79, height: 79 },
    ],
  },
  6: {
    slots: [
      { x: 45, y: 65, width: 290, height: 205, rotation: -2 },
      { x: 395, y: 50, width: 290, height: 205, rotation: 1.5 },
      { x: 740, y: 70, width: 285, height: 200, rotation: -1.5 },
      { x: 55, y: 350, width: 290, height: 200, rotation: 1.5 },
      { x: 395, y: 340, width: 290, height: 205, rotation: -2 },
      { x: 735, y: 355, width: 290, height: 195, rotation: 1.5 },
    ],
    decorations: [
      { type: "pin", x: 150.5, y: 43, width: 79, height: 79 },
      { type: "pin", x: 500.5, y: 28, width: 79, height: 79 },
      { type: "pin", x: 843, y: 48, width: 79, height: 79 },
      { type: "colorSticker", x: 175.5, y: 328, width: 49, height: 49 },
      { type: "tape", x: 500.5, y: 318, width: 79, height: 79 },
      { type: "pinkSticker", x: 848, y: 333, width: 64, height: 64 },
    ],
  },
};

const activityReviewStars = [
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
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20.477 20.477"
      className="pointer-events-none absolute"
      style={{
        left: sceneX(x),
        top: sceneY(y),
        width: toSceneCqw(size),
        height: toSceneCqw(size),
        zIndex: 30,
      }}
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
  | { status: "error"; message: string };

type ReviewData =
  | { source: "preview" }
  | {
      source: "record";
      recordId: number;
      viewModel: ActivityReviewViewModel | null;
      message: string | null;
      errorMessage: string | null;
      retry?: () => void;
      isFetching: boolean;
    };

type BoardPhoto = {
  selection: ActivityReviewPhotoSelection;
  thumbnailUrl?: string;
  placeholderColor: string;
};

function RecordActivityReview(props: ReviewControls & { recordId: number }) {
  const { recordId } = props;
  const { query, isValidRecordId } = useSupportRecordDetail(recordId);
  const mapped = useMemo<DetailMappingResult>(() => {
    if (query.data === undefined) return { status: "pending" };
    try {
      return { status: "success", viewModel: mapSupportRecordDetailToReview(query.data, recordId) };
    } catch (error) {
      return { status: "error", message: error instanceof Error ? error.message : "无法识别的活动数据错误" };
    }
  }, [query.data, recordId]);
  const viewModel = isValidRecordId && mapped.status === "success" ? mapped.viewModel : null;
  const errorMessage = !isValidRecordId ? "无效的活动 ID"
    : mapped.status === "error" ? mapped.message
    : query.isError ? query.error.message : null;
  const message = errorMessage
    ? viewModel ? "更新失败，已保留当前详情" : "活动回顾加载失败"
    : viewModel ? null : "正在加载活动回顾…";

  return (
    <ReviewScene
      {...props}
      data={{
        source: "record", recordId, viewModel, message, errorMessage,
        retry: isValidRecordId && errorMessage ? () => { void query.refetch(); } : undefined,
        isFetching: query.isFetching,
      }}
    />
  );
}

function BoardThumbnail({ url }: { url: string }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  return (
    <>
      <img
        src={url}
        alt=""
        draggable={false}
        className="block h-full w-full object-cover"
        style={{ visibility: status === "ready" ? "visible" : "hidden" }}
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
  const previousViewerSelectionRef = useRef<ActivityReviewPhotoSelection | null>(null);
  const isPreview = data.source === "preview";
  const viewModel = data.source === "record" ? data.viewModel : null;
  const reviewContent = isPreview ? ACTIVITY_REVIEW_UI_FIXTURE : {
    title: viewModel?.title ?? "活动回顾",
    location: viewModel?.location ?? "暂无地点信息",
    time: viewModel ? formatTimelineDateRange(viewModel.startDate, viewModel.endDate) : "—",
    introduction: viewModel ? viewModel.content ?? "暂无活动介绍"
      : (data.source === "record" ? data.errorMessage : null) ?? "暂无活动介绍",
  };
  const photos: BoardPhoto[] = isPreview
    ? ACTIVITY_REVIEW_PHOTO_FIXTURE.map((photo) => ({
        selection: { source: "preview", fixtureId: photo.fixtureId },
        placeholderColor: photo.placeholderColor,
      }))
    : viewModel?.photos.status === "ready" ? viewModel.photos.items.map((photo) => ({
        selection: { source: "record", recordId: viewModel.recordId, imgKey: photo.imgKey },
        thumbnailUrl: photo.thumbnailUrl,
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

  // Render already excludes invalid media; this only synchronizes Page's identity state.
  useEffect(() => {
    if (selectedPhoto && !viewerOpen) onClosePhoto(selectedPhoto);
  }, [selectedPhoto, viewerOpen, onClosePhoto]);

  useLayoutEffect(() => {
    const previous = previousViewerSelectionRef.current;
    if (previous && !viewerOpen) {
      const opener = Array.from(visualRef.current?.querySelectorAll<HTMLButtonElement>("button[data-activity-photo-key]") ?? []).find((button) =>
        previous.source === "record"
          ? button.dataset.activityPhotoRecordId === String(previous.recordId) && button.dataset.activityPhotoKey === previous.imgKey
          : button.dataset.activityPhotoFixture === previous.fixtureId,
      );
      (opener ?? visualRef.current?.querySelector<HTMLButtonElement>("button[data-activity-review-return]"))?.focus({ preventScroll: true });
    }
    previousViewerSelectionRef.current = viewerOpen ? selectedPhoto : null;
  }, [viewerOpen, selectedPhoto]);

  return (
    <>
    <div
      ref={visualRef}
      className="absolute inset-0"
      inert={viewerOpen}
      aria-hidden={viewerOpen ? true : undefined}
      style={{ opacity: viewerOpen ? 0.32 : 1, pointerEvents: viewerOpen ? "none" : undefined }}
    >
    <section
      aria-label="活动回顾"
      data-activity-review-record-id={data.source === "record" ? data.recordId : undefined}
      data-activity-review-fixture={isPreview ? "activity-review-preview" : undefined}
      className="absolute inset-0 isolate overflow-hidden"
      style={{ backgroundColor: "#F6E9E1" }}
    >
      <img
        src={floralLeft}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute left-0 top-0 h-full select-none"
        style={{ width: sceneX(693), maxWidth: "none", zIndex: 13 }}
      />
      <img
        src={floralRight}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute top-0 h-full select-none"
        style={{ left: sceneX(1256), width: sceneX(664), maxWidth: "none", zIndex: 13 }}
      />
      <img
        src={rose}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          left: sceneX(1321),
          top: sceneY(173),
          width: toSceneCqw(146.215),
          height: toSceneCqw(152.703),
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
          left: sceneX(764),
          top: sceneY(0),
          width: toSceneCqw(391),
          height: toSceneCqw(172),
          maxWidth: "none",
          zIndex: 12,
        }}
      />

      <div
        data-activity-review-header
        className="absolute"
        style={{
          left: sceneX(499),
          top: sceneY(95),
          width: sceneX(908),
          height: sceneY(176),
          boxSizing: "border-box",
          overflow: "hidden",
          border: `${toSceneCqw(1.5)} solid #C7944D`,
          borderRadius: toSceneCqw(34),
          backgroundColor: "#FEF8EE",
          zIndex: 10,
        }}
      >
        <h1
          className="absolute m-0 flex items-center justify-center text-center"
          style={{
            left: toSceneCqw(147),
            top: toSceneCqw(17),
            width: toSceneCqw(614),
            height: toSceneCqw(70),
            color: "#1F427A",
            fontFamily: '"Noto Serif SC", serif',
            fontSize: toSceneCqw(36),
            fontWeight: 600,
            lineHeight: toSceneCqw(52),
            whiteSpace: "nowrap",
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
        </> : data.source === "record" && data.message ? (
          <div role="status" className="absolute flex flex-col items-center justify-center text-[#243D61]" style={{ left: toSceneCqw(147), top: toSceneCqw(85), width: toSceneCqw(614), height: toSceneCqw(75), fontSize: toSceneCqw(14), gap: toSceneCqw(6) }}>
            <span title={data.errorMessage ?? undefined}>{data.message}</span>
            {data.retry ? (
              <button type="button" disabled={data.isFetching} onClick={() => {
                visualRef.current?.querySelector<HTMLButtonElement>("button[data-activity-review-return]")?.focus({ preventScroll: true });
                data.retry?.();
              }} className="cursor-pointer underline focus-visible:outline-2 disabled:cursor-wait">
                {data.isFetching ? "正在重试…" : "重试"}
              </button>
            ) : null}
          </div>
        ) : null}
        <img
          src={headerPetalCenter}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute select-none"
          style={{ left: toSceneCqw(871), top: toSceneCqw(97), width: toSceneCqw(28), height: toSceneCqw(21), zIndex: 21 }}
        />
        <img
          src={headerPetalRight}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute select-none"
          style={{ left: toSceneCqw(1119), top: toSceneCqw(118), width: toSceneCqw(31), height: toSceneCqw(24), zIndex: 21 }}
        />
        <img
          src={headerPetalLeft}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute select-none"
          style={{ left: toSceneCqw(140), top: toSceneCqw(77), width: toSceneCqw(28), height: toSceneCqw(21), zIndex: 21 }}
        />
      </div>

      <article
        aria-label="活动信息"
        data-activity-review-info-card
        className="absolute"
        style={{
          left: sceneX(230),
          top: sceneY(311),
          width: toSceneCqw(379),
          height: toSceneCqw(371),
          boxSizing: "border-box",
          overflow: "hidden",
          border: `${toSceneCqw(1)} solid #C7944D`,
          borderRadius: toSceneCqw(18),
          backgroundColor: "#FEF8EE",
          zIndex: 20,
        }}
      >
        <div
          className="absolute flex items-center"
          style={{ left: toSceneCqw(22), top: toSceneCqw(26), width: toSceneCqw(123), height: toSceneCqw(32), gap: toSceneCqw(8) }}
        >
          <span className="block shrink-0" style={{ width: toSceneCqw(29), height: toSceneCqw(29) }}><LocationIcon /></span>
          <span className="flex items-center justify-center whitespace-nowrap" style={{ width: toSceneCqw(86), height: toSceneCqw(32), color: "#C7A16B", fontFamily: '"Noto Serif SC", serif', fontSize: toSceneCqw(18), fontWeight: 600, lineHeight: toSceneCqw(28) }}>活动地点</span>
        </div>
        <div
          role={isPreview ? undefined : "region"}
          aria-label={isPreview ? undefined : "活动地点详情"}
          tabIndex={isPreview ? undefined : 0}
          className={isPreview ? "absolute flex flex-col" : "absolute overflow-auto focus-visible:outline-2"}
          style={{ left: toSceneCqw(161), top: toSceneCqw(26), width: toSceneCqw(199), height: toSceneCqw(67), color: "#1F3B66", fontFamily: '"Noto Serif SC", serif', fontSize: toSceneCqw(14), fontWeight: 400, lineHeight: toSceneCqw(24), gap: toSceneCqw(14), whiteSpace: isPreview ? "nowrap" : "pre-wrap", overflowWrap: "anywhere" }}
        >
          {typeof reviewContent.location === "string" ? reviewContent.location : reviewContent.location.map((line) => <span key={line}>{line}</span>)}
        </div>

        <div
          className="absolute flex items-center"
          style={{ left: toSceneCqw(22), top: toSceneCqw(98), width: toSceneCqw(123), height: toSceneCqw(32), gap: toSceneCqw(8) }}
        >
          <span className="block shrink-0" style={{ width: toSceneCqw(29), height: toSceneCqw(29) }}><CalendarIcon /></span>
          <span className="flex items-center justify-center whitespace-nowrap" style={{ width: toSceneCqw(86), height: toSceneCqw(32), color: "#C7A16B", fontFamily: '"Noto Serif SC", serif', fontSize: toSceneCqw(18), fontWeight: 600, lineHeight: toSceneCqw(28) }}>活动时间</span>
        </div>
        <div
          className="absolute flex items-center whitespace-nowrap"
          style={{ left: toSceneCqw(161), top: toSceneCqw(101.5), width: toSceneCqw(199), height: toSceneCqw(25), color: "#1F3B66", fontFamily: '"Noto Serif SC", serif', fontSize: toSceneCqw(14), fontWeight: 400, lineHeight: toSceneCqw(24) }}
        >
          <span className="block min-w-0 truncate" title={reviewContent.time}>{reviewContent.time}</span>
        </div>

        <div
          className="absolute flex items-center"
          style={{ left: toSceneCqw(22), top: toSceneCqw(138), width: toSceneCqw(123), height: toSceneCqw(32), gap: toSceneCqw(8) }}
        >
          <span className="block shrink-0" style={{ width: toSceneCqw(29), height: toSceneCqw(29) }}><IntroductionIcon /></span>
          <span className="flex items-center justify-center whitespace-nowrap" style={{ width: toSceneCqw(86), height: toSceneCqw(32), color: "#C7A16B", fontFamily: '"Noto Serif SC", serif', fontSize: toSceneCqw(18), fontWeight: 600, lineHeight: toSceneCqw(28) }}>活动介绍</span>
        </div>
        <div
          role={isPreview ? undefined : "region"}
          aria-label={isPreview ? undefined : "活动介绍正文"}
          tabIndex={isPreview ? undefined : 0}
          className={isPreview ? "absolute flex flex-col" : "absolute overflow-auto focus-visible:outline-2"}
          style={{ left: toSceneCqw(22), top: toSceneCqw(178), width: toSceneCqw(325), height: toSceneCqw(148), gap: toSceneCqw(14), color: "#243D61", fontFamily: '"Noto Serif SC", serif', fontSize: toSceneCqw(14), fontWeight: 400, lineHeight: toSceneCqw(24), whiteSpace: isPreview ? undefined : "pre-wrap", overflowWrap: "anywhere" }}
        >
          {typeof reviewContent.introduction === "string" ? reviewContent.introduction : reviewContent.introduction.map((paragraph) => (
            <p key={paragraph} className="m-0">{paragraph}</p>
          ))}
        </div>
        <svg
          aria-hidden="true"
          viewBox="0 0 20.477 20.477"
          className="pointer-events-none absolute"
          style={{ left: toSceneCqw(309), top: toSceneCqw(337), width: toSceneCqw(20.477), height: toSceneCqw(20.477) }}
        >
          <path d={ACTIVITY_REVIEW_SPARKLE_PATH} fill="#DBA640" />
        </svg>
      </article>

      <section
        aria-label="活动照片区域"
        data-activity-review-photo-board
        className="absolute"
        style={{
          left: sceneX(640),
          top: sceneY(311),
          width: toSceneCqw(1119),
          height: toSceneCqw(630),
          boxSizing: "border-box",
          overflow: "hidden",
          border: `${toSceneCqw(1)} solid #C7944D`,
          borderRadius: toSceneCqw(18),
          backgroundColor: "#FEF8EE",
          zIndex: 20,
        }}
      >
        <div
          className="absolute"
          style={{
            left: toSceneCqw(25),
            top: toSceneCqw(23),
            width: toSceneCqw(1070),
            height: toSceneCqw(584),
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
                      left: toSceneCqw(slot.x),
                      top: toSceneCqw(slot.y),
                      width: toSceneCqw(slot.width),
                      height: toSceneCqw(slot.height),
                      appearance: "none",
                      backgroundColor: photo.placeholderColor,
                      borderRadius: 0,
                      margin: 0,
                      boxShadow: `${toSceneCqw(7)} ${toSceneCqw(6)} ${toSceneCqw(9.9)} rgba(0, 0, 0, 0.32)`,
                      transform: `rotate(${slot.rotation}deg)`,
                      transformOrigin: "top left",
                    }}
                  >
                    {photo.thumbnailUrl !== undefined ? (
                      <BoardThumbnail key={JSON.stringify([photo.selection, photo.thumbnailUrl])} url={photo.thumbnailUrl} />
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
                    left: toSceneCqw(decoration.x),
                    top: toSceneCqw(decoration.y),
                    width: toSceneCqw(decoration.width),
                    height: toSceneCqw(decoration.height),
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
                : data.source === "record" && data.errorMessage ? "照片暂不可用" : "正在加载活动照片…"}
            </p>
          )}
        </div>

        {/* These PNGs already contain the final Figma rotation/crop; scene placement remains a local calibration estimate. */}
        <img
          src={cornerLeft}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute left-0 top-0 select-none"
          style={{ width: toSceneCqw(111), height: toSceneCqw(92), maxWidth: "none", zIndex: 2 }}
        />
        <img
          src={cornerRight}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="pointer-events-none absolute bottom-0 right-0 select-none"
          style={{ width: toSceneCqw(113.5), height: toSceneCqw(95.5), maxWidth: "none", zIndex: 2 }}
        />
      </section>

      <img
        src={bow}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          left: sceneX(426),
          top: sceneY(169),
          width: toSceneCqw(151.485),
          height: toSceneCqw(151.485),
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
          left: sceneX(1640),
          top: sceneY(396),
          width: toSceneCqw(199.605),
          height: toSceneCqw(199.605),
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
          left: sceneX(495),
          top: sceneY(733),
          width: toSceneCqw(323),
          height: toSceneCqw(322.5),
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
          left: sceneX(532),
          top: sceneY(470),
          width: toSceneCqw(153),
          height: toSceneCqw(271),
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
          left: sceneX(1577),
          top: sceneY(163),
          width: toSceneCqw(274.469),
          height: toSceneCqw(274.469),
          maxWidth: "none",
          zIndex: 30,
        }}
      />

        <button
          type="button"
          autoFocus={!isPreview}
          data-activity-review-return
          onClick={onBack}
          aria-label="返回时间轴"
          className="absolute overflow-hidden border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c392b]"
          style={{
            left: sceneX(74),
            top: sceneY(23),
            width: toSceneCqw(170),
            height: toSceneCqw(74),
            borderRadius: toSceneCqw(22),
            zIndex: 40,
            visibility: viewerOpen ? "hidden" : undefined,
          }}
        >
          <img
            src={backDoubleChevron}
            alt=""
            aria-hidden="true"
            className="absolute"
            style={{ left: "4.1176471%", top: "6.7567568%", width: "43.5294118%", height: "86.4864865%" }}
          />
          <span
            className="absolute text-left text-white"
            style={{
              left: "50%",
              top: "22.9729730%",
              width: toSceneCqw(56),
              height: toSceneCqw(40),
              fontFamily: '"Noto Serif SC", serif',
              fontWeight: 600,
              fontSize: toSceneCqw(28),
              lineHeight: toSceneCqw(40),
              textShadow: `0 0 ${toSceneCqw(2)} #000000`,
            }}
          >
            返回
          </span>
        </button>
    </section>
    </div>
    {viewerMedia && selectedPhoto ? (
      <WishBoxPhotoViewer media={viewerMedia} onClose={() => onClosePhoto(selectedPhoto)} />
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
