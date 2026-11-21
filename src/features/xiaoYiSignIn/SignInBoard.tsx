import { getAwardProgress, getRemainingAwardDays } from "./sign-in-award-countdown";
import type { SignInAwardClaim } from "./useSignInAwardGet";
import type { SignInAwardListView } from "./useSignInAwardList";
import { useLayoutEffect, useRef, type CSSProperties } from "react";
import YearMonthPicker from "./YearMonthPicker";
import { createSignInMonth, isSupportedSignInDate } from "./sign-in-dates";
import type { SignInCalendarView } from "./useSignInCalendar";
import type { SignInStatView } from "./useSignInStat";
import type { SignInQuoteView } from "./useSignInQuote";
import type { useSignInAdd } from "./useSignInAdd";
import { SIGN_IN_QUOTE_PENDING_MESSAGE } from "./DrawCardOverlay";
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
import rewardPlaceholderPc from "../../assets/xiao-yi-sign-in/reward-placeholder-pc.png";
import rewardPlaceholderTouch from "../../assets/xiao-yi-sign-in/reward-placeholder-touch.png";

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

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
};

export type FormalSignInBinding = Pick<ReturnType<typeof useSignInAdd>,
  "status" | "result" | "error" | "operation" | "verifying" | "verificationError" | "refresh" |
  "submitSignIn" | "verifyPendingSignIn" | "refreshSignInData"> & { authenticated: boolean };

type SignInBoardProps = {
  awardClaim?: SignInAwardClaim;
  onOpenAward?: (awardId: number) => void;
  titleId: string;
  mobile: boolean;
  statView: SignInStatView;
  awardListView: SignInAwardListView;
  quoteView?: SignInQuoteView;
  calendar: SignInCalendarBinding;
  signIn: FormalSignInBinding;
  quoteResult?: FormalSignInBinding["result"];
};

