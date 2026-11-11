import { useId, useState } from "react";

type YearMonthPickerProps = {
  yearMonth: string;
  onChangeMonth: (yearMonth: string) => void;
};

function Arrow() {
  return <svg className="sign-in-month-picker__arrow" viewBox="0 0 10 18" fill="none" aria-hidden="true"><path d="m1 1 8 8-8 8" stroke="currentColor" strokeWidth="1.6" /></svg>;
}

export default function YearMonthPicker({ yearMonth, onChangeMonth }: YearMonthPickerProps) {
  const [expanded, setExpanded] = useState(false);
  const [list, setList] = useState<"year" | "month" | null>(null);
  const id = useId();
  const month = Number(yearMonth.slice(5));

  function close() {
    setExpanded(false);
    setList(null);
  }

  return (
    <>
      <button className="sign-in-board__month sign-in-month-picker__entry" type="button" aria-label={`选择年月，当前2026年${month}月`} aria-expanded={expanded} aria-controls={expanded ? id : undefined} onClick={() => setExpanded(true)}>
        <span>2026 · {String(month).padStart(2, "0")}</span><Arrow />
      </button>
      {expanded && (
        <div className="sign-in-month-picker" id={id} role="group" aria-label="年月选择" onClick={(event) => event.stopPropagation()}>
          <button className="sign-in-month-picker__year" type="button" aria-label="选择年份" aria-expanded={list === "year"} aria-controls={list === "year" ? `${id}-year` : undefined} onClick={() => setList("year")}>
            <span>2026 年</span><Arrow />
          </button>
          <span className="sign-in-month-picker__separator" aria-hidden="true">·</span>
          <button className="sign-in-month-picker__month" type="button" aria-label="选择月份" aria-expanded={list === "month"} aria-controls={list === "month" ? `${id}-month` : undefined} onClick={() => setList("month")}>
            <span>{month} 月</span><Arrow />
          </button>
          <button className="sign-in-month-picker__close" type="button" aria-label="关闭年月选择" onClick={close}>×</button>
          {list === "year" && (
            <div className="sign-in-month-picker__options sign-in-month-picker__years" id={`${id}-year`} role="group" aria-label="年份选项">
              <button type="button" aria-pressed="true" onClick={() => setList(null)}>2026 年</button>
            </div>
          )}
          {list === "month" && (
            <div className="sign-in-month-picker__options sign-in-month-picker__months" id={`${id}-month`} role="group" aria-label="月份选项" tabIndex={0}>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                <button key={value} type="button" aria-pressed={month === value} onClick={() => {
                  onChangeMonth(`2026-${String(value).padStart(2, "0")}`);
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
