import { Fragment, type CSSProperties, type ReactNode } from "react";
import boardDecoration from "../../assets/wish-box/announcement-board-decoration.png";
import headerPetalLeft from "../../assets/wish-box/announcement-header-petal-left.png";
import headerPetalCenter from "../../assets/wish-box/announcement-header-petal-center.png";
import headerPetalRight from "../../assets/wish-box/announcement-header-petal-right.png";
import summaryPetal from "../../assets/wish-box/announcement-summary-petal.png";

const stars = [
  [120, 300, 12],
  [1480, 300, 16],
  [352, 272, 20],
  [1030, 332, 12],
  [1240, 280, 12],
  [748, 248, 16],
  [90, 670, 12],
  [1500, 670, 16],
  [535, 815, 20],
  [460, 490, 20],
  [1055, 815, 12],
  [1448, 436, 20],
  [1415, 660, 20],
  [1232, 582, 20],
  [772, 704, 20],
  [370, 622, 20],
  [150, 438, 20],
  [924, 455, 16],
  [1402, 518, 16],
  [1144, 714, 16],
] as const;

const giftItemSlots = [
  { top: "0%", height: "18.54839%" },
  { top: "18.54839%", height: "41.93548%" },
  { top: "62.09677%", height: "18.54839%" },
] as const;

export type AnnouncementDisplayFixture = {
  title: string;
  subtitle: string;
  eyebrow: string;
  summary: string;
  gifts: ReadonlyArray<string>;
  giftCaption: string;
  location: string;
  time: string;
  requirements: string;
  requirementsExtra: string;
  notes: string;
  footerDescription: string;
  footerTags: ReadonlyArray<string>;
  footerEnglishCaption: string;
};

type InfoCardProps = {
  title: string;
  titleColor: string;
  fill: string;
  borderColor: string;
  style: CSSProperties;
  headingStyle: CSSProperties;
  bodyStyle: CSSProperties;
  bodyClassName?: string;
  className?: string;
  children: ReactNode;
};

function InfoCard({
  title,
  titleColor,
  fill,
  borderColor,
  style,
  headingStyle,
  bodyStyle,
  bodyClassName = "items-center justify-center text-center",
  className = "",
  children,
}: InfoCardProps) {
  return (
    <section
      aria-label={title}
      className={`announcement-info-card absolute overflow-hidden ${className}`}
      style={{
        ...style,
        left: `var(--announcement-flow-left, ${style.left})`,
        top: `var(--announcement-flow-top, ${style.top})`,
        width: `var(--announcement-flow-width, ${style.width})`,
        height: `var(--announcement-flow-height, ${style.height})`,
        boxSizing: "border-box",
        backgroundColor: fill,
        border: `var(--announcement-card-border-width, 0.062496cqw) solid ${borderColor}`,
        borderRadius: "var(--announcement-card-radius, 1.125cqw)",
      }}
    >
      <div
        className="announcement-info-heading absolute grid place-items-center"
        style={{
          ...headingStyle,
          left: `var(--announcement-flow-left, ${headingStyle.left})`,
          top: `var(--announcement-flow-top, ${headingStyle.top})`,
          width: `var(--announcement-flow-width, ${headingStyle.width})`,
          height: "var(--announcement-heading-height, 2.750004cqw)",
          borderRadius: "var(--announcement-heading-radius, 0.75cqw)",
          backgroundColor: titleColor,
        }}
      >
        <h2
          className="m-0 text-center"
          style={{
            color: "#FFFCF5",
            fontWeight: 600,
            fontSize: "var(--announcement-heading-font-size, 1.5cqw)",
            lineHeight: "var(--announcement-heading-line-height, 2.25cqw)",
          }}
        >
          {title}
        </h2>
      </div>
      <div
        className={`announcement-info-body absolute flex min-h-0 ${bodyClassName}`}
        style={{
          ...bodyStyle,
          left: `var(--announcement-flow-left, ${bodyStyle.left})`,
          top: `var(--announcement-flow-top, ${bodyStyle.top})`,
          width: `var(--announcement-flow-width, ${bodyStyle.width})`,
          height: `var(--announcement-flow-height, ${bodyStyle.height})`,
        }}
      >
        {children}
      </div>
    </section>
  );
}

type AnnouncementBoardProps = {
  announcement: AnnouncementDisplayFixture;
};

