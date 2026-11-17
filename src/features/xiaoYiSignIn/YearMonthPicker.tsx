import { useId, useState } from "react";
import { getSignInMonthOptions, getSignInYearOptions } from "./sign-in-dates";

type YearMonthPickerProps = {
  yearMonth: string;
  todayDate: string;
  onChangeMonth: (yearMonth: string) => void;
};

function Arrow() {
  return <svg className="sign-in-month-picker__arrow" viewBox="0 0 10 18" fill="none" aria-hidden="true"><path d="m1 1 8 8-8 8" stroke="currentColor" strokeWidth="1.6" /></svg>;
}

export default function YearMonthPicker({ yearMonth, todayDate, onChangeMonth }: YearMonthPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [list, setList] = useState<"year" | "month" | null>(null);
  const id = useId();
  const year = Number(yearMonth.slice(0, 4));
  const month = Number(yearMonth.slice(5));
  const years = getSignInYearOptions(todayDate);
  const months = getSignInMonthOptions(year, todayDate);

  function close() {
    setExpanded(false);
    setList(null);
  }

  return (
    <>
      <button className="sign-in-board__month sign-in-month-picker__entry" type="button" aria-label={`选择年月，当前${year}年${month}月`} aria-expanded={expanded} aria-controls={expanded ? id : undefined} onClick={() => setExpanded(true)}>
        <span>{year} · {String(month).padStart(2, "0")}</span><Arrow />
      </button>
      {expanded && (
        <div className="sign-in-month-picker" id={id} role="group" aria-label="年月选择" onClick={(event) => event.stopPropagation()}>
          <button className="sign-in-month-picker__year" type="button" aria-label="选择年份" aria-expanded={list === "year"} aria-controls={list === "year" ? `${id}-year` : undefined} onClick={() => setList("year")}>
            <span>{year} 年</span><Arrow />
          </button>
          <span className="sign-in-month-picker__separator" aria-hidden="true">·</span>
          <button className="sign-in-month-picker__month" type="button" aria-label="选择月份" aria-expanded={list === "month"} aria-controls={list === "month" ? `${id}-month` : undefined} onClick={() => setList("month")}>
            <span>{month} 月</span><Arrow />
          </button>
          <button className="sign-in-month-picker__close" type="button" aria-label="关闭年月选择" onClick={close}>×</button>
          {list === "year" && (
            <div className="sign-in-month-picker__options sign-in-month-picker__years" id={`${id}-year`} role="group" aria-label="年份选项">
              {years.map((value) => (
                <button key={value} type="button" aria-pressed={year === value} onClick={() => {
                  const availableMonths = getSignInMonthOptions(value, todayDate);
                  const nextMonth = availableMonths.includes(month) ? month : availableMonths[0];
                  if (nextMonth !== undefined) onChangeMonth(`${value}-${String(nextMonth).padStart(2, "0")}`);
                  setList(null);
                  if (nextMonth !== undefined) close();
                }}>{value} 年</button>
              ))}
            </div>
          )}
          {list === "month" && (
            <div className="sign-in-month-picker__options sign-in-month-picker__months" id={`${id}-month`} role="group" aria-label="月份选项" tabIndex={0}>
              {months.map((value) => (
                <button key={value} type="button" aria-pressed={month === value} onClick={() => {
                  onChangeMonth(`${year}-${String(value).padStart(2, "0")}`);
                  close();
                }}>{value} 月</button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