function SignInBoard({ titleId, mobile, statView, awardListView, awardClaim, onOpenAward, quoteView, quoteResult, calendar, signIn }: SignInBoardProps) {
  const yearMonth = calendar.yearMonth;
  const grid = createSignInMonth(yearMonth);
  const dateForDay = (day: number) => `${yearMonth}-${String(day).padStart(2, "0")}`;
  const selectedDate = calendar.selectedDate;
  const selectedDay = selectedDate ? Number(selectedDate.slice(-2)) : null;
  function selectDate(date: string) {
    calendar.onSelectDate(date);
  }
  function signedForDay(day: number): boolean | undefined {
    return calendar.view.kind === "ready" && calendar.view.data.yearMonth === yearMonth
      ? calendar.view.data.list.find((item) => item.day === day)?.is_signed
      : undefined;
  }
  function statusForDay(day: number) {
    const signed = signedForDay(day);
    return signed === undefined ? "签到状态待获取" : signed ? "已签到" : "未签到";
  }
  const todayDate = calendar.todayDate;
  const selectedSignInResult = quoteResult?.sign_date === selectedDate ? quoteResult : null;
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
  const selected = {
    weekday: selectedDate ? ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."][new Date(`${selectedDate}T00:00:00Z`).getUTCDay()] : "",
    quoteFontSize: 30, quoteLineHeight: 45,
    quote: selectedSignInResult
      ? selectedSignInResult.quote?.content ?? SIGN_IN_QUOTE_PENDING_MESSAGE
      : quoteViewText ?? "暂无语录数据。",
    footer: selectedSignInResult
      ? selectedSignInResult.quote_status === "ready" ? "已签到 · 当次语录" : "已签到 · 语录暂不可用"
      : `${selectedDay === null ? "未选择日期" : statusForDay(selectedDay)} · ${quoteViewStatus ?? "暂无语录数据"}`,
  };
  const awardProgress = statView.kind === "ready" && awardListView.kind === "ready"
      ? getAwardProgress(statView.totalDays, awardListView.awards)
      : null;
  const remainingDays = statView.kind === "ready" && awardListView.kind === "ready"
      ? getRemainingAwardDays(statView.totalDays, awardListView.awards)
      : null;
  const nextAward = awardListView.kind === "ready" && statView.kind === "ready"
    ? awardListView.awards.reduce<typeof awardListView.awards[number] | null>((next, award) =>
        award.day_count > statView.totalDays && (!next || award.day_count < next.day_count) ? award : next, null)
    : null;
  const awaitingVerification = signIn.status === "pending-verification" || signIn.status === "verification-failed";
  const signInBusy = signIn.status === "submitting" || signIn.verifying || signIn.refresh.pending;
  const signInBlocked = !signIn.authenticated || signInBusy;
  const confirmedToday = signIn.result?.sign_date === todayDate ||
    (signIn.status === "verified-signed" && signIn.operation?.requestDate === todayDate);
  const calendarTodaySigned = calendar.view.kind === "ready" && calendar.view.data.yearMonth === todayDate.slice(0, 7)
    ? calendar.view.data.list.find((item) => item.day === Number(todayDate.slice(-2)))?.is_signed : undefined;
  const signInLabel = signIn.status === "submitting" ? "签到中…" : confirmedToday || calendarTodaySigned === true ? "已签到" : "点击签到";
  const totalDays = statView.kind === "ready" ? statView.totalDays : "—";

  function handleSignIn() {
    if (signInBlocked) return;
    // An uncertain write must be verified before another POST is allowed.
    if (awaitingVerification) {
      void signIn.verifyPendingSignIn();
      return;
    }
    if (signIn.refresh.statError || signIn.refresh.calendarError) {
      void signIn.refreshSignInData();
      return;
    }
    void signIn.submitSignIn();
  }

  // Date or content changes restart reading; closing the mounted board does not.
  useLayoutEffect(() => {
    if (quoteRef.current) quoteRef.current.scrollTop = 0;
  }, [selectedDate, selected.quote]);

  return (
    <div className="sign-in-board" data-calendar-rows={grid.rowCount} data-formal-calendar="true">
      {!isSupportedSignInDate(todayDate) && <p className="sign-in-board__year-limit" role="status">签到日历自2026年11月起提供。</p>}
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
        {selectedDate && (
          <div className="sign-in-board__review-date" aria-label={`${grid.year}年${grid.month}月${selectedDay}日 ${selected.weekday}`}>
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
          {!selectedSignInResult && quoteView?.kind === "error" && (
            <button type="button" className="sign-in-board__quote-retry" onClick={quoteView.retry}>重试</button>
          )}
        </div>
        <p className="sign-in-board__quote-footer">
          与你相伴，收藏每一天的心动。
        </p>
        <Artwork src={iris} x={472} y={-37} width={290} height={495} />
        <Artwork className="sign-in-board__quote-label-paper" src={quoteLabelPaper} x={385} y={223.734} width={266.127} height={97.045} />
        <div className="sign-in-board__quote-label">
          <h3>今日语录</h3>
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
          <YearMonthPicker key={yearMonth} yearMonth={yearMonth} todayDate={todayDate} onChangeMonth={calendar.onChangeMonth} />
          <button type="button" className="sign-in-board__return-today" onClick={calendar.onReturnToday}>
            <span>返回今日</span>
          </button>
          <Artwork src={calendarArrows} x={447} y={89} width={158} height={24} />
          <div className="sign-in-board__month-rule" aria-hidden="true" />
          <div className="sign-in-board__calendar-table" role="table" aria-label={`${grid.year}年${grid.month}月真实签到记录`}>
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
                          data-today={isToday || undefined}
                          aria-label={`${dateForDay(day)}，${statusForDay(day)}（真实日历）`}
                          aria-pressed={selectedDate === date}
                          aria-current={isToday ? "date" : undefined}
                          onClick={() => date && selectDate(date)}
                        >
                          {isToday && <span className="sign-in-board__current-day-art" aria-hidden="true">
                            <img className="sign-in-board__today-gold-ring" src={todayGoldRing} alt="" draggable={false} />
                            <img className="sign-in-board__today-blue-circle" src={todayBlueCircle} alt="" draggable={false} />
                            <img className="sign-in-board__today-cell-star" src={starGoldToday} alt="" draggable={false} />
                          </span>}
                          <span className="sign-in-board__date-number" aria-hidden="true">
                            {day}
                          </span>
                          {!isToday && signedForDay(day) && (
                            <img className="sign-in-board__stamp" src={signInStamp} alt="" aria-hidden="true" draggable={false} />
                          )}
                          {selectedDate === date && !isToday && (
                            <img className="sign-in-board__selection-ring" src={selectedDateRing} alt="" aria-hidden="true" draggable={false} />
                          )}
                        </button>
                      )}
                      {isToday && <div className="sign-in-board__today-entry">
                        <button
                          type="button"
                          className="sign-in-board__sign-in-button sign-in-board__sign-in-button--date"
                          aria-label={`${todayDate}，${signInLabel}`}
                          disabled={signInBlocked}
                          aria-busy={signIn.status === "submitting" || undefined}
                          onClick={(event) => { event.stopPropagation(); handleSignIn(); }}
                        >
                          <span className="sign-in-board__today-tag-art" aria-hidden="true">
                            <img src={mobile ? todayTagPaperMobile : todayTagPaper} alt="" draggable={false} />
                            <span className="sign-in-board__today-tag-label">{signInLabel}</span>
                          </span>
                        </button>
                      </div>}
                    </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* These decorations are exported in the parent's rotated coordinates. */}
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

      <section className="sign-in-board__rewards" aria-label="累计签到与奖励">
        <Artwork className="sign-in-board__rewards-paper" src={mobile ? rewardsPaperMobile : rewardsPaper} x={-6} y={-2} width={873} height={253} />
        <div className="sign-in-board__rewards-border" aria-hidden="true" />
        <Artwork src={rewardRivet} x={17} y={12} width={19} height={19} />
        <Artwork src={rewardRivet} x={824} y={11} width={19} height={19} />
        <p className="sign-in-board__total">
          <span>已累计签到</span><strong>{totalDays}</strong><span>天</span>
        </p>
        <Artwork src={starGoldRewards} x={338} y={33} width={26} height={26} />
        <div
          className="sign-in-board__progress"
          role={awardProgress === null ? undefined : "progressbar"}
          aria-hidden={awardProgress === null || undefined}
          aria-label={awardProgress === null ? undefined : "当前奖励周期进度"}
          aria-valuemin={awardProgress === null ? undefined : 0}
          aria-valuemax={awardProgress === null ? undefined : 100}
          aria-valuenow={awardProgress === null ? undefined : awardProgress * 100}
        >
          {awardProgress !== null && <span style={{ width: `${awardProgress * 100}%` }} />}
        </div>
        {[56, 125, 194, 263, 332, 401].map((x) => (
          <Artwork key={x} src={progressDot} x={x} y={100} width={8} height={8} />
        ))}
        {remainingDays !== null && <p className="sign-in-board__next-reward">
          <span>{mobile ? "距下一奖励还差" : "距离下一个奖励还有"}</span><strong>{remainingDays}</strong><span>天  ›</span>
        </p>}
        <Artwork className="sign-in-board__gift-icon" src={giftIcon} x={52} y={174} width={33} height={34} />
        {nextAward?.award_name.trim() && (
          <p className="sign-in-board__reward-hint" title={`达到${nextAward.day_count}天可获得「${nextAward.award_name.trim() ? nextAward.award_name : "奖励名称暂不可用"}」`}>
            达到{nextAward.day_count}天可获得{mobile && <br />}「{nextAward.award_name}」
          </p>
        )}
        <ul className="sign-in-board__reward-list">
          {(awardListView.kind === "ready" ? awardListView.awards.map((award) => ({
            id: award.award_id,
            days: award.day_count,
            name: award.award_name.trim() ? award.award_name : "奖励名称暂不可用", imageUrl: award.reward_img_url,
            status: award.is_get ? "已领取" : statView?.kind !== "ready" ? "状态待确认" :
              award.day_count <= statView.totalDays ? "待领取" : "未解锁",
          })) : []).map((reward, index) => (
            <li className="sign-in-board__reward" key={reward.id}>
              <img className="sign-in-board__gift" src={[gift30, gift111, gift365][index % 3]} alt="" aria-hidden="true" draggable={false} />
              <span className="sign-in-board__reward-days">{reward.days > 0 ? `${reward.days}天` : null}</span>
              <img className="sign-in-board__reward-preview" src={("imageUrl" in reward && reward.imageUrl?.trim()) || (mobile ? rewardPlaceholderTouch : rewardPlaceholderPc)} onError={(event) => { const fallback = mobile ? rewardPlaceholderTouch : rewardPlaceholderPc; if (event.currentTarget.getAttribute("src") !== fallback) { console.warn("奖励图片加载失败", event.currentTarget.src); event.currentTarget.src = fallback; } }} alt={`${reward.days}天奖励预览`} draggable={false} />
              {reward.status !== "已领取" && awardClaim?.outcomeFor(reward.id).status === "unresolved" ? (
                <button type="button" className="sign-in-board__locked sign-in-board__claim" disabled={awardClaim.busy}
                  onClick={() => awardClaim.verify(reward.id)}>核实领取</button>
              ) : reward.status === "待领取" && awardClaim?.canClaim && onOpenAward ? (
                <button type="button" className="sign-in-board__locked sign-in-board__claim" disabled={awardClaim.busy}
                  aria-label={`领取${reward.name}`}
                  onClick={() => onOpenAward(reward.id)}>
                  {awardClaim.busy && awardClaim.current?.awardId === reward.id ? "处理中…" : "待领取"}
                </button>
              ) : <span className="sign-in-board__locked">{reward.status}</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default SignInBoard;