function AnnouncementBoard({ announcement }: AnnouncementBoardProps) {
  return (
    <div
      className="announcement-board relative isolate h-full w-full overflow-hidden bg-[#f6e9e1]"
      style={{ aspectRatio: "var(--announcement-board-aspect-ratio, 1600 / 900)", containerType: "inline-size" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left: "var(--announcement-outer-inset, 1.5%)",
          top: "var(--announcement-outer-inset, 2.66667%)",
          right: "var(--announcement-outer-inset, 1.5%)",
          bottom: "var(--announcement-outer-inset, 2.66667%)",
          border: "var(--announcement-outer-border-width, 0.125004cqw) solid #b8853d",
          borderRadius: "var(--announcement-card-radius, 1.125cqw)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          left: "var(--announcement-inner-inset, 2.375%)",
          top: "var(--announcement-inner-inset, 4.22222%)",
          right: "var(--announcement-inner-inset, 2.375%)",
          bottom: "var(--announcement-inner-inset, 4.22222%)",
          border: "var(--announcement-card-border-width, 0.062496cqw) solid #dbad61",
          borderRadius: "var(--announcement-inner-radius, 0.875004cqw)",
        }}
      />

      <div
        className="announcement-content absolute inset-0 z-10"
        style={{ fontFamily: '"Noto Serif SC", serif' }}
      >
        <header
          className="announcement-header absolute overflow-hidden text-center"
          style={{
            left: "var(--announcement-flow-left, 11.875%)",
            top: "var(--announcement-flow-top, 7.55556%)",
            width: "var(--announcement-header-width, 76.25%)",
            height: "var(--announcement-flow-height, 19.55556%)",
            boxSizing: "border-box",
            backgroundColor: "#FEF8EE",
            border: "var(--announcement-header-border-width, 0.09375cqw) solid #C7944D",
            borderRadius: "var(--announcement-header-radius, 2.124996cqw)",
          }}
        >
          <h1
            className="absolute m-0 flex items-center justify-center text-center"
            style={{
              left: "var(--announcement-flow-left, 5.7377%)",
              top: "var(--announcement-flow-top, 10.22727%)",
              width: "var(--announcement-flow-width, 88.52459%)",
              height: "var(--announcement-flow-height, 39.77273%)",
              color: "#1F427A",
              fontWeight: 700,
              fontSize: "var(--announcement-title-font-size, 3cqw)",
              lineHeight: "var(--announcement-title-line-height, 3.999996cqw)",
            }}
          >
            {announcement.title}
          </h1>
          <p
            className="absolute m-0 flex items-center justify-center text-center"
            style={{
              left: "var(--announcement-flow-left, 22.95082%)",
              top: "var(--announcement-flow-top, 48.86364%)",
              width: "var(--announcement-flow-width, 54.09836%)",
              height: "var(--announcement-flow-height, 25%)",
              color: "#8C522E",
              fontWeight: 600,
              fontSize: "var(--announcement-subtitle-font-size, 1.749996cqw)",
              lineHeight: "var(--announcement-subtitle-line-height, 2.499996cqw)",
            }}
          >
            {announcement.subtitle}
          </p>
          <p
            className="absolute m-0 flex items-center justify-center text-center"
            style={{
              left: "var(--announcement-flow-left, 31.14754%)",
              top: "var(--announcement-flow-top, 75%)",
              width: "var(--announcement-flow-width, 37.70492%)",
              height: "var(--announcement-flow-height, 15.90909%)",
              color: "#946B3D",
              fontWeight: 500,
              fontSize: "var(--announcement-eyebrow-font-size, 0.75cqw)",
              lineHeight: "var(--announcement-eyebrow-line-height, 1.250004cqw)",
              letterSpacing: "0.08em",
            }}
          >
            {announcement.eyebrow}
          </p>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bg-[#dba640]"
            style={{
              left: "81.88525%",
              top: "63.63636%",
              width: "1.63934%",
              height: "11.36364%",
              clipPath:
                "polygon(50% 0%, 56% 44%, 100% 50%, 56% 56%, 50% 100%, 44% 56%, 0% 50%, 44% 44%)",
            }}
          />
          <img
            src={headerPetalLeft}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              left: "11.47541%",
              top: "43.75%",
              width: "2.29508%",
              height: "11.93182%",
            }}
          />
          <img
            src={headerPetalCenter}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              left: "71.39344%",
              top: "55.11364%",
              width: "2.29508%",
              height: "11.93182%",
            }}
          />
          <img
            src={headerPetalRight}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              left: "91.72131%",
              top: "67.04545%",
              width: "2.54098%",
              height: "13.63636%",
            }}
          />
        </header>

        <section
          aria-label="活动简介"
          className="announcement-summary absolute overflow-hidden"
          style={{
            left: "var(--announcement-flow-left, 16.25%)",
            top: "var(--announcement-flow-top, 28%)",
            width: "var(--announcement-summary-width, 67.5%)",
            height: "var(--announcement-flow-height, 11.77778%)",
            boxSizing: "border-box",
            backgroundColor: "#FCF7EC",
            border: "var(--announcement-card-border-width, 0.062496cqw) solid #D6AB6B",
            borderRadius: "var(--announcement-summary-radius, 1.5cqw)",
          }}
        >
          <p
            className="absolute m-0 flex items-center justify-center whitespace-pre-line text-center"
            style={{
              left: "var(--announcement-flow-left, 3.7037%)",
              top: "var(--announcement-flow-top, 2.83019%)",
              width: "var(--announcement-flow-width, 92.59259%)",
              height: "var(--announcement-flow-height, 94.33962%)",
              color: "#243D61",
              fontWeight: 400,
              fontSize: "var(--announcement-body-font-size, 0.875004cqw)",
              lineHeight: "var(--announcement-body-line-height, 1.5cqw)",
            }}
          >
            {announcement.summary}
          </p>
          <img
            src={summaryPetal}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute"
            style={{
              left: "2.40741%",
              top: "84.90566%",
              width: "2.59259%",
              height: "15.09434%",
            }}
          />
        </section>

        <div className="announcement-body">
          <div className="announcement-first-row">
            <InfoCard
              className="announcement-gifts"
              title="漂亮哥哥的请客清单"
              titleColor="#D46B75"
              fill="#FDF6F0"
              borderColor="#D4A161"
              style={{
                left: "7.5%",
                top: "41.11111%",
                width: "26.25%",
                height: "40%",
              }}
              headingStyle={{ left: "4.28571%", top: "5%", width: "91.42857%" }}
              bodyStyle={{
                left: "20.95238%",
                top: "25.55556%",
                width: "71.42857%",
                height: "68.88889%",
              }}
              bodyClassName="flex-col items-stretch justify-between text-left"
            >
              <div className="announcement-gift-content relative h-full w-full">
                <ul className="m-0 list-none p-0">
                  {giftItemSlots.map((slot, index) => {
                    const gift = announcement.gifts[index];
                    if (gift === undefined) return null;

                    return (
                      <li
                        key={index}
                        className="announcement-gift-item absolute flex w-full flex-col justify-center text-left"
                        style={{
                          ...slot,
                          top: `var(--announcement-flow-top, ${slot.top})`,
                          height: `var(--announcement-flow-height, ${slot.height})`,
                          color: "#1F3B6B",
                          fontWeight: 400,
                          fontSize: "var(--announcement-body-font-size, 1.5cqw)",
                          lineHeight: "var(--announcement-body-line-height, 2.499996cqw)",
                          gap: "var(--announcement-gift-line-gap, 1.5cqw)",
                        }}
                      >
                        {gift.split(/\r?\n/).map((line, lineIndex) => (
                          <span
                            key={lineIndex}
                            className="w-full whitespace-pre-wrap"
                          >
                            {line}
                          </span>
                        ))}
                      </li>
                    );
                  })}
                </ul>
                <p
                  className="announcement-gift-caption absolute m-0 flex items-center justify-center text-center"
                  style={{
                    left: "var(--announcement-flow-left, -9.33333%)",
                    bottom: "var(--announcement-flow-bottom, 0px)",
                    width: "100%",
                    height: "var(--announcement-flow-height, 1.5cqw)",
                    color: "#A16E52",
                    fontWeight: 400,
                    fontSize: "var(--announcement-caption-font-size, 0.75cqw)",
                    lineHeight: "var(--announcement-caption-line-height, 1.250004cqw)",
                  }}
                >
                  {announcement.giftCaption}
                </p>
              </div>
            </InfoCard>

            <div className="announcement-place-time">
              <InfoCard
                title="领取地点"
                titleColor="#427AB8"
                fill="#F6F8FB"
                borderColor="#C7A16B"
                style={{
                  left: "35.3125%",
                  top: "41.11111%",
                  width: "24.6875%",
                  height: "18.88889%",
                }}
                headingStyle={{
                  left: "4.55696%",
                  top: "8.23529%",
                  width: "90.88608%",
                }}
                bodyStyle={{
                  left: "7.08861%",
                  top: "36.47059%",
                  width: "85.82278%",
                  height: "56.47059%",
                }}
              >
                <p
                  className="m-0 flex w-full flex-col text-center"
                  style={{
                    color: "#1F3B66",
                    fontWeight: 400,
                    fontSize: "var(--announcement-body-font-size, 1.250004cqw)",
                    lineHeight: "var(--announcement-body-line-height, 2.25cqw)",
                    gap: "var(--announcement-text-line-gap, 1.250004cqw)",
                  }}
                >
                  {announcement.location.split(/\r?\n/).map((line, index) => (
                    <span key={index} className="w-full whitespace-pre-wrap">
                      {line}
                    </span>
                  ))}
                </p>
              </InfoCard>

              <InfoCard
                title="领取时间"
                titleColor="#C75C61"
                fill="#FEF3F0"
                borderColor="#C7A16B"
                style={{
                  left: "35.3125%",
                  top: "62.22222%",
                  width: "24.6875%",
                  height: "18.88889%",
                }}
                headingStyle={{
                  left: "4.55696%",
                  top: "8.23529%",
                  width: "90.88608%",
                }}
                bodyStyle={{
                  left: "5.06329%",
                  top: "36.47059%",
                  width: "89.87342%",
                  height: "56.47059%",
                }}
              >
                <p
                  className="m-0 flex w-full flex-col text-center"
                  style={{
                    color: "#1F3B66",
                    fontWeight: 400,
                    fontSize: "var(--announcement-body-font-size, 1.250004cqw)",
                    lineHeight: "var(--announcement-body-line-height, 2.25cqw)",
                    gap: "var(--announcement-text-line-gap, 1.250004cqw)",
                  }}
                >
                  {announcement.time.split(/\r?\n/).map((line, index) => (
                    <span key={index} className="w-full whitespace-pre-wrap">
                      {line}
                    </span>
                  ))}
                </p>
              </InfoCard>

            </div>
          </div>
          <InfoCard
            className="announcement-requirements"
            title="领取条件（需同时满足）"
            titleColor="#4273B2"
            fill="#F5F7FB"
            borderColor="#C7A16B"
            style={{
              left: "61.5625%",
              top: "41.11111%",
              width: "30.9375%",
              height: "22.22222%",
            }}
            headingStyle={{ left: "3.63636%", top: "6%", width: "92.72727%" }}
            bodyStyle={{
              left: "4.0404%",
              top: "32%",
              width: "91.91919%",
              height: "68%",
            }}
            bodyClassName="items-stretch"
          >
            <div className="announcement-requirements-content relative h-full w-full">
              <p
                className="announcement-paragraphs absolute m-0 w-full whitespace-pre-wrap text-left"
                style={{
                  left: "var(--announcement-flow-left, 0px)",
                  top: "var(--announcement-flow-top, 0px)",
                  height: "var(--announcement-flow-height, 79.41176%)",
                  color: "#1F3661",
                  fontWeight: 400,
                  fontSize: "var(--announcement-body-font-size, 0.75cqw)",
                  lineHeight: "var(--announcement-body-line-height, 1.250004cqw)",
                }}
              >
                {announcement.requirements.split(/\r?\n/).map((line, index, lines) => (
                  <Fragment key={index}>
                    <span>{line}</span>
                    {index < lines.length - 1 ? "\n" : null}
                  </Fragment>
                ))}
              </p>
              <p
                className="absolute m-0 flex items-center justify-center text-center"
                style={{
                  left: "var(--announcement-flow-left, 0.43956%)",
                  top: "var(--announcement-flow-top, 79.41176%)",
                  width: "var(--announcement-flow-width, 99.12088%)",
                  height: "var(--announcement-flow-height, 14.70588%)",
                  color: "#2E61A3",
                  fontWeight: 400,
                  fontSize: "var(--announcement-body-font-size, 0.75cqw)",
                  lineHeight: "var(--announcement-body-line-height, 1.250004cqw)",
                }}
              >
                {announcement.requirementsExtra}
              </p>
            </div>
          </InfoCard>

          <InfoCard
            className="announcement-notes"
            title="注意事项"
            titleColor="#4070A8"
            fill="#FBF6F0"
            borderColor="#C7A16B"
            style={{
              left: "61.5625%",
              top: "65.55556%",
              width: "30.9375%",
              height: "15.55556%",
            }}
            headingStyle={{
              left: "3.63636%",
              top: "7.14286%",
              width: "92.72727%",
            }}
            bodyStyle={{
              left: "4.0404%",
              top: "40%",
              width: "91.91919%",
              height: "57.14286%",
            }}
            bodyClassName="items-start justify-start text-left"
          >
            <p
              className="announcement-paragraphs m-0 h-full w-full whitespace-pre-wrap"
              style={{
                color: "#243857",
                fontWeight: 400,
                fontSize: "var(--announcement-body-font-size, 0.75cqw)",
                lineHeight: "var(--announcement-body-line-height, 1.250004cqw)",
              }}
            >
              {announcement.notes.split(/\r?\n/).map((line, index, lines) => (
                <Fragment key={index}>
                  <span>{line}</span>
                  {index < lines.length - 1 ? "\n" : null}
                </Fragment>
              ))}
            </p>
          </InfoCard>

          <footer
            className="announcement-footer absolute overflow-hidden"
            style={{
              left: "var(--announcement-flow-left, 10%)",
              top: "var(--announcement-flow-top, 84.44444%)",
              width: "var(--announcement-flow-width, 80%)",
              height: "var(--announcement-flow-height, 10%)",
              backgroundColor: "#F9E9D7",
            }}
          >
            <p
              className="absolute m-0 flex items-center justify-center text-center"
              style={{
                left: "var(--announcement-flow-left, 15.625%)",
                top: "var(--announcement-flow-top, 0%)",
                width: "var(--announcement-flow-width, 68.75%)",
                height: "var(--announcement-flow-height, 35.55556%)",
                color: "#2E4261",
                fontWeight: 400,
                fontSize: "var(--announcement-body-font-size, 1.125cqw)",
                lineHeight: "var(--announcement-body-line-height, 2.000004cqw)",
              }}
            >
              {announcement.footerDescription}
            </p>
            <p
              className="absolute m-0 flex items-center justify-center whitespace-pre-wrap text-center"
              style={{
                left: "var(--announcement-flow-left, 7.8125%)",
                top: "var(--announcement-flow-top, 42.22222%)",
                width: "var(--announcement-flow-width, 84.375%)",
                height: "var(--announcement-flow-height, 31.11111%)",
                color: "#1F4D8C",
                fontWeight: 400,
                fontSize: "var(--announcement-body-font-size, 0.999996cqw)",
                lineHeight: "var(--announcement-body-line-height, 1.749996cqw)",
              }}
            >
              {announcement.footerTags.join("   ")}
            </p>
            <p
              className="absolute m-0 flex items-center justify-center whitespace-pre-wrap text-center"
              style={{
                left: "var(--announcement-flow-left, 16.40625%)",
                top: "var(--announcement-flow-top, 75.55556%)",
                width: "var(--announcement-flow-width, 67.1875%)",
                height: "var(--announcement-flow-height, 22.22222%)",
                color: "#8C663D",
                fontWeight: 400,
                fontSize: "var(--announcement-caption-font-size, 0.75cqw)",
                lineHeight: "var(--announcement-caption-line-height, 1.250004cqw)",
              }}
            >
              {announcement.footerEnglishCaption}
            </p>
          </footer>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="announcement-stars pointer-events-none absolute inset-0 z-[15]"
      >
        {stars.map(([x, y, size]) => (
          <span
            key={`${x}-${y}`}
            className="pointer-events-none absolute bg-[#dba640]"
            style={{
              left: `${(x / 1600) * 100}%`,
              top: `${(y / 900) * 100}%`,
              width: `${(size / 1600) * 100}%`,
              height: `${(size / 900) * 100}%`,
              clipPath:
                "polygon(50% 0%, 56% 44%, 100% 50%, 56% 56%, 50% 100%, 44% 56%, 0% 50%, 44% 44%)",
            }}
          />
        ))}
      </div>

      <img
        src={boardDecoration}
        alt=""
        aria-hidden="true"
        className="announcement-decoration-desktop pointer-events-none absolute inset-0 z-20 h-full w-full"
      />
      <div aria-hidden="true" className="announcement-decoration-cap announcement-decoration-top">
        <img src={boardDecoration} alt="" />
      </div>
      <div aria-hidden="true" className="announcement-decoration-cap announcement-decoration-bottom">
        <img src={boardDecoration} alt="" />
      </div>
    </div>
  );
}

export default AnnouncementBoard;
