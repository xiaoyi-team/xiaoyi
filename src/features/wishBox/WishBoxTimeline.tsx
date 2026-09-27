import { useEffect, useRef } from "react";
import backDoubleChevron from "../../assets/wish-box/back-double-chevron.svg";
import irisCardFrame from "../../assets/wish-box/timeline-card-frame-iris.png";
import roseCardFrame from "../../assets/wish-box/timeline-card-frame-rose.png";
import edgeDecoration from "../../assets/wish-box/timeline-edge-decoration.png";
import gardenBackground from "../../assets/wish-box/timeline-garden-background.png";
import vineTile from "../../assets/wish-box/timeline-vine-tile.png";

type TimelineCardVariant = "rose" | "iris";

type TimelineActivityFixture = {
  variant: TimelineCardVariant;
  cardY: number;
  title: string;
  date: string;
};

type TimelineCardLayout = {
  photo: { x: number; y: number; width: number; height: number };
  frame: {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  title: { x: number; y: number; width: number; height: number };
  date: { x: number; y: number; width: number; height: number };
};

type TimelineMarkerFixture = {
  slotIndex: number;
  text: string;
  y: number;
  width: number;
  height: number;
  textWidth: number;
};

const SLOT_SPACING = 215;
const CARD_WIDTH = 350;
const CARD_HEIGHT = 238;
const PATH_HEIGHT = 670;
const VINE_Y = 198;
const VINE_HEIGHT = 288;

const TIMELINE_CARD_LAYOUTS: Record<TimelineCardVariant, TimelineCardLayout> = {
  rose: {
    photo: { x: 14, y: 14, width: 322, height: 151 },
    frame: {
      src: roseCardFrame,
      x: 0,
      y: 0,
      width: 350,
      height: 225,
    },
    title: { x: 48, y: 162, width: 272, height: 32 },
    date: { x: 48, y: 191, width: 272, height: 24 },
  },
  iris: {
    photo: { x: 12, y: 17, width: 326, height: 143 },
    frame: {
      src: irisCardFrame,
      x: -18,
      y: -12,
      width: 386,
      height: 248,
    },
    title: { x: 48, y: 155, width: 272, height: 32 },
    date: { x: 48, y: 188, width: 272, height: 24 },
  },
};

const TIMELINE_ACTIVITY_FIXTURE: TimelineActivityFixture[] = [
  {
    title: "雪落时的来信",
    date: "2024.12.20 – 2025.01.05",
    variant: "rose",
    cardY: 28,
  },
  {
    title: "生日里的约定",
    date: "2025.11.23 – 2025.12.07",
    variant: "rose",
    cardY: 378,
  },
  {
    title: "冬日共赴",
    date: "2025.12.12 – 2026.01.02",
    variant: "rose",
    cardY: 28,
  },
  {
    title: "新岁与你",
    date: "2026.01.01 – 2026.01.18",
    variant: "iris",
    cardY: 378,
  },
  {
    title: "心动来信",
    date: "2026.02.14 – 2026.03.01",
    variant: "rose",
    cardY: 28,
  },
  {
    title: "春日漫游",
    date: "2026.03.18 – 2026.04.08",
    variant: "rose",
    cardY: 378,
  },
  {
    title: "花间序曲",
    date: "2026.04.20 – 2026.05.10",
    variant: "rose",
    cardY: 28,
  },
  {
    title: "与你的第五季",
    date: "2026.05.20 – 2026.06.15",
    variant: "rose",
    cardY: 414,
  },
  {
    title: "夏日的风",
    date: "2026.06.21 – 2026.07.12",
    variant: "rose",
    cardY: 28,
  },
  {
    title: "星光留影",
    date: "2026.07.18 – 2026.08.08",
    variant: "rose",
    cardY: 378,
  },
  {
    title: "七夕花笺",
    date: "2026.08.19 – 2026.09.02",
    variant: "iris",
    cardY: 28,
  },
  {
    title: "鸢尾盛放之时",
    date: "2026.09.01 – 2026.09.28",
    variant: "iris",
    cardY: 414,
  },
];

const TIMELINE_MARKERS: TimelineMarkerFixture[] = [
  { slotIndex: 0, text: "2025", y: 266, width: 99, height: 38, textWidth: 37 },
  {
    slotIndex: 4,
    text: "2026·02",
    y: 266,
    width: 122,
    height: 36,
    textWidth: 60,
  },
  {
    slotIndex: 7,
    text: "2026·04",
    y: 378,
    width: 122,
    height: 36,
    textWidth: 60,
  },
  {
    slotIndex: 8,
    text: "2026·06",
    y: 266,
    width: 122,
    height: 36,
    textWidth: 60,
  },
  {
    slotIndex: 11,
    text: "2026·09",
    y: 378,
    width: 122,
    height: 36,
    textWidth: 60,
  },
];

const toSceneCqw = (designPixels: number) =>
  `${(designPixels / 19.2).toFixed(7)}cqw`;

const getPathWidth = (itemCount: number) =>
  itemCount > 0 ? (itemCount - 1) * SLOT_SPACING + CARD_WIDTH : 0;

function TimelineCard({
  activity,
  slotIndex,
}: {
  activity: TimelineActivityFixture;
  slotIndex: number;
}) {
  const layout = TIMELINE_CARD_LAYOUTS[activity.variant];

  return (
    <div
      data-timeline-card={activity.variant}
      data-timeline-slot-index={slotIndex}
      className="pointer-events-none absolute"
      style={{
        left: toSceneCqw(slotIndex * SLOT_SPACING),
        top: toSceneCqw(activity.cardY),
        width: toSceneCqw(CARD_WIDTH),
        height: toSceneCqw(CARD_HEIGHT),
        borderRadius: toSceneCqw(8),
        overflow: "visible",
        boxShadow: `0 ${toSceneCqw(5)} ${toSceneCqw(22)} ${toSceneCqw(2)} rgba(194, 176, 138, 0.2)`,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute"
        style={{
          left: toSceneCqw(layout.photo.x),
          top: toSceneCqw(layout.photo.y),
          width: toSceneCqw(layout.photo.width),
          height: toSceneCqw(layout.photo.height),
          backgroundColor: "#E6E1D7",
        }}
      />
      <img
        src={layout.frame.src}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="pointer-events-none absolute select-none"
        style={{
          left: toSceneCqw(layout.frame.x),
          top: toSceneCqw(layout.frame.y),
          width: toSceneCqw(layout.frame.width),
          height: toSceneCqw(layout.frame.height),
          maxWidth: "none",
        }}
      />
      <div
        className="absolute flex items-center justify-center text-center"
        style={{
          left: toSceneCqw(layout.title.x),
          top: toSceneCqw(layout.title.y),
          width: toSceneCqw(layout.title.width),
          height: toSceneCqw(layout.title.height),
          fontFamily: '"Noto Serif SC", serif',
          fontSize: toSceneCqw(20),
          fontWeight: 600,
          lineHeight: toSceneCqw(32),
          letterSpacing: 0,
          color: "#614B35",
        }}
      >
        {activity.title}
      </div>
      <div
        className="absolute flex items-center justify-center text-center"
        style={{
          left: toSceneCqw(layout.date.x),
          top: toSceneCqw(layout.date.y),
          width: toSceneCqw(layout.date.width),
          height: toSceneCqw(layout.date.height),
          fontFamily: '"Noto Serif SC", serif',
          fontSize: toSceneCqw(14),
          fontWeight: 400,
          lineHeight: toSceneCqw(24),
          letterSpacing: 0,
          color: "#614B35",
        }}
      >
        {activity.date}
      </div>
    </div>
  );
}

function TimelineMarker({ marker }: { marker: TimelineMarkerFixture }) {
  return (
    <div
      aria-hidden="true"
      data-timeline-marker={marker.text}
      className="pointer-events-none absolute flex items-center justify-center"
      style={{
        left: toSceneCqw(marker.slotIndex * SLOT_SPACING),
        top: toSceneCqw(marker.y),
        width: toSceneCqw(marker.width),
        height: toSceneCqw(marker.height),
        boxSizing: "border-box",
        padding: `${toSceneCqw(6)} ${toSceneCqw(30)}`,
        border: `${toSceneCqw(1)} solid #F3DDB0`,
        borderRadius: toSceneCqw(16),
        backgroundColor: "rgba(128, 106, 77, 0.88)",
        color: "#FFF4D5",
        fontFamily: '"Noto Serif SC", serif',
        fontSize: toSceneCqw(16),
        fontWeight: 500,
        lineHeight: toSceneCqw(24),
        letterSpacing: 0,
        textAlign: "left",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          display: "block",
          width: toSceneCqw(marker.textWidth),
          height: toSceneCqw(24),
          lineHeight: toSceneCqw(24),
        }}
      >
        {marker.text}
      </span>
    </div>
  );
}

type WishBoxTimelineProps = {
  onBack: () => void;
};

function WishBoxTimeline({ onBack }: WishBoxTimelineProps) {
  const backButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    backButtonRef.current?.focus();
  }, []);

  return (
    <div className="absolute inset-0 isolate overflow-hidden bg-white">
      <img
        src={gardenBackground}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <img
        src={edgeDecoration}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute overflow-hidden"
        style={{
          left: "5.2604167%",
          top: "23.7962963%",
          width: "91.6666667%",
          height: "65.7407407%",
        }}
      >
        <div
          data-timeline-path
          className="absolute left-0 top-0"
          style={{
            width: toSceneCqw(getPathWidth(TIMELINE_ACTIVITY_FIXTURE.length)),
            height: toSceneCqw(PATH_HEIGHT),
          }}
        >
          <div
            className="absolute left-0"
            style={{
              top: toSceneCqw(VINE_Y),
              width: "100%",
              height: toSceneCqw(VINE_HEIGHT),
              backgroundImage: `url(${vineTile})`,
              backgroundRepeat: "repeat-x",
              backgroundPosition: "0 0",
              backgroundSize: "45cqw 15cqw",
            }}
          />
          {TIMELINE_ACTIVITY_FIXTURE.map((activity, slotIndex) => (
            <TimelineCard
              key={`${slotIndex}-${activity.title}`}
              activity={activity}
              slotIndex={slotIndex}
            />
          ))}
          {TIMELINE_MARKERS.map((marker) => (
            <TimelineMarker key={marker.slotIndex} marker={marker} />
          ))}
        </div>
      </div>

      <button
        ref={backButtonRef}
        type="button"
        onClick={onBack}
        aria-label="返回心愿盒主页"
        className="absolute overflow-hidden border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4c392b]"
        style={{
          left: "2.1354167%",
          top: "2.1296296%",
          width: "8.8541667%",
          height: "6.8518519%",
          borderRadius: "1.1458333cqw",
          boxShadow: "0 0.2083333cqw 0.390625cqw #000",
        }}
      >
        <img
          src={backDoubleChevron}
          alt=""
          aria-hidden="true"
          className="absolute"
          style={{
            left: "4.1176471%",
            top: "6.7567568%",
            width: "43.5294118%",
            height: "86.4864865%",
          }}
        />
        <span
          className="absolute text-left text-white"
          style={{
            left: "52.3529412%",
            top: "20.2702703%",
            width: "18.8235294%",
            height: "32.4324324%",
            fontFamily: '"Noto Serif SC", serif',
            fontWeight: 500,
            fontSize: "0.8333333cqw",
            lineHeight: "1.25cqw",
            letterSpacing: 0,
            textShadow: "0 0 0.1041667cqw #000",
          }}
        >
          返回
        </span>
      </button>
    </div>
  );
}

export default WishBoxTimeline;
