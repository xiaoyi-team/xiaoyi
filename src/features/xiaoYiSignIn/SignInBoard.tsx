import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { DEMO_MONTH, DEMO_REWARD_TARGET, DEMO_TODAY, getDemoDay, type SignInDemoState } from "./sign-in-demo";
import YearMonthPicker from "./YearMonthPicker";
import { createSignInMonth, isSupportedSignInDate, SIGN_IN_DEMO_DATE } from "./sign-in-dates";
import type { SignInCalendarView } from "./useSignInCalendar";
import type { SignInStatView } from "./useSignInStat";
import type { SignInQuoteView } from "./useSignInQuote";
import bindingHole from "../../assets/xiao-yi-sign-in/binding-hole.svg";
import bindingRing from "../../assets/xiao-yi-sign-in/binding-ring.svg";
import bottomFlourish from "../../assets/xiao-yi-sign-in/bottom-flourish.svg";
import calendarArrows from "../../assets/xiao-yi-sign-in/calendar-arrows.svg";
import calendarPaper from "../../assets/xiao-yi-sign-in/calendar-paper.png";
import coverFold from "../../assets/xiao-yi-sign-in/cover-fold.png";
import coverLeft from "../../assets/xiao-yi-sign-in/cover-left.png";
import coverRight from "../../assets/xiao-yi-sign-in/cover-right.png";
import gift30 from "../../assets/xiao-yi-sign-in/gift-30.png";
import gift111 from "../../assets/xiao-yi-sign-in/gift-111.png";
import gift365 from "../../assets/xiao-yi-sign-in/gift-365.png";
import giftIcon from "../../assets/xiao-yi-sign-in/gift-icon.svg";
import iris from "../../assets/xiao-yi-sign-in/iris.png";
import paperclip from "../../assets/xiao-yi-sign-in/paperclip.svg";
import photoCover from "../../assets/xiao-yi-sign-in/photo-cover.png";
import photoDog from "../../assets/xiao-yi-sign-in/photo-dog.png";
import photoRace from "../../assets/xiao-yi-sign-in/photo-race.png";
import plantLines from "../../assets/xiao-yi-sign-in/plant-lines.svg";
import progressDot from "../../assets/xiao-yi-sign-in/progress-dot.svg";
import quoteLabelPaper from "../../assets/xiao-yi-sign-in/quote-label-paper.png";
import quotePaper from "../../assets/xiao-yi-sign-in/quote-paper.png";
import reward30 from "../../assets/xiao-yi-sign-in/reward-30-preview.png";
import reward111 from "../../assets/xiao-yi-sign-in/reward-111-preview.png";
import reward365 from "../../assets/xiao-yi-sign-in/reward-365-preview.png";
import rewardRivet from "../../assets/xiao-yi-sign-in/reward-rivet.svg";
import rewardsPaper from "../../assets/xiao-yi-sign-in/rewards-paper.png";
import rewardsPaperMobile from "../../assets/xiao-yi-sign-in/rewards-paper-mobile.png";
import seal from "../../assets/xiao-yi-sign-in/seal.svg";
import selectedDateRing from "../../assets/xiao-yi-sign-in/selected-date-ring.svg";
import signInStamp from "../../assets/xiao-yi-sign-in/sign-in-stamp.svg";
import starBlue from "../../assets/xiao-yi-sign-in/star-blue.svg";
import starBlueLarge from "../../assets/xiao-yi-sign-in/star-blue-large.svg";
import starBlueSmall from "../../assets/xiao-yi-sign-in/star-blue-small.svg";
import starGold from "../../assets/xiao-yi-sign-in/star-gold.svg";
import starGoldLarge from "../../assets/xiao-yi-sign-in/star-gold-large.svg";
import starGoldRewards from "../../assets/xiao-yi-sign-in/star-gold-rewards.svg";
import starGoldToday from "../../assets/xiao-yi-sign-in/star-gold-today.svg";
import titlePaper from "../../assets/xiao-yi-sign-in/title-paper.png";
import titlePin from "../../assets/xiao-yi-sign-in/title-pin.svg";
import titleStar from "../../assets/xiao-yi-sign-in/title-star.svg";
import todayBlueCircle from "../../assets/xiao-yi-sign-in/today-blue-circle.svg";
import todayGoldRing from "../../assets/xiao-yi-sign-in/today-gold-ring.svg";
import todayTagPaper from "../../assets/xiao-yi-sign-in/today-tag-paper.png";
import todayTagPaperMobile from "../../assets/xiao-yi-sign-in/today-tag-paper-mobile.png";

// DEV and the retained today treatment use September 2026 prototype fixtures.
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const rewards = [
  { days: 30, gift: gift30, preview: reward30 },
  { days: 111, gift: gift111, preview: reward111 },
  { days: 365, gift: gift365, preview: reward365 },
];

type ArtworkProps = {
  className?: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

function Artwork({ src, x, y, width, height, className = "" }: ArtworkProps) {
  return (
    <img
      className={`sign-in-board__art ${className}`.trim()}
      src={src}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{
        "--art-x": `${x}px`,
        "--art-y": `${y}px`,
        "--art-width": `${width}px`,
        "--art-height": `${height}px`,
      } as CSSProperties}
    />
  );
}

export type SignInCalendarBinding = {
  view: SignInCalendarView;
  todayDate: string;
  yearMonth: string;
  selectedDate: string | null;
  onChangeMonth: (yearMonth: string) => void;
  onSelectDate: (date: string) => void;
  onReturnToday: () => void;
  onSelectDemoDate: () => void;
};

type SignInBoardProps = {
  titleId: string;
  mobile: boolean;
  demo: SignInDemoState;
  statView?: SignInStatView;
  quoteView?: SignInQuoteView;
  calendar?: SignInCalendarBinding;
  onSignIn: () => void;
};

function SignInBoard({ titleId, mobile, demo, statView, quoteView, calendar, onSignIn }: SignInBoardProps) {
  const [demoSelectedDay, setDemoSelectedDay] = useState(DEMO_TODAY);
  const yearMonth = calendar?.yearMonth ?? "2026-09";
  const grid = createSignInMonth(yearMonth);
  const dateForDay = (day: number) => `${yearMonth}-${String(day).padStart(2, "0")}`;
  const selectedDate = calendar ? calendar.selectedDate : dateForDay(demoSelectedDay);
  const selectedDay = selectedDate ? Number(selectedDate.slice(-2)) : null;
  const demoToday = SIGN_IN_DEMO_DATE;
  const todayDate = calendar?.todayDate ?? demoToday;
  const showingDemoMonth = yearMonth === demoToday.slice(0, 7);
  function selectDate(date: string) {
    if (calendar) calendar.onSelectDate(date);
    else setDemoSelectedDay(Number(date.slice(-2)));
  }
  function signedForDay(day: number): boolean | undefined {
    if (!calendar) return getDemoDay(day, demo.todaySigned).signed;
    return calendar.view.kind === "ready" && calendar.view.data.yearMonth === yearMonth
      ? calendar.view.data.list.find((item) => item.day === day)?.is_signed
      : undefined;
  }
  function statusForDay(day: number) {
    if (!calendar) return getDemoDay(day, demo.todaySigned).status;
    const signed = signedForDay(day);
    return signed === undefined ? "签到状态待获取" : signed ? "已签到" : "未签到";
  }
  const showingDemoQuote = !!calendar && !quoteView && selectedDate === demoToday && demo.todayQuote !== null;
  const quoteViewText = quoteView?.kind === "ready" ? quoteView.data.content : quoteView ? ({
    idle: "请选择日期查看语录。",
    initializing: "正在确认登录状态…",
    guest: "登录后查看历史语录。",
    "profile-unavailable": "暂时无法确认登录状态。",
    loading: "正在加载当日语录…",
    "calendar-loading": "正在获取签到状态…",
    "calendar-error": "签到状态暂不可用。",
    "calendar-unavailable": "无法确认该日期的签到状态。",
    "not-signed": "这一天还未签到。",
    "today-not-signed": "签到获取今日语录",
    future: "这一天还未到来，期待与你一起解锁新的语录。",
    "no-record": "该日期暂无已分配的逸签语录。",
    "invalid-date": "该日期暂不可查询。",
    unauthorized: "登录状态已失效，请重新登录。",
    error: "语录暂时无法加载，请重试。",
  }[quoteView.kind]) : null;
  const quoteViewStatus = quoteView ? ({
    idle: "未选择日期",
    initializing: "确认登录状态",
    guest: "登录后查看",
    "profile-unavailable": "登录资料待确认",
    loading: "语录加载中",
    "calendar-loading": "签到状态加载中",
    "calendar-error": "签到状态不可用",
    "calendar-unavailable": "签到状态待确认",
    "not-signed": "未签到",
    "today-not-signed": "今日未签到",
    future: "未来日期",
    "no-record": "暂无已分配语录",
    ready: "历史语录",
    "invalid-date": "日期不可查询",
    unauthorized: "登录状态失效",
    error: "加载失败",
  }[quoteView.kind]) : null;
  const quoteRef = useRef<HTMLDivElement>(null);
  const selected = calendar ? {
    weekday: selectedDate ? ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."][new Date(`${selectedDate}T00:00:00Z`).getUTCDay()] : "",
    quoteFontSize: 30, quoteLineHeight: 45,
    quote: quoteViewText ?? (showingDemoQuote ? demo.todayQuote! : "历史语录尚未接入。\n签到与抽卡仅为本地演示。"),
    footer: quoteViewStatus
      ? `${selectedDay === null ? "未选择日期" : statusForDay(selectedDay)} · ${quoteViewStatus}`
      : showingDemoQuote ? "本地演示语录 · 不代表真实日期语录" : `${selectedDay === null ? "未选择日期" : statusForDay(selectedDay)} · 暂无语录数据`,
  } : getDemoDay(selectedDay ?? DEMO_TODAY, demo.todaySigned, demo.todayQuote);
  const remainingDays = Math.max(0, DEMO_REWARD_TARGET - demo.totalDays);
  const signInLabel = calendar ? demo.todaySigned ? "演示完成" : "演示签到" : demo.todaySigned ? "已签到" : "点击签到";
  const totalDays = statView ? statView.kind === "ready" ? statView.totalDays : "—" : demo.totalDays;

  function handleSignIn() {
    if (calendar) calendar.onSelectDemoDate();
    else setDemoSelectedDay(DEMO_TODAY);
    onSignIn();
  }

  // Date or content changes restart reading; closing the mounted board does not.
  useLayoutEffect(() => {
    if (quoteRef.current) quoteRef.current.scrollTop = 0;
  }, [selectedDate, selected.quote]);

  return (
    <div className="sign-in-board" data-calendar-rows={grid.rowCount}>
      {calendar && !isSupportedSignInDate(todayDate) && <p className="sign-in-board__year-limit" role="status">签到日历自2026年11月起提供。</p>}
      {/* Final-render assets already contain their Figma rotation and shadow. */}
      <Artwork className="sign-in-board__root-art" src={coverLeft} x={99} y={32.286} width={909.708} height={831.347} />
      <Artwork className="sign-in-board__root-art" src={coverRight} x={836.632} y={79.259} width={744.423} height={765.874} />
      <Artwork className="sign-in-board__root-art" src={coverFold} x={1324} y={56.707} width={424.95} height={666.78} />
      <Artwork className="sign-in-board__root-art" src={photoRace} x={22} y={164.585} width={301.712} height={282.458} />

      <section className="sign-in-board__quote" aria-label="今日语录">
        <Artwork className="sign-in-board__quote-paper" src={quotePaper} x={-6} y={-2} width={671} height={673} />
        <div className="sign-in-board__quote-border" aria-hidden="true" />
        <Artwork src={plantLines} x={443} y={312} width={180} height={310} />
        <Artwork src={bottomFlourish} x={20} y={552} width={200} height={95} />
        <Artwork src={photoCover} x={26} y={20} width={490} height={275} />
        <div className="sign-in-board__photo-shade" aria-hidden="true" />
        <p className="sign-in-board__photo-caption">Good things take time.</p>
        <Artwork src={starGold} x={35} y={306} width={30} height={30} />
        <Artwork src={starGoldLarge} x={48} y={436} width={40} height={40} />
        {selectedDate && (calendar || selectedDay !== DEMO_TODAY || demo.todayQuote !== null) && (
          <div className="sign-in-board__review-date" aria-label={`${showingDemoQuote ? "本地演示日期 " : ""}${grid.year}年${grid.month}月${selectedDay}日 ${selected.weekday}`}>
            <span className="sign-in-board__review-date-number">{grid.month} / {selectedDay}</span>
            <span className="sign-in-board__review-weekday">{selected.weekday}</span>
          </div>
        )}
        <div
          className="sign-in-board__quote-content"
          ref={quoteRef}
          role="region"
          aria-label={selectedDate ? `${selectedDate}寄语，可纵向滚动查看` : "寄语，可纵向滚动查看"}
          tabIndex={0}
        >
          <p aria-live={quoteView ? "polite" : undefined} aria-atomic={quoteView ? true : undefined} style={mobile ? undefined : {
            fontSize: selected.quoteFontSize,
            lineHeight: `${selected.quoteLineHeight}px`,
          }}>
            {selected.quote}
          </p>
          {quoteView?.kind === "error" && (
            <button type="button" className="sign-in-board__quote-retry" onClick={quoteView.retry}>重试</button>
          )}
        </div>
        <p className="sign-in-board__quote-footer" aria-live="polite" aria-atomic="true">
          {selected.footer}
        </p>
        <Artwork src={iris} x={472} y={-37} width={290} height={495} />
        <Artwork className="sign-in-board__quote-label-paper" src={quoteLabelPaper} x={385} y={223.734} width={266.127} height={97.045} />
        <div className="sign-in-board__quote-label">
          <h3>{showingDemoQuote ? "演示语录" : "今日语录"}</h3>
        </div>
        <Artwork className="sign-in-board__quote-label-star" src={starBlue} x={421.109} y={255.805} width={32.501} height={32.501} />
        <Artwork src={paperclip} x={421} y={-32} width={57} height={114} />
        <Artwork src={seal} x={617} y={284} width={105} height={105} />
        <Artwork className="sign-in-board__quote-star-large" src={starBlueLarge} x={521} y={528} width={33} height={33} />
        <Artwork className="sign-in-board__quote-star-small" src={starBlueSmall} x={500} y={564} width={25} height={25} />
        <Artwork src={photoDog} x={531.526} y={519.077} width={248.346} height={254.125} />
      </section>

      <section className="sign-in-board__calendar" aria-label="签到日历">
        <Artwork className="sign-in-board__calendar-paper" src={calendarPaper} x={-6} y={-37.17} width={713.677} height={522.526} />
        <div className="sign-in-board__calendar-content">
          {calendar ? <YearMonthPicker key={yearMonth} yearMonth={yearMonth} todayDate={todayDate} onChangeMonth={calendar.onChangeMonth} /> : <h3 className="sign-in-board__month">{grid.year} · {String(grid.month).padStart(2, "0")}</h3>}
          <button type="button" className="sign-in-board__return-today" onClick={() => calendar ? calendar.onReturnToday() : setDemoSelectedDay(DEMO_TODAY)}>
            <span>返回今日</span>
          </button>
          <Artwork src={calendarArrows} x={447} y={89} width={158} height={24} />
          <div className="sign-in-board__month-rule" aria-hidden="true" />
          <div className="sign-in-board__calendar-table" role="table" aria-label={`${grid.year}年${grid.month}月${calendar ? "真实签到记录" : "签到记录（设计样本）"}`}>
            <div className="sign-in-board__weekdays" role="row">
              {weekdays.map((weekday) => (
                <span role="columnheader" key={weekday}>{weekday}</span>
              ))}
            </div>
            <div role="rowgroup">
              {grid.weeks.map((week, index) => (
                <div className="sign-in-board__week" role="row" key={index}>
                  {week.map((date, column) => {
                    const day = date ? Number(date.slice(-2)) : null;
                    const isToday = date === todayDate;
                    return (
                    <div
                      className="sign-in-board__day"
                      role="cell"
                      key={column}
                    >
                      {day !== null && (
                        <button
                          type="button"
                          className="sign-in-board__date-button"
                          data-today={calendar && isToday || undefined}
                          aria-label={calendar ? `${dateForDay(day)}，${statusForDay(day)}（真实日历）` : `${DEMO_MONTH}月${day}日，${getDemoDay(day, demo.todaySigned).status}（演示）`}
                          aria-pressed={selectedDate === date}
                          aria-current={isToday ? "date" : undefined}
                          onClick={() => date && selectDate(date)}
                        >
                          {calendar && isToday && <span className="sign-in-board__current-day-art" aria-hidden="true">
                            <img src={todayGoldRing} alt="" draggable={false} />
                            <img src={todayBlueCircle} alt="" draggable={false} />
                          </span>}
                          <span className={calendar ? "sign-in-board__date-number" : isToday ? "sign-in-board__day-number--hidden" : undefined} aria-hidden="true">
                            {day}
                          </span>
                          {(calendar || !isToday) && signedForDay(day) && (
                            <img className="sign-in-board__stamp" src={signInStamp} alt="" aria-hidden="true" draggable={false} />
                          )}
                          {selectedDate === date && (
                            !calendar && mobile && isToday ? (
                              <svg className="sign-in-board__selection-ring sign-in-board__selection-ring--today" width="31.49" height="31.49" viewBox="0 0 31.49 31.49" fill="none" aria-hidden="true">
                                <circle cx="15.745" cy="15.745" r="15.369" stroke="#ad7e37" strokeWidth="0.752" />
                              </svg>
                            ) : (
                              <img className="sign-in-board__selection-ring" src={selectedDateRing} alt="" aria-hidden="true" draggable={false} />
                            )
                          )}
                        </button>
                      )}
                    </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {showingDemoMonth && <><div className="sign-in-board__today-copy" aria-hidden="true">
            {!calendar && signedForDay(DEMO_TODAY) && (
              <img className="sign-in-board__today-stamp" src={signInStamp} alt="" draggable={false} />
            )}
            {!calendar && <span className="sign-in-board__today-number">24</span>}
            <span className="sign-in-board__sign-in-label">{signInLabel}</span>
          </div>
          <button
            type="button"
            className="sign-in-board__sign-in-button"
            aria-label={`${DEMO_MONTH}月${DEMO_TODAY}日，${signInLabel}（本地演示）`}
            onClick={handleSignIn}
          /></>}
        </div>
        {/* These decorations are exported in the parent's rotated coordinates. */}
        {showingDemoMonth && <div className="sign-in-board__today-art" aria-hidden="true">
          {!calendar && <Artwork className="sign-in-board__today-gold" src={todayGoldRing} x={328.391} y={327.554} width={67.002} height={67.002} />}
          {!calendar && <Artwork className="sign-in-board__today-blue" src={todayBlueCircle} x={332.392} y={331.554} width={59.001} height={59.001} />}
          <Artwork className="sign-in-board__today-paper" src={mobile ? todayTagPaperMobile : todayTagPaper} x={308.004} y={384.563} width={144.922} height={64.487} />
          {!calendar && <Artwork className="sign-in-board__today-star" src={starGoldToday} x={294.833} y={331.194} width={36.784} height={36.784} />}
        </div>}
      </section>

      {[0, 1, 2, 3, 4].map((index) => (
        <div key={index} aria-hidden="true">
          <Artwork className="sign-in-board__root-art" src={bindingHole} x={613 + index * 51} y={126} width={23} height={28} />
          <Artwork className="sign-in-board__root-art" src={bindingRing} x={610 + index * 51} y={72} width={30} height={78} />
        </div>
      ))}

      <header className="sign-in-board__title">
        <Artwork src={titlePaper} x={-6} y={-34.161} width={399.366} height={207.559} />
        <div className="sign-in-board__title-copy">
          <p className="sign-in-board__daily" aria-hidden="true">Daily</p>
          <p className="sign-in-board__check-in" aria-hidden="true">CHECK IN</p>
          <h2 className="sign-in-board__heading" id={titleId}>— 每 日 逸 签 —</h2>
        </div>
        <Artwork src={titleStar} x={327.838} y={-5.772} width={26} height={26} />
        <Artwork src={titlePin} x={-50} y={119.253} width={93.854} height={66.875} />
      </header>

      {calendar && (
        <div className="sign-in-board__calendar-status" role="status">
          {calendar.view.kind === "initializing" && "正在确认登录状态。"}
          {calendar.view.kind === "guest" && "登录后查看真实签到日历。"}
          {calendar.view.kind === "loading" && "正在加载真实日历。"}
          {calendar.view.kind === "ready" && "签到标记来自真实日历。"}
          {calendar.view.kind === "invalid-month" && "日历月份无效。"}
          {calendar.view.kind === "error" && <><span>日历获取失败。</span><button type="button" onClick={calendar.view.retry}>重试日历</button></>}
        </div>
      )}

      {statView && <p className="sign-in-board__sign-in-demo-note">签到与抽卡为本地演示，不会保存。</p>}

      <section className="sign-in-board__rewards" aria-label={statView ? "真实累计签到与演示奖励进度" : "累计签到与奖励（设计样本）"}>
        <Artwork className="sign-in-board__rewards-paper" src={mobile ? rewardsPaperMobile : rewardsPaper} x={-6} y={-2} width={873} height={253} />
        <div className="sign-in-board__rewards-border" aria-hidden="true" />
        <Artwork src={rewardRivet} x={17} y={12} width={19} height={19} />
        <Artwork src={rewardRivet} x={824} y={11} width={19} height={19} />
        <p className="sign-in-board__total">
          <span>{statView ? "真实累计" : "已累计签到"}</span><strong>{totalDays}</strong><span>天</span>
        </p>
        <Artwork src={starGoldRewards} x={338} y={33} width={26} height={26} />
        <div className="sign-in-board__progress" role="progressbar" aria-label="距离30天奖励的累计签到进度（设计样本）" aria-valuemin={0} aria-valuemax={DEMO_REWARD_TARGET} aria-valuenow={demo.totalDays}>
          <span style={{ width: `${demo.totalDays / DEMO_REWARD_TARGET * 100}%` }} />
        </div>
        {[56, 125, 194, 263, 332, 401].map((x) => (
          <Artwork key={x} src={progressDot} x={x} y={100} width={8} height={8} />
        ))}
        <p className="sign-in-board__next-reward">
          <span>{mobile ? "距下一奖励还差" : "距离下一个奖励还有"}</span><strong>{remainingDays}</strong><span>天  ›</span>
        </p>
        <Artwork className="sign-in-board__gift-icon" src={giftIcon} x={52} y={174} width={33} height={34} />
        <p className="sign-in-board__reward-hint">
          {mobile ? <>达到30天可获得<br />「星光花语」头像框</> : "达到30天可获得「星光花语」头像框"}
        </p>
        <ul className="sign-in-board__reward-list">
          {rewards.map((reward) => (
            <li className="sign-in-board__reward" key={reward.days}>
              <img className="sign-in-board__gift" src={reward.gift} alt="" aria-hidden="true" draggable={false} />
              <span className="sign-in-board__reward-days">{reward.days}天</span>
              <img className="sign-in-board__reward-preview" src={reward.preview} alt={`${reward.days}天奖励预览`} draggable={false} />
              <span className="sign-in-board__locked">未解锁</span>
            </li>
          ))}
        </ul>
      </section>
      {statView && (
        <div className="sign-in-board__reward-demo-note" aria-live="polite">
          <span>进度与奖励状态为演示。</span>
          {statView.kind === "initializing" && <span>正在确认登录状态。</span>}
          {statView.kind === "guest" && <span>登录后查看累计签到。</span>}
          {statView.kind === "loading" && <span>正在获取真实统计。</span>}
          {statView.kind === "error" && (
            <>
              <span>统计获取失败。</span>
              <button type="button" onClick={statView.retry}>重试</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default SignInBoard;
